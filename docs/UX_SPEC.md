# UX-Spezifikation – Ansichten und Bedienabläufe

**Status:** ENTWURF v0.1, 08.11.2026. **F:** Interaktionsprinzipien und Barrieren; **V:** Navigation/visuelle Details.

## Geräte- und Gestaltungsregeln

- **F:** Tablet hochkant, separat vor Alma abgestützt. Android-Statusleiste **oben** sowie System-Navigationsbereich **unten** beanspruchen reale Pixel. Keine Vollbild-Annahme. Mit tatsächlich verfügbarem Viewport (z. B. `100dvh` mit Fallback), Safe-Areas und realem Gerät prüfen.
- **V:** Ruhiges, kontrastreiches Layout mit grossen Buttons; mindestens ca. 44 CSS-px Touch-Ziel, gut lesbare Schrift; tatsächliche Zielgrössen im Interview überprüfen. Das Hauptmenü verwendet am Tablet gemäss F18 zwei Spalten, passt auf schmaleren Viewports in eine Spalte.
- **V:** Nur **eine** kompakte app-interne Titel-/Zurückzeile auf Unterseiten, kein doppelter Kopf „SMARThapti“; Inhalt (vor allem Video und QR-Vorschau) erhält die meiste Höhe.
- **F:** Bedienung ohne Login, eigenes Smartphone, gesprochene Eingabe oder Kenntnis medizinischer Fachwörter. Jede Ansicht führt klar zurück.
- **F:** Keine Fortschrittsrangliste, kein Erfolgszwang, kein rotes „Versagen“-Feedback.

## Ansichten (V: vorgeschlagene Screen-Struktur)

| Kennung | Ansicht | Inhalt und wichtigste Aktionen |
| --- | --- | --- |
| U0 | Bergwiesen-Einstieg | Landschaft mit Kühen, Kamera nach Freigabe im Hintergrund; 3 s Einblendung, fünf Kartenvorführungen à 2,4 s, 3 s Ausblendung, 10 s Bildruhe. Tippen/Enter öffnet das Menü. |
| U1 | Patienten-Hauptmenü | Nur Ernst: links die sieben verfügbaren Patienten-Übungsvideos, rechts kommende Physiotherapietermine und Patientenakte; Karten, Mein Weg und Alma bleiben erreichbar. Zweispaltenlayout ist mit F18 ausdrücklich beauftragt. |
| U2 | QR scannen | Live-Kamera, Positionierungshinweis, Kamerawechsel, „Karte ohne Kamera wählen“, Schliessen |
| U3 | Kartenübersicht | Nach Rolle und Typ sortierbare grosse Karten mit Bildsymbol; Übungskarten mit Video öffnen direkt denselben Player wie Videozeile und QR, übrige Karten öffnen ihren bestehenden Inhalt |
| U4 | Kartendetail | Kurztitel, kleine Kernaussage, Quelle/Stand, Vertiefungsbuttons, je nach Typ „Video“ / „Termin vormerken“ / „Eintrag vorschlagen“ |
| U5 | Medien | Übungsvideo gross innerhalb der verfügbaren Tabletfläche, Titel mittig in der Kopfzeile, Start/Pause und Zeitsteuerung; MP3-Dialoge behalten ihren bisherigen Player. Hinweise zum Übungsvideo sind zugeklappt unter dem Player; bei blockiertem Ton-Autoplay erscheint „Video starten“. |
| U6 | Alma-Dialog | Sprechtext lesbar, optional MP3, 2–4 grosse Antwortbuttons, „Beenden“ |
| U7 | Timeline | Stationen „geschehen“, „geplant“, „selbst berichtet“, „persönliches Ziel“; Details ansehen, neue Einträge nur auf Bestätigung |
| U8 | Bestätigung | „Diesen Eintrag hinzufügen?“ + Titel, Datum, Herkunft, „Hinzufügen“ / „Abbrechen“; nach Erfolg deutliches, neutrales Feedback |
| U9 | Demo-Steuerung | Szenario/Datum auswählen, Demo zurücksetzen, Kamera-/Medientest und **„Medienordner verbinden“**; als Moderatorbereich gekennzeichnet |

## Kernabläufe (F)

