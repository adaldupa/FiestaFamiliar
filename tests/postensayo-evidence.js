import fs from 'node:fs';
import * as C from '../src/contest-core.js';import * as T from '../src/teams-core.js';import * as X from '../src/closure-core.js';import {fullAction} from '../src/full-engines.js';
import {renderFullHost} from '../src/full-host.js';import {sanitizeContest,renderContestStage} from '../src/contest-show.js';import {revised,openRevised,playRevised} from './postensayo-fixtures.js';import {catalog} from './full-fixtures.js';
const dir='evidencia/postensayo';fs.mkdirSync(dir,{recursive:true});
const wrap=(body,host)=>`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vista reproducible · datos de prueba</title>${['estilos','navidad','equipos',...(host?[]:['escenario']),'contest'].map(x=>`<link rel="stylesheet" href="../../${x}.css">`).join('')}</head><body><p style="background:#fff;color:#000;padding:.5rem">HTML generado por el renderer real con datos sintéticos. No es captura ni prueba de navegador.</p>${body}</body></html>`;
for(const id of ['actor','tararea','palabras-prohibidas','hazme-sonido','roba-y-gana']){
 const s=revised(),r=openRevised(s,id);C.startTimer(s,10000);
 fs.writeFileSync(`${dir}/${id}-conductor.html`,wrap(renderFullHost(s,11000),true));
 fs.writeFileSync(`${dir}/${id}-tv.html`,wrap(renderContestStage(sanitizeContest(T.publicSnapshot(s).contest),11000),false));
 if(id==='roba-y-gana'){for(const [i,tid] of r.full.choiceOrder.entries())fullAction(s,'choose',{teamId:tid,index:i},11000);fullAction(s,'reveal',{},12000);fs.writeFileSync(`${dir}/roba-revelada-tv.html`,wrap(renderContestStage(sanitizeContest(T.publicSnapshot(s).contest),12000),false));fs.writeFileSync(`${dir}/roba-revelada-conductor.html`,wrap(renderFullHost(s,12000),true));}
}
const s=revised(),trace=[];for(const id of [...catalog.games.map(g=>g.id),'roba-y-gana','roba-y-gana']){
 const r=playRevised(s,id),e=C.activeEvent(s);trace.push({round:r.number,id,revision:r.game.ruleVersion,simultaneous:r.full.simultaneous,results:r.full.results,choiceOrder:r.full.choiceOrder,choices:r.full.choices,points:Object.fromEntries(r.turns.map(t=>[t.teamId,t.outcome.points])),standings:C.standings(e).map(t=>({id:t.id,score:t.score,place:t.place})),ledgerIds:e.ledger.filter(m=>m.roundId===r.id&&m.status==='active').map(m=>m.id)});
}
X.beginAwards(s,'Evidencia automatizada con datos sintéticos');const e=C.activeEvent(s),a=e.awards;while(a.index<a.places.length-1)X.awardsAction(s,'next',{ceremonyId:a.id,index:a.index});X.awardsAction(s,'finish',{ceremonyId:a.id,reason:'Fin de evidencia automatizada'});T.validateState(T.clone(s));
fs.writeFileSync(`${dir}/flujo-14-rondas.json`,JSON.stringify({kind:'Automatizado: resultados de fixture, no partida física',rounds:trace,finalStatus:e.status,awards:a.rows},null,2)+'\n');
