// Install → always activate new version immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate → take control of all open pages instantly
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch handler (kept empty for now — no caching)
self.addEventListener("fetch", () => {});
