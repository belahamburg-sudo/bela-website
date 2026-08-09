# Backend-Änderungen

Protokoll aller Eingriffe in Backend-Code (lib/, API-Routes, Server Actions),
die aus einer Frontend-Anforderung heraus nötig wurden. Siehe CLAUDE.md.

---

## 2026-08-03 — Freebie-Trichter: zweite Bestätigungsmail entfällt bei verifiziertem Konto

**Anlass:** Belas Review. Wer ein Gratis-Produkt abholt, musste zwei Mails
bestätigen: einmal fürs Konto, einmal für den Newsletter. Zusätzlich steckten
Nutzer mit altem `pending`-Eintrag in einer Sackgasse — Häkchen und
Weiter-Knopf verschwanden, obwohl für dieses Freebie nie eine Mail verschickt
worden war.

**Rechtliche Einordnung:** Das Double-Opt-in ist gesetzlich nicht
vorgeschrieben. Es ist die anerkannte Methode, um nach Art. 7 DSGVO
nachzuweisen, dass der Inhaber der Adresse selbst eingewilligt hat. Ist die
Konto-Mail bereits bestätigt, liegt dieser Nachweis schon vor. Die eigene,
ausdrückliche Einwilligung (Häkchen, nicht vorangekreuzt) bleibt zwingend und
unverändert erforderlich — nur die zweite Mail entfällt.

### `lib/newsletter.ts`

Neu: `confirmNewsletterWithVerifiedAccount(email, { userId, source })`

- Trägt die Einwilligung direkt als `confirmed` ein, mit `confirmed_at` und
  `source`, ohne Token und ohne Mailversand.
- Darf **nur** aufgerufen werden, wenn `user.email_confirmed_at` gesetzt ist.
- Reaktiviert **keine** abgemeldeten Adressen (`status = 'unsubscribed'` →
  gibt `false` zurück, der Aufrufer geht dann den regulären DOI-Weg).
- Bestehende Funktionen `subscribeNewsletter` und `confirmNewsletter` sind
  unverändert. Der klassische Double-Opt-in-Weg bleibt vollständig erhalten
  und greift weiterhin für alle nicht verifizierten Konten.

### `lib/freebies.ts`

`claimFreebieForUser()` nimmt zusätzlich `opts.accountEmailVerified` entgegen.

- Ist der Wert gesetzt und der Newsletter noch nicht bestätigt, wird die
  Einwilligung über die neue Funktion dokumentiert und der Kurs **sofort**
  freigeschaltet.
- Schlägt das fehl (abgemeldete Adresse), fällt die Funktion auf den
  bisherigen `subscribeNewsletter`-Weg zurück. Kein Verhalten geht verloren.

### Aufrufer

`app/(marketing)/freebie/[slug]/page.tsx` reicht
`Boolean(user.email_confirmed_at)` durch. Sonst unverändert.

### Was NICHT geändert wurde

- Keine Datenbank-Migration, keine neuen Spalten.
- Stripe, Auth-Routes, Webhooks unberührt.
- Die Registrierung selbst (inkl. ihrer Konto-Bestätigungsmail) unberührt.

### Offen, bewusst nicht mitgemacht

Als Einwilligungs-Beleg dienen aktuell `status`, `confirmed_at`, `source` plus
die bestätigte Konto-Mail in der Auth-Tabelle. **IP-Adresse und der genaue
angezeigte Einwilligungstext werden nicht gespeichert.** Für die
Nachweispflicht wäre beides sinnvoll, erfordert aber zwei zusätzliche Spalten
und damit eine Migration auf der Produktiv-Datenbank. Bewusst offengelassen,
bis Bela das freigibt.

---

## 2026-08-09 — Z.ai (GLM) Denkmodus abschalten: Chatbot, Kurs-Coach, Goldmine-Finder

**Anlass:** Bela meldete "Chat funktioniert nicht". Die Oberfläche zeigte
"Keine Antwort erhalten." Ein direkter Testaufruf gegen die Live-API lieferte
dagegen eine korrekte Antwort — in **22 Sekunden** und **mitten im Satz
abgeschnitten**.

**Ursache:** `glm-4.5-flash` hat den Denkmodus standardmäßig aktiv. In diesem
Modus landet die Antwort in `reasoning_content`, während `content` leer
bleibt. Beide Aufrufstellen lasen ausschließlich `content`. Da das Modell
selbst entscheidet, ob es denkt, fiel die Antwort mal aus und mal nicht —
daher das sprunghafte Fehlerbild.

**Änderung an beiden Aufrufstellen** (`lib/zai.ts` und
`app/api/support-chat/route.ts`):

- `thinking: { type: "disabled" }` mitsenden
- Rückfallebene: ist `content` leer, wird `reasoning_content` genommen
- Fehlerfälle werden jetzt per `console.error` protokolliert (vorher stiller
  Ausfall, dieselbe Klasse Fehler wie beim Mailversand)
- `max_tokens` im Support-Chat von 700 auf 1200, weil Antworten abbrachen

**Betroffen waren drei Funktionen**, nicht nur der Chatbot: Support-Chat,
AI-Kurs-Coach und Goldmine-Finder teilen sich denselben Aufruf.

Quelle: Z.AI Developer Docs, "Core Parameters".
