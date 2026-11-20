// Service Worker para PWA Tesorería
const SW_VERSION = 'v1.3.0-fast-20261120';
const CACHE_NAME = `tesoreria-cache-${SW_VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// El listener de fetch existe para cumplir el estándar de PWA instalable de Chromium/Edge/Safari,
// pero no intercepta las peticiones con respondWith() para que Next.js vuele a velocidad nativa
// con HTTP/2 y React Server Components streaming sin buffering ni demoras de red.
self.addEventListener('fetch', () => {
  // Pasa directamente al navegador de forma nativa
});
