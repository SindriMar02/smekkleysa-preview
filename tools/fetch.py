"""Download the sleeve originals the build needs, from the harvest.

    python3 tools/harvest.py && python3 tools/fetch.py && python3 tools/assets.py

The images are not committed (a client's artwork), but the harvest that names them is,
so the repo stays reproducible.

Two things worth knowing about this catalogue:

  * The Store API serves the ORIGINAL upload in `images[0].src`, not the 300x300
    catalogue thumbnail the shop page renders. The thumbnails are what made the
    resolution look hopeless on first inspection; the originals are mostly fine.
    (Same lesson as the 12 Tónar Shopify `width=` parameter: always refetch a client
    CDN asset without its size parameter before calling it unusable.)
  * `images[0].srcset` lists the widths WordPress generated, so the largest width is
    readable WITHOUT downloading. That is used to pre-filter, so only plausible
    candidates are ever fetched.
"""
import json, os, re, html, urllib.request, urllib.parse, concurrent.futures, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'research/covers')
os.makedirs(OUT, exist_ok=True)

# Not records. A tote bag or a gift card in the roll would be a lie about the catalogue.
SKIP_CATS = {
    'books', 'smekkleysa-books', 't-shirts', 'merchandise', 'tickets', 'presale',
    'autographed-items', 'dsm', 'digital-gift-card', 'digital-gift-card-1',
    'digital-gift-card-2', 'digital-gift-card-3', 'digital-gift-card-4',
    'digital-gift-card-5',
}
MIN_SRCSET = 560          # below this the sleeve cannot carry anything on the page

SEPS = (' – ', ' — ', ' - ', ' ‎– ')

def clean(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s or ''))).strip()

def split_title(t):
    """Artist / title out of ONE separator, so the halves can never disagree."""
    for s in SEPS:
        if s in t:
            a, rest = t.split(s, 1)
            return a.strip(' ,'), rest.strip(' ,')
    return None, t

def max_srcset(im):
    ws = [int(w) for w in re.findall(r'(\d+)w', im.get('srcset') or '')]
    return max(ws) if ws else 0

def candidates():
    P = json.load(open(os.path.join(ROOT, 'research/products.json')))
    rows, seen = [], set()
    for p in P:
        if not p['images']:
            continue
        slugs = {c['slug'] for c in p['categories']}
        if slugs & SKIP_CATS:
            continue
        name = clean(p['name'])
        artist, title = split_title(name)
        if not artist or len(artist) < 2:
            continue
        if artist.lower().startswith('smekkleysa'):
            continue
        im = p['images'][0]
        w = max_srcset(im)
        if w < MIN_SRCSET:
            continue
        src = im['src']
        if src in seen:
            continue
        seen.add(src)
        icelandic = bool(slugs & {
            'more-music', 'icelandic', 'icelandic-composers', 'smekkleysa_cd',
            'cds', 'smekkleysa-all-vinyls', 'vinyl-more-music', 'cd-more-music'})
        rows.append(dict(
            slug=p['slug'], artist=artist, title=title, src=src, srcw=w,
            price=int(float(p['prices']['price'] or 0)),
            url=p['permalink'], icelandic=icelandic,
            cats=sorted(slugs),
        ))
    return rows

def get(job):
    url, out = job
    if os.path.exists(out) and os.path.getsize(out) > 800:
        return 'skip'
    try:
        # Their upload filenames carry Icelandic characters (Björk-Army-of-Me-Hoodie.jpg),
        # which urllib refuses to put on the wire raw. Encode the PATH only.
        sp = urllib.parse.urlsplit(url)
        url = urllib.parse.urlunsplit((
            sp.scheme, sp.netloc, urllib.parse.quote(sp.path), sp.query, sp.fragment))
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as r, open(out, 'wb') as fh:
            fh.write(r.read())
        return 'ok'
    except Exception as e:
        return f'ERR {out}: {e}'

def main():
    rows = candidates()
    # one sleeve per artist, that artist's largest
    best = {}
    for r in rows:
        k = r['artist'].casefold()
        if k not in best or r['srcw'] > best[k]['srcw']:
            best[k] = r

    # Sorting the pool by resolution alone produced a roll of the classical archive
    # (Kammersveit Reykjavíkur, Pólýfónkórinn, Thorkell Sigurbjörnsson) plus ELVIS
    # PRESLEY, with Björk, the Sugarcubes, HAM and Megas all missing: their scans are
    # simply smaller. For a Bad Taste roll that is not a ranking problem, it is a lie
    # about what the shop is. So the canon is seeded FIRST and resolution only fills
    # the remainder.
    #
    # Matched on the EXACT parsed artist string. "Laufey" the singer and "Laufey
    # Sigurðardóttir" the violinist are two different people and a prefix match
    # conflates them.
    CANON = [
        'Björk', 'Björk og Tríó Guðmundar Ingólfssonar', 'The Sugarcubes', 'Sigur Rós',
        'HAM', 'Megas', 'Megas & Spilverk Þjóðanna', 'Ólöf Arnalds', 'Emiliana Torrini',
        'Jóhann Jóhannsson', 'Quarashi', 'Bubbi', 'Unun', 'Bogomil Font', 'Dr Spock',
        'GusGus', 'Fufanu', 'Sólstafir', 'Vök', 'Laufey', 'Kolrassa Krókríðandi',
        'Spilverk Þjóðanna', 'Curver', 'Tilbury', 'Úlfur Úlfur', 'Mikael Máni',
        'Snorri Helgason', 'Elín Hall', 'Birnir', 'Kaktus Einarsson', 'Nyrst',
        'Víkingur Ólafsson', 'Helgi Björns', 'Ólafur Kram', 'Klemens Hannigan',
    ]
    # Real stock, but a foreign reissue in a 60-name roll reads as filler in a section
    # about this shop's own racks.
    FOREIGN = {'elvis presley', 'morbid angel', 'neil young', 'aphex twin', 'autechre',
               'crass', 'sault', 'joep beving', 'yeah yeah yeahs', 'kanye west'}

    seeded, taken = [], set()
    for name in CANON:
        r = best.get(name.casefold())
        if r and r['srcw'] >= 1000:
            seeded.append(r); taken.add(name.casefold())

    rest = [r for k, r in best.items()
            if k not in taken and k not in FOREIGN and r['icelandic']]
    rest.sort(key=lambda r: -r['srcw'])
    pool = seeded + rest[:150 - len(seeded)]
    print('canon seeded', len(seeded), 'of', len(CANON),
          '| missing:', [c for c in CANON if c.casefold() not in taken])

    jobs = []
    for r in pool:
        ext = os.path.splitext(r['src'].split('?')[0])[1] or '.jpg'
        r['file'] = os.path.join(OUT, r['slug'][:90] + ext)
        jobs.append((r['src'], r['file']))

    with concurrent.futures.ThreadPoolExecutor(10) as ex:
        res = list(ex.map(get, jobs))
    print(collections.Counter(x if x in ('ok', 'skip') else 'error' for x in res))
    for x in res:
        if x not in ('ok', 'skip'):
            print(x)

    with open(os.path.join(ROOT, 'research/pool.json'), 'w') as fh:
        json.dump(pool, fh, ensure_ascii=False)
    print('pool', len(pool), '| icelandic', sum(1 for r in pool if r['icelandic']),
          '| candidates', len(rows), '| distinct artists', len(best))

main()
