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
