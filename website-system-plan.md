# Bela Goldmann / AI Goldmining Website-System

## Ziel

Das MVP ist eine deutschsprachige Full-Stack-Plattform fuer Bela Goldmann und die AI Goldmining Methode. Es verbindet Personal Brand, Lead-Funnel, kostenlosen Webinar-Einstieg, Telegram-Community, Mini-Kurs-Shop, Login und einen Kursbereich im Stil einer modernen Lernplattform.

## Sitemap und Route Map

- `/` - Startseite mit Hero, Methode, Zielgruppen, Kurs-Preview, Webinar, Community und Newsletter.
- `/webinar` - kostenlose Webinar-Anmeldung und Trainingsversprechen.
- `/community` - kostenlose Telegram-Community mit Lead-Form und CTA.
- `/kurse` - Mini-Kurs-Shop mit Starter-Katalog und Bundle.
- `/kurse/[slug]` - Kursdetailseite mit Ergebnis, Modulen, Preis und Checkout.
- `/login` - Login mit Supabase oder Demo-Modus.
- `/signup` - Registrierung mit Supabase oder Demo-Modus.
- `/dashboard` - Account-Startseite mit gekauften Kursen und Fortschritt.
- `/dashboard/kurse` - Kursbibliothek des Accounts.
- `/dashboard/kurse/[slug]` - Kursplayer mit Video, Modulen, PDFs, Downloads und Fortschritt.
- `/checkout/success` - Erfolg nach Demo- oder Stripe-Checkout.
- `/checkout/cancel` - Abbruchseite mit Rueckweg zum Kurs-Shop.
- `/about` - Bela, Haltung und Positionierung.
- `/impressum`, `/datenschutz`, `/agb`, `/income-disclaimer` - rechtliche Platzhalterseiten.

## Funnel Flow

1. Besucher kommen ueber Social Media, Ads, Bio-Link oder organischen Content.
2. Die Startseite erklaert sofort Bela Goldmann, AI Goldmining und digitale Produkte mit AI.
3. Primaere Einstiege sind kostenloses Webinar, Newsletter und Telegram-Community.
4. Leads werden in Supabase gespeichert, falls Keys gesetzt sind. Ohne Keys laeuft ein klar gekennzeichneter Demo-Modus.
5. Kurse koennen im Shop entdeckt und ueber Kursdetailseiten gekauft werden.
6. Checkout nutzt Stripe, falls Keys gesetzt sind. Ohne Keys wird ein Demo-Erfolg genutzt.
7. Gekaufte Kurse erscheinen im Dashboard. Im MVP zeigt der Demo-Modus den Starter-Katalog als freigeschaltete Lernumgebung.

## Wireframes

### Startseite

Hero: Brand, Nutzenversprechen, drei CTAs und AI-Gold-Visual mit Creator-Silhouette.

Problem: klassische Online-Business-Modelle haben Haken wie Kapital, Vorwissen oder Zeit-gegen-Geld.

Methode: Ideenfindung, AI-Produktentwicklung, Packaging und automatisierter Verkauf.

Zielgruppen: junge Starter, Creator/bestehende kleine Businesses, 9-to-5-Aussteiger.

Kurs-Preview: Featured Kurse und Bundle.

Webinar/Community/Newsletter: drei klare Einstiege in den Funnel.

### Kurs-Shop

Header mit Positionierung, danach Kursgrid. Jede Karte zeigt Cover, Level, Preis, Ergebnis und Details-CTA.

### Kursdetailseite

Hero mit Kurscover, Preis, Ergebnis, Zielgruppe, Includes und Checkout-Button. Danach Modulvorschau und Hinweis auf Demo-/Live-Modus.

### Dashboard und Kursplayer

Dashboard zeigt Status, freigeschaltete Kurse und naechste Schritte. Kursplayer nutzt links eine Modulnavigation, rechts Video, Beschreibung, Downloadbereich und Fortschrittsbutton.

## MVP Acceptance Criteria

- Die App laeuft lokal mit `npm run dev`.
- `npm run lint`, `npm run typecheck` und `npm run build` laufen ohne Fehler.
- Supabase/Stripe sind optional; ohne Keys funktioniert Demo-Modus.
- Keine erfundenen Testimonials, keine Garantien, keine unrealistischen Einkommen.
- Mobile Navigation, Formulare und Kursplayer sind nutzbar und ohne horizontales Scrollen.
- Alle wichtigen CTAs fuehren zu Webinar, Community, Kursen, Login oder Checkout.
