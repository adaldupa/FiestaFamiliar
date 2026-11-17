const CACHE='noche-retos-fase2a-host-v5';
const FILES=['./','./index.html','./conductor-nav.css','./src/navigation.js','./src/conductor.js','./src/teams-core.js','./src/contest-core.js','./src/contest-host.js','./src/game-model.js','./src/wheel.js','./src/lan-host.js','./src/offline-host.js','./catalogo/actor-fase2.json'];
export async function ensurePrivateOffline(lan){
 const cache=await caches.open(CACHE);
 for(const path of FILES){const response=await(lan?lan.privateFetch(path):fetch(path,{cache:'reload'}));if(!response.ok)throw Error('No se pudo preparar '+path);await cache.put(path,response);}
 return true;
}
