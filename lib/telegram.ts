import type { SupabaseClient } from "@supabase/supabase-js";

export type TelegramSubscription = {
  active: boolean;
  status: string;
  currentPeriodEnd: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
};

/**
 * Read the Telegram VIP subscription for a user.
 * Fully resilient: returns null on any error (e.g. the table not existing yet)
 * or when no row is found. Never throws.
 */
export async function getTelegramSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<TelegramSubscription | null> {
  try {
    const { data, error } = await supabase
      .from("telegram_subscriptions")
      .select(
        "status, current_period_end, stripe_subscription_id, stripe_customer_id"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as {
      status: string;
      current_period_end: string | null;
      stripe_subscription_id: string | null;
      stripe_customer_id: string | null;
    };

    return {
      active: ["active", "trialing"].includes(row.status),
      status: row.status,
      currentPeriodEnd: row.current_period_end ?? null,
      stripeSubscriptionId: row.stripe_subscription_id ?? null,
      stripeCustomerId: row.stripe_customer_id ?? null,
    };
  } catch {
    return null;
  }
}
