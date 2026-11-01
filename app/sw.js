// Lots web: keeps the app's own files so it opens offline. It never touches anything outside /app/.
// The build step stamps the build hash into the cache name below so every release has a different worker file; that is how an open page learns an update is waiting.
const CACHE = 'lots-app-8d0a8076f7'
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/app/', '/app/manifest.webmanifest', '/app/icon-192.png']))) })
// A new version waits until the page says so (the "Reload" button), so nothing changes under an open session.
self.addEventListener('message', (e) => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting() })
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
