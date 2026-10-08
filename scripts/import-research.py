"""Import attributed geography and a historical UNESCO snapshot; no estimated prices/schedules.
Requires optional xlrd for the upstream Excel snapshot. Outputs static application data.
"""
import json, urllib.request, pathlib, hashlib, re, html, datetime, math, unicodedata
ROOT=pathlib.Path(__file__).resolve().parent.parent
CACHE=pathlib.Path('/tmp/vakantie-research');CACHE.mkdir(exist_ok=True)
SOURCES={
 'citiesjson':'https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json',
 'countriesregions':'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/states.json',
 'heritage_xls':'https://raw.githubusercontent.com/simao-g/WorldHeritageApp/main/source_material/whc-sites-2024.xls',
}
def retrieve(key):
 path=CACHE/key
 # --refresh bypasses the local research cache; the bytes/checksum are recorded either way.
 if not path.exists() or '--refresh' in __import__('sys').argv:
  with urllib.request.urlopen(SOURCES[key],timeout=45) as response: path.write_bytes(response.read())
 return path.read_bytes()
def fold(s):return ''.join(c for c in unicodedata.normalize('NFKD',s.casefold()) if not unicodedata.combining(c))
def main():
 import xlrd
 blobs={key:retrieve(key) for key in SOURCES}
 sources={key:{'url':SOURCES[key],'retrieved':datetime.date.today().isoformat(),'sha256':hashlib.sha256(blob).hexdigest(),'period':'2024' if key=='heritage_xls' else 'source snapshot','provider':{'citiesjson':'GeoNames via lutangar/cities.json','countriesregions':'Countries States Cities Database','heritage_xls':'UNESCO 2024 syndication snapshot via WorldHeritageApp'}[key]} for key,blob in blobs.items()}
 sources['heritage_xls']['primary']='https://whc.unesco.org/en/syndication';sources['heritage_xls']['status']='Historical third-party mirror; current official list not reachable in this environment.'
 sheet=xlrd.open_workbook(file_contents=blobs['heritage_xls']).sheet_by_index(0);headers=sheet.row_values(0);sites=[]
 for i in range(1,sheet.nrows):
  r=dict(zip(headers,sheet.row_values(i)));codes=re.findall(r'\b[a-z]{2}\b',str(r['iso_code']).lower());lat=float(r['latitude']) if r['latitude']!='' else None;lon=float(r['longitude']) if r['longitude']!='' else None
  if lat is not None and lon is not None and (not -90<=lat<=90 or not -180<=lon<=180):raise ValueError('Invalid UNESCO coordinates')
  desc=html.unescape(re.sub('<[^>]+>',' ',str(r['short_description_en'])));desc=re.sub(r'\s+',' ',desc).strip()
  # Factual metadata only. Avoid republishing full descriptions from a mirror with unclear text rights.
  if int(r['id_no'])==819: codes=['cw'] # Physical location: Willemstad, not European Netherlands.
  if int(r['id_no'])==266: codes=['pr'] # Physical location: Puerto Rico.
  sites.append({'id':str(int(r['id_no'])),'name':html.unescape(re.sub('<[^>]+>','',r['name_en'])),'codes':[c.upper() for c in codes],'lat':lat,'lon':lon,'category':r['category'],'year':int(r['date_inscribed']),'forestEvidence':bool(re.search(r'\bforest|\brainforest|\bwoodland|\bjungle',desc,re.I)),'tags':[key for key,pattern in {'bossen':r'forest|rainforest|woodland|jungle','dieren':r'wildlife|mammal|bird|turtle|elephant|gorilla|orangutan','strand':r'beach|coastal|coastline','duiken':r'coral|reef'}.items() if re.search(pattern,desc,re.I)],'url':'https://whc.unesco.org/en/list/'+str(int(r['id_no']))+'/'})
 assert len({s['id'] for s in sites})==len(sites)
 (ROOT/'heritage-data.mjs').write_text('export const heritageSites = '+json.dumps(sites,ensure_ascii=False,separators=(',',':'))+';\nexport const researchSources = '+json.dumps(sources,ensure_ascii=False)+';\n')
 # Full geographical index is loaded only in the directory, never required at startup.
 cities=json.loads(blobs['citiesjson']);states=json.loads(blobs['countriesregions']);regions=[];cityrows=[]
 for s in states:
  try:lat=float(s['latitude']);lon=float(s['longitude'])
  except (TypeError,ValueError):continue
  if -90<=lat<=90 and -180<=lon<=180:regions.append([str(s['id']),s['country_code'],(s['translations'].get('nl') if isinstance(s.get('translations'),dict) else None) or s['name'],round(lat,5),round(lon,5),s.get('iso3166_2') or '',s.get('type') or 'region'])
 for i,c in enumerate(cities):
  lat=float(c['lat']);lon=float(c['lng'])
  if -90<=lat<=90 and -180<=lon<=180:cityrows.append([str(i),c['country'],c['name'],lat,lon,c['admin1']])
 (ROOT/'geographic-index.json').write_text(json.dumps({'sources':sources,'regions':regions,'cities':cityrows},ensure_ascii=False,separators=(',',':'))+'\n')
 # Tourism-oriented starting selection: sourced capitals + selected cities and administrative regions.
 import subprocess
 fact=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import('./geography.mjs').then(m=>console.log(JSON.stringify(m.geography)))"],cwd=ROOT,text=True))
 selected=[];used=set()
 city_anchors={('CR', 'San José'): (9.93388, -84.08489), ('VN', 'Hanoi'): (21.0245, 105.84117), ('US', 'Las Vegas'): (36.17497, -115.13722), ('US', 'Boston'): (42.35843, -71.05977), ('US', 'Miami'): (25.77427, -80.19366), ('US', 'San Diego'): (32.71571, -117.16472), ('US', 'Washington'): (38.89511, -77.03637), ('CA', 'Victoria'): (48.4359, -123.35155), ('MX', 'Mérida'): (20.967, -89.62318), ('PE', 'Cusco'): (-13.53188, -71.96701), ('CR', 'La Fortuna'): (10.47089, -84.64535), ('JP', 'Nagasaki'): (32.75, 129.88333), ('ID', 'Surabaya'): (-7.24917, 112.75083), ('ID', 'Bandung'): (-6.92222, 107.60694), ('IN', 'Udaipur'): (24.58584, 73.71346), ('IN', 'Jodhpur'): (26.26841, 73.00594), ('CN', 'Xi’an'): (34.25833, 108.92861), ('CN', 'Lijiang'): (26.86879, 100.22072), ('AU', 'Perth'): (-31.95224, 115.8614)}
 def add_city(code,name):
  matches=[(i,c) for i,c in enumerate(cities) if c['country']==code and fold(c['name'])==fold(name)]
  if not matches:return
  if len(matches)>1:
   anchor=next((point for (cc,nn),point in city_anchors.items() if cc==code and fold(nn)==fold(name)),None)
   if anchor is None:raise ValueError('Ambiguous city requires a verified anchor: '+code+' '+name)
   matches.sort(key=lambda item:(float(item[1]['lat'])-anchor[0])**2+(float(item[1]['lng'])-anchor[1])**2)
   assert abs(float(matches[0][1]['lat'])-anchor[0])<.1 and abs(float(matches[0][1]['lng'])-anchor[1])<.1
  i,c=matches[0];key=(code,fold(c['name']))
  if key in used:return
  used.add(key);selected.append({'id':code+'-city-'+str(i),'code':code,'name':c['name'],'type':'city','parentId':code,'lat':float(c['lat']),'lon':float(c['lng']),'geoId':str(i),'sourceKey':'citiesjson'})
 for code,g in fact.items():
  for name in g['capital']:add_city(code,name)
 popular={
 'US':'Los Angeles|San Francisco|Las Vegas|Seattle|Boston|Chicago|Miami|Orlando|San Diego|Honolulu|New Orleans|New York City|Washington',
 'CA':'Vancouver|Toronto|Québec|Montreal|Calgary|Victoria|Halifax|Ottawa',
 'MX':'Mexico City|Oaxaca|Mérida|Cancún|Guadalajara|San Cristóbal de las Casas',
 'BR':'Rio de Janeiro|São Paulo|Salvador|Manaus|Recife|Fortaleza|Foz do Iguaçu',
 'AR':'Buenos Aires|Mendoza|Salta|Ushuaia|San Carlos de Bariloche|El Calafate',
 'CO':'Bogotá|Cartagena|Medellín|Santa Marta|Cali',
 'PE':'Cusco|Arequipa|Lima|Iquitos|Puno', 'EC':'Quito|Cuenca|Guayaquil',
 'CL':'Santiago|Valparaíso|Puerto Natales|San Pedro de Atacama','CR':'San José|La Fortuna|Liberia',
 'JP':'Tokyo|Kyoto|Osaka|Hiroshima|Nara|Sapporo|Nagasaki|Kanazawa',
 'VN':'Hanoi|Ho Chi Minh City|Hoi An|Huế|Da Nang|Ninh Binh|Sa Pa|Da Lat|Can Tho',
 'TH':'Bangkok|Chiang Mai|Chiang Rai|Phuket|Krabi|Ayutthaya',
 'ID':'Yogyakarta|Surabaya|Jakarta|Bandung|Denpasar|Ubud|Malang',
 'PH':'Manila|Cebu City|Puerto Princesa|Baguio|Davao',
 'MY':'Kuala Lumpur|George Town|Malacca|Kuching|Kota Kinabalu',
 'IN':'Jaipur|Agra|Varanasi|Udaipur|Jodhpur|Mumbai|Kochi|Chennai',
 'CN':'Beijing|Shanghai|Xi’an|Chengdu|Guilin|Kunming|Lijiang',
 'AU':'Sydney|Melbourne|Cairns|Perth|Brisbane|Adelaide|Darwin|Hobart',
 'NZ':'Auckland|Queenstown|Christchurch|Rotorua|Dunedin',
 'ZA':'Cape Town|Johannesburg|Durban|Stellenbosch|Port Elizabeth',
 'MA':'Marrakesh|Fès|Essaouira|Chefchaouen|Casablanca',
 'EG':'Cairo|Luxor|Aswan|Hurghada', 'TZ':'Arusha|Zanzibar',
 'TR':'Istanbul|Antalya|İzmir|Göreme', 'GE':'Tbilisi|Batumi|Kutaisi',
 'GR':'Athens|Thessaloníki|Chania|Rethymno|Rhodes',
 'IT':'Rome|Florence|Venice|Naples|Bologna|Palermo|Verona',
 'ES':'Barcelona|Sevilla|Granada|Valencia|Bilbao|Málaga',
 'PT':'Lisbon|Porto|Funchal|Lagos|Évora','FR':'Paris|Nice|Lyon|Bordeaux|Strasbourg',
 'DE':'Berlin|Munich|Hamburg|Dresden|Cologne','GB':'London|Edinburgh|Bath|York|Liverpool',
 'NO':'Bergen|Tromsø|Trondheim','SE':'Stockholm|Gothenburg','FI':'Helsinki|Rovaniemi',
 }
 for code,names in popular.items():
  for name in names.split('|'):add_city(code,name)
 targets={'US':'California|Florida|New York|Hawaii|Alaska|Utah|Arizona|Washington','CA':'British Columbia|Alberta|Quebec|Ontario|Nova Scotia','AU':'Queensland|Western Australia|Tasmania|Victoria|New South Wales','NZ':'Otago|Canterbury|Auckland|West Coast','ID':'Bali|West Nusa Tenggara|East Nusa Tenggara|Yogyakarta|Central Java|East Java|West Java|North Sumatra|West Sumatra|West Papua|South Sulawesi','TH':'Chiang Mai|Chiang Rai|Phuket|Krabi|Surat Thani','VN':'Quang Binh|Quang Nam|Lao Cai|Ninh Binh|Lam Dong|Ha Giang','MY':'Sabah|Sarawak|Penang','PH':'Palawan|Bohol|Cebu','BR':'Amazonas|Bahia|Pernambuco|Rio de Janeiro|Ceará','AR':'Mendoza|Salta|Santa Cruz|Tierra del Fuego|Río Negro','CL':'Atacama|Los Lagos|Aysén|Magallanes','CO':'Antioquia|Bolívar|Magdalena|Amazonas','EC':'Galápagos|Pichincha','PE':'Cusco|Arequipa|Loreto','ZA':'Western Cape|Eastern Cape|KwaZulu-Natal|Mpumalanga|Limpopo','IT':'Tuscany|Sicily|Sardinia|Veneto|Campania|Lombardy','ES':'Andalusia|Canary Islands|Balearic Islands|Catalonia|Galicia','PT':'Madeira|Azores|Faro','GR':'Crete|South Aegean|Ionian Islands','GB':'Scotland|Wales|Northern Ireland','FR':'Brittany|Corsica|Normandy|Provence-Alpes-Côte d’Azur','JP':'Hokkaidō|Okinawa|Kyoto|Nagano','IN':'Rajasthan|Kerala|Goa|Tamil Nadu','LK':'Central|Southern','NP':'Gandaki','TZ':'Arusha|Kilimanjaro','KE':'Nakuru|Narok|Mombasa','MA':'Marrakesh-Safi|Fès-Meknès','NA':'Erongo|Kunene','BW':'North-West','IS':'Southern Region','NO':'Nordland|Vestland'}
 for s in states:
  code=s['country_code'];wanted={fold(x) for x in targets.get(code,'').split('|')}
  if fold(s['name']) not in wanted:continue
  try:lat=float(s['latitude']);lon=float(s['longitude'])
  except (TypeError,ValueError):continue
  selected.append({'id':code+'-admin-'+str(s['id']),'code':code,'name':(s['translations'].get('nl') if isinstance(s.get('translations'),dict) else None) or s['name'],'type':'region','parentId':code,'lat':lat,'lon':lon,'geoId':str(s['id']),'sourceKey':'countriesregions'})
 (ROOT/'expanded-profiles.mjs').write_text('export const expandedProfiles = '+json.dumps(selected,ensure_ascii=False,separators=(',',':'))+';\n')
 print('Imported',len(sites),'historical UNESCO entries,',len(cityrows),'city locations,',len(regions),'administrative regions; starting selection',len(selected),'profiles.')
if __name__=='__main__':main()
