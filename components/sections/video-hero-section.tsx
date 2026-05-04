"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause, Sparkles, Globe, Zap, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { telegramUrl } from "@/lib/env";

export function VideoHeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);

  function handlePlayPause() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
      setStarted(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  function handleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden bg-obsidian px-6"
      style={{ minHeight: "calc(100svh - 92px)", paddingTop: "clamp(6rem, 8vw, 7.5rem)", paddingBottom: "clamp(1rem, 2vw, 1.75rem)" }}
    >
      {/* Subtle gold radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 35%, rgba(212,175,55,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full mx-auto max-w-4xl flex flex-col items-center gap-3 text-center">

        {/* ── GTA Mission Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative flex items-center gap-2.5 rounded-full border-2 border-gold-300/60 bg-black/60 backdrop-blur px-4 py-2"
          style={{
            boxShadow: "0 0 20px rgba(212,175,55,0.3), inset 0 0 20px rgba(212,175,55,0.1)"
          }}
        >
          <span className="text-[0.65rem] font-mono font-bold uppercase tracking-[0.25em] text-gold-300">
            [MISSION AKTIV]
          </span>
          <span className="w-1 h-1 rounded-full bg-gold-300 animate-pulse" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-gold-300/80">
            23. Mai · 19 Uhr
          </span>
        </motion.div>

        {/* ── Headline ── */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-heading font-extrabold leading-[0.95] text-cream"
          style={{ fontSize: "clamp(1.85rem, 8vw, 4.6rem)" }}
        >
          Ich zeige dir, wie du mit AI digitale Produkte baust{" "}
          <span className="gold-text">und automatisiert verkaufst.</span>
        </motion.h1>

        {/* ── Subtext ── */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-sm sm:text-base text-cream/70 max-w-2xl leading-relaxed px-2 sm:px-0"
        >
          Hör auf, Zeit gegen Geld zu tauschen. Während andere Modelle hohes Risiko oder Startkapital erfordern, bieten digitale Produkte maximale Marge bei minimalem Aufwand. Mit AI baust du Templates, Guides oder Kurse in Stunden statt Wochen und verkaufst sie vollautomatisiert. Kein Lager, kein Risiko – nur Freiheit. Ich zeige dir, wie du diesen Weg erfolgreich gehst.
        </motion.p>

        {/* ── Video ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-2xl"
        >
          <div className="relative w-full overflow-hidden rounded-sm border border-gold-300/20 bg-obsidian" style={{ aspectRatio: "16/9" }}>
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-300/60 z-10 pointer-events-none" aria-hidden />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-300/60 z-10 pointer-events-none" aria-hidden />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-300/60 z-10 pointer-events-none" aria-hidden />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-300/60 z-10 pointer-events-none" aria-hidden />

            <video
              ref={videoRef}
              src="/assets/bela-intro-cropped.mp4"
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
              preload="metadata"
              onEnded={() => setPlaying(false)}
            />

            <div
              className="absolute inset-0 bg-obsidian/40 transition-opacity duration-500 pointer-events-none"
              style={{ opacity: playing ? 0 : 1 }}
              aria-hidden
            />

            {!playing && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, rgba(212,175,55,0.10) 0%, transparent 65%)" }}
                aria-hidden
              />
            )}

            {!started && (
              <button
                type="button"
                onClick={handlePlayPause}
                aria-label="Video abspielen"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-sm border border-gold-300/50 bg-gold-300/10 backdrop-blur-sm transition-all hover:bg-gold-300/20 hover:border-gold-300/80 hover:scale-105">
                  <Play className="h-7 w-7 text-gold-300 translate-x-0.5" fill="currentColor" />
                </span>
                <span className="gta-label text-gold-300/60">Jetzt ansehen · 30 Sek</span>
              </button>
            )}

            <div
              className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-between px-4 py-2.5 transition-opacity duration-300"
              style={{
                background: "linear-gradient(to top, rgba(10,8,6,0.85) 0%, transparent 100%)",
                opacity: started ? 1 : 0,
                pointerEvents: started ? "auto" : "none",
              }}
            >
              <button
                type="button"
                onClick={handlePlayPause}
                aria-label={playing ? "Pause" : "Abspielen"}
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/10 text-gold-300 hover:bg-gold-300/20 transition-colors"
              >
                {playing
                  ? <Pause className="h-3 w-3" fill="currentColor" />
                  : <Play className="h-3 w-3 translate-x-px" fill="currentColor" />
                }
              </button>
              <button
                type="button"
                onClick={handleMute}
                aria-label={muted ? "Ton einschalten" : "Ton ausschalten"}
                className="flex h-7 w-7 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/10 text-gold-300 hover:bg-gold-300/20 transition-colors"
              >
                {muted
                  ? <VolumeX className="h-3 w-3" />
                  : <Volume2 className="h-3 w-3" />
                }
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Trust Icons ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.62, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
        >
          <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cream/40">
            <Sparkles className="h-3.5 w-3.5 text-gold-300/80" />
            Geld verdienen mit AI
          </span>
          <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cream/40">
            <Globe className="h-3.5 w-3.5 text-gold-300/80" />
            Remote von überall
          </span>
          <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cream/40">
            <Zap className="h-3.5 w-3.5 text-gold-300/80" />
            Keine Vorerfahrung nötig
          </span>
          <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cream/40">
            <EyeOff className="h-3.5 w-3.5 text-gold-300/80" />
            Kein Gesicht zeigen
          </span>
        </motion.div>


        {/* ── CTA + Social Proof ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row mb-1">
            <Link
              href="/webinar"
              className="btn-shimmer group inline-flex items-center gap-2 rounded-full bg-gold-300 px-8 py-3 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:bg-gold-200 hover:shadow-[0_0_50px_rgba(212,175,55,0.45)] relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">Webinar starten</span> →
            </Link>
            
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gold-300/40 px-8 py-3 text-sm font-bold uppercase tracking-[0.14em] text-cream/80 transition-all hover:border-gold-300/80 hover:text-cream hover:bg-gold-300/5"
            >
              Free Telegram Community
            </a>
          </div>

          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-cream/25">
            Kostenlos · ohne Bullshit · live am 23. Mai
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-2.5">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {["B", "M", "A", "K", "L"].map((initial, i) => (
                <span
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-obsidian text-[0.5rem] font-bold text-obsidian"
                  style={{
                    background: `linear-gradient(135deg, #FFD76A, #C98B00)`,
                    opacity: 0.85 + i * 0.03,
                    zIndex: 5 - i,
                  }}
                >
                  {initial}
                </span>
              ))}
            </div>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cream/35">
              Join +10.000 anderen
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
