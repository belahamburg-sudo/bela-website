"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import { ArrowRight } from "lucide-react";

const PROBLEMS = [
  { num: "01", name: "Dropshipping", why: "Kapitalintensiv: Testing-Budget, Logistik, Retouren, lange Margen-Kette." },
  { num: "02", name: "Agenturen", why: "Zeit gegen Geld: dauerhaft neue Kunden nötig, schwer skalierbar." },
  { num: "03", name: "SaaS", why: "Technik-lastig: Monate Entwicklungszeit, Support, Startkapital." },
  { num: "04", name: "Affiliate Marketing", why: "Plattform-abhängig: Provisionen sinken, du baust auf fremdem Grund." },
  { num: "05", name: "1:1 Coaching", why: "Zeit-Deckel bleibt: mehr Kunden bedeutet mehr Stunden, kein Ausweg." },
  { num: "06", name: "Amazon FBA", why: "Lagerkosten, steigende Gebühren, Listing-Krieg gegen tausende Konkurrenten." },
  { num: "07", name: "YouTube / Content", why: "Jahre bis zur Monetarisierung: Algorithmus-Risiko, kein stabiles Einkommen." },
  { num: "08", name: "SMMA", why: "Dauerschleife: ständige Kundenakquise, hohe Erwartungen, schwer skalierbare Dienstleistung." },
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
    <section className="relative py-20 lg:py-28 bg-obsidian overflow-hidden">
      {/* Warm cone glow on the right instead of a photo texture */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-2/3"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 85% 35%, rgba(201,169,97,0.10), transparent 65%)," +
            "radial-gradient(ellipse 60% 60% at 95% 90%, rgba(138,115,64,0.08), transparent 70%)",
        }}
      />
      <div className="dust-overlay" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-20 items-start mb-10 lg:mb-14">
          <div ref={headingRef} style={{ opacity: 0 }}>
            <p className="eyebrow mb-6 mx-auto"><span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300 shadow-[0_0_6px_rgba(201, 169, 97,0.55)]" aria-hidden />Der Ausgangspunkt</p>
            <h2 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(1.85rem, 8vw, 5.5rem)" }}>
              Wer jetzt nicht handelt,{" "}
              <span className="gold-text">verliert.</span>{" "}
              AI kickt dich raus.
            </h2>
          </div>

          <ul ref={listRef} className="space-y-6 lg:space-y-8 pt-2">
            {PROBLEMS.map((p) => (
              <li key={p.num} className="flex gap-4 lg:gap-6 items-start" style={{ opacity: 0 }}>
                <span className="font-heading tracking-gta text-3xl lg:text-4xl text-gold-300/60 leading-none select-none shrink-0 w-8 lg:w-10 text-right" style={{ textShadow: "0 0 10px rgba(201, 169, 97,0.3)" }}>
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

        {/* Solution CTA: one strong sentence as a single prominent gold button */}
        <div ref={solutionRef} className="flex justify-center" style={{ opacity: 0 }}>
          <a
            href="/webinar"
            className="btn-shimmer group inline-flex max-w-3xl items-center justify-center rounded-full bg-gold-gradient px-10 py-6 text-center text-base font-bold leading-snug text-obsidian shadow-[0_30px_80px_-30px_rgba(201,169,97,0.6)] transition-all hover:brightness-110 sm:px-14 sm:py-7 sm:text-lg lg:text-xl"
          >
            <span className="relative z-[2] inline-flex items-center gap-3">
              Jedes Modell oben kostet dich Jahre, Kapital oder beides. Es gibt genau einen Weg, der das überspringt.
              <ArrowRight className="hidden h-5 w-5 shrink-0 sm:inline" aria-hidden />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
