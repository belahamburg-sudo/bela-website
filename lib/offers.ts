/**
 * Post-purchase 1-Click upsell (OTO). After a successful checkout we charge the
 * card that was just saved (setup_future_usage) for a discounted course — no
 * second card entry. REAL money moves here. Enabled by default; set
 * `OTO_ENABLED=0` to switch it off. Course + discount overridable via env.
 */
export const OTO = {
  enabled: process.env.OTO_ENABLED !== "0",
  courseSlug: process.env.OTO_COURSE_SLUG || "prompt-engineering-pro",
  discountPercent: Math.min(95, Math.max(1, Number(process.env.OTO_DISCOUNT_PERCENT || 50))),
} as const;

/** Discounted OTO price for a given full price, in cents. */
export function otoPriceCents(fullPriceCents: number): number {
  return Math.round(fullPriceCents * (1 - OTO.discountPercent / 100));
}
