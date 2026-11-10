import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { resolveQR, visibleEvents, addEvent } from "../src/model.js";
const m = JSON.parse(readFileSync("content/demo_manifest.json"));
const dialogs = JSON.parse(readFileSync("content/demo_dialogs.json"));
const historicalIndex = JSON.parse(readFileSync("print/CARD_INDEX.json"));
const index = { ...historicalIndex, cards: historicalIndex.cards.filter((c) => c.cardId.startsWith("P-")) };
const exerciseCatalog = JSON.parse(
  readFileSync("content/exercise_catalog.json"),
);
const patientRecord = JSON.parse(readFileSync("content/patient_record.json"));
const patientRecordContents = JSON.parse(
  readFileSync("content/patient_record_contents.json"),
);
for (const key of ["media", "contents", "cards"])
  m[key].push(...exerciseCatalog[key]);
index.cards.push(
  ...exerciseCatalog.cards.map((c) => ({
    cardId: c.id,
    payload: c.qrPayload,
    qrFile: c.qrFile,
  })),
);
const click = async (page, action) => {
  await page.locator(`[data-action="${action}"]`).first().click();
};

test("patient-only manifest, thirteen cards and event identity", () => {
  expect(m.personas).toHaveLength(1);
  expect(m.personas[0].role).toBe("patient");
  expect(m.cards).toHaveLength(13);
  expect(new Set(m.cards.map((c) => c.id)).size).toBe(13);
  expect(m.cards.every((c) => c.role === "patient")).toBe(true);
  expect(m.contents.every((c) => c.role === "patient")).toBe(true);
  expect(dialogs.nodes.every((n) => n.role === "patient")).toBe(true);
  expect(resolveQR(m, "SH1:A-INF-001")).toBeNull();
  for (const c of m.cards) {
    expect(resolveQR(m, c.qrPayload)).toEqual(c);
    expect(c.qrPayload).toBe(`SH1:${c.id}`);
    const content = m.contents.find((x) => x.id === c.contentId);
    expect(content).toBeTruthy();
    for (const id of content.sourceIds)
      expect(m.sources.some((s) => s.id === id)).toBeTruthy();
    for (const id of content.mediaIds)
      expect(m.media.some((s) => s.id === id)).toBeTruthy();
    if (content.dialogNodeId)
      expect(
        dialogs.nodes.some((n) => n.id === content.dialogNodeId),
      ).toBeTruthy();
  }
  for (const media of m.media) {
    expect(media.storage).toBe("tablet-local");
    expect(media.fileName).toMatch(/^[^/\\]+\.(mp4|mp3)$/);
  }
  for (const node of dialogs.nodes) {
    expect(m.media.some((x) => x.id === node.audioMediaId)).toBeTruthy();
    for (const a of node.answers)
      if (a.action === "open-card")
        expect(m.cards.some((c) => c.id === a.target)).toBeTruthy();
  }
  expect(resolveQR(m, "https://example.org")).toBeNull();
  expect(addEvent(m, ["J10"], "J10")).toEqual(["J10"]);
  expect(
    visibleEvents(m, ["J-MIL-A-001"], "patient").some(
      (e) => e.eventKey === "J-MIL-A-001",
    ),
  ).toBe(false);
});
for (const entry of index.cards)
  test(`existing QR decodes and opens ${entry.cardId}`, async ({ page }) => {
    await page.goto(entry.qrFile);
    const buffer = await page.locator("svg").screenshot();
    const png = PNG.sync.read(buffer);
    expect(
      jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data,
    ).toBe(entry.payload);
    await page.goto("./#home");
    await click(page, "cards");
    await click(page, "card:" + entry.cardId);
    const card = m.cards.find((c) => c.id === entry.cardId),
      content = m.contents.find((c) => c.id === card.contentId);
    const opensVideo =
      card.type === "exercise" &&
      content.mediaIds.some((id) => m.media.some((media) => media.id === id && media.kind === "video"));
    await expect(page).toHaveURL(
      new RegExp(
        opensVideo
          ? `#video/${card.id}`
          : content.dialogNodeId
          ? `#dialog/${content.dialogNodeId}`
          : `#card/${card.id}`,
      ),
    );
    if (opensVideo) {
      await expect(page.locator(".video-header-title")).toHaveText(card.printTitle || card.title);
      await expect(page.locator("h1")).toHaveCount(0);
    } else if (card.type === "appointment") {
      await expect(page.locator(".appointment-detail > h1")).toHaveText("Nächster Physiotherapietermin");
      await expect(page.locator(".appointment-date")).toHaveText("Dienstag, 17. November 2026");
    } else {
      await expect(page.locator("main")).toContainText(
        content.dialogNodeId
          ? dialogs.nodes.find((n) => n.id === content.dialogNodeId).text
          : content.detailText,
      );
    }
  });
test("patient appointment and personal milestone require confirmation, deduplicate and persist", async ({
  page,
}) => {
  await page.goto("./#card/P-APT-001");
  await click(page, "confirm:P-APT-001");
  await click(page, "card:P-APT-001");
  await click(page, "timeline");
  await expect(page.locator(".timeline li")).toHaveCount(3);
  await page.goto("./#card/P-APT-001");
  await click(page, "confirm:P-APT-001");
  await click(page, "add:P-APT-001");
  await expect(page.locator(".timeline li")).toHaveCount(4);
  await expect(page.locator(".timeline li").filter({ hasText: "Nächster Physiotherapietermin" })).toContainText("2026-11-17");
  await page.goto("./#card/P-APT-001");
  await expect(page.locator("main")).toContainText("Eintrag bereits vorhanden");
  await page.goto("./#card/P-MIL-001");
  await click(page, "confirm:P-MIL-001");
  await click(page, "add:P-MIL-001");
  await expect(page.locator(".timeline li")).toHaveCount(5);
  await page.reload();
  await expect(page.locator(".timeline li")).toHaveCount(5);
  await expect(page.locator(".timeline li").filter({ hasText: "Nächster Physiotherapietermin" })).toContainText("2026-11-17");
  await click(page, "moderator");
  page.once("dialog", (d) => d.accept());
  await click(page, "reset");
  await click(page, "timeline");
  await expect(page.locator(".timeline li")).toHaveCount(3);
});
test("only patient media and exercise cards are shown in the menu", async ({ page }) => {
  await page.goto("./#home");
  await expect(page.locator('[data-action="role"], .perspective-options')).toHaveCount(0);
  await expect(page.locator(".home-video-row")).toHaveCount(7);
  await expect(page.locator('[data-action="video:P-EX-001"]')).toHaveCount(0);
  await expect(page.locator('[data-action^="card:P-EX-"]')).toHaveCount(0);
  await expect(page.locator('[data-action^="card:A-"]')).toHaveCount(0);
  await click(page, "cards");
  await expect(page.locator("#card-list button")).toHaveCount(13);
});

