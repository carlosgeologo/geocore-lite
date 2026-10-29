const CACHE_NAME = 'jireth-geocore-v2026';
const assetsToCache = [
  './index.html',
  './manifest.json',
  './1792941546023.jpg'
];

// Fase de Instalación: Descarga y almacena los recursos estáticos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Almacenando archivos en caché de campo');
        return cache.addAll(assetsToCache);
      })
      .catch(err => console.warn('[Service Worker] Error al cachear assets:', err))
  );
  self.skipWaiting();
});

// Fase de Activación: Limpia cachés antiguas obsoletas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clientsClaim();
});

// Fase de Interceptación (Fetch): Sirve la app offline o busca en la red si hay señal
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si el recurso está en caché local, lo devuelve de inmediato
        if (cachedResponse) {
          return cachedResponse;
        }
        // Si no está en caché, intenta buscarlo en la red
        return fetch(event.request).catch(() => {
          // Si falla la red y es una navegación de página, devuelve el index.html principal
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
