import Link from "next/link";
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
        {/* Lock icon: GTA vault style */}
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-sm border border-gold-300/25 bg-gold-300/[0.06] relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold-300/50" aria-hidden />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold-300/50" aria-hidden />
          <Lock className="h-7 w-7 text-gold-300" />
        </div>

        <p className="eyebrow mb-4 mx-auto">Kurs freischalten</p>

        <h1 className="mb-3 font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(1.8rem,3.5vw,3rem)" }}>
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

        {/* Price + CTA */}
        <div className="rounded-sm border border-gold-300/15 bg-cream/[0.02] p-6 relative">
          <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-gold-300/40" aria-hidden />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-gold-300/40" aria-hidden />
          <p className="mb-2 gta-label text-cream/40">Einmaliger Kauf</p>
          <p className="mb-6 font-heading tracking-gta text-5xl text-cream">
            {formatEuro(course.price_cents)}
          </p>
          <CheckoutButton courseSlug={course.slug} label="Jetzt freischalten" />
        </div>

        <Link
          href="/dashboard/kurse"
          className="mt-6 inline-block text-sm text-cream/30 transition-colors hover:text-cream/60"
        >
          ← Zurück zur Kursbibliothek
        </Link>
      </div>
    </div>
  );
}
