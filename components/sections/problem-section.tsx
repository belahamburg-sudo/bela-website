"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import { Button } from "@/components/button";

const PROBLEMS = [
  { num: "01", name: "Dropshipping", why: "Kapitalintensiv: Testing-Budget, Logistik, Retouren, lange Margen-Kette." },
  { num: "02", name: "Agenturen", why: "Zeit gegen Geld: dauerhaft neue Kunden nötig, schwer skalierbar." },
  { num: "03", name: "SaaS", why: "Technik-lastig: Monate Entwicklungszeit, Support, Startkapital." },
  { num: "04", name: "Affiliate Marketing", why: "Plattform-abhängig: Provisionen sinken, du baust auf fremdem Grund." },
  { num: "05", name: "1:1 Coaching", why: "Zeit-Deckel bleibt: mehr Kunden bedeutet mehr Stunden, kein Ausweg." },
  { num: "06", name: "Amazon FBA", why: "Lagerkosten, steigende Gebühren, Listing-Krieg gegen tausende Konkurrenten." },
  { num: "07", name: "YouTube / Content", why: "Jahre bis zur Monetarisierung: Algorithmus-Risiko, kein stabiles Einkommen." },
];

export function ProblemSection() {
  const listRef = useRef<HTMLUListElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>("li");
      const anim = animate(items, { opacity: [0, 1], translateX: [-40, 0], delay: stagger(120), duration: 700, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: listRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (solutionRef.current) {
      const anim = animate(solutionRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 900, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: solutionRef.current, enter: "bottom-=5% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="relative py-20 lg:py-40 bg-obsidian overflow-hidden">
      {/* Muted gold-bars image as texture on the right */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/2"
        aria-hidden
        style={{
          backgroundImage: "url('/assets/gold-bars.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
          filter: "saturate(0.5)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-20 items-start mb-16 lg:mb-24">
          <div ref={headingRef} style={{ opacity: 0 }}>
            <p className="eyebrow mb-6 mx-auto">🎯 Der Ausgangspunkt</p>
            <h2 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(1.85rem, 8vw, 5.5rem)" }}>
              Wer jetzt nicht handelt,{" "}
              <span className="gold-text">verliert.</span>{" "}
              AI kickt dich raus.
            </h2>
          </div>

          <ul ref={listRef} className="space-y-6 lg:space-y-8 pt-2">
            {PROBLEMS.map((p) => (
              <li key={p.num} className="flex gap-4 lg:gap-6 items-start" style={{ opacity: 0 }}>
                <span className="font-heading tracking-gta text-3xl lg:text-4xl text-gold-300/60 leading-none select-none shrink-0 w-8 lg:w-10 text-right" style={{ textShadow: "0 0 10px rgba(212,175,55,0.3)" }}>
                  {p.num}
                </span>
                <div>
                  <h3 className="font-heading tracking-gta text-xl lg:text-2xl text-cream/40 mb-1 lg:mb-1 line-through decoration-gold-300/20 decoration-2">
                    {p.name}
                  </h3>
                  <p className="text-cream/35 leading-relaxed text-xs lg:text-sm">{p.why}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Solution strip: full-width like a wanted poster */}
        <div
          ref={solutionRef}
          className="relative overflow-hidden rounded-sm border border-gold-300/20 p-6 lg:p-12"
          style={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.06), transparent 60%)",
            }}
            aria-hidden
          />
          {/* Notched corner accent */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold-300/60" aria-hidden />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold-300/60" aria-hidden />

          <div className="relative grid lg:grid-cols-[auto_1fr] gap-6 lg:gap-8 items-center">
            <span className="eyebrow shrink-0">Die Lösung</span>
            <div>
              <p className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(1.4rem, 6vw, 3.2rem)" }}>
                Digitale Produkte: einmal bauen,{" "}
                <span className="gold-text">dauerhaft verkaufen.</span>{" "}
                Fast reine Marge. Mit AI in Tagen.
              </p>
              <div className="mt-6">
                <Button href="/webinar">
                  Webinar starten →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
