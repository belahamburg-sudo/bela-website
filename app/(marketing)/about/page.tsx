import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/button";
import { SectionHeading } from "@/components/section-heading";

const values = [
  "Online Business ja, unrealistische Versprechen nein.",
  "AI als Umsetzungsvorteil, nicht als magischer Geldautomat.",
  "Digitale Produkte vor komplizierten Geschäftsmodellen.",
  "Erstes Ziel: realistisch starten, dann sauber skalieren."
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gold-radial py-16 sm:py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Image
            src="/assets/generated/hero-ai-gold.svg"
            alt="Abstraktes AI-Goldmining Gründer-Visual mit nicht-identifizierbarer Creator-Silhouette"
            width={1600}
            height={1000}
            className="rounded-[1.6rem] border border-gold-500/20 shadow-gold"
          />
          <div>
            <p className="eyebrow">Bela Goldmann</p>
            <h1 className="mt-5 font-heading text-5xl font-black leading-tight text-cream sm:text-6xl">
              Ich zeige dir, wie du mit AI digitale Produkte baust und automatisiert verkaufst.
            </h1>
            <p className="mt-6 text-lg leading-9 text-muted">
              Bela steht für eine neue Generation Online Business: direkt,
              digital, AI-getrieben und fokussiert auf Produkte, die nicht jede
              Woche neu ausgeliefert werden müssen.
            </p>
            <Button href="/webinar" className="mt-8">
              Gratis Webinar ansehen
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.85fr_1fr]">
          <SectionHeading
            eyebrow="Wofür Bela steht"
            title="Kein Guru-Flex. Ein klares System für digitale Produkte."
            copy="Die Personal Brand soll jung, stark und modern wirken, aber nicht billig oder unseriös. Die Website verkauft Methode, nicht Fantasie."
          />
          <div className="grid gap-4">
            {values.map((value) => (
              <div key={value} className="panel-surface flex gap-3 rounded-[1.35rem] p-5">
                <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                <p className="leading-7 text-cream">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
