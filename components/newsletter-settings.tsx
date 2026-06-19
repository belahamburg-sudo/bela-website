"use client";

import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";

type Status = "pending" | "confirmed" | "unsubscribed" | "none";

const LABEL: Record<Status, string> = {
  confirmed: "Aktiv abonniert",
  pending: "Bestätigung ausstehend (check deine Mails)",
  unsubscribed: "Abgemeldet",
  none: "Nicht abonniert",
};

export function NewsletterSettings({ initialStatus }: { initialStatus: Status }) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribed = status === "confirmed" || status === "pending";

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: subscribed ? "unsubscribe" : "subscribe" }),
      });
      const data = (await res.json()) as { status?: Status; message?: string };
      if (!res.ok) {
        setError(data.message || "Aktion fehlgeschlagen.");
        return;
      }
      setStatus(data.status ?? (subscribed ? "unsubscribed" : "pending"));
    } catch {
      setError("Verbindungsfehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink/40 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm font-bold text-gold-200">
        <Mail className="h-4 w-4" />
        Newsletter
      </div>
      <p className="mt-2 text-sm text-cream/50">
        Tipps, neue Kurse und Angebote. Double-Opt-In, jederzeit abbestellbar.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-cream/45">
          {status === "confirmed" && <Check className="h-3.5 w-3.5 text-emerald-300" />}
          {LABEL[status]}
        </span>
        <button
          type="button"
          onClick={toggle}
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] transition disabled:opacity-50 ${
            subscribed
              ? "border border-white/15 text-cream/60 hover:border-white/30 hover:text-cream/85"
              : "bg-gold-gradient text-obsidian hover:brightness-110"
          }`}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {subscribed ? "Abbestellen" : "Newsletter abonnieren"}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}
