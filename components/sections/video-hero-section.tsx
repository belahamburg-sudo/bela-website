"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Sparkles, Globe, Zap, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { telegramUrl } from "@/lib/env";
import { Particles } from "@/components/ui/particles";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

export function VideoHeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const scrubbingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  const playedPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  // The native video can fire `loadedmetadata` before React hydrates and attaches
  // its handler, leaving duration at 0. Read it directly on mount and keep it synced.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const syncDuration = () => {
      if (Number.isFinite(v.duration) && v.duration > 0) setDuration(v.duration);
    };
    syncDuration();
    v.addEventListener("loadedmetadata", syncDuration);
    v.addEventListener("durationchange", syncDuration);
    return () => {
      v.removeEventListener("loadedmetadata", syncDuration);
      v.removeEventListener("durationchange", syncDuration);
    };
  }, []);

  function fmt(t: number) {
    if (!Number.isFinite(t) || t < 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handlePlayPause() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setStarted(true);
    } else {
      v.pause();
    }
  }

  function handleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (v && !scrubbingRef.current) setCurrentTime(v.currentTime);
  }

  function handleProgress() {
    const v = videoRef.current;
    if (v && v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
  }

  function seekToClientX(clientX: number) {
    const el = progressRef.current;
    const v = videoRef.current;
    if (!el || !v) return;
    const total = duration || v.duration || 0;
    if (!total) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const t = frac * total;
    v.currentTime = t;
    setCurrentTime(t);
  }

  function onSeekPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    scrubbingRef.current = true;
    seekToClientX(e.clientX);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture unsupported for this pointer — seeking still works */
    }
  }

  function onSeekPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (scrubbingRef.current) seekToClientX(e.clientX);
  }

  function onSeekPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    scrubbingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* nothing to release */
    }
  }

  function skip(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    const max = duration || v.duration || 0;
    const next = Math.min(max, Math.max(0, v.currentTime + delta));
    v.currentTime = next;
    setCurrentTime(next);
    setStarted(true);
  }

  function onSeekKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      skip(5);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      skip(-5);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handlePlayPause();
    }
  }

  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden sec-hero px-6"
      style={{ minHeight: "calc(100svh - 92px)", paddingTop: "clamp(5rem, 7vw, 6.5rem)", paddingBottom: "clamp(1rem, 2vw, 1.75rem)" }}
    >
      {/* Subtle gold radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 35%, rgba(232,192,64,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Atmospheric gold dust */}
      <Particles
        className="absolute inset-0"
        quantity={90}
        ease={70}
        staticity={40}
        size={0.5}
        color="#E8C040"
        refresh
      />

      <div className="relative w-full mx-auto max-w-4xl flex flex-col items-center gap-3 text-center">

        {/* ── Live Mission Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="group relative inline-flex items-center gap-3 rounded-full border border-gold-300/25 bg-gradient-to-b from-white/[0.07] to-white/[0.02] px-1.5 py-1.5 pr-4 backdrop-blur-md"
          style={{ boxShadow: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 8px 30px -12px rgba(232,192,64,0.4)" }}
        >
          {/* Live indicator pill */}
          <span className="flex items-center gap-1.5 rounded-full bg-gold-gradient px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-obsidian/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-obsidian" />
            </span>
            <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-obsidian">Live</span>
          </span>
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-cream/90">
            Nächstes Webinar
          </span>
          <span className="h-3 w-px bg-gold-300/30" aria-hidden />
          <AnimatedGradientText
            speed={1}
            className="text-[0.68rem] font-bold uppercase tracking-[0.14em]"
          >
            11. Juni · 19 Uhr
          </AnimatedGradientText>
        </motion.div>

        {/* ── Headline ── */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-heading font-extrabold leading-[0.95] text-cream"
          style={{ fontSize: "clamp(1.85rem, 8vw, 4.6rem)" }}
        >
          Ich zeige dir, wie du mit <br />
          <span className="gold-text">AI digitale Produkte <br /> baust und automatisiert <br /> verkaufst.</span>
        </motion.h1>

        {/* ── Subtext ── */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-sm sm:text-base text-cream/70 max-w-2xl leading-relaxed px-2 sm:px-0"
        >
          Alte Online-Modelle fressen Kapital, Zeit oder Nerven.
          Digitale Produkte sind schlanker: Mit AI baust du Templates, Guides oder Mini-Kurse in Stunden und verkaufst sie automatisiert mit fast reiner Marge.
        </motion.p>

        {/* ── Video ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-2xl"
        >
          <div className="video-frame-gold aspect-video bg-obsidian">
            <video
              ref={videoRef}
              src="/assets/ai-goldmining.mp4"
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
              preload="metadata"
              onClick={() => started && handlePlayPause()}
              onTimeUpdate={handleTimeUpdate}
              onProgress={handleProgress}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
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
                style={{ background: "radial-gradient(ellipse at center, rgba(232,192,64,0.15) 0%, transparent 65%)" }}
                aria-hidden
              />
            )}

            {!started && (
              <button
                type="button"
                onClick={handlePlayPause}
                aria-label="Video abspielen"
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20"
              >
                <span className="play-btn-gold h-20 w-24">
                  <Play className="h-10 w-10 text-obsidian translate-x-1" fill="currentColor" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-100 drop-shadow-md">Jetzt ansehen · 5 Min</span>
              </button>
            )}

            <div
              className="absolute bottom-0 inset-x-0 z-20 px-3 pb-2.5 pt-7 transition-opacity duration-300 sm:px-4"
              style={{
                background: "linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.5) 55%, transparent 100%)",
                opacity: started ? 1 : 0,
                pointerEvents: started ? "auto" : "none",
              }}
            >
              {/* Seek bar */}
              <div
                ref={progressRef}
                role="slider"
                aria-label="Video-Fortschritt"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(currentTime)}
                tabIndex={0}
                onPointerDown={onSeekPointerDown}
                onPointerMove={onSeekPointerMove}
                onPointerUp={onSeekPointerUp}
                onKeyDown={onSeekKeyDown}
                className="group relative flex h-4 cursor-pointer touch-none select-none items-center outline-none"
              >
                <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-cream/15 transition-all duration-150 group-hover:h-[5px] group-focus-visible:h-[5px]">
                  <div className="absolute inset-y-0 left-0 bg-cream/25" style={{ width: `${bufferedPct}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-gold-gradient" style={{ width: `${playedPct}%` }} />
                </div>
                <span
                  className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 rounded-full bg-gold-300 opacity-0 shadow-[0_0_10px_rgba(232,192,64,0.7)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{ left: `${playedPct}%` }}
                  aria-hidden
                />
              </div>

              {/* Control row */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  aria-label={playing ? "Pause" : "Abspielen"}
                  className="flex h-7 w-7 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/10 text-gold-300 transition-colors hover:bg-gold-300/20"
                >
                  {playing
                    ? <Pause className="h-3 w-3" fill="currentColor" />
                    : <Play className="h-3 w-3 translate-x-px" fill="currentColor" />
                  }
                </button>
                <button
                  type="button"
                  onClick={() => skip(-10)}
                  aria-label="10 Sekunden zurück"
                  title="10 Sek. zurück"
                  className="flex h-7 w-7 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/10 text-gold-300 transition-colors hover:bg-gold-300/20"
                >
                  <SkipBack className="h-3 w-3" fill="currentColor" />
                </button>
                <button
                  type="button"
                  onClick={() => skip(10)}
                  aria-label="10 Sekunden vor"
                  title="10 Sek. vor"
                  className="flex h-7 w-7 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/10 text-gold-300 transition-colors hover:bg-gold-300/20"
                >
                  <SkipForward className="h-3 w-3" fill="currentColor" />
                </button>
                <span className="ml-1 font-mono text-[10px] tabular-nums tracking-wide text-cream/70">
                  {fmt(currentTime)} <span className="text-cream/30">/</span> {fmt(duration)}
                </span>
                <button
                  type="button"
                  onClick={handleMute}
                  aria-label={muted ? "Ton einschalten" : "Ton ausschalten"}
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/10 text-gold-300 transition-colors hover:bg-gold-300/20"
                >
                  {muted
                    ? <VolumeX className="h-3 w-3" />
                    : <Volume2 className="h-3 w-3" />
                  }
                </button>
              </div>
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
              className="btn-shimmer group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-600 via-gold-50 to-gold-600 px-8 py-3 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:brightness-110 shadow-[0_0_30px_rgba(232,192,64,0.35)] relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">Webinar starten</span> →
            </Link>
            
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer inline-flex items-center gap-2 rounded-full border border-gold-300/40 px-8 py-3 text-sm font-bold uppercase tracking-[0.14em] text-cream/80 transition-all hover:border-gold-300/80 hover:text-cream hover:bg-gold-300/5"
            >
              Free Telegram Community
            </a>
          </div>

          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-cream/25">
            Kostenlos · ohne Bullshit · live am 11. Juni
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
                    background: `linear-gradient(135deg, #FFFCE8, #7D5812)`,
                    opacity: 0.85 + i * 0.03,
                    zIndex: 5 - i,
                  }}
                >
                  {initial}
                </span>
              ))}
            </div>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cream/35">
              Schließe dich 10.000+ Umsetzern an
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
