import { notFound } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { CourseEditor, type EditorCourse } from "@/components/admin/courses/course-editor";
import type { DbCourse } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function AdminCourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = getSupabaseAdminClient();
  if (!admin) notFound();

  const { data } = await admin
    .from("courses")
    .select("*, modules(*, lessons(*))")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const course = data as DbCourse;

  const modules = [...(course.modules ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      id: m.id,
      title: m.title,
      lessons: [...(m.lessons ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((l) => ({
          id: l.id,
          title: l.title,
          duration: l.duration ?? "",
          description: l.description ?? "",
          videoUrl: l.video_url ?? "",
          resources: Array.isArray(l.resources) ? l.resources : [],
        })),
    }));

  const editorCourse: EditorCourse = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    tagline: course.tagline ?? "",
    description: course.description ?? "",
    priceCents: course.price_cents ?? 0,
    image: course.image_url,
    level: course.level ?? "Start",
    format: course.format === "pdf" ? "pdf" : "video",
    audience: course.audience ?? "",
    outcome: course.outcome ?? "",
    featured: Boolean(course.featured),
    isActive: course.is_active,
    sortOrder: course.sort_order ?? 0,
    includes: Array.isArray(course.includes) ? course.includes : [],
    modules,
  };

  return <CourseEditor course={editorCourse} />;
}
