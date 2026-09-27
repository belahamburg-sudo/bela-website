"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

type ConsentValue = "accepted" | "declined";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyConsent(value: ConsentValue) {
  if (typeof window === "undefined" || !window.gtag) return;
  const granted = value === "accepted" ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: granted,
    ad_user_data: granted,
    ad_personalization: granted,
    analytics_storage: granted,
  });
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(value: ConsentValue) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    applyConsent(value);
    window.dispatchEvent(new Event("cookie-consent-updated"));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120]">
      <div className="relative border-t border-gold-300/25 bg-obsidian/95 backdrop-blur-xl shadow-[0_-14px_44px_-16px_rgba(0,0,0,0.85)]">
        {/* gold top hairline */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/60 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(201, 169, 97,0.05), transparent 45%)" }}
          aria-hidden
        />

        <div
          role="dialog"
          aria-label="Cookie-Einstellungen"
          className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-3.5"
        >
          <div className="flex items-center gap-3">
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-gold-300/30 bg-gold-300/5 sm:flex">
              <Cookie className="h-4 w-4 text-gold-300" aria-hidden />
            </span>
            <p className="max-w-3xl text-xs leading-relaxed text-cream/55 sm:text-[0.8rem]">
              Wir nutzen notwendige Cookies für den Betrieb und – mit deiner Zustimmung – Analyse-Cookies
              (Google Analytics und Microsoft Clarity). Mehr in der{" "}
              <Link href="/datenschutz" className="text-gold-300 underline-offset-2 hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => choose("declined")}
              className="flex-1 whitespace-nowrap rounded-full border border-gold-300/30 px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-cream/70 transition-all hover:border-gold-300/60 hover:text-cream sm:flex-none"
            >
              Nur notwendige
            </button>
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="btn-shimmer flex-1 whitespace-nowrap rounded-full bg-gradient-to-b from-gold-600 via-gold-50 to-gold-600 px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-obsidian transition-all hover:brightness-110 shadow-[0_0_18px_rgba(201, 169, 97,0.28)] sm:flex-none"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
