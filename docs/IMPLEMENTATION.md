# Erster funktionsfähiger PWA-Draft

Stand: 08.11.2026. Umsetzung nach ausdrücklichem Auftrag im Cloud-Chat. Fiktive Interview-Demo, keine klinische Freigabe.

## Start und Entwicklung

Node.js 24, npm und für die Tests Chromium sowie ffmpeg verwenden:

```sh
npm ci --cache /workspace/.npm-cache
npm run build
npm run dev
```

Projektpfad ist `/SMARThapti/`. `npm run preview -- --port 4173` startet den Produktionsbuild. `npm test` startet selbst einen Previewserver. In der vorbereiteten Cloud-Umgebung lautet der Testaufruf `CHROMIUM_PATH=/usr/bin/chromium npm test`. Andernorts zuerst `npx playwright install --with-deps chromium` ausführen und ffmpeg installieren. Testmedien werden mit ffmpeg neutral in einem temporären Verzeichnis erzeugt und danach gelöscht; keine Mediendateien committen.

Vite bündelt die Anwendung einschliesslich jsQR ohne CDN. Der Build kopiert vorhandene Textdaten, QR-Dateien und Druckmaterialien unverändert nach `dist`. Der Service Worker speichert nur die explizite App-Shell und JSON-Daten; der Cache wird über einen Inhaltshash versioniert. Nach erfolgreicher Erstladung sind diese Inhalte offline nutzbar. Medien, Blob-URLs und Druckmaterialien werden nicht in den App-Cache aufgenommen. Ein neuer Service Worker aktiviert sich nach Schliessen der bisherigen App-Fenster.

## Bedienung und Funktionen

- Patient Ernst und Angehörige Anna besitzen getrennte Einstiege, Karten, Ziele und Dialoge. Perspektivwechsel ist keine Authentifizierung.
- Alle elf vorhandenen `SH1:<CARD-ID>`-Kennungen öffnen dieselben Inhalte wie die Touch-Auswahl. Die beiden Alma-Karten öffnen direkt den passenden vorbereiteten Dialog. Fremde Rollen-Karten wechseln sichtbar zur zugehörigen Perspektive.
- Der Kamera-Scanner fragt zuerst die Frontkamera an und bietet Kamerawechsel und eine jederzeit erreichbare Touch-Alternative. jsQR dekodiert die Kamerabilder lokal; Mikrofon, Speech-/KI-Dienste und Uploads werden nicht verwendet.
- Termin- und Meilensteinkarten führen zu einer gesonderten Bestätigung mit Hinzufügen/Abbrechen. Speicherung erfolgt unter dem stabilen Ereignisschlüssel. Der gemeinsame Termin `J10` wird rollenübergreifend nur einmal gespeichert; private Selbstangaben werden nach Perspektive gefiltert. Videoansicht verändert keinen Eintrag.
- Fiktive Bestätigungen und Szenario werden in LocalStorage gespeichert. Bei gesperrtem Speicher funktioniert die Sitzung weiter mit Hinweis. Der Moderator-Reset löscht nur diese Bestätigungen, keine Medien. Die Szenarien ändern den fiktiven Interviewzeitpunkt; alle Karten bleiben erreichbar, insbesondere Übungen ohne Meilenstein.
- Portrait-Layout mit `100dvh`, Safe-Area-Abständen, scrollendem Inhalt und mindestens 48 CSS-px hohen Bedienelementen; kein Vollbildzwang.

## Lokale Medien vorbereiten

1. Nur freigegebene Inhalte oder ausdrücklich neutrale Techniktest-Dateien auf dem Android-Tablet unter **Internal storage/Documents/SMART** ablegen.
2. In „Demo vorbereiten“ den Ordner lesend verbinden, falls `showDirectoryPicker()` unterstützt wird. Insbesondere auf Android ist die API nicht verlässlich vorauszusetzen: Die native Mehrfach-Dateiauswahl bleibt der gleichwertige Weg.
3. Die fünf erwarteten Dateinamen stehen im Moderatorbereich und im bestehenden Manifest. Bei nativer Auswahl möglichst alle fünf Dateien gleichzeitig wählen. Nicht passende Dateinamen werden nicht eingebunden.
4. Die Dateien bleiben ausschliesslich lokal. Wiedergabe verwendet Blob-URLs; weder Cache noch IndexedDB enthalten Kopien. Dateien/Handles verbleiben nur im Sitzungsspeicher. Nach Neustart erneut verbinden; bei Rechteverlust erneut Ordner oder Dateien wählen.
5. Video/MP3 bieten native Start-/Pause-Steuerung sowie Stopp. Navigation, Perspektivwechsel, Dialogende und Verbergen der App stoppen die Wiedergabe, Kameratracks werden beendet, Blob-URLs freigegeben. Bei ungültigen Dateien bleibt der Text lesbar.

