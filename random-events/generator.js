// Site-styled, keyboard/controller-friendly confirmation and warning dialogs.
function farmDialog(message,{title='Please Confirm',confirm=false,confirmLabel='Confirm',onConfirm=()=>{}}={}){
 const previous=document.activeElement;
 const overlay=document.createElement('div');overlay.className='farm-dialog-overlay';
 overlay.setAttribute('role','presentation');
 const panel=document.createElement('div');panel.className='farm-dialog';panel.setAttribute('role','alertdialog');panel.setAttribute('aria-modal','true');
 const heading=document.createElement('h2');heading.textContent=title;heading.id='farm-dialog-title';panel.setAttribute('aria-labelledby',heading.id);
 const description=document.createElement('p');description.textContent=message;description.id='farm-dialog-description';panel.setAttribute('aria-describedby',description.id);
 const actions=document.createElement('div');actions.className='farm-dialog-actions';
 const close=()=>{overlay.remove();previous?.focus?.()};
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent=confirm?'Cancel':'OK';cancel.className='farm-dialog-cancel';cancel.onclick=close;
 actions.append(cancel);
 if(confirm){const yes=document.createElement('button');yes.type='button';yes.textContent=confirmLabel;yes.className='farm-dialog-confirm';yes.onclick=()=>{close();onConfirm()};actions.append(yes)}
 panel.append(heading,description,actions);overlay.append(panel);document.body.append(overlay);
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Backspace'){e.preventDefault();close()}else if(e.key==='Tab'){const buttons=[...actions.querySelectorAll('button')];const i=buttons.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();buttons.at(-1).focus()}else if(!e.shiftKey&&i===buttons.length-1){e.preventDefault();buttons[0].focus()}}});
 cancel.focus();
}
const $=id=>document.getElementById(id);
const categorySlugs=["weather", "crops-fields", "machinery", "animals", "supplies-storage", "finance", "contracts-neighbours", "dealership", "challenges", "community"];
const cats=['Weather','Crops & Fields','Machinery','Animals','Supplies & Storage','Finance','Contracts & Neighbours','Dealership','Challenges','Community'];
// Test content only; revised website events will replace these entries.
const events=Object.keys(window.FSG_EVENT_CATEGORIES).sort((a,b)=>Number(a)-Number(b)).flatMap(k=>window.FSG_EVENT_CATEGORIES[k]);
const animalNames=['Cattle','Sheep','Pigs','Chickens','Goats','Horses','Water Buffalo','Bees','Alpacas'];
const cropNames=['Wheat', 'Barley', 'Oats', 'Canola', 'Soybeans', 'Corn', 'Sorghum', 'Sunflowers', 'Potatoes', 'Sugar Beet', 'Cotton', 'Rice', 'Long Grain Rice', 'Grapes', 'Olives', 'Sugarcane', 'Poplar', 'Grass', 'Onions', 'Coffee', 'Bananas'];
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const KEY='fsg-first-events-test-v1';
let state={selected:cats.map((_,i)=>i),current:null,used:[],active:[],categoriesOpen:true,tracking:false,calendar:null,frequency:'manual',count:'1',periodKey:null,periodEvents:[],scheduleAnchor:null,monthSeen:{},lastGenerated:null,sequence:0,animalsOwned:[],cropsOwned:[],areaUnit:'acres',currency:'GBP',minEvents:null,maxEvents:null};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')state={...state,...s}}catch(e){}
if(!Array.isArray(state.selected))state.selected=cats.map((_,i)=>i);
if(!Array.isArray(state.active))state.active=[];
if(!Array.isArray(state.completionNotices))state.completionNotices=[];
if(!Array.isArray(state.periodEvents))state.periodEvents=[];
if(!Array.isArray(state.used))state.used=[];
if(!Array.isArray(state.cropsOwned))state.cropsOwned=[];
if(!Array.isArray(state.animalsOwned))state.animalsOwned=[];
if(!['acres','hectares'].includes(state.areaUnit))state.areaUnit='acres';
if(!['GBP','EUR','USD'].includes(state.currency))state.currency='GBP';
// Existing farms retain their previous fixed event count as their initial range.
if(state.minEvents===null||!Number.isFinite(Number(state.minEvents)))state.minEvents=state.count==='random'?1:Number(state.count)||1;
if(state.maxEvents===null||!Number.isFinite(Number(state.maxEvents)))state.maxEvents=state.count==='random'?10:Number(state.count)||1;
state.minEvents=Math.max(0,Math.min(10,Number(state.minEvents)));
state.maxEvents=Math.max(state.minEvents,Math.min(10,Number(state.maxEvents)));
const currencySymbols={GBP:'£',EUR:'€',USD:'$'};
function currencySymbol(){return currencySymbols[state.currency]||'£'}
function currencyText(value){return String(value??'').replace(/£/g,currencySymbol())}
function money(n){return currencySymbol()+Math.round(n).toLocaleString('en-GB')}
state.animalsOwned=[...new Set(state.animalsOwned.map(a=>a==='Cows'?'Cattle':a))];
if(!state.monthGenerated||typeof state.monthGenerated!=='object')state.monthGenerated={};
if(state.calendar){state.calendar.daysPerMonth=Math.max(1,Math.min(28,Number(state.calendar.daysPerMonth)||1));state.calendar.day=Math.max(1,Math.min(state.calendar.daysPerMonth,Number(state.calendar.day)||1));}
if(!state.monthSeen||typeof state.monthSeen!=='object')state.monthSeen={};
if(!Array.isArray(state.weatherHistory))state.weatherHistory=[];
if(!Array.isArray(state.insuranceClaims))state.insuranceClaims=[];

// Upgrade existing, unstarted Machinery Events without resetting the player's farm.
// Earlier versions saved the entire instruction in the description and sometimes
// started the waiting timer before the player confirmed the required action.
function updateSavedMachineryEvents(){
 const source=new Map((window.FSG_EVENT_CATEGORIES?.[2]||[]).map(e=>[e.id,e]));
 const changed=new Map();
 for(const item of state.active){
  if(item.category!==2||item.completed||!source.has(item.eventId))continue;
  const original=source.get(item.eventId);
  // Only migrate events which have not actually started counting down.
  // Respect any action already confirmed or elapsed waiting time.
  if(item.started || (item.total>0 && item.remaining<item.total))continue;
  if(!item.machineryActionMigrated){
   let template=original.template;
   if(item.duration?.label)template=template.replace('{duration}',item.duration.label);
   item.description=naturalDurationSentence(template);
   item.machineryActionMigrated=true;
   if(item.total>0)item.actionRequired=true;
   else if(original.eventType==='action')item.actionRequired=true;
   changed.set(item.id,item);
  }
 }
 for(const item of state.periodEvents){const replacement=changed.get(item.id);if(replacement)Object.assign(item,replacement)}
 if(state.current&&changed.has(state.current.id))Object.assign(state.current,changed.get(state.current.id));
 if(changed.size)try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
}

updateSavedMachineryEvents();
function updateCalculator(){const price=Math.max(0,Number($('calcPrice').value)||0);const pct=Math.min(100,Math.max(0,Number($('calcPercent').value)||0));const saving=price*pct/100;const isDiscount=$('calcKind').value==='discount';$('calcResult').innerHTML=isDiscount?`<strong>Receive ${money(saving)} from your Payment Farm</strong><div>Final purchase cost: ${money(price-saving)}</div>`:`<strong>Receive ${money(saving)} from your Payment Farm</strong><div>Total sale value: ${money(price+saving)}</div>`;}
const calcPriceOptions=$('calcPriceOptions');
[1000,5000,10000,25000,50000,100000,250000,500000].forEach(price=>{const b=document.createElement('button');b.type='button';b.dataset.price=String(price);b.textContent=money(price);b.addEventListener('click',()=>{$('calcPrice').value=String(Math.max(0,Number($('calcPrice').value)||0)+price);updateCalculator()});calcPriceOptions.append(b)});

