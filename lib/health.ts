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

/** Brevo (transactional email): /account confirms the key is accepted. */
export async function checkBrevoHealth(): Promise<ServiceHealth> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { service: "E-Mail (Brevo)", status: "not_configured" };
  try {
    const res = await fetch("https://api.brevo.com/v3/account", {
      headers: { "api-key": apiKey, accept: "application/json" },
      cache: "no-store",
    });
    if (res.ok) return { service: "E-Mail (Brevo)", status: "ok" };
    return { service: "E-Mail (Brevo)", status: "down", detail: `Brevo antwortet mit ${res.status}` };
  } catch (e) {
    return {
      service: "E-Mail (Brevo)",
      status: "down",
      detail: e instanceof Error ? e.message : "Unbekannter Fehler",
    };
  }
}

/** All integration health in one call (Stripe, Supabase and Brevo run in parallel). */
export async function checkAllHealth(): Promise<ServiceHealth[]> {
  const [stripe, supabase, brevo] = await Promise.all([
    checkStripeHealth(),
    checkSupabaseHealth(),
    checkBrevoHealth(),
  ]);
  return [supabase, stripe, checkTelegramHealth(), brevo];
}
