import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdminClient } from "./supabase";
import type { EmailTemplate, EmailVars } from "./email";

/**
 * Per-template content overrides. The default email content lives in
 * supabase/email-templates/<template>.html. Admins may override a template's
 * subject + HTML; the override is stored in the `site_settings` jsonb store
 * under the key `email_tpl:<template>` with value { subject, html }. When an
 * override exists it wins over the default file (see getEffectiveTemplate).
 *
 * No DB migration is required — this reuses the existing site_settings table.
 */

export type TemplateContent = { subject: string; html: string };

const PLACEHOLDER_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

/** Build the site_settings key for a given template. */
export function overrideKey(template: string): string {
  return `email_tpl:${template}`;
}

/** Derive the subject from a template's leading "Subject:" HTML comment. */
function deriveSubject(html: string): string {
  const match = html.match(/Subject:\s*(.+)/i);
  return match?.[1]?.trim() || "AI Goldmining";
}

/**
 * Read the stored override for a template, or null if none exists / on error.
 * Reads site_settings via the service-role client (bypasses RLS).
 */
export async function getTemplateOverride(
  template: string
): Promise<TemplateContent | null> {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  try {
    const { data } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", overrideKey(template))
      .maybeSingle();
    const value = (data as { value?: Record<string, unknown> } | null)?.value;
    if (!value) return null;
    const subject = typeof value.subject === "string" ? value.subject : "";
    const html = typeof value.html === "string" ? value.html : "";
    if (!html.trim()) return null;
    return { subject: subject.trim() || deriveSubject(html), html };
  } catch {
    return null;
  }
}

/** Load the default (file-based) template content from disk. */
async function getDefaultTemplate(template: string): Promise<TemplateContent> {
  const templatePath = path.join(
    process.cwd(),
    "supabase",
    "email-templates",
    `${template}.html`
  );
  const html = await readFile(templatePath, "utf-8");
  return { subject: deriveSubject(html), html };
}

/**
 * Return the effective template content: the stored override if present, else
 * the default file-based content. Mirrors how lib/email.ts loads + derives the
 * subject. Throws if no override exists and the default file cannot be read.
 */
export async function getEffectiveTemplate(
  template: string
): Promise<TemplateContent> {
  const override = await getTemplateOverride(template);
  if (override) return override;
  return getDefaultTemplate(template);
}

/** Interpolate {{var}} placeholders, blanking unknown / nullish values. */
function interpolate(input: string, vars: EmailVars): string {
  return input.replace(PLACEHOLDER_RE, (_match, key: string) => {
    const value = vars[key];
    if (value === null || value === undefined) return "";
    return String(value);
  });
}

/**
 * Send a raw HTML email (used when a template has an override). Replicates the
 * minimal Resend send from lib/email.ts: no-op when RESEND_API_KEY is missing,
 * auto-injects the same default variables, then interpolates subject + html.
 * Never throws — returns an error object instead.
 */
export async function sendRawEmail(opts: {
  to: string;
  subject: string;
  html: string;
  vars?: EmailVars;
  replyTo?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string; id?: string }> {
  // No-op in demo mode when no API key is configured.
  if (!process.env.RESEND_API_KEY) {
    return { ok: true, skipped: true };
  }

  // Auto-injected defaults first, then caller overrides — mirrors lib/email.ts.
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://aigoldmining.com").replace(/\/$/, "");
  const merged: EmailVars = {
    siteUrl,
    logoUrl: `${siteUrl}/assets/logo-ai-goldmining-3d.png`,
    dashboardUrl: `${siteUrl}/db`,
    courseUrl: `${siteUrl}/db/kurse`,
    checkoutUrl: `${siteUrl}/db/kurse`,
    paidTelegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_PAID_URL || "https://t.me/+mjD_JqSrbO83MjAy",
    telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/aigoldminingfreeminers",
    year: new Date().getFullYear(),
    ...opts.vars,
  };

  const subject = interpolate(opts.subject?.trim() || "AI Goldmining", merged);
  const html = interpolate(opts.html, merged);
  const from = process.env.EMAIL_FROM || "AI Goldmining <noreply@aigoldmining.com>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject,
        html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      let error: string;
      try {
        const errJson = (await res.json()) as { message?: string; error?: string };
        error = errJson?.message || errJson?.error || `Resend responded with ${res.status}`;
      } catch {
        error = (await res.text().catch(() => "")) || `Resend responded with ${res.status}`;
      }
      return { ok: false, error };
    }

    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json?.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export type { EmailTemplate };
