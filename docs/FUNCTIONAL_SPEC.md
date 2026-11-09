# Funktionsspezifikation und Abnahmekriterien

**Status:** ENTWURF v0.1, 08.11.2026. **F:** zwingender Funktionsumfang; **V:** reversible Implementierungsdetails.  
**Abnahme:** Ein Kriterium gilt erst als bestanden, wenn im Testplan geprüft; klinische Medienprüfung ist separat.

## Funktionale Muss-Kriterien

| ID | Status | Anforderung und überprüfbares Kriterium |
| --- | --- | --- |
| FS-01 | F | Installierbare, lokal auf dem Tablet benutzbare PWA; Aufruf per HTTPS über GitHub Pages, Hochformat als Primärlayout, kein eigenes Smartphone nötig. |
| FS-02 | F17 | Ein einziger fiktiver Patient; nur P-Karten, Patientenmedien und -dialoge; keine Rollenumschaltung und keine Angehörigenansicht. |
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
| FS-14 | F17 | Patienten finden sämtliche vorgesehenen Übungsvideos sowie ihre Berichte/Erklärungen und geeignete Alltagshilfe-Inhalte. Keine separate Angehörigenperspektive. |
| FS-15 | F | Fehlender lokaler Ordner, fehlende Berechtigung, fehlende oder ungültige Mediendateien führen zu einem klaren Hinweis und Text-/Dateiauswahl-Alternative, nicht zu leerem Player. |
| FS-16 | F | Inhalte und Medienreferenzen sind als Daten ausserhalb des UI-/Anwendungscodes pflegbar; IDs bilden die Verbindung. |
| FS-17 | F | Simulierte persönliche Dokumente sind ausdrücklich als **fiktiv** und **nicht klinisch validiert** markiert. Keine konkreten Belastungs-/Dosierungsangaben ohne Prüfung. |
| FS-18 | F | Audio und Video stoppen auch bei Startseitenwechsel, Dialogabbruch und Wechsel in Scan-Ansicht. Kamera-Stream wird beim Verlassen gestoppt. |
| FS-19 | F | Sichtbare Möglichkeit, zur Übersicht zurückzukehren; keine Sackgasse in Dialog, Kamera, Detail oder Timeline. |
| FS-20 | F | Interview-Reset setzt nur lokale Demo-Einträge zurück; löscht **keine** lokalen Medien oder anderen Gerätedateien. |
| FS-21 | F | **Therapie-/Dialogmedien ausschliesslich lokal:** Filme, MP3s und weitere inhaltliche Mediendateien liegen unter `Internal storage/Documents/SMART` auf dem Android-Tablet. PWA lädt die Mediendateien weder von GitHub Pages noch von externen Servern; anhand von Medien-ID und Dateiname wird das zuvor freigegebene lokale Medium abgespielt. |
| FS-22 | F | Vor lokalem Medienzugriff ist eine **explizite Berechtigung/Dateiauswahl** nötig. Fehlt diese oder ist das Medienformat ungültig, bleibt der Inhalt mit verständlicher Textalternative zugänglich; Audio/Video werden nicht ungefragt übertragen oder kopiert. |

## Vorschlag für v0.1-Implementierung

- **V-F1:** Statische PWA, interne Inhalte in `content/demo_manifest.json` und `content/demo_dialogs.json`; keine Serverdatenbank.
- **V-F2:** Browser-LocalStorage für bestätigte Timeline-Einträge; eindeutige Ereignis-IDs, Reset über interviewseitige Steuerung. Nur fiktive Daten; keine personenbezogene Sicherheit annehmen.
- **V-F3:** Neutrales, selbst erstelltes Technik-Testvideo und mindestens eine vorbereitete Test-MP3 vorsehen, falls fachlich freigegebene Medien noch fehlen; klar als **Techniktest, keine Übungsanleitung** kennzeichnen.
- **V-F4:** QR-Nutzlast `SH1:<KARTEN-ID>`, z. B. `SH1:P-INF-001`. Keine Namen, Diagnosen, Termine oder geheimen Tokens im Code. Externe URL-QRs erst nach Pages-Prüfung erwägen.
- **V-F5:** Für die Demo ein Fixdatum (06.11.2026) mit separatem späteren Physiotermin-Szenario statt eine reale Heilungsfrist; Datum wird aus Demodaten geladen.
- **V-F6:** Button für „Karten auswählen“ immer sichtbar; Scanner wird nicht als Zugangshürde erzwungen.
- **V-F7:** Moderator verbindet einmal in der Vorbereitung `Documents/SMART` über eine vom Nutzer ausgelöste Ordnerauswahl (z. B. `showDirectoryPicker()` in kompatiblem Chrome). Dateinamen stehen im JSON-Manifest; App löst sie in diesem Ordner auf. Ordnerzugriff ist **nicht automatisch** aus einem Android-Pfad ableitbar.
- **V-F8:** Bei fehlender Ordner-API oder Berechtigung: per nativer Dateiauswahl eine oder mehrere Dateien aus `Documents/SMART` auswählen und anhand ihrer Dateinamen zuordnen; falls möglich bestehende Handles nutzen, bei Rechteverlust erneute Freigabe anbieten. Nur lesender Zugriff, keine Vervielfältigung oder Mediendateien im App-Cache.

