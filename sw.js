/**
 * Neck PT Companion - Service Worker
 *
 * Strategy: Cache-first with network fallback.
 * All core app modules and the first illustration frame (vector-1.png) for
 * each exercise are pre-cached on install, guaranteeing a fully offline-capable
 * PWA from the very first session — no internet required during workouts.
 */

const CACHE_NAME = "neck-pt-v7";

// Core app shell — always pre-cached on install.
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-192-maskable.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  // ES modules (src/ subdirectory)
  "./src/app.js",
  "./src/ui.js",
  "./src/store.js",
  "./src/engine.js",
  "./src/session.js",
  "./src/data.js",
  "./src/audio.js",
  "./src/speech.js",
  "./src/format.js",
];

// First illustration frame for every exercise — pre-cached so the routine
// screen renders immediately offline after the first install.
const EXERCISE_PREFETCH = [
  "exercises/01-seated-upper-trapezius-stretch/vector-1.png",
  "exercises/02-seated-levator-scapulae-stretch/vector-1.png",
  "exercises/03-standing-isometric-cervical-sidebending/vector-1.png",
  "exercises/04-seated-isometric-cervical-rotation/vector-1.png",
  "exercises/05-sternocleidomastoid-stretch/vector-1.png",
  "exercises/06-cervicothoracic-mobilization/vector-1.png",
  "exercises/07-seated-cervical-retraction/vector-1.png",
  "exercises/08-supine-chest-stretch-foam-roll/vector-1.png",
  "exercises/09-standing-median-nerve-glide/vector-1.png",
  "exercises/10-prone-single-arm-shoulder-y/vector-1.png",
  "exercises/11-prone-shoulder-horizontal-abduction/vector-1.png",
];

// Install: pre-cache shell synchronously; exercise images are best-effort.
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Shell must succeed — abort the install if any core asset is missing.
      await cache.addAll(SHELL_ASSETS);
      // Exercise frames are best-effort: don't block the install if a file
      // is missing (e.g., during development with placeholder images).
      await Promise.allSettled(
        EXERCISE_PREFETCH.map((url) =>
          cache.add(url).catch(() => {
            console.warn(`[SW] Could not pre-cache: ${url}`);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up all caches from previous versions.
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin requests; pass through for cross-origin.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Pass through: non-GET, cross-origin, and favicon (doesn't exist in this app).
  if (
    e.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname === "/favicon.ico"
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;

      return fetch(e.request).then((response) => {
        // Only cache valid, same-origin, successful responses.
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        // Dynamically cache exercise assets (additional frames, source photos)
        // so subsequent offline visits can serve them from cache.
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      }).catch(() => {
        // For navigation requests, the browser's built-in offline page is fine.
        // For sub-resources (images, scripts), Response.error() signals a network
        // failure without producing a visible 503 error in the console.
        if (e.request.destination === "document") {
          return caches.match("./index.html");
        }
        return Response.error();
      });
    })
  );
});
