# Erster funktionsfähiger PWA-Draft

Stand: 08.11.2026. Umsetzung nach ausdrücklichem Auftrag im Cloud-Chat. Fiktive Interview-Demo, keine klinische Freigabe.

## Start und Entwicklung

Node.js 24, npm und für die Tests Chromium sowie ffmpeg verwenden:

```sh
npm ci --cache /workspace/.npm-cache
npm run build
npm run dev
```

Projektpfad ist `/SMARThapti/`. `npm run preview -- --port 4173` startet den Produktionsbuild. `npm test` startet selbst einen Previewserver. In der vorbereiteten Cloud-Umgebung lautet der Testaufruf `CHROMIUM_PATH=/usr/bin/chromium npm test`. Andernorts zuerst `npx playwright install --with-deps chrome` ausführen und ffmpeg installieren. Standardmässig verwenden die Tests Google Chrome, weil Playwrights Chromium nicht alle für den H.264-MP4-Test benötigten Medien-Codecs enthält. Ein eigener `CHROMIUM_PATH` muss auf einen Browser mit H.264-Unterstützung zeigen. Testmedien werden mit ffmpeg neutral in einem temporären Verzeichnis erzeugt und danach gelöscht; keine Mediendateien committen.

Vite bündelt die Anwendung einschliesslich jsQR ohne CDN. Der Build kopiert vorhandene Textdaten, QR-Dateien und Druckmaterialien unverändert nach `dist`. Der Service Worker speichert nur die explizite App-Shell und JSON-Daten; der Cache wird über einen Inhaltshash versioniert. Nach erfolgreicher Erstladung sind diese Inhalte offline nutzbar. Medien, Blob-URLs und Druckmaterialien werden nicht in den App-Cache aufgenommen. Ein neuer Service Worker aktiviert sich nach Schliessen der bisherigen App-Fenster.

## Bedienung und Funktionen

- Patient Ernst und Angehörige Anna besitzen getrennte Einstiege, Karten, Ziele und Dialoge. Perspektivwechsel ist keine Authentifizierung.
- Alle elf vorhandenen `SH1:<CARD-ID>`-Kennungen öffnen dieselben Inhalte wie die Touch-Auswahl. Die beiden Alma-Karten öffnen direkt den passenden vorbereiteten Dialog. Fremde Rollen-Karten wechseln sichtbar zur zugehörigen Perspektive.
- Der Kamera-Scanner fragt zuerst die Frontkamera an und bietet Kamerawechsel und eine jederzeit erreichbare Touch-Alternative. jsQR dekodiert die Kamerabilder lokal; Mikrofon, Speech-/KI-Dienste und Uploads werden nicht verwendet.
- Termin- und Meilensteinkarten führen zu einer gesonderten Bestätigung mit Hinzufügen/Abbrechen. Speicherung erfolgt unter dem stabilen Ereignisschlüssel. Der gemeinsame Termin `J10` wird rollenübergreifend nur einmal gespeichert; private Selbstangaben werden nach Perspektive gefiltert. Videoansicht verändert keinen Eintrag.
- Fiktive Bestätigungen und Szenario werden in LocalStorage gespeichert. Bei gesperrtem Speicher funktioniert die Sitzung weiter mit Hinweis. Der Moderator-Reset löscht nur diese Bestätigungen, keine Medien. Die Szenarien ändern den fiktiven Interviewzeitpunkt; alle Karten bleiben erreichbar, insbesondere Übungen ohne Meilenstein.
- Portrait-Layout mit `100dvh`, Safe-Area-Abständen, scrollendem Inhalt und mindestens 48 CSS-px hohen Bedienelementen; kein Vollbildzwang.

## Lokale Medien vorbereiten

