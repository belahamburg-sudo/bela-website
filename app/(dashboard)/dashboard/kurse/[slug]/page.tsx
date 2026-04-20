import { notFound } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { CoursePlayer } from "@/components/course-player";
import type { DbCourse, DbModule } from "@/lib/db-types";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getCourse } from "@/lib/content";

async function fetchCourse(slug: string): Promise<DbCourse | null> {
  if (!hasSupabasePublicEnv()) return null;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("courses")
    .select("*, modules(*, lessons(*))")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  const course = data as DbCourse & { modules: Array<DbModule & { lessons: DbModule["lessons"] }> };
  course.modules = (course.modules as DbModule[])
    .sort((a, b) => a.position - b.position)
    .map((mod) => ({
      ...mod,
      lessons: [...mod.lessons].sort((a, b) => a.position - b.position),
    }));

  return course;
}

export default async function DashboardCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const dbCourse = await fetchCourse(slug);

  if (dbCourse) {
    return (
      <AuthGate>
        <section className="py-10 sm:py-14">
          <div className="container-shell">
            <CoursePlayer course={dbCourse} />
          </div>
        </section>
      </AuthGate>
    );
  }

  const staticCourse = getCourse(slug);
  if (!staticCourse) notFound();

  const fallbackCourse: DbCourse = {
    id: staticCourse.slug,
    slug: staticCourse.slug,
    title: staticCourse.title,
    tagline: staticCourse.outcome ?? null,
    description: null,
    price_cents: 0,
    image_url: null,
    is_active: true,
    modules: staticCourse.modules.map((mod, mi) => ({
      id: `${staticCourse.slug}-mod-${mi}`,
      course_id: staticCourse.slug,
      title: mod.title,
      position: mi,
      lessons: mod.lessons.map((lesson, li) => ({
        id: lesson.id,
        module_id: `${staticCourse.slug}-mod-${mi}`,
        title: lesson.title,
        description: lesson.summary ?? null,
        video_url: lesson.videoUrl ?? null,
        duration: lesson.duration ?? null,
        position: li,
        resources: [],
      })),
    })),
  };

  return (
    <AuthGate>
      <section className="py-10 sm:py-14">
        <div className="container-shell">
          <CoursePlayer course={fallbackCourse} />
        </div>
      </section>
    </AuthGate>
  );
}
