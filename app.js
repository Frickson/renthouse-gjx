import {setupNamePicker} from './name-picker.mjs';
import {BANKS, INVENTORY, inventoryLines, formatIC, parsePeople} from './form-data.mjs';
import {jpegPDF} from './pdfwriter.mjs';
import {localISODate, plusMonthsInclusive, formatLongDate, formatShortDate, moneyWords, moneyNumber, durationWords, ordinal, integerWords} from './utils.mjs';
import {photoDistribution, photoSlots, fitContained, agreementPageCount} from './photo-layout.mjs';

const $ = sel => document.querySelector(sel);
const form = $('#agreementForm');
const status = $('#formMessage');
for(const [id,label] of INVENTORY){
 const row=document.createElement('label');row.className='inventory-row';
 const caption=document.createElement('span');caption.textContent=label;row.append(caption);
 const input=document.createElement('input');input.name=`inventory_${id}`;input.type='number';input.min='0';input.max='999';input.step='1';input.value='0';input.inputMode='numeric';
 row.append(input);$('#inventoryFields').append(row);
}
const button = $('#generateBtn');
const downloadBox = document.createElement('div');
downloadBox.className = 'download-result';
downloadBox.id = 'downloadResult';
downloadBox.hidden = true;
downloadBox.innerHTML = '<strong>PDF generated successfully</strong><span>Unsigned pages — ready to review and save.</span><div class="download-actions"><a id="downloadLink" class="download-link" download="Tenancy_Agreement.pdf">Download PDF ↓</a><a id="previewLink" target="_blank" rel="noopener">Open PDF preview ↗</a></div>';
form.querySelector('.actions').insertAdjacentElement('afterend', downloadBox);

let people=[];
const icNames=['landlordNric','tenantNric','witness1Nric','witness2Nric'];
function validateIC(input, normalize=false){
 input.setCustomValidity('');
 if(!input.value.trim())return;
 try{const formatted=formatIC(input.value);if(normalize)input.value=formatted;}
 catch(error){input.setCustomValidity(error.message);}
}
for(const name of icNames){
 field(name).addEventListener('input',()=>validateIC(field(name)));
 field(name).addEventListener('blur',()=>{validateIC(field(name),true);if(name==='witness1Nric')updateWitness();});
}
const selectors=[['landlordPerson','landlord','landlordName','landlordNric'],['witness1Person','witness','witness1Name','witness1Nric'],['witness2Person','witness','witness2Name','witness2Nric']];
function populatePeople(next){
 people=next;
 for(const [id,role] of selectors){
  const list=$('#'+id+'Options');list.replaceChildren();
  for(const p of people.filter(p=>p.roles.includes(role))){
   const option=new Option(p.name,p.name);option.dataset.ic=p.ic;list.append(option);
  }
 }
}
function autofillPerson(id,ic){
 const input=$('#'+id);
 const option=Array.from($('#'+id+'Options').options).find(p=>p.value.toLowerCase()===input.value.trim().toLowerCase());
 const previous=input.dataset.autofilledIc;
 if(option){set(ic,formatIC(option.dataset.ic));input.dataset.autofilledIc=field(ic).value;}
 else if(previous&&field(ic).value===previous){set(ic,'');delete input.dataset.autofilledIc;}
 validateIC(field(ic));
}
fetch('demo-people.json').then(response=>{
 if(!response.ok)throw new Error('Demo list unavailable');
 return response.text();
}).then(text=>{
 populatePeople(parsePeople(text));
 $('#peopleMessage').textContent='Fictional demo names loaded. Select a landlord or witness name to try autofill.';
}).catch(()=>{
 $('#peopleMessage').textContent='Using built-in demo names. You can also type any name and IC manually.';
});
for(const [id,role,name,ic] of selectors){
 setupNamePicker($('#'+id));
 const onNameChange=()=>{
  autofillPerson(id,ic);
  if(id==='witness1Person')updateWitness();
  updatePreview();clearGenerated();
 };
 $('#'+id).addEventListener('input',onNameChange);
 $('#'+id).addEventListener('change',onNameChange);
}

let currentObjectURL = null;
let syncing = false;
let endManual = false;
let generatedFile = null;
const PAGE_W = 595.44, PAGE_H = 841.68, RENDER_SCALE = 2;

