"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll } from "animejs";
import { Button } from "@/components/button";
import { telegramUrl } from "@/lib/env";

const WINS = [
  { initials: "ZS", name: "Zada", handle: "@somerov", earnings: "$120K", detail: "Revenue seit Juni · $20K bestes Monat", location: "US", highlight: true },
  { initials: "AG", name: "Armando G.", handle: "@scalewithmando", earnings: "$111K", detail: "100K Sales in 45 Tagen", location: "US", highlight: true },
  { initials: "MG", name: "Maurice", handle: "@mauricesalb", earnings: "$32,046", detail: "4 Joined · 1 Created", location: "Vietnam" },
  { initials: "LS", name: "Lars", handle: "@larsmeidell", earnings: "$7,335", detail: "3 Joined · 1 Created", location: "Marokko" },
  { initials: "LB", name: "Lambro", handle: "@lambro", earnings: "$8,179", detail: "Earnings", location: "US" },
  { initials: "NM", name: "Nafi", handle: "@nafiosmani", earnings: "$16,445", detail: "39 Joined · 17 Created", location: "US" },
  { initials: "SF", name: "Sean", handle: "@seanferres", earnings: "$10,181", detail: "5 Joined · 1 Created", location: "AU" },
  { initials: "RJ", name: "Close", handle: "@roelmojico", earnings: "$4,367", detail: "1 Joined · 5 Created", location: "UK" },
];

const LANES = [
  WINS,
  [...WINS].reverse(),
  [...WINS.slice(2), ...WINS.slice(0, 2)],
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
    <section className="relative py-40 bg-obsidian overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gold-300/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div ref={headingRef} className="mb-16 text-center" style={{ opacity: 0 }}>
          <p className="eyebrow mb-6">Community</p>
          <h2 className="font-heading tracking-gta leading-none text-cream" style={{ fontSize: "clamp(2.2rem,5vw,5rem)" }}>
            MEINE COMMUNITY CASHED BEIM<br />
            <span className="gold-text">KI-GOLDRAUSCH</span> SCHON AB.
          </h2>
          <p className="mt-5 text-cream/40 text-lg max-w-md mx-auto">
            Echte Screenshots. Echte Zahlen. Von ersten Kunden bis zum gekündigten 9-to-5.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-obsidian to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-obsidian to-transparent z-10" />

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
                {[...lane, ...lane].map((win, i) => (
                  <div
                    key={`${laneIndex}-${i}`}
                    className={`flex-none w-64 rounded-sm border p-5 ${
                      win.highlight
                        ? "border-gold-300/40 bg-gold-300/5"
                        : "border-gold-300/15 bg-obsidian/80"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-gold-300/50">Monetise</span>
                      <span className="ml-auto text-[0.6rem] text-cream/20">{win.location}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[0.65rem] font-bold text-obsidian shrink-0"
                        style={{ background: "linear-gradient(135deg, #FFD76A, #C98B00)" }}
                      >
                        {win.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-cream leading-none truncate">{win.name}</p>
                        <p className="text-[0.65rem] text-cream/30 mt-0.5">{win.handle}</p>
                      </div>
                    </div>

                    <div className="border-t border-gold-300/10 pt-4">
                      <p className="font-heading tracking-gta text-2xl text-gold-300">{win.earnings}</p>
                      <p className="text-[0.65rem] text-cream/30 mt-1">{win.detail}</p>
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
