import { redirect } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { CourseCard } from "@/components/course-card";
import { getCourse } from "@/lib/content";
import type { Course } from "@/lib/content";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type CourseWithProgress = Course & { progress: number; status: "Neu" | "In Bearbeitung" | "Abgeschlossen" };

async function fetchDashboardData(): Promise<{
  purchasedCourses: CourseWithProgress[];
  totalCourseCount: number;
  redirectToOnboarding: boolean;
}> {
  if (!hasSupabasePublicEnv()) {
    return { purchasedCourses: [], totalCourseCount: 0, redirectToOnboarding: false };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { purchasedCourses: [], totalCourseCount: 0, redirectToOnboarding: false };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { purchasedCourses: [], totalCourseCount: 0, redirectToOnboarding: false };
  }

  const [profileResult, purchasesResult, progressResult, coursesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single(),
    supabase
      .from("purchases")
      .select("course_slug")
      .eq("user_id", user.id)
      .eq("status", "paid"),
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id),
    supabase
      .from("courses")
      .select("id")
      .eq("is_active", true),
  ]);

  const onboardingComplete = profileResult.data?.onboarding_complete ?? true;
  if (!onboardingComplete) {
    return { purchasedCourses: [], totalCourseCount: 0, redirectToOnboarding: true };
  }

  const purchasedSlugs = (purchasesResult.data ?? []).map(
    (p: { course_slug: string }) => p.course_slug
  );
  const completedLessonIds = new Set(
    (progressResult.data ?? []).map((p: { lesson_id: string }) => p.lesson_id)
  );
  const totalCourseCount = (coursesResult.data ?? []).length;

  const purchasedCourses: CourseWithProgress[] = purchasedSlugs
    .map((slug: string) => getCourse(slug))
    .filter((c): c is Course => c !== undefined)
    .map((course) => {
      const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      const completedCount = lessonIds.filter((id) => completedLessonIds.has(id)).length;
      const progressPct =
        lessonIds.length > 0 ? Math.round((completedCount / lessonIds.length) * 100) : 0;
      const status: "Neu" | "In Bearbeitung" | "Abgeschlossen" =
        progressPct === 100 ? "Abgeschlossen" : progressPct > 0 ? "In Bearbeitung" : "Neu";
      return { ...course, progress: progressPct, status };
    });

  return { purchasedCourses, totalCourseCount, redirectToOnboarding: false };
}

export default async function DashboardPage() {
  const { purchasedCourses, totalCourseCount, redirectToOnboarding } =
    await fetchDashboardData();

  if (redirectToOnboarding) {
    redirect("/dashboard/onboarding");
  }

  const purchasedCount = purchasedCourses.length;
  const completedLessonsTotal = purchasedCourses.reduce((sum, c) => {
    const lessonIds = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
    return sum + lessonIds.filter(() => c.progress > 0).length;
  }, 0);
  const avgProgress =
    purchasedCount > 0
      ? Math.round(purchasedCourses.reduce((sum, c) => sum + c.progress, 0) / purchasedCount)
      : 0;

  const stats = [
    { value: purchasedCount.toString(), label: "Kurse freigeschaltet" },
    { value: completedLessonsTotal.toString(), label: "Lektionen abgeschlossen" },
    { value: `${avgProgress}%`, label: "Fortschritt Ø" },
  ];

  const hasUnpurchasedCourses = purchasedCount < totalCourseCount;

  return (
    <AuthGate>
      <section className="py-32 bg-obsidian min-h-screen">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20">
            <p className="eyebrow mb-6">Dashboard</p>
            <h1 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(2.5rem,5vw,5rem)" }}>
              DEINE AI-GOLDMINING-{" "}
              <span className="gold-text">ZENTRALE.</span>
            </h1>
            <p className="mt-5 text-cream/45 text-lg max-w-xl">
              Hier findest du alle deine Kurse und deinen Lernfortschritt.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-gold-300/10 mb-20 border-y border-gold-300/10 py-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center px-8 py-4">
                <p className="font-heading tracking-gta text-4xl lg:text-5xl text-cream mb-1">{stat.value}</p>
                <p className="gta-label">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Deine Kurse */}
          <div className="mb-16">
            <p className="eyebrow mb-8">Deine Kurse</p>
            {purchasedCourses.length === 0 ? (
              <div className="rounded-sm border border-gold-300/10 bg-cream/[0.02] p-12 text-center">
                <p className="text-cream/40 mb-6">Noch keine Kurse gekauft.</p>
                <Button href="/dashboard/kurse">Kurse entdecken</Button>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {purchasedCourses.map((course) => (
                  <CourseCard
                    key={course.slug}
                    course={course}
                    progress={course.progress}
                    status={course.status}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mehr entdecken — only shown when unpurchased courses exist */}
          {hasUnpurchasedCourses && (
            <div className="panel-surface rounded-sm p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <p className="eyebrow mb-2">Mehr entdecken</p>
                <h2 className="font-heading tracking-gta text-2xl text-cream">Weitere Kurse entdecken</h2>
                <p className="mt-2 text-cream/40 text-sm max-w-md">
                  Entdecke alle verfügbaren Kurse und erweitere dein AI-Goldmining-Wissen.
                </p>
              </div>
              <Button href="/dashboard/kurse" className="flex-shrink-0">
                Alle Kurse ansehen →
              </Button>
            </div>
          )}
        </div>
      </section>
    </AuthGate>
  );
}
