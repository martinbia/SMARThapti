# Testplan – Interview-Demonstrator

**Status:** ENTWURF v0.1, 08.11.2026. **F:** Muss-Verhalten prüfen; **V:** konkrete Testmethoden.  
**Heute:** noch **kein** Software-/Gerätetest durchgeführt. Alle Tests sind `NICHT AUSGEFÜHRT`.

## Vorbedingungen

- Testgerät mit aktuellem Chrome/Android, bekannter Displayauflösung und sichtbaren oberen/unteren Systemleisten; wenn möglich PWA installiert.
- Gedruckte, ausreichend grosse QR-Muster der `SH1:...`-IDs; gute/schwache Beleuchtung, verschiedene Abstände.
- Nur fiktive JSON-Daten; keine Originalunterlagen, realen Personeninformationen oder ungeprüften Therapievideos.
- Für Player-Test neutrale, rechtlich unproblematische MP4/MP3 **lokal in `Internal storage/Documents/SMART` auf dem Android-Tablet ablegen**; Dateinamen mit `content/demo_manifest.json` abgleichen. Keine Medien ins GitHub-Repo legen. Fehlende/gesperrte Dateien ausdrücklich testen.
- GitHub Pages erst nach Konfiguration und Live-Aufruf als „erreichbar“ markieren.

## Prüftabelle

| ID | Test | Erwartetes Ergebnis | Stand |
| --- | --- | --- | --- |
| T01 | GitHub-Pages-URL / Reload / Direktlink | PWA lädt unter `/SMARThapti/`, keine falschen absoluten Asset-Pfade | offen |
| T02 | Android PWA-Installation | App startet standalone; Android-Systemleisten/Navigation werden respektiert | offen |
| T03 | Portrait real, alle U0–U9 | Keine verdeckten Buttons, kein abgeschnittener Inhalt, kein unnötiger doppelter Header | offen |
| T04 | Landscape-Drehung | Kernfunktionen bleiben erreichbar; keine Drehpflicht | offen |
| T05 | Frontkamera, QR `P-INF-001` | Echter Scan öffnet richtige Karte ohne Bestätigung/Speichern | offen |
| T06 | Rückkamerawechsel + Berechtigungsablehnung | Kamerawechsel bzw. sofort funktionierende Touch-Auswahl | offen |
| T07 | schwaches Licht, kleines/unscharfes QR | Verständlicher Zustand; Touch als Alternative; keine Endlosschleife | offen |
| T08 | ungültiger/andersformatiger QR | Neutrale Fehlermeldung, erneuter Scan möglich | offen |
| T09 | Patient ohne Rollenwechsel | Keine Angehörigenansicht und keine Wechsel-Buttons; alle P-Karten bleiben erreichbar | offen |
| T10 | Karte manuell wählen | Gleicher Karteninhalt wie QR-Scan | offen |
| T11 | Übungskarte vor jeglichem Meilenstein öffnen | Übungsansicht/Medien-Fallback erreichbar, kein Freigabe-Gate | offen |
| T12 | lokales MP4 aus `Documents/SMART` abspielen; Zurück/Home | Bild/Ton stoppen sofort; kein Hintergrundvideo, kein Server-Download | offen |
| T13 | lokale Alma-MP3 aus `Documents/SMART` abspielen; Antwortbuttons/Zurück | Richtiger Folgeknoten, Player endet bei Navigation, kein Server-Download | offen |
| T14 | Mediendatei im lokalen Ordner fehlt/umbenannt/ungültig | Kein kaputter Player, verständlicher Dateihinweis und Textalternative | offen |
| T15 | Termin scannen, **Abbrechen** | Timeline unverändert | offen |
| T16 | Patiententermin scannen, **Hinzufügen**, wiederholen | Genau ein Event mit gleichem Eventkey; keine Doppelung bei wiederholtem P-QR | offen |
| T17 | Meilenstein bestätigen / ohne Bestätigung verlassen | Nur bewusst bestätigte Selbstangabe erscheint als solche | offen |
| T18 | Video anschauen und beenden | **Keine** neue „Übung durchgeführt“-Markierung | offen |
| T19 | Timeline/Langtext/Datum und Quellen | Allgemeine, persönliche Demo-Quelle und eigene Angabe visuell unterscheidbar; fiktive Daten erkennbar | offen |
| T20 | Demo-Reset und Neustart | Selbstberichte/Bestätigungen zurückgesetzt; Grunddaten korrekt; Medien/Kamera geschlossen | offen |
| T21 | In Android-Chrome/PWA Ordner `Internal storage/Documents/SMART` verbinden | Erst nach Benutzeraktion/Berechtigung werden erwartete MP4-/MP3-Dateien über IDs/Dateinamen gefunden | offen |
| T22 | Abspielen bei verfügbarer Internetverbindung beobachten | Medien stammen vom lokalen Tablet, **keine** HTTP-/GitHub-Pages-/CDN-Medienabrufe oder Uploads | offen |
| T23 | Ordnerauswahl abbrechen/Berechtigung entziehen/API nicht verfügbar | Keine Endlosschleife; Textalternative und native lokale Einzel-/Mehrfachdateiauswahl funktionieren | offen |
| T24 | Fehlender/falscher Ordner, geänderte Dateinamen oder falsche Endung | Korrekte Fehlermeldung; andere Funktionen und lokale vorhandene Medien bleiben nutzbar | offen |
| T25 | PWA vollständig schliessen/neustarten; Verknüpfung erneut prüfen | Berechtigung falls zulässig weiterverwendet oder transparent erneut angefordert; Demo-Reset verändert lokale Dateien nicht | offen |
| T26 | QR-SVGs (`assets/qr/`) und PDF mit echtem QR-Decoder prüfen | Alle **11 QR-Payloads** ergeben exakt `SH1:<CARD-ID>`; keine URL und keine medizinischen/personalen Angaben | statisch geprüft (PDF-Decoder 11/11), realer Tablet-Test offen |
| T27 | Faltkarten-PDF mit 100 % auf A4 drucken, ausschneiden und falten | QR und Label liegen auf Aussenseiten, nicht gespiegelt/abgeschnitten; Frontkamera scannt mit realistischem Abstand | offen |
| T28 | `P-INF-003`, `A-INF-003` scannen, MP3 vorhanden/fehlt | Beide öffnen den richtigen Alma-Dialog; nur lokale MP3, Text und Antwortbuttons auch ohne MP3 verfügbar | offen |

