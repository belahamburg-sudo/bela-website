import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Course } from "@/lib/content";
import { formatEuro } from "@/lib/utils";
import { Badge } from "./badge";

type CourseCardProps = {
  course: Course;
  progress?: number;
  status?: "Neu" | "In Bearbeitung" | "Abgeschlossen";
};

export function CourseCard({ course, progress, status }: CourseCardProps) {
  return (
    <article className="card-glow panel-surface group relative overflow-hidden rounded-[1.5rem]">
      {/* Image wrapper with gradient fade */}
      <div className="relative aspect-[5/3] overflow-hidden bg-gradient-to-br from-graphite via-obsidian to-ink">
        <Image
          src={course.image}
          alt={`Cover für ${course.title}`}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        {/* Noise + gold wash */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/30 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,215,106,0.15) 0%, transparent 70%)"
          }}
        />

        {/* Level chip + price */}
        <div className="absolute inset-x-5 top-5 flex items-center justify-between">
          <Badge variant="default">{course.level}</Badge>
          <span className="rounded-full border border-gold-500/30 bg-obsidian/80 px-3 py-1 font-heading text-[0.95rem] font-bold text-gold-200 backdrop-blur-md">
            {formatEuro(course.priceCents)}
          </span>
        </div>
      </div>

      <div className="relative p-6">
        <h3 className="font-heading text-2xl font-bold tracking-[-0.01em] text-cream">
          {course.title}
        </h3>
        <p className="mt-1.5 text-sm font-medium text-gold-200">{course.tagline}</p>
        <p className="mt-4 line-clamp-3 text-sm leading-[1.75] text-muted">
          {course.description}
        </p>

        {typeof progress === "number" && (
          <div className="mt-5 pt-5 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              {status && (
                <span className={`text-xs font-semibold uppercase tracking-[0.15em] ${
                  status === "Abgeschlossen" ? "text-gold-300" :
                  status === "In Bearbeitung" ? "text-white/60" :
                  "text-white/30"
                }`}>
                  {status}
                </span>
              )}
              <span className="text-xs text-white/30 ml-auto">{progress}%</span>
            </div>
            <div className="h-[2px] w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <a
          href={`/kurse/${course.slug}`}
          className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cream transition-colors hover:text-gold-200"
        >
          <span>Kurs ansehen</span>
          <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-gold-500/30 bg-gold-500/[0.08] transition-all duration-300 group-hover:border-gold-300/60 group-hover:bg-gold-500/15">
            <ArrowRight
              className="h-3.5 w-3.5 text-gold-200 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </a>
      </div>

      {/* Stretched link overlay for full-card click */}
      <a
        href={`/kurse/${course.slug}`}
        aria-label={`${course.title} ansehen`}
        className="absolute inset-0 z-[1]"
      />
    </article>
  );
}
