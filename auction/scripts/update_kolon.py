"""Refresh Kolon at deadline-relative checkpoints; publish only a complete fetch."""
from optimize_catalog import write_catalog
import concurrent.futures,json,re,time,urllib.request,hashlib
from prune_catalog import prune
from pathlib import Path
from datetime import datetime,timezone,timedelta
ROOT=Path(__file__).resolve().parents[1]
KST=timezone(timedelta(hours=9))
def api(endpoint,payload):
 for attempt in range(3):
  try:
   req=urllib.request.Request('https://www.kolonautointernational.com/api/service/v1.0/'+endpoint+'.do',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json'})
   with urllib.request.urlopen(req,timeout=30) as response:j=json.load(response)
   if j.get('result_code')!='0000':raise ValueError('Kolon response unsuccessful')
   return j['data']
  except Exception:
   if attempt==2:raise
   time.sleep(2+attempt)
def stage(hours):return '6h' if hours<=6 else '12h' if hours<=12 else '24h' if hours<=24 else 'initial'
def main():
 first=api('getAuctionCarList',{'page_index':1,'page_count':100,'search_sort':'N'})
 info=first['auction_info'];deadline=info['auction_bid_end_date'];end=datetime.fromisoformat(deadline).replace(tzinfo=KST);now=datetime.now(KST)
 if end<=now:
  prune();print("Kolon auction expired; public catalogue pruned");return
 statefile=ROOT/'kolon-refresh.json';state=json.loads(statefile.read_text()) if statefile.exists() else {}
 checkpoint=stage((end-now).total_seconds()/3600)
 refresh_all=state.get('deadline')!=deadline or checkpoint not in state.get('completed',[])
 entries=first['data_list']
 for page in range(2,first['total_page']+1):entries+=api('getAuctionCarList',{'page_index':page,'page_count':100,'search_sort':'N'})['data_list']
 if len(entries)!=first['total_count'] or len({r['car_goods_unique_id'] for r in entries})!=len(entries):raise ValueError('Inventory changed during pagination; retry next check')
 fingerprints={r['car_goods_unique_id']:hashlib.sha256(json.dumps(r,sort_keys=True,ensure_ascii=False).encode()).hexdigest() for r in entries}
 previous=state.get('listing_fingerprints',{})
 def convert(item):
  id=item['car_goods_unique_id']
  if not refresh_all and previous.get(id)==fingerprints[id] and id in old:return old[id]
  r=api('getAuctionCarInfo',{'car_goods_unique_id':id});o=r['car_overview'];b=r['bidding_info'];imgs=r['car_images']['car_imgs']
  if not imgs or not b.get('auction_bid_end_date'):raise ValueError('Missing photos/deadline: '+id)
  # The catalogue writer normalizes the source exterior sequence on every refresh.
  order=imgs
  return dict(id=id,source='Kolon Auto Auction',sample=True,make=o['brand'],model=o['model'],trim=r.get('car_sub_name',''),year=o['year'],mileage=o['mileage'],fuel=o['fuel'],transmission='Automatic' if o['transmission']=='A/T' else o['transmission'],drive=o.get('drive') or 'N:A',start=None if r.get('price_show_yn')=='N' or not r.get('car_start_price') else float(r['car_start_price']),close=b['auction_bid_end_date'].replace(' ','T')+'+09:00',opens=b.get('auction_bid_start_date','N:A'),images=order,overview=o,inspection={k:r[k] for k in ['car_options_info','car_electronic_system','information','condition','frame_condition','history','detail','additional'] if r.get(k)},inspected=bool(r.get('condition')),bidStatus='open')
 old={}
 summary=ROOT/'data/kolon-summary.json'
 if summary.exists():
  for c in json.loads(summary.read_text()):
   detail=ROOT.parent/c['detailUrl'].lstrip('/')
   if detail.exists():old[c['id']]=json.loads(detail.read_text())
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:cars=list(pool.map(convert,entries))
 completed=state.get('completed',[]) if state.get('deadline')==deadline else []
 state={'deadline':deadline,'completed':list(dict.fromkeys(completed+[checkpoint])),'updated_at':now.isoformat(),'vehicle_count':len(cars),'listing_fingerprints':fingerprints}
 write_catalog(cars);prune();statefile.write_text(json.dumps(state,indent=2)+'\n');print('Updated',len(cars),'Kolon vehicles at',checkpoint)
if __name__=='__main__':main()
