// Entrada humana de tiempos; el dominio sigue recibiendo milisegundos enteros.
export function parseDuration(value){
 const s=String(value??'').trim().replace(',','.');if(!s)return null;
 let seconds;
 if(/^\d+(?:\.\d{1,3})?$/.test(s))seconds=Number(s);
 else {const m=s.match(/^(\d{1,2}):([0-5]\d)(?:\.(\d{1,3}))?$/);if(!m)throw Error('Usa segundos (12.5) o mm:ss (01:12.500). Vacío significa no completó.');seconds=Number(m[1])*60+Number(m[2])+Number('0.'+(m[3]||'0'));}
 if(!Number.isFinite(seconds)||seconds<0||seconds>3600)throw Error('Tiempo entre 0 y 3600 segundos.');return Math.round(seconds*1000);
}
