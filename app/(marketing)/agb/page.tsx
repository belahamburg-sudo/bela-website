import { LegalPage } from "@/components/legal-page";

export default function AgbPage() {
  return (
    <LegalPage
      eyebrow="AGB"
      title="Allgemeine Geschäftsbedingungen"
      intro="Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen Bela Goldmann (AI Goldmining) und Kunden über den Kauf digitaler Produkte über diese Website."
      sections={[
        {
          heading: "§ 1 Geltungsbereich",
          copy: "Diese AGB gelten für alle Verträge, die zwischen Bela Goldmann, [VOLLSTÄNDIGE ADRESSE EINTRAGEN], Deutschland (nachfolgend 'Anbieter') und Verbrauchern oder Unternehmern (nachfolgend 'Kunde') über die Website goldmvnn.com geschlossen werden. Abweichende AGB des Kunden haben keine Gültigkeit, sofern der Anbieter diesen nicht ausdrücklich schriftlich zustimmt.",
        },
        {
          heading: "§ 2 Vertragsschluss",
          copy: "Die Darstellung der Produkte auf der Website stellt kein rechtlich bindendes Angebot dar. Durch Klicken auf 'Kurs kaufen' gibt der Kunde ein verbindliches Kaufangebot ab. Der Vertrag kommt zustande, wenn der Anbieter das Angebot ausdrücklich annimmt oder die digitalen Inhalte bereitstellt. Der Anbieter bestätigt den Vertragsschluss per E-Mail.",
        },
        {
          heading: "§ 3 Preise und Zahlungsbedingungen",
          items: [
            "Alle Preise verstehen sich in Euro (EUR) inklusive der gesetzlichen Umsatzsteuer, sofern anwendbar",
            "Die Zahlung erfolgt über Stripe Payments Europe, Ltd. per Kredit-/Debitkarte oder sonstigen angebotenen Zahlungsmethoden",
            "Die Zahlung wird mit Abschluss des Bestellvorgangs fällig",
            "Stripe verarbeitet Zahlungsdaten im Rahmen seiner eigenen Datenschutzerklärung",
          ],
        },
        {
          heading: "§ 4 Lieferung digitaler Inhalte",
          items: [
            "Nach erfolgreicher Zahlung erhält der Kunde sofortigen Zugang zu den digitalen Kursinhalten über sein Benutzerkonto",
            "Die Kursinhalte stehen nach dem Login unter /dashboard/kurse abrufbar bereit",
            "Der Zugangszeitraum ist unbegrenzt, solange die Plattform betrieben wird",
            "Der Anbieter behält sich vor, Kursinhalte zu aktualisieren, zu erweitern oder anzupassen",
          ],
        },
        {
          heading: "§ 5 Widerrufsrecht für digitale Inhalte",
          copy: "Verbraucher haben grundsätzlich ein 14-tägiges Widerrufsrecht. Für digitale Inhalte (Kurse, Downloads) gilt gemäß § 356 Abs. 5 BGB: Das Widerrufsrecht erlischt vorzeitig, sobald der Anbieter mit der Ausführung begonnen hat und der Verbraucher ausdrücklich zugestimmt hat, dass er sein Widerrufsrecht verliert, sobald der Anbieter die vollständige Vertragserfüllung beginnt. Diese Zustimmung erteilt der Käufer im Checkout durch entsprechende Checkbox.",
        },
        {
          heading: "§ 6 Nutzungsrechte",
          copy: "Mit dem Kauf erhält der Kunde ein nicht übertragbares, nicht ausschließliches Nutzungsrecht für die Kursinhalte zum persönlichen Gebrauch. Eine Weitergabe, Vervielfältigung, Veröffentlichung oder gewerbliche Nutzung der Kursinhalte ist ohne ausdrückliche schriftliche Genehmigung des Anbieters untersagt.",
        },
        {
          heading: "§ 7 Haftungsbeschränkung",
          copy: "Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper und Gesundheit. Im Übrigen ist die Haftung des Anbieters auf den vorhersehbaren, vertragstypischen Schaden begrenzt. Eine Haftung für mittelbare Schäden, entgangenen Gewinn oder Folgeschäden ist ausgeschlossen, soweit gesetzlich zulässig.",
        },
        {
          heading: "§ 8 Kein Ergebnisversprechen",
          copy: "Die Kursinhalte vermitteln Wissen und Methoden. Der Anbieter schuldet keine bestimmten wirtschaftlichen Ergebnisse. Individuelle Ergebnisse hängen von der persönlichen Umsetzung, dem Marktumfeld und weiteren Faktoren ab. Hinweise auf beispielhafte Einnahmen sind keine Garantien.",
        },
        {
          heading: "§ 9 Datenschutz",
          copy: "Hinweise zur Verarbeitung personenbezogener Daten finden sich in unserer Datenschutzerklärung unter /datenschutz.",
        },
        {
          heading: "§ 10 Anwendbares Recht und Gerichtsstand",
          copy: "Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG). Für Verbraucher gilt: Zwingende Schutzvorschriften des Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat, bleiben unberührt. Gerichtsstand ist der Sitz des Anbieters, sofern der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.",
        },
        {
          heading: "§ 11 Salvatorische Klausel",
          copy: "Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht. Anstelle der unwirksamen Bestimmung gilt die gesetzlich zulässige Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.",
        },
      ]}
    />
  );
}