test("patient home dashboard keeps the existing upper controls and opens each video directly", async ({ page }) => {
  await page.goto("./#home");
  await expect(page.locator(".menu-heading")).toHaveText("Was möchten Sie ansehen?");
  await expect(page.locator('[data-action="scan"]')).toHaveText("QR-Karte scannen");
  await expect(page.locator('[data-action="cards"]').first()).toHaveText("Karte auswählen");
  await expect(page.locator(".home-video-row")).toHaveCount(7);
  await expect(page.locator('[data-action="video:P-EX-001"]')).toHaveCount(0);
  await expect(page.locator(".home-video-row").evaluateAll((rows) => rows.map((row) => row.dataset.action))).resolves.toEqual([
    "video:P-EX-101",
    "video:P-EX-102",
    "video:P-EX-103",
    "video:P-EX-104",
    "video:P-EX-105",
    "video:P-EX-106",
    "video:P-EX-107",
  ]);
  await expect(page.locator(".home-appointment-row")).toHaveCount(1);
  await expect(page.locator(".home-appointment-row")).toContainText("17.11.2026");
  await expect(page.locator(".home-record-row")).toHaveCount(4);
  await expect(page.locator(".home-dashboard")).toHaveCSS("grid-template-columns", /\d+(?:\.\d+)?px \d+(?:\.\d+)?px/);
  const widths = await page.locator(".home-dashboard").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").map(parseFloat));
  expect(widths[0] / (widths[0] + widths[1])).toBeCloseTo(0.55, 1);
  await page.locator('[data-action="video:P-EX-102"]').click();
  await expect(page).toHaveURL(/#video\/P-EX-102$/);
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.locator(".media-status")).toContainText("Video nicht verfügbar");
  await expect(page.locator(".video-header-title")).toContainText("Hüftflexion im Stehen");
  await expect(page.locator("main")).toContainText("nicht klinisch geprüft");
  await page.setViewportSize({ width: 480, height: 850 });
  await page.goto("./#home");
  await expect(page.locator(".home-dashboard")).toHaveCSS("grid-template-columns", /^(\d+(?:\.\d+)?px)$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test("video view centers its title, fills the portrait viewport and keeps notes collapsed below the player", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1100 });
  await page.goto("./#video/P-EX-101");
  await expect(page).toHaveURL(/#video\/P-EX-101$/);
  await expect(page.locator(".video-header-title")).toHaveText("Gehen mit Teilbelastung");
  await expect(page.locator("h1")).toHaveCount(0);
  await expect(page.locator(".settings-button")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.locator(".video-notes")).not.toHaveAttribute("open", "");
  await expect(page.locator(".video-notes summary")).toHaveText("Hinweise zum Video");
  await expect(page.locator(".video-notes")).toContainText("nicht klinisch geprüft");
  await expect(page.locator(".video-notes")).toContainText("keine durchgeführte Übung");
  await expect(page.locator(".video-notes > p").first()).toBeHidden();
  await expect(page.locator(".video-media-status")).toContainText("Video nicht verfügbar");
  await expect(page.locator('.video-file-action [data-action="choose-files"]')).toBeVisible();
  await expect(page.locator(".video-player-slot")).toBeHidden();
  const geometry = await page.evaluate(() => {
    const header = document.querySelector(".video-header").getBoundingClientRect();
    const title = document.querySelector(".video-header-title").getBoundingClientRect();
    const back = document.querySelector(".video-header .back-navigation").getBoundingClientRect();
    const power = document.querySelector(".video-header .power-off").getBoundingClientRect();
    const player = document.querySelector(".video-player-slot").getBoundingClientRect();
    return {
      centerOffset: Math.abs(title.x + title.width / 2 - (header.x + header.width / 2)),
      controlsOverlap: back.right > title.left || title.right > power.left,
      playerHeight: player.height,
      viewportHeight: innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  expect(geometry.centerOffset).toBeLessThan(1);
  expect(geometry.controlsOverlap).toBe(false);
  expect(geometry.horizontalOverflow).toBe(false);
  await page.setViewportSize({ width: 1100, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("./#video/P-EX-102");
  const narrow = await page.evaluate(() => {
    const title = document.querySelector(".video-header-title").getBoundingClientRect();
    const back = document.querySelector(".video-header .back-navigation").getBoundingClientRect();
    const power = document.querySelector(".video-header .power-off").getBoundingClientRect();
    return {
      overlaps: back.right > title.left || title.right > power.left,
      scrolls: document.documentElement.scrollWidth > innerWidth,
      titleHeight: title.height,
    };
  });
  expect(narrow.overlaps).toBe(false);
  expect(narrow.scrolls).toBe(false);
  expect(narrow.titleHeight).toBeGreaterThanOrEqual(20);
});

test("video end shows a 4px textless countdown without resizing the player, then returns to QR-ready welcome", async ({ page }) => {
  const { execFileSync } = await import("node:child_process");
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/smarthapti-video-countdown-");
  const videoPath = `${dir}/GehenMitTeilbelastung_video_720p.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=gray:s=160x120:r=1", "-t", "60", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-an", videoPath]);
  await blankCamera(page);
  try {
    await page.setViewportSize({ width: 800, height: 1100 });
    await page.goto("./#video/P-EX-101");
    await page.locator("#local-files").setInputFiles(videoPath);
    const player = page.locator("video.video-player");
    await expect(player).toHaveAttribute("src", /^blob:/);
    const before = await player.boundingBox();
    await player.evaluate((element) => element.dispatchEvent(new Event("ended")));

    const progress = page.locator(".video-return-countdown");
    await expect(progress).toBeVisible();
    await expect(progress).toHaveAttribute("aria-valuenow", "100");
    await expect(progress).toHaveText("");
    const geometry = await page.evaluate(() => {
      const playerRect = document.querySelector("video.video-player").getBoundingClientRect();
      const progressRect = document.querySelector(".video-return-countdown").getBoundingClientRect();
      return {
        player: { x: playerRect.x, y: playerRect.y, width: playerRect.width, height: playerRect.height },
        progress: { x: progressRect.x, y: progressRect.y, width: progressRect.width, height: progressRect.height },
        fillTransform: getComputedStyle(document.querySelector(".video-return-countdown-fill")).transform,
      };
    });
    expect(geometry.progress.height).toBeLessThanOrEqual(4);
    expect(Math.abs(geometry.progress.y - (geometry.player.y + geometry.player.height))).toBeLessThanOrEqual(1);
    expect(geometry.progress.x).toBe(geometry.player.x);
    expect(geometry.progress.width).toBe(geometry.player.width);
    const initialScale = geometry.fillTransform === "none" ? 1 : Number(geometry.fillTransform.match(/^matrix\(([^,]+)/)?.[1]);
    expect(initialScale).toBeGreaterThan(0.95);
    expect(before).toMatchObject({ width: geometry.player.width, height: geometry.player.height });
    await expect(page.locator(".video-view")).not.toContainText(/seconds?|sekunden|zurück in/i);

    await page.waitForTimeout(5000);
    const progressValue = Number(await progress.getAttribute("aria-valuenow"));
    expect(progressValue).toBeGreaterThan(35);
    expect(progressValue).toBeLessThan(65);
    const scale = await page.locator(".video-return-countdown-fill").evaluate((el) => {
      const transform = getComputedStyle(el).transform;
      return transform === "none" ? 1 : new DOMMatrixReadOnly(transform).a;
    });
    expect(scale).toBeGreaterThan(0.35);
    expect(scale).toBeLessThan(0.65);

    await expect(page).toHaveURL(/#welcome$/, { timeout: 7000 });
    await expect(page.locator(".welcome-open")).toBeVisible();
    await expect(page.locator("#camera-indicator")).toBeVisible();
    expect(await page.evaluate(() => window.cameraCalls)).toBe(1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("replaying or interacting with the video cancels and removes the return countdown", async ({ page }) => {
  const { execFileSync } = await import("node:child_process");
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/smarthapti-video-countdown-cancel-");
  const videoPath = `${dir}/GehenMitTeilbelastung_video_720p.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=gray:s=160x120:r=1", "-t", "60", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-an", videoPath]);
  try {
    await page.goto("./#video/P-EX-101");
    await page.locator("#local-files").setInputFiles(videoPath);
    const player = page.locator("video.video-player");
    await expect(player).toHaveAttribute("src", /^blob:/);
    await player.evaluate((element) => element.dispatchEvent(new Event("ended")));
    await expect(page.locator(".video-return-countdown")).toBeVisible();
    await player.evaluate((element) => element.dispatchEvent(new Event("play")));
    await expect(page.locator(".video-return-countdown")).toHaveCount(0);
    await expect(page).toHaveURL(/#video\/P-EX-101$/);

    await player.evaluate((element) => element.dispatchEvent(new Event("ended")));
    await expect(page.locator(".video-return-countdown")).toBeVisible();
    await page.locator(".video-notes summary").click();
    await expect(page.locator(".video-return-countdown")).toHaveCount(0);
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/#video\/P-EX-101$/);

    await player.evaluate((element) => element.dispatchEvent(new Event("ended")));
    await expect(page.locator(".video-return-countdown")).toBeVisible();
    await click(page, "home");
    await expect(page).toHaveURL(/#home$/);
    await expect(page.locator(".video-return-countdown")).toHaveCount(0);

    await page.goto("./#video/P-EX-101");
    const resumedPlayer = page.locator("video.video-player");
    await expect(resumedPlayer).toHaveAttribute("src", /^blob:/);
    await resumedPlayer.evaluate((element) => element.dispatchEvent(new Event("ended")));
    await expect(page.locator(".video-return-countdown")).toBeVisible();
    await click(page, "power-off");
    await expect(page.locator(".wake-screen")).toBeVisible();
    await expect(page.locator(".video-return-countdown")).toHaveCount(0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("welcome exercise QR opens the local video directly and attempts audible playback", async ({ page }) => {
  const qr = readFileSync(index.cards.find((card) => card.cardId === "P-EX-101").qrFile, "utf8");
  const { execFileSync } = await import("node:child_process");
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/smarthapti-qr-video-");
  const videoName = "GehenMitTeilbelastung_video_720p.mp4";
  try {
    execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=gray:s=160x120:d=3", "-f", "lavfi", "-i", "sine=frequency=440:duration=3", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", `${dir}/${videoName}`]);
    await page.addInitScript(({ svg }) => {
      window.scannerTrackStops = 0;
      window.blockInitialVideoPlay = true;
      const nativePlay = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function (...args) {
        if (this.classList?.contains("video-player") && window.blockInitialVideoPlay) {
          window.blockInitialVideoPlay = false;
          return Promise.reject(new DOMException("Autoplay blocked", "NotAllowedError"));
        }
        return nativePlay.apply(this, args);
      };
      navigator.mediaDevices.getUserMedia = async () => {
        const image = new Image();
        image.src = "data:image/svg+xml;base64," + btoa(svg);
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 640;
        const context = canvas.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, 640, 640);
        context.drawImage(image, 60, 60, 520, 520);
        const stream = canvas.captureStream(10);
        for (const track of stream.getTracks()) {
          const stop = track.stop.bind(track);
          track.stop = () => {
            window.scannerTrackStops++;
            stop();
          };
        }
        return stream;
      };
    }, { svg: qr });
    await page.goto("./#home");
    await page.locator("#local-files").setInputFiles(`${dir}/${videoName}`);
    await page.goto("./#welcome");
    await expect(page).toHaveURL(/#video\/P-EX-101$/);
    await expect(page.locator(".video-header-title")).toHaveText("Gehen mit Teilbelastung");
    const player = page.locator("video.video-player");
    await expect(player).toHaveAttribute("src", /^blob:/);
    await expect(player).toHaveAttribute("data-autoplay-attempted", "true");
    expect(await player.evaluate((video) => video.muted)).toBe(false);
    expect(await player.evaluate((video) => getComputedStyle(video).objectFit)).toBe("contain");
    expect(await page.locator(".video-player-slot").evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(600);
    await expect(page.locator(".video-start-button")).toBeVisible();
    await expect(page.locator(".video-media-status")).toContainText("Automatischer Start wurde vom Browser blockiert");
    await page.locator(".video-start-button").click();
    await expect.poll(() => player.evaluate((video) => video.currentTime)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scannerTrackStops)).toBeGreaterThan(0);
    await page.setViewportSize({ width: 1100, height: 700 });
    expect(await page.locator(".video-player-slot").evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(300);
    await player.evaluate((video) => { window.oldVideo = video; });
    await click(page, "home");
    await expect.poll(() => page.evaluate(() => window.oldVideo.paused && !window.oldVideo.getAttribute("src"))).toBe(true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("OPFS test-directory handle can be loaded after reload with a simulated permission grant", async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("__test-media-permission") === null)
      localStorage.setItem("__test-media-permission", "prompt");
    const proto = window.FileSystemHandle?.prototype;
    if (!proto) return;
    const query = proto.queryPermission;
    const request = proto.requestPermission;
    Object.defineProperty(proto, "queryPermission", {
      configurable: true,
      value: function (options) {
        if (this.name === "SMART")
          return Promise.resolve(localStorage.getItem("__test-media-permission") === "granted" ? "granted" : "prompt");
        return query.call(this, options);
      },
    });
    Object.defineProperty(proto, "requestPermission", {
      configurable: true,
      value: function (options) {
        if (this.name === "SMART") {
          localStorage.setItem("__test-media-permission", "granted");
          return Promise.resolve("granted");
        }
        return request.call(this, options);
      },
    });
  });
  await page.goto("./#settings");
  const supported = await page.evaluate(() => Boolean(navigator.storage?.getDirectory && window.FileSystemHandle));
  test.skip(!supported, "This browser does not support persistent FileSystemHandles/OPFS");
  const filenames = exerciseCatalog.media.map((item) => item.fileName);
  const customName = "Custom walking.mp4";
  await page.evaluate(async ({ filenames, customName }) => {
    const root = await navigator.storage.getDirectory();
    const smart = await root.getDirectoryHandle("SMART", { create: true });
    for (const name of [...filenames, customName]) {
      const handle = await smart.getFileHandle(name, { create: true });
      const writer = await handle.createWritable();
      await writer.write(new Blob(["temporary browser test file"]));
      await writer.close();
    }
    localStorage.setItem("smarthapti-media-assignments-v1", JSON.stringify({ version: 1, assignments: { "M-P-EX-101": customName } }));
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("smarthapti-local-media-handles-v1", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction("handles", "readwrite");
      tx.objectStore("handles").put({ id: "directory", handle: smart });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, { filenames, customName });

  await page.reload();
  await expect(page.locator('[data-action="reconnect-media"]')).toBeVisible();
  await expect(page.locator('[data-media-access="M-P-EX-101"]')).toContainText("Berechtigung erforderlich");
  await click(page, "reconnect-media");
  await expect(page.locator('[data-media-access="M-P-EX-101"]')).toHaveText("Verbunden und lesbar");
  await expect(page.locator('[data-id="M-P-EX-101"]')).toHaveValue(customName);
  for (const item of exerciseCatalog.media)
    await expect(page.locator(`[data-media-access="${item.id}"]`)).toHaveText("Verbunden und lesbar");

  await page.reload();
  await expect(page.locator('[data-media-access="M-P-EX-101"]')).toHaveText("Verbunden und lesbar");
  await page.evaluate(async (name) => {
    const root = await navigator.storage.getDirectory();
    const smart = await root.getDirectoryHandle("SMART");
    await smart.removeEntry(name);
  }, customName);
  await page.reload();
  await expect(page.locator('[data-media-access="M-P-EX-101"]')).toContainText("Datei nicht gefunden oder umbenannt");
  await expect(page.locator('[data-id="M-P-EX-101"]')).toHaveValue(customName);
});

test("OPFS test-file handle restores its mapped media after reload", async ({ page }) => {
  await page.goto("./#settings");
  const supported = await page.evaluate(() => Boolean(navigator.storage?.getDirectory && window.FileSystemFileHandle));
  test.skip(!supported, "This browser does not support persistent FileSystemHandles/OPFS");
  const filename = "One selected film.mp4";
  await page.evaluate(async (name) => {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle(name, { create: true });
    const writer = await handle.createWritable();
    await writer.write(new Blob(["temporary browser test file"]));
    await writer.close();
    window.showOpenFilePicker = async () => [handle];
  }, filename);
  await page.locator('[data-id="M-P-EX-101"]').fill(filename);
  await page.locator('#assignment-form button[type="submit"]').click();
  await click(page, "choose-files");
  await expect(page.locator('[data-media-access="M-P-EX-101"]')).toHaveText("Verbunden und lesbar");
  await page.reload();
  await expect(page.locator('[data-media-access="M-P-EX-101"]')).toHaveText("Verbunden und lesbar");
  await expect(page.locator('[data-id="M-P-EX-101"]')).toHaveValue(filename);
  await expect(page.locator('[data-media-access="M-P-EX-102"]')).toContainText("Zuordnung gespeichert");
});

test("HTML folder picker fallback keeps custom mappings and reconnects every media file with one folder selection", async ({ page }) => {
  const { mkdtempSync, rmSync, unlinkSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/smarthapti-input-folder-");
  const customName = "My locally renamed walking.mp4";
  const names = [...m.media.map((item) => item.fileName), customName];
  for (const name of new Set(names)) writeFileSync(`${dir}/${name}`, Buffer.from("local test bytes"));
  try {
    await page.context().addInitScript(() => {
      window.showDirectoryPicker = undefined;
      window.showOpenFilePicker = undefined;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (text) => { window.copiedMediaDiagnostic = text; } },
      });
    });
    await page.goto("./#settings");
    await click(page, "choose-directory");
    await page.locator("#local-directory").setInputFiles(dir);
    await expect(page.locator("#status")).toContainText("keinen dauerhaften Handle");
    await page.locator('[data-id="M-P-EX-101"]').fill(customName);
    await page.locator('#assignment-form button[type="submit"]').click();

    // A fresh page in the same browser profile loses the input FileList but retains origin storage.
    const browserContext = page.context();
    await page.close();
    const restarted = await browserContext.newPage();
    await restarted.goto("./#settings");
    await expect(restarted.locator('[data-id="M-P-EX-101"]')).toHaveValue(customName);
    await expect(restarted.locator('[data-action="choose-directory"]')).toBeVisible();
    await expect(restarted.locator('[data-media-access="M-P-EX-101"]')).toContainText("Zuordnung gespeichert");

    // A single re-selection of the folder repopulates all mappings by filename.
    await click(restarted, "choose-directory");
    await restarted.locator("#local-directory").setInputFiles(dir);
    await expect(restarted.locator('[data-id="M-P-EX-101"]')).toHaveValue(customName);
    for (const item of m.media)
      await expect(restarted.locator(`[data-media-access="${item.id}"]`)).toHaveText("Verbunden und lesbar");

    unlinkSync(`${dir}/P_EX_001.mp4`);
    await click(restarted, "choose-directory");
    await restarted.locator("#local-directory").setInputFiles(dir);
    await expect(restarted.locator('[data-media-access="M-P-EX-001"]')).toContainText("Datei nicht gefunden oder umbenannt");
    await expect(restarted.locator('[data-media-access="M-P-EX-101"]')).toHaveText("Verbunden und lesbar");
    await expect(restarted.locator('[data-id="M-P-EX-101"]')).toHaveValue(customName);

    await restarted.locator(".media-diagnostics summary").click();
    await click(restarted, "copy-media-diagnostics");
    const diagnostic = await restarted.evaluate(() => window.copiedMediaDiagnostic);
    expect(diagnostic).toContain("showDirectoryPicker: false");
    expect(diagnostic).toContain("HTML-Dateiauswahl");
    expect(diagnostic).toContain(`Gespeicherte Medienzuordnungen: ${m.media.length}/${m.media.length}`);
    expect(diagnostic).not.toContain(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("appointment detail displays the structured fictional schedule and blank question lines", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1100 });
  await page.goto("./#card/P-APT-001");
  await expect(page.locator(".appointment-detail > h1")).toHaveText("Nächster Physiotherapietermin");
  await expect(page.locator(".appointment-date")).toHaveText("Dienstag, 17. November 2026");
  await expect(page.locator(".appointment-time")).toHaveText("10:30 Uhr");
  await expect(page.locator(".appointment-meta")).toContainText("Physiotherapiepraxis (Demo), Raum 2");
  await expect(page.locator(".appointment-meta")).toContainText("Physiotherapie – Folgetermin");
  await expect(page.locator(".appointment-status")).toHaveText("Geplant");
  await expect(page.locator(".appointment-agenda li")).toHaveText([
    "Wie es zu Hause mit der Bewegung geht.",
    "Welche Übungen und Videos hilfreich sind.",
    "Welche Fragen noch offen sind.",
  ]);
  await expect(page.locator(".appointment-note-lines span")).toHaveCount(3);
  await expect(page.locator(".appointment-note-lines")).toBeInViewport();
  await expect(page.locator('.appointment-action [data-action="confirm:P-APT-001"]')).toBeInViewport();
  await expect(page.locator(".appointment-source")).toContainText("Fiktiver persönlicher Terminplan");
  await expect(page.locator(".appointment-source")).toContainText("02.11.2026");
  await expect(page.locator(".appointment-source")).toContainText("kein echter Termin");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(800);
  await page.goto("./#moderator");
  await expect(page.locator('#scenario option[value="physio"]')).toHaveText("Physiotermin · Dienstag, 17. November 2026");
});

test("appointment QR on welcome and in menu opens the same detail without writing to timeline", async ({ page }) => {
  const svg = readFileSync(index.cards.find((card) => card.cardId === "P-APT-001").qrFile, "utf8");
  await page.addInitScript(({ svg }) => {
    window.appointmentQrSvg = svg;
    navigator.mediaDevices.getUserMedia = async () => {
      const image = new Image();
      image.src = "data:image/svg+xml;base64," + btoa(window.appointmentQrSvg);
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 640;
      const context = canvas.getContext("2d");
      context.fillStyle = "white";
      context.fillRect(0, 0, 640, 640);
      context.drawImage(image, 60, 60, 520, 520);
      return canvas.captureStream(10);
    };
  }, { svg });
  await page.goto("./#welcome");
  await expect(page).toHaveURL(/#card\/P-APT-001$/);
  await expect(page.locator(".appointment-date")).toHaveText("Dienstag, 17. November 2026");
  await expect(page.locator(".appointment-time")).toHaveText("10:30 Uhr");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("smarthapti-demo") || "{}").keys || [])).not.toContain("J10");

  await page.goto("./#home");
  await click(page, "scan");
  await expect(page).toHaveURL(/#card\/P-APT-001$/);
  await expect(page.locator(".appointment-date")).toHaveText("Dienstag, 17. November 2026");
  await expect(page.locator(".appointment-meta")).toContainText("Physiotherapiepraxis (Demo), Raum 2");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("smarthapti-demo") || "{}").keys || [])).not.toContain("J10");
});

test("home appointment opens its shared detail and still requires explicit timeline confirmation", async ({ page }) => {
  await page.goto("./#home");
  await click(page, "card:P-APT-001");
  await expect(page).toHaveURL(/#card\/P-APT-001$/);
  await expect(page.locator(".appointment-date")).toHaveText("Dienstag, 17. November 2026");
  await expect(page.locator(".appointment-time")).toHaveText("10:30 Uhr");
  await expect(page.locator(".appointment-meta")).toContainText("Physiotherapiepraxis (Demo), Raum 2");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("smarthapti-demo") || "{}").keys || [])).not.toContain("J10");
  await click(page, "confirm:P-APT-001");
  await expect(page.locator("main")).toContainText("Diesen Eintrag hinzufügen?");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("smarthapti-demo") || "{}").keys || [])).not.toContain("J10");
});

test("patient record uses separate fictional content and never connects to EPIC", async ({ page }) => {
  expect(patientRecord.items).toHaveLength(4);
  expect(patientRecord.items.every((item) => item.fictional)).toBe(true);
  expect(patientRecordContents.contents.map((content) => content.id)).toEqual(
    patientRecord.items.map((item) => item.contentId),
  );
  await page.goto("./#record");
  await expect(page.locator(".record-row")).toHaveCount(4);
  for (const item of patientRecord.items.filter((entry) => entry.type === "report")) {
    await click(page, "record:" + item.id);
    await expect(page).toHaveURL(new RegExp(`#record/${item.id}$`));
    await expect(page.locator("main")).toContainText(item.title);
    await expect(page.locator("main")).toContainText("Fiktive EPIC-Ansicht ohne Verbindung");
    await expect(page.locator("main")).toContainText("nicht klinisch geprüft");
    await expect(page.locator("main")).toContainText("Demo-Dokument");
    await click(page, "record");
  }
});

test("x-ray selection stays local, persists its filename, and handles a lost file grant", async ({ page }) => {
  await page.addInitScript(() => {
    window.showOpenFilePicker = undefined;
  });
  await page.goto("./#settings");
  await expect(page.locator("#xray-file-status")).toContainText("Noch kein lokales");
  const png = new PNG({ width: 2, height: 2 });
  png.data.fill(180);
  const uploadRequests = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") uploadRequests.push(request.method() + " " + request.url());
  });
  await click(page, "choose-xray");
  await expect(page.locator("#settings-status")).toContainText("Bitte bestätigen");
  await page.locator("#xray-approval").check();
  const chooser = page.waitForEvent("filechooser");
  await click(page, "choose-xray");
  await (await chooser).setFiles({
    name: "Fiktives-Demo-Roentgenbild.png",
    mimeType: "image/png",
    buffer: PNG.sync.write(png),
  });
  await expect(page.locator("#xray-file-status")).toContainText("verbunden");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("smarthapti-xray-assignment-v1")))).toEqual({
    version: 1,
    fileName: "Fiktives-Demo-Roentgenbild.png",
    approved: true,
  });
  await page.goto("./#record/xray");
  await expect(page.locator("#record-xray-image")).toBeVisible();
  await expect(page.locator("#record-xray-image")).toHaveAttribute("src", /^blob:/);
  await expect(page.locator("#record-image-status")).toContainText("Keine Übertragung");
  await click(page, "image-zoom-in");
  await expect(page.locator("#record-xray-image")).toHaveCSS("transform", "matrix(1.25, 0, 0, 1.25, 0, 0)");
  await click(page, "image-zoom-reset");
  await expect(page.locator("#record-xray-image")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  expect(uploadRequests).toEqual([]);
  await page.reload();
  await expect(page.locator("#record-image-status")).toContainText("nicht verbunden");
  await expect(page.locator("#record-xray-image")).toBeHidden();
  await click(page, "settings");
  await expect(page.locator("#xray-file-status")).toContainText("Datei erneut auswählen");
  await page.locator("#xray-approval").uncheck();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("smarthapti-xray-assignment-v1")).approved)).toBe(false);
  await page.reload();
  await expect(page.locator("#xray-approval")).not.toBeChecked();
  await expect(page.locator("#xray-file-status")).toContainText("Fiktives-Demo-Roentgenbild.png");
});

