import { XCircle } from "lucide-react";
import { Button } from "@/components/button";

export default function CheckoutCancelPage() {
  return (
    <section className="pt-24 pb-20 sm:pt-28">
      <div className="container-shell mx-auto max-w-3xl text-center">
        <XCircle aria-hidden className="mx-auto h-14 w-14 text-gold-700" />
        <h1 className="mt-6 font-heading text-5xl font-black text-cream">
          Checkout abgebrochen.
        </h1>
        <p className="mt-5 text-lg leading-9 text-muted">
          Kein Problem. Du kannst zurück zum Kurs-Shop oder später erneut starten.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/kurse">Zurück zu den Kursen</Button>
          <Button href="/webinar" variant="secondary">
            Erst Webinar ansehen
          </Button>
        </div>
      </div>
    </section>
  );
}
