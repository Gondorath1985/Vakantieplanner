import {regionalHeritage} from './regional-heritage.34bd4e387794.mjs';
export function selectedMonths(f){return [...new Set((Array.isArray(f.months)?f.months:[f.month||1]).map(Number).filter(m=>Number.isInteger(m)&&m>=1&&m<=12))].sort((a,b)=>a-b);}
export function priceTrip(){return null;} // No verified date-/party-specific quotations are connected.
export function excluded(d,f,all=[]){const ids=new Set(f.visitedRegions||[]);if((f.visited||[]).includes(d.code)||ids.has(d.id)||ids.has(d.parentId))return true;if(d.type!=='country'&&Number.isFinite(d.climatePoint?.lat)&&Number.isFinite(d.climatePoint?.lon))for(const id of ids){const a=travelAreas[id],p=d.climatePoint;if(a?.code===d.code&&p.lat>=a.south&&p.lat<=a.north&&p.lon>=a.west&&p.lon<=a.east)return true;}let parent=all.find(x=>x.id===d.parentId);while(parent){if(ids.has(parent.id))return true;parent=all.find(x=>x.id===parent.parentId);}return false;}
export function preferenceFit(d,weights={}){
 const chosen=Object.entries(weights).filter(([,w])=>Number.isFinite(w)&&w>0),available=chosen.filter(([k])=>Number.isFinite(d.scores[k]));const total=available.reduce((s,[,w])=>s+w,0),requested=chosen.reduce((s,[,w])=>s+w,0),confidence=requested?total/requested:0;
 const breakdown=available.map(([key,weight])=>({key,weight,offering:d.scores[key],contribution:total?d.scores[key]*weight/total*10:0,loss:total?(10-d.scores[key])*weight/total*10:0}));
 return {score:total&&confidence>=.6?Math.round(breakdown.reduce((s,x)=>s+x.contribution,0)):null,confidence:Math.round(confidence*100),breakdown,missing:chosen.filter(([k])=>!Number.isFinite(d.scores[k])).map(([k])=>k),reasons:[...breakdown].sort((a,b)=>b.contribution-a.contribution).slice(0,3).map(x=>x.key),weaknesses:[...breakdown].filter(x=>x.loss>=.5).sort((a,b)=>b.loss-a.loss).slice(0,3)};
}
// These bounds define the planner's named travel regions, not political borders.
const travelAreas={
 'US-west':{code:'US',south:24,north:50,west:-125,east:-102},
 'US-florida':{code:'US',south:24,north:31,west:-87.65,east:-80},
 'CA-west':{code:'CA',south:48.9,north:60,west:-141,east:-110},
};
export function remainingHighlights(d,f,all=[]){
 if(excluded(d,f,all))return [];
 const visited=(f.visitedRegions||[]).map(id=>all.find(p=>p.id===id)).filter(p=>p?.code===d.code);
 if(!visited.length)return d.highlights;
 const siteIds=new Set(visited.flatMap(p=>regionalHeritage[p.id]||p.highlights.map(h=>h.id||h.url)));
 const areas=visited.map(p=>travelAreas[p.id]).filter(Boolean);
 return d.highlights.filter(h=>!siteIds.has(h.id||h.url)&&!areas.some(a=>h.lat>=a.south&&h.lat<=a.north&&h.lon>=a.west&&h.lon<=a.east));
}
export function matchPreferences(d,f){
 const requested=Object.entries(f.weights||{}).filter(([,w])=>Number.isFinite(w)&&w>0),total=requested.reduce((sum,[,w])=>sum+w,0);
 const supported=[],unresearched=[],bandFailures=[],preferenceChecks=[];let knownWeight=0,earned=0;
 for(const [key,weight] of requested){
  const offer=d.scores[key],band=f.bands?.[key]||[0,10];
  if(Number.isFinite(offer)){
   const distance=Math.max(band[0]-offer,offer-band[1],0),fit=Math.max(0,1-distance/10);
   knownWeight+=weight;earned+=weight*fit;preferenceChecks.push({key,weight,offer,band,fit,kind:'personal'});
   if(!distance)supported.push(key);else bandFailures.push({key:'band',interest:key,value:offer,min:band[0],max:band[1],delta:distance});
  }else if(d.evidence.includes(key)){
   const count=d.highlights.filter(h=>key==='natuur'?['Natural','Mixed'].includes(h.category):['cultuur','historie'].includes(key)?['Cultural','Mixed'].includes(h.category):h.tags?.includes(key)).length;
   if(!count){unresearched.push(key);continue;}
   // Research relevance, not a numerical estimate of the destination's offering.
   const fit=count/(count+1);knownWeight+=weight;earned+=weight*fit;supported.push(key);
   preferenceChecks.push({key,weight,offer:null,count,band,fit,kind:'presence'});
   if(band[0]>0||band[1]<10)unresearched.push(key);
  }else unresearched.push(key);
 }
 const matchLabel=preferenceChecks.every(x=>x.kind==='personal')?'eigen match':preferenceChecks.some(x=>x.kind==='personal')?'indicatieve match':'bronmatch';
 return {matchLabel,confirmedMatch:knownWeight?Math.round(100*earned/knownWeight):null,matchCoverage:total?Math.round(100*knownWeight/total):0,supported,unresearched,bandFailures,preferenceChecks};
}
export function climateReferencesFor(d,f,all=[]){
 if(d.type!=='country')return [d];
 const refs=[d,...all.filter(p=>p.code===d.code&&p.id!==d.id&&!excluded(p,f,all))].filter(p=>p.climateSource);
 const seen=new Set();return refs.filter(p=>{const key=p.climateReferenceId||p.id;if(seen.has(key))return false;seen.add(key);return true;});
}
export function regionalClimateSummary(d,f,all=[],month=1){
 const references=climateReferencesFor(d,f,all).map(p=>({id:p.id,name:p.climateReference,source:p.climateSource,climate:p.climate[month-1]}));
 const range=field=>{const values=references.map(p=>p.climate[field]).filter(Number.isFinite);return values.length?{min:Math.min(...values),max:Math.max(...values)}:null;};
 return {references,temp:range('temp'),high:range('high'),rain:range('rain'),sun:range('sun')};
}
const active=n=>Number.isFinite(n)&&n!=='';
function monthEvaluation(d,f,month,price){
 const c=d.climate[month-1],failures=[],unknown=[];const add=(key,value,delta=0)=>failures.push({key,value,delta,months:[month]});const check=(key,field,predicate,delta)=>{if(!active(f[key]))return;if(!Number.isFinite(c[field]))unknown.push(key);else if(predicate(c[field],f[key]))add(key,c[field],delta(c[field],f[key]));};
 if(active(f.budget)){if(!price)unknown.push('budget');else if(price.perPerson>f.budget)add('budget',price.perPerson,price.perPerson-f.budget);}
 if(f.temperatureEnabled!==false)check('minTemp','temp',(v,b)=>v<b,(v,b)=>b-v);if(f.temperatureEnabled!==false)check('maxTemp','temp',(v,b)=>v>b,(v,b)=>v-b);check('maxRain','rain',(v,b)=>v>b,(v,b)=>v-b);check('minSun','sun',(v,b)=>v<b,(v,b)=>b-v);
 if(f.bestOnly){if(![c.temp,c.rain,c.sun].every(Number.isFinite))unknown.push('bestOnly');else if(c.temp<18||c.temp>32||c.rain>150||c.sun<5)add('bestOnly',false);}
 return {month,climate:c,failures,unknown,recommended:d.bestMonths?.includes(month)||false};
}
function mergeFailures(options){const map=new Map();for(const o of options)for(const x of o.failures){const prev=map.get(x.key);if(!prev)map.set(x.key,{...x,months:[...x.months]});else{prev.months.push(...x.months);if(x.delta>prev.delta){prev.delta=x.delta;prev.value=x.value;}}}return [...map.values()];}
export function evaluateDestination(d,f,all=[]){
 const highlights=remainingHighlights(d,f,all);
 // Recompute source evidence after removing visited regions, without mutating the catalog.
 const evidence=highlights===d.highlights?d.evidence:[...new Set([
  ...(highlights.some(h=>['Natural','Mixed'].includes(h.category))?['natuur']:[]),
  ...(highlights.some(h=>['Cultural','Mixed'].includes(h.category))?['cultuur','historie']:[]),
  ...highlights.flatMap(h=>h.tags||[]),
 ])];
 d={...d,highlights,evidence};
 const price=priceTrip(d,f),references=climateReferencesFor(d,f,all);
 const monthOptions=selectedMonths(f).map(m=>{
  const options=(references.length?references:[d]).map(ref=>({...monthEvaluation(ref,f,m,price),reference:ref.climateReference,referenceId:ref.id}));
  return options.sort((a,b)=>a.failures.length-b.failures.length||a.unknown.length-b.unknown.length||Number(b.referenceId===d.id)-Number(a.referenceId===d.id))[0];
 });const chosen=[...monthOptions].sort((a,b)=>a.failures.length-b.failures.length||a.unknown.length-b.unknown.length||Number(b.recommended)-Number(a.recommended)||a.month-b.month)[0]||monthEvaluation(d,f,1,price);
 const failures=f.monthMode==='all'?mergeFailures(monthOptions):[...chosen.failures];const unknown=f.monthMode==='all'?[...new Set(monthOptions.flatMap(o=>o.unknown))]:[...chosen.unknown];const hard=[];
 if(excluded(d,f,all))hard.push({key:'visited'});
 if(!f.includeExcluded&&['AF','KP','IL','SD','YE'].includes(d.code))hard.push({key:'excludedCountry'});
 if(d.catalogOnly)hard.push({key:'overview'});
 if(Array.isArray(f.continents)?f.continents.length>0&&!f.continents.includes(d.region):f.region==='outsideEurope'&&d.region==='Europa'||f.region&&f.region!=='outsideEurope'&&d.region!==f.region)hard.push({key:'region'});
 if(f.types?.length&&!f.types.includes(d.type))hard.push({key:'type'});
 if(f.excludeCityTrips&&d.type==='city')hard.push({key:'cityTrip'});
 if(f.styles?.length){if(!d.styles.length)unknown.push('styles');else if(!f.styles.some(s=>d.styles.includes(s))){if(d.stylesStatus==='complete')hard.push({key:'styles'});else unknown.push('styles');}}
 for(const [key,field] of [['maxFlightHours','flightMax'],['maxTravelHours','totalMax']])if(active(f[key])){if(!Number.isFinite(d.transport?.[field]))unknown.push(key);else if(d.transport[field]>f[key])hard.push({key,value:d.transport[field],delta:d.transport[field]-f[key]});}
 if(active(f.maxBoatMinutes)){if(!Number.isFinite(d.transport?.boat?.maxMinutes))unknown.push('maxBoatMinutes');else if(d.transport.boat.maxMinutes>f.maxBoatMinutes)hard.push({key:'maxBoatMinutes',value:d.transport.boat.maxMinutes,delta:d.transport.boat.maxMinutes-f.maxBoatMinutes});}
 if(f.directOnly){if(!Number.isFinite(d.transport?.stops))unknown.push('directOnly');else if(d.transport.stops>0)hard.push({key:'directOnly'});}if(active(f.maxStops)){if(!Number.isFinite(d.transport?.stops))unknown.push('maxStops');else if(d.transport.stops>f.maxStops)hard.push({key:'maxStops',value:d.transport.stops});}
 const interestEvidence=(d.evidence||[]).filter(k=>(f.weights?.[k]||0)>0),relevance=interestEvidence.reduce((sum,k)=>sum+f.weights[k],0);const evidenceBreadth=interestEvidence.reduce((sum,key)=>{const count=d.highlights.filter(h=>key==='natuur'?['Natural','Mixed'].includes(h.category):['cultuur','historie'].includes(key)?['Cultural','Mixed'].includes(h.category):h.tags?.includes(key)).length;return sum+f.weights[key]*Math.log2(1+count);},0);const itineraryNotes=[];if(f.days>=14&&f.tripPace!=='relax'&&(d.type==='city'||d.type==='island'||d.type==='country'&&(d.geography.area<1500||d.geography.area<10000&&['Caribbean','Polynesia'].includes(d.geography.subregion))))itineraryNotes.push('Je plant '+f.days+' dagen '+(d.type==='city'?'in één stad':'op een compacte bestemming')+'. Voor veel afwisseling: combineer plekken of kies een rondreis. Dit is planningsadvies, geen maximaal verblijf.');
 if(f.heritageKind&&!d.highlights.some(h=>h.category===f.heritageKind||h.category==='Mixed'&&f.heritageKind!=='Mixed'))hard.push({key:'heritageKind'});if(active(f.minHighlights)&&d.highlights.length<f.minHighlights)hard.push({key:'minHighlights',value:d.highlights.length});
 const fit=preferenceFit(d,f.weights);
 const match=matchPreferences(d,f),{bandFailures,supported,unresearched,confirmedMatch}=match;
 failures.push(...bandFailures);for(const key of unresearched)if(f.bands?.[key]&&(f.bands[key][0]>0||f.bands[key][1]<10))unknown.push('band:'+key);
let status=hard.length?'excluded':failures.length?'outside':unknown.length?'unknown':'match';
 const close=failures.length&&failures.length<=2&&failures.every(x=>x.key==='band'?x.delta<=2:x.key==='budget'?x.value<=f.budget*1.25:['minTemp','maxTemp'].includes(x.key)?x.delta<=5:x.key==='maxRain'?x.delta<=60:['minSun','minDaylight'].includes(x.key)?x.delta<=2:true);
 if(status==='outside'&&close)status='near';
 return {...d,...fit,...match,confirmedMatch,supported,unresearched,interestEvidence,relevance,evidenceBreadth,itineraryNotes,price,climateSummary:regionalClimateSummary(d,f,all,chosen.month),matchedClimateReference:chosen.reference,matchedClimateReferenceId:chosen.referenceId,monthOptions,chosenMonth:chosen.month,climateSelected:chosen.climate,matchingMonths:monthOptions.filter(o=>!o.failures.length&&!o.unknown.length).map(o=>o.month),failures,unknown:[...new Set(unknown)],hard,status};
}
export function searchDestinations(destinations,f){
 const evaluated=selectedMonths(f).length?destinations.map(d=>evaluateDestination(d,f,destinations)):[];
 const comparator=f.sort==='cost'?(a,b)=>(a.price?.perPerson??Infinity)-(b.price?.perPerson??Infinity):f.sort==='travel'?(a,b)=>(a.transport?.totalMax??Infinity)-(b.transport?.totalMax??Infinity):(a,b)=>(b.confirmedMatch??-1)-(a.confirmedMatch??-1)||b.matchCoverage-a.matchCoverage||a.itineraryNotes.length-b.itineraryNotes.length||b.evidenceBreadth-a.evidenceBreadth||b.relevance-a.relevance||a.name.localeCompare(b.name,'nl')||(a.price?.perPerson??Infinity)-(b.price?.perPerson??Infinity);
 return {evaluated,recommendations:evaluated.filter(d=>d.status==='match'||d.status==='unknown'&&f.unknownPolicy!=='hide'&&f.unknownPolicy!=='separate').sort(comparator),matches:evaluated.filter(d=>d.status==='match').sort(comparator),near:evaluated.filter(d=>d.status==='near').sort(comparator),uncertain:evaluated.filter(d=>d.status==='unknown').sort(comparator),outside:evaluated.filter(d=>['outside','excluded'].includes(d.status))};
}
export function relaxedFilters(f,d){const next={...f};for(const x of d.failures)next[x.key]=x.key==='bestOnly'?false:x.value;return next;}
