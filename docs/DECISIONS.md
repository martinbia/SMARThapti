# Entscheidungen, Vorschläge und offene Punkte

**Status:** LEBENDES ENTSCHEIDUNGSREGISTER v0.1, erstellt 08.11.2026.  
**Verbindlichkeitsregel:** Nur **FESTGELEGT (F)** ist durch vorliegende Projektanweisungen gedeckt. **VORSCHLAG (V)** bleibt bis ausdrücklicher Projektentscheidung reversibel. **OFFEN (O)** ist kein Auftrag an Codex.

## FESTGELEGT – aus dem Projektkonzept

| ID | Beschluss / Rahmen |
| --- | --- |
| F01 | Alma ist eine ca. 20 cm grosse, sitzende Plüschkuh; separates, davor abgestütztes Tablet im **Hochformat**. |
| F02 (historisch) | Früher Häftchen für beide Zielgruppen; **F17 hebt Angehörigen-Häftchen im Demonstrator auf**. |
| F03 | QR-Schlüsselanhänger vertiefen Informationen; bei Austritt und Physioterminen werden Karten ergänzt. Vorderseite Titel + Bildsymbol, Rückseite QR. |
| F04 (teilweise ersetzt) | Vier Kartentypen bleiben. Durch F17 sind nur Patienten-Karten aktiv. |
| F05 | Installierbare PWA; **echter QR-Scan**, vorzugsweise Frontkamera; jederzeit Touch-Alternative. Kein eigenes Smartphone nötig. |
| F06 | Vorbereitete Texte, Videos, MP3 und Alma-Dialoge mit auswählbaren Antwortbuttons; **keine** Spracherkennung/GenAI in der Demo. |
| F07 | Videoangebote (Übungen und Alltagshilfe) zentral; Übungen unabhängig von Meilenstein erreichbar. |
| F08 | QR-Scan öffnet Inhalt; **Eintrag erst nach bewusster Bestätigung**; erneuter Scan erzeugt kein Duplikat; Videoansicht belegt keine Übungsdurchführung. |
| F09 | Timeline für Ereignisse und persönliche Ziele; Medien stoppen auf Verlassen; selbstbestimmte Darstellung ohne Rankings und fixe Reha-Fristen. |
| F10 | Fiktive Personendaten; keine medizinischen Dosierungen/Freigaben erfinden; Quelle und Aktualität sowie persönliche/allgemeine/eigene Angaben unterscheiden. |
| F11 | Spätere EPIC-Nutzung ist Idee; Demo arbeitet ausschliesslich mit vorbereiteten fiktiven Beispieldokumenten. |
| F12 | GitHub als gemeinsame versionierte Spezifikation von Projekt-Chat und Codex; neue Commits starten **keinen** Codex-Auftrag. |
| F13 | Öffentliches Repo darf keine vertraulichen Ursprungsunterlagen oder echten Patientendaten enthalten. |
| F14 | **Neu festgelegt am 08.11.2026:** Sämtliche Medien (insbesondere Videos und MP3s) liegen **lokal auf dem Android-Tablet** im Verzeichnis `Internal storage/Documents/SMART`, nicht auf GitHub Pages oder im GitHub-Repository (Ausnahme für dekorative Appgrafik: F16). Die PWA darf nur nach expliziter Benutzerfreigabe darauf zugreifen. |
| F16 (teilweise ersetzt) | Bergwiese, QR-Einstieg, Animation, Kameraindikator und lokale Medien bleiben. Die frühere automatische Auswahl Ernst/Anna entfällt durch F17. |
| F15 | **Aktuell beauftragt:** QR-Karten als druckbares PDF mit Vorder-/Rückseite auf demselben Blatt und Faltlinie bereitstellen; QR-SVG-Dateien in separatem GitHub-Verzeichnis. Keine personenbezogenen Daten in QR-Payloads. |

## VORSCHLÄGE – für Umsetzung v0.1

