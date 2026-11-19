// Service worker: guarda o app no aparelho para abrir rápido e funcionar sem internet.
// A página sempre tenta a versão nova primeiro (para receber atualizações) e usa a cópia guardada se estiver offline.
const CACHE = 'logo3d-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const save = (res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  };
  if (req.mode === 'navigate') {
    // página: rede primeiro, cópia guardada se estiver sem internet
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))));
    return;
  }
  // arquivos (app.js tem a versão no nome, então nunca fica velho): cópia guardada primeiro
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then(save)));
});
