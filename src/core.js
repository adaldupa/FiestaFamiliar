import {rotationFor} from './wheel.js';
export const PRIVATE_KEY = 'retos.session.v1';
export const PUBLIC_KEY = 'retos.public.v1';
export const copy = x => JSON.parse(JSON.stringify(x));
const string = (x, max=4000) => typeof x === 'string' && x.length <= max;
export function validateCatalog(games) {
  if (!Array.isArray(games) || games.length < 1 || games.length > 100) throw Error('El catálogo debe tener entre 1 y 100 retos.');
  const ids = new Set();
  for (const g of games) {
    if (!g || !string(g.id,80) || !g.id || ids.has(g.id)) throw Error('Cada reto necesita un identificador único.');
    ids.add(g.id);
    for (const k of ['title','mode','rules','participants','preparation','scoring','tie','noFinish','seated'])
      if (!string(g[k]) || !g[k].trim()) throw Error(`Falta ${k} en ${g.id}.`);
    if (!Number.isInteger(g.seconds) || g.seconds < 10 || g.seconds > 3600) throw Error('Duración: entre 10 y 3600 segundos.');
    if (!Number.isInteger(g.maxPoints) || g.maxPoints < 0 || g.maxPoints > 1000 || typeof g.allowNegative !== 'boolean' || typeof g.specialApproved !== 'boolean') throw Error('Revisa los límites de puntos.');
    if (g.maxPoints > 100 && !g.specialApproved) throw Error('Los valores superiores a 100 requieren specialApproved: true.');
    if (!Array.isArray(g.secrets) || !g.secrets.every(s=>string(s))) throw Error('secrets debe ser una lista de textos privados.');
    if (!Array.isArray(g.materials) || !g.materials.every(m=>m && string(m.name,120) && m.name.trim() && Number.isFinite(m.quantity) && m.quantity>0 && m.quantity<=1000 && string(m.unit,80))) throw Error('Materiales: nombre, cantidad positiva y unidad.');
  }
  return copy(games);
}
export function initialSession(catalog) {
  return {version:1, catalog:validateCatalog(catalog), people:Array.from({length:17},(_,i)=>({id:`p${i+1}`,name:'',group:'sin grupo'})), teams:[], completed:[], skipped:[], active:null, phase:'lobby', reps:{}, appearances:{}, history:[], timer:{remaining:60,running:false,deadline:null}, seated:true, blind:true, ranking:'competition', presentation:{view:'game',page:'instructions',sound:false,reducedMotion:false,opening:null},draw:null,publishedAt:0};
}
export function shuffle(items, rng=Math.random) {
  const a=[...items]; for(let i=a.length-1;i>0;i--) {const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a;
}
export function drawTeams(people, rng=Math.random) {
  if(people.length!==17 || people.some(p=>!p.name.trim()) || new Set(people.map(p=>p.id)).size!==17) throw Error('Registra exactamente 17 personas con identificadores distintos.');
  if(new Set(people.map(p=>p.name.trim().toLocaleLowerCase())).size!==17) throw Error('Distingue los nombres repetidos con una inicial o apodo.');
  const teams=['Ámbar','Coral','Cielo','Lila'].map((name,i)=>({id:`t${i+1}`,name,capacity:4,members:[],score:0}));
  teams[Math.floor(rng()*4)].capacity=5;
  const groups=new Map();
  for(const p of people) {const group=p.group||'sin grupo'; if(!groups.has(group)) groups.set(group,[]); groups.get(group).push(p.id);}
  // Allocate each bombo evenly (difference at most one), while respecting
  // capacities. Backtracking considers only four team capacities, not names.
  const bins=shuffle([...groups.values()],rng).map(ids=>shuffle(ids,rng));
  const base=bins.reduce((n,ids)=>n+Math.floor(ids.length/4),0);
  const space=teams.map(t=>t.capacity-base), failed=new Set();
  function assign(i,available){
    if(i===bins.length)return [];
    const key=i+':'+available.join(',');if(failed.has(key))return null;
    const count=bins[i].length%4, choices=[];
    for(let mask=0;mask<16;mask++){
      const indices=[0,1,2,3].filter(j=>mask&(1<<j));
      if(indices.length===count&&indices.every(j=>available[j]>0))choices.push(indices);
    }
    for(const indices of shuffle(choices,rng)){
      const next=available.map((n,j)=>n-(indices.includes(j)?1:0));
      const rest=assign(i+1,next);if(rest)return [indices,...rest];
    }
    failed.add(key);return null;
  }
  const extras=assign(0,space);if(!extras)throw Error('No se pudieron equilibrar los bombos.');
  bins.forEach((ids,i)=>{let offset=0;teams.forEach((t,j)=>{const n=Math.floor(ids.length/4)+(extras[i].includes(j)?1:0);t.members.push(...ids.slice(offset,offset+n));offset+=n;});});
  teams.forEach(t=>{t.members=shuffle(t.members,rng);});
  return teams;
}
export function presentationDefaults(){return {view:'game',page:'instructions',sound:false,reducedMotion:false,opening:null};}
export function isPresenting(s,now=Date.now()){
  return Boolean(s.draw?.startedAt!==null&&s.draw?.startedAt!==undefined&&now<s.draw.startedAt+s.draw.duration+s.draw.revealFor);
}
export function startOpening(s,now=Date.now()){
  if(s.timer.running)throw Error('Pausa el reloj antes de iniciar la apertura.');
  s.presentation??=presentationDefaults();s.presentation.view='game';
  s.presentation.opening={token:globalThis.crypto?.randomUUID?.()||String(now),startedAt:now};
}
export function startDrawPresentation(s,now=Date.now()){
  if(!s.draw)return; s.draw.startedAt=now;
  s.draw.duration=s.presentation?.reducedMotion?600:4200;
  s.draw.revealFor=s.presentation?.reducedMotion?600:1400;
}
export function drawChallenge(s,rng=Math.random,now=Date.now()) {
  if(s.teams.length!==4) throw Error('Primero sortea los equipos.');
  if(s.active) throw Error('Completa o salta el reto actual antes de sortear otro.');
  const pending=s.catalog.filter(g=>!s.completed.includes(g.id)&&!s.skipped.includes(g.id));
  if(!pending.length) throw Error('No quedan retos pendientes. Puedes recuperar los omitidos.');
  const index=Math.floor(rng()*pending.length),g=pending[index];
  s.active=g.id;s.reps={};s.phase=s.blind?'representatives':'rules';
  s.presentation??=presentationDefaults();s.presentation.view='game';s.presentation.page='instructions';s.presentation.opening=null;
  s.draw={token:globalThis.crypto?.randomUUID?.()||`${now}-${g.id}`,ids:pending.map(x=>x.id),selectedId:g.id,index,rotation:rotationFor(index,pending.length),startedAt:null,duration:4200,revealFor:1400};
  if(!s.blind)startDrawPresentation(s,now);
  s.timer={remaining:g.seconds,running:false,deadline:null};return g;
}
export function selectRepresentatives(s,reps,exception=false) {
  for(const t of s.teams) {
    const id=reps[t.id];
    if(!t.members.includes(id)) throw Error('Elige un representante de cada equipo.');
    const min=Math.min(...t.members.map(m=>s.appearances[m]||0));
    if((s.appearances[id]||0)>min && !exception) throw Error('Da oportunidad a quien haya participado menos, o marca consentimiento/adaptación.');
  }
  s.reps=copy(reps);
}
export function reveal(s,now=Date.now()) {
  selectRepresentatives(s,s.reps,true);
  s.phase='rules';startDrawPresentation(s,now);
}
export function remaining(timer,now=Date.now()) {return timer.running?Math.max(0,Math.ceil((timer.deadline-now)/1000)):timer.remaining;}
export function toggleTimer(s,now=Date.now()) {
  const r=remaining(s.timer,now);s.timer={remaining:r,running:!s.timer.running&&r>0,deadline:!s.timer.running&&r>0?now+r*1000:null};
}
export function award(s,points,note='') {
  if(!s.active || s.phase!=='rules' || Object.keys(s.reps).length!==4) throw Error('Revela el reto y confirma representantes antes de puntuar.');
  const g=s.catalog.find(g=>g.id===s.active);
  for(const t of s.teams) if(!Number.isInteger(points[t.id]) || points[t.id]>g.maxPoints || points[t.id]<(g.allowNegative?-g.maxPoints:0)) throw Error(`Puntos enteros entre ${g.allowNegative?-g.maxPoints:0} y ${g.maxPoints}.`);
  const before={teams:copy(s.teams),completed:copy(s.completed),active:s.active,phase:s.phase,reps:copy(s.reps),appearances:copy(s.appearances),timer:{remaining:remaining(s.timer),running:false,deadline:null},draw:copy(s.draw??null)};
  s.history.push({before,points:copy(points),note:String(note).slice(0,1000),title:g.title});
  for(const t of s.teams){t.score+=points[t.id];const id=s.reps[t.id];s.appearances[id]=(s.appearances[id]||0)+1;}
  s.completed.push(s.active);s.active=null;s.draw=null;s.phase='results';s.timer.running=false;s.timer.deadline=null;s.reps={};
}
export function undo(s) {
  if(s.active) throw Error('Salta el reto actual antes de deshacer puntos.');
  const h=s.history.pop();if(!h)throw Error('No hay puntos que deshacer.');Object.assign(s,copy(h.before));
}
export function moveMember(s,personId,toId) {
  if(s.active || s.history.length) throw Error('Corrige equipos antes de comenzar las rondas.');
  const from=s.teams.find(t=>t.members.includes(personId)),to=s.teams.find(t=>t.id===toId);
  if(!from||!to||from===to)throw Error('Selecciona dos equipos distintos.');
  // Swap maintains the exact 4/4/4/5 team capacities.
  return {from,to};
}
export function rankTeam(s,t){const ahead=s.teams.filter(x=>x.score>t.score);return 1+(s.ranking==='dense'?new Set(ahead.map(x=>x.score)).size:ahead.length);}
export function publicSnapshot(s,now=Date.now()) {
  const g=s.phase==='rules'?s.catalog.find(g=>g.id===s.active):null;
  const name=id=>s.people.find(p=>p.id===id)?.name||'Participante';
  const p=s.presentation||presentationDefaults(),d=g&&s.draw?.selectedId===s.active?s.draw:null;
  // La ruleta solo se publica DESPUÉS de revelar. Antes no cruza ni su índice ni el ID elegido.
  const candidates=d?d.ids.map(id=>s.catalog.find(x=>x.id===id)).filter(Boolean).map(x=>({id:x.id,title:x.title})):[];
  return {version:1,updatedAt:now,phase:s.phase,seated:s.seated,
    presentation:{view:p.view,page:p.page||'instructions',sound:p.sound,reducedMotion:p.reducedMotion,opening:p.opening?{token:p.opening.token,startedAt:p.opening.startedAt}:null},
    wheel:d&&d.startedAt!==null?{token:d.token,candidates,selectedId:g.id,selectedIndex:d.index,rotation:d.rotation,startedAt:d.startedAt,duration:d.duration,revealFor:d.revealFor}:null,
    teams:s.teams.map(t=>({id:t.id,name:t.name,score:t.score,place:rankTeam(s,t),members:t.members.map(name),representative:s.reps[t.id]?name(s.reps[t.id]):null})),
    completedCount:s.completed.length,totalCount:s.catalog.length,
    timer:{remaining:s.timer.remaining,running:s.timer.running,deadline:s.timer.deadline},
    challenge:g?{id:g.id,title:g.title,mode:g.mode,rules:g.rules,participants:g.participants,materials:g.materials.map(m=>({name:m.name,quantity:m.quantity,unit:m.unit})),seconds:g.seconds,scoring:g.scoring,maxPoints:g.maxPoints,tie:g.tie,noFinish:g.noFinish,seated:g.seated}:null};
}
export function materialsList(catalog) {
  const map=new Map();
  for(const g of catalog) for(const m of g.materials) {const k=m.name.toLowerCase()+'|'+m.unit;const item=map.get(k)||{name:m.name,unit:m.unit,quantity:0,games:[]}; item.quantity+=m.quantity;item.games.push(g.title);map.set(k,item);}
  return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));
}
export function validateSession(raw) {
  if(!raw||raw.version!==1)throw Error('Formato de sesión incompatible.');
  const s=copy(raw);s.presentation??=presentationDefaults();s.draw??=null;s.ranking??='competition';if(!['competition','dense'].includes(s.ranking))throw Error('Clasificación inválida.');validateCatalog(s.catalog);
  if(!Array.isArray(s.people)||s.people.length!==17||new Set(s.people.map(p=>p.id)).size!==17||!s.people.every(p=>p&&/^p([1-9]|1[0-7])$/.test(p.id)&&string(p.name,100)&&string(p.group,100)))throw Error('Participantes inválidos.');
  if(!Array.isArray(s.teams)||![0,4].includes(s.teams.length))throw Error('Equipos inválidos.');
  if(s.teams.length){
    const ids=s.teams.flatMap(t=>t.members||[]);
    if(ids.length!==17||new Set(ids).size!==17||ids.some(id=>!s.people.some(p=>p.id===id))||s.teams.map(t=>t.members.length).sort().join()!=='4,4,4,5'||new Set(s.teams.map(t=>t.id)).size!==4||s.teams.some(t=>!/^t[1-4]$/.test(t.id)||!string(t.name,100)||!Number.isInteger(t.score)||Math.abs(t.score)>1000000))throw Error('La sesión debe contener equipos de 4, 4, 4 y 5 sin duplicados.');
  }
  const validIds=new Set(s.catalog.map(g=>g.id));
  for(const key of ['completed','skipped'])if(!Array.isArray(s[key])||new Set(s[key]).size!==s[key].length||s[key].some(id=>!validIds.has(id)))throw Error('Rondas inválidas.');
  if(s.completed.some(id=>s.skipped.includes(id))||s.active&&( !validIds.has(s.active)||s.completed.includes(s.active)||s.skipped.includes(s.active)))throw Error('Reto activo inválido.');
  if(!['lobby','teams','representatives','rules','results','awards'].includes(s.phase)||!s.timer||typeof s.timer.running!=='boolean'||!Number.isInteger(s.timer.remaining)||s.timer.remaining<0||s.timer.remaining>3600||s.timer.running&&(!Number.isFinite(s.timer.deadline)||s.timer.deadline>Date.now()+3600000))throw Error('Estado o cronómetro inválido.');
  if(!s.reps||Array.isArray(s.reps)||typeof s.reps!=='object'||!s.appearances||Array.isArray(s.appearances)||typeof s.appearances!=='object'||typeof s.seated!=='boolean'||typeof s.blind!=='boolean'||!Array.isArray(s.history)||s.history.length>100)throw Error('Historial inválido.');
  for(const [tid,pid] of Object.entries(s.reps))if(!s.teams.find(t=>t.id===tid)?.members.includes(pid))throw Error('Representantes inválidos.');
  for(const [pid,count] of Object.entries(s.appearances))if(!s.people.some(p=>p.id===pid)||!Number.isInteger(count)||count<0||count>100)throw Error('Participaciones inválidas.');
  if(['rules','representatives'].includes(s.phase)!==Boolean(s.active)||s.active&&s.teams.length!==4||s.timer.running&&!s.active)throw Error('La fase no coincide con la ronda activa.');
  if(s.teams.length && (s.people.some(p=>!p.name.trim())||new Set(s.people.map(p=>p.name.trim().toLocaleLowerCase())).size!==17))throw Error('Nombres incompletos o repetidos.');
  for(const h of s.history){if(!h.before||!validIds.has(h.before.active)||!string(h.title)||!string(h.note)||!h.points)throw Error('Asignación inválida.');const before={...s,...h.before,draw:h.before.draw??null,history:[]};validateSession(before);}
  const p=s.presentation;
  if(!p||!['game','welcome'].includes(p.view)||p.page!==undefined&&!['instructions','criteria'].includes(p.page)||typeof p.sound!=='boolean'||typeof p.reducedMotion!=='boolean'||p.opening&&(!string(p.opening.token,120)||!Number.isFinite(p.opening.startedAt)))throw Error('Presentación inválida.');
  if(s.draw){const d=s.draw;
    if(!s.active||d.selectedId!==s.active||!string(d.token,120)||!Array.isArray(d.ids)||new Set(d.ids).size!==d.ids.length||d.ids.some(id=>!validIds.has(id))||d.ids[d.index]!==s.active||d.rotation!==rotationFor(d.index,d.ids.length)||d.startedAt!==null&&!Number.isFinite(d.startedAt)||![600,4200].includes(d.duration)||![600,1400].includes(d.revealFor))throw Error('Sorteo guardado inválido.');
  }
  return s;
}
export function saveSession(storage,s) {
  const previousPrivate=storage.getItem(PRIVATE_KEY),previousPublic=storage.getItem(PUBLIC_KEY);
  try{storage.setItem(PRIVATE_KEY,JSON.stringify(s));storage.setItem(PUBLIC_KEY,JSON.stringify(publicSnapshot(s)));}
  catch(error){
    try{for(const [key,value] of [[PRIVATE_KEY,previousPrivate],[PUBLIC_KEY,previousPublic]]){if(value===null)storage.removeItem(key);else storage.setItem(key,value);}}catch{}
    throw Error('No se pudo guardar. Revisa el espacio y los permisos del navegador; exporta un respaldo. '+error.message);
  }
}
export function loadSession(storage) {const raw=storage.getItem(PRIVATE_KEY);return raw?validateSession(JSON.parse(raw)):null;}
