import { LegalPage } from "@/components/legal-page";

export default function AgbPage() {
  return (
    <LegalPage
      title="AGB"
      intro="Diese AGB-Seite ist ein Platzhalter für die späteren Vertragsbedingungen zu digitalen Produkten, Kurszugang, Zahlung, Widerruf und Nutzung."
      sections={[
        {
          heading: "Digitale Produkte",
          copy: "Die Kurse, Workbooks und Downloads sind digitale Inhalte. Finale Nutzungsrechte und Zugangsdauer müssen vor dem Verkauf definiert werden."
        },
        {
          heading: "Zahlungen",
          copy: "Stripe Checkout ist technisch vorbereitet. Preise im MVP sind Platzhalter und müssen vor Live-Verkauf final bestätigt werden."
        }
      ]}
    />
  );
}
