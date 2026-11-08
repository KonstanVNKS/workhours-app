// =====================================================================================
// sw.js — "service worker": keeps a copy of the app's files so it opens without internet.
// It serves the saved copy instantly and fetches a fresh one in the background,
// so an update you publish shows up the next time the app is opened.
// ► If an update doesn't seem to arrive, bump the number in CACHE.
// =====================================================================================
const CACHE = "workhours-v3";
const FILES = [
  "./", "index.html", "aide.html", "style.css", "i18n.js", "model.js", "csv.js", "app.js", "manifest.webmanifest",
  "icons/icon.svg", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req)
        .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => null);
      if (cached) { e.waitUntil(fresh); return cached; }
      return (await fresh) || (await cache.match("index.html")) || Response.error();
    }),
  );
});
