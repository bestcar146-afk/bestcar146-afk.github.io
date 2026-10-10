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
    # Keep known vehicle-image CDN URLs, or ordinary image-file URLs.
    if ('encar.com' in low or 'kbchachacha.com' in low or
        re.search(r'\.(?:jpe?g|png|webp)(?:\?|$)',low)):
        return value
    return ''

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
CANDIDATE_LIMIT=100
CANDIDATE_PAGES=4
DISCOVERY_MAX=30

# Historical demand + price profile derived from BEST CAR STAR sold/shipped data (2024-Sep 2026).
# The sold file is itself price-filtered, so these price levels represent accepted bargain/acquisition levels,
# not the Korean market average. Slots total 150 as a target capacity; actual public count may be lower.
DEMAND_PROFILE = {
    # slots, priority source-price, maximum source-price
    'Kia All New Sorento': (23, 6365000, 7129650),
    'Kia New Sorento R': (17, 4265000, 5015000),
    'Kia Sorento R': (8, 2665000, 2890000),
    'Hyundai Santa Fe DM': (11, 4065000, 4165000),
    'Kia Sportage R': (8, 3765000, 4140000),
    'Hyundai Grand Starex': (7, 3600000, 4690000),
    'Renault Samsung QM3': (7, 1890000, 2152500),
    'Audi Q5': (4, 9166325, 9680236),
    'Hyundai Maxcruz': (6, 6716510, 7115430),
    'Hyundai Mighty': (5, 6000000, 6550000),
    'Hyundai Santa Fe': (4, 4465000, 4565000),
    'VW Tiguan': (4, 4665000, 5565000),
    'Audi Q7': (3, 4957500, 6367221),
    'Chevrolet Captiva': (2, 2715000, 2990000),
    'Chevrolet Malibu': (4, 2000000, 2082500),
    'Hyundai i30': (3, 3165000, 3315000),
    'Kia Sportage': (3, 5715000, 6298450),
    'BMW X3': (2, 2865000, 3390000),
    'BMW X5': (2, 3415000, 4290000),
    'Chevrolet Cruze': (1, 2000000, 2193900),
    'Chevrolet Orlando': (2, 1415000, 1540000),
    'Hyundai Accent': (2, 1715000, 1902500),
    'Hyundai All New Tucson': (3, 6665000, 7180950),
    'Hyundai Starex': (1, 3335000, 4120000),
    'Hyundai Tucson': (1, 4700000, 7770810),
    'Jeep Wrangler Rubicon': (2, 14340000, 14340000),
    'Kia All New Carnival': (2, 4665000, 5765000),
    'Kia Bongo': (2, 3765000, 4100000),
    'Kia Mohave': (2, 3365000, 3690000),
    'Kia Morning': (2, 1737400, 2115000),
    'Kia Pride': (1, 1990000, 2185000),
    'Kia Soul': (2, 1565000, 2815000),
    'Mini Countryman': (1, 2065000, 2490000),
    'Mini Countryman All4': (2, 3665000, 4365000),
    'Ssangyong Rexton W': (1, 2440000, 2702500),
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
    'VW Tiguan': 10,
    'Chevrolet Malibu': 10,
    'Ssangyong Rexton W': 10,
    'Kia Bongo': 9,
    'Renault Samsung QM3': 8,
    'Audi Q7': 8,
    'Chevrolet Captiva': 8,
    'Hyundai i30': 8,
    'BMW X3': 7,
    'Hyundai Tucson': 7,
    'Kia Morning': 7,
    'Hyundai Santa Fe': 6,
    'Kia Pride': 6,
    'Chevrolet Cruze': 5,
    'Jeep Wrangler Rubicon': 5,
    'BMW X5': 4,
    'Hyundai Accent': 4,
    'Hyundai Starex': 4,
    'Kia Sportage': 4,
    'Chevrolet Orlando': 3,
    'Kia Mohave': 3,
    'Kia Soul': 3,
    'Mini Countryman': 3,
    'Mini Countryman All4': 3,
}

