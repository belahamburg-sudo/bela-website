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
          : "border-b border-gold-300/[0.06] bg-obsidian/80 backdrop-blur-xl"
      )}
    >
      <div className="container-shell flex min-h-[68px] items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="focus-ring group -ml-1 flex items-stretch rounded-sm px-1 py-0">
          <span className="relative flex items-center rounded-sm border border-gold-300/10 bg-[#151008] px-3 py-2">
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
        <nav aria-label="Hauptnavigation" className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring group relative rounded-sm px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-cream/50 transition-colors hover:text-cream"
            >
              <span className="relative z-10">{item.label}</span>
              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gold-300 scale-x-0 transition-transform duration-200 group-hover:scale-x-100 origin-left" />
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-sm px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-cream/45 transition-colors hover:text-cream"
          >
            Telegram
          </Link>
          <Link
            href="/login"
            className="focus-ring rounded-sm px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-cream/45 transition-colors hover:text-cream"
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
          className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-gold-300/25 bg-panel/80 text-cream backdrop-blur-md lg:hidden"
          onClick={() => setOpen((c) => !c)}
        >
          {open ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-x-0 top-[68px] bottom-0 z-40 overflow-y-auto border-t border-gold-300/10 bg-obsidian/97 backdrop-blur-2xl lg:hidden">
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
