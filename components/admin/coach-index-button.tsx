"use client";

import { useState } from "react";
import { Loader2, BrainCircuit, Check, AlertTriangle } from "lucide-react";
import { indexAllCourses, type IndexResult } from "@/app/admin/coach/actions";

export function CoachIndexButton() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IndexResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await indexAllCourses();
      if (!res.ok) {
        setError(res.error || "Indexierung fehlgeschlagen.");
        return;
      }
      setResults(res.results);
    } catch {
      setError("Indexierung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  const totalChunks = results?.reduce((n, r) => n + r.count, 0) ?? 0;

  return (
    <div className="grid gap-4">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="inline-flex w-fit items-center gap-2.5 rounded-full bg-gold-gradient px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-obsidian transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
        {loading ? "Indexiere Kurse …" : "Alle Kurse für den AI-Coach indexieren"}
      </button>

      {error ? (
        <p className="flex items-center gap-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4" /> {error}
        </p>
      ) : null}

      {results ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-cream/50">
            {results.length} Kurse · {totalChunks} Text-Chunks indexiert
          </p>
          <ul className="grid gap-1.5">
            {results.map((r) => (
              <li key={r.slug} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-cream/70">{r.title}</span>
                {r.error ? (
                  <span className="shrink-0 text-xs text-red-400">{r.error}</span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-emerald-300">
                    <Check className="h-3.5 w-3.5" /> {r.count}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
