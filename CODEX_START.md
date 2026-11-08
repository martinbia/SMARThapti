# Codex – vorbereiteter Auftrag: erste SMARThapti-PWA

**Status:** VORBEREITET / **NICHT FREIGEGEBEN**, 08.11.2026.  
**Nicht automatisch ausführen.** Ein Commithinweis oder diese Datei ersetzt keinen ausdrücklichen Auftrag aus „00 – Konzept und Anforderungen“.

## Auftrag nach expliziter Freigabe

Erstelle den **ersten funktionsfähigen, installierbaren Interview-Demonstrator** als statische Tablet-PWA für GitHub Pages. Priorität: Patienten-/Angehörigenansichten, **Videos**, QR-Scanning, Papierkarten-Mapping, vorbereitete Alma-Dialoge mit MP3-Player sowie bestätigte Timeline. **Keine** Softwareimplementierung vor gesondertem Auftrag.

## Pflichtlektüre

`AGENTS.md` -> `docs/DECISIONS.md` -> `docs/CONCEPT.md` -> `docs/FUNCTIONAL_SPEC.md` -> `docs/UX_SPEC.md` -> `docs/CONTENT_AND_CARDS.md` -> `docs/DEMO_SCENARIOS.md` -> `docs/TEST_PLAN.md`. Lies ausserdem die **aktuellen** JSON-Beispieldaten unter `content/`.

## Implementierungsumfang (auf v0.1 begrenzt)

1. Statische PWA (Vorschlag: schlankes Frontend, offlinefähige Installation soweit technisch nötig), HTTPS/GitHub-Pages-kompatible Assets mit korrektem Projektpfad `/SMARThapti/` und Manifest/Icons. Bei Pages-Setting ohne Zugriff genau melden, welche GitHub-Einstellung manuell nötig ist.
2. Portrait-first Screens U0–U9; kompakte Navigation; echte Tabletfläche inklusive Android-Leisten beachten. Patient und Angehörige erhalten unterschiedliche Einstiege, Videowege, Kartensets und eigene Entlastung.
3. Inhalte aus `content/demo_manifest.json` laden; Dialoge aus `content/demo_dialogs.json`. IDs, Quellen, Datenstand und Typ-Labels anzeigen. Datenpflege **nicht** in JSX/HTML/JS-Strings vergraben.
4. Echten QR-Scanner implementieren (vorzugsweise Frontkamera) und robuste Touch-Alternative. **Keine** reine QR-Simulation. Event-Lifecycle korrekt: CameraTrack bei Verlassen stoppen. Für Browser ohne nutzbaren `BarcodeDetector` eine **gebündelte** Decoder-Fallback-Bibliothek erwägen (V; keine Pflicht auf externen CDN angewiesen zu sein).
5. Kartendetails zu Information, Übung, Termin, Meilenstein. Ein QR öffnet Details, schreibt **nichts**. Testbare Bestätigungsdialoge und idempotenter Timeline-Eintrag für Termin/Meilenstein; keine automatisch gemeldeten Übungen.
6. MP4- und MP3-Player mit Start/Pause/Stopp, Textalternative und sofortigem Stop beim Navigieren. Alma-Dialoggraph mit auswählbaren Antwortbuttons; keine Speech-to-Text-/KI-APIs.
7. Demo-Steuerung zum Umschalten der fiktiven Austritts-/Physiotermin-Szene und Zurücksetzen lokaler bestätigter Einträge; keine echte Nutzerverwaltung.
8. Fehlende Medien müssen als **fehlende oder nicht freigegebene** Inhalte erscheinen. Für reine Player-Tests optional **selbst erstellte neutrale** Testclips/-MP3 ohne Therapiebotschaft integrieren; produktionsreife Übungsclips **nicht** erfinden.
9. Papier-/Karten-Prototypen: einfache druckbare Darstellung oder reproduzierbare Druckvorlagen der Kartenvorder- und -rückseiten mit lesbaren QR-Codes, getrennte Rollen-Sets; Druckformat bleibt bis Test **Vorschlag**.
10. Dokumentation/Tests mit implementiertem Stand und real nicht geprüften Anforderungen abgleichen; keine verdeckten Funktionsannahmen.

## Mindestakzeptanz im ersten Sprint

- PWA lässt sich über GitHub Pages installieren/öffnen (Pages-Aktivierung ggf. manuell).
- Echter Scan einer **gedruckten** Demo-Karte öffnet den richtigen Inhalt; alternative Touch-Karte führt zum selben Ziel.
- Patienten- und Angehörigenrolle haben erkennbar **unterschiedliche** Video-/Informationsangebote.
- MP4 und MP3 lassen sich bei verfügbaren, rechtmässigen Testmedien starten und stoppen; Zurück beendet beides zuverlässig.
- Termine/Meilensteine nur nach Bestätigung; Wiederholung ohne Duplikat; Video erzeugt **keinen** Übungseintrag.
- Quellen, Datum, fiktiver Status sichtbar; kein erfundener medizinischer Inhalt.
- Kernseiten passen bei sichtbaren Android-Systemleisten; nicht am Desktop allein als „Tablet getestet“ deklarieren.

## Liefer- und Rückmeldeformat

Änderungen auf eigenem Branch mit nachvollziehbarem PR (oder nach ausdrücklich anderer Vorgabe); PR nennt implementierte FS-/T-IDs, Nutzungs-/Installationshinweise, Probleme und nicht verifizierte reale Hardwaretests. Keine Original-Personas, vertraulichen Dokumente, echten Patientendaten oder unfreigegebenen Medien committen. Neue medizinische, technische oder UX-Entscheidungen als Vorschlag an den Konzeptkanal zurückgeben.

## Sperren

**Nicht** freigegeben: aktuelle Therapiedosierungen, Belastungsfreigaben, echte EPIC-Schnittstelle, Spracherkennung, generative KI, automatische Übungserkennung, echter Datenversand, produktive Patientenkonten und klinische Sicherheitserklärungen.
