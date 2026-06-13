import type { Metadata } from "next";
import { ArrowRight, MessageCircle, Building2, Briefcase, Check } from "lucide-react";
import { belaPrivateTelegram } from "@/lib/env";

export const metadata: Metadata = {
  title: "Services | 1:1 Coaching & Auslandsfirmen-Setup — AI Goldmining",
  description:
    "Persönliches 1:1-Coaching direkt mit Bela und Auslandsfirmen-Setup. Direkter Draht, kein Gruppenchat.",
};

const COACHING_POINTS = [
  "Persönliches Mentoring direkt mit Bela, kein Gruppenchat",
  "Dein Produkt, dein Funnel, dein Verkaufsprozess im Detail",
  "Konkrete Schritte statt Theorie, auf deine Situation zugeschnitten",
];

const COMPANY_POINTS = [
  "Firmengründung im Ausland (z.B. VAE / Dubai)",
  "Struktur, Konten und Steuern sauber aufgesetzt",
  "Begleitung von der Idee bis zur fertigen Gesellschaft",
];

/** Gold Dubai-skyline silhouette — drawn as SVG, no external asset needed. */
function DubaiSkyline() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0" aria-hidden>
      <svg
        viewBox="0 0 1440 280"
        preserveAspectRatio="xMidYMax slice"
        className="h-[42vh] max-h-[460px] w-full"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6a5530" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#8a7340" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#c9a961" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="spire" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#c9a961" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff4c9" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        {/* back layer towers */}
        <g fill="url(#sky)">
          <rect x="40" y="170" width="60" height="110" />
          <rect x="120" y="140" width="44" height="140" />
          <rect x="185" y="190" width="70" height="90" />
          <rect x="280" y="120" width="40" height="160" />
          <rect x="340" y="165" width="80" height="115" />
          <rect x="980" y="150" width="54" height="130" />
          <rect x="1050" y="185" width="80" height="95" />
          <rect x="1150" y="135" width="42" height="145" />
          <rect x="1210" y="175" width="70" height="105" />
          <rect x="1300" y="150" width="48" height="130" />
          <rect x="1360" y="185" width="60" height="95" />
        </g>
        {/* Burj-Khalifa-style central spire */}
        <g fill="url(#spire)">
          <path d="M720 20 L731 70 L741 280 L699 280 L709 70 Z" />
          <rect x="690" y="120" width="20" height="160" />
          <rect x="730" y="120" width="20" height="160" />
          <rect x="668" y="160" width="16" height="120" />
          <rect x="756" y="160" width="16" height="120" />
          <line x1="720" y1="0" x2="720" y2="30" stroke="#fff4c9" strokeOpacity="0.35" strokeWidth="2" />
        </g>
        {/* mid towers */}
        <g fill="url(#sky)">
          <rect x="470" y="150" width="50" height="130" />
          <rect x="540" y="185" width="70" height="95" />
          <rect x="620" y="165" width="46" height="115" />
          <rect x="800" y="165" width="46" height="115" />
          <rect x="860" y="140" width="60" height="140" />
        </g>
      </svg>
    </div>
  );
}

function ServiceCard({
  icon: Icon,
  tag,
  title,
  copy,
  points,
  ctaLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  title: string;
  copy: string;
  points: string[];
  ctaLabel: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-md border border-gold-300/20 bg-gradient-to-b from-white/[0.04] to-obsidian/70 p-7 lg:p-9">
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(201,169,97,0.06), transparent 55%)" }} aria-hidden />
      <div className="relative">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/[0.06]">
            <Icon className="h-5 w-5 text-gold-300" />
          </span>
          <span className="gta-label text-gold-300/70">{tag}</span>
        </div>

        <h2 className="font-heading tracking-gta text-3xl lg:text-4xl text-cream leading-[1.02]">{title}</h2>
        <p className="mt-4 max-w-md leading-relaxed text-cream/55">{copy}</p>

        <ul className="mt-6 grid gap-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-cream/70">
              <Check className="mt-0.5 h-4 w-4 flex-none text-gold-300" />
              {p}
            </li>
          ))}
        </ul>

        <a
          href={belaPrivateTelegram}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-shimmer group mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:brightness-110"
        >
          <span className="relative z-[2] inline-flex items-center gap-2">
            {ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </a>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="relative overflow-hidden bg-cones">
      <div className="dust-overlay" aria-hidden />

      {/* ── Hero with Dubai skyline ── */}
      <section className="relative overflow-hidden pt-28 pb-24 sm:pt-32 lg:pt-36">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 25% 10%, rgba(201,169,97,0.12), transparent 60%)," +
              "radial-gradient(ellipse 70% 60% at 85% 30%, rgba(138,115,64,0.10), transparent 70%)",
          }}
        />
        <DubaiSkyline />

        <div className="relative z-10 container-shell mx-auto max-w-4xl text-center">
          <p className="eyebrow mb-6 mx-auto">
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-300 shadow-[0_0_6px_rgba(201,169,97,0.55)]" aria-hidden />
            Services
          </p>
          <h1 className="font-heading tracking-gta leading-[0.98] text-cream" style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}>
            1:1 mit Bela. Und der{" "}
            <span className="gold-accent">Weg ins Ausland.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-cream/55">
            Wenn du es ernst meinst: persönliches Coaching direkt mit Bela und ein sauberes
            Auslandsfirmen-Setup. Kein Gruppenchat, sondern direkter Draht.
          </p>
        </div>
      </section>

      {/* ── Service blocks ── */}
      <section className="relative z-10 pb-28">
        <div className="container-shell mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <ServiceCard
              icon={MessageCircle}
              tag="Persönlich"
              title="1:1 Coaching"
              copy="Direktes Mentoring mit Bela: wir gehen deine Idee, dein Produkt und deinen Funnel Schritt für Schritt durch, bis es läuft."
              points={COACHING_POINTS}
              ctaLabel="1:1 Coaching anfragen"
            />
            <ServiceCard
              icon={Building2}
              tag="Struktur"
              title="Auslandsfirmen-Setup"
              copy="Firmengründung im Ausland (z.B. Dubai / VAE): Struktur, Konten und Steuern sauber aufgesetzt, vollständig begleitet."
              points={COMPANY_POINTS}
              ctaLabel="Setup anfragen"
            />
          </div>

          {/* trust note */}
          <div className="mt-10 flex items-center justify-center gap-3 text-center">
            <Briefcase className="h-4 w-4 text-gold-300/60" />
            <p className="text-xs uppercase tracking-[0.18em] text-cream/40">
              Anfrage läuft direkt über Telegram an Bela persönlich
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
