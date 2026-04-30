import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { DEFAULT_AVATAR_ID } from "@/lib/avatar-system";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return badRequest("Bitte E-Mail und Passwort angeben.");
  }

  if (password.length < 6) {
    return badRequest("Das Passwort muss mindestens 6 Zeichen lang sein.");
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
        onboarding_complete: false,
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
