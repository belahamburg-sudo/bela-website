"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * "Die Lösung" banner — sits between the Mini-Kurse (ProductsSection) and the
 * Trustpilot trust block. Mirrors the brief mockup: tight gold-accented headline
 * on a warm two-cone backdrop with a single Webinar CTA.
 */
export function SolutionBannerSection() {
  return (
    <section className="relative overflow-hidden bg-cones py-16 lg:py-24 scratch-border">
      {/* Two-cone gold-dust backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 20% 12%, rgba(201,169,97,0.12), transparent 60%)," +
            "radial-gradient(ellipse 70% 60% at 85% 95%, rgba(138,115,64,0.10), transparent 70%)",
        }}
      />
      <div className="dust-overlay" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="panel-surface relative overflow-hidden rounded-2xl border border-white/10 p-8 sm:p-10 lg:p-12"
        >
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(201,169,97,0.07), transparent 55%)" }} aria-hidden />

          <div className="relative flex flex-col items-start gap-8">
            <div>
              <p className="eyebrow mb-5">
                <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300 shadow-[0_0_6px_rgba(201,169,97,0.55)]" aria-hidden />
                Die Lösung
              </p>
              <h2 className="max-w-3xl font-heading text-3xl leading-[1.05] tracking-gta text-cream sm:text-4xl lg:text-5xl">
                Digitale Produkte: einmal bauen,{" "}
                <span className="gold-text italic">dauerhaft verkaufen.</span> Fast reine Marge.
                Mit AI in Tagen.
              </h2>
            </div>

            <a
              href="/webinar"
              className="btn-shimmer group inline-flex shrink-0 items-center gap-2 rounded-full bg-gold-gradient px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:brightness-110"
            >
              <span className="relative z-[2] inline-flex items-center gap-2">
                Webinar starten
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
