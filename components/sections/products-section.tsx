"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/button";
import { CourseCard } from "@/components/course-card";
import { featuredCourses } from "@/lib/content";

export function ProductsSection() {
  return (
    <section className="relative py-16 lg:py-40 bg-obsidian overflow-hidden scratch-border">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gold-300/[0.05] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 lg:mb-16"
        >
          <p className="eyebrow mb-6 mx-auto">🎯 Kurse & Produkte</p>
          <h2
            className="font-heading tracking-gta leading-none text-cream max-w-3xl"
            style={{ fontSize: "clamp(1.75rem, 8vw, 5.5rem)" }}
          >
            Mini-Kurse mit einem{" "}
            <span className="gold-text">klaren Ergebnis.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base lg:text-lg leading-[1.75] text-cream/45 sm:text-lg">
            Jeder Kurs ist klein genug für schnelle Umsetzung und konkret genug, damit du weißt, was du bekommst.
          </p>
        </motion.div>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {featuredCourses.map((course, i) => (
            <motion.div
              key={course.slug}
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Button href="/kurse" variant="outline" size="lg">
            Alle Kurse entdecken
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
