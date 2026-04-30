import { AuthGate } from "@/components/auth-gate";
import { getCourse } from "@/lib/content";
import type { DbProfile } from "@/lib/db-types";
import { hasSupabasePublicEnv } from "@/lib/env";
import { syncMemberState } from "@/lib/member-state";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { ProfileForm } from "./profile-form";

async function fetchProfile() {
  if (!hasSupabasePublicEnv()) {
    return {
      profile: null as DbProfile | null,
      email: "",
      avatarId: null as string | null,
      purchasedCourses: 0,
      completedLessons: 0,
      completedCourses: 0,
      points: 0,
      rewardCount: 0,
    };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      profile: null as DbProfile | null,
      email: "",
      avatarId: null as string | null,
      purchasedCourses: 0,
      completedLessons: 0,
      completedCourses: 0,
      points: 0,
      rewardCount: 0,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profile: null as DbProfile | null,
      email: "",
      avatarId: null as string | null,
      purchasedCourses: 0,
      completedLessons: 0,
      completedCourses: 0,
      points: 0,
      rewardCount: 0,
    };
  }

  const [profileResult, purchasesResult, progressResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, goal, onboarding_complete, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("purchases")
      .select("course_slug")
      .eq("user_id", user.id)
      .eq("status", "paid"),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
  ]);

  const purchasedSlugs = Array.from(
    new Set((purchasesResult.data ?? []).map((purchase: { course_slug: string }) => purchase.course_slug))
  );
  const completedLessonIds = new Set(
    (progressResult.data ?? []).map((progress: { lesson_id: string }) => progress.lesson_id)
  );

  const completedCourses = purchasedSlugs.reduce((count, slug) => {
    const course = getCourse(slug);
    if (!course) return count;
    const lessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
    if (lessonIds.length > 0 && lessonIds.every((lessonId) => completedLessonIds.has(lessonId))) {
      return count + 1;
    }
    return count;
  }, 0);

  const profile = profileResult.data as DbProfile | null;
  const memberState = await syncMemberState({
    supabase,
    userId: user.id,
    onboardingComplete: Boolean(profile?.onboarding_complete),
    purchasedCourses: purchasedSlugs.length,
    completedLessons: completedLessonIds.size,
    completedCourses,
    fallbackAvatarId:
      typeof user.user_metadata?.avatar_id === "string" ? user.user_metadata.avatar_id : null,
  });

  return {
    profile,
    email: user.email ?? "",
    avatarId: memberState.selectedAvatarId,
    purchasedCourses: purchasedSlugs.length,
    completedLessons: completedLessonIds.size,
    completedCourses,
    points: memberState.points,
    rewardCount: memberState.rewardCount,
  };
}

export default async function ProfilePage() {
  const { profile, email, avatarId, purchasedCourses, completedLessons, completedCourses, points, rewardCount } =
    await fetchProfile();

  return (
    <AuthGate>
      <section className="py-16 sm:py-20">
        <div className="container-shell">
          <p className="eyebrow mb-5">Profil & Avatar</p>
          <h1 className="mb-2 font-heading text-4xl text-cream lg:text-5xl">Dein Member-Profil.</h1>
          <p className="mt-2 mb-10 max-w-2xl text-base leading-relaxed text-white/40">
            Wähle deinen Charakter, verfolge deinen Fortschritt und schalte mit Punkten weitere Avatare frei.
          </p>

          <div className="panel-surface rounded-2xl p-6 sm:p-8">
            <ProfileForm
              initialName={profile?.full_name ?? ""}
              initialGoal={profile?.goal ?? ""}
              email={email}
              initialAvatarId={avatarId}
              points={points}
              completedLessons={completedLessons}
              purchasedCourses={purchasedCourses}
              completedCourses={completedCourses}
              rewardCount={rewardCount}
            />
          </div>
        </div>
      </section>
    </AuthGate>
  );
}
