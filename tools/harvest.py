"""Harvest Smekkleysa's WooCommerce catalogue via the open Store API.

    python3 tools/harvest.py

Writes research/products.json (the raw records) so every later step reads from ONE
harvest and a caption can never drift onto the wrong sleeve. The Store API serves the
ORIGINAL upload URL, not the 300x300 catalogue thumbnail, so image sizing decisions are
made later from the true pixels (see tools/assets.py).
"""
import json, os, urllib.request, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = 'https://smekkleysa.net/wp-json/wc/store/v1/products?per_page=100&page=%d'
out = []

page = 1
while True:
    req = urllib.request.Request(API % page, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=40) as r:
        batch = json.load(r)
    if not batch:
        break
    out += batch
    print(f'page {page}: {len(batch)} (total {len(out)})')
    if len(batch) < 100:
        break
    page += 1
    time.sleep(0.3)

os.makedirs(os.path.join(ROOT, 'research'), exist_ok=True)
with open(os.path.join(ROOT, 'research/products.json'), 'w') as fh:
    json.dump(out, fh, ensure_ascii=False)
print('wrote', len(out), 'products')
