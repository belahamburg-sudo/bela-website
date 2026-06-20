import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { DEFAULT_AVATAR_ID } from "@/lib/avatar-system";
import { validatePassword } from "@/lib/password";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { subscribeNewsletter } from "@/lib/newsletter";
import { sendTemplateEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit({
    bucket: "auth-signup",
    identifier: clientIp(request),
    limit: 5,
    windowSeconds: 60 * 60,
  });
  if (!limited.allowed) {
    return rateLimitResponse(limited.retryAfterSeconds ?? 3600);
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const name = String(body?.name ?? "").trim();
  const city = String(body?.city ?? "").trim();
  const newsletter = Boolean(body?.newsletter);

  if (!email || !password || !city) {
    return badRequest("Bitte E-Mail, Passwort und Stadt angeben.");
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return badRequest(passwordError);
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return badRequest("Registrierung ist serverseitig noch nicht konfiguriert.", 503);
  }

  // Create the account UNCONFIRMED and email a confirmation link. We no longer
  // auto-confirm (email_confirm: true) because that let anyone register an email
  // they don't own — enabling account squatting and, via the webhook's
  // resolve-by-email, mis-attributing a guest purchase to the squatter.
  // generateLink(type:"signup") creates the user and returns the verify link.
  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: {
        avatar_id: DEFAULT_AVATAR_ID,
        city,
        ...(name ? { full_name: name } : {}),
        ...(newsletter ? { newsletter_optin: true } : {}),
      },
      redirectTo: absoluteUrl("/auth/callback?next=/onboarding"),
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already") || message.includes("registered")) {
      return badRequest("Diese E-Mail ist bereits registriert. Log dich stattdessen ein.", 409);
    }
    return badRequest(error.message);
  }

  if (!data.user?.id) {
    return badRequest("User konnte nicht erstellt werden.");
  }

  // Prefer our own (PKCE-safe) callback link via the hashed token so the existing
  // /auth/callback verifyOtp path handles it; fall back to Supabase's action_link.
  const hashedToken = data.properties?.hashed_token;
  const confirmationUrl = hashedToken
    ? absoluteUrl(
        `/auth/callback?token_hash=${hashedToken}&type=signup&next=${encodeURIComponent("/onboarding")}`
      )
    : data.properties?.action_link ?? absoluteUrl("/login");

  // NOTE: the profile + member_state rows are intentionally NOT created here.
  // They are created in /auth/callback AFTER the user confirms their email
  // (ensureProfile), so an UNCONFIRMED squatter has no profile row and the Stripe
  // webhook's resolve-by-email cannot attribute a guest purchase to them. The
  // name/city/avatar collected here ride along in user_metadata (generateLink
  // options.data) and are applied at confirmation time.

  // Send the confirmation email.
  const sent = await sendTemplateEmail({
    template: "signup-confirmation",
    to: email,
    vars: { email, name, confirmationUrl },
  });

  // No email provider configured (local/demo): we can't run email confirmation,
  // so the user would be stuck on "check your inbox" forever. Degrade gracefully
  // — auto-confirm + create the profile inline and let the client log in. In
  // production (RESEND configured) this branch never runs, so confirmation stays
  // mandatory there.
  if (sent.skipped) {
    await admin.auth.admin.updateUserById(data.user.id, { email_confirm: true });
    await admin.from("profiles").upsert(
      {
        id: data.user.id,
        email,
        city,
        onboarding_complete: false,
        ...(name ? { full_name: name } : {}),
      },
      { onConflict: "id" }
    );
    await admin.from("member_state").upsert(
      {
        user_id: data.user.id,
        selected_avatar: DEFAULT_AVATAR_ID,
        points: 0,
        level: 1,
        purchased_courses: 0,
        completed_lessons: 0,
        completed_courses: 0,
      },
      { onConflict: "user_id" }
    );
    if (newsletter) {
      await subscribeNewsletter(email, { userId: data.user.id, source: "signup", name });
    }
    return NextResponse.json({ ok: true, mode: "login" });
  }

  if (!sent.ok) {
    return badRequest(
      "Account erstellt, aber die Bestätigungs-Mail konnte nicht versendet werden. Bitte versuche es später erneut oder kontaktiere den Support.",
      502
    );
  }

  // Newsletter opt-in is deferred to /auth/callback (after email confirmation)
  // via user_metadata.newsletter_optin so the user doesn't receive two emails at
  // once (signup-confirmation + newsletter-double-opt-in).

  return NextResponse.json({ ok: true, mode: "confirm" });
}
