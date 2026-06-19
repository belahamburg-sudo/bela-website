import { CheckCircle2, XCircle, Gift } from "lucide-react";
import type { ProductPage } from "@/lib/content";

/**
 * Renders the editable product-page sections. Every block is guarded: an empty
 * field renders nothing, so each product page shows only what Bela filled in
 * from the dashboard.
 */
export function ProductPageSections({ pp }: { pp?: ProductPage }) {
  if (!pp) return null;

  const hasVision = (pp.vision?.length ?? 0) > 0;
  const hasNeeds = (pp.needs?.length ?? 0) > 0;
  const hasMechanism = (pp.mechanism?.length ?? 0) > 0;
  const hasWhoFor = (pp.whoFor?.length ?? 0) > 0;
  const hasWhoNotFor = (pp.whoNotFor?.length ?? 0) > 0;
  const hasAfter = (pp.afterOutcomes?.length ?? 0) > 0;

  const anything =
    pp.problem || hasVision || hasNeeds || hasMechanism || hasWhoFor || hasWhoNotFor || hasAfter || pp.bonus;
  if (!anything) return null;

  return (
    <section className="border-t border-white/[0.04] bg-obsidian py-20 sm:py-28">
      <div className="mx-auto max-w-4xl space-y-16 px-6">
        {pp.problem && (
          <div>
            <p className="eyebrow mb-5">Status Quo</p>
            <p className="font-heading text-2xl leading-snug text-white sm:text-3xl">{pp.problem}</p>
          </div>
        )}

        {hasVision && (
          <div>
            <p className="eyebrow mb-5">Vision</p>
            <h2 className="mb-6 font-heading text-3xl text-white sm:text-4xl">So sieht dein Alltag danach aus.</h2>
            <div className="grid gap-3">
              {pp.vision!.map((v) => (
                <div key={v} className="flex items-start gap-3 text-white/70">
                  <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                  <span className="leading-7">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasNeeds && (
          <div>
            <p className="eyebrow mb-5">Was du wirklich brauchst</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {pp.needs!.map((n) => (
                <div key={n} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-white/75">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 flex-none text-gold-300" />
                  <span className="leading-7">{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasMechanism && (
          <div>
            <p className="eyebrow mb-5">So funktioniert der Kurs</p>
            <div className="grid gap-5">
              {pp.mechanism!.map((step, i) => (
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
          </div>
        )}

        {(hasWhoFor || hasWhoNotFor) && (
          <div className="grid gap-6 sm:grid-cols-2">
            {hasWhoFor && (
              <div className="rounded-2xl border border-gold-300/15 bg-gold-300/[0.03] p-6">
                <p className="eyebrow mb-4">Für wen</p>
                <ul className="space-y-2.5">
                  {pp.whoFor!.map((w) => (
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
                  {pp.whoNotFor!.map((w) => (
                    <li key={w} className="flex items-start gap-2.5 text-white/55">
                      <XCircle aria-hidden className="mt-0.5 h-4 w-4 flex-none text-white/30" />
                      <span className="leading-7">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {hasAfter && (
          <div>
            <p className="eyebrow mb-5">Was du danach kannst</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {pp.afterOutcomes!.map((a) => (
                <div key={a} className="flex items-start gap-3 text-white/75">
                  <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                  <span className="leading-7">{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pp.bonus && (
          <div className="flex items-start gap-4 rounded-2xl border border-gold-300/25 bg-gold-300/[0.06] p-6">
            <Gift aria-hidden className="mt-0.5 h-6 w-6 flex-none text-gold-300" />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-200">Bonus</p>
              <p className="mt-1 leading-7 text-white/75">{pp.bonus}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
