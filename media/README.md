# Medienkonzept – Dateien ausschliesslich auf dem Tablet

**Status:** FESTGELEGTER SPEICHERORT + TECHNISCHER VORSCHLAG v0.1, ergänzt 08.11.2026.  
**Wichtig:** Dieses Repository enthält **keine MP4-/MP3-Medien** und soll solche Dateien nicht hosten.

## Festgelegt (F): lokaler Android-Speicherort

**`Internal storage/Documents/SMART`** auf dem Android-Tablet (in der Android-Dateiverwaltung „Interner Speicher > Documents > SMART“).

- Hier liegen **sämtliche** Videos, MP3s und sonstigen Medien des Interview-Demonstrators.
- **PWA-Code, Texte, Karten und JSON-Zuordnungen** werden von GitHub Pages geladen; **Mediendateien werden nicht von GitHub Pages, CDN oder anderen Servern gestreamt**.
- Medien verbleiben auf dem Tablet. Kein Upload, kein automatisches Hochladen, Kopieren in PWA-Cache oder Schreiben/Löschen der Dateien durch die PWA.
- Die App liest nur vom Nutzer ausgewählte bzw. ausdrücklich freigegebene Medien. Ein Dateisystempfad im Quellcode gibt einer Browser-PWA **keine** Zugriffsberechtigung.
- Alle Medieninhalte sind fiktiv oder fachlich/lizenzrechtlich freigegeben. Keine echten Patientendaten.

## Technischer Zugriff (V – auf dem realen Tablet prüfen)

1. In der Interviewvorbereitung kopiert die Moderatorperson die zulässigen Medien nach `Documents/SMART` auf dem Tablet.
2. Im Moderatorbereich U9 gibt es „**Medienordner verbinden**“. Nur auf diese bewusste Benutzeraktion hin öffnet der Browser einen Ordner-Picker (V: `window.showDirectoryPicker()`, Lesemodus).
3. Die Moderatorperson wählt **Documents > SMART**. Die App verknüpft ihre Medien-IDs mit den erwarteten **Dateinamen** in diesem Ordner. Bei gültiger Verbindung ist normalerweise **nicht** für jeden Videoaufruf eine neue Auswahl nötig.
4. Ist der Picker nicht verfügbar oder wurde der Zugriff abgebrochen/verweigert, zeigt die PWA eine verständliche Textalternative und „**Lokale Datei(en) auswählen**“ (native Android-Dateiauswahl, ggf. mehrere Dateien).
5. Nach Neustart/Berechtigungsverlust werden vorhandene Dateiberechtigungen überprüft; falls nötig wird die Verbindung durch eine **neue bewusste Benutzeraktion** hergestellt. Kein automatischer Zugriff auf einen absoluten Pfad.
6. Auf dem Zieltablet muss geprüft werden, ob der Ordner-Picker samt Berechtigung im Chrome-Standalone-PWA-Modus zuverlässig funktioniert. Bei fehlender Browserunterstützung bleibt die Dateiauswahl der explizite Fallback.

**Technischer Hintergrund:** Chrome für Android unterstützt die File System Access API in aktuellen Versionen; sie erfordert aber Benutzerinteraktion/Berechtigung und funktioniert nicht in allen Browsern gleich. Siehe https://developer.chrome.com/docs/capabilities/web-apis/file-system-access und https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker.

## Medien-ID zu lokalem Dateinamen (V – derzeit nicht ausgeliefert)

| Medien-ID | Dateiname im Verzeichnis SMART | Zweck |
| --- | --- | --- |
| `M-P-EX-001` | `P_EX_001.mp4` | Patienten-Übungsvideo (fachlich zu prüfen) |
| `M-A-INF-001` | `A_HELP_001.mp4` | Angehörige: Alltagsunterstützung (fachlich zu prüfen) |
| `M-A-INF-002` | `A_REST_001.mp4` | Angehörige: eigene Entlastung |
| `M-ALMA-P` | `ALMA_P_START.mp3` | Alma-Dialogstart Patient |
| `M-ALMA-A` | `ALMA_A_START.mp3` | Alma-Dialogstart Angehörige |

Dies sind **erwartete Namen**, keine Zusage, dass die Dateien existieren. Massgebliche Zuordnung steht in `content/demo_manifest.json`; Dialogreferenzen in `content/demo_dialogs.json`.

Datenschema: `mediaStorage.rootLabel` ist ein **menschlich lesbarer Ort**, keine vom Browser ladbare URL; `media[].fileName` ist nur ein Dateiname, `media[].storage: "tablet-local"` die Speicherart. Keine externen `src`-URLs im JSON. Lokale Dateien vor dem Abspielen auf Format/Lesbarkeit prüfen; Fehlschläge mit `transcriptOrFallback` überbrücken.

## Redaktionelle / klinische Freigabe

Rechte an Medien, fachliche Prüfung der Therapieanweisungen, Quellenstand, Untertitel/Transkript separat klären. Solange die Medien fehlen, **klar bezeichnete Platzhalter** anzeigen. Für reine Abspieltests dürfen eigene neutrale Testmedien im lokalen Ordner liegen; keine erfundenen medizinischen Übungsanleitungen.

