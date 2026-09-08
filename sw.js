'use strict';
const CACHE='trakway-studio-2.0.0-r1';
const FILES=['./','./index.html','./styles.css','./app.js','./core.js','./config.js','./leaflet.js','./leaflet.css','./manifest.webmanifest','./sunbelt-logo.png','./jweds-white.png','./icon-192.png','./icon-512.png','./icon-maskable.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('trakway-studio-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Never cache external map tiles, API responses, location lookups or credentials.
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 const scope=new URL(self.registration.scope);if(!url.pathname.startsWith(scope.pathname))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./index.html',copy)))}return response}).catch(()=>caches.match('./index.html')));return;
 }
 const allowed=FILES.map(p=>new URL(p,scope).pathname);if(!allowed.includes(url.pathname))return;
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)))}return response})));
});
