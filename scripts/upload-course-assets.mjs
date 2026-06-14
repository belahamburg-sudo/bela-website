#!/usr/bin/env node
/**
 * Upload course covers + lesson files to Supabase Storage.
 *
 * Usage:
 *   node scripts/upload-course-assets.mjs --source ~/Downloads/course-staging
 *   node scripts/upload-course-assets.mjs --source ./staging --slug stan-store-masterclass
 *   node scripts/upload-course-assets.mjs --source ./staging --activate
 *
 * Expects each course in its own subfolder (name flexible) or flat files
 * matched via scripts/course-assets.manifest.json.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync } from "fs";
import { basename, dirname, extname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  readFileSync(join(__dirname, "course-assets.manifest.json"), "utf8")
);

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
  const args = { source: "", slug: "", activate: false, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--source") args.source = argv[++i];
    else if (a === "--slug") args.slug = argv[++i];
    else if (a === "--activate") args.activate = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--help") args.help = true;
  }
  return args;
}

function walkFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

function globMatch(name, pattern) {
  const re = new RegExp(
    "^" +
      pattern
        .toLowerCase()
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*") +
      "$"
  );
  return re.test(name.toLowerCase());
}

function scopedFiles(allFiles, sourceRoot, slug, title) {
  const tokens = [
    slug,
    ...title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 3),
  ];
  const inScope = allFiles.filter((file) => {
    const rel = file.slice(sourceRoot.length + 1).toLowerCase();
    return tokens.some((token) => rel.includes(token));
  });
  return inScope.length ? inScope : allFiles;
}

function pickFile(files, patterns) {
  for (const pattern of patterns) {
    if (!pattern.includes("*")) {
      const exact = files.find((f) => basename(f).toLowerCase() === pattern.toLowerCase());
      if (exact) return exact;
    }
  }
  for (const pattern of patterns) {
    if (pattern.includes("*")) {
      const hit = files.find((f) => globMatch(basename(f), pattern));
      if (hit) return hit;
    }
  }
  return null;
}

function contentType(path) {
  const ext = extname(path).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".txt") return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

async function ensureBucket(admin, bucket, isPublic) {
  const { data } = await admin.storage.getBucket(bucket);
  if (!data) {
    const { error } = await admin.storage.createBucket(bucket, { public: isPublic });
    if (error) throw new Error(`Bucket ${bucket}: ${error.message}`);
  }
}

async function uploadFile(admin, bucket, storagePath, localPath, dryRun) {
  const body = readFileSync(localPath);
  console.log(`  ↑ ${basename(localPath)} → ${bucket}/${storagePath} (${body.length} bytes)`);
  if (dryRun) return;
  const { error } = await admin.storage.from(bucket).upload(storagePath, body, {
    contentType: contentType(localPath),
    upsert: true,
  });
  if (error) throw new Error(`Upload ${storagePath}: ${error.message}`);
}

async function activateCourses(admin, slugs, dryRun) {
  console.log("\nActivating courses:", slugs.join(", "));
  if (dryRun) return;
  const { error } = await admin.from("courses").update({ is_active: true }).in("slug", slugs);
  if (error) throw new Error(`Activate: ${error.message}`);
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv);
  if (args.help || !args.source) {
    console.log(`Usage: node scripts/upload-course-assets.mjs --source <dir> [--slug <slug>] [--activate] [--dry-run]`);
    process.exit(args.help ? 0 : 1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const source = resolve(args.source);
  const allFiles = walkFiles(source);
  const slugs = args.slug ? [args.slug] : Object.keys(manifest);
  const admin = createClient(url, key, { auth: { persistSession: false } });

  await ensureBucket(admin, "media", true);
  await ensureBucket(admin, "course-content", false);

  const uploaded = [];

  for (const slug of slugs) {
    const spec = manifest[slug];
    if (!spec) {
      console.warn(`Unknown slug: ${slug}`);
      continue;
    }

    console.log(`\n▸ ${spec.title} (${slug})`);
    const missing = [];
    const files = scopedFiles(allFiles, source, slug, spec.title);

    const coverLocal = pickFile(files, spec.cover.match);
    if (!coverLocal) {
      missing.push("cover");
    } else {
      await uploadFile(admin, spec.cover.bucket, spec.cover.path, coverLocal, args.dryRun);
    }

    for (const file of spec.files) {
      const local = pickFile(files, file.match);
      if (!local) {
        missing.push(file.path);
        continue;
      }
      await uploadFile(admin, file.bucket, file.path, local, args.dryRun);
    }

    if (missing.length) {
      console.warn(`  ⚠ missing: ${missing.join(", ")}`);
    } else {
      uploaded.push(slug);
      console.log("  ✓ complete");
    }
  }

  if (args.activate && uploaded.length) {
    await activateCourses(admin, uploaded, args.dryRun);
  }

  console.log(`\nDone. Uploaded ${uploaded.length}/${slugs.length} course(s).`);
  if (uploaded.length < slugs.length) {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
