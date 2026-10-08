"""Conservative dated travel-advice snapshots from the official Dutch ministry pages."""
import json,subprocess,pathlib,urllib.request,urllib.error,concurrent.futures,re,html,datetime,hashlib,unicodedata
root=pathlib.Path(__file__).resolve().parent.parent
countries=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {countryCodes} from './data.mjs';const n=new Intl.DisplayNames(['nl'],{type:'region'});console.log(JSON.stringify(countryCodes.map(code=>({code,name:n.of(code)}))))"],cwd=root,text=True))
aliases={'US':'verenigde-staten-van-amerika','GB':'verenigd-koninkrijk','KR':'zuid-korea','KP':'noord-korea','CZ':'tsjechie','CD':'democratische-republiek-congo','CG':'congo-brazzaville','CI':'ivoorkust','PS':'palestijnse-gebieden','VA':'vaticaanstad','MM':'myanmar','SD':'sudan','SS':'zuid-sudan','UG':'uganda','BY':'belarus-wit-rusland','BS':'bahamas','BN':'brunei-darussalam','HK':'hongkong','MO':'macau','CV':'kaapverdie','SZ':'eswatini','TL':'timor-leste'}
def fetch(c):
 slug=aliases.get(c['code'],''.join(ch for ch in unicodedata.normalize('NFD',c['name'].lower()) if not unicodedata.combining(ch)).replace(' ','-'))
 slug=re.sub(r'[^a-z0-9-]','',slug)
 url='https://www.nederlandwereldwijd.nl/reisadvies/'+slug
 try:
  raw=urllib.request.urlopen(url,timeout=25).read();s=raw.decode();s=re.sub(r'<(script|style)\b[^>]*>.*?</\1>',' ',s,flags=re.S);t=' '.join(html.unescape(re.sub('<[^>]+>',' ',s)).split())
  start=t.index('In het kort');intro=t[start:].split('Let op: E-mail',1)[0][:3500]
  statements=re.findall(r'[^.]*kleurcode[^.]*\.',intro,re.I)
  colors=set(re.findall(r'\b(groen|geel|oranje|rood)\b',' '.join(statements),re.I));colors={s.lower() for s in colors}
  if not colors:raise ValueError('No unambiguous color statement in introduction')
  modified=re.search(r'Laatst gewijzigd op:\s*(\d{2}-\d{2}-\d{4})',t);valid=re.search(r'Nog steeds geldig op:\s*(\d{2}-\d{2}-\d{4})',t)
  return c['code'],dict(name=c['name'],colors=sorted(colors),restricted=bool(colors&{'rood','oranje'}),summary=' '.join(statements).strip(),url=url,retrieved=datetime.date.today().isoformat(),modified=modified.group(1) if modified else None,valid=valid.group(1) if valid else None,sha256=hashlib.sha256(raw).hexdigest())
 except Exception as e:return c['code'],dict(name=c['name'],colors=[],restricted=None,url=url,retrieved=datetime.date.today().isoformat(),error=str(e))
data={}
if '--missing' in __import__('sys').argv and (root/'safety-data.mjs').exists():data=json.loads((root/'safety-data.mjs').read_text().split('=',1)[1].strip().rstrip(';'));countries=[c for c in countries if not data.get(c['code'],{}).get('colors')]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:data.update(dict(pool.map(fetch,countries)))
(root/'safety-data.mjs').write_text('export const safetyData = '+json.dumps(data,ensure_ascii=False)+';\n')
print('Verified:',sum(bool(d['colors']) for d in data.values()),'Restricted:',sum(d['restricted'] is True for d in data.values()))
for c in ['PK','SY','BH','OM','MN','IR','IQ','JO']:print(c,data[c].get('colors'),data[c].get('summary',data[c].get('error')))
