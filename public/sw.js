/* Murmur service worker — offline-first shell caching.
 *
 * The app itself is already local-first (data lives in IndexedDB), so the SW
 * only needs to keep the app shell (HTML/JS/CSS) available offline. Strategy:
 *   - navigations: network-first, fall back to the cached page, then /app.
 *   - static assets (same-origin): stale-while-revalidate.
 *   - Google Apps Script calls are never cached (always hit the network).
 */
const VERSION = "murmur-v1";
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const PRECACHE = ["/", "/app", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only handle our own origin; let Google Apps Script / other hosts pass through.
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first with an offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match("/app")) ||
            (await caches.match("/offline")) ||
            Response.error()
          );
        })
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (["style", "script", "font", "image"].includes(request.destination)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && res.status === 200) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