1. Nur freigegebene Inhalte oder ausdrücklich neutrale Techniktest-Dateien auf dem Android-Tablet unter **Internal storage/Documents/SMART** ablegen.
2. In „Demo vorbereiten“ den Ordner lesend verbinden, falls `showDirectoryPicker()` unterstützt wird. Insbesondere auf Android ist die API nicht verlässlich vorauszusetzen: Die native Mehrfach-Dateiauswahl bleibt der gleichwertige Weg.
3. Die fünf erwarteten Dateinamen stehen im Moderatorbereich und im bestehenden Manifest. Bei nativer Auswahl möglichst alle fünf Dateien gleichzeitig wählen. Nicht passende Dateinamen werden nicht eingebunden.
4. Die Dateien bleiben ausschliesslich lokal. Wiedergabe verwendet Blob-URLs; weder Cache noch IndexedDB enthalten Medienkopien. Verfügbare File-System-Handles werden als Zugriffsreferenzen in IndexedDB gehalten; nach Neustart prüft die App die Leseberechtigung und liest Dateien neu. Bei Rechteverlust ist eine bewusste erneute Freigabe nötig.
5. Video/MP3 bieten native Start-/Pause-Steuerung sowie Stopp. Navigation, Perspektivwechsel, Dialogende und Verbergen der App stoppen die Wiedergabe, Kameratracks werden beendet, Blob-URLs freigegeben. Bei ungültigen Dateien bleibt der Text lesbar.

Dateiauswahl kann den menschlich vereinbarten Android-Ordner nicht technisch erzwingen: Moderatorpersonen müssen ausdrücklich `Documents/SMART` wählen. Keine Datei wird automatisch anhand eines absoluten Android-Pfads geöffnet. Die Medien bleiben nicht klinisch geprüft, solange keine separate fachliche Freigabe vorliegt.

## Verifikation in der Cloud

Produktionsbuild erfolgreich. 19 Playwright-Tests in echtem Linux-Chromium bestanden:

- Manifest-, Quellen-, Medien- und Dialogreferenzen sowie exakte Dekodierung aller elf bestehenden SVG-QR-Codes und passende UI-Ziele.
- Bestätigen, Abbrechen, gemeinsamer Termin ohne Duplikate, privater Angehörigen-Meilenstein, Neuladen und Reset.
- Kameraverweigerung und nicht unterstützter Ordner-Picker mit nutzbarer Touch-/Dateialternative.
- Kamerapipeline mit eingespeistem SVG-QR als Kamerastream, Frontkamera-Anforderung und Track-Stopp. Dies ist **kein realer gedruckter Kameratest**.
- Tatsächliche lokale MP4-/MP3-Wiedergabe neutraler temporärer Dateien; Stopp und Blob-Freigabe bei Navigation/Rollenwechsel; ungültige Datei mit Textfallback; Reset erhält Medienverknüpfung.
- Service-Worker-Erstladung, Offline-Reload/Textnavigation und Cache ohne Medien.
- Layout bei 800×1060, 1060×700 und 360×640 CSS-Pixeln ohne horizontales Überlaufen; Touch-Zielhöhen geprüft.

Die bestehenden PDF-/QR-Dateien und redaktionellen JSON-Dateien bleiben unverändert. Der bestehende PDF-Decoder-Nachweis in T26 wurde nicht erneut ausgeführt; neu geprüft wurden alle elf SVGs. Keine reale Android-Hardware oder klinische Nutzbarkeit geprüft.

## GitHub Pages aktivieren

1. Implementierungs-PR prüfen und nach `main` mergen.
2. Im Repository **Settings → Pages → Build and deployment → Source: GitHub Actions** wählen. Aktuelle Pages-Einstellungen konnten aus der Cloud nicht verifiziert werden.
3. Workflow **PWA checks and Pages** auf `main` ausführen lassen, bei Bedarf über **Actions → Run workflow** starten. Build und Tests müssen erfolgreich sein. PRs werden geprüft, aber nicht veröffentlicht.
4. Nach erfolgreichem Deployment Zieladresse `https://martinbia.github.io/SMARThapti/` öffnen. Dies ist vor erfolgreichem Deployment **keine verifizierte Live-Demo**.
5. Auf Android-Chrome über „App installieren“ bzw. „Zum Startbildschirm hinzufügen“ installieren. HTTPS ist für Kamera und Service Worker erforderlich.

## Reale Tablet-Prüfung – weiterhin offen

Gemäss `docs/TEST_PLAN.md` T01–T28 am tatsächlichen Zielgerät protokollieren:

