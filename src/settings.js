export const assignmentKey = "smarthapti-media-assignments-v1";
export const xrayAssignmentKey = "smarthapti-xray-assignment-v1";
export function validImageFile(file) {
  return (
    file &&
    typeof file.name === "string" &&
    !/[\\/\x00-\x1f]/.test(file.name) &&
    /\.(jpe?g|png|webp)$/i.test(file.name) &&
    (!file.type || ["image/jpeg", "image/png", "image/webp"].includes(file.type))
  );
}
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
export function settingsMarkup(manifest, files, esc, button, xray = {}, statuses = {}) {
  const names = [
    ...new Set([...manifest.media.map((m) => m.fileName), ...files.keys()]),
  ];
  const mediaStatuses = (statuses.media || []).map(({ id, name, state }) =>
    `<li><strong>${esc(name)}</strong>: <span data-media-access="${esc(id)}">${esc(state)}</span></li>`,
  ).join("");
  const reconnect = statuses.reconnect
    ? button("Medienordner erneut verbinden", "reconnect-media")
    : button("Medienordner verbinden", "choose-directory");
  const statusText = files.size
    ? `${files.size} lokale Dateien lesbar verbunden`
    : statuses.permissionRequired
      ? "Zuordnungen gespeichert; Zugriff auf lokale Dateien muss erneut freigegeben werden."
      : statuses.handleCount
        ? "Zuordnungen gespeichert; verbundene Datei fehlt oder ist derzeit nicht lesbar."
        : "Zuordnungen sind gespeichert; lokale Dateien sind noch nicht verbunden.";
  const handleStatus = statuses.handleStoreAvailable === false
    ? `<p>Dauerhafte Browser-Dateifreigaben sind hier nicht verfügbar${statuses.handleStoreError ? ` (${esc(statuses.handleStoreError)})` : ""}. Dateinamen und Zuordnungen bleiben gespeichert; verbinde Documents/SMART nach einem Neustart erneut.</p>`
    : "";
  return `<h1>Einstellungen</h1><ol class="setup-steps"><li><strong>Ordner verbinden:</strong> Interner Speicher → Documents → SMART auswählen. Danach ist keine Einzelauswahl mehr nötig.</li><li><strong>Film zuordnen:</strong> Unten bei jeder Karte „Aus verbundenen Dateien auswählen“ öffnen.</li><li><strong>Zuordnungen speichern</strong> drücken.</li></ol><p>Ordner: <strong>Internal storage/Documents/SMART</strong>. Medien-ID und Dateiname bleiben in den Einstellungen gespeichert. Browser-Dateifreigaben werden, sofern Android/Chrome dies zulässt, sicher als Handle gespeichert; sonst kann der Ordner nach einem Neustart erneut freigegeben werden.</p><div class="actions">${reconnect}${button("Lokale Dateien auswählen", "choose-files")}</div><section class="panel connection-status"><strong>${statusText}</strong>${handleStatus}${mediaStatuses ? `<details><summary>Dateistatus anzeigen</summary><ul>${mediaStatuses}</ul></details>` : ""}${files.size ? `<details><summary>Gefundene Dateien anzeigen</summary><ul>${[...files.keys()].map((n) => `<li>${esc(n)}</li>`).join("")}</ul></details>` : "<p>Android speichert keine Medien in der App. Falls die Freigabe fehlt, wähle im Dateimanager „Dateien“ oder „Durchsuchen“ → Interner Speicher → Documents → SMART.</p>"}</section><div id="settings-status" aria-hidden="true"></div><form id="assignment-form"><button class="primary" type="submit">Zuordnungen speichern</button>${manifest.media
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
    )}</form><div class="actions">${button("Zuordnungen sichern", "export-assignments")}${button("Sicherung wiederherstellen", "import-assignments")}</div><p>Speicherung auf diesem Tablet für diese Website. Neue Builds und App-Neustarts erhalten die Zuordnung. Das Löschen der Browserdaten oder ein anderer Browser erfordern die Sicherung. Keine Medien werden übertragen.</p><section class="panel xray-settings"><h2>Röntgenbild auswählen</h2><p>Nur ein fiktives oder ausdrücklich für Demonstrationszwecke freigegebenes JPG-, JPEG-, PNG- oder WebP-Bild aus <strong>Internal storage/Documents/SMART</strong> verwenden. Die Auswahl bleibt lokal auf diesem Gerät; nach einem Neustart kann eine erneute Freigabe nötig sein.</p><label class="xray-approval"><input id="xray-approval" type="checkbox" ${xray.approved ? "checked" : ""}> Ich bestätige, dass das ausgewählte Bild fiktiv oder ausdrücklich für Demonstrationszwecke freigegeben ist.</label><p id="xray-file-status" role="status">${xray.fileName ? `Gespeicherter Dateiname: ${esc(xray.fileName)}${xray.connected ? " · in dieser Sitzung verbunden" : " · Datei erneut auswählen"}` : "Noch kein lokales Demonstrationsbild ausgewählt."}</p>${files.keys().some((n) => /\.(jpe?g|png|webp)$/i.test(n)) ? `<label for="xray-connected-choice">Bild aus dem verbundenen SMART-Ordner</label><select id="xray-connected-choice"><option value="">Bild auswählen …</option>${[...files.keys()].filter((n) => /\.(jpe?g|png|webp)$/i.test(n)).map((n) => `<option value="${esc(n)}" ${xray.fileName === n ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>${button("Aus verbundenem Ordner übernehmen", "use-xray-connected")}` : ""}${button("Lokales Röntgenbild auswählen", "choose-xray", 'class="primary"')}</section><input type="file" id="assignment-backup" accept="application/json,.json" hidden><input type="file" id="local-image" data-picker-kind="image" multiple hidden>`;
}
