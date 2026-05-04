"use client";

import { useEffect, useRef, useState } from "react";
import { animate, onScroll } from "animejs";
import { Search } from "lucide-react";
import Link from "next/link";

const SEARCHES = [
  "Wie trainiere ich meinen Hund",
  "Wie verbessere ich meinen Golfschwung",
  "Wie lerne ich Spanisch in 3 Monaten",
  "Wie starte ich ein Online Business",
  "Wie baue ich ein digitales Produkt mit AI",
];

export function HowItWorksSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentSearch, setCurrentSearch] = useState(0);

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }
    if (contentRef.current) {
      const anim = animate(contentRef.current, { opacity: [0, 1], translateY: [20, 0], duration: 800, delay: 200, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: contentRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSearch((i) => (i + 1) % SEARCHES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 lg:py-40 bg-obsidian overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-gradient/[0.03] blur-[140px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div ref={headingRef} style={{ opacity: 0 }}>
          <p className="eyebrow mb-6 mx-auto">🎯 Das System</p>
          <h2 className="font-heading tracking-gta leading-none text-cream mb-8 lg:mb-12" style={{ fontSize: "clamp(1.75rem, 8vw, 5rem)" }}>
            Wie <span className="gold-text">AI Goldmining</span><br />funktioniert
          </h2>
        </div>

        <div ref={contentRef} style={{ opacity: 0 }}>
          {/* Animated search bar */}
          <div className="mx-auto max-w-lg mb-8 lg:mb-12 rounded-sm border border-gold-300/20 bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-[0_0_0_1px_rgba(232,192,64,0.03)]">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Search className="h-4 w-4 text-cream/30 shrink-0" />
              <span
                className="text-cream/70 text-sm text-left flex-1 min-h-[1.25rem] transition-all duration-500"
                key={currentSearch}
              >
                {SEARCHES[currentSearch]}
              </span>
              <span className="inline-block w-[2px] h-4 bg-gold-gradient/70 animate-pulse shrink-0" />
            </div>
          </div>

          <p className="text-cream/50 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-5">
            Jeden Tag suchen Millionen Menschen nach Lösungen für ihre Probleme. Wie sie ihren Hund erziehen,
            ihren Golfschwung verbessern, eine Sprache lernen oder ein Business starten.
          </p>
          <p className="text-cream/50 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-5">
            Bei <span className="text-gold-300 font-semibold">AI Goldmining</span> lernst du, wie du mit AI in Stunden
            statt Wochen digitale Produkte erstellst, die genau diese Probleme lösen: und sie automatisiert verkaufst.
            Jeder Verkauf ist fast 100% Marge.
          </p>

          <p className="text-cream/50 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-5">
            Es ist wie mit Äpfeln im Supermarkt: Theoretisch könntest du zum Apfelbaum gehen und selbst pflücken.
            Trotzdem zahlen Millionen Menschen jeden Tag dafür, dass jemand anderes ihnen den Apfel fertig in die Hand legt.
            Genau das machst du mit Wissen: einmal aufgebaut, läuft es.
          </p>

          <p className="font-heading tracking-gta text-xl lg:text-3xl text-cream mt-8 lg:mt-10 mb-10 px-2 sm:px-0">
            Du baust ein System,{" "}
            <span className="gold-text">das auch wenn du schläfst arbeitet.</span>
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/webinar"
              className="btn-shimmer inline-flex items-center gap-2 rounded-full bg-gold-gradient px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:brightness-110 shadow-[0_0_30px_rgba(232,192,64,0.35)]"
            >
              Webinar starten →
            </Link>
            <Link
              href="/kurse"
              className="inline-flex items-center gap-2 rounded-full border border-gold-300/40 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-cream/80 transition-all hover:border-gold-300/80 hover:text-cream hover:bg-gold-gradient/5"
            >
              Kurse ansehen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
