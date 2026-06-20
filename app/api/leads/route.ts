import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendTemplateEmail, type EmailTemplate } from "@/lib/email";
import { subscribeNewsletter } from "@/lib/newsletter";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { readReferralFromCookieHeader } from "@/lib/referral";

const sources = new Set(["newsletter", "webinar", "community"]);

const leadEmailTemplates: Record<string, EmailTemplate> = {
  webinar: "webinar-registration-confirmed",
  community: "telegram-free-welcome",
};

export async function POST(request: Request) {
  try {
    const limited = await checkRateLimit({
      bucket: "leads",
      identifier: clientIp(request),
      limit: 10,
      windowSeconds: 60 * 60,
    });
    if (!limited.allowed) {
      return rateLimitResponse(limited.retryAfterSeconds ?? 3600);
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      source?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_term?: string;
      utm_content?: string;
      landing_path?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim() || null;
    const source = body.source || "newsletter";

    // Optional attribution/tracking fields (all nullable). Trim and cap length
    // defensively so a malformed client payload can never bloat the row.
    const clean = (value: string | undefined, max = 512) =>
      value?.trim().slice(0, max) || null;

    const utmSource = clean(body.utm_source);
    const utmMedium = clean(body.utm_medium);
    const utmCampaign = clean(body.utm_campaign);
    const utmTerm = clean(body.utm_term);
    const utmContent = clean(body.utm_content);
    const landingPath = clean(body.landing_path, 1024);
    const referrer = clean(request.headers.get("referer") ?? undefined, 1024);
    const userAgent = clean(request.headers.get("user-agent") ?? undefined, 1024);
    const ip = clientIp(request);
    const refCode = readReferralFromCookieHeader(request.headers.get("cookie"));

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Bitte gib eine gültige E-Mail ein." }, { status: 400 });
    }

    if (!sources.has(source)) {
      return NextResponse.json({ message: "Unbekannte Lead-Quelle." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({
        demo: true,
        message: "Demo-Modus: Lead wurde simuliert. Supabase-Keys fehlen noch."
      });
    }

    const { error } = await supabase.from("leads").insert({
      name,
      email,
      source,
      status: "new",
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: utmTerm,
      utm_content: utmContent,
      landing_path: landingPath,
      referrer,
      ip,
      user_agent: userAgent,
      ref_code: refCode,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // Best-effort welcome email based on the lead source. Never throws.
    if (source === "newsletter") {
      await subscribeNewsletter(email, { source: "newsletter", name: name ?? undefined });
    } else {
      const template = leadEmailTemplates[source];
      if (template) {
        await sendTemplateEmail({
          template,
          to: email,
          vars: { name: name ?? "", email },
        });
      }
    }

    return NextResponse.json({ message: "Du bist eingetragen. Check dein Postfach." });
  } catch {
    return NextResponse.json({ message: "Lead konnte nicht verarbeitet werden." }, { status: 500 });
  }
}
