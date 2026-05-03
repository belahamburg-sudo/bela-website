"use client";

import { CheckCircle2, Loader2, LogIn, Mail, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "./button";

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
          headers: {
            "content-type": "application/json",
          },
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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-300/30 bg-gold-500/10">
          <Mail aria-hidden className="h-6 w-6 text-gold-300" />
        </div>
        <div>
          <p className="font-heading text-xl text-white mb-2">Check deine Inbox</p>
          <p className="text-white/50 leading-relaxed text-sm">
            Wir haben dir einen Bestätigungslink geschickt. Klick den Link und du landest direkt im Onboarding.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <CheckCircle2 aria-hidden className="h-3.5 w-3.5 text-gold-300/60" />
          Kein Spam — nur diese eine E-Mail
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="focus-ring min-h-12 w-full rounded-xl border border-gold-500/15 bg-obsidian/80 px-4 text-white placeholder:text-white/25 transition-colors focus:border-gold-300/60"
          placeholder="du@mail.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="focus-ring min-h-12 w-full rounded-xl border border-gold-500/15 bg-obsidian/80 px-4 text-white placeholder:text-white/25 transition-colors focus:border-gold-300/60"
          placeholder="Mindestens 6 Zeichen"
        />
      </div>
      {status === "error" && message ? (
        <p className="text-sm font-semibold text-red-300">{message}</p>
      ) : null}
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : mode === "login" ? (
          <LogIn aria-hidden className="h-4 w-4" />
        ) : (
          <UserPlus aria-hidden className="h-4 w-4" />
        )}
        {mode === "login" ? "Einloggen" : "Account erstellen"}
      </Button>
    </form>
  );
}
