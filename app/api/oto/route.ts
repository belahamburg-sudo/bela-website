import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getPublicCourse } from "@/lib/courses";
import { OTO, otoPriceCents } from "@/lib/offers";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Post-purchase 1-Click OTO charge.
 *
 * Charges the card saved on the original checkout (setup_future_usage) for a
 * discounted course via a fresh off-session PaymentIntent — no second card
 * entry. On success it grants the course (and its bundled courses) in Supabase,
 * mirroring the webhook's grant logic. The OTO PaymentIntent id doubles as the
 * `stripe_session_id` so the purchase rows stay unique and idempotent.
 *
 * REAL charges run here. The whole feature is gated behind OTO.enabled.
 */

async function grantOtoPurchase(
  supabase: SupabaseClient,
  opts: { userId: string; slug: string; intentId: string; customerId: string | null; amount: number }
) {
  const { userId, slug, intentId, customerId, amount } = opts;

  await supabase.from("purchases").upsert(
    [
      {
        user_id: userId,
        course_slug: slug,
        stripe_session_id: intentId,
        stripe_customer_id: customerId,
        amount_total: amount,
        currency: "eur",
        status: "paid",
      },
    ],
    { onConflict: "stripe_session_id,course_slug", ignoreDuplicates: true }
  );

  // Bundle / cross-grant expansion — same one-directional logic as the webhook.
  try {
    const { data: bought } = await supabase
      .from("courses")
      .select("slug, bundled_courses")
      .eq("slug", slug)
      .maybeSingle();
    const list = Array.isArray(bought?.bundled_courses) ? (bought!.bundled_courses as string[]) : [];
    const toCheck = list.filter((s) => s && s !== slug);
    if (toCheck.length > 0) {
      const { data: owned } = await supabase
        .from("purchases")
        .select("course_slug")
        .eq("user_id", userId)
        .in("course_slug", toCheck);
      const ownedSet = new Set(((owned ?? []) as { course_slug: string }[]).map((r) => r.course_slug));
      const toGrant = toCheck.filter((s) => !ownedSet.has(s));
      if (toGrant.length > 0) {
        await supabase.from("purchases").upsert(
          toGrant.map((s) => ({
            user_id: userId,
            course_slug: s,
            stripe_session_id: intentId,
            stripe_customer_id: customerId,
            amount_total: 0,
            currency: "eur",
            status: "paid",
          })),
          { onConflict: "stripe_session_id,course_slug", ignoreDuplicates: true }
        );
      }
    }
  } catch (e) {
    console.error("OTO bundle expansion failed:", e instanceof Error ? e.message : e);
  }
}

export async function POST(request: Request) {
  try {
    if (!OTO.enabled) {
      return NextResponse.json({ message: "OTO ist nicht aktiv." }, { status: 404 });
    }

    const limited = await checkRateLimit({
      bucket: "oto",
      identifier: clientIp(request),
      limit: 10,
      windowSeconds: 15 * 60,
    });
    if (!limited.allowed) return rateLimitResponse(limited.retryAfterSeconds ?? 900);

    const { sessionId } = (await request.json()) as { sessionId?: string };
    if (!sessionId) {
      return NextResponse.json({ message: "Session fehlt." }, { status: 400 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ message: "Stripe ist nicht konfiguriert." }, { status: 500 });
    }

    const course = await getPublicCourse(OTO.courseSlug);
    if (!course || course.comingSoon) {
      return NextResponse.json({ message: "OTO-Produkt ist nicht verfügbar." }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
    if (session.payment_status !== "paid") {
      return NextResponse.json({ message: "Ursprünglicher Kauf ist nicht bestätigt." }, { status: 400 });
    }

    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
    const pi = session.payment_intent;
    const paymentMethodId =
      pi && typeof pi !== "string"
        ? typeof pi.payment_method === "string"
          ? pi.payment_method
          : pi.payment_method?.id ?? null
        : null;

    if (!customerId || !paymentMethodId) {
      return NextResponse.json(
        { message: "Keine gespeicherte Zahlungsmethode gefunden." },
        { status: 400 }
      );
    }

    // Never offer/charge the flagship if it was already part of this order.
    const purchasedSlugs = (session.metadata?.course_slugs ?? session.metadata?.course_slug ?? "")
      .split(",")
      .map((s) => s.trim());
    if (purchasedSlugs.includes(OTO.courseSlug)) {
      return NextResponse.json({ message: "Bereits in dieser Bestellung enthalten." }, { status: 409 });
    }

    // Resolve the buyer (metadata -> profiles by email).
    const supabase = getSupabaseAdminClient();
    let userId: string | null = session.metadata?.user_id ?? session.client_reference_id ?? null;
    const email = (session.metadata?.user_email ?? session.customer_details?.email ?? null)
      ?.trim()
      .toLowerCase();
    if (!userId && email && supabase) {
      const { data } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
      userId = data?.id ?? null;
    }

    // Already owns the flagship? Don't double-charge.
    if (userId && supabase) {
      const { data: owned } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", userId)
        .eq("course_slug", OTO.courseSlug)
        .eq("status", "paid")
        .maybeSingle();
      if (owned) {
        return NextResponse.json({ message: "Du besitzt diesen Kurs bereits." }, { status: 409 });
      }
    }

    const amount = otoPriceCents(course.priceCents);

    // The idempotency key makes a double-click / retry a no-op instead of a
    // second charge.
    const intent = await stripe.paymentIntents.create(
      {
        amount,
        currency: "eur",
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: `OTO: ${course.title} (-${OTO.discountPercent}%)`,
        metadata: {
          oto: "true",
          course_slug: OTO.courseSlug,
          origin_session: sessionId,
          ...(userId ? { user_id: userId } : {}),
        },
      },
      { idempotencyKey: `oto_${sessionId}` }
    );

    if (intent.status === "requires_action") {
      return NextResponse.json({ requiresAction: true, clientSecret: intent.client_secret });
    }
    if (intent.status !== "succeeded") {
      return NextResponse.json({ message: "Zahlung konnte nicht abgeschlossen werden." }, { status: 402 });
    }

    if (supabase && userId) {
      await grantOtoPurchase(supabase, { userId, slug: OTO.courseSlug, intentId: intent.id, customerId, amount });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // An off-session charge that needs 3DS throws with the PaymentIntent attached.
    const e = error as {
      code?: string;
      message?: string;
      raw?: { payment_intent?: { client_secret?: string } };
    };
    if (e?.raw?.payment_intent?.client_secret) {
      return NextResponse.json({ requiresAction: true, clientSecret: e.raw.payment_intent.client_secret });
    }
    return NextResponse.json(
      { message: e?.message || "OTO konnte nicht verarbeitet werden." },
      { status: 500 }
    );
  }
}
