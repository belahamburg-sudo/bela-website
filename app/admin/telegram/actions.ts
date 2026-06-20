"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext, logAudit } from "@/lib/admin";
import { absoluteUrl } from "@/lib/utils";
import { getStripeClient } from "@/lib/stripe";
import {
  setTelegramWebhook,
  getTelegramWebhookInfo,
  safeBanTelegramMember,
  unbanTelegramMember,
} from "@/lib/telegram-bot";

type ActionResult = { ok: boolean; error?: string };

/** Register the production webhook with Telegram so the bot receives updates. */
export async function registerTelegramWebhook(): Promise<{ ok: boolean; error?: string; info?: string }> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN ist in den Env-Variablen nicht gesetzt." };
  }

  const url = absoluteUrl("/api/telegram/webhook");
  const ok = await setTelegramWebhook(url, process.env.TELEGRAM_WEBHOOK_SECRET);
  const info = await getTelegramWebhookInfo();

  await logAudit({
    actorEmail: ctx.user.email,
    action: "telegram.set_webhook",
    entity: "telegram",
    meta: { url, ok },
  });

  if (!ok) return { ok: false, error: "setWebhook fehlgeschlagen — ist der Bot-Token korrekt?" };
  return {
    ok: true,
    info: info?.url
      ? `Webhook aktiv: ${info.url}${info.last_error_message ? ` · letzter Fehler: ${info.last_error_message}` : ""}`
      : "Webhook gesetzt.",
  };
}

/**
 * Toggle ONLY the VIP access — no money involved.
 *  - "inactive" (Pausieren/Aussperren): flag off + ban from the VIP group.
 *  - "active"   (Reaktivieren): flag on + unban so they can rejoin.
 * Stripe billing is intentionally NOT touched here (use refund for that).
 */
export async function updateTelegramStatus(input: {
  userId: string;
  status: "active" | "inactive";
}): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;

  if (!input.userId) return { ok: false, error: "Keine Benutzer-ID angegeben" };

  const { data: sub } = await supabase
    .from("telegram_subscriptions")
    .select("telegram_user_id")
    .eq("user_id", input.userId)
    .maybeSingle();

  const { error } = await supabase
    .from("telegram_subscriptions")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("user_id", input.userId);

  if (error) return { ok: false, error: error.message };

  // Enforce group access (best-effort — never blocks the status change).
  const tgId = (sub as { telegram_user_id: number | null } | null)?.telegram_user_id;
  if (tgId) {
    try {
      if (input.status === "active") await unbanTelegramMember(Number(tgId));
      else await safeBanTelegramMember(Number(tgId));
    } catch {
      /* ignore */
    }
  }

  await logAudit({
    actorEmail: user.email,
    action: "telegram.status",
    entity: "telegram_subscription",
    entityId: input.userId,
    meta: { status: input.status },
  });

  revalidatePath("/admin/telegram");
  return { ok: true };
}

/**
 * Refund the member's latest VIP payment, cancel the Stripe subscription, and
 * remove access (ban + flag off). This is the ONLY action that moves money.
 */
export async function refundTelegramSubscription(input: { userId: string }): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;
  if (!input.userId) return { ok: false, error: "Keine Benutzer-ID angegeben" };

  const { data: sub } = await supabase
    .from("telegram_subscriptions")
    .select("stripe_subscription_id, stripe_customer_id, telegram_user_id")
    .eq("user_id", input.userId)
    .maybeSingle();

  const row = sub as
    | { stripe_subscription_id: string | null; stripe_customer_id: string | null; telegram_user_id: number | null }
    | null;
  if (!row?.stripe_subscription_id && !row?.stripe_customer_id) {
    return { ok: false, error: "Kein Stripe-Abo für diesen Nutzer gefunden." };
  }

  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe ist nicht konfiguriert." };

  let refunded = false;
  // Refund the latest refundable charge that belongs to THIS VIP subscription
  // (not e.g. a course purchase on the same Stripe customer).
  try {
    let customerId = row.stripe_customer_id;
    if (!customerId && row.stripe_subscription_id) {
      const s = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
      customerId = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;
    }
    if (customerId) {
      const charges = await stripe.charges.list({ customer: customerId, limit: 10 });
      for (const c of charges.data) {
        if (!c.paid || c.refunded || c.amount_refunded >= c.amount) continue;
        const invId = typeof c.invoice === "string" ? c.invoice : c.invoice?.id ?? null;
        if (row.stripe_subscription_id && invId) {
          const inv = await stripe.invoices.retrieve(invId);
          const invSub = (inv as unknown as { subscription?: string | { id: string } | null }).subscription;
          const invSubId = typeof invSub === "string" ? invSub : invSub?.id ?? null;
          if (invSubId !== row.stripe_subscription_id) continue;
        } else if (row.stripe_subscription_id && !invId) {
          continue; // can't tie to the subscription → skip to be safe
        }
        await stripe.refunds.create({ charge: c.id });
        refunded = true;
        break;
      }
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Rückerstattung fehlgeschlagen." };
  }

  // Cancel the subscription so billing stops (tolerate an already-cancelled sub).
  if (row.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(row.stripe_subscription_id);
    } catch {
      /* already cancelled — ignore */
    }
  }

  // Remove access.
  await supabase
    .from("telegram_subscriptions")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("user_id", input.userId);
  if (row.telegram_user_id) {
    try {
      await safeBanTelegramMember(Number(row.telegram_user_id));
    } catch {
      /* ignore */
    }
  }

  await logAudit({
    actorEmail: user.email,
    action: "telegram.refund",
    entity: "telegram_subscription",
    entityId: input.userId,
    meta: { refunded },
  });

  revalidatePath("/admin/telegram");
  return { ok: refunded ? true : false, error: refunded ? undefined : "Abo gekündigt & Zugang entzogen, aber keine erstattbare Zahlung gefunden." };
}