$('calcClear').addEventListener('click',()=>{$('calcPrice').value='0';updateCalculator()});
const calcPercentOptions=$('calcPercentOptions');
for(let pct=0;pct<=100;pct+=5){const btn=document.createElement('button');btn.type='button';btn.textContent=pct+'%';btn.setAttribute('aria-pressed',String(pct===Number($('calcPercent').value)));btn.addEventListener('click',()=>{$('calcPercent').value=String(pct);syncCalcPercentButtons();updateCalculator();});calcPercentOptions.append(btn)}
function syncCalcPercentButtons(){Array.from(calcPercentOptions.children).forEach(btn=>btn.setAttribute('aria-pressed',String(parseInt(btn.textContent,10)===Number($('calcPercent').value))))}
['calcPrice','calcPercent','calcKind'].forEach(id=>$(id).addEventListener('input',updateCalculator));$('calcToggle').addEventListener('click',()=>{const body=$('calcBody');body.hidden=!body.hidden;$('calcToggle').setAttribute('aria-expanded',String(!body.hidden));$('calcToggle').textContent=(body.hidden?'▸':'▾')+' Percentage & Payment Farm Calculator (optional tool)';});updateCalculator();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function randomFrom(a){return a[Math.floor(Math.random()*a.length)]}
function dateLabel(c){return c?`${months[c.month]}, Year ${(c.year||0)+1}, Day ${c.day}`:'No farm calendar'}
function monthKey(){const c=state.calendar;return c?`${c.year||0}-${c.month}${state.frequency==='daily'?'-'+c.day:''}`:null}
// Shared duration rules for ALL event categories, not only weather.
// Long-term month-based events and instant events retain their own behaviour.
function durationFor(e){
 if(!e.duration)return null;
 if(e.fixedDays){const dpm=Math.max(1,Number(state.calendar?.daysPerMonth)||3);const n=e.fixedDays;return {amount:n,unit:'days',label:`${n} ${n===1?'day':'days'}`,total:Math.min(n,dpm)};}
 const dpm=Math.max(1,Math.min(28,Number(state.calendar?.daysPerMonth)||3));
 if(e.duration==='months'){
  const lo=Math.max(1,e.minMonths||1),hi=Math.max(lo,e.maxMonths||lo);
  const n=lo+Math.floor(Math.random()*(hi-lo+1));
  return {amount:n,unit:'months',label:`${n} ${n===1?'month':'months'}`,total:n*dpm};
 }
 // All day-based timed events draw a duration suited to the player's calendar.
 // One-day months use a half-day restriction, which expires at the next advance.
 if(dpm===1){
  // Clock times are roleplay targets; the existing calendar still completes at the next advance.
  const time=randomFrom(['10am','midday','1pm','4pm']);
  return {amount:.5,unit:'days',label:`until ${time}`,total:1};
 }
 const max=dpm===2?1:dpm===3?2:dpm<=7?4:8;
 const n=1+Math.floor(Math.random()*max);
 return {amount:n,unit:'days',label:`${n} ${n===1?'day':'days'}`,total:n};
}
function isPendingOffer(e){
 if(e.c!==7)return false;
 const t=(e.t+' '+e.template).toLowerCase();
 return /next (tractor|machine|vehicle|implement|purchase|repair|upgrade|used|new)|towards (your|one|a|any)|discount on (one|your|the next)|voucher|trade-in bonus|customer reward|loyalty reward|free (repair|repaint|tune-up|fuel)|tyre upgrade|engine upgrade|parts voucher|dealer discount|seasonal promotion|attachment offer|used machinery deal/.test(t);
}
// Weather variations are selected once when the event is created and saved with the event.
const weatherPick=randomFrom;
const feedChoices={
 'Cattle':['hay bale','silage bale','TMR'], 'Water Buffalo':['hay bale','silage bale','TMR'],
 'Sheep':['hay bale','grass'], 'Goats':['hay bale','grass'], 'Horses':['hay bale'],
 'Pigs':['pig food'], 'Chickens':['chicken feed']
};
// Each incident is written for the farm's season, not just assigned a random weather cause.
function seasonalWeatherCause(month){
 const winter=[11,0,1].includes(month), summer=[5,6,7].includes(month);
 return weatherPick(winter?[
  'Snow and ice have delayed deliveries on local roads.',
  'Strong winds have brought down trees on nearby roads.',
  'Heavy rainfall has disrupted regional transport routes.'
 ]:summer?[
  'Thunderstorms have disrupted transport routes.',
  'High winds have brought down trees on nearby roads.',
  'Flooding elsewhere in the region has delayed deliveries.'
 ]:[
  'Heavy rainfall has disrupted transport routes.',
  'Strong winds have brought down trees on nearby roads.',
  'Flooding elsewhere in the region has delayed deliveries.'
 ]);
}
function weatherVariant(e){
 const id=e.id, animals=state.animalsOwned.filter(a=>feedChoices[a]);
 const v={title:e.t,description:e.template};
 const replace=(key,value)=>{v.description=v.description.replaceAll('{'+key+'}',value)};
 const times=['11:00 am','12:00 pm','2:00 pm','3:00 pm','4:00 pm'];
 const month=state.calendar?.month??5;
 if(id==='weather-2026-22'){
  v.description=seasonalWeatherCause(month)+' Several farmworkers have been delayed on their way to the farm.\n\nACTION REQUIRED: Farmworkers will be unavailable until '+weatherPick(times)+' today.';
 }
 if(id==='weather-2026-23'){
  const products=weatherPick(['fertiliser','lime','seeds','fertiliser and lime','seeds and fertiliser']);
  v.title=products[0].toUpperCase()+products.slice(1)+' Shortage';
  const when=weatherPick(times);
  replace('supplyStory',seasonalWeatherCause(month)+' The agricultural dealer is temporarily out of '+products+'.');
  replace('supplyProduct',products[0].toUpperCase()+products.slice(1));replace('supplyTime',when);
  v.restrictedProducts=products.split(' and ');
 }
 if(id==='weather-2026-24'){
  const product=weatherPick(['hay bales','straw bales','silage bales']);
  const cause=weatherPick([ 'Strong winds have damaged part of the dealer’s bale store.', 'Floodwater has entered the dealer’s storage area.', ...([11,0,1].includes(month)?['Snow and ice have made the dealer’s bale yard inaccessible.']:[]) ]);
  replace('baleStory',cause+' '+product[0].toUpperCase()+product.slice(1)+' are temporarily unavailable.');
  replace('baleProduct',product[0].toUpperCase()+product.slice(1));replace('baleTime',weatherPick(times));
  v.title=product[0].toUpperCase()+product.slice(1)+' Supply Disruption';v.restrictedProducts=[product];
 }
 if(id==='weather-2026-25'){
  v.description=seasonalWeatherCause(month)+' A neighbouring farmer is offering an additional £350 for help with urgent fieldwork.\n\nOPPORTUNITY: Complete the available contract nearest your farm and receive an additional £350.';
 }
 if(id==='weather-2026-26'&&animals.length){
  const animal=weatherPick(animals),food=weatherPick(feedChoices[animal]);
  const group=animal==='Chickens'?'chicken housing':animal==='Horses'?'stable':animal.toLowerCase()+' housing';
  v.title=animal+' Feed Spoilage';
  const story=weatherPick(['Strong winds have damaged part of the roof of the '+group+', allowing rainwater to spoil some of the feed already in the enclosure.', 'Heavy rain has entered the '+group+', spoiling some of the feed already in the enclosure.']);
  const purchase=food==='hay bale'||food==='silage bale'?'one additional '+food:'additional '+food;
  v.description=story+'\n\nACTION REQUIRED: Purchase '+purchase+' to replace the spoiled feed before '+weatherPick(times)+' today.';
  v.requiredProduct=food;
 }
 if(id==='weather-2026-27'){
  const animal=weatherPick(state.animalsOwned.filter(a=>['Cattle','Pigs','Horses'].includes(a)));
  const housing=animal==='Horses'?'stable':animal.toLowerCase()+' housing';
  v.title=animal+' Bedding Damage';
  const story=weatherPick(['Strong winds have damaged the roof of the '+housing+', allowing rainwater to soak the straw bedding.', ...([11,0,1].includes(month)?['Heavy snow has damaged part of the '+housing+' roof. Melting snow has soaked the straw bedding.']:[])]);
  v.description=story+'\n\nACTION REQUIRED: Purchase one additional straw bale before '+weatherPick(['2:00 pm','4:00 pm','the end of today'])+'.';
  v.requiredProduct='straw bale';
 }
 return v;
}

// Only qualifying completed repairs can produce a claim. Decide once per repair.
const INSURABLE_WEATHER_REPAIRS=new Set(['weather-2026-08','weather-2026-09','weather-2026-28']);
function queuePossibleInsuranceClaim(item){
 if(!state.calendar||!item||!INSURABLE_WEATHER_REPAIRS.has(item.eventId)||item.insuranceConsidered)return;
 item.insuranceConsidered=true;
 const roll=Math.random();
 if(roll>=0.30)return; // Most damage is not followed by an insurance message.
 const large=roll<0.05;
 const amount=large?randomFrom([600,800,1000,1200,1500,1800,2000]):randomFrom([100,200,300,400,500]);
 state.insuranceClaims.push({sourceId:item.id,due:farmMonthIndex(state.calendar)+randomFrom([1,2,3]),amount,large});
}
function availableInsuranceClaim(){
 if(!state.calendar)return null;
 const now=farmMonthIndex(state.calendar);
 return state.insuranceClaims.find(c=>!c.claimed&&c.due<=now)||null;
}
// A timed event needing a player action does not begin its countdown until the
// player has arranged the repair / carried out the action. Instant actions still finish immediately.
function completeFarmAction(item,finished){
 if(!item||item.completed)return;
 if(item.actionRequired && item.total>0 && !item.pendingOffer){
  item.actionRequired=false;
  item.started=finished?{...finished}:null;
  item.remaining=item.total;
  return;
 }
 item.completed=true;item.actionRequired=false;item.finished=finished?{...finished}:null;
 queuePossibleInsuranceClaim(item);
}
// Use event-specific instructions rather than making every timed weather condition
// require a click. All timed machinery faults need the player to arrange repairs.
function requiresActionBeforeWaiting(item){
 if(!item.total || item.pendingOffer || item.eventType==='info')return false;
 if(item.category===2)return true;
 const text=(item.description||'').toLowerCase();
 return /\b(pay|purchase|buy|repair|replace|arrange|take (?:it|the|your)|transport|deliver|move|park|remove|sell|dispose|treat|isolate|clean|restock|feed|call (?:the|a)|contact (?:the|a)|hire|lease|order|collect|provide|inspect|apply|store|secure|relocate)\b/.test(text)
   && !/\b(?:no action required|no repairs required)\b/.test(text);
}
function previousWeatherEvent(id){return state.active.some(a=>a.eventId===id&&a.completed&&a.created&&state.calendar&&
  ((state.calendar.year||0)*12+state.calendar.month)-((a.created.year||0)*12+a.created.month)>=1);}
function naturalDurationSentence(text){
 return String(text||'')
  .replace(/\bfor\s+until\s+/gi,'until ')
  .replace(/\bfor\s+the\s+rest\s+of\s+today/gi,'for the rest of today')
  .replace(/\buntil\s+until\s+/gi,'until ')
  .replace(/until 12pm \(half a day\)/gi,'until midday')
  .replace(/\bin-game\s+(days?|months?)\b/gi,'$1');
}
function instantiate(e){const crop=e.c===1?cropEventDescription(e):null;const dur=isPendingOffer(e)?null:durationFor(e);const amount=e.amounts?randomFrom(e.amounts):null;const animal=e.id==='weather-2026-20'?randomFrom(state.animalsOwned):null;const variant=e.weatherAddition?weatherVariant(e):null;const claim=e.id==='weather-2026-29'?availableInsuranceClaim():null;const description=crop?crop.description:(claim?(claim.large?'Following a further inspection of the recent weather damage, your insurer has identified additional damage and approved a higher settlement than originally anticipated.':'Your insurer has completed its assessment of the recent weather damage and approved a partial settlement towards the repair costs.')+'\n\nGOOD NEWS: Your farm has received £'+claim.amount.toLocaleString('en-GB')+'.':(variant?.description||e.template)).replace('{animal}',animal?animal.toLowerCase():'livestock');if(claim)claim.claimed=true;return {id:`event-${Date.now()}-${++state.sequence}`,eventId:e.id,title:claim?'Insurance Claim Successful':variant?.title||e.t,category:e.c,photo:e.p,description:naturalDurationSentence(description.replace('{duration}',dur?.label||'').replace('{amount}',amount===null?'':amount.toLocaleString('en-GB'))),duration:crop?crop.duration:dur,eventType:e.eventType||null,pendingOffer:isPendingOffer(e),completed:false,remaining:(crop?crop.duration:dur)?.total||0,total:(crop?crop.duration:dur)?.total||0,created:state.calendar?{...state.calendar}:null,finished:null,restrictedProducts:variant?.restrictedProducts||[],requiredProduct:variant?.requiredProduct||null};}

