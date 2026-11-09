import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173/SMARThapti/",
    viewport: { width: 800, height: 1100 },
    // The local-media test needs the H.264 codecs shipped with Google Chrome.
    channel: process.env.CHROMIUM_PATH ? undefined : "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {},
  },
  webServer: {
    command: "npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173/SMARThapti/",
    reuseExistingServer: !process.env.CI,
  },
});
