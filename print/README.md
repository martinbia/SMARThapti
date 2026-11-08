# Druckanleitung: SMARThapti-Faltkarten

**Status:** Ausdruck für Interview-Demonstrator v0.1, 08.11.2026.

Die Datei `SMARThapti_Faltkarten_A4.pdf` umfasst **11 Faltkarten auf drei A4-Seiten**. Jede Einheit ist vor dem Falten etwa 184 × 52 mm gross, gefaltet etwa **92 × 52 mm**. QR-Codes sind ungefähr **38 × 38 mm** gross, einschliesslich der weissen Ruhezone.

1. Alle drei Seiten **einseitig**, bei **100 % / Originalgrösse** auf A4 drucken; die Option „An Seite anpassen“ abschalten.
2. Entlang der **äusseren, durchgezogenen Rechteckkontur** ausschneiden.
3. Entlang der **mittleren gestrichelten Linie** falten, sodass **unbedruckte Papierseiten innen** aufeinanderliegen und **Label und QR auf den beiden Aussenseiten** bleiben. Bei Bedarf zusammenkleben oder laminieren, ohne QR-Fläche zu verdecken.
4. Den QR-Code mit dem **SMARThapti-PWA-Scanner** testen (vorzugsweise Frontkamera). Ein normaler Smartphone-QR-Scanner kann mit dem nicht-URL-basierten Kartenformat wenig anfangen.
5. Audio/Video funktionieren nur, wenn die zugeordneten MP4-/MP3-Dateien am Tablet unter `Internal storage/Documents/SMART` verfügbar und über den Dateidialog für die PWA freigegeben sind. Fehlt ein Medium, zeigt die PWA einen Text-Fallback.

Drucklayout und zwei zusätzliche Alma-Karten sind **reversible Vorschläge**. A4-Ausdrucke wurden als PDF visuell geprüft und alle **11 QR-Codes im gerenderten PDF** mit einem QR-Decoder korrekt gelesen. **Noch kein physischer Ausdruck / Tablet-Frontkameratest.**

Verbindliche Zuordnung: `content/demo_manifest.json` und `CARD_INDEX.json`. Die QR-SVGs befinden sich separat in `assets/qr/`.
