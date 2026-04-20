import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-16 bg-obsidian overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-300/[0.08] blur-[120px]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-gold-500/[0.04] blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-200 to-gold-700" />
              <span className="absolute inset-[1px] rounded-[11px] bg-obsidian" />
              <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-gold-300" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 20 L12 4 L20 20 Z" />
                <path d="M8 14 L16 14" opacity="0.6" />
              </svg>
            </span>
            <div>
              <p className="font-heading text-lg text-white">Bela Goldmann</p>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-300">AI Goldmining</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="eyebrow mb-6">Jetzt starten</p>
          <h2 className="font-heading text-5xl leading-[1.05] text-white mb-6">
            Starte deine{" "}
            <em className="gold-text not-italic">digitale Goldmine.</em>
          </h2>
          <p className="text-white/40 text-lg leading-relaxed max-w-md">
            Erstelle deinen Account und erhalte Zugang zu den Kursen, Tools und der Community.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-white/20 text-sm">
            © {new Date().getFullYear()} Bela Goldmann · AI Goldmining
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col items-center justify-center px-6 py-16 lg:px-16 bg-obsidian">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-gold-200 to-gold-700" />
              <span className="absolute inset-[1px] rounded-[7px] bg-obsidian" />
              <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-gold-300" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 20 L12 4 L20 20 Z" />
                <path d="M8 14 L16 14" opacity="0.6" />
              </svg>
            </span>
            <p className="font-heading text-base text-white">Bela Goldmann</p>
          </div>

          <h1 className="font-heading text-3xl text-white mb-2">Account erstellen</h1>
          <p className="text-white/40 mb-8">
            Schon registriert?{" "}
            <Link href="/login" className="text-gold-300 hover:text-gold-100 transition-colors">
              Einloggen
            </Link>
          </p>

          <Suspense fallback={<div className="h-48 rounded-2xl bg-white/[0.03] animate-pulse" />}>
            <AuthForm mode="signup" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
