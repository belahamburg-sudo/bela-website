import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { absoluteUrl } from "@/lib/utils";

export async function POST() {
  try {
    // Demo fallback: no Stripe key configured.
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        demo: true,
        url: absoluteUrl("/db/profil?vip=demo"),
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
            unit_amount: 2000,
            recurring: { interval: "month" },
            product_data: {
              name: "VIP Telegram Gruppe",
              description: "Exklusive Paid Community — 20€/Monat, jederzeit kündbar."
            }
          }
        }
      ],
      metadata: {
        kind: "telegram",
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
