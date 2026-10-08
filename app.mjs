import {dimensions,countryCodes,destinations,months,dataNote,countryInfo} from './data.mjs';
import {searchDestinations,priceTrip,excluded,relaxedFilters} from './search.mjs';
import {migrateState} from './state.mjs';
const $=id=>document.getElementById(id);
const names=new Intl.DisplayNames(['nl'],{type:'region'});
const money=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
const fieldIds=['region','people','days','budget','occupancy','month','minTemp','maxTemp','maxRain','minSun'];
let saved={};try{saved=migrateState(JSON.parse(localStorage.getItem('vakantiekompas')||'{}'));}catch{}
const knownIds=new Set(destinations.map(d=>d.id));
const visited=new Set(Array.isArray(saved.visited)?saved.visited.filter(x=>countryCodes.includes(x)):[]);
const visitedRegions=new Set(Array.isArray(saved.visitedRegions)?saved.visitedRegions.filter(x=>knownIds.has(x)):['ID-bali','US-west','US-florida','CA-west']);
const selected=new Set(Array.isArray(saved.selected)?saved.selected.filter(x=>knownIds.has(x)):[]);
$('dataNote').textContent=dataNote;
months.forEach((month,i)=>{const option=new Option(month,String(i+1));$('month').append(option);});
$('month').value=String(new Date().getMonth()+1);
for(const id of fieldIds){if(saved[id]!=null){const previous=$(id).value;$(id).value=saved[id];if(!$(id).checkValidity())$(id).value=previous;}}
$('bestOnly').checked=saved.bestOnly===true;
for(const [key,label] of Object.entries(dimensions)){
 const wrapper=document.createElement('label');wrapper.className='slider';
 wrapper.innerHTML=`<span>${label}<output id="out-${key}"></output></span><input type="range" min="0" max="10" value="${Math.min(10,Math.max(0,Number(saved.weights?.[key]??5)||0))}" id="weight-${key}">`;
 $('sliders').append(wrapper);const input=$('weight-'+key);$('out-'+key).value=input.value;
 input.addEventListener('input',()=>{$('out-'+key).value=input.value;});
}
function filters(){return {version:2,...Object.fromEntries(fieldIds.map(id=>[id,id==='region'?$(id).value:Number($(id).value)])),bestOnly:$('bestOnly').checked,visited:[...visited],visitedRegions:[...visitedRegions],selected:[...selected],weights:Object.fromEntries(Object.keys(dimensions).map(k=>[k,Number($('weight-'+k).value)]))};}
function store(){try{localStorage.setItem('vakantiekompas',JSON.stringify(filters()));}catch{}}
function visitedSummary(){
 $('visitedCount').textContent=`${visited.size} hele landen/gebieden · ${visitedRegions.size} regio’s/eilanden`;
 $('visitedTags').replaceChildren();
 for(const [set,items] of [[visited,[...visited].map(id=>({id,label:names.of(id)}))],[visitedRegions,[...visitedRegions].map(id=>({id,label:destinations.find(d=>d.id===id).name}))]]){
  for(const item of items){const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=item.label+' ×';b.setAttribute('aria-label',item.label+' weer meenemen');b.addEventListener('click',()=>{set.delete(item.id);countries();search();});$('visitedTags').append(b);}
 }
}
function countries(){
 const query=$('countrySearch').value.trim().toLocaleLowerCase('nl');$('countries').replaceChildren();
 const countryList=countryCodes.map(code=>({code,name:names.of(code)})).sort((a,b)=>a.name.localeCompare(b.name,'nl'));
 for(const country of countryList){
  const children=destinations.filter(d=>d.code===country.code && d.id!==country.code);
  const countryMatch=country.name.toLocaleLowerCase('nl').includes(query);
  const shownChildren=children.filter(d=>countryMatch || d.name.toLocaleLowerCase('nl').includes(query));
  if(!countryMatch && !shownChildren.length)continue;
  const group=document.createElement('div');group.className='countryGroup';
  const row=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=visited.has(country.code);
  row.append(input,document.createTextNode(country.name+(children.length?' — heel land':'')));
  input.addEventListener('change',()=>{input.checked?visited.add(country.code):visited.delete(country.code);countries();search();});group.append(row);
  for(const d of shownChildren){const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.checked=visitedRegions.has(d.id);box.disabled=visited.has(country.code);label.className='subregion';label.append(box,document.createTextNode(d.name));box.addEventListener('change',()=>{box.checked?visitedRegions.add(d.id):visitedRegions.delete(d.id);visitedSummary();search();});group.append(label);}
  $('countries').append(group);
 }
 if(!$('countries').children.length)$('countries').textContent='Geen land of uitgewerkte regio gevonden.';
 visitedSummary();
}
function failureText(failure){
 const labels={budget:`${money(failure.delta)} boven budget per persoon`,minTemp:`${failure.delta} °C kouder dan je minimum`,maxTemp:`${failure.delta} °C warmer dan je maximum`,maxRain:`${failure.delta} mm meer regen dan je maximum`,minSun:`${failure.delta} uur minder zon dan je minimum`,bestOnly:'Gekozen maand valt buiten de aanbevolen voorbeeldperiode'};
 return labels[failure.key];
}
function details(d){
 const f=filters(),p=priceTrip(d,f),c=d.climate[f.month-1],info=countryInfo[d.code];
 $('detailBody').innerHTML=`<p class="eyebrow">${names.of(d.code)} · ${d.region}</p><h2>${d.name}</h2><p>${d.description}</p>
 <div class="notice">${dataNote}</div>
 <h3>Wanneer gaan?</h3><p><strong>Aanbevolen voorbeeldperiode:</strong> ${d.bestMonths.map(m=>months[m-1]).join(', ')}.</p><p>${months[f.month-1]}: gemiddeld ${c.temp} °C, laag ${c.low} °C, hoog ${c.high} °C, ${c.rain} mm regen en ${c.sun} uur zon per dag.</p>
 <div class="tableScroll"><table><caption>Illustratieve klimaatcurve — geen meetgegevens</caption><thead><tr><th>Maand</th><th>Gem. °C</th><th>Laag °C</th><th>Hoog °C</th><th>Regen mm</th><th>Zon u/dag</th></tr></thead><tbody>${d.climate.map((m,i)=>`<tr class="${i===f.month-1?'activeMonth':''}"><th>${months[i]}${d.bestMonths.includes(i+1)?' ★':''}</th><td>${m.temp}</td><td>${m.low}</td><td>${m.high}</td><td>${m.rain}</td><td>${m.sun}</td></tr>`).join('')}</tbody></table></div>
 <h3>Begroting voor ${p.days} dagen · ${p.people} reizigers</h3><dl class="costs"><dt>Retourvlucht per persoon</dt><dd>${money(p.flight)}</dd><dt>Eten, vervoer en activiteiten per persoon</dt><dd>${money(p.daily)}</dd><dt>Verblijf per persoon · ${p.days-1} nachten, ${p.rooms} kamer(s)</dt><dd>${money(p.lodging)}</dd><dt>Totaal per persoon</dt><dd><strong>${money(p.perPerson)}</strong></dd><dt>Totaal voor de groep</dt><dd><strong>${money(p.total)}</strong></dd></dl><p class="hint">Daguitgaven ${money(d.pricing.daily)} per persoon; kamer ${money(d.pricing.room)} per nacht. ${f.occupancy} personen per kamer; bij een oneven groep wordt een extra kamer verdeeld over de hele groep. Geen live vluchttarief. Reisverzekering, visa en bijzondere excursies kunnen extra kosten geven.</p>
 <h3>25 highlights & activiteiten om te onderzoeken</h3><p class="hint">Een ideeënlijst, geen objectieve ranglijst. Algemene activiteiten zijn apart herkenbaar.</p><ol class="highlights">${d.highlights.map(h=>`<li>${h.name}<small>${h.kind}</small></li>`).join('')}</ol>
 <h3>Jullie interesses</h3><div class="interestGrid">${Object.entries(dimensions).map(([k,label])=>`<div>${label}<strong>${d.scores[k]}/10</strong></div>`).join('')}</div>
 <h3>Praktisch & politiek</h3><dl><dt>Valuta</dt><dd>${info.currency}</dd><dt>Verkeerszijde</dt><dd>Er wordt ${info.side} gereden. Dit zegt niets over rijbewijsvereisten of geschiktheid van een route.</dd><dt>Institutionele achtergrond</dt><dd>${info.institution}. Algemene achtergrond, geen actuele democratie-index of regeringsclassificatie.</dd><dt>Zelf rijden</dt><dd>${d.driving}</dd><dt>Veiligheid</dt><dd>Onbekend in deze database. Raadpleeg actueel officieel reisadvies voor de specifieke regio.</dd><dt>Staatsvorm · democratie/dictatuur</dt><dd>Nog niet geverifieerd. Een classificatie vereist een gekozen methode en bron.</dd><dt>Regering · links/rechts</dt><dd>Nog niet geverifieerd. Coalities kunnen meerdere stromingen omvatten; bron en peildatum zijn nodig.</dd></dl><a href="https://www.nederlandwereldwijd.nl/reisadvies" target="_blank" rel="noopener noreferrer">Bekijk officieel Nederlands reisadvies ↗</a><h3>Bronstatus</h3><p class="hint">Kosten, klimaat en scores: voorbeeldmodel, geen externe databron of actualisatiedatum. Highlights: redactionele ideeën, opening en toegankelijkheid niet gecontroleerd. Er wordt geen actuele veiligheids- of politieke beoordeling geclaimd.</p>`;
 $('detail').showModal();
}
function renderCard(d,target,{near=false,bookmarked=false}={}){
 const card=document.createElement('article');card.className='card'+(near?' nearCard':'');
 const f=filters(),p=d.price || priceTrip(d,f),c=d.climateSelected || d.climate[f.month-1];
 card.innerHTML=`<div class="cardTop"><span class="region">${names.of(d.code)} · ${d.region}</span><span class="score">${d.score??'—'}${d.score!=null?'% match':''}</span></div><h3>${d.name}</h3><div class="tags">${(d.reasons || []).map(k=>`<span>${dimensions[k]}</span>`).join('')}</div><div class="facts"><div><strong>${c.temp} °C</strong><small>${months[f.month-1]} · ${c.rain} mm regen</small></div><div><strong>${money(p.perPerson)}</strong><small>per persoon incl. vlucht</small></div><div><strong>${money(p.total)}</strong><small>groep · ${p.people} reizigers</small></div></div><p class="hint">${p.days} dagen · ${c.sun} uur zon/dag · Beste periode: ${d.bestMonths.map(m=>months[m-1].slice(0,3).toLowerCase()).join(', ')}</p>`;
 if(d.failures?.length){const ul=document.createElement('ul');ul.className='failureList';d.failures.forEach(x=>{const li=document.createElement('li');li.textContent=failureText(x);ul.append(li);});card.append(ul);}
 const actions=document.createElement('div');actions.className='actions';
 const detailButton=document.createElement('button');detailButton.className='secondary';detailButton.textContent='25 ideeën & reisdetails ↗';detailButton.addEventListener('click',()=>details(d));actions.append(detailButton);
 const saveButton=document.createElement('button');saveButton.className='secondary';saveButton.textContent=selected.has(d.id)?'Verwijder uit bewaard':'Bewaar bestemming';saveButton.addEventListener('click',()=>{selected.has(d.id)?selected.delete(d.id):selected.add(d.id);search();});actions.append(saveButton);
 if(near){const relax=document.createElement('button');relax.className='secondary';relax.textContent='Pas filters aan voor deze optie';relax.addEventListener('click',()=>{const next=relaxedFilters(filters(),d);for(const x of d.failures){if(x.key==='bestOnly')$('bestOnly').checked=false;else $(x.key).value=next[x.key];}search();$('cards').scrollIntoView({behavior:'smooth',block:'start'});});actions.append(relax);}
 card.append(actions);target.append(card);
}
function search(){
 if(!$('filters').checkValidity())return;
 const f=filters();if(f.minTemp>f.maxTemp){$('error').textContent='De minimumtemperatuur moet lager zijn dan de maximumtemperatuur.';return;}
 $('error').textContent='';store();const results=searchDestinations(destinations,f);
 $('count').textContent=`${results.matches.length} passende opties`;
 $('tripSummary').textContent=`${f.people} reizigers · ${f.days} dagen · ${months[f.month-1]} · maximaal ${money(f.budget)} per persoon (${money(f.budget*f.people)} voor de groep) · ${destinations.length} uitgewerkte voorbeeldprofielen`;
 $('cards').replaceChildren();if(!results.matches.length)$('cards').innerHTML='<div class="panel"><h3>Geen exacte matches</h3><p>Bekijk de bijna-passende suggesties hieronder of verruim je filters. Er zijn nog niet voor elk land profielen.</p></div>';
 results.matches.forEach(d=>renderCard(d,$('cards')));
 $('nearCards').replaceChildren();results.near.slice(0,6).forEach(d=>renderCard(d,$('nearCards'),{near:true}));
 if(!results.near.length)$('nearCards').innerHTML='<p class="hint">Geen extra bestemmingen dicht bij je huidige grenswaarden.</p>';
 $('savedCards').replaceChildren();const bookmarked=destinations.filter(d=>selected.has(d.id) && !excluded(d,f));
 $('savedCount').textContent=`(${bookmarked.length})`;
 for(const d of bookmarked){const evaluated=searchDestinations([d],{...f,region:''});const rated=evaluated.evaluated[0] || {...d,price:priceTrip(d,f)};renderCard(rated,$('savedCards'),{bookmarked:true});}
 if(!bookmarked.length)$('savedCards').innerHTML='<p class="hint">Bewaar een bestemming om hem hier te vergelijken. Bezochte bestemmingen worden ook hier verborgen.</p>';
}
$('filters').addEventListener('submit',e=>{e.preventDefault();search();});
$('filters').addEventListener('change',e=>{if(e.target.id!=='countrySearch')search();});
$('countrySearch').addEventListener('input',countries);
$('clearVisited').addEventListener('click',()=>{visited.clear();visitedRegions.clear();countries();search();});
$('close').addEventListener('click',()=>$('detail').close());
$('reset').addEventListener('click',()=>{try{localStorage.removeItem('vakantiekompas');}catch{}location.reload();});
countries();search();
