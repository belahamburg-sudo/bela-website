"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const LOSERS = [
  "Warten, bis der Chef entscheidet",
  "Zeit gegen Geld tauschen",
  "Hoffen, dass der Job bleibt",
  "Skills, die KI längst ersetzt",
  "Ein Einkommen, eine Abhängigkeit",
];

const WINNERS = [
  "KI als Mitarbeiter, der nie schläft",
  "Einmal bauen, dauerhaft verkaufen",
  "Eigene Produkte, eigene Regeln",
  "Skills, die mit KI skalieren",
  "Einkommen, das ortsunabhängig läuft",
];

export function AiChangesSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }
    if (gridRef.current) {
      const items = gridRef.current.querySelectorAll<HTMLElement>(".change-row");
      const anim = animate(items, { opacity: [0, 1], translateY: [20, 0], delay: stagger(90), duration: 600, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: gridRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }
    if (ctaRef.current) {
      const anim = animate(ctaRef.current, { opacity: [0, 1], translateY: [20, 0], duration: 700, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: ctaRef.current, enter: "bottom-=5% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="relative py-20 lg:py-28 sec-aurora overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gold-300/[0.04] blur-[150px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div ref={headingRef} className="text-center mb-10 lg:mb-14" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6 mx-auto"><span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300 shadow-[0_0_6px_rgba(232,192,64,0.55)]" aria-hidden />Der Wendepunkt</p>
          <h2 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(1.85rem, 8vw, 5.5rem)" }}>
            AI verändert{" "}
            <span className="gold-text">alles.</span>
          </h2>
          <p className="mt-6 text-cream/50 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Dieselbe Technologie, die Jobs vernichtet, ist das stärkste Werkzeug, das du je hattest.
            Es kommt nur darauf an, ob du sie <span className="text-cream">erleidest</span> oder{" "}
            <span className="text-gold-300 font-semibold">einsetzt</span>.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 gap-px rounded-sm overflow-hidden border border-gold-300/15 bg-gold-300/10">
          {/* Losers column */}
          <div className="bg-obsidian p-6 lg:p-10">
            <p className="gta-label text-cream/40 mb-7">Wer KI ignoriert</p>
            <ul className="space-y-5">
              {LOSERS.map((t) => (
                <li key={t} className="change-row flex items-start gap-3 text-cream/35" style={{ opacity: 0 }}>
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cream/20 shrink-0" />
                  <span className="text-base lg:text-lg leading-snug line-through decoration-cream/15">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Winners column */}
          <div className="relative bg-obsidian p-6 lg:p-10">
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(232,192,64,0.06), transparent 60%)" }} aria-hidden />
            <p className="gta-label text-gold-300 mb-7 relative">Wer KI nutzt</p>
            <ul className="space-y-5 relative">
              {WINNERS.map((t) => (
                <li key={t} className="change-row flex items-start gap-3" style={{ opacity: 0 }}>
                  <span className="mt-1.5 h-2 w-2 rounded-sm bg-gold-300/80 rotate-45 shrink-0" style={{ boxShadow: "0 0 10px rgba(232,192,64,0.5)" }} />
                  <span className="font-heading tracking-gta text-base lg:text-lg text-cream leading-snug">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div ref={ctaRef} className="mt-12 lg:mt-16 text-center" style={{ opacity: 0 }}>
          <p className="font-heading tracking-gta text-xl lg:text-3xl text-cream mb-8 max-w-2xl mx-auto leading-tight">
            Du kannst zusehen, wie KI deinen Job nimmt:{" "}
            <span className="gold-text">oder sie für dich arbeiten lassen.</span>
          </p>
          <Link
            href="/webinar"
            className="btn-shimmer inline-flex items-center gap-2 rounded-full bg-gold-gradient px-10 py-4 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:brightness-110 shadow-[0_0_30px_rgba(232,192,64,0.35)]"
          >
            Webinar starten <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
