export function rank(destinations, filters) {
 return destinations.filter(d=>!filters.visited.includes(d.code) && (!filters.region || d.region===filters.region) && d.cost+d.flight*filters.people<=filters.budget && d.temp>=filters.minTemp && d.temp<=filters.maxTemp).map(d=>{
 const entries=Object.entries(filters.weights); const total=entries.reduce((s,[,w])=>s+w,0);
 const score=total?Math.round(entries.reduce((s,[k,w])=>s+(d.scores[k]||0)*w,0)/total*10):0;
 const reasons=entries.filter(([,w])=>w>0).sort(([a,wa],[b,wb])=>d.scores[b]*wb-d.scores[a]*wa).slice(0,3).map(([k])=>k);
 return {...d,score,reasons};
 }).sort((a,b)=>b.score-a.score || a.cost-b.cost);
}
