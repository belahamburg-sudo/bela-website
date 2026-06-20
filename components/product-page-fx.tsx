"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Scroll-reveal wrapper for the product page. Fades + slides a block in the
 * first time it scrolls into view, so the long sales page feels alive without
 * turning the whole page into a client component.
 */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Big header cover image. Animates in, lifts/zooms slightly on hover, and sits
 * behind a soft gold glow — the visual anchor of the product page.
 */
export function HeroCover({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="group relative mx-auto w-full max-w-5xl"
    >
      {/* glow */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.4rem] bg-gold-300/10 blur-[90px] transition-opacity duration-700 group-hover:bg-gold-300/20" />
      <div className="relative overflow-hidden rounded-[1.8rem] border border-gold-500/25 shadow-gold">
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={900}
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="h-auto w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/35 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
}