function field(name) {return form.elements.namedItem(name)}
function value(name) {
 const input=field(name);
 return String(input?.value ?? '').trim();
}
function set(name, val) {field(name).value = String(val)}
const el = (id,v) => { const e=document.getElementById(id); if(e) e.textContent = v };
function updateTerm() {
  if (syncing) return;
  const start=value('startDate'), months=value('durationMonths');
  if (start && months && !endManual) {
    try {set('endDate',plusMonthsInclusive(start,Number(months)))} catch {}
  }
}
function updateWitness() {
 if(!field('sameWitness').checked) return;
 set('witness2Name',field('witness1Name').value);
 set('witness2Nric',value('witness1Nric'));
 field('witness2Nric').setCustomValidity(field('witness1Nric').validationMessage);
 $('#witness2Person').value=$('#witness1Person').value;
}
function updatePreview() {
  const safe = (x,fallback='—')=>value(x)||fallback;
  el('previewLandlord',safe('landlordName','LANDLORD'));
  el('previewTenant',safe('tenantName','TENANT'));
  el('previewAddress',safe('propertyAddress','PROPERTY ADDRESS'));
  el('previewRent',value('monthlyRent') ? `RM ${moneyNumber(value('monthlyRent'))}` : '—');
  el('previewTerm',`${safe('durationMonths','12')} months`);
  el('previewEnd',value('endDate') ? formatShortDate(value('endDate')) : '—');
  el('previewDates',value('startDate')&&value('endDate')?`${formatShortDate(value('startDate'))} – ${formatShortDate(value('endDate'))}`:'—');
}
function updatePhotoLayout() {
  const count=field('photos').files?.length||0;
  const hint=$('#photoLayoutSummary');
  if(count>10){hint.textContent=`${count} selected — please choose at most 10.`;hint.classList.add('warning');return;}
  hint.classList.remove('warning');
  const distribution=photoDistribution(count);
  const total=agreementPageCount(count);
  el('pageCount',`${total} PAGES`);
  hint.textContent=count?`${count} photo${count===1?'':'s'}: ${distribution.map((n,i)=>n?`page ${10+i} (${n})`:null).filter(Boolean).join(', ')}. ${total} pages total; no blank photo pages.`:'0 photos selected. 9 agreement pages; no photo appendix.';
}
function clearGenerated() {
  if(currentObjectURL) URL.revokeObjectURL(currentObjectURL);
  currentObjectURL=null; generatedFile=null;downloadBox.hidden=true;
}
const today=localISODate();
set('agreementDate',today);set('startDate',today);set('endDate',plusMonthsInclusive(today,12));
form.addEventListener('input', event=> {
  if (event.target.name==='endDate') endManual=true;
  if(event.target.name==='startDate'||event.target.name==='durationMonths') {endManual=false;updateTerm();}
  if(['witness1Name','witness1Nric'].includes(event.target.name))updateWitness();
  updatePreview();if(generatedFile)clearGenerated();
});
field('sameWitness').addEventListener('change',()=>{field('witness2Nric').readOnly=field('sameWitness').checked;field('witness2Name').readOnly=field('sameWitness').checked;updateWitness(); if(generatedFile)clearGenerated()});
field('photos').addEventListener('change',()=>{updatePhotoLayout(); if(generatedFile)clearGenerated()});
$('#autoDeposit').addEventListener('click',()=>{
  const rent=Number(value('monthlyRent')); if(!Number.isFinite(rent)||rent<=0){status.textContent='Enter the monthly rental first.';return;}
  set('securityDeposit',(rent*2).toFixed(2));set('utilitiesDeposit',(rent/2).toFixed(2));
  updatePreview();if(generatedFile)clearGenerated();status.textContent='Suggested deposits filled; you can change them.';
});
updatePreview();
updatePhotoLayout();

function read() {
 const o=Object.fromEntries(new FormData(form));
 for(const [, ,name] of selectors)o[name]=value(name);
 for(const name of icNames)if(o[name]?.trim())o[name]=formatIC(o[name]);
 if(o.landlordBank&&!Object.hasOwn(BANKS,o.landlordBank))throw new Error('Select a supported bank.');
 for(const name of ['monthlyRent','securityDeposit','utilitiesDeposit','accessDeposit']){
   o[name]=Number(o[name]);if(!Number.isFinite(o[name])||o[name]<0||o[name]>999999999)throw new Error(`Please enter a valid ${name}.`);
 }
 o.durationMonths=Number(o.durationMonths);o.dueDay=Number(o.dueDay);
 if(!Number.isInteger(o.dueDay)||o.dueDay<1||o.dueDay>28)throw new Error('Rent due day must be from 1 to 28.');
 if(!Number.isInteger(o.durationMonths)||o.durationMonths<1||o.durationMonths>120)throw new Error('Duration must be 1–120 months.');
 if(o.startDate>o.endDate)throw new Error('Tenancy end date cannot be earlier than the start date.');
 if(o.sameWitness){o.witness2Name=o.witness1Name; o.witness2Nric=o.witness1Nric;}
 o.inventory=inventoryLines(o,o.inventory||'');
 if(o.inventory.length>24)throw new Error('Use 24 inventory rows or fewer.');
 if((field('photos').files?.length||0)>10)throw new Error('You can upload up to 10 photos.');
 return o;
}

