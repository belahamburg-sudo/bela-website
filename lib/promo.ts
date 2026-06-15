import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";

export type ResolvedPromo = {
  code: string;
  percentOff: number | null;
  amountOff: number | null;
  promotionCodeId?: string;
  source: "stripe" | "config";
};

function parseConfiguredPromos(): Map<string, number> {
  const map = new Map<string, number>();
  const raw = process.env.CHECKOUT_PROMO_CODES ?? "GOLDMININGX10:10";
  for (const part of raw.split(",")) {
    const [code, percentRaw] = part.trim().split(":");
    const percent = Number(percentRaw);
    if (code && Number.isFinite(percent) && percent > 0) {
      map.set(code.trim().toUpperCase(), percent);
    }
  }
  return map;
}

async function couponDiscount(
  stripe: Stripe,
  couponRef: string | Stripe.Coupon
): Promise<{ percentOff: number | null; amountOff: number | null }> {
  const coupon =
    typeof couponRef === "string"
      ? await stripe.coupons.retrieve(couponRef)
      : couponRef;
  return {
    percentOff: coupon.percent_off ?? null,
    amountOff: coupon.amount_off ?? null,
  };
}

/** Resolve a customer-facing promo code via Stripe or server config fallback. */
export async function resolvePromoCode(rawCode: string): Promise<ResolvedPromo | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  const stripe = getStripeClient();
  if (stripe) {
    try {
      const listed = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
      if (listed.data[0]) {
        const promo = listed.data[0];
        const discount = await couponDiscount(stripe, promo.coupon);
        return {
          code,
          percentOff: discount.percentOff,
          amountOff: discount.amountOff,
          promotionCodeId: promo.id,
          source: "stripe",
        };
      }

      // Case-insensitive fallback scan.
      const batch = await stripe.promotionCodes.list({ active: true, limit: 100 });
      const match = batch.data.find((p) => p.code?.toUpperCase() === code);
      if (match) {
        const discount = await couponDiscount(stripe, match.coupon);
        return {
          code,
          percentOff: discount.percentOff,
          amountOff: discount.amountOff,
          promotionCodeId: match.id,
          source: "stripe",
        };
      }
    } catch {
      // fall through to configured promos
    }
  }

  const configured = parseConfiguredPromos();
  const percent = configured.get(code);
  if (percent) {
    return { code, percentOff: percent, amountOff: null, source: "config" };
  }

  return null;
}

export function calculateDiscountCents(
  amountCents: number,
  promo: Pick<ResolvedPromo, "percentOff" | "amountOff">
): number {
  if (promo.percentOff) {
    return Math.round((amountCents * promo.percentOff) / 100);
  }
  if (promo.amountOff) {
    return Math.min(amountCents, promo.amountOff);
  }
  return 0;
}

export async function buildCheckoutDiscount(
  stripe: Stripe,
  promo: ResolvedPromo
): Promise<Stripe.Checkout.SessionCreateParams.Discount[]> {
  if (promo.promotionCodeId) {
    return [{ promotion_code: promo.promotionCodeId }];
  }

  const coupon = await stripe.coupons.create({
    ...(promo.percentOff ? { percent_off: promo.percentOff } : {}),
    ...(promo.amountOff ? { amount_off: promo.amountOff, currency: "eur" } : {}),
    duration: "once",
    name: `Promo ${promo.code}`,
    max_redemptions: 1,
  });

  return [{ coupon: coupon.id }];
}