## Reale Hardwareprüfung – früh durchführen (F)

1. **Viewport protokollieren:** Tabletmodell, Android/Chrome-Version, Browser/PWA-Modus, CSS-Viewport-Breite/Höhe und sichtbare Systemleisten; Screenshots nur mit fiktiven Inhalten.
2. **QR-Erkennung testen:** Frontkamera initial; Lesedistanz, Erkennungsdauer, Spiegelung, Fokus und Beleuchtung beobachten; Rückkamera und Touch-Alternative testen.
3. **Lesbarkeit und Bedienbarkeit:** Schrift, Touch-Ziele, Scrollaufwand, Position von Zurück/Stopp, Videogrösse im Portrait und Landscape.
4. **Medien- und Stream-Lebenszyklus:** Zurück, Home, Rollenwechsel, Browserwechsel, Screen-Lock (soweit prüfbar); keine unbeabsichtigte Fortsetzung.
   Zusätzlich: **lokales Ordner-Grant**, Datei-Zuordnung nach Dateiname, Abbruch, Berechtigungsentzug, Neustart und Nachweis, dass beim Video-/MP3-Start keine Mediendatei von GitHub geladen wird.
5. **Offline nur falls explizit beauftragt:** PWA-Cache/Medienumfang getrennt testen; ansonsten keine Offline-Zusage.

## Interview-Usability (Forschungsziel, nicht klinische Wirksamkeit)

