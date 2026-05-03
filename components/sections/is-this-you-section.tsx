"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import { Zap } from "lucide-react";
import Link from "next/link";

const POINTS = [
  { bold: "Du bist müde davon, zuzuschauen,", rest: " wie andere Leute das Leben leben, das du willst." },
  { bold: "Du weißt, dass du mehr drauf hast", rest: " — aber niemand in deinem Umfeld versteht das." },
  { bold: "Du hast YouTube und Free Content probiert", rest: " — aber nichts davon hat sich in echte Ergebnisse übersetzt." },
  { bold: "Du willst ein konkretes System,", rest: " keine zufälligen Tipps von Leuten, die es selbst nicht gemacht haben." },
  { bold: "Du bist bereit, die Arbeit zu machen,", rest: " wenn dir jemand genau zeigt, was zu tun ist." },
  { bold: "Du willst echte Skills", rest: " die Einkommen generieren — kein Zertifikat, das Staub sammelt." },
  { bold: "Du willst die 9-to-5 loswerden", rest: " und etwas Eigenes aufbauen." },
];

export function IsThisYouSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }
    if (listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>("li");
      const anim = animate(items, { opacity: [0, 1], translateX: [-30, 0], delay: stagger(100), duration: 600, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: listRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
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
    <section className="relative py-20 lg:py-40 bg-obsidian overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-gold-300/[0.025] to-transparent" />

      <div className="relative mx-auto max-w-3xl px-6">
        <div ref={headingRef} className="text-center mb-10 lg:mb-16" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6">🎯 MISSION 8</p>
          <h2 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(2rem, 10vw, 7rem)" }}>
            BIST DAS{" "}
            <span className="gold-text">DU?</span>
          </h2>
        </div>

        <ul ref={listRef} className="space-y-5 lg:space-y-6 mb-12 lg:mb-16">
          {POINTS.map((point, i) => (
            <li key={i} className="flex items-start gap-3 lg:gap-4" style={{ opacity: 0 }}>
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-gold-300/10 border border-gold-300/30">
                <Zap className="h-3 w-3 text-gold-300" fill="currentColor" />
              </span>
              <p className="text-cream/65 leading-relaxed text-base lg:text-lg">
                <span className="text-cream font-semibold">{point.bold}</span>
                {point.rest}
              </p>
            </li>
          ))}
        </ul>

        <div ref={ctaRef} className="text-center border-t border-gold-300/10 pt-10 lg:pt-16" style={{ opacity: 0 }}>
          <p className="font-heading tracking-gta text-2xl text-cream mb-3">
            WENN DAS DU BIST —
          </p>
          <p className="text-cream/45 mb-10 text-lg max-w-xl mx-auto leading-relaxed">
            Dann ist AI Goldmining für dich gebaut worden.
            Nicht für Leute, die darüber nachdenken wollen. Für Leute, die bereit sind, loszulegen.
          </p>
          <Link
            href="/webinar"
            className="btn-shimmer inline-flex items-center gap-2 rounded-sm bg-gold-300 px-10 py-4 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:bg-gold-200 hover:shadow-[0_0_50px_rgba(240,180,41,0.45)]"
          >
            🎯 MISSION: Webinar starten →
          </Link>
          <p className="mt-5 text-[0.7rem] text-cream/20 uppercase tracking-[0.2em]">
            Hör auf zu warten.
          </p>
        </div>
      </div>
    </section>
  );
}