| ID | Vorschlag | Grund / Rückfall |
| --- | --- | --- |
| V01 (durch F17 angepasst) | Fiktiver Fall **Ernst** aus SMARTcoach-Journey v0.2 | Anna bleibt nur historische Kontextfigur, keine App-Nutzerin |
| V02 | QR-Kurztext `SH1:<CARD-ID>`, IDs `P-INF-001` etc. | Robust, keine PII, unabhängig von Live-URL |
| V03 | Statische GitHub-Pages-PWA, Daten in `content/*.json` | Einfach, Inhalte unabhängig vom Code austauschbar |
| V04 | Browser-LocalStorage für bestätigte Demo-Einträge und Reset | Ohne Backend; keine Sicherheits-/Privatsphärengarantie |
| V05 | Navigationsstruktur U0–U9 in `UX_SPEC`, grosse Touch-Ziele | Erst auf realem Tablet verifizieren |
| V06 | Fixdatum 06.11.2026 und 10.11.-Physiotermin als Interviewszenen | Reproduzierbares Interview; keine Reha-Frist |
| V07 | Papier-Häftchen A6 und kartonbasierte Kartensets | Format und Lesbarkeit mit Zielpersonen testen |
| V08 | Neutrale Videodatei/MP3 nur für technischen Test, bis fachlich freigegebene Medien vorliegen | Keine erfundene Therapie |
| V09 | Eine leicht auffindbare, moderatorseitige Demo-Reset-/Szenarioansicht | Wiederholbare Interviews |
| V10 | Portrait zuerst; Landscape nur als tolerierter Zustand | Keine Drehpflicht; Gestaltungsprüfung auf Gerät |
| V11 | Ursprüngliche fiktive Ereignis-IDs `E02/E06/E07/J10` aus Journey als Referenzen | Stabiler Querverweis, später austauschbar |
| V12 | Bei der Interviewvorbereitung den lokalen Ordner über `showDirectoryPicker()` (sofern unterstützt) **lesend verbinden**; sonst manuelle Dateiauswahl | PWA kann Dateien nicht durch Angabe eines absoluten Android-Pfads automatisch lesen; auf realem Tablet prüfen |
| V13 | Manifest speichert nur erwartete **Dateinamen** (keine URLs), zugewiesen über stabile Medien-IDs | Medien bleiben unabhängig von Anwendung und Repository; Name kann redaktionell geändert werden |
| V14 | Je eine zusätzliche Info-Karte `P-INF-003` und `A-INF-003` als QR-Einstieg in die beiden Alma-Dialoge | Dadurch erhalten auch die zwei MP3-Medien einen eigenen QR-Zugang. Reversibler Demo-Vorschlag, keine neue medizinische Funktion |
| V15 | Drei A4-Seiten mit 11 Faltkarten; SVG-Vektordateien und das QR-Kurzformat `SH1:<CARD-ID>` | Druckformat und reale Frontkamera-Lesbarkeit erst am Zieltablet abnehmen |

## OFFENE PUNKTE – priorisiert (max. drei entscheidungsrelevant)

1. **O01 – Testgerät und Kameras:** Welches reale Android-Tablet/Chrome-Version wird verwendet, wie gross ist der **verfügbare** Viewport mit Android-Leisten, funktioniert die Frontkamera mit kleinen gedruckten QR-Codes? Erst testen, danach endgültiges UX-Finetuning.
2. **O02 – Klinisch/redaktionell freigegebene Medien:** Welche **konkreten** Übungs- und Unterstützungsclips und Sprecher-MP3 dürfen für Interviews eingesetzt werden? Bis zur Freigabe nur ausdrücklich neutrale Platzhalter/Testdateien.
3. **O03 – Druck-/QR-Standard:** Kurzpayload versus URL-QR, Karten- und Heftformat, Position/Grösse am Anhänger. Erst mit funktionierender Scanner-Demo und Zielgruppen testen; **noch keine Druckfreigabe**.

## Nicht blockierend, aber nachzuweisen

