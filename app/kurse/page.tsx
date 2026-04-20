"use client";

import { motion } from "framer-motion";
import { CourseCard } from "@/components/course-card";
import { SectionHeading } from "@/components/section-heading";
import { courses } from "@/lib/content";

export default function CoursesPage() {
  return (
    <section className="py-24 bg-obsidian min-h-screen">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading
            eyebrow="Kurs-Shop"
            title="Digitale Produkte lernen, bauen und verkaufen."
            copy="Der Starter-Katalog zeigt die erste Produktleiter für AI Goldmining: vom ersten Produkt über Templates und Mini-Kurse bis zum Funnel-System."
          />
        </motion.div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.slug}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
