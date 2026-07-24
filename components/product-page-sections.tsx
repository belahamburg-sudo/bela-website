import type { ReactNode } from "react";
import { CheckCircle2, XCircle, Gift, Quote } from "lucide-react";
import type { ProductPage } from "@/lib/content";
import { RevealOnScroll } from "@/components/product-page-fx";

/**
 * The long sales body of a course product page, in the exact order of Bela's
 * "Produktseiten-Aufbau" board:
 *
 *   Outcome-Ergebnis + CTA · Wie es mir/den Kunden geht (+Foto) · Problem/Status-Quo
 *   Vom Angenommenen befreien (✗) + CTA · Vision · Was du wirklich brauchst (✗)
 *   So funktioniert der Kurs · Kursinhalt im Detail (slot) + CTA · Bonus (+Cover)
 *   Testimonials „Selbst wenn…" (+Foto) · Bewertungen (slot) · Kurzer Einblick (+Video+CTA)
 *   Für wen / nicht · Proof-Screenshots · Kauf-Sektion (slot)
 *
 * Every block is guarded: an empty field (or an absent slot) renders nothing, so
 * each product page shows only what Bela filled in from the dashboard. Slots that
 * need server data or client components (course content, reviews, CTA) are passed
 * in and placed at their spec position. Every CTA is a scroll link to the buy
 * section (`#kaufen`) at the very bottom — see the page-level `inlineCta`/`cta`.
 */
