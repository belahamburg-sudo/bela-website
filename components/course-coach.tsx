"use client";

import { FormEvent, useRef, useState } from "react";
import { BrainCircuit, Loader2, Send, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Fasse mir die Kernidee dieses Kurses zusammen.",
  "Was ist der wichtigste erste Schritt?",
  "Erkläre mir das anhand eines Beispiels.",
];

export function CourseCoach({ courseSlug, courseTitle }: { courseSlug: string; courseTitle: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    setError("");
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/course-coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseSlug, messages: next }),
      });
      const data = (await res.json().catch(() => null)) as { reply?: string; message?: string } | null;
      if (!res.ok || !data?.reply) throw new Error(data?.message || "Keine Antwort erhalten.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply as string }]);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gold-300/20 bg-ink/40 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-white/[0.02]"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-300/30 bg-gold-300/10">
            <BrainCircuit className="h-5 w-5 text-gold-300" />
          </span>
          <span>
            <span className="block text-sm font-bold uppercase tracking-[0.12em] text-cream">
              AI-Coach zu diesem Kurs
            </span>
            <span className="block text-xs text-cream/45">
              Stell Fragen zu „{courseTitle}“ — Antworten direkt aus dem Kurs.
            </span>
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-gold-300/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-200">
          {open ? "Schließen" : "Fragen"}
        </span>
      </button>

      {open ? (
        <div className="border-t border-white/[0.06] p-5">
          <div ref={scrollRef} className="max-h-80 space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="grid gap-2">
                <p className="text-xs text-cream/40">Beispiel-Fragen:</p>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-left text-sm text-cream/70 transition hover:border-gold-300/40 hover:text-cream"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold-300/70" /> {s}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-gold-300/15 text-cream"
                      : "mr-auto border border-white/10 bg-black/30 text-cream/80"
                  }`}
                >
                  {m.content}
                </div>
              ))
            )}
            {loading ? (
              <div className="mr-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-cream/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Coach denkt nach …
              </div>
            ) : null}
          </div>

          {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}

          <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Frag den Coach …"
              className="focus-ring min-h-11 flex-1 border border-gold-300/15 bg-black/40 px-4 text-sm text-cream placeholder:text-cream/20 outline-none transition-colors focus:border-gold-300/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-obsidian transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Senden"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
