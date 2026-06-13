"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import { Star, ShieldCheck, Lock, RotateCcw } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { trustpilotUrl, trustpilotBusinessUnitId } from "@/lib/env";

const TRUSTPILOT_SCRIPT = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

const BADGES = [
  { icon: Lock, title: "Sichere Zahlung", text: "SSL-verschlüsselt über Stripe" },
  { icon: RotateCcw, title: "14 Tage Widerruf", text: "Gesetzliches Widerrufsrecht" },
  { icon: ShieldCheck, title: "DSGVO-konform", text: "Deine Daten bleiben in der EU" },
];

// Platzhalter-Logos für "Bekannt aus" — später durch echte Presse-/Partnerlogos ersetzen
const PRESS = ["FORBES", "BUSINESS INSIDER", "T3N", "GRÜNDER.DE", "OMR"];

export function TrustSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }
    if (cardRef.current) {
      const anim = animate(cardRef.current, { opacity: [0, 1], scale: [0.97, 1], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: cardRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }
    if (badgesRef.current) {
      const items = badgesRef.current.querySelectorAll<HTMLElement>(".trust-badge");
      const anim = animate(items, { opacity: [0, 1], translateY: [20, 0], delay: stagger(100), duration: 600, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: badgesRef.current, enter: "bottom-=5% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Load the official Trustpilot TrustBox once a business-unit id is configured.
  useEffect(() => {
    if (!trustpilotBusinessUnitId) return;
    const w = window as typeof window & { Trustpilot?: { loadFromElement: (el: HTMLElement, force?: boolean) => void } };
    const render = () => {
      if (w.Trustpilot && widgetRef.current) w.Trustpilot.loadFromElement(widgetRef.current, true);
    };
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TRUSTPILOT_SCRIPT}"]`);
    if (existing) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = TRUSTPILOT_SCRIPT;
    script.async = true;
    script.onload = render;
    document.body.appendChild(script);
  }, []);

  const hasWidget = Boolean(trustpilotBusinessUnitId);

  return (
    <section className="relative py-20 lg:py-28 sec-glow overflow-hidden scratch-border">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gold-300/[0.04] blur-[130px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div ref={headingRef} className="text-center mb-12 lg:mb-16" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6 mx-auto"><span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300 shadow-[0_0_6px_rgba(201, 169, 97,0.55)]" aria-hidden />Vertrauen</p>
          <h2 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(1.85rem, 8vw, 5rem)" }}>
            Echte Menschen.{" "}
            <span className="gold-text">Echte Ergebnisse.</span>
          </h2>
          <p className="mt-6 text-cream/50 text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
            Verifizierte Bewertungen statt geschönter Screenshots. Lies selbst nach, was unsere Mitglieder sagen.
          </p>
        </div>

        {/* Trustpilot card */}
        <div
          ref={cardRef}
          className="relative mx-auto max-w-2xl rounded-sm border border-gold-300/25 bg-white/[0.03] p-8 lg:p-10 text-center"
          style={{ opacity: 0 }}
        >
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(201, 169, 97,0.05), transparent 60%)" }} aria-hidden />

          <div className="relative">
            {hasWidget ? (
              /* Official Trustpilot TrustBox — auto-rendered from the live profile. */
              <div
                ref={widgetRef}
                className="trustpilot-widget mb-6"
                data-locale="de-DE"
                data-template-id="5419b6ffb0d04a076446a9af"
                data-businessunit-id={trustpilotBusinessUnitId}
                data-style-height="120px"
                data-style-width="100%"
                data-theme="dark"
              >
                <a href={trustpilotUrl} target="_blank" rel="noopener noreferrer">
                  Trustpilot
                </a>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <span key={s} className="flex h-9 w-9 items-center justify-center rounded-[3px] bg-[#00b67a]">
                      <Star className="h-5 w-5 text-white" fill="currentColor" />
                    </span>
                  ))}
                </div>
                <p className="font-heading tracking-gta text-cream text-3xl lg:text-4xl mb-1">
                  4,8 <span className="text-cream/40 text-xl">/ 5</span>
                </p>
                <p className="text-cream/45 text-sm mb-6">
                  Basierend auf <span className="text-cream/80 font-semibold">1.200+ Bewertungen</span> auf Trustpilot
                </p>
              </>
            )}

            <a
              href={trustpilotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer inline-flex items-center gap-2 rounded-full border border-gold-300/40 px-7 py-3 text-xs font-bold uppercase tracking-[0.14em] text-cream/80 transition-all hover:border-gold-300/80 hover:text-cream hover:bg-gold-300/5"
            >
              Auf Trustpilot ansehen →
            </a>
          </div>
        </div>

        {/* Trust badges */}
        <div ref={badgesRef} className="mt-12 grid gap-4 sm:grid-cols-3">
          {BADGES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="trust-badge flex items-center gap-4 rounded-sm border border-gold-300/15 bg-white/[0.02] p-5" style={{ opacity: 0 }}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/5">
                <Icon className="h-5 w-5 text-gold-300" />
              </span>
              <div>
                <p className="font-heading tracking-gta text-sm text-cream leading-tight">{title}</p>
                <p className="text-cream/45 text-xs mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* "Bekannt aus" logo strip — scrolling marquee */}
        <div className="mt-14 text-center">
          <p className="gta-label text-cream/30 mb-6">Bekannt aus</p>
          <div
            className="relative mx-auto max-w-3xl overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <Marquee pauseOnHover className="[--duration:28s] [--gap:3.5rem] py-0">
              {PRESS.map((name) => (
                <span
                  key={name}
                  className="font-heading tracking-gta text-cream/25 text-lg lg:text-xl select-none transition-colors hover:text-cream/50"
                >
                  {name}
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
}
