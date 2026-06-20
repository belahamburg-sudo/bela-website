import { getSupabaseAdminClient } from "./supabase";
import { hasEmbeddings, embedTexts } from "./embeddings";

type DbLesson = { id: string; title: string | null; description: string | null; position: number };
type DbModule = { title: string | null; position: number; lessons: DbLesson[] };

export type CoachSource = { lessonId: string | null; title: string };

function clip(s: string, max = 1500): string {
  return s.length > max ? s.slice(0, max) : s;
}

function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

/**
 * (Re)index one course's text content for the AI coach: builds chunks from the
 * course description + every module/lesson title & description, embeds them, and
 * replaces the course's chunks. Admin-only (service role). Returns a count.
 */
export async function ingestCourse(
  courseSlug: string
): Promise<{ ok: boolean; count: number; error?: string }> {
  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, count: 0, error: "Service nicht verfügbar." };
  if (!hasEmbeddings()) return { ok: false, count: 0, error: "NVIDIA_API_KEY ist nicht gesetzt." };

  const { data: course, error: courseErr } = await admin
    .from("courses")
    .select("slug, title, description, modules(title, position, lessons(id, title, description, position))")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (courseErr) return { ok: false, count: 0, error: courseErr.message };
  if (!course) return { ok: false, count: 0, error: "Kurs nicht gefunden." };

  const title = (course.title as string) ?? courseSlug;
  const mods = ([...((course.modules as DbModule[]) ?? [])]).sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );

  const chunks: { title: string; content: string; lessonId: string | null }[] = [];

  const overview = [
    `Kurs: ${title}`,
    (course.description as string) ?? "",
    mods.length ? `Module: ${mods.map((m) => m.title).filter(Boolean).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  chunks.push({ title, content: clip(overview), lessonId: null });

  for (const m of mods) {
    const lessons = [...(m.lessons ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    for (const l of lessons) {
      const hasText = (l.title ?? "").trim() || (l.description ?? "").trim();
      if (!hasText) continue;
      const content = [`Modul: ${m.title ?? ""}`, `Lektion: ${l.title ?? ""}`, l.description ?? ""]
        .filter(Boolean)
        .join("\n")
        .trim();
      chunks.push({ title: l.title ?? m.title ?? title, content: clip(content), lessonId: l.id });
    }
  }

  const embeddings = await embedTexts(chunks.map((c) => c.content), "passage");
  if (!embeddings) {
    return { ok: false, count: 0, error: "Embeddings fehlgeschlagen — NVIDIA-Key/Modell prüfen." };
  }

  await admin.from("course_chunks").delete().eq("course_slug", courseSlug);
  const rows = chunks.map((c, i) => ({
    course_slug: courseSlug,
    lesson_id: c.lessonId,
    title: c.title,
    content: c.content,
    embedding: toVectorLiteral(embeddings[i]),
  }));
  const { error } = await admin.from("course_chunks").insert(rows);
  if (error) return { ok: false, count: 0, error: error.message };

  return { ok: true, count: rows.length };
}

/** Retrieve the most relevant chunks for a question within one course, plus the
 * distinct lessons they came from (for "Zur Lektion" buttons). */
export async function retrieveContext(
  courseSlug: string,
  question: string
): Promise<{ context: string; sources: CoachSource[] }> {
  const admin = getSupabaseAdminClient();
  if (!admin) return { context: "", sources: [] };
  const emb = await embedTexts([question], "query");
  if (!emb) return { context: "", sources: [] };
  const { data } = await admin.rpc("match_course_chunks", {
    p_course_slug: courseSlug,
    query_embedding: toVectorLiteral(emb[0]),
    match_count: 6,
  });
  const rows = (data ?? []) as { lesson_id: string | null; title: string | null; content: string }[];

  const context = rows.map((r, i) => `[${i + 1}] ${r.title ?? ""}\n${r.content}`).join("\n\n");

  const seen = new Set<string>();
  const sources: CoachSource[] = [];
  for (const r of rows) {
    if (!r.lesson_id || !r.title) continue;
    if (seen.has(r.lesson_id)) continue;
    seen.add(r.lesson_id);
    sources.push({ lessonId: r.lesson_id, title: r.title });
    if (sources.length >= 3) break;
  }
  return { context, sources };
}

/** Whether a course has any indexed chunks (so the UI can show/hide the coach). */
export async function courseIsIndexed(courseSlug: string): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  if (!admin) return false;
  const { count } = await admin
    .from("course_chunks")
    .select("id", { count: "exact", head: true })
    .eq("course_slug", courseSlug);
  return (count ?? 0) > 0;
}
