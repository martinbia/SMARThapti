# Codex-Arbeitsregeln für SMARThapti

**Status:** VERBINDLICHE PROJEKT-ARBEITSREGELN v0.1, 08.11.2026.  
**Wichtig:** Diese Regeln autorisieren für sich genommen **keine Implementierung**. `CODEX_START.md` hat Status „VORBEREITET / NICHT FREIGEGEBEN“.

## 1. Auftrag und Priorität

1. Zuerst den aktuellen Repository-Stand und diese Datei lesen, danach `README_START_HIER.md` und `docs/DECISIONS.md`.
2. **FESTGELEGT** aus den Projektanweisungen bzw. `docs/DECISIONS.md` beachten; **VORSCHLAG** und **OFFEN** nicht stillschweigend zu beschlossenen Anforderungen umdeuten.
3. Bei Widersprüchen nicht improvisieren: Kontext, betroffene Dateien, Konflikt und einen begrenzten Lösungsvorschlag melden.
4. Implementierung erst nach einem expliziten, vom Projektkanal erteilten Codex-Auftrag. Dokumente in `main` oder ein neuer Commit starten keinen Auftrag.
5. Nur ausdrücklich beauftragte Dateien/Funktionen ändern. Fremde Strukturen, README und funktionierendes Verhalten erhalten.

## 2. Domäne, Inhalte und Sicherheit

- Kein echtes Patientenprofil, keine realen Termine, Kontaktdaten oder Krankenakten in Demo/Repository/Logs.
- Keine vertraulichen Ausgangsunterlagen, Original-Personas, Interviewprotokolle, Screenshots von EPIC oder reale Videos veröffentlichen.
- Nur vorbereitete Inhalte und fiktive Demo-Dokumente. **Keine Medikamentendosierung, Belastungsfreigaben, Übungsdosierung, Hebe-/Transferanweisungen oder Therapieempfehlungen erfinden.**
- Quellenklasse und Aktualitätsdatum sichtbar: `allgemein`, `persönliche Demo-Vorgabe (fiktiv)`, `eigene Angabe`; fehlende klinische Prüfung als solche markieren.
- EPIC ist nur eine spätere Integrationsperspektive, nicht Teil der PWA. Keine API-Keys, externen LLM-/Speech-Services, Spracherkennung oder versteckte Netzwerk-Uploads.
- Angehörigenansicht eigenständig; eigene Sorgen nicht ungefragt in gemeinsamer Timeline zeigen. Perspektivwechsel ist **keine Authentifizierung**.
- Technische Videos und MP3s dürfen keine unvalidierten Therapieanweisungen enthalten. Kein automatischer Schluss aus Videoansicht auf Übungsdurchführung.
- **FESTGELEGT:** Alle Videos, MP3s und sonstigen Mediendateien ausschliesslich **lokal auf dem Android-Tablet** unter `Internal storage/Documents/SMART` bereitstellen. Keine Medien-Dateien in GitHub Pages, Repository, CDN oder auf einen Server hochladen.

## 3. UX- und Zustandsregeln

- Hochformat ist der primäre Tabletmodus. Obere Android-Statusleiste und untere Systemnavigation bleiben sichtbar; gesamte verfügbare PWA-Fläche prüfen. Nicht zwei eigene Header/Navigationsebenen stapeln.
- Die PWA muss ohne eigenes Smartphone durch Tablet, Papier und haptische Karten nutzbar sein.
- Echte QR-Kameraerkennung, zuerst Frontkamera versuchen, Kamerawahl/Fallback bieten; Touch-Auswahl bleibt gleichwertig.
- QR-Scan **öffnet** Inhalte. Nur ausdrücklich bestätigte `Termin`-/`Meilenstein`-Aktionen können neue Timeline-Einträge erzeugen; wiederholtes Scannen erzeugt keine Duplikate.
- Übungsvideos sind unabhängig von erreichten Meilensteinen erreichbar. Audio/Video stoppen beim Verlassen der Ansicht und können jederzeit manuell gestoppt werden. Kamera beim Verlassen/Wechsel beenden.
- Kein Leistungsdruck, keine Ranglisten, keine fixen Genesungsversprechen. Selbstbestimmung und Alltagsziele priorisieren.
- Vorbereitete Dialoge mit Text, optionalem MP3 und auswählbaren Buttons; keine generative Laufzeitausgabe.

## 4. Technik und GitHub

- Vorgesehen ist eine statische, installierbare PWA auf GitHub Pages unter dem Projektpfad `/SMARThapti/`. Pages-Settings erst prüfen; keine angenommene Aktivierung behaupten.
- Inhalte, Medienreferenzen, Karten und Dialoge getrennt vom Anwendungs-Code halten; Daten über stabile IDs verknüpfen. Fehlende Dateien führen zu hilfreichen Platzhaltern, nicht zu leeren oder kaputten Playern.
- Manifest-Medien referenzieren **nur Dateinamen/Medien-IDs**, keine `https://`-Medien-URLs und keine `file://`- oder absolute Android-Pfade. Beim Abspielen über eine vom Nutzer ausdrücklich freigegebene lokale Ordner-/Dateiauswahl lesen; Lesezugriff genügt. Keine Kopie in Cache, IndexedDB oder Service-Worker-Medienspeicher anlegen.
- **Vorschlag:** Ordner in der Moderatorvorbereitung über `showDirectoryPicker()` verbinden, Dateien anhand des Namens auflösen, vorhandenen Ordner-Handle wenn möglich wiederverwenden; wenn API/Berechtigung fehlt, lokale MP4-/MP3-Datei(en) über native Dateiauswahl verbinden. Android/Chrome-Kompatibilität am realen Tablet verifizieren. Eine PWA darf nicht ohne Benutzeraktion direkt über den bloßen Ordnerpfad zugreifen.
- Vor Änderungen `git status`, Branch und vorhandene Konfigurationen prüfen. Nach Änderungen Build/Tests und reale Tablet-Tests laut `docs/TEST_PLAN.md` dokumentieren, **einschliesslich Ordnerzugriff, Berechtigungsverlust und lokaler Wiedergabe**. Wenn keine Hardware verfügbar, klar als „nicht getestet“ melden.
- Keine externen Tracker, ungesicherten Uploads oder personenbezogenen Logs. Vorsicht mit öffentlichem GitHub Pages und Client-Speicherung.
- Änderungen an einer Anforderung in **allen betroffenen Dateien** synchronisieren, insbesondere Entscheidungen, Spezifikation, Beispieldaten, Dialogverweise und Tests.
- Nach Implementierung: betroffene Dateien, Tests, bekannte Abweichungen und konkreten nächsten Testschritt im PR oder Abschlussbericht aufführen.

## 5. Klinische und redaktionelle Sperre

Ärzte-/Physio-Validierung von Therapieclips, Übungsinstruktionen, individuellen Vorgaben und Notfallhinweisen ist vor realitätsnahen Patiententests erforderlich. Fehlt sie, nur neutrale Techniktest-Inhalte zeigen und klar als **nicht klinisch geprüft / keine Therapieanweisung** kennzeichnen.
