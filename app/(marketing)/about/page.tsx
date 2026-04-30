import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { telegramUrl } from "@/lib/env";

const values = [
  "Online Business ja, unrealistische Versprechen nein.",
  "AI als Umsetzungsvorteil, nicht als magischer Geldautomat.",
  "Digitale Produkte vor komplizierten Geschäftsmodellen.",
  "Erstes Ziel: realistisch starten, dann sauber skalieren.",
];

const LIFESTYLE = [
  { src: "/assets/bela-golf-2.jpeg", label: "Golf" },
  { src: "/assets/bela-seoul.jpg", label: "Seoul" },
  { src: "/assets/bela-terrace.jpg", label: "Istanbul" },
  { src: "/assets/bela-party.jpg", label: "Hamburg" },
];

const CTAS = [
  { href: "/webinar", label: "Gratis Webinar", primary: true, external: false },
  { href: "/kurse", label: "Kurse ansehen", primary: false, external: false },
  { href: telegramUrl, label: "Telegram Community", primary: false, external: true },
  { href: "/#newsletter", label: "Newsletter", primary: false, external: false },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-obsidian overflow-hidden py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gold-300/[0.04] to-transparent" />
        <div className="mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          {/* Photo */}
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto lg:mx-0 overflow-hidden rounded-sm border border-gold-300/20">
            <Image
              src="/assets/bela-character.jpeg"
              alt="Bela Goldmann"
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute left-0 top-0 w-[3px] h-full bg-gradient-to-b from-gold-300 via-gold-400/60 to-transparent" />
          </div>

          {/* Text */}
          <div>
            <p className="eyebrow mb-5">Über Bela</p>
            <h1
              className="font-heading tracking-gta leading-none text-cream mb-6"
              style={{ fontSize: "clamp(2.8rem,5.5vw,5.5rem)" }}
            >
              ICH ZEIGE DIR,{" "}
              <span className="gold-text">WIE DU MIT AI</span>{" "}
              DIGITALE PRODUKTE BAUST.
            </h1>
            <p className="text-cream/50 text-lg leading-relaxed mb-8 max-w-lg">
              Kein Guru-Flex. Kein Lambo-Content. Ich habe angefangen, digitale Produkte
              mit AI zu bauen — nicht weil es einen Trend gab, sondern weil es das einzige
              Modell ist, das wirklich skaliert ohne deine Zeit zu fressen.
            </p>
            <div className="flex flex-wrap gap-3">
              {CTAS.map((cta) => (
                <Link
                  key={cta.href}
                  href={cta.href}
                  target={cta.external ? "_blank" : undefined}
                  rel={cta.external ? "noopener noreferrer" : undefined}
                  className={cta.primary
                    ? "btn-shimmer inline-flex items-center gap-2 rounded-sm bg-gold-300 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-obsidian hover:bg-gold-200 transition-all"
                    : "inline-flex items-center gap-2 rounded-sm border border-gold-300/40 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-cream/80 hover:border-gold-300/80 hover:text-cream transition-all"
                  }
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Story: With dad ── */}
      <section className="bg-obsidian py-20 lg:py-28 border-t border-gold-300/10">
        <div className="mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow mb-5">Wie es anfing</p>
            <h2
              className="font-heading tracking-gta leading-none text-cream mb-6"
              style={{ fontSize: "clamp(2rem,4vw,3.8rem)" }}
            >
              KEIN MASTERPLAN.{" "}
              <span className="gold-text">NUR DER WILLE,</span>{" "}
              ES ANDERS ZU MACHEN.
            </h2>
            <p className="text-cream/50 leading-relaxed text-lg mb-4 max-w-lg">
              Der klassische Weg hat mich nie überzeugt. Ausbildung, Studium, 40 Jahre
              irgendwo angestellt sein — für wen? Nicht für mich.
            </p>
            <p className="text-cream/50 leading-relaxed text-lg max-w-lg">
              Digitale Produkte mit AI zu bauen war der erste Weg, bei dem die Zahlen
              tatsächlich Sinn ergeben: Fast 100% Marge, kein Lager, keine Mitarbeiter,
              kein Chef. Einmal bauen — dauerhaft verkaufen.
            </p>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-sm border border-gold-300/20">
            <Image
              src="/assets/bela-with-dad.jpeg"
              alt="Bela mit seinem Vater"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-obsidian/20" />
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-obsidian py-20 border-t border-gold-300/10">
        <div className="mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow mb-5">Wofür Bela steht</p>
            <h2
              className="font-heading tracking-gta leading-none text-cream"
              style={{ fontSize: "clamp(2rem,4vw,3.8rem)" }}
            >
              KEIN GURU-FLEX.{" "}
              <span className="gold-text">EIN KLARES SYSTEM.</span>
            </h2>
          </div>
          <div className="grid gap-4">
            {values.map((value) => (
              <div key={value} className="flex gap-3 border border-gold-300/10 rounded-sm p-5 bg-white/[0.02]">
                <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300/70" />
                <p className="leading-7 text-cream/75">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lifestyle photo grid ── */}
      <section className="bg-obsidian border-t border-gold-300/10">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="eyebrow mb-8 text-center">Ortsunabhängig</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {LIFESTYLE.map((photo, i) => (
            <div key={i} className="relative aspect-[3/4] overflow-hidden group">
              <Image
                src={photo.src}
                alt={photo.label}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-obsidian/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-cream/40">
                {photo.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-obsidian py-24 border-t border-gold-300/10">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="eyebrow mb-6">Bereit?</p>
          <h2
            className="font-heading tracking-gta leading-none text-cream mb-8"
            style={{ fontSize: "clamp(2.2rem,5vw,4.5rem)" }}
          >
            STARTE MIT DEM{" "}
            <span className="gold-text">GRATIS WEBINAR.</span>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CTAS.map((cta) => (
              <Link
                key={`final-${cta.href}`}
                href={cta.href}
                target={cta.external ? "_blank" : undefined}
                rel={cta.external ? "noopener noreferrer" : undefined}
                className={cta.primary
                  ? "btn-shimmer inline-flex items-center gap-2 rounded-sm bg-gold-300 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-obsidian hover:bg-gold-200 transition-all"
                  : "inline-flex items-center gap-2 rounded-sm border border-gold-300/40 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-cream/80 hover:border-gold-300/80 hover:text-cream transition-all"
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
