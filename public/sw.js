/**
 * Service worker Mission Cosmos — cache léger, priorités en ligne.
 *
 * - Pas de prétention hors-ligne complète (GLB / audio lourds non précachés).
 * - Ne touche jamais IndexedDB / localStorage (sauvegardes intactes).
 * - Activation différée : pas de skipWaiting agressif pendant une mission.
 * - Version via ?v= à l’enregistrement (évite mélange de shells).
 */
/* eslint-disable no-restricted-globals */

const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const SHELL_CACHE = `mc-shell-${VERSION}`;
const RUNTIME_CACHE = 'mc-runtime-v1';

/** App shell / JS / CSS — pas les assets 3D/audio volumineux. */
const PRECACHE_URLS = [
  './',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(
        PRECACHE_URLS.map(async (relative) => {
          const href = new URL(relative, self.registration.scope).href;
          try {
            await cache.add(href);
          } catch {
            // Ne bloque pas l’install PWA si une ressource optionnelle manque.
          }
        }),
      );
      // Pas de self.skipWaiting() ici : évite un swap de version mid-mission.
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('mc-shell-') && key !== SHELL_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * Navigation HTML : network-first (màj), fallback cache.
 * /_next/static : cache-first (hashés).
 * /assets/ modèles/audio/textures : cache-first runtime, sans précache massif.
 * Autre : network, puis cache si dispo.
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const scope = self.registration.scope;
  if (!url.href.startsWith(scope)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  const path = url.pathname;
  if (path.includes('/_next/static/')) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  if (path.includes('/assets/')) {
    // Cache runtime à la demande — pas de précache de tout le pack 3D
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const fallback = await caches.match(request);
    if (fallback) {
      return fallback;
    }
    return new Response('Hors connexion', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response('Hors connexion', { status: 503, statusText: 'Offline' });
  }
}