**Tests:** `docs/TEST_PLAN.md` T12–T14 und T21–T25. **Kein Implementierungsauftrag** durch diese Datei.

## Dekorative Appgrafik – ausdrückliche Ausnahme vom 09.11.2026

Der Nutzer hat für den Startbildschirm ein Bergwiesenmotiv mit Kühen beauftragt. `public/alpine-meadow.webp` ist eine KI-generierte dekorative Appgrafik mit Zentralschweizer Alpencharakter und wird mit der App-Shell ausgeliefert und zwischengespeichert. Die Hand-/Kartenanleitung ist SVG mit Browseranimation, keine Video-Datei. Diese begrenzte Ausnahme betrifft keine Therapieclips oder Alma-MP3s; deren Speicher-, Freigabe- und Uploadregeln oben gelten weiterhin.

## Lokale Filmzuordnung (Nutzerauftrag 09.11.2026)

Das dezente Zahnrad in der Kopfzeile öffnet **Einstellungen**. Die hervorgehobenen Zurück-Buttons sind mindestens 56 CSS-Pixel hoch. Sieben neue Übungskarten `P-EX-101` bis `P-EX-107` stehen in `content/exercise_catalog.json`; ihre QR-SVGs liegen unter `assets/qr/`. Alte Karten, Codes und Druck-PDF bleiben erhalten. Die Zuordnung der benannten Filme ist eine technische Referenz, keine klinische Prüfung oder persönliche Übungsfreigabe.

1. Medien aus `Internal storage/Documents/SMART` über Ordner- oder native Mehrfach-Dateiauswahl verbinden.
2. Pro Karten-/Medieneintrag eine verbundene Datei auswählen oder den exakten Dateinamen eintragen. Leerzeichen und Schreibweise inklusive `beien` im gelieferten Wadenheber-Dateinamen werden unverändert übernommen. Es sind nur Dateinamen erlaubt, keine Pfade oder Webadressen.
3. **Zuordnungen speichern** schreibt die Zuordnung Medien-ID → Dateiname getrennt vom Demo-Zustand in LocalStorage (`smarthapti-media-assignments-v1`). Stabile IDs bleiben beim Filmtausch gleich. Reset, Neustart und neue Builds unter derselben Website löschen diese Einstellung nicht.
4. **Zuordnungen sichern** exportiert ausschliesslich Namen/IDs als JSON, keine Filme. Diese Sicherung ermöglicht Wiederherstellen nach Löschen der Browserdaten oder auf einem anderen Gerät. Bei gesperrtem Speicher wird ein Fehler statt eines Speichererfolgs angezeigt.
5. Die Zuordnung ersetzt keine Android-Dateiberechtigung. Nach vollständigem App-Neustart ggf. die lokalen Dateien erneut auswählen; keine automatische Freigabe allein durch einen Android-Pfad. Keine Medien werden hochgeladen oder in den Service-Worker-Cache kopiert.

Standardzuordnung: P-EX-101 Gehen mit Teilbelastung; 102 Hüftflexion im Stehen; 103 Kniebeugen; 104 Tandemstand; 105 Treppensteigen mit Krücken; 106 Treppensteigen mit Teilbelastung; 107 Wadenheber mit Festhalten. Die bestehende Karte P-EX-001 bleibt ebenfalls frei zuordenbar. Neue SVGs lassen sich direkt in den Einstellungen herunterladen. Reproduzierbar erzeugen: `node scripts/generate-exercise-qr.mjs`.

## Korrektur des Android-Dateidialogs

„Medienordner verbinden“ liest alle unterstützten Dateien direkt im gewählten SMART-Ordner ein. Danach **keine zusätzliche Einzelauswahl**: Die Auswahlfelder pro Karte sind sofort gefüllt. Oben werden Anzahl und Namen der verbundenen Medien angezeigt. Ohne Dateifreigabe bleiben die Auswahlfelder mit verständlichem Hinweis deaktiviert.

Wenn `showDirectoryPicker()` fehlt, wird die native Verzeichnisauswahl (`webkitdirectory`) verwendet. „Lokale Dateien auswählen“ nutzt, falls unterstützt, `showOpenFilePicker()` mit dem bereits freigegebenen Ordner als Startpunkt, sonst eine allgemeine Dateiauswahl **ohne** `video/*`-/`audio/*`-Filter, damit Android nicht gezielt die Galerie öffnet. Falls Android eine Anbieterauswahl zeigt: **Dateien / Durchsuchen → Interner Speicher → Documents → SMART**, gewünschte Filme markieren. Ein Browser kann einen absoluten Android-Pfad nicht ungefragt erzwingen; nach expliziter Ordnerfreigabe reicht die Ordnerauswahl aus.

Der Auswahldialog darf die App vorübergehend in den Hintergrund versetzen: Die Rückkehr verwirft die Auswahl nicht mehr und ersetzt das native Dateielement während der Auswahl nicht. Bewusstes Navigieren oder Abschalten verwirft dagegen verspätete Dialogergebnisse. Es werden nur ausgewählte Dateireferenzen gehalten, keine Medien hochgeladen oder in den App-Cache kopiert. Bei leerem/falschem Ordner bleibt die Anzahl null sichtbar; Auswählen und dauerhaftes Zuordnen sind weiterhin getrennte Schritte.
