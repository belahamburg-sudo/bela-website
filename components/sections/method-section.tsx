"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const STEPS = [
  {
    num: "01",
    title: "Idee finden",
    copy: "Aus Skill, Interesse oder Problem wird ein konkretes digitales Produkt — keine 47 Optionen, sondern eine klare Entscheidung.",
    detail: "Mapping-Framework + AI-Validierungs-Prompts",
  },
  {
    num: "02",
    title: "Mit AI bauen",
    copy: "AI übernimmt Struktur, Copy, Workbook und Assets. Du bleibst im Driver-Seat für Qualität und Positionierung.",
    detail: "Prompt-Packs für jede Produktphase",
  },
  {
    num: "03",
    title: "Sauber verpacken",
    copy: "Name, Promise, Module, Verkaufsseite. Aus einem rohen Draft wird ein kaufbares Angebot mit klarer Kaufmotivation.",
    detail: "Template-System für Sales-Pages",
  },
  {
    num: "04",
    title: "Automatisiert verkaufen",
    copy: "Store, Webinar, Newsletter und Community arbeiten als System zusammen. Du baust die Pipeline einmal — sie läuft.",
    detail: "Funnel-Map + Launch-Playbook",
  },
];

function StepCard({ step, index }: { step: (typeof STEPS)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="relative rounded-2xl border border-gold-500/15 bg-gradient-to-br from-gold-500/5 to-transparent p-8 overflow-hidden group"
    >
      {/* Glow on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(400px circle at 50% 0%, rgba(214,168,79,0.08), transparent 70%)" }}
      />

      <div className="flex items-start justify-between mb-6">
        <span className="font-heading text-6xl text-gold-300/20 leading-none select-none">{step.num}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300/50 mt-2">{step.detail}</span>
      </div>

      <h3 className="font-heading text-3xl text-white mb-4">{step.title}</h3>
      <p className="text-white/50 leading-relaxed">{step.copy}</p>

      {/* Bottom connector line */}
      <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold-300/20 to-transparent" />
    </motion.div>
  );
}

export function MethodSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 bg-obsidian overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gold-300/4 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-3"
          >
            Die Methode
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-heading text-4xl lg:text-5xl text-white"
          >
            Von der Idee zur{" "}
            <em className="gold-text not-italic">digitalen Goldmine.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-4 text-white/50 max-w-xl mx-auto"
          >
            Vier Schritte. Ein System. Einmal aufgebaut, dauerhaft aktiv.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
