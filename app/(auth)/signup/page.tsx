import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, UserPlus, Zap } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

const REASONS = [
  "Direkter Einstieg in dein AI-Onboarding",
  "Dein Profil, Ziel und Status werden sauber erfasst",
  "Danach geht es direkt ins Dashboard und in die Kurse",
];

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <div className="relative min-h-screen overflow-hidden">

        {/* Background — slightly cooler, more energetic than login */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_0%,rgba(240,180,41,0.10),transparent_50%),radial-gradient(ellipse_50%_40%_at_80%_100%,rgba(240,180,41,0.06),transparent_50%)]" />
          <div className="absolute left-0 top-0 h-full w-full opacity-[0.05]">
            <Image src="/assets/mine-bg.jpg" alt="" fill className="object-cover object-center" sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-obsidian/90" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(240,180,41,1)_1px,transparent_1px),linear-gradient(90deg,rgba(240,180,41,1)_1px,transparent_1px)] [background-size:60px_60px]" />
        </div>

        {/* Top nav bar */}
        <header className="relative z-20 border-b border-gold-300/8">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
            <Image
              src="/assets/logo-ai-goldmining-tight.png"
              alt="AI Goldmining"
              width={200}
              height={40}
              className="h-auto w-[160px] sm:w-[190px]"
              priority
            />
            <Link
              href="/"
              className="group inline-flex items-center gap-2 border border-gold-300/15 bg-white/[0.02] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cream/50 backdrop-blur-sm transition-all hover:border-gold-300/35 hover:text-cream"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
              Zur Startseite
            </Link>
          </div>
        </header>

        {/* Main content */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-57px)] w-full max-w-7xl items-center px-6 py-12 lg:px-10">
          <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">

            {/* Left: Hero copy */}
            <section className="max-w-2xl">
              <div className="mb-8 inline-flex items-center gap-3">
                <div className="h-px w-8 bg-gold-300/40" />
                <span className="tac-label text-gold-300/60 tracking-[0.3em]">Kostenlos starten</span>
              </div>

              <h1
                className="font-heading tracking-gta leading-[0.9] text-cream"
                style={{ fontSize: "clamp(3rem,5.8vw,6.2rem)" }}
              >
                STARTE DEINE{" "}
                <span className="gold-text-shine">MISSION.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/45 sm:text-lg font-mono">
                Erstelle deinen Account und geh direkt in deinen AI-Flow — Profil, Ziel und Einstieg in einem Schritt.
              </p>

              <div className="mt-10 grid max-w-lg gap-2">
                {REASONS.map((reason) => (
                  <div
                    key={reason}
                    className="tac-corners flex items-start gap-4 border border-gold-300/8 bg-white/[0.02] px-5 py-3.5 backdrop-blur-sm"
                  >
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-gold-300/60" aria-hidden />
                    <p className="text-sm leading-relaxed text-cream/55 font-mono">{reason}</p>
                  </div>
                ))}
              </div>

              {/* Free badge */}
              <div className="mt-8 inline-flex items-center gap-3 border border-gold-300/20 bg-gold-300/5 px-5 py-3">
                <div className="h-2 w-2 rounded-full bg-gold-300 shadow-[0_0_8px_rgba(240,180,41,0.6)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-300/80">
                  Kostenloser Account · Kein Abo · Kein Risiko
                </span>
              </div>

              {/* Divider line */}
              <div className="mt-10 hidden lg:block">
                <div className="divider-gold" />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-cream/20">
                  Bela Goldmann · AI Goldmining · Mitglieder-System
                </p>
              </div>
            </section>

            {/* Right: Signup card */}
            <section className="w-full lg:flex lg:justify-end">
              <div className="tac-panel tac-corners w-full max-w-md shadow-[0_32px_120px_rgba(0,0,0,0.55)]">

                {/* Card header — SIGNUP identity, visually distinct from login */}
                <div className="border-b border-gold-300/10 px-7 pt-7 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2.5 border border-cream/15 bg-white/[0.04] px-3.5 py-2">
                      <UserPlus className="h-3.5 w-3.5 text-cream/60" aria-hidden />
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-cream/60">
                        Account erstellen
                      </span>
                    </div>
                    <Link
                      href="/webinar"
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream/30 transition-colors hover:text-gold-300"
                    >
                      Gratis Webinar
                      <ArrowRight className="h-3 w-3" aria-hidden />
                    </Link>
                  </div>

                  <h2
                    className="mt-5 font-heading tracking-gta leading-none text-cream"
                    style={{ fontSize: "clamp(2rem,3.5vw,2.8rem)" }}
                  >
                    MISSION
                    <br />
                    <span className="gold-text">STARTEN.</span>
                  </h2>

                  <p className="mt-3 text-sm text-cream/40 font-mono">
                    Schon registriert?{" "}
                    <Link href="/login" className="font-semibold text-gold-300 transition-colors hover:text-gold-200">
                      Direkt einloggen
                    </Link>
                  </p>
                </div>

                {/* Form area */}
                <div className="px-7 py-6">
                  <Suspense fallback={<div className="h-48 animate-pulse bg-cream/[0.03]" />}>
                    <AuthForm mode="signup" />
                  </Suspense>
                </div>

                {/* Card footer */}
                <div className="border-t border-gold-300/8 px-7 py-4">
                  <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-cream/20">
                    SSL-verschlüsselt · Kostenlos · Jederzeit kündbar
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
