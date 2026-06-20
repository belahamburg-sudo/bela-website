import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { isAllowedDownloadRef, parseStorageRef } from "@/lib/storage";
import { getCourseResourceRefs } from "@/lib/courses";

export const runtime = "nodejs";

/**
 * Inline viewer for self-contained HTML course resources (slide decks).
 *
 * Why this exists: Supabase Storage refuses to render HTML from its own
 * `*.supabase.co` domain — it forces `Content-Type: text/plain` + `nosniff`
 * (an anti-phishing/XSS hardening), so a signed URL to a `.html` file shows the
 * raw source instead of the deck. We therefore stream the bytes through our own
 * origin with the correct `text/html` type so the browser renders it.
 *
 * The decks are first-party, admin-authored and fully self-contained (inline
 * CSS + JS, fonts as `data:` URIs, no external requests), so the strict CSP
 * below lets them render while blocking any network egress.
 */

// Extensions we are willing to render inline, mapped to their served type.
const INLINE_TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
};

const CSP = [
  "default-src 'none'",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "style-src 'unsafe-inline'",
  "font-src data:",
  "script-src 'unsafe-inline'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
].join("; ");

function deny(message: string, status: number): NextResponse {
  return new NextResponse(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseSlug = searchParams.get("courseSlug")?.trim();
  const ref = searchParams.get("ref")?.trim();

  if (!courseSlug || !ref) return deny("courseSlug und ref erforderlich.", 400);
  if (!isAllowedDownloadRef(ref)) return deny("Ungültige Dateireferenz.", 400);

  const parsed = parseStorageRef(ref);
  if (!parsed) return deny("Diese Datei kann nicht angezeigt werden.", 400);

  const ext = parsed.path.split(".").pop()?.toLowerCase() ?? "";
  const contentType = INLINE_TYPES[ext];
  if (!contentType) return deny("Dieser Dateityp kann nicht angezeigt werden.", 415);

  // Auth + entitlement — identical gate to /api/download.
  const supabase = await getSupabaseServerClient();
  if (!supabase) return deny("Nicht verfügbar.", 503);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return deny("Bitte melde dich an.", 401);

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .in("status", ["paid", "free"])
    .maybeSingle();
  if (!purchase) return deny("Kein Zugriff auf diese Datei.", 403);

  // The ref must actually belong to THIS course (the URL is client-controlled).
  const allowedRefs = await getCourseResourceRefs(courseSlug);
  if (!allowedRefs.has(ref)) return deny("Kein Zugriff auf diese Datei.", 403);

  const admin = getSupabaseAdminClient();
  if (!admin) return deny("Storage nicht konfiguriert.", 503);

  const { data, error } = await admin.storage.from(parsed.bucket).download(parsed.path);
  if (error || !data) return deny("Datei nicht gefunden.", 404);

  const bytes = new Uint8Array(await data.arrayBuffer());

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Content-Security-Policy": CSP,
      "X-Content-Type-Options": "nosniff",
      // Gated content: never let a shared cache hold a member's view.
      "Cache-Control": "private, no-store",
    },
  });
}
