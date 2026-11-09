import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function updateServer() {
  let release = 1;
  const server = createServer(async (req, res) => {
    const path = new URL(req.url, "http://localhost").pathname;
    if (!path.startsWith("/SMARThapti/")) {
      res.writeHead(404).end();
      return;
    }
    const rel = path.slice("/SMARThapti/".length) || "index.html";
    const file = resolve("dist", rel);
    if (!file.startsWith(resolve("dist") + "/")) {
      res.writeHead(403).end();
      return;
    }
    try {
      let data = await readFile(file);
      if (rel === "sw.js")
        data = Buffer.from(
          data
            .toString()
            .replace(
              /smarthapti-shell-[a-f0-9]+/g,
              "smarthapti-shell-release-" + release,
            ),
        );
      const type = rel.endsWith(".js")
        ? "text/javascript"
        : rel.endsWith(".css")
          ? "text/css"
          : rel.endsWith(".json") || rel.endsWith(".webmanifest")
            ? "application/json"
            : rel.endsWith(".html")
              ? "text/html"
              : rel.endsWith(".webp")
                ? "image/webp"
                : "application/octet-stream";
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
      res.end(data);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}/SMARThapti/`,
    publish: () => {
      release++;
    },
    close: () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  };
}

test("real service worker update waits for acceptance, reloads and retains assignments", async ({
  page,
}) => {
  const server = await updateServer();
  try {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 320;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 320, 320);
        const stream = canvas.captureStream(10);
        for (const track of stream.getTracks()) {
          const stop = track.stop.bind(track);
          track.stop = () => {
            localStorage.setItem("update-test-camera-stopped", "yes");
            stop();
          };
        }
        return stream;
      };
    });
    await page.goto(server.url + "#settings");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect
      .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
      .toBe(true);
    await expect(page.locator("#app-update")).toBeHidden();
    await page.locator('[data-id="M-P-EX-101"]').fill("Gespeicherter Film.mp4");
    await page.locator('#assignment-form button[type="submit"]').click();
    server.publish();
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await expect(page.locator("#app-update")).toBeVisible();
    await page.evaluate(() => {
      window.showDirectoryPicker = () =>
        new Promise((resolve) => {
          window.finishUpdateTestPicker = () =>
            resolve({ name: "SMART", async *values() {} });
        });
    });
    await page.locator('[data-action="choose-directory"]').click();
    await expect(page.locator("#app-update")).toBeHidden();
    await page.evaluate(() => window.finishUpdateTestPicker());
    await expect(page.locator("#app-update")).toBeVisible();
    await expect(page.locator('[data-id="M-P-EX-101"]')).toHaveValue(
      "Gespeicherter Film.mp4",
    );
    expect(
      await page.evaluate(async () => {
        const r = await navigator.serviceWorker.getRegistration();
        return !!r.waiting;
      }),
    ).toBe(true);
    await page.locator('[data-update="later"]').click();
    await expect(page.locator("#app-update")).toBeHidden();
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await expect(page.locator("#app-update")).toBeHidden();
    await page.reload();
    await expect(page.locator("#app-update")).toBeVisible();
    await page.goto(server.url + "#welcome");
    await expect(page.locator("#camera-indicator")).toBeVisible();
    await Promise.all([
      page.waitForEvent("load"),
      page.locator('[data-update="apply"]').click(),
    ]);
    await expect(page.locator("#app-update")).toBeHidden();
    expect(
      await page.evaluate(() =>
        localStorage.getItem("update-test-camera-stopped"),
      ),
    ).toBe("yes");
    await page.goto(server.url + "#settings");
    await expect(page.locator('[data-id="M-P-EX-101"]')).toHaveValue(
      "Gespeicherter Film.mp4",
    );
    expect(await page.evaluate(() => caches.keys())).toEqual([
      "smarthapti-shell-release-2",
    ]);
  } finally {
    await server.close();
  }
});

test("offline check does not interrupt the app and pending update stays hidden while asleep", async ({
  page,
  context,
}) => {
  const server = await updateServer();
  try {
    await page.goto(server.url + "#home");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect
      .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
      .toBe(true);
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await expect(page.locator("#app-update")).toBeHidden();
    await expect(page.locator(".menu-heading")).toBeVisible();
    await context.setOffline(false);
    await page.locator('[data-action="power-off"]').click();
    server.publish();
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await expect
      .poll(() =>
        page.evaluate(
          async () =>
            !!(await navigator.serviceWorker.getRegistration()).waiting,
        ),
      )
      .toBe(true);
    await expect(page.locator("#app-update")).toBeHidden();
    await expect(page.locator(".wake-screen")).toBeVisible();
    await page.locator('[data-action="wake"]').click();
    await expect(page.locator("#app-update")).toBeVisible();
  } finally {
    await server.close();
  }
});
