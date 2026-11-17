const PUBLIC_CACHE='noche-retos-fase2a-public-v5',PRIVATE_CACHE='noche-retos-fase2a-host-v5';
// La instalación pública nunca descarga catálogo, conductor ni reglas privadas.
const FILES=['./publico.html','./estilos.css','./navidad.css','./escenario.css','./equipos.css','./contest.css','./icon.svg','./src/teams-show.js','./src/contest-show.js','./src/wheel.js','./src/clock-sync.js','./src/lan-public.js','./src/publico.js','./src/effects.js','./assets/escenario.webp','./assets/titulares.otf','./assets/texto.otf','./assets/texto-negrita.otf'];
self.addEventListener('install',event=>event.waitUntil(caches.open(PUBLIC_CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('noche-retos-')&&![PUBLIC_CACHE,PRIVATE_CACHE].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/'))return;
 event.respondWith((async()=>{const client=event.clientId?await self.clients.get(event.clientId):null,publicClient=client&&new URL(client.url).pathname.endsWith('/publico.html'),privatePath=u.pathname.startsWith('/catalogo/')||/\/src\/(navigation|conductor|contest-host|contest-core|teams-core|core|game-model|offline-host|lan-host|show)\.js$/.test(u.pathname);
 if(publicClient&&privatePath)return new Response('Recurso privado',{status:403});
 const name=privatePath||u.pathname.endsWith('/conductor-nav.css')||u.pathname.endsWith('/index.html')||u.pathname==='/'?PRIVATE_CACHE:PUBLIC_CACHE;
 return (await (await caches.open(name)).match(event.request,{ignoreSearch:true}))||fetch(event.request);
 })());
});
