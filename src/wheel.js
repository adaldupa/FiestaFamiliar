// Geometría compartida de presentación; no tiene acceso a sesión ni catálogo.
export function rotationFor(index,count,turns=6) {
  if(!Number.isInteger(count)||count<1||!Number.isInteger(index)||index<0||index>=count)throw Error('Casilla de ruleta inválida.');
  const center=(index+.5)*360/count;
  return turns*360+(360-center)%360;
}
export function indexAtRotation(rotation,count){
  const angle=(((-rotation)%360)+360)%360;
  return Math.min(count-1,Math.floor(angle/(360/count)));
}
export function presentationMode(s,now=Date.now()) {
  if(s.presentation?.opening&&now<s.presentation.opening.startedAt+3000)return 'opening';
  if(s.presentation?.view==='welcome')return 'welcome';
  if(s.phase==='representatives')return 'representatives';
  const w=s.wheel;
  if(w&&now<w.startedAt+w.duration)return 'wheel';
  if(w&&now<w.startedAt+w.duration+w.revealFor)return 'reveal';
  if(s.phase==='awards')return 'awards';
  if(s.challenge)return 'challenge';
  if(s.teams?.length)return s.phase==='results'?'results':'teams';
  return 'welcome';
}
// Renderer de datos públicos: la animación representa una selección ya calculada.
export function renderWheel(w,now=Date.now(),reduced=false){
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const candidates=w?.candidates||[];if(!candidates.length)return '<p>No hay minijuegos elegibles.</p>';
 const progress=reduced||!w.duration?1:Math.max(0,Math.min(1,(now-w.startedAt)/w.duration)),rotation=(w.rotation||0)*(1-Math.pow(1-progress,4));
 return `<div class="wheel-assembly" aria-label="Ruleta de ${candidates.length} minijuegos"><span class="wheel-pointer" aria-hidden="true">▼</span><div class="contest-wheel labelled-wheel" style="--rotation:${rotation}deg;background:conic-gradient(${candidates.map((_,i)=>`${['#801d2c','#164c39','#876526','#352f59'][i%4]} ${i*360/candidates.length}deg ${(i+1)*360/candidates.length}deg`).join(',')})">${candidates.map((x,i)=>`<span class="wheel-label" style="--angle:${(i+.5)*360/candidates.length}deg">${esc(x.title)}</span>`).join('')}<b class="wheel-center" aria-hidden="true">✦</b></div></div>`;
}
