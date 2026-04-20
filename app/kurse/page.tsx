import { CourseCard } from "@/components/course-card";
import { SectionHeading } from "@/components/section-heading";
import { courses } from "@/lib/content";

export default function CoursesPage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Kurs-Shop"
          title="Digitale Produkte lernen, bauen und verkaufen."
          copy="Der Starter-Katalog zeigt die erste Produktleiter für AI Goldmining: vom ersten Produkt über Templates und Mini-Kurse bis zum Funnel-System."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
