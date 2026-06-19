"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import Link from "next/link";
import { Sparkles, Lightbulb, Bot, Package, Rocket } from "lucide-react";
import { RetroGrid } from "@/components/ui/retro-grid";

const STEPS = [
  {
    num: "01",
    title: "Nische finden",
    copy: "Aus Skill, Interesse oder Problem wird ein konkretes digitales Produkt: eine klare Entscheidung.",
    detail: "Framework + AI-Validierungsprompts",
    href: "/kurse/ai-goldmining-method",
    Icon: Lightbulb,
  },
  {
    num: "02",
    title: "Mit AI bauen",
    copy: "AI übernimmt Struktur, Copy, Workbook und Assets. Du bleibst im Driver-Seat für Qualität.",
    detail: "Prompt-Packs für jede Phase",
    href: "/kurse/ai-goldmining-method",
    Icon: Bot,
  },
  {
    num: "03",
    title: "Sauber verpacken",
    copy: "Name, Promise, Module, Verkaufsseite. Aus einem Draft wird ein kaufbares Angebot.",
    detail: "Template-System für Sales-Pages",
    href: "/kurse/ai-goldmining-method",
    Icon: Package,
  },
  {
    num: "04",
    title: "Automatisiert verkaufen",
    copy: "Store, Webinar, Newsletter, Community als System. Du baust einmal: es läuft.",
    detail: "Funnel-Map + Launch-Playbook",
    href: "/kurse/ai-goldmining-method",
    Icon: Rocket,
  },
];

export function MethodSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (stepsRef.current) {
      const cards = stepsRef.current.querySelectorAll<HTMLElement>(".step-card");
      const anim = animate(cards, { opacity: [0, 1], translateY: [28, 0], delay: stagger(140), duration: 700, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: stepsRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (resultRef.current) {
      const anim = animate(resultRef.current, { opacity: [0, 1], translateY: [24, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: resultRef.current, enter: "bottom-=5% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="relative py-20 lg:py-28 sec-glow overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gold-300/[0.04] blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gold-300/[0.03] blur-[140px]" />
      </div>

      {/* perspective goldmine floor grid */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3" aria-hidden>
        <RetroGrid angle={70} opacity={0.35} cellSize={55} />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-10 lg:mb-14 max-w-2xl mx-auto" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6 mx-auto"><span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300 shadow-[0_0_6px_rgba(201, 169, 97,0.55)]" aria-hidden />Die Methode</p>
          <h2 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(1.85rem, 8vw, 5rem)" }}>
            Von der Idee zur<br />
            <span className="gold-text">digitalen Goldmine</span>
          </h2>
          <p className="mt-6 text-cream/45 text-base lg:text-lg leading-relaxed">
            Vier Schritte. Ein System. Einmal aufgebaut, läuft es von selbst.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="relative">
          {/* connector line behind cards (desktop) */}
          <div
            className="hidden lg:block pointer-events-none absolute top-10 left-[12.5%] right-[12.5%] h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(201, 169, 97,0.4) 15%, rgba(201, 169, 97,0.4) 85%, transparent)" }}
            aria-hidden
          />

          <div className="grid gap-6 lg:gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => {
              const isLast = i === STEPS.length - 1;
              const { Icon } = step;
              return (
                <Link
                  key={step.num}
                  href={step.href}
                  className="step-card focus-ring group relative flex flex-col items-center text-center"
                  style={{ opacity: 0 }}
                  aria-label={`${step.title}: passenden Kurs öffnen`}
                >
                  {/* numbered node */}
                  <div
                    className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full border bg-obsidian mb-5 ${
                      isLast ? "border-gold-300/70" : "border-gold-300/30"
                    }`}
                    style={isLast ? { boxShadow: "0 0 30px rgba(201, 169, 97,0.3)" } : undefined}
                  >
                    <Icon className="h-8 w-8 text-gold-300" strokeWidth={1.5} />
                    <span
                      className={`absolute -bottom-2 -right-1 flex h-7 w-7 items-center justify-center rounded-full font-heading tracking-gta text-xs ${
                        isLast ? "bg-gold-gradient text-obsidian" : "bg-obsidian border border-gold-300/40 text-gold-300"
                      }`}
                    >
                      {step.num}
                    </span>
                  </div>

                  {/* card */}
                  <div
                    className={`card-glow w-full flex-1 flex flex-col rounded-sm border p-5 ${
                      isLast
                        ? "border-gold-300/50 bg-gradient-to-b from-gold-300/12 to-transparent"
                        : "border-gold-300/15 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-gold-300/40"
                    }`}
                  >
                    <h3 className="font-heading tracking-gta text-lg text-cream mb-2 leading-tight">{step.title}</h3>
                    <p className="text-cream/50 text-sm leading-relaxed mb-4 flex-grow">{step.copy}</p>
                    <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gold-300/20 bg-gold-300/5 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-gold-300/70">
                      {step.detail}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Result banner */}
        <div
          ref={resultRef}
          className="panel-surface relative mt-12 lg:mt-16 overflow-hidden rounded-2xl border border-white/10 p-7 lg:p-10"
          style={{ opacity: 0 }}
        >
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(201, 169, 97,0.07), transparent 55%)" }} aria-hidden />

          <div className="relative flex flex-col sm:flex-row gap-5 sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold-300/40 bg-gold-300/10">
              <Sparkles className="h-6 w-6 text-gold-300" />
            </div>
            <div>
              <p className="gta-label text-gold-300 mb-2">Das Ergebnis</p>
              <p className="font-heading tracking-gta text-cream leading-tight" style={{ fontSize: "clamp(1.2rem, 3.5vw, 2rem)" }}>
                Eine automatisierte Verkaufs-Pipeline, die für dich arbeitet,{" "}
                <span className="gold-text">während du schläfst.</span>
              </p>
              <p className="mt-2 text-cream/45 text-sm lg:text-base leading-relaxed">
                Fast reine Marge. Kein Kapital. Keine Abhängigkeiten.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
