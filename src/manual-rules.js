// Revisión aprobada el 20-11-2026. Se instala como nuevas revisiones de Biblioteca.
// No muta catálogos originales ni instantáneas de eventos ya creados.
export function manualCatalog(catalog){
 const c=JSON.parse(JSON.stringify(catalog));
 for(const g of c.games){
  if(!['actor','tararea','roba-y-gana','hazme-sonido','palabras-prohibidas'].includes(g.id))continue;
  g.approvedCatalogRevision=String(g.approvedCatalogRevision)+':manual-20261120';g.manualRevision=1;
  if(['actor','tararea'].includes(g.id)){
   g.executionMode='turns';g.mode='Un equipo por turno; gana el menor tiempo válido';
   g.publicRules=g.id==='actor'?'Un representante recibe personaje, acción y lugar en privado. Sin hablar, representa los tres elementos para su equipo. Hasta 90 segundos por turno; gana el menor tiempo.':'Un representante recibe una canción privada y puede cambiarla antes de iniciar. Tararea sin palabras para su equipo. Hasta 60 segundos por turno; gana el menor tiempo.';
   g.steps=g.id==='actor'?['Un equipo por turno; tarjeta privada para su representante.','Representa personaje, acción y lugar sin hablar.','El conductor registra el tiempo al adivinar los tres elementos.']:['Un equipo por turno; canción privada para su representante.','Puede cambiar una canción desconocida antes de iniciar.','Tararea sin palabras; el conductor registra acierto y tiempo.'];
   g.privateInstructions='Mostrar solo al representante del equipo en turno. Nunca proyectar la tarjeta en TV.';
  }
  if(g.id==='hazme-sonido'||g.id==='palabras-prohibidas'){
   g.executionMode='turns';g.mode='Representante de espaldas a la TV; sus compañeros dan pistas';
   g.publicRules=g.id==='hazme-sonido'?'El representante está de espaldas a la TV y adivina. Sus compañeros hacen sonidos, sin palabras ni gestos. 60 segundos por equipo; gana el mayor número de aciertos.':'El representante está de espaldas a la TV y adivina. Sus compañeros dan pistas sin decir el objetivo, las tres prohibidas ni derivados evidentes. 60 segundos por equipo; gana el mayor número de aciertos.';
   g.steps=['Representante de espaldas a la TV; sus compañeros ven la tarjeta.',g.id==='hazme-sonido'?'Solo sonidos: sin palabras ni gestos.':'Sin objetivo, prohibidas ni derivados evidentes.',g.id==='hazme-sonido'?'Correcto o Pasar avanzan de tarjeta; no se repiten.':'Correcto, Pasar o infracción confirmada avanzan de tarjeta; no se repiten.'];
   g.privateInstructions='La tarjeta es pública para el equipo en TV, oculta al representante de espaldas.';
  }
  if(g.id==='roba-y-gana'){
   g.mode='Elecciones por clasificación; revelación simultánea';
   g.publicRules='Seis tarjetas ocultas. Eligen por clasificación, del primero al último; empate: orden de equipos. Cada equipo elige una diferente. Todas se revelan juntas. Premios y robos automáticos; retos confirmados por el conductor.';
   g.steps=['Cada equipo elige en su turno una tarjeta libre.','Se revelan las seis juntas, incluidas las no elegidas.','Los retos esperan confirmación; el marcador se aplica una sola vez tras revisión.'];
  }
 }
 return c;
}
