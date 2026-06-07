import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";
import { Button } from "@/components/button";
import { SpatialBackground } from "@/components/spatial-background";
import { getPublicCourse } from "@/lib/courses";

export default async function CheckoutCancelPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string; course?: string; demo?: string }>;
}) {
  const { course: courseSlug } = await searchParams;
  const course = courseSlug ? await getPublicCourse(courseSlug) : undefined;

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-obsidian py-16 sm:py-24">
      <SpatialBackground />

      <div className="container-shell relative z-10">
        <div className="mx-auto max-w-2xl">
          <div className="tac-panel tac-corners px-6 py-12 text-center sm:px-12 sm:py-16">
            {/* Status badge */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gold-300/20" />
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-cream/40">
                Vorgang abgebrochen
              </span>
              <div className="h-px w-8 bg-gold-300/20" />
            </div>

            {/* Icon */}
            <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cream/[0.04] blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.03]">
                <XCircle className="h-10 w-10 text-cream/50" aria-hidden />
              </div>
            </div>

            <h1 className="font-heading text-4xl uppercase leading-none tracking-gta text-cream sm:text-5xl">
              Kauf <span className="gold-text">abgebrochen.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-cream/55">
              {course ? (
                <>
                  Der Kauf von{" "}
                  <span className="font-semibold text-cream">{course.title}</span> wurde nicht
                  abgeschlossen. Es wurde nichts berechnet — du kannst es jederzeit erneut
                  versuchen.
                </>
              ) : (
                <>
                  Dein Kauf wurde nicht abgeschlossen. Es wurde nichts berechnet — du kannst es
                  jederzeit erneut versuchen.
                </>
              )}
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/db/kurse" size="md">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Zurück zum Store
              </Button>
            </div>

            <div className="mt-8">
              <Link
                href="/db"
                className="focus-ring text-[10px] font-mono uppercase tracking-[0.2em] text-cream/35 transition-colors hover:text-gold-300/70"
              >
                Zur Übersicht
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