Je Szene S1–S6 beobachten: eigenständige Aufgabenerfüllung, Irrtümer beim Scannen/Bestätigen, Aufwand gegenüber Papier, Wert von Übungs- und Unterstützungsvideos, Quellenverständnis, empfundene Autonomie/Belastung. Ergebnisse ausschliesslich für die Patientenperspektive zusammenfassen. Keine echten Interviewrohdaten in GitHub.

## Dokumentationsformat je Test

`Datum | Gerät/OS/Browser | Commit | Test-ID | bestanden/nicht bestanden/nicht getestet | Beobachtung | Reproduktionsschritte | Screenshot (nur fiktiv) | Folgeauftrag`.

**Abnahmesperre:** Ein erfolgreiches Technik-Testvideo ist keine klinische Freigabe. Ohne genehmigte Therapieinhalte bleibt klinische Nutzbarkeit ausdrücklich **nicht geprüft**.

## Aktueller Software-Teststand – PWA-Draft vom 08.11.2026

Die obige Tabelle dokumentiert den ursprünglichen Planungsstand. In der Cloud wurden jetzt 19 automatisierte Playwright-Tests gegen den Produktionsbuild in Linux-Chromium erfolgreich ausgeführt; siehe `IMPLEMENTATION.md` und `tests/pwa.spec.js`.

| Bereich | Jetzt geprüft | Weiterhin nicht getestet |
| --- | --- | --- |
| T01–T04 | Build, Projektpfad, Manifest, Offline-App-Shell, drei CSS-Viewportgrössen | Live-Pages, Android-Installation, reale Systemleisten |
| T05–T10, T26, T28 | Alle 11 SVG-QRs dekodiert, Touch-Ziele, synthetischer Kamerastream, Track-Stopp, Kameraverweigerung, Alma-Ziele | Gedruckte Codes mit realer Front-/Rückkamera; PDF nicht erneut dekodiert |
| T11–T20 | Unabhängiger Übungszugang, lokale MP4/MP3, Fehlerfallback, Stopp/Blob-Freigabe, Bestätigung/Abbruch, Duplikatschutz, Rollenprivatsphäre, Quellen und Reset | Reale Android-Codec-/Berechtigungs- und Screen-Lock-Zustände |
| T21–T25 | Native Dateibindung über Browser-Automation, fehlende Ordner-API, kein Mediencache, Reset erhält Dateien | Android-Ordnerdialog, echte Berechtigungsablehnung/-entzug, Dateipfadprüfung am Gerät |
| T27 | Bestehende Druckmaterialien unverändert | Physischer Ausdruck/Falten und Scan |

Alle realen Tablet-Tests bleiben offen. Automatisierte Browserprüfungen sind keine klinische Freigabe.

## Ergänzende Einstiegstests vom 09.11.2026

T29: Bergwiese ohne Menü beim Erstaufruf, Kamera nach Freigabe, Anna-/Ernst-QR wählen automatisch die Perspektive; Touch und Enter öffnen das Menü. T30: 3 s Einblenden, fünf Vorführungen à 2,4 s, 3 s Ausblenden, 10 s ausschliesslich Hintergrundbild, Wiederholung und Timer-Ende bei Navigation. T31: Kopfzeile „Für Ernst/Anna“ einzeilig, manueller Wechsel nachgeordnet, reduzierte Bewegungseinstellung ohne Handbewegung. Browserautomation prüft diese Abläufe; Darstellung, Einwilligung, Kamerafokus und Systemleisten auf dem realen Android-Tablet bleiben offen.

T32: Roter Punkt erst bei laufendem Stream und bereiter QR-Erkennung; bei fehlender/verweigerter Kamera kein Punkt. Punkt bleibt während der Animationspause sichtbar und verschwindet nach erkanntem QR oder Navigation. Browserautomation mit Kamerastream prüft Ein-/Ausschalten; Sichtbarkeit bei realen Android-Systemleisten am Tablet prüfen.