// FS25 standard seasonal-growth calendar (month indices, Jan=0).
// Approximate planting and harvest windows: use the active crop selections rather
// than guessing a particular field's actual growth stage. Grass/perennials remain
// eligible for general soil events, not annual crop germination or disease events.
const cropCalendar={
 'Wheat':{s:[8,9],h:[6,7]},'Barley':{s:[8,9],h:[5,6]},'Oats':{s:[2,3],h:[6,7]},
 'Canola':{s:[7,8],h:[5,6]},'Soybeans':{s:[3,4],h:[9,10]},
 'Corn':{s:[3,4],h:[9,10]},'Sorghum':{s:[3,4],h:[7,8]},
 'Sunflowers':{s:[2,3],h:[9,10]},'Potatoes':{s:[2,3],h:[7,8]},
 'Sugar Beet':{s:[2,3],h:[9,10]},'Cotton':{s:[1,2],h:[9,10]},
 'Rice':{s:[3,4],h:[7,8]},'Long Grain Rice':{s:[3,4],h:[7,8]}
};
function monthsBetween(start,end){const a=[];for(let m=start;;m=(m+1)%12){a.push(m);if(m===end||a.length>=12)break;}return a;}
function cropStageMatches(crop,stage,month){
 const cal=cropCalendar[crop];if(!cal)return stage==='general'||stage==='stored';
 if(stage==='general'||stage==='stored')return true;
 if(stage==='sowing')return cal.s.includes(month);
 if(stage==='early')return cal.s.some(m=>[m,(m+1)%12].includes(month));
 if(stage==='fieldwork')return true;
 if(stage==='growth')return cal.s.some(m=>monthsBetween(m,cal.h[0]).includes(month))&&!cal.h.includes(month);
 return true;
}
function cropEventEligible(e){
 if(e.c!==1)return true;
 const owned=state.cropsOwned.filter(c=>!e.crops||e.crops.includes(c));
 if(!owned.length)return false;
 if(!state.calendar)return ['general','stored'].includes(e.cropStage);
 return owned.some(c=>cropStageMatches(c,e.cropStage,state.calendar.month));
}
function cropEventDescription(e){
 const field=randomFrom(['smallest','largest']);
 const width=e.widths?randomFrom(e.widths):null;
 const amount=e.amounts?randomFrom(e.amounts):null;
 const duration=e.duration?durationFor(e):null;
 const action=e.instruction.replace('{field}',field)
  .replace('{width}',width===null?'':String(width))
  .replace('{money}',amount===null?'':money(amount))
  .replace('{duration}',duration?.label||'1 day');
 const label=e.eventType==='info'?'GOOD NEWS':e.cropStage==='stored'?'OPPORTUNITY':'ACTION REQUIRED';
 return {description:e.story+'\n\n'+label+': '+action,duration};
}
function markSeen(e){if(!state.tracking||!state.calendar)return;const key=`${state.calendar.year||0}-${state.calendar.month}`;if(!key)return;const a=state.monthSeen[key]||[];if(!a.includes(e.id))a.push(e.id);state.monthSeen[key]=a;}
// A repeat is a repeat even if the product, deadline or wording changes.
// Three full intervening months: January incident can return from May onward.
function weatherCooldownFamily(e){
 if(e.c!==0)return null;
 if(['weather-2026-23','weather-2026-24'].includes(e.id))return 'dealer-supply';
 if(['weather-2026-26','weather-2026-27'].includes(e.id))return 'livestock-housing';
 return e.id;
}
function farmMonthIndex(c){return (Number(c?.year)||0)*12+Number(c?.month||0)}
function weatherCoolingDown(e){
 if(e.c!==0||e.followUp||!state.calendar)return false;
 const family=weatherCooldownFamily(e), now=farmMonthIndex(state.calendar);
 return state.weatherHistory.some(h=>h.family===family&&now-h.month>=0&&now-h.month<4);
}
function recordWeatherIncident(e){
 if(e.c!==0||!state.calendar)return;
 const now=farmMonthIndex(state.calendar);
 state.weatherHistory.push({family:weatherCooldownFamily(e),month:now,id:e.id});
 state.weatherHistory=state.weatherHistory.filter(h=>now-h.month<24).slice(-200);
}
function eligible(){return events.filter(e=>!weatherCoolingDown(e)&&(!e.seasonMonths||!state.calendar||e.seasonMonths.includes(state.calendar.month))&&(!e.requiresStrawCompatibleAnimals||state.animalsOwned.some(a=>['Cattle','Pigs','Horses'].includes(a)))&&state.selected.includes(e.c)&&(e.c!==1||state.cropsOwned.length>0)&&(e.c!==3||state.animalsOwned.length>0)&&(!e.requiresAnimals||state.animalsOwned.length>=e.requiresAnimals)&&(!e.followUp||(e.id==='weather-2026-28'?previousWeatherEvent('weather-2026-03'):!!availableInsuranceClaim()))&&(!e.animals||e.animals.some(a=>state.animalsOwned.includes(a==='Cows'?'Cattle':a)))&&cropEventEligible(e)&&(!state.tracking||!state.active.some(a=>!a.completed&&a.eventId===e.id)))}
function chooseUnique(pool,used){const a=pool.filter(e=>!used.includes(e.id));return a.length?randomFrom(a):null}
function drawCats(){
 $('all').textContent=state.selected.length===cats.length?'✕ Deselect All':'✓ Select All';
 $('categories').hidden=!state.categoriesOpen;
 $('categoryHeading').hidden=!state.categoriesOpen;
 $('all').hidden=!state.categoriesOpen;
 $('hideCats').setAttribute('aria-expanded',String(state.categoriesOpen));
 $('hideCats').textContent=state.categoriesOpen?'Hide Categories ▴':'Show Categories ▾';
 $('categories').replaceChildren();
 cats.forEach((c,i)=>{
   const wrap=document.createElement('div');wrap.className='category-wrap';
   const b=document.createElement('button');b.className='category';b.type='button';
   b.setAttribute('aria-pressed',String(state.selected.includes(i)));
   b.innerHTML=`<span class="tick">✓</span><img src="images/${categorySlugs[i]}/cat-${i}.webp" alt=""><span class="name">${c}</span>`;
   b.onclick=()=>{if(state.selected.includes(i)){state.selected=state.selected.filter(x=>x!==i)}else state.selected.push(i);persist();drawCats();renderSchedule()};
   wrap.append(b);
   $('categories').append(wrap);
 });
}
function showEvent(v){if(!v)return;state.current=v;$('cat').textContent=cats[v.category].toUpperCase()+' • RANDOM EVENT';$('title').textContent=v.title;const fullDescription=displayEventDescription(v);
 const actionMatch=/\b(ACTION REQUIRED|OPPORTUNITY|GOOD NEWS)\s*:\s*/i.exec(fullDescription);
 const actionKind=actionMatch?actionMatch[1].toUpperCase():'';
 const actionDescription=actionMatch?fullDescription.slice(0,actionMatch.index).trim():fullDescription.trim();
 const actionBody=actionMatch?fullDescription.slice(actionMatch.index+actionMatch[0].length).trim():'';
 $('desc').textContent=actionDescription;$('desc').style.whiteSpace='pre-line';
 $('eventActionText').textContent=actionBody;
 $('eventAction').dataset.actionKind=actionKind;
 $('eventAction').classList.toggle('has-action-text',!!actionMatch);
 // Load an individual event banner by title, falling back to the category banner.
 const photo=$('photo');
 const folder='images/'+categorySlugs[v.category]+'/';
 const fallback=folder+'event-'+v.category+'.webp';
 const slug=String(v.title||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 photo.onerror=()=>{photo.onerror=null;photo.src=fallback;};
 // Machinery-specific scenes, with a small pool of appropriate alternatives.
 // Choose per generated event so reopening the same event doesn't shuffle its image.
 const machineryPhotos={
  'book-02-047':['puncture','workshop'],
  'book-02-048':['engine','workshop'],
  'book-02-049':['workshop','engine'],
  'book-02-050':['workshop','engine'],
  'book-02-051':['engine','workshop'],
  'book-02-052':['puncture'],
  'book-02-053':['engine','workshop'],
  'book-02-054':['engine'],
  'book-02-055':['harvester'],
  'book-02-056':['seeder'],
  'book-02-057':['baler'],
  'book-02-058':['seeder','workshop'],
  'book-02-059':['workshop'],
  'book-02-060':['trailer'],
  'book-02-061':['seeder'],
  'book-02-062':['seeder'],
  'book-02-063':['workshop','engine'],
  'book-02-064':['engine','workshop'],
  'book-02-065':['engine'],
  'book-02-066':['engine','workshop'],
  'book-02-067':['workshop','engine'],
  'book-02-068':['workshop','engine'],
  'book-02-069':['workshop','engine'],
  'book-02-070':['engine','workshop']
 };
 const cropPhotos={
  'book-01-023':'02-crop-spraying.webp',
  'book-01-024':'02-crop-spraying.webp',
  'book-01-025':'02-crop-spraying.webp',
  'book-01-026':'02-crop-spraying.webp',
  'book-01-027':'01-crops-fields-universal.webp',
  'book-01-028':'02-crop-spraying.webp',
  'book-01-029':'05-field-cultivation.webp',
  'book-01-030':'02-crop-spraying.webp',
  'book-01-031':'05-field-cultivation.webp',
  'book-01-032':'02-crop-spraying.webp',
  'book-01-033':'05-field-cultivation.webp',
  'book-01-034':'02-crop-spraying.webp',
  'book-01-035':'02-crop-spraying.webp',
  'book-01-036':'02-crop-spraying.webp',
  'book-01-037':'05-field-cultivation.webp',
  'book-01-038':'04-ploughing.webp',
  'book-01-039':'07-waterlogged-field.webp',
  'book-01-040':'01-crops-fields-universal.webp',
  'book-01-041':'05-field-cultivation.webp',
  'book-01-042':'08-muddy-field-cultivation.webp',
  'book-01-043':'05-field-cultivation.webp',
  'book-01-044':'05-field-cultivation.webp',
  'book-01-045':'03-fertiliser-spreading.webp',
  'book-01-046':'08-muddy-field-cultivation.webp',
  'crops-2026-25':'06-harvesting-grain-trailer.webp',
  'crops-2026-26':'03-fertiliser-spreading.webp',
  'crops-2026-27':'01-crops-fields-universal.webp',
  'crops-2026-28':'06-harvesting-grain-trailer.webp'
 };
 if(v.category===1 && cropPhotos[v.eventId]){
  photo.src=folder+cropPhotos[v.eventId];
 }else if(v.category===2 && machineryPhotos[v.eventId]){
  const options=machineryPhotos[v.eventId];
  const stableKey=String(v.id)+'|'+String(v.month||state.calendar?.month||'')+'|'+String(v.year||state.calendar?.year||'');
  let hash=0;for(let i=0;i<stableKey.length;i++)hash=((hash*31)+stableKey.charCodeAt(i))|0;
  photo.src=folder+'machinery-'+options[(hash>>>0)%options.length]+'.webp';
 }else{
  photo.src=folder+slug+'.webp';
 }
 $('photo').alt=v.title+' farming scene';renderThumbnails();renderBannerCompletion();}
function findTracked(v){return state.active.find(x=>x.id===v?.id)}
function completeAction(id){
 const item=state.active.find(x=>x.id===id);
 if(!item||(!item.actionRequired&&!item.earlyChoice)||item.completed)return;
 completeFarmAction(item,state.calendar);
 persist();renderTracker();renderBannerCompletion();syncCleanLayout();
}
function renderBannerCompletion(){
 const legacy=$('bannerComplete');
 legacy.hidden=true;
 const box=$('eventAction');
 const heading=$('eventActionHeading');
 const hint=$('eventActionHint');
 const item=findTracked(state.current);
 const completed=!!item?.completed;
 const hasAction=$('eventAction').classList.contains('has-action-text');
 // Information-only events are automatically completed; show their status clearly.
 const informational=state.current?.eventType==='info';
 const canComplete=!!(item&&!completed&&(item.actionRequired||item.earlyChoice));
 const inProgress=!!(item&&!completed&&!canComplete);
 box.hidden=!(canComplete||completed||inProgress||hasAction);
 box.disabled=!canComplete;
 box.classList.toggle('is-completed',completed);
 box.classList.toggle('is-in-progress',inProgress);
 heading.textContent=completed?'✓ COMPLETED':inProgress?'IN PROGRESS':box.dataset.actionKind==='OPPORTUNITY'?'OPPORTUNITY':box.dataset.actionKind==='GOOD NEWS'||informational?'GOOD NEWS':item?.pendingOffer?'OFFER AVAILABLE':'ACTION REQUIRED';
 hint.textContent=completed?'':inProgress?'Waiting for completion':canComplete?'Tap once you have carried out the action':'';
 if(!hasAction) $('eventActionText').textContent='';
 box.onclick=canComplete?()=>completeAction(item.id):null;
}
function displayDuration(days){
 const dpm=state.calendar?.daysPerMonth||3;
 if(days===.5)return 'Half a day';
  const n=Math.ceil(days);return `${n} day${n===1?'':'s'}`;
}
function formatAreaText(str){
 return String(str||'').replace(/\{area10\}/g,state.areaUnit==='hectares'?'4.05 hectares':'10 acres');
}
function displayEventDescription(item){
 if(!item)return '';
 const duration=item.duration;
 if(!duration)return currencyText(formatAreaText(naturalDurationSentence(item.description)));
 const label=(duration.label==='until 12pm (half a day)'?'until midday':duration.label)|| (duration.unit==='months'?`${duration.amount} month${duration.amount===1?'':'s'}`:displayDuration(duration.amount));
 return currencyText(formatAreaText(naturalDurationSentence(item.description.replace(duration.label,label))));
}
function renderThumbnails(){const list=state.periodEvents.length?state.periodEvents:(state.current?[state.current]:[]);const controls=$('carouselControls');controls.hidden=list.length<2;const index=Math.max(0,list.findIndex(e=>e.id===state.current?.id));$('eventPosition').textContent=`Event ${index+1} of ${list.length}`;}
function shiftEvent(direction){const list=state.periodEvents;if(list.length<2)return;const index=Math.max(0,list.findIndex(e=>e.id===state.current?.id));showEvent(list[(index+direction+list.length)%list.length]);persist();}
$('eventPrev').onclick=()=>shiftEvent(-1);$('eventNext').onclick=()=>shiftEvent(1);

// Phone swipe navigation: only the event photograph is swipeable.
// Uses the existing Previous/Next logic, preserving completion and farm progress.
{
 const photo=$('photo');
 let startX=0,startY=0,trackingSwipe=false;
 photo.addEventListener('touchstart',e=>{
  if(e.touches.length!==1){trackingSwipe=false;return;}
  startX=e.touches[0].clientX;startY=e.touches[0].clientY;trackingSwipe=true;
 },{passive:true});
 photo.addEventListener('touchend',e=>{
  if(!trackingSwipe||!e.changedTouches.length)return;
  trackingSwipe=false;
  const dx=e.changedTouches[0].clientX-startX;
  const dy=e.changedTouches[0].clientY-startY;
  // Ignore taps and vertical page scrolling.
  if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.4)return;
  shiftEvent(dx<0?1:-1);
 },{passive:true});
 photo.addEventListener('touchcancel',()=>{trackingSwipe=false;},{passive:true});
}

