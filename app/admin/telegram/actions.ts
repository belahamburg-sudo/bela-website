"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext, logAudit } from "@/lib/admin";
import { absoluteUrl } from "@/lib/utils";
import { setTelegramWebhook, getTelegramWebhookInfo } from "@/lib/telegram-bot";

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

/** Manually override the Telegram subscription status for a user. */
export async function updateTelegramStatus(input: {
  userId: string;
  status: "active" | "inactive";
}): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;

  if (!input.userId) return { ok: false, error: "Keine Benutzer-ID angegeben" };

  const { error } = await supabase
    .from("telegram_subscriptions")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("user_id", input.userId);

  if (error) return { ok: false, error: error.message };

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
