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
| `P-EX-001` | Patient, Austritt oder Physio | „Meine Übung ansehen“ / **Video-Slot ohne medizinischen Inhalt bis Freigabe** | ansehen, nicht abhaken |
| `P-APT-001` | Patient, Austritt | „Nächster Physiotherapietermin“ / 10.11. (fiktiv) | nach Bestätigung in Timeline |
| `P-MIL-001` | Patient, Physio 10.11. | „Ein eigener Alltagsschritt“ / selbst berichteter Meilenstein | nach Bestätigung in Timeline |
| `A-INF-001` | Angehörige, Austritt | „Unterstützen ohne zu übernehmen“ / Unterstützungsvideo-Slot | ansehen |
| `A-INF-002` | Angehörige, Austritt | „Auch an mich denken“ / Entlastungsinfo, Video-Slot | ansehen |
| `A-APT-001` | Angehörige, Austritt | „Physiotherapie: gemeinsam Fragen sammeln“ / **derselbe Termin-Eventkey wie P-APT-001** | nach Bestätigung; kein doppelter Termin |
| `A-MIL-001` | Angehörige, Physio 10.11. | „Eine Pause für mich eingeplant“ / eigene Angabe | nach Bestätigung; nur Angehörigenansicht |

**V:** P-MIL-001 ist bewusst ein **freiwillig berichteter Alltagsschritt**, keine klinische Leistungszusage. Beispielsatz: „Ich habe heute selbst das Frühstück vorbereitet.“ Das ist **keine** Aussage über Freigabe oder Sicherheit dieser Handlung.

## 4. QR-Vertrag und Duplikate (V)

Payload-Vorschlag: `SH1:P-EX-001`. Format: ASCII, Version `SH1`, Doppelpunkt, stabile Karten-ID. Kein Link zu einer Person, keine sensiblen Angaben; Scanner validiert Format, sucht ID im Manifest, führt eine reine Leseaktion aus. Falls sich später echte URL-QRs als praktischer erweisen, in `docs/DECISIONS.md` entscheiden, bevor Karten gedruckt werden.

Mehrere Karten dürfen auf **denselben fachlichen Eventkey** verweisen (z. B. `J10` für 10.11.2026). Ein Eintrag wird nur nach expliziter Bestätigung unter diesem Key gespeichert. Die Karte selbst bleibt unabhängig davon beliebig oft anzeigbar.

## 5. Inhalte getrennt von Code (V)

Redaktionelle Basis: `content/demo_manifest.json` (Personen, Demoquellen, Karten, Contents, Medienreferenzen, Timeline-Basis). Dialoge: `content/demo_dialogs.json`. App-Code kennt nur IDs/Schemas und zeigt Daten an; keine Texte oder Medienpfade in UI-Komponenten duplizieren. Alle JSON-Datensätze sind **fiktive Interviewvorlagen**.

Inhaltssatz benötigt mindestens: `id, role, title, shortText, detailText, sourceIds, sourceKind, sourceDate, reviewed, mediaIds`. Medienzuordnung: `id, kind, path, status, transcriptOrFallback`. `path: null` bedeutet **nicht vorhanden**, kein defekter Pfad. Erst bei konkretem File im Repo den relativen Pfad eintragen.

**Quellenkategorien:** `general` (allgemein, mit Redaktionsstand); `personal-demo` (persönliches fiktives Dokument, keine Anordnung); `self-report` (ausdrücklich eigene Angabe). UI übersetzt sie verständlich und zeigt „Stand: Datum“. Ungeprüfte Anordnung bleibt gesperrt.

**Fiktive Aktenreferenzen aus adaptierter Journey:** `E02` OP-Bericht 27.10.2026; `E06` Austrittsinformationen 02.11.2026; `E07` Terminplan Stand 02.11.2026. Keine echte EPIC-Akte.

## 6. Medien und Freigabe (F)

**Übungsvideos** und **Videos zur Alltagsunterstützung** sind zentrale Wege, aber nicht vorhandene Inhalte werden nicht improvisiert. Jeder Player bietet sichtbare Steuerung und einen verständlichen Fallback. Bei Übungsvideos sind fachliche Freigabe, Inhaltsherkunft und Aktualität notwendig. Die erste Technikprüfung kann mit **neutralen, klar als Techniktest gekennzeichneten Clips** erfolgen.

Eine abgespielte MP3 stammt aus vorbereiteter Datei, nicht aus Laufzeit-TTS; Dialogtext bleibt immer lesbar. Medien stoppen bei Navigation. `media/README.md` erklärt die spätere Ablage.
