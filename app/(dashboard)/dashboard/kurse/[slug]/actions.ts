"use server";

import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function toggleLessonProgress(
  lessonId: string,
  markDone: boolean
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
    return error ? { ok: false, error: error.message } : { ok: true };
  } else {
    const { error } = await supabase
      .from("lesson_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
}
