# Entscheidungen, Vorschläge und offene Punkte

**Status:** LEBENDES ENTSCHEIDUNGSREGISTER v0.1, erstellt 08.11.2026.  
**Verbindlichkeitsregel:** Nur **FESTGELEGT (F)** ist durch vorliegende Projektanweisungen gedeckt. **VORSCHLAG (V)** bleibt bis ausdrücklicher Projektentscheidung reversibel. **OFFEN (O)** ist kein Auftrag an Codex.

## FESTGELEGT – aus dem Projektkonzept

| ID | Beschluss / Rahmen |
| --- | --- |
| F01 | Alma ist eine ca. 20 cm grosse, sitzende Plüschkuh; separates, davor abgestütztes Tablet im **Hochformat**. |
| F02 (historisch) | Früher Häftchen für beide Zielgruppen; **F17 hebt Angehörigen-Häftchen im Demonstrator auf**. |
| F03 | QR-Schlüsselanhänger vertiefen Informationen; bei Austritt und Physioterminen werden Karten ergänzt. Vorderseite Titel + Bildsymbol, Rückseite QR. |
| F04 (teilweise ersetzt) | Vier Kartentypen bleiben. Durch F17 sind nur Patienten-Karten aktiv. |
| F05 | Installierbare PWA; **echter QR-Scan**, vorzugsweise Frontkamera; jederzeit Touch-Alternative. Kein eigenes Smartphone nötig. |
| F06 | Vorbereitete Texte, Videos, MP3 und Alma-Dialoge mit auswählbaren Antwortbuttons; **keine** Spracherkennung/GenAI in der Demo. |
| F07 | Videoangebote (Übungen und Alltagshilfe) zentral; Übungen unabhängig von Meilenstein erreichbar. |
| F08 | QR-Scan öffnet Inhalt; **Eintrag erst nach bewusster Bestätigung**; erneuter Scan erzeugt kein Duplikat; Videoansicht belegt keine Übungsdurchführung. |
| F09 | Timeline für Ereignisse und persönliche Ziele; Medien stoppen auf Verlassen; selbstbestimmte Darstellung ohne Rankings und fixe Reha-Fristen. |
| F10 | Fiktive Personendaten; keine medizinischen Dosierungen/Freigaben erfinden; Quelle und Aktualität sowie persönliche/allgemeine/eigene Angaben unterscheiden. |
| F11 | Spätere EPIC-Nutzung ist Idee; Demo arbeitet ausschliesslich mit vorbereiteten fiktiven Beispieldokumenten. |
| F12 | GitHub als gemeinsame versionierte Spezifikation von Projekt-Chat und Codex; neue Commits starten **keinen** Codex-Auftrag. |
| F13 | Öffentliches Repo darf keine vertraulichen Ursprungsunterlagen oder echten Patientendaten enthalten. |
| F14 | **Neu festgelegt am 08.11.2026:** Sämtliche Medien (insbesondere Videos und MP3s) liegen **lokal auf dem Android-Tablet** im Verzeichnis `Internal storage/Documents/SMART`, nicht auf GitHub Pages oder im GitHub-Repository (Ausnahme für dekorative Appgrafik: F16). Die PWA darf nur nach expliziter Benutzerfreigabe darauf zugreifen. |
| F16 (teilweise ersetzt) | Bergwiese, QR-Einstieg, Animation, Kameraindikator und lokale Medien bleiben. Die frühere automatische Auswahl Ernst/Anna entfällt durch F17. |
| F15 | **Aktuell beauftragt:** QR-Karten als druckbares PDF mit Vorder-/Rückseite auf demselben Blatt und Faltlinie bereitstellen; QR-SVG-Dateien in separatem GitHub-Verzeichnis. Keine personenbezogenen Daten in QR-Payloads. |

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
| V14 | Je eine zusätzliche Info-Karte `P-INF-003` und `A-INF-003` als QR-Einstieg in die beiden Alma-Dialoge | Dadurch erhalten auch die zwei MP3-Medien einen eigenen QR-Zugang. Reversibler Demo-Vorschlag, keine neue medizinische Funktion |
| V15 | Drei A4-Seiten mit 11 Faltkarten; SVG-Vektordateien und das QR-Kurzformat `SH1:<CARD-ID>` | Druckformat und reale Frontkamera-Lesbarkeit erst am Zieltablet abnehmen |