GitHub Pages ist im Repo noch nicht konfiguriert; die tatsächliche Aktivierung in den GitHub-Einstellungen konnte nicht ausgelesen werden. Freigabe/Lizenz und klinische Prüfung konkreter Medien fehlen. **Technische Ordnerauswahl und Wiederverwendung der Berechtigung müssen auf dem realen Android-Tablet getestet werden.** Die fiktiven Namen/Termine ersetzen ausdrücklich keine Therapieunterlagen.

## Freigabestand und nächste Entscheidung

**Diese Dokumentation ist v0.1-Entwurf, keine Freigabe zur Softwareimplementierung.** `CODEX_START.md` ist ein vorbereiteter, inhaltlich konkreter Folgeauftrag. Erst ein expliziter Auftrag im Projekt-Chat startet die Umsetzung. Freigaben/Änderungen hier mit Datum und betroffenen Dateien ergänzen.

## Implementierungsstand nach ausdrücklicher Freigabe (08.11.2026)

Der Nutzer hat im Cloud-Chat die Ausführung von `CODEX_DRAFT_PROMPT.md` ausdrücklich beauftragt. Der erste PWA-Draft setzt V02/V03/V04 und V12/V13 um; V12 hat die native Mehrfach-Dateiauswahl als gleichwertige Alternative. Reversible technische Umsetzung: Vanilla-JavaScript mit Vite, gebündeltem jsQR, LocalStorage nur für fiktive Bestätigungen/Szenario und App-Shell-Cache ohne Medien. Beim ersten Draft wurden Medienhandles nur während der Sitzung gehalten; dieser technische Zustand wurde durch den Nutzerauftrag zur Handle-Wiederherstellung vom 09.11.2026 ersetzt (siehe F21). Szenariowechsel setzt den fiktiven Interviewzeitpunkt, sperrt aber keine Übungskarte. Keine neuen klinischen Festlegungen. Validierung und offene Hardwareabnahme: `IMPLEMENTATION.md`.

**Ergänzung zu F16, 09.11.2026:** Der Nutzer verlangt einen kleinen roten Punkt als Signal für die Interviewführung, sobald die Kamera aktiv und QR-Erkennung bereit ist. Das Signal bleibt unabhängig von der Hinweisanimation sichtbar und endet mit der Kamera.

## F17 – App abschalten und wieder einschalten (Nutzerauftrag 09.11.2026)

Jede normale Ansicht, einschliesslich Einstieg, Scanner und Ladefehler, besitzt einen roten „Abschalten“-Button. Aktualisierung auf Nutzerwunsch: Im Menü und allen Unteransichten oben rechts in der ersten Zeile; nur auf dem Alm-Begrüssungsbild weiterhin unten rechts. Er stoppt Kamera, Medien und Animation, entfernt den Kamerapunkt und zeigt eine vollständig schwarze App-Fläche. Erst Antippen oder Tastaturaktivierung weckt zur Bergwiese mit normalem QR-Betrieb. Der Ruhemodus bleibt bei Navigation, Sichtbarkeitswechsel und Neuladen in derselben Browsersitzung erhalten. Bestätigungen und ausgewählte lokale Dateien bleiben unberührt. Der rote Kamerapunkt gilt ausdrücklich auch für den über das Menü gestarteten Scanner. Die PWA steuert damit ihre App-Fläche; Hardware-Stromversorgung und Android-Systemleisten bleiben unter Kontrolle des Betriebssystems.

## F18 – Filmzuordnung und Navigation (09.11.2026)

Nutzerauftrag: grössere, deutlich sichtbare Navigation; dezentes Zahnrad für Einstellungen in der ersten Zeile. Sieben explizit benannte lokale Übungsfilme erhalten eigene Karten P-EX-101–107. Gespeicherte Zuordnungen verbinden stabile Medien-/Karten-IDs mit lokalen Dateinamen und überleben Neustarts sowie neue Builds bei gleicher Website. LocalStorage ist vom Demo-Reset getrennt; Export/Import als Sicherung. Android-Dateifreigaben bleiben separat erforderlich. Keine klinische Freigabe aus dem Vorliegen einer Datei ableiten.