- Tabletmodell, Android-/Chrome-Version, Browser- und installierter PWA-Modus, verfügbarer CSS-Viewport bei sichtbaren oberen/unteren Systemleisten. Portrait und Landscape sowie lange Texte und grosse Schrift prüfen.
- Alle elf **gedruckten** Codes mit Front-/Rückkamera, verschiedener Beleuchtung, Distanz, Fokus und verweigerter Kamerafreigabe testen. Wechsel/Verlassen/Screen-Lock darf keine Kamera offenhalten.
- Nativen Ordner-/Dateidialog testen; Auswahl abbrechen, falschen Ordner wählen, Datei umbenennen, Berechtigung entziehen und App neu starten. Fünf Dateinamen abgleichen, MP4/MP3 starten, pausieren, stoppen und über Navigation/Rollenwechsel beenden.
- Netzwerkbeobachtung auf dem Tablet: keine MP4-/MP3-Downloads oder Uploads, nur lokal gewählte Dateien. Rechte-/Codecfehler müssen Text und Dateiauswahl zugänglich lassen.
- PWA-Installation, Pages-Direktaufruf/Reload, Offline-App-Shell nach Erstladung, bestätigte Einträge und Reset; vorhandene Karten-PDF bei 100 % drucken und physisch falten/scannen.
- Klinische, redaktionelle und lizenzrechtliche Freigabe konkreter Medien bleibt unabhängig von diesen technischen Tests notwendig.

## Neuer Einstieg vom 09.11.2026

Beim Aufruf ohne Inhalts-Hash oder über `#welcome` erscheint die Bergwiese mit Kühen. Der Kamera-Scanner beginnt dort nach Browserfreigabe; eine gescannte Karte öffnet automatisch die richtige Perspektive. Tippen oder Enter öffnet `#home`. Das Menü ersetzt den grossen Personenblock durch eine kompakte Kopfzeile „Für Ernst/Anna“; manueller Wechsel liegt im aufklappbaren Fussbereich. Die Wiese ist eine generierte Appgrafik (F16), für offline verfügbare App-Shell vorgesehen; MP4/MP3 bleiben ausschliesslich lokal. Die Handanimation benötigt keine Mediendatei: 3 Sekunden einblenden, fünf Bewegungen à 2,4 Sekunden, 3 Sekunden ausblenden, 10 Sekunden reine Bildruhe; danach Wiederholung. Bei reduzierter Bewegungseinstellung bleibt die Hand still. Kamera, Animation und Timer enden beim Verlassen oder Verbergen.

Zusätzlich automatisiert geprüft: echter Decoder mit Anna-/Ernst-Kamerabildern direkt am Einstieg, Touch-/Tastaturzugang, kompakte Kopfzeile, vollständiger Animationszyklus mit fünf Wiederholungen und zehn Sekunden Bildruhe sowie reduzierte Bewegung. Reale Tablet-Kamerafreigabe, Lesedistanz, Animation und sichtbare Android-Leisten bleiben am Gerät zu prüfen.

**Kameraindikator (Nutzerauftrag 09.11.2026):** Ein kleiner roter Punkt oben rechts zeigt der Interviewführung, dass der Kamerastream läuft und die QR-Erkennung bereit ist. Er bleibt auch in den zehn Sekunden reiner Landschaft sichtbar. Beim Verlassen, Fehler oder Kameraende verschwindet er. Vor Freigabe bzw. bei Ablehnung wird er nicht angezeigt.

Verifikation dieser Ergänzung: Produktionsbuild erfolgreich, alle **24 Playwright-Tests** in Linux-System-Chromium bestanden; Hochformat-Ansichten zusätzlich visuell geprüft. Die früheren 19 Tests bleiben erhalten und sind um fünf Einstiegs-/Kamerapunktprüfungen ergänzt. Reale Android-Hardware weiterhin nicht getestet.

## Abschaltknopf und schwarzer App-Ruhemodus (09.11.2026)

Auf dem Alm-Begrüssungsbild bleibt „⏻ Abschalten“ unten rechts. In Menüs und Unteransichten steht der Knopf oben rechts in der ersten Kopfzeile, die beim Scrollen erreichbar bleibt; auf schmalen Bildschirmen als Power-Symbol mit zugänglichem Namen. Kamera, QR-Schleife, Medienwiedergabe, Blob-URLs und Animations-Timer werden unmittelbar beendet. Die schwarze App-Fläche lässt sich durch Antippen oder Tastatur wieder aktivieren; danach startet die Bergwiese im Normalbetrieb. Ein SessionStorage-Flag hält den Ruhemodus bei Sichtbarkeitswechsel, Navigation und Neuladen in derselben Browsersitzung aufrecht. Bestätigte Demo-Einträge und ausgewählte Dateien werden nicht gelöscht. Verspätete Kamerafreigaben werden anhand der bestehenden Generationsprüfung beendet. Der Kamerapunkt ist ausdrücklich auch im Menü-Scanner aktiv. Dies ist ein Ruhemodus der PWA-Fläche, kein Ausschalten der Tablet-Hardware oder des Android-Displays. Reale Android-Systemleisten und Kameraberechtigungen weiterhin am Gerät prüfen.

