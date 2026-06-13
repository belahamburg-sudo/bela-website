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
} from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";
import { Button } from "./button";
import { formatEuro } from "@/lib/utils";

export type StoreCardCourse = {
  slug: string;
  title: string;
  tagline: string;
  image: string;
  price_cents: number;
  level: string;
  format: "video" | "pdf";
  totalLessons: number;
  completedLessons: number;
  progress: number;
  isBundle?: boolean;
};

const LEVEL_COLORS: Record<string, string> = {
  Start: "border-emerald-400/25 text-emerald-300 bg-emerald-500/[0.06]",
  Aufbau: "border-sky-400/25 text-sky-300 bg-sky-500/[0.06]",
  System: "border-violet-400/25 text-violet-300 bg-violet-500/[0.06]",
  Bundle: "border-gold-300/40 text-gold-300 bg-gold-300/[0.08]",
};

export function StoreProductCard({
  course,
  isPurchased,
}: {
  course: StoreCardCourse;
  isPurchased: boolean;
}) {
  const isVideo = course.format === "video";
  const levelColor = LEVEL_COLORS[course.level] ?? LEVEL_COLORS.Start;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-ink/40 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-gold-300/30 hover:shadow-[0_24px_60px_-24px_rgba(201, 169, 97,0.35)]">
      {/* hover wash */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-gold-300/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* corner ticks */}
      <span className="pointer-events-none absolute left-0 top-0 z-20 h-3 w-3 border-l border-t border-gold-300/0 transition-colors duration-500 group-hover:border-gold-300/50" />
      <span className="pointer-events-none absolute right-0 top-0 z-20 h-3 w-3 border-r border-t border-gold-300/0 transition-colors duration-500 group-hover:border-gold-300/50" />
      <span className="pointer-events-none absolute bottom-0 left-0 z-20 h-3 w-3 border-b border-l border-gold-300/0 transition-colors duration-500 group-hover:border-gold-300/50" />
      <span className="pointer-events-none absolute bottom-0 right-0 z-20 h-3 w-3 border-b border-r border-gold-300/0 transition-colors duration-500 group-hover:border-gold-300/50" />

      {/* Cover (links to the course product page) */}
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
          className="object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />

        {/* format badge */}
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

        {/* level badge */}
        <div
          className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1 border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-md ${levelColor}`}
        >
          {course.isBundle && <Star className="h-2.5 w-2.5 fill-current" />}
          {course.level}
        </div>
      </Link>

      {/* Body */}
      <div className="relative z-10 flex flex-1 flex-col p-5">
        <Link href={`/db/kurse/${course.slug}`}>
          <h3 className="font-heading text-xl leading-tight text-cream transition-colors duration-300 group-hover:text-gold-300">
            {course.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-cream/45">
          {course.tagline}
        </p>

        {/* meta */}
        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-cream/35">
          {isVideo ? (
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

        {/* footer */}
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
              className="w-full rounded-none"
            >
              {isVideo ? "Weiterlernen" : "Öffnen"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="mt-auto space-y-3 pt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="block text-[8px] font-mono uppercase tracking-[0.2em] text-cream/30">
                  Einmalig
                </span>
                <span className="gold-text font-heading text-2xl leading-none">
                  {formatEuro(course.price_cents)}
                </span>
              </div>
              <Button
                href={`/db/kurse/${course.slug}`}
                variant="secondary"
                size="sm"
                className="rounded-none px-5"
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
              className="w-full rounded-none py-2.5 text-[10px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
