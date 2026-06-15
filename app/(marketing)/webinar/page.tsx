import { CheckCircle2, CalendarClock } from "lucide-react";
import { Button } from "@/components/button";
import { LeadForm } from "@/components/lead-form";
import { getActiveWebinar } from "@/lib/webinar";

export const dynamic = "force-dynamic";

const BULLETS = [
  { num: "01", text: "Warum digitale Produkte für den Einstieg schlanker sind als viele klassische Modelle" },
  { num: "02", text: "Wie AI aus rohen Ideen Produkte, Module, Workbooks und Verkaufsseiten macht" },
  { num: "03", text: "Welche Funnel-Bausteine du brauchst, um nicht nur zu bauen, sondern zu verkaufen" },
  { num: "04", text: "Warum 3.000 Euro monatlich ein sinnvoller Zielrahmen ist, aber kein garantiertes Versprechen" },
];

const PERKS = [
  "Kostenlos & sofort verfügbar",
  "Kein Tech-Vorwissen nötig",
  "Unter 60 Minuten",
];

/** Formats an ISO date as e.g. "Mittwoch, 18. Juni 2026, 19:00 Uhr". */
function formatWebinarDate(startsAt: string | null): string | null {
  if (!startsAt) return null;
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return null;
  const formatted = date.toLocaleString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatted} Uhr`;
}

export default async function WebinarPage() {
  const webinar = await getActiveWebinar();

  const eyebrow = "Kostenloses Training";
  const title = webinar?.title ?? "Wie du mit AI dein erstes digitales Produkt baust und automatisiert verkaufst.";
  const subtitle =
    webinar?.subtitle ??
    "Ohne Lager, ohne Retouren, ohne monatelange Produktentwicklung. Der AI-Goldmining-Prozess von Idee bis Verkaufssystem.";
  const description = webinar?.description ?? null;
  const formattedDate = formatWebinarDate(webinar?.startsAt ?? null);
  const joinUrl = webinar?.url ?? null;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-obsidian pt-28 pb-24 overflow-hidden">
        {/* Subtle gold glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201, 169, 97,0.09) 0%, transparent 70%)" }}
        />
        {/* Top divider line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-300/30 to-transparent" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="eyebrow mb-6 mx-auto">{eyebrow}</p>
          <h1
            className="font-heading font-extrabold tracking-gta leading-[1.02] text-cream mb-5"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 5.5rem)" }}
          >
            {title}
          </h1>
          <p className="text-base sm:text-lg text-cream/50 max-w-2xl mx-auto leading-relaxed mb-8">
            {subtitle}
          </p>

          {/* Date badge (only when scheduled) */}
          {formattedDate && (
            <div className="mb-8 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-300/30 bg-gold-300/[0.06] px-5 py-2 text-sm font-semibold text-gold-100 backdrop-blur-md">
                <CalendarClock className="h-4 w-4 text-gold-300/80 shrink-0" />
                {formattedDate}
              </span>
            </div>
          )}

          {/* Perks row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10">
            {PERKS.map((p) => (
              <span key={p} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cream/35">
                <CheckCircle2 className="h-3.5 w-3.5 text-gold-300/60 shrink-0" />
                {p}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {joinUrl ? (
              <Button href={joinUrl} target="_blank" rel="noopener noreferrer">
                Jetzt teilnehmen →
              </Button>
            ) : (
              <Button href="#anmeldung">Gratis Zugang sichern →</Button>
            )}
            <Button href="/kurse" variant="secondary">Kurse ansehen</Button>
          </div>
        </div>
      </section>

      {/* ── What you learn ── */}
      <section className="py-28 bg-obsidian scratch-border">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
            <div>
              <p className="eyebrow mb-5 mx-auto">Was du lernst</p>
              <h2
                className="font-heading font-extrabold tracking-gta leading-[1.05] text-cream"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 3.5rem)" }}
              >
                Ein klarer Einstieg statt{" "}
                <span className="gold-text">AI-Chaos.</span>
              </h2>
              <p className="mt-4 text-sm text-cream/40 leading-relaxed">
                {description ?? "Das Webinar verkauft keinen Traum. Es zeigt die Bausteine, die du wirklich brauchst."}
              </p>
            </div>

            <ul className="space-y-0">
              {BULLETS.map((bullet) => (
                <li
                  key={bullet.num}
                  className="flex gap-5 items-start py-6 border-t border-gold-300/10"
                >
                  <span className="font-heading font-extrabold tracking-gta text-3xl text-gold-300/25 leading-none select-none shrink-0 w-10 text-right">
                    {bullet.num}
                  </span>
                  <p className="text-base text-cream/65 leading-relaxed pt-0.5">{bullet.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Lead form ── */}
      <section id="anmeldung" className="py-28 bg-obsidian scratch-border">
        <div className="mx-auto max-w-5xl px-6 grid gap-16 lg:grid-cols-[1fr_1.1fr] items-start">
          <div>
            <p className="eyebrow mb-5 mx-auto">Anmeldung</p>
            <h2
              className="font-heading font-extrabold tracking-gta leading-[1.05] text-cream"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3.5rem)" }}
            >
              Sichere dir den{" "}
              <span className="gold-text">kostenlosen Zugang.</span>
            </h2>
            <p className="mt-4 text-sm text-cream/40 leading-relaxed max-w-xs">
              {formattedDate
                ? `Live am ${formattedDate}. Kein Spam — sofort nach Anmeldung erhältst du den Zugangslink.`
                : "Kein Spam. Sofort nach Anmeldung erhältst du den Zugangslink."}
            </p>
            <div className="mt-8 space-y-3">
              {PERKS.map((p) => (
                <div key={p} className="flex items-center gap-2.5 text-sm text-cream/40">
                  <CheckCircle2 className="h-4 w-4 text-gold-300/50 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div className="panel-surface p-8">
            {joinUrl ? (
              <div className="flex flex-col items-start gap-5">
                <p className="text-base text-cream/70 leading-relaxed">
                  Die Anmeldung läuft direkt über unsere Webinar-Plattform. Mit einem Klick bist du dabei.
                </p>
                <Button href={joinUrl} target="_blank" rel="noopener noreferrer">
                  Jetzt teilnehmen →
                </Button>
                {formattedDate && (
                  <span className="flex items-center gap-2 text-sm text-cream/40">
                    <CalendarClock className="h-4 w-4 text-gold-300/60 shrink-0" />
                    {formattedDate}
                  </span>
                )}
              </div>
            ) : (
              <LeadForm source="webinar" />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
