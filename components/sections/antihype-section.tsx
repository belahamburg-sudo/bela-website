"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const ANTI_PROMISES = [
  "Garantierte 20K im Monat",
  "Passives Einkommen ohne Arbeit",
  "Reich in 30 Tagen",
  "AI macht alles für dich",
  "Du brauchst kein Skill",
  "Zertifizierter Coach mit Erfolgsgarantie",
];

const REAL_PROMISES = [
  "Ein klares erstes digitales Produkt",
  "Eine Verkaufsseite, die funktioniert",
  "AI-Prompts für schnelle Umsetzung",
  "Realistisches Ziel: 3.000 € / Monat",
  "Ein System, das auch in 12 Monaten noch läuft",
  "Ehrliche Cases — mit Zahlen, nicht Screenshots",
];

export function AntihypeSection() {
  return (
    <section className="relative overflow-hidden border-y border-gold-500/10 bg-obsidian/80 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Klartext"
          title={
            <>
              Was du hier{" "}
              <em className="gold-text not-italic">nicht</em> bekommst.
            </>
          }
          copy="Weil es wichtig ist, das klar zu sagen."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Left — what you don't get */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-2xl border border-red-500/15 bg-red-950/[0.04] p-8"
          >
            <p className="flex items-center gap-3 font-heading text-lg text-red-300/80 mb-6">
              <X className="h-5 w-5" aria-hidden />
              Bekommst du nicht
            </p>
            <ul className="space-y-4">
              {ANTI_PROMISES.map((promise, i) => (
                <motion.li
                  key={promise}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="text-base text-white/40 line-through decoration-red-400/40 decoration-[1.5px]"
                >
                  {promise}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right — what you do get */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-2xl border border-gold-300/20 bg-gradient-to-br from-gold-500/8 to-transparent p-8"
          >
            <p className="flex items-center gap-3 font-heading text-lg text-gold-200 mb-6">
              <Check className="h-5 w-5" aria-hidden />
              Bekommst du stattdessen
            </p>
            <ul className="space-y-4">
              {REAL_PROMISES.map((promise, i) => (
                <motion.li
                  key={promise}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-center gap-3 text-base text-white/80"
                >
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-gold-500/15">
                    <Check className="h-3 w-3 text-gold-300" aria-hidden />
                  </span>
                  {promise}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
