"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";

const STEPS = [
  {
    num: "01",
    title: "Idee finden",
    copy: "Aus Skill, Interesse oder Problem wird ein konkretes digitales Produkt: eine klare Entscheidung.",
    detail: "Framework + AI-Validierungsprompts",
    icon: "💡",
  },
  {
    num: "02",
    title: "Mit AI bauen",
    copy: "AI übernimmt Struktur, Copy, Workbook und Assets. Du bleibst im Driver-Seat für Qualität.",
    detail: "Prompt-Packs für jede Phase",
    icon: "🤖",
  },
  {
    num: "03",
    title: "Sauber verpacken",
    copy: "Name, Promise, Module, Verkaufsseite. Aus einem Draft wird ein kaufbares Angebot.",
    detail: "Template-System für Sales-Pages",
    icon: "📦",
  },
  {
    num: "04",
    title: "Automatisiert verkaufen",
    copy: "Store, Webinar, Newsletter, Community als System. Du baust einmal: es läuft.",
    detail: "Funnel-Map + Launch-Playbook",
    icon: "🚀",
  },
];

const ELEVATION = [0, 70, 140, 210];

export function MethodSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const mobileListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll<HTMLElement>(".method-card");
      const anim = animate(cards, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(150),
        duration: 700,
        ease: "outExpo",
        autoplay: false,
      });
      const obs = onScroll({ target: cardsRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (mobileListRef.current) {
      const rows = mobileListRef.current.querySelectorAll<HTMLElement>(".mobile-step");
      const anim = animate(rows, {
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: stagger(100),
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gold-300/[0.03] blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div ref={headingRef} className="mb-16 lg:mb-20" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6 mx-auto">🎯 Die Methode</p>
          <h2 className="font-heading tracking-gta leading-tight text-cream max-w-3xl" style={{ fontSize: "clamp(1.75rem, 8vw, 5rem)" }}>
            Von der Idee zur{" "}
            <span className="gold-text">digitalen Goldmine</span>
          </h2>
          <p className="mt-6 text-cream/40 max-w-xl text-base lg:text-lg leading-relaxed">
            Vier Schritte. Ein System. Einmal aufgebaut, läuft es von selbst.
          </p>
        </div>

        {/* ── Desktop: Mountain path ── */}
        <div
          ref={cardsRef}
          className="hidden lg:block relative"
          style={{ paddingTop: "240px", paddingBottom: "40px" }}
        >
          {/* Mountain slope background */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 540"
            preserveAspectRatio="none"
            aria-hidden
          >
            {/* Slope fill */}
            <polygon points="0,510 1200,130 1200,540 0,540" fill="rgba(200,146,42,0.018)" />
            {/* Slope edge */}
            <line x1="0" y1="510" x2="1200" y2="130" stroke="rgba(200,146,42,0.07)" strokeWidth="1.5" />
            {/* Trail path connecting card centers */}
            <path
              d="M 150,375 L 450,305 L 750,235 L 1050,165"
              stroke="rgba(200,146,42,0.3)"
              strokeWidth="2"
              strokeDasharray="8 5"
              fill="none"
            />
            {/* Trail markers */}
            <circle cx="150" cy="375" r="5" fill="rgba(200,146,42,0.4)" />
            <circle cx="450" cy="305" r="5" fill="rgba(200,146,42,0.4)" />
            <circle cx="750" cy="235" r="5" fill="rgba(200,146,42,0.4)" />
            <circle cx="1050" cy="165" r="7" fill="rgba(200,146,42,0.7)" />
          </svg>

          {/* Ascending cards */}
          <div className="flex items-end gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="flex-1 relative"
                style={{ transform: `translateY(-${ELEVATION[i]}px)` }}
              >
                {/* Summit label */}
                {i === STEPS.length - 1 && (
                  <p className="absolute -top-8 left-0 right-0 text-center text-[0.6rem] font-heading tracking-gta text-gold-300/70 uppercase">
                    ⛰ Gipfel
                  </p>
                )}

                <div
                  className={`method-card relative border-2 rounded-sm bg-gradient-to-br p-6 flex flex-col transition-all duration-300 ${
                    i === STEPS.length - 1
                      ? "border-gold-300/55 from-gold-300/15 to-transparent shadow-[0_0_40px_rgba(200,146,42,0.12)]"
                      : "border-gold-300/20 from-gold-300/8 to-transparent hover:border-gold-300/40 hover:from-gold-300/14"
                  }`}
                  style={{ opacity: 0 }}
                >
                  <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-gold-300/40 rounded-full" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-gold-300/40 rounded-full" />

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{step.icon}</span>
                    <span className="font-heading tracking-gta text-2xl text-gold-300/40 leading-none">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="font-heading tracking-gta text-lg text-cream mb-3 leading-tight">
                    {step.title}
                  </h3>

                  <p className="text-cream/50 text-sm leading-relaxed mb-4 flex-grow">
                    {step.copy}
                  </p>

                  <p className="gta-label text-gold-300/35 text-xs">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Result box */}
          <div className="mt-16 relative rounded-sm border border-gold-300/15 bg-white/[0.02] p-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-sm border border-gold-300/30 bg-gold-300/5">
                <span className="text-lg">✨</span>
              </div>
              <div className="flex-grow">
                <h4 className="font-heading tracking-gta text-cream mb-2">Das Ergebnis</h4>
                <p className="text-cream/50 text-sm leading-relaxed">
                  Eine automatisierte Verkaufs-Pipeline, die für dich arbeitet, während du schläfst. Fast reine Marge. Kein Kapital. Keine Abhängigkeiten.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile: Trail path ── */}
        <div ref={mobileListRef} className="lg:hidden">
          <div className="relative">
            {/* Vertical trail line */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: "1.125rem",
                top: "1.5rem",
                bottom: "5rem",
                width: "2px",
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(200,146,42,0.3) 0px, rgba(200,146,42,0.3) 6px, transparent 6px, transparent 12px)",
              }}
            />

            <div className="space-y-6">
              {STEPS.map((step, i) => (
                <div key={step.num} className="mobile-step relative pl-12" style={{ opacity: 0 }}>
                  {/* Trail marker */}
                  <div className="absolute left-[0.625rem] top-[1.1rem] flex items-center justify-center w-4 h-4 rounded-full border border-gold-300/50 bg-obsidian z-10">
                    <div
                      className={`rounded-full ${
                        i === STEPS.length - 1 ? "w-2 h-2 bg-gold-300" : "w-1.5 h-1.5 bg-gold-300/55"
                      }`}
                    />
                  </div>

                  <div
                    className={`border rounded-sm p-5 bg-gradient-to-b ${
                      i === STEPS.length - 1
                        ? "border-gold-300/50 from-gold-300/12 to-transparent"
                        : "border-gold-300/20 from-gold-300/6 to-transparent"
                    }`}
                  >
                    <div className="flex gap-3 items-center mb-3">
                      <span className="text-xl">{step.icon}</span>
                      <span className="font-heading tracking-gta text-sm text-gold-300/60">{step.num}</span>
                      {i === STEPS.length - 1 && (
                        <span className="ml-auto text-[0.6rem] font-heading tracking-gta text-gold-300/70 uppercase">
                          ⛰ Gipfel
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading tracking-gta text-base text-cream mb-2 uppercase">
                      {step.title}
                    </h3>
                    <p className="text-cream/60 text-sm leading-relaxed mb-2">{step.copy}</p>
                    <p className="gta-label text-gold-300/50 text-xs">[{step.detail}]</p>
                  </div>
                </div>
              ))}

              {/* Summit complete */}
              <div className="relative pl-12">
                <div className="absolute left-[0.5rem] top-[0.9rem] flex items-center justify-center w-5 h-5 rounded-full border-2 border-gold-300/55 bg-gold-300/10 z-10">
                  <span className="text-[0.6rem] leading-none">🏆</span>
                </div>
                <div className="border-2 border-gold-300/30 bg-gradient-to-br from-gold-300/12 to-transparent p-5 rounded-sm">
                  <h4 className="font-heading tracking-gta text-cream mb-2 text-sm uppercase">
                    🏆 Mission Complete
                  </h4>
                  <p className="text-cream/60 text-xs leading-relaxed">
                    Eine automatisierte Pipeline. Fast reine Marge. Keine Abhängigkeiten.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
