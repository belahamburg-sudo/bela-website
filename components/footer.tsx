import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { navItems } from "@/lib/content";
import { LeadForm } from "@/components/lead-form";

export function Footer() {
  const legal = [
    { href: "/impressum", label: "Impressum" },
    { href: "/datenschutz", label: "Datenschutz" },
    { href: "/agb", label: "AGB" },
    { href: "/income-disclaimer", label: "Income Disclaimer" }
  ];

  const socials = [
    { href: "https://instagram.com", label: "Instagram" },
    { href: "https://tiktok.com", label: "TikTok" },
    { href: "https://youtube.com", label: "YouTube" },
    { href: "https://x.com", label: "X / Twitter" }
  ];

  return (
    <footer className="relative mt-24 border-t border-gold-500/10 bg-obsidian/90">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="container-shell py-20">
        {/* Big CTA strip */}
        <div className="panel-surface-glow relative mb-16 overflow-hidden rounded-[2rem] p-10 sm:p-14">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-300/20 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-gold-700/30 blur-3xl"
          />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow mb-5">Newsletter</p>
              <h2 className="font-heading text-display-md font-bold text-balance text-cream">
                Ein Impuls pro Woche.{" "}
                <span className="gold-text">Null Fluff.</span>
              </h2>
              <p className="mt-5 max-w-xl text-pretty leading-[1.75] text-muted">
                Konkrete Produktideen, AI-Prompts, Launch-Breakdowns und
                Verkaufspsychologie. Kein Hype, keine Garantien, kein Spam.
              </p>
            </div>
            <div className="rounded-2xl border border-gold-500/15 bg-obsidian/60 p-6 backdrop-blur-xl">
              <LeadForm source="newsletter" />
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center">
                <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-200 to-gold-700" />
                <span className="absolute inset-[1px] rounded-[11px] bg-obsidian" />
                <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-gold-300" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 20 L12 4 L20 20 Z" />
                  <path d="M8 14 L16 14" opacity="0.6" />
                </svg>
              </span>
              <div>
                <p className="font-heading text-lg font-bold text-cream">Bela Goldmann</p>
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
            <p className="mt-6 text-[0.7rem] uppercase tracking-[0.22em] text-muted">
              Based in Germany
            </p>
          </div>

          <FooterColumn title="Produkt" items={navItems} />
          <FooterColumn title="Rechtliches" items={legal} />
          <FooterColumn title="Social" items={socials} external />
        </div>

        <div className="divider-gold mt-16" />

        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Bela Goldmann · AI Goldmining. Alle Rechte vorbehalten.</p>
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
