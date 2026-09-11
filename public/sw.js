const CACHE_NAME = "jal-suraksha-v4";
const APP_SHELL = "/";
const PRECACHE = ["/", "/dashboard", "/flood-risk", "/river-map"];

const OFFLINE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Offline | JAL-SURAKSHA</title>
    <style>
      body { font-family: system-ui, sans-serif; background: #0b1d33; color: #e2e8f0;
        display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
      .card { max-width: 420px; padding: 24px; }
      h1 { color: #34d399; font-size: 20px; }
      button { margin-top: 16px; padding: 10px 18px; border: 0; border-radius: 8px;
        background: #0d9488; color: white; font-weight: 600; cursor: pointer; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>You&apos;re offline</h1>
      <p>JAL-SURAKSHA needs a connection to load live river data. Check your network and try again.</p>
      <button onclick="location.reload()">Retry</button>
    </div>
  </body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function shouldCache(response) {
  return response && response.ok && response.type === "basic";
}

async function cacheFirst(event) {
  const cached = await caches.match(event.request);
  if (cached) return cached;
  try {
    const response = await fetch(event.request);
    if (shouldCache(response)) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
    }
    return response;
  } catch {
    return null;
  }
}

/**
 * Navigations: network-first. If the network fails (offline, server 5xx, or
 * flaky connection) fall back to the cached target, then the cached app shell,
 * then a friendly offline document. Never resolve with a raw 503.
 */
async function networkFirstNav(event) {
  try {
    const response = await fetch(event.request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      return response;
    }
    throw new Error(`Bad status ${response.status}`);
  } catch {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    const shell = await caches.match(APP_SHELL);
    if (shell) return shell;
    return new Response(OFFLINE_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Live data / API: always network, but fall back to a clean 503 JSON so the
  // UI can show its "simulation" state instead of a crash.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: "offline", detail: "Upstream unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNav(event));
    return;
  }

  // Assets, RSC payloads, scripts, styles: stale-while-revalidate. Never let a
  // failed revalidation reject event.respondWith.
  event.respondWith(
    cacheFirst(event).then((response) => {
      if (response) return response;
      return new Response("", { status: 404 });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});