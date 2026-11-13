const CACHE='fsg-random-events-v1';
const SHELL=['./','./index.html','./homepage-style.css','./random-events-style.css','./generator.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png',
'./events/weather.js','./events/crops-fields.js','./events/machinery.js','./events/animals.js','./events/supplies-storage.js','./events/finance.js','./events/contracts-neighbours.js','./events/dealership.js','./events/challenges.js','./events/community.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('fsg-random-events-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL('./',self.registration.scope).pathname))return;
 event.respondWith((async()=>{try{const response=await fetch(request);if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone());}return response;}catch(err){return (await caches.match(request))||Response.error();}})());});
