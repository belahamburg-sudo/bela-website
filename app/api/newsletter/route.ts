import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { subscribeNewsletter, unsubscribeNewsletter, getNewsletterStatus } from "@/lib/newsletter";

/** Subscribe / unsubscribe the logged-in user's email (profile settings). */
export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Nicht verfügbar." }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ message: "Bitte einloggen." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { action?: string } | null;
  const action = body?.action;

  if (action === "subscribe") {
    await subscribeNewsletter(user.email, { userId: user.id, source: "profile" });
    // Stays 'pending' until the confirmation link is clicked (double-opt-in).
    return NextResponse.json({ status: await getNewsletterStatus(user.email) });
  }
  if (action === "unsubscribe") {
    await unsubscribeNewsletter(user.email);
    return NextResponse.json({ status: "unsubscribed" });
  }
  return NextResponse.json({ message: "Unbekannte Aktion." }, { status: 400 });
}
