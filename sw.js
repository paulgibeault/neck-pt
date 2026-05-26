/**
 * Neck PT Companion - Service Worker
 *
 * Strategy: Cache-first with network fallback.
 * All core app modules and the first illustration frame (vector-1.png) for
 * each exercise are pre-cached on install, guaranteeing a fully offline-capable
 * PWA from the very first session — no internet required during workouts.
 */

const CACHE_NAME = "neck-pt-v4";

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
  // Skip non-GET requests and cross-origin fetches (e.g., Google Fonts).
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) {
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
        // so subsequent visits are fully offline.
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      }).catch(() => {
        // Return nothing on network failure — the browser will show its own
        // offline error page for HTML navigation; sub-resources just fail silently.
        return new Response("", { status: 503, statusText: "Offline" });
      });
    })
  );
});
