import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdminClient } from "./supabase";
import { sendTemplateEmail } from "./email";
import { absoluteUrl } from "./utils";

/**
 * Signed one-click-unsubscribe links. Without a MAC, `?email=…` lets anyone
 * unsubscribe any address (list sabotage). The token is an HMAC of the email
 * keyed by a server-only secret, so only links we generated are honoured.
 */
function unsubSecret(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    ""
  );
}

export function unsubscribeToken(rawEmail: string): string {
  const secret = unsubSecret();
  if (!secret) return "";
  return createHmac("sha256", secret)
    .update(rawEmail.trim().toLowerCase())
    .digest("base64url")
    .slice(0, 32);
}

export function unsubscribeUrl(rawEmail: string): string {
  const email = rawEmail.trim().toLowerCase();
  const token = unsubscribeToken(email);
  return absoluteUrl(
    `/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
  );
}

export function verifyUnsubscribeToken(rawEmail: string, token: string | null): boolean {
  const expected = unsubscribeToken(rawEmail);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type NewsletterStatus = "pending" | "confirmed" | "unsubscribed" | "none";
export type NewsletterConfirmation = {
  email: string;
  userId: string | null;
  source: string | null;
};

function token(): string {
  return (randomUUID() + randomUUID()).replace(/-/g, "");
}

/**
 * Subscribe an email with double-opt-in: upsert as 'pending' with a fresh
 * confirm token and send the confirmation email. A no-op if already confirmed.
 * Best-effort — never throws.
 */
export async function subscribeNewsletter(
  rawEmail: string,
  opts: { userId?: string | null; source?: string; name?: string; resend?: boolean } = {}
): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  const email = rawEmail.trim().toLowerCase();
  if (!email) return;

  try {
    const { data: existing } = await admin
      .from("newsletter_subscribers")
      .select("status, source")
      .eq("email", email)
      .maybeSingle();
    if (existing?.status === "confirmed") return;
    const nextSource = opts.source ?? null;
    if (existing?.status === "pending" && existing.source === nextSource && !opts.resend) return;

    const confirm_token = token();
    await admin.from("newsletter_subscribers").upsert(
      {
        email,
        user_id: opts.userId ?? null,
        status: "pending",
        confirm_token,
        source: opts.source ?? null,
        unsubscribed_at: null,
      },
      { onConflict: "email" }
    );

    await sendTemplateEmail({
      template: "newsletter-double-opt-in",
      to: email,
      vars: {
        name: opts.name ?? "",
        email,
        confirmationUrl: absoluteUrl(`/api/newsletter/confirm?token=${confirm_token}`),
      },
    });
  } catch {
    // best-effort
  }
}

/**
 * Einwilligung ohne zweite Bestätigungsmail eintragen.
 *
 * NUR aufrufen, wenn die Adresse dem Nutzer nachweislich gehört, also wenn er
 * seine Konto-Mail bereits bestätigt hat (`email_confirmed_at` gesetzt). Genau
 * das ist der einzige Zweck des Double-Opt-ins: nachzuweisen, dass der
 * Adressinhaber selbst zugestimmt hat. Liegt der Nachweis schon vor, ist eine
 * zweite Mail reine Reibung.
 *
 * Als Beleg bleiben: `status`, `confirmed_at` (Zeitpunkt der Einwilligung),
 * `source` (an welcher Stelle sie erteilt wurde) und die bestätigte Konto-Mail
 * in der Auth-Tabelle. Bereits abgemeldete Adressen werden NICHT reaktiviert.
 */
export async function confirmNewsletterWithVerifiedAccount(
  rawEmail: string,
  opts: { userId: string; source: string }
): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const email = rawEmail.trim().toLowerCase();
  if (!admin || !email || !opts.userId) return false;

  try {
    const { data: existing } = await admin
      .from("newsletter_subscribers")
      .select("status")
      .eq("email", email)
      .maybeSingle();

    if (existing?.status === "confirmed") return true;
    // Wer sich aktiv abgemeldet hat, wird hier nicht stillschweigend zurückgeholt.
    if (existing?.status === "unsubscribed") return false;

    const { error } = await admin.from("newsletter_subscribers").upsert(
      {
        email,
        user_id: opts.userId,
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirm_token: null,
        source: opts.source,
        unsubscribed_at: null,
      },
      { onConflict: "email" }
    );
    if (error) {
      console.error("confirmNewsletterWithVerifiedAccount failed:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Confirm a pending subscription by token. Returns subscriber info on success. */
export async function confirmNewsletter(tok: string): Promise<NewsletterConfirmation | null> {
  const admin = getSupabaseAdminClient();
  if (!admin || !tok) return null;
  const { data, error } = await admin
    .from("newsletter_subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString(), confirm_token: null })
    .eq("confirm_token", tok)
    .select("email, user_id, source")
    .maybeSingle();
  if (error || !data) return null;

  await sendTemplateEmail({
    template: "newsletter-welcome",
    to: data.email,
    vars: {
      email: data.email,
      unsubscribeUrl: unsubscribeUrl(data.email),
    },
  });
  return {
    email: data.email,
    userId: data.user_id ?? null,
    source: data.source ?? null,
  };
}

/** Unsubscribe by email. Best-effort. */
export async function unsubscribeNewsletter(rawEmail: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  const email = rawEmail.trim().toLowerCase();
  if (!email) return;
  const { error } = await admin
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("email", email);

  if (!error) {
    await sendTemplateEmail({
      template: "newsletter-unsubscribe-confirmed",
      to: email,
      vars: { email },
    });
  }
}

/** Current status for an email (for the profile settings). */
export async function getNewsletterStatus(rawEmail: string): Promise<NewsletterStatus> {
  const admin = getSupabaseAdminClient();
  if (!admin) return "none";
  const email = rawEmail.trim().toLowerCase();
  if (!email) return "none";
  const { data } = await admin
    .from("newsletter_subscribers")
    .select("status")
    .eq("email", email)
    .maybeSingle();
  return (data?.status as NewsletterStatus) ?? "none";
}
