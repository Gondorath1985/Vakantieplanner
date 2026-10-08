export function migrateState(old={}){
 if(!old||typeof old!=='object')return {};
 const result={...old,version:4};
 if(![2,3,4].includes(old.version)&&Number.isFinite(Number(old.budget))&&old.budget!=null)result.budget=Math.round(Number(old.budget)/Math.max(1,Number(old.people)||2));
 if(!Array.isArray(result.months)&&Number.isInteger(Number(old.month))&&Number(old.month)>=1&&Number(old.month)<=12)result.months=[Number(old.month)];
 result.stayLevel=old.stayLevel || 'standard';result.maxBoatMinutes=old.maxBoatMinutes ?? 30;result.types=old.types || ['country','region','island'];result.unknownPolicy=old.unknownPolicy || 'show';delete result.month;delete result.occupancy;
 return result;
}
