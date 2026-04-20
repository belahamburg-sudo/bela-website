"use client";

import { motion } from "framer-motion";
import { Faq } from "@/components/faq";
import { SectionHeading } from "@/components/section-heading";
import { faqItems } from "@/lib/content";

export function FaqSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="py-40 bg-obsidian"
    >
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          align="center"
          eyebrow="Fragen & Antworten"
          title="Bevor du fragst."
        />
        <div className="mt-14">
          <Faq items={faqItems} />
        </div>
      </div>
    </motion.section>
  );
}