Validierung der Abschaltfunktion: Produktionsbuild erfolgreich, **29/29 Browsertests bestanden** (24 bisherige plus fünf neue Prüfungen). Kleine Ansicht mit 360×640 CSS-Pixeln visuell geprüft; die spätere Anpassung setzt den Abschaltknopf in Menüansichten in die Kopfzeile und gibt den unteren Bereich für Inhalte frei. Echte Android-Hardware weiterhin nicht getestet.

## Lokale Filmzuordnung (Nutzerauftrag 09.11.2026)

Das dezente Zahnrad in der Kopfzeile öffnet **Einstellungen**. Die hervorgehobenen Zurück-Buttons sind mindestens 56 CSS-Pixel hoch. Sieben neue Übungskarten `P-EX-101` bis `P-EX-107` stehen in `content/exercise_catalog.json`; ihre QR-SVGs liegen unter `assets/qr/`. Alte Karten, Codes und Druck-PDF bleiben erhalten. Die Zuordnung der benannten Filme ist eine technische Referenz, keine klinische Prüfung oder persönliche Übungsfreigabe.

1. Medien aus `Internal storage/Documents/SMART` über Ordner- oder native Mehrfach-Dateiauswahl verbinden.
2. Pro Karten-/Medieneintrag eine verbundene Datei auswählen oder den exakten Dateinamen eintragen. Leerzeichen und Schreibweise inklusive `beien` im gelieferten Wadenheber-Dateinamen werden unverändert übernommen. Es sind nur Dateinamen erlaubt, keine Pfade oder Webadressen.
3. **Zuordnungen speichern** schreibt die Zuordnung Medien-ID → Dateiname getrennt vom Demo-Zustand in LocalStorage (`smarthapti-media-assignments-v1`). Stabile IDs bleiben beim Filmtausch gleich. Reset, Neustart und neue Builds unter derselben Website löschen diese Einstellung nicht.
4. **Zuordnungen sichern** exportiert ausschliesslich Namen/IDs als JSON, keine Filme. Diese Sicherung ermöglicht Wiederherstellen nach Löschen der Browserdaten oder auf einem anderen Gerät. Bei gesperrtem Speicher wird ein Fehler statt eines Speichererfolgs angezeigt.
5. Die Zuordnung ersetzt keine Android-Dateiberechtigung. Datei-/Ordnerhandles werden sofern unterstützt in IndexedDB abgelegt; beim App-Start fragt die App nur den vorhandenen Lesestatus ab. Fehlt das Grant, stellt „Medienordner erneut verbinden“ nach bewusster Aktion den Zugriff wieder her. Browser ohne passende API nutzen die bestehende Dateiauswahl als Fallback. Keine automatische Freigabe allein durch einen Android-Pfad und keine Medienkopien in IndexedDB oder Service-Worker-Cache.

Standardzuordnung: P-EX-101 Gehen mit Teilbelastung; 102 Hüftflexion im Stehen; 103 Kniebeugen; 104 Tandemstand; 105 Treppensteigen mit Krücken; 106 Treppensteigen mit Teilbelastung; 107 Wadenheber mit Festhalten. Die bestehende Karte P-EX-001 bleibt ebenfalls frei zuordenbar. Neue SVGs lassen sich direkt in den Einstellungen herunterladen. Reproduzierbar erzeugen: `node scripts/generate-exercise-qr.mjs`.

Validierung: Produktionsbuild und 38 Browsertests erfolgreich; sieben neue QR-SVGs tatsächlich dekodiert, Dateiauswahl/Zuordnung, Reload, Demo-Reset, Export/Import und Ablehnung von Webadressen geprüft. Zuordnung zusätzlich in einer Browserinstanz gespeichert, anschliessend `npm run build` erneut ausgeführt und nach Reload unverändert gelesen. Kleine Kopfzeile ohne horizontales Überlaufen visuell geprüft. Keine Originalfilme vom Tablet hier verfügbar; tatsächliche Codecs, Freigaben und Dateinamen am Android-Gerät prüfen.

