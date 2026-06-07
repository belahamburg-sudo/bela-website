"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit } from "@/lib/admin";
import { sendTemplateEmail, type EmailTemplate } from "@/lib/email";
import type { Segment } from "./segments";

type ActionResult = { ok: boolean; error?: string };

/**
 * Resolve the list of unique recipient e-mail addresses for a segment using
 * the service-role client (bypasses RLS). Returns lowercased, de-duplicated
 * addresses. Never throws.
 */
async function resolveRecipients(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  segment: Segment
): Promise<string[]> {
  const emails = new Set<string>();

  const add = (value: string | null | undefined) => {
    const trimmed = value?.trim().toLowerCase();
    if (trimmed) emails.add(trimmed);
  };

  if (segment === "all_members") {
    const { data } = await supabase.from("profiles").select("email");
    for (const row of (data ?? []) as { email: string | null }[]) add(row.email);
    return Array.from(emails);
  }

  if (segment === "all_leads") {
    const { data } = await supabase.from("leads").select("email");
    for (const row of (data ?? []) as { email: string | null }[]) add(row.email);
    return Array.from(emails);
  }

  if (segment === "newsletter") {
    const { data } = await supabase
      .from("leads")
      .select("email")
      .eq("source", "newsletter");
    for (const row of (data ?? []) as { email: string | null }[]) add(row.email);
    return Array.from(emails);
  }

  // buyers: distinct user_ids with a paid purchase, resolved to emails via profiles.
  const { data: paid } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("status", "paid");

  const userIds = Array.from(
    new Set(
      ((paid ?? []) as { user_id: string | null }[])
        .map((r) => r.user_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  if (userIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("email")
    .in("id", userIds);

  for (const row of (profiles ?? []) as { email: string | null }[]) add(row.email);
  return Array.from(emails);
}

/** Live count preview for the chosen segment. */
export async function previewSegment(segment: Segment): Promise<{ count: number }> {
  const { supabase } = await requireAdmin();
  const recipients = await resolveRecipients(supabase, segment);
  return { count: recipients.length };
}

/** Send a single test e-mail of the chosen template to the admin themselves. */
export async function sendTestEmail(input: {
  template: EmailTemplate;
  subject?: string;
}): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const to = user.email;
  if (!to) return { ok: false, error: "Keine Admin-E-Mail-Adresse gefunden" };

  const res = await sendTemplateEmail({
    template: input.template,
    to,
    subject: input.subject?.trim() || undefined,
    vars: { name: user.email ?? "Admin", email: to },
  });

  if (!res.ok) return { ok: false, error: res.error ?? "Versand fehlgeschlagen" };

  await logAudit({
    actorEmail: user.email,
    action: "email.test",
    entity: "email_broadcast",
    meta: { template: input.template, subject: input.subject ?? null, to },
  });

  return { ok: true };
}

/**
 * Send a broadcast: resolve recipients, send sequentially, record the run.
 */
export async function sendBroadcast(input: {
  template: EmailTemplate;
  subject?: string;
  segment: Segment;
}): Promise<ActionResult> {
  const { user, supabase } = await requireAdmin();

  const recipients = await resolveRecipients(supabase, input.segment);
  if (recipients.length === 0) return { ok: false, error: "Keine Empfänger" };

  const subject = input.subject?.trim() || null;

  let success = 0;
  let failed = 0;
  for (const to of recipients) {
    try {
      const res = await sendTemplateEmail({
        template: input.template,
        to,
        subject: subject ?? undefined,
        vars: { email: to },
      });
      if (res.ok) success += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  }

  await supabase.from("email_broadcasts").insert({
    subject,
    template: input.template,
    segment: input.segment,
    recipient_count: recipients.length,
    status: "sent",
  });

  await logAudit({
    actorEmail: user.email,
    action: "email.broadcast",
    entity: "email_broadcast",
    meta: {
      template: input.template,
      subject,
      segment: input.segment,
      recipientCount: recipients.length,
      success,
      failed,
    },
  });

  revalidatePath("/admin/emails");
  return { ok: true };
}
