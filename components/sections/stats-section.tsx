"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll } from "animejs";

const STATS = [
  { value: 2400, suffix: "+", label: "Kursteilnehmer" },
  { value: 97, suffix: "%", label: "Empfehlen es weiter" },
  { value: 3, suffix: "K€", label: "Realistisches Monatsziel" },
];

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = onScroll({
      target: sectionRef.current,
      enter: "bottom-=10% top",
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;
        STATS.forEach((stat, i) => {
          const el = countersRef.current[i];
          if (!el) return;
          const countObj = { val: 0 };
          animate(countObj, {
            val: [0, stat.value],
            duration: 1800,
            ease: "outExpo",
            onUpdate: () => {
              el.textContent = `${Math.round(countObj.val).toLocaleString("de-DE")}${stat.suffix}`;
            },
          });
        });
      },
    });
    return () => { obs.revert(); };
  }, []);

  return (
    <section ref={sectionRef} className="relative py-0 bg-obsidian scratch-border">
      {/* Cinematic banner with heist image as tinted backdrop */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/heist-action.jpeg')",
            filter: "brightness(0.18) saturate(0.7)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-3 divide-x divide-gold-300/10">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="text-center px-6 py-6">
                <p className="font-heading tracking-gta text-cream mb-1" style={{ fontSize: "clamp(2.8rem,5vw,5.5rem)" }}>
                  <span ref={(el) => { countersRef.current[i] = el; }}>
                    0{stat.suffix}
                  </span>
                </p>
                <p className="gta-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
