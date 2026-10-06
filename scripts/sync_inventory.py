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


PUBLIC_TARGET=150
CANDIDATE_LIMIT=400

# Historical demand profile derived from BEST CAR STAR sold/shipped data (2024-Sep 2026).
# Slots total 150: 120 core demand-matched listings + 30 rotation/discovery listings.
DEMAND_PROFILE = {
    'Kia All New Sorento': (21, 7021035, 7942730),
    'Kia New Sorento R': (15, 5315000, 6065000),
    'Kia Sorento R': (10, 2965000, 3612500),
    'Hyundai Santa Fe DM': (9, 5265000, 5890000),
    'Kia Sportage R': (9, 3965000, 4465000),
    'Hyundai Grand Starex': (6, 3890000, 4665000),
    'Renault Samsung QM3': (6, 1890000, 2152500),
    'Audi Q5': (5, 8608570, 9199487),
    'Hyundai Maxcruz': (5, 6998620, 8275750),
    'Hyundai Mighty': (5, 6000000, 6550000),
    'Hyundai Santa Fe': (4, 4515000, 5315000),
    'VW Tiguan': (4, 5265000, 5565000),
    'Audi Q7': (3, 4982500, 5273750),
    'Chevrolet Captiva': (3, 2252500, 2602500),
    'Chevrolet Malibu': (3, 1932500, 2152500),
    'Hyundai i30': (3, 3315000, 3590000),
    'Kia Sportage': (3, 5715000, 6115000),
    'BMW X3': (2, 2865000, 3390000),
    'BMW X5': (2, 3415000, 4290000),
    'Chevrolet Cruze': (2, 2000000, 2130000),
    'Chevrolet Orlando': (2, 1415000, 1540000),
    'Hyundai Accent': (2, 1790000, 1902500),
    'Hyundai All New Tucson': (2, 6665000, 7180950),
    'Hyundai Starex': (2, 3335000, 4000000),
    'Hyundai Tucson': (2, 4700000, 7770810),
    'Jeep Wrangler Rubicon': (2, 14240000, 14340000),
    'Kia All New Carnival': (2, 4665000, 5765000),
    'Kia Bongo': (2, 3765000, 4100000),
    'Kia Mohave': (2, 3365000, 3690000),
    'Kia Morning': (2, 1737400, 2115000),
    'Kia Pride': (2, 1945000, 2185000),
    'Kia Soul': (2, 1565000, 2815000),
    'Mini Countryman': (2, 2065000, 2490000),
    'Mini Countryman All4': (2, 3665000, 4365000),
    'Ssangyong Rexton W': (2, 2440000, 2702500),
}

MODEL_SEARCH = ';'.join([
    'all new sorento','new sorento r','sorento r','santa fe dm','sportage r',
    'grand starex','qm3','q5','maxcruz','mighty','santa fe','tiguan','q7',
    'captiva','malibu','i30','sportage','x3','x5','cruze','orlando','accent',
    'all new tucson','starex','tucson','wrangler rubicon','all new carnival',
    'bongo','mohave','morning','pride','soul','countryman','countryman all4',
    'rexton w'
])

def demand_key(car):
    text=(' '.join(str(car.get(k) or '') for k in ('manufacturer','model','badge'))).lower()
    text=re.sub(r'\s+',' ',text)
    rules=[
        ('Kia All New Sorento', ('all new sorento',)),
        ('Kia New Sorento R', ('new sorento r',)),
        ('Kia Sorento R', ('sorento r',)),
        ('Hyundai Santa Fe DM', ('santa fe dm','santafe dm')),
        ('Kia Sportage R', ('sportage r',)),
        ('Hyundai Grand Starex', ('grand starex',)),
        ('Renault Samsung QM3', ('qm3',)),
        ('Audi Q5', ('audi','q5')),
        ('Hyundai Maxcruz', ('maxcruz',)),
        ('Hyundai Mighty', ('mighty',)),
        ('VW Tiguan', ('tiguan',)),
        ('Audi Q7', ('audi','q7')),
        ('Chevrolet Captiva', ('captiva',)),
        ('Chevrolet Malibu', ('malibu',)),
        ('Hyundai i30', ('i30',)),
        ('BMW X3', ('bmw','x3')),
        ('BMW X5', ('bmw','x5')),
        ('Chevrolet Cruze', ('cruze',)),
        ('Chevrolet Orlando', ('orlando',)),
        ('Hyundai Accent', ('accent',)),
        ('Hyundai All New Tucson', ('all new tucson',)),
        ('Jeep Wrangler Rubicon', ('wrangler','rubicon')),
        ('Kia All New Carnival', ('all new carnival',)),
        ('Kia Bongo', ('bongo',)),
        ('Kia Mohave', ('mohave',)),
        ('Kia Morning', ('morning',)),
        ('Kia Pride', ('pride',)),
        ('Kia Soul', ('kia','soul')),
        ('Mini Countryman All4', ('countryman','all4')),
        ('Ssangyong Rexton W', ('rexton w',)),
        ('Mini Countryman', ('countryman',)),
        ('Hyundai Starex', ('starex',)),
        ('Hyundai Tucson', ('tucson',)),
        ('Kia Sportage', ('sportage',)),
        ('Hyundai Santa Fe', ('santa fe',)),
    ]
    for key,tokens in rules:
        if all(token in text for token in tokens):
            return key
    return None

