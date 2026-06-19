#!/usr/bin/env node
/**
 * Sync a Google Drive staging folder into Supabase Storage buckets.
 *
 * Drive layout: /tmp/course-staging/<Course Name (section)>/<files>
 * Covers (*cover* images) → media/courses/{slug}/cover.{ext}
 * Everything else (pdf, txt, mp4, html, …) → course-content/courses/{slug}/{filename}
 *
 * Usage:
 *   node scripts/sync-drive-staging.mjs --source /tmp/course-staging
 *   node scripts/sync-drive-staging.mjs --source /tmp/course-staging --dry-run
 *   node scripts/sync-drive-staging.mjs --source /tmp/course-staging --slug stan-store-masterclass
 */
import { createClient } from "@supabase/supabase-js";
import { createReadStream, readFileSync, readdirSync, statSync } from "fs";
import { basename, dirname, extname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Drive top-level folder name prefix → course slug */
const FOLDER_SLUGS = [
  ["51 AI Business Ideen", "51-ai-business-ideen"],
  ["AI Goldmining Method", "ai-goldmining-method"],
  ["Stan Store Masterclass", "stan-store-masterclass"],
  ["Stop care want more", "stop-care-want-more"],
  ["Rechtliches Digitale Produkte", "rechtliches-digitale-produkte"],
  ["AI Digital Product Builder", "ai-digital-product-builder"],
  ["AI Nischenfinder", "ai-nischenfinder"],
  ["Bio Funnel System", "bio-funnel-system"],
  ["Prompt Engineering Pro", "prompt-engineering-pro"],
  ["Sales und Vertrieb", "sales-und-vertrieb"],
  ["Social Media Wachstum", "social-media-wachstum"],
  ["Webinar Mastery", "webinar-mastery"],
  ["Website mit Kurspage", "website-kurspage-backend"],
];

const SKIP_NAMES = /\.(part|tmp|crdownload)$/i;
const MAX_UPLOAD_BYTES = Number(process.env.SUPABASE_MAX_UPLOAD_BYTES || 48 * 1024 * 1024);
const COVER_RE = /cover/i;
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  try {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {
    /* optional */
  }
}

function parseArgs(argv) {
  const args = { source: "", slug: "", dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--source") args.source = argv[++i];
    else if (a === "--slug") args.slug = argv[++i];
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--help") args.help = true;
  }
  return args;
}

function slugFromPath(relPath) {
  const top = relPath.split(/[/\\]/)[0] || "";
  for (const [prefix, slug] of FOLDER_SLUGS) {
    if (top.startsWith(prefix)) return slug;
  }
  return null;
}

function walkFiles(dir, root, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkFiles(full, root, acc);
    else acc.push(full);
  }
  return acc;
}

function contentType(path) {
  const ext = extname(path).toLowerCase();
  const map = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".txt": "text/plain; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return map[ext] || "application/octet-stream";
}

function isCover(filePath) {
  const name = basename(filePath);
  const ext = extname(name).toLowerCase();
  return IMAGE_EXT.has(ext) && COVER_RE.test(name);
}

function storageTarget(slug, filePath) {
  const name = basename(filePath);
  if (isCover(filePath)) {
    const ext = extname(name).toLowerCase().replace(/^\./, "") || "jpg";
    return { bucket: "media", path: `courses/${slug}/cover.${ext}` };
  }
  return { bucket: "course-content", path: `courses/${slug}/${name}` };
}

async function ensureBucket(admin, bucket, isPublic) {
  const { data } = await admin.storage.getBucket(bucket);
  if (!data) {
    const { error } = await admin.storage.createBucket(bucket, { public: isPublic });
    if (error) throw new Error(`Bucket ${bucket}: ${error.message}`);
  }
}

async function uploadFile(admin, bucket, storagePath, localPath, dryRun) {
  const size = statSync(localPath).size;
  const label = `${basename(localPath)} → ${bucket}/${storagePath} (${(size / 1024 / 1024).toFixed(1)} MB)`;
  if (dryRun) {
    console.log(`  [dry-run] ${label}`);
    return;
  }
  console.log(`  ↑ ${label}`);
  const body = size > 50 * 1024 * 1024 ? createReadStream(localPath) : readFileSync(localPath);
  const { error } = await admin.storage.from(bucket).upload(storagePath, body, {
    contentType: contentType(localPath),
    upsert: true,
    duplex: size > 50 * 1024 * 1024 ? "half" : undefined,
  });
  if (error) throw new Error(`Upload ${storagePath}: ${error.message}`);
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv);
  if (args.help || !args.source) {
    console.log(
      "Usage: node scripts/sync-drive-staging.mjs --source <staging-dir> [--slug <slug>] [--dry-run]"
    );
    process.exit(args.help ? 0 : 1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const source = resolve(args.source);
  const admin = createClient(url, key, { auth: { persistSession: false } });
  await ensureBucket(admin, "media", true);
  await ensureBucket(admin, "course-content", false);

  const allFiles = walkFiles(source, source).filter((f) => !SKIP_NAMES.test(f));
  const bySlug = new Map();

  for (const file of allFiles) {
    const rel = file.slice(source.length + 1);
    const slug = slugFromPath(rel);
    if (!slug) {
      console.warn(`  ? unmapped: ${rel}`);
      continue;
    }
    if (args.slug && slug !== args.slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(file);
  }

  let uploaded = 0;
  let skipped = 0;

  for (const [slug, files] of [...bySlug.entries()].sort()) {
    console.log(`\n▸ ${slug} (${files.length} file(s))`);
    const covers = files.filter(isCover);
    const rest = files.filter((f) => !isCover(f));

    // Prefer shortest cover path / explicit cover filename
    if (covers.length) {
      covers.sort((a, b) => basename(a).length - basename(b).length);
      await uploadFile(admin, "media", storageTarget(slug, covers[0]).path, covers[0], args.dryRun);
      uploaded++;
      for (const extra of covers.slice(1)) {
        console.log(`  · skip extra cover: ${basename(extra)}`);
        skipped++;
      }
    }

    for (const file of rest.sort(
      (a, b) => statSync(a).size - statSync(b).size
    )) {
      const size = statSync(file).size;
      if (size > MAX_UPLOAD_BYTES) {
        console.warn(
          `  ⚠ skip (>${(MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(0)}MB, needs Pro Storage): ${basename(file)} (${(size / 1024 / 1024).toFixed(1)} MB)`
        );
        skipped++;
        continue;
      }
      const { bucket, path } = storageTarget(slug, file);
      await uploadFile(admin, bucket, path, file, args.dryRun);
      uploaded++;
    }
  }

  console.log(`\nDone. ${uploaded} uploaded, ${skipped} skipped, ${bySlug.size} course(s).`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
