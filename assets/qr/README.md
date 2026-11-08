# QR-Druckdateien für SMARThapti

**Status:** Druckfähige Interview-Demo v0.1 · 08.11.2026. **Keine medizinische Anleitung.**

Hier liegen **11 eigenständige, skalierbare SVG-QR-Codes**. QR-Payload: `SH1:<CARD-ID>`; die PWA muss die Karte über `content/demo_manifest.json` auflösen. Ein normaler QR-Scanner öffnet deshalb **keine Website und keine MP4-Datei**. Das ist beabsichtigt, damit Inhalte und Medien ausgetauscht werden können, ohne neue Karten drucken zu müssen.

Dateinamen kennzeichnen bei Medienkarten direkt den lokalen Mediennamen (z. B. `P-EX-001__P_EX_001_mp4.svg` => Tabletdatei `Documents/SMART/P_EX_001.mp4`). Für Termine, Meilensteine und reine Informationen steht der Klartext-Titel im SVG-Dateinamen.

Zuordnung: `print/CARD_INDEX.json`. Druckbares A4-Faltblatt: `print/SMARThapti_Faltkarten_A4.pdf`. Die PDFs sind für **100 % / tatsächliche Grösse** angelegt; am Zieltablet zusätzlich echte Scans testen.

**Wichtig:** SVGs und Papier sind keine Medien. Die Video-/MP3-Dateien müssen separat **lokal** in `Internal storage/Documents/SMART` des Android-Tablets liegen; weder QR-Code noch GitHub Pages liefern die Medien aus. Das öffentliche Repository enthält keine Mediendateien.

Die zwei Informationskarten `P-INF-003` und `A-INF-003` verweisen auf die vorbereiteten Alma-Dialoge samt optionaler MP3. Dieser zusätzliche Papier-Einstieg ist ein **Vorschlag**, nicht ein neues Sprach- oder KI-System.
