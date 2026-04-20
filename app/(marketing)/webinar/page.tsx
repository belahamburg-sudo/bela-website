"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
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
    const anim = animate(items, { opacity: [0, 1], translateY: [30, 0], delay: stagger(120), duration: 700, ease: "outExpo", autoplay: false });
    const obs = onScroll({ target: bulletsRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
    return () => { anim.revert(); obs.revert(); };
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative py-32 bg-obsidian overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/assets/ai-goldmining-banner.jpeg"
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-obsidian/82" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-obsidian" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="eyebrow mb-6">Kostenloses Training</p>
            <h1 className="font-heading tracking-gta leading-none text-cream mb-6" style={{ fontSize: "clamp(2.5rem,5.5vw,5.5rem)" }}>
              WIE DU MIT AI DEIN ERSTES DIGITALES PRODUKT BAUST UND{" "}
              <span className="gold-text">AUTOMATISIERT VERKAUFST.</span>
            </h1>
            <p className="text-lg leading-relaxed text-cream/50 mb-10 max-w-xl">
              Ohne Lager, ohne Retouren, ohne monatelange Produktentwicklung. Der AI-Goldmining-Prozess von Idee bis Verkaufssystem.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="#anmeldung">Gratis Zugang sichern</Button>
              <Button href="/kurse" variant="secondary">Kurse ansehen</Button>
            </div>
          </motion.div>

          {/* Video placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative aspect-video rounded-sm overflow-hidden bg-obsidian border border-gold-300/15">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-300/50 z-10" aria-hidden />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-300/50 z-10" aria-hidden />
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse at center, rgba(240,180,41,0.14) 0%, transparent 65%)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-sm border border-gold-300/40 bg-gold-300/10 backdrop-blur-sm transition-all hover:bg-gold-300/20 hover:border-gold-300/70 cursor-pointer">
                    <PlayCircle aria-hidden className="h-10 w-10 text-gold-300" />
                  </div>
                  <p className="gta-label text-gold-300/60">
                    On-Demand · Jederzeit verfügbar
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-cream/30">
              <CalendarClock aria-hidden className="h-4 w-4" />
              On-Demand Webinar — jederzeit abrufbar
            </div>
          </motion.div>
        </div>
      </section>

      {/* What you learn */}
      <section className="py-32 bg-obsidian scratch-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-20 items-start">
            <div>
              <p className="eyebrow mb-6">Was du lernst</p>
              <h2 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(2rem,4vw,4rem)" }}>
                EIN KLARER EINSTIEG STATT{" "}
                <span className="gold-text">AI-CHAOS.</span>
              </h2>
              <p className="mt-5 text-cream/40 leading-relaxed">
                Das Webinar verkauft keinen Traum. Es zeigt die Bausteine, die du wirklich brauchst.
              </p>
            </div>

            <ul ref={bulletsRef} className="space-y-0">
              {BULLETS.map((bullet) => (
                <li
                  key={bullet.num}
                  className="flex gap-6 items-start py-8 border-t border-gold-300/10"
                  style={{ opacity: 0 }}
                >
                  <span className="font-heading tracking-gta text-4xl text-gold-300/25 leading-none select-none shrink-0 w-10 text-right">
                    {bullet.num}
                  </span>
                  <p className="text-lg text-cream/70 leading-relaxed pt-1">{bullet.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Lead form */}
      <section id="anmeldung" className="py-32 bg-obsidian scratch-border">
        <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-[1fr_1fr] items-start">
          <div>
            <p className="eyebrow mb-6">Anmeldung</p>
            <h2 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(2rem,4vw,4rem)" }}>
              SICHERE DIR DEN{" "}
              <span className="gold-text">KOSTENLOSEN ZUGANG.</span>
            </h2>
            <p className="mt-5 text-cream/40 leading-relaxed max-w-sm">
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
