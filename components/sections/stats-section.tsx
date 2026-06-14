"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll } from "animejs";

const STATS = [
  { value: 689, suffix: "+", label: "Community Mitglieder" },
  { value: 97, suffix: "%", label: "Empfehlen es weiter" },
  { value: 837, suffix: "", label: "Verkaufte Kurse" },
  { value: 3165, suffix: "€", label: "Ø Ergebnis nach 2 Monaten" },
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
      {/* Warm gold-dust backdrop (two cones + grain) instead of an image */}
      <div className="relative overflow-hidden bg-cones">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 90% at 50% 50%, rgba(201,169,97,0.06), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="dust-overlay" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={[
                  "text-center px-4 lg:px-6 py-6 lg:py-6",
                  (i === 0 || i === 2) ? "border-r border-gold-300/10" : "",
                  (i === 0 || i === 1) ? "border-b border-gold-300/10 lg:border-b-0" : "",
                  i < STATS.length - 1 ? "lg:border-r lg:border-gold-300/10" : "",
                ].filter(Boolean).join(" ")}
              >
                <p className="font-heading tracking-gta text-cream mb-1" style={{ fontSize: "clamp(1.85rem, 8vw, 5.5rem)" }}>
                  <span ref={(el) => { countersRef.current[i] = el; }}>
                    0{stat.suffix}
                  </span>
                </p>
                <p className="gta-label text-[0.55rem] lg:text-[0.62rem]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
