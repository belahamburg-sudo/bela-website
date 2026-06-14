import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendTemplateEmail, type EmailTemplate } from "@/lib/email";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";

const sources = new Set(["newsletter", "webinar", "community"]);

const leadEmailTemplates: Record<string, EmailTemplate> = {
  newsletter: "newsletter-welcome",
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
    };

    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim() || null;
    const source = body.source || "newsletter";

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
      status: "new"
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // Best-effort welcome email based on the lead source. Never throws.
    const template = leadEmailTemplates[source];
    if (template) {
      await sendTemplateEmail({
        template,
        to: email,
        vars: { name: name ?? "", email },
      });
    }

    return NextResponse.json({ message: "Du bist eingetragen. Check dein Postfach." });
  } catch {
    return NextResponse.json({ message: "Lead konnte nicht verarbeitet werden." }, { status: 500 });
  }
}
