// Presentación pública: recibe únicamente DTO saneado, sin acceso al catálogo privado.
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const rewardTitle=c=>c.kind==='gift'?`Ganar ${c.amount} puntos`:c.kind==='steal'?`Robar ${c.amount} puntos`:`Reto por ${c.amount} puntos`;
export function renderRewardBoard(x,teams){
 if(!x?.selection)return '';
 const team=id=>teams.find(t=>t.id===id)?.name||'Sin elegir',sel=x.selection;
 if(!x.rewards)return `<section class="reward-board" style="--reward-teams:${teams.length}"><h2>${sel.activeTeamId?`Elige ${esc(team(sel.activeTeamId))}`:'Elecciones completas · esperando revelación'}</h2><div class="reward-grid">${sel.cards.map(c=>`<article class="reward-tile facedown"><strong>${c.index+1}</strong><span>${c.teamId?esc(team(c.teamId)):'Disponible'}</span></article>`).join('')}</div></section>`;
 const tile=c=>`<article class="reward-tile revealed"><span>Tarjeta ${c.index+1}</span><h3>${esc(c.teamId?team(c.teamId):'Sin elegir')}</h3><strong>${esc(rewardTitle(c))}</strong>${c.challenge?`<p>${esc(c.challenge)}</p>`:''}</article>`;
 return `<section class="reward-board" style="--reward-teams:${teams.length}"><h2>Resultados por equipo · pendientes de confirmar al marcador</h2><div class="reward-grid">${sel.order.map(tid=>x.rewards.find(c=>c.teamId===tid)).filter(Boolean).map(tile).join('')}</div><details class="unclaimed-rewards" open><summary>Tarjetas que nadie eligió</summary><div class="reward-grid">${x.rewards.filter(c=>!c.teamId).map(tile).join('')}</div></details></section>`;
}
