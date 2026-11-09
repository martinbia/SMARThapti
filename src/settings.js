export const assignmentKey = "smarthapti-media-assignments-v1";
export function validMediaName(name, kind) {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    name.length < 256 &&
    !/[\\/\x00-\x1f]/.test(name) &&
    (kind === "video" ? /\.(mp4|webm|m4v)$/i : /\.(mp3|m4a|wav|ogg)$/i).test(
      name,
    )
  );
}
export function validateAssignments(value, media) {
  if (
    !value ||
    value.version !== 1 ||
    !value.assignments ||
    typeof value.assignments !== "object" ||
    Array.isArray(value.assignments)
  )
    throw Error("Ungültige Zuordnungssicherung.");
  const result = {};
  for (const [id, name] of Object.entries(value.assignments)) {
    const item = media.find((m) => m.id === id);
    if (!item) throw Error("Unbekannte Medien-ID: " + id);
    if (!validMediaName(name, item.kind))
      throw Error("Ungültiger lokaler Dateiname: " + name);
    result[id] = name;
  }
  return result;
}
export function settingsMarkup(manifest, files, esc, button) {
  const names = [
    ...new Set([...manifest.media.map((m) => m.fileName), ...files.keys()]),
  ];
  return `<h1>Einstellungen</h1><ol class="setup-steps"><li><strong>Ordner verbinden:</strong> Interner Speicher → Documents → SMART auswählen. Danach ist keine Einzelauswahl mehr nötig.</li><li><strong>Film zuordnen:</strong> Unten bei jeder Karte „Aus verbundenen Dateien auswählen“ öffnen.</li><li><strong>Zuordnungen speichern</strong> drücken.</li></ol><p>Ordner: <strong>Internal storage/Documents/SMART</strong>. Nach einem Neustart Dateien bei Bedarf erneut freigeben; die gespeicherte Zuordnung bleibt erhalten.</p><div class="actions">${button("Medienordner verbinden", "choose-directory")}${button("Lokale Dateien auswählen", "choose-files")}</div><section class="panel connection-status"><strong>${files.size ? `${files.size} Mediendateien in dieser Sitzung verbunden` : "Noch keine lokalen Mediendateien verbunden"}</strong>${files.size ? `<details><summary>Gefundene Dateien anzeigen</summary><ul>${[...files.keys()].map((n) => `<li>${esc(n)}</li>`).join("")}</ul></details>` : "<p>Eine Dateinamenzuordnung allein ist noch keine Dateifreigabe. Wenn der Ordnerdialog nicht funktioniert: „Lokale Dateien auswählen“, dann im Android-Dialog „Dateien“ oder „Durchsuchen“ wählen und zu Documents/SMART gehen.</p>"}</section><div id="settings-status" aria-hidden="true"></div><form id="assignment-form"><button class="primary" type="submit">Zuordnungen speichern</button>${manifest.media
    .slice()
    .sort(
      (a, b) =>
        Number(b.id.startsWith("M-P-EX-1")) -
        Number(a.id.startsWith("M-P-EX-1")),
    )
    .map((m) => {
      const contents = manifest.contents.filter((c) =>
        c.mediaIds.includes(m.id),
      );
      const cards = manifest.cards.filter((c) =>
        contents.some((x) => x.id === c.contentId),
      );
      return `<section class="panel"><h2>${esc(contents.map((c) => c.title).join(" / ") || m.id)}</h2><p>${cards.map((c) => `<span class="tag">${esc(c.id)}</span>${c.qrFile ? ` <a href="${esc(import.meta.env.BASE_URL + c.qrFile)}" download>QR-Code herunterladen</a>` : ""}`).join(" ")}</p><label for="assign-${esc(m.id)}">Lokale Datei (${m.kind === "video" ? "Video" : "Audio"})</label><input id="assign-${esc(m.id)}" class="media-assignment" data-id="${esc(m.id)}" list="choices-${esc(m.id)}" value="${esc(m.fileName)}" required autocomplete="off"><datalist id="choices-${esc(m.id)}">${names
        .filter((n) => validMediaName(n, m.kind))
        .map((n) => `<option value="${esc(n)}"></option>`)
        .join(
          "",
        )}</datalist><label>Aus verbundenen Dateien auswählen<select class="assignment-choice" data-target="assign-${esc(m.id)}" ${[...files.keys()].some((n) => validMediaName(n, m.kind)) ? "" : "disabled"}><option value="">${[...files.keys()].some((n) => validMediaName(n, m.kind)) ? "Datei auswählen …" : "Zuerst Ordner oder Dateien verbinden"}</option>${[
        ...files.keys(),
      ]
        .filter((n) => validMediaName(n, m.kind))
        .map((n) => `<option value="${esc(n)}">${esc(n)}</option>`)
        .join(
          "",
        )}</select></label><small>Exakter Dateiname inklusive Leerzeichen und Endung. Keine Pfade oder Internetadressen.</small></section>`;
    })
    .join(
      "",
    )}</form><div class="actions">${button("Zuordnungen sichern", "export-assignments")}${button("Sicherung wiederherstellen", "import-assignments")}</div><p>Speicherung auf diesem Tablet für diese Website. Neue Builds und App-Neustarts erhalten die Zuordnung. Das Löschen der Browserdaten oder ein anderer Browser erfordern die Sicherung. Keine Medien werden übertragen.</p><input type="file" id="assignment-backup" accept="application/json,.json" hidden>`;
}