Dateiauswahl kann den menschlich vereinbarten Android-Ordner nicht technisch erzwingen: Moderatorpersonen müssen ausdrücklich `Documents/SMART` wählen. Keine Datei wird automatisch anhand eines absoluten Android-Pfads geöffnet. Die Medien bleiben nicht klinisch geprüft, solange keine separate fachliche Freigabe vorliegt.

## Verifikation in der Cloud

Produktionsbuild erfolgreich. 19 Playwright-Tests in echtem Linux-Chromium bestanden:

- Manifest-, Quellen-, Medien- und Dialogreferenzen sowie exakte Dekodierung aller elf bestehenden SVG-QR-Codes und passende UI-Ziele.
- Bestätigen, Abbrechen, gemeinsamer Termin ohne Duplikate, privater Angehörigen-Meilenstein, Neuladen und Reset.
- Kameraverweigerung und nicht unterstützter Ordner-Picker mit nutzbarer Touch-/Dateialternative.
- Kamerapipeline mit eingespeistem SVG-QR als Kamerastream, Frontkamera-Anforderung und Track-Stopp. Dies ist **kein realer gedruckter Kameratest**.
- Tatsächliche lokale MP4-/MP3-Wiedergabe neutraler temporärer Dateien; Stopp und Blob-Freigabe bei Navigation/Rollenwechsel; ungültige Datei mit Textfallback; Reset erhält Medienverknüpfung.
- Service-Worker-Erstladung, Offline-Reload/Textnavigation und Cache ohne Medien.
- Layout bei 800×1060, 1060×700 und 360×640 CSS-Pixeln ohne horizontales Überlaufen; Touch-Zielhöhen geprüft.

Die bestehenden PDF-/QR-Dateien und redaktionellen JSON-Dateien bleiben unverändert. Der bestehende PDF-Decoder-Nachweis in T26 wurde nicht erneut ausgeführt; neu geprüft wurden alle elf SVGs. Keine reale Android-Hardware oder klinische Nutzbarkeit geprüft.

## GitHub Pages aktivieren

1. Implementierungs-PR prüfen und nach `main` mergen.
2. Im Repository **Settings → Pages → Build and deployment → Source: GitHub Actions** wählen. Aktuelle Pages-Einstellungen konnten aus der Cloud nicht verifiziert werden.
3. Workflow **PWA checks and Pages** auf `main` ausführen lassen, bei Bedarf über **Actions → Run workflow** starten. Build und Tests müssen erfolgreich sein. PRs werden geprüft, aber nicht veröffentlicht.
4. Nach erfolgreichem Deployment Zieladresse `https://martinbia.github.io/SMARThapti/` öffnen. Dies ist vor erfolgreichem Deployment **keine verifizierte Live-Demo**.
5. Auf Android-Chrome über „App installieren“ bzw. „Zum Startbildschirm hinzufügen“ installieren. HTTPS ist für Kamera und Service Worker erforderlich.

## Reale Tablet-Prüfung – weiterhin offen

Gemäss `docs/TEST_PLAN.md` T01–T28 am tatsächlichen Zielgerät protokollieren:

- Tabletmodell, Android-/Chrome-Version, Browser- und installierter PWA-Modus, verfügbarer CSS-Viewport bei sichtbaren oberen/unteren Systemleisten. Portrait und Landscape sowie lange Texte und grosse Schrift prüfen.
- Alle elf **gedruckten** Codes mit Front-/Rückkamera, verschiedener Beleuchtung, Distanz, Fokus und verweigerter Kamerafreigabe testen. Wechsel/Verlassen/Screen-Lock darf keine Kamera offenhalten.
- Nativen Ordner-/Dateidialog testen; Auswahl abbrechen, falschen Ordner wählen, Datei umbenennen, Berechtigung entziehen und App neu starten. Fünf Dateinamen abgleichen, MP4/MP3 starten, pausieren, stoppen und über Navigation/Rollenwechsel beenden.
- Netzwerkbeobachtung auf dem Tablet: keine MP4-/MP3-Downloads oder Uploads, nur lokal gewählte Dateien. Rechte-/Codecfehler müssen Text und Dateiauswahl zugänglich lassen.
- PWA-Installation, Pages-Direktaufruf/Reload, Offline-App-Shell nach Erstladung, bestätigte Einträge und Reset; vorhandene Karten-PDF bei 100 % drucken und physisch falten/scannen.
- Klinische, redaktionelle und lizenzrechtliche Freigabe konkreter Medien bleibt unabhängig von diesen technischen Tests notwendig.
