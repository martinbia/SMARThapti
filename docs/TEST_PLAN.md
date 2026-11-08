# Testplan – Interview-Demonstrator

**Status:** ENTWURF v0.1, 08.11.2026. **F:** Muss-Verhalten prüfen; **V:** konkrete Testmethoden.  
**Heute:** noch **kein** Software-/Gerätetest durchgeführt. Alle Tests sind `NICHT AUSGEFÜHRT`.

## Vorbedingungen

- Testgerät mit aktuellem Chrome/Android, bekannter Displayauflösung und sichtbaren oberen/unteren Systemleisten; wenn möglich PWA installiert.
- Gedruckte, ausreichend grosse QR-Muster der `SH1:...`-IDs; gute/schwache Beleuchtung, verschiedene Abstände.
- Nur fiktive JSON-Daten; keine Originalunterlagen, realen Personeninformationen oder ungeprüften Therapievideos.
- Für Player-Test neutrale, rechtlich unproblematische Test-MP4 und Test-MP3; sonst „Medien fehlen“ ausdrücklich testen.
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
| T12 | neutrales MP4 abspielen; Zurück/Home | Bild/Ton stoppen sofort; kein Hintergrundvideo | offen |
| T13 | Alma-MP3 abspielen; Antwortbuttons/Zurück | Richtiger Folgeknoten, Player endet bei Navigation | offen |
| T14 | Mediendatei fehlt/404 | Kein kaputter Player, sichtbare Textalternative | offen |
| T15 | Termin scannen, **Abbrechen** | Timeline unverändert | offen |
| T16 | Termin scannen, **Hinzufügen**, wiederholen | Genau ein Event mit gleichem Eventkey; keine Doppelung über Rollen-Karte | offen |
| T17 | Meilenstein bestätigen / ohne Bestätigung verlassen | Nur bewusst bestätigte Selbstangabe erscheint als solche | offen |
| T18 | Video anschauen und beenden | **Keine** neue „Übung durchgeführt“-Markierung | offen |
| T19 | Timeline/Langtext/Datum und Quellen | Allgemeine, persönliche Demo-Quelle und eigene Angabe visuell unterscheidbar; fiktive Daten erkennbar | offen |
| T20 | Demo-Reset und Neustart | Selbstberichte/Bestätigungen zurückgesetzt; Grunddaten korrekt; Medien/Kamera geschlossen | offen |

## Reale Hardwareprüfung – früh durchführen (F)

1. **Viewport protokollieren:** Tabletmodell, Android/Chrome-Version, Browser/PWA-Modus, CSS-Viewport-Breite/Höhe und sichtbare Systemleisten; Screenshots nur mit fiktiven Inhalten.
2. **QR-Erkennung testen:** Frontkamera initial; Lesedistanz, Erkennungsdauer, Spiegelung, Fokus und Beleuchtung beobachten; Rückkamera und Touch-Alternative testen.
3. **Lesbarkeit und Bedienbarkeit:** Schrift, Touch-Ziele, Scrollaufwand, Position von Zurück/Stopp, Videogrösse im Portrait und Landscape.
4. **Medien- und Stream-Lebenszyklus:** Zurück, Home, Rollenwechsel, Browserwechsel, Screen-Lock (soweit prüfbar); keine unbeabsichtigte Fortsetzung.
5. **Offline nur falls explizit beauftragt:** PWA-Cache/Medienumfang getrennt testen; ansonsten keine Offline-Zusage.

## Interview-Usability (Forschungsziel, nicht klinische Wirksamkeit)

Je Szene S1–S6 beobachten: eigenständige Aufgabenerfüllung, Irrtümer beim Scannen/Bestätigen, Aufwand gegenüber Papier, Wert von Übungs- und Unterstützungsvideos, Quellenverständnis, empfundene Autonomie/Belastung. Ergebnisse getrennt nach Patienten- und Angehörigenrolle zusammenfassen. Keine echten Interviewrohdaten in GitHub.

## Dokumentationsformat je Test

`Datum | Gerät/OS/Browser | Commit | Test-ID | bestanden/nicht bestanden/nicht getestet | Beobachtung | Reproduktionsschritte | Screenshot (nur fiktiv) | Folgeauftrag`.

**Abnahmesperre:** Ein erfolgreiches Technik-Testvideo ist keine klinische Freigabe. Ohne genehmigte Therapieinhalte bleibt klinische Nutzbarkeit ausdrücklich **nicht geprüft**.
