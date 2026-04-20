import { LegalPage } from "@/components/legal-page";

export default function DatenschutzPage() {
  return (
    <LegalPage
      title="Datenschutz"
      intro="Diese Datenschutzerklärung ist ein MVP-Platzhalter. Für den Live-Betrieb müssen Supabase, Stripe, Newsletter-Tools, Analytics und Hosting rechtlich geprüft und sauber benannt werden."
      sections={[
        {
          heading: "Verarbeitete Daten",
          copy: "Im geplanten Live-System können Accountdaten, Lead-Daten, Zahlungsstatus, Kursfortschritt und technische Zugriffsdaten verarbeitet werden."
        },
        {
          heading: "Drittanbieter",
          copy: "Supabase wird für Auth und Datenbank geplant. Stripe wird für Checkout und Zahlungsstatus geplant. Weitere Anbieter werden erst ergänzt, wenn sie final feststehen."
        }
      ]}
    />
  );
}
