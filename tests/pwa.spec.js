import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import { resolveQR, visibleEvents, addEvent } from "../src/model.js";
const m = JSON.parse(readFileSync("content/demo_manifest.json"));
const dialogs = JSON.parse(readFileSync("content/demo_dialogs.json"));
const historicalIndex = JSON.parse(readFileSync("print/CARD_INDEX.json"));
const index = { ...historicalIndex, cards: historicalIndex.cards.filter((c) => c.cardId.startsWith("P-")) };
const exerciseCatalog = JSON.parse(
  readFileSync("content/exercise_catalog.json"),
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
    await expect(page).toHaveURL(
      new RegExp(
        content.dialogNodeId
          ? `#dialog/${content.dialogNodeId}`
          : `#card/${card.id}`,
      ),
    );
    await expect(page.locator("main")).toContainText(
      content.dialogNodeId
        ? dialogs.nodes.find((n) => n.id === content.dialogNodeId).text
        : content.detailText,
    );
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
  await page.goto("./#card/P-APT-001");
  await expect(page.locator("main")).toContainText("Eintrag bereits vorhanden");
  await page.goto("./#card/P-MIL-001");
  await click(page, "confirm:P-MIL-001");
  await click(page, "add:P-MIL-001");
  await expect(page.locator(".timeline li")).toHaveCount(5);
  await page.reload();
  await expect(page.locator(".timeline li")).toHaveCount(5);
  await click(page, "moderator");
  page.once("dialog", (d) => d.accept());
  await click(page, "reset");
  await click(page, "timeline");
  await expect(page.locator(".timeline li")).toHaveCount(3);
});
test("only patient media and exercise cards are shown in the menu", async ({ page }) => {
  await page.goto("./#home");
  await expect(page.locator('[data-action="role"], .perspective-options')).toHaveCount(0);
  await expect(page.locator('[data-action^="card:P-EX-"]')).toHaveCount(8);
  await expect(page.locator('[data-action^="card:A-"]')).toHaveCount(0);
  await click(page, "cards");
  await expect(page.locator("#card-list button")).toHaveCount(13);
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
  await page.goto("./#card/P-EX-001");
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
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      dir + "/P_EX_001.mp4",
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
    await page.goto("./#card/P-EX-001");
    await page
      .locator("#local-files")
      .setInputFiles([dir + "/P_EX_001.mp4", dir + "/ALMA_P_START.mp3"]);
    await expect(page.locator("video")).toHaveAttribute("src", /^blob:/);
    await startPlayback(page.locator("video"));
    await expect
      .poll(() => page.locator("video").evaluate((p) => p.currentTime))
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
      "1 Mediendateien",
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
    "1 Mediendateien",
  );
  await expect(page.locator(".assignment-choice").first()).toBeEnabled();
  await click(page, "choose-files");
  await expect(page.locator(".connection-status")).toContainText(
    "2 Mediendateien",
  );
  expect(await page.evaluate(() => window.openedAtConnectedFolder)).toBe(true);
  expect(await page.evaluate(() => window.pickerHasMediaFilter)).toBe(false);
});
