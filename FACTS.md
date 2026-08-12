# FACTS — Smekkleysa SM frumgerð

Every claim the page makes, with where it came from and when it was read. Nothing on the
page is asserted from memory or inferred. Read date for all of it: **2026-08-12**.

## The business

| Claim on the page | Source |
|---|---|
| Smekkleysa SM // Bad Taste Record Shop and Label | their own site footer |
| Stofnuð 1986 af Sykurmolunum | their own `<meta name="description">`: "Smekkleysa was established in 1986 by the Sugarcubes" |
| Hverfisgata 32, 101 Reykjavík | their own site footer |
| kt. 450917-2490 (VSK 138329) | their own site footer |
| +354 551 3730 | their own site footer |
| shop@smekkleysa.net | their own site footer |
| Opið 10 til 18 alla daga | their own `/our-location/` page, which publishes it in both languages: "Mánudagur til föstudags: 10:00 til 18:00 / Laugardaga & sunnudaga kl 10:00 til 18:00" |
| Fjörutíu ár 2026 | their own footer: "Allur réttur áskilinn 1986-2026 © Smekkleysa SM. ehf. — 40 Years Anniversary of Everything" |
| Búð, kaffihús, bar og tónleikastaður | their own site (Shop-Café-Bar-Venue in their `<title>`) |
| Uppboð á sjaldgæfum plötum | their own `/about-the-auction/` (Live / Future / Expired auctions) |
| Nærri sautján hundruð titlar | their WooCommerce Store API reports **1,678** products (`X-WP-Total`) |

## The history section

All five entries come from **their own „Our History" page, written by Ólafur J.
Engilbertsson**. The dates are his, not mine.

- **1983** — Áfangar ran on the state radio 1975 to 1983; for the final show in July 1983
  the hosts Ásmundur Jónsson and Guðni Rúnar Agnarsson assembled a "super group" which
  became **Kukl**.
- **1986** — Kukl breaks up in the spring, the Sugarcubes form from the same people; a
  Reagan/Gorbachev postcard is printed in October to finance the first record.
- **1986** — the first 7", *Ammæli* / *Köttur*, comes out on Björk's birthday,
  21 November, pressed at Alfa in Hafnarfjörður; of 500 copies half were defective.
- **1988** — *Byggingin* by Jóhamar and *Miðnætursólborgin* by Jón Gnarr, published in
  hardback as Christmas books.
- **Núna** — shop, café, bar and venue on Hverfisgata; the catalogue count and the
  auction are from the sources in the table above.

The label section names only **Dragsúgur** (Bragi Ólafsson), **Taktu bensín, elskan**
(Þór Eldon) and **Drullusokkur** (Einar Örn, edition of ten) as the first Bad Taste
publications, because those are the three that page names in that order.

## THE ACCURACY LINE — do not cross it

**Their shop categories are not a label catalogue.** "Smekkleysa CD's" (313 products),
"Smekkleysa All CD's" (127) and "Smekkleysa All Vinyls" (31) sound like a release list
and are not: those categories contain **Yeah Yeah Yeahs, Neil Young and Kanye West**.
They mean "CDs in the Smekkleysa shop". There is no field in their data that marks a
record as a Smekkleysa release: `brands` is empty on every product, and only 22 of 1,678
descriptions mention the company at all.

So the page is built the way the 12 Tónar one was:

- **the roll is the RACKS.** Its own copy says so: „Þetta eru plötur sem búðin selur.
  Útgáfulisti Smekkleysu er annar listi og hann er hér fyrir neðan."
- **the label band carries NO ARTWORK.** A sleeve beside the word „útgáfan" would be a
  guess about who they released. The band is text only.

Anything further about the label catalogue has to be confirmed with the owners before it
ships. Björk's and Sigur Rós's early records being Smekkleysa releases is widely believed
and was **not verified in this session**, so the page does not say it.

## The catalogue

Harvested from their **open WooCommerce Store API**
(`/wp-json/wc/store/v1/products`) on 2026-08-12: 1,678 products, saved to
`research/products.json`.

- 1,676 of 1,678 have an image.
- The API serves the **original upload**, not the 300x300 catalogue thumbnail their shop
  page renders. This is the same lesson as the 12 Tónar Shopify `width=` parameter, and
  it changed the whole design: of the 150 sleeves fetched, **110 are 1440px or larger**,
  so the roll can be full-bleed. 12 Tónar had 29 of 345 over 1000px and had to show
  covers as small objects instead.
- 58 of the 60 roll plates are full-bleed; 2 fall back to the archive tier.
- `tools/assets.py` asserts **max emitted/source ratio 0.600** — nothing is rendered
  larger than its own source.

**The roll is curated, not ranked by resolution.** Sorting the pool by pixel size alone
produced a Bad Taste roll containing Kammersveit Reykjavíkur, Pólýfónkórinn and
**Elvis Presley**, with Björk, the Sugarcubes, HAM and Megas all absent, because the
classical archive simply has bigger scans. `tools/fetch.py` seeds the canon first and
lets resolution fill the remainder.

Prices and stock are theirs, read 2026-08-12, and each rail card links to that record's
real product page.

## Two names that are easy to get wrong

- **"Laufey"** the singer and **"Laufey Sigurðardóttir"** the violinist are different
  people and a prefix match conflates them. Matching is on the exact parsed artist string.
- **"Bára Grímsdóttir – Virgo Gloriosa"** is their own product name; only their *slug*
  says `hljomeyki-virgo-gloriosa` (Hljómeyki is the choir). The page follows the product
  name, which is what they wrote.

## Still owed before this is shown to them

- **Commercial qualification has not been run.** No turnover, no headcount. See
  `lead-commercial-qualification`.
- **Confirm the 1986 date and the 40-years framing with the owners.** It is currently
  sourced to their own site only, which is good enough for the page and not good enough
  for a sentence in an email that they will check.
- **Ask for the label's actual release list**, which would let the útgáfan band carry
  real titles instead of only the three books.
- Their site links Instagram and Facebook; the handles in `META.social` were taken from
  their own markup but were **not opened and confirmed live**.
