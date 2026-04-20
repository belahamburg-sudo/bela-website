"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import { Check, X } from "lucide-react";

const ANTI_PROMISES = [
  "Garantierte 20K im Monat",
  "Passives Einkommen ohne Arbeit",
  "Reich in 30 Tagen",
  "AI macht alles für dich",
  "Du brauchst kein Skill",
  "Zertifizierter Coach mit Erfolgsgarantie",
];

const REAL_PROMISES = [
  "Ein klares erstes digitales Produkt",
  "Eine Verkaufsseite, die funktioniert",
  "AI-Prompts für schnelle Umsetzung",
  "Realistisches Ziel: 3.000 € / Monat",
  "Ein System, das auch in 12 Monaten noch läuft",
  "Ehrliche Cases — mit Zahlen, nicht Screenshots",
];

export function AntihypeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const antiRef = useRef<HTMLUListElement>(null);
  const realRef = useRef<HTMLUListElement>(null);

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

    if (antiRef.current) {
      const items = antiRef.current.querySelectorAll<HTMLElement>("li");
      const anim = animate(items, {
        opacity: [0, 1],
        translateX: [-30, 0],
        delay: stagger(80),
        duration: 600,
        ease: "outExpo",
        autoplay: false,
      });
      const obs = onScroll({
        target: antiRef.current,
        enter: "bottom-=10% top",
        onEnter: () => anim.play(),
      });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (realRef.current) {
      const items = realRef.current.querySelectorAll<HTMLElement>("li");
      const anim = animate(items, {
        opacity: [0, 1],
        translateX: [30, 0],
        delay: stagger(80, { start: 200 }),
        duration: 600,
        ease: "outExpo",
        autoplay: false,
      });
      const obs = onScroll({
        target: realRef.current,
        enter: "bottom-=10% top",
        onEnter: () => anim.play(),
      });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section ref={sectionRef} className="relative py-40 bg-obsidian overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gold-300/3 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div ref={headingRef} className="mb-16" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6">Klartext</p>
          <h2 className="font-heading text-5xl lg:text-6xl leading-[1.05] text-white max-w-2xl">
            Was du hier{" "}
            <em className="gold-text not-italic">nicht</em> bekommst.
          </h2>
          <p className="mt-4 text-white/40 text-lg max-w-md">
            Weil es wichtig ist, das klar zu sagen.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-0 lg:divide-x lg:divide-white/[0.06]">
          {/* Left — strikethrough */}
          <div className="lg:pr-16 pb-12 lg:pb-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/25 mb-8">
              <X className="h-3.5 w-3.5" aria-hidden />
              Nicht hier
            </p>
            <ul ref={antiRef} className="space-y-5">
              {ANTI_PROMISES.map((promise) => (
                <li
                  key={promise}
                  className="text-xl text-white/30 line-through decoration-white/15 decoration-[1px]"
                  style={{ opacity: 0 }}
                >
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — what you get */}
          <div className="lg:pl-16 border-t border-white/[0.06] pt-12 lg:border-t-0 lg:pt-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300 mb-8">
              <Check className="h-3.5 w-3.5" aria-hidden />
              Stattdessen
            </p>
            <ul ref={realRef} className="space-y-5">
              {REAL_PROMISES.map((promise) => (
                <li
                  key={promise}
                  className="flex items-start gap-3 text-xl text-white/70"
                  style={{ opacity: 0 }}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-300/60 shrink-0" />
                  {promise}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