## OFFENE PUNKTE – priorisiert (max. drei entscheidungsrelevant)

1. **O01 – Testgerät und Kameras:** Welches reale Android-Tablet/Chrome-Version wird verwendet, wie gross ist der **verfügbare** Viewport mit Android-Leisten, funktioniert die Frontkamera mit kleinen gedruckten QR-Codes? Erst testen, danach endgültiges UX-Finetuning.
2. **O02 – Klinisch/redaktionell freigegebene Medien:** Welche **konkreten** Übungs- und Unterstützungsclips und Sprecher-MP3 dürfen für Interviews eingesetzt werden? Bis zur Freigabe nur ausdrücklich neutrale Platzhalter/Testdateien.
3. **O03 – Druck-/QR-Standard:** Kurzpayload versus URL-QR, Karten- und Heftformat, Position/Grösse am Anhänger. Erst mit funktionierender Scanner-Demo und Zielgruppen testen; **noch keine Druckfreigabe**.

## Nicht blockierend, aber nachzuweisen

GitHub Pages ist im Repo noch nicht konfiguriert; die tatsächliche Aktivierung in den GitHub-Einstellungen konnte nicht ausgelesen werden. Freigabe/Lizenz und klinische Prüfung konkreter Medien fehlen. **Technische Ordnerauswahl und Wiederverwendung der Berechtigung müssen auf dem realen Android-Tablet getestet werden.** Die fiktiven Namen/Termine ersetzen ausdrücklich keine Therapieunterlagen.

## Freigabestand und nächste Entscheidung

**Diese Dokumentation ist v0.1-Entwurf, keine Freigabe zur Softwareimplementierung.** `CODEX_START.md` ist ein vorbereiteter, inhaltlich konkreter Folgeauftrag. Erst ein expliziter Auftrag im Projekt-Chat startet die Umsetzung. Freigaben/Änderungen hier mit Datum und betroffenen Dateien ergänzen.

## Implementierungsstand nach ausdrücklicher Freigabe (08.11.2026)

Der Nutzer hat im Cloud-Chat die Ausführung von `CODEX_DRAFT_PROMPT.md` ausdrücklich beauftragt. Der erste PWA-Draft setzt V02/V03/V04 und V12/V13 um; V12 hat die native Mehrfach-Dateiauswahl als gleichwertige Alternative. Reversible technische Umsetzung: Vanilla-JavaScript mit Vite, gebündeltem jsQR, LocalStorage nur für fiktive Bestätigungen/Szenario und App-Shell-Cache ohne Medien. Medienhandles werden bewusst nur während der Sitzung gehalten; nach App-Neustart erneut verbinden. Szenariowechsel setzt den fiktiven Interviewzeitpunkt, sperrt aber keine Übungskarte. Keine neuen klinischen Festlegungen. Validierung und offene Hardwareabnahme: `IMPLEMENTATION.md`.

**Ergänzung zu F16, 09.11.2026:** Der Nutzer verlangt einen kleinen roten Punkt als Signal für die Interviewführung, sobald die Kamera aktiv und QR-Erkennung bereit ist. Das Signal bleibt unabhängig von der Hinweisanimation sichtbar und endet mit der Kamera.

## F17 – App abschalten und wieder einschalten (Nutzerauftrag 09.11.2026)

