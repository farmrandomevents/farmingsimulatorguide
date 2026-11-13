
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
const cropEventMap={"book-01-030":"Wheat","book-01-031":"Wheat","book-01-032":"Barley","book-01-033":"Oats","book-01-034":"Corn","book-01-035":"Canola","book-01-036":"Potatoes"};
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const KEY='fsg-first-events-test-v1';
let state={selected:cats.map((_,i)=>i),current:null,used:[],active:[],categoriesOpen:true,tracking:false,calendar:null,frequency:'manual',count:'1',periodKey:null,periodEvents:[],scheduleAnchor:null,monthSeen:{},lastGenerated:null,sequence:0,animalsOwned:[],cropsOwned:[],areaUnit:'acres'};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')state={...state,...s}}catch(e){}
if(!Array.isArray(state.selected))state.selected=cats.map((_,i)=>i);
if(!Array.isArray(state.active))state.active=[];
if(!Array.isArray(state.periodEvents))state.periodEvents=[];
if(!Array.isArray(state.used))state.used=[];
if(!Array.isArray(state.cropsOwned))state.cropsOwned=[];
if(!Array.isArray(state.animalsOwned))state.animalsOwned=[];
if(!['acres','hectares'].includes(state.areaUnit))state.areaUnit='acres';
state.animalsOwned=[...new Set(state.animalsOwned.map(a=>a==='Cows'?'Cattle':a))];
if(!state.monthGenerated||typeof state.monthGenerated!=='object')state.monthGenerated={};
if(state.calendar){state.calendar.daysPerMonth=Math.max(1,Math.min(28,Number(state.calendar.daysPerMonth)||1));state.calendar.day=Math.max(1,Math.min(state.calendar.daysPerMonth,Number(state.calendar.day)||1));}
if(!state.monthSeen||typeof state.monthSeen!=='object')state.monthSeen={};
function updateCalculator(){const price=Math.max(0,Number($('calcPrice').value)||0);const pct=Math.min(100,Math.max(0,Number($('calcPercent').value)||0));const saving=price*pct/100;const money=n=>'£'+Math.round(n).toLocaleString('en-GB');const isDiscount=$('calcKind').value==='discount';$('calcResult').innerHTML=isDiscount?`<strong>Receive ${money(saving)} from your Payment Farm</strong><div>Final purchase cost: ${money(price-saving)}</div>`:`<strong>Receive ${money(saving)} from your Payment Farm</strong><div>Total sale value: ${money(price+saving)}</div>`;}
const calcPriceOptions=$('calcPriceOptions');
[1000,5000,10000,25000,50000,100000,250000,500000].forEach(price=>{const b=document.createElement('button');b.type='button';b.dataset.price=String(price);b.textContent='£'+price.toLocaleString('en-GB');b.addEventListener('click',()=>{$('calcPrice').value=String(Math.max(0,Number($('calcPrice').value)||0)+price);updateCalculator()});calcPriceOptions.append(b)});

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
 const dpm=Math.max(1,Math.min(28,Number(state.calendar?.daysPerMonth)||3));
 if(e.duration==='months'){
  const lo=Math.max(1,e.minMonths||1),hi=Math.max(lo,e.maxMonths||lo);
  const n=lo+Math.floor(Math.random()*(hi-lo+1));
  return {amount:n,unit:'months',label:`${n} ${n===1?'month':'months'}`,total:n*dpm};
 }
 // All day-based timed events draw a duration suited to the player's calendar.
 // One-day months use a half-day restriction, which expires at the next advance.
 if(dpm===1)return {amount:.5,unit:'days',label:'until 12pm (half a day)',total:1};
 const max=dpm===2?1:dpm===3?2:dpm<=7?4:8;
 const n=1+Math.floor(Math.random()*max);
 return {amount:n,unit:'days',label:`${n} ${n===1?'day':'days'}`,total:n};
}
function isPendingOffer(e){
 if(e.c!==7)return false;
 const t=(e.t+' '+e.template).toLowerCase();
 return /next (tractor|machine|vehicle|implement|purchase|repair|upgrade|used|new)|towards (your|one|a|any)|discount on (one|your|the next)|voucher|trade-in bonus|customer reward|loyalty reward|free (repair|repaint|tune-up|fuel)|tyre upgrade|engine upgrade|parts voucher|dealer discount|seasonal promotion|attachment offer|used machinery deal/.test(t);
}
function instantiate(e){const dur=isPendingOffer(e)?null:durationFor(e);const amount=e.amounts?randomFrom(e.amounts):null;const animal=e.id==='weather-2026-20'?randomFrom(state.animalsOwned):null;const description=e.template.replace('{animal}',animal?animal.toLowerCase():'livestock');return {id:`event-${Date.now()}-${++state.sequence}`,eventId:e.id,title:e.t,category:e.c,photo:e.p,description:description.replace('{duration}',dur?.label||'').replace('{amount}',amount===null?'':amount.toLocaleString('en-GB')),duration:dur,eventType:e.eventType||null,pendingOffer:isPendingOffer(e),completed:false,remaining:dur?.total||0,total:dur?.total||0,created:state.calendar?{...state.calendar}:null,finished:null};}
function markSeen(e){if(!state.tracking||!state.calendar)return;const key=`${state.calendar.year||0}-${state.calendar.month}`;if(!key)return;const a=state.monthSeen[key]||[];if(!a.includes(e.id))a.push(e.id);state.monthSeen[key]=a;}
function eligible(){return events.filter(e=>state.selected.includes(e.c)&&(e.c!==1||state.cropsOwned.length>0)&&(e.c!==3||state.animalsOwned.length>0)&&(!e.requiresAnimals||state.animalsOwned.length>=e.requiresAnimals)&&(!e.animals||e.animals.some(a=>state.animalsOwned.includes(a==='Cows'?'Cattle':a)))&&(!cropEventMap[e.id]||state.cropsOwned.includes(cropEventMap[e.id]))&&(!state.tracking||!state.active.some(a=>!a.completed&&a.eventId===e.id)))}
function chooseUnique(pool,used){const a=pool.filter(e=>!used.includes(e.id));return a.length?randomFrom(a):null}
function drawCats(){
 $('all').textContent=state.selected.length===cats.length?'✕ Deselect All':'✓ Select All';
 $('categories').hidden=!state.categoriesOpen;
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
function showEvent(v){if(!v)return;state.current=v;$('cat').textContent=cats[v.category].toUpperCase()+' • RANDOM EVENT';$('title').textContent=v.title;$('desc').textContent=displayEventDescription(v);$('photo').src='images/'+categorySlugs[v.category]+'/event-'+v.category+'.webp';$('photo').alt=v.title+' farming scene';renderThumbnails();renderBannerCompletion();}
function findTracked(v){return state.active.find(x=>x.id===v?.id)}
function completeAction(id){
 const item=state.active.find(x=>x.id===id);
 if(!item||(!item.actionRequired&&!item.earlyChoice)||item.completed)return;
 item.completed=true;item.actionRequired=false;item.finished=state.calendar?{...state.calendar}:null;
 persist();renderTracker();renderBannerCompletion();syncCleanLayout();
}
function renderBannerCompletion(){
 const b=$('bannerComplete'), item=findTracked(state.current);
 b.hidden=!(item&&(item.completed||item.actionRequired||item.earlyChoice));
 if(b.hidden)return;
 const done=!!item.completed;
 b.disabled=done;
 b.textContent=done?'✓ Completed':item.pendingOffer?'✓ Apply Offer When Used':item.earlyChoice?'✓ I chose the early solution':'✓ Mark as Completed';
 b.style.backgroundColor=done?'#D8AD51':'';
 b.style.color=done?'#173B29':'';
 b.style.borderColor=done?'#D8AD51':'';
 b.style.opacity='1';
 b.onclick=done?null:()=>completeAction(item.id);
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
 if(!duration)return formatAreaText(item.description);
 const label=duration.label|| (duration.unit==='months'?`${duration.amount} month${duration.amount===1?'':'s'}`:displayDuration(duration.amount));
 return formatAreaText(item.description.replace(duration.label,label));
}
function renderThumbnails(){const list=state.periodEvents.length?state.periodEvents:(state.current?[state.current]:[]);const controls=$('carouselControls');controls.hidden=list.length<2;const index=Math.max(0,list.findIndex(e=>e.id===state.current?.id));$('eventPosition').textContent=`Event ${index+1} of ${list.length}`;}
function shiftEvent(direction){const list=state.periodEvents;if(list.length<2)return;const index=Math.max(0,list.findIndex(e=>e.id===state.current?.id));showEvent(list[(index+direction+list.length)%list.length]);persist();}
$('eventPrev').onclick=()=>shiftEvent(-1);$('eventNext').onclick=()=>shiftEvent(1);
function autoTrack(v){if(!state.tracking||!state.calendar)return;const copy={...v,created:v.created||{...state.calendar}};
// Immediate events have no ongoing duration and go straight into history.
if(!copy.total){copy.actionRequired=true;copy.completed=false;}
if(copy.pendingOffer){copy.actionRequired=true;copy.completed=false;}
if(copy.eventType==='choice')copy.earlyChoice=true;
state.active.push(copy);}
function generate(){
 const scheduled=state.tracking&&state.calendar&&state.frequency!=='manual';
 if(scheduled&&!dueForPeriod()){$('status').textContent='No events due this month. Advance your farm calendar.';return;}
 const period=scheduled?`${state.frequency}:${periodId()}`:null;
 if(state.tracking&&state.calendar&&state.monthGenerated[monthKey()]){
   $('status').textContent='All events for this scheduled period have already been generated. Use the arrows to view them.';return;
 }
 const count=Math.min(10,Math.max(1,state.count==='random'?1+Math.floor(Math.random()*10):Number(state.count)||1));
 const pool=eligible();const seen=state.tracking&&state.calendar?(state.monthSeen[`${state.calendar.year||0}-${state.calendar.month}`]||[]):[];
 // Monthly uniqueness applies within the current month, including events already generated.
 // An existing batch is never extended by another click in the same scheduled period.
 const chosen=[];
 for(let i=0;i<count;i++){
   const next=chooseUnique(pool.filter(e=>!e.conflictGroup||!chosen.some(c=>c.conflictGroup===e.conflictGroup)),[...seen,...chosen.map(e=>e.id)]);
   if(!next)break;
   chosen.push(next);
 }
 if(!chosen.length){$('status').textContent='No unused eligible events remain this month. Advance the calendar or select more categories.';return;}
 state.periodEvents=chosen.map(e=>{markSeen(e);if(!state.tracking||!state.calendar)state.used.push(e.id);const v=instantiate(e);autoTrack(v);return v});
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
  bulk.title='Complete pending actions only. Saved dealership offers will not be applied.';
  bulk.onclick=()=>{
   const finished=state.calendar?{...state.calendar}:null;
   state.active.forEach(x=>{if(x.actionRequired&&!x.completed&&!x.pendingOffer){x.completed=true;x.actionRequired=false;x.finished=finished?{...finished}:null;}});
   persist();renderTracker();renderBannerCompletion();syncCleanLayout();
  };
  header.append(bulk);
 }
}
actions.forEach(item=>{const card=document.createElement('div');card.className='track-card required-card';const title=document.createElement('strong');title.textContent=item.title;const desc=document.createElement('p');desc.textContent=displayEventDescription(item);const button=document.createElement('button');button.type='button';button.textContent=item.pendingOffer?'✓ Apply Offer When Used':'✓ Done — I have completed this';button.className='action-done';button.onclick=()=>completeAction(item.id);const copy=document.createElement('div');copy.className='required-copy';copy.append(title,desc);card.append(copy,button);actionRoot.append(card)});
renderHistory();renderBannerCompletion();if(typeof syncCleanLayout==='function')syncCleanLayout();}
function renderHistory(){const root=$('historyList');root.replaceChildren();$('historyPanel').hidden=!state.tracking;const completed=state.active.filter(e=>e.completed);if(!completed.length){const p=document.createElement('p');p.className='small-event-note';p.textContent='Completed events will appear here automatically.';root.append(p);return}
const years=[...new Set(completed.map(e=>e.created?.year||0))].sort((a,b)=>b-a);years.forEach(y=>{const yd=document.createElement('details');yd.className='history-year';yd.open=y===years[0];const ys=document.createElement('summary');ys.textContent=`Year ${y+1}`;yd.append(ys);for(let m=0;m<12;m++){const list=completed.filter(e=>(e.created?.year||0)===y&&(e.created?.month||0)===m);if(!list.length)continue;const md=document.createElement('details');md.className='history-month';md.open=y===years[0];const ms=document.createElement('summary');ms.textContent=`${months[m]} (${list.length})`;md.append(ms);list.forEach(e=>{const r=document.createElement('div');r.className='history-row';const name=document.createElement('strong');name.textContent=e.title;const info=document.createElement('small');info.textContent=`${displayEventDescription(e)} · Finished: ${dateLabel(e.finished)}`;r.append(name,info);md.append(r)});yd.append(md)}root.append(yd)})}
function advance(){if(!state.tracking||!state.calendar)return;const c=state.calendar;
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
if(c.day===1||state.frequency==='daily'){state.periodEvents=[];state.periodKey=null;state.current=null;}state.active.forEach(x=>{if(!x.completed&&x.remaining>0){x.remaining=Math.max(0,x.remaining-1);if(x.remaining===0){x.completed=true;x.finished={...c}}}});persist();renderTracker();renderSchedule();syncCleanLayout();
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
function renderSchedule(){const manual=state.frequency==='manual';$('countField').hidden=false;$('scheduleBox').hidden=true;$('frequency').value=state.frequency;$('eventCount').value=state.count;if(manual)return;const c=state.calendar;const status=$('scheduleStatus');const btn=$('revealDue');if(!state.tracking||!c){status.textContent='Enable Farm Calendar & Event Tracking and set your in-game date to schedule events.';btn.disabled=true;return}const period=periodId();btn.textContent=state.frequency==='daily'?`Generate Events for ${months[c.month]} — Day ${c.day}`:`Generate Events for ${months[c.month]}`;if(!dueForPeriod()){const abs=(c.year||0)*12+c.month;const anchor=state.scheduleAnchor??abs;const next=abs+(Number(state.frequency)-((abs-anchor)%Number(state.frequency)));status.textContent=`Next scheduled events will be due in ${months[next%12]}, Year ${Math.floor(next/12)+1}.`;btn.disabled=true;return}if(state.periodKey!==`${state.frequency}:${period}`){state.periodKey=`${state.frequency}:${period}`;persist()}btn.disabled=state.periodEvents.length>0;status.textContent=state.periodEvents.length?`${state.periodEvents.length} different events generated for ${months[c.month]}${state.frequency==='daily'?' Day '+c.day:''}. Select their photographs above to view each event.`:`Events are due for ${months[c.month]}${state.frequency==='daily'?' Day '+c.day:''}. Generate them when you're ready.`;}
$('frequency').onchange=()=>{state.frequency=$('frequency').value;if(state.calendar)state.scheduleAnchor=(state.calendar.year||0)*12+state.calendar.month;state.periodKey=null;state.periodEvents=[];state.current=null;persist();renderThumbnails();renderSchedule();syncCleanLayout()};
$('eventCount').onchange=()=>{state.count=$('eventCount').value;persist();renderSchedule();syncCleanLayout()};
$('revealDue').onclick=generate;

function monthAlreadyGenerated(){return !!(state.calendar&&state.monthGenerated[monthKey()]);}
function updateGoldLabel(){
 const b=$('generate'), sticky=$('sticky');
 if(!state.calendar||!state.tracking){b.disabled=false;sticky.disabled=false;b.textContent='⟳ GENERATE RANDOM EVENTS';sticky.textContent='⟳ Generate Events';return;}
 const c=state.calendar, month=months[c.month];
 let label;
 if(!monthAlreadyGenerated()&&(state.frequency==='manual'||dueForPeriod()))label=state.frequency==='daily'?`Generate Events for ${month} — Day ${c.day}`:`Generate Events for ${month}`;
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
 $('compactFarmDate').parentElement.hidden=!hasFarm;
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
   tracking:state.tracking,calendar:null,frequency:state.frequency,count:state.count,
   periodKey:null,periodEvents:[],scheduleAnchor:null,monthSeen:{},monthGenerated:{},
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
$('setupMount').prepend(areaSection);
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
$('tracker').querySelector('.calendar-box').hidden=true;
$('ongoingMount').append($('tracker'));
$('historyPanel').hidden=false;
const hist=$('historyPanel');const summary=document.createElement('summary');summary.textContent='Farm Event History — Show / Hide';const detail=document.createElement('details');detail.className=hist.className;detail.id='historyDetails';hist.parentNode.insertBefore(detail,hist);detail.append(summary,hist);hist.className='history-content';hist.style.cssText='margin-top:8px;border:0;padding:0;background:transparent';
if(!state.calendar){setupOpen=true;$('calendarSettings').hidden=!state.tracking}
$('enableTracking').checked=state.tracking;drawCats();if(!state.current)state.current=instantiate(events[0]);showEvent(state.current);updateTracking();renderSchedule();syncCleanLayout();
if(typeof IntersectionObserver!=='undefined'){const obs=new IntersectionObserver(es=>{$('sticky').classList.toggle('show',!es[0].isIntersecting)},{threshold:.2});obs.observe($('generate'))}
