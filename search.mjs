export function priceTrip(d, f) {
 const people=Math.max(1,Math.floor(f.people || 1)), days=Math.max(1,f.days || 21), occupancy=Math.max(1,Math.floor(f.occupancy || 2));
 const rooms=Math.ceil(people/occupancy), daily=d.pricing.daily*days, lodging=d.pricing.room*rooms*(days-1)/people;
 const flight=d.pricing.flight;
 return {people,days,rooms,daily,lodging,flight,perPerson:Math.round(daily+lodging+flight),total:Math.round((daily+lodging+flight)*people)};
}
export function excluded(d,f) {return (f.visited || []).includes(d.code) || (f.visitedRegions || []).includes(d.id);}
export function searchDestinations(destinations,f) {
 const matches=[],near=[],evaluated=[];
 for (const d of destinations) {
  if(excluded(d,f))continue;
  // Geography and visited destinations are deliberate exclusions, never near suggestions.
  if(f.region==='outsideEurope' && d.region==='Europa' || f.region && f.region!=='outsideEurope' && d.region!==f.region)continue;
  const climate=d.climate[(f.month || 1)-1],price=priceTrip(d,f),failures=[];
  const entries=Object.entries(f.weights || {}),total=entries.reduce((s,[,w])=>s+w,0);
  const score=total?Math.round(entries.reduce((s,[k,w])=>s+(d.scores[k] || 0)*w,0)/total*10):0;
  const reasons=entries.filter(([,w])=>w>0).sort(([a,wa],[b,wb])=>d.scores[b]*wb-d.scores[a]*wa).slice(0,3).map(([k])=>k);
  if(price.perPerson>f.budget)failures.push({key:'budget',value:price.perPerson,delta:price.perPerson-f.budget});
  if(climate.temp<f.minTemp)failures.push({key:'minTemp',value:climate.temp,delta:f.minTemp-climate.temp});
  if(climate.temp>f.maxTemp)failures.push({key:'maxTemp',value:climate.temp,delta:climate.temp-f.maxTemp});
  if(climate.rain>f.maxRain)failures.push({key:'maxRain',value:climate.rain,delta:climate.rain-f.maxRain});
  if(climate.sun<f.minSun)failures.push({key:'minSun',value:climate.sun,delta:f.minSun-climate.sun});
  if(f.bestOnly && !d.bestMonths.includes(f.month))failures.push({key:'bestOnly'});
  const result={...d,climateSelected:climate,price,score,reasons,failures};
  evaluated.push(result);
  if(!failures.length)matches.push(result);
  else if(failures.length<=2 && failures.every(x=>x.key==='budget'?x.value<=f.budget*1.25:['minTemp','maxTemp'].includes(x.key)?x.delta<=5:x.key==='maxRain'?x.delta<=60:x.key==='minSun'?x.delta<=2:true))near.push(result);
 }
 matches.sort((a,b)=>b.score-a.score || a.price.perPerson-b.price.perPerson);
 near.sort((a,b)=>a.failures.length-b.failures.length || b.score-a.score || a.price.perPerson-b.price.perPerson);
 return {matches,near,evaluated};
}
export function relaxedFilters(f,d) {
 const next={...f};for(const failure of d.failures){next[failure.key]=failure.key==='bestOnly'?false:failure.value;}return next;
}
