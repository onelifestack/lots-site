// Lots web: keeps the app's own files so it opens offline. It never touches anything outside /app/.
const CACHE = 'lots-app-v1'
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/app/', '/app/manifest.webmanifest', '/app/icon-192.png'])).then(() => self.skipWaiting())) })
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url)
  if (e.request.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith('/app/')) return
  // Stale-while-revalidate: open instantly from the cache, refresh it in the background.
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(e.request)
    const fresh = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r }).catch(() => hit)
    return hit || fresh
  }))
})