## Android-Auswahl korrigieren

Nutzerrückmeldung: Galerie statt SMART-Dateien sowie leere Filmzuordnung. Umsetzung: generischer Dateidialog ohne Medien-MIME-Filter; nativer Ordner-Input als Fallback; vorhandener freigegebener Ordner als Startpunkt bei unterstützter Dateiauswahl. Anzahl/Dateiliste und deaktivierte leere Auswahlfelder zeigen den Verbindungsstatus. Kurzzeitiges Verbergen der App durch den Picker verwirft das Ergebnis nicht. Absolute Android-Pfade bleiben nur Orientierung, keine ungefragte Freigabe.

## F19 – Updates anbieten bei Internetverbindung

Expliziter Nutzerauftrag: Bei Verbindung nach Updates suchen und eine neue Version zum Laden anbieten. Umsetzung: Standard-Service-Worker-Updateprüfung mit vollständig vorbereiteter App-Shell, Zustimmung vor Aktivierung und Neustart; „Später“ hält die laufende Version. Sichtbare Ergänzung ausschliesslich der neue Updatehinweis; übrige GUI unter Bestandsschutz. Gespeicherte Daten bleiben erhalten; lokaler Medienzugriff ggf. erneut freizugeben. Keine automatische Veröffentlichung oder PR-Übernahme.

## F20 – App-Breite ohne feste Obergrenze

Auf ausdrücklichen Nutzerwunsch die 850-CSS-Pixel-Obergrenze der App-Fläche aufheben. Volle verfügbare Tabletbreite bei erhaltenen Rand-/Safe-Area-Abständen; Hochformat bleibt der primäre Betriebsmodus.

## Aktueller Beschluss F17 – ausschliesslich Patient (09.11.2026)

- Ein fiktiver Patient **Ernst** ist die einzige Zielgruppe. Kein Angehörigenmodus, keine zweite Timeline, keine Rollenumschaltung. Nur P-Karten und Patienten-Alma-Dialog sind aktiv; alte A-QRs und die bisherige Misch-PDF bleiben Archiv und dürfen nicht auf Patienteninhalte umgeleitet werden.
- Patienten-Karten: sechs Basiskarten und sieben weitere Übungen, also **13 aktive Karten**, darunter **acht Übungsvideos**. Die lokale Medienablage, das bewusst bestätigte Speichern und alle klinischen Grenzen bleiben erhalten.
- **GUI-Freeze:** Unter F17 war die Zweispalten-Startseite noch Vorschlag V16. Der separate Nutzerauftrag F18 unten hebt diese Einschränkung nur für den ausdrücklich bezeichneten Bereich unter den QR-/Kartenauswahlbuttons und für die nötigen Patientenakten-/Einstellungsansichten auf.

## F18 – Zweispaltiges Patientenmenü und lokale Patientenakte (09.11.2026)

Der Nutzer beauftragte ein zweispaltiges Hauptmenü: links kompakte Videozeilen, rechts kommende Physiotherapietermine und Patientenakte. Ein Folgeauftrag vom 09.11.2026 entfernt nur die Zeile `P-EX-001` („Meine Übung ansehen“), weil die zugehörige Datei nicht existiert; die sieben übrigen Videozeilen, ihre Reihenfolge und das Layout bleiben unverändert. Die bestehende Kopfzeile, Überschrift, QR-/Kartenauswahlbuttons und Bergwiesenansicht bleiben visuell unverändert. Videozeilen öffnen direkt die vorhandene lokale Wiedergabe. Terminangaben bleiben datengetreu und brauchen für Timeline-Speicherung weiterhin eine Bestätigung.

