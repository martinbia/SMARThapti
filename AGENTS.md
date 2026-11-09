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
- **F17 (09.11.2026): Nur Patienten.** Angehörigenmodus und Rollenwechsel entfallen. Historische A-QR-Codes bleiben Archiv, sind aber in der aktuellen PWA inaktiv und dürfen nicht auf Patientenkarten umgeleitet werden.
- Technische Videos und MP3s dürfen keine unvalidierten Therapieanweisungen enthalten. Kein automatischer Schluss aus Videoansicht auf Übungsdurchführung.
- **FESTGELEGT:** Alle Videos, MP3s und sonstigen Mediendateien ausschliesslich **lokal auf dem Android-Tablet** unter `Internal storage/Documents/SMART` bereitstellen. Keine Therapie-/Dialog-Mediendateien in GitHub Pages, Repository, CDN oder auf einen Server hochladen. **Explizite Ergänzung des Nutzers vom 09.11.2026:** Die dekorative Bergwiesen-Appgrafik darf mit der PWA ausgeliefert werden; die Karten-Handbewegung ist eine SVG-/Browseranimation. Diese Ausnahme erlaubt keine Veröffentlichung lokaler MP4-/MP3-Inhalte.

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
## GUI-Bestandsschutz (GUI-Freeze) – verbindlich ab 09.11.2026

**Grundregel:** Die bestehende GUI ist bei Funktionsentwicklungen zu erhalten. Nur der im aktuellen Auftrag **ausdrücklich bezeichnete GUI-Bereich** darf soweit nötig verändert oder ergänzt werden. Für alle anderen Ansichten und Elemente gilt Bestandsschutz – auch dann, wenn Codex eine Änderung für eine gestalterische Verbesserung halten würde.

### Ohne ausdrückliche GUI-Freigabe untersagt

- Bestehende Positionen, Grössen, Abstände, Ränder, Farben, Schriftarten/-grössen, Icons, Bilder, Animationen, Beschriftungen oder die Informationshierarchie ändern.
- Navigation, Menüs, Buttons, Kopf-/Fusszeilen, responsive Layouts oder andere nicht beauftragte Ansichten umgestalten.
- Globale CSS-Anpassungen, Design-Refactoring, Vereinheitlichungen oder sonstige „Nebenbei-Optimierungen“ durchführen, wenn sie das Erscheinungsbild ausserhalb des Auftrags verändern.
- Freigegebene Designreferenzen oder Vergleichs-Screenshots eigenmächtig ersetzen oder neu als Sollzustand festlegen.

### Zulässiger Änderungsumfang

- Neue Funktionen im **beauftragten Bereich** implementieren und dort die dafür **ausdrücklich verlangten** GUI-Elemente hinzufügen.
- Bestehende Funktionen und übrige Ansichten dabei visuell und funktional erhalten; technische Änderungen möglichst ohne sichtbare Auswirkungen auf andere Bereiche realisieren.
- Ein Funktionsauftrag ist **keine pauschale Designfreigabe**. Auch für eine vermeintlich notwendige Änderung eines bisher bestehenden, nicht ausdrücklich freigegebenen GUI-Elements erst die konkrete Abweichung beschreiben, begründen und die Freigabe des Auftraggebers einholen. Falls möglich den übrigen Funktionsumfang unabhängig davon implementieren.
- Entdeckte Probleme an nicht beauftragten Ansichten (auch Darstellungs-, Responsivitäts- und Accessibility-Probleme) melden und eine gezielte Korrektur vorschlagen, **nicht ungefragt umsetzen**.

### Vor jedem Implementierungsauftrag

1. Betroffene Ansichten, Komponenten und Dateien sowie **nicht zu verändernde** Bereiche benennen.
2. Den aktuellen Stand anhand des Ausgangs-Commits, bestehender Designreferenzen und – sofern vorhanden – freigegebener Screenshots feststellen. Nicht vorhandene Referenzen nicht als freigegeben behaupten.
3. Die kleinstmögliche Änderung wählen. Bei einem Konflikt zwischen Funktion und Bestandsschutz **vor einer zusätzlichen GUI-Änderung** um Freigabe bitten.

### Prüfung und Abschlussbericht

1. Vor Abschluss die beauftragten Ansichten **und** die nicht betroffenen Ansichten auf unbeabsichtigte visuelle Veränderungen prüfen.
2. Vorhandene, ausdrücklich freigegebene Referenz-Screenshots bei konstantem Viewport/Browser vergleichen; animierte/dynamische Bereiche in reproduzierbare Zustände versetzen oder kenntlich ausklammern. Wenn kein visueller Vergleich möglich war, dies als **nicht geprüft** ausweisen.
3. Jede beabsichtigte GUI-Änderung, die betroffenen Ansichten und das Ergebnis des Vergleichs im Pull Request/Abschlussbericht dokumentieren. Nicht autorisierte Abweichungen zurücknehmen, statt sie zu rechtfertigen.
4. **Screenshot-Baselines nur nach ausdrücklicher GUI-Freigabe aktualisieren.** Ein grüner Funktionstest ersetzt keine visuelle Abnahme.
5. Änderungen zunächst auf einem Arbeitsbranch/PR zur Prüfung anbieten, sofern der Auftraggeber nicht ausdrücklich eine andere Vorgehensweise vorgibt.

**Vorrang:** Diese Regel schränkt die Freiheit bei reversiblen technischen Detailentscheidungen auf **nicht visuell wirksame** Änderungen ein. Projektspezifische fachliche, medizinische, Datenschutz- und Sicherheitsanforderungen gelten unverändert. Ein neuer Commit löst keinen Codex-Auftrag automatisch aus.

## Aktueller Beschluss F17 – ausschliesslich Patient (09.11.2026)

- Ein fiktiver Patient **Ernst** ist die einzige Zielgruppe. Kein Angehörigenmodus, keine zweite Timeline, keine Rollenumschaltung. Nur P-Karten und Patienten-Alma-Dialog sind aktiv; alte A-QRs und die bisherige Misch-PDF bleiben Archiv und dürfen nicht auf Patienteninhalte umgeleitet werden.
- Patienten-Karten: sechs Basiskarten und sieben weitere Übungen, also **13 aktive Karten**, darunter **acht Übungsvideos**. Die lokale Medienablage, das bewusst bestätigte Speichern und alle klinischen Grenzen bleiben erhalten.
- **GUI-Freeze:** Nur Entfernung des Perspektivenwechsels ist mit F17 ausdrücklich freigegeben. Die zuvor besprochene Zweispalten-Startseite (links Videos, rechts nächster Physiotermin und Berichte/Erklärungen) ist **Vorschlag V16, noch nicht implementierungsfreigegeben**.
