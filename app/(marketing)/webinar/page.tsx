"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { animate, onScroll, stagger } from "animejs";
import { PlayCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";

const BULLETS = [
  { num: "01", text: "Warum digitale Produkte für den Einstieg schlanker sind als viele klassische Modelle" },
  { num: "02", text: "Wie AI aus rohen Ideen Produkte, Module, Workbooks und Verkaufsseiten macht" },
  { num: "03", text: "Welche Funnel-Bausteine du brauchst, um nicht nur zu bauen, sondern zu verkaufen" },
  { num: "04", text: "Warum 3.000 Euro monatlich ein sinnvoller Zielrahmen ist, aber kein garantiertes Versprechen" },
];

const PERKS = [
  "Kostenlos & sofort verfügbar",
  "Kein Tech-Vorwissen nötig",
  "Unter 60 Minuten",
];

export default function WebinarPage() {
  const bulletsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!bulletsRef.current) return;
    const items = bulletsRef.current.querySelectorAll<HTMLElement>("li");
    const anim = animate(items, { opacity: [0, 1], translateY: [20, 0], delay: stagger(100), duration: 600, ease: "outExpo", autoplay: false });
    const obs = onScroll({ target: bulletsRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
    return () => { anim.revert(); obs.revert(); };
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-obsidian pt-28 pb-24 overflow-hidden">
        {/* Subtle gold glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(240,180,41,0.09) 0%, transparent 70%)" }}
        />
        {/* Top divider line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-300/30 to-transparent" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="eyebrow mb-6 justify-center">Kostenloses Training</p>
            <h1
              className="font-heading font-extrabold uppercase tracking-gta leading-none text-cream mb-5"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 5.5rem)" }}
            >
              Wie du mit AI dein erstes digitales Produkt baust und{" "}
              <span className="gold-text">automatisiert verkaufst.</span>
            </h1>
            <p className="text-base sm:text-lg text-cream/50 max-w-2xl mx-auto leading-relaxed mb-8">
              Ohne Lager, ohne Retouren, ohne monatelange Produktentwicklung. Der AI-Goldmining-Prozess von Idee bis Verkaufssystem.
            </p>

            {/* Perks row */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10">
              {PERKS.map((p) => (
                <span key={p} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cream/35">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold-300/60 shrink-0" />
                  {p}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Video */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-8"
          >
            <div className="relative aspect-video rounded-sm overflow-hidden bg-graphite border border-gold-300/20">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-300/50 z-10" aria-hidden />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-300/50 z-10" aria-hidden />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-300/50 z-10" aria-hidden />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-300/50 z-10" aria-hidden />
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse at center, rgba(240,180,41,0.10) 0%, transparent 65%)" }}
                aria-hidden
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-sm border border-gold-300/40 bg-gold-300/10 backdrop-blur-sm transition-all hover:bg-gold-300/20 hover:border-gold-300/70 cursor-pointer">
                  <PlayCircle aria-hidden className="h-10 w-10 text-gold-300" />
                </div>
                <p className="gta-label text-gold-300/60">On-Demand · Jederzeit verfügbar</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-cream/25 font-semibold uppercase tracking-[0.12em]">
              <Clock className="h-3.5 w-3.5" />
              On-Demand Webinar: jederzeit abrufbar
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button href="#anmeldung">Gratis Zugang sichern →</Button>
            <Button href="/kurse" variant="secondary">Kurse ansehen</Button>
          </motion.div>
        </div>
      </section>

      {/* ── What you learn ── */}
      <section className="py-28 bg-obsidian scratch-border">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
            <div>
              <p className="eyebrow mb-5">Was du lernst</p>
              <h2
                className="font-heading font-extrabold uppercase tracking-gta leading-none text-cream"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 3.5rem)" }}
              >
                Ein klarer Einstieg statt{" "}
                <span className="gold-text">AI-Chaos.</span>
              </h2>
              <p className="mt-4 text-sm text-cream/40 leading-relaxed">
                Das Webinar verkauft keinen Traum. Es zeigt die Bausteine, die du wirklich brauchst.
              </p>
            </div>

            <ul ref={bulletsRef} className="space-y-0">
              {BULLETS.map((bullet) => (
                <li
                  key={bullet.num}
                  className="flex gap-5 items-start py-6 border-t border-gold-300/10"
                  style={{ opacity: 0 }}
                >
                  <span className="font-heading font-extrabold tracking-gta text-3xl text-gold-300/25 leading-none select-none shrink-0 w-10 text-right">
                    {bullet.num}
                  </span>
                  <p className="text-base text-cream/65 leading-relaxed pt-0.5">{bullet.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Lead form ── */}
      <section id="anmeldung" className="py-28 bg-obsidian scratch-border">
        <div className="mx-auto max-w-5xl px-6 grid gap-16 lg:grid-cols-[1fr_1.1fr] items-start">
          <div>
            <p className="eyebrow mb-5">Anmeldung</p>
            <h2
              className="font-heading font-extrabold uppercase tracking-gta leading-none text-cream"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3.5rem)" }}
            >
              Sichere dir den{" "}
              <span className="gold-text">kostenlosen Zugang.</span>
            </h2>
            <p className="mt-4 text-sm text-cream/40 leading-relaxed max-w-xs">
              Kein Spam. Sofort nach Anmeldung erhältst du den Zugangslink.
            </p>
            <div className="mt-8 space-y-3">
              {PERKS.map((p) => (
                <div key={p} className="flex items-center gap-2.5 text-sm text-cream/40">
                  <CheckCircle2 className="h-4 w-4 text-gold-300/50 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div className="panel-surface p-8">
            <LeadForm source="webinar" />
          </div>
        </div>
      </section>
    </>
  );
}
