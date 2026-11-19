// Contrato de ejecución. Un registro pendiente nunca ofrece un ejecutor de puntuación.
export const ENGINE_REGISTRY=Object.freeze({
 fixed:{key:'fixed-turns',mode:'fixed',operational:true,label:'Puntos fijos por éxito'},
 manual:{key:'manual-turns',mode:'manual',operational:true,label:'Captura manual por turnos'},
 position:{key:'position',mode:'position',operational:false,label:'Clasificación por posición'},
 hits:{key:'count',mode:'hits',operational:false,label:'Clasificación por cantidad de aciertos'},
 closeness:{key:'closeness',mode:'closeness',operational:false,label:'Clasificación por cercanía'},
 special:{key:'direct-awards',mode:'special',operational:false,label:'Premios directos y transferencias'}
});
export function engineFor(game){const def=ENGINE_REGISTRY[game.scoring.mode];return {...def,operational:Boolean((def?.operational||game.executionVersion===1)&&game.implementation!=='planned'),message:(def?.operational||game.executionVersion===1)&&game.implementation!=='planned'?'Motor operativo':'Motor pendiente de integración'};}
export const isOperational=round=>Boolean(round&&engineFor(round.game).operational);
export const LIFECYCLE=['preparation','spinning','selected','instructions','execution','validation','finished'];
export const LIFECYCLE_LABELS={preparation:'Preparación',spinning:'Ruleta girando',selected:'Minijuego seleccionado',instructions:'Instrucciones',execution:'En ejecución',validation:'Validación de resultados',finished:'Ronda finalizada'};
export function lifecycleAt(event){const p=event?.phase;return p==='selecting_game'?'spinning':p==='game_selected'?'selected':['selecting_representatives','presenting_rules','preparing_challenge'].includes(p)?'instructions':['timer_active','timer_paused','engine_pending'].includes(p)?'execution':['capturing_results','confirming_score'].includes(p)?'validation':['scoreboard_updated','round_finished'].includes(p)?'finished':'preparation';}
export function screenAt(event){return event?.publicScreen==='standings'?'standings':({preparation:'waiting',spinning:'wheel',selected:'selected',instructions:'instructions',execution:'execution',validation:'validation',finished:'results'}[lifecycleAt(event)]);}
export function publicRoundResult(event,round){if(!round)return null;const attempt=round.attempts.find(a=>a.status==='active');return {status:round.status==='completed'?'confirmed':round.status==='skipped'?'unscored':'pending',rows:event.teams.map(t=>({teamId:t.id,points:attempt?attempt.outcomes[t.id].points:null,...(attempt&&round.full?{place:round.full.mode==='special'||attempt.outcomes[t.id].points===0?null:5-attempt.outcomes[t.id].points/25,elapsedMs:round.full.mode==='position'?round.full.results[t.id]?.ms??null:null,hits:round.full.mode==='hits'?round.full.results[t.id]?.hits??0:null,difference:round.full.mode==='closeness'&&Object.hasOwn(round.full.estimates,t.id)?Math.abs(round.full.estimates[t.id]-round.full.target):null}: {})}))};}
