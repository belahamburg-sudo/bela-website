"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Sparkles, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const MODELS = [
  {
    name: "Dropshipping",
    tag: "Kapitalintensiv",
    points: ["Hohes Testing-Budget", "Logistik-Kopfschmerzen", "Lange Margen-Kette"],
    primary: false
  },
  {
    name: "Agenturen",
    tag: "Zeit-gebunden",
    points: ["Zeit gegen Geld", "Kundenakquise dauerhaft", "Schwer skalierbar"],
    primary: false
  },
  {
    name: "SaaS",
    tag: "Technik-lastig",
    points: ["Produktentwicklung in Monaten", "Support + Technik", "Kapital nötig"],
    primary: false
  },
  {
    name: "Digitale Produkte",
    tag: "Die Methode",
    points: [
      "Einmal bauen, oft verkaufen",
      "Fast reine digitale Marge",
      "Mit AI in Tagen statt Monaten"
    ],
    primary: true
  }
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const cards = track.querySelectorAll<HTMLElement>("[data-card]");
    const totalScroll = track.scrollWidth - window.innerWidth;

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${totalScroll}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      animation: gsap.to(track, {
        x: -totalScroll,
        ease: "none"
      }),
      onUpdate: (self) => {
        const lastCard = cards[cards.length - 1];
        if (!lastCard) return;
        const progress = self.progress;
        if (progress > 0.85) {
          gsap.to(lastCard, {
            boxShadow: "0 0 0 1px rgba(255,215,106,0.4), 0 30px 80px -30px rgba(214,168,79,0.5)",
            duration: 0.4,
            overwrite: true
          });
        }
      }
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ height: "100vh" }}
    >
      <div className="container-shell relative z-10 pt-20">
        <p className="eyebrow mb-4">Die Haltung</p>
        <h2 className="max-w-3xl font-heading text-display-md text-cream">
          Nicht jedes Online-Modell ist clever{" "}
          <span className="text-muted/60">für den Start.</span>
        </h2>
      </div>

      <div
        ref={trackRef}
        className="mt-12 flex gap-6 pl-5 sm:pl-10 lg:pl-[calc((100vw-80rem)/2+2.5rem)]"
      >
        {MODELS.map((model) => (
          <article
            key={model.name}
            data-card
            className={`relative w-[80vw] max-w-[480px] flex-none overflow-hidden rounded-[1.5rem] border p-8 transition-shadow duration-500 sm:w-[60vw] md:w-[45vw] lg:w-[30vw] ${
              model.primary
                ? "border-gold-300/30 bg-gradient-to-br from-gold-500/[0.1] via-transparent to-transparent"
                : "border-gold-500/10 bg-panel/40"
            }`}
          >
            {model.primary ? (
              <Sparkles className="absolute right-6 top-6 h-5 w-5 text-gold-300" aria-hidden />
            ) : null}

            <p
              className={`text-[0.68rem] font-semibold uppercase tracking-[0.22em] ${
                model.primary ? "text-gold-300" : "text-muted"
              }`}
            >
              {model.tag}
            </p>
            <h3 className="mt-3 font-heading text-2xl text-cream">
              {model.name}
            </h3>

            <ul className="mt-8 space-y-4">
              {model.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[0.9rem] leading-[1.6]">
                  {model.primary ? (
                    <Check className="mt-0.5 h-4 w-4 flex-none text-gold-300" aria-hidden />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 flex-none text-muted/60" aria-hidden />
                  )}
                  <span className={model.primary ? "text-cream" : "text-muted"}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
