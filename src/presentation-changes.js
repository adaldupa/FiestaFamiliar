// Comparación de datos ya confirmados. No calcula ni modifica puntos.
export function scoreChanges(before,after){if(!before||before.eventId!==after?.eventId)return [];return after.teams.filter(t=>{const old=before.teams.find(x=>x.id===t.id);return old&&(old.score!==t.score||old.place!==t.place);}).map(t=>t.id);}
