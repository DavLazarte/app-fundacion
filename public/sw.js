// Service Worker para PWA Tesorería
// Incrementá esta versión en cada despliegue para forzar actualización inmediata
const SW_VERSION = 'v1.2.0-20261119-r1';
const CACHE_NAME = `tesoreria-cache-${SW_VERSION}`;

self.addEventListener('install', (event) => {
  // Activa de inmediato el nuevo Service Worker sin esperar a que se cierren pestañas o la PWA
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Elimina cualquier caché de versiones anteriores automáticamente
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Purgando caché anterior:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Reclama el control de todos los clientes abiertos de inmediato
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 1. Las llamadas a la API y métodos no GET NUNCA se cachean (datos financieros en tiempo real)
  if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
    return;
  }

  // 2. Estrategia Network-First: Siempre busca la versión más reciente en el servidor.
  // Si no hay red, recurre a la copia local.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
