"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { TelegramAccessButton } from "@/components/telegram-access-button";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getTelegramSubscription } from "@/lib/telegram";

type CheckoutResult = {
  url?: string;
  demo?: boolean;
  message?: string;
};

type PlanKey = "monthly" | "yearly";

const PLANS: Record<
  PlanKey,
  { label: string; price: string; compareAt: string; cadence: string; badge: string }
> = {
  monthly: {
    label: "Monatlich",
    price: "9€",
    compareAt: "19€",
    cadence: "/ Monat",
    badge: "Flexibel",
  },
  yearly: {
    label: "Jährlich",
    price: "79€",
    compareAt: "167€",
    cadence: "/ Jahr",
    badge: "3 Monate sparen",
  },
};

const BENEFITS = [
  "Direktes Feedback auf deine Produkte",
  "Exklusive Inhalte & Calls",
  "Umsetzung in der Gruppe",
  "Monatlich neue Kurse",
  "Direkter Chatkontakt zu mir",
  "Jederzeit kündbar"
];

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export function TelegramSubscribeCard() {
  const router = useRouter();
  const [statusLoading, setStatusLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [active, setActive] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanKey>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (hasSupabasePublicEnv()) {
          const supabase = getSupabaseBrowserClient();
          if (supabase) {
            const {
              data: { user }
            } = await supabase.auth.getUser();
            if (user) {
              if (!cancelled) setLoggedIn(true);
              const sub = await getTelegramSubscription(supabase, user.id);
              if (sub && !cancelled) {
                setActive(sub.active);
                setCurrentPeriodEnd(sub.currentPeriodEnd);
              }
            }
          }
        } else if (typeof window !== "undefined") {
          const demoUser = localStorage.getItem("ai-goldmining-demo-user");
          if (demoUser && !cancelled) setLoggedIn(true);
        }
      } catch {
        // Status is best-effort; fall back to the logged-out CTA.
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function startCheckout() {
    if (!loggedIn) {
      router.push("/login?redirect=/bibliothek");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/telegram/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const result = (await response.json()) as CheckoutResult;

      if (!response.ok) {
        setError(result.message || "Checkout konnte nicht gestartet werden.");
        return;
      }

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      setError("Kein Checkout-Link erhalten. Bitte versuche es erneut.");
    } catch {
      setError("Verbindungsfehler. Bitte prüfe deine Internetverbindung und versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  const renewal = active && currentPeriodEnd ? formatDate(currentPeriodEnd) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group relative overflow-hidden border border-gold-300/30 bg-gradient-to-br from-gold-300/[0.10] via-ink/70 to-ink/50 backdrop-blur-xl"
    >
      {/* glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-300/15 blur-[100px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/40 to-transparent" />

      <div className="relative grid items-center gap-8 p-7 md:grid-cols-[1.5fr_1fr] md:p-10">
        {/* Copy */}
        <div>
          <div className="mb-4 inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold-300">
            <Crown className="h-3 w-3 fill-current" />
            VIP Community
          </div>
          <h2 className="font-heading text-3xl leading-none tracking-gta text-cream md:text-4xl">
            VIP <span className="gold-text">Telegram.</span>
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/50">
            Exklusive Paid Community mit direktem Draht. Echtes Feedback, Live-Calls und
            Umsetzung Schulter an Schulter.
          </p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-[12px] text-cream/60">
                <Check className="h-3.5 w-3.5 flex-none text-gold-300" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Price + CTA */}
        <div className="md:border-l md:border-white/10 md:pl-8">
          {active ? (
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">
                <Sparkles className="h-3.5 w-3.5" />
                VIP aktiv
              </span>
              {renewal ? (
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/35">
                  Verlängert sich am {renewal}
                </p>
              ) : null}
              <TelegramAccessButton active className="w-full" />
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <span className="block text-[8px] font-mono uppercase tracking-[0.2em] text-cream/30">
                  Mitgliedschaft
                </span>
                <span className="flex flex-wrap items-end gap-x-2 gap-y-1">
                  <span className="font-heading text-2xl leading-none text-cream/35 line-through decoration-cream/25">
                    {PLANS[plan].compareAt}
                  </span>
                  <span className="gold-text font-heading text-5xl leading-none">{PLANS[plan].price}</span>
                  <span className="mb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/40">
                    {PLANS[plan].cadence}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PLANS) as PlanKey[]).map((key) => {
                  const selected = plan === key;
                  const current = PLANS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPlan(key)}
                      className={`border px-3 py-3 text-left transition-all ${
                        selected
                          ? "border-gold-300/55 bg-gold-300/[0.10] text-cream"
                          : "border-white/10 bg-white/[0.02] text-cream/45 hover:border-gold-300/30"
                      }`}
                    >
                      <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.16em]">
                        {current.label}
                      </span>
                      <span className={`mt-1 block text-[8px] font-bold uppercase tracking-[0.14em] ${selected ? "text-gold-300/80" : "text-cream/25"}`}>
                        {current.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={startCheckout}
                disabled={loading || statusLoading}
                className="btn-shimmer focus-ring relative flex w-full items-center justify-center gap-2.5 bg-gold-gradient px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-obsidian transition-all hover:brightness-110 hover:shadow-[0_0_40px_rgba(201, 169, 97,0.25)] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown aria-hidden className="h-4 w-4" />
                )}
                {loggedIn ? `Beitreten · ${PLANS[plan].price} ${PLANS[plan].cadence}` : "Beitreten"}
              </button>

              {error ? (
                <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
                  {error}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
