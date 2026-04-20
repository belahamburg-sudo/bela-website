import { notFound } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { CoursePlayer } from "@/components/course-player";
import { courses, getCourse } from "@/lib/content";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export default async function DashboardCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <AuthGate>
      <section className="py-10 sm:py-14">
        <div className="container-shell">
          <CoursePlayer course={course} />
        </div>
      </section>
    </AuthGate>
  );
}
