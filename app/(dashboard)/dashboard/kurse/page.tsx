import { Lock, CheckCircle2, PlayCircle, Star } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { CheckoutButton } from "@/components/checkout-button";
import type { DbCourse } from "@/lib/db-types";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { courses as staticCourses } from "@/lib/content";
import { formatEuro } from "@/lib/utils";

type CourseWithAccess = Omit<DbCourse, "modules"> & {
  isPurchased: boolean;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  created_at?: string;
};

const LEVEL_ORDER: Record<string, number> = {
  Start: 0,
  Aufbau: 1,
  System: 2,
  Bundle: 3,
};

const LEVEL_COLORS: Record<string, string> = {
  Start: "border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.08]",
  Aufbau: "border-sky-500/30 text-sky-400 bg-sky-500/[0.08]",
  System: "border-violet-500/30 text-violet-400 bg-violet-500/[0.08]",
  Bundle: "border-gold-300/30 text-gold-300 bg-gold-300/[0.08]",
};

async function fetchCoursesWithAccess(): Promise<CourseWithAccess[]> {
  if (!hasSupabasePublicEnv()) {
    return staticCourses.map((c) => ({
      id: c.slug,
      slug: c.slug,
      title: c.title,
      tagline: c.tagline,
      description: c.description,
      price_cents: c.priceCents,
      image_url: c.image,
      is_active: true,
      created_at: new Date().toISOString(),
      isPurchased: false,
      progress: 0,
      completedLessons: 0,
      totalLessons: c.modules.flatMap((m) => m.lessons).length,
    }));
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [coursesResult, purchasesResult, progressResult] = await Promise.all([
    supabase
      .from("courses")
      .select("id, slug, title, tagline, description, price_cents, image_url, is_active, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    user
      ? supabase
          .from("purchases")
          .select("course_slug")
          .eq("user_id", user.id)
          .eq("status", "paid")
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const dbCourses = (coursesResult.data ?? []) as (Omit<DbCourse, "modules"> & { created_at: string })[];
  const purchasedSlugs = new Set(
    (purchasesResult.data ?? []).map((p: { course_slug: string }) => p.course_slug)
  );
  const completedIds = new Set(
    (progressResult.data ?? []).map((p: { lesson_id: string }) => p.lesson_id)
  );

  return dbCourses.map((course) => {
    const staticCourse = staticCourses.find((c) => c.slug === course.slug);
    const lessonIds = staticCourse?.modules.flatMap((m) => m.lessons.map((l) => l.id)) ?? [];
    const completed = lessonIds.filter((id) => completedIds.has(id)).length;
    const progress = lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0;
    return {
      ...course,
      isPurchased: purchasedSlugs.has(course.slug),
      progress,
      completedLessons: completed,
      totalLessons: lessonIds.length,
    };
  });
}

export default async function DashboardCoursesPage() {
  const courses = await fetchCoursesWithAccess();

  const purchased = courses.filter((c) => c.isPurchased);
  const available = courses.filter((c) => !c.isPurchased);

  const sortedAvailable = [...available].sort((a, b) => {
    const staticA = staticCourses.find((c) => c.slug === a.slug);
    const staticB = staticCourses.find((c) => c.slug === b.slug);
    return (LEVEL_ORDER[staticA?.level ?? ""] ?? 99) - (LEVEL_ORDER[staticB?.level ?? ""] ?? 99);
  });

  return (
    <AuthGate>
      <section className="py-12 sm:py-16">
        <div className="container-shell">
          <div className="mb-10">
            <p className="eyebrow mb-3">Kursbibliothek</p>
            <h1 className="font-heading tracking-gta text-4xl text-cream lg:text-5xl leading-none">
              DEINE KURSE.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/40">
              Gekaufte Kurse direkt starten. Weitere Kurse freischalten — Schritt für Schritt die komplette Goldmining-Methode.
            </p>
          </div>

          {/* Purchased courses */}
          {purchased.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <CheckCircle2 className="h-4 w-4 text-gold-300" />
                <p className="eyebrow">Freigeschaltet ({purchased.length})</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {purchased.map((course) => {
                  const staticCourse = staticCourses.find((c) => c.slug === course.slug);
                  const level = staticCourse?.level ?? "Start";
                  const levelColor = LEVEL_COLORS[level] ?? LEVEL_COLORS.Start;
                  return (
                    <article
                      key={course.slug}
                      className="panel-surface rounded-sm border border-gold-300/15 p-6 flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className={`inline-block text-[0.65rem] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm border mb-2 ${levelColor}`}>
                            {level}
                          </span>
                          <h2 className="font-heading tracking-gta text-lg text-cream leading-tight">
                            {course.title}
                          </h2>
                          <p className="text-xs text-cream/40 mt-1">{course.tagline}</p>
                        </div>
                        <PlayCircle className="h-5 w-5 text-gold-300/50 flex-shrink-0 mt-1" />
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-cream/35 mb-1.5">
                          <span>{course.completedLessons} / {course.totalLessons} Lektionen</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="h-[3px] w-full bg-cream/[0.06] rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-700"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        href={`/dashboard/kurse/${course.slug}`}
                        variant="secondary"
                        className="w-full text-center justify-center"
                      >
                        {course.progress > 0 ? "Weitermachen" : "Kurs starten"}
                      </Button>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available courses */}
          {sortedAvailable.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Lock className="h-4 w-4 text-cream/30" />
                <p className="eyebrow">Freischaltbar ({sortedAvailable.length})</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {sortedAvailable.map((course) => {
                  const staticCourse = staticCourses.find((c) => c.slug === course.slug);
                  const level = staticCourse?.level ?? "Start";
                  const levelColor = LEVEL_COLORS[level] ?? LEVEL_COLORS.Start;
                  const isBundle = level === "Bundle";
                  return (
                    <article
                      key={course.slug}
                      className={`panel-surface rounded-sm border p-6 flex flex-col gap-4 relative ${
                        isBundle
                          ? "border-gold-300/25 bg-gradient-to-br from-gold-300/[0.04] to-transparent"
                          : "border-white/[0.07]"
                      }`}
                    >
                      {isBundle && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gold-300">
                          <Star className="h-3 w-3 fill-gold-300" />
                          Empfohlen
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-white/[0.07] bg-white/[0.02]">
                          <Lock className="h-3.5 w-3.5 text-white/20" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`inline-block text-[0.65rem] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm border mb-2 ${levelColor}`}>
                            {level}
                          </span>
                          <h2 className="font-heading tracking-gta text-lg text-cream/70 leading-tight">
                            {course.title}
                          </h2>
                          <p className="text-xs text-cream/30 mt-1">{course.tagline}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="font-heading tracking-gta text-lg text-gold-300/80">
                          {formatEuro(course.price_cents)}
                        </span>
                        <CheckoutButton courseSlug={course.slug} label="Freischalten" />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {courses.length === 0 && (
            <div className="rounded-sm border border-gold-300/10 bg-cream/[0.02] p-12 text-center">
              <p className="text-cream/30 text-sm">Keine Kurse verfügbar.</p>
            </div>
          )}
        </div>
      </section>
    </AuthGate>
  );
}
