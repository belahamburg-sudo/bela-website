import Stripe from "stripe";

/**
 * Build a Stripe client from the secret key.
 * Returns null when STRIPE_SECRET_KEY is not set so callers can fall back to
 * the demo flow instead of throwing.
 */
export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia"
  });
}
