/** Form values remain in memory; this module performs no network or storage access. */
export const BANKS = Object.freeze({MB:'Maybank', HLB:'Hong Leong Bank', CIMB:'CIMB Bank Sdn Bhd'});
export const INVENTORY = Object.freeze([
  ['airConditioners','Air conditioners'], ['airconControllers','Air conditioner controllers'],
  ['kitchenCabinet','Kitchen cabinet sets'], ['masterWardrobe','Wardrobe sets (master bedroom)'],
  ['secondWardrobe','Wardrobe sets (second bedroom)'], ['queenBeds','Queen size beds'],
  ['queenMattresses','Queen size mattresses'], ['ceilingFans','Ceiling fans'],
  ['fanControllers','Ceiling fan controllers'], ['hoodAndHob','Kitchen hood and hob sets'],
  ['waterHeaters','Water heaters'], ['refrigerators','Refrigerators'],
  ['washingMachines','Washing machines'], ['sofas','Sofa sets'],
  ['curtains','Full house curtain sets'], ['tables','Tables'], ['chairs','Chairs'],
]);
export function inventoryLines(entries, extra='') {
  const lines=INVENTORY.flatMap(([id,label])=>{
    const raw=entries[`inventory_${id}`];
    const n=raw===''||raw==null?0:Number(raw);
    if(!Number.isInteger(n)||n<0||n>999)throw new Error('Inventory quantities must be whole numbers from 0 to 999.');
    return n?[`${n} × ${label}`]:[];
  });
  lines.push(...extra.split(/\r?\n/).map(x=>x.trim()).filter(Boolean));
  if(lines.length>24)throw new Error('Use 24 inventory rows or fewer, including additional items.');
  return lines;
}
export function formatIC(raw) {
 const s=String(raw).trim();
 if(!/^(?:\d{12}|\d{14}|\d{6}-\d{2}-(?:\d{4}|\d{6}))$/.test(s))throw new Error('Enter 12 or 14 digits, optionally formatted as 6-2-4 or 6-2-6.');
 const digits=s.replaceAll('-','');
 return `${digits.slice(0,6)}-${digits.slice(6,8)}-${digits.slice(8)}`;
}
export function parsePeople(text) {
 const data=JSON.parse(text);
 if(data.version!==1||!Array.isArray(data.people)||data.people.length>200)throw new Error('Use version 1 with a people list (up to 200 people).');
 const ids=new Set();
 return data.people.map(p=>{
  if(!p||typeof p.id!=='string'||!p.id.trim()||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>100||typeof p.ic!=='string'||!Array.isArray(p.roles)||!p.roles.length||p.roles.some(r=>!['landlord','witness'].includes(r)))throw new Error('Each person needs a unique id, name, IC string, and landlord/witness roles.');
  const details={};
  for(const [key,max] of [['address',240],['phone',50],['bank',10],['account',40]]){
   if(p[key]===undefined)continue;
   if(typeof p[key]!=='string'||p[key].length>max)throw new Error(`Invalid ${key} in people list.`);
   details[key]=p[key].trim();
  }
  if(details.bank&&!Object.hasOwn(BANKS,details.bank))throw new Error('Unsupported bank code in people list.');
  ids.add(p.id);return {id:p.id,name:p.name.trim(),ic:formatIC(p.ic),roles:p.roles,...details};
 });
}
