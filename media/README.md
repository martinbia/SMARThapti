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