def select_public(cars):
    grouped={key:[] for key in DEMAND_PROFILE}
    leftovers=[]
    for car in cars:
        key=demand_key(car)
        car['_demand_key']=key
        if key in grouped: grouped[key].append(car)
        else: leftovers.append(car)
    selected=[]; used=set()
    for key,(slots,median,p75) in DEMAND_PROFILE.items():
        group=grouped[key]
        def rank(car):
            price=car.get('price_krw') or 0
            mileage=car.get('mileage_km')
            mileage=mileage if isinstance(mileage,(int,float)) else 9999999
            # Historical price bands are a soft ranking signal, never a hard exclusion.
            above=1 if price>p75 else 0
            distance=abs(price-median)/median if median else 0
            return (above,distance,-int(car.get('year') or 0),mileage)
        group.sort(key=rank)
        for car in group[:slots]:
            selected.append(car); used.add(car['id'])
    # Fill any unfilled quota from still-relevant demand models before generic fallback.
    remaining=[c for c in cars if c['id'] not in used]
    remaining.sort(key=lambda car: (
        0 if car.get('_demand_key') in DEMAND_PROFILE else 1,
        list(DEMAND_PROFILE).index(car['_demand_key']) if car.get('_demand_key') in DEMAND_PROFILE else 999,
        -int(car.get('year') or 0),
        car.get('mileage_km') if isinstance(car.get('mileage_km'),(int,float)) else 9999999
    ))
    for car in remaining:
        if len(selected)>=PUBLIC_TARGET: break
        selected.append(car); used.add(car['id'])
    for car in selected: car.pop('_demand_key',None)
    return selected[:PUBLIC_TARGET]

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
    params={'source':'encar,kbc','lang':'en','limit':CANDIDATE_LIMIT,'sort':'newest',
            'model_search':MODEL_SEARCH,
            'exclude_duplicates':'true','exclude_prices':'1111,9999'}
    req=urllib.request.Request('https://api.encarapi.com/api/catalog?'+urlencode(params),
                              headers={'x-api-key':key,'Accept':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=120) as response: data=json.load(response)
    except urllib.error.HTTPError as e:
        raise ValueError('EnCarAPI returned HTTP '+str(e.code)+'; previous snapshot retained') from None
    if not isinstance(data,dict) or not isinstance(data.get('SearchResults'),list):
        raise ValueError('Unexpected catalog response; previous snapshot retained')
    candidates=[]; seen=set()
    for row in data['SearchResults']:
        c=normalize(row)
        if c and c['id'] not in seen:
            seen.add(c['id']); candidates.append(c)
    if not candidates: raise ValueError('No valid listings; previous snapshot retained')
    cars=select_public(candidates)
    if len(cars)<PUBLIC_TARGET:
        print('Demand-matched candidate pool produced',len(cars),'listings',flush=True)
    enrich(cars,key)
    counts={s:sum(c['source']==s for c in cars) for s in ('Encar','KB ChaChaCha')}
    output={'updated_at':datetime.now(timezone.utc).isoformat(),'provider':'EnCarAPI',
            'scope':'Sales-driven public selection based on BEST CAR STAR historical demand','source_counts':counts,'results':cars}
    target=Path('inventory.json'); temp=target.with_suffix('.tmp')
    temp.write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8'); temp.replace(target)
    print('Published listings:',len(cars), 'Sources:',json.dumps(counts))
if __name__=='__main__':
    try: main()
    except Exception as exc:
        print(str(exc) if isinstance(exc,ValueError) else 'Sync failed; previous snapshot retained',file=sys.stderr)
        sys.exit(1)

