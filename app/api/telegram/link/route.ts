import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTelegramSubscription } from "@/lib/telegram";
import { buildTelegramBotLink, isTelegramBotConfigured } from "@/lib/telegram-bot";

export async function GET() {
  if (!isTelegramBotConfigured()) {
    return NextResponse.json({ configured: false });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Auth nicht verfügbar." }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Bitte einloggen." }, { status: 401 });
  }

  const sub = await getTelegramSubscription(supabase, user.id);
  if (!sub?.active) {
    return NextResponse.json({ message: "Kein aktives VIP-Abo." }, { status: 403 });
  }

  const url = buildTelegramBotLink(user.id);
  if (!url) {
    return NextResponse.json({ message: "Bot-Link konnte nicht erstellt werden." }, { status: 500 });
  }

  return NextResponse.json({
    configured: true,
    url,
    linked: Boolean(sub.telegramUserId),
    telegramUsername: sub.telegramUsername,
  });
}
