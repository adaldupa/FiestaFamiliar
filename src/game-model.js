// Dominio privado del catálogo. Sin acceso a DOM ni a almacenamiento.
export const SCORING_MODES=['fixed','position','hits','closeness','manual','special'];
export const clone=x=>JSON.parse(JSON.stringify(x));
export const isText=(s,max=5000)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
const need=(ok,message)=>{if(!ok)throw Error(message);};
export function validateGame(g){
 need(g&&isText(g.id,120)&&Number.isInteger(g.ruleVersion)&&g.ruleVersion>0,'ID o versión de minijuego inválidos.');
 for(const key of ['name','description','category','mode','publicRules','privateInstructions','victory','tie','noFinish','accessibility'])need(isText(g[key]),`Falta ${key} en el minijuego.`);
 need(['active','inactive','archived'].includes(g.status),'Estado del minijuego inválido.');
 need(Number.isInteger(g.minParticipants)&&Number.isInteger(g.maxParticipants)&&g.minParticipants>=1&&g.maxParticipants>=g.minParticipants,'Cantidad de participantes inválida.');
 need(Number.isInteger(g.seconds)&&g.seconds>=1&&g.seconds<=3600,'Duración: entre 1 y 3600 segundos.');
 need(typeof g.representativesBefore==='boolean','Falta modalidad de representantes.');
 need(Array.isArray(g.materials)&&g.materials.every(m=>m&&isText(m.name,200)&&Number.isFinite(m.quantity)&&m.quantity>=0&&isText(m.unit,80)),'Materiales inválidos.');
 need(Array.isArray(g.secrets)&&g.secrets.every(x=>isText(x)),'Pistas privadas inválidas.');
 for(const key of ['createdAt','updatedAt'])need(isText(g[key],80)&&Number.isFinite(Date.parse(g[key])),'Fecha del minijuego inválida.');
 const p=g.scoring;need(p&&SCORING_MODES.includes(p.mode)&&p.decision==='proposal','Sistema de puntuación inválido.');
 for(const key of ['nominal','min','max','pointsPerSuccess'])need(Number.isInteger(p[key]),'Los límites de puntos deben ser enteros.');
 need(p.nominal===100&&p.min<=0&&p.max>=0&&p.min>=-10000&&p.max<=10000&&p.pointsPerSuccess>=p.min&&p.pointsPerSuccess<=p.max,'Límites de puntos inválidos.');
 need(typeof p.approvedException==='boolean'&&(!(p.max>100||p.min<0||p.pointsPerSuccess>100)||p.approvedException),'La excepción de puntos requiere aprobación expresa.');
 return g;
}
export function fromLegacy(g,now=new Date().toISOString()){
 return validateGame({id:g.id,name:g.title,description:g.rules,category:'Actuación',mode:g.mode,minParticipants:1,maxParticipants:10000,publicRules:g.rules,privateInstructions:g.preparation,materials:clone(g.materials),seconds:g.seconds,scoring:{mode:'fixed',nominal:100,min:0,max:100,pointsPerSuccess:100,approvedException:false,decision:'proposal'},victory:'Adivinar la frase dentro del turno.',tie:g.tie,noFinish:g.noFinish,accessibility:g.seated,secrets:clone(g.secrets),status:'active',ruleVersion:1,createdAt:now,updatedAt:now,representativesBefore:false});
}
export function validateLibrary(lib){
 need(lib&&lib.schemaVersion===1&&Array.isArray(lib.games)&&lib.games.length>0&&lib.games.length<=1000&&Array.isArray(lib.versions),'Biblioteca inválida.');
 const ids=new Set(),versions=new Map();for(const g of lib.versions){validateGame(g);const key=`${g.id}:${g.ruleVersion}`;need(!versions.has(key),'Versión de reglas repetida.');versions.set(key,g);}
 for(const g of lib.games){validateGame(g);need(!ids.has(g.id),'ID de minijuego repetido.');ids.add(g.id);const archived=versions.get(`${g.id}:${g.ruleVersion}`);need(archived&&JSON.stringify(archived)===JSON.stringify(g),'La versión actual debe existir en el archivo de reglas.');}
 return lib;
}
