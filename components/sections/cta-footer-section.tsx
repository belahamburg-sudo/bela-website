"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";
import { navItems } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

const LEGAL = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/income-disclaimer", label: "Income Disclaimer" }
];

const SOCIALS = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://tiktok.com", label: "TikTok" },
  { href: "https://youtube.com", label: "YouTube" },
  { href: "https://x.com", label: "X / Twitter" }
];

export function CtaFooterSection() {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const heading = cta.querySelector<HTMLElement>("[data-cta-heading]");
    const form = cta.querySelector<HTMLElement>("[data-cta-form]");

    if (heading) {
      gsap.fromTo(
        heading,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    }

    if (form) {
      gsap.fromTo(
        form,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: form,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === heading || st.trigger === form) st.kill();
      });
    };
  }, []);

  return (
    <footer className="relative">
      <div ref={ctaRef} className="relative overflow-hidden pb-20 pt-28 sm:pt-36">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(214,168,79,0.15), transparent 70%)"
          }}
        />

        <div className="container-shell relative text-center">
          <div data-cta-heading className="opacity-0">
            <h2 className="mx-auto max-w-3xl font-heading text-display-lg text-cream">
              Hör auf zu warten.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-[1.75] text-muted">
              Gratis-Webinar, Telegram oder Newsletter — such dir einen Einstieg aus.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/webinar" size="lg">
                Gratis Webinar ansehen
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button href="/kurse" variant="outline" size="lg">
                Kurse entdecken
              </Button>
            </div>
          </div>

          <div
            data-cta-form
            className="mx-auto mt-16 max-w-lg rounded-2xl border border-gold-500/15 bg-obsidian/60 p-6 opacity-0 backdrop-blur-xl"
          >
            <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold-300">
              Newsletter
            </p>
            <LeadForm source="newsletter" compact />
          </div>
        </div>
      </div>

      <div className="container-shell">
        <div className="divider-gold" />
      </div>

      <div className="container-shell py-16">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center">
                <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-200 to-gold-700" />
                <span className="absolute inset-[1px] rounded-[11px] bg-obsidian" />
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
              <div>
                <p className="font-heading text-lg text-cream">Bela Goldmann</p>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-300">
                  AI Goldmining
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
              Digitale Produkte mit AI bauen, verpacken und automatisiert
              verkaufen. Kein Guru-Playbook. Eine Methode mit realistischem
              Zielrahmen.
            </p>
          </div>

          <FooterColumn title="Produkt" items={navItems} />
          <FooterColumn title="Rechtliches" items={LEGAL} />
          <FooterColumn title="Social" items={SOCIALS} external />
        </div>

        <div className="divider-gold mt-14" />

        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs text-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Bela Goldmann · AI Goldmining. Alle
            Rechte vorbehalten.
          </p>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-gold-500/70">
            Gebaut für Umsetzer — nicht für Zuschauer.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
  external
}: {
  title: string;
  items: { href: string; label: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <p className="mb-5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-300">
        {title}
      </p>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-cream"
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
