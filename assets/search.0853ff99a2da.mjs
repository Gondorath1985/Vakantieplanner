export function selectedMonths(f){return [...new Set((Array.isArray(f.months)?f.months:[f.month||1]).map(Number).filter(m=>Number.isInteger(m)&&m>=1&&m<=12))].sort((a,b)=>a-b);}
export function priceTrip(d,f){if(!d.pricing)return null;const people=Math.max(1,Math.floor(f.people||1)),days=Math.max(1,Number(f.days)||21),factor={simple:.7,standard:1,comfortable:1.5}[f.stayLevel]||1,daily=d.pricing.daily*days*factor,lodging=d.pricing.room/2*(days-1)*factor,flight=d.pricing.flight;return {people,days,factor,daily,lodging,flight,perPerson:Math.round(daily+lodging+flight),total:Math.round((daily+lodging+flight)*people)};}
export function excluded(d,f,all=[]){const ids=new Set(f.visitedRegions||[]);if((f.visited||[]).includes(d.code)||ids.has(d.id)||ids.has(d.parentId))return true;let parent=all.find(x=>x.id===d.parentId);while(parent){if(ids.has(parent.id))return true;parent=all.find(x=>x.id===parent.parentId);}return false;}
export function preferenceFit(d,weights={}){
 const chosen=Object.entries(weights).filter(([,w])=>Number.isFinite(w)&&w>0),available=chosen.filter(([k])=>Number.isFinite(d.scores[k]));const total=available.reduce((s,[,w])=>s+w,0),requested=chosen.reduce((s,[,w])=>s+w,0),confidence=requested?total/requested:0;
 const breakdown=available.map(([key,weight])=>({key,weight,offering:d.scores[key],contribution:total?d.scores[key]*weight/total*10:0,loss:total?(10-d.scores[key])*weight/total*10:0}));
 return {score:total&&confidence>=.6?Math.round(breakdown.reduce((s,x)=>s+x.contribution,0)):null,confidence:Math.round(confidence*100),breakdown,missing:chosen.filter(([k])=>!Number.isFinite(d.scores[k])).map(([k])=>k),reasons:[...breakdown].sort((a,b)=>b.contribution-a.contribution).slice(0,3).map(x=>x.key),weaknesses:[...breakdown].filter(x=>x.loss>=.5).sort((a,b)=>b.loss-a.loss).slice(0,3)};
}
const active=n=>Number.isFinite(n)&&n!=='';
function monthEvaluation(d,f,month,price){
 const c=d.climate[month-1],failures=[],unknown=[];const add=(key,value,delta=0)=>failures.push({key,value,delta,months:[month]});const check=(key,field,predicate,delta)=>{if(!active(f[key]))return;if(!Number.isFinite(c[field]))unknown.push(key);else if(predicate(c[field],f[key]))add(key,c[field],delta(c[field],f[key]));};
 if(active(f.budget)){if(!price)unknown.push('budget');else if(price.perPerson>f.budget)add('budget',price.perPerson,price.perPerson-f.budget);}
 check('minTemp','temp',(v,b)=>v<b,(v,b)=>b-v);check('maxTemp','temp',(v,b)=>v>b,(v,b)=>v-b);check('maxRain','rain',(v,b)=>v>b,(v,b)=>v-b);check('minSun','sun',(v,b)=>v<b,(v,b)=>b-v);check('minDaylight','daylight',(v,b)=>v<b,(v,b)=>b-v);
 if(f.bestOnly){if(!d.bestMonths)unknown.push('bestOnly');else if(!d.bestMonths.includes(month))add('bestOnly',false);}
 return {month,climate:c,failures,unknown,recommended:d.bestMonths?.includes(month)||false};
}
function mergeFailures(options){const map=new Map();for(const o of options)for(const x of o.failures){const prev=map.get(x.key);if(!prev)map.set(x.key,{...x,months:[...x.months]});else{prev.months.push(...x.months);if(x.delta>prev.delta){prev.delta=x.delta;prev.value=x.value;}}}return [...map.values()];}
export function evaluateDestination(d,f,all=[]){
 const price=priceTrip(d,f),monthOptions=selectedMonths(f).map(m=>monthEvaluation(d,f,m,price));const chosen=[...monthOptions].sort((a,b)=>a.failures.length-b.failures.length||a.unknown.length-b.unknown.length||Number(b.recommended)-Number(a.recommended)||a.month-b.month)[0]||monthEvaluation(d,f,1,price);
 const failures=f.monthMode==='all'?mergeFailures(monthOptions):[...chosen.failures];const unknown=f.monthMode==='all'?[...new Set(monthOptions.flatMap(o=>o.unknown))]:[...chosen.unknown];const hard=[];
 if(excluded(d,f,all))hard.push({key:'visited'});
 if(!f.includeExcluded&&['AF','KP','IL'].includes(d.code))hard.push({key:'excludedCountry'});
 if(d.catalogOnly)hard.push({key:'overview'});
 if(f.region==='outsideEurope'&&d.region==='Europa'||f.region&&f.region!=='outsideEurope'&&d.region!==f.region)hard.push({key:'region'});
 if(f.types?.length&&!f.types.includes(d.type))hard.push({key:'type'});
 if(f.excludeCityTrips&&d.type==='city')hard.push({key:'cityTrip'});
 if(f.styles?.length){if(!d.styles.length)unknown.push('styles');else if(!f.styles.some(s=>d.styles.includes(s)))hard.push({key:'styles'});}
 for(const [key,field] of [['maxFlightHours','flightMax'],['maxTravelHours','totalMax']])if(active(f[key])){if(!d.transport)unknown.push(key);else if(d.transport[field]>f[key])hard.push({key,value:d.transport[field],delta:d.transport[field]-f[key]});}
 if(active(f.maxBoatMinutes)){if(!d.transport)unknown.push('maxBoatMinutes');else if(d.transport.boat.maxMinutes>f.maxBoatMinutes)hard.push({key:'maxBoatMinutes',value:d.transport.boat.maxMinutes,delta:d.transport.boat.maxMinutes-f.maxBoatMinutes});}
 const fit=preferenceFit(d,f.weights);let status=hard.length?'excluded':failures.length?'outside':unknown.length?'unknown':'match';
 const close=failures.length&&failures.length<=2&&failures.every(x=>x.key==='budget'?x.value<=f.budget*1.25:['minTemp','maxTemp'].includes(x.key)?x.delta<=5:x.key==='maxRain'?x.delta<=60:['minSun','minDaylight'].includes(x.key)?x.delta<=2:true);
 if(status==='outside'&&close)status='near';
 return {...d,...fit,price,monthOptions,chosenMonth:chosen.month,climateSelected:chosen.climate,matchingMonths:monthOptions.filter(o=>!o.failures.length&&!o.unknown.length).map(o=>o.month),failures,unknown:[...new Set(unknown)],hard,status};
}
export function searchDestinations(destinations,f){
 const evaluated=selectedMonths(f).length?destinations.map(d=>evaluateDestination(d,f,destinations)):[];
 const comparator=f.sort==='cost'?(a,b)=>(a.price?.perPerson??Infinity)-(b.price?.perPerson??Infinity):f.sort==='travel'?(a,b)=>(a.transport?.totalMax??Infinity)-(b.transport?.totalMax??Infinity):(a,b)=>(b.score??-1)-(a.score??-1)||(a.price?.perPerson??Infinity)-(b.price?.perPerson??Infinity);
 return {evaluated,matches:evaluated.filter(d=>d.status==='match').sort(comparator),near:evaluated.filter(d=>d.status==='near').sort(comparator),uncertain:evaluated.filter(d=>d.status==='unknown').sort(comparator),outside:evaluated.filter(d=>['outside','excluded'].includes(d.status))};
}
export function relaxedFilters(f,d){const next={...f};for(const x of d.failures)next[x.key]=x.key==='bestOnly'?false:x.value;return next;}
