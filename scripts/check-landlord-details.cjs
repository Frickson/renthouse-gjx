const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.route('**/demo-people.json',async r=>{const data=await (await r.fetch()).json();data.people.push({id:'empty',name:'Fictional No Details',ic:'123456789012',roles:['landlord']});await r.fulfill({json:data});});
await p.goto('http://127.0.0.1:8000/renthouse-gjx/');await p.locator('#peopleMessage').filter({hasText:'Fictional demo'}).waitFor();
async function choose(name){await p.locator('#landlordPerson').fill('');await p.locator('#landlordPerson').press('Escape');await p.locator('.name-picker').filter({has:p.locator('#landlordPerson')}).locator('.name-toggle').click();await p.locator('#landlordPersonChoices').getByRole('option',{name,exact:true}).click();}
await choose('Demo Landlord (fictional)');
for(const [key,v] of Object.entries({landlordAddress:'1 Fictional Demo Lane, Test City',landlordContact:'0000000000',landlordBank:'HLB',landlordAccount:'000000000000'}))assert.equal(await p.locator(`[name=${key}]`).inputValue(),v);
assert.equal(await p.locator('[name=landlordBank] option:checked').textContent(),'Hong Leong Bank');
await p.locator('[name=landlordAddress]').fill('Manual Override');await p.locator('#landlordPerson').press('Tab');assert.equal(await p.locator('[name=landlordAddress]').inputValue(),'Manual Override');
await choose('Fictional No Details');assert.equal(await p.locator('[name=landlordAddress]').inputValue(),'Manual Override');
for(const key of ['landlordContact','landlordBank','landlordAccount'])assert.equal(await p.locator(`[name=${key}]`).inputValue(),'');
await p.locator('#landlordPerson').fill('Custom Landlord');await p.locator('[name=landlordContact]').fill('001234');await p.locator('#landlordPerson').press('Tab');assert.equal(await p.locator('[name=landlordContact]').inputValue(),'001234');assert.deepEqual(errors,[]);await b.close();console.log('Landlord optional autofill, bank display, leading zeros, missing details, manual overrides and name switching passed');})().catch(e=>{console.error(e);process.exit(1)});
