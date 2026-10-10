"""Publish a bounded, public vehicle selection. Credentials stay in Actions."""
import json, os, re, sys, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode, urlparse

def photo_url(value, source):
    if isinstance(value, dict):
        value = value.get('location') or value.get('path') or value.get('url') or value.get('src') or ''
    if not isinstance(value, str): return ''
    value=value.strip().replace('\\/','/')
    if not value: return ''
    if value.startswith('//'): value='https:'+value
    if value.startswith('http://'): value='https://'+value[7:]
    if source == 'encar':
        if value.startswith('/carpicture'): value='https://ci.encar.com'+value
        elif value.startswith('carpicture/'): value='https://ci.encar.com/'+value
    if source == 'kbc':
        if value.startswith('/IMG/'): value='https://img.kbchachacha.com'+value
        elif value.startswith('IMG/'): value='https://img.kbchachacha.com/'+value
    if not value.startswith('https://'): return ''
    low=value.lower()
    if source == 'kbc':
        if 'img.kbchachacha.com/' in low: return value
        return value if re.search(r'\.(?:jpe?g|png|webp)(?:\?|$)',low) else ''
    if source == 'encar':
        if 'ci.encar.com/' in low or '/carpicture/' in low: return value
        return value if re.search(r'\.(?:jpe?g|png|webp)(?:\?|$)',low) else ''
    return value if re.search(r'\.(?:jpe?g|png|webp)(?:\?|$)',low) else ''

def extract_photos(obj, source):
    found=[]
    def walk(value, key=''):
        if isinstance(value, dict):
            for k,v in value.items():
                walk(v,str(k).lower())
        elif isinstance(value, (list,tuple)):
            for v in value: walk(v,key)
        elif isinstance(value, str):
            likely_key=any(x in key for x in ('photo','image','img','picture','thumb','path','url','src'))
            likely_url=('encar.com' in value.lower() or 'kbchachacha.com' in value.lower() or
                        re.search(r'\.(?:jpe?g|png|webp)(?:\?|$)',value.lower()))
            if likely_key or likely_url:
                u=photo_url(value,source)
                if u and u not in found: found.append(u)
    walk(obj)
    return found

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
    for u in extract_photos(row,source):
        if u not in photos: photos.append(u)
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

# Historical demand + price profile derived directly from BEST CAR STAR sold/shipped Excel data (2024-Sep 2026).
# The sold file is itself price-filtered, so these price levels represent accepted bargain/acquisition levels,
# not the Korean market average. Slots total 150 as a target capacity; actual public count may be lower.
DEMAND_PROFILE = {
    'Kia New Sorento R': (16, 4702500, 6165000),
    'Kia All New Sorento': (16, 5965000, 7899040),
    'Kia Sorento R': (10, 2565000, 3588750),
    'Hyundai Santa Fe DM': (10, 4132500, 5715000),
    'Kia Sportage R': (9, 3215000, 4465000),
    'Hyundai Grand Starex': (7, 3461250, 4665000),
    'Kia All New Carnival': (7, 4315000, 6052500),
    'Audi Q5': (5, 6373750, 9199488),
    'Hyundai All New Tucson': (5, 6302500, 7699285),
    'Hyundai Maxcruz': (5, 6452500, 8275750),
    'Hyundai Mighty': (4, 6000000, 6900000),
    'Ssangyong Rexton W': (4, 1865000, 2677500),
    'VW Tiguan': (4, 4616250, 5565000),
    'Chevrolet Malibu': (4, 1777500, 2152500),
    'Kia Bongo': (3, 2765000, 4100000),
    'Renault Samsung QM3': (3, 1715000, 2015000),
    'Audi Q7': (3, 4427500, 5273750),
    'Hyundai i30': (3, 2736250, 3590000),
    'Chevrolet Captiva': (3, 1803750, 2602500),
    'Kia Morning': (3, 1325100, 2115000),
    'BMW X3': (3, 2640000, 3390000),
    'Mini Countryman All4': (3, 3390000, 5115000),
    'Jeep Wrangler Rubicon': (3, 13438630, 14340000),
    'BMW X6': (3, 7000000, 7591290),
    'Kia Sportage': (3, 5715000, 6915000),
    'Chevrolet Cruze': (2, 1500000, 2130000),
    'Chevrolet Orlando': (2, 1290000, 1540000),
    'Kia Mohave': (2, 3215000, 3690000),
    'Kia Soul': (2, 1502500, 3146250),
    'Kia Pride': (2, 1900000, 2185000),
    'Hyundai Tucson': (2, 3015000, 3200000),
    'Hyundai Starex': (2, 2552500, 4000000),
    'Chevrolet Spark': (2, 1015000, 1215000),
    'Hyundai Terracan': (2, 2925000, 4450000),
    'Mini Countryman': (2, 1990000, 2490000),
    'BMW X5': (2, 2740000, 4290000),
    'KGM Korando Turismo': (2, 1615000, 2252500),
    'Hyundai Accent': (2, 1627500, 1902500),
    'Hyundai Santa Fe': (2, 4940000, 5690000),
    'Jeep Wrangler': (1, 17500000, 17500000),
    'VW Touareg': (1, 9518750, 10156250),
    'VW Golf': (1, 3752500, 4315000),
    'Porsche Cayenne': (1, 11275000, 13650000),
    'Hyundai Galloper': (1, 4425000, 4700000),
    'Ssangyong Korando': (1, 1952500, 2277500),
}

