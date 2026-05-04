"use client";

import { CheckCircle2, Loader2, LogIn, Mail, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "confirm_email">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRedirect = mode === "signup" ? "/dashboard/onboarding" : "/dashboard";
  const redirect = searchParams.get("redirect") || defaultRedirect;

  function friendlyErrorMessage(error: unknown) {
    if (!(error instanceof Error)) {
      return mode === "login" ? "Login fehlgeschlagen." : "Registrierung fehlgeschlagen.";
    }

    const raw = error.message || "";
    const lower = raw.toLowerCase();

    if (lower.includes("invalid login credentials")) {
      return "E-Mail oder Passwort sind nicht korrekt.";
    }

    if (lower.includes("already registered")) {
      return "Diese E-Mail ist bereits registriert. Log dich stattdessen ein.";
    }

    if (lower.includes("error sending confirmation email")) {
      return "Die Bestätigungs-Mail konnte nicht versendet werden. Die Registrierung läuft jetzt ohne E-Mail-Bestätigung über unseren Server-Fallback.";
    }

    return raw;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      if (!hasSupabasePublicEnv()) {
        localStorage.setItem(
          "ai-goldmining-demo-user",
          JSON.stringify({ email, demo: true, createdAt: new Date().toISOString() })
        );
        router.push(redirect);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase ist noch nicht konfiguriert.");

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirect);
      } else {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string; mode?: string } | null;
        if (!response.ok) {
          throw new Error(payload?.error || "Registrierung fehlgeschlagen.");
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (payload?.mode === "login") {
          router.push(redirect);
        } else {
          setStatus("confirm_email");
        }
      }
    } catch (error) {
      setStatus("error");
      setMessage(friendlyErrorMessage(error));
    }
  }

  if (status === "confirm_email") {
    return (
      <div className="grid gap-5">
        <div className="flex h-12 w-12 items-center justify-center border border-gold-300/30 bg-gold-300/10">
          <Mail aria-hidden className="h-5 w-5 text-gold-300" />
        </div>
        <div>
          <p className="font-heading text-xl uppercase tracking-gta text-cream mb-2">Check deine Inbox</p>
          <p className="text-cream/50 leading-relaxed text-sm font-mono">
            Wir haben dir einen Bestätigungslink geschickt. Klick den Link und du landest direkt im Onboarding.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/25">
          <CheckCircle2 aria-hidden className="h-3 w-3 text-gold-300/60" />
          Kein Spam: nur diese eine E-Mail
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300/70">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="focus-ring min-h-12 w-full border border-gold-300/15 bg-black/40 px-4 text-cream placeholder:text-cream/20 transition-colors focus:border-gold-300/50 focus:bg-black/60 outline-none"
          placeholder="du@mail.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300/70">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="focus-ring min-h-12 w-full border border-gold-300/15 bg-black/40 px-4 text-cream placeholder:text-cream/20 transition-colors focus:border-gold-300/50 focus:bg-black/60 outline-none"
          placeholder="Mindestens 6 Zeichen"
        />
      </div>

      {status === "error" && message ? (
        <div className="border border-red-400/20 bg-red-400/5 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-300">{message}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-shimmer relative mt-2 flex w-full items-center justify-center gap-2.5 bg-gradient-to-b from-gold-200 to-gold-400 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-obsidian shadow-[0_8px_30px_-8px_rgba(160,107,0,0.7)] transition-all hover:from-gold-100 hover:to-gold-300 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
      >
        {status === "loading" ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : mode === "login" ? (
          <LogIn aria-hidden className="h-4 w-4" />
        ) : (
          <UserPlus aria-hidden className="h-4 w-4" />
        )}
        {mode === "login" ? "Einloggen" : "Account erstellen"}
      </button>
    </form>
  );
}