T33: Abschaltknopf auf Einstieg, Menü, Karten, Detail, Player/Dialog, Bestätigung, Timeline, Scanner, Moderator und Ladefehler. Schwarze Fläche ohne Punkt/Player/Animation, Wiederaufnahme erst nach Antippen/Enter und Rückkehr zur Bergwiese. T34: Kamera aus nach Abschalten, auch bei erst später eintreffender Freigabe; kein automatisches Aufwecken durch URL-/Sichtbarkeitswechsel/Reload. T35: Menü → QR-Karte scannen zeigt bei aktivem Stream den roten Punkt; Abschalten entfernt ihn, lokale Bestätigungen und Dateien bleiben erhalten. Browserautomation ergänzt; Bildschirmhelligkeit, reale Kamera und Android-Systemleisten am Zieltablet prüfen.

T36: Sieben neue QR-SVGs dekodieren und passende Filme/Karten öffnen. T37: Lokale Datei mit Leerzeichen zuordnen, speichern, Reload/Demo-Reset/neuen Build prüfen; Sicherung exportieren/importieren, unzulässige Pfade ablehnen. T38: Kopfzeile mit klaren 56-px-Zurückbuttons und dezentem Zahnrad am realen Tablet prüfen. Android-Dateifreigabe und tatsächliche sieben Filme weiterhin am Tablet prüfen.

Positionsanpassung auf Nutzerwunsch: Abschalten im Menü und allen Unteransichten als letztes Element der ersten Kopfzeile; beim Scrollen erreichbar, kein reservierter unterer Streifen. Alm-Einstieg behält die bisherige Position. Darstellung bei schmaler Breite und Tabletformat sowie schwarzer Ruhemodus weiterhin prüfen.

T39: Native Verzeichnisauswahl ohne Directory-API liest unterstützte SMART-Dateien ein und füllt Zuordnungslisten ohne zweiten Picker. T40: Verbergen/Wiederanzeigen während des Ordnerdialogs erhält das Ergebnis; unterstützter Dateipicker verwendet den verbundenen Ordner und keinen Galerie-MIME-Filter. Automatisiert mit echten Browser-Dateielementen sowie simulierten File-System-Handles prüfen; tatsächlicher Android-Dokumentenanbieter bleibt am Gerät zu testen.

T41: Zwei reale Service-Worker-Versionen ausliefern: Erstinstallation ohne Hinweis; Update wird vorbereitet und angeboten; keine Aktivierung ohne Zustimmung; Später hält Sitzung; nach Neustart erneut anbieten; akzeptiertes Update stoppt Kamera, lädt neue Version und behält Filmzuordnungen. T42: Offline-Check ohne Unterbrechung, vorbereitetes Update im Ruhemodus verborgen, nach Wecken sichtbar. Reale installierte Android-PWA und mehrere Tabs am Tablet weiter prüfen. Unbeteiligte GUI gegen Arbeitsbaseline vergleichen; keine freigegebenen Baselines ändern.

## Patientenfokus-Regressionsprüfungen (F17, 09.11.2026)

- **T43:** Ein fiktiver Patient, sechs Basiskarten und sieben zusätzliche P-Übungskarten, nur P-Alma-Knoten. Keine A-Karten oder A-Medien in aktiven JSON-Daten.
- **T44:** Das Menü hat keinen Perspektivwechsel; alle acht Patienten-Übungsvideos sowie die 13 P-Karten bleiben auswählbar.
- **T45:** Historische A-QRs werden als inaktiv erkannt und öffnen keine Angehörigenansicht. Keine Umleitung auf eine P-Karte.
- **T46:** Alte lokal gespeicherte Angehörigen-Ereignisse werden nicht in der Patienten-Timeline angezeigt; P-Termine und P-Meilensteine behalten ihre bewusste Bestätigung, Idempotenz und lokale Speicherung.
- **T47:** Der alte gemischte Druckbogen ist nicht als aktueller Patientendruckbogen verlinkt; neue P-QR-Karten bleiben verfügbar.

Automatisierte Browserregressionen und echte Android-Tabletprüfung getrennt dokumentieren. **Kein Tablet-Test oder klinische Freigabe behaupten, solange nicht erfolgt.**
