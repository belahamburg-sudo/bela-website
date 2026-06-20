import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendTemplateEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const denied = verifyCronSecret(request);
  if (denied) return denied;

  const stripe = getStripeClient();
  const supabase = getSupabaseAdminClient();
  if (!stripe || !supabase) {
    return NextResponse.json({ skipped: true });
  }

  const twoDaysAgo = Math.floor((Date.now() - 48 * 60 * 60 * 1000) / 1000);

  let sent = 0;
  let skipped = 0;

  for await (const session of stripe.checkout.sessions.list({
    status: "expired",
    created: { gte: twoDaysAgo },
    expand: ["data.line_items"],
    limit: 50,
  })) {
    const email =
      session.customer_details?.email ??
      session.customer_email ??
      session.metadata?.user_email;
    if (!email) { skipped++; continue; }

    const courseSlugs = session.metadata?.course_slugs ?? session.metadata?.course_slug ?? "";
    const entityId = session.id;

    const { error: dedupErr } = await supabase
      .from("email_cron_log")
      .insert({ job: "checkout-abandoned", recipient: email.toLowerCase(), entity_id: entityId });
    if (dedupErr) { skipped++; continue; }

    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("stripe_session_id", session.id)
      .eq("status", "paid")
      .maybeSingle();
    if (purchase) { skipped++; continue; }

    const firstSlug = courseSlugs.split(",")[0] || "";
    const name = session.customer_details?.name ?? email.split("@")[0];

    await sendTemplateEmail({
      template: "checkout-abandoned",
      to: email,
      vars: {
        name,
        email,
        courseName: firstSlug,
        checkoutUrl: absoluteUrl(firstSlug ? `/bibliothek/${firstSlug}` : "/bibliothek"),
      },
    });
    sent++;
  }

  return NextResponse.json({ sent, skipped });
}
