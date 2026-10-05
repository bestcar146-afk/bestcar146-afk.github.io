"""Publish a bounded, public vehicle selection. Credentials stay in Actions."""
import json, os, re, sys, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode, urlparse

def photo_url(value, source):
    if isinstance(value, dict): value = value.get('location', '')
    if not isinstance(value, str): return ''
    if source == 'encar' and value.startswith('/carpicture'):
        value = 'https://ci.encar.com' + value
    return value if value.startswith('https://') else ''

def normalize(row):
    source = row.get('Source')
    ident = str(row.get('Id', ''))
    if source not in ('encar', 'kbc'): return None
    if not re.fullmatch(r'\d+' if source == 'encar' else r'kbc:\d+', ident): return None
    price = row.get('Price')
    if not isinstance(price, (float, int)) or isinstance(price,bool) or price <= 0 or price in (1111,9999): return None
    if row.get('IsDuplicate'): return None
    year = int(str(row.get('Year', '0'))[:4])
    if not 1950 <= year <= datetime.now().year+2: return None
    if not row.get('Manufacturer') or not row.get('Model'): return None
    photos = list(dict.fromkeys(filter(None, (photo_url(p,source) for p in row.get('Photos', [])))))
    url = row.get('Url', '') if source == 'kbc' else 'https://fem.encar.com/cars/detail/'+ident
    if not url.startswith('https://'): url = ''
    return {'id':ident, 'source':'Encar' if source=='encar' else 'KB ChaChaCha',
            'manufacturer':row['Manufacturer'], 'model':row['Model'],
            'badge':' '.join(str(row.get(k) or '') for k in ('Badge','BadgeDetail')).strip(),
            'year':year,'mileage_km':row.get('Mileage'), 'price_krw':round(price*10000),
            'fuel_type':row.get('FuelType') or '—', 'transmission':row.get('Transmission') or '—',
            'color':row.get('Color') or '—','location':row.get('OfficeCityState') or '—',
            'photos':photos,'listing_url':url}

def scalar(v):
    return v if isinstance(v,(str,int,float,bool)) else None

def select_fields(obj, fields):
    if not isinstance(obj,dict): return None
    return {k:scalar(obj.get(k)) for k in fields}

