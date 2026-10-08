import {dimensions,countryCodes,destinations,months,dataNote,countryInfo,tripStyles,coverage} from './data.938d891c7e3f.mjs';
import {searchDestinations,priceTrip,excluded,relaxedFilters,evaluateDestination} from './search.0853ff99a2da.mjs';
import {migrateState} from './state.a37c7b853a9a.mjs';
import {interestDefinitions,geographySource} from './catalog-model.9dc5a17140ff.mjs';
const $=id=>document.getElementById(id);
const names=new Intl.DisplayNames(['nl'],{type:'region'});
const money=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
const fieldIds=['region','people','days','budget','stayLevel','monthMode','minTemp','maxTemp','maxRain','minSun','minDaylight','maxFlightHours','maxTravelHours','maxBoatMinutes','unknownPolicy','sort'];
const textFields=new Set(['region','stayLevel','monthMode','sort','unknownPolicy']);
let saved={};try{saved=migrateState(JSON.parse(localStorage.getItem('vakantiekompas')||'{}'));}catch{}
const knownIds=new Set(destinations.map(d=>d.id));
const visited=new Set(Array.isArray(saved.visited)?saved.visited.filter(x=>countryCodes.includes(x)):[]);
const visitedRegions=new Set(Array.isArray(saved.visitedRegions)?saved.visitedRegions.filter(x=>knownIds.has(x)):['ID-bali','US-west','US-florida','CA-west']);
const selected=new Set(Array.isArray(saved.selected)?saved.selected.filter(x=>knownIds.has(x)):[]);
const chosenMonths=new Set(Array.isArray(saved.months)?saved.months.map(Number).filter(m=>Number.isInteger(m)&&m>=1&&m<=12):[new Date().getMonth()+1]);
const chosenStyles=new Set(Array.isArray(saved.styles)?saved.styles.filter(x=>tripStyles[x]):[]);
const chosenTypes=new Set(saved.types || ['country','region','island']);
const typeLabels={country:'Land/gebied',region:'Regio',island:'Eiland',city:'Stad'};
let overrides=saved.overrides&&typeof saved.overrides==='object'?saved.overrides:{};
let lastResults={matches:[],near:[],uncertain:[],outside:[],evaluated:[]},limit=12,unknownLimit=6,refreshTimer,activeView='explore',activeDetail=null;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const value=(v,suffix='')=>Number.isFinite(v)?v+suffix:'Onbekend';
const currentCatalog=()=>destinations.map(d=>({...d,scores:{...d.scores,...Object.fromEntries(Object.entries(overrides[d.id]||{}).filter(([k,v])=>dimensions[k]&&Number.isFinite(v)&&v>=0&&v<=10))},scoreStatus:overrides[d.id]&&Object.keys(overrides[d.id]).length?'personal':d.scoreStatus}));
$('dataNote').textContent=dataNote;
$('coverageSummary').textContent=`Catalogus: ${coverage.countries} landen/gebieden · ${coverage.regional} regio’s/eilanden · ${coverage.cities} steden. Onbekende gegevens worden niet als voldoende beoordeeld.`;
for(const id of fieldIds)if(saved[id]!=null){const previous=$(id).value;$(id).value=saved[id];if(!$(id).checkValidity() || $(id).tagName==='SELECT'&&!$(id).value && textFields.has(id)&&id!=='region')$(id).value=previous;}
$('bestOnly').checked=saved.bestOnly===true;
$('skipBoatActivities').checked=saved.skipBoatActivities!==false;$('excludeCityTrips').checked=saved.excludeCityTrips===true;
for(const [key,text] of Object.entries(typeLabels)){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=key;input.checked=chosenTypes.has(key);label.append(input,document.createTextNode(text));input.addEventListener('change',e=>{e.stopPropagation();input.checked?chosenTypes.add(key):chosenTypes.delete(key);search();});$('types').append(label);}
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
 const wrapper=document.createElement('label');wrapper.className='slider';wrapper.title=interestDefinitions[key];
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
function filters(){return {version:4,overrides,types:[...chosenTypes],skipBoatActivities:$('skipBoatActivities').checked,excludeCityTrips:$('excludeCityTrips').checked,...Object.fromEntries(fieldIds.map(id=>[id,textFields.has(id)?$(id).value:$(id).value===''?'':Number($(id).value)])),months:[...chosenMonths].sort((a,b)=>a-b),styles:[...chosenStyles],bestOnly:$('bestOnly').checked,visited:[...visited],visitedRegions:[...visitedRegions],selected:[...selected],weights:Object.fromEntries(Object.keys(dimensions).map(k=>[k,Number($('weight-'+k).value)]))};}
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
 const labels={budget:x.delta!=null?`${money(x.delta)} boven budget per persoon`:'Kostenraming ontbreekt',minTemp:'Minimumtemperatuur',maxTemp:'Maximumtemperatuur',maxRain:'Maximale regenval',minSun:'Werkelijke zonneschijn',minDaylight:'Minimaal daglicht',bestOnly:'Klimaatvenster (18–32 °C, ≤150 mm regen, ≥5 uur zon)',visited:'Al bezocht (land, regio of bovenliggende regio)',excludedCountry:'Uitgesloten op je eerdere keuze',overview:'Landsoverzicht of niet uitgewerkt vakantiegebied: kies een specifieke regio',region:'Buiten de gekozen wereldregio',type:'Dit bestemmingstype is niet aangevinkt',cityTrip:'Losse stedentrips worden vermeden',styles:'Andere reisvorm dan aangevinkt',maxFlightHours:`Vliegraming ${value(x.value,' uur')} overschrijdt je limiet`,maxTravelHours:`Totale reisraming ${value(x.value,' uur')} overschrijdt je limiet`,maxBoatMinutes:`Noodzakelijke bootrit tot ${value(x.value,' minuten')} overschrijdt je limiet`};
 return (labels[x.key]||x.key)+(x.months?.length&&x.key!=='budget'?` (${x.months.map(m=>months[m-1]).join(', ')})`:'');
}
function detailScore(d){
 const explanation=d.score===null?'Geen verantwoord totaalpercentage: minder dan 60% van je gewogen interesses is beoordeeld, of er zijn geen interesses geselecteerd. Onbekend aanbod is niet hetzelfde als weinig aanbod.':`${d.score}% indicatieve aansluiting op beoordeelde interesses; ${d.confidence}% van je gewogen interesses is ingevuld. Dit is ${d.scoreStatus==='personal'?'jouw persoonlijke':d.scoreStatus==='editorial'?'een redactionele':'een oude voorbeeld-'}inschatting, geen meting of objectieve ranglijst.`;
 return `<p>${explanation}</p><p>Een stad, bos of spa kunnen beschikbaar zijn zonder dat je hele reis daarom draait. Gewicht 0 betekent niet belangrijk. Gebruik reisvorm en bestemmingstype om losse stedentrips te vermijden.</p>${d.missing.length?`<p class="notice">Nog niet beoordeeld: ${d.missing.map(k=>dimensions[k]).join(', ')}.</p>`:''}<div class="tableScroll"><table><caption>Hoe de bekende inschattingen meewegen</caption><thead><tr><th>Interesse</th><th>Belang</th><th>Aanbod</th><th>Gemiste punten</th></tr></thead><tbody>${[...d.breakdown].sort((a,b)=>b.loss-a.loss).map(x=>`<tr><th title="${esc(interestDefinitions[x.key])}">${dimensions[x.key]}</th><td>${x.weight}/10</td><td>${x.offering}/10</td><td>${x.loss.toFixed(1)}</td></tr>`).join('')}</tbody></table></div>${Object.entries(d.scoreNotes).map(([k,note])=>`<p><strong>${dimensions[k]}:</strong> ${esc(note)}</p>`).join('')}`;
}
function details(destination,focusScore=false,passive=false){
 activeDetail=destination.id;const f=filters(),all=currentCatalog(),d=evaluateDestination(all.find(x=>x.id===destination.id),f,all),p=d.price,info=countryInfo[d.code],t=d.transport;
 const children=d.children.map(id=>all.find(x=>x.id===id));
 const highlights=d.highlights.filter(h=>!f.skipBoatActivities||!h.boatActivity);
 $('detailBody').innerHTML=`<p class="eyebrow">${names.of(d.code)} · ${typeLabels[d.type]}</p><h2>${esc(d.name)}</h2><p>${esc(d.description)}</p><p class="hint">${esc(d.geography.subregion)} · ${d.geography.landlocked?'geen zeekust':'kust of eilandgebied'} · ${d.geography.independent?'onafhankelijk land':'gebied / status apart controleren'}</p><div id="childLinks" class="actions"></div>
 <h3>Waarom wel of niet in je selectie?</h3><ul>${[...d.hard,...d.failures].map(x=>`<li>${esc(failureText(x))}</li>`).join('')}${d.unknown.map(k=>`<li>Gegevens ontbreken voor: ${esc(failureText({key:k}))}.</li>`).join('')||(!d.hard.length&&!d.failures.length?'<li>Geen bekende filtergrens overschreden.</li>':'')}</ul>
 <h3>Reis & zeeziekte</h3>${t?`<p><strong>Vliegen:</strong> circa ${t.flightMin}–${t.flightMax} uur. <strong>Totaal:</strong> circa ${t.totalMin}–${t.totalMax} uur.</p><p>Referentie: ${esc(t.airport.city)} (${t.airport.iata}). ${esc(t.note)}</p><p><strong>Langste noodzakelijke bootrit:</strong> ${esc(t.boat.range)}.</p><p>${esc(t.boat.note)}</p><p class="hint">Dit routeconcept is geen gecontroleerde dienstregeling. Rustige zee wordt niet gegarandeerd. Een vlucht naar een eiland kan een lange veerboot vervangen; losse excursies blijven een aparte keuze.</p>`:'<p>Route, reistijd en noodzakelijke boottrajecten zijn nog onbekend. Onbekend betekent niet bootvrij.</p>'}
 <section id="scoreExplanation"><h3>Wat betekent de interesse-inschatting?</h3>${detailScore(d)}</section>
 <details><summary>Pas aanbod aan op basis van je eigen kennis</summary><p class="hint">Alleen opgeslagen in deze browser. Dit maakt de onderliggende gegevens niet geverifieerd; een leeg veld betekent geen eigen inschatting.</p><div id="offerEditor" class="offerEditor"></div><button id="clearOffer" class="secondary">Eigen inschattingen voor deze plek wissen</button></details>
 <h3>Klimaat per maand</h3><p>Referentieplek: ${esc(d.climateReference)}. ${d.climateSource?'Historische ERA5-heranalyse 2015–2024 op de referentieplek; geen nationale gemiddelden of weersverwachting.':'Temperaturen, regen en werkelijke zonneschijn zijn nog niet onderbouwd en daarom onbekend.'} Daglicht is astronomisch berekend en zegt niets over bewolking.</p><div class="monthVerdicts">${d.monthOptions.map(o=>`<div class="${o.failures.length?'monthFail':o.unknown.length?'monthUnknown':'monthPass'}"><strong>${months[o.month-1]}</strong><p>${value(o.climate.daylight,' uur daglicht')} · zonneschijn ${value(o.climate.sun,' uur')}</p><p>${o.failures.map(failureText).join('; ')||'Geen bekende grens overschreden.'}${o.unknown.length?' Gegevens ontbreken voor: '+o.unknown.map(k=>failureText({key:k})).join(', ')+'.':''}</p></div>`).join('')}</div>
 <div class="tableScroll"><table><caption>Geen nationale gemiddelden; daglicht op de referentieplek</caption><thead><tr><th>Maand</th><th>Gem.</th><th>Dagminimum*</th><th>Dagmaximum*</th><th>Regen</th><th>Zonneschijn</th><th>Daglicht</th></tr></thead><tbody>${d.climate.map((c,i)=>`<tr class="${f.months.includes(i+1)?'activeMonth':''}"><th>${months[i]}</th><td>${value(c.temp,' °C')}</td><td>${value(c.low,' °C')}</td><td>${value(c.high,' °C')}</td><td>${value(c.rain,' mm')}</td><td>${value(c.sun,' uur')}</td><td>${value(c.daylight,' uur')}</td></tr>`).join('')}</tbody></table></div>
 <p class="hint">* Gemiddelde dagelijkse minimum- en maximumtemperatuur, geen extreme records. Klimaatvenster: maanden met gemiddelde 18–32 °C, maximaal 150 mm regen en minimaal 5 uur zonneschijn per dag. Dit is een transparante voorkeurregel, geen algemeen beste reisperiode.</p><h3>Kostenraming</h3>${p?`<dl class="costs"><dt>Retourvlucht p.p.</dt><dd>${money(p.flight)}</dd><dt>Eten/vervoer/activiteiten p.p.</dt><dd>${money(p.daily)}</dd><dt>Verblijf p.p.</dt><dd>${money(p.lodging)}</dd><dt>Totaal p.p.</dt><dd>${money(p.perPerson)}</dd><dt>Groep (${p.people})</dt><dd>${money(p.total)}</dd></dl><p class="hint">Oude planningsraming; geen prijsmeting, villa-indeling of actuele offerte. Budgetscenario: ${esc(f.stayLevel)}.</p>`:'<p>Geen kostenraming beschikbaar. Dit gebied is opgenomen voor complete dekking, niet met een verzonnen prijs.</p>'}
 <h3>${highlights.length} highlights & activiteiten</h3>${!highlights.length?'<p>Een lokaal highlightprofiel is nog niet uitgewerkt. Gebruik de regio’s hierboven waar beschikbaar.</p>':''}<ol class="highlights">${highlights.map(h=>`<li><strong>${esc(h.name)}</strong><p>${esc(h.description)}</p>${h.boatActivity?'<small>Bootactiviteit — duur en omstandigheden controleren.</small>':''}</li>`).join('')}</ol>${highlights.length<d.highlights.length?'<p class="hint">Bootexcursies zijn weggelaten volgens je voorkeur. Dit verandert de noodzakelijke aankomstroute niet.</p>':''}
 <h3>Bronnen & nog te controleren</h3><p class="hint">Land/geografie: <a href="${geographySource.countrySource}" target="_blank" rel="noopener">mledoze/countries</a>, opgehaald ${geographySource.retrieved}. Luchthavencoördinaten: <a href="${geographySource.airportSource}" target="_blank" rel="noopener">OpenFlights</a>; dit is geen actuele routeset. Daglicht: astronomisch model. ${d.climateSource?`Klimaat: <a href="${esc(d.climateSource.documentation)}" target="_blank" rel="noopener">Open-Meteo / Copernicus ERA5</a>, ${esc(d.climateSource.period)}, opgehaald ${esc(d.climateSource.retrieved)}. Zonneschijn is modelmatig berekend; microklimaat en weer op je reis kunnen afwijken.`:'Klimaatbron ontbreekt voor deze plek.'} Reistijd: afstandsmodel; boottrajecten: redactionele routeconcepten. Interesse- en kostenwaarden: geen objectieve meetgegevens.</p><p>Valuta: ${esc(info?.currency||d.geography.currency||'onbekend')}. Politiek, veiligheid, actuele rijregels en openingstijden zijn nog niet gecontroleerd.</p><a href="https://www.nederlandwereldwijd.nl/reisadvies" target="_blank" rel="noopener noreferrer">Controleer officieel Nederlands reisadvies ↗</a>`;
 for(const child of children){const b=document.createElement('button');b.className='secondary';b.textContent=child.name;b.addEventListener('click',()=>details(child));$('childLinks').append(b);}
 for(const [key,label] of Object.entries(dimensions)){const wrapper=document.createElement('label'),input=document.createElement('input');input.type='number';input.min=0;input.max=10;input.step=1;input.placeholder=d.scores[key]!=null?'Huidig: '+d.scores[key]:'Onbekend';input.value=overrides[d.id]?.[key]??'';wrapper.append(document.createTextNode(label),input);input.addEventListener('change',()=>{if(!input.checkValidity())return;overrides[d.id]??={};if(input.value==='')delete overrides[d.id][key];else overrides[d.id][key]=Number(input.value);search();});$('offerEditor').append(wrapper);}
 $('clearOffer').addEventListener('click',()=>{delete overrides[d.id];search();details(d);});
 $('detail').classList.add('isOpen');if(focusScore)$('scoreExplanation').scrollIntoView({block:'start'});else if(!passive)$('detail').scrollTop=0;
 if(!passive&&window.innerWidth<800)$('detail').scrollIntoView({block:'start',behavior:'smooth'});
}
function renderCard(d,target,{near=false}={}){
 const card=document.createElement('article');card.className='card'+(near?' nearCard':'');const p=d.price,c=d.climateSelected,t=d.transport;
 card.innerHTML=`<div class="cardTop"><span class="region">${names.of(d.code)} · ${typeLabels[d.type]}</span><span class="score">${d.score===null?'Aanbod onbekend':d.score+'% indicatie'}</span></div><h3>${esc(d.name)}</h3><div class="tags">${d.reasons.map(k=>`<span>${dimensions[k]}</span>`).join('')}<span>${d.status==='unknown'?'Nog te controleren':d.status==='excluded'?'Buiten selectie':d.status==='near'?'Bijna passend':'Bekende criteria passen'}</span></div><p class="cardIntro">${esc(d.description)}</p><div class="facts"><div><strong>${p?money(p.perPerson):'Onbekend'}</strong><small>raming per persoon</small></div><div><strong>${t?'~'+t.flightMin+'–'+t.flightMax+' u':'Onbekend'}</strong><small>vliegen, afstandsmodel</small></div><div><strong>${t?t.boat.maxMinutes+' min':'Onbekend'}</strong><small>langste noodzakelijke bootrit</small></div></div><p class="hint">${value(c.daylight,' uur daglicht')} bij ${esc(d.climateReference)} · werkelijke zonneschijn ${value(c.sun,' uur')}. ${d.score===null?'Geen voldoende onderbouwd interessepercentage.':d.scoreStatus==='personal'?'Eigen inschatting.':'Redactionele/voorbeeldinschatting, geen meting.'}</p>`;
 if(d.weaknesses.length){const why=document.createElement('p');why.className='scoreWhy';why.textContent='Minder aansluiting volgens de inschatting: '+d.weaknesses.map(x=>`${dimensions[x.key]} (${x.offering}/10)`).join(' · ');card.append(why);}
 const issues=[...d.hard,...d.failures].map(failureText).concat(d.unknown.map(k=>'Nog onbekend: '+failureText({key:k})));
 if(issues.length){const ul=document.createElement('ul');ul.className='failureList';issues.forEach(text=>{const li=document.createElement('li');li.textContent=text;ul.append(li);});card.append(ul);}
 const actions=document.createElement('div');actions.className='actions';const button=(text,fn)=>{const b=document.createElement('button');b.className='secondary';b.textContent=text;b.addEventListener('click',fn);actions.append(b);};
 button('Highlights & reisdetails ↗',()=>details(d));button('Waarom deze inschatting?',()=>details(d,true));button(selected.has(d.id)?'Verwijder uit opgeslagen':'Bewaar bestemming',()=>{selected.has(d.id)?selected.delete(d.id):selected.add(d.id);search();});
 if(near)button('Pas passende grenzen aan',()=>{const next=relaxedFilters(filters(),d);for(const x of d.failures){if(x.key==='bestOnly')$('bestOnly').checked=false;else $(x.key).value=next[x.key];}search();});card.append(actions);target.append(card);
}
function matchesText(d){const query=$('destinationSearch').value.trim().toLocaleLowerCase('nl');return !query||`${d.name} ${names.of(d.code)} ${d.highlights.map(h=>h.name).join(' ')}`.toLocaleLowerCase('nl').includes(query);}
function renderResults(){
 const matches=lastResults.matches.filter(matchesText),near=lastResults.near.filter(matchesText),uncertain=lastResults.uncertain.filter(matchesText),outside=lastResults.outside.filter(matchesText),query=$('destinationSearch').value.trim();
 $('count').textContent=`${matches.length} passen · ${uncertain.length} te controleren`;$('cards').replaceChildren();
 if(!matches.length)$('cards').innerHTML='<div class="panel"><h3>Geen bevestigde matches</h3><p>Bekijk bijna-passende opties en ontbrekende gegevens hieronder. De catalogus blijft beschikbaar via Alle landen.</p></div>';
 matches.slice(0,limit).forEach(d=>renderCard(d,$('cards')));$('showMore').hidden=matches.length<=limit;$('showMore').textContent=`Toon meer (${matches.length-limit} resterend)`;
 $('nearCards').replaceChildren();near.slice(0,6).forEach(d=>renderCard(d,$('nearCards'),{near:true}));if(!near.length)$('nearCards').innerHTML='<p class="hint">Geen bijna-passende opties voor deze zoekterm.</p>';
 $('unknownSection').hidden=$('unknownPolicy').value==='hide';$('unknownCount').textContent=`(${uncertain.length})`;$('unknownCards').replaceChildren();uncertain.slice(0,query?Math.max(24,unknownLimit):unknownLimit).forEach(d=>renderCard(d,$('unknownCards')));
 $('showMoreUnknown').hidden=uncertain.length<=(query?Math.max(24,unknownLimit):unknownLimit);$('outsideSection').hidden=!query;$('outsideCards').replaceChildren();if(query)outside.slice(0,12).forEach(d=>renderCard(d,$('outsideCards')));
 $('searchDiagnosis').hidden=!query;if(query){$('searchDiagnosis').textContent=`“${query}”: ${matches.length} passen binnen bekende criteria, ${near.length} missen net een grens, ${uncertain.length} hebben ontbrekende gegevens en ${outside.length} vallen buiten je selectie of zijn een landsoverzicht. Hieronder staat per profiel waarom. Een lage interesse-inschatting is geen uitsluitingsfilter.`;}
 renderCatalog();renderComparison();
}
function renderCatalog(){
 $('catalogCards').replaceChildren();for(const d of currentCatalog().filter(matchesText)){const row=document.createElement('article');row.className='catalogRow';const label=document.createElement('div');label.innerHTML=`<strong>${esc(d.name)}</strong><small>${names.of(d.code)} · ${typeLabels[d.type]} · ${d.geography.subregion} · ${d.climateStatus==='unknown'?'klimaat onbekend':'klimaatbron beschikbaar'}</small>`;const b=document.createElement('button');b.className='secondary';b.textContent='Bekijk';b.addEventListener('click',()=>details(d));row.append(label,b);$('catalogCards').append(row);}
}
function renderComparison(){
 const f=filters(),all=currentCatalog(),rated=$('compareAll').checked?[...lastResults.matches,...lastResults.near,...(f.unknownPolicy==='hide'?[]:lastResults.uncertain)].filter(matchesText):all.filter(d=>selected.has(d.id)).map(d=>evaluateDestination(d,f,all));
 $('comparison').replaceChildren();if(!rated.length){$('comparison').textContent='Nog geen bestemmingen om te vergelijken. Bewaar een bestemming of vink alle zoekresultaten aan.';return;}
 const table=document.createElement('table');table.innerHTML='<caption>Vergelijking — onbekend betekent niet ongunstig</caption><thead><tr><th>Bestemming</th><th>Type</th><th>Status</th><th>Interesse</th><th>Prijs p.p.</th><th>Vliegen (u)</th><th>Totaal (u)</th><th>Boot (min)</th><th>Daglicht (u)</th><th>Zonneschijn (u)</th></tr></thead><tbody></tbody>';
 for(const d of rated){const tr=document.createElement('tr');const td=document.createElement('th'),b=document.createElement('button');b.className='textButton';b.textContent=d.name;b.addEventListener('click',()=>details(d));td.append(b);tr.append(td);for(const text of [typeLabels[d.type],({match:'Bekende grenzen passen',unknown:'Nog te controleren',excluded:'Buiten selectie',near:'Bijna passend',outside:'Grens overschreden'})[d.status],d.score===null?'Onbekend':d.score+'% ('+d.confidence+'% beoordeeld)',d.price?money(d.price.perPerson):'Onbekend',d.transport?d.transport.flightMin+'–'+d.transport.flightMax:'Onbekend',d.transport?d.transport.totalMin+'–'+d.transport.totalMax:'Onbekend',d.transport?d.transport.boat.maxMinutes:'Onbekend',value(d.climateSelected.daylight),value(d.climateSelected.sun)]){const cell=document.createElement('td');cell.textContent=text;tr.append(cell);}table.querySelector('tbody').append(tr);}$('comparison').append(table);
}
function activateView(view){activeView=view;for(const key of ['explore','saved','compare','catalog']){$(key+'View').hidden=key!==view;$('tab-'+key).setAttribute('aria-selected',String(key===view));$('tab-'+key).tabIndex=key===view?0:-1;}document.querySelector('.resultViewport').scrollTop=0;renderComparison();}
function search(){
 if(!$('filters').checkValidity()){ $('error').textContent='Controleer de ingevulde aantallen en grenswaarden.';return;}
 const f=filters();if(!f.types.length){$('error').textContent='Vink minstens één bestemmingstype aan.';return;}if(!f.months.length){$('error').textContent='Vink minstens één mogelijke reismaand aan.';return;}
 if(Number.isFinite(f.minTemp)&&Number.isFinite(f.maxTemp)&&f.minTemp>f.maxTemp){$('error').textContent='De minimumtemperatuur moet lager zijn dan de maximumtemperatuur.';return;}
 $('error').textContent='';store();lastResults=searchDestinations(currentCatalog(),f);limit=12;unknownLimit=6;
 $('tripSummary').textContent=`${f.people} reizigers · ${f.days} dagen · ${f.months.map(m=>months[m-1]).join(', ')} · ${f.monthMode==='all'?'elke maand moet passen':'één passende maand is genoeg'} · max. ${money(f.budget)} per persoon (${money(f.budget*f.people)} voor de groep)`;
 renderResults();$('savedCards').replaceChildren();const all=currentCatalog(),rated=all.filter(d=>selected.has(d.id)).map(d=>evaluateDestination(d,f,all));
 $('savedCount').textContent=`(${rated.length})`;$('navSavedCount').textContent=String(rated.length);renderComparison();rated.forEach(d=>renderCard(d,$('savedCards')));
 if(activeDetail){const previousScroll=$('detail').scrollTop;details(all.find(d=>d.id===activeDetail),false,true);$('detail').scrollTop=previousScroll;}
 if(!rated.length)$('savedCards').innerHTML='<p class="hint">Bewaar bestemmingen om ze hier te vergelijken. Je bewaarde selectie blijft staan als je filters wijzigt.</p>';
}
$('allMonths').addEventListener('click',()=>{chosenMonths.clear();months.forEach((_,i)=>chosenMonths.add(i+1));$('months').querySelectorAll('input').forEach(x=>x.checked=true);search();});
$('filters').addEventListener('submit',e=>{e.preventDefault();search();});
$('filters').addEventListener('change',e=>{if(e.target.id!=='countrySearch')search();});
$('filters').addEventListener('input',e=>{if(e.target.type==='range'||e.target.type==='number'){clearTimeout(refreshTimer);refreshTimer=setTimeout(search,100);}});
$('countrySearch').addEventListener('input',countries);
$('destinationSearch').addEventListener('input',()=>{limit=12;renderResults();});$('sort').addEventListener('change',search);
$('showMore').addEventListener('click',()=>{limit+=12;renderResults();});$('showMoreUnknown').addEventListener('click',()=>{unknownLimit+=12;renderResults();});
$('clearVisited').addEventListener('click',()=>{visited.clear();visitedRegions.clear();countries();search();});
$('close').addEventListener('click',()=>{activeDetail=null;$('detail').classList.remove('isOpen');$('detailBody').innerHTML='<div class="detailEmpty"><h2>Bekijk een bestemming</h2><p>Klik op een resultaat voor reisdetails.</p></div>';});
for(const view of ['explore','saved','compare','catalog'])$('tab-'+view).addEventListener('click',()=>activateView(view));
$('compareAll').addEventListener('change',renderComparison);
document.querySelector('.tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const keys=['explore','saved','compare','catalog'],next=keys[(keys.indexOf(activeView)+(e.key==='ArrowRight'?1:3))%4];activateView(next);$('tab-'+next).focus();});
$('reset').addEventListener('click',()=>{try{localStorage.removeItem('vakantiekompas');}catch{}location.reload();});
$('exportPreferences').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(filters(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vakantiekompas-voorkeuren.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('importPreferences').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>100000)throw new Error('Bestand is te groot.');const parsed=JSON.parse(await file.text());if(!parsed || typeof parsed!=='object' || Array.isArray(parsed) || !parsed.weights)throw new Error('Geen geldig voorkeurenbestand.');localStorage.setItem('vakantiekompas',JSON.stringify(migrateState(parsed)));location.reload();}catch(error){$('importStatus').textContent='Terugzetten mislukt: '+error.message;}});
window.addEventListener('vakantiekompas:before-update',store);
countries();search();
