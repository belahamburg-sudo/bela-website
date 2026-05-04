"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { animate, createLayout, stagger } from "animejs";
import { CourseCard } from "@/components/course-card";
import { courses } from "@/lib/content";
import type { Course } from "@/lib/content";

type Tab = "Alle" | "Start" | "Aufbau" | "System" | "Bundle";

const TABS: { label: string; value: Tab }[] = [
  { label: "Alle", value: "Alle" },
  { label: "Einsteiger", value: "Start" },
  { label: "Fortgeschrittene", value: "Aufbau" },
  { label: "Systeme", value: "System" },
  { label: "Bundle", value: "Bundle" },
];

function filterCourses(tab: Tab): Course[] {
  if (tab === "Alle") return courses;
  return courses.filter((c) => c.level === tab);
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Alle");
  const gridRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<ReturnType<typeof createLayout> | null>(null);
  const hasAnimatedIn = useRef(false);

  const filtered = filterCourses(activeTab);

  useEffect(() => {
    if (!gridRef.current) return;
    layoutRef.current = createLayout(gridRef.current);
    return () => { layoutRef.current?.revert(); };
  }, []);

  useEffect(() => {
    if (!gridRef.current || hasAnimatedIn.current) return;
    hasAnimatedIn.current = true;
    const cards = gridRef.current.querySelectorAll<HTMLElement>(".course-card-wrap");
    animate(cards, {
      opacity: [0, 1],
      translateY: [40, 0],
      delay: stagger(100),
      duration: 600,
      ease: "outExpo",
    });
  }, []);

  function switchTab(tab: Tab) {
    if (!layoutRef.current) {
      setActiveTab(tab);
      return;
    }
    layoutRef.current.update(
      () => setActiveTab(tab),
      { duration: 500, ease: "outExpo", delay: stagger(60) }
    );
  }

  return (
    <section className="py-32 bg-obsidian min-h-screen">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="eyebrow mb-6 mx-auto">Kurs-Shop</p>
          <h1 className="font-heading tracking-gta leading-none text-cream max-w-2xl" style={{ fontSize: "clamp(2.5rem,5.5vw,5.5rem)" }}>
            DIGITALE PRODUKTE{" "}
            <span className="gold-text">LERNEN, BAUEN UND VERKAUFEN.</span>
          </h1>
          <p className="mt-5 text-cream/45 text-lg max-w-xl">
            Vom ersten Produkt über Templates bis zum Funnel-System.
          </p>
        </motion.div>

        {/* Tab filter */}
        <div className="flex gap-0 mb-12 border-b border-gold-300/10">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => switchTab(tab.value)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] transition-colors border-b-2 -mb-px ${
                activeTab === tab.value
                  ? "border-gold-300 text-gold-300"
                  : "border-transparent text-cream/35 hover:text-cream/65"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course grid with createLayout */}
        <div ref={gridRef} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <div key={course.slug} className="course-card-wrap">
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-cream/30 text-lg">Keine Kurse in dieser Kategorie.</p>
          </div>
        )}
      </div>
    </section>
  );
}
