import {gateways,referenceAirports} from './geography.6e255878cff0.mjs';
const regionGateways={'ID-bali':'DPS','ID-java':'JOG','ID-lombok':'LOP','ID-flores':'LBJ','ID-raja':'SOQ','US-west':'SFO','US-florida':'MIA','US-east':'JFK','CA-west':'YVR','CA-east':'YUL','GR-crete':'HER','GR-rhodes':'RHO','GR-corfu':'CFU','GR-mainland':'ATH','GR-naxos':'JNX','GR-paros':'PAS','GR-santorini':'JTR','US-hawaii-oahu':'HNL','US-hawaii-maui':'OGG','US-hawaii-kauai':'LIH','US-hawaii-big':'KOA','EC-mainland':'UIO','EC-galapagos':'GPS','VN-north':'HAN','VN-central':'DAD','VN-south':'SGN','AR-patagonia':'FTE','AR-north':'SLA','AR-buenos':'EZE','BR-southeast':'GIG','BR-amazon':'MAO','BR-northeast':'FOR','PH-palawan':'PPS','PH-visayas':'CEB','PH-luzon':'MNL','CK-rarotonga':'RAR','CK-aitutaki':'AIT','SC-mahe':'SEZ','SC-praslin':'PRI','SC-la-digue':'PRI','ID-gili-air':'LOP','ID-gili-meno':'LOP','ID-gili-trawangan':'LOP','ID-komodo':'LBJ'};
Object.assign(regionGateways,{'VN-hanoi':'HAN','VN-hoian':'DAD','VN-saigon':'SGN','AR-buenos-city':'EZE','BR-rio-city':'GIG','CO-bogota':'BOG','CO-cartagena':'CTG','GY-georgetown':'GEO','ST-city':'TMS','US-newyork':'JFK','US-washington':'IAD','CA-montreal':'YUL','JP-tokyo':'NRT','JP-kyoto':'KIX','TH-bangkok':'BKK','PT-lisbon':'LIS','ES-barcelona':'BCN','FR-paris':'CDG','IT-rome':'FCO'});
export function distanceKm(a,b){const rad=x=>x*Math.PI/180;const lat=rad(b.lat-a.lat),lon=rad(b.lon-a.lon);const h=Math.sin(lat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(lon/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
export function gatewayFor(d){return referenceAirports[regionGateways[d.id]]||gateways[d.code]||null;}
export function travelConcept(){return null;}
export function daylightHours(latitude,month){
 const date=new Date(Date.UTC(2024,month-1,15)),day=Math.round((date-Date.UTC(2024,0,0))/86400000);
 const dec=23.44*Math.sin(2*Math.PI*(284+day)/366)*Math.PI/180,lat=latitude*Math.PI/180;
 const cos=-Math.tan(lat)*Math.tan(dec);
 return Math.round((cos<=-1?24:cos>=1?0:24/Math.PI*Math.acos(cos))*10)/10;
}
