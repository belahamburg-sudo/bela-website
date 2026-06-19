"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { SpatialBackground } from "@/components/spatial-background";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasSupabasePublicEnv()) {
      setReady(true);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setReady(true);
      return;
    }
    // Supabase parses the recovery token from the URL hash on load and opens a
    // short-lived recovery session; we just need to detect it.
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setHasSession(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase ist nicht konfiguriert.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus("done");
      setTimeout(() => router.push("/db"), 1600);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Passwort konnte nicht geändert werden.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-obsidian px-4 py-16">
      <SpatialBackground />
      <div className="tac-panel tac-corners relative z-10 w-full max-w-md p-6 sm:p-8">
        <div className="mb-5 inline-flex items-center gap-2 border border-gold-300/25 bg-gold-300/10 px-3 py-1.5">
          <Lock className="h-3.5 w-3.5 text-gold-300" aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">
            Neues Passwort
          </span>
        </div>

        {status === "done" ? (
          <div className="grid gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" aria-hidden />
            <p className="font-heading text-2xl uppercase tracking-gta text-cream">Passwort geändert.</p>
            <p className="text-sm font-mono text-cream/50">Du wirst weitergeleitet …</p>
          </div>
        ) : !ready ? (
          <div className="flex items-center gap-2 text-cream/50">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Lädt …
          </div>
        ) : !hasSession ? (
          <div className="grid gap-4">
            <div className="flex items-start gap-2 text-sm text-cream/60">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-300" aria-hidden />
              Dieser Link ist ungültig oder abgelaufen. Fordere einen neuen an.
            </div>
            <Link
              href="/login"
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300/80 hover:text-gold-200"
            >
              Zurück zum Login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4">
            <h1 className="font-heading text-2xl uppercase tracking-gta text-cream">Setz dein neues Passwort.</h1>
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300/70"
              >
                Neues Passwort
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring min-h-12 w-full border border-gold-300/15 bg-black/40 px-4 text-cream placeholder:text-cream/20 outline-none transition-colors focus:border-gold-300/50 focus:bg-black/60"
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
              className="btn-shimmer mt-1 flex w-full items-center justify-center gap-2.5 bg-gold-gradient px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-obsidian transition-all hover:brightness-110 disabled:opacity-50"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Lock className="h-4 w-4" aria-hidden />
              )}
              Passwort speichern
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
