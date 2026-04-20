"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "animejs";
import Link from "next/link";
import ProductCanvas from "@/components/hero-3d-canvas";

const TYPEWRITER_PHRASES = [
  "Digitale Produkte mit AI bauen.",
  "Einmal erstellen. Dauerhaft verkaufen.",
  "Dein Wissen. Automatisiert vermarktet.",
];

const BUILD_STEPS = [
  { label: "Analyzing market gap", delay: 0 },
  { label: "Generating course outline", delay: 0.6 },
  { label: "Writing sales copy", delay: 1.2 },
  { label: "Creating checkout flow", delay: 1.8 },
  { label: "Product ready", delay: 2.4, done: true },
];

function Typewriter({ phrases }: { phrases: string[] }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const current = phrases[phraseIndex];

    if (!deleting && displayed.length < current.length) {
      timeoutRef.current = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 45);
    } else if (!deleting && displayed.length === current.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeoutRef.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 22);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % phrases.length);
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [displayed, deleting, phraseIndex, phrases]);

  return (
    <span>
      {displayed}
      <span className="inline-block w-0.5 h-[1.1em] bg-gold-300 align-middle ml-1 animate-pulse" />
    </span>
  );
}

function BuildTerminal() {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    BUILD_STEPS.forEach((step, i) => {
      timers.push(setTimeout(() => {
        setVisibleSteps(i + 1);
        if (step.done) setTimeout(() => setDone(true), 400);
      }, step.delay * 1000 + 1200));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="relative rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-5 font-mono text-sm shadow-2xl"
      style={{ boxShadow: "0 0 40px rgba(214,168,79,0.08)" }}
    >
      <div className="flex items-center gap-1.5 mb-4">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-white/30 text-xs">ai-product-builder</span>
      </div>

      <div className="space-y-2">
        {BUILD_STEPS.slice(0, visibleSteps).map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            {step.done && done ? (
              <span className="text-[#28c840]">✓</span>
            ) : (
              <span className="text-gold-300">›</span>
            )}
            <span className={step.done && done ? "text-[#28c840]" : "text-white/70"}>
              {step.label}
              {i === visibleSteps - 1 && !done && (
                <span className="ml-1 inline-block w-1.5 h-[1em] bg-gold-300/70 align-middle animate-pulse" />
              )}
            </span>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <p className="text-gold-300 font-semibold">🚀 &quot;KI Content Kurs&quot; — live & ready to sell</p>
            <p className="text-white/40 text-xs mt-1">Erstellt in 4.1s · Verkaufsseite · Checkout · Automation</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function HeroSection() {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (eyebrowRef.current) {
      animate(eyebrowRef.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 600,
        delay: 150,
        ease: "outExpo",
      });
    }
    if (subRef.current) {
      animate(subRef.current, {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 700,
        delay: 550,
        ease: "outExpo",
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-obsidian">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gold-300/5 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gold-300/3 blur-[100px]" />
      </div>

      {/* 3D background canvas */}
      <div className="pointer-events-none absolute inset-0">
        <ProductCanvas />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <p ref={eyebrowRef} className="eyebrow mb-4" style={{ opacity: 0 }}>
              AI Goldmining
            </p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="font-heading text-5xl lg:text-6xl xl:text-7xl leading-[1.05] mb-6 text-white"
            >
              <Typewriter phrases={TYPEWRITER_PHRASES} />
            </motion.h1>

            <p ref={subRef} className="text-lg text-white/60 mb-10 max-w-lg leading-relaxed" style={{ opacity: 0 }}>
              Lerne mit AI in kürzester Zeit digitale Produkte zu erstellen — Kurse, Templates, Guides — und verkaufe sie vollautomatisch.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/webinar"
                className="inline-flex items-center gap-2 rounded-full bg-gold-300 px-7 py-3.5 text-sm font-semibold text-obsidian transition-all hover:bg-gold-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(214,168,79,0.4)]"
              >
                Gratis Webinar →
              </Link>
              <Link
                href="/kurse"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/40 hover:text-white hover:bg-white/5"
              >
                Kurse entdecken
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex items-center gap-6 mt-10 text-sm text-white/40"
            >
              <span>✓ Keine Vorkenntnisse nötig</span>
              <span>✓ Sofort umsetzbar</span>
              <span>✓ Lifetime Zugang</span>
            </motion.div>
          </div>

          {/* Right: Terminal */}
          <div className="hidden lg:block">
            <BuildTerminal />
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/20 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
        />
      </motion.div>
    </section>
  );
}
