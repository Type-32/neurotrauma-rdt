// Kill switch for the service worker earlier versions of this site installed.
// Browsers that still have it check this file for updates; this version clears
// every cache, unregisters itself and reloads open tabs, so they get the live site.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
	event.waitUntil((async () => {
		for (const key of await caches.keys()) await caches.delete(key)
		await self.registration.unregister()
		for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url)
	})())
})
