// Utilidad pública: estima el reloj del anfitrión a partir de una respuesta HTTP local.
export function calculateOffset(sentAt,receivedAt,serverAt){if(![sentAt,receivedAt,serverAt].every(Number.isFinite)||receivedAt<sentAt||receivedAt-sentAt>10000)return null;return serverAt-(sentAt+receivedAt)/2;}
export function createServerClock(){let offset=0;return {now:()=>Date.now()+offset,sample(sentAt,receivedAt,header){if(header===null)return;const next=calculateOffset(sentAt,receivedAt,Number(header));if(next!==null)offset=next;}};}
