import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — cinematic mine panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-16 bg-obsidian overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/assets/mine-bg.jpg"
            alt=""
            fill
            className="object-cover object-center"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-obsidian/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-sm bg-gradient-to-br from-gold-200 via-gold-400 to-gold-600" />
            <span className="absolute inset-[1.5px] rounded-sm bg-obsidian" />
            <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-gold-300" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden>
              <path d="M4 20 L12 4 L20 20 Z" />
              <path d="M8 14 L16 14" opacity="0.6" />
            </svg>
          </span>
          <div>
            <p className="font-heading tracking-gta text-lg text-cream">Bela Goldmann</p>
            <p className="gta-label">AI Goldmining</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="eyebrow mb-6">Deine Zentrale</p>
          <h2 className="font-heading tracking-gta leading-none text-cream mb-6" style={{ fontSize: "clamp(2.5rem,4vw,4.5rem)" }}>
            ZURÜCK ZU DEINEN{" "}
            <span className="gold-text">DIGITALEN PRODUKTEN.</span>
          </h2>
          <p className="text-cream/40 text-lg leading-relaxed max-w-md">
            Log dich ein, öffne deine Kurse und baue weiter an deiner digitalen Goldmine.
          </p>
        </div>

        <div className="relative z-10">
          <p className="gta-label opacity-50">
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
              <span className="absolute inset-0 rounded-sm bg-gradient-to-br from-gold-200 to-gold-600" />
              <span className="absolute inset-[1.5px] rounded-sm bg-obsidian" />
              <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-gold-300" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden>
                <path d="M4 20 L12 4 L20 20 Z" />
                <path d="M8 14 L16 14" opacity="0.6" />
              </svg>
            </span>
            <p className="font-heading tracking-gta text-base text-cream">Bela Goldmann</p>
          </div>

          <h1 className="font-heading tracking-gta leading-none text-cream mb-2" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>WILLKOMMEN ZURÜCK</h1>
          <p className="text-cream/40 mb-8">
            Noch kein Account?{" "}
            <Link href="/signup" className="text-gold-300 hover:text-gold-200 transition-colors font-semibold">
              Kostenlos erstellen
            </Link>
          </p>

          <Suspense fallback={<div className="h-48 rounded-sm bg-cream/[0.03] animate-pulse" />}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
