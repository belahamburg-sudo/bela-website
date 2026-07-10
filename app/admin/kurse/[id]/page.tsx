import { notFound } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { CourseEditor, type EditorCourse } from "@/components/admin/courses/course-editor";
import { moduleRecommendations, type DbCourse } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export default async function AdminCourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = getSupabaseAdminClient();
  if (!admin) notFound();

  const [{ data }, { data: allRows }] = await Promise.all([
    admin
      .from("courses")
      .select("*, modules(*, lessons(*))")
      .eq("id", id)
      .maybeSingle(),
    admin.from("courses").select("slug, title").order("title"),
  ]);

  if (!data) notFound();
  const course = data as DbCourse;
  const allCourses = ((allRows ?? []) as { slug: string; title: string }[]).map(
    (c) => ({ slug: c.slug, title: c.title })
  );

  const modules = [...(course.modules ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      id: m.id,
      title: m.title,
      recommendations: moduleRecommendations(m),
      highlights: Array.isArray(m.highlights)
        ? m.highlights.filter((h): h is string => typeof h === "string")
        : [],
      previewVideoUrl: m.preview_video_url ?? "",
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
    isUnlisted: Boolean(course.is_unlisted),
    sortOrder: course.sort_order ?? 0,
    includes: Array.isArray(course.includes) ? course.includes : [],
    bundledCourses: Array.isArray(course.bundled_courses) ? course.bundled_courses : [],
    compareAtPriceCents:
      typeof course.compare_at_price_cents === "number" ? course.compare_at_price_cents : null,
    promoVideoUrl: course.promo_video_url ?? null,
    crossSellSlugs: Array.isArray(course.cross_sell_slugs) ? course.cross_sell_slugs : [],
    affiliateText: course.affiliate_text ?? "",
    productPage:
      course.product_page && typeof course.product_page === "object"
        ? (course.product_page as Record<string, unknown>)
        : {},
    stripeProductId: course.stripe_product_id ?? null,
    stripePriceId: course.stripe_price_id ?? null,
    modules,
  };

  return <CourseEditor course={editorCourse} allCourses={allCourses} />;
}
