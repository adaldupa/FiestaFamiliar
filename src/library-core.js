// Administración privada. Las operaciones se validan sobre una copia antes de aplicarse.
import {clone,validateGame,validateLibrary,isText} from './game-model.js';
const need=(ok,message)=>{if(!ok)throw Error(message);};
const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const date=n=>new Date(n).toISOString();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const revisionBody=g=>{const x=clone(g);delete x.ruleVersion;return x;};
const rulesBody=g=>{const x=revisionBody(g);delete x.createdAt;delete x.updatedAt;return x;};
export const PERMANENT_ID='roba-y-gana';
export function blankGame(now=Date.now()){
 return {id:uid(),ruleVersion:1,name:'Nuevo minijuego',description:'Descripción pendiente de completar.',category:'Otra',mode:'Representante + equipo',minParticipants:1,maxParticipants:10000,publicRules:'Reglas pendientes de completar.',privateInstructions:'Preparar el reto y respetar la participación voluntaria.',materials:[],seconds:90,scoring:{mode:'fixed',nominal:100,min:0,max:100,pointsPerSuccess:100,approvedException:false,decision:'proposal'},victory:'Completar el reto según las reglas anunciadas.',tie:'Pendiente de acordar antes del evento.',noFinish:'Pendiente de acordar antes del evento.',accessibility:'Participación voluntaria; permitir adaptación sentada sin penalización.',secrets:[],status:'inactive',createdAt:date(now),updatedAt:date(now),representativesBefore:false,preparation:'Preparación pendiente de completar.',steps:['Explicar y acordar las reglas antes de jugar.'],pending:['Validar las reglas antes de activar.'],repeatable:false,permanent:false,implementation:'turns'};
}
function audit(lib,type,detail,now){lib.audit??=[];lib.audit.push({id:uid(),at:date(now),type,detail:clone(detail)});}
function transaction(s,operation){need(s.contest?.library,'La biblioteca todavía no está disponible.');const lib=clone(s.contest.library);const result=operation(lib);validateLibrary(lib);s.contest.library=lib;return result;}
export function saveGame(s,input,{expectedVersion=null,reason='Edición de ficha'}={},now=Date.now()){
 return transaction(s,lib=>{
  const old=lib.games.find(g=>g.id===input.id);need(expectedVersion===null?!old:old?.ruleVersion===expectedVersion,'La ficha cambió en otro dispositivo. Vuelve a abrirla antes de guardar.');
  need(isText(reason,1000),'Indica un motivo de edición.');
  const permanent=input.id===PERMANENT_ID||old?.permanent===true;
  const g=clone({...input,ruleVersion:old?old.ruleVersion+1:1,createdAt:old?.createdAt||date(now),updatedAt:date(now),permanent,repeatable:permanent?true:input.repeatable===true});
  if(permanent)need(g.status!=='archived','Roba y Gana es permanente y no se puede archivar.');
  validateGame(g);if(old)lib.games[lib.games.indexOf(old)]=g;else lib.games.push(g);
  lib.versions.push(clone(g));audit(lib,old?'game_updated':'game_created',{gameId:g.id,version:g.ruleVersion,previousVersion:old?.ruleVersion||null,reason},now);return g;
 });
}
export function duplicateGame(s,id,now=Date.now()){
 const g=s.contest?.library.games.find(g=>g.id===id);need(g,'No existe el minijuego.');
 return saveGame(s,{...clone(g),id:uid(),name:`Copia de ${g.name}`.slice(0,120),permanent:false,status:'inactive'}, {},now);
}
export function changeGameStatus(s,id,status,expectedVersion,now=Date.now()){
 const g=s.contest?.library.games.find(g=>g.id===id);need(g,'No existe el minijuego.');return saveGame(s,{...clone(g),status},{expectedVersion,reason:`Cambiar estado a ${status}`},now);
}
export function restoreGameVersion(s,id,version,expectedVersion,now=Date.now()){
 const lib=s.contest?.library,g=lib?.versions.find(g=>g.id===id&&g.ruleVersion===version);need(g,'No existe esa versión.');
 return saveGame(s,g,{expectedVersion,reason:`Restaurar reglas de v${version}`},now);
}
export function saveCollection(s,{id=uid(),name,gameIds},now=Date.now()){
 return transaction(s,lib=>{
  need(isText(name,120)&&Array.isArray(gameIds)&&gameIds.length>0&&new Set(gameIds).size===gameIds.length,'La colección necesita nombre y minijuegos sin duplicados.');
  const games=gameIds.map(id=>{const g=lib.games.find(g=>g.id===id);need(g&&g.status==='active','Selecciona solamente fichas activas.');return {id:g.id,ruleVersion:g.ruleVersion};});
  lib.collections??=[];const old=lib.collections.find(c=>c.id===id),c={id,name:name.trim(),games,createdAt:old?.createdAt||date(now),updatedAt:date(now)};
  if(old)lib.collections[lib.collections.indexOf(old)]=c;else lib.collections.push(c);audit(lib,'collection_saved',{collectionId:id,versions:games},now);return c;
 });
}
export function exportLibrary(s){const lib=clone(s.contest.library);validateLibrary(lib);return {kind:'noche-retos-library',schemaVersion:1,exportedAt:date(Date.now()),library:lib};}
export function parseLibraryImport(raw){
 need(raw?.kind==='noche-retos-library'&&raw.schemaVersion===1,'Archivo incompatible. Se esperaba una biblioteca exportada por esta aplicación.');
 const lib=clone(raw.library);validateLibrary(lib);return lib;
}
// La vista previa describe cada conflicto; importar nunca elimina fichas, versiones ni colecciones.
export function previewLibraryImport(current,incoming){
 validateLibrary(incoming);if(current)validateLibrary(current);
 const additions=[],conflicts=[],unchanged=[];
 for(const g of incoming.games){const old=current?.games.find(x=>x.id===g.id);if(!old)additions.push(g.id);else(same(rulesBody(old),rulesBody(g))?unchanged:conflicts).push(g.id);}
 return {additions,conflicts,unchanged};
}
export function mergeLibrary(s,incoming,{updateConflicts=false,reason='Importación confirmada'}={},now=Date.now()){
 validateLibrary(incoming);
 return transaction(s,lib=>{
  const summary=previewLibraryImport(lib,incoming);
  need(!summary.conflicts.length||updateConflicts,'Hay IDs existentes. Confirma expresamente las actualizaciones antes de importar.');
  const mapping=new Map();
  // Preservar todas las revisiones entrantes. Colisiones distintas reciben una versión nueva.
  for(const id of new Set(incoming.versions.map(g=>g.id))){
   const incomingVersions=incoming.versions.filter(g=>g.id===id).sort((a,b)=>a.ruleVersion-b.ruleVersion);
   for(const revision of incomingVersions){
    const old=lib.versions.find(g=>g.id===id&&g.ruleVersion===revision.ruleVersion);
    const identical=lib.versions.find(g=>g.id===id&&same(g,revision))||(old&&lib.versions.find(g=>g.id===id&&same(revisionBody(g),revisionBody(revision))));
    if(identical){mapping.set(`${id}:${revision.ruleVersion}`,identical);continue;}
    const version=old?Math.max(...lib.versions.filter(g=>g.id===id).map(g=>g.ruleVersion))+1:revision.ruleVersion;
    const imported=clone({...revision,ruleVersion:version});validateGame(imported);lib.versions.push(imported);mapping.set(`${id}:${revision.ruleVersion}`,imported);
   }
  }
  for(const input of incoming.games){
   const old=lib.games.find(g=>g.id===input.id);if(old&&summary.unchanged.includes(input.id))continue;
   let g=clone(mapping.get(`${input.id}:${input.ruleVersion}`));
   if(old){
    const version=Math.max(...lib.versions.filter(v=>v.id===g.id).map(v=>v.ruleVersion))+1;
    g={...g,ruleVersion:version,createdAt:old.createdAt,updatedAt:date(now)};
    if(old.permanent||g.id===PERMANENT_ID){g.permanent=true;g.repeatable=true;need(g.status!=='archived','No se puede archivar el juego permanente.');}
    lib.versions.push(clone(g));lib.games[lib.games.indexOf(old)]=g;
   }else lib.games.push(g);
  }
  lib.collections??=[];
  for(const c of incoming.collections||[]){
   const mapped={...clone(c),games:c.games.map(g=>{const v=mapping.get(`${g.id}:${g.ruleVersion}`);need(v,'Colección importada con referencias inválidas.');return {id:v.id,ruleVersion:v.ruleVersion};})};
   const old=lib.collections.find(x=>x.id===c.id);
   if(!old)lib.collections.push(mapped);else if(!same(old,mapped))lib.collections.push({...mapped,id:uid(),name:`${mapped.name} (importada)`.slice(0,120)});
  }
  audit(lib,'library_imported',{...summary,reason},now);return summary;
 });
}
export function filterGames(lib,{query='',category='',status=''}={}){
 const q=query.trim().toLocaleLowerCase('es');return (lib?.games||[]).filter(g=>(!q||`${g.name} ${g.description}`.toLocaleLowerCase('es').includes(q))&&(!category||g.category===category)&&(!status||g.status===status));
}
export function playableRevisions(lib){
 // Las dinámicas nuevas se catalogan en 2B; sus motores pertenecen a 2C.
 return (lib?.games||[]).filter(g=>g.status==='active').flatMap(current=>{
  const candidates=lib.versions.filter(g=>g.id===current.id&&g.status==='active'&&['fixed','manual'].includes(g.scoring.mode)&&g.implementation!=='planned');
  const g=candidates.sort((a,b)=>b.ruleVersion-a.ruleVersion)[0];return g?[{id:g.id,ruleVersion:g.ruleVersion,name:current.name,previous:g.ruleVersion!==current.ruleVersion,versions:candidates.map(v=>({ruleVersion:v.ruleVersion,name:v.name}))}]:[];
 });
}

// Solo plantillas públicas distribuidas con el código. Los campos privados nacen localmente.
export function parsePublicCatalogSeed(raw){
 need(raw?.kind==='noche-retos-public-templates'&&raw.schemaVersion===1&&Array.isArray(raw.games),'Plantillas públicas incompatibles.');
 const allowed=['id','ruleVersion','name','description','category','mode','minParticipants','maxParticipants','publicRules','materials','seconds','scoring','victory','tie','noFinish','accessibility','status','createdAt','updatedAt','representativesBefore','preparation','steps','pending','repeatable','permanent','implementation'];
 const games=raw.games.map(input=>{
  need(input&&typeof input==='object'&&!Object.hasOwn(input,'privateInstructions')&&!Object.hasOwn(input,'secrets')&&!Object.hasOwn(input.scoring||{},'target'),'La plantilla pública no debe contener campos privados.');
  const g=Object.fromEntries(allowed.filter(key=>Object.hasOwn(input,key)).map(key=>[key,clone(input[key])]));
  return validateGame({...g,privateInstructions:'Sin instrucciones privadas. Complétalas localmente si son necesarias.',secrets:[]});
 });
 return validateLibrary({schemaVersion:1,games,versions:clone(games),collections:[],audit:[]});
}