RISING_PRICE_MODELS={'Audi Q5','Audi Q7','Chevrolet Cruze','Kia Sportage','Hyundai Starex'}
STABLE_PRICE_MODELS={'Hyundai Mighty','Kia Pride'}
LIMITED_HISTORY_MODELS={'Renault Samsung QM3','Chevrolet Orlando','Hyundai Accent','Hyundai All New Tucson',
                        'Jeep Wrangler Rubicon','Kia All New Carnival','Kia Mohave','Kia Soul'}

def price_stretch_multiplier(key):
    if key in RISING_PRICE_MODELS: return 1.30
    if key in STABLE_PRICE_MODELS or key in LIMITED_HISTORY_MODELS: return 1.25
    return 1.20

DEMAND_2026 = {
    'Kia New Sorento R': 49,
    'Kia All New Sorento': 48,
    'Kia Sorento R': 31,
    'Hyundai Santa Fe DM': 27,
    'Kia Sportage R': 23,
    'Hyundai Grand Starex': 18,
    'Kia All New Carnival': 17,
    'Audi Q5': 14,
    'Hyundai All New Tucson': 13,
    'Hyundai Maxcruz': 12,
    'Hyundai Mighty': 11,
    'Ssangyong Rexton W': 10,
    'VW Tiguan': 10,
    'Chevrolet Malibu': 10,
    'Kia Bongo': 9,
    'Renault Samsung QM3': 8,
    'Audi Q7': 8,
    'Hyundai i30': 8,
    'Chevrolet Captiva': 8,
    'Mini Countryman All4': 8,
    'Kia Morning': 7,
    'BMW X3': 7,
    'Kia Pride': 6,
    'KGM Korando Turismo': 6,
    'Jeep Wrangler Rubicon': 5,
    'Hyundai Tucson': 5,
    'Chevrolet Cruze': 5,
    'BMW X6': 5,
    'BMW X5': 4,
    'Hyundai Accent': 4,
    'Hyundai Starex': 4,
    'Kia Sportage': 4,
    'Chevrolet Spark': 4,
    'Hyundai Terracan': 4,
    'Chevrolet Orlando': 3,
    'Kia Mohave': 3,
    'Kia Soul': 3,
    'Mini Countryman': 3,
    'VW Golf': 3,
    'Porsche Cayenne': 3,
    'Ssangyong Korando': 2,
    'VW Touareg': 2,
    'Hyundai Santa Fe': 2,
    'Hyundai Galloper': 2,
    'Jeep Wrangler': 1,
}

YEAR_BANDS = {
    'Kia New Sorento R': (2013, 2014),
    'Kia All New Sorento': (2015, 2017),
    'Kia Sorento R': (2010, 2012),
    'Hyundai Santa Fe DM': (2013, 2015),
    'Kia Sportage R': (2011, 2014),
    'Hyundai Grand Starex': (2010, 2016),
    'Kia All New Carnival': (2015, 2018),
    'Audi Q5': (2011, 2016),
    'Hyundai All New Tucson': (2016, 2018),
    'Hyundai Maxcruz': (2014, 2016),
    'Hyundai Mighty': (2005, 2015),
    'Ssangyong Rexton W': (2013, 2017),
    'VW Tiguan': (2012, 2016),
    'Chevrolet Malibu': (2012, 2016),
    'Kia Bongo': (2007, 2017),
    'Renault Samsung QM3': (2014, 2016),
    'Audi Q7': (2008, 2016),
    'Hyundai i30': (2011, 2015),
    'Chevrolet Captiva': (2011, 2016),
    'Kia Morning': (2009, 2015),
    'BMW X3': (2010, 2015),
    'Mini Countryman All4': (2011, 2017),
    'Jeep Wrangler Rubicon': (2011, 2015),
    'BMW X6': (2009, 2015),
    'Kia Sportage': (2012, 2017),
    'Chevrolet Cruze': (2011, 2015),
    'Chevrolet Orlando': (2012, 2015),
    'Kia Mohave': (2009, 2016),
    'Kia Soul': (2010, 2015),
    'Kia Pride': (2006, 2013),
    'Hyundai Tucson': (2009, 2014),
    'Hyundai Starex': (2006, 2013),
    'Chevrolet Spark': (2011, 2016),
    'Hyundai Terracan': (2001, 2007),
    'Mini Countryman': (2011, 2016),
    'BMW X5': (2008, 2014),
    'KGM Korando Turismo': (2013, 2018),
    'Hyundai Accent': (2011, 2016),
    'Hyundai Santa Fe': (2010, 2017),
    'Jeep Wrangler': (2010, 2015),
    'VW Touareg': (2010, 2015),
    'VW Golf': (2010, 2016),
    'Porsche Cayenne': (2010, 2015),
    'Hyundai Galloper': (1992, 2003),
    'Ssangyong Korando': (2011, 2017),
}

