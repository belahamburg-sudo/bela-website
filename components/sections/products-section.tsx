"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/button";
import { StoreProductCard, type StoreCardCourse } from "@/components/store-product-card";
import type { Course } from "@/lib/content";

/** Map a full Course to the StoreProductCard shape (same mapping the /kurse store
 *  uses), so homepage suggestions render with the identical catalog card. */
function toStoreCard(c: Course): StoreCardCourse {
  const totalLessons = c.modules.reduce((n, m) => n + m.lessons.length, 0);
  return {
    slug: c.slug,
    title: c.title,
    tagline: c.tagline,
    image: c.image,
    price_cents: c.priceCents,
    compare_at_price_cents: c.compareAtPriceCents ?? null,
    level: c.level,
    format: c.format,
    totalLessons,
    completedLessons: 0,
    progress: 0,
    isBundle: c.level === "Bundle",
    comingSoon: Boolean(c.comingSoon),
    isFlagship: c.slug === "ai-goldmining-method",
    sortOrder: c.sortOrder,
  };
}

export function ProductsSection({ courses }: { courses: Course[] }) {
  return (
    <section className="relative py-20 lg:py-28 sec-raised overflow-hidden scratch-border">
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
          <p className="eyebrow mb-6 mx-auto"><span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300 shadow-[0_0_6px_rgba(201, 169, 97,0.55)]" aria-hidden />Kurse & Produkte</p>
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

        <div className="mt-4 grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.slug}
              className="h-full"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <StoreProductCard course={toStoreCard(course)} isPurchased={false} hrefBase="/kurse" />
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