function autoTrack(v){if(!state.tracking||!state.calendar)return;const copy={...v,created:v.created||{...state.calendar}};
// Immediate events have no ongoing duration and go straight into history.
if(copy.eventType==='info'){copy.actionRequired=false;copy.completed=true;copy.finished=state.calendar?{...state.calendar}:null;}else if(!copy.total || requiresActionBeforeWaiting(copy)){copy.actionRequired=true;copy.completed=false;}
if(copy.pendingOffer){copy.actionRequired=true;copy.completed=false;}
if(copy.eventType==='choice')copy.earlyChoice=true;
state.active.push(copy);}
// Weather compatibility: one prevailing weather pattern per generated month.
// Compatible conditions (e.g. frost + severe cold, rain + wind) may coexist.
const weatherFamilies={
 '01':'wet','02':'wet','03':'wet','04':'wet','05':'wet','06':'wet',
 '07':'wind','08':'storm','09':'storm','10':'storm','11':'storm',
 '12':'dry','13':'heat','14':'dry','15':'cold','16':'cold',
 '17':'dry','18':'mild','19':'dry','20':'cold','21':'cold'
};
function weatherFamily(e){const id=(e.eventId||e.id||'').match(/^weather-2026-(\d{2})$/);return id?weatherFamilies[id[1]]||null:null;}
function weatherCompatible(a,b){
 const x=weatherFamily(a),y=weatherFamily(b);
 if(!x||!y)return true;
 // Avoid two separate events describing the same weather situation.
 if(x===y)return x==='cold' && new Set([a.id,b.id]).size===2 &&
   ((/weather-2026-(15|16)$/.test(a.id)&&/weather-2026-(20|21)$/.test(b.id))||
    (/weather-2026-(15|16)$/.test(b.id)&&/weather-2026-(20|21)$/.test(a.id)));
 const incompatible={
   wet:['cold','heat','dry'],cold:['wet','heat','dry','mild'],
   heat:['wet','cold'],dry:['wet','cold'],mild:['cold']
 };
 return !(incompatible[x]||[]).includes(y)&&!(incompatible[y]||[]).includes(x);
}
function compatibleWithBatch(e,chosen){
 if(e.c!==0)return true;
 const weather=chosen.filter(x=>x.c===0);
 return (weather.length<2 || (state.selected.length===1&&state.selected[0]===0)) && weather.every(x=>weatherCompatible(x,e)) &&
  !chosen.some(x=>(e.weatherAddition==='dealer'&&x.weatherAddition==='dealer')||(e.weatherAddition==='livestock'&&x.weatherAddition==='livestock')||((e.weatherAddition==='dealer'&&x.weatherAddition==='livestock')||(e.weatherAddition==='livestock'&&x.weatherAddition==='dealer'))) &&
  (!e.conflictGroup||!chosen.some(x=>x.conflictGroup===e.conflictGroup));
}
function generate(){
 const scheduled=state.tracking&&state.calendar&&state.frequency!=='manual';
 if(scheduled&&!dueForPeriod()){$('status').textContent='No events due this month. Advance your farm calendar.';return;}
 const period=scheduled?`${state.frequency}:${periodId()}`:null;
 if(state.tracking&&state.calendar&&state.monthGenerated[monthKey()]){
   $('status').textContent='All events for this scheduled period have already been generated. Use the arrows to view them.';return;
 }
 const count=state.minEvents+Math.floor(Math.random()*(state.maxEvents-state.minEvents+1));
  if(count===0){state.periodEvents=[];if(scheduled)state.periodKey=period;if(state.tracking&&state.calendar)state.monthGenerated[monthKey()]=true;persist();renderTracker();renderSchedule();syncCleanLayout();$('status').textContent='A quiet period on the farm — no random events this time.';return;}
 const pool=eligible();const seen=state.tracking&&state.calendar?(state.monthSeen[`${state.calendar.year||0}-${state.calendar.month}`]||[]):[];
 // Monthly uniqueness applies within the current month, including events already generated.
 // An existing batch is never extended by another click in the same scheduled period.
 const chosen=[];
 for(let i=0;i<count;i++){
   const candidates=pool.filter(e=>
     (!e.conflictGroup||!chosen.some(c=>c.conflictGroup===e.conflictGroup))&&
     !(e.c===0&&chosen.some(c=>c.c===0&&weatherCooldownFamily(c)===weatherCooldownFamily(e)))&&
     compatibleWithBatch(e,chosen));
   // Prefer a variety of event categories. Do not fill the month with weather.
   const unrepresented=candidates.filter(e=>!chosen.some(c=>c.c===e.c));
   const preferred=unrepresented.length?unrepresented:candidates;
   const next=chooseUnique(preferred,[...seen,...chosen.map(e=>e.id)]);
   if(!next)break;
   chosen.push(next);
 }
 if(!chosen.length){$('status').textContent='No unused eligible events remain this month. Advance the calendar or select more categories.';return;}
 state.periodEvents=chosen.map(e=>{markSeen(e);recordWeatherIncident(e);if(!state.tracking||!state.calendar)state.used.push(e.id);const v=instantiate(e);autoTrack(v);return v});
 if(scheduled)state.periodKey=period;
 if(state.tracking&&state.calendar)state.monthGenerated[monthKey()]=true;
 showEvent(state.periodEvents[0]);if(state.periodEvents.some(e=>!e.total)&&state.tracking){ongoingOpen=true;state.ongoingOpen=true;}persist();renderTracker();renderSchedule();syncCleanLayout();
 $('status').textContent=state.periodEvents.length<count?`${state.periodEvents.length} of ${count} events generated: only ${state.periodEvents.length} different eligible events remain this month. Select more categories or advance the calendar.`:`${state.periodEvents.length} different event${state.periodEvents.length===1?'':'s'} generated together. Use Previous and Next to see each one. Farm date unchanged.`;
}
$('generate').onclick=mainGoldAction;$('sticky').onclick=()=>{mainGoldAction();$('event').scrollIntoView({behavior:'smooth',block:'center'})};
$('hideCats').onclick=()=>{state.categoriesOpen=!state.categoriesOpen;persist();drawCats()};
$('all').onclick=()=>{state.selected=state.selected.length===cats.length?[]:cats.map((_,i)=>i);persist();drawCats();renderSchedule()};
function fillSelect(id,opts){const el=$(id);el.replaceChildren();opts.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;el.append(o)})}
fillSelect('startMonth',months.map((m,i)=>[i,m]));
function refreshDays(){const n=Number($('daysPerMonth').value)||3;$('daysPerMonthValue').textContent=String(n);const old=Number($('startDay').value)||1;fillSelect('startDay',Array.from({length:n},(_,i)=>[i+1,'Day '+(i+1)]));$('startDay').value=String(Math.min(n,old))}
$('daysPerMonth').oninput=refreshDays;
$('daysMinus').onclick=()=>{$('daysPerMonth').value=String(Math.max(1,Number($('daysPerMonth').value)-1));refreshDays()};
$('daysPlus').onclick=()=>{$('daysPerMonth').value=String(Math.min(28,Number($('daysPerMonth').value)+1));refreshDays()};
function openSettings(){const c=state.calendar||{month:2,day:1,daysPerMonth:3};$('startMonth').value=String(c.month);$('daysPerMonth').value=String(c.daysPerMonth);refreshDays();$('startDay').value=String(c.day);$('calendarSettings').hidden=false}
$('calendarEdit').onclick=openSettings;$('calendarCancel').onclick=()=>{if(state.calendar)$('calendarSettings').hidden=true};
$('calendarSave').onclick=()=>{const prev=state.calendar;const next={month:Number($('startMonth').value),day:Number($('startDay').value),daysPerMonth:Number($('daysPerMonth').value),year:prev?.year||0};/* Changing settings must not silently advance the year. */next.day=Math.max(1,Math.min(next.day,next.daysPerMonth));state.calendar=next;if(prev&&(prev.month!==next.month||prev.year!==next.year))state.scheduleAnchor=next.year*12+next.month;if(state.scheduleAnchor===null)state.scheduleAnchor=next.year*12+next.month;$('calendarSettings').hidden=true;if(!prev||prev.month!==next.month||prev.year!==next.year){state.periodEvents=[];state.current=null;}persist();renderTracker();renderSchedule();syncCleanLayout()};
function renderTracker(){const running=state.active.filter(x=>!x.completed&&!x.actionRequired).sort((a,b)=>String(b.id).localeCompare(String(a.id)));$('activeCount').textContent=running.length;$('activeSummary').textContent=running.length+' active';const c=state.calendar;$('calendarDate').textContent=c?`${months[c.month]}, Year ${(c.year||0)+1} — Day ${c.day} of ${c.daysPerMonth}`:'Set up your calendar';$('calendarInfo').textContent=c?`${c.daysPerMonth} day${c.daysPerMonth===1?'':'s'} per month · Progress saved in this browser.`:'Choose your current month and days per month to begin.';$('advanceDay').disabled=!c;if(!c&&state.tracking)$('calendarSettings').hidden=false;
const root=$('activeList');root.replaceChildren();if(running.length){const rh=document.createElement('h3');rh.className='action-heading';rh.textContent='Events Still in Progress';root.append(rh)}if(!running.length){const p=document.createElement('p');p.textContent='No ongoing events. Generate an event to add it automatically.';root.append(p)}
running.forEach(item=>{const card=document.createElement('div');card.className='track-card';const top=document.createElement('div');top.className='track-top';const h=document.createElement('h3');h.textContent=item.title;const span=document.createElement('span');span.textContent=item.duration?.unit==='months'?`${item.duration.amount} month${item.duration.amount===1?'':'s'}`:displayDuration(item.duration?.amount||0);top.append(h,span);const desc=document.createElement('p');desc.textContent=displayEventDescription(item);const bar=document.createElement('div');bar.className='progress';const fill=document.createElement('div');fill.className='progress-fill';fill.style.width=item.total?100*(item.total-item.remaining)/item.total+'%':'100%';bar.append(fill);const bottom=document.createElement('div');bottom.className='track-bottom';const rem=document.createElement('small');rem.textContent=displayDuration(item.remaining)+' remaining';bottom.append(rem);if(item.earlyChoice){const btn=document.createElement('button');btn.className='action-done';btn.textContent='✓ I completed the alternative';btn.onclick=()=>completeAction(item.id);card.append(top,desc,bar,bottom,btn)}else card.append(top,desc,bar,bottom);root.append(card)});
const actionRoot=$('requiredActions');actionRoot.replaceChildren();
const actions=state.active.filter(x=>x.actionRequired&&!x.completed);
if(actions.length){
 const header=document.createElement('div');header.className='actions-heading-row';const h=document.createElement('h3');h.textContent=`Pending Offers & Actions (${actions.length})`;h.className='action-heading';header.append(h);actionRoot.append(header);
 const completable=actions.filter(x=>!x.pendingOffer);
 {
  const bulk=document.createElement('button');bulk.type='button';bulk.className='action-done bulk-complete';
  bulk.textContent=completable.length?`✓ Mark All ${completable.length} Actions Completed`:`✓ No Actions to Complete`;
  bulk.disabled=!completable.length;
  bulk.title='Confirm all required actions. Timed repairs then move into In Progress; saved offers are excluded.';
  bulk.onclick=()=>{
   const finished=state.calendar?{...state.calendar}:null;
   state.active.forEach(x=>{if(x.actionRequired&&!x.completed&&!x.pendingOffer){completeFarmAction(x,finished);}});
   persist();renderTracker();renderBannerCompletion();syncCleanLayout();
  };
  header.append(bulk);
 }
}
actions.forEach(item=>{const card=document.createElement('div');card.className='track-card required-card';const title=document.createElement('strong');title.textContent=item.title;const desc=document.createElement('p');desc.textContent=displayEventDescription(item);const button=document.createElement('button');button.type='button';button.textContent=item.pendingOffer?'✓ Apply Offer When Used':'✓ Action Completed';button.className='action-done';button.onclick=()=>completeAction(item.id);const copy=document.createElement('div');copy.className='required-copy';copy.append(title,desc);card.append(copy,button);actionRoot.append(card)});
 renderHistory();renderFarmDashboard();renderBannerCompletion();if(typeof syncCleanLayout==='function')syncCleanLayout();}
