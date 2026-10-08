export function migrateState(old={}) {
 if(!old || typeof old!=='object')return {};
 const result={...old,version:2};
 if(old.version!==2 && Number.isFinite(Number(old.budget)) && old.budget!=null)result.budget=Math.round(Number(old.budget)/Math.max(1,Number(old.people)||2));
 return result;
}
