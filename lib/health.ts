import { getStripeClient } from "./stripe";
import { getSupabaseAdminClient } from "./supabase";
import { isTelegramBotConfigured } from "./telegram-bot";

export type HealthStatus = "ok" | "down" | "not_configured";

export type ServiceHealth = {
  service: string;
  status: HealthStatus;
  detail?: string;
};

/** Stripe: a cheap authenticated read confirms the key works. */
export async function checkStripeHealth(): Promise<ServiceHealth> {
  const stripe = getStripeClient();
  if (!stripe) return { service: "Stripe", status: "not_configured" };
  try {
    await stripe.products.list({ limit: 1 });
    return { service: "Stripe", status: "ok" };
  } catch (e) {
    return {
      service: "Stripe",
      status: "down",
      detail: e instanceof Error ? e.message : "Unbekannter Fehler",
    };
  }
}

/** Supabase: a head count on a tiny table confirms the service-role link. */
export async function checkSupabaseHealth(): Promise<ServiceHealth> {
  const admin = getSupabaseAdminClient();
  if (!admin) return { service: "Supabase", status: "not_configured" };
  try {
    const { error } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (error) return { service: "Supabase", status: "down", detail: error.message };
    return { service: "Supabase", status: "ok" };
  } catch (e) {
    return {
      service: "Supabase",
      status: "down",
      detail: e instanceof Error ? e.message : "Unbekannter Fehler",
    };
  }
}

/** Telegram bot: configured = token + paid chat id present. */
export function checkTelegramHealth(): ServiceHealth {
  return {
    service: "Telegram Bot",
    status: isTelegramBotConfigured() ? "ok" : "not_configured",
  };
}

/** Resend (transactional email). */
export function checkResendHealth(): ServiceHealth {
  return {
    service: "E-Mail (Resend)",
    status: process.env.RESEND_API_KEY ? "ok" : "not_configured",
  };
}

/** All integration health in one call (Stripe + Supabase run in parallel). */
export async function checkAllHealth(): Promise<ServiceHealth[]> {
  const [stripe, supabase] = await Promise.all([
    checkStripeHealth(),
    checkSupabaseHealth(),
  ]);
  return [supabase, stripe, checkTelegramHealth(), checkResendHealth()];
}
