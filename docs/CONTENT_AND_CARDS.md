# Inhalte, Häftchen, Karten und Medien

**Status:** ENTWURF v0.1, 08.11.2026. **F:** physisches Prinzip und vier Kartentypen; **V:** Beispielinhalte, IDs und technische Medienkonventionen.

## 1. Papier-Häftchen – selbstständig sinnvoll (F)

Bei relevanten Ereignissen/Übergängen erhalten Patienten bzw. Angehörige **separate kurze, individualisierte Häftchen**. Struktur je Häftchen:

1. **Was ist passiert / worum geht es?** Kurzer Titel, 2–3 verständliche Sätze.
2. **Was ist für mich wichtig?** Nur geprüfte oder explizit als Demo-Platzhalter markierte Aussagen.
3. **Was ist als Nächstes geplant?** Termin, Gespräch oder Frage; keine angenommene medizinische Freigabe.
4. **Wen kann ich fragen?** Zuständigkeitsrollen, in der Demo keine erfundenen realen Telefonnummern.
5. **Mehr erfahren am Tablet:** passende Kartennummer/QR-Anhänger und Klartextbezeichnung.

**V:** Handliches A6-Heft, 4–8 Seiten, grosse Schrift. Druckformat und Papierhandling im Interview prüfen. Papier muss ohne QR, Internet oder Tablet sinnvoll lesbar sein.

## 2. Kartensystem (F)

| Typ | Abkürzung V | Bedeutung | Timeline-Wirkung |
| --- | --- | --- | --- |
| **Information** | INF | kurze Erklärung, z. B. Austritt oder Begleitung | keine automatische |
| **Übung** | EX | Zugang zum individuell freigegebenen Übungsinhalt/Video | weder „gemacht“ noch automatisch speichern |
| **Termin** | APT | bevorstehender oder geänderter Termin | **nur nach expliziter Bestätigung** hinzufügen |
| **Meilenstein** | MIL | persönlich bedeutsames Ereignis / eigenes Alltagsziel | **nur nach expliziter Bestätigung**, „selbst berichtet“ |

**F:** Vorderseite jeder Karte = Titel + Bildsymbol; Rückseite = QR. **V:** kleine Karten aus Karton, deutliche Farbakzente nach Kartentyp, einheitlicher kontrastreicher Code. Schlüsselanhänger verweisen auf häufig benötigte Vertiefungen; Ausgabe bei Austritt sowie zusätzliche Karten bei Physioterminen.

**F:** Patient und Angehörige erhalten unterscheidbare Kartensets und Inhalte. **V:** Prefix `P` / `A`; stabiler Bezeichner `P-EX-001`. Keine Gesundheitsdaten/Namen in QR-Nutzlast.

## 3. Zuordnung für die erste fiktive Demo (V)

| Karte / Anhänger | Rolle, Ausgabe | Titel und Medienziel | Aktion |
| --- | --- | --- | --- |
| `P-INF-001` | Patient, Austritt 02.11. | „Wieder zu Hause“ / Kurzinfo; E06-Demoquelle | ansehen |
| `P-INF-002` | Patient, Austritt | „Was ist bei der Operation passiert?“ / E02-Demoquelle | ansehen |
| `P-INF-003` | Patient, Austritt | **„Alma fragen“**, vorbereiteter Dialog mit lokalem `ALMA_P_START.mp3` | Dialog ansehen; MP3 optional |
| `P-EX-001` | Patient, Austritt oder Physio | „Meine Übung ansehen“ / **Video-Slot ohne medizinischen Inhalt bis Freigabe** | ansehen, nicht abhaken |
| `P-APT-001` | Patient, Austritt | „Nächster Physiotherapietermin“ / 10.11. (fiktiv) | nach Bestätigung in Timeline |
| `P-MIL-001` | Patient, Physio 10.11. | „Ein eigener Alltagsschritt“ / selbst berichteter Meilenstein | nach Bestätigung in Timeline |
| `A-INF-001` | Angehörige, Austritt | „Unterstützen ohne zu übernehmen“ / Unterstützungsvideo-Slot | ansehen |
| `A-INF-002` | Angehörige, Austritt | „Auch an mich denken“ / Entlastungsinfo, Video-Slot | ansehen |
| `A-INF-003` | Angehörige, Austritt | **„Alma für Angehörige“**, vorbereiteter Dialog mit lokalem `ALMA_A_START.mp3` | Dialog ansehen; MP3 optional |
| `A-APT-001` | Angehörige, Austritt | „Physiotherapie: gemeinsam Fragen sammeln“ / **derselbe Termin-Eventkey wie P-APT-001** | nach Bestätigung; kein doppelter Termin |
| `A-MIL-001` | Angehörige, Physio 10.11. | „Eine Pause für mich eingeplant“ / eigene Angabe | nach Bestätigung; nur Angehörigenansicht |

