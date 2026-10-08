"""Import location-specific 2015–2024 ERA5 monthly summaries; preserve unknowns.
Requires archive-api.open-meteo.com in the environment network policy.
This is reanalysis at reference coordinates, not a national mean or weather forecast.
"""
import time, calendar, concurrent.futures, datetime, json, math, pathlib, subprocess, sys, urllib.parse, urllib.request, urllib.error
ROOT = pathlib.Path(__file__).resolve().parent.parent
FIELDS = {'temp':'temperature_2m_mean','low':'temperature_2m_min','high':'temperature_2m_max','rain':'precipitation_sum','sun':'sunshine_duration'}

def summarize(payload, start_year=2015, end_year=2024):
    daily=payload['daily']; dates=daily['time']
    if len(dates)!=len(set(dates)): raise ValueError('Duplicate daily dates')
    expected_units={'temperature_2m_mean':'°C','temperature_2m_min':'°C','temperature_2m_max':'°C','precipitation_sum':'mm','sunshine_duration':'s'}
    if any(payload.get('daily_units',{}).get(k)!=v for k,v in expected_units.items()): raise ValueError('Unexpected units')
    if any(len(daily.get(k,[]))!=len(dates) for k in FIELDS.values()): raise ValueError('Daily array lengths differ')
    grouped={m:{k:[] for k in FIELDS} for m in range(1,13)}
    for i, text in enumerate(dates):
        date=datetime.date.fromisoformat(text)
        if not start_year<=date.year<=end_year: raise ValueError('Date outside requested years')
        for key, field in FIELDS.items():
            value=daily[field][i]
            if isinstance(value,(float,int)) and math.isfinite(value): grouped[date.month][key].append(value)
    result=[]
    for month in range(1,13):
        expected=sum(calendar.monthrange(y,month)[1] for y in range(start_year,end_year+1)); entry={}
        for key, values in grouped[month].items():
            if len(values)<expected*.9: entry[key]=None; continue
            average=sum(values)/len(values)
            if key=='rain': average*=expected/(end_year-start_year+1)
            if key=='sun': average/=3600
            entry[key]=round(average,1)
        result.append(entry)
    return result

def main():
    ids=['VN-north','VN-central','VN-south','CO-bogota','CO-cartagena','ID-bali','GY','ST']
    predicate="d.climatePoint && !['AQ','BV','HM','TF','GS','UM'].includes(d.code)" if '--all' in sys.argv else json.dumps(ids)+".includes(d.id)"
    if '--countries' in sys.argv: predicate+=' && d.type===\"country\"'
    if '--missing' in sys.argv: predicate+=' && !d.climateSource'
    batch_size=1 if '--gentle' in sys.argv else 10
    command="import('./data.mjs').then(x=>console.log(JSON.stringify(x.destinations.filter(d=>"+predicate+").map(d=>({id:d.id,reference:d.climateReference,...d.climatePoint})))));"
    points=json.loads(subprocess.check_output(['node','--input-type=module','-e',command],cwd=ROOT,text=True))
    imported=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import('./climate-data.mjs').then(x=>console.log(JSON.stringify(x.climateData)))"],cwd=ROOT,text=True))
    groups={}
    for point in points:
        if not isinstance(point.get('lat'),(float,int)) or not isinstance(point.get('lon'),(float,int)): raise ValueError('Invalid coordinates')
        groups.setdefault((point['lat'],point['lon']),[]).append(point)
    failures={}; completed=0; batches=list(groups.values()); rate_limited=False
    for offset in range(0,len(batches),batch_size):
        batch=batches[offset:offset+batch_size]
        query=urllib.parse.urlencode({'latitude':','.join(str(g[0]['lat']) for g in batch),'longitude':','.join(str(g[0]['lon']) for g in batch),'start_date':'2015-01-01','end_date':'2024-12-31','daily':','.join(FIELDS.values()),'models':'era5','timezone':'auto'})
        url='https://archive-api.open-meteo.com/v1/archive?'+query
        try:
            for attempt in range(3):
                try:
                    with urllib.request.urlopen(url,timeout=55) as response: payload=json.load(response)
                    break
                except urllib.error.HTTPError as error:
                    body=error.read(500).decode(errors='replace')
                    if error.code==429 and 'Minutely' in body and attempt<2:
                        print('Provider minute limit: waiting 65 seconds before retrying this batch.',flush=True)
                        time.sleep(65)
                    else:
                        raise ValueError('Provider HTTP '+str(error.code)+': '+body)
            if not isinstance(payload,list): payload=[payload]
            if len(payload)!=len(batch): raise ValueError('Location response count differs')
            for group,record in zip(batch,payload):
                point=group[0]
                # ERA5 grid centers can differ; reject a swapped or unrelated reference location.
                if abs(record['latitude']-point['lat'])>1 or abs((record['longitude']-point['lon']+180)%360-180)>1: raise ValueError('Reference location mismatch')
                months=summarize(record)
                if not any(month['temp'] is not None for month in months): raise ValueError('No adequate temperature coverage')
                source={'url':url,'provider':'Open-Meteo Historical Weather API / ERA5','period':'2015–2024','retrieved':datetime.date.today().isoformat(),'coordinates':{'latitude':point['lat'],'longitude':point['lon']},'gridCoordinates':{'latitude':record['latitude'],'longitude':record['longitude']},'method':'Monthly mean daily temperatures; mean monthly precipitation sum; mean daily sunshine_duration in hours. At least 90% valid daily values per field/month; otherwise unknown. Reanalysis at reference coordinates, not country averages.','documentation':'https://open-meteo.com/en/docs/historical-weather-api','license':'CC BY 4.0; Copernicus ERA5 source attribution applies.'}
                for item in group: imported[item['id']]={'reference':item['reference'],'months':months,'source':source}
                completed+=1
            print('Validated reference points:',completed,'of',len(batches),flush=True)
        except Exception as error:
            reason=('HTTP '+str(error.code)+': '+error.read(500).decode(errors='replace')) if isinstance(error,urllib.error.HTTPError) else type(error).__name__+': '+str(error)
            for group in batch:
                for point in group: failures[point['id']]=reason
            print('Unavailable batch:',offset,reason,flush=True)
            if 'HTTP 429' in reason:
                rate_limited=True
                for group in batches[offset+len(batch):]:
                    for point in group: failures[point['id']]='Not requested: provider rate limit'
                break
        if '--gentle' in sys.argv: time.sleep(3)
    (ROOT/'climate-import-report.json').write_text(json.dumps({'retrieved':datetime.date.today().isoformat(),'requestedProfiles':len(points),'uniqueReferencePoints':len(groups),'validatedReferencePoints':completed,'unavailableProfiles':list(failures),'failureReasons':failures,'rateLimited':rate_limited,'retainedClimateProfiles':len(imported)},indent=2)+'\n')
    if not completed: raise ValueError('No new reference data imported; existing climate file retained')
    target=ROOT/'climate-data.mjs'; temporary=ROOT/'climate-data.pending.mjs'
    temporary.write_text('export const climateData = '+json.dumps(imported,ensure_ascii=False,allow_nan=False)+';\n')
    temporary.replace(target)
    print('Saved',len(imported),'reference profiles. Run npm run build next.')
if __name__=='__main__':
    try: main()
    except (urllib.error.URLError,ValueError) as error:
        print('Climate import blocked or invalid; existing data unchanged:',error,file=sys.stderr);sys.exit(1)
