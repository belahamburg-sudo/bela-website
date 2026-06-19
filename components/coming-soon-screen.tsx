import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { DbCourse } from "@/lib/db-types";

type ComingSoonScreenProps = {
  course: Pick<DbCourse, "slug" | "title" | "tagline" | "description">;
  isFlagship?: boolean;
};

export function ComingSoonScreen({ course, isFlagship }: ComingSoonScreenProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg text-center">
        <div
          className={`relative mx-auto mb-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-sm border bg-ink/60 backdrop-blur-md ${
            isFlagship ? "border-gold-300/40" : "border-white/15"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-gold-300/10 blur-sm" />
          <Sparkles className={`relative h-7 w-7 ${isFlagship ? "text-gold-300" : "text-cream/60"}`} />
        </div>

        {isFlagship ? (
          <p className="eyebrow mb-4 mx-auto text-gold-300/80">Flagship-Kurs</p>
        ) : (
          <p className="eyebrow mb-4 mx-auto">Coming Soon</p>
        )}

        <h1
          className="mb-3 font-heading tracking-gta leading-none text-cream"
          style={{ fontSize: "clamp(1.8rem,3.5vw,3rem)" }}
        >
          {course.title}
        </h1>

        {course.tagline && (
          <p className="mb-6 text-base font-semibold text-gold-300/80">{course.tagline}</p>
        )}

        {course.description && (
          <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-cream/45">
            {course.description}
          </p>
        )}

        <div className="relative overflow-hidden rounded-sm border border-white/10 bg-cream/[0.02] p-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-obsidian/40 backdrop-blur-[1px]" />
          <p className="relative text-[11px] font-mono uppercase tracking-[0.22em] text-cream/45">
            Wird bald freigeschaltet
          </p>
          <p className="relative mt-3 text-sm leading-relaxed text-cream/55">
            Dieser Kurs ist bereits in der Roadmap und erscheint in Kürze in deiner Goldmine.
          </p>
          <span className="relative mt-5 inline-flex items-center rounded-full border border-gold-300/25 bg-gold-300/[0.08] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-200/90">
            Coming Soon
          </span>
        </div>

        <Link
          href="/bibliothek"
          className="mt-6 inline-block text-sm text-cream/30 transition-colors hover:text-cream/60"
        >
          ← Zurück zur Goldmine
        </Link>
      </div>
    </div>
  );
}