## Korrektur des Android-Dateidialogs

„Medienordner verbinden“ liest alle unterstützten Dateien direkt im gewählten SMART-Ordner ein. Danach **keine zusätzliche Einzelauswahl**: Die Auswahlfelder pro Karte sind sofort gefüllt. Oben werden Anzahl und Namen der verbundenen Medien angezeigt. Ohne Dateifreigabe bleiben die Auswahlfelder mit verständlichem Hinweis deaktiviert.

Wenn `showDirectoryPicker()` fehlt, wird die native Verzeichnisauswahl (`webkitdirectory`) verwendet. „Lokale Dateien auswählen“ nutzt, falls unterstützt, `showOpenFilePicker()` mit dem bereits freigegebenen Ordner als Startpunkt, sonst eine allgemeine Dateiauswahl **ohne** `video/*`-/`audio/*`-Filter, damit Android nicht gezielt die Galerie öffnet. Falls Android eine Anbieterauswahl zeigt: **Dateien / Durchsuchen → Interner Speicher → Documents → SMART**, gewünschte Filme markieren. Ein Browser kann einen absoluten Android-Pfad nicht ungefragt erzwingen; nach expliziter Ordnerfreigabe reicht die Ordnerauswahl aus.

Der Auswahldialog darf die App vorübergehend in den Hintergrund versetzen: Die Rückkehr verwirft die Auswahl nicht mehr und ersetzt das native Dateielement während der Auswahl nicht. Bewusstes Navigieren oder Abschalten verwirft dagegen verspätete Dialogergebnisse. Es werden nur ausgewählte Dateireferenzen gehalten, keine Medien hochgeladen oder in den App-Cache kopiert. Bei leerem/falschem Ordner bleibt die Anzahl null sichtbar; Auswählen und dauerhaftes Zuordnen sind weiterhin getrennte Schritte.

Validierung der Dialogkorrektur: Produktionsbuild und **40/40 Browsertests bestanden**. Der native Verzeichnis-Input wurde mit einem temporären Ordner getestet, das automatische Füllen der Filmzuordnung ohne zweite Auswahl geprüft und ein Hintergrund-/Vordergrundwechsel während der Handle-Auswahl simuliert. Der unterstützte Dateipicker erhält den freigegebenen Ordner als Startpunkt und keinen Medien-MIME-Filter. Ein reales Android-Gerät ist hier weiterhin nicht verfügbar.

## App-Updates bei Internetverbindung

Die PWA prüft beim Start, beim Wiederkehren der Verbindung, bei erneuter Sichtbarkeit (begrenzt auf einmal pro Minute) und während geöffneter Nutzung alle fünf Minuten auf eine neue Version. Der Service Worker und die App-Shell werden über HTTPS geprüft/vorbereitet; lokale Medien sind davon ausgeschlossen. Ein fehlgeschlagener/offline Check lässt die laufende Version unverändert.

Erst wenn eine neue App-Shell vollständig installiert bereitsteht, erscheint der zusätzliche Hinweis **„Neue Version verfügbar“** mit **„Jetzt aktualisieren“** und **„Später“**. Es gibt keinen automatischen Neustart während der Nutzung. „Später“ unterdrückt das Angebot für diese bereitstehende Version bis zum nächsten App-Start. „Jetzt aktualisieren“ stoppt Kamera und Medien, aktiviert die neue Version und lädt die App neu. Andere offene App-Fenster mit einem aktiven Service Worker werden ebenfalls beim Controllerwechsel neu geladen. Gespeicherte Filmzuordnungen und bestätigte Demo-Einträge bleiben erhalten; Dateihandles bleiben in IndexedDB, sofern der Browser sie unterstützt, und ihre Berechtigung wird nach dem Neustart geprüft. Nicht gespeicherte Eingaben gehen verloren. Der Hinweis erklärt diese Folgen vor Bestätigung.

Der Hinweis erscheint nicht bei der ersten Installation, im schwarzen Ruhemodus oder während einer laufenden Dateiauswahl. Es werden nur neue, auf GitHub Pages tatsächlich veröffentlichte Versionen erkannt, keine ungemergten PRs. Damit diese Updatefunktion selbst erstmals verfügbar wird, muss die bisherige App einmal wie bisher aktualisiert/geschlossen und neu geöffnet werden.

