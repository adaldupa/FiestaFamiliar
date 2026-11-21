import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/contest-core.js';
import * as T from '../src/teams-core.js';
import * as F from '../src/full-engines.js';
import * as L from '../src/library-core.js';
import {revised,openRevised,playRevised,corrected} from './postensayo-fixtures.js';
import {fresh,play} from './full-fixtures.js';
import {installApproved} from '../src/approved-catalog.js';

const mechanics=[
 ['galleta-viajera',true,90,'position'],['picasso-oscuras',true,90,'position'],
 ['roba-y-gana',true,null,'special'],['tararea',false,60,'position'],
 ['torre-traicionera',true,90,'position'],['hazme-sonido',false,60,'hits'],
 ['rebote-imposible',true,null,'position'],['manos-mantequilla',true,120,'position'],
 ['actor',false,90,'position'],['palabras-prohibidas',false,60,'hits'],
 ['yo-soy-objeto',false,90,'hits'],['cuantos-hay',true,null,'closeness']
];
for(const [id,simultaneous,seconds,mode] of mechanics)test(`contrato de mecánica y visibilidad: ${id}`,()=>{
 const s=revised(),r=openRevised(s,id),f=r.full;
 assert.equal(f.simultaneous,simultaneous);assert.equal(r.game.seconds,seconds);assert.equal(f.mode,mode);
 if(mode==='closeness')F.fullAction(s,'target',{value:987654});
 C.startTimer(s,10000);const dto=T.publicSnapshot(s).contest;
 assert.equal(dto.timer.durationMs,(seconds??3600)*1000);
 if(['hazme-sonido','palabras-prohibidas'].includes(id)){
  assert.equal(dto.execution.publicCard.id,f.cards[r.currentTeamId].id);
  if(id==='palabras-prohibidas')assert.deepEqual(dto.execution.publicCard.forbidden,f.cards[r.currentTeamId].forbidden);
 }else{
  assert.equal(dto.execution.publicCard,undefined);
  for(const card of Object.values(f.cards))if(card)assert.ok(!JSON.stringify(dto).includes(card.text));
 }
 assert.equal(dto.execution.deck,undefined);assert.equal(dto.execution.cards,undefined);assert.equal(dto.execution.target,undefined);
 C.pauseTimer(s,11000);assert.equal(T.publicSnapshot(s).contest.execution.publicCard,undefined);
 T.validateState(T.clone(s));
});

test('posiciones configuradas en biblioteca se calculan con esa revisión, conservando el evento anterior',()=>{
 const s=revised(),old=JSON.stringify(C.activeEvent(s));
 const g=T.clone(s.contest.library.games.find(g=>g.id==='actor'));
 g.scoring.positions=[80,60,40,20];g.victory='Tabla configurable de ensayo: 80/60/40/20.';
 L.saveGame(s,g,{expectedVersion:g.ruleVersion,reason:'Configuración de ensayo'});
 assert.equal(JSON.stringify(C.activeEvent(s)),old);
 C.configureEventGames(s,C.activeEvent(s).selectedGames.map(g=>({id:g.id,ruleVersion:s.contest.library.games.find(x=>x.id===g.id).ruleVersion})));
 const r=playRevised(s,'actor');
 assert.deepEqual(F.calculateFull(C.activeEvent(s),r),{t1:80,t2:40,t3:20,t4:80});
 T.validateState(T.clone(s));
});

test('actualizar futuras rondas conserva íntegra una ronda simultánea histórica ya puntuada',()=>{
 const s=fresh(),r=play(s,'actor'),e=C.activeEvent(s),old=JSON.stringify(r),ledger=JSON.stringify(e.ledger);
 installApproved(s,corrected);C.nextRound(s);
 C.configureEventGames(s,e.selectedGames.map(g=>({id:g.id,ruleVersion:s.contest.library.games.find(x=>x.id===g.id).ruleVersion})));
 assert.equal(JSON.stringify(r),old);assert.equal(JSON.stringify(e.ledger),ledger);
 assert.equal(r.full.simultaneous,true);assert.equal(e.selectedGames.find(g=>g.id==='actor').executionMode,'turns');
 T.validateState(T.clone(s));
});

test('ningún acierto fuera de plazo crea resultado y el turno siguiente queda sin arrancar',()=>{
 const s=revised(),r=openRevised(s,'actor');C.startTimer(s,10000);
 assert.throws(()=>F.fullAction(s,'complete',{teamId:'t1'},100001));
 assert.equal(r.full.results.t1,undefined);assert.equal(C.recoverTimer(s,100001),true);
 assert.equal(r.full.results.t1.completed,false);assert.equal(r.currentTeamId,'t2');
 assert.equal(r.full.clock.status,'idle');assert.equal(r.full.clock.remainingMs,90000);
 T.validateState(T.clone(s));
});
