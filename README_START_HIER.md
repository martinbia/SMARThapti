# SMARThapti – Start hier

**Status:** ENTWURF v0.1, 08.11.2026 · Orientierung und Lesereihenfolge.  
**Geltung:** Die unter „Festgelegt“ markierten Vorgaben basieren auf den Projektanweisungen. Entwurfsdetails sind noch keine freigegebenen Beschlüsse.

## Worum es geht

Interview-Demonstrator zur Unterstützung nach einer Hüftfraktur-Operation während der Rehabilitation zu Hause. Im Zentrum stehen **Alma**, eine ca. 20 cm grosse, sitzende Plüschkuh, ein separat davor abgestütztes Tablet im **Hochformat**, kurze **persönliche Papier-Info-Häftchen**, **QR-Schlüsselanhänger** und bei Austritt bzw. Physiotherapie übergebene Karten. Die PWA ergänzt Papierinformationen durch kurze Erklärungen, Übungs- und Unterstützungsvideos, MP3-Dialoge und eine Timeline. Patienten und Angehörige haben eigenständige Perspektiven.

**Wichtig:** Fiktive Daten; keine klinische Beratung; keine echte EPIC-Anbindung; keine generative KI oder Spracherkennung in der Demo.

## Verbindliche Lesereihenfolge

1. `README_START_HIER.md` – Zweck, Status, Navigation.
2. `AGENTS.md` – Arbeits- und Datenschutzregeln für Codex.
3. `docs/DECISIONS.md` – **FESTGELEGT** versus **VORSCHLAG** versus **OFFEN**.
4. `docs/CONCEPT.md` – Zielgruppen, Quellenlage und Nutzen.
5. `docs/FUNCTIONAL_SPEC.md` – Muss-Funktionen und Akzeptanzkriterien.
6. `docs/UX_SPEC.md` – Screens, Bedienwege und Fehlerzustände.
7. `docs/CONTENT_AND_CARDS.md` – Papier, Kartentypen, QR-IDs, Quellen, Medien.
8. `docs/DEMO_SCENARIOS.md` – fiktiver Fall und Interviewabläufe.
9. `docs/TEST_PLAN.md` – funktionale und reale Tablet-Tests.
10. `CODEX_START.md` – vorbereiteter Implementierungsauftrag (**noch nicht ausführen**).

## Statussystem

- **FESTGELEGT (F):** explizit vorgegebene Projektanforderung; nur mit dokumentierter Entscheidung ändern.
- **VORSCHLAG (V):** reversible Entwurfsentscheidung, noch zu prüfen/freizugeben.
- **OFFEN (O):** Frage, Abhängigkeit oder fehlender Nachweis.
- **ENTWURF:** Dokumentationsstand; keine klinische oder technische Abnahme.

Alle Dokumente sind v0.1-Entwürfe. `AGENTS.md` enthält verbindliche *Arbeitsregeln*, aber keine eigenständige Freigabe zum Programmieren. Neue Chat-Entscheidungen müssen erst in die Repository-Dokumentation übernommen werden.

## Weitere Dateien (nur redaktionelle Daten)

- `content/demo_manifest.json`: fiktive Personen, Beispiele, Karten, Quellen, Ereignisse und Medienreferenzen.
- `content/demo_dialogs.json`: ausschliesslich vorbereitete Alma-Dialogknoten und Antwortbuttons.

**FESTGELEGT (08.11.2026):** Videos, MP3s und weitere Mediendateien liegen ausschliesslich auf dem Android-Tablet unter `Internal storage/Documents/SMART`. Die PWA und Text-/Karten-Daten kommen über GitHub Pages; Medien werden nicht über GitHub Pages ausgeliefert. Zum Lesen muss die App den Ordner mit Einwilligung am Tablet auswählen/verbinden; siehe `media/README.md`.
- `media/README.md`: **lokalen Medienordner auf dem Tablet** verbinden, Dateinamen, Berechtigungen und Freigaben. **Keine MP4-/MP3-Dateien im öffentlichen Repository.**
- `assets/qr/`: elf einzelne **SVG-QR-Codes**, davon fünf mit referenziertem Video-/MP3-Dateinamen im Dateinamen.
- `print/SMARThapti_Faltkarten_A4.pdf`: druckfertige PDF-Vorlage (11 Faltkarten/3 Seiten), links Label und rechts QR-Rückseite; bei 100 % drucken.
- `print/CARD_INDEX.json` und `print/README.md`: QR-Payloads, Dateizuordnung und Schnitt-/Falthinweise.
- `CODEX_DRAFT_PROMPT.md`: konkreter Copy-&-Paste-Auftrag zur **ersten PWA-Implementierung**. Die Datei selbst startet Codex nicht.

## Repository und Veröffentlichungsstand

Beim Erstcheck am 08.11.2026 enthielt `main` lediglich `README.md` („# SMARThapti“). Eine PWA, GitHub-Pages-Workflowdatei oder weitere Konfiguration war nicht vorhanden. Repository ist **öffentlich**; daher niemals reale Patientenangaben, sensible Interviewunterlagen oder nicht zur Veröffentlichung freigegebene Aufnahmen hochladen. Die GitHub-Pages-Aktivierung in den Repository-Einstellungen war über die verfügbare Verbindung **nicht verifizierbar**.

GitHub-Pages-Zieladresse nach Einrichtung (Vorschlag): `https://martinbia.github.io/SMARThapti/`. **Der URL ist keine geprüfte Live-Demo.**

## Pflegeprozess

Konzeptkanal entscheidet; dokumentierte Änderung im Repo ist Grundlage für Codex; Codex implementiert erst nach explizitem Auftrag, meldet Abweichungen und reale Testresultate zurück. Ein Commit löst keinen Codex-Auftrag automatisch aus.
