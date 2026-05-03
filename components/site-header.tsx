"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { telegramUrl } from "@/lib/env";
import { navItems } from "@/lib/content";
import { Button } from "@/components/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-gold-300/10 bg-obsidian/96 backdrop-blur-2xl"
            : "border-b border-gold-300/[0.06] bg-obsidian/82 backdrop-blur-xl"
        )}
      >
        <div className="container-shell py-3 lg:py-4">
          <div className="rounded-[1.25rem] border border-gold-300/10 bg-[#0f0c09]/90 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl lg:px-5 lg:py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <Link href="/" className="focus-ring group flex items-center px-1 py-0 transition-opacity hover:opacity-90" onClick={() => setOpen(false)}>
                <Image
                  src="/assets/logo-ai-goldmining-tight.png"
                  alt="AI Goldmining"
                  width={340}
                  height={64}
                  className="w-auto relative z-10"
                  style={{
                    height: "28px",
                  }}
                  priority
                />
              </Link>

              {/* Desktop nav */}
              <nav
                aria-label="Hauptnavigation"
                className="hidden items-center gap-1 rounded-full border border-gold-300/10 bg-white/[0.03] px-2 py-1 lg:flex"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="focus-ring group relative rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-cream/55 transition-colors hover:text-cream hover:bg-gold-300/[0.06]"
                  >
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Desktop CTA */}
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring flex items-center gap-2 rounded-full border border-gold-300/15 bg-white/[0.02] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-cream/60 transition-all hover:border-gold-300/40 hover:text-cream hover:bg-gold-300/5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-300 shadow-[0_0_8px_rgba(240,180,41,0.5)]" />
                  Free Telegram
                </Link>
                <Button href="/webinar" size="sm" className="rounded-full px-5">
                  Webinar
                </Button>
              </div>

              {/* Mobile menu toggle */}
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-300/10 bg-white/[0.02] text-cream/60 transition-colors hover:bg-white/[0.05] hover:text-cream lg:hidden"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-label={open ? "Menü schließen" : "Menü öffnen"}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="fixed inset-0 z-[40] flex flex-col bg-obsidian/98 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex flex-1 flex-col justify-center px-8">
              <nav className="flex flex-col gap-6">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="font-heading text-4xl tracking-gta text-cream transition-colors hover:text-gold-300"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-16 flex flex-col gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 rounded-sm border border-gold-300/20 bg-white/[0.02] py-4 text-xs font-bold uppercase tracking-[0.2em] text-cream/80"
                    onClick={() => setOpen(false)}
                  >
                    Free Telegram Community
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button href="/webinar" size="lg" className="w-full" onClick={() => setOpen(false)}>
                    Gratis Webinar sichern
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
