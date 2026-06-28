import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MailX, AlertCircle } from "lucide-react";

// Status/confirmation landing — no SEO value, keep it out of the index.
export const metadata: Metadata = {
  title: "Newsletter | AI Goldmining",
  description: "Newsletter-Status von AI Goldmining.",
  robots: { index: false, follow: true },
};

const MESSAGES: Record<string, { icon: typeof CheckCircle2; title: string; copy: string }> = {
  confirmed: {
    icon: CheckCircle2,
    title: "Newsletter bestätigt.",
    copy: "Danke! Du bist jetzt dabei und bekommst meine Tipps und Angebote.",
  },
  unsubscribed: {
    icon: MailX,
    title: "Abgemeldet.",
    copy: "Du erhältst keinen Newsletter mehr. Schade, dass du gehst.",
  },
  invalid: {
    icon: AlertCircle,
    title: "Link ungültig.",
    copy: "Dieser Bestätigungslink ist ungültig oder abgelaufen. Trag dich gern erneut ein.",
  },
};

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const m = MESSAGES[status ?? ""] ?? MESSAGES.invalid;
  const Icon = m.icon;

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-obsidian px-6 py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold-300/25 bg-gold-300/[0.06]">
          <Icon className="h-8 w-8 text-gold-300" aria-hidden />
        </div>
        <h1 className="font-heading text-3xl uppercase tracking-gta text-cream">{m.title}</h1>
        <p className="mt-4 leading-relaxed text-cream/55">{m.copy}</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold-300/30 px-6 py-3 text-sm font-bold uppercase tracking-wider text-cream/70 transition hover:border-gold-300/60 hover:text-cream"
        >
          Zur Startseite
        </Link>
      </div>
    </section>
  );
}