Die EPIC-Ansicht bleibt ausschliesslich eine lokale Simulation mit fiktiven Dokumenten und Daten in separaten JSON-Dateien. Für ein Röntgenbild wird kein Bild ins Repo aufgenommen. Die App speichert nur Dateiname/Freigabestatus einer ausdrücklich als Demo geeigneten lokalen Bilddatei; weder Bild noch Metadaten werden an EPIC, einen Server oder den Service-Worker-Cache übertragen.

## F21 – Lokale Medienhandles wiederherstellen (Nutzerauftrag 09.11.2026)

Bei ausdrücklich freigegebener Ordnerauswahl speichert die PWA den `FileSystemDirectoryHandle`, bei `showOpenFilePicker()` die einzelnen `FileSystemFileHandle` in IndexedDB (`smarthapti-local-media-handles-v1`). Gespeichert werden nur Handles; Video-/MP3-/Bildbytes bleiben im ausgewählten Tabletordner. LocalStorage behält die bestehende Medien-ID→Dateiname-Zuordnung. Beim PWA-Start wird ausschliesslich `queryPermission({mode:"read"})` geprüft und bei gültigem Zugriff anhand der Dateinamen neu gelesen. Eine neue Berechtigungsabfrage erfolgt erst über die bewusste Schaltfläche „Medienordner erneut verbinden“. Auf Browsern ohne Handle-API bleibt die native Auswahl als Fallback; Namen und Zuordnungen bleiben erhalten, ggf. ist eine erneute Ordnerauswahl notwendig. Android-Chrome kann Grants beim Schliessen, Update oder Betriebssystemwechsel verwerfen; vollständiges Schliessen/Neustart ist auf dem Zieltablet zu prüfen.

## F22 – Vereinfachte Playeransicht und direkter Übungs-QR-Zugang (Nutzerauftrag 09.11.2026)

Nur die Übungsvideoansicht darf eine eigene, nahezu bildschirmfüllende Gestaltung erhalten: Kartentitel mittig in der Kopfzeile, dort ohne Ernst-Label und Zahnrad; Player mit erhaltenem Seitenverhältnis; Hinweise unter dem Video im geschlossenen Bereich. Die Hinweise „nicht klinisch geprüft“ und „Ansehen bestätigt keine Übungsdurchführung“ bleiben zugänglich. Die lokale Datei wird ungestummt über `play()` zu starten versucht; bei blockiertem Autoplay dient ein grosser Startbutton als Nutzergeste. Übungs-QRs auf dem Willkommensbildschirm und die Touch-Kartenübersicht führen direkt zum selben Video-Hash; der Scan stoppt den Kamerastream. Alle übrigen Ansichten, Druckmaterialien, Kartenkennungen, Medienzuordnungen, Scannerdarstellung und Updatefunktion bleiben unter Bestandsschutz.

## F23 – Android-Dateiauswahl, Wiederverbindung und Diagnose

Die frühere F21-Implementierung speicherte Handles nur dann, wenn die File System Access API einen Handle zurückgab. Die Android-HTML-Fallbacks (`<input type="file">` und `webkitdirectory`) geben `File`-Objekte für die laufende Sitzung zurück, aber keinen `FileSystemDirectoryHandle`/`FileSystemFileHandle`; die bisherigen OPFS-Playwrighttests bewiesen daher nicht die Dauerhaftigkeit der externen Android-Dateiauswahl. LocalStorage-Zuordnungen blieben davon getrennt erhalten. Die Einstellungen bieten nun neben dem Berechtigungsversuch stets eine direkte einmalige Ordner-Neuauswahl. Bei HTML-Fallback-Verwendung genügt diese einzelne Aktion, um alle gespeicherten Video-/Audio-Dateinamen erneut zu verbinden, ohne Karten neu zuzuordnen. Eine standardmässig geschlossene Diagnose zeigt Laufzeit-API-Support, IndexedDB-/Handle-/Berechtigungsstatus und anonymisierte Zählwerte; „Diagnose kopieren“ enthält keine Dateinamen, Pfade, Medien oder Patientendaten.

