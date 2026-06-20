import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getPublicCourses } from "@/lib/courses";
import { hasZai, zaiChat, parseJsonFromModel } from "@/lib/zai";
import { formatEuro } from "@/lib/utils";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Idea = {
  title?: string;
  pitch?: string;
  whyYou?: string;
  steps?: string[];
  effort?: string;
  recommendedCourseSlug?: string;
};

export async function POST(request: Request) {
  if (!hasZai()) {
    return NextResponse.json({ message: "Der Goldmine-Finder ist noch nicht konfiguriert." }, { status: 503 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Nicht verfügbar." }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Bitte melde dich an." }, { status: 401 });
  }

  // LLM calls cost money — throttle per user.
  const limited = await checkRateLimit({
    bucket: "goldmine-finder",
    identifier: user.id,
    limit: 15,
    windowSeconds: 60 * 60,
  });
  if (!limited.allowed) return rateLimitResponse(limited.retryAfterSeconds ?? 3600);

  const body = (await request.json().catch(() => null)) as { wish?: string } | null;
  const wish = (body?.wish ?? "").trim().slice(0, 600);

  const { data: profile } = await supabase
    .from("profiles")
    .select("goal, city, business_snapshot")
    .eq("id", user.id)
    .maybeSingle();

  const snap = (profile?.business_snapshot ?? {}) as Record<string, string>;

  const courses = await getPublicCourses();
  const catalog = courses
    .slice(0, 24)
    .map((c) => `- ${c.title} (slug: ${c.slug}) — ${c.tagline ?? c.level} — ${formatEuro(c.priceCents)}`)
    .join("\n");

  const profileLines = [
    profile?.goal ? `Ziel: ${profile.goal}` : "",
    profile?.city ? `Stadt: ${profile.city}` : "",
    snap.businessStage ? `Phase: ${snap.businessStage}` : "",
    snap.monthlySales ? `Monatsumsatz: ${snap.monthlySales}` : "",
    snap.instagramFollowers ? `Instagram-Follower: ${snap.instagramFollowers}` : "",
    snap.tiktokFollowers ? `TikTok-Follower: ${snap.tiktokFollowers}` : "",
    wish ? `Eigene Angabe/Wunsch: ${wish}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const system = `Du bist der AI-Goldmining Strategie-Coach. Erzeuge 3 konkrete, umsetzbare AI-Business-Ideen, die zum Profil des Nutzers passen.
Regeln:
- Antworte AUSSCHLIESSLICH als JSON, ohne Erklärtext drumherum.
- Sprache: Deutsch, motivierend, konkret, kein Bullshit.
- Ideen müssen realistisch zu Reichweite/Phase/Umsatz des Nutzers passen.
- "recommendedCourseSlug": NUR ein slug aus dem Kurskatalog unten, der wirklich passt — sonst "".
- Keine erfundenen Preise, Garantien oder Kursnamen.

JSON-Schema:
{"ideas":[{"title":"string","pitch":"1 Satz","whyYou":"1 Satz warum das zu DIESEM Nutzer passt","steps":["Schritt 1","Schritt 2","Schritt 3"],"effort":"niedrig|mittel|hoch","recommendedCourseSlug":"slug-oder-leer"}]}

Kurskatalog:
${catalog}`;

  const userMsg = `Profil des Nutzers:
${profileLines || "Keine Angaben — gib breit anwendbare Einsteiger-Ideen."}

Gib jetzt 3 Ideen als JSON.`;

  const raw = await zaiChat(
    [
      { role: "system", content: system },
      { role: "user", content: userMsg },
    ],
    { temperature: 0.6, maxTokens: 1400 }
  );

  const parsed = parseJsonFromModel<{ ideas?: Idea[] }>(raw);
  if (!parsed?.ideas || !Array.isArray(parsed.ideas) || parsed.ideas.length === 0) {
    return NextResponse.json({ message: "Konnte gerade keine Ideen erzeugen. Bitte erneut versuchen." }, { status: 502 });
  }

  const bySlug = new Map(courses.map((c) => [c.slug, c]));
  const ideas = parsed.ideas.slice(0, 4).map((idea) => {
    const slug = (idea.recommendedCourseSlug ?? "").trim();
    const course = slug ? bySlug.get(slug) : undefined;
    return {
      title: String(idea.title ?? "Idee").slice(0, 120),
      pitch: String(idea.pitch ?? "").slice(0, 300),
      whyYou: String(idea.whyYou ?? "").slice(0, 300),
      steps: Array.isArray(idea.steps) ? idea.steps.slice(0, 5).map((s) => String(s).slice(0, 200)) : [],
      effort: ["niedrig", "mittel", "hoch"].includes(String(idea.effort)) ? String(idea.effort) : "mittel",
      course: course ? { title: course.title, href: `/kurse/${course.slug}` } : null,
    };
  });

  return NextResponse.json({ ideas });
}
