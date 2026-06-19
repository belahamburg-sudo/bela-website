"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Loader2, Sparkles, X } from "lucide-react";
import { formatEuro } from "@/lib/utils";

type Props = {
  sessionId: string;
  slug: string;
  title: string;
  tagline?: string;
  image: string;
  fullPriceCents: number;
  otoPriceCents: number;
  discountPercent: number;
};

type State = "offer" | "loading" | "done" | "dismissed" | "action" | "error";

export function OtoOffer({
  sessionId,
  slug,
  title,
  tagline,
  image,
  fullPriceCents,
  otoPriceCents,
  discountPercent,
}: Props) {
  const [state, setState] = useState<State>("offer");
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/oto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as { ok?: boolean; requiresAction?: boolean; message?: string };
      if (data.requiresAction) {
        setState("action");
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.message || "Das Angebot konnte nicht eingelöst werden.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
      setState("error");
    }
  }

  if (state === "dismissed") return null;

  if (state === "done") {
    return (
      <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
          <Check className="h-4 w-4" />
          {title} freigeschaltet
        </div>
        <p className="text-sm text-cream/55">
          Dein Bonus-Kurs ist deinem Account gutgeschrieben.
        </p>
        <Link
          href={`/db/kurse/${slug}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold-300 hover:text-gold-200"
        >
          Jetzt öffnen <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-10 max-w-2xl overflow-hidden rounded-2xl border border-gold-300/30 bg-gradient-to-br from-gold-300/[0.10] via-ink/70 to-ink/60 text-left shadow-[0_24px_70px_-30px_rgba(201,169,97,0.5)]">
      <div className="flex items-center gap-2 border-b border-gold-300/15 bg-gold-300/[0.05] px-5 py-2.5">
        <Sparkles className="h-3.5 w-3.5 text-gold-300" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-200">
          Einmaliges Angebot · nur jetzt
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[140px_1fr] sm:p-6">
        <div className="relative hidden h-full min-h-[120px] overflow-hidden rounded-xl border border-white/10 sm:block">
          <Image src={image} alt={title} fill className="object-cover" sizes="140px" />
        </div>

        <div>
          <span className="inline-block rounded-sm bg-gold-300 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-obsidian">
            -{discountPercent}% OFF
          </span>
          <h3 className="mt-2 font-heading text-xl leading-tight text-cream">
            Füg <span className="gold-text">{title}</span> hinzu
          </h3>
          {tagline && <p className="mt-1 text-sm text-cream/50">{tagline}</p>}

          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="font-heading text-3xl text-gold-300">{formatEuro(otoPriceCents)}</span>
            <span className="text-base text-cream/35 line-through decoration-cream/30">
              {formatEuro(fullPriceCents)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-cream/40">
            1-Click auf deine eben genutzte Karte. Keine erneute Eingabe.
          </p>

          {state === "action" && (
            <div className="mt-3 rounded-lg border border-gold-300/25 bg-gold-300/[0.05] p-3 text-xs leading-relaxed text-cream/70">
              Deine Bank verlangt eine Bestätigung. Schließe den Kauf über den
              normalen Checkout ab:{" "}
              <Link href={`/kurse/${slug}?buy=1`} className="font-semibold text-gold-200 underline">
                {title} kaufen
              </Link>
              .
            </div>
          )}
          {state === "error" && error && (
            <p className="mt-3 text-xs font-medium text-red-400">{error}</p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={accept}
              disabled={state === "loading"}
              className="btn-shimmer inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-gradient px-5 py-3 text-sm font-bold uppercase tracking-wider text-obsidian transition hover:brightness-110 disabled:opacity-60"
            >
              {state === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Ja, dazu für {formatEuro(otoPriceCents)}
            </button>
            <button
              type="button"
              onClick={() => setState("dismissed")}
              disabled={state === "loading"}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-cream/55 transition hover:border-white/30 hover:text-cream/80 disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
              Nein danke
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
