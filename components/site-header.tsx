"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/content";
import { cn } from "@/lib/utils";
import { telegramUrl } from "@/lib/env";
import { Button } from "./button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
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
            <Link href="/" className="focus-ring group flex items-center rounded-full px-1 py-0">
              <span className="relative flex items-center rounded-full border border-gold-300/10 bg-[#151008] px-3.5 py-2">
                <Image
                  src="/assets/logo-ai-goldmining-tight.png"
                  alt="AI Goldmining"
                  width={340}
                  height={64}
                  className="w-auto relative z-10"
                  style={{
                    height: "28px",
                    filter: "brightness(1.08) contrast(1.08)",
                  }}
                  priority
                />
              </span>
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
                className="focus-ring rounded-full border border-gold-300/12 bg-white/[0.02] px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-cream/55 transition-colors hover:border-gold-300/25 hover:text-cream"
              >
                Telegram
              </Link>
              <Link
                href="/login"
                className="focus-ring rounded-full border border-gold-300/12 bg-white/[0.02] px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-cream/55 transition-colors hover:border-gold-300/25 hover:text-cream"
              >
                Login
              </Link>
              <Button href="/webinar" size="sm">
                Gratis Webinar
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={open}
              className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-gold-300/25 bg-panel/80 text-cream backdrop-blur-md lg:hidden"
              onClick={() => setOpen((c) => !c)}
            >
              {open ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-x-0 top-[92px] bottom-0 z-40 overflow-y-auto border-t border-gold-300/10 bg-obsidian/97 backdrop-blur-2xl lg:hidden">
          <nav
            className="container-shell flex flex-col gap-1 py-6"
            aria-label="Mobile Navigation"
          >
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring group flex items-center justify-between rounded-sm border border-transparent px-5 py-4 font-heading font-extrabold uppercase tracking-gta text-2xl text-cream transition-colors hover:border-gold-300/20 hover:bg-gold-300/[0.04]"
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span>{item.label}</span>
                <span className="text-gold-300 opacity-0 transition-opacity group-hover:opacity-100 text-base">
                  →
                </span>
              </Link>
            ))}
            <div className="mt-6 grid gap-3">
              <Button
                href={telegramUrl}
                variant="outline"
                className="w-full"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                Free Telegram
              </Button>
              <Button
                href="/login"
                variant="secondary"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Login
              </Button>
              <Button href="/webinar" className="w-full" onClick={() => setOpen(false)}>
                Gratis Webinar sichern
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
