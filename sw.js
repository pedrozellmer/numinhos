// Service Worker minimalista — controla cache e força atualizações
// Estratégia: "network first" pra HTML e JS (sempre busca do servidor),
// "cache first" só pra fontes externas (Google Fonts).

const CACHE_NAME = 'numinhos-runtime';

self.addEventListener('install', (event) => {
  // Ativa imediatamente quando nova versão é instalada
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Toma controle de todas as abas abertas imediatamente
  event.waitUntil(
    (async () => {
      // Apaga TODOS os caches antigos
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
      await self.clients.claim();
      // Avisa o cliente pra recarregar (pega versão nova)
      const clientsList = await self.clients.matchAll({ type: 'window' });
      for (const client of clientsList) {
        client.postMessage({ type: 'SW_ACTIVATED' });
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Telemetria e APIs — NÃO intercepta, deixa o browser enviar direto
  // (sendBeacon + SW podem conflitar; e POST não deve ser cacheado).
  if (url.pathname.startsWith('/api/')) return;

  // Fontes externas — cache agressivo (não mudam)
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(hit =>
          hit || fetch(event.request).then(resp => {
            cache.put(event.request, resp.clone());
            return resp;
          })
        )
      )
    );
    return;
  }

  // Própria origem: network-first, sem cachear (pega sempre o mais recente)
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() =>
        caches.match(event.request) // fallback offline
      )
    );
    return;
  }
});
