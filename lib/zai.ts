/**
 * Thin client for the ZAI (GLM) API — chat + embeddings. Server-side only.
 * Mirrors the config the support chatbot already uses (ZAI_API_KEY / ZAI_MODEL).
 */

export const ZAI_ENDPOINT =
  process.env.ZAI_API_BASE_URL || "https://api.z.ai/api/paas/v4/chat/completions";
export const ZAI_MODEL = process.env.ZAI_MODEL || "glm-4.5-flash";

export function hasZai(): boolean {
  return Boolean(process.env.ZAI_API_KEY);
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** Single chat completion. Returns the assistant text, or null on any failure. */
export async function zaiChat(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string | null> {
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(ZAI_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: ZAI_MODEL,
        messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.maxTokens ?? 1400,
        stream: false,
        // GLM denkt standardmäßig und schreibt die Antwort dann nach
        // `reasoning_content` statt nach `content` — `content` bleibt leer.
        // Weil das Modell selbst entscheidet, ob es denkt, fiel die Antwort
        // mal aus und mal nicht. Denkmodus aus: verlässlich und deutlich
        // schneller.
        thinking: { type: "disabled" },
      }),
    });
    if (!res.ok) {
      console.error("zaiChat failed:", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return null;
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
    };
    const message = data.choices?.[0]?.message;
    // Sicherheitsnetz, falls der Anbieter den Denkmodus doch erzwingt.
    const text = (message?.content?.trim() || message?.reasoning_content?.trim()) ?? "";
    if (!text) console.error("zaiChat: leere Antwort vom Modell", ZAI_MODEL);
    return text || null;
  } catch (error) {
    console.error("zaiChat threw:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/** Strip ```json fences and parse the first JSON object/array in a model reply. */
export function parseJsonFromModel<T>(text: string | null): T | null {
  if (!text) return null;
  let s = text.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  // Fall back to the first {...} / [...] block.
  if (!s.startsWith("{") && !s.startsWith("[")) {
    const m = s.match(/[[{][\s\S]*[\]}]/);
    if (m) s = m[0];
  }
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}
