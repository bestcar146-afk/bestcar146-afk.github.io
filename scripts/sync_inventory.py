import json, os, sys, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

def main():
    key = os.environ.get("XAPI_KEY", "").strip()
    if not key:
        raise ValueError("XAPI_KEY repository secret is missing")
    url = "https://api.xapikorea.com/v1/search?limit=100&page=1&sort=ModifiedDate&lang=en"
    req = urllib.request.Request(url, headers={"X-API-Key": key, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            data = json.load(response)
    except urllib.error.HTTPError as exc:
        raise ValueError("XAPI request failed: HTTP " + str(exc.code)) from None
    if not isinstance(data, dict) or not isinstance(data.get("results"), list):
        raise ValueError("Unexpected XAPI response structure")
    fields = ("id", "manufacturer", "model", "badge", "year", "mileage_km", "price_krw",
              "fuel_type", "transmission", "location", "thumbnail", "encar_url")
    cars = []
    for row in data["results"]:
        if not isinstance(row, dict):
            continue
        if not str(row.get("id", "")).isdigit() or not isinstance(row.get("price_krw"), (int, float)) or row["price_krw"] <= 0:
            continue
        if not row.get("manufacturer") or not row.get("model"):
            continue
        car = {field: row[field] for field in fields if field in row}
        if not str(car.get("thumbnail", "")).startswith("https://"):
            car["thumbnail"] = ""
        cars.append(car)
    if not cars:
        raise ValueError("No valid listings; previous inventory retained")
    output = {"updated_at": datetime.now(timezone.utc).isoformat(), "source": "Encar via XAPI Korea",
              "scope": "Latest selection, not the full market", "results": cars}
    target = Path("inventory.json")
    temp = target.with_suffix(".tmp")
    temp.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(target)
    print("Synced " + str(len(cars)) + " listings")
if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # Never log response bodies, request headers or credentials.
        print(str(exc) if isinstance(exc, ValueError) else "Inventory sync failed; previous file retained", file=sys.stderr)
        sys.exit(1)
