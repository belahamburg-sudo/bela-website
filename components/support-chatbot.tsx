"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Loader2,
  MessageCircle,
  Send,
  ShoppingCart,
  X,
} from "lucide-react";

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

// Rotating "thinking" phrases shown (without a box) while the answer loads.
const THINKING_PHRASES = [
  "Schürft nach der besten Antwort",
  "Sucht deinen passenden Kurs",
  "Stöbert im Katalog",
  "Prüft Zugang & Preise",
  "Sortiert die Optionen",
  "Denkt kurz nach",
];

// ───────────────────────── Markdown-ish rendering ─────────────────────────
// The assistant answers in light markdown (**bold**, bullets, links). We render
// it properly and turn any link into a tappable button/chip instead of pasting
// a raw URL.

type LinkKind = "course" | "telegram" | "cart" | "internal" | "external";

function classifyUrl(url: string): LinkKind {
  if (/t\.me\//i.test(url) || /telegram/i.test(url)) return "telegram";
  if (/^\/(kurse|bibliothek)\b/.test(url)) return "course";
  if (/^\/warenkorb\b/.test(url)) return "cart";
  if (url.startsWith("/")) return "internal";
  return "external";
}

function normalizeUrl(u: string): string {
  if (u.startsWith("/") || u.startsWith("http")) return u;
  return `https://${u}`;
}

function prettyUrl(u: string): string {
  if (/t\.me\//i.test(u)) return "Telegram öffnen";
  try {
    return new URL(normalizeUrl(u)).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

const CHIP_CLASS =
  "mx-0.5 my-0.5 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-gold-300/30 bg-gold-300/[0.08] px-2.5 py-1 align-middle text-[12px] font-semibold text-gold-100 transition-colors hover:border-gold-300/60 hover:bg-gold-300/15";

function LinkChip({ url, label }: { url: string; label: string }) {
  const kind = classifyUrl(url);
  const Icon =
    kind === "course"
      ? BookOpen
      : kind === "telegram"
        ? Send
        : kind === "cart"
          ? ShoppingCart
          : ArrowUpRight;
  const inner = (
    <>
      <Icon aria-hidden className="h-3.5 w-3.5 flex-none text-gold-300" />
      <span className="truncate">{label}</span>
    </>
  );
  if (url.startsWith("/")) {
    return (
      <Link href={url} className={CHIP_CLASS}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={CHIP_CLASS}>
      {inner}
    </a>
  );
}

const INLINE_PATTERNS: { re: RegExp; render: (m: RegExpExecArray, key: string) => ReactNode }[] = [
  {
    re: /\[([^\]]+)\]\(([^)\s]+)\)/,
    render: (m, key) => <LinkChip key={key} label={m[1]} url={normalizeUrl(m[2])} />,
  },
  {
    re: /\*\*(.+?)\*\*/,
    render: (m, key) => (
      <strong key={key} className="font-bold text-cream">
        {m[1]}
      </strong>
    ),
  },
  {
    re: /__(.+?)__/,
    render: (m, key) => (
      <strong key={key} className="font-bold text-cream">
        {m[1]}
      </strong>
    ),
  },
  {
    re: /(?<![\w*])\*(?!\s)([^*\n]+?)\*(?![\w*])/,
    render: (m, key) => <em key={key}>{m[1]}</em>,
  },
  {
    re: /(https?:\/\/[^\s)]+|t\.me\/[^\s)]+)/,
    render: (m, key) => <LinkChip key={key} label={prettyUrl(m[1])} url={normalizeUrl(m[1])} />,
  },
];

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let k = 0;
  while (rest.length > 0) {
    let best: { index: number; matchLen: number; node: ReactNode } | null = null;
    for (const p of INLINE_PATTERNS) {
      const m = p.re.exec(rest);
      if (m && (best === null || m.index < best.index)) {
        best = { index: m.index, matchLen: m[0].length, node: p.render(m, `${keyBase}-${k}`) };
      }
    }
    if (!best) {
      nodes.push(rest);
      break;
    }
    if (best.index > 0) nodes.push(rest.slice(0, best.index));
    nodes.push(best.node);
    rest = rest.slice(best.index + best.matchLen);
    k++;
  }
  return nodes;
}

function ChatMessageBody({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    const para0 = para;
    blocks.push(
      <p key={`p-${blocks.length}`} className="leading-6">
        {para0.map((line, li) => (
          <span key={li}>
            {li > 0 ? <br /> : null}
            {renderInline(line, `p${blocks.length}-${li}`)}
          </span>
        ))}
      </p>
    );
    para = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    const list0 = list;
    blocks.push(
      <ul key={`u-${blocks.length}`} className="ml-0.5 space-y-1">
        {list0.map((line, li) => (
          <li key={li} className="flex gap-2">
            <span className="mt-[9px] h-1 w-1 flex-none rounded-full bg-gold-300/70" />
            <span className="min-w-0 leading-6">
              {renderInline(line.replace(/^\s*[-*]\s+/, ""), `u${blocks.length}-${li}`)}
            </span>
          </li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const line of lines) {
    if (/^\s*[-*]\s+/.test(line)) {
      flushPara();
      list.push(line);
    } else if (line.trim() === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return <div className="space-y-2">{blocks}</div>;
}

function ThinkingLine() {
  const [i, setI] = useState(() => Math.floor(Math.random() * THINKING_PHRASES.length));
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % THINKING_PHRASES.length), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-2 px-1 py-1 text-sm text-cream/50">
      <span className="inline-flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-300/70 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-300/70 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-300/70" />
      </span>
      <span className="animate-pulse">{THINKING_PHRASES[i]} …</span>
    </div>
  );
}

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
    <div className="chat-root fixed bottom-5 right-5 z-[110] sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-3 flex h-[min(680px,calc(100vh-7rem))] w-[calc(100vw-2.5rem)] max-w-[390px] flex-col overflow-hidden rounded-xl border border-gold-300/25 bg-obsidian/95 shadow-[0_24px_90px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-gold-300/15 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-gold-300/20 bg-obsidian">
                <Image
                  src="/favicon.png"
                  alt="AI Goldmining"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
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
                  className={`max-w-[88%] rounded-lg px-3.5 py-2.5 text-sm leading-6 ${
                    message.role === "user"
                      ? "whitespace-pre-wrap bg-gold-300 text-obsidian"
                      : "border border-white/10 bg-white/[0.04] text-cream/85"
                  }`}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <ChatMessageBody content={message.content} />
                  )}
                </div>
              </div>
            ))}
            {loading && <ThinkingLine />}
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