function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Failed to load the blank tenancy template.'));img.src=src;});}
async function loadPhoto(file){
 if(!['image/png','image/jpeg'].includes(file.type))throw new Error('Use JPG or PNG property photos.');
 if(file.size>15*1024*1024)throw new Error('Individual photos must be below 15 MB.');
 const object=URL.createObjectURL(file);
 try{return await loadImage(object)}finally{URL.revokeObjectURL(object)}
}

// Coordinates use the same 595.44 x 841.68 point reference as the original PDF.
// Rasterized blank page backgrounds preserve the legal copy and original pagination.
function paintPage(ctx,i,d,photos,photoPages) {
 const text=(s,x,y,{size=11,bold=false,italic=false,align='left',color='#121212',maxWidth}={})=>{
   ctx.font = `${italic?'italic ':''}${bold?'bold ':''}${size}px "Times New Roman", Times, serif`;
   ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillStyle=color;
   if(maxWidth && ctx.measureText(String(s)).width>maxWidth){
     let sz=size;while(sz>6.4&&ctx.measureText(String(s)).width>maxWidth){sz-=.25;ctx.font=`${italic?'italic ':''}${bold?'bold ':''}${sz}px "Times New Roman", Times, serif`;}
   }
   ctx.fillText(String(s),x,y,maxWidth);
 };
 const wrap=(s,x,y,w,{size=11,bold=false,italic=false,line=13,maxLines=3}={})=>{
   const words=String(s).replace(/\s+/g,' ').trim().split(' '),lines=[];
   ctx.font=`${italic?'italic ':''}${bold?'bold ':''}${size}px "Times New Roman", Times, serif`;
   let l='';
   for(const word of words){const next=l?l+' '+word:word; if(ctx.measureText(next).width>w&&l){lines.push(l);l=word;}else l=next;}
   if(l)lines.push(l);
   if(lines.length>maxLines)throw new Error(`Text too long for page ${i+1}. Please shorten: ${s.slice(0,42)}...`);
   lines.forEach((z,j)=>text(z,x,y+j*line,{size,bold,italic,maxWidth:w}));
   return lines.length;
 };
 const rule=(x1,y1,x2,y2)=>{ctx.beginPath();ctx.strokeStyle='#222';ctx.lineWidth=.5;ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
 const footer=()=>{const x=i<6?90:79.5; text('Tenancy Agreement',x,781.3,{size:11,bold:true,italic:true});text(`Landlord: ${d.landlordName}`,x,792.7,{size:11,bold:true,italic:true,maxWidth:470});text(`Tenant: ${d.tenantName}`,x,804.2,{size:11,bold:true,italic:true,maxWidth:470});};
 if(i===0){
   // Cover's date and party sections: center on original locations.
   ctx.fillStyle='#fff';ctx.fillRect(207,50,220,39); // remove detached original glyph fragments
   text('This Agreement is made on the',297.7,64.2,{size:14,align:'center'});
   text(formatLongDate(d.agreementDate),297.7,80.9,{size:14,bold:true,align:'center',maxWidth:320});
   text(d.landlordName.toUpperCase(),305,207,{size:16,bold:true,align:'center',maxWidth:365});
   text(`(NRIC No: ${d.landlordNric}) - The Landlord`,305,225,{size:15,align:'center',maxWidth:400});
   text(d.tenantName.toUpperCase(),305,328,{size:16,bold:true,align:'center',maxWidth:365});
   text(`(NRIC No: ${d.tenantNric}) - The Tenant`,305,346,{size:15,align:'center',maxWidth:400});
   // Re-center property lines within box so they follow the original cover design.
   ctx.fillStyle='#fff';ctx.fillRect(157,558,298,70);
   const words=d.propertyAddress.toUpperCase().replace(/\s+/g,' ').trim().split(' '),lines=[];
   ctx.font='12px "Times New Roman",Times,serif';let line='';
   for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>294&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);
   if(lines.length>3)throw new Error('Property address is too long for the cover (maximum 3 lines).');
   lines.forEach((l,n)=>text(l,305,576+n*15,{size:12,align:'center',maxWidth:290}));
 }
 if(i===1){ text(` is made on this ${formatShortDate(d.agreementDate)}`,330,72,{size:10.5,maxWidth:194}); }
 if(i===6){
   const signatures=[
     [d.landlordName,d.landlordNric,187.4,200,213],
     [d.witness1Name||'',d.witness1Nric||'',339.2,352,365],
     [d.tenantName,d.tenantNric,503.2,516,529],
     [d.witness2Name||'',d.witness2Nric||'',642.7,655,668]
   ];
   for(const [index, [name,nric,yLine,yName,yNric]] of signatures.entries()){
     if (index !== 3) rule(228,yLine,366,yLine); // fourth line is already in blank source page
     text(`Name : ${name}`,228,yName,{size:11,maxWidth:350});
     text(`(NRIC NO : ${nric})`,228,yNric,{size:11,maxWidth:350});
   }
 }
 if(i===7){
   rule(520.2,88,520.2,721.8); // restore right table border erased during safe redaction
   const size=11;
   const line=(str,x,y,w=360,opt={})=>text(str,x,y,{size,maxWidth:w,...opt});
   line('Landlord',159.9,109.6,320,{bold:false});
   line(`Name     :   ${d.landlordName}`,159.9,122,352);
   line(`NRIC No  :   ${d.landlordNric}`,159.9,135,352);
   wrap(`Address  :   ${d.landlordAddress}`,159.9,148.2,349,{size:10.8,line:12,maxLines:2});
   line(`Contact  :   ${d.landlordContact||'—'}`,159.9,173.2,349);
   line(`Bank Account No : ${[d.landlordBank,d.landlordAccount].filter(Boolean).join(' ')||'—'}`,159.9,192.1,353);
   line(`Name     :   ${d.tenantName}`,159.9,247,352);
   line(`NRIC No  :   ${d.tenantNric}`,159.9,260,352);
   wrap(`Address  :   ${d.tenantAddress}`,159.9,273,349,{size:10.7,line:12,maxLines:2});
   line(`Contact  :   ${d.tenantContact||'—'}`,159.9,298,353);
   wrap(`Address:  ${d.propertyAddress}`,159.9,362.6,350,{size:10.8,line:14,maxLines:2});
   line(`${durationWords(d.durationMonths)} commencing ${formatShortDate(d.startDate)} and`,159.9,448,352);
   line(`expiring ${formatShortDate(d.endDate)}.`,159.9,463,353);
   line(`Monthly Rental : RM ${moneyNumber(d.monthlyRent)}`,159.9,490.1,350);
   line(`(${moneyWords(d.monthlyRent)})`,159.9,509,355);
   line(`Due and payable on or before ${d.dueDay} (${integerWords(d.dueDay).toLowerCase()}) day of each month.`,159.9,528.1,355,{bold:true,size:10.5});
   line(`Rental / Security Deposit : RM ${moneyNumber(d.securityDeposit)}`,159.9,570.1,352);
   line(`(${moneyWords(d.securityDeposit)})`,159.9,583.1,354);
   line(`Utilities (Water & Electricity) Deposit : RM ${moneyNumber(d.utilitiesDeposit)}`,159.9,625.5,352,{size:10.3});
   line(`(${moneyWords(d.utilitiesDeposit)})`,159.9,645,354);
   line(`Access Card Deposit : RM ${moneyNumber(d.accessDeposit)}`,159.9,682.5,354);
   line(`(${moneyWords(d.accessDeposit)})`,159.9,701.4,354);
 }
 if(i===8){
   // Rebuild table lines removed with previous renter data on this page.
   rule(142.3,83.28,520.3,83.28);
   rule(520.3,36.2,520.3,146.4);
   wrap(d.permittedUse,159.9,77,345,{size:10.7,line:11,maxLines:1});
   wrap(d.renewalOption,159.9,124,352,{size:10.7,line:13,maxLines:2});
   text(d.propertyAddress,132.9,214.2,{size:10.6,maxWidth:355});
   for(const [n,item] of d.inventory.entries()){
     text(`${n+1}.`,79.5,248.2+n*20.7,{size:11});
     text(item,115.5,248.2+n*20.7,{size:11,maxWidth:410});
   }
 }
 if(i>=9 && i<=11){
   // Clear legacy photo placeholders before drawing clean, adaptable photo grids.
   ctx.fillStyle='#fff';ctx.fillRect(53,30,493,711);
   const pagePhotos=photoPages[i-9] || [], rects=photoSlots(pagePhotos.length);
   for(let j=0;j<pagePhotos.length;j++){
     const {image,number}=pagePhotos[j], r=rects[j];
     ctx.fillStyle='#fafafa';ctx.fillRect(r.x,r.y,r.w,r.h);
     ctx.strokeStyle='#9da6b2';ctx.lineWidth=.7;ctx.strokeRect(r.x,r.y,r.w,r.h);
     const pos=fitContained(image.width,image.height,r);
     ctx.drawImage(image,pos.x,pos.y,pos.w,pos.h);
     text(`Photo ${number}`,r.x+9,r.y+r.h-6,{size:10,color:'#475569'});
   }
   if(!pagePhotos.length){
     text('PROPERTY CONDITION PHOTOGRAPHS',297.7,95,{size:12,bold:true,align:'center',color:'#637083'});
     text('No photos on this page',297.7,160,{size:11,align:'center',color:'#8a94a4'});
   }
 }
 footer();
}

