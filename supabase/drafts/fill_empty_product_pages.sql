-- WS1: KI-Draft-Sales-Content für die 9 leeren aktiven Kurse.
-- Merge (||) ins bestehende product_page jsonb — überschreibt nur die gesetzten
-- Keys, lässt alles andere unberührt. heroResult / bonuses / proofImages bleiben
-- bewusst leer: echte Zahlen & Screenshots liefert Bela im Admin.
-- Ausführen: Supabase SQL Editor (Projekt hshkumoipyfocqnhqbql) oder psql.

update courses set product_page = coalesce(product_page,'{}'::jsonb) || '{
"outcomeHeadline":"Verwandle KI-Output in ein verkaufsfertiges digitales Produkt",
"subline":"Vom rohen Claude-Output zum fertigen Produkt im richtigen Format – bereit für Preis und Verkauf.",
"problem":"Du hast Ideen und massenhaft KI-Output – aber daraus wird kein Produkt, das jemand kauft. Zwischen roher KI-Ausgabe und fertigem Produkt im Warenkorb klafft eine Lücke. Genau die schließt dieser Kurs.",
"vision":["Du hast ein fertiges digitales Produkt, das du verkaufen kannst","Du weißt genau, welches Format zu deinem Thema passt","Du produzierst neue Produkte in Tagen statt Wochen"],
"needs":["Kein eigenes Team – du baust allein mit KI","Keine Design-Ausbildung","Kein technisches Vorwissen","Kein großes Startbudget"],
"mechanism":[{"title":"Produkt-Typ wählen","copy":"Du entscheidest, welches Format (Kurs, PDF, Template, Prompt-Pack) zu deinem Thema und Markt passt."},{"title":"Material mit KI produzieren","copy":"Mit Claude und dem Minikurs-Skill erstellst du die Inhalte strukturiert und schnell."},{"title":"Fertigstellen & bepreisen","copy":"Du bringst das Produkt ins richtige Format und legst Preis und Vertriebsweg fest."}],
"whoFor":["Einsteiger, die ihr erstes digitales Produkt bauen","Creator, die KI-Output endlich zu Geld machen wollen","Solopreneure ohne Team"],
"whoNotFor":["Wer schon eine funktionierende Produktpipeline hat","Wer kein eigenes Produkt verkaufen will"],
"afterOutcomes":["Baue ein digitales Produkt von der Idee bis zur Verkaufsreife","Wähle das passende Format für dein Thema","Produziere Inhalte mit KI in einem Bruchteil der Zeit","Lege Preis und Vertriebsweg fest"],
"ctaHeadline":"Bau dein erstes verkaufsfertiges Produkt"
}'::jsonb where slug = 'ai-digital-product-builder';

update courses set product_page = coalesce(product_page,'{}'::jsonb) || '{
"outcomeHeadline":"Finde deine profitable Nische in 48 Stunden",
"subline":"Mit Reddit-Mining, TikTok-Analyse und KI-gestützter Pain-Recherche – statt monatelangem Raten.",
"problem":"Die meisten starten mit einer Nische, die niemand bezahlt – und merken es erst nach Monaten Arbeit. Ohne validierten Pain und zahlungsbereiten Markt ist jedes Produkt ein Blindflug. Dieser Kurs gibt dir ein System, das in 48 Stunden Klarheit schafft.",
"vision":["Du hast eine validierte Nische, für die Menschen wirklich zahlen","Du kennst den konkreten Schmerzpunkt deiner Zielgruppe","Du startest dein erstes Produkt mit Rückenwind statt Zweifeln"],
"needs":["Keine bestehende Reichweite","Keine fertige Produktidee","Keine teuren Marktforschungs-Tools","Kein monatelanger Vorlauf"],
"mechanism":[{"title":"Kandidaten generieren","copy":"Du sammelst Nischen-Kandidaten aus Reddit, TikTok und Google Trends."},{"title":"Pain & Markt validieren","copy":"Du prüfst mit KI, ob der Schmerz echt ist und ein Markt existiert."},{"title":"Wallet validieren","copy":"Du bestätigst die Zahlungsbereitschaft und formulierst dein 1-Satz-Statement."}],
"whoFor":["Gründer und Side-Hustler vor dem ersten Produkt","Solopreneure, die eine rentable Nische suchen","Alle, die aufhören wollen zu raten"],
"whoNotFor":["Wer seine Nische schon validiert hat","Wer kein Produkt aufbauen will"],
"afterOutcomes":["Finde eine profitable Nische in 48 Stunden","Validiere Pain, Markt und Zahlungsbereitschaft","Nutze Reddit, TikTok und Trends gezielt für Recherche","Formuliere ein klares 1-Satz-Statement"],
"ctaHeadline":"Sichere dir deine Nische in 48 Stunden"
}'::jsonb where slug = 'ai-nischenfinder';