Validierung: 42/42 Browsertests bestanden. Echter HTTP-Testserver liefert zwei Service-Worker-Versionen: Bereitschaft, Später, ausdrückliche Aktivierung/Neuladen, Kamera-Stopp und erhaltene Filmzuordnung geprüft. Offline und ausgeblendeter Hinweis im Ruhemodus geprüft. Arbeitsbaseline bb0658b mit aktuellem Build bei 800×1060 CSS-Pixeln verglichen: Menü, Einstellungen, Informationskarte und Timeline ohne Updatehinweis pixelgleich. Keine freigegebenen Screenshot-Baselines geändert; reale Android-PWA-Updates bleiben am Gerät zu prüfen.

## Patient-only – Feature-Branch (09.11.2026, F17)

**Status:** Änderung auf `feature/patient-only-demo`, vor PR-Merge/Android-Abnahme. Nur Ernst als fiktiver Patient; kein Rollenwechsel, keine A-Karten, A-Medien oder A-Alma-Dialoge im geladenen Manifest. Alte QR-SVGs/PDF bleiben historisch und werden nicht auf P-Karten umgelenkt. Die acht P-Übungskarten bleiben in den Daten, sieben verfügbare Übungsfilme erscheinen in der Hauptmenüliste. Bestehende lokale Videodateien/Medienzuordnungen werden nicht verändert; alte Ereignisschlüssel werden ausgefiltert.

Die frühere Feststellung zu V16 beschreibt den Stand vor dem gesonderten Nutzerauftrag F18; siehe aktuelle Umsetzung und Testresultate am Ende dieses Dokuments.

## F18 – zweispaltiges Patientenmenü und lokale Patientenakte

Der Menübereich unter der bereits vorhandenen Überschrift sowie den beiden Auswahlbuttons wurde in zwei Spalten umgesetzt. Links stehen die sieben lokal vorhandenen Übungsfilme in kompakten Zeilen, die unmittelbar die vorhandene lokale Wiedergabe öffnen. `P-EX-001` bleibt als Karten-/Medienreferenz erhalten, wird wegen der nicht vorhandenen `P_EX_001.mp4` jedoch nicht im Hauptmenü angeboten. Rechts stehen der aus dem Interviewszenario berechnete nächste fiktive Physiotermin und vier Einträge der simulierten Patientenakte. Alma und „Mein Weg“ bleiben unterhalb des Dashboards erreichbar. Die Zeilen verwenden weiterhin die vorhandenen Manifest-/Katalogdaten und lokalen Medienzuordnungen.

Für Operationsbericht, Austrittsbericht, Terminplan und Röntgenbildplatzhalter liegen getrennte Metadaten und Beispieltexte in `content/patient_record.json` sowie `content/patient_record_contents.json`. Sie kennzeichnen fiktive Herkunft und Datenstand; die Inhalte enthalten keine klinischen Befunde oder Anordnungen. Die Bildauswahl ist separat in den Einstellungen, akzeptiert JPG/JPEG/PNG/WebP nach ausdrücklicher Freigabebestätigung, speichert nur Dateiname/Status und nutzt eine sitzungsgebundene Blob-URL. Ein vorhandenes Verzeichnis kann wiederverwendet werden; bei verlorenem Handle bietet die Ansicht die erneute lokale Auswahl an. Bilddaten werden weder übertragen noch im Service Worker abgelegt.

**GUI-Abgrenzung:** Kopfzeile, Überschrift, QR-/Kartenauswahlbuttons und Bergwiesen-Einstieg blieben visuell pixelgleich. Im Hauptmenü wurden nur die Elemente unter den beiden Buttons ergänzt/neu angeordnet; die Patientenakten- und Einstellungenansichten erhielten die beauftragten Ergänzungen. Screenshot: `docs/screenshots/patient-home-portrait-800x1100.png`, `docs/screenshots/patient-record-portrait-800x1100.png`, `docs/screenshots/patient-record-report-portrait-800x1100.png`. Das obere Menüstück sowie die sichtbaren Viewportbereiche der bestehenden Einstellungs-, Karten-, Timeline- und Bergwiesenansichten wurden bei 800×1100 CSS-Pixeln pixelgleich mit dem Ausgangsbuild verglichen.

