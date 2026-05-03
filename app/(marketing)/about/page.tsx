import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { telegramUrl } from "@/lib/env";

const profileFacts = [
  { label: "Positionierung", value: "AI Goldmining" },
  { label: "Fokus", value: "Digitale Produkte" },
  { label: "Haltung", value: "Klarheit statt Hype" },
  { label: "Modus", value: "Ortsunabhängig" },
];

const timeline = [
  {
    num: "01",
    title: "Klassischer Weg, klassisches Problem",
    copy:
      "Ausbildung, Studium, 9-to-5: ein Modell, das für mich nie nach Freiheit ausgesehen hat.",
  },
  {
    num: "02",
    title: "Erste digitale Produkte",
    copy:
      "Ich habe angefangen, Wissen in Produkte zu verwandeln statt nur Zeit gegen Geld zu tauschen.",
  },
  {
    num: "03",
    title: "AI als Multiplikator",
    copy:
      "AI macht aus langen Projektphasen schnelle Workflows: Idee, Struktur, Copy und Packaging.",
  },
  {
    num: "04",
    title: "Heute: System statt Zufall",
    copy:
      "AI Goldmining ist mein Versuch, Klarheit, Methode und echte Ergebnisse in ein sauberes System zu bringen.",
  },
];

const principles = [
  "Online Business ja, unrealistische Versprechen nein.",
  "AI als Umsetzungsvorteil, nicht als magischer Geldautomat.",
  "Digitale Produkte vor komplizierten Geschäftsmodellen.",
  "Erstes Ziel: realistisch starten, dann sauber skalieren.",
];

const lifestyle = [
  { src: "/assets/bela-golf-2.jpeg", label: "Golf" },
  { src: "/assets/bela-seoul.jpg", label: "Seoul" },
  { src: "/assets/bela-terrace.jpg", label: "Istanbul" },
  { src: "/assets/bela-party.jpg", label: "Hamburg" },
];

