export { ARTISTS, RELEASES } from './roster.mjs';

/* Every fact here was read off a primary source: Smekkleysa's own site (their footer,
   their „Our History" page written by Ólafur J. Engilbertsson, their opening-hours page)
   or their own WooCommerce Store API, harvested 2026-08-12. The audit trail is in
   FACTS.md. Icelandic copy carries no em-dashes and no en-dashes by rule, so ranges are
   written with „til" rather than with a stroke. */

export const META = {
  name: 'Smekkleysa',
  domain: 'smekkleysa.net',
  title: 'Smekkleysa SM · plötubúð, útgáfa og bar á Hverfisgötu síðan 1986',
  description:
    'Plötubúð, útgáfa, kaffihús og tónleikastaður á Hverfisgötu 32 í Reykjavík. '
    + 'Smekkleysa var stofnuð 1986 af Sykurmolunum og fagnar fjörutíu árum 2026. '
    + 'Opnunartími, staðsetning og það sem er í rekkunum.',
  address: 'Hverfisgata 32, 101 Reykjavík',
  kt: '450917-2490',
  email: 'shop@smekkleysa.net',
  phone: '+354 551 3730',
  phoneHref: '+3545513730',
  shop: 'https://smekkleysa.net/shop/',
  /* From their own „Location // Opening Hours" page, read 2026-08-12. Unlike the
     12 Tónar build these did not have to be borrowed from a directory listing: they
     publish them themselves, in both languages, and both rows say the same thing. */
  hours: [
    ['Mánudaga til föstudaga', '10 til 18'],
    ['Laugardaga og sunnudaga', '10 til 18'],
  ],
  social: [
    ['Instagram', 'https://www.instagram.com/smekkleysa/'],
    ['Facebook', 'https://www.facebook.com/smekkleysa/'],
  ],
};

export const NAV = [
  ['Nýkomið', '#plotur'],
  ['Í rekkunum', '#rekkarnir'],
  ['Sagan', '#sagan'],
  ['Netverslun', META.shop],
];

export const HERO = {
  /* „Smekkleysa" splits where the word itself splits, smekk og leysa, and the two
     halves happen to be five letters each. Their logotype sets it on one line, but the
     two-line lockup is what gives the stencil enough cap height to be a window. */
  markLines: ['SMEKK', 'LEYSA'],
  eyebrow: 'Hverfisgata 32 · síðan 1986',
  lead:
    'Plötubúð, útgáfa, kaffihús og tónleikastaður. Stofnuð 1986 af Sykurmolunum og '
    + 'rekin á sömu forsendum síðan: að gefa út það sem stóru fyrirtækin vildu ekki snerta.',
  scroll: 'Skruna',
  play: 'Hlusta',
  tickerLabel: 'Nýkomið í búðina',
};

export const SHOP = {
  eyebrow: 'Búðin',
  title: 'Nýkomið',
  lead:
    'Allt sem hér stendur er til í búðinni á Hverfisgötu og í netversluninni. '
    + 'Dragðu röðina til hliðar.',
  drag: 'Dragðu',
  cta: 'Opna netverslun',
  priceNote: 'Verð og lager lesin úr þeirra eigin netverslun 12. ágúst 2026.',
};

export const ROSTER = {
  eyebrow: 'Rekkarnir',
  title: 'Í rekkunum',
  lead:
    'Sextíu flytjendur af þeim nærri sautján hundruð titlum sem eru til í búðinni '
    + 'núna. Skrunaðu niður listann.',
  hint: 'Nafnið í miðjunni er valið',
  countLabel: 'af 60',
  /* The accuracy line, carried by the section itself rather than by a caption. Their
     shop categories are NOT a label list: „Smekkleysa CD's" contains Yeah Yeah Yeahs
     and Neil Young, so it means CDs in the shop, not CDs on the label. The roll is
     therefore the racks, and the label gets its own section with no artwork in it. */
  note:
    'Þetta eru plötur sem búðin selur. Útgáfulisti Smekkleysu er annar listi og hann er '
    + 'hér fyrir neðan.',
};