def enrich(cars,key):
    now=datetime.now(timezone.utc)
    try: old={x['id']:x for x in json.loads(Path('inventory.json').read_text())['results']}
    except (OSError,ValueError,KeyError): old={}
    needed=[]
    for car in cars:
        prior=old.get(car['id'],{})
        try: fresh=(now-datetime.fromisoformat(prior['details']['checked_at'])).total_seconds()<86400
        except (KeyError,ValueError,TypeError): fresh=False
        if fresh:
            car['details']=prior['details']
        else: needed.append(car)
    def bulk(kind,ids):
        if not ids:return {}
        req=urllib.request.Request('https://api.encarapi.com/api/'+kind+'/bulk?lang=en',
            data=json.dumps({'ids':ids}).encode(),headers={'x-api-key':key,'Content-Type':'application/json','Accept':'application/json'})
        try:
            with urllib.request.urlopen(req,timeout=180) as r: data=json.load(r)
            results=data.get('results')
            if not isinstance(results,dict): raise ValueError('Unexpected bulk response')
            print(kind,'details received',len(results),flush=True)
            return results
        except (urllib.error.URLError,TimeoutError,ValueError):
            print(kind,'details unavailable; fields remain explicitly unknown',flush=True)
            return {}
    ids=[c['id'] for c in needed]
    vehicles=bulk('vehicle',ids)
    eids=[c['id'] for c in needed if c['source']=='Encar']
    inspections=bulk('inspection',eids)
    records=bulk('record',eids)
    for car in needed:
        ident=car['id'];v=vehicles.get(ident)
        if not isinstance(v,dict):continue
        spec=v.get('spec') or {}; cat=v.get('category') or {}; hist=v.get('History') or {}
        d={'checked_at':now.isoformat(),'spec':{},'photos':[]}
        mapping={'transmission':spec.get('transmissionName') or v.get('Transmission'),
                 'engine_cc':spec.get('displacement') or hist.get('displacementCc'),
                 'color':spec.get('colorName') or v.get('Color'),
                 'seats':spec.get('seatCount') or v.get('SeatCount'),
                 'power_ps':spec.get('powerPs'),'body':spec.get('bodyName'),
                 'drive':spec.get('drivetrain') or spec.get('driveType'),
                 'registration':cat.get('yearMonth')}
        d['spec']={k:scalar(val) for k,val in mapping.items()}
        # Drivetrain may be stated explicitly in the translated badge, never inferred from model.
        if not d['spec']['drive']:
            match=re.search(r'\b(2WD|4WD|AWD|FWD|RWD)\b',car.get('badge',''),re.I)
            if match:d['spec']['drive']=match.group().upper();d['drive_basis']='listing badge'
        for p in v.get('photos',v.get('Photos',[])) or []:
            u=p.get('path',p.get('location','')) if isinstance(p,dict) else p
            u=photo_url(u,'encar' if car['source']=='Encar' else 'kbc')
            if u and u not in d['photos']:d['photos'].append(u)
        d['inspection']=None
        ins=inspections.get(ident)
        if isinstance(ins,dict) and isinstance(ins.get('master'),dict):
            master=ins['master']
            d['inspection']=select_fields(master,['accdient','simpleRepair','registrationDate'])
        d['insurance']=select_fields(records.get(ident),['accidentCnt','myAccidentCnt','otherAccidentCnt','myAccidentCost','otherAccidentCost','ownerChangeCnt','totalLossCnt','floodTotalLossCnt','floodPartLossCnt','robberCnt','regDate'])
        d['kb_history']=select_fields(hist,['totalLoss','floodDamage','commercialUse','ownershipChanges']) if hist else None
        car['details']=d
    print('Vehicles with cached detail:',sum('details' in c for c in cars),flush=True)

def main():
    key=os.environ.get('ENCARAPI_KEY','').strip()
    if not key: raise ValueError('ENCARAPI_KEY repository secret is missing')
    params={'source':'encar,kbc','lang':'en','limit':100,'sort':'newest',
            'exclude_duplicates':'true','exclude_prices':'1111,9999'}
    req=urllib.request.Request('https://api.encarapi.com/api/catalog?'+urlencode(params),
                              headers={'x-api-key':key,'Accept':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=120) as response: data=json.load(response)
    except urllib.error.HTTPError as e:
        raise ValueError('EnCarAPI returned HTTP '+str(e.code)+'; previous snapshot retained') from None
    if not isinstance(data,dict) or not isinstance(data.get('SearchResults'),list):
        raise ValueError('Unexpected catalog response; previous snapshot retained')
    cars=[]; seen=set()
    for row in data['SearchResults']:
        c=normalize(row)
        if c and c['id'] not in seen:
            seen.add(c['id']); cars.append(c)
    if not cars: raise ValueError('No valid listings; previous snapshot retained')
    enrich(cars,key)
    counts={s:sum(c['source']==s for c in cars) for s in ('Encar','KB ChaChaCha')}
    output={'updated_at':datetime.now(timezone.utc).isoformat(),'provider':'EnCarAPI',
            'scope':'Latest combined selection, not the full market','source_counts':counts,'results':cars}
    target=Path('inventory.json'); temp=target.with_suffix('.tmp')
    temp.write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8'); temp.replace(target)
    print('Published listings:',len(cars), 'Sources:',json.dumps(counts))
if __name__=='__main__':
    try: main()
    except Exception as exc:
        print(str(exc) if isinstance(exc,ValueError) else 'Sync failed; previous snapshot retained',file=sys.stderr)
        sys.exit(1)

