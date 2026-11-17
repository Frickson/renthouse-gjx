const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
for(const mobile of [false,true]){
const p=await b.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.TEST_URL||'http://127.0.0.1:8000/renthouse-gjx/');await p.locator('#peopleMessage').filter({hasText:'Fictional demo'}).waitFor();
for(const [id,name,ic] of [['landlordPerson','Demo Landlord (fictional)','123456-78-901234'],['witness1Person','Demo Witness A (fictional)','234567-89-012345'],['witness2Person','Demo Witness B (fictional)','345678-90-1234']]){
 const f=p.locator('#'+id);const box=p.locator('#'+id+'Choices');const fieldName=await f.getAttribute('name');const nric=p.locator(`[name=${fieldName.replace('Name','Nric')}]`);
 await f.click();await f.pressSequentially('Manual Fictional Person',{delay:10});assert.equal(await f.inputValue(),'Manual Fictional Person');
 await p.locator('.name-picker').filter({has:f}).locator('.name-toggle').click(); // close filtered list
 await p.locator('.name-picker').filter({has:f}).locator('.name-toggle').click();
 await box.getByRole('option',{name,exact:true}).click();assert.equal(await f.inputValue(),name);assert.equal(await nric.inputValue(),ic);
 await f.click();await f.press('ControlOrMeta+A');await f.press('Backspace');await f.press('ArrowDown');await f.press('Enter');assert.ok((await f.inputValue()).startsWith('Demo '));
}
for(const n of ['landlordNric','tenantNric','witness1Nric','witness2Nric']){
 const f=p.locator(`[name=${n}]`);assert.equal(await f.getAttribute('type'),'text');assert.equal(await f.getAttribute('inputmode'),'numeric');
 for(const [raw,expected] of [['001234567890','001234-56-7890'],['00123456789012','001234-56-789012'],['001234-56-7890','001234-56-7890'],['001234-56-789012','001234-56-789012']]){
 await f.click();await f.press('ControlOrMeta+A');await f.pressSequentially(raw);await f.press('Tab');assert.equal(await f.inputValue(),expected);assert.equal(await f.evaluate(e=>e.checkValidity()),true);
 }
 for(const bad of ['abc123','12345678901','123456--789012']){
 await f.click();await f.press('ControlOrMeta+A');await f.pressSequentially(bad);await f.press('Tab');assert.equal(await f.evaluate(e=>e.checkValidity()),false);
 }
 await f.fill('123456789012');await f.press('Tab');
}
await p.locator('[name=sameWitness]').check();await p.locator('#witness1Person').click();await p.locator('#witness1Person').press('ControlOrMeta+A');await p.locator('#witness1Person').pressSequentially('Manual Shared Witness');assert.equal(await p.locator('#witness2Person').inputValue(),'Manual Shared Witness');await p.locator('[name=sameWitness]').uncheck();await p.locator('#witness2Person').click();await p.locator('#witness2Person').press('ControlOrMeta+A');await p.locator('#witness2Person').pressSequentially('Independent Witness');assert.equal(await p.locator('#witness2Person').inputValue(),'Independent Witness');
assert.deepEqual(errors,[]);console.log(`${mobile?'Mobile':'Desktop'}: mouse selection, keyboard selection, typing, all IC formats/invalid values and shared witness passed`);await p.close();
}await b.close();})().catch(e=>{console.error(e);process.exit(1)});
