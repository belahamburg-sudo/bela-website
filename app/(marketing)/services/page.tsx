import type { Metadata } from "next";
import { ArrowRight, MessageCircle, Building2, Briefcase, Check, Users } from "lucide-react";
import { belaPrivateTelegram } from "@/lib/env";

export const metadata: Metadata = {
  title: "Services | 1:1 Coaching & Auslandsfirmen-Setup · AI Goldmining",
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

const GROUP_POINTS = [
  "Wöchentliche Gruppen-Calls mit Bela und der Community",
  "Feedback auf deine Produkte, Funnels und Verkaufstexte",
  "Austausch mit anderen Umsetzern in meiner Telegram-Gruppe",
];

/** Gold Dubai-skyline silhouette — layered SVG, no external asset needed. */
function DubaiSkyline() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0" aria-hidden>
      <svg
        viewBox="0 0 1440 300"
        preserveAspectRatio="xMidYMax slice"
        className="h-[44vh] max-h-[480px] w-full"
      >
        <defs>
          <linearGradient id="skyBack" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#5c4a2a" stopOpacity="0.34" />
            <stop offset="60%" stopColor="#7a6536" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#c9a961" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="skyMid" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6a5530" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#8a7340" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#c9a961" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="skyFront" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#3a2f1a" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#5c4a2a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8a7340" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="spire" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#c9a961" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff4c9" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* ── Back layer: distant, hazy towers ── */}
        <g fill="url(#skyBack)">
          <path d="M30 210 h54 v90 h-54 z" />
          <path d="M96 175 h38 l4 -14 l4 14 h6 v139 h-52 z" />
          <path d="M150 196 h64 v104 h-64 z" />
          <path d="M232 150 h36 v150 h-36 z" />
          <path d="M286 188 h72 v112 h-72 z" />
          <path d="M372 168 l40 -10 v142 h-40 z" />
          <path d="M1010 165 h48 v135 h-48 z" />
          <path d="M1072 192 h74 v108 h-74 z" />
          <path d="M1158 150 h38 l3 -12 l3 12 h2 v150 h-46 z" />
          <path d="M1216 182 h64 v118 h-64 z" />
          <path d="M1296 160 h44 v140 h-44 z" />
          <path d="M1352 190 h62 v110 h-62 z" />
        </g>

        {/* ── Mid layer ── */}
        <g fill="url(#skyMid)">
          {/* stepped tower */}
          <path d="M120 200 h44 v-30 h26 v-26 h18 v152 h-88 z" />
          <path d="M430 158 h40 v142 h-40 z" />
          <path d="M484 192 h56 v108 h-56 z" />
          <path d="M556 172 l34 -8 v136 h-34 z" />
          {/* twin antenna tower */}
          <path d="M600 150 h30 v150 h-30 z M612 150 v-24 M618 150 v-30" stroke="#c9a961" strokeOpacity="0.4" strokeWidth="2" />
          <path d="M812 168 h44 v132 h-44 z" />
          <path d="M868 138 h54 l0 162 h-54 z" />
          <path d="M928 178 h40 v122 h-40 z" />
        </g>

        {/* ── Burj-Khalifa-style central spire with stepped setbacks ── */}
        <g fill="url(#spire)">
          {/* outer wings step inward toward the top */}
          <path d="M672 196 h22 v104 h-22 z" />
          <path d="M746 196 h22 v104 h-22 z" />
          <path d="M686 150 h20 v150 h-20 z" />
          <path d="M734 150 h20 v150 h-20 z" />
          <path d="M702 96 h36 v204 h-36 z" />
          {/* tapering core + needle */}
          <path d="M712 40 l8 -40 l8 40 l6 260 h-28 z" />
          <line x1="720" y1="0" x2="720" y2="-22" stroke="#fff4c9" strokeOpacity="0.45" strokeWidth="2" />
        </g>

        {/* ── Front layer: closest, darkest blocks ── */}
        <g fill="url(#skyFront)">
          <path d="M0 232 h70 v68 h-70 z" />
          <path d="M340 214 h58 v86 h-58 z" />
          <path d="M520 226 h70 v74 h-70 z" />
          <path d="M980 220 h64 v80 h-64 z" />
          <path d="M1140 232 h80 v68 h-80 z" />
          <path d="M1380 216 h60 v84 h-60 z" />
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
  ctaHref,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  title: string;
  copy: string;
  points: string[];
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gold-300/20 bg-gradient-to-b from-white/[0.04] to-obsidian/70 p-7 lg:p-9">
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(201,169,97,0.06), transparent 55%)" }} aria-hidden />
      <div className="relative flex flex-1 flex-col">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/[0.06]">
            <Icon className="h-5 w-5 text-gold-300" />
          </span>
          <span className="gta-label text-gold-300/70">{tag}</span>
        </div>

        <h2 className="font-heading tracking-gta text-3xl lg:text-4xl text-cream leading-[1.02]">{title}</h2>
        {/* min-height keeps the checkmark lists aligned across cards of varying copy length */}
        <p className="mt-4 leading-relaxed text-cream/55 sm:min-h-[5.5rem]">{copy}</p>

        <ul className="mt-6 grid gap-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-cream/70">
              <Check className="mt-0.5 h-4 w-4 flex-none text-gold-300" />
              {p}
            </li>
          ))}
        </ul>

        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-shimmer group mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:brightness-110"
          style={{ marginTop: "auto" }}
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
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            <ServiceCard
              icon={MessageCircle}
              tag="Persönlich"
              title="1:1 Coaching"
              copy="Direktes Mentoring mit Bela: wir gehen deine Idee, dein Produkt und deinen Funnel Schritt für Schritt durch, bis es läuft."
              points={COACHING_POINTS}
              ctaLabel="1:1 Coaching anfragen"
              ctaHref={belaPrivateTelegram}
            />
            <ServiceCard
              icon={Users}
              tag="Gruppe"
              title="Gruppencoaching"
              copy="Gemeinsam umsetzen statt allein: Gruppen-Calls, Feedback und Austausch direkt in meiner Telegram-Gruppe."
              points={GROUP_POINTS}
              ctaLabel="Coaching anfragen"
              ctaHref={belaPrivateTelegram}
            />
            <ServiceCard
              icon={Building2}
              tag="Struktur"
              title="Auslandsfirmen-Setup"
              copy="Firmengründung im Ausland (z.B. Dubai / VAE): Struktur, Konten und Steuern sauber aufgesetzt, vollständig begleitet."
              points={COMPANY_POINTS}
              ctaLabel="Setup anfragen"
              ctaHref={belaPrivateTelegram}
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