export const HISTORY = {
  eyebrow: 'Sagan',
  title: 'Frá 1986',
  lead:
    'Fjörutíu ár frá ljósritunarskáldum og Kukli að plötubúð á Hverfisgötu. '
    + 'Dragðu tímalínuna til hliðar.',
  drag: 'Dragðu tímalínuna',
  /* All five entries come from their own history page, written by Ólafur J.
     Engilbertsson. Dates are his. */
  items: [
    {
      year: '1983',
      head: 'Áfangar hætta',
      tag: 'Útvarpið',
      body:
        'Ásmundur Jónsson og Guðni Rúnar Agnarsson höfðu rekið kvöldskóla í nýrri '
        + 'tónlist í útvarpinu frá 1975. Í síðasta þáttinn í júlí 1983 kalla þeir saman '
        + 'hljómsveit úr því fólki sem þeim þótti merkilegast. Hún fær nafnið Kukl.',
    },
    {
      year: '1986',
      head: 'Smekkleysa verður til',
      tag: 'Sykurmolarnir',
      body:
        'Kukl hættir um vorið og Sykurmolarnir verða til úr sama fólki. Í október er '
        + 'prentað póstkort af Reagan og Gorbatsjov til að fjármagna fyrstu plötuna.',
    },
    {
      year: '1986',
      head: 'Ammæli',
      tag: 'Fyrsta platan',
      body:
        'Fyrsta platan, sjö tommu með Ammæli og Ketti, kemur út á afmælisdegi Bjarkar, '
        + '21. nóvember. Hún er pressuð hjá Alfa í Hafnarfirði. Af fimm hundruð eintökum '
        + 'reyndist helmingurinn gallaður og óspilandi.',
    },
    {
      year: '1988',
      head: 'Bækurnar',
      tag: 'Útgáfan víkkar',
      body:
        'Smekkleysa gefur út ljóð og skáldsögur eins og plötur. Byggingin eftir Jóhamar '
        + 'og Miðnætursólborgin eftir Jón Gnarr koma út í hörðu bandi, sem jólabækur, '
        + 'og eru ekki alveg það sem jólabókalesandinn átti von á.',
    },
    {
      year: 'Núna',
      head: 'Fjörutíu ár',
      tag: 'Hverfisgata 32',
      body:
        'Búð, kaffihús, bar og tónleikastaður á Hverfisgötu, opið alla daga vikunnar. '
        + 'Nærri sautján hundruð titlar í rekkunum og uppboð á sjaldgæfum plötum.',
    },
  ],
};

/* Structurally this is where Alda's parent-company band sat. Here it carries the label,
   and it carries NO ARTWORK, for a reason that is specific to this catalogue: their
   shop categories cannot tell a Smekkleysa release from a record they simply stock, so
   any sleeve placed beside the word „útgáfan" would be a guess. Only what their own
   history page states is named. */
export const LABEL = {
  eyebrow: 'Útgáfan',
  /* Short on purpose. „Það sem Smekkleysa gefur sjálf út" wrapped at 390px and left
     „út" orphaned on its own line in a display face this large. */
  title: 'Útgáfan sjálf',
  body:
    'Smekkleysa var stofnuð 1986 af Sykurmolunum og hefur gefið út tónlist síðan. '
    + 'Útgáfan byrjaði ekki á plötu heldur á ljóðabókum: Dragsúgur eftir Braga Ólafsson, '
    + 'Taktu bensín elskan eftir Þór Eldon og Drullusokkur eftir Einar Örn í tíu eintökum. '
    + 'Síðan hafa komið út skáldsögur, teiknimyndablöð og þýðingar undir sama merki.',
  guard:
    'Listinn hér fyrir ofan er lagerinn í búðinni. Þetta er útgáfan og það er annað.',
  link: ['Netverslunin', META.shop],
};

export const CTA = {
  head: 'Ertu með eitthvað sem við eigum að heyra?',
  body:
    'Sendu okkur hlekk á tónlistina þína, eða komdu bara við á Hverfisgötu. '
    + 'Það er kaffi á könnunni og tónleikar í húsinu.',
  action: 'Senda tónlist',
  subject: 'Tónlist til Smekkleysu',
  secondary: 'Koma í búðina',
};

export const FOOTER = {
  head: 'Smekkleysa',
  shopLabel: 'Búðin',
  hoursLabel: 'Opnunartími',
  contactLabel: 'Samband',
  socialLabel: 'Samfélagsmiðlar',
  hoursNote: 'Opnunartími af þeirra eigin vef, lesinn 12. ágúst 2026.',
  credit:
    'Frumgerð eftir SNDR Studio og ekki í eigu Smekkleysu. Plötuumslög, verð og merki '
    + 'eru eign Smekkleysu SM ehf. og eru sótt úr þeirra eigin vefverslun. Þetta er ekki '
    + 'opinber vefur fyrirtækisins og hann er ekki skráður hjá leitarvélum.',
};
