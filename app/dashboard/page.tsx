import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { CourseCard } from "@/components/course-card";
import { featuredCourses } from "@/lib/content";

const DEMO_PROGRESS: Record<string, { progress: number; status: "Neu" | "In Bearbeitung" | "Abgeschlossen" }> = {
  "ai-goldmining-starter": { progress: 35, status: "In Bearbeitung" },
  "ai-goldmining-starter-pack": { progress: 0, status: "Neu" },
};

const STATS = [
  { value: "Demo", label: "Modus" },
  { value: "2", label: "Kurse freigeschaltet" },
  { value: "35%", label: "Fortschritt Ø" },
];

export default function DashboardPage() {
  return (
    <AuthGate>
      <section className="py-32 bg-obsidian min-h-screen">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-20">
            <div>
              <p className="eyebrow mb-6">Dashboard</p>
              <h1 className="font-heading text-5xl lg:text-6xl leading-[1.05] text-white">
                Deine AI-Goldmining-{" "}
                <em className="gold-text not-italic">Zentrale.</em>
              </h1>
              <p className="mt-5 text-white/40 text-lg max-w-xl">
                Im Demo-Modus sind Beispielkurse freigeschaltet. Im Live-System zeigt dieser Bereich deine echten Käufe und Fortschritte.
              </p>
            </div>
            <Button href="/kurse">
              Mehr Kurse entdecken
            </Button>
          </div>

          {/* Inline stats — no card wrappers */}
          <div className="grid grid-cols-3 divide-x divide-white/[0.06] mb-20 border-y border-white/[0.06] py-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center px-8 py-4">
                <p className="font-heading text-4xl lg:text-5xl text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/40 uppercase tracking-[0.15em]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Course grid with progress indicators */}
          <div>
            <p className="eyebrow mb-8">Deine Kurse</p>
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredCourses.map((course) => {
                const prog = DEMO_PROGRESS[course.slug];
                return (
                  <CourseCard
                    key={course.slug}
                    course={course}
                    progress={prog?.progress}
                    status={prog?.status}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </AuthGate>
  );
}
