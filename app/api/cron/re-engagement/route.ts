import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendTemplateEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

const INACTIVE_DAYS = 14;
const COOLDOWN_DAYS = 30;
const BATCH_SIZE = 50;

export async function GET(request: NextRequest) {
  const denied = verifyCronSecret(request);
  if (denied) return denied;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ skipped: true });

  const cutoff = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data: inactive } = await supabase
    .from("member_state")
    .select("user_id, last_active_on")
    .not("last_active_on", "is", null)
    .lte("last_active_on", cutoff)
    .gt("purchased_courses", 0)
    .limit(200);

  if (!inactive?.length) return NextResponse.json({ sent: 0 });

  const userIds = inactive.map((r) => r.user_id as string);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  if (!profiles?.length) return NextResponse.json({ sent: 0 });

  const cooldownCutoff = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentlySent } = await supabase
    .from("email_cron_log")
    .select("recipient")
    .eq("job", "re-engagement")
    .gte("sent_at", cooldownCutoff);

  const cooledDown = new Set(
    (recentlySent ?? []).map((r) => (r.recipient as string).toLowerCase())
  );

  let sent = 0;

  for (const profile of profiles) {
    if (sent >= BATCH_SIZE) break;

    const email = (profile.email as string)?.trim().toLowerCase();
    if (!email || cooledDown.has(email)) continue;

    const { error: dedupErr } = await supabase
      .from("email_cron_log")
      .insert({ job: "re-engagement", recipient: email, entity_id: "" });
    if (dedupErr) continue;

    const name = (profile.full_name as string)?.trim() || email.split("@")[0];

    await sendTemplateEmail({
      template: "re-engagement",
      to: email,
      vars: { name, email },
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
