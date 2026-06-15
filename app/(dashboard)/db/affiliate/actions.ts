"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getAffiliateForUser, type Affiliate } from "@/lib/affiliate";
import {
  createConnectAccount,
  createOnboardingLink,
} from "@/lib/stripe-connect";

type ActionResult = { ok: boolean; error?: string; url?: string };

/**
 * Resolve the signed-in user and verify they actually have an affiliates row.
 * Everything in this file is gated behind this — no affiliate row, no actions.
 */
async function requireAffiliate(): Promise<
  | { ok: true; userId: string; email: string | null; affiliate: Affiliate }
  | { ok: false; error: string }
> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Nicht verfügbar." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };

  const affiliate = await getAffiliateForUser(user.id);
  if (!affiliate) return { ok: false, error: "Kein Affiliate-Zugang." };

  return { ok: true, userId: user.id, email: user.email ?? null, affiliate };
}

/**
 * Ensure the affiliate has a Stripe Connect account and hand back a hosted
 * onboarding link. Creates the account lazily on first call and persists its id.
 */
export async function startStripeOnboarding(): Promise<ActionResult> {
  const ctx = await requireAffiliate();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service nicht verfügbar." };

  let accountId = ctx.affiliate.stripeAccountId;

  if (!accountId) {
    accountId = await createConnectAccount(ctx.email);
    if (!accountId) {
      return { ok: false, error: "Stripe-Konto konnte nicht erstellt werden." };
    }
    const { error } = await admin
      .from("affiliates")
      .update({ stripe_account_id: accountId })
      .eq("user_id", ctx.userId);
    if (error) return { ok: false, error: "Konto konnte nicht gespeichert werden." };
  }

  const url = await createOnboardingLink(accountId);
  if (!url) return { ok: false, error: "Onboarding-Link konnte nicht erstellt werden." };

  return { ok: true, url };
}

/**
 * Request a payout of the affiliate's full current balance. Creates a pending
 * affiliate_payouts row; an admin approves and sends the transfer later.
 */
export async function requestPayout(): Promise<ActionResult> {
  const ctx = await requireAffiliate();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const amountCents = ctx.affiliate.balanceCents;
  if (amountCents <= 0) {
    return { ok: false, error: "Kein auszahlbares Guthaben." };
  }
  if (!ctx.affiliate.stripeOnboarded) {
    return { ok: false, error: "Bitte richte zuerst deine Auszahlungen ein." };
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service nicht verfügbar." };

  const { error } = await admin.from("affiliate_payouts").insert({
    affiliate_user_id: ctx.userId,
    amount_cents: amountCents,
    status: "pending",
    method: "stripe",
  });
  if (error) return { ok: false, error: "Auszahlung konnte nicht angefordert werden." };

  revalidatePath("/db/affiliate");
  return { ok: true };
}
