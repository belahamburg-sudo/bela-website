import { randomUUID } from "node:crypto";
import { getSupabaseAdminClient } from "./supabase";
import { sendTemplateEmail } from "./email";
import { absoluteUrl } from "./utils";

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
  opts: { userId?: string | null; source?: string; name?: string } = {}
): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  const email = rawEmail.trim().toLowerCase();
  if (!email) return;

  try {
    const { data: existing } = await admin
      .from("newsletter_subscribers")
      .select("status")
      .eq("email", email)
      .maybeSingle();
    if (existing?.status === "confirmed") return; // already in — don't re-spam

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
      unsubscribeUrl: absoluteUrl(`/api/newsletter/unsubscribe?email=${encodeURIComponent(data.email)}`),
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
  await admin
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("email", email);
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
