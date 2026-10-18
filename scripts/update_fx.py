import json
import statistics
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

MIN_RATE = 1000.0
MAX_RATE = 1800.0
MAX_PROVIDER_SPREAD = 0.03


def valid_rate(value):
    try:
        value = float(value)
    except Exception:
        return None
    return value if MIN_RATE <= value <= MAX_RATE else None


def fetch_json(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


def frankfurter_rate():
    url = "https://api.frankfurter.app/latest?from=USD&to=KRW"
    data = fetch_json(url)
    rate = valid_rate((data.get("rates") or {}).get("KRW"))
    if not rate:
        raise ValueError("Frankfurter returned no valid KRW rate")
    return rate, "Frankfurter", url


def erapi_rate():
    url = "https://open.er-api.com/v6/latest/USD"
    data = fetch_json(url)
    rate = valid_rate((data.get("rates") or {}).get("KRW"))
    if not rate:
        raise ValueError("ExchangeRate-API returned no valid KRW rate")
    return rate, "ExchangeRate-API", url


def previous_rate():
    try:
        data = json.loads(Path("fx.json").read_text(encoding="utf-8"))
        return valid_rate(data.get("krw_per_usd"))
    except Exception:
        return None


def main():
    quotes = []
    for fetcher in (frankfurter_rate, erapi_rate):
        try:
            quotes.append(fetcher())
        except Exception as exc:
            print(fetcher.__name__, "failed:", exc)

    if len(quotes) >= 2:
        values = [q[0] for q in quotes]
        low, high = min(values), max(values)
        spread = (high - low) / statistics.mean(values)
        if spread > MAX_PROVIDER_SPREAD:
            print("FX providers disagree too much:", values)
            print("Keeping the previous valid rate.")
            return 0
        rate = statistics.mean(values)
        source = "FX provider consensus"
        source_url = "Frankfurter + ExchangeRate-API"
    elif len(quotes) == 1:
        rate, source, source_url = quotes[0]
        prev = previous_rate()
        if prev and abs(rate - prev) / prev > 0.08:
            print("Single-provider FX move exceeds 8%; keeping previous rate.", prev, rate)
            return 0
    else:
        print("No reliable FX quote available; keeping previous rate.")
        return 0

    out = {
        "pair": "USD/KRW",
        "krw_per_usd": round(rate, 4),
        "source": source,
        "source_url": source_url,
        "as_of": datetime.now(timezone.utc).isoformat(),
    }
    Path("fx.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
