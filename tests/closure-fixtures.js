import fs from 'node:fs';
import {fresh,play,catalog} from './full-fixtures.js';
import * as C from '../src/contest-core.js';import * as T from '../src/teams-core.js';import * as X from '../src/closure-core.js';
export const bank=JSON.parse(fs.readFileSync(new URL('../catalogo/duelo-generaciones.json',import.meta.url)));
export function closure(k=4){const s=fresh(k);X.enableClosure(s,bank);return s;}
export function selectGame(s,id,now=1000){const e=C.activeEvent(s);if([C.PHASE.SCORES,C.PHASE.CLOSED].includes(e.phase))C.nextRound(s);for(let n=0;n<3000;n++){const seed='closure-'+n,x=T.clone(s);if(C.drawGame(x,seed,now).game.id===id)return C.drawGame(s,seed,now);}throw Error('No hay semilla para '+id);}
export function prepare(s,id){const r=selectGame(s,id),e=C.activeEvent(s);if(e.phase===C.PHASE.REPS)C.setRepresentatives(s,T.clone(r.representatives));C.finishDraw(s,4000);C.presentInstructions(s);if(e.phase===C.PHASE.REPS)C.setRepresentatives(s,T.clone(r.representatives));return r;}
export function cases(k=4){const s=closure(k),snapshots=[],capture=()=>snapshots.push({state:T.clone(s),public:T.publicSnapshot(s)});capture();X.duelAction(s,'question');capture();X.duelAction(s,'correct',{attemptId:C.activeEvent(s).duel.current.id,personId:C.activeEvent(s).teams[0].members[0],confirmed:true});capture();for(const g of catalog.games)play(s,g.id,capture);X.beginAwards(s,'Ensayo completo de doce juegos');capture();const a=C.activeEvent(s).awards;while(a.index<a.places.length-1){X.awardsAction(s,'next',{ceremonyId:a.id,index:a.index});capture();}X.awardsAction(s,'finish',{ceremonyId:a.id,reason:'Fin del ensayo'});capture();return snapshots;}
if(process.argv[1]?.endsWith('closure-fixtures.js'))console.log(JSON.stringify(cases()));
