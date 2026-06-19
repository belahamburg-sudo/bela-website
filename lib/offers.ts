/**
 * Order bump — the small "+X € extra" checkbox shown in the checkout.
 * The brief flags this as the single most lucrative lever in the funnel.
 *
 * Edit these values (or set the env vars) to match the real bonus product.
 * Pickup-rate is typically 25–40 %.
 */
export const ORDER_BUMP = {
  id: "bonus-prompt-pack",
  label: process.env.NEXT_PUBLIC_ORDER_BUMP_LABEL || "Bonus: Die 50 besten AI-Prompts",
  description:
    process.env.NEXT_PUBLIC_ORDER_BUMP_DESC ||
    "Sofort einsetzbare Prompt-Sammlung für Hooks, Produktideen und Verkaufstexte. Nur hier im Checkout.",
  priceCents: Number(process.env.NEXT_PUBLIC_ORDER_BUMP_PRICE_CENTS || 1900),
} as const;

export function formatBumpPrice(): string {
  return `+${(ORDER_BUMP.priceCents / 100).toLocaleString("de-DE", {
    minimumFractionDigits: ORDER_BUMP.priceCents % 100 === 0 ? 0 : 2,
  })} €`;
}

/**
 * Post-purchase 1-Click upsell (OTO). After a successful checkout we charge the
 * card that was just saved (setup_future_usage) for a discounted course — no
 * second card entry. REAL money moves here, so it's OFF until `OTO_ENABLED=1`
 * is set (test it in Stripe test mode first, then flip it on live).
 */
export const OTO = {
  enabled: process.env.OTO_ENABLED === "1",
  courseSlug: process.env.OTO_COURSE_SLUG || "ai-goldmining-method",
  discountPercent: Math.min(95, Math.max(1, Number(process.env.OTO_DISCOUNT_PERCENT || 50))),
} as const;

/** Discounted OTO price for a given full price, in cents. */
export function otoPriceCents(fullPriceCents: number): number {
  return Math.round(fullPriceCents * (1 - OTO.discountPercent / 100));
}
