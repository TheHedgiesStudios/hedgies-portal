// public/sw.js

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// KEEP THE SERVICE WORKER ALIVE:
// Chrome stops SWs that do nothing.
// This empty fetch listener ensures it stays active.
self.addEventListener("fetch", () => {});
navigator.serviceWorker.register('/dashboard/sw.js');
