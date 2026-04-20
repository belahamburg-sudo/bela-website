import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { SectionHeading } from "@/components/section-heading";

export default function LoginPage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-shell mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-start">
        <SectionHeading
          eyebrow="Login"
          title="Zurück in deinen AI-Goldmining-Bereich."
          copy="Log dich ein, öffne deine Kurse und arbeite die Lektionen Schritt für Schritt durch."
        />
        <div>
          <Suspense fallback={<div className="panel-surface rounded-[1.35rem] p-6 text-muted">Login wird geladen...</div>}>
            <AuthForm mode="login" />
          </Suspense>
          <p className="mt-5 text-sm text-muted">
            Noch kein Account?{" "}
            <Link href="/signup" className="font-semibold text-gold-300 hover:text-gold-100">
              Kostenlos erstellen
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
