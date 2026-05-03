import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/button";

export default function CheckoutSuccessPage() {
  return (
    <section className="pt-24 pb-20 sm:pt-28">
      <div className="container-shell mx-auto max-w-3xl text-center">
        <CheckCircle2 aria-hidden className="mx-auto h-14 w-14 text-gold-300" />
        <h1 className="mt-6 font-heading text-5xl font-black text-cream">
          Zugang freigeschaltet.
        </h1>
        <p className="mt-5 text-lg leading-9 text-muted">
          Im Demo-Modus wurde der Checkout simuliert. Mit Stripe-Keys wird hier
          der echte Kauf bestätigt und der Kurs im Dashboard freigeschaltet.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/dashboard/kurse">Zum Kursbereich</Button>
          <Button href="/kurse" variant="secondary">
            Weitere Kurse
          </Button>
        </div>
      </div>
    </section>
  );
}
