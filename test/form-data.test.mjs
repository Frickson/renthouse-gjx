import assert from 'node:assert/strict';
import {formatIC,parsePeople,inventoryLines} from '../form-data.mjs';
assert.equal(formatIC('123456789012'),'123456-78-9012');
assert.equal(formatIC('123456-78-9012'),'123456-78-9012');
assert.equal(formatIC('12345678901234'),'123456-78-901234');
assert.equal(formatIC('123456-78-901234'),'123456-78-901234');
for(const bad of ['12345678901','123456-78-901','abcdef78901234','123456--78901234'])assert.throws(()=>formatIC(bad));
assert.deepEqual(inventoryLines({inventory_airConditioners:'3',inventory_tables:'2'},'1 × Bench'),['3 × Air conditioners','2 × Tables','1 × Bench']);
assert.throws(()=>inventoryLines({inventory_tables:'1.5'}));
assert.throws(()=>inventoryLines({},Array(25).fill('x').join('\n')));
const list={version:1,people:[{id:'a',name:'Fictional A',ic:'12345678901234',roles:['landlord','witness']}]};
assert.equal(parsePeople(JSON.stringify(list))[0].ic,'123456-78-901234');
assert.throws(()=>parsePeople(JSON.stringify({...list,people:[...list.people,...list.people]})));
console.log('IC, private people schema, and quantity validation passed');

const {photoDistribution,agreementPageCount,fitContained,photoSlots}=await import('../photo-layout.mjs');
for(const [n,plan,total] of [[0,[0,0,0],9],[1,[1,0,0],10],[2,[2,0,0],10],[3,[2,1,0],11],[4,[2,2,0],11],[5,[2,2,1],12],[6,[2,2,2],12],[7,[4,2,1],12],[8,[4,2,2],12],[9,[4,4,1],12],[10,[4,4,2],12]]){
 assert.deepEqual(photoDistribution(n),plan);assert.equal(agreementPageCount(n),total);
 for(const count of plan)for(const slot of photoSlots(count))for(const [w,h] of [[800,400],[400,800]]){
  const fit=fitContained(w,h,slot);assert.ok(Math.abs(fit.w/fit.h-w/h)<1e-10);assert.ok(fit.w<=slot.w&&fit.h<=slot.h);
 }
}

const detailed={...list.people[0],address:'Example Street',phone:'00123',bank:'HLB',account:'000123'};
const parsed=parsePeople(JSON.stringify({version:1,people:[detailed]}))[0];
assert.equal(parsed.address,'Example Street');assert.equal(parsed.phone,'00123');assert.equal(parsed.bank,'HLB');assert.equal(parsed.account,'000123');
for(const extra of [{bank:'UNKNOWN'},{account:123},{phone:123},{address:'x'.repeat(241)}])assert.throws(()=>parsePeople(JSON.stringify({version:1,people:[{...detailed,...extra}]})));
