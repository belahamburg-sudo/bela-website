import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, PlayCircle } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Button } from "@/components/button";
import { CourseLevelBadge } from "@/components/course-level-badge";
import { CourseReviews } from "@/components/course-reviews";
import { CourseContentDetail } from "@/components/course-content-detail";
import { ProductPageSections } from "@/components/product-page-sections";
import { HeroCover } from "@/components/product-page-fx";
import { Reveal } from "@/components/dashboard/reveal";
import { getPublicCourse, getPublicCourses } from "@/lib/courses";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { resolveMediaUrl } from "@/lib/storage";
import { formatEuro, discountPercent } from "@/lib/utils";
import { Boxes, Package } from "lucide-react";
import {
  JsonLd,
  SITE_URL,
  courseProductSchema,
  breadcrumbSchema,
} from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  if (!course) return { title: "Kurs | AI Goldmining" };
  const url = `${SITE_URL}/kurse/${slug}`;
  const description = (course.description || course.tagline || "").slice(0, 160);
  return {
    title: `${course.title} | AI Goldmining`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${course.title} | AI Goldmining`,
      description,
      url,
      type: "website",
      images: course.image ? [course.image] : undefined,
    },
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

  // Bonus screenshots → resolved URLs, kept index-aligned to pp.bonuses (empty
  // string where a bonus has no image) so the section can pair them up.
  const bonusImageUrls = (
    await Promise.all((pp?.bonuses ?? []).map((b) => (b.image ? resolveMediaUrl(b.image) : null)))
  ).map((u) => u ?? "");

  // Story photos, curated-testimonial photos and the "Kurzer Einblick" video →
  // resolved public/signed URLs (storage refs or plain URLs). The insight video
  // falls back to the course promo video when no dedicated clip is set.
  const selfStoryImageUrl =
    (pp?.selfStory?.image ? await resolveMediaUrl(pp.selfStory.image) : null) ?? undefined;
  const customerStoryImageUrl =
    (pp?.customerStory?.image ? await resolveMediaUrl(pp.customerStory.image) : null) ?? undefined;
  const testimonialImageUrls = (
    await Promise.all(
      (pp?.testimonials ?? []).map((t) => (t.image ? resolveMediaUrl(t.image) : null))
    )
  ).map((u) => u ?? "");
  const insightVideoRef = pp?.insight?.videoUrl || course.promoVideoUrl;
  const insightVideoUrl =
    (insightVideoRef ? await resolveMediaUrl(insightVideoRef) : null) ?? undefined;

  // Section 5 — "Kursinhalt im Detail": one accordion merging the module
  // overview with the per-module detail (preview video + bullets + lessons).
  // Preview videos are resolved to playable URLs (storage refs or plain URLs).
  const detailModules = await Promise.all(
    course.modules.map(async (m) => ({
      id: m.id,
      title: m.title,
      highlights: m.highlights ?? [],
      previewVideoUrl: m.previewVideoUrl
        ? (await resolveMediaUrl(m.previewVideoUrl)) ?? undefined
        : undefined,
      lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, duration: l.duration })),
    }))
  );

  const courseContentNode = <CourseContentDetail modules={detailModules} owned={owned} />;

  // Every CTA on the page scrolls to the buy section (#kaufen) at the very bottom,
  // exactly as the board specifies ("Hierhin führen alle CTAs"). A native hash link
  // is enough — scroll-behavior: smooth is set globally.
  const inlineCtaNode = (
    <div className="flex justify-center">
      <a
        href="#kaufen"
        className="btn-shimmer focus-ring relative inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-gold-300/60 bg-gradient-to-b from-gold-600 via-gold-50 to-gold-600 px-8 py-4 text-[0.9rem] font-bold uppercase tracking-[0.12em] text-obsidian shadow-[0_10px_50px_-10px_rgba(201,169,97,0.6)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
      >
        <span className="relative z-[2]">{owned ? "Zum Kurs" : "Ja, das will ich!"}</span>
      </a>
    </div>
  );

  // In-house reviews (the component hides itself until ≥1 review exists).
  const reviewsNode = <CourseReviews courseSlug={course.slug} />;

  // The buy section — target of every CTA. Course headline + price + "In den
  // Warenkorb" / "Direkt kaufen" (or the dashboard link for owners), plus the
  // bundle nudges. id="kaufen" so every CTA scrolls here.
  const ctaNode = (
    <div
      id="kaufen"
      className="scroll-mt-24 rounded-[1.5rem] border border-gold-300/25 bg-gold-300/[0.06] p-7 text-center sm:p-9"
    >
      <h2 className="font-heading text-3xl leading-tight text-white sm:text-4xl">{course.title}</h2>
      {pp?.ctaHeadline && (
        <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-white/70">{pp.ctaHeadline}</p>
      )}
      <div className="mt-6 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
        <p className="font-heading text-4xl text-gold-300">{formatEuro(course.priceCents)}</p>
        {discount > 0 && course.compareAtPriceCents && (
          <span className="text-xl text-white/35 line-through decoration-white/30">
            {formatEuro(course.compareAtPriceCents)}
          </span>
        )}
        {discount > 0 && (
          <span className="rounded-sm bg-gold-300 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-obsidian">
            -{discount}% OFF
          </span>
        )}
      </div>
      <div className="mx-auto mt-7 max-w-md">
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
            <CheckoutButton courseSlug={course.slug} label="Direkt kaufen" autoBuy={autoBuy} />
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

      {course.audience && (
        <p className="mx-auto mt-6 max-w-xl border-t border-white/[0.08] pt-4 text-sm leading-relaxed text-white/55">
          <span className="font-semibold uppercase tracking-[0.15em] text-white/30">Für wen </span>
          <span className="ml-2">{course.audience}</span>
        </p>
      )}

      {bundledCourses.length > 0 && (
        <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-gold-500/20 bg-gold-500/[0.05] p-5 text-left">
          <div className="flex items-center gap-2 text-sm font-bold text-gold-100">
            <Boxes aria-hidden className="h-4 w-4 text-gold-300" />
            Enthält {bundledCourses.length} weitere{bundledCourses.length === 1 ? "n" : ""} Kurs
            {bundledCourses.length === 1 ? "" : "e"}
          </div>
          <ul className="mt-3 grid gap-2">
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
        <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-gold-300/30 bg-gold-300/[0.06] p-5 text-left">
          <div className="flex items-center gap-2 text-sm font-bold text-gold-100">
            <Package aria-hidden className="h-4 w-4 text-gold-300" />
            Im Bundle günstiger
          </div>
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
                  <span className="flex-none font-heading text-gold-200">
                    {formatEuro(b.priceCents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <>
      <JsonLd
        data={[
          courseProductSchema(course),
          breadcrumbSchema([
            { name: "Start", url: SITE_URL },
            { name: "Kurse", url: `${SITE_URL}/kurse` },
            { name: course.title, url: `${SITE_URL}/kurse/${course.slug}` },
          ]),
        ]}
      />
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

          {/* Provokativer Problem-Statement-Satz */}
          {pp?.problemStatement && (
            <p className="mx-auto mt-10 max-w-3xl text-center text-xl font-semibold leading-9 text-white/80 sm:text-2xl">
              {pp.problemStatement}
            </p>
          )}

          {/* Hero-CTA — scrollt zur Kauf-Sektion (#kaufen) ganz unten */}
          <div className="mt-10 flex justify-center">
            {owned ? (
              <Button href={`/bibliothek/${course.slug}`} size="lg">
                <PlayCircle aria-hidden className="h-5 w-5" />
                Jetzt im Dashboard ansehen
              </Button>
            ) : (
              <a
                href="#kaufen"
                className="btn-shimmer focus-ring relative inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-gold-300/60 bg-gradient-to-b from-gold-600 via-gold-50 to-gold-600 px-8 py-4 text-[0.9rem] font-bold uppercase tracking-[0.12em] text-obsidian shadow-[0_10px_50px_-10px_rgba(201,169,97,0.6)] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
              >
                <span className="relative z-[2]">
                  {pp?.heroCtaLabel || "Cool! Zeig mir wie's geht!"}
                </span>
              </a>
            )}
          </div>
        </div>
      </section>

      <ProductPageSections
        pp={pp}
        proofImageUrls={proofImageUrls}
        bonusImageUrls={bonusImageUrls}
        selfStoryImageUrl={selfStoryImageUrl}
        customerStoryImageUrl={customerStoryImageUrl}
        testimonialImageUrls={testimonialImageUrls}
        insightVideoUrl={insightVideoUrl}
        courseContent={courseContentNode}
        reviews={reviewsNode}
        inlineCta={inlineCtaNode}
        cta={ctaNode}
      />
    </>
  );
}
