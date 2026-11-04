import json, tempfile, unittest
from pathlib import Path
from datetime import datetime, timezone
from unittest.mock import patch
import update_kolon as sync
from prune_catalog import prune

class Lifecycle(unittest.TestCase):
 def test_prune_keeps_private_and_current(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);(root/'data/kolon').mkdir(parents=True)
   cars=[{'id':i,'close':d,'detailUrl':'/auction/data/kolon/'+i+'.json'} for i,d in [('old','2020-01-01T00:00:00+09:00'),('new','2099-01-01T00:00:00+09:00')]]
   (root/'data/kolon-summary.json').write_text(json.dumps(cars))
   for n in ['old','new','obsolete']:(root/'data/kolon'/f'{n}.json').write_text('{}')
   private=root/'private';private.mkdir();(private/'saved.json').write_text('saved');(private/'won.json').write_text('won')
   prune(root,datetime(2026,11,5,tzinfo=timezone.utc))
   self.assertEqual([c['id'] for c in json.loads((root/'data/kolon-summary.json').read_text())],['new'])
   self.assertEqual([p.name for p in (root/'data/kolon').glob('*')],['new.json'])
   self.assertEqual((private/'saved.json').read_text(),'saved');self.assertEqual((private/'won.json').read_text(),'won')
 def test_listing_changes_and_failure(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp)/'auction';(root/'data/kolon').mkdir(parents=True)
   rows=[{'car_goods_unique_id':'one','price':1},{'car_goods_unique_id':'two','price':2}];calls=[]
   def api(endpoint,payload):
    if endpoint=='getAuctionCarList':return {'auction_info':{'auction_bid_end_date':'2099-01-01 11:00:00'},'data_list':list(rows),'total_page':1,'total_count':len(rows)}
    id=payload['car_goods_unique_id'];calls.append(id)
    return {'car_overview':dict(brand='Test',model='Car',year=2026,mileage=1,fuel='Gasoline',transmission='A/T'),'bidding_info':{'auction_bid_end_date':'2099-01-01 11:00:00'},'car_images':{'car_imgs':['photo.jpg']},'car_start_price':next(r['price'] for r in rows if r['car_goods_unique_id']==id)}
   def write(cars):
    summaries=[]
    for c in cars:
     path=root/'data/kolon'/f"{c['id']}.json";path.write_text(json.dumps(c));summaries.append(dict(c,detailUrl='/auction/data/kolon/'+path.name))
    (root/'data/kolon-summary.json').write_text(json.dumps(summaries))
   with patch.object(sync,'ROOT',root),patch.object(sync,'api',side_effect=api),patch.object(sync,'write_catalog',side_effect=write),patch.object(sync,'prune',side_effect=lambda:prune(root)):
    sync.main();self.assertEqual(set(calls),{'one','two'});calls.clear()
    sync.main();self.assertEqual(calls,[])
    rows[0]['price']=3;rows.pop();rows.append({'car_goods_unique_id':'three','price':4})
    sync.main();self.assertEqual(set(calls),{'one','three'});self.assertFalse((root/'data/kolon/two.json').exists())
    before=(root/'data/kolon-summary.json').read_text()
    with patch.object(sync,'api',side_effect=RuntimeError('source offline')):
     with self.assertRaises(RuntimeError):sync.main()
    self.assertEqual((root/'data/kolon-summary.json').read_text(),before)
if __name__=='__main__':unittest.main()
