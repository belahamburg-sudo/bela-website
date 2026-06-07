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
      className="relative overflow-hidden py-16 lg:py-24 sec-aurora scratch-border"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-14">
          <p className="eyebrow mb-6 mx-auto"><span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300 shadow-[0_0_6px_rgba(232,192,64,0.55)]" aria-hidden />FAQ</p>
          <h2
            className="font-heading tracking-gta leading-none text-cream"
            style={{ fontSize: "clamp(2.5rem,5vw,5rem)" }}
          >
            Bevor du fragst.
          </h2>
        </div>
        <Faq items={faqItems} />
      </div>
    </motion.section>
  );
}
