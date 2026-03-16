// ═══════════════════════════════════════════════
//  Learn Letters — Service Worker (offline support)
//  Corrigido para GitHub Pages subdiretório
// ═══════════════════════════════════════════════
const CACHE   = 'learn-letters-v3';
const BASE    = '/Aprenda-Letras';

const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/css/style.css',
  BASE + '/js/levels.js',
  BASE + '/js/sound.js',
  BASE + '/js/game.js',
  BASE + '/icons/icon-192.png',
  BASE + '/icons/icon-512.png',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      });
    }).catch(function() {
      return caches.match(BASE + '/index.html');
    })
  );
});
