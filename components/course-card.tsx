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
    <article className="card-glow panel-surface group relative overflow-hidden rounded-sm">
      {/* Corner accent marks: GTA style */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-300/50 z-10" aria-hidden />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-300/50 z-10" aria-hidden />

      {/* Image */}
      <div className="relative aspect-[5/3] overflow-hidden bg-gradient-to-br from-graphite via-obsidian to-ink">
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
          style={{ background: "radial-gradient(ellipse at center, rgba(232,192,64,0.18) 0%, transparent 70%)" }}
        />

        {/* Level + price */}
        <div className="absolute inset-x-5 top-5 flex items-center justify-between">
          <Badge variant="default">{course.level}</Badge>
          <span className="rounded-sm border border-gold-300/35 bg-obsidian/85 px-3 py-1 font-heading tracking-gta text-[0.9rem] text-gold-200 backdrop-blur-md">
            {formatEuro(course.priceCents)}
          </span>
        </div>
      </div>

      <div className="relative p-6">
        <h3 className="font-heading tracking-gta text-2xl text-cream leading-tight">
          {course.title}
        </h3>
        <p className="mt-1.5 text-sm font-semibold text-gold-300/80">{course.tagline}</p>
        <p className="mt-4 line-clamp-3 text-sm leading-[1.75] text-cream/45">
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

        <a
          href={`/kurse/${course.slug}`}
          className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-cream transition-colors hover:text-gold-300"
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

      {/* Stretched link overlay */}
      <a
        href={`/kurse/${course.slug}`}
        aria-label={`${course.title} ansehen`}
        className="absolute inset-0 z-[1]"
      />
    </article>
  );
}
