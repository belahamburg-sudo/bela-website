"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import { TrendingDown, AlertTriangle, Clock, Bot } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";

// Häufig zitierte Studien-Zahlen (Quelle in jedem Eintrag genannt)
const BARS = [
  { label: "Jobs weltweit von Automatisierung betroffen", value: 300, suffix: " Mio", pct: 100, source: "Goldman Sachs, 2023" },
  { label: "Jobs verschwinden bis 2027 durch KI", value: 83, suffix: " Mio", pct: 62, source: "World Economic Forum" },
  { label: "aller Tätigkeiten sind heute automatisierbar", value: 30, suffix: "%", pct: 46, source: "McKinsey Global Institute" },
  { label: "der Firmen ersetzen Mitarbeiter bereits durch KI", value: 37, suffix: "%", pct: 54, source: "ResumeBuilder, 2023" },
];

const TICKER = [
  { icon: Bot, text: "Ein KI-Agent erledigt die Arbeit von 5 Junior-Angestellten" },
  { icon: Clock, text: "Alle 6 Sekunden wird weltweit eine Aufgabe automatisiert" },
  { icon: TrendingDown, text: "Erste Konzerne stoppen Einstellungen wegen KI" },
];

export function AiJobsSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    if (barsRef.current) {
      const fills = barsRef.current.querySelectorAll<HTMLElement>(".bar-fill");
      const rows = barsRef.current.querySelectorAll<HTMLElement>(".bar-row");

      const rowAnim = animate(rows, { opacity: [0, 1], translateX: [-30, 0], delay: stagger(120), duration: 600, ease: "outExpo", autoplay: false });

      const obs = onScroll({
        target: barsRef.current,
        enter: "bottom-=10% top",
        onEnter: () => {
          rowAnim.play();
          fills.forEach((fill, i) => {
            const target = Number(fill.dataset.pct ?? 0);
            animate(fill, { width: ["0%", `${target}%`], duration: 1500, delay: 200 + i * 120, ease: "outExpo" });
            const counter = countersRef.current[i];
            const end = Number(fill.dataset.value ?? 0);
            const suffix = fill.dataset.suffix ?? "";
            if (counter) {
              const obj = { val: 0 };
              animate(obj, {
                val: [0, end],
                duration: 1500,
                delay: 200 + i * 120,
                ease: "outExpo",
                onUpdate: () => { counter.textContent = `${Math.round(obj.val).toLocaleString("de-DE")}${suffix}`; },
              });
            }
          });
        },
      });
      cleanups.push(() => { rowAnim.revert(); obs.revert(); });
    }

    if (tickerRef.current) {
      const anim = animate(tickerRef.current, { opacity: [0, 1], translateY: [20, 0], duration: 700, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: tickerRef.current, enter: "bottom-=5% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="relative py-20 lg:py-28 sec-raised overflow-hidden scratch-border">
      {/* red-tinted alarm glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,50,40,0.07) 0%, transparent 65%)" }}
      />

      {/* dotted data-grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          maskImage: "radial-gradient(560px circle at 50% 25%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(560px circle at 50% 25%, black, transparent 75%)",
        }}
      >
        <DotPattern width={22} height={22} cr={1} className="fill-gold-300/[0.12]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div ref={headingRef} className="text-center mb-10 lg:mb-14" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6 mx-auto">
            <AlertTriangle className="h-3 w-3" /> Die unbequeme Wahrheit
          </p>
          <h2 className="gold-text font-heading font-extrabold tracking-gta leading-none" style={{ fontSize: "clamp(1.85rem, 8vw, 5.5rem)" }}>
            AI frisst Jobs.<br />
            Jeden Tag mehr.
          </h2>
          <p className="mt-6 text-cream/50 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Während du das liest, übernimmt KI Aufgaben, für die gestern noch Menschen bezahlt wurden.
            Die Zahlen sind eindeutig: und sie werden jedes Jahr größer.
          </p>
        </div>

        {/* Bars */}
        <div ref={barsRef} className="grid gap-6 lg:gap-8 max-w-3xl mx-auto">
          {BARS.map((bar, i) => (
            <div key={bar.label} className="bar-row" style={{ opacity: 0 }}>
              <div className="flex items-end justify-between mb-2 gap-4">
                <p className="text-cream/70 text-sm lg:text-base leading-snug">{bar.label}</p>
                <span
                  ref={(el) => { countersRef.current[i] = el; }}
                  className="font-heading tracking-gta text-2xl lg:text-4xl text-gold-300 shrink-0 leading-none"
                  style={{ textShadow: "0 0 18px rgba(201, 169, 97,0.35)" }}
                >
                  0{bar.suffix}
                </span>
              </div>
              <div className="relative h-3 lg:h-3.5 w-full rounded-full bg-white/[0.04] overflow-hidden border border-gold-300/10">
                <div
                  className="bar-fill absolute inset-y-0 left-0 rounded-full"
                  data-pct={bar.pct}
                  data-value={bar.value}
                  data-suffix={bar.suffix}
                  style={{ width: "0%", background: "linear-gradient(90deg, #6A5530, #C9A961, #FFF4C9)" }}
                />
              </div>
              <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-cream/25">Quelle: {bar.source}</p>
            </div>
          ))}
        </div>

        {/* Live ticker strip */}
        <div ref={tickerRef} className="mt-12 lg:mt-14 grid gap-px sm:grid-cols-3 rounded-sm overflow-hidden border border-gold-300/15" style={{ opacity: 0 }}>
          {TICKER.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3 bg-white/[0.02] p-5 lg:p-6">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/5">
                <Icon className="h-4 w-4 text-gold-300" />
              </span>
              <p className="text-cream/60 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center font-heading tracking-gta text-lg lg:text-2xl text-cream/80">
          Die Frage ist nicht <span className="text-cream/40">ob</span>, sondern{" "}
          <span className="gold-text">auf welcher Seite du stehst.</span>
        </p>
      </div>
    </section>
  );
}
