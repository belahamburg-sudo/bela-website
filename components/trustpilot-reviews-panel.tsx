"use client";

import { trustpilotProfile } from "@/lib/trustpilot-reviews";

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`} aria-label={`${rating} von 5 Sternen`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${i < rating ? "text-[#00b67a]" : "text-white/15"}`}
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M12 2l2.9 6.26 6.8.56-5.15 4.48 1.55 6.63L12 16.9l-6.1 3.03 1.55-6.63L2.3 8.82l6.8-.56L12 2z"
          />
        </svg>
      ))}
    </div>
  );
}

function TrustpilotLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#00b67a]" aria-hidden>
        <path
          fill="currentColor"
          d="M12 2l2.9 6.26 6.8.56-5.15 4.48 1.55 6.63L12 16.9l-6.1 3.03 1.55-6.63L2.3 8.82l6.8-.56L12 2z"
        />
      </svg>
      <span className="text-sm font-semibold tracking-wide text-cream/90">Trustpilot</span>
    </span>
  );
}

function formatReviewDate(isoDate: string) {
  return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(isoDate)
  );
}

export function TrustpilotReviewsPanel() {
  const { trustScore, reviewCount, starsLabel, profileUrl, reviews } = trustpilotProfile;

  return (
    <div className="space-y-6">
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-sm border border-[#00b67a]/20 bg-[#00b67a]/[0.06] px-5 py-4 transition-colors hover:border-[#00b67a]/35 hover:bg-[#00b67a]/[0.09]"
      >
        <TrustpilotLogo />
        <div className="flex items-center gap-3">
          <span className="font-heading text-3xl leading-none text-cream">{trustScore.toFixed(1)}</span>
          <div className="text-left">
            <Stars rating={Math.round(trustScore)} />
            <p className="mt-1 text-xs text-cream/50">
              {starsLabel} · {reviewCount} Bewertungen
            </p>
          </div>
        </div>
      </a>

      <div className="border-t border-gold-300/10 pt-6">
        <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40">
          Neueste Bewertungen
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={`${review.author}-${review.date}`}
              className="rounded-sm border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-sm text-cream">{review.author}</p>
                  <p className="text-[11px] text-cream/40">{formatReviewDate(review.date)}</p>
                </div>
                <Stars rating={review.rating} />
              </div>
              <h3 className="text-sm font-semibold text-cream/90">{review.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/55">{review.text}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
