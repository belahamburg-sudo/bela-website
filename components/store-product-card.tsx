"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PlayCircle,
  FileText,
  Play,
  Check,
  ArrowRight,
  Download,
  Star,
  Sparkles,
  Clock,
} from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";
import { Button } from "./button";
import { CourseLevelBadge } from "@/components/course-level-badge";
import { formatEuro, cn, discountPercent } from "@/lib/utils";
import type { Course } from "@/lib/content";

const VALID_LEVELS: Course["level"][] = ["Start", "Aufbau", "System", "Bundle"];

export type StoreCardCourse = {
  slug: string;
  title: string;
  tagline: string;
  image: string;
  price_cents: number;
  compare_at_price_cents?: number | null;
  level: string;
  format: "video" | "pdf";
  totalLessons: number;
  completedLessons: number;
  progress: number;
  isBundle?: boolean;
  comingSoon?: boolean;
  isFlagship?: boolean;
  sortOrder?: number;
};

export function StoreProductCard({
  course,
  isPurchased,
}: {
  course: StoreCardCourse;
  isPurchased: boolean;
}) {
  const isVideo = course.format === "video";
  const level = (VALID_LEVELS.includes(course.level as Course["level"])
    ? course.level
    : "Start") as Course["level"];
  const comingSoon = Boolean(course.comingSoon);
  const isFlagship = Boolean(course.isFlagship);
  const discount = discountPercent(course.price_cents, course.compare_at_price_cents);

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-ink/40 backdrop-blur-xl transition-all duration-500",
        comingSoon
          ? "border-white/[0.08] opacity-90"
          : "border-white/10 hover:-translate-y-1 hover:border-gold-300/30 hover:shadow-[0_24px_60px_-24px_rgba(201,169,97,0.35)]",
        isFlagship && comingSoon && "border-gold-300/25 ring-1 ring-gold-300/15"
      )}
    >
      {!comingSoon && (
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-gold-300/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      )}

      <Link
        href={`/db/kurse/${course.slug}`}
        className="relative block h-40 overflow-hidden border-b border-white/5"
        aria-label={`${course.title} ansehen`}
      >
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "object-cover transition-all duration-700",
            comingSoon
              ? "scale-110 opacity-45 blur-[3px] saturate-50"
              : "opacity-80 group-hover:scale-105 group-hover:opacity-100"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent",
            comingSoon && "from-ink/95 via-ink/70"
          )}
        />

        {comingSoon && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.12),transparent_55%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={cn(
                  "inline-flex items-center gap-2 border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-md",
                  isFlagship
                    ? "border-gold-300/40 bg-gold-300/15 text-gold-100"
                    : "border-white/20 bg-white/10 text-cream/80"
                )}
              >
                {isFlagship ? (
                  <>
                    <Star className="h-3 w-3 fill-current" />
                    Flagship · Coming Soon
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Coming Soon
                  </>
                )}
              </span>
            </div>
          </>
        )}

        <div
          className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-md ${
            isVideo
              ? "border-gold-300/40 bg-gold-300/15 text-gold-200"
              : "border-cream/25 bg-white/10 text-cream/85"
          }`}
        >
          {isVideo ? <Play className="h-3 w-3 fill-current" /> : <FileText className="h-3 w-3" />}
          {isVideo ? "Video-Kurs" : "PDF-Guide"}
        </div>

        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          {course.isBundle && <Star className="h-3 w-3 fill-current text-gold-300" />}
          <CourseLevelBadge
            level={level}
            withIcon={false}
            className="rounded-full px-2.5 py-1 text-[9px] tracking-[0.18em]"
          />
        </div>
      </Link>

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <div className="min-h-[5.5rem]">
          <Link href={`/db/kurse/${course.slug}`}>
            <h3
              className={cn(
                "line-clamp-2 font-heading text-xl leading-tight transition-colors duration-300",
                comingSoon ? "text-cream/75 group-hover:text-cream/90" : "text-cream group-hover:text-gold-300"
              )}
            >
              {course.title}
            </h3>
          </Link>
          <p className={cn("mt-2 line-clamp-2 text-[13px] leading-relaxed", comingSoon ? "text-cream/35" : "text-cream/45")}>
            {course.tagline}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-cream/35">
          {comingSoon ? (
            <>
              <Clock className="h-3.5 w-3.5 text-gold-300/40" />
              <span>Bald verfügbar</span>
            </>
          ) : isVideo ? (
            <>
              <PlayCircle className="h-3.5 w-3.5 text-gold-300/50" />
              <span>{course.totalLessons} Lektionen</span>
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5 text-gold-300/50" />
              <span>Sofort-Download</span>
            </>
          )}
        </div>

        {isPurchased ? (
          <div className="mt-auto space-y-3 pt-6">
            {isVideo ? (
              <>
                <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.15em] text-cream/40">
                  <span>{course.progress}% abgeschlossen</span>
                  <span>
                    {course.completedLessons}/{course.totalLessons}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gold-gradient"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-300/70">
                <Check className="h-3.5 w-3.5" />
                <span>Freigeschaltet</span>
              </div>
            )}
            <Button
              href={`/db/kurse/${course.slug}`}
              variant="secondary"
              size="sm"
              className="w-full rounded-lg"
            >
              {isVideo ? "Weiterlernen" : "Öffnen"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : comingSoon ? (
          <div className="mt-auto space-y-3 pt-6">
            <div className="flex items-end justify-between gap-3">
              <div className="opacity-50 blur-[0.4px]">
                <span className="block text-[8px] font-mono uppercase tracking-[0.2em] text-cream/30">
                  Einmalig
                </span>
                <span className="font-heading text-2xl leading-none text-cream/40">
                  {formatEuro(course.price_cents)}
                </span>
              </div>
              <Button
                href={`/db/kurse/${course.slug}`}
                variant="secondary"
                size="sm"
                className="rounded-lg px-5"
              >
                Vorschau
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cream/30"
            >
              <Clock className="h-4 w-4" />
              Coming Soon
            </button>
          </div>
        ) : (
          <div className="mt-auto space-y-3 pt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="block text-[8px] font-mono uppercase tracking-[0.2em] text-cream/30">
                  Einmalig
                </span>
                <span className="flex items-center gap-2">
                  <span className="gold-text font-heading text-2xl leading-none">
                    {formatEuro(course.price_cents)}
                  </span>
                  {discount > 0 && course.compare_at_price_cents && (
                    <span className="text-sm leading-none text-cream/35 line-through decoration-cream/30">
                      {formatEuro(course.compare_at_price_cents)}
                    </span>
                  )}
                </span>
                {discount > 0 && (
                  <span className="mt-1.5 inline-block rounded-sm bg-gold-300 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-obsidian">
                    -{discount}% OFF
                  </span>
                )}
              </div>
              <Button
                href={`/db/kurse/${course.slug}`}
                variant="secondary"
                size="sm"
                className="rounded-lg px-5"
              >
                Ansehen
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <AddToCartButton
              course={{
                slug: course.slug,
                title: course.title,
                priceCents: course.price_cents,
                image: course.image,
                format: course.format,
              }}
              className="w-full rounded-lg py-2.5 text-[10px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
