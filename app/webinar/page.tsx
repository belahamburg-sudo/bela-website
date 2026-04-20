import { CalendarClock, CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";
import { SectionHeading } from "@/components/section-heading";

const bullets = [
  "Warum digitale Produkte für den Einstieg schlanker sind als viele klassische Modelle",
  "Wie AI aus rohen Ideen Produkte, Module, Workbooks und Verkaufsseiten macht",
  "Welche Funnel-Bausteine du brauchst, um nicht nur zu bauen, sondern zu verkaufen",
  "Warum 3.000 Euro monatlich ein sinnvoller Zielrahmen ist, aber kein garantiertes Versprechen"
];

export default function WebinarPage() {
  return (
    <>
      <section className="bg-gold-radial py-16 sm:py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow">Kostenloses Training</p>
            <h1 className="mt-5 font-heading text-5xl font-black leading-tight text-cream sm:text-6xl">
              Wie du mit AI dein erstes digitales Produkt baust und automatisiert verkaufst.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-muted">
              Ohne Lager, ohne Retouren, ohne monatelange Produktentwicklung.
              Das Webinar zeigt den AI-Goldmining-Prozess von Idee bis Verkaufssystem.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#anmeldung">Gratis Zugang sichern</Button>
              <Button href="/kurse" variant="secondary">
                Kurse ansehen
              </Button>
            </div>
          </div>
          <div className="panel-surface rounded-[1.35rem] p-6">
            <div className="aspect-video rounded-2xl border border-gold-500/20 bg-obsidian p-8">
              <div className="flex h-full items-center justify-center rounded-2xl bg-gold-500/10">
                <PlayCircle aria-hidden className="h-20 w-20 text-gold-300" />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 text-sm font-semibold text-gold-100">
              <CalendarClock aria-hidden className="h-5 w-5" />
              On-Demand Webinar, Demo-Link konfigurierbar
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.85fr_1fr]">
          <SectionHeading
            eyebrow="Was du lernst"
            title="Ein klarer Einstieg statt AI-Chaos."
            copy="Das Webinar verkauft keinen Traum. Es zeigt dir die Bausteine, die du wirklich brauchst, um aus einer Idee ein kaufbares digitales Produkt zu machen."
          />
          <div className="grid gap-4">
            {bullets.map((bullet) => (
              <div key={bullet} className="panel-surface flex gap-3 rounded-[1.35rem] p-5">
                <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 flex-none text-gold-300" />
                <p className="leading-7 text-cream">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="anmeldung" className="bg-graphite py-20">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.85fr_1fr]">
          <SectionHeading
            eyebrow="Anmeldung"
            title="Sichere dir den kostenlosen Zugang."
            copy="Deine Daten werden im Live-Modus in Supabase gespeichert. Ohne Keys bestätigt der Demo-Modus die Anmeldung lokal."
          />
          <div className="panel-surface rounded-[1.35rem] p-6">
            <LeadForm source="webinar" />
          </div>
        </div>
      </section>
    </>
  );
}
