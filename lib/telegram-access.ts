import type { SupabaseClient } from "@supabase/supabase-js";
import {
  approveJoinRequest,
  createSingleUseInviteLink,
  declineJoinRequest,
  getChatMemberStatus,
  isTelegramBotConfigured,
  isTelegramUserProtected,
  safeBanTelegramMember,
  sendTelegramMessage,
  unbanTelegramMember,
} from "./telegram-bot";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export async function isTelegramUserAllowed(
  supabase: SupabaseClient,
  telegramUserId: number
): Promise<boolean> {
  const { data } = await supabase
    .from("telegram_subscriptions")
    .select("status")
    .eq("telegram_user_id", telegramUserId)
    .maybeSingle();

  return Boolean(data && ACTIVE_STATUSES.has(data.status));
}

export async function linkTelegramUser(
  supabase: SupabaseClient,
  userId: string,
  telegramUserId: number,
  telegramUsername: string | null
) {
  const { error } = await supabase
    .from("telegram_subscriptions")
    .update({
      telegram_user_id: telegramUserId,
      telegram_username: telegramUsername,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return !error;
}

export async function enforceTelegramAccessForSubscription(
  supabase: SupabaseClient,
  stripeSubscriptionId: string,
  status: string
) {
  if (!isTelegramBotConfigured()) return;

  const { data } = await supabase
    .from("telegram_subscriptions")
    .select("telegram_user_id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  const telegramUserId = data?.telegram_user_id;
  if (!telegramUserId) return;

  if (ACTIVE_STATUSES.has(status)) {
    await unbanTelegramMember(Number(telegramUserId));
    return;
  }

  if (await isTelegramUserProtected(Number(telegramUserId))) return;

  const memberStatus = await getChatMemberStatus(Number(telegramUserId));
  if (memberStatus && !["left", "kicked"].includes(memberStatus)) {
    await safeBanTelegramMember(Number(telegramUserId));
  }
}

export async function handleJoinRequest(
  supabase: SupabaseClient,
  telegramUserId: number
): Promise<void> {
  if (await isTelegramUserProtected(telegramUserId)) {
    await approveJoinRequest(telegramUserId);
    return;
  }

  const allowed = await isTelegramUserAllowed(supabase, telegramUserId);
  if (allowed) {
    await approveJoinRequest(telegramUserId);
    return;
  }

  await declineJoinRequest(telegramUserId);
  await sendTelegramMessage(
    telegramUserId,
    "Dein VIP-Zugang ist nicht aktiv. Bitte verbinde zuerst dein Konto im Member-Bereich und stelle sicher, dass dein Abo läuft."
  );
}

export async function handleTelegramLinkStart(
  supabase: SupabaseClient,
  userId: string,
  telegramUserId: number,
  telegramUsername: string | null
): Promise<string> {
  const { data: sub } = await supabase
    .from("telegram_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!sub || !ACTIVE_STATUSES.has(sub.status)) {
    return "Dein VIP-Abo ist nicht aktiv. Bitte schließe zuerst eine Mitgliedschaft ab.";
  }

  await linkTelegramUser(supabase, userId, telegramUserId, telegramUsername);
  await unbanTelegramMember(telegramUserId);

  const invite = await createSingleUseInviteLink();
  if (invite) {
    return `Verbunden! Tritt der VIP-Gruppe bei:\n${invite}\n\nDer Link ist 1 Stunde gültig und nur für dich.`;
  }

  const paidUrl = process.env.NEXT_PUBLIC_TELEGRAM_PAID_URL || "";
  return paidUrl
    ? `Verbunden! ✅ Tritt der VIP-Gruppe hier bei:\n${paidUrl}`
    : "Verbunden! ✅ Tritt jetzt der VIP-Gruppe bei — dein Zugang wird automatisch freigegeben.";
}
