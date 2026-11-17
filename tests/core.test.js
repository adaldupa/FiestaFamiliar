import {rotationFor,indexAtRotation,presentationMode} from '../src/wheel.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PRIVATE_KEY,PUBLIC_KEY,rankTeam,initialSession,copy,drawTeams,drawChallenge,award,undo,remaining,toggleTimer,selectRepresentatives,reveal,publicSnapshot,isPresenting,startOpening,validateCatalog,validateSession,saveSession,loadSession,materialsList} from '../src/core.js';
const catalog=JSON.parse(await readFile(new URL('../catalogo/juegos.json',import.meta.url)));
function session(){const s=initialSession(catalog);s.people.forEach((p,i)=>{p.name=`Persona ${i+1}`;p.group=['A','B','C'][i%3];});s.teams=drawTeams(s.people);s.phase='teams';return s;}
function rng(seed){return ()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);}
function round(s){drawChallenge(s);const reps=Object.fromEntries(s.teams.map(t=>[t.id,[...t.members].sort((a,b)=>(s.appearances[a]||0)-(s.appearances[b]||0))[0]]));selectRepresentatives(s,reps);reveal(s);return Object.fromEntries(s.teams.map((t,i)=>[t.id,i*25]));}
class Storage{data=new Map();getItem(k){return this.data.get(k)??null;}setItem(k,v){this.data.set(k,v);}removeItem(k){this.data.delete(k);}}
test('1000 sorteos: 17 personas únicas, tamaños exactos y quinto equipo variable',()=>{const people=session().people;const fifths=new Set();for(let i=1;i<=1000;i++){const ts=drawTeams(people,rng(i*4517));assert.deepEqual(ts.map(t=>t.members.length).sort(),[4,4,4,5]);assert.equal(new Set(ts.flatMap(t=>t.members)).size,17);fifths.add(ts.findIndex(t=>t.members.length===5));for(const group of ['A','B','C']){const counts=ts.map(t=>t.members.filter(id=>people.find(p=>p.id===id).group===group).length);assert.ok(Math.max(...counts)-Math.min(...counts)<=1);}}assert.equal(fifths.size,4);});
test('rechaza registro incompleto o nombres ambiguos',()=>{const s=session();assert.throws(()=>drawTeams(s.people.slice(1)));s.people[0].name='';assert.throws(()=>drawTeams(s.people));s.people[0].name=s.people[1].name.toUpperCase();assert.throws(()=>drawTeams(s.people));});
test('los doce retos salen sin repetir y no se sobrescribe un activo',()=>{const s=session();const seen=new Set();for(let i=0;i<12;i++){drawChallenge(s);assert.throws(()=>drawChallenge(s));assert.ok(!seen.has(s.active));seen.add(s.active);s.completed.push(s.active);s.active=null;}assert.equal(seen.size,12);assert.throws(()=>drawChallenge(s));});
test('los omitidos no se sortean; pueden recuperarse',()=>{const s=session();s.skipped=s.catalog.slice(0,11).map(g=>g.id);assert.equal(drawChallenge(s).id,s.catalog[11].id);s.active=null;s.skipped=[];assert.ok(drawChallenge(s));});
test('representante no puede repetir si otro ha tenido menos oportunidades, salvo adaptación',()=>{const s=session();drawChallenge(s);const reps=Object.fromEntries(s.teams.map(t=>[t.id,t.members[0]]));s.appearances[s.teams[0].members[0]]=1;assert.throws(()=>selectRepresentatives(s,reps));selectRepresentatives(s,reps,true);reveal(s);assert.equal(s.phase,'rules');});
test('no se puntúa ni revela un reto sin representantes',()=>{const s=session();drawChallenge(s);assert.throws(()=>award(s,{t1:100,t2:100,t3:100,t4:100}));assert.throws(()=>reveal(s));});
test('puntos con límites configurables; deshacer restaura puntos, participaciones y ronda',()=>{const s=session();const points=round(s),id=s.active;assert.throws(()=>award(s,{...points,t1:101}));assert.throws(()=>award(s,{...points,t1:-1}));assert.throws(()=>award(s,{...points,t1:0.5}));assert.throws(()=>award(s,{...points,t1:NaN}));award(s,points,'Criterio acordado');assert.equal(s.teams[3].score,75);assert.equal(s.completed.length,1);assert.equal(s.history.length,1);assert.equal(Object.values(s.appearances).reduce((a,b)=>a+b,0),4);undo(s);assert.equal(s.active,id);assert.equal(s.teams[3].score,0);assert.equal(s.completed.length,0);assert.deepEqual(s.appearances,{});award(s,points);assert.equal(s.teams[3].score,75);});
test('reglas especiales requieren aprobación y pueden permitir negativos',()=>{const c=copy(catalog);c[0].maxPoints=200;assert.throws(()=>validateCatalog(c));c[0].specialApproved=true;c[0].allowNegative=true;validateCatalog(c);const s=session();s.catalog=c;s.blind=false;s.completed=c.slice(1).map(g=>g.id);const pts=round(s);award(s,{...pts,t1:-150});assert.equal(s.teams[0].score,-150);});
test('cronómetro pausa sin perder tiempo, continúa y vence después de una recarga',()=>{const s=session();s.timer.remaining=90;toggleTimer(s,1000);assert.equal(remaining(s.timer,11000),80);toggleTimer(s,11000);assert.equal(remaining(s.timer,80000),80);toggleTimer(s,21000);const restored=copy(s);assert.equal(remaining(restored.timer,51000),50);assert.equal(remaining(restored.timer,500000),0);});
test('persistencia completa, incluidos catálogo editado e historial deshacible',()=>{const store=new Storage(),s=session();s.catalog[0].seconds=123;const pts=round(s);award(s,pts,'nota privada');saveSession(store,s);const restored=loadSession(store);assert.deepEqual(restored,s);undo(restored);assert.equal(restored.teams[3].score,0);assert.equal(restored.catalog[0].seconds,123);});
test('privacidad: pistas canario, notas, bombos y preparación no atraviesan la proyección pública',()=>{const s=session();s.catalog.forEach(g=>{g.secrets=['SECRETO_CANARIO'];g.preparation='PREPARACION_CANARIO';g.extraPrivate='EXTRA_CANARIO';});s.people[0].group='CAPACIDAD_CANARIO';s.notes='NOTA_CANARIO';const pts=round(s);for(const phase of ['representatives','rules','awards']){s.phase=phase;const data=JSON.stringify(publicSnapshot(s));for(const canary of ['SECRETO_CANARIO','PREPARACION_CANARIO','EXTRA_CANARIO','CAPACIDAD_CANARIO','NOTA_CANARIO'])assert.ok(!data.includes(canary));assert.ok(!data.includes('secrets'));if(phase!=='rules')assert.equal(publicSnapshot(s).challenge,null);}s.phase='rules';award(s,pts,'HISTORIAL_CANARIO');const store=new Storage();saveSession(store,s);assert.ok(store.getItem(PRIVATE_KEY).includes('HISTORIAL_CANARIO'));assert.ok(!store.getItem(PUBLIC_KEY).includes('HISTORIAL_CANARIO'));});
test('todas las frases y respuestas del catálogo se excluyen aun con el reto revelado',()=>{const s=session();for(const g of catalog){s.active=g.id;s.phase='rules';const data=JSON.stringify(publicSnapshot(s));for(const secret of catalog.flatMap(g=>g.secrets))assert.ok(!data.includes(secret));assert.ok(!data.includes(g.preparation));}});
test('la entrada pública y sus dependencias solo contienen presentación, nunca dominio privado',async()=>{
 const seen=new Set();
 async function visit(path){if(seen.has(path))return;seen.add(path);assert.ok(!/core|conductor|catalogo/.test(path));const js=await readFile(new URL('../src/'+path,import.meta.url),'utf8');assert.ok(!/retos\.session|loadSession|juegos\.json/.test(js));for(const m of js.matchAll(/from ['"]\.\/(.*?)['"]/g))await visit(m[1]);}
 await visit('publico.js');assert.deepEqual([...seen].sort(),['effects.js','lan-public.js','publico.js','teams-show.js']);
});
test('fichas completas y materiales sumados conservadoramente',()=>{assert.equal(validateCatalog(catalog).length,12);const list=materialsList(catalog);assert.equal(list.find(m=>m.name==='Vasos').quantity,34);for(const g of catalog){assert.ok(g.tie&&g.noFinish&&g.seated&&g.preparation);assert.equal(g.maxPoints,100);}});
test('importación rechaza datos rotos, equipos duplicados, relojes inválidos e historial corrupto',()=>{const s=session();for(const corrupt of [x=>x.version=8,x=>x.teams[0].members[0]=x.teams[1].members[0],x=>x.timer.remaining=-1,x=>x.catalog[0].secrets='texto',x=>x.completed=['inexistente'],x=>x.history=[{before:{active:'no'},title:'x',note:'x',points:{}}]]){const c=copy(s);corrupt(c);assert.throws(()=>validateSession(c));}assert.throws(()=>loadSession({getItem:()=>'{roto'}));});

test('no se publica el conteo real como material del reto de estimación',()=>{const s=session();s.active='cantidad';s.phase='rules';const snapshot=publicSnapshot(s);assert.ok(!JSON.stringify(snapshot.challenge.materials).includes('40'));assert.equal(snapshot.challenge.materials.find(m=>m.name==='Objetos para contar').quantity,1);});
test('bombos extremos y de un solo integrante respetan equilibrio y capacidades',()=>{for(let seed=1;seed<70;seed++){const people=session().people;for(const kind of ['todos','unicos','grande']){people.forEach((p,i)=>p.group=kind==='todos'?'igual':kind==='unicos'?String(i):i<13?'principal':String(i));const ts=drawTeams(people,rng(seed));assert.deepEqual(ts.map(t=>t.members.length).sort(),[4,4,4,5]);for(const group of new Set(people.map(p=>p.group))){const counts=ts.map(t=>t.members.filter(id=>people.find(p=>p.id===id).group===group).length);assert.ok(Math.max(...counts)-Math.min(...counts)<=1);}}}});

test('un fallo de almacenamiento público no deja la sesión privada adelantada',()=>{const store=new Storage(),s=session();saveSession(store,s);const previous=store.getItem(PRIVATE_KEY),oldPublic=store.getItem(PUBLIC_KEY);const normal=store.setItem.bind(store);let reject=true;store.setItem=(k,v)=>{if(k===PUBLIC_KEY&&reject){reject=false;throw Error('cuota');}normal(k,v);};s.teams[0].score=99;assert.throws(()=>saveSession(store,s));assert.equal(store.getItem(PRIVATE_KEY),previous);assert.equal(store.getItem(PUBLIC_KEY),oldPublic);});

test('empates de clasificación configurables sin adjudicar puntos extra',()=>{const s=session();s.teams.forEach((t,i)=>t.score=i<2?100:50);assert.deepEqual(s.teams.map(t=>rankTeam(s,t)),[1,1,3,3]);s.ranking='dense';assert.deepEqual(s.teams.map(t=>rankTeam(s,t)),[1,1,2,2]);assert.deepEqual(publicSnapshot(s).teams.map(t=>t.place),[1,1,2,2]);});

test('la ruleta termina en la casilla elegida para cualquier reto, también con catálogos editados',()=>{
 for(let n=1;n<=100;n++)for(let i=0;i<n;i++)assert.equal(indexAtRotation(rotationFor(i,n),n),i);
 for(let i=0;i<12;i++){const s=session();s.blind=false;const g=drawChallenge(s,()=>(i+.25)/12,1000);const v=publicSnapshot(s);assert.equal(g.id,catalog[i].id);assert.equal(v.wheel.candidates[indexAtRotation(v.wheel.rotation,12)].id,g.id);assert.equal(v.challenge.id,g.id);}
});
test('antes de confirmar representantes no se publica la selección ni la ruleta',()=>{
 const s=session();const g=drawChallenge(s,()=>.65,1000),v=publicSnapshot(s);assert.equal(v.challenge,null);assert.equal(v.wheel,null);assert.ok(!JSON.stringify(v).includes(g.title));assert.ok(!JSON.stringify(v).includes('selectedId'));
 selectRepresentatives(s,Object.fromEntries(s.teams.map(t=>[t.id,t.members[0]])));reveal(s,2000);const shown=publicSnapshot(s);assert.equal(shown.challenge.id,g.id);assert.equal(presentationMode(shown,3000),'wheel');assert.equal(presentationMode(shown,6300),'reveal');assert.equal(presentationMode(shown,8000),'challenge');
});
test('tres rondas completas: selección distinta, reloj, representantes, puntos, privacidad y recarga',()=>{
 const storage=new Storage();let s=session();const seen=new Set();s.people[0].group='BOMBO_CANARIO';s.catalog.forEach(g=>{g.secrets.push('SECRETO_CANARIO_'+g.id);g.preparation+=' PREPARACION_CANARIO';});s.catalog[0].seconds=123;
 for(let round=0;round<3;round++){
  s.blind=round!==1;const now=Date.now()-20000;const g=drawChallenge(s,()=>[.15,.63,.91][round],now);assert.ok(!seen.has(g.id));seen.add(g.id);
  saveSession(storage,s);s=loadSession(storage);assert.equal(s.active,g.id);assert.equal(s.catalog[0].seconds,123);
  const reps=Object.fromEntries(s.teams.map(t=>[t.id,[...t.members].sort((a,b)=>(s.appearances[a]||0)-(s.appearances[b]||0))[0]]));selectRepresentatives(s,reps);if(s.blind)reveal(s,now);
  const v=publicSnapshot(s);assert.equal(v.wheel.candidates[v.wheel.selectedIndex].id,g.id);assert.equal(presentationMode(v,Date.now()),'challenge');assert.ok(!JSON.stringify(v).includes('CANARIO'));
  toggleTimer(s,now);assert.ok(remaining(s.timer,now+1000)<g.seconds);toggleTimer(s,now+1000);assert.equal(s.timer.running,false);
  const points={t1:100,t2:75,t3:50,t4:25};award(s,points,'NOTA_PRIVADA_CANARIO');saveSession(storage,s);s=loadSession(storage);
  assert.deepEqual(s.teams.map(t=>t.score),[100,75,50,25].map(n=>n*(round+1)));assert.ok(!storage.getItem(PUBLIC_KEY).includes('CANARIO'));assert.equal(s.completed.length,round+1);assert.equal(s.history.length,round+1);
 }
 assert.equal(seen.size,3);undo(s);saveSession(storage,s);assert.equal(loadSession(storage).completed.length,2);
});
test('migración conserva sesión v1, historial antiguo y catálogo personalizado',()=>{
 const s=session();const pts=round(s);award(s,pts,'Historial previo');delete s.presentation;delete s.draw;delete s.history[0].before.draw;s.catalog[0].title='Mi reto personalizado';s.teams[0].score=275;const store=new Storage();store.setItem(PRIVATE_KEY,JSON.stringify(s));const migrated=loadSession(store);assert.equal(migrated.teams[0].score,275);assert.equal(migrated.catalog[0].title,'Mi reto personalizado');assert.equal(migrated.history[0].note,'Historial previo');assert.equal(migrated.presentation.sound,false);drawChallenge(migrated);saveSession(store,migrated);assert.equal(loadSession(store).history.length,1);
});
test('recargar durante un giro conserva selección, orientación y momento de finalización',()=>{
 const s=session(),store=new Storage();s.blind=false;drawChallenge(s,()=>.32,Date.now()-1000);const before=copy(s.draw);saveSession(store,s);const loaded=loadSession(store);assert.deepEqual(loaded.draw,before);assert.equal(isPresenting(loaded),true);assert.equal(presentationMode(publicSnapshot(loaded),before.startedAt+before.duration+before.revealFor+1),'challenge');
});
test('apertura y reducción de movimiento no modifican equipos ni puntos',()=>{
 const s=session(),scores=s.teams.map(t=>t.score);startOpening(s,1000);assert.equal(presentationMode(publicSnapshot(s),2000),'opening');assert.equal(presentationMode(publicSnapshot(s),4100),'teams');s.presentation.reducedMotion=true;s.blind=false;drawChallenge(s,()=>0,1000);assert.equal(s.draw.duration,600);assert.deepEqual(s.teams.map(t=>t.score),scores);
});

test('el render público muestra fichas completas y excluye secretos en ambas páginas y fases',async()=>{
 const {renderStage,esc}=await import('../src/show.js');const s=session();
 for(const g of s.catalog){s.active=g.id;s.draw=null;s.phase='rules';g.secrets.push('CANARIO_RENDER_PRIVADO');g.preparation+=' CANARIO_RENDER_PREPARACION';
  for(const page of ['instructions','criteria']){s.presentation.page=page;const html=renderStage(publicSnapshot(s));assert.ok(html.includes(esc(g.title)));assert.ok(!html.includes('CANARIO_RENDER'));if(page==='instructions'){assert.ok(html.includes(esc(g.rules)));assert.ok(html.includes(esc(g.participants)));for(const m of g.materials)assert.ok(html.includes(esc(m.name)));}else{assert.ok(html.includes(esc(g.scoring)));assert.ok(html.includes(esc(g.tie)));assert.ok(html.includes(esc(g.noFinish)));}}
  s.phase='representatives';assert.ok(!renderStage(publicSnapshot(s)).includes(esc(g.title)));
 }
});
