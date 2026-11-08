# UX-Spezifikation – Ansichten und Bedienabläufe

**Status:** ENTWURF v0.1, 08.11.2026. **F:** Interaktionsprinzipien und Barrieren; **V:** Navigation/visuelle Details.

## Geräte- und Gestaltungsregeln

- **F:** Tablet hochkant, separat vor Alma abgestützt. Android-Statusleiste **oben** sowie System-Navigationsbereich **unten** beanspruchen reale Pixel. Keine Vollbild-Annahme. Mit tatsächlich verfügbarem Viewport (z. B. `100dvh` mit Fallback), Safe-Areas und realem Gerät prüfen.
- **V:** Ruhiges, kontrastreiches Layout mit grossen Buttons; mindestens ca. 44 CSS-px Touch-Ziel, gut lesbare Schrift; tatsächliche Zielgrössen im Interview überprüfen. Kein enger Mehrspaltenaufbau.
- **V:** Nur **eine** kompakte app-interne Titel-/Zurückzeile auf Unterseiten, kein doppelter Kopf „SMARThapti“; Inhalt (vor allem Video und QR-Vorschau) erhält die meiste Höhe.
- **F:** Bedienung ohne Login, eigenes Smartphone, gesprochene Eingabe oder Kenntnis medizinischer Fachwörter. Jede Ansicht führt klar zurück.
- **F:** Keine Fortschrittsrangliste, kein Erfolgszwang, kein rotes „Versagen“-Feedback.

## Ansichten (V: vorgeschlagene Screen-Struktur)

| Kennung | Ansicht | Inhalt und wichtigste Aktionen |
| --- | --- | --- |
| U0 | Rollenstart/Übersicht | „Für Ernst“ / „Für Anna“ (fiktive Demo); Hinweis „Demo, keine medizinische Anweisung“ |
| U1-P | Patient – Heute | „Übungsvideo ansehen“, „Meine Karten“, „Mein Weg“, „Alma fragen“; zuletzt ausgehändigte Karte |
| U1-A | Angehörige – Heute | „Unterstützungsvideo“, „Eigene Entlastung“, „Karten & Termine“, „Alma fragen“ |
| U2 | QR scannen | Live-Kamera, Positionierungshinweis, Kamerawechsel, „Karte ohne Kamera wählen“, Schliessen |
| U3 | Kartenübersicht | Nach Rolle und Typ sortierbare grosse Karten mit Bildsymbol; manuelle Auswahl öffnet denselben Detailinhalt wie QR |
| U4 | Kartendetail | Kurztitel, kleine Kernaussage, Quelle/Stand, Vertiefungsbuttons, je nach Typ „Video“ / „Termin vormerken“ / „Eintrag vorschlagen“ |
| U5 | Medien | Video oder MP3 mit Start/Pause/Stopp, Untertiteln/Transkript bzw. Textalternative, Zurück |
| U6 | Alma-Dialog | Sprechtext lesbar, optional MP3, 2–4 grosse Antwortbuttons, „Beenden“ |
| U7 | Timeline | Stationen „geschehen“, „geplant“, „selbst berichtet“, „persönliches Ziel“; Details ansehen, neue Einträge nur auf Bestätigung |
| U8 | Bestätigung | „Diesen Eintrag hinzufügen?“ + Titel, Datum, Herkunft, „Hinzufügen“ / „Abbrechen“; nach Erfolg deutliches, neutrales Feedback |
| U9 | Demo-Steuerung | Szenario/Datum auswählen, Demo zurücksetzen, Kamera-/Medientest und **„Medienordner verbinden“**; als Moderatorbereich gekennzeichnet |

## Kernabläufe (F)

**Vorbereitung lokaler Medien:** Vor dem Interview kopiert die Moderatorperson die zulässigen MP4-/MP3-Dateien nach `Internal storage/Documents/SMART`. In U9 öffnet sie „Medienordner verbinden“ und wählt diesen Ordner ausdrücklich im Android-Dateidialog (V: `showDirectoryPicker()`). Die PWA zeigt die gefundenen/fehlenden Dateinamen und verknüpft sie per Manifest-ID. Bei fehlender Ordnerunterstützung „Lokale Datei(en) auswählen“ als Alternative. **Keine** direkte Dateisystemfreigabe durch blosses Hinterlegen eines Pfades. Patient und Angehörige müssen bei gültiger Verbindung nicht jedes Video einzeln auswählen.

