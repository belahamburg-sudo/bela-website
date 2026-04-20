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
    <section ref={sectionRef} className="relative py-20 bg-obsidian">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="text-center px-8 py-4">
              <p className="font-heading text-5xl lg:text-6xl text-white mb-2">
                <span ref={(el) => { countersRef.current[i] = el; }}>
                  0{stat.suffix}
                </span>
              </p>
              <p className="text-sm text-white/40 uppercase tracking-[0.15em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
