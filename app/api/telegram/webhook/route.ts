import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { verifyTelegramLinkToken, sendTelegramMessage, safeBanTelegramMember } from "@/lib/telegram-bot";
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
