import { Lock } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import type { DbCourse } from "@/lib/db-types";
import { formatEuro } from "@/lib/utils";

type PaywallScreenProps = {
  course: Pick<DbCourse, "slug" | "title" | "tagline" | "description" | "price_cents">;
};

export function PaywallScreen({ course }: PaywallScreenProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg text-center">
        {/* Lock icon */}
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-500/[0.06]">
          <Lock className="h-7 w-7 text-gold-300" />
        </div>

        {/* Eyebrow */}
        <p className="eyebrow mb-4">Kurs freischalten</p>

        {/* Course title */}
        <h1 className="mb-3 font-heading text-3xl text-cream lg:text-4xl">
          {course.title}
        </h1>

        {/* Tagline */}
        {course.tagline && (
          <p className="mb-6 text-base font-medium text-gold-200">{course.tagline}</p>
        )}

        {/* Description */}
        {course.description && (
          <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-white/50">
            {course.description}
          </p>
        )}

        {/* Price + CTA */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <p className="mb-2 text-sm text-white/40">Einmaliger Kauf</p>
          <p className="mb-6 font-heading text-4xl text-cream">
            {formatEuro(course.price_cents)}
          </p>
          <CheckoutButton courseSlug={course.slug} label="Jetzt freischalten" />
        </div>

        {/* Back link */}
        <a
          href="/dashboard/kurse"
          className="mt-6 inline-block text-sm text-white/30 transition-colors hover:text-white/60"
        >
          ← Zurück zur Kursbibliothek
        </a>
      </div>
    </div>
  );
}
