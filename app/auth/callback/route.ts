import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { DEFAULT_AVATAR_ID } from "@/lib/avatar-system";
import { subscribeNewsletter } from "@/lib/newsletter";

/**
 * First sign-in via Google/Apple has no profile row yet (those are created by the
 * e-mail signup API). Create a minimal one so the user shows up in the admin and
 * the onboarding update has a row to write to. Best-effort: never blocks login.
 * Phone-only users (no e-mail) are skipped — profiles.email is NOT NULL.
 */
async function ensureProfile(supabase: SupabaseClient): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return;

    const admin = getSupabaseAdminClient();
    if (!admin) return;

    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (existing) return;

    const meta = user.user_metadata ?? {};
    await admin.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: meta.full_name ?? meta.name ?? null,
      city: meta.city ?? null,
      onboarding_complete: false,
    });
    await admin.from("member_state").upsert(
      {
        user_id: user.id,
        selected_avatar: meta.avatar_id ?? DEFAULT_AVATAR_ID,
        points: 0,
        level: 1,
        purchased_courses: 0,
        completed_lessons: 0,
        completed_courses: 0,
      },
      { onConflict: "user_id" }
    );

    if (meta.newsletter_optin) {
      await subscribeNewsletter(user.email, {
        userId: user.id,
        source: "signup",
        name: meta.full_name ?? meta.name ?? undefined,
      });
    }
  } catch {
    // Never let profile bootstrapping break the auth redirect.
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  // Open-redirect guard: only allow internal absolute paths. Without this a value
  // like `next=@evil.com` turns `${origin}${next}` into `https://site@evil.com`
  // (host = evil.com) and redirects the freshly-logged-in user off-site.
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = /^\/(?!\/)/.test(rawNext) && !rawNext.includes("\\") ? rawNext : "/dashboard";

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as "signup" | "recovery" | "email" });
    if (!error) {
      // Email-confirmation signups land here: create the profile NOW (post-confirm)
      // so unconfirmed accounts never get one.
      await ensureProfile(supabase);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await ensureProfile(supabase);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
