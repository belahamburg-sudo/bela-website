"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const TYPEWRITER_PHRASES = [
  "Digitale Produkte mit AI bauen.",
  "Einmal erstellen. Dauerhaft verkaufen.",
  "Dein Wissen. Automatisiert vermarktet.",
];

function Typewriter({ phrases }: { phrases: string[] }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const current = phrases[phraseIndex];
    if (!deleting && displayed.length < current.length) {
      timeoutRef.current = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 42);
    } else if (!deleting && displayed.length === current.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeoutRef.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 20);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % phrases.length);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [displayed, deleting, phraseIndex, phrases]);

  return (
    <span>
      {displayed}
      <span className="inline-block w-[3px] h-[0.85em] bg-gold-300 align-middle ml-1 animate-pulse" />
    </span>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden bg-obsidian">
      {/* ── Cinematic mine background with Ken Burns ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 origin-center animate-camera"
          style={{ willChange: "transform" }}
        >
          <Image
            src="/assets/mine-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* Lamp flicker */}
        <div
          className="absolute inset-0 lamp-glow animate-flicker"
          aria-hidden
        />

        {/* Gold sparkles on the vein */}
        <div className="absolute inset-0" aria-hidden style={{ mixBlendMode: "screen" }}>
          {[
            { left: "46%", top: "30%", delay: "0s" },
            { left: "52%", top: "42%", delay: "0.3s", scale: 1.3 },
            { left: "58%", top: "25%", delay: "0.7s" },
            { left: "49%", top: "55%", delay: "1.0s", scale: 0.8 },
            { left: "61%", top: "48%", delay: "1.3s", scale: 1.5 },
            { left: "55%", top: "62%", delay: "1.6s" },
            { left: "66%", top: "36%", delay: "1.9s", scale: 1.2 },
            { left: "44%", top: "38%", delay: "2.2s", scale: 0.7 },
            { left: "69%", top: "55%", delay: "0.4s" },
            { left: "63%", top: "18%", delay: "0.9s", scale: 1.4 },
          ].map((s, i) => (
            <span
              key={i}
              className="absolute w-[6px] h-[6px] rounded-full"
              style={{
                left: s.left,
                top: s.top,
                transform: `scale(${s.scale ?? 1})`,
                background: "radial-gradient(circle, #fff8dc 0%, #ffd866 40%, transparent 70%)",
                filter: "blur(0.3px)",
                opacity: 0,
                animation: `twinkle 2.4s ease-in-out ${s.delay} infinite`,
              }}
            />
          ))}
        </div>

        {/* Gold dust motes drifting up */}
        <div className="absolute inset-0" aria-hidden style={{ mixBlendMode: "screen" }}>
          {["42%", "55%", "63%", "48%", "70%", "38%"].map((left, i) => (
            <span
              key={i}
              className="absolute w-[3px] h-[3px] rounded-full"
              style={{
                left,
                top: `${88 + i * 1.5}%`,
                background: "#ffe089",
                boxShadow: "0 0 5px rgba(255,210,100,0.9)",
                opacity: 0,
                animation: `drift 7s linear ${(i * 1.2).toFixed(1)}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 vignette" aria-hidden />

        {/* Warm color grade */}
        <div className="absolute inset-0 color-grade" aria-hidden />

        {/* Heavy bottom fade so text is readable */}
        <div
          className="absolute inset-x-0 bottom-0 h-[70%]"
          style={{
            background: "linear-gradient(to top, rgba(10,8,6,0.97) 0%, rgba(10,8,6,0.82) 45%, transparent 100%)"
          }}
          aria-hidden
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full mx-auto max-w-7xl px-6 pb-20 pt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-end">

          {/* Left: Text column */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="eyebrow mb-5"
            >
              AI Goldmining
            </motion.p>

            {/* GTA-style big block headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-heading tracking-gta leading-none text-cream mb-4"
              style={{ fontSize: "clamp(3rem,7vw,7.5rem)" }}
            >
              <Typewriter phrases={TYPEWRITER_PHRASES} />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.55 }}
              className="text-base text-cream/60 mb-10 max-w-md leading-relaxed"
            >
              Lerne mit AI in kürzester Zeit digitale Produkte zu erstellen — Kurse, Templates, Guides — und verkaufe sie vollautomatisch.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/webinar"
                className="btn-shimmer inline-flex items-center gap-2 rounded-sm bg-gold-300 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-obsidian transition-all hover:bg-gold-200 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
              >
                Gratis Webinar →
              </Link>
              <Link
                href="/kurse"
                className="inline-flex items-center gap-2 rounded-sm border border-gold-300/40 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-cream/80 transition-all hover:border-gold-300/80 hover:text-cream hover:bg-gold-300/5"
              >
                Kurse entdecken
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex items-center gap-5 mt-10 text-xs text-cream/35 font-semibold uppercase tracking-[0.14em]"
            >
              <span>✓ Keine Vorkenntnisse</span>
              <span>✓ Sofort umsetzbar</span>
              <span>✓ Lifetime Zugang</span>
            </motion.div>
          </div>

          {/* Right: Bela character */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex justify-end items-end"
          >
            <div className="relative w-[340px] h-[460px]">
              <Image
                src="/assets/bela-character.jpeg"
                alt="Bela Goldmann — AI Goldmining"
                fill
                className="object-cover object-top rounded-sm"
                style={{
                  maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)"
                }}
              />
              {/* Gold border-left accent */}
              <div className="absolute left-0 top-0 w-[3px] h-full bg-gradient-to-b from-gold-300 via-gold-400 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-cream/25">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-gold-300/40 to-transparent"
        />
      </motion.div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(.8); }
          50%       { opacity: 1; transform: scale(1.4); }
        }
        @keyframes drift {
          0%   { opacity: 0; transform: translate(0,0); }
          10%  { opacity: .9; }
          90%  { opacity: .7; }
          100% { opacity: 0; transform: translate(-40px,-180px); }
        }
      `}</style>
    </section>
  );
}
