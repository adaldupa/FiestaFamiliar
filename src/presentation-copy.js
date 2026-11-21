// Reglas de presentación aprobadas en la revisión manual. Sin bancos ni estado privado.
export const TV_TEAM_GAMES=Object.freeze(['palabras-prohibidas','hazme-sonido']);
const copy={
 'palabras-prohibidas':{mode:'Representante de espaldas a la TV; su equipo da pistas',publicRules:'El representante está de espaldas a la TV y adivina. Sus compañeros describen la palabra sin decir la palabra objetivo ni ninguna de las tres prohibidas ni derivados evidentes.',steps:['Representante de espaldas a la TV.','El equipo da pistas sin decir el objetivo ni las tres prohibidas ni derivados evidentes.','Adivinen tantas palabras como puedan en 60 segundos.']},
 'hazme-sonido':{mode:'Representante de espaldas a la TV; su equipo hace sonidos',publicRules:'El representante está de espaldas a la TV y adivina la tarjeta. Sus compañeros hacen sonidos, sin palabras ni gestos.',steps:['Representante de espaldas a la TV.','El equipo hace sonidos sin palabras ni gestos.','Adivinen tantas tarjetas como puedan en 60 segundos.']}
};
export function displayedGame(g){return copy[g?.id]?{...g,...copy[g.id]}:g;}
export function teamCardAllowed(g){return TV_TEAM_GAMES.includes(g?.id)&&g?.scoring?.mode==='hits';}
