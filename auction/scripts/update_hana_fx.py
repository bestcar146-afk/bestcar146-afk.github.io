"""Fetch Hana's public USD TT buying quote; never overwrite a valid rate on failure."""
import json, re, sys, time
from datetime import datetime, timedelta, timezone
from html import unescape
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode

KST = timezone(timedelta(hours=9))
URL = 'https://www.kebhana.com/cms/rate/wpfxd651_01i_01.do'
TARGET = Path(__file__).resolve().parents[1] / 'fx.json'

def clean(value):
    return re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', ' ', value))).strip()

def parse_quote(html, now):
    if not all(x in clean(html) for x in ['송금', '보낼 때', '받을 때']):
        raise ValueError('Hana transfer headers missing')
    body = re.search(r'<tbody[^>]*>(.*?)</tbody>', html, re.S | re.I)
    if not body:
        raise ValueError('Rate table missing')
    rows = []
    for row in re.findall(r'<tr[^>]*>(.*?)</tr>', body[1], re.S | re.I):
        cells = [clean(x) for x in re.findall(r'<td[^>]*>(.*?)</td>', row, re.S | re.I)]
        if cells and re.search(r'\bUSD\b', cells[0]):
            rows.append(cells)
    if len(rows) != 1 or len(rows[0]) != 11:
        raise ValueError('Unexpected USD table structure')
    cells = rows[0]
    send, receive, mid = [float(cells[i].replace(',', '')) for i in (5, 6, 8)]
    if not 500 < receive < mid < send < 3000 or send / receive > 1.1:
        raise ValueError('Invalid transfer rate relationship')
    quote = re.search(r'고시일시\s*:\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(\d{1,2})시\s*(\d{1,2})분\s*(\d{1,2})초', clean(html))
    if not quote:
        raise ValueError('Publication timestamp missing')
    published = datetime(*map(int, quote.groups()), tzinfo=KST)
    if published > now + timedelta(minutes=5) or now - published > timedelta(days=10):
        raise ValueError('Unexpected publication date')
    return {'bank':'Hana Bank', 'rate_type':'TT_BUY', 'krw_per_usd':receive,
            'quoted_at':published.isoformat(), 'checked_at':now.isoformat(),
            'source_url':URL, 'status':'ok', 'update_interval_hours':24}

def main():
    now = datetime.now(KST)
    try:
        result = None
        # Previous dates cover weekends and Korean bank holidays.
        for days_back in range(10):
            data = urlencode({'ajax':'true','curCd':'USD','pbldDvCd':'0','pbldSqn':'',
                              'hid_key_data':'','inqStrDt':(now-timedelta(days=days_back)).strftime('%Y%m%d'),
                              'inqKindCd':'1'}).encode()
            try:
                req = Request(URL, data=data, headers={'User-Agent':'Mozilla/5.0', 'Referer':'https://www.kebhana.com/'})
                with urlopen(req, timeout=30) as response:
                    html = response.read().decode('utf-8')
                result = parse_quote(html, now)
                break
            except Exception:
                if days_back == 9:
                    raise
                time.sleep(1)
        if TARGET.exists():
            previous = json.loads(TARGET.read_text())
            if previous.get('quoted_at') and datetime.fromisoformat(previous['quoted_at']) > datetime.fromisoformat(result['quoted_at']):
                raise ValueError('Refusing older quote')
        TARGET.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
        print('Hana USD receiving transfer:', result['krw_per_usd'], result['quoted_at'])
    except Exception as exc:
        previous = json.loads(TARGET.read_text()) if TARGET.exists() else {'bank':'Hana Bank','rate_type':'TT_BUY','krw_per_usd':None,'quoted_at':None}
        previous.update(status='update_failed', last_attempt_at=now.isoformat())
        TARGET.write_text(json.dumps(previous, ensure_ascii=False, indent=2)+'\n')
        print('Hana update failed; previous quote retained:', type(exc).__name__, file=sys.stderr)
        return 1
    return 0

if __name__ == '__main__':
    sys.exit(main())
