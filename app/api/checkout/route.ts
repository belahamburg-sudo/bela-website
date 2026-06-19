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
import { ORDER_BUMP, OTO } from "@/lib/offers";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";

type CheckoutItem = { slug: string; qty?: number };

type CheckoutBody = {
  // Single-item (legacy) or multi-item (cart) checkout.
  courseSlug?: string;
  items?: CheckoutItem[];
  userEmail?: string;
  // Funnel options collected in our checkout step.
  agbAccepted?: boolean;
  orderBump?: boolean;
  promoCode?: string;
  referralCode?: string;
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

    // Order bump as an extra line item.
    if (body.orderBump) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: ORDER_BUMP.priceCents,
          product_data: { name: ORDER_BUMP.label, description: ORDER_BUMP.description },
        },
      });
    }

    let appliedDiscount: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    const typedCode = body.promoCode?.trim();
    if (typedCode) {
      const promo = await resolvePromoCode(typedCode);
      if (!promo) {
        return NextResponse.json(
          { message: "Dieser Rabattcode ist ungültig." },
          { status: 400 }
        );
      }
      appliedDiscount = await buildCheckoutDiscount(stripe, promo);
    }

    // Refer-a-friend: a valid referral code gives the friend a % discount.
    // (Skipped if a typed promo already applied, or the buyer owns the code.)
    const referralCode =
      body.referralCode?.trim().toUpperCase() ||
      readReferralFromCookieHeader(request.headers.get("cookie"));
    if (!appliedDiscount && referralCode) {
      try {
        const admin = getSupabaseAdminClient();
        if (admin) {
          const { data: codeRow } = await admin
            .from("referral_codes")
            .select("code, user_id, discount_percent, is_active")
            .eq("code", referralCode)
            .maybeSingle();
          const ownPurchase = codeRow?.user_id && codeRow.user_id === userId;
          if (codeRow && codeRow.is_active && !ownPurchase && (codeRow.discount_percent ?? 0) > 0) {
            const coupon = await stripe.coupons.create({
              percent_off: codeRow.discount_percent,
              duration: "once",
              name: `Freundschaftsrabatt ${codeRow.discount_percent}%`,
              max_redemptions: 1,
            });
            appliedDiscount = [{ coupon: coupon.id }];
          }
        }
      } catch {
        // best-effort — proceed without the friend discount
      }
    }

    const metadata: Record<string, string> = {
      course_slug: courseSlugs[0],
      course_slugs: courseSlugs.join(","),
      agb_accepted: "true",
      order_bump: body.orderBump ? "true" : "false",
      ...(userId ? { user_id: userId } : {}),
      ...(resolvedEmail ? { user_email: resolvedEmail } : {}),
      ...(referralCode ? { referral_code: referralCode } : {}),
      ...(typedCode ? { promo_code: typedCode.toUpperCase() } : {}),
    };

    const enableTax = process.env.STRIPE_AUTOMATIC_TAX === "1";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: absoluteUrl(`/checkout/success?session_id={CHECKOUT_SESSION_ID}&course=${courseSlugs[0]}`),
      cancel_url: absoluteUrl(`/checkout/cancel?course=${courseSlugs[0]}`),
      ...(resolvedEmail ? { customer_email: resolvedEmail } : {}),
      ...(userId ? { client_reference_id: userId } : {}),
      line_items: lineItems,
      // Proper invoices with mandatory fields (brief section 1). This also makes
      // Stripe always create a Customer, which the OTO charge reuses.
      invoice_creation: { enabled: true },
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      ...(enableTax ? { automatic_tax: { enabled: true } } : {}),
      // Save the card for the post-purchase 1-Click OTO (only when OTO is live).
      ...(OTO.enabled
        ? { payment_intent_data: { setup_future_usage: "off_session" as const } }
        : {}),
      // Discounts vs. hosted promo entry are mutually exclusive.
      ...(appliedDiscount ? { discounts: appliedDiscount } : { allow_promotion_codes: true }),
      ...(process.env.STRIPE_TOS_CONSENT === "1"
        ? { consent_collection: { terms_of_service: "required" } }
        : {}),
      metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Checkout fehlgeschlagen." },
      { status: 500 }
    );
  }
}
