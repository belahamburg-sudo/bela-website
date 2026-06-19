import { NextRequest, NextResponse } from "next/server";
import { sendTemplateEmail } from "@/lib/email";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/utils";

function ok() {
  // Always succeed — don't reveal whether the email exists.
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit({
    bucket: "auth-reset-password",
    identifier: clientIp(request),
    limit: 5,
    windowSeconds: 60 * 60,
  });
  if (!limited.allowed) {
    return rateLimitResponse(limited.retryAfterSeconds ?? 3600);
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Bitte gib deine E-Mail ein." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Passwort-Reset ist serverseitig noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const redirectTo = absoluteUrl("/reset-password");
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    // User not found or link generation failed — still return ok.
    return ok();
  }

  const sent = await sendTemplateEmail({
    template: "password-reset",
    to: email,
    vars: {
      email,
      confirmationUrl: data.properties.action_link,
    },
  });

  if (!sent.ok && !sent.skipped) {
    return NextResponse.json(
      { error: "Die Reset-Mail konnte nicht versendet werden. Bitte später erneut versuchen." },
      { status: 502 }
    );
  }

  return ok();
}
