import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/button";
import { FreebieSubmitButton } from "@/components/freebie-submit-button";
import type { NewsletterStatus } from "@/lib/newsletter";

type Step = 1 | 2 | 3;

function StepRail({ active }: { active: Step }) {
  const steps = [
    { id: 1 as const, label: "Account" },
    { id: 2 as const, label: "Newsletter" },
    { id: 3 as const, label: "Zugang" },
  ];

  return (
    <ol className="mb-6 grid grid-cols-3 gap-2">
      {steps.map((step) => {
        const done = active > step.id;
        const current = active === step.id;
        return (
          <li
            key={step.id}
            className={`rounded-lg border px-2 py-2 text-center text-[9px] font-bold uppercase tracking-[0.14em] sm:text-[10px] ${
              done
                ? "border-gold-300/35 bg-gold-300/10 text-gold-200"
                : current
                  ? "border-gold-300/50 bg-gold-300/15 text-cream"
                  : "border-white/10 bg-white/[0.02] text-cream/30"
            }`}
          >
            <span className="block">{step.id}</span>
            <span className="mt-0.5 block">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function FreebieFunnel({
  slug,
  courseTitle,
  courseImage,
  user,
  newsletterStatus,
  activeStep,
  error,
  status,
  claimAction,
}: {
  slug: string;
  courseTitle: string;
  courseImage?: string | null;
  user: { email?: string | null } | null;
  newsletterStatus: NewsletterStatus;
  activeStep: Step;
  error?: string;
  status?: string;
  claimAction: (formData: FormData) => Promise<void>;
}) {
  const redirectTarget = encodeURIComponent(`/freebie/${slug}?start=1`);
  const newsletterConfirmed = newsletterStatus === "confirmed";
  const newsletterPending = newsletterStatus === "pending" || status === "check_email";

  return (
    <div className="border border-gold-300/20 bg-ink/70 p-5 shadow-gold backdrop-blur-xl sm:p-7">
      {courseImage && (
        <div className="relative mb-6 aspect-[4/3] overflow-hidden border border-white/10">
          <Image
            src={courseImage}
            alt={courseTitle}
            fill
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <StepRail active={activeStep} />

      {!user ? (
        <div className="grid gap-5">
          <div className="flex h-12 w-12 items-center justify-center border border-gold-300/30 bg-gold-300/10">
            <LockKeyhole aria-hidden className="h-5 w-5 text-gold-300" />
          </div>
          <div>
            <p className="font-heading text-2xl text-cream">Schritt 1: Account erstellen</p>
            <p className="mt-2 text-sm leading-7 text-cream/50">
              Melde dich an oder registriere dich kostenlos. Danach kommst du automatisch
              zurück zu diesem Gratis-Produkt.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button href={`/login?redirect=${redirectTarget}`} size="lg" className="w-full">
              Einloggen
            </Button>
            <Button
              href={`/signup?redirect=${redirectTarget}`}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              Registrieren
            </Button>
          </div>
        </div>
      ) : (
        <form action={claimAction} className="grid gap-5">
          <input type="hidden" name="slug" value={slug} />

          <div>
            <p className="font-heading text-2xl text-cream">
              {newsletterConfirmed ? "Fast geschafft" : "Schritt 2: Newsletter bestätigen"}
            </p>
            <p className="mt-2 text-sm leading-7 text-cream/50">
              {newsletterConfirmed
                ? "Du bist für den Newsletter angemeldet. Klicke auf Weiter — dein Gratis-Produkt wird sofort freigeschaltet."
                : newsletterPending
                  ? "Wir haben dir eine Bestätigungs-Mail geschickt. Sobald du den Link klickst, wird der Kurs automatisch freigeschaltet."
                  : "Im Gegenzug für den Gratis-Zugang meldest du dich zum AI Goldmining Newsletter an."}
            </p>
            {user.email && (
              <p className="mt-3 text-xs font-mono uppercase tracking-[0.14em] text-gold-300/70">
                {user.email}
              </p>
            )}
          </div>

          {!newsletterConfirmed && !newsletterPending && (
            <label className="flex cursor-pointer items-start gap-3 border border-gold-300/15 bg-gold-300/[0.04] px-4 py-4">
              <input
                name="newsletter"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 flex-none rounded border-white/20 bg-obsidian accent-gold-300"
              />
              <span className="text-sm leading-6 text-cream/70">
                Ja, ich möchte den kostenlosen Kurs erhalten und melde mich dafür zum AI
                Goldmining Newsletter an. Abmeldung jederzeit per Link in jeder E-Mail.
              </span>
            </label>
          )}

          {newsletterConfirmed && (
            <div className="flex items-start gap-3 border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 flex-none" />
              <span>Newsletter ist aktiv — du kannst direkt weitermachen.</span>
            </div>
          )}

          {error === "newsletter" && (
            <p className="border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs font-semibold text-red-200">
              Für dieses Freebie ist die Newsletter-Anmeldung erforderlich.
            </p>
          )}
          {error === "grant" && (
            <p className="border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs font-semibold text-red-200">
              Die Freischaltung ist fehlgeschlagen. Bitte versuche es erneut oder kontaktiere
              den Support.
            </p>
          )}
          {error === "config" && (
            <p className="border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs font-semibold text-red-200">
              Freebies sind serverseitig noch nicht vollständig konfiguriert.
            </p>
          )}
          {status === "resent" && !newsletterConfirmed && (
            <p className="flex items-start gap-3 border border-emerald-400/30 bg-emerald-400/[0.08] px-4 py-3 text-sm leading-6 text-emerald-100">
              <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 flex-none" />
              <span>
                Mail wurde gerade verschickt
                {user.email ? ` an ${user.email}` : ""}. Schau in dein Postfach, auch im
                Spam-Ordner.
              </span>
            </p>
          )}

          {status !== "resent" && (status === "check_email" || newsletterPending) && !newsletterConfirmed && (
            <p className="border border-gold-300/20 bg-gold-300/[0.06] px-4 py-3 text-xs font-semibold text-gold-100">
              Check deine Inbox und bestätige den Newsletter. Danach wirst du automatisch in
              dein Gratis-Produkt weitergeleitet.
            </p>
          )}

          {!newsletterPending && (
            <FreebieSubmitButton
              pendingLabel="Moment …"
              className="btn-shimmer inline-flex min-h-12 items-center justify-center gap-2 bg-gold-gradient px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-obsidian transition hover:brightness-110"
            >
              {newsletterConfirmed ? (
                <>
                  Weiter zum Gratis-Produkt
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Sparkles aria-hidden className="h-4 w-4" />
                  Weiter
                </>
              )}
            </FreebieSubmitButton>
          )}

          {newsletterPending && !newsletterConfirmed && (
            <div className="grid gap-3">
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-cream/35">
                Bereits bestätigt? Lade die Seite neu.
              </p>
              <FreebieSubmitButton
                name="resend"
                value="on"
                pendingLabel="Wird verschickt …"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-gold-300/50 bg-gold-300/15 px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-100 transition hover:border-gold-300/80 hover:bg-gold-300/25"
              >
                <Mail aria-hidden className="h-4 w-4" />
                Bestätigungs-Mail erneut senden
              </FreebieSubmitButton>
            </div>
          )}
        </form>
      )}

      <Link
        href="/kurse"
        className="mt-6 block text-center text-[10px] font-bold uppercase tracking-[0.18em] text-cream/35 transition-colors hover:text-gold-200"
      >
        Zur Kursübersicht
      </Link>
    </div>
  );
}
