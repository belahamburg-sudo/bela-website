/**
 * Text embeddings via NVIDIA NIM (OpenAI-compatible). Server-side only.
 * nvidia/nv-embedqa-e5-v5 → 1024 dims, matching the vector(1024) column in
 * migration_027. It's a retrieval-QA model, so it needs input_type:
 *   - "passage" when indexing course content
 *   - "query"   when embedding a member's question
 */

export const NVIDIA_EMBED_ENDPOINT =
  process.env.NVIDIA_EMBED_URL || "https://integrate.api.nvidia.com/v1/embeddings";
export const NVIDIA_EMBED_MODEL = process.env.NVIDIA_EMBED_MODEL || "nvidia/nv-embedqa-e5-v5";
/** Must match the model output AND the pgvector column dim (migration_027). */
export const EMBED_DIM = Number(process.env.EMBED_DIM || 1024);

const BATCH = 16;

export function hasEmbeddings(): boolean {
  return Boolean(process.env.NVIDIA_API_KEY);
}

async function embedBatch(
  texts: string[],
  inputType: "query" | "passage",
  apiKey: string
): Promise<number[][] | null> {
  try {
    const res = await fetch(NVIDIA_EMBED_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        input: texts,
        model: NVIDIA_EMBED_MODEL,
        input_type: inputType,
        encoding_format: "float",
        truncate: "END",
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: Array<{ embedding?: number[]; index?: number }> };
    const items = data.data ?? [];
    if (items.length !== texts.length) return null;
    // Preserve input order (NVIDIA returns an `index` per item).
    const ordered = [...items].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    const out = ordered.map((d) => d.embedding).filter((e): e is number[] => Array.isArray(e));
    return out.length === texts.length ? out : null;
  } catch {
    return null;
  }
}

/** Embed many texts (auto-batched). Returns one vector per input, or null. */
export async function embedTexts(
  texts: string[],
  inputType: "query" | "passage"
): Promise<number[][] | null> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || texts.length === 0) return null;

  const result: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = await embedBatch(texts.slice(i, i + BATCH), inputType, apiKey);
    if (!batch) return null;
    result.push(...batch);
  }
  return result;
}
