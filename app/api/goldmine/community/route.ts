import { NextResponse } from "next/server";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type NearbyProfileRow = {
  id: string;
  full_name: string | null;
  city: string | null;
  goal: string | null;
  business_snapshot: Record<string, string> | null;
};

const DEMO_NEARBY_MEMBERS = [
  {
    id: "demo-hh-1",
    name: "Mara",
    city: "Hamburg",
    goal: "Template-Shop mit Notion und Canva bauen",
    stage: "Erste Verkäufe",
  },
  {
    id: "demo-hh-2",
    name: "Jonas",
    city: "Hamburg",
    goal: "AI-gestützte Mini-Kurse für Creator automatisieren",
    stage: "Produkt im Aufbau",
  },
  {
    id: "demo-berlin-1",
    name: "Lea",
    city: "Berlin",
    goal: "Prompt-Packs für Selbstständige launchen",
    stage: "Launchphase",
  },
];

function normalizeCity(city: string | null | undefined) {
  return city?.trim().toLowerCase() ?? "";
}

function mapProfile(row: NearbyProfileRow) {
  return {
    id: row.id,
    name: row.full_name?.trim() || "AI Goldminer",
    city: row.city?.trim() || "Unbekannt",
    goal: row.goal?.trim() || "Baut gerade an der eigenen Goldmine",
    stage: row.business_snapshot?.businessStage?.trim() || "In Umsetzung",
  };
}

export async function GET() {
  if (!hasSupabasePublicEnv()) {
    return NextResponse.json({
      city: "Hamburg",
      nearby: DEMO_NEARBY_MEMBERS.filter((member) => member.city === "Hamburg"),
      demo: true,
    });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ city: null, nearby: [] });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Nicht eingeloggt." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("city")
    .eq("id", user.id)
    .maybeSingle();

  const city = typeof profile?.city === "string" ? profile.city.trim() : "";
  if (!city) {
    return NextResponse.json({ city: null, nearby: [] });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ city, nearby: [] });
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, city, goal, business_snapshot")
    .ilike("city", city)
    .neq("id", user.id)
    .limit(6);

  if (error) {
    return NextResponse.json({ city, nearby: [] });
  }

  const normalizedCity = normalizeCity(city);
  const nearby = ((data ?? []) as NearbyProfileRow[])
    .filter((row) => normalizeCity(row.city) === normalizedCity)
    .map(mapProfile);

  return NextResponse.json({ city, nearby });
}
