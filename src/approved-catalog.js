import {saveGame} from './library-core.js';
import {clone} from './game-model.js';
// Añade revisiones: nunca reescribe instantáneas de eventos ni revisiones anteriores.
export function installApproved(s,catalog,now=Date.now()){
 if(!s.contest)throw Error('Primero inicializa la biblioteca.');
 for(const template of catalog.games){const old=s.contest.library.games.find(g=>g.id===template.id);if(old?.executionVersion===1&&old.approvedCatalogRevision===template.approvedCatalogRevision)continue;saveGame(s,clone(template),{expectedVersion:old?.ruleVersion??null,reason:'Catálogo definitivo aprobado de doce minijuegos'},now);}
}
