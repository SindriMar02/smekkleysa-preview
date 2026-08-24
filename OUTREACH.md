# Outreach draft · Smekkleysa SM

**Status: SENT 2026-08-24** by Sindri, to asi@smekkleysa.net with kiddi@smekkleysa.net in copy.
Watch for a bounce: asi@ came from third-party listings, never from Smekkleysa's own site, and
their Google Workspace already bounced shop@ once. A bounce means the outreach did not happen.

- **To:** asi@smekkleysa.net
- **Cc:** kiddi@smekkleysa.net
- **Who:** Ásmundur „Ási" Jónsson, stofnandi og sá sem rekur Smekkleysu. `asi@` kemur af
  dreifingarlistum Phasma-Music (í lofti 2026, með Pósthólf 710 sem er enn skráð póstfang
  félagsins hjá RSK) og BIS/eClassical. `kiddi@` er netfangið sem 1819.is birtir fyrir
  kt. 430588-1179 með núverandi heimilisfangi búðarinnar.
- **Live preview (preflight PASSED 2026-08-24):** https://sindrimar02.github.io/smekkleysa-preview/
- **Landing shot to attach:** `~/Downloads/frumgerd-smekkleysa.jpg` (skotin af LIVE slóðinni 2026-08-24)
- **Fyrri tilraun:** sent á info@smekkleysa.net 2026-08-12, ekkert svar. shop@ er lokaður
  Google Group og skilaði bounce.

---

**Subject:** Hugmynd að nýrri vefsíðu fyrir Smekkleysu

---

Sæll Ásmundur,

Ég heiti Sindri og hanna vefsíður fyrir íslenskar verslanir og tónlistarfyrirtæki.

Ég var að skoða plötubúðir í miðbænum þegar ég staldraði við hjá ykkur og hef varla hætt að hugsa
um Smekkleysu síðan. Fjörutíu ár frá Sykurmolunum, útgáfan sjálf, uppboðin og búð sem er líka
kaffihús, bar og tónleikastaður. Á vefsíðunni ykkar sést þetta ekki. Þegar hún er opnuð í síma
tekur á móti manni mynd með gráum hnappi sem á stendur CLICK ME, svartur kökuborði
leggst yfir nýju plöturnar fyrir neðan, og opnunartíminn stangast á, því ykkar eigin síða segir
opið alla daga frá 10 til 18 en símaskráin 12 til 18 og lokað á sunnudögum.

Mér fannst það synd, svo ég settist niður og hannaði frumgerð að nýrri forsíðu fyrir ykkur. Þetta
kostar ykkur ekki neitt og því fylgir engin skuldbinding.

Hana má skoða hér hvenær sem er, og hún virkar vel í síma:
https://sindrimar02.github.io/smekkleysa-preview/
frumgerd-smekkleysa.jpg

Hún er hönnuð fyrir símann fyrst, því þar skoðar fólk vefi mest í dag, og virkar eins vel á tölvu.
Merkið ykkar er stensill, svo ég lét það vera glugga og það sem sést í gegnum stafina er ljósritið
sem sagan ykkar byrjar á. Sagan liggur eftir tímalínu frá 1983 og til dagsins í dag, plöturnar fá
umslögin sín í fullri stærð, og opnunartími og staðsetning eru komin fremst á síðuna.

Ég sé líka um hýsingu og viðhald á síðum sem ég geri, og næsta skref væri að taka vefverslunina
og viðburðina inn í sama útlit.

Ég sendi línu á info@ fyrr í mánuðinum en veit ekki hvort hún hafi skilað sér.

Ef ykkur líst vel á þetta gæti ég klárað vefinn í heild, en ef ekki vona ég samt að þið hafið
gaman af því að skoða hugmyndina.

Endilega látið mig vita hvað ykkur finnst.

Bestu kveðjur,
Sindri Már
845 1758
sndr-studio.pages.dev

---

## Checks run on this draft

- **Preflight PASSED** against the live URL on 2026-08-24 (title, noindex, JSON-LD, no broken
  images, no 4xx, reload at 25/50/70/90 %, second visit, phone 390 with no horizontal scroll).
  The first run FAILED on "57 broken img of 97"; that was the gate misreading this build's
  memory-window loader, which strips `src` off every record plate outside the read window on
  purpose. Verified by hand at five depths through `#rekkarnir`: every VISIBLE sleeve painted
  (8/8, 8/8, 8/8, 4/4, 3/3) and zero images with a `src` failed to load. `preflight-outreach.mjs`
  now counts only images that were actually asked to load something, and reports deferred ones
  separately.
- **Every symptom in paragraph 3 re-verified on 2026-08-24**, not carried over from the build
  session: the grey CLICK ME button and the black cookie box were seen live at 390px today, and
  the opening-hours conflict is `smekkleysa.net/our-location/` ("Mánudagur til föstudags: 10:00
  til 18:00, Laugardaga & sunnudaga kl 10:00 til 18:00") against ja.is/1819.is (12:00 til 18:00,
  Saturday shorter, Sunday closed).
- **smekkleysa.is deliberately left out.** `https://smekkleysa.is` still fails (port 443 closed,
  re-checked today) but `http://smekkleysa.is` redirects to `.net` and browsers fall back, so a
  visitor may never see a failure. Not a symptom the owner can verify. It is a meeting point,
  not an email point.
- **No search paragraph.** smekkleysa.net has a real title, a real meta description and JSON-LD
  (re-checked today), so the "Google has nothing to cite" paragraph would be false here.
- No em-dash, en-dash or coordinated-hyphen compounds. No pricing, no ISK, no plan names.
- Plural address (þið / ykkur / ykkar) with a named singular greeting: Ási reads it, Kiddi is in
  copy, and the letter is about the company.
- No clause handing the prototype over. No "kveikja í" closer.
- Sign-off is the canonical four lines. Sender must be `sindrimar02@gmail.com`.
