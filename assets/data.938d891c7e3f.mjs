import {completeCatalog} from './catalog-model.9dc5a17140ff.mjs';
import {worldCatalog} from './world-catalog.03cc4a6e55b5.mjs';
import {regionalCatalog} from './regional-catalog.c83b14a82617.mjs';
import {highlightDescriptions,activityDescriptions} from './highlight-descriptions.bc2491211516.mjs';
export const dimensions = {natuur:'Natuur & landschappen',cultuur:'Cultuur',historie:'Historie',steden:'Steden & stedentrips',bossen:'Jungle & bossen',strand:'Strand & zee',duiken:'Duiken',zwemmen:'Zwemmen',zon:'Zonnen',dieren:'Dieren',relax:'Rust & ontspanning',avontuur:'Avontuur',wandelen:'Wandelen',roadtrip:'Roadtrip',eten:'Eten & lokale keuken',wellness:'Massage & spa',nachtleven:'Uitgaan',levendig:'Drukte & levendigheid'};
export const countryCodes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
const rows = [
 ['PT','Europa',2400,280,22,4,8,[7,8,8,8,4,9,5,8,9,4,8,5],['Lissabon','Sintra','Porto','Algarve','Dourovallei']],
 ['ES','Europa',2500,260,24,3,9,[7,9,9,9,5,9,6,9,9,5,7,6],['Alhambra','Barcelona','Madrid','Picos de Europa','Sevilla']],
 ['IT','Europa',3200,300,23,5,8,[8,10,10,9,5,8,6,8,8,5,7,6],['Rome','Florence','Dolomieten','Pompeï','Sicilië']],
 ['GR','Europa',2800,380,25,2,10,[7,8,10,6,3,10,7,10,10,4,9,5],['Athene','Meteora','Kreta','Naxos','Delphi']],
 ['NO','Europa',4400,320,14,11,6,[10,6,7,6,9,3,3,4,4,8,8,9],['Lofoten','Bergen','Geirangerfjord','Tromsø','Jotunheimen']],
 ['JP','Azië',4600,1000,22,12,6,[8,10,10,10,8,5,5,6,6,7,6,8],['Kyoto','Tokio','Nara','Japanse Alpen','Hiroshima']],
 ['TH','Azië',2100,850,29,13,7,[9,9,8,8,9,10,10,10,9,9,9,8],['Bangkok','Chiang Mai','Khao Sok','Ayutthaya','Krabi']],
 ['CR','Amerika',3900,950,26,16,6,[10,7,5,4,10,9,8,9,8,10,8,10],['Monteverde','Arenal','Tortuguero','Corcovado','Manuel Antonio']],
 ['NZ','Oceanië',5100,1500,17,9,7,[10,7,5,5,9,7,7,7,7,10,8,10],['Fiordland','Rotorua','Aoraki','Queenstown','Abel Tasman']],
 ['ZA','Afrika',3000,900,23,6,8,[10,8,7,7,7,8,9,7,8,10,7,10],['Kaapstad','Krugerpark','Garden Route','Drakensbergen','Robbeneiland']],
 ['IS','Europa',4700,450,9,12,5,[10,5,6,4,2,2,8,5,3,9,8,10],['Golden Circle','Jökulsárlón','Reykjavík','Snæfellsnes','Mývatn']],
 ['ID','Azië',2400,1000,28,12,8,[10,9,8,6,10,10,10,10,9,10,9,9],['Borobudur','Komodo','Ubud','Bromo','Raja Ampat']]
];
export const samples = rows.map(([code,region,cost,flight,temp,rain,sun,scores,highlights])=>({code,region,cost,flight,temp,rain,sun,scores:Object.fromEntries(Object.keys(dimensions).map((k,i)=>[k,scores[i] ?? ({wandelen:8,roadtrip:7,eten:8,wellness:5,nachtleven:5,levendig:5}[k] ?? 5)])),highlights,example:true,safety:null,government:null,driving:null}));

