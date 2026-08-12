/* Does every piece of text actually FIT?
 *
 * Not "does the page overflow" — that check passed while a heading was breaking the
 * word "ár" across two lines and the hero was slicing the top off a 2. This walks every
 * text element at seven widths and reports four distinct failures:
 *
 *   midword       a single word is split across two lines (its client rects disagree)
 *   past-viewport an element's ink runs off the edge of the screen
 *   nameoverflow  a roll row's artist name runs past the viewport
 *   orphan        the last visual line of a heading carries 1-2 characters
 *   menu          a nav label in the OPEN hamburger overlay runs off the screen
 *
 * The menu is opened and measured because a closed overlay is `visibility: hidden` and
 * every check silently skips it, which is how "NETVERSLUN" shipped running off the
 * right edge on a 1200px window.
 *
 * TWO CHECKS WERE REMOVED BECAUSE THEY LIED, and a harness that cries wolf is worse
 * than no harness:
 *
 *   "clipped", as scrollHeight > clientHeight on `.al-row`. That row is a padded mask
 *   (padding-top:.2em / margin-top:-.2em, ledger #71) set at line-height .82, so its
 *   scroll height ALWAYS exceeds its client height whether or not a single pixel of
 *   ink is lost. It reported 100+ failures on headings that are demonstrably intact in
 *   a screenshot. Clipping of display type is instead prevented at the source: the hero
 *   canvas takes its geometry from measureText().actualBoundingBoxAscent rather than
 *   from an assumed cap height, which is what fixed both the sliced acute on Ó and the
 *   optical overshoot on the 2 in "12".
 *
 *   "overflow", as a child's rect against its parent's content box. Reported a uniform
 *   +5px on a dozen unrelated elements at 1920 while `past-viewport` was clean, i.e.
 *   nothing was actually off the screen. Viewport-relative is the measure that matches
 *   what a reader sees, so that is the one kept.
 *
 * Run:  node qa/fit.mjs          URL=... to point it elsewhere
 */
import puppeteer from 'puppeteer-core';

const URL_ = process.env.URL || 'http://localhost:8812/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WIDTHS = [390, 600, 768, 900, 1024, 1280, 1440, 1920];

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  userDataDir: '/private/tmp/claude-501/t12-qa-profile',
  args: ['--hide-scrollbars', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
    '--autoplay-policy=no-user-gesture-required'],
});

const all = [];
for (const w of WIDTHS) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: w < 760, hasTouch: w < 760 });
  await p.goto(URL_, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 2600));
  /* walk the whole page so every reveal has resolved and every split has been built */
  await p.evaluate(async () => {
    /* bring every split into view and LEAVE it revealed, so the fit is measured on
       text that has arrived rather than on text mid-entrance */
    for (const el of document.querySelectorAll('[data-split]')) {
      el.scrollIntoView({ block: 'center' });
      await new Promise((r) => setTimeout(r, 260));
    }
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y < H; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 45)); }
    await new Promise((r) => setTimeout(r, 500));
  });

  /* Open the hamburger overlay and measure it, then close it again. A closed overlay is
     visibility:hidden, so everything below skips it. */
  const menu = await p.evaluate(async () => {
    const burger = document.querySelector('[data-burger]');
    if (!burger) return [];
    burger.click();
    await new Promise((r) => setTimeout(r, 700));
    /* Measure the INK, not the box. Every one of these anchors is display:block, so its
       own rect is the overlay's padding edge and is identical for all six labels no
       matter how long they are — which is precisely what this check reported: 48 hits
       across 8 widths, every label failing by the same number of pixels. A Range over
       the element's contents gives the rect of the text itself. */
    const rng = document.createRange();
    const bad = [...document.querySelectorAll('.al-menu-l, .al-menu-foot a, .al-menu-foot span')]
      .map((el) => {
        rng.selectNodeContents(el);
        const r = rng.getBoundingClientRect();
        /* Not "does it overflow" but "does it fit WELL": a label that stops one pixel
           short of the edge technically passes and still reads as shouting. Require a
           real right margin. */
        const room = innerWidth - r.right;
        return r.width && room < innerWidth * 0.08
          ? { text: el.textContent.trim(), by: Math.round(innerWidth * 0.08 - room) } : null;
      }).filter(Boolean);
    burger.click();
    await new Promise((r) => setTimeout(r, 500));
    return bad;
  });
  menu.forEach((m) => all.push({ w, kind: 'menu', el: 'a.al-menu-l', text: m.text, by: m.by }));

  const found = await p.evaluate(() => {
    const out = [];
    const name = (el) => {
      const c = (el.className || '').toString().split(' ').filter(Boolean)[0];
      return (el.tagName.toLowerCase() + (c ? '.' + c : '')) + (el.id ? '#' + el.id : '');
    };
    const txt = (el) => el.textContent.replace(/\s+/g, ' ').trim().slice(0, 46);

    /* --- 1. a WORD split across lines. The split engine emits one span per character,
           so without a word wrapper the browser may break anywhere; .al-word is the
           wrapper, and a word that occupies two client rects has been broken. --- */
    for (const wEl of document.querySelectorAll('.al-word')) {
      const rects = [...wEl.getClientRects()];
      if (rects.length > 1) {
        const rows = new Set(rects.map((r) => Math.round(r.top)));
        if (rows.size > 1) out.push({ kind: 'midword', el: name(wEl.closest('[data-split]') || wEl), text: txt(wEl) });
      }
    }

    /* --- 2. ink running off the SCREEN, which is the measure that matches what a
           reader actually sees --- */
    const blocks = document.querySelectorAll(
      'h1,h2,h3,p,li,dt,dd,span.al-era-y,span.al-era-tag,.al-rel-title,.al-rel-artist,.al-name-t,.al-roll-now-t,.al-roll-now-r',
    );
    for (const el of blocks) {
      if (!el.textContent.trim()) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || +cs.opacity === 0) continue;
      /* a dragged/auto-rotating track is meant to be wider than its window */
      if (el.closest('.al-rail-track, .al-tl-track, .al-tk-track, .al-odo')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      if (r.right > innerWidth + 2) {
        out.push({ kind: el.closest('.al-roll-list') ? 'nameoverflow' : 'past-viewport',
          el: name(el), text: txt(el), by: Math.round(r.right - innerWidth) });
      }
    }

    /* --- 4. an orphan: a heading whose last visual row carries one or two characters --- */
    for (const h of document.querySelectorAll('[data-split]')) {
      const rows = [...h.querySelectorAll('.al-row')];
      if (rows.length < 2) continue;
      const last = rows[rows.length - 1].textContent.replace(/\s+/g, '').trim();
      if (last.length && last.length <= 2) out.push({ kind: 'orphan', el: name(h), text: last });
    }
    return out;
  });

  found.forEach((f) => all.push({ w, ...f }));
  const total = found.length + menu.length;
  console.log(`${String(w).padStart(5)}px  ${total ? total + ' issue(s)' : 'clean'}`);
  menu.forEach((m) => console.log(`         ${'menu'.padEnd(14)} ${'a.al-menu-l'.padEnd(26)} +${m.by}px "${m.text}"`));
  found.forEach((f) => console.log(`         ${f.kind.padEnd(14)} ${f.el.padEnd(26)} ${f.by ? '+' + f.by + 'px ' : ''}"${f.text}"`));
  await p.close();
}

await browser.close();
console.log(`\n${all.length ? all.length + ' issue(s) across ' + WIDTHS.length + ' widths' : 'ALL CLEAN across ' + WIDTHS.length + ' widths'}`);
process.exit(all.length ? 1 : 0);