Jede normale Ansicht, einschliesslich Einstieg, Scanner und Ladefehler, besitzt einen roten „Abschalten“-Button. Aktualisierung auf Nutzerwunsch: Im Menü und allen Unteransichten oben rechts in der ersten Zeile; nur auf dem Alm-Begrüssungsbild weiterhin unten rechts. Er stoppt Kamera, Medien und Animation, entfernt den Kamerapunkt und zeigt eine vollständig schwarze App-Fläche. Erst Antippen oder Tastaturaktivierung weckt zur Bergwiese mit normalem QR-Betrieb. Der Ruhemodus bleibt bei Navigation, Sichtbarkeitswechsel und Neuladen in derselben Browsersitzung erhalten. Bestätigungen und ausgewählte lokale Dateien bleiben unberührt. Der rote Kamerapunkt gilt ausdrücklich auch für den über das Menü gestarteten Scanner. Die PWA steuert damit ihre App-Fläche; Hardware-Stromversorgung und Android-Systemleisten bleiben unter Kontrolle des Betriebssystems.

## F18 – Filmzuordnung und Navigation (09.11.2026)

Nutzerauftrag: grössere, deutlich sichtbare Navigation; dezentes Zahnrad für Einstellungen in der ersten Zeile. Sieben explizit benannte lokale Übungsfilme erhalten eigene Karten P-EX-101–107. Gespeicherte Zuordnungen verbinden stabile Medien-/Karten-IDs mit lokalen Dateinamen und überleben Neustarts sowie neue Builds bei gleicher Website. LocalStorage ist vom Demo-Reset getrennt; Export/Import als Sicherung. Android-Dateifreigaben bleiben separat erforderlich. Keine klinische Freigabe aus dem Vorliegen einer Datei ableiten.

## Android-Auswahl korrigieren

Nutzerrückmeldung: Galerie statt SMART-Dateien sowie leere Filmzuordnung. Umsetzung: generischer Dateidialog ohne Medien-MIME-Filter; nativer Ordner-Input als Fallback; vorhandener freigegebener Ordner als Startpunkt bei unterstützter Dateiauswahl. Anzahl/Dateiliste und deaktivierte leere Auswahlfelder zeigen den Verbindungsstatus. Kurzzeitiges Verbergen der App durch den Picker verwirft das Ergebnis nicht. Absolute Android-Pfade bleiben nur Orientierung, keine ungefragte Freigabe.

## F19 – Updates anbieten bei Internetverbindung

Expliziter Nutzerauftrag: Bei Verbindung nach Updates suchen und eine neue Version zum Laden anbieten. Umsetzung: Standard-Service-Worker-Updateprüfung mit vollständig vorbereiteter App-Shell, Zustimmung vor Aktivierung und Neustart; „Später“ hält die laufende Version. Sichtbare Ergänzung ausschliesslich der neue Updatehinweis; übrige GUI unter Bestandsschutz. Gespeicherte Daten bleiben erhalten; lokaler Medienzugriff ggf. erneut freizugeben. Keine automatische Veröffentlichung oder PR-Übernahme.

## F20 – App-Breite ohne feste Obergrenze

Auf ausdrücklichen Nutzerwunsch die 850-CSS-Pixel-Obergrenze der App-Fläche aufheben. Volle verfügbare Tabletbreite bei erhaltenen Rand-/Safe-Area-Abständen; Hochformat bleibt der primäre Betriebsmodus.

## Aktueller Beschluss F17 – ausschliesslich Patient (09.11.2026)

- Ein fiktiver Patient **Ernst** ist die einzige Zielgruppe. Kein Angehörigenmodus, keine zweite Timeline, keine Rollenumschaltung. Nur P-Karten und Patienten-Alma-Dialog sind aktiv; alte A-QRs und die bisherige Misch-PDF bleiben Archiv und dürfen nicht auf Patienteninhalte umgeleitet werden.
- Patienten-Karten: sechs Basiskarten und sieben weitere Übungen, also **13 aktive Karten**, darunter **acht Übungsvideos**. Die lokale Medienablage, das bewusst bestätigte Speichern und alle klinischen Grenzen bleiben erhalten.
- **GUI-Freeze:** Nur Entfernung des Perspektivenwechsels ist mit F17 ausdrücklich freigegeben. Die zuvor besprochene Zweispalten-Startseite (links Videos, rechts nächster Physiotermin und Berichte/Erklärungen) ist **Vorschlag V16, noch nicht implementierungsfreigegeben**.