**V:** P-MIL-001 ist bewusst ein **freiwillig berichteter Alltagsschritt**, keine klinische Leistungszusage. Beispielsatz: „Ich habe heute selbst das Frühstück vorbereitet.“ Das ist **keine** Aussage über Freigabe oder Sicherheit dieser Handlung.

**V (08.11.2026):** Damit auch beide vorgesehenen Alma-MP3s per QR erreichbar sind, ergänzt die Demo die zwei Informationskarten `P-INF-003` und `A-INF-003`. Beide verwenden den bestehenden QR-Vertrag und einen `dialogNodeId` in ihrem Content. Beim Scan öffnet U6 den vorbereiteten Dialog; die MP3 ist dessen optionale Tonspur, nicht ein neuer, offener Chat.

## 4. QR-Vertrag und Duplikate (V)

Payload-Vorschlag: `SH1:P-EX-001`. Format: ASCII, Version `SH1`, Doppelpunkt, stabile Karten-ID. Kein Link zu einer Person, keine sensiblen Angaben; Scanner validiert Format, sucht ID im Manifest, führt eine reine Leseaktion aus. Falls sich später echte URL-QRs als praktischer erweisen, in `docs/DECISIONS.md` entscheiden, bevor Karten gedruckt werden.

Mehrere Karten dürfen auf **denselben fachlichen Eventkey** verweisen (z. B. `J10` für 10.11.2026). Ein Eintrag wird nur nach expliziter Bestätigung unter diesem Key gespeichert. Die Karte selbst bleibt unabhängig davon beliebig oft anzeigbar.

## 5. Inhalte getrennt von Code (V)

Redaktionelle Basis: `content/demo_manifest.json` (Personen, Demoquellen, Karten, Contents, Medienreferenzen, Timeline-Basis). Dialoge: `content/demo_dialogs.json`. App-Code kennt nur IDs/Schemas und zeigt Daten an; keine Texte oder Medienpfade in UI-Komponenten duplizieren. Alle JSON-Datensätze sind **fiktive Interviewvorlagen**.

Inhaltssatz benötigt mindestens: `id, role, title, shortText, detailText, sourceIds, sourceKind, sourceDate, reviewed, mediaIds`. Medienzuordnung: `id, kind, storage, fileName, status, transcriptOrFallback`. **F:** `storage: tablet-local` und der Ordner `Internal storage/Documents/SMART`. **V:** `fileName` enthält ausschliesslich den erwarteten Dateinamen (z. B. `P_EX_001.mp4`), niemals einen Web-/Android-Pfad. Die Datei selbst liegt **nicht im Repository**; `status` gibt den redaktionellen Liefer-/Freigabestand an, nicht einen überprüften Dateibestand auf dem Tablet. Die PWA prüft zusätzlich zur Laufzeit, ob die Datei nach Ordnerfreigabe auffindbar ist.

**Quellenkategorien:** `general` (allgemein, mit Redaktionsstand); `personal-demo` (persönliches fiktives Dokument, keine Anordnung); `self-report` (ausdrücklich eigene Angabe). UI übersetzt sie verständlich und zeigt „Stand: Datum“. Ungeprüfte Anordnung bleibt gesperrt.

