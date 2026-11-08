# Funktionsspezifikation und Abnahmekriterien

**Status:** ENTWURF v0.1, 08.11.2026. **F:** zwingender Funktionsumfang; **V:** reversible Implementierungsdetails.  
**Abnahme:** Ein Kriterium gilt erst als bestanden, wenn im Testplan geprüft; klinische Medienprüfung ist separat.

## Funktionale Muss-Kriterien

| ID | Status | Anforderung und überprüfbares Kriterium |
| --- | --- | --- |
| FS-01 | F | Installierbare, lokal auf dem Tablet benutzbare PWA; Aufruf per HTTPS über GitHub Pages, Hochformat als Primärlayout, kein eigenes Smartphone nötig. |
| FS-02 | F | Wechsel zwischen **Patienten-** und **Angehörigenperspektive**; jeweils eigenständige Startinhalte und Karten. Rollenlabel jederzeit sichtbar, Wechsel ohne Informationsverlust. |
| FS-03 | F | Kurze Info aus Häftchen wird digital vertieft; jede Detailansicht nennt Quelle, Stand und Kategorie (allgemein / persönliche Demo-Vorgabe / eigene Angabe). |
| FS-04 | F | Vier Kartentypen: **Information, Übung, Termin, Meilenstein**. Vorderseite Titel+Bildsymbol, Rückseite QR; identische Inhalte über Touch-Auswahl erreichbar. |
| FS-05 | F | Kamera scannt **echte** QR-Codes; zuerst Frontkamera anfragen, bei inkompatibler/ungeeigneter Kamera Wechsel zur Rückkamera anbieten; unbekannte Codes höflich behandeln. |
| FS-06 | F | QR-Scan öffnet Zielinhalt ohne unbeabsichtigte Schreibaktion. Mehrfachscan derselben Karte erzeugt nie automatisch Timeline-Einträge. |
| FS-07 | F | Übungskarte und Unterstützungskarte öffnen vorbereitete Texte und Videos; **Übungen sind auch ohne erreichten Meilenstein aufrufbar**. Video zeigt keine automatisch abgeleitete Durchführung. |
| FS-08 | F | Video- und MP3-Steuerung Start/Pause/Stopp; Medien enden beim Navigationswechsel, Schliessen oder Rollenwechsel. Keine gleichzeitige ungesteuerte Wiedergabe. |
| FS-09 | F | Alma-Dialoge sind aus **vorbereiteten Texten/MP3-Dateien und Antwortbuttons** aufgebaut; jede angebotene Antwort führt zu definiertem Folgeknoten oder zurück. Keine Mikrofon-/LLM-Funktion. |
| FS-10 | F | Timeline zeigt fiktive vergangene Ereignisse, geplante Termine, persönliche Ziele und eigene Angaben semantisch unterscheidbar. Keine Heilungsprognose oder Rankings. |
| FS-11 | F | Neu hinzuzufügende Termin-/Meilensteineinträge zeigen vor dem Speichern eine verständliche Bestätigungsansicht mit „Hinzufügen“ und „Abbrechen“. Abbrechen verändert Timeline nicht. |
| FS-12 | F | Speichern ist **idempotent** auf stabilem Ereignisschlüssel (und Perspektive, sofern privat). Erneutes Scannen/Bestätigen erzeugt keinen zweiten Eintrag. |
| FS-13 | F | Das Ansehen/Beenden eines Videos ändert weder Übungsstatus noch Timeline. Nur gesonderte explizite Selbstangabe kann „ich habe …“ dokumentieren; nicht automatisch validiert. |
| FS-14 | F | Angehörige finden Videos und Informationen über hilfreiche Begleitung sowie eigene Entlastung, nicht nur eine Kopie der Patientenansicht. |
| FS-15 | F | Fehlende/ungültige Mediendateien führen zu klarem Hinweis und erreichbarem Text bzw. Alternativaktion, nicht zu leerem Player. |
| FS-16 | F | Inhalte und Medienreferenzen sind als Daten ausserhalb des UI-/Anwendungscodes pflegbar; IDs bilden die Verbindung. |
| FS-17 | F | Simulierte persönliche Dokumente sind ausdrücklich als **fiktiv** und **nicht klinisch validiert** markiert. Keine konkreten Belastungs-/Dosierungsangaben ohne Prüfung. |
| FS-18 | F | Audio und Video stoppen auch bei Startseitenwechsel, Dialogabbruch und Wechsel in Scan-Ansicht. Kamera-Stream wird beim Verlassen gestoppt. |
| FS-19 | F | Sichtbare Möglichkeit, zur Übersicht zurückzukehren; keine Sackgasse in Dialog, Kamera, Detail oder Timeline. |
| FS-20 | F | Interview-Reset setzt nur lokale Demo-Einträge zurück; löscht keine System-/Gerätedateien. |

## Vorschlag für v0.1-Implementierung

- **V-F1:** Statische PWA, interne Inhalte in `content/demo_manifest.json` und `content/demo_dialogs.json`; keine Serverdatenbank.
- **V-F2:** Browser-LocalStorage für bestätigte Timeline-Einträge; eindeutige Ereignis-IDs, Reset über interviewseitige Steuerung. Nur fiktive Daten; keine personenbezogene Sicherheit annehmen.
- **V-F3:** Neutrales, selbst erstelltes Technik-Testvideo und mindestens eine vorbereitete Test-MP3 vorsehen, falls fachlich freigegebene Medien noch fehlen; klar als **Techniktest, keine Übungsanleitung** kennzeichnen.
- **V-F4:** QR-Nutzlast `SH1:<KARTEN-ID>`, z. B. `SH1:P-INF-001`. Keine Namen, Diagnosen, Termine oder geheimen Tokens im Code. Externe URL-QRs erst nach Pages-Prüfung erwägen.
- **V-F5:** Für die Demo ein Fixdatum (06.11.2026) mit separatem späteren Physiotermin-Szenario statt eine reale Heilungsfrist; Datum wird aus Demodaten geladen.
- **V-F6:** Button für „Karten auswählen“ immer sichtbar; Scanner wird nicht als Zugangshürde erzwungen.

## Keine stillschweigende klinische Erweiterung

Eine individualisierte Übung ist erst dann als „konkret durchführen“ darstellbar, wenn freigegebene Medien und ein geprüfter Beispielplan vorliegen. Bis dahin: navigierbare Karten und neutrale Technik-Demo mit transparenter Sperrkennzeichnung. **Keine medizinischen Zahlen oder Übungsabfolgen erfinden.**

## Traceability

- Rollen und Alltag: `docs/CONCEPT.md`, `docs/UX_SPEC.md`.
- QR-, Karten- und Ereignis-IDs: `docs/CONTENT_AND_CARDS.md`, `content/demo_manifest.json`.
- Konkrete Tests: `docs/TEST_PLAN.md` (T01–T20).
- Freigabestatus: `docs/DECISIONS.md`.
