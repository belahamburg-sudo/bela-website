export function hasSupabasePublicEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function hasSupabaseAdminEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function hasStripeEnv() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function hasStripeWebhookEnv() {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

export const telegramUrl =
  process.env.NEXT_PUBLIC_TELEGRAM_URL ||
  "https://t.me/aigoldminingfreeminers";

export const paidTelegramUrl =
  process.env.NEXT_PUBLIC_TELEGRAM_PAID_URL ||
  "https://t.me/+mjD_JqSrbO83MjAy";

export const webinarUrl =
  process.env.NEXT_PUBLIC_WEBINAR_URL || "/webinar#anmeldung";

/**
 * Bela's personal social profiles (brief section 7). These are the public
 * brand channels — distinct from the free/paid Telegram community links above.
 */
export const socialLinks = {
  telegram: "https://t.me/belagoldmann",
  tiktok: "https://www.tiktok.com/@belagoldmann",
  instagram: "https://www.instagram.com/belagoldmann",
  youtube: "https://www.youtube.com/@belagoldmann",
} as const;

/** Direct line to Bela for 1:1 coaching requests (NOT the community group). */
export const belaPrivateTelegram =
  process.env.NEXT_PUBLIC_TELEGRAM_BELA_URL || "https://t.me/belagoldmann";

/** Public Trustpilot review profile. */
export const trustpilotUrl = "https://de.trustpilot.com/review/aigoldmining.com";

/** Trustpilot TrustBox business unit id — set to render the live widget. */
export const trustpilotBusinessUnitId =
  process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID || "";