export const months = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
// Planning estimates, not measured climate data. Seasonal curves are deliberately labelled.
const seasons = {
 mediterranean: {best:[4,5,6,9,10],temp:[11,12,15,18,22,27,30,30,26,21,16,12],rain:[80,65,55,40,30,15,5,10,35,65,90,95],sun:[4,5,6,7,9,10,11,10,8,6,5,4]},
 tropical: {best:[5,6,7,8,9],temp:[28,28,28,28,28,27,27,27,28,28,28,28],rain:[300,260,210,140,90,65,45,40,65,120,190,270],sun:[5,5,6,7,8,8,9,9,8,7,6,5]},
 winterTropics: {best:[1,2,3,11,12],temp:[26,27,28,29,29,28,28,28,28,27,27,26],rain:[30,25,50,90,170,210,240,260,290,230,100,50],sun:[8,9,9,8,7,6,6,6,5,6,7,8]},
 northern: {best:[6,7,8,9],temp:[-2,-1,3,7,12,16,18,17,12,7,2,-1],rain:[75,65,65,55,60,70,80,90,95,100,90,85],sun:[2,3,4,6,7,8,8,7,5,3,2,1]},
 temperate: {best:[4,5,6,9,10],temp:[4,6,10,15,20,24,27,27,23,17,11,6],rain:[65,60,80,90,105,130,140,125,110,85,75,65],sun:[4,5,6,7,7,6,7,7,6,6,5,4]},
 southern: {best:[1,2,3,11,12],temp:[23,23,21,17,14,11,10,12,15,18,20,22],rain:[35,35,45,65,85,95,90,85,65,50,40,35],sun:[9,9,8,7,6,5,5,6,7,8,9,9]}
};
Object.assign(seasons,{
 desert:{best:[1,2,3,10,11,12],temp:[18,20,24,29,34,38,40,39,36,30,24,19],rain:[12,10,8,5,2,0,0,0,0,2,5,10],sun:[8,9,9,10,11,12,12,11,10,9,8,8]},
 equatorial:{best:[6,7,8,9],temp:[26,26,26,26,26,26,26,26,26,26,26,26],rain:[210,180,230,240,220,170,130,140,180,220,240,230],sun:[5,5,5,5,5,6,6,6,5,5,5,5]},
 highland:{best:[3,4,5,9,10,11],temp:[11,12,15,18,21,22,22,22,20,17,14,11],rain:[25,30,40,50,75,120,180,150,95,50,30,25],sun:[7,7,8,8,8,7,6,6,7,8,8,7]},
 islandSouth:{best:[5,6,7,8,9,10],temp:[28,28,28,27,26,25,24,24,25,26,27,28],rain:[210,220,200,170,130,100,90,85,95,120,150,190],sun:[6,6,6,7,7,7,7,8,8,7,7,6]}
});
const extraIdeas = ['Proef een lokaal gerecht','Bezoek een lokale markt','Maak een stads- of dorpswandeling','Volg een kookworkshop','Zoek een uitzichtpunt voor zonsopkomst','Maak een begeleide natuurwandeling','Bezoek een museum over de regio','Ontdek lokale ambachten','Plan een fotografiewandeling','Bekijk lokale architectuur','Maak een fietstocht waar geschikt','Plan een vrije rustdag','Bezoek een botanische tuin indien aanwezig','Luister naar lokale live muziek','Proef regionale producten','Volg een rondleiding met een lokale gids','Bezoek een historische wijk','Maak een dagtocht met openbaar vervoer','Ontdek een minder druk dorp','Bekijk de zonsondergang','Bezoek een culturele voorstelling','Plan een picknick waar toegestaan','Leer over lokale tradities','Zoek een toegankelijke wandelroute','Verken lokale kunst'];
function ideas(places) { return [...places.map(name=>({name,description:highlightDescriptions[name] || 'Redactionele bezoeksuggestie; specifieke achtergrond en actuele toegankelijkheid nog aanvullen.',kind:'Highlight'})), ...extraIdeas.slice(0,25-places.length).map(name=>({name,description:activityDescriptions[name],kind:'Activiteit — lokaal aanbod controleren'}))]; }
function profile({id,code,name,region,parent,season='temperate',daily=60,room=90,flight=800,scores={},places=[],highlights,driving,description,basis='uitgewerkt'}) {
 const base=samples.find(x=>x.code===parent || x.code===code);
 const calendar=seasons[season];
 return {id,code,name,region,description:description || `Een reis door ${name}, met ruimte voor een combinatie van bezienswaardigheden, lokale cultuur en ontspanning.`,
 scores:{...Object.fromEntries(Object.keys(dimensions).map(k=>[k,5])),...base?.scores,...scores},
 bestMonths:calendar.best,climate:calendar.temp.map((temp,i)=>({temp,low:temp-5,high:temp+5,rain:calendar.rain[i],sun:calendar.sun[i]})),
 pricing:{daily,room,flight},highlights:highlights || ideas(places.length?places:base?.highlights || []),basis,
 driving:driving || 'Regels, rijbewijsvereisten en lokale wegomstandigheden vooraf controleren; geen geverifieerd rijadvies.',
 safety:null,government:null,regime:null,example:true};
}
const regional = [
 {id:'ID-bali',code:'ID',name:'Bali',region:'Azië',season:'tropical',daily:35,room:70,flight:1050,scores:{strand:9,duiken:8,cultuur:9,relax:9,levendig:8},places:['Ubud','Tegalalang','Jatiluwih','Uluwatu','Tanah Lot','Tirta Empul','Besakih','Sidemen','Amed','Tulamben','Munduk','Lovina','Sanur','Seminyak','Nusa Dua','Jimbaran','Batur','West-Bali nationaal park','Bali Museum','Goa Gajah','Taman Ayun','Penglipuran','Tukad Cepung','Sekumpul','Nusa Penida (dagtocht)']},
 {id:'ID-java',code:'ID',name:'Java',region:'Azië',season:'tropical',daily:30,room:55,flight:900,scores:{cultuur:10,historie:10,steden:8,strand:5,duiken:3,relax:5,wandelen:9},places:['Borobudur','Prambanan','Yogyakarta','Kraton Yogyakarta','Taman Sari','Bromo','Ijen','Malang','Surabaya','Jakarta','Kota Tua','Bandung','Bogor','Diengplateau','Solo','Sangiran','Ujung Kulon','Karimunjawa','Pangandaran','Candi Sukuh','Candi Cetho','Sewu','Tumpak Sewu','Baluran','Batikworkshop']},
 {id:'ID-lombok',code:'ID',name:'Lombok & Gili-eilanden',region:'Azië',season:'tropical',daily:32,room:65,flight:1100,scores:{strand:10,duiken:10,steden:3,relax:9,wandelen:9},places:['Rinjani','Senaru','Sembalun','Kuta Lombok','Tanjung Aan','Selong Belanak','Mawun','Senggigi','Gili Air','Gili Meno','Gili Trawangan','Tetebatu','Sade','Sukarara','Banyumulek']},
 {id:'ID-flores',code:'ID',name:'Flores & Komodo',region:'Azië',season:'tropical',daily:55,room:90,flight:1250,scores:{dieren:10,natuur:10,avontuur:10,duiken:10,steden:2,cultuur:8},places:['Labuan Bajo','Komodo nationaal park','Rinca','Padar','Pink Beach','Kelor','Kelimutu','Bajawa','Bena','Wae Rebo','Ruteng','Riung','Maumere','Ende','Larantuka']},
 {id:'ID-raja',code:'ID',name:'Raja Ampat',region:'Azië',season:'winterTropics',daily:65,room:180,flight:1450,scores:{duiken:10,natuur:10,strand:10,dieren:10,steden:1,historie:3,relax:9},places:['Waisai','Waigeo','Misool','Wayag','Piaynemo','Arborek','Mansuar','Kri','Gam','Yenbuba','Sauwandarek','Kabui-baai','Dampierstraat']},
 {id:'US-west',code:'US',name:'Verenigde Staten · westkust',region:'Amerika',season:'temperate',daily:80,room:180,flight:850,scores:{natuur:10,steden:9,roadtrip:10,avontuur:9,cultuur:8},places:['San Francisco','Los Angeles','San Diego','Seattle','Portland','Yosemite','Redwood','Olympic','Mount Rainier','Crater Lake','Big Sur','Monterey','Carmel','Joshua Tree','Death Valley','Sequoia','Kings Canyon','Lake Tahoe','Napa Valley','Sonoma','Santa Barbara','Santa Cruz','Cannon Beach','Columbia River Gorge','Point Reyes']},
 {id:'US-florida',code:'US',name:'Verenigde Staten · Florida',region:'Amerika',season:'winterTropics',daily:75,room:160,flight:750,scores:{strand:9,dieren:9,zwemmen:9,steden:7,relax:8,levendig:9},places:['Miami','South Beach','Everglades','Key West','Florida Keys','Dry Tortugas','Orlando','Kennedy Space Center','St. Augustine','Tampa','St. Petersburg','Clearwater','Sarasota','Sanibel','Naples','Biscayne','Fort Lauderdale','Palm Beach','Daytona Beach','Fort Myers','Amelia Island','Crystal River','Ocala National Forest','Cocoa Beach','Wynwood']},
 {id:'US-east',code:'US',name:'Verenigde Staten · New York & Washington D.C.',region:'Amerika',season:'temperate',daily:85,room:220,flight:650,scores:{steden:10,historie:10,cultuur:10,strand:3,eten:10,natuur:5},places:['Central Park','Metropolitan Museum','Vrijheidsbeeld','Ellis Island','Brooklyn Bridge','High Line','Broadway','Grand Central','MoMA','American Museum of Natural History','Bryant Park','NY Public Library','9/11 Memorial','DUMBO','Williamsburg','National Mall','Lincoln Memorial','Smithsonian American History','National Gallery of Art','Capitool','Georgetown','Arlington','Mount Vernon','Alexandria','Rock Creek Park']},
 {id:'CA-west',code:'CA',name:'West-Canada',region:'Amerika',season:'northern',daily:70,room:155,flight:850,scores:{natuur:10,dieren:10,roadtrip:10,wandelen:10,avontuur:10,steden:6},places:['Vancouver','Stanley Park','Vancouver Island','Victoria','Tofino','Pacific Rim','Whistler','Banff','Lake Louise','Moraine Lake','Jasper','Icefields Parkway','Yoho','Kootenay','Glacier National Park','Revelstoke','Okanagan','Kelowna','Wells Gray','Waterton Lakes','Calgary','Drumheller','Sunshine Coast','Sea to Sky','Gulf Islands']},
 {id:'CA-east',code:'CA',name:'Oost-Canada',region:'Amerika',season:'northern',daily:65,room:145,flight:650,scores:{natuur:9,cultuur:9,historie:8,steden:9,dieren:8,roadtrip:10},places:['Montréal','Québec City','Toronto','Ottawa','Niagara Falls','Algonquin','Thousand Islands','Mont-Tremblant','Saguenay','Tadoussac','Gaspésie','Percé','Fundy','Hopewell Rocks','Halifax','Peggy’s Cove','Lunenburg','Cabot Trail','Prince Edward Island','Charlottetown','Gros Morne','St. John’s','Île d’Orléans','Mauricie','Kejimkujik']},
 {id:'GR-crete',code:'GR',name:'Kreta',region:'Europa',season:'mediterranean',daily:45,room:95,flight:350,scores:{historie:10,strand:9,natuur:9,wandelen:9},places:['Knossos','Heraklion','Chania','Rethymnon','Samariakloof','Balos','Elafonisi','Spinalonga','Agios Nikolaos','Vai','Festos','Gortys','Arkadi','Preveli','Matala','Loutro','Sfakia','Zaros','Psychro','Sitia','Zakros','Ierapetra','Archanes','Aptera','Falassarna']},
 {id:'GR-cyclades',code:'GR',name:'Cycladen · Naxos, Paros & Santorini',region:'Europa',season:'mediterranean',daily:55,room:140,flight:400,scores:{strand:10,relax:9,duiken:7,cultuur:8},places:['Naxos-stad','Portara','Halki','Apiranthos','Agios Prokopios','Plaka','Parikia','Naoussa','Lefkes','Antiparos','Fira','Oia','Akrotiri','Pyrgos','Imerovigli']},
 {id:'GR-rhodes',code:'GR',name:'Rhodos',region:'Europa',season:'mediterranean',daily:45,room:100,flight:350,scores:{historie:10,strand:9,relax:8},places:['Rhodos oude stad','Grootmeesterspaleis','Lindos','Akropolis van Lindos','Kamiros','Prasonisi','Tsambika','Anthony Quinn Bay','Seven Springs','Monolithos','Kritinia','Filerimos','Afandou','Symi (dagtocht)','Embonas']},
 {id:'GR-corfu',code:'GR',name:'Corfu',region:'Europa',season:'mediterranean',daily:45,room:100,flight:320,scores:{bossen:8,natuur:9,strand:9,cultuur:8},places:['Corfu-stad','Oude vesting','Nieuwe vesting','Paleokastritsa','Angelokastro','Achilleion','Kanoni','Pontikonisi','Sidari','Canal d’Amour','Kassiopi','Pantokrator','Agios Gordios','Pelekas','Benitses']},
 {id:'GR-mainland',code:'GR',name:'Griekenland · vasteland',region:'Europa',season:'mediterranean',daily:45,room:85,flight:260,scores:{historie:10,cultuur:10,roadtrip:9,wandelen:9},places:['Athene','Akropolis','Akropolismuseum','Delphi','Meteora','Thessaloniki','Olympia','Mycene','Epidaurus','Nafplio','Monemvasia','Mystras','Mani','Zagori','Vikoskloof','Olympus','Vergina','Pella','Dion','Sounion','Kavala','Ioannina','Volos','Pilion','Korinthe']}
];
const originalDestinations = [
 ...samples.filter(d=>!['GR','ID'].includes(d.code)).map(d=>profile({id:d.code,code:d.code,name:new Intl.DisplayNames(['nl'],{type:'region'}).of(d.code),region:d.region,season:['PT','ES','IT'].includes(d.code)?'mediterranean':['NO','IS'].includes(d.code)?'northern':['TH','CR'].includes(d.code)?'winterTropics':['NZ','ZA'].includes(d.code)?'southern':'temperate',daily:Math.round(d.cost/42*.55),room:Math.round(d.cost/21*.45),flight:d.flight,places:d.highlights})),
 ...regional.filter(d=>d.id!=='GR-cyclades').map(profile),
 ...[
 {id:'GR-naxos',code:'GR',name:'Naxos',region:'Europa',season:'mediterranean',daily:45,room:100,flight:420,scores:{strand:10,relax:9,historie:9,natuur:8},places:['Naxos-stad','Portara','Kastro','Halki','Apiranthos','Filoti','Zas','Agios Prokopios','Agia Anna','Plaka','Mikri Vigla','Apollonas','Kouros van Apollonas','Tempel van Demeter','Alyko']},
 {id:'GR-paros',code:'GR',name:'Paros',region:'Europa',season:'mediterranean',daily:50,room:120,flight:420,scores:{strand:10,relax:9,cultuur:8,levendig:8},places:['Parikia','Naoussa','Lefkes','Panagia Ekatontapiliani','Kolymbithres','Golden Beach','Santa Maria','Piso Livadi','Marpissa','Aliki','Drios','Antiparos (dagtocht)','Byzantijnse route','Marathi','Logaras']},
 {id:'GR-santorini',code:'GR',name:'Santorini',region:'Europa',season:'mediterranean',daily:65,room:190,flight:380,scores:{strand:7,relax:8,historie:9,levendig:9,natuur:8},places:['Fira','Oia','Imerovigli','Akrotiri','Pyrgos','Emporio','Megalochori','Kamari','Perissa','Vlychada','Skaros','Nea Kameni','Thirasia','Prehistorisch museum','Profitis Ilias']}
 ].map(profile)
];
export const dataNote = 'Niet onderbouwde klimaatcurves zijn verwijderd. Daglicht is een astronomische berekening voor een referentieplek, geen zonneschijn. Voor 27 profielen zijn historische ERA5-klimaatberekeningen 2015–2024 op een referentieplek toegevoegd; andere klimaatgegevens en actuele veiligheid ontbreken. ERA5-zonneschijn is een modelschatting, geen lokale meting. Kosten en reistijden zijn modelramingen, interesseprofielen zijn redactionele inschattingen of onbekend. Bronstatus is per onderdeel zichtbaar.';
// Stable practical background; visa/permit rules and current government are not inferred.
export const countryInfo = {
 PT:{currency:'EUR · euro',side:'rechts',institution:'Republiek met president en parlement'},
 ES:{currency:'EUR · euro',side:'rechts',institution:'Parlementaire constitutionele monarchie'},
 IT:{currency:'EUR · euro',side:'rechts',institution:'Parlementaire republiek'},
 GR:{currency:'EUR · euro',side:'rechts',institution:'Parlementaire republiek'},
 NO:{currency:'NOK · Noorse kroon',side:'rechts',institution:'Parlementaire constitutionele monarchie'},
 JP:{currency:'JPY · Japanse yen',side:'links',institution:'Parlementaire constitutionele monarchie'},
 TH:{currency:'THB · Thaise baht',side:'links',institution:'Constitutionele monarchie; dit is geen beoordeling van democratie'},
 CR:{currency:'CRC · Costa Ricaanse colón',side:'rechts',institution:'Presidentiële republiek'},
 NZ:{currency:'NZD · Nieuw-Zeelandse dollar',side:'links',institution:'Parlementaire constitutionele monarchie'},
 ZA:{currency:'ZAR · Zuid-Afrikaanse rand',side:'links',institution:'Republiek met een door het parlement gekozen president'},
 IS:{currency:'ISK · IJslandse kroon',side:'rechts',institution:'Parlementaire republiek'},
 ID:{currency:'IDR · Indonesische roepia',side:'links',institution:'Presidentiële republiek'},
 US:{currency:'USD · Amerikaanse dollar',side:'rechts',institution:'Federale presidentiële republiek'},
 CA:{currency:'CAD · Canadese dollar',side:'rechts',institution:'Federale parlementaire constitutionele monarchie'}
};