update courses set product_page = coalesce(product_page,'{}'::jsonb) || '{
"outcomeHeadline":"Mach aus deinem Social-Media-Traffic zahlende Kunden",
"subline":"Ein durchdachter Link-in-Bio-Funnel, der Instagram- und TikTok-Besucher zum Kauf führt.",
"problem":"Du bekommst Aufrufe und Follower – aber in der Bio versickert der Traffic. Ohne klaren Pfad von der Bio zum Kauf verschenkst du täglich Umsatz. Dieses System schließt genau diese Lücke.",
"vision":["Jeder Bio-Klick landet auf einem klaren Weg zum Kauf","Du wandelst Follower systematisch in Käufer um","Dein Funnel arbeitet, auch wenn du offline bist"],
"needs":["Keine große Followerzahl","Keine teure Funnel-Software","Keine Programmierkenntnisse","Kein Werbebudget"],
"mechanism":[{"title":"Funnel-Map erstellen","copy":"Du planst den Weg von der Plattform-Bio bis zum Checkout."},{"title":"Tools wählen","copy":"Mit dem Tool-Entscheidungsbaum findest du das richtige Setup für dich."},{"title":"In 48h aufsetzen","copy":"Mit der Checkliste bringst du deinen Bio-Funnel schnell live."}],
"whoFor":["Creator mit erstem Produkt","Alle mit Traffic, aber ohne Verkäufe","Instagram- und TikTok-Nutzer"],
"whoNotFor":["Wer noch kein Produkt hat","Wer keinen Social-Traffic aufbauen will"],
"afterOutcomes":["Baue einen Bio-Funnel von der Bio bis zum Kauf","Wandle Follower in Käufer um","Wähle die richtigen Funnel-Tools","Setze dein Setup in 48 Stunden live"],
"ctaHeadline":"Bau deinen Bio-Funnel, der verkauft"
}'::jsonb where slug = 'bio-funnel-system';

update courses set product_page = coalesce(product_page,'{}'::jsonb) || '{
"outcomeHeadline":"Hol dauerhaft bessere Ergebnisse aus jeder KI",
"subline":"Die 10 Bausteine eines perfekten Prompts, 3-Step-Prompting und ein Meta-Prompt, der für dich promptet.",
"problem":"Du nutzt KI schon – aber die Ergebnisse sind mal gut, mal unbrauchbar. Ohne System bleibt Prompten Glückssache und kostet dich Zeit. Dieser Kurs macht Output-Qualität planbar.",
"vision":["Du bekommst bei jedem Prompt verlässlich gute Ergebnisse","Du sparst Zeit, weil du nicht mehr nachbesserst","Du nutzt KI als echten Hebel statt als Spielzeug"],
"needs":["Kein technischer Hintergrund","Keine Programmierkenntnisse","Kein Bezahl-Abo nötig zum Starten","Keine Vorerfahrung im Prompten"],
"mechanism":[{"title":"10 Bausteine lernen","copy":"Du verstehst, woraus ein perfekter Prompt besteht."},{"title":"3-Step-Prompting anwenden","copy":"Du strukturierst jede Anfrage in drei klaren Schritten."},{"title":"Meta-Prompt nutzen","copy":"Du lässt die KI ihre eigenen Prompts bauen – für Top-Output auf Knopfdruck."}],
"whoFor":["Alle, die KI schon nutzen","Wer Output-Qualität systematisch verbessern will","Vielnutzer, die Zeit sparen wollen"],
"whoNotFor":["Wer KI nie einsetzen will","Wer bereits ein eigenes Prompt-System hat"],
"afterOutcomes":["Baue perfekte Prompts aus 10 Bausteinen","Strukturiere Anfragen mit 3-Step-Prompting","Nutze einen Meta-Prompt für Top-Output","Verbessere die Qualität jeder KI-Antwort"],
"ctaHeadline":"Meistere den wichtigsten Skill der Zukunft"
}'::jsonb where slug = 'prompt-engineering-pro';

