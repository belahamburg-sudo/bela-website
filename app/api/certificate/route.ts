import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { generateCertificatePdf, certificateId } from "@/lib/certificate";
import { formatDate } from "@/lib/utils";

export const runtime = "nodejs";

// GET /api/certificate?courseSlug=… — issue a completion certificate PDF.
// Server-verified: the caller must own the course AND have completed every
// lesson, so a certificate can't be forged by hitting the endpoint directly.
export async function GET(request: Request) {
  const courseSlug = new URL(request.url).searchParams.get("courseSlug")?.trim();
  if (!courseSlug) {
    return NextResponse.json({ message: "courseSlug erforderlich." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Nicht verfügbar." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Bitte melde dich an." }, { status: 401 });
  }

  // Ownership.
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .in("status", ["paid", "free"])
    .maybeSingle();
  if (!purchase) {
    return NextResponse.json({ message: "Kein Zugriff auf diesen Kurs." }, { status: 403 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "Service nicht verfügbar." }, { status: 503 });
  }

  // Course + every lesson id.
  const { data: course } = await admin
    .from("courses")
    .select("title, modules(lessons(id))")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (!course) {
    return NextResponse.json({ message: "Kurs nicht gefunden." }, { status: 404 });
  }

  const lessonIds = ((course.modules ?? []) as { lessons: { id: string }[] }[])
    .flatMap((m) => (m.lessons ?? []).map((l) => l.id));
  if (lessonIds.length === 0) {
    return NextResponse.json({ message: "Dieser Kurs hat keine Lektionen." }, { status: 400 });
  }

  // Completion: every lesson must be in the user's progress.
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);
  const done = new Set(((progress ?? []) as { lesson_id: string }[]).map((r) => r.lesson_id));
  const complete = lessonIds.every((id) => done.has(id));
  if (!complete) {
    return NextResponse.json(
      { message: "Kurs noch nicht abgeschlossen." },
      { status: 403 }
    );
  }

  // Recipient name.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const name = profile?.full_name?.trim() || user.email?.split("@")[0] || "Mitglied";

  const pdf = await generateCertificatePdf({
    name,
    courseTitle: course.title as string,
    dateStr: formatDate(new Date()),
    certId: certificateId(user.id, courseSlug),
  });

  // Copy into a fresh ArrayBuffer-backed Uint8Array so it satisfies BodyInit.
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Zertifikat-${courseSlug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
