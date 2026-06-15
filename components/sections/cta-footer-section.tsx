"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";
import { navItems } from "@/lib/content";
import { telegramUrl, socialLinks } from "@/lib/env";
import { Meteors } from "@/components/ui/meteors";

const LEGAL = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
];

/**
 * Effective social-media links for the footer. A server parent can pass the
 * admin-managed values from `getEffectiveSocials()` (lib/settings) so editing
 * them in /admin/einstellungen updates the footer. When omitted, we fall back
 * to the hardcoded brand defaults in lib/env so the footer still renders if no
 * parent provides them (this is a client component and cannot fetch itself).
 */
type FooterSocials = {
  telegram: string;
  instagram: string;
  tiktok: string;
  youtube: string;
};

export function CtaFooterSection({
  socials = socialLinks,
}: {
  socials?: FooterSocials;
}) {
  const SOCIALS = [
    { href: socials.telegram, label: "Telegram" },
    { href: socials.instagram, label: "Instagram" },
    { href: socials.tiktok, label: "TikTok" },
    { href: socials.youtube, label: "YouTube" },
  ];

  return (
    <footer className="relative">
      {/* ── Big CTA: cinematic banner style ── */}
      <div className="relative overflow-hidden border-t border-gold-300/15 bg-cones">
        {/* Two-cone gold-dust backdrop instead of a banner image */}
        <div className="absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 25% 10%, rgba(201,169,97,0.12), transparent 60%)," +
                "radial-gradient(ellipse 70% 60% at 80% 95%, rgba(138,115,64,0.10), transparent 70%)",
            }}
          />
          <div className="dust-overlay" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 45%, transparent 0%, rgba(8,6,4,0.55) 100%)" }} />
        </div>

        {/* gold meteor shower */}
        <Meteors number={16} angle={235} minDuration={3} maxDuration={9} />


        <div className="relative mx-auto max-w-3xl px-6 py-20 lg:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="eyebrow mb-6 mx-auto"><span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300 shadow-[0_0_6px_rgba(201, 169, 97,0.55)]" aria-hidden />Letzte Chance</p>
            <h2
              className="mx-auto max-w-3xl font-heading tracking-gta leading-none text-cream"
              style={{ fontSize: "clamp(2.5rem,6vw,5.5rem)", textShadow: "0 0 30px rgba(201, 169, 97,0.3)" }}
            >
              Hör auf zu warten.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base lg:text-lg leading-relaxed text-cream/60">
              Digitale Produkte einmal bauen, dauerhaft verkaufen. Fast reine Marge.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/webinar" size="lg">
                Webinar starten
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button href={telegramUrl} variant="outline" size="lg" target="_blank" rel="noopener noreferrer">
                Community beitreten
              </Button>
            </div>
          </motion.div>

          {/* Newsletter panel — single, intentional */}
          <motion.div
            id="newsletter"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto mt-14 max-w-md overflow-hidden rounded-md border border-gold-300/25 bg-gradient-to-b from-white/[0.04] to-obsidian/80 backdrop-blur-md p-7 lg:p-8 text-left shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]"
          >
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(201, 169, 97,0.07), transparent 55%)" }} aria-hidden />
            <div className="relative">
              <p className="eyebrow mb-4"><span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300 shadow-[0_0_6px_rgba(201, 169, 97,0.55)]" aria-hidden />Newsletter</p>
              <p className="font-heading tracking-gta text-cream text-xl mb-1.5">Noch nicht bereit?</p>
              <p className="text-cream/50 text-sm mb-6 leading-relaxed">Hol dir den Newsletter und bleib beim Goldrausch dabei. Kein Spam, jederzeit kündbar.</p>
              <LeadForm source="newsletter" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Footer links ── */}
      <div className="bg-obsidian border-t border-gold-300/10">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-14">
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="mb-5">
                <Link href="/">
                  <Image
                    src="/assets/logo-ai-goldmining-3d.png"
                    alt="AI Goldmining"
                    width={1200}
                    height={204}
                    className="h-auto w-[210px]"
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

          <div className="divider-gold mt-10" />

          <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-cream/25 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} Bela Goldmann · AI Goldmining. Alle Rechte vorbehalten.</p>
            <p className="gta-label opacity-50">
              Gebaut für Umsetzer: nicht für Zuschauer.
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
