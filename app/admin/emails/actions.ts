"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { requireAdmin, getAdminContext, logAudit } from "@/lib/admin";
import { sendTemplateEmail, type EmailTemplate } from "@/lib/email";
import type { Segment } from "./segments";

type ActionResult = { ok: boolean; error?: string };

/** Segments whose recipients are stored as rows in the `leads` table. */
const LEADS_SEGMENTS: ReadonlySet<Segment> = new Set<Segment>([
  "all_leads",
  "newsletter",
]);

/** A single resolved recipient: an e-mail address and an optional display name. */
export type Recipient = { email: string; name: string };

/**
 * Resolve the list of unique recipients (email + name) for a segment using the
 * service-role client (bypasses RLS). Returns lowercased, de-duplicated
 * addresses. Never throws. This is the single source of truth shared by the
 * count preview, the recipient list and the actual broadcast send.
 */
async function resolveSegmentRecipients(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  segment: Segment
): Promise<Recipient[]> {
  const byEmail = new Map<string, Recipient>();

  const add = (email: string | null | undefined, name: string | null | undefined) => {
    const trimmed = email?.trim().toLowerCase();
    if (!trimmed) return;
    const existing = byEmail.get(trimmed);
    const cleanName = name?.trim() || "";
    // Keep the first non-empty name we encounter for a given address.
    if (!existing) byEmail.set(trimmed, { email: trimmed, name: cleanName });
    else if (!existing.name && cleanName) existing.name = cleanName;
  };

  if (segment === "all_members") {
    const { data } = await supabase.from("profiles").select("email, full_name");
    for (const row of (data ?? []) as { email: string | null; full_name: string | null }[])
      add(row.email, row.full_name);
    return Array.from(byEmail.values());
  }

  if (segment === "all_leads") {
    const { data } = await supabase.from("leads").select("email, name");
    for (const row of (data ?? []) as { email: string | null; name: string | null }[])
      add(row.email, row.name);
    return Array.from(byEmail.values());
  }

  if (segment === "newsletter") {
    const { data } = await supabase
      .from("leads")
      .select("email, name")
      .eq("source", "newsletter");
    for (const row of (data ?? []) as { email: string | null; name: string | null }[])
      add(row.email, row.name);
    return Array.from(byEmail.values());
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
    .select("email, full_name")
    .in("id", userIds);

  for (const row of (profiles ?? []) as { email: string | null; full_name: string | null }[])
    add(row.email, row.full_name);
  return Array.from(byEmail.values());
}

/** Live count preview for the chosen segment. */
export async function previewSegment(segment: Segment): Promise<{ count: number }> {
  const { supabase } = await requireAdmin();
  const recipients = await resolveSegmentRecipients(supabase, segment);
  return { count: recipients.length };
}

/**
 * Resolve the full recipient list (email + name) for a segment, using the exact
 * same logic as the broadcast send. Powers the collapsible recipient list.
 */
export async function resolveRecipients(
  segment: Segment
): Promise<{ ok: true; recipients: Recipient[] } | { ok: false; error: string }> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert." };
  const recipients = await resolveSegmentRecipients(ctx.supabase, segment);
  return { ok: true, recipients };
}

/** Sample variables used to fill placeholders in the template preview. */
const PREVIEW_VARS: Record<string, string> = {
  name: "Max Mustermann",
  email: "max@example.com",
  courseName: "AI Goldmining Method",
  amount: "49 €",
};

const PREVIEW_PLACEHOLDER_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

/**
 * Render a template to HTML for an in-panel preview. Mirrors how lib/email.ts
 * loads the template from supabase/email-templates and derives the subject from
 * the leading "Subject:" comment. Known placeholders get sample values; any
 * unknown {{var}} is blanked (matching the real interpolation behaviour).
 */