**Vorbereitung lokaler Medien:** Vor dem Interview kopiert die Moderatorperson die zulässigen MP4-/MP3-Dateien nach `Internal storage/Documents/SMART`. In U9 öffnet sie „Medienordner verbinden“ und wählt diesen Ordner ausdrücklich im Android-Dateidialog (V: `showDirectoryPicker()`). Die PWA zeigt die gefundenen/fehlenden Dateinamen und verknüpft sie per Manifest-ID. Bei fehlender Ordnerunterstützung „Lokale Datei(en) auswählen“ als Alternative. Sofern unterstützt, bleiben freigegebene Ordner-/Datei-Handles in IndexedDB; beim Start prüft die App die Leseberechtigung ohne automatisches Nachfragen und bietet bei Verlust die bewusste Wiederfreigabe an. Dateinamen/Zuordnungen bleiben im LocalStorage erhalten. **Keine** direkte Dateisystemfreigabe durch blosses Hinterlegen eines Pfades und keine Medienbytes in IndexedDB. Der Patient muss bei gültiger Verbindung nicht jedes Video einzeln auswählen.

**Papier -> Tablet -> Video:** Häftchen/Anhängerkärtchen lesen -> QR vor Tablet-Frontkamera halten -> Übungs-QR öffnet direkt den passenden Player -> lokales Video startet mit Ton, wenn Browserregeln es erlauben; andernfalls „Video starten“ antippen -> Video endet beim Verlassen. Videotitel steht mittig zwischen Menü- und Abschaltbutton; medizinische Hinweise sind unter „Hinweise zum Video“ erreichbar. **Touch-Alternativen:** Hauptmenü-Videozeile oder Kartenübersicht -> derselbe Player ohne zwischengeschaltetes Kartendetail.

**Termin-/Meilensteinkarte:** QR -> Detail -> „Zur Timeline hinzufügen“ -> U8 -> erst bei „Hinzufügen“ speichern. „Abbrechen“ schreibt nichts. Wiederholte Bestätigung desselben Ereignisschlüssels meldet „bereits vorhanden“ und zeigt vorhandenen Eintrag statt Duplikat.

**Übungskarte:** Öffnen, Video ansehen, rückwärts navigieren; **kein** automatisches „ausgeführt“. Falls eine separate freiwillige Selbstangabe angeboten wird, benötigt auch diese einen eindeutig bestätigten Eintrag.

**Videoansicht (Nutzerauftrag 09.11.2026):** Ausschliesslich die Videoansicht ersetzt „Für Ernst“ durch den aus Kartendaten übernommenen Titel und entfernt dort das Zahnrad. Der Titel ist im dreispaltig zentrierten Kopfbereich zwischen „Zum Menü“ und „Abschalten“. Kein Titel im Inhaltsbereich. Player nutzt die verfügbare Höhe/Breite mit `object-fit:contain`; Android-Systemleisten bleiben sichtbar. Die medizinischen Hinweise und „Ansehen bestätigt keine Übungsdurchführung“ bleiben im standardmässig geschlossenen Bereich unter dem Player. Autoplay wird ungestummt versucht; bei `NotAllowedError` zeigt ein grosser Button den Tonstart nach Nutzertipp. Bei fehlender Datei erscheint Dateiname, Textalternative und lokale Dateiauswahl. Navigation stoppt Kamera und Medien.

**Dialog:** U1 -> Alma -> vorbereiteter Text sichtbar / MP3 optional -> Antwortbutton -> Folgeknoten; zurück oder beenden; Ton stoppt sofort.

**Dialog via QR:** Die zusätzlichen Demo-Karten `P-INF-003` und `A-INF-003` sind Informationskarten mit `dialogNodeId`. Ihr Scan zeigt den zugehörigen vorbereiteten Alma-Dialog (U6), kein leerer allgemeiner Medienplayer. Bei fehlender MP3 bleibt der Textdialog vollständig bedienbar.

**Patientenansicht (F17):** Kein Rollenwechsel oder Angehörigenmodus. „Für Ernst“ kennzeichnet nur den fiktiven Patienten. Historische A-QRs sind inaktiv; keine Umleitung.

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

