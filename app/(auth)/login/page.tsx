import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LogIn } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

const REASONS = [
  "Zugriff auf deine freigeschalteten Kurse",
  "Fortschritt, Profil und Onboarding an einem Ort",
  "Direkter Weg zurück in die Umsetzung",
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <div className="relative min-h-screen overflow-hidden">

        {/* Background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(240,180,41,0.13),transparent_55%)]" />
          <div className="absolute left-0 top-0 h-full w-full opacity-[0.06]">
            <Image src="/assets/mine-bg.jpg" alt="" fill className="object-cover object-center" sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-obsidian/88" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(240,180,41,1)_1px,transparent_1px),linear-gradient(90deg,rgba(240,180,41,1)_1px,transparent_1px)] [background-size:60px_60px]" />
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
                <span className="tac-label text-gold-300/60 tracking-[0.3em]">Mitglieder-Zugang</span>
              </div>

              <h1
                className="font-heading tracking-gta leading-[0.9] text-cream"
                style={{ fontSize: "clamp(3rem,5.8vw,6.2rem)" }}
              >
                ZURÜCK IN DEIN{" "}
                <span className="gold-text-shine">SYSTEM.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/45 sm:text-lg font-mono">
                Alles wartet auf dich — deine Kurse, dein Fortschritt, dein nächster Schritt.
              </p>

              <div className="mt-10 grid max-w-lg gap-2">
                {REASONS.map((reason) => (
                  <div
                    key={reason}
                    className="tac-corners flex items-start gap-4 border border-gold-300/8 bg-white/[0.02] px-5 py-3.5 backdrop-blur-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-300/60" aria-hidden />
                    <p className="text-sm leading-relaxed text-cream/55 font-mono">{reason}</p>
                  </div>
                ))}
              </div>

              {/* Divider line */}
              <div className="mt-12 hidden lg:block">
                <div className="divider-gold" />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-cream/20">
                  Bela Goldmann · AI Goldmining · Mitglieder-System
                </p>
              </div>
            </section>

            {/* Right: Login card */}
            <section className="w-full lg:flex lg:justify-end">
              <div className="tac-panel tac-corners w-full max-w-md shadow-[0_32px_120px_rgba(0,0,0,0.55)]">

                {/* Card header — LOGIN identity */}
                <div className="border-b border-gold-300/10 px-7 pt-7 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2.5 border border-gold-300/25 bg-gold-300/10 px-3.5 py-2">
                      <LogIn className="h-3.5 w-3.5 text-gold-300" aria-hidden />
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-300">
                        Mitglied Login
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
                    WILLKOMMEN
                    <br />
                    <span className="gold-text">ZURÜCK.</span>
                  </h2>

                  <p className="mt-3 text-sm text-cream/40 font-mono">
                    Noch kein Account?{" "}
                    <Link href="/signup" className="font-semibold text-gold-300 transition-colors hover:text-gold-200">
                      Kostenlos registrieren
                    </Link>
                  </p>
                </div>

                {/* Form area */}
                <div className="px-7 py-6">
                  <Suspense fallback={<div className="h-48 animate-pulse bg-cream/[0.03]" />}>
                    <AuthForm mode="login" />
                  </Suspense>
                </div>

                {/* Card footer */}
                <div className="border-t border-gold-300/8 px-7 py-4">
                  <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-cream/20">
                    SSL-verschlüsselt · Sichere Verbindung
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
