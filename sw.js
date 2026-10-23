const CACHE = 'big-vinci-v2';
const ASSETS = [
  "./",
  "favicon.ico",
  "fonts/dm-mono-400-normal.woff2",
  "fonts/dm-mono-500-normal.woff2",
  "fonts/dm-sans-400-normal.woff2",
  "fonts/dm-sans-500-normal.woff2",
  "fonts/dm-sans-600-normal.woff2",
  "fonts/dm-sans-700-normal.woff2",
  "fonts/playfair-display-500-italic.woff2",
  "fonts/playfair-display-500-normal.woff2",
  "fonts/playfair-display-600-italic.woff2",
  "fonts/playfair-display-600-normal.woff2",
  "icons/any-16.png",
  "icons/any-192.png",
  "icons/any-32.png",
  "icons/any-48.png",
  "icons/any-512.png",
  "icons/apple-touch-icon.png",
  "icons/icon.svg",
  "icons/maskable-192.png",
  "icons/maskable-512.png",
  "img/g1.webp",
  "img/g2.webp",
  "img/g3.webp",
  "img/hero.webp",
  "img/impact.webp",
  "index.html",
  "manifest.webmanifest"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // external links (portfolio) go to the network

  // Pages: network first so updates show up, fall back to cache when offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('index.html', copy));
        return res;
      }).catch(() => caches.match('index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Assets: cache first, then network (and remember it)
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
