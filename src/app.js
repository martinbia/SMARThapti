import jsQR from "jsqr";
import { setupUpdates } from "./updates.js";
import "./style.css";
import { types, resolveQR, visibleEvents, addEvent } from "./model.js";
import { welcomeMarkup, animateWelcome } from "./welcome.js";
import {
  loadMediaHandles,
  saveDirectoryHandle,
  saveFileHandles,
  queryReadPermission,
  requestReadPermission,
} from "./media-handle-store.js";
import {
  assignmentKey,
  xrayAssignmentKey,
  validMediaName,
  validImageFile,
  validateAssignments,
  settingsMarkup,
} from "./settings.js";
const base = import.meta.env.BASE_URL;
const root = document.querySelector("#app");
const role = "patient"; // Festgelegt: SMARThapti hat keine Angehörigenperspektive.
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const button = (text, action, extra = "") =>
  `<button data-action="${esc(action)}" ${extra}>${esc(text)}</button>`;
let manifest,
  dialogs,
  updateManager = null,
  catalog,
  patientRecord,
  patientRecordContents,
  assignments = {},
  xrayAssignment = { fileName: "", approved: false },
  mediaDefaults = {},
  scenario = "discharge",
  keys = [],
  directory = null,
  storedDirectory = null,
  storedFileHandles = new Map(),
  missingFiles = new Set(),
  permissionMissingFiles = new Set(),
  permissionRequired = false,
  handleStoreAvailable = true,
  handleStoreError = "",
  handleLoadState = "nicht geprüft",
  handleRecordCount = 0,
  directoryPermissionState = "nicht geprüft",
  filePermissionCounts = { granted: 0, prompt: 0, denied: 0, unsupported: 0 },
  lastPickerMode = "",
  lastHandleError = "",
  pickerPending = false,
  selectionRequest = 0,
  files = new Map(),
  stream = null,
  frame = 0,
  urls = [],
  generation = 0,
  facing = "user",
  stopWelcome = () => {},
  sleeping = false,
  loadError = false,
  storageOK = true;
