import json,re,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def exterior_first(images):
 """Move Kolon's consecutive seven-image exterior sequence ahead of inspections."""
 images=list(dict.fromkeys(images))
 numbers=[int(re.search(r'-(\d+)\.[^.]+$',u)[1]) if re.search(r'-(\d+)\.[^.]+$',u) else -100 for u in images]
 # Visually verified exceptions whose source gallery is entirely filename-sorted.
 overrides={'PA261028-0004659': 16, 'PA261028-0004341': 15, 'PA261028-0002600': 17, 'PA261028-0004477': 16, 'PA261028-0006845': 20, 'PA261028-0002692': 16, 'PA261028-0006859': 10, 'PA261029-0001183': 10, 'PA261028-0004338': 13, 'PA261029-0001135': 14, 'PA261028-0009366': 11, 'PA261029-0001121': 17, 'PA261030-0002694': 13}
 for car_id,first in overrides.items():
  if images and car_id in images[0]:
   exterior=[u for n,u in sorted(zip(numbers,images)) if first<=n<first+7]
   return exterior+[u for u in images if u not in exterior]
 runs=[];start=0
 for i in range(1,len(numbers)+1):
  if i==len(numbers) or numbers[i]!=numbers[i-1]+1:
   if i-start>=7:runs.append((start,i))
   start=i
 if not runs:return images
 start,end=runs[0] if runs[0][0]==0 else runs[-1]
 if start>0:start=end-7
 return images[start:end]+images[:start]+images[end:]

def repair_photo_order():
 summary=ROOT/'data/kolon-summary.json'
 marker=ROOT/'data/kolon-photo-order-v3.json'
 if not summary.exists() or marker.exists():return
 cars=[]
 for c in json.loads(summary.read_text()):
  car=json.loads((ROOT.parent/c['detailUrl'].lstrip('/')).read_text())
  cars.append(car)
 write_catalog(cars)
 marker.write_text(json.dumps({'version':3,'vehicles':len(cars)}))

def write_catalog(cars):
 folder=ROOT/'data/kolon';folder.mkdir(parents=True,exist_ok=True);summaries=[]
 for car in cars:
  car=dict(car);car['images']=exterior_first(car['images'])
  payload=json.dumps(car,ensure_ascii=False,separators=(',',':'));name=car['id']+'-'+hashlib.sha256(payload.encode()).hexdigest()[:12]+'.json'
  (folder/name).write_text(payload)
  summary={k:v for k,v in car.items() if k not in ['overview','inspection','images']};summary['images']=car['images'][:4];summary['detailUrl']='/auction/data/kolon/'+name;summaries.append(summary)
 (ROOT/'data/kolon-summary.json').write_text(json.dumps(summaries,ensure_ascii=False,separators=(',',':')))
def migrate():
 p=ROOT/'index.html';s=p.read_text();m=re.search(r'CARS.splice\(0,CARS.length,.*?,\.\.\.(\[.*?\])\);',s)
 if not m:return
 write_catalog(json.loads(m[1]));s=s[:m.start()]+"CARS.splice(0,CARS.length,...CARS.filter(c=>c.source!=='Kolon Auto Auction'));"+s[m.end():]
 s=s.replace('function render(){const a=filtered();','let catalogPage=1,lastCatalogFilter="";\nfunction render(){const key=JSON.stringify([sourceFilter,...Array.from(document.querySelectorAll(".filters input,.filters select,.marketbar select,#sort")).map(e=>[e.id,e.value,e.checked])]);if(key!==lastCatalogFilter){catalogPage=1;lastCatalogFilter=key;}const all=filtered(),pages=Math.max(1,Math.ceil(all.length/24));catalogPage=Math.min(catalogPage,pages);const a=all.slice((catalogPage-1)*24,catalogPage*24);')
 s=s.replace("$('#count').textContent=a.length;","$('#count').textContent=all.length;")
 s=s.replace('bindKolonPreviews()}','bindKolonPreviews();let nav=document.getElementById("catalogPagination");if(!nav){nav=document.createElement("nav");nav.id="catalogPagination";nav.setAttribute("aria-label","Vehicle pages");$("#grid").after(nav);}nav.style.cssText="display:flex;align-items:center;justify-content:center;gap:16px;padding:24px";nav.innerHTML=`<button class="btn btn-secondary" id="previousPage" ${catalogPage===1?"disabled":""}>Previous</button><span>Page ${catalogPage} of ${pages}</span><button class="btn btn-secondary" id="nextPage" ${catalogPage===pages?"disabled":""}>Next</button>`;$("#previousPage").onclick=()=>{catalogPage--;render();$("#grid").scrollIntoView({block:"start"})};$("#nextPage").onclick=()=>{catalogPage++;render();$("#grid").scrollIntoView({block:"start"})};}')
 s=s.replace('function openKolon(c){','''async function openKolon(c){
 const requested=c.id;
 if(c.detailUrl&&!c.overview){
 $('#detail').innerHTML='<div class="panel" role="status">Loading vehicle details…</div>';$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false');
 try{const response=await fetch(c.detailUrl);if(!response.ok)throw Error();const detail=await response.json();if(detail.id!==c.id)throw Error();Object.assign(c,detail);if(activeCarId!==requested||!$('#modal').classList.contains('open'))return;}
 catch{if(activeCarId===requested)$('#detail').innerHTML='<div class="panel">Vehicle details could not load. Close and reopen to retry.</div>';return;}
 }
''')
 s=s.replace('function kolonCard(c){','function previewUrl(url){return url.replace("https://image.kolonautointernational.com/","https://image-resize.kolonautointernational.com/")}\nfunction kolonCard(c){')
 s=s.replace('esc(c.images[0])+\'" alt="\'+esc(c.make', 'esc(previewUrl(c.images[0]))+\'" alt="\'+esc(c.make',1)
 s=s.replace("box.querySelector('img').src=photos[index]","box.querySelector('img').src=previewUrl(photos[index])")
 s=s.replace('esc(url)+\'" style="width:100%', 'esc(previewUrl(url))+\'" style="width:100%')
 s=s.replace('Five-vehicle import test.','Imported catalogue preview.')
 pos=s.rfind('</script>');s=s[:pos]+'''\n(async()=>{try{const response=await fetch('/auction/data/kolon-summary.json');if(!response.ok)throw Error();const cars=await response.json();CARS.push(...cars);$('#quickMake').replaceChildren(new Option('All brands',''));$('#quickYear').replaceChildren(new Option('All years',''));init();updateModels();const id=new URLSearchParams(location.search).get('vehicle');if(id&&cars.some(c=>c.id===id))openCar(id);}catch{const note=document.createElement('p');note.textContent='Kolon catalogue could not load. Please refresh to retry.';$('#grid').before(note);}})();\n'''+s[pos:]
 p.write_text(s)
if __name__=='__main__':
 migrate()
 repair_photo_order()
