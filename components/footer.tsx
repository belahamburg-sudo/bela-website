import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { navItems } from "@/lib/content";

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
    <footer className="relative mt-0 border-t border-gold-300/10 bg-obsidian">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/50 to-transparent" />

      <div className="container-shell py-20">
        {/* Main grid */}
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-5">
              <Link href="/">
                <Image
                  src="/assets/logo-ai-goldmining-tight.png"
                  alt="AI Goldmining"
                  width={340}
                  height={64}
                  className="h-auto w-[160px]"
                />
              </Link>
              <p className="mt-3 font-heading tracking-gta text-sm text-cream/50 uppercase">Bela Goldmann</p>
            </div>
            <p className="max-w-sm text-sm leading-7 text-cream/40">
              Digitale Produkte mit AI bauen, verpacken und automatisiert verkaufen. Kein Guru-Playbook. Eine Methode mit realistischem Zielrahmen.
            </p>
            <p className="mt-6 gta-label opacity-60">Based in Germany</p>
          </div>

          <FooterColumn title="Produkt" items={navItems} />
          <FooterColumn title="Rechtliches" items={legal} />
          <FooterColumn title="Social" items={socials} external />
        </div>

        <div className="divider-gold mt-16" />

        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs text-cream/25 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Bela Goldmann · AI Goldmining. Alle Rechte vorbehalten.</p>
          <p className="gta-label opacity-50">Gebaut für Umsetzer — nicht für Zuschauer.</p>
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
