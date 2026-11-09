import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import { resolveQR, visibleEvents, addEvent } from "../src/model.js";
const m = JSON.parse(readFileSync("content/demo_manifest.json"));
const dialogs = JSON.parse(readFileSync("content/demo_dialogs.json"));
const index = JSON.parse(readFileSync("print/CARD_INDEX.json"));
const click = (page, action) =>
  page.locator(`[data-action="${action}"]`).first().click();

test("manifest references, eleven existing cards and event identity", () => {
  expect(m.cards).toHaveLength(11);
  expect(new Set(m.cards.map((c) => c.id)).size).toBe(11);
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
    expect(media.fileName).toMatch(/^[\w-]+\.(mp4|mp3)$/);
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
    await page.goto("./");
    if (entry.cardId.startsWith("A-")) await click(page, "role");
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
test("cancel, explicit confirmation, shared appointment, persistence and private milestone", async ({
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
  await click(page, "role");
  await page.goto("./#card/A-APT-001");
  await expect(page.locator("main")).toContainText("Eintrag bereits vorhanden");
  await click(page, "timeline");
  await expect(page.locator(".timeline li")).toHaveCount(4);
  await page.goto("./#card/A-MIL-001");
  await click(page, "confirm:A-MIL-001");
  await click(page, "add:A-MIL-001");
  await expect(page.locator(".timeline li")).toHaveCount(5);
  await page.reload();
  await expect(page.locator(".timeline li")).toHaveCount(4); // reload defaults to patient, private event hidden
  await click(page, "role");
  await click(page, "timeline");
  await expect(page.locator(".timeline li")).toHaveCount(5);
  await click(page, "moderator");
  page.once("dialog", (d) => d.accept());
  await click(page, "reset");
  await click(page, "timeline");
  await expect(page.locator(".timeline li")).toHaveCount(3);
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
  await click(page, "cards");
  await expect(page.locator("#card-list button")).toHaveCount(6);
  await click(page, "moderator");
  await click(page, "choose-directory");
  await expect(page.locator("#status")).toContainText(
    "Ordnerauswahl in diesem Browser nicht verfügbar",
  );
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
  await expect(page.locator("h1")).toContainText("Ernst");
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
  await click(page, "cards");
  await expect(page.locator("#card-list button")).toHaveCount(6);
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
    await click(page, "role");
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