Validierung: Produktionsbuild erfolgreich; 43/43 Playwright-Tests bestanden. Dazu zählen Medien-/Dateigrant-Fallback, SMART-Ordner-Wiederverwendung, Blob-URL/Zoom und kein Netzwerk-Upload des Testbilds. Hauptmenü-Kopf/Überschrift/Auswahlbuttons (800×195 px) sowie sichtbare Einstellungen-, Karten-, Timeline- und Bergwiesen-Viewports (800×1100 px) sind pixelgleich zum Ausgangsbuild. Screenshot-Dateien: `patient-home-portrait-800x1100.png`, `patient-record-portrait-800x1100.png`, `patient-record-report-portrait-800x1100.png`, `patient-record-xray-fallback-portrait-800x1100.png` unter `docs/screenshots/`.

Der Branch/PR ist ein Vorschlag zur Prüfung und noch nicht in Pages veröffentlicht. Ein Android-Tablet stand für diese Arbeit nicht zur Verfügung; lokaler Android-Dateidialog, reale Systemleisten, echte Ordnerberechtigung sowie ein fiktives oder ausdrücklich freigegebenes Bild sind am Tablet noch zu prüfen.

## Lokale Medienverbindungen nach Neustart

Der Hauptmenüeintrag `P-EX-001` („Meine Übung ansehen“) wurde aus der linken Videoliste entfernt, weil `P_EX_001.mp4` im lokalen Medienordner nicht vorhanden ist. Die Kartendefinition, der QR-Code und die Medienreferenz bleiben unangetastet. Die übrigen sieben Videozeilen behalten Reihenfolge und Darstellung.

Wenn der Browser File System Access API anbietet, speichert die App den ausdrücklich gewählten Ordnerhandle in IndexedDB `smarthapti-local-media-handles-v1`; bei `showOpenFilePicker()` speichert sie die ausgewählten Datei-Handles. LocalStorage (`smarthapti-media-assignments-v1`) behält getrennt die Zuordnung Medien-ID → Dateiname. IndexedDB enthält keine `File`- oder `Blob`-Medienbytes. Beim Start fragt die App über `queryPermission({mode:"read"})` ab, ob Lesen bereits gestattet ist. Bei gültigem Grant öffnet sie die Dateien erneut und stellt alle Zuordnungen anhand der Dateinamen her. Bei fehlendem Grant fordert sie keine automatische Freigabe an; Einstellungen zeigen „Medienordner erneut verbinden“, und erst der Klick ruft `requestPermission()` auf. Falls der Browser die Freigabe nicht wiederherstellen kann, kann der Ordner über „Medienordner verbinden“ erneut ausgewählt werden. Die Statusliste unterscheidet lesbare Datei, gespeicherte Zuordnung ohne Zugriff und fehlende/umbenannte Datei.

Unterstützt der Android-Browser keine wiederverwendbaren Handles, bleibt die bestehende native Ordner-/Dateiauswahl verfügbar. Gespeicherte Dateinamen und Zuordnungen füllen danach die Auswahl automatisch; einzelne Videos müssen nicht erneut zugeordnet werden. Browser-/Android-Berechtigungen können nach vollständigem Schliessen oder Update entzogen werden. Ob Handles auf dem konkreten Tablet über Schliessen, Neustart und Update bestehen bleiben, muss dort geprüft werden; Linux-Chromium-Tests können diese Android-Einschränkung nicht abnehmen.

Build erfolgreich; vollständige Playwright-Suite **45/45 bestanden**. Tests mit echten Chromium-OPFS-Handles prüfen IndexedDB-Persistenz für Ordner- und einzelne Dateihandles, simulierten Berechtigungsverlust und bewusste Wiederfreigabe, Wiederherstellung aller sieben Dateinamenzuordnungen ohne Remapping sowie fehlende Datei ohne Absturz. Der Service-Worker-Update-Test prüft zusätzlich, dass ein Handle nach der Update-Aktivierung weiter Medien zugänglich macht. Hauptmenütest prüft exakt sieben Videozeilen und deren Reihenfolge. Keine realen Tabletdateien waren im Arbeitsbereich verfügbar; echte MP4/MP3-Wiedergabe mit Tabletdateien, Android-Dateidialog und vollständiges Schliessen der installierten PWA bleiben auf dem Zieltablet offen.
