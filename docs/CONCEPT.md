# Konzept – SMARThapti

**Status:** ENTWURF v0.2, 09.11.2026. **F17 hebt die alte doppelte Zielgruppe auf.** **F:** Grundkonzept, **V:** fiktiver Beispielverlauf und konkrete Demo-Setzung.

## Ziel und Forschungsfrage

SMARThapti untersucht in Interviews, ob ältere Patienten nach operierter Hüftfraktur kurze, wiederauffindbare Informationen mit haptischen Karten und optionaler digitaler Vertiefung als hilfreich, verständlich und selbstbestimmt erleben. **Der Demonstrator testet Interaktion und Akzeptanz; keine klinische Wirksamkeit.**

## Drei aufeinander abgestimmte Ebenen (F)

1. **Papier:** Kleine, individualisierte Häftchen zu wesentlichen Ereignissen/Übergängen; in Alltagssprache, mit Kernaussagen, nächsten Schritten und benannten Ansprechpartnern (in Demo nur Rollen/Platzhalter). Auch ohne Tablet sinnvoll.
2. **Haptik:** Alma, sitzende Plüschkuh (~20 cm), als sympathischer Wiedererkennungspunkt; separat davor ein abgestütztes Hochformat-Tablet. Karten mit Titel/Bildsymbol vorn, QR-Code hinten; QR-Anhänger für ergänzende Erklärungen und Medien. Keine Elektronik in Alma erforderlich.
3. **Digital:** Installierbare PWA mit echter QR-Erkennung und gleichwertiger Touch-Alternative. Zeigt kurze Texte, vorbereitete Übungs-/Unterstützungsvideos, MP3-Dialoge mit Antwortbuttons, Ereignisse/Meilensteine in Timeline.

Ein eigenes Smartphone ist **keine** Voraussetzung. Tablet, Papier und Anhänger werden während Interviews gemeinsam erprobt.

**Lokale Medien (F, ergänzt 08.11.2026):** Filme, MP3s und weitere Mediendateien befinden sich auf dem Android-Tablet unter `Internal storage/Documents/SMART`, nicht auf GitHub Pages. Die PWA stellt Bedienoberfläche und Zuordnung bereit und liest Medien nach expliziter Ordner-/Dateifreigabe. Die Verknüpfung soll in der Interviewvorbereitung erfolgen; Details sind in `media/README.md` spezifiziert.

## Einzige Zielgruppe seit F17: Patienten

**Patient:** Versteht seine fiktiven Austrittsinformationen, findet acht Patienten-Übungsvideos, Berichte und Erklärungen, wählt vorbereitete Alma-Dialoge und bestätigt Termine oder persönliche Alltagsmeilensteine selbst. Die frühere Angehörigenperspektive, ihr Rollenwechsel, ihre Inhalte und Meilensteine werden nicht mehr als aktive Demo angeboten.

**Moderation und Fachpersonen** bereiten nur das Interview und fachlich freigegebene Inhalte vor; sie sind keine weiteren App-Personas. Die alte fiktive Anna-Journey bleibt historisches Quellenmaterial, nicht aktive Nutzerrolle.

## Typischer Weg (V: Demo-Beispiel)

Austritt nach Hause -> Patienten-Häftchen und QR-Anhänger -> Patient öffnet QR-Inhalt am Tablet -> sieht Video oder Erklärung -> entscheidet bei Termin/Meilenstein ausdrücklich über Timeline-Eintrag -> erhält bei späterem Physiotermin weitere Karten. Die individuelle Übungsinformation bleibt unabhängig von Meilensteinen erreichbar.

## Inhaltliche Leitplanken (F)

