"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll } from "animejs";
import Image from "next/image";
import { Button } from "@/components/button";
import { telegramUrl } from "@/lib/env";

const COMMUNITY_CARDS = [
  { src: "/assets/generated/testimonial-01.svg", label: "Fake", title: "Demo Testimonial 01", meta: "Placeholder screenshot" },
  { src: "/assets/generated/testimonial-02.svg", label: "Fake", title: "Demo Testimonial 02", meta: "Placeholder screenshot" },
  { src: "/assets/generated/testimonial-03.svg", label: "Fake", title: "Demo Testimonial 03", meta: "Placeholder screenshot" },
  { src: "/assets/generated/testimonial-01.svg", label: "Fake", title: "Demo Testimonial 04", meta: "Placeholder screenshot" },
  { src: "/assets/generated/testimonial-02.svg", label: "Fake", title: "Demo Testimonial 05", meta: "Placeholder screenshot" },
  { src: "/assets/generated/testimonial-03.svg", label: "Fake", title: "Demo Testimonial 06", meta: "Placeholder screenshot" },
  { src: "/assets/generated/testimonial-01.svg", label: "Fake", title: "Demo Testimonial 07", meta: "Placeholder screenshot" },
  { src: "/assets/generated/testimonial-02.svg", label: "Fake", title: "Demo Testimonial 08", meta: "Placeholder screenshot" },
];

const LANES = [
  COMMUNITY_CARDS,
  [...COMMUNITY_CARDS].reverse(),
  [...COMMUNITY_CARDS.slice(2), ...COMMUNITY_CARDS.slice(0, 2)],
];

export function CommunitySection() {
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    if (headingRef.current) {
      const anim = animate(headingRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800, ease: "outExpo", autoplay: false });
      const obs = onScroll({ target: headingRef.current, enter: "bottom-=10% top", onEnter: () => anim.play() });
      cleanups.push(() => { anim.revert(); obs.revert(); });
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="relative py-16 lg:py-40 bg-obsidian overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gold-300/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div ref={headingRef} className="mb-10 lg:mb-16 text-center" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6">🎯 MISSION 4</p>
          <h2 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(1.75rem, 8vw, 5rem)" }}>
            MEINE COMMUNITY BAUT<br />
            <span className="gold-text">ECHTE DIGITALE PRODUKTE</span> AUF.
          </h2>
            <p className="mt-5 text-cream/40 text-base lg:text-lg max-w-md mx-auto leading-relaxed">
            Von ersten Launches bis zum Exit aus dem 9-to-5. Diese Carousel-Karten sind bewusst als Fake-Dateien angelegt und später austauschbar.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 lg:w-24 bg-gradient-to-r from-obsidian to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 lg:w-24 bg-gradient-to-l from-obsidian to-transparent z-10" />

          <div className="space-y-4">
            {LANES.map((lane, laneIndex) => (
              <div
                key={laneIndex}
                className="flex gap-4"
                style={{
                  animation: `scroll-cards ${laneIndex === 1 ? 36 : laneIndex === 2 ? 40 : 32}s linear infinite`,
                  animationDirection: laneIndex === 1 ? "reverse" : "normal",
                }}
              >
                {[...lane, ...lane].map((card, i) => (
                  <div
                    key={`${laneIndex}-${i}`}
                    className="group flex-none w-72 lg:w-80 overflow-hidden rounded-sm border border-gold-300/15 bg-obsidian/80"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image
                        src={card.src}
                        alt={card.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 18rem, 20rem"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/15 to-transparent" />
                      <div className="absolute left-0 right-0 bottom-0 p-4 lg:p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="rounded-full border border-gold-300/30 bg-obsidian/70 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-gold-300">
                            {card.label}
                          </span>
                        </div>
                        <p className="font-heading tracking-gta text-xl text-cream leading-tight">
                          {card.title}
                        </p>
                        <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-cream/45">
                          {card.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button href={telegramUrl} variant="outline" size="lg" target="_blank" rel="noopener noreferrer">
            Free Telegram Gruppe
          </Button>
        </div>
      </div>
    </section>
  );
}
