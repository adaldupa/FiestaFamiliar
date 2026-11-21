import test from 'node:test';
import assert from 'node:assert/strict';
import {readNavigation,changeNavigation,SECTIONS,TEAM_STEPS,renderNavigation} from '../src/navigation.js';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
test('navegación local: seis secciones, una selección y tres pasos internos',()=>{
 const store=storage(),v=readNavigation(store);
 assert.equal(SECTIONS.length,6);assert.equal(TEAM_STEPS.length,3);assert.equal(v.section,'inicio');
 assert.equal((renderNavigation(v).match(/aria-current=/g)||[]).length,1);
 for(const [section] of SECTIONS){assert.ok(changeNavigation(v,{section},store));assert.equal(readNavigation(store).section,section);}
 assert.ok(changeNavigation(v,{section:'equipos',step:'revision'},store));assert.deepEqual(readNavigation(store),v);
});
test('rutas desconocidas, datos corruptos y almacenamiento bloqueado no impiden navegar',()=>{
 assert.equal(readNavigation({getItem:()=>'{'}).section,'inicio');
 assert.equal(readNavigation({getItem:()=>'{"section":"secreto","step":"otro"}'}).step,'configuracion');
 const v=readNavigation(storage()),before={...v};assert.equal(changeNavigation(v,{section:'otro'}),false);assert.deepEqual(v,before);
 assert.ok(changeNavigation(v,{section:'concurso'},{setItem:()=>{throw Error('bloqueado');}}));assert.equal(v.section,'concurso');
});
