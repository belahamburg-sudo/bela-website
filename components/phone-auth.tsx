"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageSquare, Phone } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { hasSupabasePublicEnv } from "@/lib/env";

const inputClass =
  "focus-ring min-h-12 w-full border border-gold-300/15 bg-black/40 px-4 text-cream placeholder:text-cream/20 outline-none transition-colors focus:border-gold-300/50 focus:bg-black/60";

const labelClass =
  "mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300/70";

const submitClass =
  "btn-shimmer relative mt-1 flex w-full items-center justify-center gap-2.5 bg-gold-gradient px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-obsidian transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

/** Strip everything but digits and a leading +. */
function normalizePhone(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? "+" + cleaned.slice(1).replace(/\+/g, "") : cleaned;
}

/**
 * Phone (SMS one-time-code) login via Supabase. Two stages: enter number →
 * enter the 6-digit code. On success the user lands on `redirect`.
 */
export function PhoneAuth({
  redirect = "/dashboard",
  onBack,
}: {
  redirect?: string;
  /** Return to the e-mail / social view. */
  onBack?: () => void;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    const normalized = normalizePhone(phone);
    if (!normalized.startsWith("+") || normalized.length < 8) {
      setError("Bitte gib deine Nummer mit Ländervorwahl ein, z. B. +49 170 1234567.");
      return;
    }
    const supabase = hasSupabasePublicEnv() ? getSupabaseBrowserClient() : null;
    if (!supabase) {
      setError("Login ist noch nicht konfiguriert.");
      return;
    }
    setStatus("loading");
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: normalized });
    setStatus("idle");
    if (otpError) {
      setError("Der Code konnte nicht gesendet werden. Prüfe die Nummer und versuch es erneut.");
      return;
    }
    setPhone(normalized);
    setStage("code");
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setError("");
    const token = code.replace(/\D/g, "");
    if (token.length < 4) {
      setError("Bitte gib den Code aus der SMS ein.");
      return;
    }
    const supabase = hasSupabasePublicEnv() ? getSupabaseBrowserClient() : null;
    if (!supabase) {
      setError("Login ist noch nicht konfiguriert.");
      return;
    }
    setStatus("loading");
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (verifyError) {
      setStatus("idle");
      setError("Der Code ist nicht korrekt oder abgelaufen. Bitte erneut anfordern.");
      return;
    }
    router.push(redirect);
  }

  if (stage === "code") {
    return (
      <form onSubmit={verify} className="grid gap-4">
        <div className="flex h-12 w-12 items-center justify-center border border-gold-300/30 bg-gold-300/10">
          <MessageSquare aria-hidden className="h-5 w-5 text-gold-300" />
        </div>
        <p className="text-sm font-mono leading-relaxed text-cream/50">
          Wir haben dir einen Code an <span className="text-cream/80">{phone}</span> geschickt. Gib ihn
          hier ein.
        </p>
        <div>
          <label htmlFor="phone-code" className={labelClass}>
            SMS-Code
          </label>
          <input
            id="phone-code"
            name="phone-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-stelliger Code"
            className={`${inputClass} text-center text-lg tracking-[0.4em]`}
          />
        </div>
        {error ? (
          <div className="border border-red-400/20 bg-red-400/5 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-300">{error}</p>
          </div>
        ) : null}
        <button type="submit" disabled={status === "loading"} className={submitClass}>
          {status === "loading" ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare aria-hidden className="h-4 w-4" />
          )}
          Code bestätigen
        </button>
        <button
          type="button"
          onClick={() => {
            setStage("phone");
            setCode("");
            setError("");
          }}
          className="justify-self-center text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40 transition-colors hover:text-cream/70"
        >
          Nummer ändern
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="grid gap-4">
      <div className="flex h-12 w-12 items-center justify-center border border-gold-300/30 bg-gold-300/10">
        <Phone aria-hidden className="h-5 w-5 text-gold-300" />
      </div>
      <p className="text-sm font-mono leading-relaxed text-cream/50">
        Gib deine Handynummer ein — wir schicken dir einen Code per SMS.
      </p>
      <div>
        <label htmlFor="phone-number" className={labelClass}>
          Telefonnummer
        </label>
        <input
          id="phone-number"
          name="phone-number"
          type="tel"
          autoComplete="tel"
          autoFocus
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+49 170 1234567"
          className={inputClass}
        />
      </div>
      {error ? (
        <div className="border border-red-400/20 bg-red-400/5 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-300">{error}</p>
        </div>
      ) : null}
      <button type="submit" disabled={status === "loading"} className={submitClass}>
        {status === "loading" ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare aria-hidden className="h-4 w-4" />
        )}
        Code per SMS senden
      </button>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="justify-self-center inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40 transition-colors hover:text-cream/70"
        >
          <ArrowLeft aria-hidden className="h-3 w-3" />
          Andere Login-Methode
        </button>
      ) : null}
    </form>
  );
}