- Unterschied **allgemeine Information / persönliche fiktive Vorgabe / eigene Angabe** sichtbar mit Quellenname, Datum und Stand.
- Kein starres Fortschrittsziel, kein Vergleich mit anderen, kein „x Prozent geheilt“. Alltagsziele dürfen geändert, verschoben oder ausgelassen werden.
- Keine Behauptung, ein Video beweise Übungsdurchführung. Wiederholtes Scannen dupliziert nichts.
- Nicht validierte Therapieanweisungen werden **nicht** durch plausible frei erfundene Dosierungen ersetzt.
- Die PWA greift nicht auf EPIC zu; entsprechende Aussagen sind als **fiktive vorbereitete Beispieldokumente** erkennbar.

## Gesicherte Arbeitsgrundlagen, gesichtet am 08.11.2026

**Intern zugänglich, nicht im öffentlichen Repository veröffentlichen:**
- `Persona1_Hildegard.pdf`: soziale Teilhabe und gemeinsame Aktivitäten, Unsicherheit nach Sturz, Belastung im Haushalt.
- `Persona2_Edgar.pdf`: Selbstbestimmung, Ablehnung von Bevormundung, Wunsch, zu Hause zu bleiben.
- `260527_sa_gra_pflege_versorgungspfad_a3_druck.pdf` und `260526_sa_gra_pflege_versorgungspfad_a3eladef (002)_voa.pdf`: Phasen Alltag – Sturz – Behandlung – Spital – Austritt – Zuhause; Informationsflut und individuelle Unterstützung.
- `SMARTcoach_Patientenjourney_v0.2.md` (fiktiver, nicht klinisch validierter Demo-Fall): Ernst/Anna, Ereignisse und Fragen; **als Anregung** adaptiert, nicht als klinische Evidenz.

**Fehlend / nicht verifiziert (O):** freigegebene konkrete Austrittsinhalte und Therapievideos; validierte individuelle Übungs-/Belastungsvorgaben; tatsächlich verwendetes Tablet mit Kamera-/Browserdaten und verfügbare Bildschirmfläche; Publikations-/Nutzungsrechte für Medien; Nachweis zur GitHub-Pages-Aktivierung. Ein in anderen Arbeitsunterlagen erwähntes vertrauliches Beobachtungsprotokoll ist **keine Veröffentlichungsquelle**.

## Abgrenzung v0.1

Kein eigener Sprachassistent mit offener Konversation, keine Spracherkennung, keine KI-generierten Antworten, keine Geräteintegration in Alma, kein EMR-/EPIC-Zugriff, keine echte Nutzerauthentifizierung, keine reale Patientendatenspeicherung, keine automatische Therapiebeurteilung.

**Ergänzung 09.11.2026 (F16):** Das ausdrücklich beauftragte dekorative Bergwiesenbild gehört zur App-Shell und darf mit der PWA ausgeliefert werden. Die QR-Kartenanleitung wird mit SVG und Browseranimation umgesetzt. Therapie-/Dialog-MP4s und MP3s bleiben ausschliesslich lokal auf dem Tablet. QR-Karten öffnen direkt Patienteninhalte ohne Perspektivenwahl.

## Aktueller Beschluss F17 – ausschliesslich Patient (09.11.2026)

- Ein fiktiver Patient **Ernst** ist die einzige Zielgruppe. Kein Angehörigenmodus, keine zweite Timeline, keine Rollenumschaltung. Nur P-Karten und Patienten-Alma-Dialog sind aktiv; alte A-QRs und die bisherige Misch-PDF bleiben Archiv und dürfen nicht auf Patienteninhalte umgeleitet werden.
- Patienten-Karten: sechs Basiskarten und sieben weitere Übungen, also **13 aktive Karten**, darunter **acht Übungsvideos**. Die lokale Medienablage, das bewusst bestätigte Speichern und alle klinischen Grenzen bleiben erhalten.
- **GUI-Freeze:** Nur Entfernung des Perspektivenwechsels ist mit F17 ausdrücklich freigegeben. Die zuvor besprochene Zweispalten-Startseite (links Videos, rechts nächster Physiotermin und Berichte/Erklärungen) ist **Vorschlag V16, noch nicht implementierungsfreigegeben**.
