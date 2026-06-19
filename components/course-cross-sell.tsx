import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Wrench } from "lucide-react";
import { formatEuro } from "@/lib/utils";

export type CrossSellItem = { slug: string; title: string; image: string; priceCents: number };

/**
 * Affiliate / tools text + hand-picked cross-sell courses, shown under the
 * course videos. Renders nothing when both are empty.
 */
export function CourseCrossSell({
  affiliateText,
  items,
}: {
  affiliateText?: string | null;
  items: CrossSellItem[];
}) {
  if (!affiliateText && items.length === 0) return null;

  return (
    <div className="mt-14 space-y-10 border-t border-white/[0.06] pt-12">
      {affiliateText && (
        <div className="rounded-2xl border border-gold-300/15 bg-gold-300/[0.03] p-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gold-200">
            <Wrench className="h-4 w-4" />
            Tools & Empfehlungen
          </div>
          <p className="whitespace-pre-line text-sm leading-7 text-cream/70">{affiliateText}</p>
        </div>
      )}

      {items.length > 0 && (
        <div>
          <h2 className="mb-5 font-heading text-2xl uppercase tracking-gta text-cream">Das passt dazu</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <Link
                key={c.slug}
                href={`/bibliothek/${c.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-ink/40 p-3 transition hover:border-gold-300/30"
              >
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg">
                  <Image src={c.image} alt={c.title} fill className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-cream group-hover:text-gold-300">
                    {c.title}
                  </p>
                  <p className="gold-text font-heading text-sm">{formatEuro(c.priceCents)}</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-none text-cream/30 transition group-hover:text-gold-300" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
