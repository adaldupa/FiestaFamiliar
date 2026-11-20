// Parámetros de Roba y Gana: seis identidades fijas, importes congelados por aparición.
export const DEFAULT_REWARDS=Object.freeze({giftA:100,giftB:75,stealA:50,stealB:25,challengeA:100,challengeB:50});
export const REWARD_SLOTS=Object.freeze(['giftA','giftB','stealA','stealB','challengeA','challengeB']);
const need=(v,m)=>{if(!v)throw Error(m);};
export function validateRewardAmounts(a,limits={min:-1000,max:1000}){
 need(a&&typeof a==='object'&&!Array.isArray(a)&&Object.keys(a).length===6&&REWARD_SLOTS.every(k=>Object.hasOwn(a,k)&&Number.isInteger(a[k])&&a[k]>=1&&a[k]<=limits.max),'Los seis importes deben ser enteros positivos dentro del máximo aprobado de la ficha.');
 need(a.stealA+a.stealB<=-limits.min,'La suma de los dos robos supera el descuento máximo aprobado de la ficha.');return a;
}
export function rewardCards(a){return REWARD_SLOTS.map((slot,i)=>({slot,kind:i<2?'gift':i<4?'steal':'challenge',amount:a[slot],...(i>=4?{challengeIndex:i-4}:{})}));}
export function rewardSetup(e,g){const a={...(e.settings.rewardAmounts||DEFAULT_REWARDS)};validateRewardAmounts(a,g.scoring);return {rewardSchema:1,rewardAmounts:a,rewardCards:rewardCards(a)};}
export function challengeIndex(c){return c.challengeIndex??(c.amount===100?0:1);}
export function validateRewardDeck(f,g){
 validateRewardAmounts(f.rewardAmounts,g.scoring);need(f.rewardSchema===1&&Array.isArray(f.rewardCards)&&f.rewardCards.length===6&&new Set(f.rewardCards.map(c=>c.slot)).size===6,'Baraja configurable inválida.');const expected=rewardCards(f.rewardAmounts);
 for(const c of f.rewardCards){const match=expected.find(x=>x.slot===c.slot);need(match&&match.kind===c.kind&&match.amount===c.amount&&match.challengeIndex===c.challengeIndex,'La tarjeta no coincide con el importe congelado.');}
}
