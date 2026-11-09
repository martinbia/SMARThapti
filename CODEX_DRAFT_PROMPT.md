> **HISTORISCHER IMPLEMENTIERUNGSAUFTRAG.** Seit dem Nutzerbeschluss F17 vom 09.11.2026 ist SMARThapti ausschliesslich für Patienten. Angaben über Angehörige, Rollenwechsel oder A-Karten in diesem älteren Auftrag sind überholt. Aktuelle Grundlagen: AGENTS.md, docs/DECISIONS.md und docs/CONCEPT.md. **Nicht erneut ausführen.**

# Codex-Auftrag – SMARThapti: erster funktionsfähiger PWA-Draft

**Dies ist mein ausdrücklicher Implementierungsauftrag.** Arbeite im bestehenden GitHub-Repository `martinbia/SMARThapti`. Die aktuelle Dokumentation v0.1 ist die Grundlage. Erstelle jetzt die **erste auf dem Android-Tablet testbare PWA**; keine weitere Varianten- oder Konzeptphase.

## Vor Beginn
1. Aktuellen Branch/Commit und alle Dateien prüfen. Lies in dieser Reihenfolge `AGENTS.md`, `README_START_HIER.md`, `docs/DECISIONS.md`, `CODEX_START.md`, `docs/FUNCTIONAL_SPEC.md`, `docs/UX_SPEC.md`, `docs/CONTENT_AND_CARDS.md`, `docs/DEMO_SCENARIOS.md`, `docs/TEST_PLAN.md` sowie beide JSON-Dateien in `content/`.
2. Die **bereits vorhandenen 11 SVG-QR-Codes in `assets/qr/`**, den Index `print/CARD_INDEX.json` und die **druckbare PDF `print/SMARThapti_Faltkarten_A4.pdf`** unverändert weiterverwenden. QR-Payload ist exakt `SH1:<CARD-ID>`; keine QR-Neuerfindung, keine Medien-URLs codieren. Insbesondere `P-INF-003` und `A-INF-003` starten die entsprechenden vorbereiteten Alma-Dialoge über `dialogNodeId`. Bei Änderungen der IDs auch Manifest, Index, PDF und SVG-Dateien synchronisieren.
3. `FESTGELEGT` ist verbindlich, `VORSCHLAG` bei reversiblen Implementierungsdetails nach dokumentierter Begründung nutzbar; keine offenen klinischen Vorgaben erfinden.

## Erste funktionsfähige Version – jetzt umsetzen
- **Installierbare, statische PWA über GitHub Pages** (`/SMARThapti/`), ohne Backend; korrekte relative Pfade, Manifest, Service Worker für App-Shell/Textinhalte; **lokale Videos/MP3 nie in Service-Worker-Cache kopieren**. Wo Pages-Einstellungen nicht automatisch geändert werden können, konkrete manuelle Schritte dokumentieren.
- **Portrait-first Tablet-UI** mit kompakter Navigation und grossen Touch-Flächen. Obere Android-Status- und untere Systemleiste real berücksichtigen. Alma als einfache freundliche visuelle/inhaltliche Orientierung darstellen, aber **keine zusätzliche Hardware-/Avatarfunktion erfinden**.
- **Getrennte Rollen** Patient Ernst und Angehörige Anna, klarer Perspektivwechsel, eigene Startseiten, Karten, Informationsangebote und Angehörigen-Entlastung.
- **Echte QR-Erkennung** per Kamera, zuerst Frontkamera versuchen, Umschalten auf Rückkamera; bei Verweigerung/Fehler funktionierende Touch-Kartenauswahl. Beide Wege führen über `SH1:<CARD-ID>` zum gleichen Inhalt. Kamera bei Verlassen schliessen.
- **Kartendetails und Medien:** Vier Kartentypen (Info, Übung, Termin, Meilenstein); Inhalte/Quellen/Datum und fiktiver Status aus `content/demo_manifest.json`. Drei Videoeinträge und zwei Alma-MP3-Einträge anhand ihrer Dateinamen suchen. **Ausschliesslich lokal** am Android-Tablet unter `Internal storage/Documents/SMART`: Dateiauswahl durch ausdrückliche Benutzeraktion. `showDirectoryPicker()` nur nach Featureprüfung einsetzen; robuste native Auswahl einzelner/mehrerer MP4-/MP3-Dateien als Alternative. Keine automatische Berechtigung durch `file://`, kein Upload, keine Medien im GitHub-Repository. Lokal gewählte Medien per Blob-URL abspielen; Blob-URL beim Verlassen freigeben, Wiedergabe stoppen. Fehlende Datei oder Rechte -> verständlicher Text-Fallback.
- **Alma-Dialoge** nur als vorbereitete Texte mit Antwortbuttons aus `content/demo_dialogs.json`; bei vorhandener lokaler MP3 optional Audio abspielen, sonst derselbe Textdialog. Keine generative KI, kein STT, keine TTS-API.
- **Timeline** mit fiktiven Ereignissen, Terminen und Meilensteinen. Scannen zeigt nur Inhalt; Eintrag in Timeline erst über eindeutiges `Hinzufügen` nach Bestätigung. Wiederholtes Scannen/Bestätigen idempotent (auch derselbe Physiotermin aus beiden Rollen). Video anschauen heisst **nicht** Übung durchgeführt. Angehörigen-Selbstangaben nicht ungefragt in Patientensicht zeigen.
- **Moderatorbereich:** Lokale Medien verbinden, Status der fünf erwarteten Dateinamen anzeigen, Interview-Szenario einstellen und fiktive lokale Einträge zurücksetzen, ohne Dateien auf dem Gerät zu löschen.

## Akzeptanz und Lieferung
- Die 11 bereits gedruckt vorliegenden QR-Codes müssen in der PWA auf die 11 passenden Inhalte führen, inklusive zwei Alma-Dialogen.
- Inhalte mit fehlenden Medien dürfen nicht ins Leere führen. Übungsvideos bleiben unabhängig von Meilensteinen aufrufbar; keine medizinischen Anordnungen, Dosen oder Trainingsfreigaben erfinden.
- Video und MP3 müssen bei Navigation und Rollenwechsel sofort stoppen.
- Prüfe Manifestreferenzen, App-Build, Navigation, QR-Dekodierung (soweit testbar), idempotente Timeline, Dateiauswahl/Fallback. Falls das echte Android-Tablet nicht verfügbar ist, Kamera-, Dateisystem- und Viewporttests ausdrücklich als **nicht getestet** kennzeichnen und konkrete manuelle Tablet-Testschritte angeben.
- Erstelle einen nachvollziehbaren Implementierungsbranch mit Pull Request (oder dokumentiere, wenn technisch nicht möglich); liste geänderte Dateien, Build-/Testergebnisse, offene Punkte und den GitHub-Pages-Aufruf. Kein Upload echter Patienten-/Interviewdaten oder medizinisch ungeprüfter Medien.
- **Vorhandenes Papier-/QR-Druckmaterial nicht ungefragt neu gestalten.** Wenn nötig, ergänze ein reproduzierbares Erzeugungsskript und verifiziere, dass SVG/PDF/Manifest exakt dieselben Payloads verwenden.

**Ergebnis:** Eine benutzbare erste Interview-Demo mit echter Interaktion – keine statischen Screenshots und keine blossen Platzhalter-Buttons.
