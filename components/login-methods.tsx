"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserIdentity } from "@supabase/supabase-js";
import { Check, Link2, Loader2, MessageSquare, Phone, ShieldCheck, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { hasSupabasePublicEnv } from "@/lib/env";

/** Official multi-colour Google "G". */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

/** GitHub mark (monochrome). */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.405c1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/** Strip everything but digits and a leading +. */
function normalizePhone(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? "+" + cleaned.slice(1).replace(/\+/g, "") : cleaned;
}

type Loaded = {
  email: string | null;
  phone: string | null;
  identities: UserIdentity[];
};

const cardRow =
  "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3.5";

const connectedPill =
  "inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-300/90";

const linkBtn =
  "inline-flex items-center gap-2 rounded-full bg-gold-gradient px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-obsidian transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

const ghostBtn =
  "inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-cream/55 transition hover:border-white/30 hover:text-cream/85 disabled:cursor-not-allowed disabled:opacity-50";

const inputClass =
  "focus-ring min-h-11 w-full border border-gold-300/15 bg-black/40 px-3.5 text-cream placeholder:text-cream/20 outline-none transition-colors focus:border-gold-300/50 focus:bg-black/60";

export function LoginMethods() {
  const [data, setData] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Per-action state.
  const [pending, setPending] = useState<string | null>(null); // "google" | "unlink:google" | …
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionOk, setActionOk] = useState<string | null>(null);

  // Phone add sub-flow.
  const [phoneStage, setPhoneStage] = useState<"idle" | "enter" | "code">("idle");
  const [phoneInput, setPhoneInput] = useState("");
  const [codeInput, setCodeInput] = useState("");

  const load = useCallback(async () => {
    const supabase = hasSupabasePublicEnv() ? getSupabaseBrowserClient() : null;
    if (!supabase) {
      setLoadError("Login ist noch nicht konfiguriert.");
      return;
    }
    const [{ data: userData }, { data: identData, error: identErr }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.getUserIdentities(),
    ]);
    if (identErr) {
      setLoadError("Anmeldemethoden konnten nicht geladen werden.");
      return;
    }
    setData({
      email: userData.user?.email ?? null,
      phone: userData.user?.phone ?? null,
      identities: identData?.identities ?? [],
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const identityFor = (provider: string) => data?.identities.find((i) => i.provider === provider);
  const hasGoogle = Boolean(identityFor("google"));
  const hasGithub = Boolean(identityFor("github"));
  const hasPhone = Boolean(identityFor("phone") || data?.phone);
  const hasEmail = Boolean(identityFor("email") || data?.email);
  const methodCount = [hasEmail, hasGoogle, hasGithub, hasPhone].filter(Boolean).length;

  function resetMessages() {
    setActionError(null);
    setActionOk(null);
  }

  async function linkOAuth(provider: "google" | "github") {
    resetMessages();
    const supabase = hasSupabasePublicEnv() ? getSupabaseBrowserClient() : null;
    if (!supabase) return;
    setPending(provider);
    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/profil` },
    });
    // On success the browser redirects to the provider; we only reach here on error.
    if (error) {
      setPending(null);
      const label = provider === "google" ? "Google" : "GitHub";
      setActionError(
        /manual linking/i.test(error.message)
          ? "Konto-Verknüpfung ist im Backend noch nicht aktiviert. (Supabase → Auth → „Manual linking“ einschalten.)"
          : `${label} konnte nicht verknüpft werden. Bitte erneut versuchen.`
      );
    }
  }

  async function unlink(provider: "google" | "github" | "phone") {
    resetMessages();
    const identity = identityFor(provider);
    if (!identity) return;
    if (methodCount <= 1) {
      setActionError("Du brauchst mindestens eine Anmeldemethode.");
      return;
    }
    const supabase = hasSupabasePublicEnv() ? getSupabaseBrowserClient() : null;
    if (!supabase) return;
    setPending(`unlink:${provider}`);
    const { error } = await supabase.auth.unlinkIdentity(identity);
    setPending(null);
    if (error) {
      setActionError("Verknüpfung konnte nicht entfernt werden.");
      return;
    }
    setActionOk(
      provider === "google"
        ? "Google entfernt."
        : provider === "github"
          ? "GitHub entfernt."
          : "Telefonnummer entfernt."
    );
    await load();
  }

  async function sendPhoneCode() {
    resetMessages();
    const normalized = normalizePhone(phoneInput);
    if (!normalized.startsWith("+") || normalized.length < 8) {
      setActionError("Bitte Nummer mit Ländervorwahl eingeben, z. B. +49 170 1234567.");
      return;
    }
    const supabase = hasSupabasePublicEnv() ? getSupabaseBrowserClient() : null;
    if (!supabase) return;
    setPending("phone-send");
    const { error } = await supabase.auth.updateUser({ phone: normalized });
    setPending(null);
    if (error) {
      setActionError(
        /already|registered|exists/i.test(error.message)
          ? "Diese Nummer ist bereits einem Konto zugeordnet."
          : "Der Code konnte nicht gesendet werden. Prüfe die Nummer."
      );
      return;
    }
    setPhoneInput(normalized);
    setPhoneStage("code");
  }

  async function verifyPhoneCode() {
    resetMessages();
    const token = codeInput.replace(/\D/g, "");
    if (token.length < 4) {
      setActionError("Bitte den Code aus der SMS eingeben.");
      return;
    }
    const supabase = hasSupabasePublicEnv() ? getSupabaseBrowserClient() : null;
    if (!supabase) return;
    setPending("phone-verify");
    const { error } = await supabase.auth.verifyOtp({
      phone: phoneInput,
      token,
      type: "phone_change",
    });
    setPending(null);
    if (error) {
      setActionError("Der Code ist nicht korrekt oder abgelaufen.");
      return;
    }
    setPhoneStage("idle");
    setPhoneInput("");
    setCodeInput("");
    setActionOk("Telefonnummer verknüpft. Du kannst dich jetzt per SMS anmelden.");
    await load();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink/40 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm font-bold text-gold-200">
        <ShieldCheck className="h-4 w-4" />
        Anmeldemethoden
      </div>
      <p className="mt-2 text-sm text-cream/50">
        Verknüpfe mehrere Wege, dich anzumelden — E-Mail, Google und Telefon. Danach kommst du
        über jeden verknüpften Weg in dein Konto.
      </p>

      {loadError ? (
        <p className="mt-4 text-xs text-red-400">{loadError}</p>
      ) : !data ? (
        <div className="mt-5 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-cream/40">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Lade …
        </div>
      ) : (
        <div className="mt-5 grid gap-2.5">
          {/* Email */}
          <div className={cardRow}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-cream/85">
                E-Mail
              </div>
              <p className="mt-0.5 truncate text-xs text-cream/45">{data.email ?? "—"}</p>
            </div>
            <span className={connectedPill}>
              <Check className="h-3.5 w-3.5" /> Verbunden
            </span>
          </div>

          {/* Google */}
          <div className={cardRow}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-cream/85">
                <GoogleIcon className="h-4 w-4" /> Google
              </div>
              <p className="mt-0.5 truncate text-xs text-cream/45">
                {hasGoogle ? (identityFor("google")?.identity_data?.email ?? "Verknüpft") : "Nicht verknüpft"}
              </p>
            </div>
            {hasGoogle ? (
              <span className="flex items-center gap-3">
                <span className={connectedPill}>
                  <Check className="h-3.5 w-3.5" /> Verbunden
                </span>
                {methodCount > 1 ? (
                  <button type="button" onClick={() => unlink("google")} disabled={pending !== null} className={ghostBtn}>
                    {pending === "unlink:google" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Trennen
                  </button>
                ) : null}
              </span>
            ) : (
              <button type="button" onClick={() => linkOAuth("google")} disabled={pending !== null} className={linkBtn}>
                {pending === "google" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                Verknüpfen
              </button>
            )}
          </div>

          {/* GitHub */}
          <div className={cardRow}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-cream/85">
                <GitHubIcon className="h-4 w-4 text-cream" /> GitHub
              </div>
              <p className="mt-0.5 truncate text-xs text-cream/45">
                {hasGithub ? (identityFor("github")?.identity_data?.user_name ?? "Verknüpft") : "Nicht verknüpft"}
              </p>
            </div>
            {hasGithub ? (
              <span className="flex items-center gap-3">
                <span className={connectedPill}>
                  <Check className="h-3.5 w-3.5" /> Verbunden
                </span>
                {methodCount > 1 ? (
                  <button type="button" onClick={() => unlink("github")} disabled={pending !== null} className={ghostBtn}>
                    {pending === "unlink:github" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Trennen
                  </button>
                ) : null}
              </span>
            ) : (
              <button type="button" onClick={() => linkOAuth("github")} disabled={pending !== null} className={linkBtn}>
                {pending === "github" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                Verknüpfen
              </button>
            )}
          </div>

          {/* Phone */}
          <div className={`${cardRow} ${phoneStage !== "idle" ? "!flex-col !items-stretch" : ""}`}>
            <div className="flex w-full items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-cream/85">
                  <Phone className="h-4 w-4 text-gold-300" /> Telefon
                </div>
                <p className="mt-0.5 truncate text-xs text-cream/45">
                  {hasPhone ? (data.phone ?? "Verknüpft") : "Nicht verknüpft"}
                </p>
              </div>
              {hasPhone ? (
                <span className="flex items-center gap-3">
                  <span className={connectedPill}>
                    <Check className="h-3.5 w-3.5" /> Verbunden
                  </span>
                  {methodCount > 1 ? (
                    <button type="button" onClick={() => unlink("phone")} disabled={pending !== null} className={ghostBtn}>
                      {pending === "unlink:phone" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      Trennen
                    </button>
                  ) : null}
                </span>
              ) : phoneStage === "idle" ? (
                <button type="button" onClick={() => { resetMessages(); setPhoneStage("enter"); }} disabled={pending !== null} className={linkBtn}>
                  <Link2 className="h-3.5 w-3.5" /> Hinzufügen
                </button>
              ) : null}
            </div>

            {phoneStage === "enter" ? (
              <div className="mt-3 grid gap-2.5 sm:grid-cols-[1fr_auto]">
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+49 170 1234567"
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={sendPhoneCode} disabled={pending !== null} className={linkBtn}>
                    {pending === "phone-send" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
                    Code senden
                  </button>
                  <button type="button" onClick={() => { setPhoneStage("idle"); resetMessages(); }} className={ghostBtn}>
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : null}

            {phoneStage === "code" ? (
              <div className="mt-3 grid gap-2.5 sm:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="6-stelliger SMS-Code"
                  className={`${inputClass} tracking-[0.3em]`}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={verifyPhoneCode} disabled={pending !== null} className={linkBtn}>
                    {pending === "phone-verify" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Bestätigen
                  </button>
                  <button type="button" onClick={() => { setPhoneStage("enter"); setCodeInput(""); resetMessages(); }} className={ghostBtn}>
                    Nummer ändern
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {actionError ? <p className="text-xs text-red-400">{actionError}</p> : null}
          {actionOk ? <p className="text-xs text-emerald-300/90">{actionOk}</p> : null}
        </div>
      )}
    </div>
  );
}
