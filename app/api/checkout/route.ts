import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getPublicCourse } from "@/lib/courses";
import { readReferralFromCookieHeader } from "@/lib/referral";
import { buildCheckoutDiscount, resolvePromoCode } from "@/lib/promo";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { resolveMediaUrl } from "@/lib/storage";
import { absoluteUrl } from "@/lib/utils";
import { OTO } from "@/lib/offers";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";

type CheckoutItem = { slug: string; qty?: number };

type CheckoutBody = {
  // Single-item (legacy) or multi-item (cart) checkout.
  courseSlug?: string;
  items?: CheckoutItem[];
  userEmail?: string;
  // Funnel options collected in our checkout step.
  agbAccepted?: boolean;
  promoCode?: string;
  referralCode?: string;
  // Installment checkout: pay in N monthly installments.
  installments?: boolean;
};

async function stripeImageUrl(image: string | null | undefined): Promise<string | undefined> {
  if (!image) return undefined;
  const resolved = await resolveMediaUrl(image);
  if (!resolved) return undefined;
  if (/^https?:\/\//i.test(resolved)) return resolved;
  if (resolved.startsWith("/")) return absoluteUrl(resolved);
  return absoluteUrl(`/${resolved}`);
}

export async function POST(request: Request) {
  try {
    const limited = await checkRateLimit({
      bucket: "checkout",
      identifier: clientIp(request),
      limit: 20,
      windowSeconds: 15 * 60,
    });
    if (!limited.allowed) {
      return rateLimitResponse(limited.retryAfterSeconds ?? 900);
    }

    const body = (await request.json()) as CheckoutBody;

    // AGB is a hard requirement (brief: Pflicht-Checkbox im Checkout).
    if (!body.agbAccepted) {
      return NextResponse.json(
        { message: "Bitte akzeptiere die AGB und das Widerrufsrecht, um fortzufahren." },
        { status: 400 }
      );
    }

    // Normalise the requested items.
    const requestedRaw: CheckoutItem[] =
      body.items && body.items.length > 0
        ? body.items
        : body.courseSlug
          ? [{ slug: body.courseSlug, qty: 1 }]
          : [];

    const requested = [...new Map(requestedRaw.map((item) => [item.slug, { slug: item.slug, qty: 1 }])).values()];

    if (requested.length === 0) {
      return NextResponse.json({ message: "Warenkorb ist leer." }, { status: 400 });
    }

    const resolved = await Promise.all(
      requested.map(async (it) => {
        const course = await getPublicCourse(it.slug);
        if (!course || course.comingSoon) return { item: it, course: undefined };
        return { item: it, course };
      })
    );
    const valid = resolved.filter((r) => r.course);

    if (valid.length === 0) {
      return NextResponse.json({ message: "Kurs wurde nicht gefunden." }, { status: 404 });
    }

    const courseSlugs = valid.map((r) => r.course!.slug);

    // Demo fallback: no Stripe key configured.
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        demo: true,
        url: absoluteUrl(`/checkout/success?demo=1&course=${courseSlugs[0]}`),
        message: "Demo-Checkout aktiv. Kein Stripe-Key gesetzt.",
      });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ message: "Stripe ist nicht konfiguriert." }, { status: 500 });
    }

    // Resolve the logged-in user server-side so we can bind the purchase.
    let userId: string | null = null;
    let userEmail: string | null = null;
    try {
      const supabase = await getSupabaseServerClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
          userEmail = user.email ?? null;
        }
      }
    } catch {
      // best-effort; continue as guest
    }
    const resolvedEmail = userEmail ?? body.userEmail ?? null;

    // Prefer real Stripe products (set via the admin sync button) so each sale
    // attributes to the course's product in Stripe reporting. The DB price stays
    // authoritative (unit_amount), so a price change can never drift.
    const productBySlug = new Map<string, string>();
    try {
      const admin = getSupabaseAdminClient();
      if (admin) {
        const { data } = await admin
          .from("courses")
          .select("slug, stripe_product_id")
          .in("slug", courseSlugs);
        for (const r of (data ?? []) as { slug: string; stripe_product_id: string | null }[]) {
          if (r.stripe_product_id) productBySlug.set(r.slug, r.stripe_product_id);
        }
      }
    } catch {
      // best-effort — fall back to inline product_data below
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = await Promise.all(
      valid.map(async ({ course }) => {
        const productId = productBySlug.get(course!.slug);
        const imageUrl = productId ? undefined : await stripeImageUrl(course!.image);
        return {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: course!.priceCents,
            ...(productId
              ? { product: productId }
              : {
                  product_data: {
                    name: course!.title,
                    ...(course!.tagline ? { description: course!.tagline } : {}),
                    ...(imageUrl ? { images: [imageUrl] } : {}),
                  },
                }),
          },
        };
      })
    );

    const adminClient = getSupabaseAdminClient();

    // The code typed into our checkout field, plus any referral code carried via
    // the ?ref= link / cookie. A typed affiliate code wins: it both discounts the
    // buyer AND attributes the commission (metadata.referral_code → webhook).
    const typedCode = body.promoCode?.trim().toUpperCase() || "";
    let attributedReferralCode =
      body.referralCode?.trim().toUpperCase() ||
      readReferralFromCookieHeader(request.headers.get("cookie")) ||
      "";

    type ReferralRow = {
      code: string;
      user_id: string | null;
      discount_percent: number | null;
      is_active: boolean;
      stripe_promotion_code_id: string | null;
    };

    async function findReferralCode(code: string): Promise<ReferralRow | null> {
      if (!adminClient || !code) return null;
      const { data } = await adminClient
        .from("referral_codes")
        .select("code, user_id, discount_percent, is_active, stripe_promotion_code_id")
        .eq("code", code)
        .maybeSingle();
      return (data as ReferralRow | null) ?? null;
    }

    // Prefer the persistent Stripe promotion code; fall back to an ad-hoc coupon
    // (e.g. before the code was synced to Stripe).
    async function referralDiscount(
      row: ReferralRow
    ): Promise<Stripe.Checkout.SessionCreateParams.Discount[]> {
      if (row.stripe_promotion_code_id) {
        return [{ promotion_code: row.stripe_promotion_code_id }];
      }
      const coupon = await stripe!.coupons.create({
        percent_off: row.discount_percent ?? 0,
        duration: "once",
        name: `Rabatt ${row.code} (${row.discount_percent ?? 0}%)`,
        max_redemptions: 1,
      });
      return [{ coupon: coupon.id }];
    }

    // True when the code belongs to the buyer themselves. Catches both the
    // logged-in case (user_id match) AND the guest-checkout self-referral, where
    // an affiliate logs out and buys with their own code under their own email to
    // farm the buyer discount + commission. We compare the buyer email to the
    // code owner's profile email.
    async function isOwnCode(row: ReferralRow): Promise<boolean> {
      if (!row.user_id) return false;
      if (row.user_id === userId) return true;
      const buyerEmail = resolvedEmail?.trim().toLowerCase();
      if (buyerEmail && adminClient) {
        const { data } = await adminClient
          .from("profiles")
          .select("email")
          .eq("id", row.user_id)
          .maybeSingle();
        const ownerEmail = (data as { email: string | null } | null)?.email?.trim().toLowerCase();
        if (ownerEmail && ownerEmail === buyerEmail) return true;
      }
      return false;
    }

    async function isUsable(row: ReferralRow): Promise<boolean> {
      if (!row.is_active || (row.discount_percent ?? 0) <= 0) return false;
      return !(await isOwnCode(row));
    }

    let appliedDiscount: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;

    if (typedCode) {
      const refRow = await findReferralCode(typedCode);
      if (refRow && (await isUsable(refRow))) {
        attributedReferralCode = typedCode;
        appliedDiscount = await referralDiscount(refRow);
      } else {
        // Not an affiliate code — try a generic Stripe / configured promo code.
        const promo = await resolvePromoCode(typedCode);
        if (!promo) {
          return NextResponse.json(
            { message: "Dieser Rabattcode ist ungültig." },
            { status: 400 }
          );
        }
        appliedDiscount = await buildCheckoutDiscount(stripe, promo);
      }
    }

    // Refer-a-friend via ?ref= link / cookie when no typed discount applied.
    if (!appliedDiscount && attributedReferralCode) {
      try {
        const refRow = await findReferralCode(attributedReferralCode);
        if (refRow && (await isUsable(refRow))) {
          appliedDiscount = await referralDiscount(refRow);
        } else if (refRow && (await isOwnCode(refRow))) {
          // Never attribute a referrer's own purchase.
          attributedReferralCode = "";
        }
      } catch {
        // best-effort — proceed without the friend discount
      }
    }

    const metadata: Record<string, string> = {
      course_slug: courseSlugs[0],
      course_slugs: courseSlugs.join(","),
      agb_accepted: "true",
      ...(userId ? { user_id: userId } : {}),
      ...(resolvedEmail ? { user_email: resolvedEmail } : {}),
      ...(attributedReferralCode ? { referral_code: attributedReferralCode } : {}),
      ...(typedCode ? { promo_code: typedCode } : {}),
    };

    const enableTax = process.env.STRIPE_AUTOMATIC_TAX === "1";

    // Installment mode: single-course only, course must have installment config.
    const wantsInstallments = body.installments && valid.length === 1;
    let installmentConfig: { count: number; priceCents: number } | null = null;
    if (wantsInstallments && adminClient) {
      const { data: ic } = await adminClient
        .from("courses")
        .select("installment_count, installment_price_cents")
        .eq("slug", courseSlugs[0])
        .maybeSingle();
      if (ic?.installment_count && ic.installment_count > 1 && ic.installment_price_cents) {
        installmentConfig = { count: ic.installment_count, priceCents: ic.installment_price_cents };
      }
    }

    let session: Stripe.Checkout.Session;

    if (installmentConfig) {
      // Subscription-mode: create a recurring price that auto-cancels after N payments.
      const course = valid[0].course!;
      const productId = productBySlug.get(course.slug);
      const imageUrl = productId ? undefined : await stripeImageUrl(course.image);

      const subscriptionLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: installmentConfig.priceCents,
            recurring: { interval: "month" },
            ...(productId
              ? { product: productId }
              : {
                  product_data: {
                    name: `${course.title} (${installmentConfig.count} Raten)`,
                    ...(course.tagline ? { description: course.tagline } : {}),
                    ...(imageUrl ? { images: [imageUrl] } : {}),
                  },
                }),
          },
        },
      ];

      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        success_url: absoluteUrl(`/checkout/success?session_id={CHECKOUT_SESSION_ID}&course=${courseSlugs[0]}`),
        cancel_url: absoluteUrl(`/checkout/cancel?course=${courseSlugs[0]}`),
        ...(resolvedEmail ? { customer_email: resolvedEmail } : {}),
        ...(userId ? { client_reference_id: userId } : {}),
        line_items: subscriptionLineItems,
        subscription_data: {
          metadata: { ...metadata, installment_mode: "true", installment_total: String(installmentConfig.count) },
        },
        billing_address_collection: "required",
        tax_id_collection: { enabled: true },
        ...(enableTax ? { automatic_tax: { enabled: true } } : {}),
        ...(appliedDiscount ? { discounts: appliedDiscount } : { allow_promotion_codes: true }),
        metadata,
      });
    } else {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: absoluteUrl(`/checkout/success?session_id={CHECKOUT_SESSION_ID}&course=${courseSlugs[0]}`),
        cancel_url: absoluteUrl(`/checkout/cancel?course=${courseSlugs[0]}`),
        ...(resolvedEmail ? { customer_email: resolvedEmail } : {}),
        ...(userId ? { client_reference_id: userId } : {}),
        line_items: lineItems,
        invoice_creation: { enabled: true },
        billing_address_collection: "required",
        tax_id_collection: { enabled: true },
        ...(enableTax ? { automatic_tax: { enabled: true } } : {}),
        ...(OTO.enabled
          ? { payment_intent_data: { setup_future_usage: "off_session" as const } }
          : {}),
        ...(appliedDiscount ? { discounts: appliedDiscount } : { allow_promotion_codes: true }),
        ...(process.env.STRIPE_TOS_CONSENT === "1"
          ? { consent_collection: { terms_of_service: "required" } }
          : {}),
        metadata,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Checkout fehlgeschlagen." },
      { status: 500 }
    );
  }
}
