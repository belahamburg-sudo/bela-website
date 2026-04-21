"use client";

import { PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export function VideoHeroSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-obsidian overflow-hidden">
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
          className="mx-auto max-w-5xl"
        >
          <div className="relative aspect-video rounded-sm overflow-hidden bg-obsidian border border-gold-300/20">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold-300/60 z-10" aria-hidden />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-300/60 z-10" aria-hidden />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-300/60 z-10" aria-hidden />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold-300/60 z-10" aria-hidden />

            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(240,180,41,0.10) 0%, transparent 65%)",
              }}
              aria-hidden
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <button
                type="button"
                aria-label="Video abspielen"
                className="flex h-20 w-20 items-center justify-center rounded-sm border border-gold-300/40 bg-gold-300/10 backdrop-blur-sm transition-all hover:bg-gold-300/20 hover:border-gold-300/70 hover:scale-105 focus-ring"
              >
                <PlayCircle aria-hidden className="h-10 w-10 text-gold-300" />
              </button>
              <p className="gta-label text-gold-300/50">
                On-Demand · Jederzeit verfügbar
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
