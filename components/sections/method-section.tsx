"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger, svg } from "animejs";

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

export function MethodSection() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (headingRef.current) {
      const anim = animate(headingRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        ease: "outExpo",
        autoplay: false,
      });
      const obs = onScroll({
        target: headingRef.current,
        enter: "bottom-=10% top",
        onEnter: () => anim.play(),
      });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (lineRef.current) {
      const drawable = svg.createDrawable(lineRef.current);
      const lineAnim = animate(drawable, {
        draw: ["0 0", "0 1"],
        duration: 1400,
        ease: "outExpo",
        autoplay: false,
      });
      const lineObs = onScroll({
        target: lineRef.current,
        enter: "bottom-=15% top",
        onEnter: () => lineAnim.play(),
      });
      cleanups.push(() => { lineAnim.revert(); lineObs.revert(); });
    }

    if (stepsRef.current) {
      const rows = stepsRef.current.querySelectorAll<HTMLElement>(".step-row");
      const anim = animate(rows, {
        opacity: [0, 1],
        translateY: [40, 0],
        delay: stagger(150),
        duration: 800,
        ease: "outExpo",
        autoplay: false,
      });
      const obs = onScroll({
        target: stepsRef.current,
        enter: "bottom-=10% top",
        onEnter: () => anim.play(),
      });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="relative py-40 bg-obsidian overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-gold-300/3 blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div ref={headingRef} className="mb-8" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6">Die Methode</p>
          <h2 className="font-heading text-5xl lg:text-6xl leading-[1.05] text-white max-w-2xl">
            Von der Idee zur{" "}
            <em className="gold-text not-italic">digitalen Goldmine.</em>
          </h2>
          <p className="mt-5 text-white/40 max-w-lg text-lg">
            Vier Schritte. Ein System. Einmal aufgebaut, dauerhaft aktiv.
          </p>
        </div>

        {/* Animated SVG divider line */}
        <svg className="w-full overflow-visible mb-4" height="1" aria-hidden>
          <path
            ref={lineRef}
            d="M0,0.5 L2000,0.5"
            stroke="rgba(214,168,79,0.2)"
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div ref={stepsRef} className="space-y-0">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="step-row grid grid-cols-[5rem_1fr] lg:grid-cols-[8rem_1fr] gap-8 lg:gap-16 py-12 border-t border-white/[0.06] items-start"
              style={{ opacity: 0 }}
            >
              <span className="font-heading text-5xl lg:text-7xl text-gold-300/20 leading-none select-none pt-1">
                {step.num}
              </span>
              <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-start">
                <div>
                  <h3 className="font-heading text-3xl lg:text-4xl text-white mb-3">{step.title}</h3>
                  <p className="text-white/50 leading-relaxed max-w-xl">{step.copy}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300/40 whitespace-nowrap pt-2 hidden lg:block">
                  {step.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
