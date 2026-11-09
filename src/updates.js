export async function setupUpdates({ base, beforeReload, canShow }) {
  let registration;
  let dismissed = null;
  let updating = false;
  let reloading = false;
  let checking = false;
  let lastCheck = 0;
  let hadController = !!navigator.serviceWorker.controller;
  const panel = document.createElement("aside");
  panel.id = "app-update";
  panel.className = "app-update";
  panel.hidden = true;
  panel.setAttribute("aria-label", "App aktualisieren");
  panel.innerHTML =
    '<p role="status"><strong>Neue Version verfügbar</strong></p><p>Die App wird neu gestartet. Nicht gespeicherte Eingaben gehen verloren; lokale Dateien danach gegebenenfalls erneut verbinden.</p><div class="actions"><button class="primary" data-update="apply">Jetzt aktualisieren</button><button data-update="later">Später</button></div><p class="update-result" role="status"></p>';
  document.body.append(panel);
  function refresh() {
    panel.hidden = !(
      registration?.waiting &&
      navigator.serviceWorker.controller &&
      registration.waiting !== dismissed &&
      canShow()
    );
  }
  function watch(worker) {
    worker?.addEventListener("statechange", refresh);
    refresh();
  }
  async function check(force = false) {
    refresh();
    if (
      !registration ||
      !navigator.onLine ||
      document.hidden ||
      checking ||
      (!force && Date.now() - lastCheck < 60000)
    )
      return;
    checking = true;
    lastCheck = Date.now();
    try {
      await registration.update();
    } catch {
      /* Offline or failed download: keep using the installed version. */
    } finally {
      checking = false;
      refresh();
    }
  }
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) {
      hadController = true;
      refresh();
      return;
    }
    if (reloading) return;
    reloading = true;
    beforeReload();
    location.reload();
  });
  panel.querySelector('[data-update="later"]').onclick = () => {
    dismissed = registration.waiting;
    refresh();
  };
  panel.querySelector('[data-update="apply"]').onclick = () => {
    if (updating || !registration.waiting) return;
    updating = true;
    panel
      .querySelectorAll("button")
      .forEach((button) => (button.disabled = true));
    panel.querySelector(".update-result").textContent =
      "Aktualisierung wird gestartet …";
    beforeReload();
    registration.waiting.postMessage({ type: "ACTIVATE_UPDATE" });
    setTimeout(() => {
      if (reloading) return;
      updating = false;
      panel
        .querySelectorAll("button")
        .forEach((button) => (button.disabled = false));
      panel.querySelector(".update-result").textContent =
        "Die Aktivierung dauert länger. Bitte erneut versuchen oder die App schliessen und wieder öffnen.";
    }, 15000);
  };
  registration = await navigator.serviceWorker.register(base + "sw.js", {
    updateViaCache: "none",
  });
  registration.addEventListener("updatefound", () =>
    watch(registration.installing),
  );
  watch(registration.installing);
  await check(true);
  window.addEventListener("online", () => check(true));
  document.addEventListener("visibilitychange", () => {
    refresh();
    if (!document.hidden) check();
  });
  setInterval(
    () => {
      if (!document.hidden && canShow()) check(true);
    },
    5 * 60 * 1000,
  );
  return { refresh };
}