function renderHistory(){const root=$('historyList');root.replaceChildren();$('historyPanel').hidden=!state.tracking;const completed=state.active.filter(e=>e.completed);if(!completed.length){const p=document.createElement('p');p.className='small-event-note';p.textContent='Completed events will appear here automatically.';root.append(p);return}
const years=[...new Set(completed.map(e=>e.created?.year||0))].sort((a,b)=>b-a);years.forEach(y=>{const yd=document.createElement('details');yd.className='history-year';yd.open=y===years[0];const ys=document.createElement('summary');ys.textContent=`Year ${y+1}`;yd.append(ys);for(let m=0;m<12;m++){const list=completed.filter(e=>(e.created?.year||0)===y&&(e.created?.month||0)===m);if(!list.length)continue;const md=document.createElement('details');md.className='history-month';md.open=y===years[0];const ms=document.createElement('summary');ms.textContent=`${months[m]} (${list.length})`;md.append(ms);list.forEach(e=>{const r=document.createElement('div');r.className='history-row';const name=document.createElement('strong');name.textContent=e.title;const info=document.createElement('small');info.textContent=`${displayEventDescription(e)} · Finished: ${dateLabel(e.finished)}`;r.append(name,info);md.append(r)});yd.append(md)}root.append(yd)})}
// Time-limited events must be acknowledged before their completion notice disappears.
// The queue is saved with the farm, so reloading cannot silently discard a notice.
let completionNoticeOpen=false;
function showCompletionNotices(){
 if(completionNoticeOpen||!state.completionNotices.length)return;
 completionNoticeOpen=true;
 const notices=state.completionNotices.slice();
 const previous=document.activeElement;
 const overlay=document.createElement('div');overlay.className='farm-dialog-overlay fsg-completion-overlay';
 const panel=document.createElement('section');panel.className='farm-dialog fsg-completion-dialog';
 panel.setAttribute('role','alertdialog');panel.setAttribute('aria-modal','true');
 const heading=document.createElement('h2');heading.textContent=notices.length===1?'✓ EVENT COMPLETED':'✓ EVENTS COMPLETED';
 heading.id='fsg-completion-heading';panel.setAttribute('aria-labelledby',heading.id);
 const intro=document.createElement('p');intro.textContent=notices.length===1?'Your farm event has finished.':'These farm events have finished.';
 const list=document.createElement('div');list.className='fsg-completion-list';
 notices.forEach(n=>{
  const row=document.createElement('div');row.className='fsg-completion-item';
  const title=document.createElement('strong');title.textContent=n.title;
  const message=document.createElement('p');message.textContent=n.message||'The event restriction has ended. Normal farm activities can resume.';
  row.append(title,message);list.append(row);
 });
 const acknowledge=document.createElement('button');acknowledge.type='button';acknowledge.className='farm-dialog-confirm fsg-completion-ack';
 acknowledge.textContent=notices.length===1?'Acknowledge Completion':`Acknowledge ${notices.length} Completions`;
 acknowledge.onclick=()=>{
  const acknowledged=new Set(notices.map(n=>n.id));
  state.completionNotices=state.completionNotices.filter(n=>!acknowledged.has(n.id));
  persist();overlay.remove();completionNoticeOpen=false;previous?.focus?.();
  if(state.completionNotices.length)showCompletionNotices();
 };
 panel.append(heading,intro,list,acknowledge);overlay.append(panel);document.body.append(overlay);
 // Do not close on Escape, outside tap, or reload; acknowledgement is intentional.
 overlay.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();acknowledge.focus()}
  if(e.key==='Tab'){e.preventDefault();acknowledge.focus()}
 });
 acknowledge.focus();
}
function completionMessage(item){
 if(item.eventId==='weather-2026-01'||item.eventId==='weather-2026-02'||item.eventId==='weather-2026-03')return 'The flooding restriction has ended. Fieldwork can resume.';
 if(item.eventId==='weather-2026-11')return 'The power outage restriction has ended. Production can resume.';
 if(item.eventId==='weather-2026-14')return 'The drought-related cultivation restriction has ended. Cultivation can resume.';
 if(item.category===0)return 'This weather-related event has finished.';
 if(item.category===2)return 'Repairs are complete. Your machinery is ready to collect or return to service.';
 return 'The event has finished. Any temporary restriction has now been lifted.';
}
function advance(){if(!state.tracking||!state.calendar)return;const c=state.calendar;
if(state.completionNotices.length){showCompletionNotices();return;}
// Only immediate mandatory actions block the calendar. Saved offers can be applied at any later date.
const pending=state.active.filter(x=>x.actionRequired&&!x.completed&&!x.pendingOffer);
if(pending.length){
  const msg=`Complete ${pending.length} pending event action${pending.length===1?'':'s'} before advancing the calendar.`;
  $('status').textContent=msg;
  const notice=$('scheduleStatus');if(notice)notice.textContent=msg;
  farmDialog('Please complete all required event actions before continuing to the next day or month. Saved offers can be used later.',{title:'Unfinished Events'});
  return;
}
if(c.day>=c.daysPerMonth){c.day=1;c.month=(c.month+1)%12;if(c.month===0)c.year=(c.year||0)+1}else c.day++;
if(c.day===1||state.frequency==='daily'){state.periodEvents=[];state.periodKey=null;state.current=null;}state.active.forEach(x=>{if(!x.completed&&x.remaining>0){x.remaining=Math.max(0,x.remaining-1);if(x.remaining===0){x.completed=true;x.finished={...c};queuePossibleInsuranceClaim(x);state.completionNotices.push({id:x.id,title:x.title,message:completionMessage(x)});}}});persist();renderTracker();renderSchedule();syncCleanLayout();renderBannerCompletion();showCompletionNotices();
// Automatically draw the new day's/month's scheduled events after advancing.
// Manual mode stays manual; do not generate twice for an already drawn period.
if(state.frequency!=='manual'&&dueForPeriod()&&!monthAlreadyGenerated())generate();
}
$('advanceDay').onclick=advance;
$('activeToggle').onclick=()=>{toggleOngoing()};
function updateTracking(){state.tracking=$('enableTracking').checked;$('activeToggle').hidden=true;$('calendarSettings').hidden=!state.tracking;if(state.tracking&&!state.calendar)openSettings();persist();renderTracker();renderSchedule();syncCleanLayout()}
$('enableTracking').onchange=updateTracking;
function periodId(){const c=state.calendar;if(!c||state.frequency==='manual')return null;if(state.frequency==='daily')return `${c.year||0}-${c.month}-${c.day}`;const every=Number(state.frequency);const abs=(c.year||0)*12+c.month;return Math.floor((abs-(state.scheduleAnchor??abs))/every)}
function dueForPeriod(){if(!state.calendar||state.frequency==='manual')return false;if(state.frequency==='daily')return true;const c=state.calendar;const every=Number(state.frequency);const abs=(c.year||0)*12+c.month;return (abs-(state.scheduleAnchor??abs))%every===0}
function renderSchedule(){const manual=state.frequency==='manual';$('countField').hidden=false;$('scheduleBox').hidden=true;$('frequency').value=state.frequency;$('minEvents').value=String(state.minEvents);$('maxEvents').value=String(state.maxEvents);if(manual)return;const c=state.calendar;const status=$('scheduleStatus');const btn=$('revealDue');if(!state.tracking||!c){status.textContent='Enable Farm Calendar & Event Tracking and set your in-game date to schedule events.';btn.disabled=true;return}const period=periodId();btn.textContent=state.frequency==='daily'?`${months[c.month]} Farm Update — Day ${c.day}`:`${months[c.month]} Farm Update`;if(!dueForPeriod()){const abs=(c.year||0)*12+c.month;const anchor=state.scheduleAnchor??abs;const next=abs+(Number(state.frequency)-((abs-anchor)%Number(state.frequency)));status.textContent=`Next scheduled events will be due in ${months[next%12]}, Year ${Math.floor(next/12)+1}.`;btn.disabled=true;return}if(state.periodKey!==`${state.frequency}:${period}`){state.periodKey=`${state.frequency}:${period}`;persist()}btn.disabled=state.periodEvents.length>0;status.textContent=state.periodEvents.length?`${state.periodEvents.length} different events generated for ${months[c.month]}${state.frequency==='daily'?' Day '+c.day:''}. Select their photographs above to view each event.`:`Events are due for ${months[c.month]}${state.frequency==='daily'?' Day '+c.day:''}. Generate them when you're ready.`;}
$('frequency').onchange=()=>{state.frequency=$('frequency').value;if(state.calendar)state.scheduleAnchor=(state.calendar.year||0)*12+state.calendar.month;state.periodKey=null;state.periodEvents=[];state.current=null;persist();renderThumbnails();renderSchedule();syncCleanLayout()};
function updateEventRange(changed){let min=Number($('minEvents').value),max=Number($('maxEvents').value);if(min>max){if(changed==='min')max=min;else min=max;}state.minEvents=min;state.maxEvents=max;state.count=min===max?String(min):'random';persist();renderSchedule();syncCleanLayout();}
$('minEvents').onchange=()=>updateEventRange('min');
$('maxEvents').onchange=()=>updateEventRange('max');
$('revealDue').onclick=generate;

