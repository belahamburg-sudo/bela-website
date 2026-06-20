import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripeClient } from "./stripe";

/**
 * Create (or refresh) a real Stripe coupon + promotion code for an affiliate
 * referral code and store the Stripe IDs on the referral_codes row.
 *
 * This is what makes a code like "ELMO" work as a typed discount at checkout:
 * the persistent promotion code is applied via { promotion_code } and is also
 * recognised by Stripe's own hosted promo-code field.
 *
 * Best-effort by design: returns silently when Stripe isn't configured or the
 * percentage is out of range, and callers wrap it so a Stripe hiccup never
 * blocks affiliate creation. A coupon's percent_off is immutable, so a changed
 * discount retires the old promotion code and mints a fresh coupon + code.
 */
export async function ensureAffiliateStripeCode(
  supabase: SupabaseClient,
  code: string,
  percentOff: number
): Promise<{ couponId: string; promotionCodeId: string } | null> {
  const stripe = getStripeClient();
  if (!stripe) return null;
  if (!code || !(percentOff > 0) || percentOff > 100) return null;

  // Retire a previous promotion code so the same human code can be re-issued
  // (Stripe requires the code to be unique among ACTIVE promotion codes).
  const { data: row } = await supabase
    .from("referral_codes")
    .select("stripe_promotion_code_id")
    .eq("code", code)
    .maybeSingle();
  const oldPromo = (row?.stripe_promotion_code_id as string | null | undefined) ?? null;
  if (oldPromo) {
    try {
      await stripe.promotionCodes.update(oldPromo, { active: false });
    } catch {
      // already deleted / inactive — ignore
    }
  }

  const coupon = await stripe.coupons.create({
    percent_off: percentOff,
    duration: "once",
    name: `Affiliate ${code} (${percentOff}%)`,
  });
  const promo = await stripe.promotionCodes.create({ coupon: coupon.id, code });

  await supabase
    .from("referral_codes")
    .update({ stripe_coupon_id: coupon.id, stripe_promotion_code_id: promo.id })
    .eq("code", code);

  return { couponId: coupon.id, promotionCodeId: promo.id };
}
