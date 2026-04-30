"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { animate, onScroll, stagger } from "animejs";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";
import { telegramUrl } from "@/lib/env";

const COMMUNITY_ITEMS = [
  "Produktideen und konkrete Beispiele aus der Praxis",
  "AI-Prompts für digitale Produkte — direkt anwendbar",
  "Launch-Updates und neue Kurse als erste",
  "Kurze, direkte Umsetzungsschritte ohne Theorie-Marathon",
];

export default function CommunityPage() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>("li");
    const anim = animate(items, {
      opacity: [0, 1],
      translateX: [20, 0],
      delay: stagger(100),
      duration: 600,
      ease: "outExpo",
      autoplay: false,
    });
    const obs = onScroll({
      target: listRef.current,
      enter: "bottom-=10% top",
      onEnter: () => anim.play(),
    });
    return () => { anim.revert(); obs.revert(); };
  }, []);

  return (
    <>
      <section className="py-32 bg-obsidian">
        <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="eyebrow mb-6">Telegram Community</p>
            <h1 className="font-heading text-5xl lg:text-6xl leading-[1.05] text-white mb-6">
              Starte nicht allein. Baue mit anderen{" "}
              <em className="gold-text not-italic">digitale Produkte mit AI.</em>
            </h1>
            <p className="text-lg leading-relaxed text-white/50 mb-10 max-w-xl">
              Die kostenlose Community ist der schnelle Einstieg für Produktideen, AI-Prompts, Umsetzungsimpulse und Updates zu neuen Mini-Kursen.
            </p>
            <Button href={telegramUrl}>
              <MessageCircle aria-hidden className="h-4 w-4" />
              Free Telegram Gruppe
            </Button>
          </motion.div>

          {/* What you get — no card wrapper */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/25 mb-8">Was dich erwartet</p>
            <ul ref={listRef} className="space-y-6">
              {COMMUNITY_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-4 text-lg text-white/70" style={{ opacity: 0 }}>
                  <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-gold-300/60 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Newsletter — no panel-surface */}
      <section className="py-32 bg-obsidian border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-[1fr_1fr] items-start">
          <div>
            <p className="eyebrow mb-6">Newsletter</p>
            <h2 className="font-heading text-4xl lg:text-5xl leading-[1.05] text-white">
              Oder per{" "}
              <em className="gold-text not-italic">E-Mail bleiben.</em>
            </h2>
            <p className="mt-5 text-white/40 max-w-sm leading-relaxed">
              Kein Spam. Nur Produkt-Updates, neue Kurse und umsetzbare AI-Tipps — direkt in deine Inbox.
            </p>
          </div>
          <div className="pt-4">
            <LeadForm source="community" />
          </div>
        </div>
      </section>

      {/* CTA bridge — no panel-surface card */}
      <section className="py-32 bg-obsidian border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow mb-6">Nächster Schritt</p>
            <h2 className="font-heading text-4xl lg:text-5xl leading-[1.05] text-white max-w-2xl">
              Community ist Einstieg.{" "}
              <em className="gold-text not-italic">Kurse sind Umsetzung.</em>
            </h2>
            <p className="mt-5 text-white/40 max-w-xl leading-relaxed">
              Wenn du tiefer bauen willst, geh vom Impuls in einen konkreten Mini-Kurs.
            </p>
          </div>
          <Button href="/kurse" variant="secondary">Kurse ansehen</Button>
        </div>
      </section>
    </>
  );
}
