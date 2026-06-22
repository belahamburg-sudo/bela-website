import crypto from "crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PAID_CHAT_ID = process.env.TELEGRAM_PAID_CHAT_ID;
// Never fall back to a well-known literal secret in production — that would make
// link tokens forgeable. Prefer the dedicated secret, else the bot token; only
// use a static dev secret outside production. verify/build fail safe if empty.
const LINK_SECRET =
  process.env.TELEGRAM_LINK_SECRET ||
  process.env.TELEGRAM_BOT_TOKEN ||
  (process.env.NODE_ENV === "production" ? "" : "dev-link-secret");

type TelegramApiResult<T> = { ok: true; result: T } | { ok: false; description?: string };

async function telegramApi<T>(
  method: string,
  body: Record<string, unknown> = {}
): Promise<T | null> {
  if (!BOT_TOKEN) return null;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as TelegramApiResult<T>;
    if (!data.ok) {
      console.error(`Telegram ${method} failed:`, "description" in data ? data.description : data);
      return null;
    }
    return data.result;
  } catch (error) {
    console.error(`Telegram ${method} error:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export function isTelegramBotConfigured(): boolean {
  return Boolean(BOT_TOKEN && PAID_CHAT_ID);
}

export function getTelegramBotUsername(): string | null {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace("@", "") ?? null;
}

export function createTelegramLinkToken(userId: string): string {
  const sig = crypto
    .createHmac("sha256", LINK_SECRET)
    .update(userId)
    .digest("base64url")
    .slice(0, 20);
  // Telegram ?start= only allows A-Z a-z 0-9 _ - (no dots).
  // UUID is always 36 chars, so we split at fixed position on verify.
  return `${userId}--${sig}`;
}

export function verifyTelegramLinkToken(token: string): string | null {
  if (!LINK_SECRET) return null;
  // UUID is exactly 36 chars, followed by "--" (2 chars), then the 20-char sig.
  if (token.length !== 58) return null;
  const userId = token.slice(0, 36);
  const sig = token.slice(38);
  const expected = crypto
    .createHmac("sha256", LINK_SECRET)
    .update(userId)
    .digest("base64url")
    .slice(0, 20);
  if (sig !== expected) return null;
  return userId;
}

export function buildTelegramBotLink(userId: string): string | null {
  if (!LINK_SECRET) return null;
  const username = getTelegramBotUsername();
  if (!username) return null;
  const token = createTelegramLinkToken(userId);
  return `https://t.me/${username}?start=link_${token}`;
}

/** Register this app's webhook with Telegram (so the bot actually receives /start,
 * join requests and membership changes). Idempotent. */
export async function setTelegramWebhook(url: string, secret?: string): Promise<boolean> {
  const result = await telegramApi<boolean>("setWebhook", {
    url,
    ...(secret ? { secret_token: secret } : {}),
    allowed_updates: ["message", "chat_join_request", "chat_member"],
    drop_pending_updates: false,
  });
  return result !== null;
}

export async function getTelegramWebhookInfo(): Promise<{
  url?: string;
  pending_update_count?: number;
  last_error_message?: string;
} | null> {
  return telegramApi("getWebhookInfo");
}

export async function sendTelegramMessage(chatId: number | string, text: string) {
  return telegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

export async function approveJoinRequest(telegramUserId: number) {
  if (!PAID_CHAT_ID) return false;
  const result = await telegramApi("approveChatJoinRequest", {
    chat_id: PAID_CHAT_ID,
    user_id: telegramUserId,
  });
  return result !== null;
}

export async function declineJoinRequest(telegramUserId: number) {
  if (!PAID_CHAT_ID) return false;
  const result = await telegramApi("declineChatJoinRequest", {
    chat_id: PAID_CHAT_ID,
    user_id: telegramUserId,
  });
  return result !== null;
}

/** Ban removes access; unban allows them to request/join again after resubscribing. */
export async function banTelegramMember(telegramUserId: number) {
  if (!PAID_CHAT_ID) return false;
  const result = await telegramApi("banChatMember", {
    chat_id: PAID_CHAT_ID,
    user_id: telegramUserId,
    revoke_messages: false,
  });
  return result !== null;
}

export async function unbanTelegramMember(telegramUserId: number) {
  if (!PAID_CHAT_ID) return false;
  const result = await telegramApi("unbanChatMember", {
    chat_id: PAID_CHAT_ID,
    user_id: telegramUserId,
    only_if_banned: true,
  });
  return result !== null;
}

export async function createSingleUseInviteLink(): Promise<string | null> {
  if (!PAID_CHAT_ID) return null;
  const result = await telegramApi<{ invite_link: string }>("createChatInviteLink", {
    chat_id: PAID_CHAT_ID,
    member_limit: 1,
    expire_date: Math.floor(Date.now() / 1000) + 60 * 60,
    creates_join_request: false,
  });
  return result?.invite_link ?? null;
}

export async function getChatMemberStatus(telegramUserId: number): Promise<string | null> {
  if (!PAID_CHAT_ID) return null;
  const result = await telegramApi<{ status: string }>("getChatMember", {
    chat_id: PAID_CHAT_ID,
    user_id: telegramUserId,
  });
  return result?.status ?? null;
}

const PROTECTED_MEMBER_STATUSES = new Set(["creator", "administrator"]);

/** Optional comma-separated Telegram user IDs that must never be removed. */
export function getExemptTelegramUserIds(): Set<number> {
  const raw = process.env.TELEGRAM_EXEMPT_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map(Number)
      .filter((id) => Number.isFinite(id))
  );
}

/** Team bots, Owner/Admins, and explicit allowlist entries are never touched. */
export async function isTelegramUserProtected(telegramUserId: number): Promise<boolean> {
  if (getExemptTelegramUserIds().has(telegramUserId)) return true;
  const status = await getChatMemberStatus(telegramUserId);
  return Boolean(status && PROTECTED_MEMBER_STATUSES.has(status));
}

export async function safeBanTelegramMember(telegramUserId: number): Promise<boolean> {
  if (await isTelegramUserProtected(telegramUserId)) return false;
  return banTelegramMember(telegramUserId);
}
