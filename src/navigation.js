// Estado de interfaz por dispositivo. Nunca escribe la sesión ni el cronómetro.
export const SECTIONS=[['inicio','Inicio'],['participantes','Participantes'],['equipos','Equipos'],['concurso','Concurso'],['biblioteca','Biblioteca'],['resultados','Resultados']];
export const TEAM_STEPS=[['configuracion','1 · Configurar'],['sorteo','2 · Bombos y sorteo'],['revision','3 · Revisar y confirmar']];
const KEY='retos.conductor.navigation.v1';
export function readNavigation(storage){
 let raw;try{raw=JSON.parse(storage.getItem(KEY));}catch{}
 return {section:SECTIONS.some(([id])=>id===raw?.section)?raw.section:'inicio',step:TEAM_STEPS.some(([id])=>id===raw?.step)?raw.step:'configuracion'};
}
export function changeNavigation(view,{section=view.section,step=view.step},storage){
 if(!SECTIONS.some(([id])=>id===section)||!TEAM_STEPS.some(([id])=>id===step))return false;
 view.section=section;view.step=step;
 try{storage?.setItem(KEY,JSON.stringify(view));}catch{} // Bloquear almacenamiento no impide navegar.
 return true;
}
export function renderNavigation(view){return `<nav class="section-nav" aria-label="Secciones del conductor">${SECTIONS.map(([id,label],i)=>`<button type="button" data-section="${id}" aria-controls="section-${id}" ${view.section===id?'aria-current="page"':''}><span aria-hidden="true">0${i+1}</span>${label}</button>`).join('')}</nav>`;}
export function renderTeamSteps(view){return `<nav class="team-steps" aria-label="Pasos de equipos">${TEAM_STEPS.map(([id,label])=>`<button type="button" data-team-step="${id}" aria-controls="team-${id}" ${view.step===id?'aria-current="step"':''}>${label}</button>`).join('')}</nav>`;}
export function applyNavigation(root,view,{focus=false}={}){
 for(const panel of root.querySelectorAll('[data-section-panel]'))panel.hidden=panel.dataset.sectionPanel!==view.section;
 for(const panel of root.querySelectorAll('[data-team-panel]'))panel.hidden=panel.dataset.teamPanel!==view.step;
 for(const button of root.querySelectorAll('.section-nav [data-section]')){
  if(button.dataset.section===view.section)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
 }
 for(const button of root.querySelectorAll('[data-team-step]')){
  if(button.dataset.teamStep===view.step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
 }
 // Cerrar tarjetas privadas al salir del concurso, sin cambiar los formularios.
 if(view.section!=='concurso')for(const card of root.querySelectorAll('.secret-card'))card.open=false;
 if(focus){const panel=root.querySelector(`[data-section-panel="${view.section}"]`);const heading=panel?.querySelector('[data-section-title]');heading?.focus({preventScroll:true});panel?.scrollIntoView({block:'start',behavior:'instant'});}
}