Die automatische Wiederherstellung nach vollständigem Neustart ist nur bedingt möglich: Der konkrete Browser muss externe Android-Handles serialisieren, in IndexedDB behalten und nach dem Neustart weiterhin Leseberechtigung gewähren. Eine HTML-Dateiauswahl kann das nicht leisten. Die App fragt die API-Fähigkeiten zur Laufzeit ab, aber Chrome-Version, Android-Dateianbieter, vollständiges Schliessen und echte Freigaben waren in der Linux-Umgebung nicht prüfbar. Bei fehlendem Grant beziehungsweise fehlendem Handle ist die erneute Ordnerauswahl der bewusste Ein-Schritt-Fallback; Zuordnungen werden nicht zurückgesetzt.

## F24 – Bestätigte Kopien der sieben Übungsvideos im privaten PWA-Speicher (10.11.2026)

Ausdrückliche begrenzte Freigabe: Nach Speicherbedarf-Anzeige und expliziter Benutzerbestätigung darf SMARThapti ausschliesslich die sieben ausgewählten Übungsvideos (`M-P-EX-101`–`107`) als unabhängige Kopie in den privaten Speicher dieses PWA-Origins legen. OPFS ist bevorzugt und wird stream-/chunkweise beschrieben; IndexedDB enthält dazu nur Metadaten. Ist OPFS nicht verfügbar/geeignet, darf die Blob-Kopie direkt in IndexedDB liegen. Die sieben lokalen Kopien haben beim Start Vorrang vor dem Android-Ordnerhandle und funktionieren ohne erneute Freigabe, solange der Browser die PWA-Daten behält. Medien-ID/Dateiname bleiben getrennt in bestehenden Zuordnungen. Service Worker, Cache Storage und Server erhalten keine Videodaten.

Speichern prüft Dateiendung/Container, Quota-Schätzung, Schreibvollständigkeit und Lesbarkeit. Beim Ersetzen wird die bisherige gültige Kopie erst nach erfolgreichem Schreiben/Prüfen ersetzt. Einzel- und Gesamtlöschung entfernen nur PWA-Kopien; Android-Originale bleiben unangetastet. `navigator.storage.persist()` wird im bewussten Speichervorgang angefragt, gewährt aber keinen absoluten Schutz. Browserdatenlöschung, Betriebssystem-/Browserbereinigung oder Speicherbedingungen können Kopien entfernen. Die UI nennt daher keine garantierte unbegrenzte Aufbewahrung. Der gewählte Speicherbackend-/Dateigrössenstatus bleibt nachvollziehbar; technische Tablet-Abnahme ist offen.

Vergleich mit SMARTcoach: `local-videos.js` (sowie `local-prompt-audio.js` und `xray-media.js`) speichert unabhängige `Blob`s in IndexedDB, nachdem die gesamte Datei mit `arrayBuffer()` eingelesen wurde. SMARThapti übernimmt stabile Medien-ID, unabhängige Origin-Kopie und verifizierte Anzeige, nutzt für grosse MP4s aber OPFS mit höchstens 1-MiB-Pufferchunks statt den kompletten Dateiinhalt in den Arbeitsspeicher einzulesen. IndexedDB-Blob ist der begrenzte Kompatibilitätsfallback.

## F25 – Countdown nach Videoende als schmaler Fortschrittsbalken

Auf ausdrücklichen Nutzerwunsch erscheint nach regulärem Videoende zehn Sekunden lang nur eine 4-px-Linie direkt unter dem Video. Der Balken schrumpft linear von 100 auf 0 Prozent; er bleibt ausserhalb des Layoutflusses, sodass die Playergeometrie gleich bleibt. Danach führt die App zu `#welcome` zurück. Video-Wiedergabe oder sonstige Interaktion sowie Navigation, Abschalten und Verbergen löschen Countdown und Anzeige. Der Begrüssigungsbildschirm startet beim Rücksprung wie üblich seine Animation und QR-Erkennung. Im geprüften Ausgangsstand war diese Countdownfunktion noch nicht implementiert; sie wurde für das gewünschte Verhalten ergänzt.
