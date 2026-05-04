"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";
import { navItems } from "@/lib/content";
import { telegramUrl } from "@/lib/env";

const LEGAL = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/agb#widerrufsrecht-fuer-digitale-inhalte", label: "Widerrufsrecht" },
  { href: "/income-disclaimer", label: "Income Disclaimer" },
];

const SOCIALS = [
  { href: telegramUrl, label: "Telegram" },
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://tiktok.com", label: "TikTok" },
  { href: "https://youtube.com", label: "YouTube" },
  { href: "https://x.com", label: "X / Twitter" },
];

export function CtaFooterSection() {
  return (
    <footer className="relative">
      {/* ── Big CTA — cinematic banner style ── */}
      <div className="relative overflow-hidden">
        {/* AI Goldmining banner image */}
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/assets/ai-goldmining-banner.jpeg"
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-obsidian/50 to-obsidian" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/40 to-obsidian/70" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-40 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="eyebrow mb-6 justify-center">Letzte Chance</p>
            <h2
              className="mx-auto max-w-4xl font-heading tracking-gta leading-none text-cream"
              style={{ fontSize: "clamp(2.8rem,6vw,6.5rem)", textShadow: "0 0 30px rgba(212,175,55,0.3)" }}
            >
              Hör auf zu warten.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gold-300/70">
              Digitale Produkte einmal bauen — dauerhaft verkaufen. Fast reine Marge.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/webinar" size="lg">
                Webinar starten
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button href={telegramUrl} variant="outline" size="lg" target="_blank" rel="noopener noreferrer">
                Community beitreten
              </Button>
              <Button href="#newsletter" variant="outline" size="lg">
                Newsletter sichern
              </Button>
            </div>
          </motion.div>

          <motion.div
            id="newsletter"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-16 max-w-lg"
          >
            <p className="gta-label mb-4 text-center">Newsletter</p>
            <LeadForm source="newsletter" compact />
          </motion.div>
        </div>
      </div>

      {/* ── Footer links ── */}
      <div className="bg-obsidian border-t border-gold-300/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="divider-gold" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="mb-5">
                <Link href="/">
                  <Image
                    src="/assets/logo-ai-goldmining-tight.png"
                    alt="AI Goldmining"
                    width={340}
                    height={64}
                    className="h-auto w-[200px]"
                  />
                </Link>
              </div>
              <p className="max-w-sm text-sm leading-7 text-cream/40">
                Digitale Produkte mit AI bauen, verpacken und automatisiert verkaufen. Kein Guru-Playbook. Eine Methode mit realistischem Zielrahmen.
              </p>
            </div>

            <FooterColumn title="Produkt" items={navItems} />
            <FooterColumn title="Rechtliches" items={LEGAL} />
            <FooterColumn title="Social" items={SOCIALS} external />
          </div>

          <div className="divider-gold mt-14" />

          <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs text-cream/25 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} Bela Goldmann · AI Goldmining. Alle Rechte vorbehalten.</p>
            <p className="gta-label opacity-50">
              Gebaut für Umsetzer — nicht für Zuschauer.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}


function FooterColumn({
  title,
  items,
  external,
}: {
  title: string;
  items: { href: string; label: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <p className="gta-label mb-5">{title}</p>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="group inline-flex items-center gap-1.5 text-sm text-cream/40 transition-colors hover:text-cream"
            >
              {item.label}
              {external ? (
                <ArrowUpRight
                  className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  aria-hidden
                />
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
