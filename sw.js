// ═══════════════════════════════════════════════
//  Learn Letters — Service Worker (offline support)
// ═══════════════════════════════════════════════
const CACHE = 'learn-letters-v2';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/levels.js',
  '/js/sound.js',
  '/js/game.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Instala e cacheia todos os arquivos
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Limpa caches antigos
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k)   { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Serve do cache primeiro, depois tenta rede
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        // Cacheia novas requisições dinamicamente
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      });
    }).catch(function() {
      // Offline e não está no cache — retorna index.html
      return caches.match('/index.html');
    })
  );
});
