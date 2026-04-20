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
  process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/ai_goldmining";

export const webinarUrl =
  process.env.NEXT_PUBLIC_WEBINAR_URL || "/webinar#anmeldung";
