import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { DbCourse } from "@/lib/db-types";
import { WaitlistForm } from "./waitlist-form";

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

        <div className="mb-8 text-left">
          <WaitlistForm courseSlug={course.slug} courseTitle={course.title} />
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
