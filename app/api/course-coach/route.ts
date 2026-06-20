import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { hasZai, zaiChat, type ChatMessage } from "@/lib/zai";
import { retrieveContext } from "@/lib/course-coach";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

function cleanMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-8)
    .map((m) => {
      const row = (m ?? {}) as Partial<ChatMessage>;
      const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
      const content = typeof row.content === "string" ? row.content.trim().slice(0, 1000) : "";
      return role && content ? ({ role, content } as ChatMessage) : null;
    })
    .filter((m): m is ChatMessage => Boolean(m));
}

export async function POST(request: Request) {
  if (!hasZai()) {
    return NextResponse.json({ message: "Der AI-Coach ist noch nicht konfiguriert." }, { status: 503 });
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

  const body = (await request.json().catch(() => null)) as
    | { courseSlug?: string; messages?: unknown }
    | null;
  const courseSlug = body?.courseSlug?.trim();
  if (!courseSlug) {
    return NextResponse.json({ message: "courseSlug erforderlich." }, { status: 400 });
  }

  // Ownership: the coach only answers for courses the member actually owns.
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .in("status", ["paid", "free"])
    .maybeSingle();
  if (!purchase) {
    return NextResponse.json({ message: "Kein Zugriff auf diesen Kurs." }, { status: 403 });
  }

  const limited = await checkRateLimit({
    bucket: "course-coach",
    identifier: user.id,
    limit: 40,
    windowSeconds: 10 * 60,
  });
  if (!limited.allowed) return rateLimitResponse(limited.retryAfterSeconds ?? 600);

  const messages = cleanMessages(body?.messages);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ message: "Bitte stelle eine Frage." }, { status: 400 });
  }

  const context = await retrieveContext(courseSlug, lastUser.content);

  const system = `Du bist der persönliche AI-Lern-Coach für genau diesen Kurs. Hilf dem Mitglied, den Stoff zu verstehen und umzusetzen.
Regeln:
- Beantworte Fragen VORRANGIG auf Basis des Kurs-Kontexts unten.
- Steht die Antwort nicht im Kontext: sag das ehrlich und gib höchstens einen kurzen, allgemeinen Tipp — erfinde keine Kursinhalte, Zahlen oder Versprechen.
- Antworte auf Deutsch, konkret, ermutigend, in kurzen Absätzen oder Bulletpoints.
- Keine internen Details, keine anderen Kurse, keine erfundenen Links.

Kurs-Kontext:
${context || "(kein Kontext gefunden — sag dem Nutzer, dass du dazu im Kurs nichts findest)"}`;

  const reply = await zaiChat([{ role: "system", content: system }, ...messages], {
    temperature: 0.3,
    maxTokens: 700,
  });
  if (!reply) {
    return NextResponse.json({ message: "Keine Antwort erhalten. Bitte erneut versuchen." }, { status: 502 });
  }

  return NextResponse.json({ reply });
}