## Keine stillschweigende klinische Erweiterung

Eine individualisierte Übung ist erst dann als „konkret durchführen“ darstellbar, wenn freigegebene Medien und ein geprüfter Beispielplan vorliegen. Bis dahin: navigierbare Karten und neutrale Technik-Demo mit transparenter Sperrkennzeichnung. **Keine medizinischen Zahlen oder Übungsabfolgen erfinden.**

## Traceability

- Rollen und Alltag: `docs/CONCEPT.md`, `docs/UX_SPEC.md`.
- QR-, Karten- und Ereignis-IDs sowie Dateinamen: `docs/CONTENT_AND_CARDS.md`, `content/demo_manifest.json`, `media/README.md`.
- Konkrete Tests: `docs/TEST_PLAN.md` (T01–T25).
- Freigabestatus: `docs/DECISIONS.md`.

## Ergänzung 09.11.2026 – Einstieg

FS-23: Vor dem Menü erscheint die dekorative Bergwiese mit Kühen. Die QR-Anleitung blendet in 3 Sekunden ein, demonstriert fünfmal die Karte mit Code zur Tablet-Kamera, blendet in 3 Sekunden aus und pausiert 10 Sekunden vollständig. Tippen oder Tastaturaktivierung öffnet das Menü. Kameraerkennung nach Browserfreigabe ist bereits am Einstieg aktiv; Patientenkarten öffnen ohne Rollenwechsel nur die Patientenperspektive. Alte Angehörigenkarten sind inaktiv. Bei reduzierter Bewegungseinstellung wird die Hand nicht bewegt. Die Bergwiesen-Appgrafik ist gemäss F16 als App-Shell erlaubt; lokale Therapie-/Dialogmedien bleiben vom Webhosting und Cache ausgeschlossen.

FS-24 (Nutzerauftrag 09.11.2026): Roter Abschaltbutton auf allen normalen Ansichten. Abschalten stoppt sofort Kamera, Player, Animations-Timer und QR-Erkennung, entfernt den Indikator und zeigt eine schwarze App-Fläche. Eine spätere Antwort auf eine noch offene Kamerafreigabe darf keinen Stream aktiv halten. Bis zum nächsten bewussten Tippen bzw. Tastaturaktivieren bleibt die App im Ruhemodus, auch nach Navigation oder Reload. Aktivieren öffnet die Bergwiese und startet nach Freigabe wieder die normale QR-Erkennung; lokale Bestätigungen und Dateiverbindungen bleiben erhalten. Der Kameraindikator erscheint auch im Menü-Scanner erst bei laufender Kamera.

FS-25: Sieben benannte lokale Übungsfilme über P-EX-101–107 erreichbar; IDs/Payloads stabil, keine neuen Therapieinstruktionen. Einstellungen über Zahnrad bieten Dateizuordnung, Speicherung unabhängig vom Demo-Reset und Sicherungsexport/-import. Zuordnungen bleiben bei Reload und Builds derselben Website bestehen; Dateiberechtigungen werden separat behandelt. Eingaben mit Pfaden/URLs werden abgewiesen. Grössere Zurück-Navigation mit mindestens 56 CSS-Pixeln Touch-Höhe.

FS-26: Verbundener Ordner füllt die Dateizuordnung unmittelbar. Dateiliste und Anzahl machen Erfolg/Leerzustand sichtbar. Android-Fallback verlangt keine Galerie-Anbindung; generischer Dateidialog ohne Medien-MIME-Filter und Verzeichnis-Input stehen zur Verfügung. Ein Picker-bedingter Sichtbarkeitswechsel darf gewählte Dateien nicht verwerfen. Dateiauswahl und Navigation/Abschalten besitzen getrennte Lebenszyklen.

FS-27: Bei Online-Start, Online-Ereignis, Wiederaufnahme und regelmässig während Nutzung auf Updates prüfen. Nur vollständig installierte Updates anbieten. Zustimmung aktiviert und lädt neu; Später unterbricht die Sitzung nicht. Offline/Fehler erhält vorhandene Version. Kein Hinweis bei Erstinstallation, Ruhemodus oder Dateiauswahl. Filmzuordnungen/Demo-Einträge überleben Aktivierung; auf Sitzungs-/Dateifreigabeverlust hinweisen.

## Aktueller Beschluss F17 – ausschliesslich Patient (09.11.2026)

- Ein fiktiver Patient **Ernst** ist die einzige Zielgruppe. Kein Angehörigenmodus, keine zweite Timeline, keine Rollenumschaltung. Nur P-Karten und Patienten-Alma-Dialog sind aktiv; alte A-QRs und die bisherige Misch-PDF bleiben Archiv und dürfen nicht auf Patienteninhalte umgeleitet werden.
- Patienten-Karten: sechs Basiskarten und sieben weitere Übungen, also **13 aktive Karten**, darunter **acht Übungsvideos**. Die lokale Medienablage, das bewusst bestätigte Speichern und alle klinischen Grenzen bleiben erhalten.
- **GUI-Freeze:** Nur Entfernung des Perspektivenwechsels ist mit F17 ausdrücklich freigegeben. Die zuvor besprochene Zweispalten-Startseite (links Videos, rechts nächster Physiotermin und Berichte/Erklärungen) ist **Vorschlag V16, noch nicht implementierungsfreigegeben**.
