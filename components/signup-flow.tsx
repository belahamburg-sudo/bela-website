"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Step = 1 | 2;

const STEPS: { id: Step; label: string; icon: any }[] = [
  { id: 1, label: "Profil", icon: User },
  { id: 2, label: "Passwort", icon: Lock },
];

const STRENGTH_LABELS = ["Zu kurz", "Schwach", "Solide", "Stark"];
const STRENGTH_COLORS = [
  "bg-red-400/70",
  "bg-amber-400/70",
  "bg-gold-300/80",
  "bg-emerald-400/80",
];

function passwordStrength(pw: string): number {
  if (pw.length < 6) return 0;
  let score = 1;
  if (pw.length >= 10) score++;
  if (/[0-9]/.test(pw) && /[a-zA-Z]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};

const inputClass =
  "focus-ring min-h-12 w-full border border-gold-300/15 bg-black/40 px-4 text-cream placeholder:text-cream/20 transition-colors focus:border-gold-300/50 focus:bg-black/60 outline-none";

const labelClass =
  "mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300/70";

export function SignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/db/onboarding";

  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const nameValid = name.trim().length >= 2;
  const cityValid = city.trim().length >= 2;
  const emailValid = EMAIL_RE.test(email.trim());
  const strength = passwordStrength(password);
  const pwValid = password.length >= 6;
  const confirmValid = confirm.length > 0 && confirm === password;

  function go(next: Step) {
    setDirection(next > step ? 1 : -1);
    setStatus("idle");
    setMessage("");
    setStep(next);
  }

  function friendlyError(error: unknown): string {
    if (!(error instanceof Error)) return "Registrierung fehlgeschlagen.";
    const lower = (error.message || "").toLowerCase();
    if (lower.includes("already") || lower.includes("registered")) {
      return "Diese E-Mail ist bereits registriert. Log dich stattdessen ein.";
    }
    return error.message;
  }

  async function submitAccount() {
    setStatus("loading");
    setMessage("");
    try {
      if (!hasSupabasePublicEnv()) {
        localStorage.setItem(
          "ai-goldmining-demo-user",
          JSON.stringify({ email, name, city, demo: true, createdAt: new Date().toISOString() })
        );
        router.push(redirect);
        return;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, city, email, password }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || "Registrierung fehlgeschlagen.");

      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase ist noch nicht konfiguriert.");

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      router.push(redirect);
    } catch (error) {
      setStatus("error");
      setMessage(friendlyError(error));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    if (step === 1) {
      if (!nameValid) {
        setStatus("error");
        setMessage("Bitte gib deinen Namen ein.");
        return;
      }
      if (!emailValid) {
        setStatus("error");
        setMessage("Bitte gib eine gültige E-Mail-Adresse ein.");
        return;
      }
      if (!cityValid) {
        setStatus("error");
        setMessage("Bitte gib deine Stadt ein.");
        return;
      }
      go(2);
      return;
    }

    if (!pwValid) {
      setStatus("error");
      setMessage("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (!confirmValid) {
      setStatus("error");
      setMessage("Die Passwörter stimmen nicht überein.");
      return;
    }
    void submitAccount();
  }

  const loading = status === "loading";

  return (
    <div>
      {/* Step rail */}
      <div className="mb-7 flex items-center justify-between">
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center border transition-all duration-300 ${
                    active
                      ? "border-gold-300/60 bg-gold-300/15 text-gold-300 shadow-[0_0_18px_rgba(201, 169, 97,0.25)]"
                      : done
                        ? "border-gold-300/40 bg-gold-300/10 text-gold-300"
                        : "border-white/10 bg-white/[0.02] text-cream/30"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`text-[8px] font-bold uppercase tracking-[0.16em] transition-colors ${
                    active ? "text-gold-300/80" : done ? "text-cream/40" : "text-cream/20"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="mx-2 h-px flex-1 self-start mt-[18px] bg-white/10">
                  <div
                    className={`h-full bg-gold-gradient transition-all duration-500 ${
                      step > s.id ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.26, ease: "easeOut" }}
              className="grid gap-4"
            >
              <div>
                <p className="font-heading text-lg uppercase tracking-gta text-cream">
                  Dein Profil
                </p>
                <p className="mt-1 text-[12px] text-cream/40 font-mono">
                  Damit wir dich zu deiner Goldmine und passenden Leuten in deiner Nähe führen.
                </p>
              </div>
              <div>
                <label htmlFor="su-name" className={labelClass}>
                  Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-300/35" />
                  <input
                    id="su-name"
                    name="name"
                    type="text"
                    autoFocus
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputClass} pl-11`}
                    placeholder="Dein Vorname"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="su-email" className={labelClass}>
                  E-Mail
                </label>
                <input
                  id="su-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="du@mail.com"
                />
              </div>
              <div>
                <label htmlFor="su-city" className={labelClass}>
                  Stadt
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-300/35" />
                  <input
                    id="su-city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`${inputClass} pl-11`}
                    placeholder="z.B. Hamburg"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.26, ease: "easeOut" }}
              className="grid gap-4"
            >
              <div>
                <p className="font-heading text-lg uppercase tracking-gta text-cream">
                  Sicheres Passwort
                </p>
                <p className="mt-1 text-[12px] text-cream/40 font-mono">
                  Mindestens 6 Zeichen. Stärker = besser geschützt.
                </p>
              </div>
              <div>
                <label htmlFor="su-pw" className={labelClass}>
                  Passwort
                </label>
                <div className="relative">
                  <input
                    id="su-pw"
                    name="password"
                    type={showPw ? "text" : "password"}
                    autoFocus
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                    placeholder="Mindestens 6 Zeichen"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-cream/35 transition-colors hover:text-gold-300"
                    aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-2.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i < strength ? STRENGTH_COLORS[strength - 1] : "bg-white/[0.07]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-cream/35">
                      {STRENGTH_LABELS[Math.max(strength - 1, 0)]}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="su-pw2" className={labelClass}>
                  Passwort bestätigen
                </label>
                <input
                  id="su-pw2"
                  name="confirm"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                  placeholder="Passwort wiederholen"
                />
                {confirm.length > 0 && (
                  <p
                    className={`mt-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] ${
                      confirmValid ? "text-emerald-300/80" : "text-red-300/80"
                    }`}
                  >
                    {confirmValid ? (
                      <>
                        <Check className="h-3 w-3" /> Passwörter stimmen überein
                      </>
                    ) : (
                      "Passwörter stimmen noch nicht überein"
                    )}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {status === "error" && message ? (
          <div className="border border-red-400/20 bg-red-400/5 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-300">
              {message}
            </p>
          </div>
        ) : null}

        <div className="mt-1 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => go((step - 1) as Step)}
              disabled={loading}
              className="inline-flex min-h-12 items-center justify-center gap-1.5 border border-gold-300/15 bg-white/[0.02] px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/55 transition-all hover:border-gold-300/35 hover:text-cream disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Zurück
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-shimmer relative flex min-h-12 flex-1 items-center justify-center gap-2.5 bg-gold-gradient px-6 text-[11px] font-bold uppercase tracking-[0.22em] text-obsidian shadow-[0_8px_30px_-8px_rgba(201, 169, 97,0.5)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step < 2 ? (
              <>
                Weiter
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Account erstellen
                <Sparkles className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        <div className="mt-1 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-cream/25">
          <ShieldCheck className="h-3 w-3 text-gold-300/40" />
          Kostenlos · Kein Abo · SSL-verschlüsselt
        </div>
      </form>
    </div>
  );
}
