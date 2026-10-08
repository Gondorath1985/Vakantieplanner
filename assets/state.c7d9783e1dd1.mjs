const cityAliases={"CR-city-33711": "CR-city-33712", "US-city-165190": "US-city-165284", "US-city-151801": "US-city-158657", "US-city-156701": "US-city-164713", "CA-city-20558": "CA-city-20559", "PE-city-117054": "PE-city-117857", "CR-city-33769": "CR-city-33770", "ID-city-73691": "ID-city-73692", "IN-city-75482": "IN-city-75483", "CN-city-29362": "CN-city-30055"};
export function migrateState(old={}){
 if(!old||typeof old!=='object')return {};
 const result={...old,version:7};result.bands=Object.fromEntries(Object.entries(old.bands&&typeof old.bands==='object'?old.bands:{}).filter(([,b])=>Array.isArray(b)&&b.length===2&&b.every(v=>Number.isFinite(v)&&v>=0&&v<=10)));
 if(![2,3,4,5,6,7].includes(old.version)&&Number.isFinite(Number(old.budget))&&old.budget!=null)result.budget=Math.round(Number(old.budget)/Math.max(1,Number(old.people)||2));
 if(!Array.isArray(result.months)&&Number.isInteger(Number(old.month))&&Number(old.month)>=1&&Number(old.month)<=12)result.months=[Number(old.month)];
 result.continents=Array.isArray(old.continents)?[...new Set(old.continents.filter(x=>['Europa','Azië','Afrika','Amerika','Oceanië'].includes(x)))]:old.region==='outsideEurope'?['Azië','Afrika','Amerika','Oceanië']:['Europa','Azië','Afrika','Amerika','Oceanië'].includes(old.region)?[old.region]:[];
 result.stayLevel=old.stayLevel || 'standard';result.maxBoatMinutes=old.maxBoatMinutes ?? 30;result.types=old.types || ['country','region','island'];result.unknownPolicy=old.unknownPolicy==='hide'?'hide':old.unknownPolicy==='separate'?'separate':'include';result.tripPace=old.tripPace||'balanced';result.maxStops=old.maxStops??'';result.researchQueue=Array.isArray(old.researchQueue)?old.researchQueue:[];result.temperatureEnabled=old.version>=6&&old.temperatureEnabled===true;result.minDaylight='';result.visitedRegions=(old.visitedRegions||[]).map(id=>id==='ID-admin-1826'?'ID-bali':id);delete result.month;delete result.occupancy;
 for(const key of ['selected','visitedRegions'])if(Array.isArray(result[key]))result[key]=[...new Set(result[key].map(id=>cityAliases[id]||id))];
 if(result.detail)result.detail=cityAliases[result.detail]||result.detail;
 if(result.overrides&&typeof result.overrides==='object')result.overrides=Object.fromEntries(Object.entries(result.overrides).map(([id,value])=>[cityAliases[id]||id,value]));
 return result;
}
