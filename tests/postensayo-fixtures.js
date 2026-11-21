import * as C from '../src/contest-core.js';
import * as T from '../src/teams-core.js';
import * as X from '../src/closure-core.js';
import {fullAction} from '../src/full-engines.js';
import {installApproved} from '../src/approved-catalog.js';
import {manualCatalog} from '../src/manual-rules.js';
import {fresh,catalog,open} from './full-fixtures.js';
export const corrected=manualCatalog(catalog);
export function revised(k=4){const s=fresh(k);installApproved(s,corrected);C.configureEventGames(s,C.activeEvent(s).selectedGames.map(g=>({id:g.id,ruleVersion:s.contest.library.games.find(x=>x.id===g.id).ruleVersion})));X.enableClosure(s,[]);return s;}
export function openRevised(s,id){
 const e=C.activeEvent(s);if([C.PHASE.SCORES,C.PHASE.CLOSED].includes(e.phase))C.nextRound(s);
 for(let i=0;i<3000;i++){const seed='manual-'+i,x=T.clone(s);if(C.drawGame(x,seed,1000,{extraReward:true}).game.id===id){C.drawGame(s,seed,1000,{extraReward:true});break;}}
 const r=C.activeRound(e);if(r?.game.id!==id)throw Error('No se encontró '+id);
 C.finishDraw(s,4000);C.presentInstructions(s);C.setRepresentatives(s,T.clone(r.representatives));if(r.game.requiredRepresentatives===2)fullAction(s,'pairs',{pairs:Object.fromEntries(e.teams.map(t=>[t.id,[r.representatives[t.id],t.members.find(p=>p!==r.representatives[t.id])]]))});C.prepareChallenge(s);return r;
}
export function playRevised(s,id,capture=()=>{}){
 const r=openRevised(s,id),e=C.activeEvent(s),f=r.full;capture();let n=10000;
 if(f.mode==='closeness')fullAction(s,'target',{value:100});
 if(!f.simultaneous){let i=0;while(r.currentTeamId){const tid=r.currentTeamId;C.startTimer(s,n);capture();if(f.mode==='position')fullAction(s,'complete',{teamId:tid},n+1000+(i%3)*1000);else {fullAction(s,'correct',{teamId:tid,cardId:f.cards[tid].id},n+1000);C.finishTimer(s,n+2000);}capture();n+=100000;i++;}}
 else {C.startTimer(s,n);capture();if(f.choiceOrder){for(const tid of f.choiceOrder)fullAction(s,'choose',{teamId:tid,index:f.choiceOrder.indexOf(tid)},n+1000);capture();fullAction(s,'reveal',{},n+2000);capture();for(const tid of f.choiceOrder)if(f.rewardCards[f.choices[tid]].kind==='challenge')fullAction(s,'reward',{teamId:tid,success:true},n+3000);}
 else if(f.mode==='closeness')e.teams.forEach((t,i)=>fullAction(s,'estimate',{teamId:t.id,value:99+i},n+1000));
 else e.teams.forEach((t,i)=>{for(let j=0;j<(id==='rebote-imposible'?3:1);j++)fullAction(s,id==='rebote-imposible'?'bounce':'complete',{teamId:t.id},n+1000+i*1000);});
 C.finishTimer(s,n+8000);capture();}
 C.reviewScores(s);capture();C.confirmScores(s,r.draft.id);capture();return r;
}
export function frames(){const s=revised(),out=[],capture=()=>out.push({state:T.clone(s),public:T.publicSnapshot(s)});for(const id of ['actor','tararea','palabras-prohibidas','hazme-sonido','roba-y-gana'])playRevised(s,id,capture);return out;}
if(process.argv[1]?.endsWith('postensayo-fixtures.js'))console.log(JSON.stringify(frames()));
