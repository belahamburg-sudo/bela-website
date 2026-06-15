import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CourseLevelBadge } from "@/components/course-level-badge";
import { CourseReviews } from "@/components/course-reviews";
import { CourseCurriculumOutline } from "@/components/course-curriculum-outline";
import { getPublicCourse } from "@/lib/courses";
import { formatEuro } from "@/lib/utils";

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
              {course.includes.map((item) => (
                <div key={item} className="flex items-start gap-3 text-white/70">
                  <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                  <span className="leading-7">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-8 flex items-center gap-3">
              <PlayCircle aria-hidden className="h-6 w-6 text-gold-300" />
              <h2 className="font-heading text-2xl text-white">Kursinhalte</h2>
            </div>
            <CourseCurriculumOutline modules={course.modules} locked />
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold-500/15 bg-gold-500/[0.07] p-4 text-sm leading-7 text-gold-100">
              <Lock aria-hidden className="mt-1 h-5 w-5 flex-none" />
              Vorschau der Inhalte. Nach dem Kauf schaltest du Videos und Downloads im Dashboard frei.
            </div>
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