TARGET_SEARCHES = [
    ('sorento',100),('santa fe',70),('sportage',70),('starex',60),('carnival',60),
    ('tucson',60),('q5',40),('maxcruz',40),('mighty',40),('rexton',40),
    ('tiguan',35),('malibu',35),('bongo',35),('qm3',35),('q7',35),
    ('i30',30),('captiva',30),('morning',30),('x3',30),('wrangler',30),
    ('countryman',35),('cruze',30),('x6',30),('x5',30),('orlando',25),
    ('mohave',25),('soul',25),('pride',25),('spark',25),('terracan',25),
    ('korando turismo',25),('accent',25),('golf',20),('touareg',20),('cayenne',20)
]

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
        ('BMW X6', ('bmw','x6')),
        ('BMW X5', ('bmw','x5')),
        ('Chevrolet Cruze', ('cruze',)),
        ('Chevrolet Orlando', ('orlando',)),
        ('Hyundai Accent', ('accent',)),
        ('Hyundai Terracan', ('terracan',)),
        ('Hyundai All New Tucson', ('all new tucson',)),
        ('Jeep Wrangler Rubicon', ('wrangler','rubicon')),
        ('Kia All New Carnival', ('all new carnival',)),
        ('Kia Bongo', ('bongo',)),
        ('Kia Mohave', ('mohave',)),
        ('Kia Morning', ('morning',)),
        ('Chevrolet Spark', ('spark',)),
        ('Kia Morning', ('picanto',)),
        ('Kia Pride', ('pride',)),
        ('Kia Soul', ('kia','soul')),
        ('Mini Countryman All4', ('countryman','all4')),
        ('KGM Korando Turismo', ('korando','turismo')),
        ('KGM Korando Turismo', ('grand','turismo')),
        ('Porsche Cayenne', ('cayenne',)),
        ('VW Touareg', ('touareg',)),
        ('VW Golf', ('golf',)),
        ('Hyundai Galloper', ('galloper',)),
        ('Hyundai Galloper', ('galoper',)),
        ('Jeep Wrangler', ('wrangler',)),
        ('Ssangyong Rexton W', ('rexton w',)),
        ('Ssangyong Korando', ('korando',)),
        ('Mini Countryman', ('countryman',)),
        ('Hyundai Starex', ('starex',)),
        ('Hyundai Tucson', ('tucson',)),
        ('Kia Sportage', ('sportage',)),
        ('Hyundai Santa Fe', ('santa fe',)),
        ('Hyundai Santa Fe', ('santafe',)),
    ]
    for key,tokens in rules:
        if all(token in text for token in tokens):
            return key
    return None

