import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  let body: { courseSlug?: string; email?: string; name?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { courseSlug, email, name } = body;
  if (!courseSlug || !email || typeof email !== "string") {
    return NextResponse.json({ error: "courseSlug and email required" }, { status: 400 });
  }

  const cleaned = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
  }

  const { error } = await admin
    .from("course_waitlist")
    .upsert(
      { course_slug: courseSlug, email: cleaned, name: name?.trim() || null },
      { onConflict: "course_slug,email" }
    );

  if (error) {
    console.error("[waitlist]", error.message);
    return NextResponse.json({ error: "Fehler beim Eintragen" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
