"use client";

import { FormEvent, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STARTER: ChatMessage = {
  role: "assistant",
  content:
    "Hey, ich helfe dir bei Kursauswahl, Zugang, Checkout, Newsletter und Telegram. Was suchst du gerade?",
};

const QUICK_QUESTIONS = [
  "Welcher Kurs passt für Einsteiger?",
  "Wie bekomme ich Zugriff nach dem Kauf?",
  "Was ist die VIP Community?",
];

export function SupportChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const payload = (await response.json().catch(() => null)) as {
        reply?: string;
        message?: string;
      } | null;
      if (!response.ok || !payload?.reply) {
        throw new Error(payload?.message || "Der Chat ist gerade nicht erreichbar.");
      }
      setMessages((current) => [...current, { role: "assistant", content: payload.reply! }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Der Chat ist gerade nicht erreichbar. Schreib Bela direkt auf Telegram.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[110] sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-3 flex h-[min(680px,calc(100vh-7rem))] w-[calc(100vw-2.5rem)] max-w-[390px] flex-col overflow-hidden rounded-xl border border-gold-300/25 bg-obsidian/95 shadow-[0_24px_90px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-gold-300/15 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-300/25 bg-gold-300/10 text-gold-300">
                <Bot aria-hidden className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-cream">AI Goldmining Support</p>
                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-cream/35">
                  Angebote & Zugang
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-cream/45 transition-colors hover:bg-white/5 hover:text-cream"
              aria-label="Chat schließen"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-gold-300 text-obsidian"
                      : "border border-white/10 bg-white/[0.04] text-cream/80"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-cream/55">
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin text-gold-300" />
                  Antwort wird geladen
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="grid gap-2 border-t border-white/5 px-4 py-3">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void ask(question)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs text-cream/65 transition-colors hover:border-gold-300/35 hover:text-gold-100"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-gold-300/15 p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Frag etwas..."
              className="min-h-11 flex-1 rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-cream outline-none transition-colors placeholder:text-cream/25 focus:border-gold-300/45"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-shimmer flex h-11 w-11 items-center justify-center rounded-lg bg-gold-gradient text-obsidian transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Nachricht senden"
            >
              {loading ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : (
                <Send aria-hidden className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn-shimmer flex h-14 w-14 items-center justify-center rounded-full border border-gold-300/25 bg-gold-gradient text-obsidian shadow-[0_16px_45px_-14px_rgba(201,169,97,0.75)] transition hover:brightness-110"
        aria-label={open ? "Chat schließen" : "Support-Chat öffnen"}
      >
        {open ? <X aria-hidden className="h-5 w-5" /> : <MessageCircle aria-hidden className="h-5 w-5" />}
      </button>
    </div>
  );
}
