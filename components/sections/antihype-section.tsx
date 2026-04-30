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
  const headingRef = useRef<HTMLDivElement>(null);
  const antiRef = useRef<HTMLUListElement>(null);
  const realRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (antiRef.current) {
      const items = antiRef.current.querySelectorAll<HTMLElement>("li");
      const anim = animate(items, { opacity: [0, 1], translateX: [-30, 0], delay: stagger(80), duration: 600, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: antiRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (realRef.current) {
      const items = realRef.current.querySelectorAll<HTMLElement>("li");
      const anim = animate(items, { opacity: [0, 1], translateX: [30, 0], delay: stagger(80, { start: 200 }), duration: 600, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: realRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="relative py-20 lg:py-40 bg-obsidian overflow-hidden">
      {/* Heist image as atmospheric backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: "url('/assets/heist-action.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          opacity: 0.05,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/90 to-obsidian" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6">
        <div ref={headingRef} className="mb-16" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6">Klartext</p>
          <h2 className="font-heading tracking-gta leading-none text-cream max-w-2xl" style={{ fontSize: "clamp(2.5rem,5.5vw,5.5rem)" }}>
            WAS DU HIER{" "}
            <span className="gold-text">NICHT</span> BEKOMMST.
          </h2>
          <p className="mt-4 text-cream/40 text-lg max-w-md">
            Weil es wichtig ist, das klar zu sagen.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-0 lg:divide-x lg:divide-gold-300/10">
          {/* Left — strikethrough */}
          <div className="lg:pr-16 pb-12 lg:pb-0">
            <p className="flex items-center gap-2 gta-label mb-8">
              <X className="h-3.5 w-3.5" aria-hidden />
              Nicht hier
            </p>
            <ul ref={antiRef} className="space-y-5">
              {ANTI_PROMISES.map((promise) => (
                <li
                  key={promise}
                  className="font-heading tracking-gta text-xl text-cream/25 line-through decoration-gold-300/15 decoration-2"
                  style={{ opacity: 0 }}
                >
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — what you get */}
          <div className="lg:pl-16 border-t border-gold-300/10 pt-12 lg:border-t-0 lg:pt-0">
            <p className="flex items-center gap-2 gta-label text-gold-300 mb-8">
              <Check className="h-3.5 w-3.5" aria-hidden />
              Stattdessen
            </p>
            <ul ref={realRef} className="space-y-5">
              {REAL_PROMISES.map((promise) => (
                <li
                  key={promise}
                  className="flex items-start gap-3 font-heading tracking-gta text-xl text-cream/75"
                  style={{ opacity: 0 }}
                >
                  <span className="mt-2 h-2 w-2 rounded-sm bg-gold-300/70 shrink-0 rotate-45" />
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
