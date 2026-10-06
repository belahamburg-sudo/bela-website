/**
 * The single place that talks to the email provider (Brevo transactional API).
 * lib/email.ts (file templates) and lib/email-overrides.ts (admin overrides)
 * both build subject + html and hand off here.
 */

export type SendResult = { ok: boolean; skipped?: boolean; error?: string; id?: string };

type Address = { email: string; name?: string };

/** Split "Name <addr@x.com>" into { name, email }; a bare address stays as is. */
export function parseAddress(input: string): Address {
  const match = input.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (!match) return { email: input.trim() };
  const name = match[1].trim();
  return name ? { name, email: match[2].trim() } : { email: match[2].trim() };
}

/**
 * Send one email via Brevo. Never throws. Every failure is logged, so a broken
 * key or unverified sender shows up in the Vercel logs instead of disappearing
 * (that silence is what kept mails down from June to August 2026).
 */
export async function deliverEmail(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  label?: string;
}): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const label = opts.label ?? "raw";

  // No key: local/demo no-op. On Vercel this is a misconfiguration, so say it loudly.
  if (!apiKey) {
    if (process.env.VERCEL) {
      console.error(`[email] BREVO_API_KEY fehlt, Mail "${label}" wurde NICHT verschickt`);
    }
    return { ok: true, skipped: true };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: parseAddress(opts.from),
        to: [{ email: opts.to }],
        subject: opts.subject,
        htmlContent: opts.html,
        ...(opts.replyTo ? { replyTo: parseAddress(opts.replyTo) } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let error = `Brevo responded with ${res.status}`;
      try {
        const json = JSON.parse(body) as { message?: string; code?: string };
        if (json.message) error = `${error}: ${json.message}`;
      } catch {
        if (body) error = `${error}: ${body.slice(0, 200)}`;
      }
      console.error(`[email] Versand fehlgeschlagen (${label}): ${error}`);
      return { ok: false, error };
    }

    const json = (await res.json().catch(() => ({}))) as { messageId?: string };
    return { ok: true, id: json.messageId };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error(`[email] Versand fehlgeschlagen (${label}): ${error}`);
    return { ok: false, error };
  }
}
