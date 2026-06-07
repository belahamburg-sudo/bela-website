import { getSupabaseAdminClient } from "./supabase";

/**
 * Storage buckets.
 *  - media:          public assets (marketing videos like the homepage clip,
 *                    course cover images, thumbnails). Served via public URL.
 *  - course-content: private lesson videos + downloadable resources (PDFs,
 *                    templates, prompts). Served via short-lived signed URLs so
 *                    only entitled members can access paid content.
 */
export const BUCKETS = {
  media: "media",
  courseContent: "course-content",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

const PUBLIC_BUCKETS: BucketName[] = [BUCKETS.media];
const STORAGE_SCHEME = "storage://";
const TWO_GB = 2 * 1024 * 1024 * 1024;
const FIVE_HUNDRED_MB = 500 * 1024 * 1024;

const ensured = new Set<string>();

/** Create a bucket on first use if it doesn't exist yet. */
async function ensureBucket(bucket: BucketName): Promise<void> {
  if (ensured.has(bucket)) return;
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Service role key not configured");

  const { data } = await admin.storage.getBucket(bucket);
  if (!data) {
    const isPublic = PUBLIC_BUCKETS.includes(bucket);
    await admin.storage.createBucket(bucket, {
      public: isPublic,
      fileSizeLimit: bucket === BUCKETS.courseContent ? TWO_GB : FIVE_HUNDRED_MB,
    });
  }
  ensured.add(bucket);
}

export type UploadInput = File | Blob | ArrayBuffer | Buffer | Uint8Array;

/**
 * Upload a file to a bucket and return a portable storage ref
 * ("storage://<bucket>/<path>") to persist in the DB.
 */
export async function uploadToBucket(opts: {
  bucket: BucketName;
  path: string;
  body: UploadInput;
  contentType?: string;
  upsert?: boolean;
}): Promise<{ ref: string; path: string }> {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Service role key not configured");
  await ensureBucket(opts.bucket);

  const { error } = await admin.storage.from(opts.bucket).upload(opts.path, opts.body, {
    contentType: opts.contentType,
    upsert: opts.upsert ?? true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return { ref: toStorageRef(opts.bucket, opts.path), path: opts.path };
}

/**
 * Create a short-lived signed upload target so the browser can upload large
 * files (videos up to 2GB) directly to Supabase Storage, bypassing the
 * serverless request-body limit. Returns the token + the portable storage ref
 * to persist once the client-side upload finishes.
 */
export async function createSignedUpload(
  bucket: BucketName,
  prefix: string,
  filename: string
): Promise<{ token: string; path: string; ref: string }> {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Service role key not configured");
  await ensureBucket(bucket);

  const path = buildObjectPath(prefix, filename);
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) {
    throw new Error(error?.message ?? "Could not create signed upload URL");
  }
  return { token: data.token, path: data.path, ref: toStorageRef(bucket, path) };
}

export async function deleteFromBucket(bucket: BucketName, path: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  await admin.storage.from(bucket).remove([path]);
}

export async function listBucket(bucket: BucketName, prefix = "") {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];
  const { data } = await admin.storage.from(bucket).list(prefix, {
    sortBy: { column: "created_at", order: "desc" },
    limit: 1000,
  });
  return data ?? [];
}

export function toStorageRef(bucket: BucketName, path: string): string {
  return `${STORAGE_SCHEME}${bucket}/${path}`;
}

export function parseStorageRef(
  value: string | null | undefined
): { bucket: BucketName; path: string } | null {
  if (!value || !value.startsWith(STORAGE_SCHEME)) return null;
  const rest = value.slice(STORAGE_SCHEME.length);
  const slash = rest.indexOf("/");
  if (slash === -1) return null;
  return {
    bucket: rest.slice(0, slash) as BucketName,
    path: rest.slice(slash + 1),
  };
}

export function publicUrl(bucket: BucketName, path: string): string | null {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  return admin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function signedUrl(
  bucket: BucketName,
  path: string,
  expiresIn = 60 * 60
): Promise<string | null> {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  const { data } = await admin.storage.from(bucket).createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}

/**
 * Turn a stored value into a playable/downloadable URL.
 *  - storage:// refs  -> public URL (media) or signed URL (private)
 *  - everything else  -> returned as-is (external URLs, legacy /assets paths)
 */
export async function resolveMediaUrl(
  value: string | null | undefined,
  expiresIn = 60 * 60
): Promise<string | null> {
  if (!value) return null;
  const ref = parseStorageRef(value);
  if (!ref) return value;
  if (PUBLIC_BUCKETS.includes(ref.bucket)) return publicUrl(ref.bucket, ref.path);
  return signedUrl(ref.bucket, ref.path, expiresIn);
}

/** Build a safe, collision-resistant object path. */
export function buildObjectPath(prefix: string, filename: string): string {
  const clean = filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix.replace(/\/$/, "")}/${stamp}-${rand}-${clean}`;
}
