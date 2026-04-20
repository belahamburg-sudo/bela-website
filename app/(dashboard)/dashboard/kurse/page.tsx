import { Lock } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { CheckoutButton } from "@/components/checkout-button";
import type { DbCourse } from "@/lib/db-types";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { courses as staticCourses } from "@/lib/content";

type CourseWithAccess = DbCourse & { isPurchased: boolean };

async function fetchCoursesWithAccess(): Promise<CourseWithAccess[]> {
  if (!hasSupabasePublicEnv()) return [];

  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [coursesResult, purchasesResult] = await Promise.all([
    supabase
      .from("courses")
      .select("id, slug, title, tagline, description, price_cents, image_url, is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    user
      ? supabase
          .from("purchases")
          .select("course_slug")
          .eq("user_id", user.id)
          .eq("status", "paid")
      : Promise.resolve({ data: [] }),
  ]);

  const courses = (coursesResult.data ?? []) as DbCourse[];
  const purchasedSlugs = new Set(
    (purchasesResult.data ?? []).map((p: { course_slug: string }) => p.course_slug)
  );

  return courses.map((course) => ({
    ...course,
    isPurchased: purchasedSlugs.has(course.slug),
  }));
}

export default async function DashboardCoursesPage() {
  const courses = await fetchCoursesWithAccess();

  return (
    <AuthGate>
      <section className="py-16 sm:py-20">
        <div className="container-shell">
          <p className="eyebrow">Kursbibliothek</p>
          <h1 className="mt-5 font-heading text-4xl text-cream lg:text-5xl">
            Deine Kurse.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/40">
            Gekaufte Kurse kannst du direkt starten. Weitere Kurse freischalten mit einem
            Klick.
          </p>

          <div className="mt-10 grid gap-4">
            {courses.length > 0 ? (
              courses.map((course) => (
                <article
                  key={course.slug}
                  className="panel-surface flex flex-col gap-4 rounded-[1.35rem] p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    {!course.isPurchased && (
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                        <Lock className="h-3.5 w-3.5 text-white/30" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-heading text-xl text-cream">{course.title}</h2>
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/40">
                        {course.tagline ?? course.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {course.isPurchased ? (
                      <Button href={`/dashboard/kurse/${course.slug}`} variant="secondary">
                        Kurs öffnen
                      </Button>
                    ) : (
                      <CheckoutButton courseSlug={course.slug} label="Kaufen" />
                    )}
                  </div>
                </article>
              ))
            ) : (
              /* Static fallback when Supabase env not configured */
              staticCourses.map((course) => (
                <article
                  key={course.slug}
                  className="panel-surface flex flex-col gap-4 rounded-[1.35rem] p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                      <Lock className="h-3.5 w-3.5 text-white/30" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl text-cream">{course.title}</h2>
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/40">
                        {course.outcome}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <CheckoutButton courseSlug={course.slug} label="Kaufen" />
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </AuthGate>
  );
}
