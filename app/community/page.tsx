import { MessageCircle, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";
import { SectionHeading } from "@/components/section-heading";
import { telegramUrl } from "@/lib/env";

export default function CommunityPage() {
  return (
    <>
      <section className="bg-gold-radial py-16 sm:py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow">Telegram Community</p>
            <h1 className="mt-5 font-heading text-5xl font-black leading-tight text-cream sm:text-6xl">
              Starte nicht allein. Baue mit anderen digitale Produkte mit AI.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-muted">
              Die kostenlose Community ist der schnelle Einstieg für Produktideen,
              AI-Prompts, Umsetzungsimpulse und Updates zu neuen Mini-Kursen.
            </p>
            <Button href={telegramUrl} className="mt-8">
              <MessageCircle aria-hidden className="h-4 w-4" />
              Telegram beitreten
            </Button>
          </div>
          <div className="panel-surface rounded-[1.35rem] p-6">
            <Users aria-hidden className="h-10 w-10 text-gold-300" />
            <h2 className="mt-5 font-heading text-3xl font-black text-cream">
              Was in der Community passiert
            </h2>
            <div className="mt-6 grid gap-3 text-sm leading-7 text-muted">
              <p>Produktideen und Beispiele</p>
              <p>AI-Prompts für digitale Produkte</p>
              <p>Launch-Updates und neue Kurse</p>
              <p>Kurze, direkte Umsetzungsschritte</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.85fr_1fr]">
          <SectionHeading
            eyebrow="Community Lead"
            title="Trag dich ein und komm in den nächsten Schritt."
            copy="So kann Bela dich später auch außerhalb von Telegram mit Webinar, Kursen und neuen Produktideen erreichen."
          />
          <div className="panel-surface rounded-[1.35rem] p-6">
            <LeadForm source="community" />
          </div>
        </div>
      </section>

      <section className="bg-graphite py-20">
        <div className="container-shell">
          <div className="panel-surface flex flex-col gap-5 rounded-[1.35rem] p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Sparkles aria-hidden className="mb-4 h-8 w-8 text-gold-300" />
              <h2 className="font-heading text-3xl font-black text-cream">
                Community ist Einstieg, Kurse sind Umsetzung.
              </h2>
              <p className="mt-3 max-w-2xl text-muted">
                Wenn du tiefer bauen willst, geh vom Impuls in einen konkreten Mini-Kurs.
              </p>
            </div>
            <Button href="/kurse" variant="secondary">
              Kurse ansehen
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
