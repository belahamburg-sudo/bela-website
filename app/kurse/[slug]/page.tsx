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
      <section className="bg-gold-radial py-16 sm:py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Badge>{course.level}</Badge>
            <h1 className="mt-5 font-heading text-4xl font-black leading-tight text-cream sm:text-6xl">
              {course.title}
            </h1>
            <p className="mt-4 text-xl font-semibold text-gold-100">{course.tagline}</p>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-muted">{course.description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="panel-surface rounded-2xl p-4">
                <p className="text-xs uppercase text-muted">Preis</p>
                <p className="mt-2 font-heading text-2xl font-black text-gold-300">
                  {formatEuro(course.priceCents)}
                </p>
              </div>
              <div className="panel-surface rounded-2xl p-4 sm:col-span-2">
                <p className="text-xs uppercase text-muted">Für wen</p>
                <p className="mt-2 font-semibold text-cream">{course.audience}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CheckoutButton courseSlug={course.slug} label="Kurs kaufen" />
              <Button href="/signup" variant="secondary">
                Erst Account erstellen
              </Button>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">
              Im Demo-Modus wird kein echter Betrag abgebucht. Mit Stripe-Keys
              wird daraus ein echter Checkout.
            </p>
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

      <section className="py-20">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Ergebnis</p>
            <h2 className="mt-4 font-heading text-4xl font-black text-cream">
              Was du nach dem Kurs gebaut hast.
            </h2>
            <p className="mt-5 text-lg leading-9 text-muted">{course.outcome}</p>
            <div className="mt-8 grid gap-3">
              {course.includes.map((item) => (
                <div key={item} className="flex items-start gap-3 text-cream">
                  <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                  <span className="leading-7">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel-surface rounded-[1.35rem] p-6">
            <div className="mb-5 flex items-center gap-3">
              <PlayCircle aria-hidden className="h-6 w-6 text-gold-300" />
              <h2 className="font-heading text-2xl font-black text-cream">Modulvorschau</h2>
            </div>
            <div className="grid gap-4">
              {course.modules.map((module) => (
                <div key={module.id} className="rounded-2xl border border-gold-500/15 bg-obsidian p-4">
                  <h3 className="font-bold text-gold-100">{module.title}</h3>
                  <div className="mt-3 grid gap-2">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between gap-4 text-sm text-muted">
                        <span>{lesson.title}</span>
                        <span>{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold-500/15 bg-gold-500/10 p-4 text-sm leading-7 text-gold-100">
              <Lock aria-hidden className="mt-1 h-5 w-5 flex-none" />
              Kursinhalte werden nach Login und Kauf im Dashboard geöffnet.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
