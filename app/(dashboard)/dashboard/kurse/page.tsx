"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, PlayCircle, Star, Shield, Database, LayoutDashboard, ChevronRight } from "lucide-react";
import { CourseCard3D } from "@/components/course-card-3d";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/button";
import { CheckoutButton } from "@/components/checkout-button";
import { SpatialBackground } from "@/components/spatial-background";
import type { DbCourse } from "@/lib/db-types";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { courses as staticCourses } from "@/lib/content";
import { formatEuro } from "@/lib/utils";

type CourseWithAccess = Omit<DbCourse, "modules"> & {
  isPurchased: boolean;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  created_at?: string;
};

const LEVEL_ORDER: Record<string, number> = {
  Start: 0,
  Aufbau: 1,
  System: 2,
  Bundle: 3,
};

const LEVEL_COLORS: Record<string, string> = {
  Start: "border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.04]",
  Aufbau: "border-sky-500/20 text-sky-400 bg-sky-500/[0.04]",
  System: "border-violet-500/20 text-violet-400 bg-violet-500/[0.04]",
  Bundle: "border-gold-300/30 text-gold-300 bg-gold-300/[0.06]",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardCoursesPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [courses, setCourses] = useState<CourseWithAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (!hasSupabasePublicEnv()) {
          const mock = staticCourses.map((c) => ({
            id: c.slug,
            slug: c.slug,
            title: c.title,
            tagline: c.tagline,
            description: c.description,
            price_cents: c.priceCents,
            image_url: c.image,
            is_active: true,
            created_at: new Date().toISOString(),
            isPurchased: false,
            progress: 0,
            completedLessons: 0,
            totalLessons: c.modules.flatMap((m) => m.lessons).length,
          }));
          setCourses(mock);
          return;
        }

        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();

        const [coursesResult, purchasesResult, progressResult] = await Promise.all([
          supabase
            .from("courses")
            .select("id, slug, title, tagline, description, price_cents, image_url, is_active, created_at")
            .eq("is_active", true)
            .order("created_at", { ascending: true }),
          user
            ? supabase.from("purchases").select("course_slug").eq("user_id", user.id).eq("status", "paid")
            : Promise.resolve({ data: [] }),
          user
            ? supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id)
            : Promise.resolve({ data: [] }),
        ]);

        const dbCourses = (coursesResult.data ?? []) as (Omit<DbCourse, "modules"> & { created_at: string })[];
        const purchasedSlugs = new Set((purchasesResult.data ?? []).map((p) => p.course_slug));
        const completedIds = new Set((progressResult.data ?? []).map((p) => p.lesson_id));

        const mapped = dbCourses.map((course) => {
          const staticCourse = staticCourses.find((c) => c.slug === course.slug);
          const lessonIds = staticCourse?.modules.flatMap((m) => m.lessons.map((l) => l.id)) ?? [];
          const completed = lessonIds.filter((id) => completedIds.has(id)).length;
          const progress = lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0;
          return {
            ...course,
            isPurchased: purchasedSlugs.has(course.slug),
            progress,
            completedLessons: completed,
            totalLessons: lessonIds.length,
          };
        });
        setCourses(mapped);
      } catch (err) {
        console.error("Courses load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    setHasMounted(true);
  }, []);

  if (!hasMounted || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-gold-300/20 border-t-gold-300 rounded-full animate-spin mx-auto" />
          <p className="tac-label animate-pulse">Programme werden geladen...</p>
        </div>
      </div>
    );
  }

  const purchased = courses.filter((c) => c.isPurchased);
  const available = courses.filter((c) => !c.isPurchased);

  const sortedAvailable = [...available].sort((a, b) => {
    const staticA = staticCourses.find((c) => c.slug === a.slug);
    const staticB = staticCourses.find((c) => c.slug === b.slug);
    return (LEVEL_ORDER[staticA?.level ?? ""] ?? 99): (LEVEL_ORDER[staticB?.level ?? ""] ?? 99);
  });

  return (
    <AuthGate>
      <section className="py-12 sm:py-20 relative overflow-hidden bg-obsidian min-h-screen">
        <SpatialBackground />
        
        <div className="container-shell relative z-10">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            
            <motion.div variants={itemVariants} className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-gold-300/30" />
                <span className="tac-label text-gold-300/60 uppercase tracking-widest text-[9px]">Lern-Inhalte</span>
              </div>
              <h1 className="font-heading tracking-gta leading-tight text-cream text-4xl md:text-6xl uppercase">
                MEINE <span className="text-gold-300">KURSE.</span>
              </h1>
              <p className="mt-4 text-cream/40 text-[10px] font-mono uppercase tracking-[0.2em] max-w-lg leading-relaxed">
                Verwalte deine Programme und schalte neue Experten-Module frei.
              </p>
            </motion.div>

            {/* Purchased courses */}
            {purchased.length > 0 && (
              <motion.div variants={itemVariants} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <Shield className="h-4 w-4 text-gold-300/60" />
                  <p className="tac-label uppercase tracking-widest">Freigeschaltete Programme ({purchased.length})</p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {purchased.map((course) => {
                    const staticCourse = staticCourses.find((c) => c.slug === course.slug);
                    const level = staticCourse?.level ?? "Start";
                    const levelColor = LEVEL_COLORS[level] ?? LEVEL_COLORS.Start;
                    return (
                      <CourseCard3D 
                        key={course.slug} 
                        course={{...course, level}} 
                        isPurchased={true} 
                        levelColor={levelColor}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Available courses */}
            {sortedAvailable.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 mb-8">
                  <Lock className="h-4 w-4 text-white/20" />
                  <p className="tac-label opacity-40 uppercase tracking-widest">Verfügbare Programme ({sortedAvailable.length})</p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedAvailable.map((course) => {
                    const staticCourse = staticCourses.find((c) => c.slug === course.slug);
                    const level = staticCourse?.level ?? "Start";
                    const levelColor = LEVEL_COLORS[level] ?? LEVEL_COLORS.Start;
                    const isBundle = level === "Bundle";
                    return (
                      <CourseCard3D 
                        key={course.slug} 
                        course={{...course, level}} 
                        isPurchased={false} 
                        levelColor={levelColor}
                        isBundle={isBundle}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {courses.length === 0 && (
              <div className="tac-panel tac-corners p-20 text-center border-white/5">
                <p className="tac-label opacity-30 uppercase tracking-widest">Keine Programme gefunden</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </AuthGate>
  );
}
