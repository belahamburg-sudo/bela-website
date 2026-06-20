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
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
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
