import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import {
  verifyTelegramLinkToken,
  sendTelegramMessage,
  safeBanTelegramMember,
  createSingleUseInviteLink,
  buildTelegramBotLink,
} from "@/lib/telegram-bot";
import {
  handleJoinRequest,
  handleTelegramLinkStart,
  isTelegramUserAllowed,
} from "@/lib/telegram-access";

type TelegramUpdate = {
  update_id: number;
  message?: {
    from?: { id: number; username?: string };
    chat: { id: number };
    text?: string;
  };
  chat_join_request?: {
    chat: { id: number };
    from: { id: number; username?: string };
  };
  chat_member?: {
    chat: { id: number };
    from: { id: number };
    new_chat_member: { status: string; user: { id: number } };
  };
};

import type { SupabaseClient } from "@supabase/supabase-js";
import { absoluteUrl } from "@/lib/utils";

async function handlePlainStart(
  supabase: SupabaseClient,
  telegramUserId: number,
  telegramUsername: string | null
) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://aigoldmining.com").replace(/\/$/, "");

  // 1. Check if this Telegram user is already linked to an account.
  const { data: sub } = await supabase
    .from("telegram_subscriptions")
    .select("user_id, status, telegram_user_id")
    .eq("telegram_user_id", telegramUserId)
    .maybeSingle();

  if (sub) {
    const active = ["active", "trialing"].includes(sub.status as string);
    if (active) {
      // Already linked + active: give them an invite link directly.
      if (telegramUsername) {
        await supabase
          .from("telegram_subscriptions")
          .update({ telegram_username: telegramUsername, updated_at: new Date().toISOString() })
          .eq("user_id", sub.user_id);
      }
      const invite = await createSingleUseInviteLink();
      if (invite) {
        await sendTelegramMessage(
          telegramUserId,
          `Willkommen zurück! 🎉\n\nDein VIP-Zugang ist aktiv. Tritt hier der Gruppe bei:\n${invite}\n\nDer Link ist 1 Stunde gültig und nur für dich.`
        );
      } else {
        await sendTelegramMessage(
          telegramUserId,
          `Dein VIP-Zugang ist aktiv! ✅\n\nDer Einladungslink konnte gerade nicht erstellt werden. Stelle einen Beitrittsantrag in der VIP-Gruppe — dein Zugang wird automatisch freigegeben.`
        );
      }
      return;
    } else {
      // Linked but inactive (cancelled/expired).
      await sendTelegramMessage(
        telegramUserId,
        `Hey! Dein VIP-Abo ist leider nicht mehr aktiv.\n\nHier kannst du es erneuern:\n${siteUrl}/vip`
      );
      return;
    }
  }

  // 2. Not linked — check if there's an active subscription WITHOUT a telegram_user_id
  //    that belongs to someone. We can't auto-link without the website flow (security),
  //    but we can give them a more helpful message.
  await sendTelegramMessage(
    telegramUserId,
    `Willkommen bei AI Goldmining! 👋\n\nUm der VIP-Gruppe beizutreten:\n\n` +
    `1️⃣ Einloggen auf ${siteUrl}/vip\n` +
    `2️⃣ Klick auf „Telegram verbinden"\n` +
    `3️⃣ Du wirst hierher zurückgeleitet und bekommst sofort deinen Einladungslink\n\n` +
    `Noch kein VIP-Abo? → ${siteUrl}/vip`
  );
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // No secret configured = anyone who knows the URL can POST forged updates.
    // Telegram lets you set this when registering the webhook (secret_token).
    console.warn(
      "[telegram] TELEGRAM_WEBHOOK_SECRET is not set — webhook updates are NOT authenticated. Set it and re-register the webhook with secret_token."
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  try {
    if (update.chat_join_request?.from) {
      await handleJoinRequest(supabase, update.chat_join_request.from.id);
    }

    const text = update.message?.text?.trim();
    const from = update.message?.from;
    if (text?.startsWith("/start") && from) {
      const payload = text.split(/\s+/)[1] ?? "";
      if (payload.startsWith("link_")) {
        const userId = verifyTelegramLinkToken(payload.slice(5));
        if (!userId) {
          await sendTelegramMessage(
            from.id,
            "Der Verknüpfungslink ist ungültig oder abgelaufen. Bitte hole dir einen neuen Link im Member-Bereich."
          );
        } else {
          const reply = await handleTelegramLinkStart(
            supabase,
            userId,
            from.id,
            from.username ?? null
          );
          await sendTelegramMessage(from.id, reply);
        }
      } else {
        await handlePlainStart(supabase, from.id, from.username ?? null);
      }
    }

    const member = update.chat_member;
    if (
      member &&
      member.new_chat_member.status === "member" &&
      process.env.TELEGRAM_PAID_CHAT_ID &&
      String(member.chat.id) === process.env.TELEGRAM_PAID_CHAT_ID
    ) {
      const newMemberId = member.new_chat_member.user.id;
      const allowed = await isTelegramUserAllowed(supabase, newMemberId);
      if (!allowed) {
        await safeBanTelegramMember(newMemberId);
      }
    }
  } catch (error) {
    console.error("Telegram webhook error:", error instanceof Error ? error.message : error);
  }

  return NextResponse.json({ ok: true });
}