**Papier -> Tablet -> Video:** Häftchen/Anhängerkärtchen lesen -> QR vor Tablet-Frontkamera halten -> erkannte ID -> Kartendetail -> „Video ansehen“ -> Video starten/pausieren/stoppen -> zurück; Video endet beim Verlassen. **Touch-Alternative:** Start -> „Karten wählen“ -> dieselbe Karte -> identischer Inhalt.

**Termin-/Meilensteinkarte:** QR -> Detail -> „Zur Timeline hinzufügen“ -> U8 -> erst bei „Hinzufügen“ speichern. „Abbrechen“ schreibt nichts. Wiederholte Bestätigung desselben Ereignisschlüssels meldet „bereits vorhanden“ und zeigt vorhandenen Eintrag statt Duplikat.

**Übungskarte:** Öffnen, Video ansehen, rückwärts navigieren; **kein** automatisches „ausgeführt“. Falls eine separate freiwillige Selbstangabe angeboten wird, benötigt auch diese einen eindeutig bestätigten Eintrag.

**Dialog:** U1 -> Alma -> vorbereiteter Text sichtbar / MP3 optional -> Antwortbutton -> Folgeknoten; zurück oder beenden; Ton stoppt sofort.

**Rollenwechsel:** Immer sichtbar oder über leicht erreichbare Übersicht; ggf. laufenden Scanner/Player beenden; Angehörigeninhalte bleiben eigenständig. Private Angehörigennotizen dürfen nicht ungefragt in der Patientenperspektive auftauchen.

## Fehler- und Randzustände (F)

| Zustand | Erwartete Darstellung / Handlung |
| --- | --- |
| Kameraberechtigung verweigert | „Kamera nicht verfügbar“ mit Bedienhinweis und sofort sichtbarem „Karte auswählen“ |
| Keine Kamera / Frontkamera ungeeignet | Alternative Kamera auswählen und Touch-Einstieg; kein endloser Ladezustand |
| QR unbekannt, defekt, anderer Code | „Diese Karte kenne ich noch nicht“ + erneutes Scannen / manuelle Kartenauswahl |
| Scan wird wiederholt ausgelöst | Nur **eine** Detailnavigation; kein Stapeln der Ansichten oder doppelte Einträge |
| Karte verweist auf fehlendes Medium | Kein kaputter Player; „Diese lokale Datei fehlt unter Documents/SMART“ mit erwartetem Dateinamen und Textalternative |
| Medienwechsel / Zurück | Vorherige Wiedergabe vollständig stoppen und Position/Player kontrolliert schliessen |
| Medienordner noch nicht freigegeben | In U9 sichtbare Schaltfläche „Medienordner verbinden“; in U5 Textalternative und Hinweis „Medien nicht verbunden“ |
| Ordnerauswahl abgebrochen / Berechtigung entzogen | Keine Wiederholschleife und kein versteckter Upload; erneutes Auswählen oder einzelne Datei(en) manuell wählen |
| Falscher Ordner / Datei umbenannt / nicht unterstütztes Format | Benannte Datei als fehlend/nicht abspielbar zeigen; Manifest und realen Dateinamen abgleichen, andere Inhalte bleiben nutzbar |
| App-Neustart | Falls gespeicherter Ordner-Handle nicht mehr autorisiert ist, erneutes Verbinden mit einer verständlichen Aktion anbieten |
| Ungültige Antwortknoten | Sicher zu Übersichts-/Dialogstart zurückkehren, Fehler für Entwicklung sichtbar (ohne Patientendaten) |
| Timeline-Eintrag bereits vorhanden | Neutraler Hinweis, vorhandenen Eintrag öffnen; kein zweiter Eintrag |
| Eintrag abgebrochen | Keine Datenänderung; zur Karte zurückkehren |
| Kein Netz / Pages nicht erreichbar | Eigener Hinweis; Offline nur falls Assets zuvor korrekt zwischengespeichert (separat zu testen) |
| Tablet wird gedreht | Inhalt bleibt bedienbar ohne Abschneiden; Portrait als Interview-Standard |
| Lange Titel / Android-Leisten | Kein horizontales Scrollen, keine verdeckten primären Buttons, kein Scrollen hinter Systemnavigation |

## Noch zu validieren (O)

Reale Tablet-Auflösung, Chrome/PWA-Standalone-Verhalten, Höhe der Android-Systemleisten, Frontkamera-Fokus auf Druckkarten, **Ordnerauswahl und Medienberechtigungen auf Android**, Ablesedistanz, Schriftgrösse und gewünschte Schnelligkeit der Dialoge. Zuerst am tatsächlichen Gerät testen, erst danach visuell feinjustieren.
