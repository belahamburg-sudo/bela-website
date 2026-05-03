"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { telegramUrl } from "@/lib/env";
import { navItems } from "@/lib/content";
import { Button } from "@/components/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem("auth_token") !== null;
    setIsLoggedIn(loggedIn);
  }, []);

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
            ? "border-b border-gold-300/8 bg-obsidian/95 backdrop-blur-md"
            : "border-b border-transparent bg-obsidian/60 backdrop-blur-sm"
        )}
      >
        <div className="container-shell">
          <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-6 lg:py-4">
            {/* Logo */}
            <Link href="/" className="focus-ring group flex items-center shrink-0 transition-opacity hover:opacity-90" onClick={() => setOpen(false)}>
              <Image
                src="/assets/logo-ai-goldmining-tight.png"
                alt="AI Goldmining"
                width={340}
                height={64}
                className="w-auto"
                style={{
                  height: "28px",
                }}
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav
              aria-label="Hauptnavigation"
              className="hidden items-center gap-6 lg:flex"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="focus-ring text-sm font-semibold uppercase tracking-[0.08em] text-cream/60 transition-colors hover:text-cream"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring text-xs font-bold uppercase tracking-[0.12em] text-cream/50 transition-colors hover:text-cream"
              >
                Community
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="focus-ring text-xs font-bold uppercase tracking-[0.12em] text-cream/50 transition-colors hover:text-cream"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("auth_token");
                      setIsLoggedIn(false);
                    }}
                    className="focus-ring flex items-center gap-1.5 rounded-full border border-gold-300/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-cream/60 transition-all hover:border-gold-300/60 hover:text-cream hover:bg-gold-300/5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Button
                    href="/login"
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1.5 rounded-full px-4"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Login
                  </Button>
                  <Button href="/webinar" size="sm" className="rounded-full px-5">
                    Webinar
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-300/15 bg-white/[0.03] text-cream/60 transition-colors hover:border-gold-300/30 hover:bg-white/[0.06] hover:text-cream lg:hidden"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
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
            className="fixed inset-0 z-[40] flex flex-col bg-obsidian/99 backdrop-blur-md lg:hidden"
            style={{ top: "72px" }}
          >
            <div className="flex flex-1 flex-col justify-start px-6 pt-6">
              <nav className="flex flex-col gap-4 border-b border-gold-300/10 pb-6">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                  >
                    <Link
                      href={item.href}
                      className="text-lg font-semibold uppercase tracking-[0.08em] text-cream transition-colors hover:text-gold-300"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-8 flex flex-col gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-full border border-gold-300/20 bg-white/[0.02] py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-cream/70 transition-all hover:border-gold-300/40 hover:text-cream hover:bg-gold-300/5"
                    onClick={() => setOpen(false)}
                  >
                    Community
                  </Link>
                </motion.div>
                {isLoggedIn ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link
                        href="/dashboard"
                        className="block rounded-full border border-gold-300/20 bg-white/[0.02] py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-cream/70 transition-all hover:border-gold-300/40 hover:text-cream hover:bg-gold-300/5"
                        onClick={() => setOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => {
                        localStorage.removeItem("auth_token");
                        setIsLoggedIn(false);
                        setOpen(false);
                      }}
                      className="rounded-full border border-gold-300/20 bg-white/[0.02] py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-cream/70 transition-all hover:border-gold-300/40 hover:text-cream hover:bg-gold-300/5"
                    >
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button href="/login" size="lg" variant="outline" className="w-full rounded-full" onClick={() => setOpen(false)}>
                        Login
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button href="/webinar" size="lg" className="w-full rounded-full" onClick={() => setOpen(false)}>
                        Gratis Webinar
                      </Button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
