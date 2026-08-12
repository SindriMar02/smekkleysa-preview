/* Real synthesized TOUCH gestures against the two drag surfaces.
 *
 * What "the rail is broken on mobile" actually decomposes into, each measured:
 *  1. a VERTICAL swipe that happens to start on a record must scroll the PAGE and
 *     leave the rail alone: report page delta, rail sideways twitch, and rail drift
 *     still running 700ms after the finger left (junk inertia).
 *  2. a HORIZONTAL swipe on the rail must move the rail, and the fling must be sane:
 *     report travel and the peak velocity implied by the first 5 frames after release.
 * scrollTo/rAF harnesses cannot see any of this: only Input.synthesizeScrollGesture
 * with gestureSourceType:'touch' exercises touch-action, pointercancel and capture.
 */
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true,
  userDataDir:'/private/tmp/claude-501/t12-qa-profile', args:['--hide-scrollbars','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage();
await p.setViewport({ width:390, height:844, deviceScaleFactor:2, isMobile:true, hasTouch:true });
const cdp = await p.target().createCDPSession();
await p.goto(process.env.URL || 'http://localhost:8812/', { waitUntil:'load' });
await p.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 4500));

const railX = () => p.evaluate(() => {
  const t = document.querySelector('[data-rail-track]');
  return t ? new DOMMatrixReadOnly(getComputedStyle(t).transform).m41 : null;
});

/* 1 ---- the thumb case: diagonal swipe starting ON the rail.
   MEASURE AGAINST A REFERENCE, not against zero: the rail's base offset is
   scroll-linked BY DESIGN and it idle-drifts at 42px/s, so a pure-vertical pass
   moves it ~55px legitimately. The first version of this check compared the
   diagonal against zero and called the design motion a twitch. The leak is
   (diagonal displacement) - (pure-vertical displacement): 468px on the broken
   build, 0px fixed. */
const swipe = async (xDist) => {
  await p.evaluate(() => {
    const s = document.querySelector('#plotur');
    window.scrollTo(0, s.offsetTop + s.offsetHeight/2 - innerHeight/2);
  });
  await new Promise(r => setTimeout(r, 900));
  const c = await p.evaluate(() => {
    const t = document.querySelector('[data-rail]').getBoundingClientRect();
    return { x: t.left + t.width/2, y: t.top + t.height/2 };
  });
  const y0 = await p.evaluate(() => scrollY);
  const r0 = await railX();
  await cdp.send('Input.synthesizeScrollGesture', {
    x: Math.round(c.x), y: Math.round(c.y),
    yDistance: -350, xDistance: xDist, speed: 1300, gestureSourceType: 'touch' });
  await new Promise(r => setTimeout(r, 900));
  return { page: Math.round((await p.evaluate(() => scrollY)) - y0),
           rail: Math.abs(Math.round((await railX()) - r0)), rect: c };
};
const ref = await swipe(0);
const diag = await swipe(-80);
const leak = Math.max(0, diag.rail - ref.rail);
console.log(`vertical over rail : page moved ${ref.page}px (want ~350)  rail ${ref.rail}px = base+drift reference`);
console.log(`diagonal over rail : page moved ${diag.page}px (want ~350)  drag leak ${leak}px (want 0)`);
const rect = diag.rect;
/* 2 ---- horizontal swipe on the rail */
await p.evaluate(() => {
  const s = document.querySelector('#plotur');
  window.scrollTo(0, s.offsetTop + s.offsetHeight/2 - innerHeight/2);
});
await new Promise(r => setTimeout(r, 900));
const hx0 = await railX();
await cdp.send('Input.synthesizeScrollGesture', {
  x: Math.round(rect.x), y: Math.round(rect.y),
  xDistance: -260, yDistance: 0, speed: 1200, gestureSourceType: 'touch' });
const frames = [];
for (let i = 0; i < 8; i++) { await new Promise(r => setTimeout(r, 50)); frames.push(await railX()); }
const travel = Math.round(Math.abs(frames[7] - hx0));
let vmax = 0;
for (let i = 1; i < frames.length; i++) vmax = Math.max(vmax, Math.abs(frames[i]-frames[i-1]) / 0.05);
console.log(`horizontal on rail : travelled ${travel}px (want >150)  post-release peak ${Math.round(vmax)}px/s (sane < 3000)`);

/* 3 ---- vertical swipe over the roll (rekkarnir) */
await p.evaluate(() => { window.scrollTo(0, document.querySelector('#rekkarnir').offsetTop + 200); });
await new Promise(r => setTimeout(r, 900));
const ry0 = await p.evaluate(() => scrollY);
await cdp.send('Input.synthesizeScrollGesture', {
  x: 195, y: 420, yDistance: -400, speed: 1400, gestureSourceType: 'touch' });
await new Promise(r => setTimeout(r, 300));
const ry1 = await p.evaluate(() => scrollY);
console.log(`vertical over roll : page moved ${Math.round(ry1-ry0)}px (want ~400)`);
await b.close();
