import {gateways,referenceAirports} from './geography.mjs';
const regionGateways={'ID-bali':'DPS','ID-java':'JOG','ID-lombok':'LOP','ID-flores':'LBJ','ID-raja':'SOQ','US-west':'SFO','US-florida':'MIA','US-east':'JFK','CA-west':'YVR','CA-east':'YUL','GR-crete':'HER','GR-rhodes':'RHO','GR-corfu':'CFU','GR-mainland':'ATH','GR-naxos':'JNX','GR-paros':'PAS','GR-santorini':'JTR','US-hawaii-oahu':'HNL','US-hawaii-maui':'OGG','US-hawaii-kauai':'LIH','US-hawaii-big':'KOA','EC-mainland':'UIO','EC-galapagos':'GPS','VN-north':'HAN','VN-central':'DAD','VN-south':'SGN','AR-patagonia':'FTE','AR-north':'SLA','AR-buenos':'EZE','BR-southeast':'GIG','BR-amazon':'MAO','BR-northeast':'FOR','PH-palawan':'PPS','PH-visayas':'CEB','PH-luzon':'MNL','CK-rarotonga':'RAR','CK-aitutaki':'AIT','SC-mahe':'SEZ','SC-praslin':'PRI','SC-la-digue':'PRI','ID-gili-air':'LOP','ID-gili-meno':'LOP','ID-gili-trawangan':'LOP','ID-komodo':'LBJ'};
Object.assign(regionGateways,{'VN-hanoi':'HAN','VN-hoian':'DAD','VN-saigon':'SGN','AR-buenos-city':'EZE','BR-rio-city':'GIG','CO-bogota':'BOG','CO-cartagena':'CTG','GY-georgetown':'GEO','ST-city':'TMS','US-newyork':'JFK','US-washington':'IAD','CA-montreal':'YUL','JP-tokyo':'NRT','JP-kyoto':'KIX','TH-bangkok':'BKK','PT-lisbon':'LIS','ES-barcelona':'BCN','FR-paris':'CDG','IT-rome':'FCO'});
const boatRoutes={
 'ID-raja':{maxMinutes:150,range:'circa 2–2,5 uur',note:'Routeconcept Sorong → Waisai per veerboot; naar andere eilanden kan nog meer varen nodig zijn.'},
 'SC-la-digue':{maxMinutes:30,range:'circa 15–30 min',note:'Praslin → La Digue per veerboot. Overtocht en zeegang verschillen per afvaart.'},
 'EC-galapagos':{maxMinutes:10,range:'circa 5–10 min',note:'Routeconcept vliegen naar Baltra, korte veerboot naar Santa Cruz en verder over land. Eilandhoppen en excursies kunnen veel langere bootritten vereisen.'},
 'ID-gili-air':{maxMinutes:20,range:'circa 10–20 min',note:'Vliegen naar Lombok, rijden naar Bangsal en korte overtocht naar Gili Air.'},
 'ID-gili-meno':{maxMinutes:25,range:'circa 15–25 min',note:'Vliegen naar Lombok, rijden naar Bangsal en overtocht naar Gili Meno.'},
 'ID-gili-trawangan':{maxMinutes:35,range:'circa 20–35 min',note:'Vliegen naar Lombok, rijden naar Bangsal en overtocht naar Gili Trawangan.'},
 'ID-komodo':{maxMinutes:180,range:'circa 1–3 uur',note:'De gebruikelijke excursieroute vertrekt per boot vanuit Labuan Bajo. Dit is geen korte strandtransfer.'}
};
export function distanceKm(a,b){const rad=x=>x*Math.PI/180;const lat=rad(b.lat-a.lat),lon=rad(b.lon-a.lon);const h=Math.sin(lat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(lon/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
export function travelConcept(d){
 const airport=referenceAirports[regionGateways[d.id]]||gateways[d.code];if(!airport)return null;
 const amsterdam=referenceAirports.AMS,airborne=distanceKm(amsterdam,airport)/800+.75;
 const flightMin=Math.round(airborne*10)/10,flightMax=Math.round((airborne*1.15+1)*10)/10;
 const boat=boatRoutes[d.id]||{maxMinutes:0,range:'geen noodzakelijke boot in dit routeconcept',note:`Routeconcept via ${airport.city}: aankomst per vliegtuig en verder over land. Eventuele eilandexcursies zijn niet inbegrepen.`};
 return {airport,flightMin,flightMax,totalMin:Math.round(flightMin+3+boat.maxMinutes/60),totalMax:Math.round(flightMax+7+boat.maxMinutes/60),boat,status:'model',note:'Indicatief afstandsmodel vanaf Amsterdam, geen actuele vluchtroute. Overstappen, wachttijd en transfers kunnen afwijken; controleer de boekbare route.'};
}
export function daylightHours(latitude,month){
 const date=new Date(Date.UTC(2024,month-1,15)),day=Math.round((date-Date.UTC(2024,0,0))/86400000);
 const dec=23.44*Math.sin(2*Math.PI*(284+day)/366)*Math.PI/180,lat=latitude*Math.PI/180;
 const cos=-Math.tan(lat)*Math.tan(dec);
 return Math.round((cos<=-1?24:cos>=1?0:24/Math.PI*Math.acos(cos))*10)/10;
}
