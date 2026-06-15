import { NextResponse } from "next/server";
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
        url: absoluteUrl(`/db/profil?vip=demo&plan=${plan.key}`),
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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: absoluteUrl("/db/profil?vip=success"),
      cancel_url: absoluteUrl("/db/kurse?vip=cancel"),
      ...(userEmail ? { customer_email: userEmail } : {}),
      client_reference_id: userId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: plan.amount,
            recurring: { interval: plan.interval },
            product_data: {
              name: "VIP Telegram Gruppe",
              description: `Exklusive Paid Community — ${plan.label}, jederzeit kündbar.`
            }
          }
        }
      ],
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
