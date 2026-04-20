"use client";

import { Loader2, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "./button";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

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

      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (result.error) throw result.error;
      localStorage.setItem(
        "ai-goldmining-demo-user",
        JSON.stringify({ email, demo: false, createdAt: new Date().toISOString() })
      );
      router.push(redirect);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Login fehlgeschlagen.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel-surface grid gap-5 rounded-[1.35rem] p-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-cream">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="focus-ring min-h-12 w-full rounded-2xl border border-gold-500/20 bg-obsidian px-4 text-cream"
          placeholder="du@mail.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-cream">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="focus-ring min-h-12 w-full rounded-2xl border border-gold-500/20 bg-obsidian px-4 text-cream"
          placeholder="Mindestens 6 Zeichen"
        />
      </div>
      {message ? <p className="text-sm font-semibold text-red-300">{message}</p> : null}
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn aria-hidden className="h-4 w-4" />
        )}
        {mode === "login" ? "Einloggen" : "Account erstellen"}
      </Button>
      <p className="text-xs leading-6 text-muted">
        Ohne Supabase-Keys läuft dieser Bereich im Demo-Modus und speichert den Login nur lokal im Browser.
      </p>
    </form>
  );
}
