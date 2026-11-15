"""Refresh full Encar photo galleries for cars already published in inventory.json."""
import json
import os
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

from sync_inventory import photo_url, extract_photos, encar_page_photos

INVENTORY=Path("inventory.json")


def full_vehicle(ident,key):
    url="https://api.encarapi.com/api/vehicle/"+str(ident)+"?lang=en"
    req=urllib.request.Request(
        url,
        headers={"x-api-key":key,"Accept":"application/json"}
    )
    try:
        with urllib.request.urlopen(req,timeout=60) as r:
            data=json.load(r)
        return data if isinstance(data,dict) else None
    except Exception as exc:
        print("Vehicle detail failed",ident,type(exc).__name__,flush=True)
        return None


def refresh_one(car,key):
    if car.get("source")!="Encar":
        return car

    ident=str(car.get("id") or "")
    detail=full_vehicle(ident,key)
    found=[]

    if isinstance(detail,dict):
        for p in detail.get("photos",detail.get("Photos",[])) or []:
            u=photo_url(p,"encar")
            if u and u not in found:
                found.append(u)
        for u in extract_photos(detail,"encar"):
            if u not in found:
                found.append(u)

    # The provider advertises full galleries on vehicle detail. If a response still
    # contains only the catalog preview set, supplement it from the public Encar page.
    if len(found)<=5:
        for u in encar_page_photos(ident):
            if u not in found:
                found.append(u)

    merged=[]
    for raw in found:
        u=photo_url(raw,"encar")
        if u and u not in merged:
            merged.append(u)

    # Only replace the public gallery if we recovered a valid set.
    if merged:
        car["photos"]=merged
        d=car.get("details") if isinstance(car.get("details"),dict) else {}
        d["photos"]=merged
        d["checked_at"]=datetime.now(timezone.utc).isoformat()
        d["photo_complete"]=len(merged)>5
        car["details"]=d

    print("Encar",ident,"photos",len(car.get("photos") or []),flush=True)
    return car


def main():
    key=os.environ.get("ENCARAPI_KEY","").strip()
    if not key:
        raise SystemExit("ENCARAPI_KEY repository secret is missing")

    data=json.loads(INVENTORY.read_text(encoding="utf-8"))
    cars=data.get("results") or []
    targets=[c for c in cars if c.get("source")=="Encar"]

    with ThreadPoolExecutor(max_workers=10) as pool:
        futures={pool.submit(refresh_one,c,key):c for c in targets}
        for future in as_completed(futures):
            future.result()

    data["photo_refreshed_at"]=datetime.now(timezone.utc).isoformat()
    temp=INVENTORY.with_suffix(".photos.tmp")
    temp.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
    temp.replace(INVENTORY)

    counts=[len(c.get("photos") or []) for c in targets]
    if counts:
        print("Encar galleries refreshed:",len(counts),
              "min",min(counts),"max",max(counts),
              "average",round(sum(counts)/len(counts),1),flush=True)


if __name__=="__main__":
    main()
