import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ArrowLeft, UserPlus, Zap } from "lucide-react";
import { SignupFlow } from "@/components/signup-flow";
import { SpatialBackground } from "@/components/spatial-background";

const REASONS = [
  "Direkter Einstieg in dein AI-Onboarding",
  "Dein Profil, Ziel und Status werden sauber erfasst",
  "Danach geht es direkt ins Dashboard und in die Kurse",
];

export default function SignupPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-obsidian">
      <SpatialBackground />

      {/* Top nav bar */}
      <header className="relative z-20 border-b border-gold-300/10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
          <Image
            src="/assets/logo-ai-goldmining-3d.png"
            alt="AI Goldmining"
            width={1200}
            height={204}
            className="h-auto w-[150px] sm:w-[190px]"
            priority
          />
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 border border-gold-300/15 bg-white/[0.02] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-cream/50 backdrop-blur-sm transition-all hover:border-gold-300/35 hover:text-cream sm:gap-2 sm:px-4 sm:text-[10px]"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5 sm:h-3.5 sm:w-3.5" aria-hidden />
            <span className="hidden xs:inline">Zur Startseite</span>
            <span className="xs:hidden">Start</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:flex lg:min-h-[calc(100vh-57px)] lg:items-center lg:px-10 lg:py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">

          {/* Left: Hero copy: desktop only */}
          <section className="hidden lg:block max-w-2xl">
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

            <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/45 font-mono">
              Erstelle deinen Account in drei kurzen Schritten und geh direkt in deinen AI-Flow.
            </p>

            <div className="mt-10 grid max-w-lg gap-2">
              {REASONS.map((reason) => (
                <div
                  key={reason}
                  className="tac-corners flex items-start gap-4 border border-gold-300/10 bg-white/[0.02] px-5 py-3.5 backdrop-blur-sm"
                >
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-gold-300/60" aria-hidden />
                  <p className="text-sm leading-relaxed text-cream/55 font-mono">{reason}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 inline-flex items-center gap-3 border border-gold-300/20 bg-gold-300/5 px-5 py-3">
              <div className="h-2 w-2 rounded-full bg-gold-300 shadow-[0_0_8px_rgba(201, 169, 97,0.6)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-300/80">
                Kostenloser Account · Kein Abo · Kein Risiko
              </span>
            </div>

            <div className="mt-10">
              <div className="divider-gold" />
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-cream/20">
                Bela Goldmann · AI Goldmining · Mitglieder-System
              </p>
            </div>
          </section>

          {/* Right: Signup card: full width on mobile */}
          <section className="w-full lg:flex lg:justify-end">
            <div className="tac-panel tac-corners w-full lg:max-w-md shadow-[0_32px_120px_rgba(0,0,0,0.55)]">

              {/* Card header */}
              <div className="border-b border-gold-300/10 px-5 pt-5 pb-4 sm:px-7 sm:pt-7 sm:pb-5">
                <div className="inline-flex items-center gap-2 border border-gold-300/25 bg-gold-300/10 px-3 py-1.5 sm:gap-2.5 sm:px-3.5 sm:py-2">
                  <UserPlus className="h-3 w-3 text-gold-300 sm:h-3.5 sm:w-3.5" aria-hidden />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold-300 sm:text-[10px]">
                    Account erstellen
                  </span>
                </div>

                <h2 className="mt-4 font-heading tracking-gta leading-none text-cream text-3xl sm:mt-5 sm:text-4xl">
                  MISSION
                  <br />
                  <span className="gold-text">STARTEN.</span>
                </h2>

                <p className="mt-2.5 text-sm text-cream/40 font-mono sm:mt-3">
                  Schon registriert?{" "}
                  <Link href="/login" className="font-semibold text-gold-300 transition-colors hover:text-gold-200">
                    Direkt einloggen
                  </Link>
                </p>
              </div>

              {/* Form area */}
              <div className="px-5 py-5 sm:px-7 sm:py-6">
                <Suspense fallback={<div className="h-72 animate-pulse bg-cream/[0.03]" />}>
                  <SignupFlow />
                </Suspense>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
