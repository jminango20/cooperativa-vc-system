// Service Worker - Semear Wallet
const CACHE_NAME = 'semear-wallet-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/scanner.css',
  '/js/app.js',
  '/js/wallet.js',
  '/js/scanner.js',
  '/js/vc-verifier.js',
  '/manifest.json',
  '/assets/logo-semear.svg'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Cache First Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
