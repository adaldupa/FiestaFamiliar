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
