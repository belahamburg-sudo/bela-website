import { getSupabaseServerClient } from "./supabase-server";
import { courses as staticCourses, getCourse } from "./content";
import { calculateMemberPoints } from "./avatar-system";
import { syncMemberState } from "./member-state";
import type { DbCourse, DbProfile } from "./db-types";

export async function getUnifiedMemberData() {
  const supabase = await getSupabaseServerClient();
  
  if (!supabase) return getDemoData();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getDemoData();

  const [coursesResult, purchasesResult, progressResult, profileResult] = await Promise.all([
    supabase.from("courses").select("*, modules(*, lessons(*))").eq("is_active", true),
    supabase.from("purchases").select("course_slug").eq("user_id", user.id).eq("status", "paid"),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);

  const dbCourses = (coursesResult.data ?? []) as DbCourse[];
  const purchasedSlugs = new Set((purchasesResult.data ?? []).map((p) => p.course_slug));
  const completedLessonIds = new Set((progressResult.data ?? []).map((p) => p.lesson_id));

  // Map courses with progress based on STATIC content for consistency with profile
  const purchasedCourses = Array.from(purchasedSlugs).map((slug) => {
    const staticCourse = getCourse(slug);
    if (!staticCourse) return null;

    const lessonIds = staticCourse.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const completedCount = lessonIds.filter((id) => completedLessonIds.has(id)).length;
    const totalLessons = lessonIds.length;
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      ...staticCourse,
      slug,
      progress,
      completedLessons: completedCount,
      totalLessons,
      status: progress === 100 ? "Abgeschlossen" : progress > 0 ? "In Bearbeitung" : "Starten",
    };
  }).filter(Boolean);

  const availableCourses = staticCourses.filter((c) => !purchasedSlugs.has(c.slug));

  const totalLessonsCompleted = completedLessonIds.size;
  const completedCoursesCount = purchasedCourses.filter((c) => c?.progress === 100).length;

  const profile = profileResult.data as DbProfile | null;
  
  const memberState = await syncMemberState({
    supabase,
    userId: user.id,
    onboardingComplete: Boolean(profile?.onboarding_complete),
    purchasedCourses: purchasedSlugs.size,
    completedLessons: totalLessonsCompleted,
    completedCourses: completedCoursesCount,
    fallbackAvatarId: user.user_metadata?.avatar_id ?? null,
  });

  return {
    user: {
      name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Miner",
      email: user.email,
      avatarId: memberState.selectedAvatarId,
    },
    purchasedCourses,
    availableCourses,
    totalLessonsCompleted,
    completedCourses: completedCoursesCount,
    points: memberState.points,
    rewardCount: memberState.rewardCount,
    profile,
  };
}

function getDemoData() {
  return {
    user: { name: "Demo Miner", email: "demo@bela.ai", avatarId: "miner-01" },
    purchasedCourses: [],
    availableCourses: staticCourses,
    totalLessonsCompleted: 0,
    completedCourses: 0,
    points: 0,
    rewardCount: 0,
    profile: null,
  };
}