Auf dem Alm-Begrüssungsbild bleibt der rote „⏻ Abschalten“-Button unten rechts. Im Menü, allen Unteransichten sowie Lade-/Fehleransichten sitzt er ganz rechts in der ersten, beim Scrollen sichtbaren Kopfzeile. Der vorher reservierte untere Bereich entfällt; Inhalte nutzen die volle verfügbare Höhe. Auf schmalen Ansichten steht das Power-Symbol mit zugänglichem Namen „Abschalten“, ab 600 CSS-Pixeln zusätzlich der Text. Abschalten beendet Kamera/Medien/Animation und lässt ausschliesslich die schwarze App-Fläche sichtbar. Diese gesamte Fläche ist die barrierefrei benannte Schaltfläche „App einschalten“; Tippen, Enter oder Leertaste führen zurück zum Bergwiesen-Einstieg und zum normalen Kamerabetrieb. Ein Sichtbarkeitswechsel oder eine neue URL allein weckt die App nicht. Die Hardware und Android-Leisten werden nicht ausgeschaltet. Im Kamera-Scanner über das Menü ist derselbe rote Bereitschaftspunkt oben rechts sichtbar wie auf der Bergwiese.

## Einstellungen und deutlichere Navigation (09.11.2026)

Hervorgehobene Zurück-Buttons (mindestens 56 CSS-Pixel) und ein dezentes, beschriftetes Zahnrad in derselben Kopfzeile. Einstellungen verbinden lokale Dateien und zeigen pro Karte/Medieneintrag Dateinamenfeld, Auswahl verbundener Dateien und ggf. Download des zusätzlichen QR-Codes. Speichern bestätigt nur erfolgreichen dauerhaften Schreibzugriff; Export/Import dienen als Sicherung. Neustart/New Build behält Zuordnungen, Android-Freigabe ggf. erneut erforderlich.

Einstellungen führen jetzt in drei Schritten durch Ordnerfreigabe → Film pro Karte wählen → Zuordnungen speichern. Nach erfolgreicher Ordnerfreigabe sind Anzahl und Dateinamen sichtbar; eine zweite Dateiauswahl ist nicht erforderlich. Leere Auswahlfelder erklären die noch fehlende Verbindung. Android-Fallback öffnet eine allgemeine Dateiauswahl ohne Galerie-MIME-Filter; „Dateien / Durchsuchen“ führt zu Documents/SMART.

## Updateangebot – ausdrücklich beauftragte GUI-Ergänzung

Ein zusätzliches, nicht modales Hinweispanel „Neue Version verfügbar“ bietet „Jetzt aktualisieren“ und „Später“. Es erscheint erst bei vorbereitetem Update und erklärt Neustart sowie mögliche erneute Dateifreigabe. Im Ruhemodus und während Dateiauswahl bleibt es verborgen. Neue CSS-Regeln sind auf `.app-update` begrenzt; bestehende Kopfzeilen, Navigation, Inhalte und Abstände bleiben erhalten. Der Hinweis liegt oberhalb des bisherigen Abschaltbereichs des Alm-Einstiegs. Keine Screenshot-Baseline wird ersetzt.

## Verfügbare Tabletbreite (ausdrücklicher Nutzerauftrag)

Die feste 850-CSS-Pixel-Begrenzung der App-Fläche entfällt. Menü und Unteransichten nutzen die verfügbare Breite im Hoch- und Querformat; bestehende Rand-/Safe-Area-Abstände bleiben erhalten. Keine weitere Änderung an Navigation, Anordnung, Schrift oder Farben.

## Aktueller Beschluss F17 – ausschliesslich Patient (09.11.2026)

- Ein fiktiver Patient **Ernst** ist die einzige Zielgruppe. Kein Angehörigenmodus, keine zweite Timeline, keine Rollenumschaltung. Nur P-Karten und Patienten-Alma-Dialog sind aktiv; alte A-QRs und die bisherige Misch-PDF bleiben Archiv und dürfen nicht auf Patienteninhalte umgeleitet werden.
- Patienten-Karten: sechs Basiskarten und sieben weitere Übungen, also **13 aktive Karten**, darunter **acht Übungsvideos**. Die lokale Medienablage, das bewusst bestätigte Speichern und alle klinischen Grenzen bleiben erhalten.
- **GUI-Freeze:** F17 erhielt den Bestandsschutz. Der separate Auftrag F18 gibt nur den Bereich unterhalb der bestehenden Menüauswahl sowie die nötigen Patientenakten-/Einstellungsansichten zur Änderung frei.

