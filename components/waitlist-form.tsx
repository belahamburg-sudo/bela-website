"use client";

import { useState, useTransition } from "react";
import { Bell, Check, Loader2 } from "lucide-react";

export function WaitlistForm({ courseSlug, courseTitle }: { courseSlug: string; courseTitle: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ courseSlug, email: email.trim(), name: name.trim() || null }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError((data as { error?: string }).error ?? "Etwas ist schiefgelaufen.");
          return;
        }
        setDone(true);
      } catch {
        setError("Netzwerkfehler — bitte versuche es erneut.");
      }
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-6 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-6 w-6 text-emerald-300" />
        </div>
        <p className="font-heading text-lg font-black text-cream">Du bist auf der Warteliste!</p>
        <p className="text-sm text-cream/50">
          Wir benachrichtigen dich per E-Mail, sobald <strong className="text-cream/70">{courseTitle}</strong> verfügbar ist.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gold-300/20 bg-gold-300/[0.04] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-300/30 bg-gold-300/10">
          <Bell className="h-5 w-5 text-gold-200" />
        </div>
        <div>
          <p className="font-heading text-lg font-black text-cream">Benachrichtigung erhalten</p>
          <p className="text-xs text-cream/40">Trag dich ein — wir melden uns, sobald der Kurs live geht.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-cream placeholder:text-cream/25 focus:border-gold-300/40 focus:outline-none"
        />
        <input
          type="email"
          required
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-cream placeholder:text-cream/25 focus:border-gold-300/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold uppercase tracking-wider text-obsidian transition hover:brightness-110 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Erinnere mich"}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
    </form>
  );
}
