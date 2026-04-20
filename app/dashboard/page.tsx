import { BookOpen, Crown, TrendingUp } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { CourseCard } from "@/components/course-card";
import { featuredCourses } from "@/lib/content";

export default function DashboardPage() {
  return (
    <AuthGate>
      <section className="py-16 sm:py-20">
        <div className="container-shell">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h1 className="mt-5 font-heading text-5xl font-black text-cream">
                Deine AI-Goldmining-Zentrale.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-9 text-muted">
                Im Demo-Modus sind Beispielkurse freigeschaltet. Im Live-System
                zeigt dieser Bereich deine echten Käufe, Fortschritte und Downloads.
              </p>
            </div>
            <Button href="/dashboard/kurse" className="lg:justify-self-end">
              Meine Kurse öffnen
            </Button>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: BookOpen, label: "Freigeschaltete Kurse", value: "Demo-Katalog" },
              { icon: TrendingUp, label: "Fortschritt", value: "Lokal gespeichert" },
              { icon: Crown, label: "Nächstes Ziel", value: "Produkt bauen" }
            ].map((item) => (
              <div key={item.label} className="panel-surface rounded-[1.35rem] p-6">
                <item.icon aria-hidden className="h-7 w-7 text-gold-300" />
                <p className="mt-5 text-sm text-muted">{item.label}</p>
                <p className="mt-2 font-heading text-2xl font-black text-cream">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {featuredCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>
    </AuthGate>
  );
}
