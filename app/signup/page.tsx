import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { SectionHeading } from "@/components/section-heading";

export default function SignupPage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-shell mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-start">
        <SectionHeading
          eyebrow="Account"
          title="Erstelle deinen Zugang zum Kursbereich."
          copy="Im MVP funktioniert der Account auch ohne echte Supabase-Keys. Sobald Supabase verbunden ist, wird daraus ein echtes Login-System."
        />
        <div>
          <Suspense fallback={<div className="panel-surface rounded-[1.35rem] p-6 text-muted">Registrierung wird geladen...</div>}>
            <AuthForm mode="signup" />
          </Suspense>
          <p className="mt-5 text-sm text-muted">
            Schon registriert?{" "}
            <Link href="/login" className="font-semibold text-gold-300 hover:text-gold-100">
              Einloggen
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
