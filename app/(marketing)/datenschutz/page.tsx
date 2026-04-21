import { LegalPage } from "@/components/legal-page";

export default function DatenschutzPage() {
  return (
    <LegalPage
      eyebrow="Datenschutz"
      title="Datenschutzerklärung"
      intro="Wir nehmen den Schutz deiner persönlichen Daten ernst. Diese Datenschutzerklärung informiert dich gemäß Art. 13 DSGVO darüber, wie wir deine Daten verarbeiten."
      sections={[
        {
          heading: "Verantwortlicher",
          copy: "Bela Goldmann, AI Goldmining — Bela@goldmvnn.com",
        },
        {
          heading: "Rechtsgrundlagen der Verarbeitung",
          copy: "Wir verarbeiten deine personenbezogenen Daten auf Basis folgender Rechtsgrundlagen gemäß DSGVO:",
          items: [
            "Art. 6 Abs. 1 lit. a DSGVO — Einwilligung (z.B. Newsletter-Anmeldung)",
            "Art. 6 Abs. 1 lit. b DSGVO — Vertragserfüllung (z.B. Kursübermittlung nach Kauf)",
            "Art. 6 Abs. 1 lit. c DSGVO — Rechtliche Verpflichtung (z.B. Aufbewahrungsfristen)",
            "Art. 6 Abs. 1 lit. f DSGVO — Berechtigtes Interesse (z.B. Sicherheit, Betrieb der Website)",
          ],
        },
        {
          heading: "Hosting — Vercel Inc.",
          copy: "Diese Website wird bei Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA) gehostet. Vercel verarbeitet beim Aufruf der Website automatisch Server-Logdaten (IP-Adresse, Browser, Betriebssystem, Aufrufzeitpunkt). Die Übertragung in die USA erfolgt auf Grundlage der EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Datenschutzerklärung: https://vercel.com/legal/privacy-policy",
        },
        {
          heading: "Authentifizierung & Datenbank — Supabase",
          copy: "Für Nutzerkonten und Datenverarbeitung setzen wir Supabase (Supabase Inc., 970 Toa Payoh North, #07-04, Singapur) ein. Die Datenspeicherung erfolgt auf Servern in Frankfurt (EU-West). Supabase verarbeitet E-Mail-Adresse, Passwort-Hash, Nutzer-ID und Kursfortschrittsdaten. Datenschutzerklärung: https://supabase.com/privacy",
        },
        {
          heading: "Zahlungsabwicklung — Stripe",
          copy: "Zahlungen werden über Stripe Payments Europe, Ltd. (1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210, Irland) abgewickelt. Stripe verarbeitet Zahlungsdaten (Kartendaten, Transaktionsbetrag, E-Mail) im Rahmen der Kaufabwicklung. Die Übertragung von Daten in die USA erfolgt auf Grundlage der EU-Standardvertragsklauseln. Datenschutzerklärung: https://stripe.com/de/privacy",
        },
        {
          heading: "Lead-Erfassung (Webinar-Anmeldung)",
          copy: "Wenn du dich für das kostenlose Webinar anmeldest, erfassen wir deine E-Mail-Adresse und speichern sie in unserer Datenbank (Supabase). Diese Daten werden ausschließlich für die Zusendung von Informationen zu unseren digitalen Produkten und Kursen genutzt. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO. Du kannst deine Einwilligung jederzeit per E-Mail an Bela@goldmvnn.com widerrufen.",
        },
        {
          heading: "Cookies und lokale Speicherung",
          copy: "Diese Website verwendet technisch notwendige Cookies für die Authentifizierungssitzung (Supabase Auth Session Cookie). Darüber hinaus wird im Demo-Modus ohne Konto der localStorage des Browsers genutzt. Es werden keine Tracking-Cookies, Analytics-Cookies oder Marketing-Cookies eingesetzt. Eine Einwilligung nach § 25 TTDSG ist für technisch notwendige Cookies nicht erforderlich.",
        },
        {
          heading: "Deine Rechte als betroffene Person",
          copy: "Gemäß DSGVO stehen dir folgende Rechte zu:",
          items: [
            "Art. 15 DSGVO — Auskunftsrecht: Du kannst Auskunft über die von uns gespeicherten Daten verlangen",
            "Art. 16 DSGVO — Berichtigungsrecht: Du kannst die Berichtigung unrichtiger Daten verlangen",
            "Art. 17 DSGVO — Recht auf Löschung: Du kannst die Löschung deiner Daten verlangen",
            "Art. 18 DSGVO — Recht auf Einschränkung der Verarbeitung",
            "Art. 20 DSGVO — Recht auf Datenübertragbarkeit",
            "Art. 21 DSGVO — Widerspruchsrecht gegen die Verarbeitung",
            "Art. 77 DSGVO — Beschwerderecht bei der zuständigen Datenschutzaufsichtsbehörde",
          ],
        },
        {
          heading: "Kontakt für Datenschutzanfragen",
          copy: "Für alle Anfragen zu deinen personenbezogenen Daten wende dich per E-Mail an: Bela@goldmvnn.com. Wir bearbeiten Anfragen innerhalb von 30 Tagen.",
        },
        {
          heading: "Aktualität und Änderungen",
          copy: "Diese Datenschutzerklärung ist aktuell gültig (Stand: April 2025). Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, um sie aktuellen rechtlichen Anforderungen anzupassen oder Änderungen unserer Leistungen umzusetzen.",
        },
      ]}
    />
  );
}