const archetypes={
 island:{natuur:8,cultuur:6,historie:4,steden:3,bossen:6,strand:10,duiken:9,zwemmen:10,zon:9,dieren:7,relax:10,avontuur:7,wandelen:6,roadtrip:4,eten:7,wellness:7,nachtleven:4,levendig:4},
 safari:{natuur:10,cultuur:7,historie:5,steden:4,bossen:7,strand:3,duiken:2,zwemmen:4,zon:8,dieren:10,relax:6,avontuur:10,wandelen:7,roadtrip:9,eten:6,wellness:4,nachtleven:3,levendig:3},
 mountain:{natuur:10,cultuur:7,historie:6,steden:4,bossen:8,strand:2,duiken:1,zwemmen:4,zon:5,dieren:7,relax:7,avontuur:10,wandelen:10,roadtrip:9,eten:7,wellness:5,nachtleven:3,levendig:3},
 culture:{natuur:7,cultuur:10,historie:10,steden:9,bossen:5,strand:5,duiken:3,zwemmen:5,zon:6,dieren:4,relax:6,avontuur:6,wandelen:7,roadtrip:8,eten:10,wellness:5,nachtleven:7,levendig:8},
 city:{natuur:4,cultuur:9,historie:7,steden:10,bossen:2,strand:4,duiken:2,zwemmen:5,zon:6,dieren:2,relax:5,avontuur:4,wandelen:6,roadtrip:3,eten:10,wellness:6,nachtleven:9,levendig:10},
 jungle:{natuur:10,cultuur:8,historie:6,steden:5,bossen:10,strand:6,duiken:5,zwemmen:6,zon:6,dieren:10,relax:6,avontuur:10,wandelen:9,roadtrip:6,eten:7,wellness:4,nachtleven:3,levendig:4},
 mixed:{natuur:8,cultuur:8,historie:7,steden:7,bossen:6,strand:6,duiken:4,zwemmen:6,zon:6,dieren:6,relax:7,avontuur:7,wandelen:7,roadtrip:8,eten:8,wellness:5,nachtleven:5,levendig:6}
};
const pricingTiers={low:{daily:30,room:60},mid:{daily:55,room:110},high:{daily:90,room:180}};
const flightByRegion={'Europa':300,'Azië':900,'Afrika':850,'Amerika':950,'Oceanië':1500};
const names=new Intl.DisplayNames(['nl'],{type:'region'});
const baseCodes=new Set(originalDestinations.map(d=>d.code));
const newRegionalCodes=new Set(regionalCatalog.map(d=>d.code));
function broadProfile(row){return profile({id:row.code,code:row.code,name:names.of(row.code),region:row.region,season:row.season,...pricingTiers[row.tier],flight:flightByRegion[row.region],scores:archetypes[row.kind],highlights:row.highlights,basis:'basis',description:`${names.of(row.code)}: een eerste oriëntatie met ${row.highlights.map(h=>h.name).join(', ')}. Dit brede profiel gebruikt een landelijk sjabloon; kies een regio waar beschikbaar voor een gerichtere vergelijking.`});}
const additional=worldCatalog.filter(row=>!baseCodes.has(row.code) && !newRegionalCodes.has(row.code)).map(broadProfile);
const specifics=regionalCatalog.map(row=>{const parent=worldCatalog.find(x=>x.code===row.code);return profile({...row,region:parent.region,...pricingTiers[parent.tier],flight:flightByRegion[parent.region]+(row.id.includes('hawaii')?350:row.id.includes('galapagos')?350:0),scores:archetypes[row.kind],basis:'regio',description:`${row.name}: ${row.highlights.slice(0,3).map(h=>h.name).join(', ')} geven een indruk van deze regio. Klimaat en prijzen zijn globale sjablonen; lokale omstandigheden kunnen verschillen.`});});
const combined=[...originalDestinations,...additional,...specifics];
const regionalCodes=new Set(combined.filter(d=>d.id!==d.code).map(d=>d.code));
export const tripStyles={city:'Stedentrip',roundtrip:'Rondreis',beach:'Strandvakantie',active:'Actieve vakantie',roadtrip:'Roadtrip',safari:'Safari & wildlife',diving:'Duikvakantie',relax:'Rustvakantie'};
function inferStyles(s){const result=[];if(s.steden>=8)result.push('city');if(s.natuur>=7 && s.cultuur>=6)result.push('roundtrip');if(s.strand>=8)result.push('beach');if(s.avontuur>=8 || s.wandelen>=9)result.push('active');if(s.roadtrip>=8)result.push('roadtrip');if(s.dieren>=9)result.push('safari');if(s.duiken>=8)result.push('diving');if(s.relax>=8)result.push('relax');return result.length?result:['roundtrip'];}
export const excludedCountryCodes=['AF','KP','IL'];
const legacyDestinations=combined.filter(d=>!excludedCountryCodes.includes(d.code) && (d.id!==d.code || !regionalCodes.has(d.code))).map(d=>({...d,styles:inferStyles(d.scores)}));
export const destinations=completeCatalog(countryCodes,legacyDestinations,names);
export const coverage={countries:new Set(destinations.map(d=>d.code)).size,profiles:destinations.length,regional:destinations.filter(d=>['region','island'].includes(d.type)).length,cities:destinations.filter(d=>d.type==='city').length};
