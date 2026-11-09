const SHELL = __SHELL__;
const CACHE = "smarthapti-shell-__VERSION__";
self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL))),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith("smarthapti-shell-") && key !== CACHE)
          await caches.delete(key);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  // Cache only the app shell (including decorative artwork). Never selected files, blobs or therapy/dialog media.
  const path = url.pathname.slice(
    new URL("./", self.location.href).pathname.length,
  );
  const key = "./" + (path || "index.html");
  if (!SHELL.includes(key)) return;
  event.respondWith(
    caches
      .open(CACHE)
      .then(
        async (cache) =>
          (await cache.match(new URL(key, self.location.href))) ||
          fetch(event.request),
      ),
  );
});