function monthAlreadyGenerated(){return !!(state.calendar&&state.monthGenerated[monthKey()]);}
function updateGoldLabel(){
 const b=$('generate'), sticky=$('sticky');
 if(!state.calendar||!state.tracking){b.disabled=false;sticky.disabled=false;b.textContent='⟳ FARM UPDATE';sticky.textContent='⟳ Farm Update';return;}
 const c=state.calendar, month=months[c.month];
 let label;
 if(!monthAlreadyGenerated()&&(state.frequency==='manual'||dueForPeriod()))label=state.frequency==='daily'?`${month} Farm Update — Day ${c.day}`:`${month} Farm Update`;
 else if(c.day<c.daysPerMonth)label=`Advance to Day ${c.day+1}`;
 // Completed actions are required; timed events may continue.

 else label=`Advance to ${months[(c.month+1)%12]}`;
 b.textContent='⟳  '+label.toUpperCase();sticky.textContent='⟳ '+label;
 b.disabled=false;sticky.disabled=false;
}
function mainGoldAction(){
 if(!state.tracking||!state.calendar){generate();return;}
 if(!monthAlreadyGenerated()&&(state.frequency==='manual'||dueForPeriod())){generate();return;}
 advance();
}
let setupOpen=false,ongoingOpen=!!state.ongoingOpen;
function syncCleanLayout(){
 const hasFarm=!!state.calendar&&state.tracking;
 $('calendarSettings').hidden=!state.tracking||!setupOpen;
 $('farmSetup').hidden=!setupOpen;
 $('farmStatus').hidden=!hasFarm;
 $('activeToggle').hidden=true;
 $('tracker').hidden=!hasFarm||!ongoingOpen;
 $('ongoingMount').hidden=!ongoingOpen;
 $('ongoingTop').setAttribute('aria-expanded',String(ongoingOpen));
 $('ongoingShow').textContent=ongoingOpen?'Hide ▴':'Show ▾';
 const running=state.active.filter(e=>!e.completed&&!e.actionRequired).length;const required=state.active.filter(e=>!e.completed&&e.actionRequired).length;
 $('ongoingCount').textContent=`${running} Ongoing · ${required} Action${required===1?'':'s'} Required`;
 if(hasFarm){const c=state.calendar;const nextMonth=months[(c.month+1)%12];$('farmDateTop').textContent=`${months[c.month]} — Year ${(c.year||0)+1} · Day ${c.day} of ${c.daysPerMonth}`;$('advanceTop').textContent=c.day>=c.daysPerMonth?`Advance to ${nextMonth}`:`Advance to Day ${c.day+1}`;}
 $('historyDetails').hidden=!hasFarm;
 $('compactFarmDate').parentElement.hidden=true;
 $('compactFarmDate').textContent=hasFarm?`${months[state.calendar.month]} — Year ${(state.calendar.year||0)+1} · Day ${state.calendar.day} of ${state.calendar.daysPerMonth}`:'YOUR FARM · Set up your calendar';
 updateGoldLabel();
}
function toggleOngoing(){ongoingOpen=!ongoingOpen;state.ongoingOpen=ongoingOpen;persist();syncCleanLayout()}
$('ongoingTop').onclick=toggleOngoing;