test("x-ray setting reuses a previously granted SMART folder", async ({ page }) => {
  const png = new PNG({ width: 2, height: 2 });
  png.data.fill(210);
  await page.addInitScript((bytes) => {
    const image = new File([Uint8Array.from(bytes)], "Roentgen-Freigabe.png", { type: "image/png" });
    const folder = {
      async *values() {
        yield { kind: "file", name: image.name, getFile: async () => image };
      },
      async getFileHandle(name) {
        if (name !== image.name) throw new DOMException("missing", "NotFoundError");
        return { getFile: async () => image };
      },
    };
    window.testSmartFolder = folder;
    window.showDirectoryPicker = async () => folder;
    window.showOpenFilePicker = undefined;
  }, [...PNG.sync.write(png)]);
  await page.goto("./#settings");
  await click(page, "choose-directory");
  await expect(page.locator("#xray-connected-choice option")).toHaveCount(2);
  await page.locator("#xray-approval").check();
  await page.locator("#xray-connected-choice").selectOption("Roentgen-Freigabe.png");
  await click(page, "use-xray-connected");
  await expect(page.locator("#xray-file-status")).toContainText("verbunden");
  await page.goto("./#record/xray");
  await expect(page.locator("#record-xray-image")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("smarthapti-xray-assignment-v1")).fileName)).toBe("Roentgen-Freigabe.png");
});
test("camera denial and directory fallback keep touch selection usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("denied", "NotAllowedError");
    };
    window.showDirectoryPicker = undefined;
  });
  await page.goto("./#scan");
  await expect(page.locator("#status")).toContainText("Kamera nicht verfügbar");
  await expect(page.locator("#camera-indicator")).toHaveCount(0);
  await click(page, "cards");
  await expect(page.locator("#card-list button")).toHaveCount(13);
  await click(page, "moderator");
  const chooser = page.waitForEvent("filechooser");
  await click(page, "choose-directory");
  await chooser;
  await page.locator("#local-directory").dispatchEvent("cancel");
  await expect(page.locator("#status")).toContainText("Auswahl abgebrochen");
  await click(page, "cards");
  await expect(page.locator("#card-list button")).toHaveCount(13);
});
test("local file binding, media errors, URL revocation, reset preserves media binding", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.revocations = [];
    const original = URL.revokeObjectURL;
    URL.revokeObjectURL = (url) => {
      window.revocations.push(url);
      original(url);
    };
  });
  await page.goto("./#card/P-EX-001");
  await expect(page.locator(".media-status")).toContainText("Nicht verbunden");
  await page.locator("#local-files").setInputFiles({
    name: "P_EX_001.mp4",
    mimeType: "video/mp4",
    buffer: Buffer.from("invalid media"),
  });
  await expect(page.locator(".media-status")).toContainText("nicht abspielbar");
  await click(page, "moderator");
  await expect(page.locator("#media-list")).toContainText(
    "P_EX_001.mp4: verbunden",
  );
  expect(await page.evaluate(() => window.revocations.length)).toBeGreaterThan(
    0,
  );
  page.once("dialog", (d) => d.accept());
  await click(page, "reset");
  await expect(page.locator("#media-list")).toContainText(
    "P_EX_001.mp4: verbunden",
  );
});
test("real decoder processes a simulated camera frame and stops its tracks", async ({
  page,
}) => {
  const svg = readFileSync(index.cards[0].qrFile, "utf8");
  await page.addInitScript(
    ({ svg }) => {
      window.stopped = 0;
      navigator.mediaDevices.getUserMedia = async (options) => {
        window.requestedFacing = options.video.facingMode.ideal;
        const image = new Image();
        image.src = "data:image/svg+xml;base64," + btoa(svg);
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 640;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 640, 640);
        ctx.drawImage(image, 60, 60, 520, 520);
        const stream = canvas.captureStream(10);
        for (const track of stream.getTracks()) {
          const stop = track.stop.bind(track);
          track.stop = () => {
            window.stopped++;
            stop();
          };
        }
        return stream;
      };
    },
    { svg },
  );
  await page.goto("./#scan");
  await expect(page).toHaveURL(/#card\/P-INF-001/);
  expect(await page.evaluate(() => window.requestedFacing)).toBe("user");
  expect(await page.evaluate(() => window.stopped)).toBeGreaterThan(0);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("smarthapti-demo") || '{"keys":[]}')
          .keys,
    ),
  ).toEqual([]);
});
test("production PWA shell, offline text and no media caching", async ({
  page,
  context,
}) => {
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.locator(".welcome-open")).toBeVisible();
  const cacheURLs = await page.evaluate(async () => {
    const result = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      result.push(...(await cache.keys()).map((r) => r.url));
    }
    return result;
  });
  expect(cacheURLs.some((u) => u.endsWith("demo_manifest.json"))).toBe(true);
  expect(cacheURLs.some((u) => /\.(mp4|mp3)$/.test(u))).toBe(false);
  await context.setOffline(true);
  await page.reload();
  await click(page, "home");
  await click(page, "cards");
  await expect(page.locator("#card-list button")).toHaveCount(13);
});
test("portrait and landscape have no horizontal overflow and large controls", async ({
  page,
}) => {
  for (const viewport of [
    { width: 800, height: 1060 },
    { width: 1060, height: 700 },
    { width: 360, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("./#moderator");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const b of await page.locator("button:visible").all())
      expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
  }
});

test("actual local MP4 and MP3 playback stops and revokes blobs on navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.revoked = [];
    const revoke = URL.revokeObjectURL;
    URL.revokeObjectURL = (url) => {
      window.revoked.push(url);
      revoke(url);
    };
  });
  await page.goto("./#video/P-EX-101");
  const h264 = await page.evaluate(() =>
    document
      .createElement("video")
      .canPlayType('video/mp4; codecs="avc1.42E01E"'),
  );
  expect(
    h264,
    "The MP4 playback test requires an H.264-capable browser. Use Google Chrome (npx playwright install chrome) or CHROMIUM_PATH pointing to a codec-enabled Chromium.",
  ).not.toBe("");
  const startPlayback = async (player) => {
    await expect
      .poll(() => player.evaluate((p) => p.readyState))
      .toBeGreaterThan(0);
    await player.evaluate(async (p) => {
      window.oldPlayer = p;
      let timer;
      try {
        await Promise.race([
          p.play(),
          new Promise((_, reject) => {
            timer = setTimeout(
              () =>
                reject(
                  new Error(
                    "Local media did not start playing within 5 seconds",
                  ),
                ),
              5000,
            );
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    });
  };
  const { execFileSync } = await import("node:child_process");
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/smarthapti-media-");
  try {
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "color=c=gray:s=160x120:d=2",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:duration=2",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-shortest",
      dir + "/GehenMitTeilbelastung_video_720p.mp4",
    ]);
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:duration=2",
      dir + "/ALMA_P_START.mp3",
    ]);
    await page.goto("./#video/P-EX-101");
    await page
      .locator("#local-files")
      .setInputFiles([dir + "/GehenMitTeilbelastung_video_720p.mp4", dir + "/ALMA_P_START.mp3"]);
    const video = page.locator("video.video-player");
    await expect(video).toHaveAttribute("src", /^blob:/);
    await expect(video).toHaveAttribute("data-autoplay-attempted", "true");
    await expect(video).toHaveJSProperty("muted", false);
    await video.evaluate((player) => { window.oldPlayer = player; });
    if (await page.locator(".video-start-button").isVisible())
      await page.locator(".video-start-button").click();
    else await startPlayback(video);
    await expect
      .poll(() => video.evaluate((p) => p.currentTime))
      .toBeGreaterThan(0);
    await click(page, "home");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.oldPlayer.paused && !window.oldPlayer.getAttribute("src"),
        ),
      )
      .toBe(true);
    await click(page, "dialog:ALMA-P-START");
    await expect(page.locator("audio")).toHaveAttribute("src", /^blob:/);
    await startPlayback(page.locator("audio"));
    await expect
      .poll(() => page.locator("audio").evaluate((p) => p.currentTime))
      .toBeGreaterThan(0);
    await click(page, "cards");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.oldPlayer.paused && !window.oldPlayer.getAttribute("src"),
        ),
      )
      .toBe(true);
    expect(await page.evaluate(() => window.revoked.length)).toBe(2);
    await click(page, "timeline");
    await expect(page.locator(".timeline li")).toHaveCount(3);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("saved exercise video survives a fresh PWA page without the source grant and removal preserves the original", async ({ page }) => {
  const { execFileSync } = await import("node:child_process");
  const { mkdtempSync, readFileSync, rmSync, statSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/smarthapti-persistent-video-");
  const source = `${dir}/GehenMitTeilbelastung_video_720p.mp4`;
  const replacement = `${dir}/A replacement walking video.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=gray:s=160x120:d=4", "-f", "lavfi", "-i", "sine=frequency=440:duration=4", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", source]);
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=blue:s=160x120:d=3", "-c:v", "libx264", "-pix_fmt", "yuv420p", replacement]);
  const mediaRequests = [];
  page.on("request", (request) => {
    if (/GehenMitTeilbelastung_video_720p\.mp4/.test(request.url())) mediaRequests.push(request.url());
  });
  try {
    await page.goto("./#settings");
    await page.locator("#local-files").setInputFiles(source);
    page.once("dialog", (dialog) => dialog.accept());
    await click(page, "save-local-video:M-P-EX-101");
    await expect(page.locator('[data-media-access="M-P-EX-101"]')).toHaveText("Dauerhaft auf diesem Tablet gespeichert und abspielbar");
    const storedRecord = await page.evaluate(async (mediaId) => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("smarthapti-persistent-local-videos-v1", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const value = await new Promise((resolve, reject) => {
        const tx = db.transaction("videos", "readonly");
        const request = tx.objectStore("videos").get(mediaId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return { backend: value.backend, fileName: value.fileName, size: value.size, hasBlob: value.blob instanceof Blob };
    }, "M-P-EX-101");
    expect(storedRecord.backend).toBe("opfs");
    expect(storedRecord.fileName).toBe("GehenMitTeilbelastung_video_720p.mp4");
    expect(storedRecord.size).toBeGreaterThan(0);
    expect(storedRecord.hasBlob).toBe(false);

    await page.locator("#local-files").setInputFiles({
      name: "GehenMitTeilbelastung_video_720p.mp4",
      mimeType: "video/mp4",
      buffer: readFileSync(replacement),
    });
    page.once("dialog", (dialog) => dialog.accept());
    await click(page, "save-local-video:M-P-EX-101");
    await expect(page.locator("#status")).toContainText("1 Video lokal gespeichert");
    await expect(page.locator('[data-id="M-P-EX-101"]')).toHaveValue("GehenMitTeilbelastung_video_720p.mp4");
    expect(await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("smarthapti-persistent-local-videos-v1", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const value = await new Promise((resolve, reject) => {
        const tx = db.transaction("videos", "readonly");
        const request = tx.objectStore("videos").get("M-P-EX-101");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return { fileName: value.fileName, size: value.size };
    })).toEqual({
      fileName: "GehenMitTeilbelastung_video_720p.mp4",
      size: statSync(replacement).size,
    });

    const context = page.context();
    await page.close();
    const restarted = await context.newPage();
    await restarted.goto("./#video/P-EX-101");
    const player = restarted.locator("video.video-player");
    await expect(player).toHaveAttribute("src", /^blob:/);
    await expect.poll(() => player.evaluate((video) => video.currentTime)).toBeGreaterThan(0);
    await restarted.goto("./#settings");
    await expect(restarted.locator('[data-media-access="M-P-EX-101"]')).toHaveText("Dauerhaft auf diesem Tablet gespeichert und abspielbar");

    await restarted.locator("#local-files").setInputFiles({
      name: "GehenMitTeilbelastung_video_720p.mp4",
      mimeType: "video/mp4",
      buffer: readFileSync(replacement),
    });
    restarted.once("dialog", (dialog) => dialog.accept());
    await click(restarted, "remove-local-video:M-P-EX-101");
    await expect(restarted.locator('[data-media-access="M-P-EX-101"]')).toHaveText("Verbunden und lesbar");
    expect(statSync(source).size).toBeGreaterThan(0);
    expect(statSync(replacement).size).toBeGreaterThan(0);
    expect(await restarted.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("smarthapti-persistent-local-videos-v1", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const count = await new Promise((resolve, reject) => {
        const tx = db.transaction("videos", "readonly");
        const request = tx.objectStore("videos").count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return count;
    })).toBe(0);
    expect(mediaRequests).toEqual([]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("video library uses IndexedDB Blob fallback when OPFS is unavailable", async ({ page }) => {
  const { execFileSync } = await import("node:child_process");
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/smarthapti-video-idb-");
  const source = `${dir}/GehenMitTeilbelastung_video_720p.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=gray:s=160x120:d=2", "-c:v", "libx264", "-pix_fmt", "yuv420p", source]);
  try {
    await page.addInitScript(() => {
      Object.defineProperty(navigator.storage, "getDirectory", { configurable: true, value: undefined });
    });
    await page.goto("./#settings");
    await page.locator("#local-files").setInputFiles(source);
    page.once("dialog", (dialog) => dialog.accept());
    await click(page, "save-local-video:M-P-EX-101");
    await expect(page.locator('[data-media-access="M-P-EX-101"]')).toHaveText("Dauerhaft auf diesem Tablet gespeichert und abspielbar");
    expect(await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("smarthapti-persistent-local-videos-v1", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const record = await new Promise((resolve, reject) => {
        const tx = db.transaction("videos", "readonly");
        const request = tx.objectStore("videos").get("M-P-EX-101");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return { backend: record.backend, hasBlob: record.blob instanceof Blob };
    })).toEqual({ backend: "indexeddb", hasBlob: true });
    await page.reload();
    await page.goto("./#video/P-EX-101");
    await expect(page.locator("video.video-player")).toHaveAttribute("src", /^blob:/);
    await expect(page.locator(".video-media-status")).toBeHidden();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("bulk video save copies only selected IDs and bulk removal leaves both originals intact", async ({ page }) => {
  const { execFileSync } = await import("node:child_process");
  const { mkdtempSync, rmSync, statSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/smarthapti-video-bulk-");
  const first = `${dir}/Local walking.mp4`;
  const second = `${dir}/Local squats.mp4`;
  for (const output of [first, second])
    execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=gray:s=160x120:d=2", "-c:v", "libx264", "-pix_fmt", "yuv420p", output]);
  try {
    await page.goto("./#settings");
    await page.locator("#local-files").setInputFiles([first, second]);
    await page.locator('[data-id="M-P-EX-101"]').fill("Local walking.mp4");
    await page.locator('[data-id="M-P-EX-102"]').fill("Local squats.mp4");
    await page.locator('#assignment-form button[type="submit"]').click();
    page.once("dialog", (dialog) => dialog.accept());
    await click(page, "save-local-videos");
    for (const id of ["M-P-EX-101", "M-P-EX-102"])
      await expect(page.locator(`[data-media-access="${id}"]`)).toHaveText("Dauerhaft auf diesem Tablet gespeichert und abspielbar");
    expect(await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("smarthapti-persistent-local-videos-v1", 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const records = await new Promise((resolve, reject) => {
        const tx = db.transaction("videos", "readonly");
        const request = tx.objectStore("videos").getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return records.map((record) => [record.mediaId, record.fileName]).sort();
    })).toEqual([["M-P-EX-101", "Local walking.mp4"], ["M-P-EX-102", "Local squats.mp4"]]);
    page.once("dialog", (dialog) => dialog.accept());
    await click(page, "remove-all-local-videos");
    await expect(page.locator('[data-media-access="M-P-EX-101"]')).toHaveText("Verbunden und lesbar");
    expect(statSync(first).size).toBeGreaterThan(0);
    expect(statSync(second).size).toBeGreaterThan(0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("insufficient browser quota prevents any video copy and reports the needed space", async ({ page }) => {
  const { execFileSync } = await import("node:child_process");
  const { mkdtempSync, rmSync, statSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/smarthapti-video-quota-");
  const source = `${dir}/GehenMitTeilbelastung_video_720p.mp4`;
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=gray:s=160x120:d=2", "-c:v", "libx264", "-pix_fmt", "yuv420p", source]);
  try {
    await page.addInitScript(() => {
      Object.defineProperty(navigator.storage, "estimate", { configurable: true, value: async () => ({ usage: 0, quota: 1, available: 1 }) });
    });
    await page.goto("./#settings");
    await page.locator("#local-files").setInputFiles(source);
    await click(page, "save-local-video:M-P-EX-101");
    await expect(page.locator("#status")).toContainText("Nicht genügend Browser-Speicher");
    expect(await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("smarthapti-persistent-local-videos-v1", 1);
        request.onupgradeneeded = () => request.result.createObjectStore("videos", { keyPath: "mediaId" });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const count = await new Promise((resolve, reject) => {
        const tx = db.transaction("videos", "readonly");
        const request = tx.objectStore("videos").count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return count;
    })).toBe(0);
    expect(statSync(source).size).toBeGreaterThan(1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("landscape welcome opens a compact menu by touch and keyboard", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("denied", "NotAllowedError");
    };
  });
  await page.goto("./");
  await expect(page.locator(".welcome-open")).toBeVisible();
  await expect(page.locator("header")).toHaveCount(0);
  expect(
    await page
      .locator(".alpine-background")
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  ).toBe(true);
  await page.locator(".welcome-open").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".role-line")).toHaveText("Für Ernst");
  expect(
    (await page.locator("header").boundingBox()).height,
  ).toBeLessThanOrEqual(72);
  expect((await page.locator(".role-line").boundingBox()).height).toBeLessThan(
    32,
  );
  await expect(page.locator('[data-action="role"]')).toBeHidden();
  await expect(page.locator('[data-action="role"], .perspective-options')).toHaveCount(0);
  await click(page, "welcome");
  await expect(page.locator(".welcome-open")).toBeVisible();
});

test("welcome fades, presents the card five times and rests for ten seconds", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new Error("No camera in timing test");
    };
  });
  await page.clock.install({ time: new Date("2026-11-09T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-09T12:00:00Z"));
  await page.goto("./");
  const guide = page.locator(".welcome-guide");
  await expect(guide).toHaveAttribute("data-phase", "fade-in");
  expect(
    await guide.evaluate(
      (el) => el.getAnimations()[0].effect.getTiming().duration,
    ),
  ).toBe(3000);
  await page.clock.runFor(3000);
  await expect(guide).toHaveAttribute("data-phase", "present");
  expect(
    await page
      .locator(".presented-card")
      .evaluate((el) => el.getAnimations()[0].effect.getTiming().iterations),
  ).toBe(5);
  await page.clock.runFor(12000);
  await expect(guide).toHaveAttribute("data-phase", "fade-out");
  await page.clock.runFor(3000);
  await expect(guide).toBeHidden();
  await expect(guide).toHaveAttribute("data-phase", "rest");
  await page.clock.runFor(9999);
  await expect(guide).toBeHidden();
  await page.clock.runFor(1);
  await expect(guide).toHaveAttribute("data-phase", "fade-in");
  await click(page, "home");
  await page.clock.runFor(60000);
  await expect(page.locator(".welcome-guide")).toHaveCount(0);
  await expect(page.locator(".role-line")).toHaveText("Für Ernst");
});

test("reduced motion keeps the instruction readable without moving the hand", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install({ time: new Date("2026-11-09T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-09T12:00:00Z"));
  await page.goto("./");
  await page.clock.runFor(3000);
  await expect(page.locator(".welcome-guide")).toBeVisible();
  expect(
    await page
      .locator(".presented-card")
      .evaluate((el) => el.getAnimations().length),
  ).toBe(0);
});

test("patient QR opens from welcome; retired relative QR does not change the target group", async ({
  page,
}) => {
  const anna = readFileSync(
    historicalIndex.cards.find((c) => c.cardId === "A-INF-001").qrFile,
    "utf8",
  );
  const ernst = readFileSync(
    index.cards.find((c) => c.cardId === "P-INF-001").qrFile,
    "utf8",
  );
  await page.addInitScript(
    ({ svg }) => {
      window.cameraSvg = svg;
      window.stopped = 0;
      navigator.mediaDevices.getUserMedia = async () => {
        const img = new Image();
        img.src = "data:image/svg+xml;base64," + btoa(window.cameraSvg);
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 640;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 640, 640);
        ctx.drawImage(img, 60, 60, 520, 520);
        const stream = canvas.captureStream(10);
        for (const t of stream.getTracks()) {
          const stop = t.stop.bind(t);
          t.stop = () => {
            window.stopped++;
            stop();
          };
        }
        return stream;
      };
    },
    { svg: anna },
  );
  await page.goto("./");
  await expect(page.locator(".welcome-open")).toBeVisible();
  await expect(page).not.toHaveURL(/#card\/A-INF-001/);
  await expect(page.locator("#status")).toContainText("früheren Demoversion");
  await page.evaluate((svg) => {
    window.cameraSvg = svg;
  }, ernst);
  await page.goto("./#home");
  await page.goto("./#welcome");
  await expect(page).toHaveURL(/#card\/P-INF-001/);
  await expect(page.locator(".role-line")).toHaveText("Für Ernst");
  expect(await page.evaluate(() => window.stopped)).toBe(2);
  expect(
    await page.evaluate(() => localStorage.getItem("smarthapti-demo")),
  ).toBeNull();
});

test("unknown QR keeps the welcome view and reports a neutral message", async ({ page }) => {
  const svg = await QRCode.toString("SH1:P-UNKNOWN", {
    type: "svg",
    errorCorrectionLevel: "H",
  });
  await page.addInitScript(({ svg }) => {
    navigator.mediaDevices.getUserMedia = async () => {
      const image = new Image();
      image.src = "data:image/svg+xml;base64," + btoa(svg);
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 640;
      const context = canvas.getContext("2d");
      context.fillStyle = "white";
      context.fillRect(0, 0, 640, 640);
      context.drawImage(image, 60, 60, 520, 520);
      return canvas.captureStream(10);
    };
  }, { svg });
  await page.goto("./#welcome");
  await expect(page.locator("#status")).toContainText("Diese Karte kenne ich noch nicht");
  await expect(page.locator(".welcome-open")).toBeVisible();
  await expect(page).toHaveURL(/#welcome$/);
  await expect(page.locator(".video-player")).toHaveCount(0);
  await expect(page.locator(".card-detail")).toHaveCount(0);
});

test("red camera dot appears only when scanning is ready and clears on navigation or detection", async ({
  page,
}) => {
  const svg = readFileSync(index.cards[0].qrFile, "utf8");
  await page.addInitScript(
    ({ svg }) => {
      window.stopped = 0;
      navigator.mediaDevices.getUserMedia = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 640;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 640, 640);
        window.paintQR = async () => {
          const image = new Image();
          image.src = "data:image/svg+xml;base64," + btoa(svg);
          await image.decode();
          ctx.drawImage(image, 60, 60, 520, 520);
          // A canvas mock must explicitly publish its changed frame, like a live camera.
          stream.getVideoTracks()[0].requestFrame();
        };
        const stream = canvas.captureStream(10);
        for (const t of stream.getTracks()) {
          const stop = t.stop.bind(t);
          t.stop = () => {
            window.stopped++;
            stop();
          };
        }
        return stream;
      };
    },
    { svg },
  );
  await page.goto("./");
  await expect(page.locator("#camera-indicator")).toBeVisible();
  await expect(page.locator("#camera-indicator")).toHaveAttribute(
    "aria-label",
    "Kamera aktiv – QR-Erkennung bereit",
  );
  await click(page, "home");
  await expect(page.locator("#camera-indicator")).toHaveCount(0);
  expect(await page.evaluate(() => window.stopped)).toBe(1);
  await click(page, "welcome");
  await expect(page.locator("#camera-indicator")).toBeVisible();
  await page.evaluate(() => window.paintQR());
  await expect(page).toHaveURL(/#card\/P-INF-001/);
  await expect(page.locator("#camera-indicator")).toHaveCount(0);
  expect(await page.evaluate(() => window.stopped)).toBe(2);
});

async function blankCamera(page, hold = false) {
  await page.addInitScript(
    ({ hold }) => {
      window.cameraCalls = 0;
      window.cameraStops = 0;
      window.holdCamera = hold;
      navigator.mediaDevices.getUserMedia = async () => {
        window.cameraCalls++;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 320;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 320, 320);
        const stream = canvas.captureStream(10);
        for (const track of stream.getTracks()) {
          const stop = track.stop.bind(track);
          track.stop = () => {
            window.cameraStops++;
            stop();
          };
        }
        if (window.holdCamera)
          await new Promise((resolve) => {
            window.releaseCamera = resolve;
          });
        return stream;
      };
    },
    { hold },
  );
}

test("power button is available on every view; sleeping stays black until activated", async ({
  page,
}) => {
  await blankCamera(page);
  for (const route of [
    "welcome",
    "home",
    "cards",
    "card/P-INF-001",
    "card/P-EX-001",
    "dialog/ALMA-P-START",
    "confirm/P-APT-001",
    "timeline",
    "scan",
    "moderator",
  ]) {
    await page.goto("./#" + route);
    await expect(page.locator('[data-action="power-off"]')).toBeVisible();
    await click(page, "power-off");
    await expect(page.locator(".wake-screen")).toBeVisible();
    expect(
      await page
        .locator(".wake-screen")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgb(0, 0, 0)");
    await expect(
      page.locator("video,audio,#camera-indicator,.power-off,.welcome-guide"),
    ).toHaveCount(0);
    await page.evaluate(() =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    await expect(page.locator(".wake-screen")).toBeVisible();
    await click(page, "wake");
    await expect(page).toHaveURL(/#welcome$/);
    await expect(page.locator(".welcome-open")).toBeVisible();
  }
});

test("menu scanner shows the red camera dot; sleep stops the camera and survives reload", async ({
  page,
}) => {
  await blankCamera(page);
  await page.goto("./#home");
  await click(page, "scan");
  await expect(page.locator("#camera-indicator")).toBeVisible();
  await expect(page.locator("#camera")).toHaveAttribute(
    "aria-label",
    "Kameravorschau",
  );
  await click(page, "power-off");
  await expect(page.locator(".wake-screen")).toBeVisible();
  expect(await page.evaluate(() => window.cameraStops)).toBe(1);
  await expect(page.locator("#camera-indicator")).toHaveCount(0);
  await page.goto("./#home");
  await expect(page.locator(".wake-screen")).toBeVisible();
  await page.reload();
  await expect(page.locator(".wake-screen")).toBeVisible();
  expect(await page.evaluate(() => window.cameraCalls)).toBe(0);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#welcome$/);
  await expect(page.locator("#camera-indicator")).toBeVisible();
  expect(await page.evaluate(() => window.cameraCalls)).toBe(1);
});

test("camera permission completing after power-off cannot restart scanning", async ({
  page,
}) => {
  await blankCamera(page, true);
  await page.goto("./#scan");
  await expect.poll(() => page.evaluate(() => window.cameraCalls)).toBe(1);
  await click(page, "power-off");
  await page.evaluate(() => {
    window.holdCamera = false;
    window.releaseCamera();
  });
  await expect.poll(() => page.evaluate(() => window.cameraStops)).toBe(1);
  await expect(page.locator(".wake-screen")).toBeVisible();
  await expect(page.locator("#camera-indicator,video")).toHaveCount(0);
  await click(page, "wake");
  await expect(page.locator("#camera-indicator")).toBeVisible();
});

test("power-off stops local playback and preserves selected files and confirmed entries", async ({
  page,
}) => {
  const { execFileSync } = await import("node:child_process");
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/smarthapti-sleep-");
  try {
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:duration=2",
      dir + "/ALMA_P_START.mp3",
    ]);
    await page.goto("./#card/P-APT-001");
    await click(page, "confirm:P-APT-001");
    await click(page, "add:P-APT-001");
    await click(page, "home");
    await click(page, "dialog:ALMA-P-START");
    await page.locator("#local-files").setInputFiles(dir + "/ALMA_P_START.mp3");
    await page.locator("audio").evaluate(async (p) => {
      window.sleepingPlayer = p;
      await p.play();
    });
    await expect
      .poll(() => page.locator("audio").evaluate((p) => p.currentTime))
      .toBeGreaterThan(0);
    await click(page, "power-off");
    await expect(page.locator(".wake-screen")).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          window.sleepingPlayer.paused &&
          !window.sleepingPlayer.getAttribute("src"),
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("smarthapti-demo")).keys,
      ),
    ).toContain("J10");
    await click(page, "wake");
    await click(page, "home");
    await click(page, "moderator");
    await expect(page.locator("#media-list")).toContainText(
      "ALMA_P_START.mp3: verbunden",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("power button also works when content loading fails", async ({ page }) => {
  await page.route("**/content/demo_manifest.json", (route) => route.abort());
  await page.goto("./#home");
  await expect(page.locator("h1")).toContainText("konnte nicht geladen");
  await click(page, "power-off");
  await expect(page.locator(".wake-screen")).toBeVisible();
  await click(page, "wake");
  await expect(page.locator("h1")).toContainText("konnte nicht geladen");
});

test("settings persist exact local filenames across reload and demo reset", async ({
  page,
}) => {
  await page.goto("./#home");
  await click(page, "settings");
  await expect(page.locator("h1")).toHaveText("Einstellungen");
  const name = "Mein eigener Film mit Leerzeichen.mp4";
  await page.locator("#local-files").setInputFiles({
    name,
    mimeType: "video/mp4",
    buffer: Buffer.from("invalid media"),
  });
  const field = page.locator('[data-id="M-P-EX-101"]');
  await page
    .locator('.assignment-choice[data-target="assign-M-P-EX-101"]')
    .selectOption(name);
  await page.locator('#assignment-form button[type="submit"]').click();
  await expect(page.locator("#status")).toContainText("dauerhaft");
  await page.goto("./#card/P-EX-101");
  await expect(page.locator(".media-status")).toContainText(name);
  await page.reload();
  await expect(page.locator(".media-status")).toContainText("Nicht verbunden");
  await expect(page.locator(".media-status")).toContainText(name);
  await click(page, "settings");
  await expect(field).toHaveValue(name);
  await click(page, "moderator");
  page.once("dialog", (d) => d.accept());
  await click(page, "reset");
  await click(page, "settings");
  await expect(field).toHaveValue(name);
  await field.fill("https://example.org/film.mp4");
  await page.locator('#assignment-form button[type="submit"]').click();
  await expect(page.locator("#status")).toContainText("Nicht gespeichert");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("smarthapti-media-assignments-v1"))
          .assignments["M-P-EX-101"],
    ),
  ).toBe(name);
});

test("assignment backup export and restore keep card identities stable", async ({
  page,
}) => {
  await page.goto("./#settings");
  const download = page.waitForEvent("download");
  await click(page, "export-assignments");
  const data = JSON.parse(readFileSync(await (await download).path(), "utf8"));
  expect(data.version).toBe(1);
  expect(data.assignments["M-P-EX-101"]).toBe(
    "GehenMitTeilbelastung_video_720p.mp4",
  );
  data.assignments["M-P-EX-101"] = "Ersatzfilm.mp4";
  await page.locator("#assignment-backup").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await expect(page.locator('[data-id="M-P-EX-101"]')).toHaveValue(
    "Ersatzfilm.mp4",
  );
  await page.goto("./#card/P-EX-101");
  await expect(page.locator("main")).toContainText("P-EX-101");
  await expect(page.locator(".media-status")).toContainText("Ersatzfilm.mp4");
});

test("native folder fallback fills assignment choices without a second file selection", async ({
  page,
}) => {
  const { mkdtempSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(tmpdir() + "/SMART-");
  try {
    writeFileSync(dir + "/Mein Film.mp4", "test only");
    writeFileSync(dir + "/not-a-movie.txt", "ignored");
    await page.addInitScript(() => {
      window.showDirectoryPicker = undefined;
      window.showOpenFilePicker = undefined;
    });
    await page.goto("./#settings");
    expect(
      await page.locator("#local-files").getAttribute("accept"),
    ).toBeNull();
    await expect(page.locator(".assignment-choice").first()).toBeDisabled();
    const chooser = page.waitForEvent("filechooser");
    await click(page, "choose-directory");
    await (await chooser).setFiles(dir);
    await expect(page.locator(".connection-status")).toContainText(
      "1 lokale Dateien",
    );
    const choice = page.locator(
      '.assignment-choice[data-target="assign-M-P-EX-101"]',
    );
    await choice.selectOption("Mein Film.mp4");
    await expect(page.locator('[data-id="M-P-EX-101"]')).toHaveValue(
      "Mein Film.mp4",
    );
    await page.locator('#assignment-form button[type="submit"]').click();
    await expect(page.locator("#status")).toContainText("dauerhaft");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("folder results survive backgrounding and native file picker reopens the connected folder", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.testHidden = false;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => window.testHidden,
    });
    const picked = {
      name: "SMART",
      async *values() {
        yield {
          kind: "file",
          name: "Uebung.mp4",
          getFile: async () =>
            new File(["test"], "Uebung.mp4", { type: "video/mp4" }),
        };
      },
    };
    window.showDirectoryPicker = async () => {
      window.testHidden = true;
      document.dispatchEvent(new Event("visibilitychange"));
      await new Promise((resolve) => setTimeout(resolve, 20));
      window.testHidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
      return picked;
    };
    window.showOpenFilePicker = async (options) => {
      window.openedAtConnectedFolder = options.startIn === picked;
      window.pickerHasMediaFilter = !!options.types;
      return [
        {
          getFile: async () =>
            new File(["test"], "Weiterer Film.mp4", { type: "video/mp4" }),
        },
      ];
    };
  });
  await page.goto("./#settings");
  await click(page, "choose-directory");
  await expect(page.locator(".connection-status")).toContainText(
    "1 lokale Dateien",
  );
  await expect(page.locator(".assignment-choice").first()).toBeEnabled();
  await click(page, "choose-files");
  await expect(page.locator(".connection-status")).toContainText(
    "2 lokale Dateien",
  );
  expect(await page.evaluate(() => window.openedAtConnectedFolder)).toBe(true);
  expect(await page.evaluate(() => window.pickerHasMediaFilter)).toBe(false);
});
