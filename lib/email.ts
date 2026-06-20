import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveSiteLogoUrl } from "./brand";
import { belaEmail, contactEmail, noreplyEmail, resolveEmailEnvelope } from "./email-addresses";

export type EmailTemplate =
  | "change-email" | "checkout-abandoned" | "course-completed" | "course-unlocked"
  | "invite-user" | "magic-link" | "newsletter-double-opt-in"
  | "newsletter-unsubscribe-confirmed" | "newsletter-welcome" | "onboarding-complete"
  | "password-reset" | "payment-failed" | "purchase-confirmation" | "re-engagement"
  | "reauthentication" | "signup-confirmation"
  | "telegram-free-welcome" | "telegram-paid-welcome" | "telegram-subscription-ended"
  | "webinar-registration-confirmed"
  | "webinar-reminder-1h" | "webinar-reminder-24h";

export type EmailVars = Record<string, string | number | null | undefined>;

const PLACEHOLDER_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

function interpolate(input: string, vars: EmailVars): string {
  return input.replace(PLACEHOLDER_RE, (_match, key: string) => {
    const value = vars[key];
    if (value === null || value === undefined) return "";
    return String(value);
  });
}

export async function sendTemplateEmail(opts: {
  template: EmailTemplate;
  to: string;
  vars?: EmailVars;
  subject?: string;
  from?: string;
  replyTo?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string; id?: string }> {
  // No-op in demo mode when no API key is configured.
  if (!process.env.RESEND_API_KEY) {
    return { ok: true, skipped: true };
  }

  // Read the template HTML from disk.
  let html: string;
  try {
    const templatePath = path.join(
      process.cwd(),
      "supabase",
      "email-templates",
      `${opts.template}.html`
    );
    html = await readFile(templatePath, "utf-8");
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }

  // Determine the subject: explicit override, then leading HTML comment, then fallback.
  let subject = opts.subject?.trim();
  if (!subject) {
    const match = html.match(/Subject:\s*(.+)/i);
    subject = match?.[1]?.trim() || "AI Goldmining";
  }

  // Build merged variables: auto-injected defaults first, then caller overrides.
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://aigoldmining.com").replace(/\/$/, "");
  const merged: EmailVars = {
    siteUrl,
    logoUrl: resolveSiteLogoUrl(siteUrl),
    dashboardUrl: `${siteUrl}/dashboard`,
    courseUrl: `${siteUrl}/bibliothek`,
    checkoutUrl: `${siteUrl}/bibliothek`,
    paidTelegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_PAID_URL || "https://t.me/+mjD_JqSrbO83MjAy",
    telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/aigoldminingfreeminers",
    contactEmail,
    belaEmail,
    noreplyEmail,
    year: new Date().getFullYear(),
    ...opts.vars,
  };

  // Interpolate placeholders in both subject and body.
  subject = interpolate(subject, merged);
  html = interpolate(html, merged);

  const envelope = resolveEmailEnvelope(opts.template, {
    from: opts.from,
    replyTo: opts.replyTo,
  });

  // Send via Resend REST API. Never throw — return an error object instead.
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: envelope.from,
        to: opts.to,
        subject,
        html,
        reply_to: envelope.replyTo,
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
