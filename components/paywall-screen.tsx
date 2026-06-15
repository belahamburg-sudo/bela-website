import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, FileText, Play, Sparkles } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import type { DbCourse } from "@/lib/db-types";
import { formatEuro } from "@/lib/utils";

const LEVEL_COLORS: Record<string, string> = {
  Start: "border-emerald-400/25 text-emerald-300 bg-emerald-500/[0.06]",
  Aufbau: "border-sky-400/25 text-sky-300 bg-sky-500/[0.06]",
  System: "border-violet-400/25 text-violet-300 bg-violet-500/[0.06]",
  Bundle: "border-gold-300/40 text-gold-300 bg-gold-300/[0.08]",
};

type PaywallScreenProps = {
  course: Pick<
    DbCourse,
    | "slug"
    | "title"
    | "tagline"
    | "description"
    | "price_cents"
    | "image_url"
    | "level"
    | "format"
    | "includes"
  >;
};

export function PaywallScreen({ course }: PaywallScreenProps) {
  const isVideo = course.format === "video";
  const cover = course.image_url || "/assets/generated/course-starter.svg";
  const level = course.level ?? "Start";
  const levelColor = LEVEL_COLORS[level] ?? LEVEL_COLORS.Start;
  const includes = Array.isArray(course.includes) ? course.includes : [];

  return (
    <section className="relative overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.08),transparent_55%)]" />

      <div className="container-shell relative">
        <Link
          href="/db/kurse"
          className="mb-8 inline-flex items-center gap-2 text-sm text-cream/35 transition-colors hover:text-cream/70"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Goldmine
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink/40 backdrop-blur-xl">
            <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
              <Image
                src={cover}
                alt={course.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-md ${
                    isVideo
                      ? "border-gold-300/40 bg-gold-300/15 text-gold-200"
                      : "border-cream/25 bg-white/10 text-cream/85"
                  }`}
                >
                  {isVideo ? <Play className="h-3 w-3 fill-current" /> : <FileText className="h-3 w-3" />}
                  {isVideo ? "Video-Kurs" : "PDF-Guide"}
                </span>
                <span
                  className={`inline-flex items-center border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-md ${levelColor}`}
                >
                  {level}
                </span>
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <div>
                <p className="eyebrow mb-3">Kurs freischalten</p>
                <h1 className="font-heading text-3xl leading-none tracking-gta text-cream sm:text-4xl">
                  {course.title}
                </h1>
                {course.tagline ? (
                  <p className="mt-3 text-base font-semibold text-gold-300/85">{course.tagline}</p>
                ) : null}
              </div>

              {course.description ? (
                <p className="text-sm leading-relaxed text-cream/50 sm:text-base">{course.description}</p>
              ) : null}

              {includes.length > 0 ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {includes.slice(0, 6).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-cream/60">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-gold-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-gold-300/20 bg-gradient-to-br from-gold-300/[0.08] via-ink/70 to-ink/50 p-6 backdrop-blur-xl sm:p-8">
            <div className="mb-6 inline-flex items-center gap-2 border border-gold-300/30 bg-gold-300/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold-300">
              <Sparkles className="h-3 w-3" />
              Sofort freischalten
            </div>

            <div className="mb-8">
              <span className="block text-[8px] font-mono uppercase tracking-[0.2em] text-cream/30">
                Einmalig
              </span>
              <span className="gold-text font-heading text-5xl leading-none">
                {formatEuro(course.price_cents)}
              </span>
              <p className="mt-3 text-sm text-cream/45">
                Direkt kaufen — du wirst sofort zu Stripe weitergeleitet.
              </p>
            </div>

            <CheckoutButton courseSlug={course.slug} label="Jetzt kaufen" />

            <p className="mt-6 text-[11px] leading-relaxed text-cream/30">
              Nach dem Kauf findest du den Kurs in deiner Bibliothek und kannst sofort starten.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
