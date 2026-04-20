"use client";

import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";
import { SectionHeading } from "@/components/section-heading";

const bullets = [
  "Warum digitale Produkte für den Einstieg schlanker sind als viele klassische Modelle",
  "Wie AI aus rohen Ideen Produkte, Module, Workbooks und Verkaufsseiten macht",
  "Welche Funnel-Bausteine du brauchst, um nicht nur zu bauen, sondern zu verkaufen",
  "Warum 3.000 Euro monatlich ein sinnvoller Zielrahmen ist, aber kein garantiertes Versprechen",
];

export default function WebinarPage() {
  return (
    <>
      <section className="py-24 bg-obsidian">
        <div className="mx-auto max-w-7xl px-6 grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="eyebrow mb-5">Kostenloses Training</p>
            <h1 className="font-heading text-5xl lg:text-6xl leading-[1.05] text-white">
              Wie du mit AI dein erstes digitales Produkt baust und automatisiert verkaufst.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/50">
              Ohne Lager, ohne Retouren, ohne monatelange Produktentwicklung. Das Webinar zeigt den AI-Goldmining-Prozess von Idee bis Verkaufssystem.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#anmeldung">Gratis Zugang sichern</Button>
              <Button href="/kurse" variant="secondary">Kurse ansehen</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="panel-surface rounded-2xl p-6"
          >
            <div className="aspect-video rounded-xl border border-gold-500/20 bg-obsidian p-8">
              <div className="flex h-full items-center justify-center rounded-xl bg-gold-500/10">
                <PlayCircle aria-hidden className="h-20 w-20 text-gold-300" />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 text-sm font-semibold text-gold-100">
              <CalendarClock aria-hidden className="h-5 w-5" />
              On-Demand Webinar, Demo-Link konfigurierbar
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-obsidian">
        <div className="mx-auto max-w-7xl px-6 grid gap-10 lg:grid-cols-[0.85fr_1fr]">
          <SectionHeading
            eyebrow="Was du lernst"
            title="Ein klarer Einstieg statt AI-Chaos."
            copy="Das Webinar verkauft keinen Traum. Es zeigt dir die Bausteine, die du wirklich brauchst, um aus einer Idee ein kaufbares digitales Produkt zu machen."
          />
          <div className="grid gap-4">
            {bullets.map((bullet, i) => (
              <motion.div
                key={bullet}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="panel-surface flex gap-3 rounded-2xl p-5"
              >
                <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                <p className="leading-7 text-white/80">{bullet}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <motion.section
        id="anmeldung"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="py-24 bg-obsidian/80 border-t border-white/5"
      >
        <div className="mx-auto max-w-7xl px-6 grid gap-8 lg:grid-cols-[0.85fr_1fr]">
          <SectionHeading
            eyebrow="Anmeldung"
            title="Sichere dir den kostenlosen Zugang."
            copy="Deine Daten werden im Live-Modus in Supabase gespeichert. Ohne Keys bestätigt der Demo-Modus die Anmeldung lokal."
          />
          <div className="panel-surface rounded-2xl p-6">
            <LeadForm source="webinar" />
          </div>
        </div>
      </motion.section>
    </>
  );
}
