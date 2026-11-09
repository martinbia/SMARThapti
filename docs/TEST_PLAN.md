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
| T09 | Rolle Patient/Angehörige wechseln | Passende Startkarten und Inhalte, private Anliegen nicht versehentlich geteilt | offen |
| T10 | Karte manuell wählen | Gleicher Karteninhalt wie QR-Scan | offen |
| T11 | Übungskarte vor jeglichem Meilenstein öffnen | Übungsansicht/Medien-Fallback erreichbar, kein Freigabe-Gate | offen |
| T12 | lokales MP4 aus `Documents/SMART` abspielen; Zurück/Home | Bild/Ton stoppen sofort; kein Hintergrundvideo, kein Server-Download | offen |
| T13 | lokale Alma-MP3 aus `Documents/SMART` abspielen; Antwortbuttons/Zurück | Richtiger Folgeknoten, Player endet bei Navigation, kein Server-Download | offen |
| T14 | Mediendatei im lokalen Ordner fehlt/umbenannt/ungültig | Kein kaputter Player, verständlicher Dateihinweis und Textalternative | offen |
| T15 | Termin scannen, **Abbrechen** | Timeline unverändert | offen |
| T16 | Termin scannen, **Hinzufügen**, wiederholen | Genau ein Event mit gleichem Eventkey; keine Doppelung über Rollen-Karte | offen |
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

Je Szene S1–S6 beobachten: eigenständige Aufgabenerfüllung, Irrtümer beim Scannen/Bestätigen, Aufwand gegenüber Papier, Wert von Übungs- und Unterstützungsvideos, Quellenverständnis, empfundene Autonomie/Belastung. Ergebnisse getrennt nach Patienten- und Angehörigenrolle zusammenfassen. Keine echten Interviewrohdaten in GitHub.

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
