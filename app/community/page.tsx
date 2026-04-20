"use client";

import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";
import { SectionHeading } from "@/components/section-heading";
import { telegramUrl } from "@/lib/env";

const communityItems = [
  "Produktideen und Beispiele",
  "AI-Prompts für digitale Produkte",
  "Launch-Updates und neue Kurse",
  "Kurze, direkte Umsetzungsschritte",
];

export default function CommunityPage() {
  return (
    <>
      <section className="py-24 bg-obsidian">
        <div className="mx-auto max-w-7xl px-6 grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="eyebrow mb-5">Telegram Community</p>
            <h1 className="font-heading text-5xl lg:text-6xl leading-[1.05] text-white">
              Starte nicht allein. Baue mit anderen digitale Produkte mit AI.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/50">
              Die kostenlose Community ist der schnelle Einstieg für Produktideen, AI-Prompts, Umsetzungsimpulse und Updates zu neuen Mini-Kursen.
            </p>
            <Button href={telegramUrl} className="mt-8">
              <MessageCircle aria-hidden className="h-4 w-4" />
              Telegram beitreten
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="panel-surface rounded-2xl p-6"
          >
            <Users aria-hidden className="h-10 w-10 text-gold-300" />
            <h2 className="mt-5 font-heading text-3xl text-white">Was in der Community passiert</h2>
            <div className="mt-6 grid gap-3">
              {communityItems.map((item, i) => (
                <motion.p
                  key={item}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
                  className="text-sm leading-7 text-white/50 flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-gold-300/60 flex-none" />
                  {item}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="py-24 bg-obsidian/80 border-t border-white/5"
      >
        <div className="mx-auto max-w-7xl px-6 grid gap-8 lg:grid-cols-[0.85fr_1fr]">
          <SectionHeading
            eyebrow="Community Lead"
            title="Trag dich ein und komm in den nächsten Schritt."
            copy="So kann Bela dich später auch außerhalb von Telegram mit Webinar, Kursen und neuen Produktideen erreichen."
          />
          <div className="panel-surface rounded-2xl p-6">
            <LeadForm source="community" />
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="py-20 bg-obsidian border-t border-white/5"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="panel-surface flex flex-col gap-5 rounded-2xl p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Sparkles aria-hidden className="mb-4 h-8 w-8 text-gold-300" />
              <h2 className="font-heading text-3xl text-white">
                Community ist Einstieg, Kurse sind Umsetzung.
              </h2>
              <p className="mt-3 max-w-2xl text-white/50">
                Wenn du tiefer bauen willst, geh vom Impuls in einen konkreten Mini-Kurs.
              </p>
            </div>
            <Button href="/kurse" variant="secondary">Kurse ansehen</Button>
          </div>
        </div>
      </motion.section>
    </>
  );
}
