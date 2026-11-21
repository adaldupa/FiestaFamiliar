// Casos sintéticos generados desde el catálogo público y el motor real, sin publicar sesiones privadas.
import {readFileSync} from 'node:fs';
import * as C from '../src/contest-core.js';
import * as L from '../src/library-core.js';
import {clone,fromLegacy} from '../src/game-model.js';
import {publicSnapshot} from '../src/teams-core.js';
const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
export function buildRoundCases(){
 const now=1800000000000,s=json('../evidencia/sesion-demo-exportada.json');C.initializeContest(s,fromLegacy(json('../catalogo/actor-fase2.json'),'2026-11-16T12:00:00Z'));L.mergeLibrary(s,L.parsePublicCatalogSeed(json('../catalogo/fichas-publicas-fase2b.json')),{updateConflicts:true},now);C.createEvent(s,{approvedProposal:true,lifecycleVersion:1,selectedIds:s.contest.library.games.map(g=>g.id)},now);
 const states=[],capture=()=>states.push({state:clone(s),public:publicSnapshot(s)});capture();
 for(let seed=0;seed<300;seed++){const x=clone(s);if(C.drawGame(x,String(seed),now).game.id==='cuantos-hay'){C.drawGame(s,String(seed),now);break;}}
 capture();C.finishDraw(s,now+3000);capture();C.presentInstructions(s,now+3001);C.setRepresentatives(s,clone(C.activeRound(C.activeEvent(s)).representatives),'',now+3002);C.prepareChallenge(s,now+3003);capture();C.beginPendingExecution(s,now+4000);capture();C.closeRoundWithoutResults(s,{confirmed:true,reason:'Motor pendiente; cierre del ensayo',roundId:C.activeRound(C.activeEvent(s)).id},now+5000);capture();C.setPublicScreen(s,'standings',now+5001);capture();return states;
}
if(process.argv[1]?.endsWith('rounds-fixtures.js'))process.stdout.write(JSON.stringify(buildRoundCases()));
