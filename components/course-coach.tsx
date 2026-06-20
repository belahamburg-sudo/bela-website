"use client";

import { FormEvent, useRef, useState } from "react";
import { BookOpen, BrainCircuit, Loader2, Send, Sparkles } from "lucide-react";
import { ChatMarkdown } from "@/components/chat-markdown";

type Source = { lessonId: string | null; title: string };
type Msg = {
  role: "user" | "assistant";
  content: string;
  followups?: string[];
  sources?: Source[];
};

const STARTERS = [
  "Fasse mir die Kernidee dieses Kurses zusammen.",
  "Was ist der wichtigste erste Schritt?",
  "Erkläre mir das anhand eines Beispiels.",
];

function openLesson(lessonId: string) {
  window.dispatchEvent(new CustomEvent("course:open-lesson", { detail: { lessonId } }));
}

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
    const history = [...messages, { role: "user" as const, content: q }];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/course-coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseSlug, messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      const data = (await res.json().catch(() => null)) as
        | { reply?: string; followups?: string[]; sources?: Source[]; message?: string }
        | null;
      if (!res.ok || !data?.reply) throw new Error(data?.message || "Keine Antwort erhalten.");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply as string, followups: data.followups, sources: data.sources },
      ]);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
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
          <div ref={scrollRef} className="max-h-96 space-y-4 overflow-y-auto">
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
              messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="ml-auto max-w-[85%] rounded-2xl bg-gold-300/15 px-4 py-2.5 text-sm text-cream">
                    {m.content}
                  </div>
                ) : (
                  <div key={i} className="mr-auto max-w-[92%] space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                      <ChatMarkdown content={m.content} />
                    </div>

                    {m.sources && m.sources.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {m.sources.map((s, si) =>
                          s.lessonId ? (
                            <button
                              key={si}
                              type="button"
                              onClick={() => openLesson(s.lessonId as string)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/30 bg-gold-300/[0.06] px-3 py-1.5 text-[11px] font-medium text-gold-100 transition hover:border-gold-300/60 hover:bg-gold-300/[0.12]"
                            >
                              <BookOpen className="h-3.5 w-3.5" /> {s.title}
                            </button>
                          ) : null
                        )}
                      </div>
                    ) : null}

                    {m.followups && m.followups.length > 0 && i === messages.length - 1 ? (
                      <div className="grid gap-1.5">
                        {m.followups.map((f, fi) => (
                          <button
                            key={fi}
                            type="button"
                            onClick={() => ask(f)}
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left text-[13px] text-cream/65 transition hover:border-gold-300/40 hover:text-cream"
                          >
                            <Sparkles className="h-3 w-3 shrink-0 text-gold-300/60" /> {f}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              )
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