export async function previewTemplate(
  template: string
): Promise<{ ok: true; html: string; subject: string } | { ok: false; error: string }> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert." };

  let raw: string;
  try {
    const templatePath = path.join(
      process.cwd(),
      "supabase",
      "email-templates",
      `${template}.html`
    );
    raw = await readFile(templatePath, "utf-8");
  } catch {
    return { ok: false, error: "Vorlage nicht gefunden." };
  }

  const subjectMatch = raw.match(/Subject:\s*(.+)/i);
  const rawSubject = subjectMatch?.[1]?.trim() || "AI Goldmining";

  const interpolate = (input: string) =>
    input.replace(PREVIEW_PLACEHOLDER_RE, (_m, key: string) => PREVIEW_VARS[key] ?? "");

  return {
    ok: true,
    html: interpolate(raw),
    subject: interpolate(rawSubject),
  };
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

/** Send a single e-mail of the chosen template to one recipient. */
export async function sendToOne(input: {
  template: EmailTemplate;
  email: string;
  name?: string;
  subject?: string;
}): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert." };

  const to = input.email?.trim().toLowerCase();
  if (!to) return { ok: false, error: "Keine E-Mail-Adresse." };

  const res = await sendTemplateEmail({
    template: input.template,
    to,
    subject: input.subject?.trim() || undefined,
    vars: { email: to, name: input.name?.trim() || undefined },
  });

  if (!res.ok) return { ok: false, error: res.error ?? "Versand fehlgeschlagen" };

  await logAudit({
    actorEmail: ctx.user.email,
    action: "email.send_one",
    entity: "email_broadcast",
    meta: { template: input.template, subject: input.subject ?? null, to },
  });

  return { ok: true };
}

/**
 * Remove a recipient from a segment. For lead-based segments the lead row is
 * deleted by e-mail. For member segments there is no row to delete here, so we
 * report ok and let the UI treat it as a local exclusion.
 */
export async function removeRecipient(input: {
  email: string;
  segment: Segment;
}): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert." };

  const email = input.email?.trim().toLowerCase();
  if (!email) return { ok: false, error: "Keine E-Mail-Adresse." };

  if (LEADS_SEGMENTS.has(input.segment)) {
    const { error: dbError } = await ctx.supabase
      .from("leads")
      .delete()
      .ilike("email", email);
    if (dbError) return { ok: false, error: "Empfänger konnte nicht entfernt werden." };

    await logAudit({
      actorEmail: ctx.user.email,
      action: "email.recipient_removed",
      entity: "lead",
      meta: { email, segment: input.segment },
    });

    revalidatePath("/admin/emails");
    return { ok: true };
  }

  // Member segments: nothing to delete here; the UI excludes them locally.
  await logAudit({
    actorEmail: ctx.user.email,
    action: "email.recipient_excluded",
    entity: "email_broadcast",
    meta: { email, segment: input.segment },
  });

  return { ok: true };
}

/**
 * Send a broadcast: resolve recipients, send sequentially, record the run.
 * Addresses listed in `exclude` are skipped (case-insensitive).
 */
export async function sendBroadcast(input: {
  template: EmailTemplate;
  subject?: string;
  segment: Segment;
  exclude?: string[];
}): Promise<ActionResult> {
  const { user, supabase } = await requireAdmin();

  const all = await resolveSegmentRecipients(supabase, input.segment);

  const excluded = new Set(
    (input.exclude ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean)
  );
  const recipients = all.filter((r) => !excluded.has(r.email));

  if (recipients.length === 0) return { ok: false, error: "Keine Empfänger" };

  const subject = input.subject?.trim() || null;

  let success = 0;
  let failed = 0;
  for (const recipient of recipients) {
    try {
      const res = await sendTemplateEmail({
        template: input.template,
        to: recipient.email,
        subject: subject ?? undefined,
        vars: { email: recipient.email, name: recipient.name || undefined },
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
      excludedCount: excluded.size,
      success,
      failed,
    },
  });

  revalidatePath("/admin/emails");
  return { ok: true };
}
