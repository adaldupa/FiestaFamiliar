const CACHE='noche-retos-mecanicas-host-v22';
const FILES=['./src/manual-rules.js','./src/reward-show.js','./src/reward-config.js','./src/presentation-changes.js','./src/time-input.js','./src/presentation-copy.js','./src/closure-core.js','./src/closure-host.js','./catalogo/duelo-generaciones.json','./src/full-engines.js','./src/full-host.js','./src/approved-catalog.js','./catalogo/catalogo-definitivo.json','./','./index.html','./library.css','./src/library-core.js','./src/library-host.js','./catalogo/fichas-publicas-fase2b.json','./conductor-nav.css','./src/navigation.js','./src/conductor.js','./src/teams-core.js','./src/contest-core.js','./src/round-engine.js','./src/contest-host.js','./src/game-model.js','./src/wheel.js','./src/lan-host.js','./src/offline-host.js','./catalogo/actor-fase2.json'];
export async function ensurePrivateOffline(lan){
 const cache=await caches.open(CACHE);
 let cachedOnly=false;
 for(const path of FILES){
  let response;
  if(!cachedOnly)try{response=await(lan?lan.privateFetch(path):fetch(path,{cache:'reload'}));}catch(error){if(lan)throw error;cachedOnly=true;}
  response??=await cache.match(path);
  if(!response?.ok)throw Error('No se pudo preparar '+path);
  await cache.put(path,response);
 }
 return true;
}