function showSetup(){setupOpen=true;$('farmSetup').hidden=false;$('closeSetup').hidden=!state.calendar;openSettings();$('calendarSettings').hidden=!$('enableTracking').checked;syncCleanLayout();$('farmSetup').scrollIntoView({behavior:'smooth',block:'start'})}
$('farmSettingsMenu').onclick=e=>{e.preventDefault();showSetup()};
$('finishSetup').onclick=()=>{state.tracking=$('enableTracking').checked;if(state.tracking){$('calendarSave').click();}else{state.periodEvents=[];state.current=null;state.used=[];persist();renderTracker();renderSchedule();}setupOpen=false;syncCleanLayout();$('event').scrollIntoView({behavior:'smooth',block:'center'})};
$('closeSetup').onclick=()=>{setupOpen=false;syncCleanLayout()};

// A new save should clear progress without changing player preferences.
const newFarmButton=document.createElement('button');
newFarmButton.type='button';
newFarmButton.id='newFarmReset';
newFarmButton.className='select-all';
newFarmButton.textContent='↻ Start New Farm / Reset Progress';
newFarmButton.style.cssText='display:block;margin:18px 0 6px;padding:11px 16px;';
newFarmButton.title='Clears farm events and calendar, but keeps your selected categories and preferences';
$('farmSetup').append(newFarmButton);
const resetExplanation=document.createElement('p');
resetExplanation.className='calendar-note';
resetExplanation.textContent='Clears this farm’s events, history and calendar. Keeps your category, animal, crop and event preferences.';
$('farmSetup').append(resetExplanation);
newFarmButton.addEventListener('click',()=>{
 farmDialog('Start a new farm? This will permanently clear all active events, completed history and the farm calendar saved in this browser. Your event preferences will be kept.',{title:'Start New Farm',confirm:true,confirmLabel:'Yes, Start New Farm',onConfirm:()=>{
 const fresh={
   selected:[...state.selected],current:null,used:[],active:[],categoriesOpen:state.categoriesOpen,
   tracking:state.tracking,calendar:null,frequency:state.frequency,count:state.count,minEvents:state.minEvents,maxEvents:state.maxEvents,currency:state.currency,areaUnit:state.areaUnit,
   periodKey:null,periodEvents:[],scheduleAnchor:null,monthSeen:{},monthGenerated:{},weatherHistory:[],insuranceClaims:[],
   lastGenerated:null,sequence:0,animalsOwned:[...state.animalsOwned],cropsOwned:[...state.cropsOwned],ongoingOpen:false
 };
 try{localStorage.setItem(KEY,JSON.stringify(fresh))}catch(e){}
 window.location.reload();
}});
});

// Farm Settings: persist individual selections, with independent select-all controls.
function makeFarmSelectionSection(title,description,names,stateKey,optionsId){
 const section=document.createElement('section');
 section.className='crop-settings';
 section.innerHTML=`<h3>${title}</h3><p>${description}</p><div class="crop-options" id="${optionsId}"></div>`;
 const options=section.querySelector('#'+optionsId);
 const allLabel=document.createElement('label');
 allLabel.className='farm-select-all';
 const allCheck=document.createElement('input');
 allCheck.type='checkbox';
 const allText=document.createTextNode(' Select All / Deselect All');
 allLabel.append(allCheck,allText);
 options.append(allLabel);
 const checks=[];
 function syncAll(){
   const selected=checks.filter(c=>c.checked).length;
   allCheck.checked=selected===names.length;
   allCheck.indeterminate=selected>0&&selected<names.length;
 }
 allCheck.addEventListener('change',()=>{
   state[stateKey]=allCheck.checked?[...names]:[];
   checks.forEach(check=>{check.checked=allCheck.checked});
   syncAll();persist();renderSchedule();
 });
 names.forEach(name=>{
   const label=document.createElement('label');const check=document.createElement('input');
   check.type='checkbox';check.checked=state[stateKey].includes(name);
   check.addEventListener('change',()=>{
     state[stateKey]=check.checked?[...new Set([...state[stateKey],name])]:state[stateKey].filter(x=>x!==name);
     syncAll();persist();renderSchedule();
   });
   label.append(check,document.createTextNode(' '+name));options.append(label);checks.push(check);
 });
 syncAll();
 return {section,checks,syncAll};
}
const areaSection=document.createElement('section');
areaSection.className='crop-settings area-unit-settings';
areaSection.innerHTML='<h3>Field Measurements</h3><p>Choose which field-size measurement appears in your random events.</p><div class="area-unit-options" role="group" aria-label="Field measurements"><button type="button" data-unit="acres">Acres</button><button type="button" data-unit="hectares">Hectares</button></div>';
const areaButtons=[...areaSection.querySelectorAll('button')];
function syncAreaButtons(){areaButtons.forEach(b=>{const selected=b.dataset.unit===state.areaUnit;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected)})}
areaButtons.forEach(b=>b.addEventListener('click',()=>{state.areaUnit=b.dataset.unit;syncAreaButtons();persist();if(state.current)showEvent(state.current);renderTracker();renderSchedule()}));
syncAreaButtons();
// Keep the existing field measurement buttons and their appearance unchanged.
const currencySection=document.createElement('section');
currencySection.className='crop-settings area-unit-settings';
currencySection.innerHTML='<h3>Currency</h3><p>Choose the currency shown in random events.</p><div class="area-unit-options" role="group" aria-label="Currency"><button type="button" data-currency="GBP">£ Pound</button><button type="button" data-currency="EUR">€ Euro</button><button type="button" data-currency="USD">$ Dollar</button></div>';
const currencyButtons=[...currencySection.querySelectorAll('button')];
function syncCurrencyButtons(){currencyButtons.forEach(b=>{const selected=b.dataset.currency===state.currency;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected)})}
function refreshCurrency(){syncCurrencyButtons();document.querySelector('label[for="calcPrice"]').textContent='Normal price ('+currencySymbol()+')';document.querySelectorAll('#calcPriceOptions button').forEach(b=>{b.textContent=money(Number(b.dataset.price))});updateCalculator();if(state.current)showEvent(state.current);renderTracker();renderHistory()}
currencyButtons.forEach(b=>b.addEventListener('click',()=>{state.currency=b.dataset.currency;persist();refreshCurrency()}));
const unitCurrencyRow=document.createElement('div');unitCurrencyRow.className='fsg-unit-currency-row';unitCurrencyRow.append(areaSection,currencySection);
$('setupMount').prepend(unitCurrencyRow);
const unitCurrencyStyle=document.createElement('style');unitCurrencyStyle.textContent='.fsg-unit-currency-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.fsg-unit-currency-row>.crop-settings{margin:0;min-width:0}.fsg-unit-currency-row .area-unit-options{display:flex;flex-wrap:wrap;gap:7px}@media(max-width:540px){.fsg-unit-currency-row{gap:8px}.fsg-unit-currency-row>.crop-settings{padding:12px 8px}.fsg-unit-currency-row .area-unit-options button{font-size:.8rem;padding:7px 9px}}';document.head.append(unitCurrencyStyle);
syncCurrencyButtons();
const animalSettings=makeFarmSelectionSection('Your Animals','Select the animals you keep. Animal-specific events require the relevant animal to be selected.',animalNames,'animalsOwned','animalOptions');
const cropSettings=makeFarmSelectionSection('Your Crops','Select the crops you grow. Events about any crop or field remain available whenever you grow at least one crop.',cropNames,'cropsOwned','cropOptions');
$('setupMount').prepend(animalSettings.section);
$('setupMount').prepend(cropSettings.section);
const resetFarmSettings=document.createElement('button');
resetFarmSettings.type='button';resetFarmSettings.className='bulk-complete';
resetFarmSettings.textContent='Reset Farm Settings';
resetFarmSettings.style.cssText='margin:12px 0 16px;padding:9px 14px;';
resetFarmSettings.title='Deselect every animal and crop; keep your existing farm events and calendar';
resetFarmSettings.addEventListener('click',()=>{
 farmDialog('Deselect all crops and animals? Your event history and calendar will be kept.',{title:'Reset Farm Settings',confirm:true,confirmLabel:'Yes, Reset',onConfirm:()=>{
 state.animalsOwned=[];state.cropsOwned=[];
 [...animalSettings.checks,...cropSettings.checks].forEach(check=>{check.checked=false});
 animalSettings.syncAll();cropSettings.syncAll();persist();renderSchedule();
}});
});
cropSettings.section.after(resetFarmSettings);
// The calendar, tracking toggle, and frequency controls live in one setup panel.
$('setupMount').append($('tracking-optin-placeholder')||$('enableTracking').closest('.tracking-optin'),$('calendarSettings'),$('frequencyPanel'));
$('calendarEdit').onclick=showSetup;

