"use server";

import { getAdminContext } from "@/lib/admin";
import { ingestCourse } from "@/lib/course-coach";

export type IndexResult = { slug: string; title: string; count: number; error?: string };

/** Admin-only: (re)index every active course's content for the AI coach. */
export async function indexAllCourses(): Promise<{
  ok: boolean;
  results: IndexResult[];
  error?: string;
}> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, results: [], error: "Nicht autorisiert. Bitte neu anmelden." };

  const { data } = await ctx.supabase
    .from("courses")
    .select("slug, title")
    .eq("is_active", true)
    .order("title", { ascending: true });

  const courses = (data ?? []) as { slug: string; title: string }[];
  const results: IndexResult[] = [];
  for (const c of courses) {
    const r = await ingestCourse(c.slug);
    results.push({ slug: c.slug, title: c.title, count: r.count, error: r.error });
  }
  return { ok: true, results };
}
