import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { DEFAULT_AVATAR_ID } from "@/lib/avatar-system";
import { validatePassword } from "@/lib/password";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";

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

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      avatar_id: DEFAULT_AVATAR_ID,
      city,
      ...(name ? { full_name: name } : {}),
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

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: data.user.id,
        email,
        city,
        onboarding_complete: false,
        ...(name ? { full_name: name } : {}),
      },
      { onConflict: "id" }
    );

  if (profileError) {
    return badRequest("Account wurde erstellt, aber das Profil konnte nicht angelegt werden.", 500);
  }

  const { error: memberStateError } = await admin
    .from("member_state")
    .upsert(
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

  if (memberStateError && memberStateError.code !== "42P01") {
    return badRequest("Account wurde erstellt, aber der Member-State konnte nicht angelegt werden.", 500);
  }

  return NextResponse.json({ ok: true, mode: "login" });
}
