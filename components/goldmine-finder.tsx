"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Pickaxe, Sparkles } from "lucide-react";

type Idea = {
  title: string;
  pitch: string;
  whyYou: string;
  steps: string[];
  effort: string;
  course: { title: string; href: string } | null;
};

const EFFORT_STYLE: Record<string, string> = {
  niedrig: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  mittel: "border-gold-300/30 bg-gold-300/10 text-gold-200",
  hoch: "border-red-400/30 bg-red-400/10 text-red-300",
};

export function GoldmineFinder() {
  const [wish, setWish] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [ideas, setIdeas] = useState<Idea[] | null>(null);

  async function generate() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/goldmine-finder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wish }),
      });
      const data = (await res.json().catch(() => null)) as { ideas?: Idea[]; message?: string } | null;
      if (!res.ok || !data?.ideas) {
        throw new Error(data?.message || "Konnte keine Ideen erzeugen.");
      }
      setIdeas(data.ideas);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Etwas ist schiefgelaufen.");
    }
  }

  const loading = status === "loading";

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-white/10 bg-ink/40 p-6 backdrop-blur-xl">
        <label htmlFor="gf-wish" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300/70">
          Was kannst du gut, oder worauf hast du Lust? (optional)
        </label>
        <textarea
          id="gf-wish"
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          rows={3}
          maxLength={600}
          placeholder="z. B. Ich kann gut schreiben und kenne mich mit Immobilien aus …"
          className="focus-ring w-full resize-none border border-gold-300/15 bg-black/40 px-4 py-3 text-sm text-cream placeholder:text-cream/20 outline-none transition-colors focus:border-gold-300/50 focus:bg-black/60"
        />
        <p className="mt-2 text-xs text-cream/40">
          Wir nutzen außerdem dein Profil (Ziel, Reichweite, Phase), um die Ideen auf dich zuzuschneiden.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="btn-shimmer mt-4 inline-flex items-center justify-center gap-2.5 bg-gold-gradient px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] text-obsidian transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pickaxe className="h-4 w-4" />}
          {loading ? "Schürfe Ideen …" : ideas ? "Neue Ideen schürfen" : "Goldader finden"}
        </button>
        {status === "error" && error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
      </div>

      {ideas ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {ideas.map((idea, i) => (
            <div key={i} className="flex flex-col rounded-2xl border border-white/10 bg-ink/40 p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="font-heading text-lg leading-tight text-cream">{idea.title}</h3>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${
                    EFFORT_STYLE[idea.effort] ?? EFFORT_STYLE.mittel
                  }`}
                >
                  {idea.effort}
                </span>
              </div>
              {idea.pitch ? <p className="text-sm leading-relaxed text-cream/70">{idea.pitch}</p> : null}
              {idea.whyYou ? (
                <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-gold-200/80">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-300" />
                  {idea.whyYou}
                </p>
              ) : null}
              {idea.steps.length > 0 ? (
                <ol className="mt-4 grid gap-2">
                  {idea.steps.map((step, si) => (
                    <li key={si} className="flex gap-2.5 text-sm text-cream/60">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold-300/30 text-[10px] font-bold text-gold-300">
                        {si + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              ) : null}
              {idea.course ? (
                <Link
                  href={idea.course.href}
                  className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full border border-gold-300/30 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-200 transition hover:border-gold-300/60 hover:text-gold-100"
                >
                  Passender Kurs: {idea.course.title}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
