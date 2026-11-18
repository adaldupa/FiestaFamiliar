import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../src/teams-core.js';
import * as C from '../src/contest-core.js';
import {fromLegacy} from '../src/game-model.js';
const actor=fromLegacy(JSON.parse(readFileSync(new URL('../catalogo/actor-fase2.json',import.meta.url))));
const store=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
for(const k of [2,3,4])test(`integración desde participantes nuevos: ${k} equipos, recargas, turnos, marcador y otra reunión`,()=>{
 let s=T.initialState();const storage=store();
 s.people=Array.from({length:17},(_,i)=>T.participant({name:`Familiar ${i}`,age:11+i*3},`familiar-${i}`));
 T.selectCount(s,k);T.runDraw(s,`integracion-${k}`);T.confirmTeams(s);
 const reload=()=>{T.saveState(storage,s);s=T.loadState(storage);};reload();
 C.initializeContest(s,actor);C.createEvent(s,{approvedProposal:true,lifecycleVersion:1});reload();
 let e=C.activeEvent(s);assert.deepEqual(e.teams.map(t=>t.members),s.result.teams.map(t=>t.members));
 C.drawGame(s,'ruleta',10000);reload();C.finishDraw(s,13000);C.presentInstructions(s);C.setRepresentatives(s,C.activeRound(C.activeEvent(s)).representatives);C.prepareChallenge(s);reload();
 for(let i=0;i<k;i++){
  C.startTimer(s,20000+i*200000);reload();
  C.pauseTimer(s,21000+i*200000);reload();
  C.startTimer(s,22000+i*200000);C.finishTimer(s,23000+i*200000);C.recordOutcome(s,{success:i%2===0});reload();
 }
 C.reviewScores(s);reload();e=C.activeEvent(s);
 assert.deepEqual(Object.values(C.scores(e)),Array(k).fill(0));
 C.confirmScores(s,C.activeRound(e).draft.id);reload();e=C.activeEvent(s);
 assert.equal(e.ledger.length,k);assert.deepEqual(Object.values(C.scores(e)),Array.from({length:k},(_,i)=>i%2===0?100:0));
 assert.throws(()=>C.confirmScores(s,'duplicado'));assert.throws(()=>T.unlock(s));
 const published=JSON.stringify(T.publicSnapshot(s));assert.ok(!published.includes('createdAt'));for(const secret of actor.secrets)assert.ok(!published.includes(secret));
 C.nextRound(s);reload();assert.equal(C.activeEvent(s).phase,C.PHASE.NEXT);assert.equal(C.eligibleGames(s).length,0);
 C.closeEvent(s,'Fin del ensayo');const previous=JSON.stringify(s.contest.events[0]);T.unlock(s);T.invalidate(s,'Nueva reunión');s.people[0].name='Nombre actualizado';T.runDraw(s,'otra');T.confirmTeams(s);C.createEvent(s,{approvedProposal:true,lifecycleVersion:1});reload();
 assert.equal(s.contest.events.length,2);assert.equal(JSON.stringify(s.contest.events[0]),previous);
 const key=T.preserveBeforeImport(storage,s);assert.deepEqual(JSON.parse(storage.getItem(key)),s);T.preserveBeforeImport(storage,s);assert.ok(storage.getItem(key));
});
test('no importa si no puede conservar la sesión actual',()=>{
 assert.throws(()=>T.preserveBeforeImport({setItem(){throw Error('sin espacio');}},T.initialState()),/sin espacio/);
});
test('cierra el evento después de cerrar una ronda sin resultados',()=>{
 const s=T.initialState();s.people=[T.participant({name:'Uno',age:20}),T.participant({name:'Dos',age:40})];T.selectCount(s,2);T.runDraw(s,'cierre');T.confirmTeams(s);C.initializeContest(s,actor);C.createEvent(s,{approvedProposal:true,lifecycleVersion:1});C.drawGame(s,'cierre',1000);C.finishDraw(s,4000);
 C.closeRoundWithoutResults(s,{confirmed:true,roundId:C.activeRound(C.activeEvent(s)).id,reason:'Sin ejecutar'});C.closeEvent(s,'Fin');T.validateState(s);assert.equal(C.activeEvent(s).ledger.length,0);
});
