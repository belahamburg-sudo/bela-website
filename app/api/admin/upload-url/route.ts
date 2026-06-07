import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { BUCKETS, createSignedUpload, type BucketName } from "@/lib/storage";

const VALID_BUCKETS = Object.values(BUCKETS) as BucketName[];

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

  try {
    const target = await createSignedUpload(
      bucket as BucketName,
      typeof prefix === "string" ? prefix : "",
      filename
    );
    return NextResponse.json(target);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload init failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
