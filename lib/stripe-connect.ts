import { getStripeClient } from "./stripe";
import { absoluteUrl } from "./utils";

/**
 * Stripe Connect scaffold for affiliate payouts. Express accounts let affiliates
 * onboard (KYC) themselves; transfers move their commission balance to them.
 * This is intentionally minimal — enough to onboard + pay out — and degrades to
 * null when Stripe is not configured.
 */

/** Create an Express connected account for an affiliate. */
export async function createConnectAccount(
  email: string | null
): Promise<{ ok: boolean; accountId?: string; error?: string }> {
  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe nicht konfiguriert." };
  try {
    const account = await stripe.accounts.create({
      type: "express",
      email: email ?? undefined,
      // transfers = receive payouts. card_payments is requested alongside it
      // because Stripe gates "transfers without card_payments" behind a special
      // platform approval; requesting both is the standard Express setup and
      // works without that approval. (Verified live against the platform.)
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: "individual",
      metadata: { purpose: "aigoldmining_affiliate" },
    });
    return { ok: true, accountId: account.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Stripe-Konto konnte nicht erstellt werden.",
    };
  }
}

/** Hosted onboarding link the affiliate visits to finish KYC. */
export async function createOnboardingLink(
  accountId: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe nicht konfiguriert." };
  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: absoluteUrl("/db/affiliate?stripe=refresh"),
      return_url: absoluteUrl("/db/affiliate?stripe=done"),
      type: "account_onboarding",
    });
    return { ok: true, url: link.url };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Onboarding-Link konnte nicht erstellt werden.",
    };
  }
}

/** Whether the connected account has finished onboarding (payouts enabled). */
export async function isAccountOnboarded(accountId: string): Promise<boolean> {
  const stripe = getStripeClient();
  if (!stripe) return false;
  try {
    const acct = await stripe.accounts.retrieve(accountId);
    return Boolean(acct.payouts_enabled && acct.charges_enabled);
  } catch {
    return false;
  }
}

/** Transfer a commission payout (in cents) to a connected account. */
export async function createPayoutTransfer(
  accountId: string,
  amountCents: number
): Promise<{ ok: boolean; transferId?: string; error?: string }> {
  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe nicht konfiguriert." };
  if (amountCents <= 0) return { ok: false, error: "Betrag muss positiv sein." };
  try {
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: "eur",
      destination: accountId,
      metadata: { purpose: "aigoldmining_affiliate_payout" },
    });
    return { ok: true, transferId: transfer.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Transfer fehlgeschlagen." };
  }
}
