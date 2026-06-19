import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Course } from "@/lib/content";
import { formatEuro, discountPercent } from "@/lib/utils";
import { CourseLevelBadge } from "@/components/course-level-badge";

type CourseCardProps = {
  course: Course;
  progress?: number;
  status?: "Neu" | "In Bearbeitung" | "Abgeschlossen";
};

export function CourseCard({ course, progress, status }: CourseCardProps) {
  const discount = discountPercent(course.priceCents, course.compareAtPriceCents);
  return (
    <article className="card-glow panel-surface group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gold-300/15">
      {/* Image */}
      <div className="relative aspect-[5/3] shrink-0 overflow-hidden bg-gradient-to-br from-graphite via-obsidian to-ink">
        <Image
          src={course.image}
          alt={`Cover für ${course.title}`}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-obsidian/95 via-obsidian/35 to-transparent" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(ellipse at center, rgba(201, 169, 97,0.18) 0%, transparent 70%)" }}
        />

        {/* Level badge */}
        <div className="absolute inset-x-5 top-5">
          <CourseLevelBadge level={course.level} />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-6">
        <div className="min-h-[7.5rem]">
          <h3 className="font-heading tracking-gta text-2xl text-cream leading-tight">
            {course.title}
          </h3>
          <p className="mt-1.5 text-sm font-semibold text-gold-300/80">{course.tagline}</p>
        </div>
        <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-[1.75] text-cream/45">
          {course.description}
        </p>

        {typeof progress === "number" && (
          <div className="mt-5 pt-5 border-t border-gold-300/10">
            <div className="flex items-center justify-between mb-2">
              {status && (
                <span className={`gta-label ${
                  status === "Abgeschlossen" ? "text-gold-300" :
                  status === "In Bearbeitung" ? "text-cream/50" :
                  "text-cream/25"
                }`}>
                  {status}
                </span>
              )}
              <span className="text-xs text-cream/30 ml-auto">{progress}%</span>
            </div>
            <div className="h-[2px] w-full bg-cream/[0.06] rounded-sm overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Price + CTA — part of the card body, not overlaid on the cover */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div className="flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="w-fit rounded-sm bg-gold-300 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-obsidian">
                -{discount}% OFF
              </span>
            )}
            <span className="flex items-baseline gap-2 font-heading tracking-gta text-2xl leading-none text-gold-200">
              {formatEuro(course.priceCents)}
              {discount > 0 && course.compareAtPriceCents && (
                <span className="text-sm text-cream/35 line-through decoration-cream/30">
                  {formatEuro(course.compareAtPriceCents)}
                </span>
              )}
            </span>
          </div>
          <a
            href={`/kurse/${course.slug}`}
            className="focus-ring inline-flex flex-none items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-cream transition-colors hover:text-gold-300"
          >
            <span>Kurs ansehen</span>
            <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-sm border border-gold-300/35 bg-gold-300/[0.08] transition-all duration-300 group-hover:border-gold-300/70 group-hover:bg-gold-300/15">
              <ArrowRight
                className="h-3.5 w-3.5 text-gold-200 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </a>
        </div>
      </div>

      {/* Stretched link overlay */}
      <a
        href={`/kurse/${course.slug}`}
        aria-label={`${course.title} ansehen`}
        className="absolute inset-0 z-[1]"
      />
    </article>
  );
}
