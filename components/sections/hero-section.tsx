"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/button";

gsap.registerPlugin(ScrollTrigger);

const HEADLINE_LINES = [
  "Digitale Produkte mit AI.",
  "Einmal erstellt.",
  "Immer wieder verkauft."
];

const SUBLINE =
  "Aus deinem Wissen wird ein Produkt — mit AI in Tagen gebaut, über einen automatisierten Funnel verkauft.";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const orb = orbRef.current;
    const cue = cueRef.current;
    if (!section || !content || !orb || !cue) return;

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lines = content.querySelectorAll<HTMLElement>("[data-line]");
    const sub = content.querySelector<HTMLElement>("[data-sub]");
    const ctas = content.querySelector<HTMLElement>("[data-ctas]");

    if (prefersReduced) {
      lines.forEach((l) => gsap.set(l, { opacity: 1, y: 0 }));
      if (sub) gsap.set(sub, { opacity: 1, y: 0 });
      if (ctas) gsap.set(ctas, { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(
      lines,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }
    );

    if (sub) {
      tl.fromTo(
        sub,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=0.3"
      );
    }

    if (ctas) {
      tl.fromTo(
        ctas,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=0.3"
      );
    }

    const exitTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    exitTl.to(content, {
      opacity: 0,
      scale: 0.95,
      y: -60,
      ease: "none"
    });

    exitTl.to(
      orb,
      { opacity: 0, scale: 1.1, ease: "none" },
      0
    );

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "50px top",
      onLeave: () => gsap.to(cue, { opacity: 0, duration: 0.3 }),
      onEnterBack: () => gsap.to(cue, { opacity: 1, duration: 0.3 })
    });

    return () => {
      tl.kill();
      exitTl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div
        ref={orbRef}
        aria-hidden
        className="pointer-events-none absolute h-[60vw] max-h-[700px] w-[60vw] max-w-[700px] animate-breathe rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,215,106,0.25) 0%, rgba(214,168,79,0.1) 40%, transparent 70%)"
        }}
      />

      <div ref={contentRef} className="container-shell relative text-center">
        <h1 className="mx-auto max-w-5xl">
          {HEADLINE_LINES.map((line, i) => (
            <span
              key={i}
              data-line
              className="block font-heading text-display-xl text-cream opacity-0"
              style={i === 2 ? { fontStyle: "italic", color: "rgba(138,138,143,0.7)" } : undefined}
            >
              {i === 1 ? <span className="gold-text-shine">{line}</span> : line}
            </span>
          ))}
        </h1>

        <p
          data-sub
          className="mx-auto mt-8 max-w-xl text-lg leading-[1.75] text-muted opacity-0"
        >
          {SUBLINE}
        </p>

        <div
          data-ctas
          className="mt-10 flex flex-col items-center justify-center gap-3 opacity-0 sm:flex-row"
        >
          <Button href="/webinar" size="lg">
            Gratis Webinar ansehen
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button href="/kurse" variant="outline" size="lg">
            <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
            Kurse entdecken
          </Button>
        </div>
      </div>

      <div
        ref={cueRef}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/20">
          <ArrowDown className="h-4 w-4 animate-bounce text-gold-300" aria-hidden />
        </span>
      </div>
    </section>
  );
}