update courses set product_page = coalesce(product_page,'{}'::jsonb) || '{
"outcomeHeadline":"Verkauf digitale Produkte rechtssicher – in 30 Minuten",
"subline":"Impressum, AGB, Widerruf und Datenschutz mit fertigen Vorlagen zum Einsetzen.",
"problem":"Beim Verkauf digitaler Produkte lauern Abmahnungen bei Impressum, AGB und Widerruf. Die meisten schieben das Thema auf – bis es teuer wird. Dieser Kurs macht dich in 30 Minuten rechtssicher.",
"vision":["Dein Shop hat alle Pflichttexte an Bord","Du verkaufst ohne Angst vor Abmahnungen","Du bist rechtlich sauber, ohne Anwaltskosten"],
"needs":["Kein Jura-Studium","Kein teurer Anwalt für den Start","Keine stundenlange Recherche","Kein Vorwissen"],
"mechanism":[{"title":"Grundlagen verstehen","copy":"Du lernst, welche Texte du wirklich brauchst und warum."},{"title":"Vorlagen anpassen","copy":"Du füllst die fertigen Vorlagen für AGB, Impressum & Co. aus."},{"title":"Einsetzen & absichern","copy":"Du bindest die Texte in deinen Shop ein und bist auf der sicheren Seite."}],
"whoFor":["Alle, die digitale Produkte verkaufen","Shop-Starter ohne Rechtstexte","Wer Abmahnungen vermeiden will"],
"whoNotFor":["Wer nichts verkauft","Wer bereits anwaltlich geprüfte Texte hat"],
"afterOutcomes":["Erstelle rechtssichere AGB, Impressum und Datenschutz","Setze das Widerrufsrecht korrekt um","Nutze fertige Vorlagen für deinen Shop","Verkaufe ohne Abmahn-Risiko"],
"ctaHeadline":"Mach deinen Shop in 30 Minuten rechtssicher"
}'::jsonb where slug = 'rechtliches-digitale-produkte';

update courses set product_page = coalesce(product_page,'{}'::jsonb) || '{
"outcomeHeadline":"Bau deinen Stan Store, der von Tag 1 verkauft",
"subline":"Von Setup über Checkout bis zur automatischen Auslieferung – auf Conversion getrimmt.",
"problem":"Ein Store ist schnell erstellt – aber die meisten verkaufen nichts, weil Aufbau, Checkout und Design nicht auf Conversion ausgelegt sind. Ohne durchdachtes Setup bleibt der Store leer. Diese Masterclass zeigt dir den kompletten Weg zum verkaufenden Store.",
"vision":["Dein Store ist sauber aufgebaut und verkauft","Checkout und Auslieferung laufen automatisch","Du gewinnst Kunden, ohne manuell nachzuarbeiten"],
"needs":["Keine Technik-Kenntnisse","Kein Designer","Kein Vorwissen über Stan Store","Kein großes Budget"],
"mechanism":[{"title":"Store aufsetzen","copy":"Du richtest deinen Stan Store sauber und vollständig ein."},{"title":"Produkte & Checkout","copy":"Du legst Produkte an und optimierst den Checkout auf Conversion."},{"title":"Auslieferung automatisieren","copy":"Du automatisierst die Produktübergabe, damit alles ohne dich läuft."}],
"whoFor":["Creator, die digital verkaufen wollen","Store-Starter ohne Technik-Erfahrung","Wer Verkäufe automatisieren will"],
"whoNotFor":["Wer keinen Store braucht","Wer bereits einen laufenden verkaufsstarken Store hat"],
"afterOutcomes":["Baue einen verkaufsoptimierten Stan Store","Richte Produkte und Checkout ein","Automatisiere die Auslieferung","Trimme dein Design auf Conversion"],
"ctaHeadline":"Bring deinen Stan Store zum Verkaufen"
}'::jsonb where slug = 'stan-store-masterclass';

update courses set product_page = coalesce(product_page,'{}'::jsonb) || '{
"outcomeHeadline":"Überwinde die Blockaden, die dich vom Geldverdienen abhalten",
"subline":"Das Mindset-Playbook: aufhören, was andere denken zu wichtig zu nehmen – und anfangen zu handeln.",
"problem":"Nicht fehlendes Wissen hält dich auf, sondern der Kopf: die Angst vor dem Urteil anderer und der zögernde Später-Modus. Solange die inneren Blockaden bleiben, bringt jede Strategie nichts. Dieser Kurs räumt sie aus dem Weg.",
"vision":["Du handelst konsequent statt aufzuschieben","Du machst dich unabhängig von der Meinung anderer","Du gehst mit einem Mindset ran, das Umsatz ermöglicht"],
"needs":["Keine Vorerfahrung","Kein Business-Wissen","Keine Therapie-Ausbildung","Kein perfekter Startzeitpunkt"],
"mechanism":[{"title":"Stop","copy":"Du erkennst, welche fremden Erwartungen dich bremsen – und lässt sie los."},{"title":"Care","copy":"Du findest heraus, was du wirklich willst."},{"title":"Want more","copy":"Du wandelst Klarheit in konsequentes Handeln um."}],
"whoFor":["Creator und Solopreneure mit mentalen Blockaden","Wer ständig aufschiebt","Wer sich zu sehr um fremde Meinungen sorgt"],
"whoNotFor":["Wer nur nach Taktiken sucht","Wer bereits mit voller Klarheit handelt"],
"afterOutcomes":["Erkenne und löse deine inneren Blockaden","Handle konsequent statt aufzuschieben","Mach dich frei vom Urteil anderer","Entwickle ein Mindset, das Umsatz ermöglicht"],
"ctaHeadline":"Räum die Blockaden aus dem Weg"
}'::jsonb where slug = 'stop-care-want-more';