export function ProductPageSections({
  pp,
  proofImageUrls = [],
  bonusImageUrls = [],
  selfStoryImageUrl,
  customerStoryImageUrl,
  testimonialImageUrls = [],
  insightVideoUrl,
  courseContent,
  reviews,
  inlineCta,
  cta,
}: {
  pp?: ProductPage;
  /** Already-resolved public URLs for the proof screenshots. */
  proofImageUrls?: string[];
  /** Already-resolved public URLs for the bonus screenshots, aligned to pp.bonuses by index. */
  bonusImageUrls?: string[];
  /** Resolved photo for "Wie es mir geht". */
  selfStoryImageUrl?: string;
  /** Resolved photo for "Wie es meinen Kunden geht". */
  customerStoryImageUrl?: string;
  /** Resolved photos for the curated testimonials, aligned to pp.testimonials by index. */
  testimonialImageUrls?: string[];
  /** Resolved video URL for the "Kurzer Einblick gefällig?" section. */
  insightVideoUrl?: string;
  /** "Kursinhalt im Detail" block (per-module bullets + preview video + curriculum). */
  courseContent?: ReactNode;
  /** In-house reviews block (hides itself until ≥1 review exists). */
  reviews?: ReactNode;
  /** Scroll-to-#kaufen CTA, repeated at the spec positions. */
  inlineCta?: ReactNode;
  /** The buy section itself (id="kaufen") — target of every CTA. */
  cta?: ReactNode;
}) {
  const p = pp ?? {};
  const hasVision = (p.vision?.length ?? 0) > 0;
  const hasNeeds = (p.needs?.length ?? 0) > 0;
  const hasMechanism = (p.mechanism?.length ?? 0) > 0;
  const hasWhoFor = (p.whoFor?.length ?? 0) > 0;
  const hasWhoNotFor = (p.whoNotFor?.length ?? 0) > 0;
  const hasProof = proofImageUrls.length > 0;

  // Outcome-Ergebnis strip right under the hero.
  const heroResult = p.heroResult;
  const hasHeroResult = Boolean(heroResult?.stat || heroResult?.text);

  const selfText = p.selfStory?.text?.trim();
  const hasSelf = Boolean(selfText || selfStoryImageUrl);
  const custText = p.customerStory?.text?.trim();
  const hasCust = Boolean(custText || customerStoryImageUrl);

  // "Vom Angenommenen befreien" — headline + ✗ items.
  const assumptions = p.assumptions;
  const assumptionItems = (assumptions?.items ?? []).filter((i) => i && (i.title || i.copy));
  const hasAssumptions = Boolean(assumptions?.headline) || assumptionItems.length > 0;

  // Value-stacked bonus list.
  const bonuses = (p.bonuses ?? []).filter((b) => b && (b.title || b.desc));
  const hasBonusStack = bonuses.length > 0;

  // Curated "Selbst wenn…" testimonials.
  const testimonials = (p.testimonials ?? []).filter((t) => t && t.text);
  const hasTestimonials = testimonials.length > 0;

  // "Kurzer Einblick gefällig?" — headline + video.
  const insightHeadline = p.insight?.headline?.trim();
  const hasInsight = Boolean(insightVideoUrl || insightHeadline);

  return (
    <section className="border-t border-white/[0.04] bg-obsidian py-20 sm:py-28">
      <div className="mx-auto max-w-4xl space-y-16 px-6">
        {/* 2 — Outcome-Ergebnis + CTA */}
        {hasHeroResult && (
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-gold-300/25 bg-gold-300/[0.06] px-6 py-8 text-center">
              {heroResult!.stat && (
                <span className="font-heading text-5xl leading-none text-gold-300 sm:text-6xl">
                  {heroResult!.stat}
                </span>
              )}
              {heroResult!.text && (
                <span className="max-w-xl text-lg leading-8 text-white/80">{heroResult!.text}</span>
              )}
            </div>
          </RevealOnScroll>
        )}
        {inlineCta && hasHeroResult && <RevealOnScroll>{inlineCta}</RevealOnScroll>}

        {/* 3 — Wie es mir geht / Wie es meinen Kunden geht (+ Foto) */}
        {hasSelf && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Wie es mir geht</p>
            <StoryBlock text={selfText} image={selfStoryImageUrl} />
          </RevealOnScroll>
        )}
        {hasCust && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Wie es meinen Kunden geht</p>
            <StoryBlock text={custText} image={customerStoryImageUrl} flip />
          </RevealOnScroll>
        )}

        {/* 4 — Problem / Status Quo */}
        {p.problem && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Status Quo</p>
            <p className="font-heading text-2xl leading-snug text-white sm:text-3xl">{p.problem}</p>
          </RevealOnScroll>
        )}

        {/* Vom Angenommenen befreien (✗) + CTA */}
        {hasAssumptions && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Vom Angenommenen befreien</p>
            {assumptions?.headline && (
              <h2 className="mb-6 font-heading text-2xl leading-snug text-white sm:text-3xl">
                {assumptions.headline}
              </h2>
            )}
            {assumptionItems.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {assumptionItems.map((it, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <XCircle aria-hidden className="mt-0.5 h-5 w-5 flex-none text-white/30" />
                    <span className="leading-7 text-white/75">
                      {it.title && (
                        <strong className="font-semibold text-white">{it.title}: </strong>
                      )}
                      {it.copy}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </RevealOnScroll>
        )}
        {inlineCta && hasAssumptions && <RevealOnScroll>{inlineCta}</RevealOnScroll>}

        {/* 5 — Vision */}
        {hasVision && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Vision</p>
            <h2 className="mb-6 font-heading text-3xl text-white sm:text-4xl">
              So sieht dein Alltag danach aus.
            </h2>
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

        {/* 6 — Was du wirklich brauchst (was NICHT nötig ist, ✗) */}
        {hasNeeds && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Was du wirklich brauchst</p>
            <h2 className="mb-6 font-heading text-2xl text-white sm:text-3xl">Was NICHT nötig ist.</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {p.needs!.map((n) => (
                <div
                  key={n}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-white/75"
                >
                  <XCircle aria-hidden className="mt-0.5 h-5 w-5 flex-none text-white/30" />
                  <span className="leading-7">{n}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* 7 — So funktioniert der Kurs */}
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

        {/* 8 — Kursinhalt im Detail (slot) + CTA */}
        {courseContent && <RevealOnScroll>{courseContent}</RevealOnScroll>}
        {inlineCta && courseContent && <RevealOnScroll>{inlineCta}</RevealOnScroll>}

        {/* 9 — Bonus (+ Cover) */}
        {hasBonusStack && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Deine Boni obendrauf</p>
            <div className="grid gap-4">
              {bonuses.map((b, i) => {
                const img = bonusImageUrls[i];
                return (
                  <div
                    key={`${b.title}-${i}`}
                    className="flex flex-col gap-4 rounded-2xl border border-gold-300/25 bg-gold-300/[0.06] p-6 sm:flex-row sm:items-start"
                  >
                    {img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={b.title}
                        loading="lazy"
                        className="h-32 w-full flex-none rounded-xl border border-white/10 object-cover sm:w-48"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <Gift aria-hidden className="h-5 w-5 flex-none text-gold-300" />
                        <h3 className="font-heading text-xl text-white">{b.title}</h3>
                        {b.value && (
                          <span className="rounded-full border border-gold-300/40 bg-gold-300/10 px-3 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-gold-200">
                            Wert: {b.value}
                          </span>
                        )}
                      </div>
                      {b.desc && <p className="mt-2 leading-7 text-white/70">{b.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </RevealOnScroll>
        )}

        {/* Testimonials „Selbst wenn…" (+ Foto) */}
        {hasTestimonials && (
          <RevealOnScroll>
            <p className="eyebrow mb-5">Echte Stimmen</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {testimonials.map((t, i) => {
                const img = testimonialImageUrls[i];
                return (
                  <figure
                    key={i}
                    className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
                  >
                    <Quote aria-hidden className="h-6 w-6 flex-none text-gold-300/70" />
                    <blockquote className="whitespace-pre-line leading-7 text-white/75">
                      {t.text}
                    </blockquote>
                    {(img || t.author) && (
                      <figcaption className="mt-auto flex items-center gap-3 pt-2">
                        {img && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={t.author || "Mitglied"}
                            loading="lazy"
                            className="h-11 w-11 flex-none rounded-full border border-white/10 object-cover"
                          />
                        )}
                        {t.author && (
                          <span className="text-sm font-semibold text-white/80">{t.author}</span>
                        )}
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          </RevealOnScroll>
        )}

        {/* 10 — In-house Bewertungen (hides itself until ≥1 review exists) */}
        {reviews}

        {/* Kurzer Einblick gefällig? (Überschrift + Video + CTA) */}
        {hasInsight && (
          <RevealOnScroll>
            <h2 className="mb-6 text-center font-heading text-3xl text-white sm:text-4xl">
              {insightHeadline || "Kurzer Einblick gefällig?"}
            </h2>
            {insightVideoUrl && (
              <div className="overflow-hidden rounded-2xl border border-gold-500/20 shadow-gold">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={insightVideoUrl}
                  controls
                  playsInline
                  className="aspect-video w-full bg-black"
                />
              </div>
            )}
            {inlineCta && <div className="mt-8">{inlineCta}</div>}
          </RevealOnScroll>
        )}

        {/* 11/12 — Für wen / Für wen nicht */}
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

        {/* Proof-Screenshots — right before the buy section */}
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

        {/* Kauf-Sektion (Ziel aller CTAs) */}
        {cta && <RevealOnScroll>{cta}</RevealOnScroll>}
      </div>
    </section>
  );
}

/** Photo + text row used by "Wie es mir geht" / "Wie es meinen Kunden geht". */
function StoryBlock({ text, image, flip }: { text?: string; image?: string; flip?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-6 sm:items-center ${image ? "sm:flex-row" : ""} ${
        flip ? "sm:flex-row-reverse" : ""
      }`}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          loading="lazy"
          className="w-full flex-none rounded-2xl border border-white/10 object-cover sm:w-64"
        />
      )}
      {text && (
        <p className="flex-1 whitespace-pre-line text-lg leading-8 text-white/75">{text}</p>
      )}
    </div>
  );
}
