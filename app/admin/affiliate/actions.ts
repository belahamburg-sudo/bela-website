"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext, logAudit } from "@/lib/admin";
import { createPayoutTransfer } from "@/lib/stripe-connect";
import { absoluteUrl } from "@/lib/utils";

type ActionResult = { ok: boolean; error?: string };

/** Normalises an admin-supplied custom code: uppercased, only A-Z/0-9. */
function normalizeCustomCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Default friend-discount applied to a new affiliate's referral code. */
const DEFAULT_FRIEND_DISCOUNT = 20;

/**
 * Generates an uppercase referral code from the email prefix plus 4 random
 * base36 characters. Guaranteed to contain at least one letter (never
 * numeric-only) so it can't collide with order numbers etc.
 */
function generateCode(email: string): string {
  const prefix = (email.split("@")[0] ?? "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);
  const base = prefix || "AFF";
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  let code = `${base}${rand}`;
  // Ensure not numeric-only.
  if (!/[A-Z]/.test(code)) code = `A${code}`;
  return code;
}

/** Creates an affiliate from a registered customer's email address. */
export async function createAffiliate(input: {
  email: string;
  customCode?: string;
  rewardType?: string;
  cashPercent: number;
  fixedCashCents?: number;
  selfDiscountPercent: number;
  canIssueCoupons: boolean;
}): Promise<ActionResult> {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!email) return { ok: false, error: "Keine E-Mail angegeben." };

  const rewardType = input.rewardType ?? "percent_cash";
  const cashPercent = input.cashPercent ?? 0;
  const fixedCashCents = input.fixedCashCents ?? 0;

  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;

  // Look up the profile by email → user_id.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle();

  if (!profile?.id) {
    return { ok: false, error: "Kein Kunde mit dieser E-Mail gefunden." };
  }
  const userId = profile.id as string;

  // Already an affiliate?
  const { data: existing } = await supabase
    .from("affiliates")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "Dieser Kunde ist bereits Affiliate." };
  }

  // Resolve the code: custom (validated unique) or auto-generated.
  let code: string;
  const customCode = normalizeCustomCode(input.customCode ?? "");
  if (customCode) {
    if (customCode.length < 3) {
      return { ok: false, error: "Eigener Code muss mindestens 3 Zeichen haben." };
    }
    const { data: codeTaken } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("code", customCode)
      .maybeSingle();
    if (codeTaken) {
      return { ok: false, error: "Dieser Code ist bereits vergeben." };
    }
    code = customCode;
  } else {
    code = generateCode(email);
  }

  // Upsert the affiliate referral code.
  const { error: codeError } = await supabase.from("referral_codes").upsert(
    {
      code,
      user_id: userId,
      kind: "affiliate",
      discount_percent: DEFAULT_FRIEND_DISCOUNT,
      commission_percent: cashPercent,
      is_active: true,
    },
    { onConflict: "code" }
  );
  if (codeError) return { ok: false, error: codeError.message };

  // Insert the affiliate row.
  const { error: affError } = await supabase.from("affiliates").insert({
    user_id: userId,
    code,
    status: "active",
    reward_type: rewardType,
    cash_percent: cashPercent,
    fixed_cash_cents: fixedCashCents,
    self_discount_percent: input.selfDiscountPercent,
    can_issue_coupons: input.canIssueCoupons,
  });
  if (affError) return { ok: false, error: affError.message };

  await logAudit({
    actorEmail: user.email,
    action: "affiliate.create",
    entity: "affiliates",
    entityId: userId,
    meta: {
      email,
      code,
      rewardType,
      cashPercent,
      fixedCashCents,
      selfDiscountPercent: input.selfDiscountPercent,
      canIssueCoupons: input.canIssueCoupons,
      link: absoluteUrl(`/signup?ref=${code}`),
    },
  });

  revalidatePath("/admin/affiliate");
  return { ok: true };
}

/** Updates the reward configuration / status of an existing affiliate. */
export async function updateAffiliate(input: {
  userId: string;
  cashPercent?: number;
  fixedCashCents?: number;
  selfDiscountPercent?: number;
  canIssueCoupons?: boolean;
  status?: string;
  rewardType?: string;
  tierId?: string | null;
  notes?: string | null;
}): Promise<ActionResult> {
  if (!input.userId) return { ok: false, error: "Kein Affiliate angegeben." };

  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.cashPercent !== undefined) patch.cash_percent = input.cashPercent;
  if (input.fixedCashCents !== undefined) patch.fixed_cash_cents = input.fixedCashCents;
  if (input.selfDiscountPercent !== undefined)
    patch.self_discount_percent = input.selfDiscountPercent;
  if (input.canIssueCoupons !== undefined) patch.can_issue_coupons = input.canIssueCoupons;
  if (input.status !== undefined) patch.status = input.status;
  if (input.rewardType !== undefined) patch.reward_type = input.rewardType;
  if (input.tierId !== undefined) patch.tier_id = input.tierId;
  if (input.notes !== undefined) patch.notes = input.notes;

  const { error } = await supabase
    .from("affiliates")
    .update(patch)
    .eq("user_id", input.userId);
  if (error) return { ok: false, error: error.message };

  // Keep the referral code's commission in sync with the cash percentage.
  if (input.cashPercent !== undefined) {
    await supabase
      .from("referral_codes")
      .update({ commission_percent: input.cashPercent })
      .eq("user_id", input.userId)
      .eq("kind", "affiliate");
  }

  await logAudit({
    actorEmail: user.email,
    action: "affiliate.update",
    entity: "affiliates",
    entityId: input.userId,
    meta: patch,
  });

  revalidatePath("/admin/affiliate");
  return { ok: true };
}

