"""Import location-specific 2015–2024 ERA5 monthly summaries; preserve unknowns.
Requires archive-api.open-meteo.com in the environment network policy.
This is reanalysis at reference coordinates, not a national mean or weather forecast.
"""
import calendar, concurrent.futures, datetime, json, math, pathlib, subprocess, sys, urllib.parse, urllib.request, urllib.error
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
    predicate="d.transport && !d.catalogOnly" if '--all' in sys.argv else json.dumps(ids)+".includes(d.id)"
    command="import('./data.mjs').then(x=>console.log(JSON.stringify(x.destinations.filter(d=>"+predicate+").map(d=>({id:d.id,reference:d.climateReference,lat:d.transport.airport.lat,lon:d.transport.airport.lon})))));"
    points=json.loads(subprocess.check_output(['node','--input-type=module','-e',command],cwd=ROOT,text=True))
    imported=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import('./climate-data.mjs').then(x=>console.log(JSON.stringify(x.climateData)))"],cwd=ROOT,text=True))
    groups={}
    for point in points: groups.setdefault((point['lat'],point['lon']),[]).append(point)
    failures=[]; failure_reasons={}; completed=0
    def fetch(group):
        point=group[0]
        query=urllib.parse.urlencode({'latitude':point['lat'],'longitude':point['lon'],'start_date':'2015-01-01','end_date':'2024-12-31','daily':','.join(FIELDS.values()),'models':'era5','timezone':'auto'})
        url='https://archive-api.open-meteo.com/v1/archive?'+query
        with urllib.request.urlopen(url,timeout=45) as response: payload=json.load(response)
        months=summarize(payload)
        if not any(month['temp'] is not None for month in months): raise ValueError('No adequate temperature coverage')
        source={'url':url,'provider':'Open-Meteo Historical Weather API / ERA5','period':'2015–2024','retrieved':datetime.date.today().isoformat(),'method':'Monthly mean daily temperatures; mean monthly precipitation sum; mean daily sunshine_duration in hours. At least 90% valid daily values per field/month; otherwise unknown. Reanalysis at reference coordinates, not country averages.','documentation':'https://open-meteo.com/en/docs/historical-weather-api','license':'CC BY 4.0; Copernicus ERA5 source attribution applies.'}
        return group,months,source
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        futures={pool.submit(fetch,group):group for group in groups.values()}
        for future in concurrent.futures.as_completed(futures):
            try:
                group,months,source=future.result()
                for point in group: imported[point['id']]={'reference':point['reference'],'months':months,'source':source}
                completed+=1
                if completed%10==0: print('Validated reference points:',completed,'of',len(groups),flush=True)
            except Exception as error:
                reason='HTTP '+str(error.code) if isinstance(error,urllib.error.HTTPError) else type(error).__name__
                for point in futures[future]: failure_reasons[point['id']]=reason
                failures.extend(p['id'] for p in futures[future]);print('Unavailable:',[p['id'] for p in futures[future]],reason,flush=True)
                if isinstance(error,urllib.error.HTTPError) and error.code==429:
                    for remaining in futures: remaining.cancel()
                    print('Rate limit reached; pending requests cancelled. Existing data retained.',flush=True)
                    break
    if not completed: raise ValueError('No new reference data imported; existing file retained')
    (ROOT/'climate-import-report.json').write_text(json.dumps({'retrieved':datetime.date.today().isoformat(),'requestedProfiles':len(points),'uniqueReferencePoints':len(groups),'validatedReferencePoints':completed,'unavailableProfiles':failures,'failureReasons':failure_reasons,'retainedClimateProfiles':len(imported)},indent=2)+'\n')
    # Atomic all-or-nothing: failures never replace retained verified data with empty values.
    target=ROOT/'climate-data.mjs'; temporary=ROOT/'climate-data.pending.mjs'
    temporary.write_text('export const climateData = '+json.dumps(imported,ensure_ascii=False,allow_nan=False)+';\n')
    temporary.replace(target)
    print('Saved',len(imported),'reference profiles. Run npm run build next.')
if __name__=='__main__':
    try: main()
    except (urllib.error.URLError,ValueError) as error:
        print('Climate import blocked or invalid; existing data unchanged:',error,file=sys.stderr);sys.exit(1)
