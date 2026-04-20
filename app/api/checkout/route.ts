import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getCourse } from "@/lib/content";
import { absoluteUrl } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { courseSlug?: string; userEmail?: string };
    const course = body.courseSlug ? getCourse(body.courseSlug) : null;

    if (!course) {
      return NextResponse.json({ message: "Kurs wurde nicht gefunden." }, { status: 404 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        demo: true,
        url: absoluteUrl(`/checkout/success?demo=1&course=${course.slug}`),
        message: "Demo-Checkout aktiv. Kein Stripe-Key gesetzt."
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia"
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: absoluteUrl(`/checkout/success?session_id={CHECKOUT_SESSION_ID}&course=${course.slug}`),
      cancel_url: absoluteUrl(`/checkout/cancel?course=${course.slug}`),
      ...(body.userEmail ? { customer_email: body.userEmail } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: course.priceCents,
            product_data: {
              name: course.title,
              description: course.tagline,
              images: [absoluteUrl(course.image)]
            }
          }
        }
      ],
      metadata: {
        course_slug: course.slug,
        ...(body.userEmail ? { user_email: body.userEmail } : {})
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
