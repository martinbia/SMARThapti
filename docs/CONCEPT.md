# Konzept – SMARThapti

**Status:** ENTWURF v0.1, 08.11.2026. **F:** Grundkonzept, **V:** fiktiver Beispielverlauf und konkrete Demo-Setzung.

## Ziel und Forschungsfrage

SMARThapti untersucht in Interviews, ob ältere Patienten nach operierter Hüftfraktur sowie ihre Angehörigen kurze, wiederauffindbare Informationen mit haptischen Karten und optionaler digitaler Vertiefung als hilfreich, verständlich und selbstbestimmt erleben. **Der Demonstrator testet Interaktion und Akzeptanz; keine klinische Wirksamkeit.**

## Drei aufeinander abgestimmte Ebenen (F)

1. **Papier:** Kleine, individualisierte Häftchen zu wesentlichen Ereignissen/Übergängen; in Alltagssprache, mit Kernaussagen, nächsten Schritten und benannten Ansprechpartnern (in Demo nur Rollen/Platzhalter). Auch ohne Tablet sinnvoll.
2. **Haptik:** Alma, sitzende Plüschkuh (~20 cm), als sympathischer Wiedererkennungspunkt; separat davor ein abgestütztes Hochformat-Tablet. Karten mit Titel/Bildsymbol vorn, QR-Code hinten; QR-Anhänger für ergänzende Erklärungen und Medien. Keine Elektronik in Alma erforderlich.
3. **Digital:** Installierbare PWA mit echter QR-Erkennung und gleichwertiger Touch-Alternative. Zeigt kurze Texte, vorbereitete Übungs-/Unterstützungsvideos, MP3-Dialoge mit Antwortbuttons, Ereignisse/Meilensteine in Timeline.

Ein eigenes Smartphone ist **keine** Voraussetzung. Tablet, Papier und Anhänger werden während Interviews gemeinsam erprobt.

## Eigenständige Zielgruppen (F)

**Patienten:** Wollen verstehen, was passiert ist, relevante Information nachlesen, eigene Ziele verfolgen, Übungen aus dem **individuellen, geprüften Plan** auffinden und selbst entscheiden, ob etwas als erledigt berichtet wird. Nicht jede Person möchte laufend erinnert oder bewertet werden.

**Angehörige:** Wollen Unterstützung im Alltag verständlich sehen, ohne Entscheidungen des Patienten zu übernehmen; brauchen Sicherheit bei ungeklärten Fragen, Terminübersicht, vorbereitete Gesprächsfragen und Informationen über **eigene Entlastung**. Eigene Sorgen sind getrennt vom gemeinsamen Verlauf zu behandeln.

**Behandelnde/Forschende:** Geben bei Austritt bzw. Physioterminen Häftchen/Karten aus und begleiten das Interview. Keine klinische Software oder Personalverwaltung in v0.1.

## Typischer Weg (V: Demo-Beispiel)

Austritt nach Hause -> Häftchen und QR-Anhänger -> Patient oder Angehörige öffnet QR-Inhalt am Tablet -> sieht Video oder Erklärung -> entscheidet bei Termin/Meilenstein ausdrücklich über Timeline-Eintrag -> erhält bei späterem Physiotermin weitere Karten. Die individuelle Übungsinformation bleibt unabhängig von Meilensteinen erreichbar.

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
