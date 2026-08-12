// Landing-page screenshot for the outreach email. ALWAYS off the LIVE deployed URL,
// never localhost: the shot has to be what the owner will actually see, and it doubles
// as proof the deploy renders. Refuses to write a frame that is not settled — this
// hero opens as an outlined wordmark over a black field, which is the one thing the
// email must not show.
import puppeteer from 'puppeteer-core';

const URL_ = process.argv[2] || 'https://sindrimar02.github.io/smekkleysa-preview/';
const OUT = process.argv[3] || `${process.env.HOME}/Downloads/frumgerd-smekkleysa.png`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await p.goto(URL_, { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.waitForFunction(
  () => !document.body.classList.contains('al-loading'),
  { timeout: 30000 }
);
// past the opening reveal (line 2 finishes at 0.74 of the intro) and a few frames of
// the copier bar, so the field inside the letters reads as a field
await sleep(2600);

const state = await p.evaluate(() => {
  const c = document.querySelector('canvas[data-markc]');
  const g = c.getContext('2d');
  const { width: w, height: h } = c;
  const d = g.getImageData(0, 0, w, h).data;
  // the wordmark is a window: count pixels that are neither transparent nor the
  // ground, which is what tells a drawn field apart from an empty canvas
  let ink = 0;
  for (let i = 3; i < d.length; i += 4 * 97) if (d[i] > 12) ink++;
  return {
    loading: document.body.classList.contains('al-loading'),
    intro: document.body.classList.contains('al-intro'),
    canvas: `${w}x${h}`,
    inkSamples: ink,
    sampled: Math.floor(d.length / (4 * 97)),
    heroOpacity: getComputedStyle(document.querySelector('.al-hero-stage')).opacity,
  };
});

const drawn = state.inkSamples / Math.max(1, state.sampled);
if (state.loading || state.intro || Number(state.heroOpacity) < 0.9 || drawn < 0.05) {
  console.error('REFUSING to shoot, hero not settled:', JSON.stringify({ ...state, drawn }));
  process.exit(1);
}

await p.screenshot({ path: OUT });
console.log('shot:', OUT, JSON.stringify({ ...state, drawn: drawn.toFixed(3) }));
await b.close();
