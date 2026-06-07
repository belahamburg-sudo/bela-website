import Stripe from "stripe";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendTemplateEmail } from "@/lib/email";
import { getPublicCourse } from "@/lib/courses";
import { formatEuro, absoluteUrl } from "@/lib/utils";

// Resolve the app user behind a Checkout Session: metadata.user_id ->
// client_reference_id -> profiles lookup by email.
async function resolveUserId(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
): Promise<string | null> {
  let userId: string | null =
    session.metadata?.user_id ?? session.client_reference_id ?? null;

  if (!userId) {
    const lookupEmail = (
      session.metadata?.user_email ?? session.customer_details?.email ?? null
    )?.trim().toLowerCase();

    if (lookupEmail) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", lookupEmail)
        .maybeSingle();
      userId = data?.id ?? null;
    }
  }

  return userId;
}

// Best-effort name + email for personalising emails.
async function getRecipient(
  supabase: SupabaseClient,
  userId: string | null,
  fallbackEmail: string | null
): Promise<{ name: string; email: string | null }> {
  let name = "";
  let email = fallbackEmail;

  if (userId) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .maybeSingle();
    if (data) {
      name = data.full_name ?? "";
      email = email ?? data.email ?? null;
    }
  }

  if (!name && email) name = email.split("@")[0];
  return { name, email };
}

function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function handleCoursePurchase(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  const courseSlug = session.metadata?.course_slug;
  if (!courseSlug) return;

  // Idempotency: if this session was already recorded, do nothing (no double email).
  const { data: existing } = await supabase
    .from("purchases")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) return;

  const userId = await resolveUserId(supabase, session);
  const stripeCustomerId = stripeId(session.customer);

  const { error } = await supabase.from("purchases").upsert(
    {
      user_id: userId,
      course_slug: courseSlug,
      stripe_session_id: session.id,
      stripe_customer_id: stripeCustomerId,
      amount_total: session.amount_total,
      currency: session.currency,
      status: "paid",
    },
    { onConflict: "stripe_session_id", ignoreDuplicates: true }
  );

  if (error) {
    console.error("Purchase upsert failed:", error.message);
    return;
  }

  // Confirmation email (no-op without RESEND_API_KEY).
  const { name, email } = await getRecipient(
    supabase,
    userId,
    session.customer_details?.email ?? session.metadata?.user_email ?? null
  );
  if (email) {
    const course = await getPublicCourse(courseSlug);
    await sendTemplateEmail({
      template: "purchase-confirmation",
      to: email,
      vars: {
        name,
        email,
        courseName: course?.title ?? courseSlug,
        courseUrl: absoluteUrl(`/db/kurse/${courseSlug}`),
        amount:
          typeof session.amount_total === "number"
            ? formatEuro(session.amount_total)
            : "",
      },
    });
  }
}

async function handleTelegramSubscription(
  supabase: SupabaseClient,
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const userId = await resolveUserId(supabase, session);
  if (!userId) {
    console.error("Telegram subscription: could not resolve user for session", session.id);
    return;
  }

  const subscriptionId = stripeId(session.subscription);
  const stripeCustomerId = stripeId(session.customer);

  let status = "active";
  let currentPeriodEnd: string | null = null;
  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      status = sub.status;
      if (sub.current_period_end) {
        currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
      }
    } catch (error) {
      console.error("Subscription retrieve failed:", error instanceof Error ? error.message : error);
    }
  }

  // Was this user already an active VIP on this same subscription? If so, skip
  // the welcome email so webhook retries don't double-send.
  const { data: existingSub } = await supabase
    .from("telegram_subscriptions")
    .select("stripe_subscription_id, status")
    .eq("user_id", userId)
    .maybeSingle();
  const isNewActivation =
    !existingSub ||
    existingSub.stripe_subscription_id !== subscriptionId ||
    !["active", "trialing"].includes(existingSub.status ?? "");

  const { error } = await supabase.from("telegram_subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscriptionId,
      status,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Telegram subscription upsert failed:", error.message);
    return;
  }

  if (isNewActivation && ["active", "trialing"].includes(status)) {
    const { name, email } = await getRecipient(
      supabase,
      userId,
      session.customer_details?.email ?? session.metadata?.user_email ?? null
    );
    if (email) {
      await sendTemplateEmail({
        template: "telegram-paid-welcome",
        to: email,
        vars: { name, email },
      });
    }
  }
}

// Keep the local subscription row in sync on lifecycle changes.
async function handleSubscriptionChange(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from("telegram_subscriptions")
    .update({
      status: subscription.status,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Telegram subscription sync failed:", error.message);
  }
}

async function handlePaymentFailed(
  supabase: SupabaseClient,
  invoice: Stripe.Invoice
) {
  const customer = invoice.customer;
  const email =
    invoice.customer_email ??
    (customer && typeof customer === "object" && "email" in customer
      ? customer.email ?? null
      : null);
  if (!email) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  await sendTemplateEmail({
    template: "payment-failed",
    to: email,
    vars: {
      name: profile?.full_name ?? email.split("@")[0],
      email,
      courseName: invoice.subscription ? "VIP Telegram Gruppe" : "deine Bestellung",
      checkoutUrl: absoluteUrl("/db/kurse"),
    },
  });
}

export async function POST(request: Request) {
  // Demo short-circuit when keys are missing.
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({
      demo: true,
      message: "Stripe Webhook ist im Demo-Modus nicht aktiv.",
    });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ message: "Stripe ist nicht konfiguriert." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Stripe-Signatur fehlt." }, { status: 400 });
  }

  // Raw-body signature verification — must read the unparsed text body.
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

  const supabase = getSupabaseAdminClient();

  // Processing errors must never bubble up — Stripe needs a 200 to stop retrying.
  try {
    if (!supabase) {
      return NextResponse.json({ received: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" || session.metadata?.kind === "telegram") {
          await handleTelegramSubscription(supabase, stripe, session);
        } else {
          await handleCoursePurchase(supabase, session);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await handleSubscriptionChange(supabase, event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.payment_failed": {
        await handlePaymentFailed(supabase, event.data.object as Stripe.Invoice);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Webhook handler error:", error instanceof Error ? error.message : error);
  }

  return NextResponse.json({ received: true });
}
