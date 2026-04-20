"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: "01",
    title: "Idee finden",
    copy: "Aus Skill, Interesse oder Problem wird ein konkretes digitales Produkt — keine 47 Optionen, sondern eine klare Entscheidung.",
    detail: "Mapping-Framework + AI-Validierungs-Prompts",
    accent: "from-gold-300/20 to-transparent"
  },
  {
    num: "02",
    title: "Mit AI bauen",
    copy: "AI übernimmt Struktur, Copy, Workbook und Assets. Du bleibst im Driver-Seat für Qualität und Positionierung.",
    detail: "Prompt-Packs für jede Produktphase",
    accent: "from-gold-400/20 to-transparent"
  },
  {
    num: "03",
    title: "Sauber verpacken",
    copy: "Name, Promise, Module, Verkaufsseite. Aus einem rohen Draft wird ein kaufbares Angebot mit klarer Kaufmotivation.",
    detail: "Template-System für Sales-Pages",
    accent: "from-gold-500/20 to-transparent"
  },
  {
    num: "04",
    title: "Automatisiert verkaufen",
    copy: "Store, Webinar, Newsletter und Community arbeiten als System zusammen. Du baust die Pipeline einmal — sie läuft.",
    detail: "Funnel-Map + Launch-Playbook",
    accent: "from-gold-300/30 to-transparent"
  }
];

export function MethodSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const cards = section.querySelectorAll<HTMLElement>("[data-step-card]");
    const numbers = section.querySelectorAll<HTMLElement>("[data-num]");
    const dots = section.querySelectorAll<HTMLElement>("[data-dot]");
    const progressBar = section.querySelector<HTMLElement>("[data-progress]");

    cards.forEach((c, i) => {
      if (i > 0) gsap.set(c, { opacity: 0, scale: 0.8, rotateX: 15, filter: "blur(10px)", y: 60 });
    });
    numbers.forEach((n, i) => {
      if (i > 0) gsap.set(n, { opacity: 0, scale: 0.5 });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * 2.5}`,
        pin: true,
        scrub: 0.5,
        anticipatePin: 1
      }
    });

    for (let i = 0; i < STEPS.length - 1; i++) {
      const pos = i * (1 / (STEPS.length - 1));

      tl.to(cards[i], {
        opacity: 0,
        scale: 0.7,
        rotateX: -20,
        filter: "blur(12px)",
        y: -80,
        duration: 0.3
      }, pos);
      tl.to(numbers[i], { opacity: 0, scale: 1.5, duration: 0.2 }, pos);

      tl.fromTo(
        cards[i + 1],
        { opacity: 0, scale: 0.8, rotateX: 15, filter: "blur(10px)", y: 60 },
        { opacity: 1, scale: 1, rotateX: 0, filter: "blur(0px)", y: 0, duration: 0.3 },
        pos + 0.05
      );
      tl.fromTo(
        numbers[i + 1],
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.2 },
        pos + 0.05
      );

      if (dots[i]) tl.to(dots[i], { background: "rgba(214,168,79,0.2)", duration: 0.15 }, pos);
      if (dots[i + 1]) tl.to(dots[i + 1], { background: "rgba(255,215,106,1)", duration: 0.15 }, pos + 0.05);

      if (progressBar) {
        tl.to(progressBar, {
          width: `${((i + 2) / STEPS.length) * 100}%`,
          duration: 0.3
        }, pos);
      }
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen items-center overflow-hidden bg-graphite/40"
      style={{ perspective: "1200px" }}
    >
      <div className="container-shell w-full">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Left — compact title + step indicator */}
          <div>
            <p className="eyebrow mb-4">Die Methode</p>
            <h2 className="font-heading text-display-md text-cream">
              Von der Idee zur{" "}
              <span className="gold-text">digitalen Goldmine.</span>
            </h2>

            {/* Step number — oversized, animated */}
            <div className="relative mt-8 h-20">
              {STEPS.map((step, i) => (
                <span
                  key={step.num}
                  data-num
                  className="absolute inset-0 font-heading text-[6rem] leading-none tracking-[-0.04em] text-stroke-gold"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  {step.num}
                </span>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-gold-500/10">
              <div
                data-progress
                className="h-full rounded-full bg-gold-300 transition-none"
                style={{ width: "25%" }}
              />
            </div>

            {/* Dots */}
            <div className="mt-4 flex gap-2">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  data-dot
                  className="h-2 w-2 rounded-full"
                  style={{ background: i === 0 ? "rgba(255,215,106,1)" : "rgba(214,168,79,0.2)" }}
                />
              ))}
            </div>
          </div>

          {/* Right — stacked animated cards */}
          <div className="relative min-h-[260px]" style={{ transformStyle: "preserve-3d" }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                data-step-card
                className={`${i > 0 ? "absolute inset-0" : ""} rounded-2xl border border-gold-500/15 bg-gradient-to-br ${step.accent} p-8 backdrop-blur-sm`}
                style={{ transformOrigin: "center bottom" }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-heading text-3xl text-cream lg:text-4xl">
                    {step.title}
                  </h3>
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-gold-300/30 font-heading text-lg text-gold-300">
                    {step.num}
                  </span>
                </div>
                <p className="mt-4 max-w-md text-base leading-[1.75] text-muted lg:text-lg">
                  {step.copy}
                </p>
                <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/[0.06] px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-300">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
