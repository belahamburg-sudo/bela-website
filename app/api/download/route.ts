import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import {
  BUCKETS,
  type BucketName,
  isAllowedDownloadRef,
  parseStorageRef,
  signedUrl,
  uploadToBucket,
  buildObjectPath,
} from "@/lib/storage";
import { stampPdf, isPdfPath } from "@/lib/watermark";
import { absoluteUrl, formatDate } from "@/lib/utils";

export const runtime = "nodejs";

const SEVEN_DAYS = 60 * 60 * 24 * 7;

function clientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}

// Fetch the master bytes either from Supabase Storage or a plain URL.
async function fetchMaster(
  ref: string
): Promise<{ bytes: Uint8Array; filename: string; isPdf: boolean } | null> {
  const parsed = parseStorageRef(ref);
  if (parsed) {
    const admin = getSupabaseAdminClient();
    if (!admin) return null;
    const { data, error } = await admin.storage.from(parsed.bucket).download(parsed.path);
    if (error || !data) return null;
    const bytes = new Uint8Array(await data.arrayBuffer());
    const filename = parsed.path.split("/").pop() || "download";
    return { bytes, filename, isPdf: isPdfPath(parsed.path) };
  }

  if (isAllowedDownloadRef(ref) && ref.startsWith("/assets/")) {
    const res = await fetch(absoluteUrl(ref));
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const filename = ref.split("/").pop()?.split("?")[0] || "download";
    return { bytes, filename, isPdf: isPdfPath(ref) };
  }

  return null;
}

export async function POST(request: Request) {
  let body: { courseSlug?: string; ref?: string; label?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  const courseSlug = body.courseSlug?.trim();
  const ref = body.ref?.trim();
  if (!courseSlug || !ref) {
    return NextResponse.json({ message: "courseSlug und ref erforderlich." }, { status: 400 });
  }
  if (!isAllowedDownloadRef(ref)) {
    return NextResponse.json({ message: "Ungültige Dateireferenz." }, { status: 400 });
  }

  // Auth + entitlement.
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Downloads sind nicht verfügbar." }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Bitte melde dich an." }, { status: 401 });
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .eq("status", "paid")
    .maybeSingle();
  if (!purchase) {
    return NextResponse.json({ message: "Kein Zugriff auf diese Datei." }, { status: 403 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "Storage nicht konfiguriert." }, { status: 503 });
  }

  const master = await fetchMaster(ref);
  if (!master) {
    return NextResponse.json({ message: "Datei nicht gefunden." }, { status: 404 });
  }

  // Buyer identity for the stamp.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const buyerName = profile?.full_name || user.email?.split("@")[0] || "Mitglied";

  let deliverBucket: BucketName = BUCKETS.courseContent;
  let deliverPath: string;

  if (master.isPdf) {
    // Stamp + store under a buyer-specific path.
    let stamped: Uint8Array;
    try {
      stamped = await stampPdf(master.bytes, {
        name: buyerName,
        email: user.email ?? "",
        orderId: purchase.id,
        date: formatDate(new Date()),
      });
    } catch {
      // If stamping fails (corrupt PDF), fall back to delivering the master.
      stamped = master.bytes;
    }
    const up = await uploadToBucket({
      bucket: BUCKETS.courseContent,
      path: buildObjectPath(`watermarked/${user.id}/${courseSlug}`, master.filename),
      body: stamped,
      contentType: "application/pdf",
      upsert: true,
    });
    const parsed = parseStorageRef(up.ref)!;
    deliverBucket = parsed.bucket;
    deliverPath = parsed.path;
  } else {
    // Non-PDF (xlsx, pptx, txt …) — can't visibly stamp via pdf-lib. Deliver a
    // fresh signed link from its existing storage location when possible.
    const parsed = parseStorageRef(ref);
    if (parsed) {
      deliverBucket = parsed.bucket;
      deliverPath = parsed.path;
    } else {
      // Re-host the fetched bytes so we can hand out a signed URL.
      const up = await uploadToBucket({
        bucket: BUCKETS.courseContent,
        path: buildObjectPath(`delivered/${user.id}/${courseSlug}`, master.filename),
        body: master.bytes,
        upsert: true,
      });
      const p = parseStorageRef(up.ref)!;
      deliverBucket = p.bucket;
      deliverPath = p.path;
    }
  }

  const url = await signedUrl(deliverBucket, deliverPath, SEVEN_DAYS);
  if (!url) {
    return NextResponse.json({ message: "Download-Link konnte nicht erstellt werden." }, { status: 500 });
  }

  // Log the download (who / when / IP) — service role, best-effort.
  await admin.from("download_logs").insert({
    user_id: user.id,
    course_slug: courseSlug,
    resource_label: body.label ?? null,
    storage_path: deliverPath,
    ip: clientIp(request),
    user_agent: request.headers.get("user-agent"),
  });

  return NextResponse.json({ url, filename: master.filename });
}