def select_public(cars):
    grouped={key:[] for key in DEMAND_PROFILE}
    rejected_expensive=0
    for car in cars:
        key=demand_key(car)
        car['_demand_key']=key
        if key not in DEMAND_PROFILE:
            continue
        year=int(car.get('year') or 0)
        band=YEAR_BANDS.get(key)
        profile=DEMAND_PROFILE[key]
        price=car.get('price_krw') or 0
        if not band or not (band[0] <= year <= band[1]):
            continue
        reference_upper=profile[2]
        hard_ceiling=reference_upper*price_stretch_multiplier(key)
        if price <= hard_ceiling:
            grouped[key].append(car)
        else:
            rejected_expensive += 1

    def rank_for(key,car):
        priority=DEMAND_PROFILE[key][1]
        reference_upper=DEMAND_PROFILE[key][2]
        price=car.get('price_krw') or 0
        mileage=car.get('mileage_km')
        mileage=mileage if isinstance(mileage,(int,float)) else 9999999
        if price <= priority: price_bucket=0
        elif price <= reference_upper: price_bucket=1
        else: price_bucket=2
        return (price_bucket,price,-int(car.get('year') or 0),mileage)

    for key,group in grouped.items():
        group.sort(key=lambda car: rank_for(key,car))

    selected=[]; used=set(); selected_per_key={key:0 for key in DEMAND_PROFILE}

    # First pass: guarantee variety. Every Excel-proven family with a qualifying live car gets one slot.
    for key in DEMAND_PROFILE:
        if grouped[key]:
            car=grouped[key][0]
            selected.append(car); used.add(car['id']); selected_per_key[key]=1
            if len(selected)>=PUBLIC_TARGET: break

    # Second pass: fill the remaining quota in 2026 purchase-priority order.
    priority_keys=sorted(DEMAND_PROFILE, key=lambda k:(-DEMAND_2026.get(k,0), list(DEMAND_PROFILE).index(k)))
    progress=True
    while len(selected)<PUBLIC_TARGET and progress:
        progress=False
        for key in priority_keys:
            target=DEMAND_PROFILE[key][0]
            if selected_per_key[key] >= target: continue
            next_car=next((x for x in grouped[key] if x['id'] not in used),None)
            if next_car is None: continue
            selected.append(next_car); used.add(next_car['id']); selected_per_key[key]+=1
            progress=True
            if len(selected)>=PUBLIC_TARGET: break

    # Third pass: use additional qualifying cars from proven families when another family is scarce.
    extras=[]
    for key,group in grouped.items():
        for car in group:
            if car['id'] not in used:
                extras.append((key,car))
    extras.sort(key=lambda kc:(-DEMAND_2026.get(kc[0],0),)+rank_for(kc[0],kc[1]))
    for key,car in extras:
        if len(selected)>=PUBLIC_TARGET: break
        # A high-demand family may exceed its nominal quota slightly, but cannot monopolize the page.
        if selected_per_key[key] >= DEMAND_PROFILE[key][0] + 4: continue
        selected.append(car); used.add(car['id']); selected_per_key[key]+=1

    print('Price stretch limits rejected',rejected_expensive,'Excel-family candidates',flush=True)
    print('Selected model families:',sum(1 for k,v in selected_per_key.items() if v),flush=True)
    for car in selected:
        key=car.get('_demand_key') or demand_key(car)
        car['preference_2026']=DEMAND_2026.get(key,0)
        car.pop('_demand_key',None)
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
        raw_source='encar' if car['source']=='Encar' else 'kbc'
        for p in v.get('photos',v.get('Photos',[])) or []:
            u=photo_url(p,raw_source)
            if u and u not in d['photos']: d['photos'].append(u)
        for u in extract_photos(v,raw_source):
            if u not in d['photos']: d['photos'].append(u)
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
    candidates=[]; seen=set()
    common={'source':'encar,kbc','lang':'en','sort':'newest',
            'exclude_duplicates':'true','exclude_prices':'1111,9999'}
    for search_term,limit in TARGET_SEARCHES:
        params=dict(common)
        params['model_search']=search_term
        params['limit']=limit
        params['page']=1
        req=urllib.request.Request('https://api.encarapi.com/api/catalog?'+urlencode(params),
                                  headers={'x-api-key':key,'Accept':'application/json'})
        try:
            with urllib.request.urlopen(req,timeout=120) as response: data=json.load(response)
        except urllib.error.HTTPError as e:
            print('Catalog search skipped:',search_term,'HTTP',e.code,flush=True)
            continue
        if not isinstance(data,dict) or not isinstance(data.get('SearchResults'),list):
            print('Catalog search returned unexpected data:',search_term,flush=True)
            continue
        for row in data['SearchResults']:
            car=normalize(row)
            if car and car['id'] not in seen:
                seen.add(car['id']); candidates.append(car)
    print('Candidate listings collected:',len(candidates),flush=True)
    if not candidates: raise ValueError('No valid listings; previous snapshot retained')
    cars=select_public(candidates)
    if len(cars)<PUBLIC_TARGET:
        print('Demand-matched candidate pool produced',len(cars),'listings',flush=True)
    enrich(cars,key)
    publishable=[]; recovered=0; removed_no_photo=0
    for car in cars:
        detail_photos=((car.get('details') or {}).get('photos') or [])
        if not car.get('photos') and detail_photos:
            car['photos']=detail_photos
            recovered+=1
        # A public vehicle card must have a real source photo. If the provider no longer
        # supplies any photo after a fresh detail lookup, treat it as stale/unusable and omit it.
        if not car.get('photos'):
            removed_no_photo+=1
            continue
        publishable.append(car)
    cars=publishable
    print('Recovered photo sets:',recovered,'Removed photo-less/stale listings:',removed_no_photo,flush=True)
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

