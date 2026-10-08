export function selectedMonths(f) {
 const input=Array.isArray(f.months)?f.months:[f.month || 1];
 return [...new Set(input.map(Number).filter(m=>Number.isInteger(m)&&m>=1&&m<=12))].sort((a,b)=>a-b);
}
export function priceTrip(d,f) {
 const people=Math.max(1,Math.floor(f.people || 1)),days=Math.max(1,Number(f.days)||21);
 const factor={simple:.7,standard:1,comfortable:1.5}[f.stayLevel] || 1;
 const daily=d.pricing.daily*days*factor,lodging=d.pricing.room/2*(days-1)*factor,flight=d.pricing.flight;
 return {people,days,factor,daily,lodging,flight,perPerson:Math.round(daily+lodging+flight),total:Math.round((daily+lodging+flight)*people)};
}
export function excluded(d,f){return (f.visited || []).includes(d.code)||(f.visitedRegions || []).includes(d.id);}
export function preferenceFit(d,weights={}){
 const entries=Object.entries(weights).filter(([,w])=>Number.isFinite(w)&&w>0);
 const available=entries.filter(([k])=>Number.isFinite(d.scores[k]));
 const total=available.reduce((sum,[,w])=>sum+w,0);
 const breakdown=available.map(([key,weight])=>({key,weight,offering:d.scores[key],contribution:total?d.scores[key]*weight/total*10:0,loss:total?(10-d.scores[key])*weight/total*10:0}));
 return {score:total?Math.round(breakdown.reduce((sum,x)=>sum+x.contribution,0)):null,breakdown,missing:entries.filter(([k])=>!Number.isFinite(d.scores[k])).map(([k])=>k),reasons:[...breakdown].sort((a,b)=>b.contribution-a.contribution).slice(0,3).map(x=>x.key),weaknesses:[...breakdown].filter(x=>x.loss>=.5).sort((a,b)=>b.loss-a.loss).slice(0,3)};
}
function monthFailures(d,f,month,price){
 const c=d.climate[month-1],failures=[];
 const add=(key,value,delta)=>failures.push({key,value,delta,months:[month]});
 if(price.perPerson>f.budget)add('budget',price.perPerson,price.perPerson-f.budget);
 if(c.temp<f.minTemp)add('minTemp',c.temp,f.minTemp-c.temp);
 if(c.temp>f.maxTemp)add('maxTemp',c.temp,c.temp-f.maxTemp);
 if(c.rain>f.maxRain)add('maxRain',c.rain,c.rain-f.maxRain);
 if(c.sun<f.minSun)add('minSun',c.sun,f.minSun-c.sun);
 if(f.bestOnly&&!d.bestMonths.includes(month))add('bestOnly',false,0);
 return {month,climate:c,failures,recommended:d.bestMonths.includes(month)};
}
function combinedFailures(options){
 const map=new Map();
 for(const option of options)for(const x of option.failures){const previous=map.get(x.key);if(!previous)map.set(x.key,{...x,months:[...x.months]});else{previous.months.push(...x.months);if(x.delta>previous.delta){previous.delta=x.delta;previous.value=x.value;}}}
 return [...map.values()];
}
export function evaluateDestination(d,f){
 const price=priceTrip(d,f),monthOptions=selectedMonths(f).map(m=>monthFailures(d,f,m,price));
 const sorted=[...monthOptions].sort((a,b)=>a.failures.length-b.failures.length || Number(b.recommended)-Number(a.recommended) || b.climate.sun-a.climate.sun || a.month-b.month);
 const chosen=sorted[0] || monthFailures(d,f,1,price);
 const failures=f.monthMode==='all'?combinedFailures(monthOptions):chosen.failures;
 return {...d,...preferenceFit(d,f.weights),price,monthOptions,chosenMonth:chosen.month,climateSelected:chosen.climate,matchingMonths:monthOptions.filter(x=>!x.failures.length).map(x=>x.month),failures};
}
export function searchDestinations(destinations,f){
 const matches=[],near=[],evaluated=[];
 if(!selectedMonths(f).length)return {matches,near,evaluated};
 for(const d of destinations){
  if(excluded(d,f))continue;
  if(f.region==='outsideEurope'&&d.region==='Europa'||f.region&&f.region!=='outsideEurope'&&d.region!==f.region)continue;
  const styles=f.styles || [];
  if(styles.length&&!styles.some(style=>d.styles.includes(style)))continue;
  const result=evaluateDestination(d,f);evaluated.push(result);
  if(!result.failures.length)matches.push(result);
  else if(result.failures.length<=2&&result.failures.every(x=>x.key==='budget'?x.value<=f.budget*1.25:['minTemp','maxTemp'].includes(x.key)?x.delta<=5:x.key==='maxRain'?x.delta<=60:x.key==='minSun'?x.delta<=2:true))near.push(result);
 }
 const sort=f.sort || 'match';
 const comparator=sort==='cost'?(a,b)=>a.price.perPerson-b.price.perPerson || (b.score??0)-(a.score??0):sort==='sun'?(a,b)=>b.climateSelected.sun-a.climateSelected.sun || (b.score??0)-(a.score??0):(a,b)=>(b.score??0)-(a.score??0) || a.price.perPerson-b.price.perPerson;
 matches.sort(comparator);near.sort((a,b)=>a.failures.length-b.failures.length || comparator(a,b));
 return {matches,near,evaluated};
}
export function relaxedFilters(f,d){const next={...f};for(const x of d.failures)next[x.key]=x.key==='bestOnly'?false:x.value;return next;}
