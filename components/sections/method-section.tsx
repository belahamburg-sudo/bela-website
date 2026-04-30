"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";

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

// Desktop: top offset (px) per step — step 1 at base, step 4 at peak
const ELEVATIONS = [216, 144, 72, 0];
const CONTAINER_H = 420;
const BAD_PATH = [292, 326, 356, 382];

export function MethodSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const mobileListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (trailRef.current) {
      const cards = trailRef.current.querySelectorAll<HTMLElement>(".trail-card");
      const anim = animate(cards, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(200),
        duration: 700,
        ease: "outExpo",
        autoplay: false,
      });
      const obs = onScroll({ target: trailRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (mobileListRef.current) {
      const rows = mobileListRef.current.querySelectorAll<HTMLElement>(".mobile-step");
      const anim = animate(rows, {
        opacity: [0, 1],
        translateX: [-30, 0],
        delay: stagger(150),
        duration: 700,
        ease: "outExpo",
        autoplay: false,
      });
      const obs = onScroll({ target: mobileListRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="relative py-16 lg:py-40 bg-obsidian overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-gold-300/[0.04] blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div ref={headingRef} className="mb-12 lg:mb-16" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6">Die Methode</p>
          <h2 className="font-heading tracking-gta leading-none text-cream max-w-3xl" style={{ fontSize: "clamp(1.75rem, 8vw, 5.5rem)" }}>
            VON DER IDEE ZUR{" "}
            <span className="gold-text">DIGITALEN GOLDMINE.</span>
          </h2>
          <p className="mt-5 text-cream/40 max-w-lg text-base lg:text-lg leading-relaxed">
            Vier Stufen. Ein System. Einmal aufgebaut, dauerhaft aktiv.
          </p>
        </div>

        {/* ── Desktop: ascending Wanderweg ── */}
        <div
          ref={trailRef}
          className="hidden lg:block relative"
          style={{ height: `${CONTAINER_H}px` }}
        >
          {/* Trail SVG — diagonal dashed line from base to peak */}
          <svg
            className="absolute inset-0 w-full pointer-events-none"
            style={{ height: `${CONTAINER_H}px`, overflow: "visible" }}
            viewBox={`0 0 100 ${CONTAINER_H}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {/* Main trail line */}
            <path
              d={`M 11,${ELEVATIONS[0] + 80} L 37,${ELEVATIONS[1] + 80} L 63,${ELEVATIONS[2] + 80} L 89,${ELEVATIONS[3] + 80}`}
              stroke="rgba(240,180,41,0.22)"
              strokeWidth="0.35"
              strokeDasharray="3 3"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M 11,${BAD_PATH[0]} L 37,${BAD_PATH[1]} L 63,${BAD_PATH[2]} L 89,${BAD_PATH[3]}`}
              stroke="rgba(255,120,120,0.22)"
              strokeWidth="0.35"
              strokeDasharray="2.5 3"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Step cards */}
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="trail-card absolute border border-gold-300/15 rounded-sm bg-obsidian p-5 hover:border-gold-300/30 transition-colors duration-300"
              style={{
                width: "22%",
                left: `${i * 26}%`,
                top: `${ELEVATIONS[i]}px`,
                opacity: 0,
              }}
            >
              {/* Waypoint dot */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full border border-gold-300/40 bg-obsidian" />

              {i === STEPS.length - 1 && (
                <span className="absolute -top-3.5 right-3 gta-label text-gold-300/70 bg-obsidian px-1.5">
                  PEAK
                </span>
              )}

              <span className="block font-heading tracking-gta text-4xl text-gold-300/20 leading-none mb-3 select-none">
                {step.num}
              </span>
              <h3 className="font-heading tracking-gta text-xl text-cream mb-2 leading-tight">
                {step.title}
              </h3>
              <p className="text-cream/45 text-sm leading-relaxed mb-3">{step.copy}</p>
              <p className="gta-label text-gold-300/35">{step.detail}</p>
            </div>
          ))}

          {/* Altitude labels */}
          {STEPS.map((step, i) => (
            <span
              key={`alt-${step.num}`}
              className="absolute gta-label text-cream/12 select-none"
              style={{
                left: `${i * 26}%`,
                top: `${ELEVATIONS[i] + 185}px`,
              }}
            >
              {i === 0 ? "START" : i === STEPS.length - 1 ? "GIPFEL" : `STUFE ${i + 1}`}
            </span>
          ))}

          <div className="absolute right-0 bottom-0 w-[24%] rounded-sm border border-red-400/10 bg-red-500/[0.03] p-4">
            <p className="gta-label text-red-200/50 mb-2">Ohne Methode</p>
            <p className="text-sm leading-relaxed text-cream/35">
              Weiter wie bisher: Zeit gegen Geld, Chaos, falsche Modelle und AI zieht an dir vorbei.
            </p>
          </div>
        </div>

        {/* ── Mobile: vertical stack with connector line ── */}
        <div ref={mobileListRef} className="lg:hidden">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="mobile-step flex gap-5 items-start py-10 border-t border-gold-300/10"
              style={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/5 font-heading tracking-gta text-sm text-gold-300/60">
                  {step.num}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 min-h-[48px] mt-2 bg-gradient-to-b from-gold-300/20 to-transparent" />
                )}
              </div>
              <div className="pt-1.5">
                <h3 className="font-heading tracking-gta text-2xl text-cream mb-2">{step.title}</h3>
                <p className="text-cream/50 leading-relaxed mb-3">{step.copy}</p>
                <p className="gta-label text-gold-300/40">{step.detail}</p>
              </div>
            </div>
          ))}

          <div className="rounded-sm border border-red-400/10 bg-red-500/[0.03] p-5">
            <p className="gta-label text-red-200/50 mb-2">Der falsche Pfad</p>
            <p className="text-cream/40 leading-relaxed">
              Wenn du weitermachst wie bisher, verlierst du Zeit, Fokus und Markt. Ohne die richtige Methode und AI bleibt nur mehr Reibung.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
