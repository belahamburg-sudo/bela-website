import { LegalPage } from "@/components/legal-page";

export default function ImpressumPage() {
  return (
    <LegalPage
      eyebrow="Impressum"
      title="Impressum"
      intro="Angaben gemäß § 5 TMG (Telemediengesetz). Diese Seite enthält die gesetzlich vorgeschriebenen Pflichtangaben für den Betrieb dieser Website."
      sections={[
        {
          heading: "Angaben gemäß § 5 TMG",
          copy: "Bela Goldmann",
          items: [
            "[VOLLSTÄNDIGE STRASSE UND HAUSNUMMER EINTRAGEN]",
            "[POSTLEITZAHL UND STADT EINTRAGEN]",
            "Deutschland",
          ],
        },
        {
          heading: "Kontakt",
          items: [
            "E-Mail: Bela@goldmvnn.com",
            "Telefon: [TELEFONNUMMER EINTRAGEN]",
          ],
        },
        {
          heading: "Umsatzsteuer-Identifikationsnummer",
          copy: "[FALLS VORHANDEN: USt-IdNr. gemäß § 27a UStG hier eintragen. Falls nicht vorhanden oder Kleinunternehmerregelung gemäß § 19 UStG: diesen Abschnitt entfernen.]",
        },
        {
          heading: "Verantwortlicher für den Inhalt nach § 55 Abs. 2 RStV",
          copy: "Bela Goldmann: Anschrift wie oben.",
        },
        {
          heading: "Streitschlichtung",
          copy: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
        },
        {
          heading: "Haftung für Inhalte",
          copy: "Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.",
        },
        {
          heading: "Haftung für Links",
          copy: "Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.",
        },
        {
          heading: "Urheberrecht",
          copy: "Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
        },
      ]}
    />
  );
}
