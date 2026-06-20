import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Layers } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { CoursePlayer, type RecommendedCourseCard } from "@/components/course-player";
import { PaywallScreen } from "@/components/paywall-screen";
import { ComingSoonScreen } from "@/components/coming-soon-screen";
import { CourseCurriculumOutline } from "@/components/course-curriculum-outline";
import { CourseReviews } from "@/components/course-reviews";
import { CourseCoach } from "@/components/course-coach";
import { courseIsIndexed } from "@/lib/course-coach";
import { CourseCrossSell, type CrossSellItem } from "@/components/course-cross-sell";
import { getPublicCourses, getStoreCatalog } from "@/lib/courses";
import type { DbCourse, DbModule } from "@/lib/db-types";
import type { Course } from "@/lib/content";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase";
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
): Promise<{ course: DbCourse | null; hasPurchase: boolean; completedLessonIds: string[]; isComplete: boolean }> {
  if (!hasSupabasePublicEnv()) {
    return { course: null, hasPurchase: false, completedLessonIds: [], isComplete: false };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { course: null, hasPurchase: false, completedLessonIds: [], isComplete: false };
  const admin = getSupabaseAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [courseResult, purchaseResult, progressResult] = await Promise.all([
    (admin ?? supabase)
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
          .in("status", ["paid", "free"])
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
    return { course: null, hasPurchase: false, completedLessonIds: [], isComplete: false };
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

  const completedLessonIds = (progressResult.data ?? []).map(
    (r: { lesson_id: string }) => r.lesson_id
  );
  const completedSet = new Set(completedLessonIds);
  const allLessonIds = rawCourse.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const isComplete = allLessonIds.length > 0 && allLessonIds.every((id) => completedSet.has(id));

  return {
    course: rawCourse,
    hasPurchase: Boolean(purchaseResult.data),
    completedLessonIds,
    isComplete: Boolean(purchaseResult.data) && isComplete,
  };
}

export default async function DashboardCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { course: dbCourse, hasPurchase, completedLessonIds, isComplete } = await fetchCourseAndAccess(slug);

  if (dbCourse) {
    if (hasPurchase && dbCourse.is_active) {
      const playableCourse = await resolveCourseMedia(dbCourse);
      const coachReady = await courseIsIndexed(slug);

      // Cross-sell pool: resolve the hand-picked slugs to live course cards.
      const crossSlugs = Array.isArray(dbCourse.cross_sell_slugs) ? dbCourse.cross_sell_slugs : [];
      let crossSellItems: CrossSellItem[] = [];
      if (crossSlugs.length > 0) {
        const all = await getPublicCourses();
        crossSellItems = crossSlugs
          .map((s) => all.find((c) => c.slug === s))
          .filter((c): c is NonNullable<typeof c> => Boolean(c))
          .map((c) => ({ slug: c.slug, title: c.title, image: c.image, priceCents: c.priceCents }));
      }

      // Per-module recommendations: resolve the picked slugs to live course cards.
      // Uses the full catalog (incl. coming-soon drafts) so a recommended draft
      // still renders, linking to its "bald verfügbar" page.
      const recSlugs = Array.from(
        new Set(
          playableCourse.modules
            .map((m) => m.recommended_course_slug)
            .filter((s): s is string => Boolean(s))
        )
      );
      const recommendedCourses: Record<string, RecommendedCourseCard> = {};
      if (recSlugs.length > 0) {
        const catalog = await getStoreCatalog();
        for (const recSlug of recSlugs) {
          const c = catalog.find((x) => x.slug === recSlug);
          if (c) {
            recommendedCourses[recSlug] = {
              slug: c.slug,
              title: c.title,
              image: c.image,
              priceCents: c.priceCents,
              comingSoon: Boolean(c.comingSoon),
            };
          }
        }
      }

      return (
        <AuthGate>
          <section className="py-10 sm:py-14">
            <div className="container-shell">
              <Link
                href="/bibliothek"
                className="focus-ring mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-transparent px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-gold-300/50 hover:text-cream"
              >
                <ArrowLeft aria-hidden className="h-4 w-4" />
                Zurück zur Übersicht
              </Link>

              {isComplete ? (
                <a
                  href={`/api/certificate?courseSlug=${encodeURIComponent(slug)}`}
                  className="focus-ring mb-7 flex items-center justify-between gap-4 rounded-2xl border border-gold-300/30 bg-gradient-to-r from-gold-300/[0.12] to-transparent px-5 py-4 transition hover:border-gold-300/60 hover:from-gold-300/20"
                >
                  <span className="flex items-center gap-3">
                    <Award aria-hidden className="h-6 w-6 shrink-0 text-gold-300" />
                    <span>
                      <span className="block text-sm font-bold uppercase tracking-[0.12em] text-cream">
                        Kurs abgeschlossen 🎉
                      </span>
                      <span className="block text-xs text-cream/50">
                        Lad dir dein persönliches Zertifikat als PDF herunter.
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-gold-gradient px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-obsidian">
                    Zertifikat
                  </span>
                </a>
              ) : null}

              <CoursePlayer
                course={playableCourse}
                initialCompleted={completedLessonIds}
                recommendedCourses={recommendedCourses}
              />

              {/* Affiliate text + cross-sell pool under the videos (#54). */}
              <CourseCrossSell affiliateText={dbCourse.affiliate_text} items={crossSellItems} />

              {coachReady ? (
                <div className="mt-12">
                  <CourseCoach courseSlug={slug} courseTitle={dbCourse.title} />
                </div>
              ) : null}

              {/* Buyers can rate the course right where they learn (#17). */}
              <div className="mt-14 border-t border-white/[0.06] pt-12">
                <CourseReviews courseSlug={slug} />
              </div>
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
