import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({
      demo: true,
      message: "Stripe Webhook ist im Demo-Modus nicht aktiv."
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia"
  });

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Stripe-Signatur fehlt." }, { status: 400 });
  }

  let event: Stripe.Event;
  const rawBody = await request.text();

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Webhook ungültig." },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const courseSlug = session.metadata?.course_slug;
    const supabase = getSupabaseAdminClient();

    if (courseSlug && supabase) {
      await supabase.from("purchases").insert({
        course_slug: courseSlug,
        stripe_session_id: session.id,
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : session.customer?.id,
        amount_total: session.amount_total,
        currency: session.currency,
        status: "paid"
      });
    }
  }

  return NextResponse.json({ received: true });
}
