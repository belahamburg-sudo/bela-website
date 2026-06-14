"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import { ShieldCheck, Lock } from "lucide-react";
import { trustpilotUrl } from "@/lib/env";
import { TrustpilotWidget, TRUSTPILOT_TEMPLATES } from "@/components/trustpilot-widget";

const BADGES = [
  { icon: Lock, title: "Sichere Zahlung", text: "SSL-verschlüsselt über Stripe" },
  { icon: ShieldCheck, title: "DSGVO-konform", text: "Deine Daten bleiben in der EU" },
];

export function TrustSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

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
            Live aus Trustpilot — Sterne, TrustScore und die neuesten Bewertungen. Keine Screenshots, kein Fake-Social-Proof.
          </p>
        </div>

        <div
          ref={cardRef}
          className="relative mx-auto max-w-3xl rounded-sm border border-gold-300/25 bg-white/[0.03] p-6 lg:p-8"
          style={{ opacity: 0 }}
        >
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(201, 169, 97,0.05), transparent 60%)" }} aria-hidden />

          <div className="relative space-y-6">
            <TrustpilotWidget
              templateId={TRUSTPILOT_TEMPLATES.micro}
              height="52px"
              className="mx-auto max-w-md"
            />

            <div className="border-t border-gold-300/10 pt-6">
              <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40">
                Neueste Bewertungen
              </p>
              <TrustpilotWidget
                templateId={TRUSTPILOT_TEMPLATES.carousel}
                height="240px"
              />
            </div>

            <div className="text-center pt-2">
              <a
                href={trustpilotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer inline-flex items-center gap-2 rounded-full border border-gold-300/40 px-7 py-3 text-xs font-bold uppercase tracking-[0.14em] text-cream/80 transition-all hover:border-gold-300/80 hover:text-cream hover:bg-gold-300/5"
              >
                Alle Bewertungen auf Trustpilot →
              </a>
            </div>
          </div>
        </div>

        <div ref={badgesRef} className="mt-12 grid gap-4 sm:grid-cols-2">
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
      </div>
    </section>
  );
}
