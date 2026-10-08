export const dimensions = {natuur:'Natuur & landschappen',cultuur:'Cultuur',historie:'Historie',steden:'Steden & stedentrips',bossen:'Jungle & bossen',strand:'Strand & zee',duiken:'Duiken',zwemmen:'Zwemmen',zon:'Zonnen',dieren:'Dieren',relax:'Rust & ontspanning',avontuur:'Avontuur'};
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
export const samples = rows.map(([code,region,cost,flight,temp,rain,sun,scores,highlights])=>({code,region,cost,flight,temp,rain,sun,scores:Object.fromEntries(Object.keys(dimensions).map((k,i)=>[k,scores[i]])),highlights,example:true,safety:null,government:null,driving:null}));
