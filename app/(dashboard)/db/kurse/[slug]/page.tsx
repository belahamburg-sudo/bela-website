import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { CoursePlayer } from "@/components/course-player";
import { PaywallScreen } from "@/components/paywall-screen";
import { ComingSoonScreen } from "@/components/coming-soon-screen";
import { CourseCurriculumOutline } from "@/components/course-curriculum-outline";
import type { DbCourse, DbModule } from "@/lib/db-types";
import type { Course } from "@/lib/content";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { resolveMediaUrl } from "@/lib/storage";
import { getCourse } from "@/lib/content";

/** Map DB modules/lessons to the outline's Course module shape (read-only). */
function toOutlineModules(course: DbCourse): Course["modules"] {
  return [...course.modules]
    .sort((a, b) => a.position - b.position)
    .map((mod) => ({
      id: mod.id,
      title: mod.title,
      lessons: [...mod.lessons]
        .sort((a, b) => a.position - b.position)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration ?? "",
          summary: lesson.description ?? "",
          videoUrl: lesson.video_url ?? "",
          resources: lesson.resources ?? [],
        })),
    }));
}

/**
 * Not-yet-purchased member view: the existing buy box (PaywallScreen) plus the
 * course CONTENTS as a locked outline preview, so members can see what they buy.
 */
function PaywallWithCurriculum({ course }: { course: DbCourse }) {
  const modules = toOutlineModules(course);
  return (
    <>
      <PaywallScreen course={course} />
      {modules.length > 0 ? (
        <section className="pb-14">
          <div className="container-shell">
            <div className="mb-7 flex items-center gap-3">
              <Layers aria-hidden className="h-5 w-5 text-gold-300" />
              <h2 className="font-heading text-2xl uppercase tracking-gta text-cream">
                Kursinhalte
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <CourseCurriculumOutline modules={modules} locked className="max-w-3xl" />
            <p className="mt-5 max-w-3xl text-[13px] leading-relaxed text-cream/40">
              Vorschau der Inhalte. Videos und Downloads werden nach dem Kauf freigeschaltet.
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}

/**
 * Turn stored `storage://` refs into playable/downloadable URLs for an entitled
 * viewer: lesson videos and resource files in the private bucket become
 * short-lived signed URLs; external embeds and public assets pass through.
 */
async function resolveCourseMedia(course: DbCourse): Promise<DbCourse> {
  const modules = await Promise.all(
    course.modules.map(async (mod) => ({
      ...mod,
      lessons: await Promise.all(
        mod.lessons.map(async (lesson) => ({
          ...lesson,
          // Videos get a short-lived signed URL for playback…
          video_url: await resolveMediaUrl(lesson.video_url),
          // …but resources keep their raw storage ref so /api/download can fetch
          // the master, watermark it and hand back a buyer-specific signed URL.
          resources: lesson.resources ?? [],
        }))
      ),
    }))
  );
  return { ...course, modules };
}

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
      .maybeSingle(),
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
    .sort((a, b) => a.position - b.position)
    .map((mod) => ({
      ...mod,
      lessons: [...mod.lessons].sort((a, b) => a.position - b.position),
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
    if (hasPurchase && dbCourse.is_active) {
      const playableCourse = await resolveCourseMedia(dbCourse);
      return (
        <AuthGate>
          <section className="py-10 sm:py-14">
            <div className="container-shell">
              <CoursePlayer course={playableCourse} initialCompleted={completedLessonIds} />
            </div>
          </section>
        </AuthGate>
      );
    }
    if (!dbCourse.is_active) {
      return (
        <AuthGate>
          <ComingSoonScreen
            course={dbCourse}
            isFlagship={slug === "ai-goldmining-method"}
          />
        </AuthGate>
      );
    }
    return (
      <AuthGate>
        <PaywallWithCurriculum course={dbCourse} />
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
    description: staticCourse.description ?? null,
    price_cents: staticCourse.priceCents,
    image_url: staticCourse.image ?? null,
    level: staticCourse.level,
    format: staticCourse.format,
    includes: staticCourse.includes,
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
      <PaywallWithCurriculum course={fallbackCourse} />
    </AuthGate>
  );
}
