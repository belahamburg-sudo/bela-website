import { notFound } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { CoursePlayer } from "@/components/course-player";
import { PaywallScreen } from "@/components/paywall-screen";
import type { DbCourse, DbModule } from "@/lib/db-types";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getCourse } from "@/lib/content";

async function fetchCourseAndAccess(
  slug: string
): Promise<{ course: DbCourse | null; hasPurchase: boolean; completedLessonIds: string[] }> {
  if (!hasSupabasePublicEnv()) {
    return { course: null, hasPurchase: false, completedLessonIds: [] };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { course: null, hasPurchase: false, completedLessonIds: [] };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [courseResult, purchaseResult, progressResult] = await Promise.all([
    supabase
      .from("courses")
      .select("*, modules(*, lessons(*))")
      .eq("slug", slug)
      .eq("is_active", true)
      .single(),
    user
      ? supabase
          .from("purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_slug", slug)
          .eq("status", "paid")
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  if (courseResult.error || !courseResult.data) {
    return { course: null, hasPurchase: false, completedLessonIds: [] };
  }

  const rawCourse = courseResult.data as DbCourse & {
    modules: Array<DbModule & { lessons: DbModule["lessons"] }>;
  };
  rawCourse.modules = (rawCourse.modules as DbModule[])
    .sort((a, b) => a.position: b.position)
    .map((mod) => ({
      ...mod,
      lessons: [...mod.lessons].sort((a, b) => a.position: b.position),
    }));

  return {
    course: rawCourse,
    hasPurchase: Boolean(purchaseResult.data),
    completedLessonIds: (progressResult.data ?? []).map(
      (r: { lesson_id: string }) => r.lesson_id
    ),
  };
}

export default async function DashboardCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { course: dbCourse, hasPurchase, completedLessonIds } = await fetchCourseAndAccess(slug);

  if (dbCourse) {
    return (
      <AuthGate>
        {hasPurchase ? (
          <section className="py-10 sm:py-14">
            <div className="container-shell">
              <CoursePlayer course={dbCourse} initialCompleted={completedLessonIds} />
            </div>
          </section>
        ) : (
          <PaywallScreen course={dbCourse} />
        )}
      </AuthGate>
    );
  }

  // Fallback to static content
  const staticCourse = getCourse(slug);
  if (!staticCourse) notFound();

  const fallbackCourse: DbCourse = {
    id: staticCourse.slug,
    slug: staticCourse.slug,
    title: staticCourse.title,
    tagline: staticCourse.outcome ?? null,
    description: null,
    price_cents: 0,
    image_url: null,
    is_active: true,
    modules: staticCourse.modules.map((mod, mi) => ({
      id: `${staticCourse.slug}-mod-${mi}`,
      course_id: staticCourse.slug,
      title: mod.title,
      position: mi,
      lessons: mod.lessons.map((lesson, li) => ({
        id: lesson.id,
        module_id: `${staticCourse.slug}-mod-${mi}`,
        title: lesson.title,
        description: lesson.summary ?? null,
        video_url: lesson.videoUrl ?? null,
        duration: lesson.duration ?? null,
        position: li,
        resources: [],
      })),
    })),
  };

  // Static fallback always shows paywall (purchase check unavailable without Supabase env)
  return (
    <AuthGate>
      <PaywallScreen course={fallbackCourse} />
    </AuthGate>
  );
}