const ctas = [
  { href: "/webinar", label: "Gratis Webinar", primary: true, external: false },
  { href: "/kurse", label: "Kurse ansehen", primary: false, external: false },
  { href: telegramUrl, label: "Telegram Community", primary: false, external: true },
  { href: "/#newsletter", label: "Newsletter", primary: false, external: false },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-obsidian py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(240,180,41,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/35 to-transparent" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border border-gold-300/18 bg-white/[0.02] shadow-[0_30px_80px_rgba(0,0,0,0.32)] lg:mx-0">
            <Image
              src="/assets/bela-character.jpeg"
              alt="Bela Goldmann"
              width={900}
              height={1200}
              priority
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cream/40">
                Photo / Authentisch / Ortsunabhängig
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <p className="eyebrow mb-5">Über mich</p>
              <h1
                className="font-heading text-5xl leading-[0.95] text-cream sm:text-6xl lg:text-[5.5rem]"
              >
                Bela Goldmann.
                <span className="gold-text block">Ich zeige, wie du mit AI digitale Produkte baust.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-cream/50">
                Kein Guru-Flex. Kein Lambo-Content. Ich baue digitale Produkte mit AI, weil dieses Modell
                für die meisten Menschen ehrlicher, schlanker und skalierbarer ist als der übliche Online-Hype.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {profileFacts.map((fact) => (
                <div key={fact.label} className="rounded-[1.5rem] border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-300/65">
                    {fact.label}
                  </p>
                  <p className="mt-2 font-heading text-xl text-cream">{fact.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.75rem] border border-gold-300/12 bg-gold-300/[0.05] p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold-300/75">
                Kurz gesagt
              </p>
              <p className="mt-3 max-w-xl text-base leading-7 text-cream/60">
                Ich will keine komplizierten Geschäftsmodelle romantisieren. Ich will zeigen, wie du mit klarer
                Positionierung, AI und digitalen Produkten ein Setup baust, das zu deinem Leben passt.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {ctas.map((cta) => (
                <Link
                  key={cta.href}
                  href={cta.href}
                  target={cta.external ? "_blank" : undefined}
                  rel={cta.external ? "noopener noreferrer" : undefined}
                  className={
                    cta.primary
                      ? "btn-shimmer inline-flex items-center justify-center gap-2 rounded-full bg-gold-300 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:bg-gold-200"
                      : "inline-flex items-center justify-center gap-2 rounded-full border border-gold-300/35 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-cream/80 transition-all hover:border-gold-300/70 hover:bg-gold-300/5 hover:text-cream"
                  }
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gold-300/10 bg-obsidian py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="eyebrow mb-5">Lebenslauf</p>
            <h2
              className="font-heading text-4xl leading-[1.05] text-cream sm:text-5xl"
            >
              KEIN MASTERPLAN.
              <span className="gold-text block">NUR DER WILLE, ES ANDERS ZU MACHEN.</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-cream/50">
              Nicht als Motivationsgeschichte, sondern als klare Positionierung: Ich baue digitale Produkte mit AI
              und zeige den Weg dahinter ohne Show.
            </p>
            <div className="mt-8 rounded-[1.75rem] border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-cream/35">
                Das ist die Kurzform
              </p>
              <p className="mt-3 text-base leading-7 text-cream/55">
                Weniger Theorie, mehr saubere Systeme. Weniger Inszenierung, mehr Klarheit. Weniger Hype, mehr Ergebnisse.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {timeline.map((entry) => (
              <article
                key={entry.num}
                className="grid gap-4 rounded-[1.75rem] border border-gold-300/10 bg-white/[0.02] p-5 sm:grid-cols-[auto_1fr] sm:items-start"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-300/20 bg-gold-300/[0.06] font-heading text-2xl text-gold-300">
                  {entry.num}
                </div>
                <div>
                  <h3 className="font-heading text-2xl text-cream">{entry.title}</h3>
                  <p className="mt-2 text-lg leading-8 text-cream/50">{entry.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gold-300/10 bg-obsidian py-24 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow mb-5">Wofür ich stehe</p>
            <h2 className="font-heading text-4xl leading-[1.05] text-cream sm:text-5xl">
              KEIN GURU-FLEX.
              <span className="gold-text block">EIN KLARES SYSTEM.</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {principles.map((value) => (
              <div key={value} className="rounded-[1.5rem] border border-gold-300/10 bg-white/[0.02] p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300/70" />
                  <p className="leading-7 text-cream/75">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gold-300/10 bg-obsidian py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 text-center">
            <p className="eyebrow mb-6">Ortsunabhängig</p>
            <h2 className="font-heading text-4xl leading-[1.05] text-cream sm:text-5xl">
              Freiheit ist der Nebeneffekt.
              <span className="gold-text block">Nicht die Verpackung.</span>
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {lifestyle.map((photo) => (
            <div key={photo.src} className="group relative aspect-[3/4] overflow-hidden">
              <Image
                src={photo.src}
                alt={photo.label}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-obsidian/25" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-cream/40">
                {photo.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gold-300/10 bg-obsidian py-24 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="eyebrow mb-6">Bereit?</p>
          <h2 className="font-heading text-4xl leading-[1.05] text-cream sm:text-5xl lg:text-[4.5rem]">
            Starte mit dem
            <span className="gold-text block">Gratis Webinar.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-cream/50">
            Wenn du die Strategie erst sehen willst, geh über das Webinar. Wenn du dich tiefer einarbeiten willst,
            nimm die Kurse. Wenn du nah dran bleiben willst, komm in die Community.
          </p>
          <div className="mt-10 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
            {ctas.map((cta) => (
              <Link
                key={`final-${cta.href}`}
                href={cta.href}
                target={cta.external ? "_blank" : undefined}
                rel={cta.external ? "noopener noreferrer" : undefined}
                className={
                  cta.primary
                    ? "btn-shimmer inline-flex items-center justify-center gap-2 rounded-full bg-gold-300 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-obsidian transition-all hover:bg-gold-200"
                    : "inline-flex items-center justify-center gap-2 rounded-full border border-gold-300/35 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-cream/80 transition-all hover:border-gold-300/70 hover:bg-gold-300/5 hover:text-cream"
                }
              >
                {cta.label}
                {cta.primary ? <ArrowRight aria-hidden className="h-4 w-4" /> : null}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