// Compact three-column Farm Event Dashboard. This is a view of existing state only.
let dashboardOpen='';
const dashboardStyle=document.createElement('style');
dashboardStyle.textContent=`
#farmEventDashboard{margin:0 0 14px;color:#fff}
.fsg-dash-heading{font-size:1.18rem;color:#f0c568;margin:0 0 12px;font-weight:700}
.fsg-dash-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.fsg-dash-tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-height:90px;padding:10px 5px;background:#0b3326;border:1px solid #b99043;border-radius:10px;color:white;cursor:pointer;font:inherit;text-align:center}
.fsg-dash-tab[aria-expanded="true"]{background:#12402f;border-color:#f1c469}
.fsg-dash-number{font-size:1.7rem;font-weight:800;color:#f1c469;line-height:1}
.fsg-dash-label{font-size:.83rem;font-weight:650}
.fsg-dash-arrow{color:#f1c469;font-size:.85rem}
.fsg-dash-content{margin-top:12px;display:grid;gap:9px}
.fsg-dash-row{background:#0b3326;border:1px solid #b99043;border-radius:8px;padding:12px;display:grid;gap:7px}
.fsg-dash-row strong{color:#fff}
.fsg-dash-row p{margin:0;color:#d5e4da;font-size:.9rem;line-height:1.45}
.fsg-dash-row small{color:#f1c469}
.fsg-dash-done{justify-self:end;border:1px solid #d9ad54;background:#0b3326;color:#f1c469;border-radius:7px;padding:8px 12px;font-weight:700;cursor:pointer}.fsg-dash-done:hover:not(:disabled){background:#194b37;border-color:#f1c469}
.fsg-dash-done.is-completed{background:#d8ad51;border-color:#e2b85d;color:#173b29;cursor:default}
.fsg-dash-progress{height:9px;border-radius:20px;overflow:hidden;background:#092f22;border:1px solid #426b52}
.fsg-dash-progress-fill{height:100%;background:linear-gradient(90deg,#c99a38,#f1c469);transition:width .2s}
.fsg-dash-row.is-completed{border-color:#a88b4b}
.fsg-dash-tile{display:flex;flex-direction:column;align-items:stretch;min-width:0;background:#0b3326;border:1px solid #b99043;border-radius:10px;overflow:hidden}
.fsg-dash-tile .fsg-dash-tab{border:0;border-radius:0;min-height:72px}
.fsg-dash-tile:has(.fsg-dash-tab[aria-expanded="true"]){border-color:#f1c469}
.fsg-dash-tile .fsg-dash-bulk{align-self:stretch;justify-self:stretch;margin:0 7px 8px;padding:7px 3px;font-size:.74rem;line-height:1.2}
.fsg-dash-bulk:disabled{opacity:.65;cursor:default}
.fsg-dash-empty{color:#d5e4da;margin:8px 0}.fsg-dash-bulk{justify-self:end;margin-top:5px;border:1px solid #d9ad54;background:#0b3326;color:#f1c469;border-radius:7px;padding:10px 14px;font:inherit;font-weight:700;cursor:pointer}.fsg-dash-bulk:hover{background:#194b37}
@media(max-width:420px){.fsg-dash-grid{gap:5px}.fsg-dash-tab{min-height:82px;padding:8px 3px}.fsg-dash-label{font-size:.72rem}.fsg-dash-number{font-size:1.5rem}}
`;
document.head.append(dashboardStyle);
const dashboard=document.createElement('div');dashboard.id='farmEventDashboard';
$('tracker').prepend(dashboard);
$('requiredActions').style.display='none';
$('activeList').style.display='none';
function renderFarmDashboard(){
 const isFinishedToday=x=>x.completed && (!state.calendar || (x.finished && x.finished.year===state.calendar.year && x.finished.month===state.calendar.month && x.finished.day===state.calendar.day));
 const actions=state.active.filter(x=>!x.pendingOffer && (x.actionRequired&&!x.completed || (isFinishedToday(x)&&!x.total)));
 const offers=state.active.filter(x=>x.pendingOffer && (!x.completed || isFinishedToday(x)));
 const running=state.active.filter(x=>!x.completed&&!x.actionRequired);
 const counts={actions:actions.length,ongoing:running.length,offers:offers.length};
 dashboard.replaceChildren();
 const heading=document.createElement('h2');heading.className='fsg-dash-heading';heading.textContent='Farm Event Dashboard';dashboard.append(heading);
 const grid=document.createElement('div');grid.className='fsg-dash-grid';
 [['actions','Actions'],['ongoing','In Progress'],['offers','Saved Offers']].forEach(([key,label])=>{
  const tile=document.createElement('div');tile.className='fsg-dash-tile';
  const b=document.createElement('button');b.type='button';b.className='fsg-dash-tab';
  b.setAttribute('aria-expanded',String(dashboardOpen===key));
  b.innerHTML=`<span class="fsg-dash-number">${counts[key]}</span><span class="fsg-dash-label">${label}</span><span class="fsg-dash-arrow">${dashboardOpen===key?'▴':'▾'}</span>`;
  b.onclick=()=>{dashboardOpen=dashboardOpen===key?'':key;renderFarmDashboard()};tile.append(b);
  if(key==='actions'){
   const outstanding=actions.filter(x=>!x.completed);
   const bulk=document.createElement('button');bulk.type='button';bulk.className='fsg-dash-bulk';
   bulk.textContent=outstanding.length?'✓ Complete All':'✓ All Done';bulk.disabled=!outstanding.length;
   bulk.title='Confirm outstanding actions and begin any waiting periods; saved offers are excluded.';
   bulk.onclick=()=>{
    const now=state.calendar?{...state.calendar}:null;
    outstanding.forEach(x=>{completeFarmAction(x,now);});
    persist();renderTracker();renderBannerCompletion();syncCleanLayout();
   };
   tile.append(bulk);
  }
  grid.append(tile);
 });dashboard.append(grid);
 if(!dashboardOpen)return;
 const content=document.createElement('div');content.className='fsg-dash-content';dashboard.append(content);
 const items=dashboardOpen==='actions'?actions:dashboardOpen==='offers'?offers:running;
 if(!items.length){const p=document.createElement('p');p.className='fsg-dash-empty';p.textContent=dashboardOpen==='actions'?'No actions required.':dashboardOpen==='offers'?'No saved offers.':'No events in progress.';content.append(p);return;}
 items.forEach(item=>{
  const card=document.createElement('div');card.className='fsg-dash-row';if(item.completed)card.classList.add('is-completed');
  const title=document.createElement('strong');title.textContent=item.title;card.append(title);
  const desc=document.createElement('p');desc.textContent=displayEventDescription(item);card.append(desc);
  if(dashboardOpen==='ongoing'){
   const progress=document.createElement('div');progress.className='fsg-dash-progress';progress.setAttribute('role','progressbar');
   const percent=item.total?Math.max(0,Math.min(100,100*(item.total-item.remaining)/item.total)):0;progress.setAttribute('aria-valuenow',String(Math.round(percent)));progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax','100');
   const fill=document.createElement('div');fill.className='fsg-dash-progress-fill';fill.style.width=percent+'%';progress.append(fill);card.append(progress);
   const rem=document.createElement('small');rem.textContent=item.duration?.unit==='months'?`${Math.ceil(item.remaining/(state.calendar?.daysPerMonth||3))} month(s) remaining`:displayDuration(item.remaining)+' remaining';card.append(rem);
  }
  if(dashboardOpen!=='ongoing'){
   const btn=document.createElement('button');btn.type='button';btn.className='fsg-dash-done';
   btn.textContent=item.completed?'✓ Completed':item.pendingOffer?'✓ Apply Offer When Used':'✓ Action Completed';
   if(item.completed){btn.classList.add('is-completed');btn.disabled=true;}else btn.onclick=()=>completeAction(item.id);card.append(btn);
  }
  content.append(card);
 });

}

$('tracker').querySelector('.calendar-box').hidden=true;
// The farm date is already displayed above the advance button; avoid duplicating it inside the tracker.
const duplicateFarmDate=$('compactFarmDate');if(duplicateFarmDate?.parentElement)duplicateFarmDate.parentElement.hidden=true;
$('ongoingMount').append($('tracker'));
$('historyPanel').hidden=false;
const hist=$('historyPanel');const summary=document.createElement('summary');summary.textContent='Farm Event History — Show / Hide';const detail=document.createElement('details');detail.className=hist.className;detail.id='historyDetails';hist.parentNode.insertBefore(detail,hist);detail.append(summary,hist);hist.className='history-content';hist.style.cssText='margin-top:8px;border:0;padding:0;background:transparent';
if(!state.calendar){setupOpen=true;$('calendarSettings').hidden=!state.tracking}
$('enableTracking').checked=state.tracking;drawCats();if(!state.current)state.current=instantiate(events[0]);showEvent(state.current);updateTracking();renderSchedule();syncCleanLayout();refreshCurrency();
if(typeof IntersectionObserver!=='undefined'){const obs=new IntersectionObserver(es=>{$('sticky').classList.toggle('show',!es[0].isIntersecting)},{threshold:.2});obs.observe($('generate'))}

// Compact completion notification styled to match the approved forest-green/gold UI.
const completionStyle=document.createElement('style');
completionStyle.textContent=`
.fsg-completion-overlay{z-index:99999}
.fsg-completion-dialog{max-width:min(440px,calc(100vw - 32px));width:100%;box-sizing:border-box;background:#17382b;border:1px solid #b99a55;color:#f4f1e6;max-height:calc(100dvh - 36px);overflow-y:auto}
.fsg-completion-dialog h2{color:#e8cb83;text-align:center;margin:0 0 10px;font-size:clamp(19px,4.5vw,25px)}
.fsg-completion-dialog>p{text-align:center;color:#f4f1e6;margin:0 0 14px}
.fsg-completion-list{display:grid;gap:10px;margin-bottom:16px}
.fsg-completion-item{background:#254b39;border:1px solid #9e864e;border-radius:10px;padding:12px}
.fsg-completion-item strong{display:block;color:#e8cb83;margin-bottom:5px}
.fsg-completion-item p{margin:0;color:#fff;line-height:1.45;font-size:14px}
.fsg-completion-ack{display:block;width:100%;background:#d8ad51!important;color:#17382b!important;font-weight:800;border-radius:8px;padding:13px 10px}
`;
document.head.append(completionStyle);
// Restore unacknowledged notices when the farm is reopened.
showCompletionNotices();
