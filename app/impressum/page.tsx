import { LegalPage } from "@/components/legal-page";

export default function ImpressumPage() {
  return (
    <LegalPage
      title="Impressum"
      intro="Diese Seite ist ein Platzhalter für die finalen Betreiberangaben und muss vor Veröffentlichung rechtlich korrekt ausgefüllt werden."
      sections={[
        {
          heading: "Betreiber",
          copy: "Bela Goldmann / AI Goldmining. Vollständige Anschrift, Kontakt, Unternehmensform und Vertretungsberechtigung werden vor Launch ergänzt."
        },
        {
          heading: "Kontakt",
          copy: "E-Mail, Telefonnummer und weitere Pflichtangaben werden hier eingetragen, sobald die finalen Daten vorliegen."
        }
      ]}
    />
  );
}
