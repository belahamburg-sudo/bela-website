"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { CourseCard } from "@/components/course-card";
import { getCourse } from "@/lib/content";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Purchase = {
  course_slug: string;
  status: string;
  created_at: string;
};

type Progress = {
  lesson_id: string;
  completed_at: string;
};

function DashboardContent() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!hasSupabasePublicEnv()) {
        setLoading(false);
        return;
      }
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [{ data: purchaseRows }, { data: progressRows }] = await Promise.all([
        supabase
          .from("purchases")
          .select("course_slug, status, created_at")
          .eq("user_id", user.id)
          .eq("status", "paid"),
        supabase
          .from("lesson_progress")
          .select("lesson_id, completed_at")
          .eq("user_id", user.id),
      ]);

      setPurchases(purchaseRows ?? []);
      setProgress(progressRows ?? []);
      setLoading(false);
    }

    void loadData();
  }, []);

  const purchasedCourses = purchases
    .map((p) => getCourse(p.course_slug))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  const totalLessons = purchasedCourses.reduce(
    (sum, c) => sum + c.modules.reduce((s, m) => s + m.lessons.length, 0),
    0
  );
  const completedCount = progress.length;
  const avgProgress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const stats = [
    { value: purchasedCourses.length.toString(), label: "Kurse freigeschaltet" },
    { value: completedCount.toString(), label: "Lektionen abgeschlossen" },
    { value: `${avgProgress}%`, label: "Fortschritt Ø" },
  ];

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 divide-x divide-white/[0.06] mb-20 border-y border-white/[0.06] py-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center px-8 py-4">
            <p className="font-heading text-4xl lg:text-5xl text-white mb-1">{stat.value}</p>
            <p className="text-sm text-white/40 uppercase tracking-[0.15em]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="eyebrow mb-8">Deine Kurse</p>
        {purchasedCourses.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <p className="text-white/40 mb-6">Noch keine Kurse gekauft.</p>
            <Button href="/kurse">Kurse entdecken</Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {purchasedCourses.map((course) => {
              const courseLessons = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
              const completedInCourse = progress.filter((p) =>
                courseLessons.includes(p.lesson_id)
              ).length;
              const courseProgress =
                courseLessons.length > 0
                  ? Math.round((completedInCourse / courseLessons.length) * 100)
                  : 0;
              const status =
                courseProgress === 100
                  ? "Abgeschlossen"
                  : courseProgress > 0
                  ? "In Bearbeitung"
                  : "Neu";
              return (
                <CourseCard
                  key={course.slug}
                  course={course}
                  progress={courseProgress}
                  status={status}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <AuthGate>
      <section className="py-32 bg-obsidian min-h-screen">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-20">
            <div>
              <p className="eyebrow mb-6">Dashboard</p>
              <h1 className="font-heading text-5xl lg:text-6xl leading-[1.05] text-white">
                Deine AI-Goldmining-{" "}
                <em className="gold-text not-italic">Zentrale.</em>
              </h1>
              <p className="mt-5 text-white/40 text-lg max-w-xl">
                Hier findest du alle deine Kurse und deinen Lernfortschritt.
              </p>
            </div>
            <Button href="/kurse">Mehr Kurse entdecken</Button>
          </div>

          <DashboardContent />
        </div>
      </section>
    </AuthGate>
  );
}
