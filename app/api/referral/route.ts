import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";

/** Deterministic, stable, shareable code derived from the user id. */
function codeForUser(userId: string): string {
  return "GM" + userId.replace(/-/g, "").slice(0, 6).toUpperCase();
}

// GET /api/referral — ensure the current user has a referral code and return it
// together with their attribution stats (refer-a-friend + affiliate).
export async function GET() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Nicht verfügbar." }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Bitte anmelden." }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ code: codeForUser(user.id), demo: true, referrals: 0, earnedCents: 0 });
  }

  // Find or create the user's referral code.
  let code: string;
  const { data: existing } = await admin
    .from("referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .eq("kind", "referral")
    .maybeSingle();

  if (existing?.code) {
    code = existing.code;
  } else {
    code = codeForUser(user.id);
    await admin
      .from("referral_codes")
      .upsert(
        { code, user_id: user.id, kind: "referral", discount_percent: 20, commission_percent: 20 },
        { onConflict: "code", ignoreDuplicates: true }
      );
  }

  // Attribution stats.
  const { data: refs } = await admin
    .from("referrals")
    .select("commission_cents, status")
    .eq("referrer_user_id", user.id);

  const referrals = refs?.length ?? 0;
  const earnedCents = (refs ?? []).reduce((s, r) => s + (r.commission_cents ?? 0), 0);

  return NextResponse.json({ code, referrals, earnedCents });
}