async function generate(d) {
 const photoFiles=Array.from(field('photos').files||[]);
 const photos=await Promise.all(photoFiles.map(loadPhoto));
 const distribution=photoDistribution(photos.length);
 const pageCount=agreementPageCount(photos.length);
 const backdrops=await Promise.all(Array.from({length:pageCount},(_,i)=>loadImage(`assets/page-${String(i+1).padStart(2,'0')}.png`)));
 const photoPages=[];let offset=0;
 for(const count of distribution){photoPages.push(photos.slice(offset,offset+count).map((image,j)=>({image,number:offset+j+1})));offset+=count;}
 const pages=[];
 for(let i=0;i<pageCount;i++){
   const canvas=document.createElement('canvas');canvas.width=Math.round(PAGE_W*RENDER_SCALE);canvas.height=Math.round(PAGE_H*RENDER_SCALE);
   const c=canvas.getContext('2d',{alpha:false}); c.fillStyle='#fff';c.fillRect(0,0,canvas.width,canvas.height);c.scale(RENDER_SCALE,RENDER_SCALE);
   c.drawImage(backdrops[i],0,0,PAGE_W,PAGE_H);
   paintPage(c,i,d,photos,photoPages);
   const searchable=[{value:`Tenancy Agreement ${d.landlordName} ${d.tenantName} ${d.propertyAddress}`,x:80,y:813}];
   if(i===0)searchable.push({value:`Agreement date ${formatLongDate(d.agreementDate)}`,x:80,y:826});
   if(i===1)searchable.push({value:`Agreement date ${formatLongDate(d.agreementDate)}`,x:80,y:826});
   if(i===7)searchable.push({value:`Term ${formatShortDate(d.startDate)} to ${formatShortDate(d.endDate)} Rent RM ${moneyNumber(d.monthlyRent)}`,x:80,y:826});
   pages.push({jpeg:canvas.toDataURL('image/jpeg',.92),width:canvas.width,height:canvas.height,searchable});
   await new Promise(resolve=>setTimeout(resolve,0));
 }
 return jpegPDF(pages,{documentTitle:`Unsigned Tenancy Agreement - ${d.propertyAddress}`});
}
form.addEventListener('submit',async e=>{
  e.preventDefault();if(!form.reportValidity())return;
  button.disabled=true;button.textContent='Generating PDF…';status.textContent='Preparing your agreement in this browser…';downloadBox.hidden=true;
  try{
    const data=read();
    const pdf=await generate(data);
    clearGenerated();generatedFile=pdf;
    currentObjectURL=URL.createObjectURL(pdf);
    const filename=`Tenancy_Agreement_${data.startDate}_${data.endDate}.pdf`;
    $('#downloadLink').href=currentObjectURL;$('#downloadLink').download=filename;
    $('#previewLink').href=currentObjectURL;
    downloadBox.querySelector('span').textContent=`${agreementPageCount(field('photos').files.length)} unsigned pages — ready to review and save.`;
    downloadBox.hidden=false;
    status.textContent=`Complete — ${agreementPageCount(field('photos').files.length)} pages (${(pdf.size/1024/1024).toFixed(1)} MB). Use Download PDF below.`;
    downloadBox.scrollIntoView({behavior:'smooth',block:'nearest'});
  }catch(error){console.error(error);status.textContent=`Could not generate PDF: ${error.message}`;}
  finally{button.disabled=false;button.innerHTML='Generate PDF <span>↗</span>'}
});
