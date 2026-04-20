import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { courses } from "@/lib/content";

export default function DashboardCoursesPage() {
  return (
    <AuthGate>
      <section className="py-16 sm:py-20">
        <div className="container-shell">
          <p className="eyebrow">Meine Kurse</p>
          <h1 className="mt-5 font-heading text-5xl font-black text-cream">
            Deine Kursbibliothek.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-9 text-muted">
            Diese Ansicht zeigt im MVP alle Demo-Kurse. Mit Stripe-Webhooks werden
            später nur gekaufte Kurse freigeschaltet.
          </p>
          <div className="mt-10 grid gap-4">
            {courses.map((course) => (
              <article
                key={course.slug}
                className="panel-surface flex flex-col gap-4 rounded-[1.35rem] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-gold-300">{course.level}</p>
                  <h2 className="mt-2 font-heading text-2xl font-black text-cream">{course.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{course.outcome}</p>
                </div>
                <Button href={`/dashboard/kurse/${course.slug}`} variant="secondary">
                  Kurs öffnen
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AuthGate>
  );
}
