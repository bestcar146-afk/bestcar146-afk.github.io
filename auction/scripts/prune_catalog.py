"""Remove expired public records only. Never touches client database/archive storage."""
import json
from datetime import datetime, timezone
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def active(car, now):
    try:
        end = datetime.fromisoformat(car['close'].replace('Z', '+00:00'))
        return end > now and car.get('bidStatus', 'open') == 'open'
    except (KeyError, TypeError, ValueError):
        return False

def prune(root=ROOT, now=None):
    now = now or datetime.now(timezone.utc)
    for provider in ('kolon', 'autobell'):
        summary = root / 'data' / (provider + '-summary.json')
        if not summary.exists():
            continue
        cars = json.loads(summary.read_text())
        kept = [c for c in cars if active(c, now)]
        if len(kept) != len(cars):
            summary.write_text(json.dumps(kept, ensure_ascii=False, separators=(',', ':')))
        referenced = {Path(c['detailUrl']).name for c in kept if c.get('detailUrl')}
        removed = 0
        for file in (root / 'data' / provider).glob('*.json'):
            if file.name not in referenced:
                file.unlink()
                removed += 1
        print(provider, 'active:', len(kept), 'expired summaries:', len(cars)-len(kept), 'obsolete public details:', removed)

if __name__ == '__main__':
    prune()
