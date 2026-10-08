import {dimensions,countryCodes,destinations,months,dataNote,countryInfo,tripStyles,coverage} from './data.2df78e3cdde7.mjs';
import {searchDestinations,priceTrip,excluded,relaxedFilters,evaluateDestination} from './search.ea6a58b2a88d.mjs';
import {migrateState} from './state.a50afd4e6e68.mjs';
const $=id=>document.getElementById(id);
const names=new Intl.DisplayNames(['nl'],{type:'region'});
const money=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
const fieldIds=['region','people','days','budget','stayLevel','monthMode','minTemp','maxTemp','maxRain','minSun','sort'];
const textFields=new Set(['region','stayLevel','monthMode','sort']);
let saved={};try{saved=migrateState(JSON.parse(localStorage.getItem('vakantiekompas')||'{}'));}catch{}
const knownIds=new Set(destinations.map(d=>d.id));
const visited=new Set(Array.isArray(saved.visited)?saved.visited.filter(x=>countryCodes.includes(x)):[]);
const visitedRegions=new Set(Array.isArray(saved.visitedRegions)?saved.visitedRegions.filter(x=>knownIds.has(x)):['ID-bali','US-west','US-florida','CA-west']);
const selected=new Set(Array.isArray(saved.selected)?saved.selected.filter(x=>knownIds.has(x)):[]);
const chosenMonths=new Set(Array.isArray(saved.months)?saved.months.map(Number).filter(m=>Number.isInteger(m)&&m>=1&&m<=12):[new Date().getMonth()+1]);
const chosenStyles=new Set(Array.isArray(saved.styles)?saved.styles.filter(x=>tripStyles[x]):[]);
let lastResults={matches:[],near:[]},limit=12,refreshTimer;
$('dataNote').textContent=dataNote;
$('coverageSummary').textContent=`Catalogus: ${coverage.countries} landen/gebieden · ${coverage.profiles} profielen · ${coverage.regional} regio’s/eilanden. Basisprofielen gebruiken bredere sjablonen; er is nog geen actuele veiligheidsselectie.`;
for(const id of fieldIds)if(saved[id]!=null){const previous=$(id).value;$(id).value=saved[id];if(!$(id).checkValidity() || $(id).tagName==='SELECT'&&!$(id).value && textFields.has(id)&&id!=='region')$(id).value=previous;}
$('bestOnly').checked=saved.bestOnly===true;
months.forEach((name,i)=>{
 const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=chosenMonths.has(i+1);input.value=String(i+1);
 label.append(input,document.createTextNode(name));$('months').append(label);
 input.addEventListener('change',e=>{e.stopPropagation();input.checked?chosenMonths.add(i+1):chosenMonths.delete(i+1);search();});
});
for(const [key,labelText] of Object.entries(tripStyles)){
 const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=chosenStyles.has(key);input.value=key;
 label.append(input,document.createTextNode(labelText));$('styles').append(label);
 input.addEventListener('change',e=>{e.stopPropagation();input.checked?chosenStyles.add(key):chosenStyles.delete(key);search();});
}
for(const [key,label] of Object.entries(dimensions)){
 const wrapper=document.createElement('label');wrapper.className='slider';
 wrapper.innerHTML=`<span>${label}<output id="out-${key}"></output></span><input type="range" min="0" max="10" value="${Math.min(10,Math.max(0,Number(saved.weights?.[key]??5)||0))}" id="weight-${key}">`;
 $('sliders').append(wrapper);const input=$('weight-'+key);$('out-'+key).value=input.value;
 input.addEventListener('input',()=>{$('out-'+key).value=input.value;});
}
for(const preset of [
 {name:'Natuur & wildlife',keys:['natuur','bossen','dieren','wandelen','avontuur']},
 {name:'Strand & rust',keys:['strand','zwemmen','zon','relax']},
 {name:'Cultuur & steden',keys:['cultuur','historie','steden','eten']},
 {name:'Alles neutraal',keys:[]}
]){const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=preset.name;b.addEventListener('click',()=>{for(const k of Object.keys(dimensions)){const value=preset.keys.length?(preset.keys.includes(k)?9:1):5;$('weight-'+k).value=value;$('out-'+k).value=value;}search();});$('presets').append(b);}
function filters(){return {version:3,...Object.fromEntries(fieldIds.map(id=>[id,textFields.has(id)?$(id).value:Number($(id).value)])),months:[...chosenMonths].sort((a,b)=>a-b),styles:[...chosenStyles],bestOnly:$('bestOnly').checked,visited:[...visited],visitedRegions:[...visitedRegions],selected:[...selected],weights:Object.fromEntries(Object.keys(dimensions).map(k=>[k,Number($('weight-'+k).value)]))};}
function store(){try{localStorage.setItem('vakantiekompas',JSON.stringify(filters()));}catch{}}
function visitedSummary(){
 $('visitedCount').textContent=`${visited.size} hele landen/gebieden · ${visitedRegions.size} regio’s/eilanden`;$('visitedTags').replaceChildren();
 for(const [set,items] of [[visited,[...visited].map(id=>({id,label:names.of(id)}))],[visitedRegions,[...visitedRegions].map(id=>({id,label:destinations.find(d=>d.id===id).name}))]])for(const item of items){
  const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=item.label+' ×';b.setAttribute('aria-label',item.label+' weer meenemen');
  b.addEventListener('click',()=>{set.delete(item.id);countries();search();});$('visitedTags').append(b);
 }
}
function countries(){
 const query=$('countrySearch').value.trim().toLocaleLowerCase('nl');$('countries').replaceChildren();
 for(const country of countryCodes.map(code=>({code,name:names.of(code)})).sort((a,b)=>a.name.localeCompare(b.name,'nl'))){
  const children=destinations.filter(d=>d.code===country.code&&d.id!==country.code);
  const countryMatch=country.name.toLocaleLowerCase('nl').includes(query),shown=children.filter(d=>countryMatch||d.name.toLocaleLowerCase('nl').includes(query));
  if(!countryMatch&&!shown.length)continue;
  const group=document.createElement('div');group.className='countryGroup';
  const row=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=visited.has(country.code);
  row.append(input,document.createTextNode(country.name+(children.length?' — heel land':'')));
  input.addEventListener('change',e=>{e.stopPropagation();input.checked?visited.add(country.code):visited.delete(country.code);countries();search();});group.append(row);
  for(const d of shown){const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.checked=visitedRegions.has(d.id);box.disabled=visited.has(country.code);label.className='subregion';label.append(box,document.createTextNode(d.name));
   box.addEventListener('change',e=>{e.stopPropagation();box.checked?visitedRegions.add(d.id):visitedRegions.delete(d.id);visitedSummary();search();});group.append(label);
  }
  $('countries').append(group);
 }
 if(!$('countries').children.length)$('countries').textContent='Geen land of uitgewerkte regio gevonden.';visitedSummary();
}
function failureText(x){
 const labels={budget:`${money(x.delta)} boven budget per persoon`,minTemp:`${x.delta} °C kouder dan je minimum`,maxTemp:`${x.delta} °C warmer dan je maximum`,maxRain:`${x.delta} mm meer regen dan je maximum`,minSun:`${x.delta} uur minder zon dan je minimum`,bestOnly:'Buiten de aanbevolen voorbeeldperiode'};
 return labels[x.key]+(x.key==='budget'?'':` (${x.months.map(m=>months[m-1]).join(', ')})`);
}
function detailScore(d){
 if(d.score===null)return '<p>Alle interesses staan op 0. Er is daarom geen voorkeursscore; vergelijk op kosten en klimaat.</p>';
 return `<p><strong>${d.score}% voorkeurmatch</strong> = de gewogen gemiddelde aanbodscore × 10. De sliders bepalen het belang, niet hoeveel de bestemming moet hebben. 100% betekent een aanbodscore van 10/10 op élke meegewogen interesse. Kosten, klimaat, reisvorm en veiligheid verlagen dit percentage niet; ze zijn apart zichtbaar.</p><p>Een lagere score kan nog steeds een geweldige reis betekenen. Zet interesses die niet essentieel zijn lager of op 0. Dit is een redactioneel voorbeeldmodel, geen beoordeling van reiskwaliteit.</p><div class="tableScroll"><table><caption>Wat draagt bij, en waar gaan punten verloren?</caption><thead><tr><th>Interesse</th><th>Jouw belang</th><th>Aanbod</th><th>Bijdrage</th><th>Gemiste punten</th></tr></thead><tbody>${[...d.breakdown].sort((a,b)=>b.loss-a.loss).map(x=>`<tr><th>${dimensions[x.key]}</th><td>${x.weight}/10</td><td>${x.offering}/10</td><td>${x.contribution.toFixed(1)}</td><td>${x.loss.toFixed(1)}</td></tr>`).join('')}</tbody></table></div><p class="hint">Bijdragen en verliezen zijn percentagepunten, afgerond op één decimaal. De uiteindelijke score is afgerond op een geheel getal.</p>`;
}
function details(destination,focusScore=false){
 const f=filters(),d=evaluateDestination(destination,f),p=d.price,c=d.climateSelected,info=countryInfo[d.code];
 $('detailBody').innerHTML=`<p class="eyebrow">${names.of(d.code)} · ${d.region} · ${d.basis==='basis'?'Basisprofiel':'Regiogericht profiel'}</p><h2>${d.name}</h2><p>${d.description}</p><div class="notice">${dataNote}</div>
 <section id="scoreExplanation"><h3>Waarom ${d.score===null?'geen score':d.score+'%'}?</h3>${detailScore(d)}</section>
 <h3>Welke reismaand past?</h3><p><strong>Aanbevolen voorbeeldperiode:</strong> ${d.bestMonths.map(m=>months[m-1]).join(', ')}.</p><div class="monthVerdicts">${d.monthOptions.map(o=>`<div class="${o.failures.length?'monthFail':'monthPass'}"><strong>${months[o.month-1]}</strong><p>${o.climate.temp} °C · ${o.climate.rain} mm · ${o.climate.sun} uur zon/dag</p><p>${o.failures.length?o.failures.map(failureText).join('; '):'Past binnen alle ingestelde grenzen.'}</p></div>`).join('')}</div><p class="hint">Gekozen maanden zijn alternatieve vertrekmaanden. Er wordt geen gemiddelde over verschillende reismaanden gebruikt.</p>
 <div class="tableScroll"><table><caption>Illustratieve klimaatcurve — geen meetgegevens</caption><thead><tr><th>Maand</th><th>Gem. °C</th><th>Laag °C</th><th>Hoog °C</th><th>Regen mm</th><th>Zon u/dag</th></tr></thead><tbody>${d.climate.map((m,i)=>`<tr class="${f.months.includes(i+1)?'activeMonth':''}"><th>${months[i]}${d.bestMonths.includes(i+1)?' ★':''}</th><td>${m.temp}</td><td>${m.low}</td><td>${m.high}</td><td>${m.rain}</td><td>${m.sun}</td></tr>`).join('')}</tbody></table></div>
 <h3>Begroting voor ${p.days} dagen · ${p.people} reizigers</h3><dl class="costs"><dt>Retourvlucht per persoon</dt><dd>${money(p.flight)}</dd><dt>Eten, vervoer en activiteiten per persoon</dt><dd>${money(p.daily)}</dd><dt>Verblijf per persoon · ${p.days-1} nachten</dt><dd>${money(p.lodging)}</dd><dt>Totaal per persoon</dt><dd><strong>${money(p.perPerson)}</strong></dd><dt>Totaal voor de groep</dt><dd><strong>${money(p.total)}</strong></dd></dl><p class="hint">Dit is het ${ {simple:'eenvoudige',standard:'gemiddelde',comfortable:'comfortabele'}[f.stayLevel]} budgetscenario: geen villa-, hotel- of beschikbaarheidsberekening. Verblijf kies en boek je later zelf. Verzekering, visa en bijzondere excursies kunnen extra kosten geven.</p>
 <h3>${d.highlights.length} highlights & activiteiten</h3><p class="hint">Een redactionele ideeënlijst, geen objectief gerangschikte top 25. Opening, vergunningen en beschikbaarheid vooraf controleren.</p><ol class="highlights">${d.highlights.map(h=>`<li><strong>${h.name}</strong><p>${h.description}</p>${h.kind.startsWith('Activiteit')?`<small>${h.kind}</small>`:''}</li>`).join('')}</ol>
 <h3>Praktisch & politiek</h3><dl><dt>Valuta</dt><dd>${info?.currency || 'Nog niet ingevuld.'}</dd><dt>Verkeerszijde</dt><dd>${info?'Er wordt '+info.side+' gereden.':'Nog niet ingevuld.'} Rijbewijsvereisten en lokale routegeschiktheid apart controleren.</dd><dt>Institutionele achtergrond</dt><dd>${info?.institution || 'Nog niet geverifieerd.'} Dit is geen democratie-index of actuele regeringsbeoordeling.</dd><dt>Zelf rijden</dt><dd>${d.driving}</dd><dt>Veiligheid</dt><dd>Onbekend in deze database. Controleer actueel officieel reisadvies voor de specifieke regio, ook als de bestemming goed scoort.</dd><dt>Democratie/dictatuur en links/rechts</dt><dd>Nog niet geverifieerd. Een classificatie vraagt een methode, bron en peildatum.</dd></dl><a href="https://www.nederlandwereldwijd.nl/reisadvies" target="_blank" rel="noopener noreferrer">Officieel Nederlands reisadvies ↗</a><h3>Bronstatus</h3><p class="hint">${d.basis==='basis'?'Dit basisprofiel gebruikt een breed klimaat-, kosten- en interesse-sjabloon; cijfers zijn niet representatief voor iedere regio.':'Dit profiel gebruikt eveneens geschatte klimaat- en kostenwaarden.'} Highlights zijn redactionele achtergrond, geen actuele openingstijden of gecontroleerde boekingsinformatie. Er is geen actuele veiligheidsbeoordeling.</p>`;
 $('detail').showModal();if(focusScore)$('scoreExplanation').scrollIntoView({block:'start'});
}
function renderCard(d,target,{near=false}={}){
 const card=document.createElement('article');card.className='card'+(near?' nearCard':'');const p=d.price,c=d.climateSelected;
 const monthLabel=d.matchingMonths.length?d.matchingMonths.map(m=>months[m-1].slice(0,3).toLowerCase()).join(', '):months[d.chosenMonth-1];
 card.innerHTML=`<div class="cardTop"><span class="region">${names.of(d.code)} · ${d.region}</span><span class="score">${d.score===null?'Geen voorkeursscore':d.score+'% match'}</span></div><h3>${d.name}</h3><div class="tags">${d.reasons.map(k=>`<span>${dimensions[k]}</span>`).join('')}<span class="basisTag">${d.basis==='basis'?'Basisprofiel':'Regioprofiel'}</span></div><p class="cardIntro">${d.highlights[0].description}</p><div class="facts"><div><strong>${c.temp} °C</strong><small>${months[d.chosenMonth-1]} · ${c.rain} mm regen</small></div><div><strong>${money(p.perPerson)}</strong><small>per persoon incl. vlucht</small></div><div><strong>${money(p.total)}</strong><small>groep · ${p.people} reizigers</small></div></div><p class="hint">${p.days} dagen · ${c.sun} uur zon/dag · ${d.matchingMonths.length?'Passende maanden':'Dichtstbijzijnde maand'}: ${monthLabel}</p>`;
 if(d.weaknesses.length){const why=document.createElement('p');why.className='scoreWhy';why.textContent='Minder aansluiting: '+d.weaknesses.map(x=>`${dimensions[x.key]} (${x.offering}/10 bij belang ${x.weight}/10)`).join(' · ');card.append(why);}
 if(d.failures.length){const ul=document.createElement('ul');ul.className='failureList';d.failures.forEach(x=>{const li=document.createElement('li');li.textContent=failureText(x);ul.append(li);});card.append(ul);}
 const actions=document.createElement('div');actions.className='actions';
 const button=(text,fn)=>{const b=document.createElement('button');b.className='secondary';b.textContent=text;b.addEventListener('click',fn);actions.append(b);};
 button(`${d.highlights.length} highlights & reisdetails ↗`,()=>details(d));button('Waarom deze score?',()=>details(d,true));
 button(selected.has(d.id)?'Verwijder uit bewaard':'Bewaar bestemming',()=>{selected.has(d.id)?selected.delete(d.id):selected.add(d.id);search();});
 if(near)button('Pas filters aan voor deze optie',()=>{const next=relaxedFilters(filters(),d);for(const x of d.failures){if(x.key==='bestOnly')$('bestOnly').checked=false;else $(x.key).value=next[x.key];}search();$('cards').scrollIntoView({behavior:'smooth',block:'start'});});
 card.append(actions);target.append(card);
}
function matchesText(d){const query=$('destinationSearch').value.trim().toLocaleLowerCase('nl');return !query || `${d.name} ${names.of(d.code)} ${d.highlights.map(h=>h.name).join(' ')}`.toLocaleLowerCase('nl').includes(query);}
function renderResults(){
 const matches=lastResults.matches.filter(matchesText),near=lastResults.near.filter(matchesText);
 $('count').textContent=`${matches.length} passende opties`;$('cards').replaceChildren();
 if(!matches.length)$('cards').innerHTML='<div class="panel"><h3>Geen exacte matches</h3><p>Verruim je filters of zoekterm, of bekijk bijna-passende opties. Een hoog matchpercentage alleen zegt niets over actuele veiligheid.</p></div>';
 matches.slice(0,limit).forEach(d=>renderCard(d,$('cards')));$('showMore').hidden=matches.length<=limit;$('showMore').textContent=`Toon meer (${matches.length-limit} resterend)`;
 $('nearCards').replaceChildren();near.slice(0,6).forEach(d=>renderCard(d,$('nearCards'),{near:true}));if(!near.length)$('nearCards').innerHTML='<p class="hint">Geen extra bestemmingen dicht bij deze grenzen en zoekterm.</p>';
}
function comparison(rated){
 $('comparison').replaceChildren();if(rated.length<2)return;
 const div=$('comparison');div.innerHTML=`<table><caption>Bewaarde bestemmingen naast elkaar</caption><thead><tr><th>Bestemming</th><th>Match</th><th>Per persoon</th><th>Maand</th><th>Temp.</th><th>Regen</th><th>Zon</th></tr></thead><tbody>${rated.map(d=>`<tr><th>${d.name}</th><td>${d.score===null?'—':d.score+'%'}</td><td>${money(d.price.perPerson)}</td><td>${months[d.chosenMonth-1]}</td><td>${d.climateSelected.temp} °C</td><td>${d.climateSelected.rain} mm</td><td>${d.climateSelected.sun} u/dag</td></tr>`).join('')}</tbody></table>`;
}
function search(){
 if(!$('filters').checkValidity()){ $('error').textContent='Controleer de ingevulde aantallen en grenswaarden.';return;}
 const f=filters();if(!f.months.length){$('error').textContent='Vink minstens één mogelijke reismaand aan.';return;}
 if(f.minTemp>f.maxTemp){$('error').textContent='De minimumtemperatuur moet lager zijn dan de maximumtemperatuur.';return;}
 $('error').textContent='';store();lastResults=searchDestinations(destinations,f);limit=12;
 $('tripSummary').textContent=`${f.people} reizigers · ${f.days} dagen · ${f.months.map(m=>months[m-1]).join(', ')} · ${f.monthMode==='all'?'elke maand moet passen':'één passende maand is genoeg'} · max. ${money(f.budget)} per persoon (${money(f.budget*f.people)} voor de groep)`;
 renderResults();$('savedCards').replaceChildren();const rated=destinations.filter(d=>selected.has(d.id)&&!excluded(d,f)).map(d=>evaluateDestination(d,f));
 $('savedCount').textContent=`(${rated.length})`;comparison(rated);rated.forEach(d=>renderCard(d,$('savedCards')));
 if(!rated.length)$('savedCards').innerHTML='<p class="hint">Bewaar bestemmingen om ze hier te vergelijken. Bezochte bestemmingen worden verborgen. Je bewaarde selectie blijft staan als je filters wijzigt.</p>';
}
$('allMonths').addEventListener('click',()=>{chosenMonths.clear();months.forEach((_,i)=>chosenMonths.add(i+1));$('months').querySelectorAll('input').forEach(x=>x.checked=true);search();});
$('filters').addEventListener('submit',e=>{e.preventDefault();search();});
$('filters').addEventListener('change',e=>{if(e.target.id!=='countrySearch')search();});
$('filters').addEventListener('input',e=>{if(e.target.type==='range'||e.target.type==='number'){clearTimeout(refreshTimer);refreshTimer=setTimeout(search,100);}});
$('countrySearch').addEventListener('input',countries);
$('destinationSearch').addEventListener('input',()=>{limit=12;renderResults();});$('sort').addEventListener('change',search);
$('showMore').addEventListener('click',()=>{limit+=12;renderResults();});
$('clearVisited').addEventListener('click',()=>{visited.clear();visitedRegions.clear();countries();search();});
$('close').addEventListener('click',()=>$('detail').close());
$('reset').addEventListener('click',()=>{try{localStorage.removeItem('vakantiekompas');}catch{}location.reload();});
$('exportPreferences').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(filters(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vakantiekompas-voorkeuren.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('importPreferences').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>100000)throw new Error('Bestand is te groot.');const parsed=JSON.parse(await file.text());if(!parsed || typeof parsed!=='object' || Array.isArray(parsed) || !parsed.weights)throw new Error('Geen geldig voorkeurenbestand.');localStorage.setItem('vakantiekompas',JSON.stringify(migrateState(parsed)));location.reload();}catch(error){$('importStatus').textContent='Terugzetten mislukt: '+error.message;}});
window.addEventListener('vakantiekompas:before-update',store);
countries();search();
