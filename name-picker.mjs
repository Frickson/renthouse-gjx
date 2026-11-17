/** Editable name picker with explicit mouse, touch and keyboard selection. */
export function setupNamePicker(input) {
 const source=document.getElementById(input.getAttribute('list'));
 input.removeAttribute('list');
 const wrapper=document.createElement('div');wrapper.className='name-picker';
 input.before(wrapper);wrapper.append(input);
 const toggle=document.createElement('button');toggle.type='button';toggle.className='name-toggle';toggle.textContent='▾';toggle.setAttribute('aria-label',`Show choices for ${input.name==='landlordName'?'landlord':'witness'}`);
 const list=document.createElement('div');list.id=`${input.id}Choices`;list.className='name-choices';list.setAttribute('role','listbox');list.hidden=true;
 wrapper.append(toggle,list);input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls',list.id);input.setAttribute('aria-expanded','false');
 let active=-1;
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;};
 const choose=value=>{
  input.value=value;close();input.focus();
  input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));close();
 };
 function open(filter=true){
  if(input.readOnly||input.disabled)return;
  list.replaceChildren();active=-1;
  const query=filter?input.value.trim().toLowerCase():'';
  const options=Array.from(source.options).filter(o=>o.value.toLowerCase().includes(query));
  for(const [i,option] of options.entries()){
   const button=document.createElement('button');button.type='button';button.id=`${list.id}-${i}`;button.setAttribute('role','option');button.setAttribute('aria-selected','false');button.textContent=option.value;
   button.addEventListener('pointerdown',e=>e.preventDefault());button.addEventListener('click',()=>choose(option.value));list.append(button);
  }
  if(!options.length){const hint=document.createElement('span');hint.textContent='No matching names. You can type a name manually.';list.append(hint);}
  list.hidden=false;input.setAttribute('aria-expanded','true');
 }
 toggle.addEventListener('click',()=>{if(list.hidden){input.focus();open(false);}else close();});
 input.addEventListener('input',()=>open(true));
 input.addEventListener('keydown',event=>{
  if(event.key==='Escape'){close();return;}
  if(event.key==='Tab'){close();return;}
  if(['ArrowDown','ArrowUp'].includes(event.key)){
   event.preventDefault();if(list.hidden)open(false);
   const options=list.querySelectorAll('[role=option]');if(!options.length)return;
   active=(active+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;
   options.forEach((o,i)=>o.setAttribute('aria-selected',String(i===active)));
   input.setAttribute('aria-activedescendant',options[active].id);options[active].scrollIntoView({block:'nearest'});
  }
  if(event.key==='Enter'&&!list.hidden){event.preventDefault();const option=list.querySelectorAll('[role=option]')[active];if(option)choose(option.textContent);else close();}
 });
 wrapper.addEventListener('focusout',event=>{if(!wrapper.contains(event.relatedTarget))close();});
 document.addEventListener('pointerdown',event=>{if(!wrapper.contains(event.target))close();});
}
