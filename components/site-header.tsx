"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/content";
import { cn } from "@/lib/utils";
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-gold-500/10 bg-obsidian/80 backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container-shell flex min-h-[72px] items-center justify-between gap-4">
        <Link href="/" className="focus-ring group -ml-1 flex items-center gap-3 rounded-2xl px-1 py-1">
          <LogoMark />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-[0.95rem] font-bold tracking-[-0.01em] text-cream">
              Bela Goldmann
            </span>
            <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold-300">
              AI Goldmining
            </span>
          </span>
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring group relative rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-cream"
            >
              <span className="relative z-10">{item.label}</span>
              <span className="absolute inset-0 rounded-full bg-gold-500/[0.06] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="focus-ring rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-cream"
          >
            Login
          </Link>
          <Button href="/webinar" size="sm">
            Gratis Webinar
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-gold-500/20 bg-panel/80 text-cream backdrop-blur-md lg:hidden"
          onClick={() => setOpen((c) => !c)}
        >
          {open ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto border-t border-gold-500/10 bg-obsidian/95 backdrop-blur-2xl lg:hidden">
          <nav
            className="container-shell flex flex-col gap-1 py-6"
            aria-label="Mobile Navigation"
          >
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring group flex items-center justify-between rounded-2xl border border-transparent px-5 py-4 text-lg font-medium text-cream transition-colors hover:border-gold-500/20 hover:bg-gold-500/[0.04]"
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span>{item.label}</span>
                <span className="text-gold-300 opacity-0 transition-opacity group-hover:opacity-100">
                  →
                </span>
              </Link>
            ))}
            <div className="mt-6 grid gap-3">
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

function LogoMark() {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center">
      <span className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-gold-200 via-gold-400 to-gold-700 opacity-90" />
      <span className="absolute inset-[1px] rounded-[9px] bg-obsidian" />
      <svg
        viewBox="0 0 24 24"
        className="relative h-5 w-5 text-gold-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 20 L12 4 L20 20 Z" />
        <path d="M8 14 L16 14" opacity="0.6" />
      </svg>
    </span>
  );
}
