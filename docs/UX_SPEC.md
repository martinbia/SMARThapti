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
| U0 | Bergwiesen-Einstieg | Landschaft mit Kühen, Kamera nach Freigabe im Hintergrund; 3 s Einblendung, fünf Kartenvorführungen à 2,4 s, 3 s Ausblendung, 10 s Bildruhe. Tippen/Enter öffnet das Menü. |
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

**Dialog via QR:** Die zusätzlichen Demo-Karten `P-INF-003` und `A-INF-003` sind Informationskarten mit `dialogNodeId`. Ihr Scan zeigt den zugehörigen vorbereiteten Alma-Dialog (U6), kein leerer allgemeiner Medienplayer. Bei fehlender MP3 bleibt der Textdialog vollständig bedienbar.

**Rollenwechsel:** Primär automatisch durch die gescannte Kartenrolle, auch bereits vom Bergwiesen-Einstieg. Im Menü nur eine kompakte Zeile „Für Ernst/Anna“; manuell über „Andere Perspektive ohne QR-Code“ im Fussbereich; ggf. laufenden Scanner/Player beenden; Angehörigeninhalte bleiben eigenständig. Private Angehörigennotizen dürfen nicht ungefragt in der Patientenperspektive auftauchen.

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

## Bergwiesen-Einstieg (Nutzerauftrag 09.11.2026)

Die Hintergrundgrafik ist ein KI-generiertes Zentralschweizer Alpenmotiv, keine dokumentarische Ortsaufnahme. Sie gehört zur App-Shell. Die Kartenvorführung ist eine lokale SVG-/Browseranimation, kein Video. Nach jeweils fünf Bewegungen und dem Ausblenden bleiben für zehn Sekunden nur Landschaft und Kühe sichtbar; die gesamte Fläche bleibt als Menü-Taste per Touch und Tastatur zugänglich. Bei reduzierter Bewegungseinstellung wird die Karte statisch gezeigt. Die Kamera scannt weiterhin; bei verweigerter Freigabe bleibt Tippen zum Menü mit Touch-Kartenwahl möglich. Die App beansprucht nur den verfügbaren dynamischen Viewport, keinen Android-Vollbildmodus. Beim Verlassen werden Animations-Timer und Kamera beendet.

**Kameraindikator (Nutzerauftrag 09.11.2026):** Ein kleiner roter Punkt oben rechts zeigt der Interviewführung, dass der Kamerastream läuft und die QR-Erkennung bereit ist. Er bleibt auch in den zehn Sekunden reiner Landschaft sichtbar. Beim Verlassen, Fehler oder Kameraende verschwindet er. Vor Freigabe bzw. bei Ablehnung wird er nicht angezeigt.

## Abschalten / schwarzer Ruhemodus (09.11.2026)

U0–U9 sowie Lade-/Fehleransichten bieten unten rechts einen roten „⏻ Abschalten“-Button mit grossem Touch-Ziel und Abstand zu Android-Safe-Areas. Der Inhalt erhält entsprechenden Platz, sodass der Button keine letzte Zeile verdeckt. Abschalten beendet Kamera/Medien/Animation und lässt ausschliesslich die schwarze App-Fläche sichtbar. Diese gesamte Fläche ist die barrierefrei benannte Schaltfläche „App einschalten“; Tippen, Enter oder Leertaste führen zurück zum Bergwiesen-Einstieg und zum normalen Kamerabetrieb. Ein Sichtbarkeitswechsel oder eine neue URL allein weckt die App nicht. Die Hardware und Android-Leisten werden nicht ausgeschaltet. Im Kamera-Scanner über das Menü ist derselbe rote Bereitschaftspunkt oben rechts sichtbar wie auf der Bergwiese.
