"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, X } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

gsap.registerPlugin(ScrollTrigger);

const ANTI_PROMISES = [
  "Garantierte 20K im Monat",
  "Passives Einkommen ohne Arbeit",
  "Reich in 30 Tagen",
  "AI macht alles für dich",
  "Du brauchst kein Skill",
  "Zertifizierter Coach mit Erfolgsgarantie"
];

const REAL_PROMISES = [
  "Ein klares erstes digitales Produkt",
  "Eine Verkaufsseite, die funktioniert",
  "AI-Prompts für schnelle Umsetzung",
  "Realistisches Ziel: 3.000 € / Monat",
  "Ein System, das auch in 12 Monaten noch läuft",
  "Ehrliche Cases — mit Zahlen, nicht Screenshots"
];

export function AntihypeSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const leftItems = section.querySelectorAll<HTMLElement>("[data-anti]");
    const rightItems = section.querySelectorAll<HTMLElement>("[data-real]");

    const allItems = Array.from(leftItems).flatMap((left, i) => {
      const right = rightItems[i];
      return right ? [left, right] : [left];
    });

    gsap.fromTo(
      allItems,
      { opacity: 0, x: (i) => (i % 2 === 0 ? -20 : 20) },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
          end: "top 20%",
          scrub: 1
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y border-gold-500/10 bg-obsidian/80 py-28 sm:py-36"
    >
      <div className="container-shell">
        <SectionHeading
          eyebrow="Klartext"
          title={
            <>
              Was du hier{" "}
              <span className="font-heading italic text-gold-200">nicht</span>{" "}
              bekommst.
            </>
          }
          copy="Weil es wichtig ist, das klar zu sagen."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-red-500/15 bg-red-950/[0.04] p-8">
            <p className="flex items-center gap-3 font-heading text-lg text-red-300/90">
              <X className="h-5 w-5" aria-hidden />
              Bekommst du nicht
            </p>
            <ul className="mt-6 space-y-4">
              {ANTI_PROMISES.map((promise) => (
                <li
                  key={promise}
                  data-anti
                  className="text-base text-muted/90 line-through decoration-red-400/50 decoration-[1.5px] opacity-0"
                >
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel-surface-glow rounded-[1.5rem] p-8">
            <p className="flex items-center gap-3 font-heading text-lg text-gold-200">
              <Check className="h-5 w-5" aria-hidden />
              Bekommst du stattdessen
            </p>
            <ul className="mt-6 space-y-4">
              {REAL_PROMISES.map((promise) => (
                <li
                  key={promise}
                  data-real
                  className="flex items-center gap-3 text-base text-cream opacity-0"
                >
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-gold-500/15">
                    <Check className="h-3 w-3 text-gold-300" aria-hidden />
                  </span>
                  {promise}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