YEAR_BANDS = {
    'Kia All New Sorento': (2015, 2017),
    'Kia New Sorento R': (2013, 2014),
    'Kia Sorento R': (2010, 2012),
    'Hyundai Santa Fe DM': (2013, 2015),
    'Kia Sportage R': (2011, 2014),
    'Hyundai Grand Starex': (2010, 2015),
    'Renault Samsung QM3': (2014, 2015),
    'Audi Q5': (2011, 2015),
    'Hyundai Maxcruz': (2014, 2015),
    'Hyundai Mighty': (2007, 2014),
    'Hyundai Santa Fe': (2013, 2016),
    'VW Tiguan': (2012, 2015),
    'Audi Q7': (2010, 2015),
    'Chevrolet Captiva': (2012, 2015),
    'Chevrolet Malibu': (2014, 2015),
    'Hyundai i30': (2012, 2014),
    'Kia Sportage': (2012, 2016),
    'BMW X3': (2011, 2014),
    'BMW X5': (2010, 2012),
    'Chevrolet Cruze': (2011, 2014),
    'Chevrolet Orlando': (2013, 2014),
    'Hyundai Accent': (2011, 2015),
    'Hyundai All New Tucson': (2016, 2018),
    'Hyundai Starex': (2006, 2012),
    'Hyundai Tucson': (2010, 2016),
    'Jeep Wrangler Rubicon': (2011, 2013),
    'Kia All New Carnival': (2015, 2018),
    'Kia Bongo': (2010, 2016),
    'Kia Mohave': (2012, 2014),
    'Kia Morning': (2009, 2012),
    'Kia Pride': (2006, 2010),
    'Kia Soul': (2010, 2013),
    'Mini Countryman': (2012, 2013),
    'Mini Countryman All4': (2015, 2016),
    'Ssangyong Rexton W': (2013, 2017),
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
        ('Kia Morning', ('picanto',)),
        ('Kia Pride', ('pride',)),
        ('Kia Soul', ('kia','soul')),
        ('Mini Countryman All4', ('countryman','all4')),
        ('Ssangyong Rexton W', ('rexton w',)),
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
    discovery=[]
    rejected_expensive=0
    for car in cars:
        key=demand_key(car)
        car['_demand_key']=key
        year=int(car.get('year') or 0)
        band=YEAR_BANDS.get(key)
        profile=DEMAND_PROFILE.get(key)
        price=car.get('price_krw') or 0
        if key in grouped and band and profile and band[0] <= year <= band[1]:
            reference_upper=profile[2]
            hard_ceiling=reference_upper*price_stretch_multiplier(key)
            if price <= hard_ceiling:
                grouped[key].append(car)
            else:
                rejected_expensive += 1
        else:
            discovery.append(car)

    selected=[]; used=set(); selected_per_key={key:0 for key in DEMAND_PROFILE}
    for key,(slots,priority,reference_upper) in DEMAND_PROFILE.items():
        group=grouped[key]
        def rank(car):
            price=car.get('price_krw') or 0
            mileage=car.get('mileage_km')
            mileage=mileage if isinstance(mileage,(int,float)) else 9999999
            # The sold spreadsheet is already biased toward the cheapest acceptable car on each date.
            # Treat historical P75 as a reference band, not a hard market ceiling.
            if price <= priority: price_bucket=0
            elif price <= reference_upper: price_bucket=1
            else: price_bucket=2
            return (price_bucket,price,-int(car.get('year') or 0),mileage)
        group.sort(key=rank)
        for car in group[:slots]:
            selected.append(car); used.add(car['id']); selected_per_key[key]+=1

    # Redistribute shortages only to other proven generations that also pass their price ceiling.
    extras=[]
    for key,group in grouped.items():
        for car in group:
            if car['id'] not in used:
                extras.append(car)
    extras.sort(key=lambda car: (
        list(DEMAND_PROFILE).index(car['_demand_key']),
        car.get('price_krw') or 999999999,
        -int(car.get('year') or 0),
        car.get('mileage_km') if isinstance(car.get('mileage_km'),(int,float)) else 9999999
    ))
    for car in extras:
        if len(selected)>=PUBLIC_TARGET: break
        key=car['_demand_key']
        # Do not let one model flood the page just because other models are temporarily scarce.
        if selected_per_key[key] >= DEMAND_PROFILE[key][0] + 2: continue
        selected.append(car); used.add(car['id']); selected_per_key[key]+=1

    # Discovery is intentionally capped. It tests newer/adjacent generations without padding
    # the catalog to 150 with unrelated or expensive cars.
    raw_counts={}; discovery_added=0
    discovery.sort(key=lambda car: (car.get('price_krw') or 999999999,-int(car.get('year') or 0),
                                    car.get('mileage_km') if isinstance(car.get('mileage_km'),(int,float)) else 9999999))
    for car in discovery:
        if len(selected)>=PUBLIC_TARGET or discovery_added>=DISCOVERY_MAX: break
        signature=(str(car.get('manufacturer') or ''),str(car.get('model') or ''))
        if raw_counts.get(signature,0)>=1: continue
        selected.append(car); used.add(car['id']); raw_counts[signature]=1; discovery_added+=1

    print('Price stretch limits rejected',rejected_expensive,'target-generation candidates',flush=True)
    print('Discovery listings added:',discovery_added,flush=True)
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
    base_params={'source':'encar,kbc','lang':'en','limit':CANDIDATE_LIMIT,'sort':'newest',
                 'model_search':MODEL_SEARCH,
                 'exclude_duplicates':'true','exclude_prices':'1111,9999'}
    candidates=[]; seen=set()
    for page in range(1,CANDIDATE_PAGES+1):
        params=dict(base_params); params['page']=page
        req=urllib.request.Request('https://api.encarapi.com/api/catalog?'+urlencode(params),
                                  headers={'x-api-key':key,'Accept':'application/json'})
        try:
            with urllib.request.urlopen(req,timeout=120) as response: data=json.load(response)
        except urllib.error.HTTPError as e:
            raise ValueError('EnCarAPI returned HTTP '+str(e.code)+'; previous snapshot retained') from None
        if not isinstance(data,dict) or not isinstance(data.get('SearchResults'),list):
            raise ValueError('Unexpected catalog response; previous snapshot retained')
        for row in data['SearchResults']:
            car=normalize(row)
            if car and car['id'] not in seen:
                seen.add(car['id']); candidates.append(car)
        if len(data['SearchResults'])<CANDIDATE_LIMIT:
            break
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

