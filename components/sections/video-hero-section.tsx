"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

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
    <section className="relative py-20 sm:py-28 bg-obsidian overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(240,180,41,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 text-center"
        >
          <p className="eyebrow mb-4 justify-center">AI Goldmining Training</p>
          <h1
            className="font-heading tracking-gta leading-none text-cream"
            style={{ fontSize: "clamp(2.2rem,5vw,5rem)" }}
          >
            DEIN WISSEN.{" "}
            <span className="gold-text">AUTOMATISIERT VERMARKTET.</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto max-w-4xl"
        >
          <div className="relative aspect-video rounded-sm overflow-hidden bg-obsidian border border-gold-300/20 group">
            {/* GTA corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold-300/60 z-10 pointer-events-none" aria-hidden />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-300/60 z-10 pointer-events-none" aria-hidden />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-300/60 z-10 pointer-events-none" aria-hidden />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold-300/60 z-10 pointer-events-none" aria-hidden />

            {/* Video */}
            <video
              ref={videoRef}
              src="/assets/bela-intro-cropped.mp4"
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
              preload="metadata"
              onEnded={() => setPlaying(false)}
            />

            {/* Dark overlay — fades out once playing */}
            <div
              className="absolute inset-0 bg-obsidian/40 transition-opacity duration-500 pointer-events-none"
              style={{ opacity: playing ? 0 : 1 }}
              aria-hidden
            />

            {/* Gold glow */}
            {!playing && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(240,180,41,0.10) 0%, transparent 65%)",
                }}
                aria-hidden
              />
            )}

            {/* Center play button — shown before first play */}
            {!started && (
              <button
                type="button"
                onClick={handlePlayPause}
                aria-label="Video abspielen"
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-sm border border-gold-300/50 bg-gold-300/10 backdrop-blur-sm transition-all hover:bg-gold-300/20 hover:border-gold-300/80 hover:scale-105">
                  <Play className="h-9 w-9 text-gold-300 translate-x-0.5" fill="currentColor" />
                </span>
                <span className="gta-label text-gold-300/60">Jetzt ansehen · 30 Sek</span>
              </button>
            )}

            {/* Controls — bottom bar, visible on hover or when playing */}
            <div
              className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 transition-opacity duration-300"
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
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/10 text-gold-300 hover:bg-gold-300/20 transition-colors"
              >
                {playing
                  ? <Pause className="h-3.5 w-3.5" fill="currentColor" />
                  : <Play className="h-3.5 w-3.5 translate-x-px" fill="currentColor" />
                }
              </button>
              <button
                type="button"
                onClick={handleMute}
                aria-label={muted ? "Ton einschalten" : "Ton ausschalten"}
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/10 text-gold-300 hover:bg-gold-300/20 transition-colors"
              >
                {muted
                  ? <VolumeX className="h-3.5 w-3.5" />
                  : <Volume2 className="h-3.5 w-3.5" />
                }
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
