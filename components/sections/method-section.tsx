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
    detail: "Mapping-Framework + AI-Validierungs-Prompts"
  },
  {
    num: "02",
    title: "Mit AI bauen",
    copy: "AI übernimmt Struktur, Copy, Workbook und Assets. Du bleibst im Driver-Seat für Qualität und Positionierung.",
    detail: "Prompt-Packs für jede Produktphase"
  },
  {
    num: "03",
    title: "Sauber verpacken",
    copy: "Name, Promise, Module, Verkaufsseite. Aus einem rohen Draft wird ein kaufbares Angebot mit klarer Kaufmotivation.",
    detail: "Template-System für Sales-Pages"
  },
  {
    num: "04",
    title: "Automatisiert verkaufen",
    copy: "Store, Webinar, Newsletter und Community arbeiten als System zusammen. Du baust die Pipeline einmal — sie läuft.",
    detail: "Funnel-Map + Launch-Playbook"
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

    const slides = section.querySelectorAll<HTMLElement>("[data-step]");
    const numbers = section.querySelectorAll<HTMLElement>("[data-num]");
    const dots = section.querySelectorAll<HTMLElement>("[data-dot]");

    slides.forEach((s, i) => {
      if (i > 0) gsap.set(s, { opacity: 0, y: 20 });
    });
    numbers.forEach((n, i) => {
      if (i > 0) gsap.set(n, { opacity: 0 });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * 4}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1
      }
    });

    for (let i = 0; i < STEPS.length - 1; i++) {
      const pos = i * (1 / (STEPS.length - 1));
      tl.to(slides[i], { opacity: 0, y: -20, duration: 0.4 }, pos);
      tl.to(numbers[i], { opacity: 0, duration: 0.3 }, pos);
      tl.fromTo(
        slides[i + 1],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 },
        pos + 0.1
      );
      tl.to(numbers[i + 1], { opacity: 1, duration: 0.3 }, pos + 0.1);
      if (dots[i]) tl.to(dots[i], { opacity: 0.3, duration: 0.2 }, pos);
      if (dots[i + 1]) tl.to(dots[i + 1], { opacity: 1, duration: 0.2 }, pos + 0.1);
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
      className="relative min-h-screen bg-graphite/40 py-20"
    >
      <div className="container-shell">
        <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.2fr]">
          <div className="lg:sticky lg:top-1/3">
            <p className="eyebrow mb-6">Die Methode</p>
            <h2 className="font-heading text-display-md text-cream">
              Von der Idee zur{" "}
              <span className="gold-text">digitalen Goldmine.</span>
            </h2>

            <div className="relative mt-10 h-24">
              {STEPS.map((step, i) => (
                <span
                  key={step.num}
                  data-num
                  className="absolute inset-0 font-heading text-8xl tracking-[-0.04em] text-stroke-gold"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  {step.num}
                </span>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  data-dot
                  className="h-1.5 w-8 rounded-full bg-gold-300 transition-opacity"
                  style={{ opacity: i === 0 ? 1 : 0.3 }}
                />
              ))}
            </div>
          </div>

          <div className="relative min-h-[300px]">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                data-step
                className={i > 0 ? "absolute inset-0" : ""}
              >
                <h3 className="font-heading text-3xl text-cream lg:text-4xl">
                  {step.title}
                </h3>
                <p className="mt-5 max-w-lg text-base leading-[1.8] text-muted lg:text-lg">
                  {step.copy}
                </p>
                <p className="mt-6 flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-300">
                  <span className="h-1 w-1 rounded-full bg-gold-300" />
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
