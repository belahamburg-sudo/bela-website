"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { completeOnboarding } from "./actions";

export default function OnboardingPage() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    await completeOnboarding(formData);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/15">
            <Zap className="h-6 w-6 text-gold-300" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <p className="eyebrow mb-4">Willkommen bei AI Goldmining</p>
          <h1 className="font-heading text-3xl lg:text-4xl text-white leading-tight">
            Lass uns dich{" "}
            <em className="gold-text not-italic">kennenlernen.</em>
          </h1>
          <p className="mt-3 text-white/40 text-base">
            Nur zwei kurze Fragen, dann geht es los.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="panel-surface rounded-2xl p-8 space-y-6"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white/70 mb-2"
            >
              Wie heißt du?
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Dein Name"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-white/20 focus-ring outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="goal"
              className="block text-sm font-medium text-white/70 mb-2"
            >
              Was ist dein größtes Ziel?
            </label>
            <input
              id="goal"
              name="goal"
              type="text"
              placeholder="z.B. Digitales Produkt launchen, AI-Workflow aufbauen…"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-white/20 focus-ring outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-gold-500 px-6 py-3 font-medium text-obsidian transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Wird gespeichert…" : "Loslegen →"}
          </button>
        </form>
      </div>
    </div>
  );
}
