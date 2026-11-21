import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ensurePrivateOffline} from '../src/offline-host.js';

test('una caché completa se verifica sin servidor y solo se intenta la red una vez',async()=>{
 const oldFetch=globalThis.fetch,oldCaches=globalThis.caches,files=new Map();let requests=0,offline=false;
 globalThis.caches={open:async()=>({put:async(path,response)=>files.set(path,response.clone()),match:async path=>files.get(path)?.clone()})};
 globalThis.fetch=async()=>{requests++;if(offline)throw new TypeError('Servidor apagado');return new Response('recurso local');};
 try{assert.equal(await ensurePrivateOffline(null),true);assert.ok(files.size>30);offline=true;requests=0;assert.equal(await ensurePrivateOffline(null),true);assert.equal(requests,1);}
 finally{globalThis.fetch=oldFetch;globalThis.caches=oldCaches;}
});

test('una caché incompleta no se declara preparada cuando falla la red',async()=>{
 const oldFetch=globalThis.fetch,oldCaches=globalThis.caches;
 globalThis.caches={open:async()=>({put:async()=>{},match:async()=>undefined})};
 globalThis.fetch=async()=>{throw new TypeError('Sin red');};
 try{await assert.rejects(ensurePrivateOffline(null),/No se pudo preparar/);}
 finally{globalThis.fetch=oldFetch;globalThis.caches=oldCaches;}
});

test('un fallo de autenticación LAN no se oculta con recursos privados cacheados',async()=>{
 const oldCaches=globalThis.caches;let cacheReads=0;
 globalThis.caches={open:async()=>({match:async()=>{cacheReads++;return new Response('privado');}})};
 try{await assert.rejects(ensurePrivateOffline({privateFetch:async()=>{throw new Error('Código requerido');}}),/Código requerido/);assert.equal(cacheReads,0);}
 finally{globalThis.caches=oldCaches;}
});
