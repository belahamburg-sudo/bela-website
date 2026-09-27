"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Link2, Loader2 } from "lucide-react";

type LinkState = {
  configured: boolean;
  url?: string;
  linked?: boolean;
  telegramUsername?: string | null;
};

export function TelegramAccessButton({
  active,
  className = "",
  compact = false,
}: {
  active: boolean;
  className?: string;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<LinkState>({ configured: false });

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/telegram/link");
        const data = (await response.json()) as LinkState & { message?: string };
        if (!cancelled) {
          setLink(data.configured ? data : { configured: false });
        }
      } catch {
        if (!cancelled) setLink({ configured: false });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [active]);

  if (!active) return null;

  if (loading) {
    return (
      <span className={`inline-flex items-center justify-center gap-2 text-cream/40 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {!compact ? "Telegram wird geladen…" : null}
      </span>
    );
  }

  if (!link.configured || !link.url) {
    return (
      <div className={className}>
        <p className="text-center text-[11px] leading-relaxed text-cream/40">
          Telegram-Zugang temporär nicht verfügbar.{" "}
          <a
            href="https://t.me/belagoldmann"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-300 underline-offset-2 hover:underline"
          >
            Support kontaktieren
          </a>
        </p>
      </div>
    );
  }

  const label = link.linked ? "VIP-Einladung holen" : "Telegram verbinden";

  return (
    <div className={className}>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-shimmer focus-ring relative flex w-full items-center justify-center gap-2.5 bg-gold-gradient px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-obsidian transition-all hover:brightness-110 hover:shadow-[0_0_40px_rgba(201,169,97,0.25)] active:scale-[0.98]"
      >
        <Link2 className="h-4 w-4" />
        {label}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      {link.linked && link.telegramUsername ? (
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-cream/35">
          Verbunden als @{link.telegramUsername}
        </p>
      ) : (
        <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/40">
          Verbinde dein Telegram-Konto, damit der Zugang nur bei aktivem Abo freigegeben wird.
        </p>
      )}
    </div>
  );
}
