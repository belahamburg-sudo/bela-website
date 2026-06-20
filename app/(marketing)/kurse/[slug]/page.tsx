import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Button } from "@/components/button";
import { CourseLevelBadge } from "@/components/course-level-badge";
import { CourseReviews } from "@/components/course-reviews";
import { CourseCurriculumOutline } from "@/components/course-curriculum-outline";
import { ProductPageSections } from "@/components/product-page-sections";
import { HeroCover } from "@/components/product-page-fx";
import { Reveal } from "@/components/dashboard/reveal";
import { getPublicCourse, getPublicCourses } from "@/lib/courses";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { parseIncludeLine } from "@/lib/course-includes";
import { resolveMediaUrl } from "@/lib/storage";
import { formatEuro, discountPercent } from "@/lib/utils";
import { Boxes, Package } from "lucide-react";

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
  if (course.isUnlisted) notFound();

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
          .in("status", ["paid", "free"])
          .maybeSingle();
        owned = Boolean(purchase);
      }
    } catch {
      owned = false;
    }
  }

  // Bundle relationships, resolved from the full catalog (fetched once).
  const allCourses = await getPublicCourses();
  const bundledSlugs = course.bundledCourses ?? [];
  const bundledCourses = bundledSlugs
    .map((s) => allCourses.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ slug: c.slug, title: c.title }));

  // Reverse lookup: other courses (bundles) that INCLUDE this one — so we can
  // nudge "get the whole bundle instead" on the product page (#28).
  const partOfBundles = allCourses
    .filter((c) => c.slug !== course.slug && (c.bundledCourses ?? []).includes(course.slug))
    .map((c) => ({ slug: c.slug, title: c.title, priceCents: c.priceCents }));

  const discount = discountPercent(course.priceCents, course.compareAtPriceCents);

  const pp = course.productPage;

  // Proof screenshots → resolved public URLs (storage refs or plain URLs).
  const proofImageUrls = (
    await Promise.all((pp?.proofImages ?? []).map((r) => resolveMediaUrl(r)))
  ).filter((u): u is string => Boolean(u));

  // "Was du danach kannst" falls back to the course "includes" bullets.
  const fallbackBullets = course.includes.map((i) => parseIncludeLine(i)?.label ?? i);

  const modulesWithHighlights = course.modules.filter((m) => (m.highlights?.length ?? 0) > 0);

  // Section 5 — "Kursinhalt im Detail": preview video + per-module bullets + the
  // full (locked) curriculum outline.
  const courseContentNode = (
    <div>
      <p className="eyebrow mb-5">Kursinhalt im Detail</p>
      <h2 className="mb-6 font-heading text-3xl text-white sm:text-4xl">Das steckt drin.</h2>

      {course.promoVideoUrl && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-gold-500/20 shadow-gold">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={course.promoVideoUrl} controls playsInline className="aspect-video w-full bg-black" />
        </div>
      )}

      {modulesWithHighlights.length > 0 && (
        <div className="mb-8 grid gap-4">
          {course.modules.map((m, i) =>
            (m.highlights?.length ?? 0) > 0 ? (
              <div key={m.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-gold-300/30 bg-gold-300/[0.06] font-heading text-sm text-gold-300">
                    {i + 1}
                  </span>
                  <h3 className="font-heading text-lg text-white">{m.title}</h3>
                </div>
                <ul className="grid gap-2">
                  {m.highlights!.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-white/70">
                      <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 flex-none text-gold-300" />
                      <span className="leading-7">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}

      <div className="mb-5 flex items-center gap-3">
        <PlayCircle aria-hidden className="h-6 w-6 text-gold-300" />
        <h3 className="font-heading text-2xl text-white">Alle Kursinhalte</h3>
      </div>
      <CourseCurriculumOutline modules={course.modules} locked />
      {owned ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm leading-7 text-emerald-100">
          <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none" />
          Du hast diesen Kurs freigeschaltet. Videos und Downloads findest du im Dashboard.
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold-500/15 bg-gold-500/[0.07] p-4 text-sm leading-7 text-gold-100">
          <Lock aria-hidden className="mt-1 h-5 w-5 flex-none" />
          Vorschau der Inhalte. Nach dem Kauf schaltest du Videos und Downloads im Dashboard frei.
        </div>
      )}
    </div>
  );

  // Section 7 — Testimonials (the component hides itself until ≥1 review exists).
  const testimonialsNode = <CourseReviews courseSlug={course.slug} />;

  // Section 11 — compact closing CTA + price.
  const ctaNode = (
    <div className="rounded-[1.5rem] border border-gold-300/25 bg-gold-300/[0.06] p-7 text-center sm:p-9">
      <h2 className="font-heading text-2xl leading-snug text-white sm:text-3xl">
        {pp?.ctaHeadline || "Bereit loszulegen?"}
      </h2>
      <div className="mt-5 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
        <p className="font-heading text-4xl text-gold-300">{formatEuro(course.priceCents)}</p>
        {discount > 0 && course.compareAtPriceCents && (
          <span className="text-xl text-white/35 line-through decoration-white/30">
            {formatEuro(course.compareAtPriceCents)}
          </span>
        )}
      </div>
      <div className="mx-auto mt-6 max-w-md">
        {owned ? (
          <Button href={`/bibliothek/${course.slug}`} size="lg" className="w-full">
            <PlayCircle aria-hidden className="h-5 w-5" />
            Jetzt im Dashboard ansehen
          </Button>
        ) : (
          <CheckoutButton courseSlug={course.slug} label="Jetzt kaufen" />
        )}
      </div>
    </div>
  );

  return (
    <>
      <section className="relative overflow-hidden bg-obsidian pt-28 pb-20 sm:pt-32 sm:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 h-[560px] w-[960px] -translate-x-1/2 rounded-full bg-gold-300/[0.06] blur-[160px]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6">
          <Link
            href="/kurse"
            className="group flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-gold-200"
          >
            <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Zurück zur Kursübersicht
          </Link>

          {/* Title block */}
          <Reveal className="mt-8 text-center">
            <div className="flex justify-center">
              <CourseLevelBadge level={course.level} />
            </div>
            <h1 className="mx-auto mt-5 max-w-4xl font-heading text-4xl leading-[1.05] text-white sm:text-6xl">
              {course.title}
            </h1>
            {pp?.outcomeHeadline ? (
              <p className="mx-auto mt-5 max-w-3xl font-heading text-2xl leading-snug text-gold-100 sm:text-3xl">
                {pp.outcomeHeadline}
              </p>
            ) : (
              <p className="mx-auto mt-5 max-w-3xl text-xl font-semibold text-gold-100">{course.tagline}</p>
            )}
            {pp?.subline && (
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/55">{pp.subline}</p>
            )}
          </Reveal>

          {/* Big header cover */}
          <div className="mt-12">
            <HeroCover src={course.image} alt={`Cover für ${course.title}`} />
          </div>

          {course.description && (
            <p className="mx-auto mt-12 max-w-3xl text-center text-lg leading-9 text-white/55">
              {course.description}
            </p>
          )}

          {/* Price + audience + CTA */}
          <div className="mx-auto mt-10 max-w-3xl rounded-[1.6rem] border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30">Preis</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <p className="font-heading text-4xl text-gold-300">{formatEuro(course.priceCents)}</p>
                  {discount > 0 && course.compareAtPriceCents && (
                    <span className="text-lg text-white/35 line-through decoration-white/30">
                      {formatEuro(course.compareAtPriceCents)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <span className="mt-2 inline-block rounded-sm bg-gold-300 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-obsidian">
                    -{discount}% OFF
                  </span>
                )}
              </div>
              <div className="sm:border-l sm:border-white/[0.06] sm:pl-6">
                {owned ? (
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-1.5 text-sm font-semibold text-emerald-200">
                      <CheckCircle2 aria-hidden className="h-4 w-4" />
                      Du besitzt diesen Kurs bereits
                    </span>
                    <Button href={`/bibliothek/${course.slug}`} size="lg" className="w-full">
                      <PlayCircle aria-hidden className="h-5 w-5" />
                      Jetzt im Dashboard ansehen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <CheckoutButton courseSlug={course.slug} label="Jetzt kaufen" autoBuy={autoBuy} />
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
                )}
              </div>
            </div>
            {course.audience && (
              <p className="mt-5 border-t border-white/[0.06] pt-4 text-sm leading-relaxed text-white/55">
                <span className="font-semibold uppercase tracking-[0.15em] text-white/30">Für wen </span>
                <span className="ml-2">{course.audience}</span>
              </p>
            )}
          </div>

          {bundledCourses.length > 0 && (
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-gold-500/20 bg-gold-500/[0.05] p-5">
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

          {!owned && partOfBundles.length > 0 && (
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-gold-300/30 bg-gold-300/[0.06] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-gold-100">
                <Package aria-hidden className="h-4 w-4 text-gold-300" />
                Im Bundle günstiger
              </div>
              <p className="mt-1 text-sm text-white/50">
                Dieser Kurs ist Teil {partOfBundles.length === 1 ? "eines Bundles" : "von Bundles"}.
                Hol dir gleich das ganze Paket und schalte mehrere Kurse auf einmal frei:
              </p>
              <ul className="mt-3 grid gap-2">
                {partOfBundles.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/kurse/${b.slug}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-gold-300/20 bg-obsidian/40 px-3 py-2.5 text-sm text-white/85 transition-colors hover:border-gold-300/50 hover:text-gold-100"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Boxes aria-hidden className="h-4 w-4 flex-none text-gold-300" />
                        <span className="truncate">{b.title}</span>
                      </span>
                      <span className="flex-none font-heading text-gold-200">{formatEuro(b.priceCents)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <ProductPageSections
        pp={pp}
        proofImageUrls={proofImageUrls}
        outcome={course.outcome}
        fallbackBullets={fallbackBullets}
        courseContent={courseContentNode}
        testimonials={testimonialsNode}
        cta={ctaNode}
      />
    </>
  );
}
