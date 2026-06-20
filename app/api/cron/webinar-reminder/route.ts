import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendTemplateEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const denied = verifyCronSecret(request);
  if (denied) return denied;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ skipped: true });

  const now = Date.now();

  const { data: webinars } = await supabase
    .from("webinars")
    .select("id, title, starts_at, url")
    .eq("is_active", true)
    .not("starts_at", "is", null);

  if (!webinars?.length) return NextResponse.json({ sent: 0 });

  const { data: leads } = await supabase
    .from("leads")
    .select("email, name")
    .eq("source", "webinar");

  if (!leads?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const webinar of webinars) {
    const startsAt = new Date(webinar.starts_at as string).getTime();
    const hoursUntil = (startsAt - now) / (1000 * 60 * 60);

    type ReminderType = "webinar-reminder-24h" | "webinar-reminder-1h";
    let template: ReminderType | null = null;
    let tag = "";

    if (hoursUntil > 0.5 && hoursUntil <= 1.5) {
      template = "webinar-reminder-1h";
      tag = "1h";
    } else if (hoursUntil > 20 && hoursUntil <= 25) {
      template = "webinar-reminder-24h";
      tag = "24h";
    }

    if (!template) continue;

    const entityId = `webinar:${webinar.id}:${tag}`;
    const webinarUrl = (webinar.url as string) || absoluteUrl("/webinar");

    for (const lead of leads) {
      const email = (lead.email as string)?.trim().toLowerCase();
      if (!email) continue;

      const { error: dedupErr } = await supabase
        .from("email_cron_log")
        .insert({ job: "webinar-reminder", recipient: email, entity_id: entityId });
      if (dedupErr) continue;

      await sendTemplateEmail({
        template,
        to: email,
        vars: {
          name: (lead.name as string) ?? "",
          email,
          webinarTitle: webinar.title as string,
          webinarUrl,
        },
      });
      sent++;
    }
  }

  return NextResponse.json({ sent });
}
