import type { ReactNode } from "react";
import { CheckCircle2, XCircle, Gift } from "lucide-react";
import type { ProductPage } from "@/lib/content";
import { RevealOnScroll } from "@/components/product-page-fx";

/**
 * The long sales body of a course product page, in the fixed spec order:
 *
 *   1 Problem · 2 Vision · 3 Was du brauchst · 4 So funktioniert's
 *   5 Kursinhalt im Detail (slot) · 6 Bonus · 7 Testimonials (slot)
 *   8 Für wen / nicht · 9 Was du danach kannst · 10 Ergebnis-Proof · 11 CTA (slot)
 *
 * Every block is guarded: an empty field (or an absent slot) renders nothing, so
 * each product page shows only what Bela filled in from the dashboard. The
 * page-level blocks that need server data or client components (course content,
 * testimonials, CTA) are passed in as slots and placed at their spec position.
 * Each block fades in on scroll for a livelier sales page.
 */
export function ProductPageSections({
  pp,
  proofImageUrls = [],
  outcome,
  fallbackBullets = [],
  topMedia,
  courseContent,
  testimonials,
  inlineCta,
  cta,
}: {
  pp?: ProductPage;
  /** Already-resolved public URLs for the proof screenshots. */
  proofImageUrls?: string[];
  /** Course-level outcome line, used as the lead of "Was du danach kannst". */
  outcome?: string;
  /** Course "includes" bullets, shown when afterOutcomes is empty. */
  fallbackBullets?: string[];
  /** Media block (promo video) shown right under the hero. */
  topMedia?: ReactNode;
  courseContent?: ReactNode;
  testimonials?: ReactNode;
  /** Compact buy CTA repeated mid-page (after "So funktioniert's" and the curriculum). */
  inlineCta?: ReactNode;
  cta?: ReactNode;
}) {
  const p = pp ?? {};
  const hasVision = (p.vision?.length ?? 0) > 0;
  const hasNeeds = (p.needs?.length ?? 0) > 0;
  const hasMechanism = (p.mechanism?.length ?? 0) > 0;
  const hasWhoFor = (p.whoFor?.length ?? 0) > 0;
  const hasWhoNotFor = (p.whoNotFor?.length ?? 0) > 0;

  const afterBullets = (p.afterOutcomes?.length ?? 0) > 0 ? p.afterOutcomes! : fallbackBullets;
  const hasAfter = afterBullets.length > 0 || Boolean(outcome);
  const hasProof = proofImageUrls.length > 0;

  return (
    <section className="border-t border-white/[0.04] bg-obsidian py-20 sm:py-28">
      <div className="mx-auto max-w-4xl space-y-16 px-6">
        {/* 2 — Media block (promo video) right under the hero */}
        {topMedia && <RevealOnScroll>{topMedia}</RevealOnScroll>}

        {p.problem && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Status Quo</p>
            <p className="font-heading text-2xl leading-snug text-white sm:text-3xl">{p.problem}</p>
          </RevealOnScroll>
        )}

        {hasVision && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Vision</p>
            <h2 className="mb-6 font-heading text-3xl text-white sm:text-4xl">So sieht dein Alltag danach aus.</h2>
            <div className="grid gap-3">
              {p.vision!.map((v) => (
                <div key={v} className="flex items-start gap-3 text-white/70">
                  <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                  <span className="leading-7">{v}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        )}

        {hasNeeds && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Was du wirklich brauchst</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {p.needs!.map((n) => (
                <div key={n} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-white/75">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 flex-none text-gold-300" />
                  <span className="leading-7">{n}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        )}

        {hasMechanism && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">So funktioniert der Kurs</p>
            <div className="grid gap-5">
              {p.mechanism!.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-gold-300/30 bg-gold-300/[0.06] font-heading text-gold-300">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-xl text-white">{step.title}</h3>
                    <p className="mt-1 leading-7 text-white/55">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* Mid-page CTA #1 — after the visitor understands the method */}
        {inlineCta && hasMechanism && <RevealOnScroll>{inlineCta}</RevealOnScroll>}

        {/* 5 — Kursinhalt im Detail (per-module bullets + preview video + curriculum) */}
        {courseContent && <RevealOnScroll>{courseContent}</RevealOnScroll>}

        {/* Mid-page CTA #2 — after the visitor has seen everything that's inside */}
        {inlineCta && courseContent && <RevealOnScroll>{inlineCta}</RevealOnScroll>}

        {p.bonus && (
          <RevealOnScroll className="flex items-start gap-4 rounded-2xl border border-gold-300/25 bg-gold-300/[0.06] p-6">
            <Gift aria-hidden className="mt-0.5 h-6 w-6 flex-none text-gold-300" />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-200">Bonus</p>
              <p className="mt-1 leading-7 text-white/75">{p.bonus}</p>
            </div>
          </RevealOnScroll>
        )}

        {/* 7 — Testimonials (hidden by the component until ≥1 review exists) */}
        {testimonials}

        {(hasWhoFor || hasWhoNotFor) && (
          <RevealOnScroll className="grid gap-6 sm:grid-cols-2">
            {hasWhoFor && (
              <div className="rounded-2xl border border-gold-300/15 bg-gold-300/[0.03] p-6">
                <p className="eyebrow mb-4">Für wen</p>
                <ul className="space-y-2.5">
                  {p.whoFor!.map((w) => (
                    <li key={w} className="flex items-start gap-2.5 text-white/75">
                      <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 flex-none text-gold-300" />
                      <span className="leading-7">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasWhoNotFor && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <p className="eyebrow mb-4">Für wen nicht</p>
                <ul className="space-y-2.5">
                  {p.whoNotFor!.map((w) => (
                    <li key={w} className="flex items-start gap-2.5 text-white/55">
                      <XCircle aria-hidden className="mt-0.5 h-4 w-4 flex-none text-white/30" />
                      <span className="leading-7">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </RevealOnScroll>
        )}

        {hasAfter && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Was du danach kannst</p>
            {outcome && <p className="mb-6 text-lg leading-9 text-white/55">{outcome}</p>}
            {afterBullets.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {afterBullets.map((a) => (
                  <div key={a} className="flex items-start gap-3 text-white/75">
                    <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                    <span className="leading-7">{a}</span>
                  </div>
                ))}
              </div>
            )}
          </RevealOnScroll>
        )}

        {/* 10 — Ergebnis-Proof: real screenshots, the strongest spot right before CTA */}
        {hasProof && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Echte Ergebnisse</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {proofImageUrls.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt="Ergebnis-Screenshot"
                  loading="lazy"
                  className="w-full rounded-xl border border-white/10"
                />
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* 11 — Compact CTA + price */}
        {cta && <RevealOnScroll>{cta}</RevealOnScroll>}
      </div>
    </section>
  );
}
