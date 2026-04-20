import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { CheckoutButton } from "@/components/checkout-button";
import { courses, getCourse } from "@/lib/content";
import { formatEuro } from "@/lib/utils";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  return {
    title: course ? `${course.title} | AI Goldmining` : "Kurs | AI Goldmining"
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <>
      <section className="relative py-32 bg-obsidian overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gold-300/5 blur-[140px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Badge>{course.level}</Badge>
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
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CheckoutButton courseSlug={course.slug} label="Kurs kaufen" />
              <Button href="/signup" variant="secondary">
                Erst Account erstellen
              </Button>
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
            <p className="eyebrow mb-6">Ergebnis</p>
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
              <h2 className="font-heading text-2xl text-white">Modulvorschau</h2>
            </div>
            <div className="grid gap-4">
              {course.modules.map((module) => (
                <div key={module.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <h3 className="font-semibold text-gold-100">{module.title}</h3>
                  <div className="mt-3 grid gap-2">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between gap-4 text-sm text-white/40">
                        <span>{lesson.title}</span>
                        <span className="shrink-0">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold-500/15 bg-gold-500/[0.07] p-4 text-sm leading-7 text-gold-100">
              <Lock aria-hidden className="mt-1 h-5 w-5 flex-none" />
              Kursinhalte werden nach Login und Kauf im Dashboard geöffnet.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
