"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Idee finden",
    copy: "Aus Skill, Interesse oder Problem wird ein konkretes digitales Produkt — eine klare Entscheidung.",
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
    copy: "Store, Webinar, Newsletter, Community als System. Du baust einmal — es läuft.",
    detail: "Funnel-Map + Launch-Playbook",
    icon: "🚀",
  },
];

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
        delay: stagger(120),
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
        translateX: [-30, 0],
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
        <div ref={headingRef} className="mb-16 lg:mb-24" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6">🎯 MISSION 7</p>
          <h2 className="font-heading tracking-gta leading-tight text-cream max-w-3xl" style={{ fontSize: "clamp(1.75rem, 8vw, 5rem)" }}>
            VON DER IDEE ZUR{" "}
            <span className="gold-text">DIGITALEN GOLDMINE</span>
          </h2>
          <p className="mt-6 text-cream/40 max-w-xl text-base lg:text-lg leading-relaxed">
            Vier klare Schritte. Ein System, das funktioniert. Einmal aufgebaut, läuft es von selbst.
          </p>
        </div>

        {/* ── Desktop: Clean grid layout ── */}
        <div
          ref={cardsRef}
          className="hidden lg:grid lg:grid-cols-4 gap-6 mb-12"
        >
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="method-card group relative"
              style={{ opacity: 0 }}
            >
              {/* Connection arrow */}
              {i < STEPS.length - 1 && (
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-gold-300/30 group-hover:text-gold-300/60 transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}

              {/* Card */}
              <div className="relative border-2 border-gold-300/30 rounded-sm bg-gradient-to-br from-gold-300/10 to-transparent p-6 h-full flex flex-col hover:border-gold-300/60 hover:bg-gradient-to-br hover:from-gold-300/20 hover:to-transparent transition-all duration-300 shadow-[inset_0_0_20px_rgba(240,180,41,0.05)]">
                <div className="absolute -top-2 -left-2 w-2 h-2 bg-gold-300/50 rounded-full" />
                <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-gold-300/50 rounded-full" />
                {/* Icon + Number */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="font-heading tracking-gta text-2xl text-gold-300/40 leading-none">
                    {step.num}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading tracking-gta text-lg text-cream mb-3 leading-tight flex-shrink-0">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-cream/50 text-sm leading-relaxed mb-4 flex-grow">
                  {step.copy}
                </p>

                {/* Detail */}
                <p className="gta-label text-gold-300/35 text-xs">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Info box */}
        <div className="hidden lg:block">
          <div className="relative rounded-sm border border-gold-300/15 bg-white/[0.02] p-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-sm border border-gold-300/30 bg-gold-300/5">
                  <span className="text-lg">✨</span>
                </div>
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

        {/* ── Mobile: vertical stack ── */}
        <div ref={mobileListRef} className="lg:hidden space-y-4">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="mobile-step relative"
              style={{ opacity: 0 }}
            >
              <div className="border-2 border-gold-300/30 rounded-sm bg-gradient-to-b from-gold-300/8 to-transparent p-5">
                <div className="flex gap-3 items-start mb-3">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="font-heading tracking-gta text-lg text-gold-300/60 leading-none">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-heading tracking-gta text-base text-cream mb-2 uppercase">{step.title}</h3>
                <p className="text-cream/60 text-sm leading-relaxed mb-2">{step.copy}</p>
                <p className="mission-text text-gold-300/50 text-xs">[{step.detail}]</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="h-4 w-4 text-gold-300/20 rotate-90" />
                </div>
              )}
            </div>
          ))}

          <div className="rounded-sm border-2 border-gold-300/30 bg-gradient-to-br from-gold-300/12 to-transparent p-5 mt-6">
            <h4 className="font-heading tracking-gta text-cream mb-2 text-sm uppercase">🏆 MISSION COMPLETE</h4>
            <p className="text-cream/60 text-xs leading-relaxed">
              Eine automatisierte Pipeline. Fast reine Marge. Keine Abhängigkeiten.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
