import { LegalPage } from "@/components/legal-page";

export default function IncomeDisclaimerPage() {
  return (
    <LegalPage
      title="Income Disclaimer"
      intro="AI Goldmining kommuniziert keine Einkommensgarantien. Ergebnisse hängen von Umsetzung, Markt, Produktqualität, Angebot, Traffic und vielen weiteren Faktoren ab."
      sections={[
        {
          heading: "Keine Garantie",
          copy: "Aussagen wie erste 3.000 Euro monatlich selbstständig sind als Zielrahmen und Positionierung zu verstehen, nicht als zugesichertes Ergebnis."
        },
        {
          heading: "Individuelle Ergebnisse",
          copy: "Jede Person startet mit anderen Fähigkeiten, Ressourcen, Zeitbudgets und Märkten. Deine Ergebnisse können deutlich abweichen."
        }
      ]}
    />
  );
}
