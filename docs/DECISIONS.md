# Entscheidungen, Vorschläge und offene Punkte

**Status:** LEBENDES ENTSCHEIDUNGSREGISTER v0.1, erstellt 08.11.2026.  
**Verbindlichkeitsregel:** Nur **FESTGELEGT (F)** ist durch vorliegende Projektanweisungen gedeckt. **VORSCHLAG (V)** bleibt bis ausdrücklicher Projektentscheidung reversibel. **OFFEN (O)** ist kein Auftrag an Codex.

## FESTGELEGT – aus dem Projektkonzept

| ID | Beschluss / Rahmen |
| --- | --- |
| F01 | Alma ist eine ca. 20 cm grosse, sitzende Plüschkuh; separates, davor abgestütztes Tablet im **Hochformat**. |
| F02 | Kurz-Häftchen zu Ereignissen/Übergängen sind individuell, für Patient und Angehörige getrennt und auch ohne Tablet hilfreich. |
| F03 | QR-Schlüsselanhänger vertiefen Informationen; bei Austritt und Physioterminen werden Karten ergänzt. Vorderseite Titel + Bildsymbol, Rückseite QR. |
| F04 | Vier Typen: Information, Übung, Termin, Meilenstein; differenzierte Patienten-/Angehörigeninhalte. |
| F05 | Installierbare PWA; **echter QR-Scan**, vorzugsweise Frontkamera; jederzeit Touch-Alternative. Kein eigenes Smartphone nötig. |
| F06 | Vorbereitete Texte, Videos, MP3 und Alma-Dialoge mit auswählbaren Antwortbuttons; **keine** Spracherkennung/GenAI in der Demo. |
| F07 | Videoangebote (Übungen und Alltagshilfe) zentral; Übungen unabhängig von Meilenstein erreichbar. |
| F08 | QR-Scan öffnet Inhalt; **Eintrag erst nach bewusster Bestätigung**; erneuter Scan erzeugt kein Duplikat; Videoansicht belegt keine Übungsdurchführung. |
| F09 | Timeline für Ereignisse und persönliche Ziele; Medien stoppen auf Verlassen; selbstbestimmte Darstellung ohne Rankings und fixe Reha-Fristen. |
| F10 | Fiktive Personendaten; keine medizinischen Dosierungen/Freigaben erfinden; Quelle und Aktualität sowie persönliche/allgemeine/eigene Angaben unterscheiden. |
| F11 | Spätere EPIC-Nutzung ist Idee; Demo arbeitet ausschliesslich mit vorbereiteten fiktiven Beispieldokumenten. |
| F12 | GitHub als gemeinsame versionierte Spezifikation von Projekt-Chat und Codex; neue Commits starten **keinen** Codex-Auftrag. |
| F13 | Öffentliches Repo darf keine vertraulichen Ursprungsunterlagen oder echten Patientendaten enthalten. |
| F14 | **Neu festgelegt am 08.11.2026:** Sämtliche Medien (insbesondere Videos und MP3s) liegen **lokal auf dem Android-Tablet** im Verzeichnis `Internal storage/Documents/SMART`, nicht auf GitHub Pages oder im GitHub-Repository. Die PWA darf nur nach expliziter Benutzerfreigabe darauf zugreifen. |

## VORSCHLÄGE – für Umsetzung v0.1

| ID | Vorschlag | Grund / Rückfall |
| --- | --- | --- |
| V01 | Fiktiver Fall **Ernst/Anna** aus SMARTcoach-Journey v0.2 | Vergleichbare Gesprächsszenen; kann vollständig ersetzt werden |
| V02 | QR-Kurztext `SH1:<CARD-ID>`, IDs `P-INF-001` etc. | Robust, keine PII, unabhängig von Live-URL |
| V03 | Statische GitHub-Pages-PWA, Daten in `content/*.json` | Einfach, Inhalte unabhängig vom Code austauschbar |
| V04 | Browser-LocalStorage für bestätigte Demo-Einträge und Reset | Ohne Backend; keine Sicherheits-/Privatsphärengarantie |
| V05 | Navigationsstruktur U0–U9 in `UX_SPEC`, grosse Touch-Ziele | Erst auf realem Tablet verifizieren |
| V06 | Fixdatum 06.11.2026 und 10.11.-Physiotermin als Interviewszenen | Reproduzierbares Interview; keine Reha-Frist |
| V07 | Papier-Häftchen A6 und kartonbasierte Kartensets | Format und Lesbarkeit mit Zielpersonen testen |
| V08 | Neutrale Videodatei/MP3 nur für technischen Test, bis fachlich freigegebene Medien vorliegen | Keine erfundene Therapie |
| V09 | Eine leicht auffindbare, moderatorseitige Demo-Reset-/Szenarioansicht | Wiederholbare Interviews |
| V10 | Portrait zuerst; Landscape nur als tolerierter Zustand | Keine Drehpflicht; Gestaltungsprüfung auf Gerät |
| V11 | Ursprüngliche fiktive Ereignis-IDs `E02/E06/E07/J10` aus Journey als Referenzen | Stabiler Querverweis, später austauschbar |
| V12 | Bei der Interviewvorbereitung den lokalen Ordner über `showDirectoryPicker()` (sofern unterstützt) **lesend verbinden**; sonst manuelle Dateiauswahl | PWA kann Dateien nicht durch Angabe eines absoluten Android-Pfads automatisch lesen; auf realem Tablet prüfen |
| V13 | Manifest speichert nur erwartete **Dateinamen** (keine URLs), zugewiesen über stabile Medien-IDs | Medien bleiben unabhängig von Anwendung und Repository; Name kann redaktionell geändert werden |

## OFFENE PUNKTE – priorisiert (max. drei entscheidungsrelevant)

1. **O01 – Testgerät und Kameras:** Welches reale Android-Tablet/Chrome-Version wird verwendet, wie gross ist der **verfügbare** Viewport mit Android-Leisten, funktioniert die Frontkamera mit kleinen gedruckten QR-Codes? Erst testen, danach endgültiges UX-Finetuning.
2. **O02 – Klinisch/redaktionell freigegebene Medien:** Welche **konkreten** Übungs- und Unterstützungsclips und Sprecher-MP3 dürfen für Interviews eingesetzt werden? Bis zur Freigabe nur ausdrücklich neutrale Platzhalter/Testdateien.
3. **O03 – Druck-/QR-Standard:** Kurzpayload versus URL-QR, Karten- und Heftformat, Position/Grösse am Anhänger. Erst mit funktionierender Scanner-Demo und Zielgruppen testen; **noch keine Druckfreigabe**.

## Nicht blockierend, aber nachzuweisen

GitHub Pages ist im Repo noch nicht konfiguriert; die tatsächliche Aktivierung in den GitHub-Einstellungen konnte nicht ausgelesen werden. Freigabe/Lizenz und klinische Prüfung konkreter Medien fehlen. **Technische Ordnerauswahl und Wiederverwendung der Berechtigung müssen auf dem realen Android-Tablet getestet werden.** Die fiktiven Namen/Termine ersetzen ausdrücklich keine Therapieunterlagen.

## Freigabestand und nächste Entscheidung

**Diese Dokumentation ist v0.1-Entwurf, keine Freigabe zur Softwareimplementierung.** `CODEX_START.md` ist ein vorbereiteter, inhaltlich konkreter Folgeauftrag. Erst ein expliziter Auftrag im Projekt-Chat startet die Umsetzung. Freigaben/Änderungen hier mit Datum und betroffenen Dateien ergänzen.
