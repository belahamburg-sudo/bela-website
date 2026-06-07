import { NextResponse } from "next/server";
import { getPublicCourse } from "@/lib/courses";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { absoluteUrl } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { courseSlug?: string; userEmail?: string };
    const course = body.courseSlug ? await getPublicCourse(body.courseSlug) : null;

    if (!course) {
      return NextResponse.json({ message: "Kurs wurde nicht gefunden." }, { status: 404 });
    }

    // Demo fallback: no Stripe key configured.
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        demo: true,
        url: absoluteUrl(`/checkout/success?demo=1&course=${course.slug}`),
        message: "Demo-Checkout aktiv. Kein Stripe-Key gesetzt."
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
    // bind the purchase to their account. Falls back to guest checkout.
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
      // Auth resolution is best-effort: continue as guest on failure.
    }

    const resolvedEmail = userEmail ?? body.userEmail ?? null;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: absoluteUrl(`/checkout/success?session_id={CHECKOUT_SESSION_ID}&course=${course.slug}`),
      cancel_url: absoluteUrl(`/checkout/cancel?course=${course.slug}`),
      ...(resolvedEmail ? { customer_email: resolvedEmail } : {}),
      ...(userId ? { client_reference_id: userId } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: course.priceCents,
            product_data: {
              name: course.title,
              // Stripe rejects empty descriptions — only send a non-empty one.
              ...(course.tagline ? { description: course.tagline } : {}),
              // Stripe needs a real URL; skip storage:// refs (private bucket).
              images: course.image && !course.image.startsWith("storage://")
                ? [absoluteUrl(course.image)]
                : []
            }
          }
        }
      ],
      metadata: {
        course_slug: course.slug,
        ...(userId ? { user_id: userId } : {}),
        ...(resolvedEmail ? { user_email: resolvedEmail } : {})
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
