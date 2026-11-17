/** Pure formatting helpers; the website never sends tenant details to a server. */
export function localISODate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const o = Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return `${o.year}-${o.month}-${o.day}`;
}
export function parseISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) throw new Error('Please enter a valid YYYY-MM-DD date.');
  const [y,m,d] = value.split('-').map(Number);
  const out = new Date(Date.UTC(y,m-1,d));
  if (out.getUTCFullYear()!==y || out.getUTCMonth()!==m-1 || out.getUTCDate()!==d) throw new Error('Invalid calendar date.');
  return out;
}
export function dateISO(d) { return d.toISOString().slice(0,10); }
export function plusMonthsInclusive(startDate, months) {
  if (!Number.isInteger(+months) || +months < 1 || +months > 120) throw new Error('Duration must be 1–120 months.');
  const start = parseISODate(startDate);
  const y = start.getUTCFullYear(), m=start.getUTCMonth(), d=start.getUTCDate();
  const target = new Date(Date.UTC(y,m + Number(months),1));
  const max = new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
  const anniversary=new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(),Math.min(d,max)));
  anniversary.setUTCDate(anniversary.getUTCDate()-1);
  return dateISO(anniversary);
}
export function ordinal(n){return `${n}${(n%100>=11&&n%100<=13)?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th')}`;}
export function formatLongDate(iso){const d=parseISODate(iso);return `${ordinal(d.getUTCDate())} ${d.toLocaleString('en-GB',{month:'long',timeZone:'UTC'})} ${d.getUTCFullYear()}`;}
export function formatShortDate(iso){const d=parseISODate(iso);return `${ordinal(d.getUTCDate())} ${d.toLocaleString('en-GB',{month:'short',timeZone:'UTC'})} ${d.getUTCFullYear()}`;}
const ONES=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const TENS=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
export function integerWords(n){
 if (!Number.isSafeInteger(n)||n<0||n>999999999) throw new Error('Amount must be below RM 1 billion.');
 if(n===0)return 'Zero';
 const small=(x)=>{let a=[];if(x>=100){a.push(ONES[Math.floor(x/100)]+' Hundred');x%=100;}if(x>=20){a.push(TENS[Math.floor(x/10)]);x%=10;}if(x>0)a.push(ONES[x]);return a.join(' ')};
 let out=[];for(const [scale,num] of [['Million',1000000],['Thousand',1000],['',1]]){const part=Math.floor(n/num);if(part){out.push(small(part)+(scale?' '+scale:''));n%=num;}}
 return out.join(' ');
}
export function moneyWords(amount) {
 const val=Number(amount);if(!Number.isFinite(val)||val<0||val>999999999)throw new Error('Please enter a valid non-negative RM amount.');
 const cents=Math.round(val*100), whole=Math.floor(cents/100),sen=cents%100;
 return `Ringgit Malaysia ${integerWords(whole)}${sen?' and '+integerWords(sen)+' Sen':''} Only`;
}
export function moneyNumber(amount) {
 const val=Number(amount);if(!Number.isFinite(val)||val<0||val>999999999)throw new Error('Please enter a valid amount.');
 return val.toLocaleString('en-MY',{minimumFractionDigits:val%1?2:0,maximumFractionDigits:2});
}
export function durationWords(months){const m=Number(months); if(m%12===0){const y=m/12;return `${integerWords(y)} (${y}) ${y===1?'year':'years'}`;}return `${integerWords(m)} (${m}) ${m===1?'month':'months'}`;}
