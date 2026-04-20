import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const sources = new Set(["newsletter", "webinar", "community"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      source?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim() || null;
    const source = body.source || "newsletter";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Bitte gib eine gültige E-Mail ein." }, { status: 400 });
    }

    if (!sources.has(source)) {
      return NextResponse.json({ message: "Unbekannte Lead-Quelle." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({
        demo: true,
        message: "Demo-Modus: Lead wurde simuliert. Supabase-Keys fehlen noch."
      });
    }

    const { error } = await supabase.from("leads").insert({
      name,
      email,
      source,
      status: "new"
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Du bist eingetragen. Check dein Postfach." });
  } catch {
    return NextResponse.json({ message: "Lead konnte nicht verarbeitet werden." }, { status: 500 });
  }
}
