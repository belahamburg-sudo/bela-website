import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { BUCKETS, buildUploadTarget, type BucketName } from "@/lib/storage";

const VALID_BUCKETS = Object.values(BUCKETS) as BucketName[];

/**
 * Returns the destination path + storage ref for a large resumable (TUS)
 * upload. Unlike /upload-url it does NOT create a signed upload — the browser
 * streams directly to Supabase using the admin's session JWT (see the
 * "admins manage …" storage RLS policy in migration 015).
 */
export async function POST(req: Request) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { bucket?: string; filename?: string; prefix?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { bucket, filename, prefix } = body;
  if (!bucket || !VALID_BUCKETS.includes(bucket as BucketName)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }
  if (!filename || typeof filename !== "string") {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  const target = buildUploadTarget(
    bucket as BucketName,
    typeof prefix === "string" ? prefix : "",
    filename
  );
  return NextResponse.json(target);
}
