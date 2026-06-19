import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { absoluteUrl } from "@/lib/utils";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

type TelegramPlan = {
  key: "monthly" | "yearly";
  amount: number;
  interval: "month" | "year";
  label: string;
};

/**
 * Resolve the recurring Stripe Price for a VIP plan — find-or-create so the VIP
 * subscription shows up as ONE proper product in Stripe (not an ad-hoc product
 * per checkout). Idempotent across cold starts via the price `lookup_key`.
 */
async function getVipPriceId(stripe: Stripe, plan: TelegramPlan): Promise<string> {
  const lookupKey = `vip_telegram_${plan.key}`;
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  if (existing.data[0]?.id) return existing.data[0].id;

  // First time for this plan: reuse the single VIP product if it exists, else create it.
  let productId: string | undefined;
  try {
    const found = await stripe.products.search({
      query: "metadata['kind']:'telegram_vip'",
      limit: 1,
    });
    productId = found.data[0]?.id;
  } catch {
    /* search API unavailable — fall through to create */
  }
  if (!productId) {
    const product = await stripe.products.create({
      name: "VIP Telegram Gruppe",
      description: "Exklusive Paid Community — jederzeit kündbar.",
      metadata: { kind: "telegram_vip" },
    });
    productId = product.id;
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: "eur",
    unit_amount: plan.amount,
    recurring: { interval: plan.interval },
    lookup_key: lookupKey,
  });
  return price.id;
}

const TELEGRAM_PLANS: Record<TelegramPlan["key"], TelegramPlan> = {
  monthly: {
    key: "monthly",
    amount: 900,
    interval: "month",
    label: "9€/Monat",
  },
  yearly: {
    key: "yearly",
    amount: 7900,
    interval: "year",
    label: "79€/Jahr",
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const requestedPlan = body?.plan === "yearly" ? "yearly" : "monthly";
    const plan = TELEGRAM_PLANS[requestedPlan];

    // Demo fallback: no Stripe key configured.
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        demo: true,
        url: absoluteUrl(`/profil?vip=demo&plan=${plan.key}`),
        message: "Demo-Checkout aktiv."
      });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { message: "Stripe ist nicht konfiguriert." },
        { status: 500 }
      );
    }

    // Resolve the logged-in user server-side via the auth cookies so we can
    // bind the subscription to their account. Login is required.
    let userId: string | null = null;
    let userEmail: string | null = null;

    try {
      const supabase = await getSupabaseServerClient();
      if (supabase) {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
          userEmail = user.email ?? null;
        }
      }
    } catch {
      // Auth resolution is best-effort: fall through to the 401 below.
    }

    if (!userId) {
      return NextResponse.json({ message: "Bitte zuerst einloggen." }, { status: 401 });
    }

    const rl = await checkRateLimit({
      bucket: "telegram-checkout",
      identifier: userId,
      limit: 15,
      windowSeconds: 900,
    });
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds ?? 900);

    // Reuse the real VIP Stripe product/price so it appears in the Stripe catalog
    // and per-product reporting (instead of an ad-hoc product per subscription).
    const vipPriceId = await getVipPriceId(stripe, plan);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: absoluteUrl("/profil?vip=success"),
      cancel_url: absoluteUrl("/bibliothek?vip=cancel"),
      ...(userEmail ? { customer_email: userEmail } : {}),
      client_reference_id: userId,
      line_items: [{ price: vipPriceId, quantity: 1 }],
      metadata: {
        kind: "telegram",
        telegram_plan: plan.key,
        user_id: userId,
        user_email: userEmail ?? ""
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Checkout fehlgeschlagen." },
      { status: 500 }
    );
  }
}
