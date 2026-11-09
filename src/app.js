import jsQR from "jsqr";
import "./style.css";
import { types, resolveQR, visibleEvents, addEvent } from "./model.js";
const base = import.meta.env.BASE_URL;
const root = document.querySelector("#app");
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
  role = "patient",
  scenario = "discharge",
  keys = [],
  directory = null,
  files = new Map(),
  stream = null,
  frame = 0,
  urls = [],
  generation = 0,
  facing = "user",
  storageOK = true;
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
function cleanup() {
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
  if (location.hash === `#${path}`) render();
  else location.hash = path;
}
function message(text) {
  const el = document.querySelector("#status");
  if (el) el.textContent = text;
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
function mediaMarkup(ids) {
  return ids
    .map((id) => {
      const m = manifest.media.find((m) => m.id === id);
      return m
        ? `<section class="panel" data-media="${esc(id)}"><p class="notice">Nicht klinisch geprüft. Nur freigegebene Inhalte oder neutrale Techniktest-Dateien verwenden.</p><p>${esc(m.transcriptOrFallback)}</p><div class="player-slot"></div><p class="media-status">Lokale Datei wird geprüft: ${esc(m.fileName)}</p>${button("Lokale Datei(en) auswählen", "choose-files")}</section>`
        : "";
    })
    .join("");
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
    const file = await localFile(m);
    if (token !== generation) return;
    const status = el.querySelector(".media-status");
    if (!file) {
      status.textContent = `Nicht verbunden oder nicht lesbar: ${m.fileName}. Bitte lokal aus Documents/SMART auswählen. Der Text bleibt verfügbar.`;
      continue;
    }
    if (
      !file.size ||
      !new RegExp(m.kind === "video" ? "\\.mp4$" : "\\.mp3$", "i").test(
        file.name,
      )
    ) {
      status.textContent = `Dateiformat nicht lesbar: ${m.fileName}. Bitte eine gültige ${m.kind === "video" ? "MP4" : "MP3"}-Datei auswählen.`;
      continue;
    }
    const url = URL.createObjectURL(file);
    urls.push(url);
    const player = document.createElement(
      m.kind === "video" ? "video" : "audio",
    );
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
      status.textContent = `${m.fileName} ist nicht abspielbar oder die Berechtigung fehlt. Textalternative und Dateiauswahl bleiben verfügbar.`;
      player.remove();
    });
    el.querySelector(".player-slot").append(player);
    const stop = document.createElement("button");
    stop.textContent = "Wiedergabe stoppen";
    stop.onclick = () => {
      player.pause();
      player.currentTime = 0;
    };
    el.querySelector(".player-slot").append(stop);
    status.textContent = `Lokal verbunden: ${m.fileName}. Kein Upload.`;
  }
}
function render() {
  cleanup();
  const token = generation;
  const [view = "home", id] = location.hash.slice(1).split("/");
  let body = "";
  let title = "Heute mit Alma";
  if (view === "home") {
    body = `<section class="panel hero"><span class="eyebrow">🐮 Alma begleitet die Demo</span><h1>Für ${esc(persona().displayName.split(" ")[0])}</h1><p>${esc(persona().personalGoal)}</p><span class="tag">Fiktive ${scenario === "physio" ? "Physiotermin-Szene · 10.11.2026" : "Austrittsszene · " + manifest.asOf}</span></section><h2>Was möchten Sie ansehen?</h2><div class="actions">${button("QR-Karte scannen", "scan", 'class="primary"')}${button("Karte auswählen", "cards")}</div>${cardButtons(manifest.cards.filter((c) => c.role === role && (role === "patient" ? c.type === "exercise" : ["A-INF-001", "A-INF-002"].includes(c.id))))}<div class="actions">${button("Alma fragen", "dialog:" + dialogs.startNodes[role])}${button("Mein Weg", "timeline")}</div>`;
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
      role = c.role;
      render();
      return;
    }
    const content = manifest.contents.find((x) => x.id === c.contentId);
    title = c.printTitle || c.title;
    body = `<span class="tag">${esc(types[c.type])} · ${esc(c.id)}</span><h1>${esc(title)}</h1><p>${esc(content.shortText)}</p><p>${esc(content.detailText)}</p>${source(content)}${mediaMarkup(content.mediaIds)}${c.eventKey ? button(keys.includes(c.eventKey) ? "Eintrag bereits vorhanden – ansehen" : "Zur Timeline hinzufügen", keys.includes(c.eventKey) ? "timeline" : "confirm:" + c.id, 'class="primary"') : ""}`;
  } else if (view === "dialog") {
    const node = dialogs.nodes.find((n) => n.id === id);
    if (!node) {
      go("home");
      return;
    }
    if (node.role !== role) {
      role = node.role;
      render();
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
  } else if (view === "moderator") {
    title = "Moderatorbereich";
    body = `<h1>Demo vorbereiten</h1><p>Medien ausschliesslich lokal unter <strong>Internal storage/Documents/SMART</strong>. Auswahl erlaubt nur Lesen; kein Upload und keine Kopie in den App-Speicher.</p><div class="actions">${button("Medienordner verbinden", "choose-directory")}${button("Lokale Datei(en) auswählen", "choose-files")}</div><ul id="media-list">${manifest.media.map((m) => `<li>${esc(m.fileName)}: wird geprüft …</li>`).join("")}</ul><p>Nach App-Neustart Medien erneut verbinden. Ordner- und Dateifreigaben werden nicht dauerhaft gespeichert.</p><label>Interview-Szenario <select id="scenario"><option value="discharge" ${scenario === "discharge" ? "selected" : ""}>Austritt · ${esc(manifest.asOf)}</option><option value="physio" ${scenario === "physio" ? "selected" : ""}>Physiotermin · 10.11.2026</option></select></label><p>Alle Karten bleiben in beiden Szenarien erreichbar. Die Szene setzt nur den fiktiven Interviewzeitpunkt.</p>${button("Fiktive Einträge zurücksetzen", "reset")}<div class="actions"><a class="button" href="${base}print/SMARThapti_Faltkarten_A4.pdf">Bestehende Faltkarten (PDF)</a></div>`;
  } else {
    go("home");
    return;
  }
  root.innerHTML = `<header>${button(view === "home" ? "SMARThapti · Alma" : "← Übersicht", "home")}<strong>${role === "patient" ? "Patient · Ernst" : "Angehörige · Anna"}</strong>${button("Perspektive wechseln", "role")}</header><main id="main" tabindex="-1" aria-label="${esc(title)}">${body}<div id="status" role="status" aria-live="polite"></div>${!storageOK ? '<p class="notice">Lokaler Speicher nicht verfügbar. Einträge bleiben nur während dieser Sitzung erhalten.</p>' : ""}</main><footer>Fiktive Interview-Demo · keine medizinische Anweisung · nicht klinisch geprüft<div class="actions">${button("Mein Weg", "timeline")}${button("Demo vorbereiten", "moderator")}${button("Alle Karten", "cards")}</div><small>Perspektivwechsel ist keine Authentifizierung. Nur fiktive Daten verwenden.</small></footer><input id="local-files" type="file" accept=".mp4,.mp3,video/mp4,audio/mpeg" multiple hidden>`;
  document.title = `${title} · SMARThapti`;
  document.querySelector("#main").focus({ preventScroll: true });
  window.scrollTo(0, 0);
  if (view === "scan") startCamera(token);
  mountMedia(token);
  if (view === "moderator") updateMediaStatus(token);
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
  document.querySelector("#local-files").addEventListener("change", (e) => {
    for (const file of e.target.files)
      if (manifest.media.some((m) => m.fileName === file.name))
        files.set(file.name, file);
    render();
    message("Ausgewählte passende Dateien lokal verbunden.");
  });
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
            "Diese Karte kenne ich noch nicht. Bitte eine SMARThapti-Karte verwenden oder per Touch auswählen.",
          );
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  } catch {
    if (token === generation)
      message(
        "Kamera nicht verfügbar oder Freigabe abgelehnt. Kamera wechseln oder Karte ohne Kamera wählen.",
      );
  }
}
function openCard(card) {
  role = card.role;
  const content = manifest.contents.find((c) => c.id === card.contentId);
  go(
    content.dialogNodeId ? "dialog/" + content.dialogNodeId : "card/" + card.id,
  );
}
root.addEventListener("click", async (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  const [name, id, index] = action.split(":");
  if (["home", "cards", "timeline", "scan", "moderator"].includes(name))
    go(name);
  else if (name === "role") {
    role = role === "patient" ? "relative" : "patient";
    go("home");
  } else if (name === "card") {
    const card = manifest.cards.find((c) => c.id === id);
    if (card) openCard(card);
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
  } else if (name === "choose-files")
    document.querySelector("#local-files").click();
  else if (name === "choose-directory") {
    if (!window.showDirectoryPicker) {
      message(
        "Ordnerauswahl in diesem Browser nicht verfügbar. Bitte „Lokale Datei(en) auswählen“ verwenden.",
      );
      return;
    }
    const token = generation;
    try {
      const picked = await window.showDirectoryPicker({ mode: "read" });
      if (token !== generation) return;
      directory = picked;
      render();
      message(
        "Ordner lesend verbunden. Fehlende Dateien können einzeln ausgewählt werden.",
      );
    } catch {
      message(
        "Ordner nicht freigegeben. Bitte erneut verbinden oder lokale Dateien auswählen.",
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
  if (manifest) render();
});
window.addEventListener("pagehide", cleanup);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cleanup();
  else if (manifest) render();
});
try {
  const responses = await Promise.all([
    fetch(base + "content/demo_manifest.json"),
    fetch(base + "content/demo_dialogs.json"),
  ]);
  if (responses.some((r) => !r.ok)) throw Error("Inhalte fehlen");
  [manifest, dialogs] = await Promise.all(responses.map((r) => r.json()));
  render();
  if (import.meta.env.PROD && "serviceWorker" in navigator)
    navigator.serviceWorker
      .register(base + "sw.js")
      .catch(() =>
        message(
          "App-Cache nicht verfügbar. Die Demo benötigt eine Internetverbindung.",
        ),
      );
} catch {
  root.innerHTML =
    '<main><h1>Die Demo konnte nicht geladen werden.</h1><p>Bitte Verbindung prüfen und die Seite neu laden. Nach einer vollständigen Erstladung kann die App-Shell offline verfügbar sein.</p><button onclick="location.reload()">Erneut laden</button></main>';
}
