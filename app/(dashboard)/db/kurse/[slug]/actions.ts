"use server";

import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendTemplateEmail } from "@/lib/email";

export async function toggleLessonProgress(
  lessonId: string,
  markDone: boolean,
  courseSlug?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabasePublicEnv()) return { ok: false, error: "no env" };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "no client" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };

  if (markDone) {
    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        { user_id: user.id, lesson_id: lessonId },
        { onConflict: "user_id,lesson_id" }
      );
    if (error) return { ok: false, error: error.message };

    if (courseSlug) {
      checkCourseCompletion(supabase, user.id, user.email ?? null, courseSlug).catch(() => {});
    }

    return { ok: true };
  } else {
    const { error } = await supabase
      .from("lesson_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
}

async function checkCourseCompletion(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  userId: string,
  userEmail: string | null,
  courseSlug: string
) {
  if (!supabase) return;
  const admin = getSupabaseAdminClient();
  if (!admin) return;

  const { data: course } = await admin
    .from("courses")
    .select("title, modules(lessons(id))")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (!course) return;

  const lessonIds = ((course.modules ?? []) as { lessons: { id: string }[] }[])
    .flatMap((m) => (m.lessons ?? []).map((l) => l.id));
  if (lessonIds.length === 0) return;

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  const done = new Set(((progress ?? []) as { lesson_id: string }[]).map((r) => r.lesson_id));
  if (!lessonIds.every((id) => done.has(id))) return;

  const { data: existing } = await admin
    .from("certificates")
    .select("user_id")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .maybeSingle();
  if (existing) return;

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", userId)
    .maybeSingle();

  const email = profile?.email ?? userEmail;
  if (!email) return;

  const name = profile?.full_name?.trim() || email.split("@")[0];

  await sendTemplateEmail({
    template: "course-completed",
    to: email,
    vars: {
      name,
      email,
      courseName: course.title as string,
      pointsEarned: lessonIds.length * 10,
      nextCourseUrl: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://aigoldmining.com").replace(/\/$/, "")}/bibliothek`,
    },
  });
}