**Fiktive Aktenreferenzen aus adaptierter Journey:** `E02` OP-Bericht 27.10.2026; `E06` Austrittsinformationen 02.11.2026; `E07` Terminplan Stand 02.11.2026. Keine echte EPIC-Akte.

## 6. Medien und Freigabe (F)

**Übungsvideos** und **Videos zur Alltagsunterstützung** sind zentrale Wege, aber nicht vorhandene Inhalte werden nicht improvisiert. Jeder Player bietet sichtbare Steuerung und einen verständlichen Fallback. Bei Übungsvideos sind fachliche Freigabe, Inhaltsherkunft und Aktualität notwendig. Die erste Technikprüfung kann mit **neutralen, klar als Techniktest gekennzeichneten Clips** erfolgen.

Eine abgespielte MP3 stammt aus vorbereiteter Datei, nicht aus Laufzeit-TTS; Dialogtext bleibt immer lesbar. Medien stoppen bei Navigation.

**F – Medienort:** Sämtliche Filme, MP3s und weitere Mediendateien werden auf dem **Tablet** in `Internal storage/Documents/SMART` abgelegt. GitHub Pages stellt nur Anwendung/Metadaten bereit. Auf `file://...` oder einen Android-Systempfad kann die Browser-PWA **nicht ungefragt** zugreifen. Für das Lesen benötigt sie die explizite lokale Auswahl/Berechtigung (vgl. `media/README.md`).

**V – Mediennamen im Manifest:** `P_EX_001.mp4` (Patienten-Übung), `A_HELP_001.mp4` (Alltagsbegleitung), `A_REST_001.mp4` (Entlastung), `ALMA_P_START.mp3` und `ALMA_A_START.mp3`. Dies sind **erwartete Dateinamen, keine erzeugten oder freigegebenen Medien**; andere Bezeichnungen nur nach konsistenter Anpassung des Manifests.

**V – Setup:** Moderator wählt `Documents/SMART` einmal über eine durch Benutzeraktion gestartete Verzeichnisauswahl. Falls dies auf dem Tablet/Browser nicht funktioniert: eine oder mehrere Dateien im Android-Dateidialog explizit wählen. Die Zuordnung erfolgt über die Dateinamen, ohne Datei-Upload, ohne Schreiben in den Medienordner. Fehlende Videos/MP3s zeigen Textalternativen. `media/README.md` beschreibt den Medienvertrag.

## 7. Druckmaterial und QR-Dateien (F: Ausgabewunsch; V: Layoutdetails)

- `assets/qr/` enthält **11 einzeln druckbare SVG-QR-Codes** mit eindeutiger Karten-ID. Bei direkt verlinktem Video/MP3 enthält **auch der Dateiname** den vorgesehenen lokalen Mediennamen, z. B. `P-EX-001__P_EX_001_mp4.svg`.
- `print/SMARThapti_Faltkarten_A4.pdf` enthält alle elf Karten auf **3 A4-Seiten**: links menschenlesbare Vorderseite, rechts QR-Rückseite, senkrechte Faltlinie und äussere Schnittkontur. Auf 100 %/Originalgrösse drucken und **mit den unbedruckten Seiten nach innen** falten.
- `print/CARD_INDEX.json` bildet Karten-ID, exakt kodierten QR-Text und Medien-Dateiname ab. QR kodiert bewusst **nur** `SH1:<CARD-ID>`; Dateiname wird durch Manifest-Verknüpfung ermittelt. **Ein gewöhnlicher Smartphone-QR-Scanner öffnet dadurch keine Medien-URL.**
- `P-INF-003` und `A-INF-003` sind **zusätzliche, als Vorschlag markierte** Alma-Zugriffskarten. Vor breitem Druck/Praxiseinsatz QR-Grösse, Kontrast und Lesbarkeit am realen Tablet prüfen.
