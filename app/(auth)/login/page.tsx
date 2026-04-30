import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(240,180,41,0.08),transparent_32%),linear-gradient(180deg,#120e08_0%,#0a0806_100%)]" />
          <div className="absolute left-0 top-0 h-full w-full opacity-[0.08]">
            <Image
              src="/assets/mine-bg.jpg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-obsidian/86" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 lg:px-10">
          <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="max-w-2xl">
              <Image
                src="/assets/logo-ai-goldmining-tight.png"
                alt="AI Goldmining"
                width={280}
                height={56}
                className="h-auto w-[220px] sm:w-[250px]"
                priority
              />

              <p className="eyebrow mt-10 mb-5">Member Login</p>
              <h1
                className="max-w-xl font-heading tracking-gta leading-[0.92] text-cream"
                style={{ fontSize: "clamp(2.9rem,5.4vw,5.8rem)" }}
              >
                ZURÜCK IN DEIN{" "}
                <span className="gold-text">SYSTEM.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/52 sm:text-lg">
                Log dich ein und geh direkt zurück in deine Kurse, dein Profil und deinen nächsten Schritt.
              </p>

              <div className="mt-8 grid max-w-xl gap-3">
                {REASONS.map((reason) => (
                  <div
                    key={reason}
                    className="flex items-start gap-3 rounded-sm border border-gold-300/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-300/75" aria-hidden />
                    <p className="text-sm leading-relaxed text-cream/68">{reason}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="w-full lg:flex lg:justify-end">
              <div className="w-full max-w-md rounded-sm border border-gold-300/14 bg-[#120e08]/88 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <span className="inline-flex rounded-sm border border-gold-300/18 bg-gold-300/[0.06] px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-gold-300">
                    Login
                  </span>
                  <Link
                    href="/webinar"
                    className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cream/38 transition-colors hover:text-gold-300"
                  >
                    Gratis Webinar
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>

                <h2
                  className="font-heading tracking-gta leading-none text-cream"
                  style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
                >
                  WILLKOMMEN
                  <br />
                  <span className="gold-text">ZURÜCK.</span>
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-cream/48 sm:text-base">
                  Noch kein Account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-gold-300 transition-colors hover:text-gold-200"
                  >
                    Kostenlos erstellen
                  </Link>
                  .
                </p>

                <div className="mt-8">
                  <Suspense fallback={<div className="h-48 rounded-sm bg-cream/[0.03] animate-pulse" />}>
                    <AuthForm mode="login" />
                  </Suspense>
                </div>

                <p className="mt-8 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cream/24">
                  Bela Goldmann · AI Goldmining
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
