import { LegalPage } from "@/components/legal-page";

export default function IncomeDisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Ehrlichkeit zuerst"
      title="Income Disclaimer"
      intro="Bela Goldmann und AI Goldmining stehen für echte digitale Produkte und realistische Ergebnisse: nicht für Traumversprechen. Bitte lies diesen Disclaimer, bevor du eine Entscheidung triffst."
      cta={{ label: "Gratis Webinar ansehen", href: "/webinar" }}
      sections={[
        {
          heading: "Keine Einkommensgarantie",
          copy: "Alle Aussagen über mögliche Einnahmen, beispielsweise Angaben wie 'erste 3.000 Euro monatlich', sind Zielrahmen und Positionierungsbeispiele: keine garantierten Ergebnisse. Es gibt keine Garantie, dass du ähnliche Ergebnisse erzielst.",
        },
        {
          heading: "Individuelle Ergebnisse variieren stark",
          copy: "Deine Ergebnisse hängen von vielen Faktoren ab, die außerhalb meines Einflusses liegen:",
          items: [
            "Dein persönliches Wissensgebiet und die Qualität deines digitalen Produkts",
            "Dein verfügbares Zeitbudget und deine Umsetzungskonsequenz",
            "Der Wettbewerb und die Nachfrage in deiner Nische",
            "Deine vorhandene oder aufzubauende Reichweite und Zielgruppe",
            "Deine Bereitschaft, Feedback anzunehmen und das Angebot anzupassen",
            "Technische Fähigkeiten und Lernbereitschaft",
            "Externe wirtschaftliche Faktoren",
          ],
        },
        {
          heading: "Kein Ersatz für professionelle Beratung",
          copy: "Die Inhalte auf dieser Website und in unseren Kursen sind allgemeine Bildungsinhalte. Sie stellen keine steuerliche, rechtliche oder Finanzberatung dar. Für individuelle Entscheidungen empfehle ich, einen qualifizierten Steuerberater oder Rechtsanwalt hinzuzuziehen.",
        },
        {
          heading: "Was ich dir verspreche",
          copy: "Ich zeige dir das System, die Methoden und die Tools, mit denen ich und andere digitale Produkte aufgebaut und vermarktet haben. Die Qualität der Inhalte steckt in meiner Arbeit: was du daraus machst, liegt bei dir. Das ist kein Versprechen auf Reichtum, sondern ein Angebot an alle, die bereit sind, ernsthaft mitzumachen.",
        },
        {
          heading: "Verwendung von Erfahrungsberichten",
          copy: "Falls auf dieser Website Erfahrungsberichte von Teilnehmern erscheinen, sind diese authentisch, beschreiben aber individuelle Ergebnisse. Diese sind nicht repräsentativ und kein Hinweis auf durchschnittlich zu erwartende Ergebnisse.",
        },
        {
          heading: "Fragen?",
          copy: "Wenn du Fragen zu unseren Produkten oder zu diesem Disclaimer hast, schreib uns: Bela@goldmvnn.com",
        },
      ]}
    />
  );
}
