"use client";

import { motion } from "framer-motion";
import { Faq } from "@/components/faq";
import { faqItems } from "@/lib/content";

export function FaqSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="py-40 bg-obsidian scratch-border"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-14">
          <p className="eyebrow mb-6 justify-center">Fragen & Antworten</p>
          <h2
            className="font-heading tracking-gta leading-none text-cream"
            style={{ fontSize: "clamp(2.5rem,5vw,5rem)" }}
          >
            BEVOR DU FRAGST.
          </h2>
        </div>
        <Faq items={faqItems} />
      </div>
    </motion.section>
  );
}
