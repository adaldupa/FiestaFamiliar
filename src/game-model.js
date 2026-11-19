// Dominio privado del catálogo. Sin acceso a DOM ni a almacenamiento.
export const SCORING_MODES=['fixed','position','hits','closeness','manual','special'];
export const clone=x=>JSON.parse(JSON.stringify(x));
export const isText=(s,max=5000)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
const need=(ok,message)=>{if(!ok)throw Error(message);};
export function validateGame(g){
 need(g&&isText(g.id,120)&&Number.isInteger(g.ruleVersion)&&g.ruleVersion>0,'ID o versión de minijuego inválidos.');
 for(const key of ['name','description','category','mode','publicRules','privateInstructions','victory','tie','noFinish','accessibility'])need(isText(g[key]),`Falta ${key} en el minijuego.`);
 need(['active','inactive','archived'].includes(g.status),'Estado del minijuego inválido.');
 need(Number.isInteger(g.minParticipants)&&Number.isInteger(g.maxParticipants)&&g.minParticipants>=1&&g.maxParticipants>=g.minParticipants&&g.maxParticipants<=10000,'Cantidad de participantes inválida.');
 need(Number.isInteger(g.seconds)&&g.seconds>=1&&g.seconds<=3600||g.seconds===null&&g.implementation==='planned'&&Array.isArray(g.pending)&&g.pending.length>0,'Duración: 1–3600 segundos, o pendiente explícito en una dinámica futura.');
 need(typeof g.representativesBefore==='boolean','Falta modalidad de representantes.');
 need(Array.isArray(g.materials)&&g.materials.every(m=>m&&isText(m.name,200)&&Number.isFinite(m.quantity)&&m.quantity>=0&&isText(m.unit,80)),'Materiales inválidos.');
 need(Array.isArray(g.secrets)&&g.secrets.every(x=>isText(x)),'Pistas privadas inválidas.');
 for(const key of ['createdAt','updatedAt'])need(isText(g[key],80)&&Number.isFinite(Date.parse(g[key])),'Fecha del minijuego inválida.');
 const p=g.scoring;need(p&&SCORING_MODES.includes(p.mode)&&p.decision==='proposal','Sistema de puntuación inválido.');
 for(const key of ['nominal','min','max','pointsPerSuccess'])need(Number.isInteger(p[key]),'Los límites de puntos deben ser enteros.');
 need(p.nominal===100&&p.min<=0&&p.max>=0&&p.min>=-10000&&p.max<=10000&&p.pointsPerSuccess>=p.min&&p.pointsPerSuccess<=p.max,'Límites de puntos inválidos.');
 need(typeof p.approvedException==='boolean'&&(!(p.max>100||p.min<0||p.pointsPerSuccess>100)||p.approvedException),'La excepción de puntos requiere aprobación expresa.');
 if(g.preparation!==undefined)need(isText(g.preparation),'Preparación inválida.');
 for(const key of ['steps','pending'])if(g[key]!==undefined)need(Array.isArray(g[key])&&g[key].every(v=>isText(v)),'Pasos o pendientes inválidos.');
 for(const key of ['repeatable','permanent'])if(g[key]!==undefined)need(typeof g[key]==='boolean','Metadatos de biblioteca inválidos.');
 if(g.implementation!==undefined)need(['turns','planned'].includes(g.implementation),'Disponibilidad de ejecución inválida.');
 if(g.id==='roba-y-gana'||g.permanent===true)need(g.permanent===true&&g.repeatable===true&&g.status!=='archived','El minijuego permanente debe conservarse y ser repetible.');
 if(p.positions!==undefined)need(Array.isArray(p.positions)&&p.positions.length>=2&&p.positions.length<=4&&p.positions.every(x=>Number.isInteger(x)&&x>=p.min&&x<=p.max),'Puntos por posición inválidos.');
 if(p.pointsPerHit!==undefined)need(Number.isInteger(p.pointsPerHit)&&p.pointsPerHit>=0&&p.pointsPerHit<=p.max,'Puntos por acierto inválidos.');
 if(p.target!==undefined)need(Number.isFinite(p.target),'Objetivo de cercanía inválido.');
 if(g.executionVersion!==undefined){need(g.executionVersion===1&&['turns','simultaneous'].includes(g.executionMode),'Contrato definitivo inválido.');need(Array.isArray(g.cards)&&new Set(g.cards.map(c=>c.id)).size===g.cards.length&&g.cards.every(c=>isText(c.id,120)&&isText(c.text||c.target)&&(!c.forbidden||c.forbidden.length===3&&new Set(c.forbidden).size===3&&c.forbidden.every(x=>isText(x)))),'Banco de tarjetas inválido.');}
 return g;
}
export function fromLegacy(g,now=new Date().toISOString()){
 return validateGame({id:g.id,name:g.title,description:g.rules,category:'Actuación',mode:g.mode,minParticipants:1,maxParticipants:10000,publicRules:g.rules,privateInstructions:g.preparation,materials:clone(g.materials),seconds:g.seconds,scoring:{mode:'fixed',nominal:100,min:0,max:100,pointsPerSuccess:100,approvedException:false,decision:'proposal'},victory:'Adivinar la frase dentro del turno.',tie:g.tie,noFinish:g.noFinish,accessibility:g.seated,secrets:clone(g.secrets),status:'active',ruleVersion:1,createdAt:now,updatedAt:now,representativesBefore:false});
}
export function validateLibrary(lib){
 need(lib&&lib.schemaVersion===1&&Array.isArray(lib.games)&&lib.games.length>0&&lib.games.length<=1000&&Array.isArray(lib.versions),'Biblioteca inválida.');
 const ids=new Set(),versions=new Map();for(const g of lib.versions){validateGame(g);const key=`${g.id}:${g.ruleVersion}`;need(!versions.has(key),'Versión de reglas repetida.');versions.set(key,g);}
 for(const g of lib.games){validateGame(g);need(!ids.has(g.id),'ID de minijuego repetido.');ids.add(g.id);const archived=versions.get(`${g.id}:${g.ruleVersion}`);need(archived&&JSON.stringify(archived)===JSON.stringify(g),'La versión actual debe existir en el archivo de reglas.');}
 need(lib.versions.length<=10000,'Demasiadas revisiones en la biblioteca.');
 for(const g of lib.versions)need(ids.has(g.id),'Versión sin ficha actual.');
 if(lib.collections!==undefined){need(Array.isArray(lib.collections)&&lib.collections.length<=1000,'Colecciones inválidas.');const collectionIds=new Set();for(const c of lib.collections){need(c&&isText(c.id,120)&&!collectionIds.has(c.id)&&isText(c.name,120)&&Array.isArray(c.games)&&c.games.length>0&&new Set(c.games.map(g=>g.id)).size===c.games.length,'Colección inválida o repetida.');collectionIds.add(c.id);for(const g of c.games)need(versions.has(`${g.id}:${g.ruleVersion}`),'Colección con versión inexistente.');for(const k of ['createdAt','updatedAt'])need(isText(c[k],80)&&Number.isFinite(Date.parse(c[k])),'Fecha de colección inválida.');}}
 if(lib.audit!==undefined){need(Array.isArray(lib.audit)&&lib.audit.length<=20000,'Auditoría de biblioteca inválida.');const auditIds=new Set();for(const a of lib.audit){need(a&&isText(a.id,120)&&!auditIds.has(a.id)&&isText(a.type,120)&&isText(a.at,80)&&Number.isFinite(Date.parse(a.at))&&a.detail&&typeof a.detail==='object','Registro de biblioteca inválido.');auditIds.add(a.id);}}
 return lib;
}
