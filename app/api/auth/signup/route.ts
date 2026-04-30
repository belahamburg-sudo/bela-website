import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase";

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

  return NextResponse.json({ ok: true, mode: "login" });
}
