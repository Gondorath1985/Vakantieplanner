"""Fill missing reference climates from NASA POWER 2001–2020 normals; no sunshine inference."""
import json,urllib.request,urllib.parse,concurrent.futures,calendar,subprocess,datetime,pathlib,time
root=pathlib.Path(__file__).resolve().parent.parent
existing=json.loads((root/'climate-data.mjs').read_text().split('=',1)[1].strip().rstrip(';'))
profiles=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {destinations} from './data.mjs'; console.log(JSON.stringify(destinations.filter(d=>d.climateStatus==='unknown'&&d.type!=='city').map(d=>({id:d.id,point:d.climatePoint,reference:d.climateReference}))))"],cwd=root))
keys=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']; failures=[]
def fetch(d):
 url='https://power.larc.nasa.gov/api/temporal/climatology/point?'+urllib.parse.urlencode(dict(parameters='T2M,PRECTOTCORR',community='AG',longitude=d['point']['lon'],latitude=d['point']['lat'],format='JSON'))
 try:
  data=json.load(urllib.request.urlopen(url,timeout=40));params=data['properties']['parameter'];units=data['parameters']
  assert units['T2M']['units']=='C' and units['PRECTOTCORR']['units']=='mm/day'
  assert 'January 2001 - December 2020' in data['header']['range']
  def val(k,m):
   v=params[k][m];return None if v==data['header']['fill_value'] else v
  months=[]
  for i,m in enumerate(keys):
   rain=val('PRECTOTCORR',m);days=sum(calendar.monthrange(y,i+1)[1] for y in range(2001,2021))/20
   months.append(dict(temp=val('T2M',m),low=None,high=None,rain=round(rain*days,1) if rain is not None else None,sun=None))
  return d['id'],dict(reference=d['reference'],months=months,source=dict(provider='NASA POWER / MERRA-2',url=url,period='2001–2020',retrieved=datetime.date.today().isoformat(),coordinates=dict(latitude=d['point']['lat'],longitude=d['point']['lon']),method='Monthly climatology; mm/day multiplied by mean calendar month length. Sunshine and average daily minimum/maximum unavailable.',license='NASA open data'))
 except Exception as e:failures.append(dict(id=d['id'],error=str(e)));return None
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for result in pool.map(fetch,profiles):
  if result:existing[result[0]]=result[1]
(root/'climate-data.mjs').write_text('export const climateData = '+json.dumps(existing,ensure_ascii=False)+';\n')
(root/'nasa-import-report.json').write_text(json.dumps(dict(requested=len(profiles),totalReferences=len(existing),failures=failures),indent=2)+'\n')
print(len(existing),'references;',len(failures),'failed')
