const CACHE_NAME = 'multistreamz-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through for now to ensure installation works
  event.respondWith(fetch(event.request));
});