update courses set product_page = coalesce(product_page,'{}'::jsonb) || '{
"outcomeHeadline":"Bau Verkaufswebinare, die konstant Umsatz bringen",
"subline":"Das komplette Webinar-System nach dem 100M-Framework – Struktur, Technik und KI-Aufbau.",
"problem":"Ein Webinar kann dein stärkster Verkaufskanal sein – oder eine Stunde, nach der niemand kauft. Der Unterschied liegt in Struktur und Technik, nicht in Glück. Dieser Kurs gibt dir beides als fertiges System.",
"vision":["Du hältst Webinare mit bewährter Verkaufsstruktur","Dein Technik-Setup läuft reibungslos","Aus einem Webinar entsteht konstant Umsatz"],
"needs":["Keine Vorerfahrung mit Webinaren","Kein großes Publikum zum Start","Keine teure Software","Kein Team"],
"mechanism":[{"title":"Struktur aufbauen","copy":"Du baust dein Webinar nach dem 100M-Framework auf."},{"title":"Technik einrichten","copy":"Du setzt das technische Setup einmal sauber auf."},{"title":"Mit KI produzieren","copy":"Du erstellst Inhalte und Ablauf schnell mit KI-Unterstützung."}],
"whoFor":["Creator, die Webinare als Verkaufskanal wollen","Wer sein Produkt live verkaufen will","Einsteiger ins Webinar-Format"],
"whoNotFor":["Wer nie live präsentieren will","Wer bereits ein laufendes Webinar-System hat"],
"afterOutcomes":["Baue ein Verkaufswebinar nach dem 100M-Framework","Richte das technische Setup sauber ein","Erstelle Webinar-Inhalte mit KI","Generiere konstant Umsatz aus einem Webinar"],
"ctaHeadline":"Bau dein Webinar-System, das verkauft"
}'::jsonb where slug = 'webinar-mastery';

update courses set product_page = coalesce(product_page,'{}'::jsonb) || '{
"outcomeHeadline":"Deine eigene Website mit eingebautem Kurs-Backend",
"subline":"Unabhängig von Stan Store oder Skool – mit automatischer Kursauslieferung.",
"problem":"Fremdplattformen wie Stan Store oder Skool geben dir wenig Kontrolle und ein fremdes Branding. Wer wachsen will, braucht die eigene Website als Kursplattform. Dieser Kurs zeigt dir, wie du sie mit funktionierendem Backend aufbaust.",
"vision":["Du hostest deine Kurse auf deiner eigenen Website","Die Auslieferung läuft automatisch","Du bist unabhängig von Fremdplattformen und deren Regeln"],
"needs":["Keine tiefen Programmierkenntnisse","Kein Entwickler-Team","Kein teures Plattform-Abo","Kein Design-Studium"],
"mechanism":[{"title":"Plattform wählen","copy":"Mit dem Vergleich findest du die richtige Basis für deine Website."},{"title":"Kurs-Backend aufbauen","copy":"Du richtest das Backend für deine Kursauslieferung ein."},{"title":"Auslieferung automatisieren","copy":"Du automatisierst die Produktübergabe an deine Käufer."}],
"whoFor":["Creator, die ihre eigene Kursplattform wollen","Wer weg von Stan Store oder Skool will","Wer volle Kontrolle über Branding sucht"],
"whoNotFor":["Wer bei einer Fremdplattform bleiben will","Wer keine Kurse ausliefert"],
"afterOutcomes":["Baue eine Website mit funktionierendem Kurs-Backend","Wähle die richtige Plattform für dich","Automatisiere die Kursauslieferung","Werde unabhängig von Fremdplattformen"],
"ctaHeadline":"Bau deine eigene Kursplattform"
}'::jsonb where slug = 'website-mit-kurspage-im-backend';