## Ausdrücklich beauftragte Patientenübersicht und Patientenakte (09.11.2026)

F18 beauftragt ausschliesslich die Gestaltung unterhalb der bestehenden Überschrift und den Buttons „QR-Karte scannen“ und „Karte auswählen“. Kopfzeile, Überschrift, diese beiden Buttons, ihre Positionen und der Bergwiesen-Einstieg bleiben visuell unverändert. Darunter stehen links sieben verfügbare kompakte Videozeilen; `P-EX-001` bleibt in den Kartendaten, ist jedoch nicht im Menü angeboten. Rechts folgen der nächste fiktive Physiotherapietermin und anklickbare Patientenakten-Einträge. Videos öffnen direkt ihren Player. Alma und „Mein Weg“ bleiben unterhalb des Dashboards erreichbar.

Der Termin zeigt nur Felder, die in den Demodaten existieren. Aktuell ist das Datum 10.11.2026 hinterlegt; eine Uhrzeit und ein Ort sind nicht vorhanden. In der Austrittsszene wird das Szenariodatum aus `manifest.asOf`, in der Physioszene das Datum des vorhandenen Termins verwendet.

Die Patientenakte simuliert EPIC lokal mit vorbereiteten, fiktiven Texten aus `content/patient_record.json` und `content/patient_record_contents.json`. Jeder Eintrag nennt die simulierte Herkunft und den Datenstand. Es gibt keine Serververbindung. Die Bildansicht nimmt nur eine in den Einstellungen ausdrücklich als fiktiv oder für Demonstrationen freigegebene lokale JPG-/JPEG-/PNG-/WebP-Datei an; gespeichert wird nur der Dateiname und der Freigabestatus. Nach einem Neustart kann die Datei erneut ausgewählt werden. Keine Bilddatei wird ausgeliefert, hochgeladen oder in den Service-Worker-Cache aufgenommen.

Screenshots der neuen Patientenübersicht und der Patientenakte liegen unter `docs/screenshots/`; die Röntgenbildansicht ist mit ihrem sicheren Leerzustand dargestellt, da kein Demobild im Repository liegt. Nicht betroffene Ansichten sind im PR gegen den Arbeitsstand visuell zu vergleichen; vorhandene freigegebene Baselines werden nicht verändert.

### Diagnose und erneute Medienfreigabe

Die Einstellungen unterscheiden lesbare Dateien, gespeicherte Dateizuordnungen ohne aktuelle Berechtigung sowie entfernte/umbenannte Dateien. Bei fehlendem Android-Grant führt „Ordner einmal neu auswählen“ über den SMART-Ordner zurück zu allen Medien; einzelne Karten-Zuordnungen werden nicht neu eingegeben. Wird eine HTML-Ordnerauswahl eingesetzt, weist die App darauf hin, dass sie keinen dauerhaften Datei-Handle erzeugt. „Diagnose Medienverbindungen“ ist standardmässig geschlossen und kann Browser-/API-Status, Berechtigungen und Zählwerte kopieren, ohne Dateipfade, Medien oder Patientendaten offenzulegen.

### Lokale PWA-Videokopien (ausdrücklich beauftragte Ergänzung vom 10.11.2026)

In Einstellungen zeigt der Bereich „Lokale Videokopien“ für jede der sieben Übungskarten, ob eine geprüfte Kopie abspielbar ist, nur die aktuell verbundene Android-Originaldatei vorliegt, die Datei derzeit nicht erreichbar ist oder noch keine Quelle verbunden wurde. Der Button „Videos dauerhaft auf diesem Tablet speichern“ kopiert nur lesbare ausgewählte Übungsvideos nach ausdrücklicher Bestätigung. Die Bestätigung nennt die betroffene Anzahl und den benötigten Speicher; Speicherverbrauch, Browserquote und Status des Browser-Speicherschutzes werden angezeigt. Einzelkopien lassen sich ersetzen oder entfernen; „Alle Videokopien löschen“ braucht Bestätigung. Dabei bleiben die Originale unter Documents/SMART unberührt. Die übrigen Appansichten bleiben visuell erhalten.
