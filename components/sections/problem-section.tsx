"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";

const PROBLEMS = [
  { num: "01", name: "Dropshipping", why: "Kapitalintensiv — Testing-Budget, Logistik, Retouren, lange Margen-Kette." },
  { num: "02", name: "Agenturen", why: "Zeit gegen Geld — dauerhaft neue Kunden nötig, schwer skalierbar." },
  { num: "03", name: "SaaS", why: "Technik-lastig — Monate Entwicklungszeit, Support, Startkapital." },
];

export function ProblemSection() {
  const listRef = useRef<HTMLUListElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
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

    if (listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>("li");
      const anim = animate(items, {
        opacity: [0, 1],
        translateX: [-40, 0],
        delay: stagger(120),
        duration: 700,
        ease: "outExpo",
        autoplay: false,
      });
      const obs = onScroll({
        target: listRef.current,
        enter: "bottom-=10% top",
        onEnter: () => anim.play(),
      });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (solutionRef.current) {
      const anim = animate(solutionRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 900,
        ease: "outExpo",
        autoplay: false,
      });
      const obs = onScroll({
        target: solutionRef.current,
        enter: "bottom-=5% top",
        onEnter: () => anim.play(),
      });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="relative py-40 bg-obsidian overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full bg-gold-300/3 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Split: label + headline left, list right */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-20 items-start mb-24">
          <div ref={headingRef} style={{ opacity: 0 }}>
            <p className="eyebrow mb-6">Die Haltung</p>
            <h2 className="font-heading text-5xl lg:text-6xl leading-[1.05] text-white">
              Nicht jedes Online-Modell ist{" "}
              <em className="gold-text not-italic">clever für den Start.</em>
            </h2>
          </div>

          <ul ref={listRef} className="space-y-10 pt-2">
            {PROBLEMS.map((p) => (
              <li key={p.num} className="flex gap-6 items-start" style={{ opacity: 0 }}>
                <span className="font-heading text-4xl text-gold-300/25 leading-none select-none shrink-0 w-10 text-right">
                  {p.num}
                </span>
                <div>
                  <h3 className="font-heading text-2xl text-white/50 mb-1 line-through decoration-white/20 decoration-[1px]">
                    {p.name}
                  </h3>
                  <p className="text-white/35 leading-relaxed text-sm">{p.why}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Solution — full-width editorial statement */}
        <div ref={solutionRef} className="border-t border-gold-500/15 pt-16" style={{ opacity: 0 }}>
          <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-center">
            <span className="eyebrow">Die Lösung</span>
            <p className="font-heading text-3xl lg:text-4xl text-white leading-snug">
              Digitale Produkte — einmal bauen,{" "}
              <em className="gold-text not-italic">dauerhaft verkaufen.</em>{" "}
              Fast reine Marge. Mit AI in Tagen, nicht Monaten.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