let imageZoom = 1;
try {
  sleeping = sessionStorage.getItem("smarthapti-asleep") === "true";
} catch {}
try {
  const saved = JSON.parse(localStorage.getItem("smarthapti-demo") || "{}");
  keys = Array.isArray(saved.keys)
    ? saved.keys.filter((k) => typeof k === "string")
    : [];
  scenario = saved.scenario === "physio" ? "physio" : "discharge";
} catch {
  storageOK = false;
}
function save() {
  try {
    localStorage.setItem("smarthapti-demo", JSON.stringify({ keys, scenario }));
  } catch {
    storageOK = false;
  }
}
function supportedFile(name) {
  return /\.(mp4|webm|m4v|mp3|m4a|wav|ogg)$/i.test(name);
}
function supportedLocalFile(file) {
  return supportedFile(file.name) || validImageFile(file);
}
function mediaFileNames() {
  return [...new Set([
    ...manifest.media.map((media) => media.fileName),
    ...(xrayAssignment.fileName ? [xrayAssignment.fileName] : []),
  ])];
}
async function readDirectoryFiles(handle) {
  const found = new Map();
  const needsPermission = new Set();
  try {
    for await (const entry of handle.values()) {
      if (entry.kind === "file" && (supportedFile(entry.name) || /\.(jpe?g|png|webp)$/i.test(entry.name))) {
        try {
          const file = await entry.getFile();
          if (supportedLocalFile(file)) found.set(file.name, file);
        } catch (error) {
          if (["NotAllowedError", "SecurityError"].includes(error?.name))
            needsPermission.add(entry.name);
        }
      }
    }
    permissionMissingFiles = needsPermission;
    permissionRequired = needsPermission.size > 0;
    missingFiles = new Set(mediaFileNames().filter((name) => !found.has(name) && !needsPermission.has(name)));
  } catch (error) {
    permissionRequired = true;
    lastHandleError = error?.name || "DirectoryReadError";
    permissionMissingFiles = new Set(mediaFileNames());
    missingFiles.clear();
    return found;
  }
  return found;
}
async function restoreMediaHandles() {
  handleLoadState = "wird geladen";
  filePermissionCounts = { granted: 0, prompt: 0, denied: 0, unsupported: 0 };
  try {
    permissionMissingFiles = new Set();
    const records = await loadMediaHandles();
    handleLoadState = "geladen";
    handleRecordCount = records.length;
    lastHandleError = "";
    storedDirectory = records.find((record) => record.id === "directory")?.handle || null;
    storedFileHandles = new Map(records
      .filter((record) => record.id?.startsWith("file:") && record.handle)
      .map((record) => [record.name || record.id.slice(5), record.handle]));
    if (storedDirectory) {
      const permission = await queryReadPermission(storedDirectory);
      directoryPermissionState = permission;
      if (permission === "granted") {
        directory = storedDirectory;
        permissionRequired = false;
        files = await readDirectoryFiles(directory);
        return;
      }
      permissionRequired = true;
      permissionMissingFiles = new Set(mediaFileNames());
    } else directoryPermissionState = "kein Ordner-Handle gespeichert";
    let anyPermissionNeeded = false;
    for (const [name, handle] of storedFileHandles) {
      const permission = await queryReadPermission(handle);
      filePermissionCounts[permission] = (filePermissionCounts[permission] || 0) + 1;
      if (permission === "granted") {
        try {
          const file = await handle.getFile();
          if (file.name === name && supportedLocalFile(file)) files.set(name, file);
          else missingFiles.add(name);
        } catch (error) {
          if (["NotAllowedError", "SecurityError"].includes(error?.name)) {
            permissionMissingFiles.add(name);
            permissionRequired = true;
          } else missingFiles.add(name);
        }
      } else {
        anyPermissionNeeded = true;
        permissionMissingFiles.add(name);
      }
    }
    permissionRequired ||= anyPermissionNeeded;
  } catch (error) {
    handleStoreAvailable = false;
    handleLoadState = "Fehler";
    lastHandleError = error?.name || "IndexedDBError";
    handleStoreError = lastHandleError;
  }
}
function mediaAccessStatuses() {
  return manifest.media.map((media) => ({
    id: media.id,
    name: media.fileName,
    state: (() => {
      const file = files.get(media.fileName);
      const mappingState = Object.hasOwn(assignments, media.id)
        ? "Zuordnung gespeichert"
        : "Standarddateiname";
      return file && file.size > 0 && file.name === media.fileName && validMediaName(file.name, media.kind)
        ? "Verbunden und lesbar"
        : permissionMissingFiles.has(media.fileName)
          ? `${mappingState} · Berechtigung erforderlich`
          : missingFiles.has(media.fileName)
            ? `${mappingState} · Datei nicht gefunden oder umbenannt`
            : `${mappingState} · Datei noch nicht verbunden`;
    })(),
  }));
}
function persistPickerMode(mode) {
  lastPickerMode = mode;
  try {
    localStorage.setItem("smarthapti-media-picker-mode-v1", mode);
  } catch {
    lastHandleError = "PickerModeStorageError";
  }
}
function mediaDiagnostics() {
  const videoNames = new Set(manifest.media.filter((m) => m.kind === "video").map((m) => m.fileName));
  return {
    browser: navigator.userAgent,
    secureContext: Boolean(window.isSecureContext),
    showDirectoryPicker: typeof window.showDirectoryPicker === "function",
    showOpenFilePicker: typeof window.showOpenFilePicker === "function",
    webkitdirectory: "webkitdirectory" in document.createElement("input"),
    fileInput: "files" in document.createElement("input"),
    indexedDB: Boolean(window.indexedDB),
    handleLoadState,
    savedHandleCount: handleRecordCount,
    directoryHandleLoaded: Boolean(storedDirectory),
    directoryPermission: directoryPermissionState,
    fileHandlePermissions: filePermissionCounts,
    savedAssignmentCount: Object.keys(assignments).length,
    mediaMappingCount: manifest.media.length,
    readableVideoCount: [...videoNames].filter((name) => {
      const file = files.get(name);
      return file && file.size > 0 && validMediaName(file.name, "video");
    }).length,
    lastPickerMode: lastPickerMode || "keine Auswahl erfasst",
    lastHandleError,
  };
}
function formatMediaDiagnostics() {
  const d = mediaDiagnostics();
  return [
    `Browser: ${d.browser}`,
    `Sicherer Kontext: ${d.secureContext}`,
    `showDirectoryPicker: ${d.showDirectoryPicker}`,
    `showOpenFilePicker: ${d.showOpenFilePicker}`,
    `webkitdirectory: ${d.webkitdirectory}`,
    `HTML-Dateiauswahl: ${d.fileInput}`,
    `IndexedDB verfügbar: ${d.indexedDB}`,
    `Handle-Ladevorgang: ${d.handleLoadState}`,
    `Gespeicherte Handles: ${d.savedHandleCount}`,
    `Ordner-Handle geladen: ${d.directoryHandleLoaded}`,
    `Ordnerberechtigung: ${d.directoryPermission}`,
    `Datei-Handle-Berechtigungen: ${JSON.stringify(d.fileHandlePermissions)}`,
    `Gespeicherte Medienzuordnungen: ${d.savedAssignmentCount}/${d.mediaMappingCount}`,
    `Lesbare Videos: ${d.readableVideoCount}`,
    `Letzte Auswahlmethode: ${d.lastPickerMode}`,
    `Letzter technischer Fehler: ${d.lastHandleError || "keiner"}`,
  ].join("\n");
}
function recordDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}
function persistAssignments(value) {
  try {
    const next = validateAssignments(value, manifest.media);
    localStorage.setItem(
      assignmentKey,
      JSON.stringify({ version: 1, assignments: next }),
    );
    assignments = next;
    manifest.media.forEach((m) => {
      m.fileName = assignments[m.id] || mediaDefaults[m.id];
    });
    render();
    message("Zuordnungen dauerhaft auf diesem Gerät gespeichert.");
  } catch (error) {
    message("Nicht gespeichert: " + error.message);
  }
}
function persistXrayFile(file) {
  if (!validImageFile(file) || !file.size) {
    message("Bitte eine gültige JPG-, JPEG-, PNG- oder WebP-Datei auswählen.");
    return false;
  }
  const next = { fileName: file.name, approved: true };
  try {
    localStorage.setItem(xrayAssignmentKey, JSON.stringify({ version: 1, ...next }));
  } catch {
    message("Die Dateizuordnung konnte nicht dauerhaft gespeichert werden. Sie bleibt unverändert.");
    return false;
  }
  xrayAssignment = next;
  files.set(file.name, file);
  return true;
}
function cleanup() {
  stopWelcome();
  stopWelcome = () => {};
  document.querySelector("#camera-indicator")?.remove();
  generation++;
  cancelAnimationFrame(frame);
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  document.querySelectorAll("audio,video").forEach((p) => {
    p.pause();
    p.removeAttribute("src");
    p.srcObject = null;
    p.load();
  });
  urls.forEach(URL.revokeObjectURL);
  urls = [];
}
function go(path) {
  selectionRequest++;
  pickerPending = false;
  imageZoom = 1;
  if (location.hash === `#${path}`) render();
  else location.hash = path;
}
function appendPowerButton() {
  let target = root;
  if (!root.classList.contains("welcome-mode")) {
    const content = document.createElement("div");
    content.className = "app-content";
    content.append(...root.childNodes);
    root.append(content);
    let header = content.querySelector("header");
    if (!header) {
      header = document.createElement("header");
      content.prepend(header);
    }
    target = header;
  }
  target.insertAdjacentHTML(
    "beforeend",
    '<button class="power-off" data-action="power-off" aria-label="Abschalten" title="Abschalten"><span aria-hidden="true">⏻</span><span class="power-label"> Abschalten</span></button>',
  );
}
function setSleeping(value) {
  sleeping = value;
  selectionRequest++;
  pickerPending = false;
  try {
    if (value) sessionStorage.setItem("smarthapti-asleep", "true");
    else sessionStorage.removeItem("smarthapti-asleep");
  } catch {}
  if (!value) history.replaceState(null, "", "#welcome");
  render();
}
function message(text) {
  updateManager?.refresh();
  const el = document.querySelector("#status");
  if (el) el.textContent = text;
  const visibleStatus = document.querySelector("#settings-status");
  if (visibleStatus) visibleStatus.textContent = text;
}
function persona() {
  return manifest.personas.find((p) => p.role === role);
}
function cardButtons(cards) {
  const icons = {
    information: "▤",
    exercise: "▷",
    appointment: "▦",
    milestone: "☆",
  };
  return `<div class="grid">${cards.map((c) => `<button data-action="card:${esc(c.id)}"><span class="symbol" aria-hidden="true">${icons[c.type]}</span><strong>${esc(c.printTitle || c.title)}</strong><small>${esc(types[c.type])} · ${esc(c.id)}</small></button>`).join("")}</div>`;
}
function source(content) {
  return `<aside class="panel"><strong>${esc(manifest.sourceKinds[content.sourceKind])}</strong><p>Stand: ${esc(content.sourceDate)} · fiktiv · nicht klinisch geprüft</p>${content.sourceIds.map((id) => `<small>${esc(manifest.sources.find((s) => s.id === id)?.title || id)}</small>`).join("<br>")}</aside>`;
}
function mediaMarkup(ids, { videoView = false } = {}) {
  return ids
    .map((id) => {
      const m = manifest.media.find((m) => m.id === id);
      if (!m) return "";
      if (videoView)
        return `<section class="video-media-panel" data-media="${esc(id)}"><div class="player-slot video-player-slot"></div><p class="media-status video-media-status" role="status" aria-live="polite" hidden></p><p class="video-media-fallback" hidden>${esc(m.transcriptOrFallback)}</p><div class="video-file-action" hidden>${button("Lokale Datei(en) auswählen", "choose-files", 'class="primary"')}</div><details class="video-notes"><summary>Hinweise zum Video</summary><p>Übungsfilm · Inhalt und persönliche Eignung nicht klinisch geprüft.</p><p>Das Ansehen bestätigt keine durchgeführte Übung.</p><p>Nur freigegebene Inhalte oder neutrale Techniktest-Dateien verwenden.</p><p>${esc(m.transcriptOrFallback)}</p></details></section>`;
      return `<section class="panel" data-media="${esc(id)}"><p class="notice">Nicht klinisch geprüft. Nur freigegebene Inhalte oder neutrale Techniktest-Dateien verwenden.</p><p>${esc(m.transcriptOrFallback)}</p><div class="player-slot"></div><p class="media-status">Lokale Datei wird geprüft: ${esc(m.fileName)}</p>${button("Lokale Datei(en) auswählen", "choose-files")}</section>`;
    })
    .join("");
}
function patientVideoCards() {
  return manifest.cards.filter(
    (card) =>
      card.id !== "P-EX-001" &&
      card.role === "patient" &&
      card.type === "exercise" &&
      manifest.contents
        .find((content) => content.id === card.contentId)
        ?.mediaIds.some((mediaId) =>
          manifest.media.some(
            (media) => media.id === mediaId && media.kind === "video",
          ),
        ),
  );
}
function homeDashboard() {
  const appointmentEvents = manifest.timeline
    .filter(
      (event) =>
        event.kind === "planned-candidate" &&
        manifest.cards.some(
          (card) => card.type === "appointment" && card.eventKey === event.eventKey,
        ),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const firstAppointment = appointmentEvents[0];
  const dateAnchor = scenario === "physio" ? firstAppointment?.date : manifest.asOf;
  const appointments = appointmentEvents.filter((event) => event.date >= dateAnchor);
  const videos = patientVideoCards();
  return `<section class="home-dashboard" aria-label="Videos, Termine und Patientenakte"><div class="home-video-column"><h2>Videos</h2><ul class="home-video-list">${videos
    .map((card) => `<li>${button(card.printTitle || card.title, `video:${card.id}`, 'class="home-video-row"')}</li>`)
    .join("")}</ul></div><div class="home-right-column"><section class="home-dashboard-section"><h2>Nächste Physiotherapietermine</h2>${appointments.length ? `<ul class="home-appointment-list">${appointments
    .map((event) => {
      const card = manifest.cards.find(
        (entry) => entry.type === "appointment" && entry.eventKey === event.eventKey,
      );
      return card
        ? `<li><button data-action="card:${esc(card.id)}" class="home-appointment-row"><strong>${esc(event.title)}</strong><span>${recordDate(event.date)}</span></button></li>`
        : "";
    })
    .join("")}</ul>` : "<p>Kein zukünftiger Physiotherapietermin im gewählten Interviewszenario hinterlegt.</p>"}</section><section class="home-dashboard-section"><h2>Patientenakte</h2><ul class="home-record-list">${patientRecord.items
    .map((item) => `<li>${button(item.title, `record:${item.id}`, 'class="home-record-row"')}</li>`)
    .join("")}</ul></section></div></section><div class="home-menu-links">${button("Alma fragen", "dialog:" + dialogs.startNodes[role])}${button("Mein Weg", "timeline")}</div>`;
}
function recordSummary(item) {
  const sourceItem = manifest.sources.find((sourceItem) => sourceItem.id === item.sourceId);
  return `<p class="record-demo-source">Fiktive Demo · nicht klinisch geprüft · Herkunft: simulierte EPIC-Ansicht (${esc(sourceItem?.title || "Patientenakte")}) · Datenstand ${recordDate(item.dataDate)}</p>`;
}
async function localFile(m) {
  if (directory) {
    try {
      const handle = await directory.getFileHandle(m.fileName);
      return await handle.getFile();
    } catch {
      return files.get(m.fileName) || null;
    }
  }
  return files.get(m.fileName) || null;
}
async function mountMedia(token) {
  for (const el of document.querySelectorAll("[data-media]")) {
    const m = manifest.media.find((m) => m.id === el.dataset.media);
    const videoView = el.classList.contains("video-media-panel");
    const file = await localFile(m);
    if (token !== generation) return;
    const status = el.querySelector(".media-status");
    const fileAction = el.querySelector(".video-file-action");
    const fallback = el.querySelector(".video-media-fallback");
    if (!file) {
      if (videoView) {
        el.classList.add("video-media-missing");
        status.hidden = false;
        status.textContent = `Video nicht verfügbar. Die lokale Datei ${m.fileName} fehlt oder ist nicht freigegeben.`;
        fileAction.hidden = false;
        fallback.hidden = false;
      } else {
        status.textContent = `Nicht verbunden oder nicht lesbar: ${m.fileName}. Bitte lokal aus Documents/SMART auswählen. Der Text bleibt verfügbar.`;
      }
      continue;
    }
    if (!file.size || !validMediaName(file.name, m.kind)) {
      if (videoView) {
        el.classList.add("video-media-missing");
        status.hidden = false;
        status.textContent = `Datei nicht abspielbar: ${m.fileName}. Bitte eine gültige MP4-Datei auswählen.`;
        fileAction.hidden = false;
        fallback.hidden = false;
      } else {
        status.textContent = `Dateiformat nicht lesbar: ${m.fileName}. Bitte eine gültige ${m.kind === "video" ? "MP4" : "MP3"}-Datei auswählen.`;
      }
      continue;
    }
    const url = URL.createObjectURL(file);
    urls.push(url);
    const player = document.createElement(
      m.kind === "video" ? "video" : "audio",
    );
    if (videoView) player.className = "video-player";
    player.controls = true;
    player.preload = "metadata";
    player.setAttribute("playsinline", "");
    player.src = url;
    player.setAttribute("aria-label", m.fileName);
    player.addEventListener("play", () =>
      document.querySelectorAll("video,audio").forEach((p) => {
        if (p !== player) p.pause();
      }),
    );
    player.addEventListener("error", () => {
      if (videoView) {
        el.classList.add("video-media-missing");
        status.hidden = false;
        status.textContent = "Das Video ist nicht abspielbar oder die lokale Dateifreigabe fehlt. Die Textalternative und Dateiauswahl bleiben verfügbar.";
        fileAction.hidden = false;
        fallback.hidden = false;
        player.closest(".video-player-wrap")?.remove();
      } else {
        status.textContent = `${m.fileName} ist nicht abspielbar oder die Berechtigung fehlt. Textalternative und Dateiauswahl bleiben verfügbar.`;
        player.remove();
      }
    });
    if (videoView) {
      const wrap = document.createElement("div");
      wrap.className = "video-player-wrap";
      const manualStart = document.createElement("button");
      manualStart.className = "video-start-button primary";
      manualStart.type = "button";
      manualStart.textContent = "Video starten";
      manualStart.hidden = true;
      manualStart.addEventListener("click", async () => {
        manualStart.hidden = true;
        try {
          if (player.readyState > 0) player.currentTime = 0;
          await player.play();
        } catch {
          manualStart.hidden = false;
          status.hidden = false;
          status.textContent = "Tippe auf „Video starten“, um das Video mit Ton abzuspielen.";
        }
      });
      wrap.append(player, manualStart);
      el.querySelector(".player-slot").append(wrap);
      player.dataset.autoplayAttempted = "true";
      try {
        const playback = player.play();
        if (playback?.then) await playback;
      } catch (error) {
        if (token !== generation) return;
        if (error?.name === "NotAllowedError") {
          manualStart.hidden = false;
          status.hidden = false;
          status.textContent = "Automatischer Start wurde vom Browser blockiert. Tippe auf „Video starten“, um den Film mit Ton abzuspielen.";
        } else if (error?.name !== "AbortError") {
          status.hidden = false;
          status.textContent = "Das Video konnte nicht automatisch gestartet werden. Verwende die Videosteuerung zum Starten.";
        }
      }
    } else {
      el.querySelector(".player-slot").append(player);
    }
    if (!videoView) {
      const stop = document.createElement("button");
      stop.textContent = "Wiedergabe stoppen";
      stop.onclick = () => {
        player.pause();
        player.currentTime = 0;
      };
      el.querySelector(".player-slot").append(stop);
    }
    if (!videoView) status.textContent = `Lokal verbunden: ${m.fileName}. Kein Upload.`;
  }
}
async function mountXray(token) {
  const status = document.querySelector("#record-image-status");
  const image = document.querySelector("#record-xray-image");
  if (!xrayAssignment.approved || !xrayAssignment.fileName) return;
  const file = directory
    ? await directory
        .getFileHandle(xrayAssignment.fileName)
        .then((handle) => handle.getFile())
        .catch(() => files.get(xrayAssignment.fileName) || null)
    : files.get(xrayAssignment.fileName) || null;
  if (token !== generation) return;
  if (!file) {
    status.textContent = `Die Bilddatei ${xrayAssignment.fileName} ist nicht verbunden. Bitte in den Einstellungen erneut aus Documents/SMART auswählen.`;
    return;
  }
  if (!validImageFile(file) || !file.size) {
    status.textContent = `Die Datei ${xrayAssignment.fileName} ist kein lesbares JPG-, JPEG-, PNG- oder WebP-Bild.`;
    return;
  }
  const url = URL.createObjectURL(file);
  urls.push(url);
  image.addEventListener("load", () => {
    if (token !== generation) return;
    status.textContent = `Lokal geöffnet: ${xrayAssignment.fileName}. Keine Übertragung.`;
    image.hidden = false;
    image.closest(".record-image-viewer")?.classList.add("has-image");
  }, { once: true });
  image.addEventListener("error", () => {
    if (token !== generation) return;
    status.textContent = "Das ausgewählte Bild konnte nicht angezeigt werden. Bitte eine freigegebene JPG-, JPEG-, PNG- oder WebP-Datei erneut auswählen.";
  }, { once: true });
  image.src = url;
}
function render() {
  updateManager?.refresh();
  cleanup();
  const token = generation;
  const [view, id] = (location.hash.slice(1) || "welcome").split("/");
  root.classList.toggle("welcome-mode", !sleeping && view === "welcome");
  root.classList.toggle("video-mode", !sleeping && view === "video");
  root.classList.toggle("sleep-mode", sleeping);
  document.body.classList.toggle("sleep-mode", sleeping);
  if (sleeping) {
    root.innerHTML =
      '<main aria-label="App im Ruhemodus"><button class="wake-screen" data-action="wake" aria-label="App einschalten"></button></main>';
    document.title = "Ruhemodus · SMARThapti";
    root.querySelector(".wake-screen").focus({ preventScroll: true });
    window.scrollTo(0, 0);
    return;
  }
  if (!manifest || !dialogs) {
    root.innerHTML = loadError
      ? '<main><h1>Die Demo konnte nicht geladen werden.</h1><p>Bitte Verbindung prüfen und die Seite neu laden.</p><button data-action="reload">Erneut laden</button></main>'
      : "<main><p>Alma lädt die Demo …</p></main>";
    appendPowerButton();
    return;
  }
  if (view === "welcome") {
    root.innerHTML = welcomeMarkup(base);
    appendPowerButton();
    document.title = "Willkommen bei Alma · SMARThapti";
    stopWelcome = animateWelcome(root);
    startCamera(token);
    return;
  }
  let body = "";
  let title = "Heute mit Alma";
  if (view === "home") {
    body = `<h1 class="menu-heading">Was möchten Sie ansehen?</h1><div class="actions">${button("QR-Karte scannen", "scan", 'class="primary"')}${button("Karte auswählen", "cards")}</div>${homeDashboard()}`;
  } else if (view === "cards") {
    title = "Meine Karten";
    body = `<h1>Meine Karten</h1><label>Kartentyp <select id="filter"><option value="all">Alle Karten</option>${Object.entries(
      types,
    )
      .map(([key, label]) => `<option value="${key}">${label}</option>`)
      .join(
        "",
      )}</select></label><div id="card-list">${cardButtons(manifest.cards.filter((c) => c.role === role))}</div>`;
  } else if (view === "card") {
    const c = manifest.cards.find((c) => c.id === id);
    if (!c) {
      go("home");
      return;
    }
    if (c.role !== role) {
      go("home");
      return;
    }
    const content = manifest.contents.find((x) => x.id === c.contentId);
    title = c.printTitle || c.title;
    body = `<span class="tag">${esc(types[c.type])} · ${esc(c.id)}</span><h1>${esc(title)}</h1><p>${esc(content.shortText)}</p><p>${esc(content.detailText)}</p>${source(content)}${mediaMarkup(content.mediaIds)}${c.eventKey ? button(keys.includes(c.eventKey) ? "Eintrag bereits vorhanden – ansehen" : "Zur Timeline hinzufügen", keys.includes(c.eventKey) ? "timeline" : "confirm:" + c.id, 'class="primary"') : ""}`;
  } else if (view === "video") {
    const c = manifest.cards.find((card) => card.id === id && card.role === role && card.type === "exercise");
    const content = manifest.contents.find((entry) => entry.id === c?.contentId);
    if (!c || !content) {
      go("home");
      return;
    }
    title = c.printTitle || c.title;
    body = mediaMarkup(content.mediaIds, { videoView: true });
  } else if (view === "dialog") {
    const node = dialogs.nodes.find((n) => n.id === id);
    if (!node) {
      go("home");
      return;
    }
    if (node.role !== role) {
      go("home");
      return;
    }
    title = "Alma fragen";
    const content = manifest.contents.find((c) => c.dialogNodeId === node.id);
    body = `<h1>🐮 Alma fragt</h1><section class="panel hero"><p>${esc(node.text)}</p></section>${content ? source(content) : ""}${mediaMarkup([node.audioMediaId])}<div class="actions">${node.answers.map((a, i) => button(a.label, "answer:" + node.id + ":" + i)).join("")}</div>`;
  } else if (view === "confirm") {
    const c = manifest.cards.find((c) => c.id === id && c.role === role);
    const event = manifest.timeline.find(
      (e) => e.eventKey === c?.eventKey && e.requiresConfirmation,
    );
    if (!event) {
      go("home");
      return;
    }
    title = "Eintrag bestätigen";
    body = `<h1>Diesen Eintrag hinzufügen?</h1><section class="panel"><h2>${esc(event.title)}</h2><p>${esc(event.date)} · ${esc(manifest.sourceKinds[event.sourceKind])}</p><p>Fiktiver Demo-Eintrag. ${event.visibility ? "Nur in Ihrer Perspektive sichtbar." : "Gemeinsamer Termin für beide Perspektiven."}</p></section><div class="actions">${button("Hinzufügen", "add:" + c.id, 'class="primary"')}${button("Abbrechen", "card:" + c.id)}</div>`;
  } else if (view === "timeline") {
    title = "Mein Weg";
    body = `<h1>Mein Weg</h1><section class="panel hero"><span class="tag">Persönliches Ziel · fiktiv</span><p>${esc(persona().personalGoal)}</p></section><ul class="timeline">${visibleEvents(
      manifest,
      keys,
      role,
    )
      .map(
        (e) =>
          `<li><span class="tag">${e.kind === "past" ? "Geschehen" : e.sourceKind === "self-report" ? "Selbst berichtet" : "Geplant"}</span><h2>${esc(e.title)}</h2><p>${esc(e.date)} · ${esc(manifest.sourceKinds[e.sourceKind])}</p><small>${e.sourceIds.map((id) => esc(manifest.sources.find((s) => s.id === id)?.title)).join(", ")} · fiktiv · nicht klinisch geprüft</small></li>`,
      )
      .join(
        "",
      )}</ul><p>Neue Termine und Meilensteine erscheinen erst nach Ihrer Bestätigung über eine Karte. Videoansicht bedeutet keine durchgeführte Übung.</p>${button("Karte auswählen", "cards")}`;
  } else if (view === "scan") {
    title = "QR-Karte scannen";
    body = `<h1>QR-Karte scannen</h1><p>Halten Sie eine gedruckte Karte vor die Kamera. Der Scan öffnet Inhalte und speichert keinen Eintrag.</p><video id="camera" autoplay muted playsinline aria-label="Kameravorschau"></video><div class="actions">${button("Kamera wechseln", "switch-camera")}${button("Karte ohne Kamera wählen", "cards", 'class="primary"')}</div>`;
  } else if (view === "settings") {
    title = "Einstellungen";
    body = settingsMarkup(manifest, files, esc, button, {
      ...xrayAssignment,
      connected: Boolean(xrayAssignment.fileName && files.has(xrayAssignment.fileName)),
    }, {
      media: mediaAccessStatuses(),
      permissionRequired,
      handleCount: Number(Boolean(storedDirectory)) + storedFileHandles.size,
      reconnect: Boolean((storedDirectory || storedFileHandles.size) && permissionRequired),
      handleStoreAvailable,
      handleStoreError,
      directoryPickerAvailable: typeof window.showDirectoryPicker === "function",
      durableFolderSharingUnavailable: typeof window.showDirectoryPicker !== "function" || !handleStoreAvailable,
      requiresDirectoryReselect: !storedDirectory && storedFileHandles.size === 0 && Boolean(lastPickerMode || Object.keys(assignments).length),
      diagnostics: mediaDiagnostics(),
    });
  } else if (view === "record") {
    title = id ? "Patientenakte" : "Patientenakte";
    if (!id) {
      body = `<h1>Patientenakte</h1><p class="record-intro">Simulierte EPIC-Ansicht · alle Angaben fiktiv · nicht klinisch geprüft</p><ul class="record-list">${patientRecord.items
        .map((item) => `<li>${button(item.title, `record:${item.id}`, 'class="record-row"')}${recordSummary(item)}</li>`)
        .join("")}</ul>`;
    } else {
      const item = patientRecord.items.find((entry) => entry.id === id);
      const content = patientRecordContents.contents.find((entry) => entry.id === item?.contentId);
      if (!item || !content) {
        go("record");
        return;
      }
      title = item.title;
      if (item.type === "image") {
        body = `<h1>${esc(item.title)}</h1>${recordSummary(item)}<p class="notice">Fiktive Demoansicht. Das Bild wird ausschliesslich lokal angezeigt, nicht übertragen und nicht im App-Cache gespeichert.</p><div id="record-image-view" class="record-image-viewer"><p id="record-image-status" role="status">${xrayAssignment.approved ? (files.has(xrayAssignment.fileName) ? "Lokales Bild wird geöffnet …" : "Kein Bild verbunden. Wähle eine freigegebene Datei in den Einstellungen aus.") : "Noch kein fiktives oder ausdrücklich freigegebenes Demonstrationsbild ausgewählt."}</p><img id="record-xray-image" alt="Lokal ausgewähltes Röntgen-Demonstrationsbild" hidden></div><div class="record-image-controls">${button("Verkleinern", "image-zoom-out")}${button("Originalgrösse", "image-zoom-reset")}${button("Vergrössern", "image-zoom-in")}</div>${button("Bild in Einstellungen auswählen", "settings", 'class="primary"')}<section class="panel record-document" aria-label="Fiktive Bildinformation">${content.sections
          .map((section) => `<h2>${esc(section.heading)}</h2><p>${esc(section.text)}</p>`)
          .join("")}</section>`;
      } else {
        body = `<h1>${esc(item.title)}</h1>${recordSummary(item)}<section class="panel record-document" aria-label="Fiktives Beispieldokument">${content.sections
          .map((section) => `<h2>${esc(section.heading)}</h2><p>${esc(section.text)}</p>`)
          .join("")}</section><p class="notice">Nur vorbereitete fiktive Beispieldaten. Keine Verbindung zu EPIC, Krankenhausservern oder externen APIs.</p>`;
      }
    }
  } else if (view === "moderator") {
    title = "Moderatorbereich";
    body = `<h1>Demo vorbereiten</h1><p>Medien ausschliesslich lokal unter <strong>Internal storage/Documents/SMART</strong>. Auswahl erlaubt nur Lesen; kein Upload und keine Kopie in den App-Speicher.</p><div class="actions">${button("Medienordner verbinden", "choose-directory")}${button("Lokale Datei(en) auswählen", "choose-files")}</div><ul id="media-list">${manifest.media.map((m) => `<li>${esc(m.fileName)}: wird geprüft …</li>`).join("")}</ul><p>Zuordnungen bleiben nach einem Neustart erhalten. Je nach Android-/Chrome-Dateiauswahl muss der Ordner erneut freigegeben werden; einzelne Filme müssen dann nicht neu zugeordnet werden.</p><label>Interview-Szenario <select id="scenario"><option value="discharge" ${scenario === "discharge" ? "selected" : ""}>Austritt · ${esc(manifest.asOf)}</option><option value="physio" ${scenario === "physio" ? "selected" : ""}>Physiotermin · 10.11.2026</option></select></label><p>Alle Karten bleiben in beiden Szenarien erreichbar. Die Szene setzt nur den fiktiven Interviewzeitpunkt.</p>${button("Fiktive Einträge zurücksetzen", "reset")}<p class="notice">Die bisherige Faltkarten-PDF enthält historische Angehörigenkarten und ist nicht mehr für aktuelle Patienteninterviews vorgesehen. Die Patienten-QR-Codes sind weiterhin in den Einstellungen verfügbar.</p>`;
  } else {
    go("home");
    return;
  }
  const backTarget = view === "home" ? "welcome" : view === "record" && id ? "record" : "home";
  const backLabel = view === "home" ? "← Bergwiese" : view === "record" && id ? "← Patientenakte" : "← Zum Menü";
  root.innerHTML = `<header${view === "video" ? ' class="video-header"' : ""}>${button(backLabel, backTarget, 'class="back-navigation"')}<strong class="${view === "video" ? "video-header-title" : "role-line"}">${view === "video" ? esc(title) : `Für ${esc(persona().displayName.split(" ")[0])}`}</strong>${view === "video" ? "" : button("⚙︎", "settings", 'class="settings-button" aria-label="Einstellungen" title="Einstellungen"')}</header><main id="main" class="${view === "video" ? "video-view" : ""}" tabindex="-1" aria-label="${esc(title)}">${body}<div id="status" role="status" aria-live="polite"></div>${!storageOK ? '<p class="notice">Lokaler Speicher nicht verfügbar. Einträge bleiben nur während dieser Sitzung erhalten.</p>' : ""}</main>${view === "video" ? "" : `<footer>Fiktive Interview-Demo · keine medizinische Anweisung · nicht klinisch geprüft<div class="actions">${button("Mein Weg", "timeline")}${button("Demo vorbereiten", "moderator")}${button("Alle Karten", "cards")}</div><small>Nur fiktive Patientendaten verwenden.</small></footer>`}<input id="local-files" type="file" multiple hidden><input id="local-directory" type="file" webkitdirectory directory multiple hidden>`;
  document.title = `${title} · SMARThapti`;
  appendPowerButton();
  document.querySelector("#main").focus({ preventScroll: true });
  window.scrollTo(0, 0);
  if (view === "scan") startCamera(token);
  mountMedia(token);
  if (view === "record" && id === "xray") mountXray(token);
  if (view === "moderator") updateMediaStatus(token);
  document.querySelectorAll(".assignment-choice").forEach((select) =>
    select.addEventListener("change", () => {
      if (select.value)
        document.getElementById(select.dataset.target).value = select.value;
    }),
  );
  document
    .querySelector("#assignment-form")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      const next = Object.fromEntries(
        [...document.querySelectorAll(".media-assignment")].map((input) => [
          input.dataset.id,
          input.value,
        ]),
      );
      persistAssignments({ version: 1, assignments: next });
    });
  document
    .querySelector("#assignment-backup")
    ?.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const token = generation;
      try {
        if (file.size > 64000) throw Error("Die Sicherung ist zu gross.");
        const value = JSON.parse(await file.text());
        if (token === generation) persistAssignments(value);
      } catch (error) {
        if (token === generation) message(error.message);
      }
    });
  document.querySelector("#filter")?.addEventListener("change", (e) => {
    document.querySelector("#card-list").innerHTML = cardButtons(
      manifest.cards.filter(
        (c) =>
          c.role === role &&
          (e.target.value === "all" || e.target.value === c.type),
      ),
    );
  });
  document.querySelector("#scenario")?.addEventListener("change", (e) => {
    scenario = e.target.value;
    save();
    message(
      "Interview-Szenario eingestellt. Vorhandene Einträge bleiben erhalten.",
    );
  });
  document.querySelector("#xray-approval")?.addEventListener("change", (e) => {
    if (!xrayAssignment.fileName) return;
    const next = { ...xrayAssignment, approved: e.target.checked };
    try {
      localStorage.setItem(
        xrayAssignmentKey,
        JSON.stringify({ version: 1, ...next }),
      );
      xrayAssignment = next;
    } catch {
      e.target.checked = xrayAssignment.approved;
      message("Freigabestatus konnte nicht gespeichert werden.");
    }
  });
  for (const id of ["local-files", "local-directory", "local-image"]) {
    const input = document.getElementById(id);
    if (!input) continue;
    input.addEventListener("change", (e) => {
      if (
        sleeping ||
        (input.dataset.request &&
          Number(input.dataset.request) !== selectionRequest)
      )
        return;
      pickerPending = false;
      const chosen = [...e.target.files];
      if (!chosen.length) {
        message(
          "Keine Dateien ausgewählt. Vorhandene Verbindung bleibt erhalten.",
        );
        return;
      }
      if (id === "local-image") {
        if (!document.querySelector("#xray-approval")?.checked) {
          message("Bitte zuerst bestätigen, dass nur ein fiktives oder ausdrücklich freigegebenes Bild verwendet wird.");
          return;
        }
        const image = chosen.find(validImageFile);
        if (!image) {
          message("Bitte eine JPG-, JPEG-, PNG- oder WebP-Bilddatei auswählen.");
          return;
        }
        if (!persistXrayFile(image)) return;
        render();
        message(`Lokales Demonstrationsbild verbunden: ${image.name}. Kein Upload.`);
        return;
      }
      const selected = chosen.filter(
        (f) =>
          (id === "local-directory" ? supportedLocalFile(f) : supportedFile(f.name)) &&
          (id !== "local-directory" ||
            !f.webkitRelativePath ||
            f.webkitRelativePath.split("/").length === 2),
      );
      if (id === "local-directory") {
        directory = null;
        files = new Map();
        permissionRequired = false;
        permissionMissingFiles.clear();
        persistPickerMode("webkitdirectory-HTML-Dateiauswahl (keine dauerhaften Handles)");
        directoryPermissionState = "kein dauerhafter Handle aus HTML-Dateiauswahl";
      } else {
        persistPickerMode("HTML-Dateiauswahl (keine dauerhaften Handles)");
      }
      for (const file of selected) files.set(file.name, file);
      if (id === "local-directory")
        missingFiles = new Set(mediaFileNames().filter((name) => !files.has(name)));
      else for (const file of selected) missingFiles.delete(file.name);
      render();
      message(
        id === "local-directory"
          ? `${selected.length} lokale Dateien verbunden. Diese HTML-Ordnerauswahl speichert keinen dauerhaften Handle. Nach einem vollständigen Neustart genügt es, den SMART-Ordner einmal neu auszuwählen; die gespeicherten Videozuordnungen bleiben erhalten.`
          : `${selected.length} lokale Dateien verbunden. Jetzt unten Filme pro Karte zuordnen und „Zuordnungen speichern“ drücken.`,
      );
    });
    input.addEventListener("cancel", () => {
      pickerPending = false;
      message("Auswahl abgebrochen. Vorhandene Verbindung bleibt erhalten.");
    });
  }
}
async function updateMediaStatus(token) {
  const results = await Promise.all(
    manifest.media.map(
      async (m) =>
        `${m.fileName}: ${(await localFile(m)) ? "verbunden" : "fehlt oder nicht freigegeben"}`,
    ),
  );
  if (token === generation)
    document.querySelector("#media-list").innerHTML = results
      .map((s) => `<li>${esc(s)}</li>`)
      .join("");
}
async function startCamera(token) {
  message("Kamera wird angefragt …");
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw Error("Kamera-API fehlt");
    const acquired = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facing }, width: { ideal: 1280 } },
      audio: false,
    });
    if (token !== generation) {
      acquired.getTracks().forEach((t) => t.stop());
      return;
    }
    stream = acquired;
    const video = document.querySelector("#camera");
    video.srcObject = stream;
    await video.play();
    if (token !== generation) return;
    const indicator = document.createElement("span");
    indicator.id = "camera-indicator";
    indicator.className = "camera-indicator";
    indicator.setAttribute("role", "status");
    indicator.setAttribute("aria-label", "Kamera aktiv – QR-Erkennung bereit");
    indicator.title = "Kamera aktiv – QR-Erkennung bereit";
    root.append(indicator);
    stream.getVideoTracks().forEach((track) =>
      track.addEventListener(
        "ended",
        () => {
          if (token !== generation) return;
          indicator.remove();
          cancelAnimationFrame(frame);
          message(
            "Kamera beendet. Zum erneuten Scannen Kamera oder Bergwiese erneut öffnen.",
          );
        },
        { once: true },
      ),
    );
    message(
      "Karte vor die Kamera halten. Alternativ: Karte ohne Kamera wählen.",
    );
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let last = 0;
    const tick = (now) => {
      if (token !== generation) return;
      if (now - last > 200 && video.readyState >= 2) {
        last = now;
        canvas.width = Math.min(960, video.videoWidth);
        canvas.height = (canvas.width * video.videoHeight) / video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(pixels.data, canvas.width, canvas.height, {
          inversionAttempts: "attemptBoth",
        });
        if (qr) {
          const card = resolveQR(manifest, qr.data);
          if (card) {
            openCard(card);
            return;
          }
          message(
            qr.data.startsWith("SH1:A-")
              ? "Diese Angehörigenkarte stammt aus einer früheren Demoversion. Bitte eine Patientenkarte verwenden oder per Touch auswählen."
              : "Diese Karte kenne ich noch nicht. Bitte eine SMARThapti-Karte verwenden oder per Touch auswählen.",
          );
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  } catch {
    if (token === generation) {
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
      document.querySelector("#camera-indicator")?.remove();
      message(
        "Kamera nicht verfügbar oder Freigabe abgelehnt. Kamera wechseln oder Karte ohne Kamera wählen.",
      );
    }
  }
}
function openCard(card) {
  if (!card || card.role !== role) return;
  const content = manifest.contents.find((c) => c.id === card.contentId);
  if (content.dialogNodeId) {
    go("dialog/" + content.dialogNodeId);
    return;
  }
  if (
    card.type === "exercise" &&
    content.mediaIds.some((mediaId) =>
      manifest.media.some((media) => media.id === mediaId && media.kind === "video"),
    )
  ) {
    go("video/" + card.id);
    return;
  }
  go("card/" + card.id);
}
root.addEventListener("click", async (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  const [name, id, index] = action.split(":");
  if (sleeping) {
    if (name === "wake") setSleeping(false);
    return;
  }
  if (name === "power-off") {
    setSleeping(true);
    return;
  }
  if (name === "copy-media-diagnostics") {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("ClipboardUnavailable");
      await navigator.clipboard.writeText(formatMediaDiagnostics());
      message("Diagnose kopiert. Sie enthält keine Medieninhalte oder Dateipfade.");
    } catch {
      message("Diagnose konnte nicht kopiert werden. Öffne den Diagnosebereich und prüfe, ob Clipboard-Zugriff erlaubt ist.");
    }
    return;
  }
  if (name === "export-assignments") {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            assignments: Object.fromEntries(
              manifest.media.map((m) => [m.id, m.fileName]),
            ),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SMARThapti-Zuordnungen.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  if (name === "import-assignments") {
    document.querySelector("#assignment-backup").click();
    return;
  }
  if (name === "reload") {
    location.reload();
    return;
  }
  if (
    [
      "welcome",
      "home",
      "cards",
      "timeline",
      "scan",
      "moderator",
      "settings",
    ].includes(name)
  )
    go(name);
  else if (name === "card") {
    const card = manifest.cards.find((c) => c.id === id);
    if (card) openCard(card);
  } else if (name === "video") go("video/" + id);
  else if (name === "record") go(id ? "record/" + id : "record");
  else if (name.startsWith("image-zoom-")) {
    imageZoom = name === "image-zoom-in" ? Math.min(4, imageZoom + 0.25) : name === "image-zoom-out" ? Math.max(1, imageZoom - 0.25) : 1;
    const image = document.querySelector("#record-xray-image");
    if (image) image.style.transform = `scale(${imageZoom})`;
  } else if (name === "dialog") go("dialog/" + id);
  else if (name === "confirm") go("confirm/" + id);
  else if (name === "add") {
    const c = manifest.cards.find((c) => c.id === id && c.role === role);
    if (c) {
      const existed = keys.includes(c.eventKey);
      keys = addEvent(manifest, keys, c.eventKey);
      save();
      go("timeline");
      setTimeout(
        () =>
          message(
            existed ? "Eintrag bereits vorhanden." : "Eintrag hinzugefügt.",
          ),
        0,
      );
    }
  } else if (name === "answer") {
    const a = dialogs.nodes.find((n) => n.id === id)?.answers[Number(index)];
    if (!a) return;
    if (a.action === "open-card")
      openCard(manifest.cards.find((c) => c.id === a.target));
    else if (a.action === "open-view") go(a.target);
    else if (a.action === "end") go("home");
    else if (a.action === "open-node") go("dialog/" + a.target);
    else {
      go("home");
    }
  } else if (name === "switch-camera") {
    facing = facing === "user" ? "environment" : "user";
    render();
  } else if (name === "use-xray-connected" || name === "choose-xray") {
    if (!document.querySelector("#xray-approval")?.checked) {
      message("Bitte bestätigen, dass das Bild fiktiv oder ausdrücklich für Demonstrationszwecke freigegeben ist.");
      return;
    }
    const saveXray = (file) => {
      if (!persistXrayFile(file)) return false;
      render();
      message(`Lokales Demonstrationsbild verbunden: ${file.name}. Kein Upload.`);
      return true;
    };
    if (name === "use-xray-connected") {
      const file = files.get(document.querySelector("#xray-connected-choice")?.value);
      if (file) saveXray(file);
      else message("Bitte zuerst ein Bild aus dem verbundenen Ordner auswählen.");
      return;
    }
    const request = ++selectionRequest;
    pickerPending = true;
    updateManager?.refresh();
    const active = () => !sleeping && request === selectionRequest;
    if (!window.showOpenFilePicker) {
      const input = document.querySelector("#local-image");
      input.dataset.request = String(request);
      input.value = "";
      input.click();
      return;
    }
    try {
      const [handle] = await window.showOpenFilePicker({
        id: "smarthapti-xray-image",
        startIn: directory || "documents",
        multiple: false,
      });
      if (!active()) return;
      const file = await handle.getFile();
      if (!active()) return;
      pickerPending = false;
      saveXray(file);
      try {
        await saveFileHandles([handle]);
        storedFileHandles.set(handle.name, handle);
        handleStoreAvailable = true;
        handleStoreError = "";
      } catch (error) {
        handleStoreAvailable = false;
        handleStoreError = error?.name || "Bild-Handle konnte nicht dauerhaft gespeichert werden";
        lastHandleError = handleStoreError;
      }
    } catch (error) {
      if (!active()) return;
      pickerPending = false;
      message(error.name === "AbortError" ? "Auswahl abgebrochen. Die bisherige Zuordnung bleibt erhalten." : "Bild konnte nicht gelesen werden. Bitte im Dateimanager erneut aus Documents/SMART auswählen.");
    }
  } else if (name === "reconnect-media") {
    const handles = storedDirectory
      ? [storedDirectory]
      : [...storedFileHandles.values()];
    if (!handles.length) {
      message("Bitte den Medienordner aus Documents/SMART neu verbinden.");
      return;
    }
    // Invoke every permission request directly from this user action.
    const permissionRequests = handles.map((handle) => requestReadPermission(handle));
    const permissions = await Promise.all(permissionRequests);
    permissionRequired = permissions.some((permission) => permission !== "granted");
    permissionMissingFiles = new Set();
    if (permissionRequired) {
      if (storedDirectory) permissionMissingFiles = new Set(mediaFileNames());
      else handles.forEach((handle) => permissionMissingFiles.add(handle.name));
    }
    files = new Map();
    missingFiles = new Set();
    directory = null;
    if (!permissionRequired) await restoreMediaHandles();
    render();
    if (permissionRequired)
      message("Die gespeicherte Freigabe ist noch nicht verfügbar. Wähle einmal Documents/SMART neu aus; vorhandene Videozuordnungen bleiben erhalten.");
    else
      message(`${files.size} lokale Dateien wieder verbunden. Zuordnungen wurden beibehalten.`);
  } else if (name === "choose-files" || name === "choose-directory") {
    const request = ++selectionRequest;
    pickerPending = true;
    updateManager?.refresh();
    const active = () => !sleeping && request === selectionRequest;
    const directoryMode = name === "choose-directory";
    const fallback = () => {
      const input = document.getElementById(
        directoryMode ? "local-directory" : "local-files",
      );
      input.dataset.request = String(request);
      input.value = "";
      input.click();
    };
    if (
      (directoryMode && !window.showDirectoryPicker) ||
      (!directoryMode && !window.showOpenFilePicker)
    ) {
      message(
        directoryMode
          ? "Im Dateimanager: Interner Speicher → Documents → SMART wählen. Falls die Ordnerauswahl nicht unterstützt wird, Dateien im Dateimanager auswählen."
          : "Im Dateimanager über „Durchsuchen“/„Dateien“ → Interner Speicher → Documents → SMART gehen und die Filme markieren.",
      );
      fallback();
      return;
    }
    try {
      const options = {
        id: "smarthapti-local-media",
        startIn: directory || "documents",
      };
      if (directoryMode) {
        const picked = await window.showDirectoryPicker({
          ...options,
          mode: "read",
        });
        if (!active()) return;
        const selected = [];
        for await (const entry of picked.values())
          if (entry.kind === "file" && (supportedFile(entry.name) || /\.(jpe?g|png|webp)$/i.test(entry.name)))
            selected.push(await entry.getFile());
        if (!active()) return;
        directory = picked;
        storedDirectory = picked;
        persistPickerMode("showDirectoryPicker");
        files = new Map(selected.map((file) => [file.name, file]));
        missingFiles = new Set(mediaFileNames().filter((fileName) => !files.has(fileName)));
        permissionRequired = false;
        permissionMissingFiles.clear();
        try {
          await saveDirectoryHandle(picked);
          handleStoreAvailable = true;
          handleStoreError = "";
          handleLoadState = "Ordner-Handle in IndexedDB gespeichert";
          handleRecordCount = storedFileHandles.size + 1;
          directoryPermissionState = "granted";
          lastHandleError = "";
        } catch (error) {
          handleStoreAvailable = false;
          handleStoreError = error?.name || "Handle konnte nicht dauerhaft gespeichert werden";
          lastHandleError = handleStoreError;
        }
      } else {
        const handles = await window.showOpenFilePicker({
          ...options,
          multiple: true,
        });
        const selected = await Promise.all(
          handles.map((handle) => handle.getFile()),
        );
        if (!active()) return;
        persistPickerMode("showOpenFilePicker");
        for (const file of selected) {
          if (supportedLocalFile(file)) files.set(file.name, file);
          missingFiles.delete(file.name);
          permissionMissingFiles.delete(file.name);
        }
        try {
          await saveFileHandles(handles);
          handleStoreAvailable = true;
          handleStoreError = "";
          for (const handle of handles) storedFileHandles.set(handle.name, handle);
          handleLoadState = "Datei-Handles in IndexedDB gespeichert";
          handleRecordCount = storedFileHandles.size + Number(Boolean(storedDirectory));
          lastHandleError = "";
        } catch (error) {
          handleStoreAvailable = false;
          handleStoreError = error?.name || "Datei-Handles konnten nicht dauerhaft gespeichert werden";
          lastHandleError = handleStoreError;
        }
      }
      pickerPending = false;
      render();
      message(
        `${files.size} lokale Dateien verbunden. Keine zusätzliche Einzelauswahl nötig. Filme unten zuordnen und speichern.${handleStoreError ? ` Die Dateifreigabe gilt möglicherweise nur für diese Sitzung (${handleStoreError}).` : ""}`,
      );
    } catch (error) {
      if (!active()) return;
      pickerPending = false;
      message(
        error.name === "AbortError"
          ? "Auswahl abgebrochen. Vorhandene Verbindung bleibt erhalten."
          : "Ordner/Dateien konnten nicht gelesen werden. Bitte über den Dateimanager erneut auswählen oder lokale Dateien verbinden.",
      );
    }
  } else if (name === "reset") {
    if (
      window.confirm(
        "Nur fiktive Timeline-Einträge zurücksetzen? Lokale Mediendateien bleiben erhalten.",
      )
    ) {
      keys = [];
      save();
      render();
      message(
        "Fiktive Einträge zurückgesetzt. Mediendateien bleiben unverändert.",
      );
    }
  }
});
window.addEventListener("hashchange", () => {
  selectionRequest++;
  pickerPending = false;
  if (manifest) render();
});
window.addEventListener("pagehide", cleanup);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cleanup();
  else if (manifest && !pickerPending) render();
});
render();
try {
  const responses = await Promise.all([
    fetch(base + "content/demo_manifest.json"),
    fetch(base + "content/demo_dialogs.json"),
    fetch(base + "content/exercise_catalog.json"),
    fetch(base + "content/patient_record.json"),
    fetch(base + "content/patient_record_contents.json"),
  ]);
  if (responses.some((r) => !r.ok)) throw Error("Inhalte fehlen");
  [manifest, dialogs, catalog, patientRecord, patientRecordContents] = await Promise.all(
    responses.map((r) => r.json()),
  );
  for (const key of ["cards", "contents", "media"])
    manifest[key].push(...catalog[key]);
  // Lokale Einträge aus der früheren Zwei-Perspektiven-Demo nicht übernehmen.
  const activeKeys = new Set(manifest.timeline.filter((e) => e.requiresConfirmation).map((e) => e.eventKey));
  const previousCount = keys.length;
  keys = keys.filter((key) => activeKeys.has(key));
  if (keys.length !== previousCount) save();
  mediaDefaults = Object.fromEntries(
    manifest.media.map((m) => [m.id, m.fileName]),
  );
  try {
    lastPickerMode = localStorage.getItem("smarthapti-media-picker-mode-v1") || "";
  } catch {
    lastPickerMode = "LocalStorage nicht lesbar";
  }
  try {
    const saved = localStorage.getItem(assignmentKey);
    if (saved)
      assignments = validateAssignments(JSON.parse(saved), manifest.media);
  } catch {
    storageOK = false;
  }
  try {
    const savedXray = JSON.parse(localStorage.getItem(xrayAssignmentKey) || "null");
    if (
      savedXray?.version === 1 &&
      typeof savedXray.fileName === "string" &&
      savedXray.fileName.length < 256 &&
      !/[\\/\x00-\x1f]/.test(savedXray.fileName) &&
      /\.(jpe?g|png|webp)$/i.test(savedXray.fileName) &&
      typeof savedXray.approved === "boolean"
    ) xrayAssignment = { fileName: savedXray.fileName, approved: savedXray.approved };
  } catch {
    storageOK = false;
  }
  manifest.media.forEach((m) => {
    m.fileName = assignments[m.id] || m.fileName;
  });
  await restoreMediaHandles();
  render();
  if (import.meta.env.PROD && "serviceWorker" in navigator)
    setupUpdates({
      base,
      beforeReload: () => {
        selectionRequest++;
        pickerPending = false;
        cleanup();
      },
      canShow: () => !sleeping && !pickerPending && !document.hidden,
    })
      .then((manager) => {
        updateManager = manager;
        manager.refresh();
      })
      .catch(() =>
        message(
          "App-Cache nicht verfügbar. Die Demo benötigt eine Internetverbindung.",
        ),
      );
} catch {
  loadError = true;
  render();
}
