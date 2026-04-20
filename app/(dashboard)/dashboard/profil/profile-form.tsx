"use client";

import { useState } from "react";
import { updateProfile } from "./actions";

type Props = {
  initialName: string;
  initialGoal: string;
  email: string;
};

export function ProfileForm({ initialName, initialGoal, email }: Props) {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setSaved(false);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    setPending(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error ?? "Speichern fehlgeschlagen.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email — read-only */}
      <div>
        <label className="block text-sm font-medium text-white/50 mb-2">
          E-Mail-Adresse
        </label>
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white/40 text-sm">
          {email}
        </p>
        <p className="mt-1.5 text-xs text-white/30">
          E-Mail-Adresse kann nicht hier geändert werden.
        </p>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="profile-name"
          className="block text-sm font-medium text-white/70 mb-2"
        >
          Name
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          defaultValue={initialName}
          placeholder="Dein Name"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-white/20 focus-ring outline-none transition-colors"
        />
      </div>

      {/* Goal */}
      <div>
        <label
          htmlFor="profile-goal"
          className="block text-sm font-medium text-white/70 mb-2"
        >
          Dein Ziel
        </label>
        <input
          id="profile-goal"
          name="goal"
          type="text"
          defaultValue={initialGoal}
          placeholder="Was möchtest du erreichen?"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-white/20 focus-ring outline-none transition-colors"
        />
      </div>

      {/* Submit row */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-medium text-obsidian transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Wird gespeichert…" : "Änderungen speichern"}
        </button>

        {saved && (
          <span className="text-sm text-gold-300">Gespeichert ✓</span>
        )}
        {error && (
          <span className="text-sm text-red-400">{error}</span>
        )}
      </div>
    </form>
  );
}
