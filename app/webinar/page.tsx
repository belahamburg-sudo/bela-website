"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { animate, onScroll, stagger } from "animejs";
import { CalendarClock, PlayCircle } from "lucide-react";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";

const BULLETS = [
  { num: "01", text: "Warum digitale Produkte für den Einstieg schlanker sind als viele klassische Modelle" },
  { num: "02", text: "Wie AI aus rohen Ideen Produkte, Module, Workbooks und Verkaufsseiten macht" },
  { num: "03", text: "Welche Funnel-Bausteine du brauchst, um nicht nur zu bauen, sondern zu verkaufen" },
  { num: "04", text: "Warum 3.000 Euro monatlich ein sinnvoller Zielrahmen ist, aber kein garantiertes Versprechen" },
];

export default function WebinarPage() {
  const bulletsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!bulletsRef.current) return;
    const items = bulletsRef.current.querySelectorAll<HTMLElement>("li");
    const anim = animate(items, {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(120),
      duration: 700,
      ease: "outExpo",
      autoplay: false,
    });
    const obs = onScroll({
      target: bulletsRef.current,
      enter: "bottom-=10% top",
      onEnter: () => anim.play(),
    });
    return () => { anim.revert(); obs.revert(); };
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="py-32 bg-obsidian">
        <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="eyebrow mb-6">Kostenloses Training</p>
            <h1 className="font-heading text-5xl lg:text-6xl leading-[1.05] text-white mb-6">
              Wie du mit AI dein erstes digitales Produkt baust und{" "}
              <em className="gold-text not-italic">automatisiert verkaufst.</em>
            </h1>
            <p className="text-lg leading-relaxed text-white/50 mb-10 max-w-xl">
              Ohne Lager, ohne Retouren, ohne monatelange Produktentwicklung. Der AI-Goldmining-Prozess von Idee bis Verkaufssystem.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="#anmeldung">Gratis Zugang sichern</Button>
              <Button href="/kurse" variant="secondary">Kurse ansehen</Button>
            </div>
          </motion.div>

          {/* Video placeholder — atmospheric gold glow, no panel-surface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-obsidian border border-white/[0.06]">
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse at center, rgba(214,168,79,0.18) 0%, transparent 65%)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold-300/40 bg-gold-500/10 backdrop-blur-sm transition-all hover:bg-gold-500/20 hover:border-gold-300/70 cursor-pointer">
                    <PlayCircle aria-hidden className="h-10 w-10 text-gold-300" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300/60">
                    On-Demand · Jederzeit verfügbar
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-white/30">
              <CalendarClock aria-hidden className="h-4 w-4" />
              On-Demand Webinar — jederzeit abrufbar
            </div>
          </motion.div>
        </div>
      </section>

      {/* What you learn — numbered editorial list */}
      <section className="py-32 bg-obsidian">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-20 items-start">
            <div>
              <p className="eyebrow mb-6">Was du lernst</p>
              <h2 className="font-heading text-4xl lg:text-5xl leading-[1.05] text-white">
                Ein klarer Einstieg statt{" "}
                <em className="gold-text not-italic">AI-Chaos.</em>
              </h2>
              <p className="mt-5 text-white/40 leading-relaxed">
                Das Webinar verkauft keinen Traum. Es zeigt die Bausteine, die du wirklich brauchst.
              </p>
            </div>

            <ul ref={bulletsRef} className="space-y-0">
              {BULLETS.map((bullet) => (
                <li
                  key={bullet.num}
                  className="flex gap-6 items-start py-8 border-t border-white/[0.06]"
                  style={{ opacity: 0 }}
                >
                  <span className="font-heading text-4xl text-gold-300/25 leading-none select-none shrink-0 w-10 text-right">
                    {bullet.num}
                  </span>
                  <p className="text-lg text-white/70 leading-relaxed pt-1">{bullet.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Lead form — no panel-surface wrapper */}
      <section id="anmeldung" className="py-32 bg-obsidian border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-[1fr_1fr] items-start">
          <div>
            <p className="eyebrow mb-6">Anmeldung</p>
            <h2 className="font-heading text-4xl lg:text-5xl leading-[1.05] text-white">
              Sichere dir den{" "}
              <em className="gold-text not-italic">kostenlosen Zugang.</em>
            </h2>
            <p className="mt-5 text-white/40 leading-relaxed max-w-sm">
              Kein Spam. Sofort nach Anmeldung erhältst du den Zugangslink.
            </p>
          </div>
          <div>
            <LeadForm source="webinar" />
          </div>
        </div>
      </section>
    </>
  );
}
