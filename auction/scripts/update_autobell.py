"""Import five public Autobell Auction Pro samples; no bidding endpoints are used."""
import json, urllib.request, urllib.parse, hashlib
from pathlib import Path
from datetime import datetime, timezone
from prune_catalog import active, prune
ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.autobellglobal.com/api/glovis/'
def get(endpoint, **params):
    with urllib.request.urlopen(BASE + endpoint + '?' + urllib.parse.urlencode(params), timeout=30) as r:
        data = json.load(r)
    if data.get('success') is False: raise ValueError('Unsuccessful Autobell response')
    return data['data']
def publish(entries, details):
    if len(entries)!=len(details):raise ValueError('Incomplete Autobell details')
    summaries=[]; outputs={}; now=datetime.now(timezone.utc).isoformat()
    for item, raw in zip(entries, details):
        info=raw['info']; photos=raw['thumbnailResource']; key=item['carKey']
        assert raw['carKey']==key
        assert len(photos['MEDIUM'])>=4 and len(photos['LARGE'])==len(photos['MEDIUM'])
        assert item.get('auctionBidEndDate')
        bid=item.get('currentBidPrice'); bid=bid if isinstance(bid,(int,float)) and bid>0 else None
        summary=dict(id='AUTOBELL-'+key, provider='autobell', source='Autobell Smart Auction', sample=True,
            make=info['makerName'],model=info['modelDetailName'] or info['modelName'],trim=info.get('gradeName') or '',
            year=info['year'],mileage=info['mileage'],fuel=info['fuelTypeName'],transmission=info['gearBoxName'],
            drive={'FWD':'2WD','RWD':'2WD'}.get(info.get('moveFormName'),info.get('moveFormName') or 'N:A'),
            currentBidKRW=bid,start=None,priceBasis='currentBidPrice',currency='KRW',
            close=item['auctionBidEndDate']+'+09:00',opens=item['auctionBidStartDate']+'+09:00',
            auctionStart=item['auctionStartDate']+'+09:00',images=photos['MEDIUM'][:4],
            inspected=bool(raw.get('performanceResult')),bidStatus='open' if item['auctStatus']=='PROCEEDING_AUCTION' else 'closed',
            sourceUrl=f"https://www.autobellglobal.com/auction/procarinfo/{key}/{item['roundId']}/{item['round']}",
            capturedAt=now)
        inspection=[{'part':' · '.join(str(v) for v in [r.get('chkCdRoodDescription'),r.get('chkCdSubDescription'),r.get('chkCdChildDescription')] if v),
                     'result':r.get('funcChkBtnDescription') or 'Not specified'} for r in raw.get('performanceResult') or []]
        overview={'Mileage':str(info['mileage'])+' km','Fuel':info['fuelTypeName'],'Transmission':info['gearBoxName'],
            'Drive':info.get('moveFormName'),'Engine':str(info.get('displacement'))+' cc','Seats':info.get('seatCount'),
            'Color':info.get('colorName'),'VIN':info.get('vin'),'Steering':info.get('steeringPositionName'),
            'Evaluation grade':(raw.get('paAppraisalInfo') or {}).get('evalPoin'),
            'Condition grade':(raw.get('paAppraisalInfo') or {}).get('evalPoin2')}
        options=[]
        for name in ['engineOptionData','exteriorOptionData','interiorOptionData','safetyOptionData','multimediaOptionData','etcOptionData']:
            for v in raw.get(name) or []:
                options.append(' · '.join(str(v[k]) for k in ['code2EngName','code3EngName'] if v.get(k)))
        detail=dict(id=summary['id'],overview=overview,images=photos['LARGE'],thumbnails=photos.get('THUMB') or photos['MEDIUM'],
            inspection=inspection,options=list(dict.fromkeys(options)),conditionReport=raw.get('performanceImage'),
            mechanicComment=raw.get('performanceResultMemo'))
        payload=json.dumps(detail,ensure_ascii=False,separators=(',',':'))
        filename=key+'-'+hashlib.sha256(payload.encode()).hexdigest()[:12]+'.json'
        summary['detailUrl']='/auction/data/autobell/'+filename
        outputs[ROOT/'data/autobell'/filename]=payload;summaries.append(summary)
    assert len(summaries)<=5 and len({c['id'] for c in summaries})==len(summaries)
    for path,payload in outputs.items():path.parent.mkdir(parents=True,exist_ok=True);path.write_text(payload)
    (ROOT/'data/autobell-summary.json').write_text(json.dumps(summaries,ensure_ascii=False,separators=(',',':')))
    prune()
    print('Published',len(summaries),'Autobell samples;',sum(len(x['thumbnailResource']['LARGE']) for x in details),'photos')
def main():
    entries=get('buyerAuctionCar/proAuctionCarFilterList',page=1,size=5,countryCode='en',isExcludeClosed='true')
    if not isinstance(entries,list):raise ValueError('Invalid Autobell catalogue response')
    now=datetime.now(timezone.utc)
    entries=[c for c in entries if active({'close':c.get('auctionBidEndDate','')+'+09:00','bidStatus':'open' if c.get('auctStatus')=='PROCEEDING_AUCTION' else 'closed'},now)]
    details=[get('buyerAuctionCar/info',carKey=c['carKey'],roundId=c['roundId'],historyPopup='true') for c in entries]
    publish(entries,details)

if __name__=='__main__':main()
