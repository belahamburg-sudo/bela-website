import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Button } from "@/components/button";
import { CourseLevelBadge } from "@/components/course-level-badge";
import { CourseReviews } from "@/components/course-reviews";
import { CourseCurriculumOutline } from "@/components/course-curriculum-outline";
import { getPublicCourse, getPublicCourses } from "@/lib/courses";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { parseIncludeLine } from "@/lib/course-includes";
import { formatEuro } from "@/lib/utils";
import { Boxes } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  return {
    title: course ? `${course.title} | AI Goldmining` : "Kurs | AI Goldmining"
  };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ buy?: string }>;
}) {
  const { slug } = await params;
  const { buy } = await searchParams;
  const course = await getPublicCourse(slug);
  if (!course) notFound();

  const autoBuy = buy === "1";

  // Does the signed-in user already own this course? (paid purchase) — if so we
  // still show this preview page (incl. reviews) but swap the buy CTAs for a
  // link straight into the dashboard player.
  let owned = false;
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: purchase } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_slug", slug)
          .eq("status", "paid")
          .maybeSingle();
        owned = Boolean(purchase);
      }
    } catch {
      owned = false;
    }
  }

  // Resolve bundled/linked courses (slugs → titles) for the "included" display.
  const bundledSlugs = course.bundledCourses ?? [];
  let bundledCourses: { slug: string; title: string }[] = [];
  if (bundledSlugs.length > 0) {
    const all = await getPublicCourses();
    bundledCourses = bundledSlugs
      .map((s) => all.find((c) => c.slug === s))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => ({ slug: c.slug, title: c.title }));
  }

  return (
    <>
      <section className="relative py-32 bg-obsidian overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gold-300/5 blur-[140px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Link
              href="/kurse"
              className="group mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-gold-200"
            >
              <ArrowLeft
                aria-hidden
                className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              />
              Zurück zur Kursübersicht
            </Link>
            <CourseLevelBadge level={course.level} />
            <h1 className="mt-5 font-heading text-4xl leading-tight text-white sm:text-6xl">
              {course.title}
            </h1>
            <p className="mt-4 text-xl font-semibold text-gold-100">{course.tagline}</p>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-white/50">{course.description}</p>

            {bundledCourses.length > 0 && (
              <div className="mt-8 rounded-2xl border border-gold-500/20 bg-gold-500/[0.05] p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-gold-100">
                  <Boxes aria-hidden className="h-4 w-4 text-gold-300" />
                  Enthält {bundledCourses.length} weitere{bundledCourses.length === 1 ? "n" : ""} Kurs{bundledCourses.length === 1 ? "" : "e"}
                </div>
                <p className="mt-1 text-sm text-white/45">
                  Beim Kauf werden diese Kurse automatisch mit freigeschaltet:
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {bundledCourses.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/kurse/${c.slug}`}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-obsidian/40 px-3 py-2 text-sm text-white/80 transition-colors hover:border-gold-300/40 hover:text-gold-100"
                      >
                        <CheckCircle2 aria-hidden className="h-4 w-4 flex-none text-gold-300" />
                        <span className="truncate">{c.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-0 divide-x divide-white/[0.06] border-t border-white/[0.06] pt-6">
              <div className="pr-6">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-1">Preis</p>
                <p className="font-heading text-3xl text-gold-300">{formatEuro(course.priceCents)}</p>
              </div>
              <div className="pl-6">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-1">Für wen</p>
                <p className="font-semibold text-white/70 text-sm leading-relaxed">{course.audience}</p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {owned ? (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-1.5 text-sm font-semibold text-emerald-200">
                    <CheckCircle2 aria-hidden className="h-4 w-4" />
                    Du besitzt diesen Kurs bereits
                  </span>
                  <Button href={`/db/kurse/${course.slug}`} size="lg" className="w-full sm:w-auto">
                    <PlayCircle aria-hidden className="h-5 w-5" />
                    Jetzt im Dashboard ansehen
                  </Button>
                </>
              ) : (
                <>
                  <CheckoutButton courseSlug={course.slug} label="Jetzt kaufen" autoBuy={autoBuy} />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <AddToCartButton
                      course={{
                        slug: course.slug,
                        title: course.title,
                        priceCents: course.priceCents,
                        image: course.image,
                        format: course.format,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <Image
            src={course.image}
            alt={`Cover für ${course.title}`}
            width={900}
            height={1100}
            priority
            className="mx-auto w-full max-w-md rounded-[1.6rem] border border-gold-500/20 shadow-gold"
          />
        </div>
      </section>

      <section className="py-32 bg-obsidian border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow mb-6 mx-auto">Ergebnis</p>
            <h2 className="font-heading text-4xl text-white leading-[1.05]">
              Was du nach dem Kurs gebaut hast.
            </h2>
            <p className="mt-5 text-lg leading-9 text-white/50">{course.outcome}</p>
            <div className="mt-8 grid gap-3">
              {course.includes.map((item) => {
                const parsed = parseIncludeLine(item);
                const label = parsed?.label ?? item;
                const href = parsed?.href ?? null;
                return (
                  <div key={item} className="flex items-start gap-3 text-white/70">
                    <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                    {href ? (
                      <Link
                        href={href}
                        className="leading-7 text-gold-100 underline decoration-gold-300/40 underline-offset-2 transition-colors hover:text-gold-200"
                        {...(href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {label}
                      </Link>
                    ) : (
                      <span className="leading-7">{label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="mb-8 flex items-center gap-3">
              <PlayCircle aria-hidden className="h-6 w-6 text-gold-300" />
              <h2 className="font-heading text-2xl text-white">Kursinhalte</h2>
            </div>
            <CourseCurriculumOutline modules={course.modules} locked />
            {owned ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm leading-7 text-emerald-100">
                <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none" />
                Du hast diesen Kurs freigeschaltet — Videos und Downloads findest du im Dashboard.
              </div>
            ) : (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold-500/15 bg-gold-500/[0.07] p-4 text-sm leading-7 text-gold-100">
                <Lock aria-hidden className="mt-1 h-5 w-5 flex-none" />
                Vorschau der Inhalte. Nach dem Kauf schaltest du Videos und Downloads im Dashboard frei.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bewertungen */}
      <section className="py-24 bg-cones border-t border-white/[0.04]">
        <div className="dust-overlay" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-6">
          <CourseReviews courseSlug={course.slug} />
        </div>
      </section>
    </>
  );
}