/**
 * Deletes an affiliate. Removes the affiliates row but only deactivates the
 * linked affiliate referral code (kind='affiliate') instead of hard-deleting
 * it, so historical referrals keep their foreign-key reference intact.
 */
export async function deleteAffiliate(input: {
  userId: string;
}): Promise<ActionResult> {
  if (!input.userId) return { ok: false, error: "Kein Affiliate angegeben." };

  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;

  // Deactivate the affiliate's referral code(s) — keep the row for FK integrity.
  const { error: codeError } = await supabase
    .from("referral_codes")
    .update({ is_active: false })
    .eq("user_id", input.userId)
    .eq("kind", "affiliate");
  if (codeError) return { ok: false, error: codeError.message };

  // Delete the affiliate row itself.
  const { error: delError } = await supabase
    .from("affiliates")
    .delete()
    .eq("user_id", input.userId);
  if (delError) return { ok: false, error: delError.message };

  await logAudit({
    actorEmail: user.email,
    action: "affiliate.delete",
    entity: "affiliates",
    entityId: input.userId,
    meta: { userId: input.userId },
  });

  revalidatePath("/admin/affiliate");
  return { ok: true };
}

/** Records a payout (Stripe transfer or manual) and decrements the balance. */
export async function createPayout(input: {
  userId: string;
  amountCents: number;
  method: "stripe" | "manual";
}): Promise<ActionResult> {
  if (!input.userId) return { ok: false, error: "Kein Affiliate angegeben." };
  if (!input.amountCents || input.amountCents <= 0)
    return { ok: false, error: "Betrag muss positiv sein." };

  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;

  // Load current balance + stripe account.
  const { data: aff, error: loadError } = await supabase
    .from("affiliates")
    .select("balance_cents, stripe_account_id")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (loadError) return { ok: false, error: loadError.message };
  if (!aff) return { ok: false, error: "Affiliate nicht gefunden." };

  const balance = (aff.balance_cents as number) ?? 0;
  if (input.amountCents > balance) {
    return { ok: false, error: "Betrag übersteigt das verfügbare Guthaben." };
  }

  const now = new Date().toISOString();
  let stripeTransferId: string | null = null;

  if (input.method === "stripe") {
    const accountId = aff.stripe_account_id as string | null;
    if (!accountId) {
      return { ok: false, error: "Kein verbundenes Stripe-Konto vorhanden." };
    }
    const transfer = await createPayoutTransfer(accountId, input.amountCents);
    if (!transfer.ok) {
      return { ok: false, error: transfer.error ?? "Stripe-Auszahlung fehlgeschlagen." };
    }
    stripeTransferId = transfer.transferId ?? null;
  }

  // Record the payout.
  const { data: payout, error: insertError } = await supabase
    .from("affiliate_payouts")
    .insert({
      affiliate_user_id: input.userId,
      amount_cents: input.amountCents,
      status: "paid",
      method: input.method,
      stripe_transfer_id: stripeTransferId,
      paid_at: now,
    })
    .select("id")
    .single();
  if (insertError) return { ok: false, error: insertError.message };

  // Decrement the balance.
  const { error: balError } = await supabase
    .from("affiliates")
    .update({ balance_cents: balance - input.amountCents, updated_at: now })
    .eq("user_id", input.userId);
  if (balError) return { ok: false, error: balError.message };

  await logAudit({
    actorEmail: user.email,
    action: "affiliate.payout",
    entity: "affiliate_payouts",
    entityId: payout?.id ?? null,
    meta: {
      userId: input.userId,
      amountCents: input.amountCents,
      method: input.method,
      stripeTransferId,
    },
  });

  revalidatePath("/admin/affiliate");
  return { ok: true };
}

/** Issues a shareable discount code (coupon) for an affiliate to give out. */
export async function issueCoupon(input: {
  userId: string;
  percentOff: number;
  code: string;
}): Promise<ActionResult> {
  if (!input.userId) return { ok: false, error: "Kein Affiliate angegeben." };
  const code = (input.code ?? "").trim().toUpperCase();
  if (!code) return { ok: false, error: "Kein Code angegeben." };
  if (!input.percentOff || input.percentOff <= 0 || input.percentOff > 100)
    return { ok: false, error: "Rabatt muss zwischen 1 und 100 % liegen." };

  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;

  // Code must be unique.
  const { data: existing } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("code", code)
    .maybeSingle();
  if (existing) return { ok: false, error: "Dieser Code ist bereits vergeben." };

  // Use the affiliate's own cash percentage as the commission.
  const { data: aff } = await supabase
    .from("affiliates")
    .select("cash_percent")
    .eq("user_id", input.userId)
    .maybeSingle();
  const commission = (aff?.cash_percent as number) ?? 0;

  const { error } = await supabase.from("referral_codes").insert({
    code,
    user_id: input.userId,
    kind: "affiliate",
    discount_percent: input.percentOff,
    commission_percent: commission,
    is_active: true,
  });
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "affiliate.issue_coupon",
    entity: "referral_codes",
    entityId: code,
    meta: { userId: input.userId, percentOff: input.percentOff, commission },
  });

  revalidatePath("/admin/affiliate");
  return { ok: true };
}
