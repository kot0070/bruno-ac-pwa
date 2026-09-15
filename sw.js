/* Bruno AC Estimating — app shell offline cache */
const CACHE = 'bruno-ac-v36';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './sw-register.js',
  './financial-integrity-core.js',
  './navigation-v2.js',
  './navigation-v2.css',
  './workspace-v5.js',
  './workspace-v5.css',
  './service-journal-ux.js',
  './code-rule-registry.js',
  './code-library-ux.js',
  './code-library/texas-hvac-2026.json',
  './catalog-v6.js',
  './ac-calculator.html',
  './ac-calculator.js',
  './ac-calculator-engine.js',
  './ac-calculator-ux.js',
  './ac-calculator-review-ux.js',
  './ac-calculator.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res && res.ok && (req.mode === 'navigate' || SHELL.some((p) => url.pathname.endsWith(p.replace('./', '/')) || url.pathname.endsWith(p.replace('./', ''))))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      if (req.mode === 'navigate') {
        return net.then((r) => r || cached || caches.match('./index.html'));
      }
      return cached || net;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
