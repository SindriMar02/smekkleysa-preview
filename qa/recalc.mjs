/* HOW MANY ELEMENTS does each scroll frame restyle?
 *
 * Load-invariant: a busy machine changes milliseconds, never how many elements Blink had
 * to walk. This is the metric that found the root-element custom-property bug on aldamusic
 * and it is the right one for anything of the form "a per-frame write on an ancestor".
 *
 * An unregistered custom property INHERITS, so writing one on a section invalidates the
 * inherited-style chain of everything inside it. .al-shop holds 776 nodes.
 */
import puppeteer from 'puppeteer-core';
const URL_ = process.env.URL || 'http://localhost:8812/';
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless:'new', userDataDir:process.env.PROFILE||'/private/tmp/claude-501/t12-gpu-profile',
  args:['--hide-scrollbars','--autoplay-policy=no-user-gesture-required','--use-angle=metal','--enable-gpu'] });
const p = await b.newPage();
const MOB = !!process.env.MOB;
await p.setViewport(MOB ? { width:390, height:844, deviceScaleFactor:3, isMobile:true, hasTouch:true }
                        : { width:1440, height:900, deviceScaleFactor:2 });
const cdp = await p.target().createCDPSession();
await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
await p.goto(URL_,{waitUntil:'load'});
await p.evaluate(()=>document.fonts.ready);
await new Promise(r=>setTimeout(r,4000));
await p.evaluate(()=>{ const s=document.querySelector('.al-shop'); window.scrollTo(0, s.offsetTop-innerHeight*1.05); });
await new Promise(r=>setTimeout(r,700));

const chunks = [];
cdp.on('Tracing.dataCollected', e => chunks.push(...e.value));
await cdp.send('Tracing.start', { traceConfig: { includedCategories: [
  'disabled-by-default-devtools.timeline','devtools.timeline' ] } });
if (MOB) {
  /* a REAL finger. The reporter's key clue was "smooth until you interact" — the
     main-thread engine only wakes on input, so a scrollTo sweep never reproduces it. */
  await cdp.send('Input.synthesizeScrollGesture', { x:195, y:500, yDistance:-900,
    speed:900, gestureSourceType:'touch' });
  await new Promise(r=>setTimeout(r,1200));
} else {
  await p.evaluate(async () => {
    const s = document.querySelector('.al-shop');
    const from = s.offsetTop - innerHeight*1.05, to = s.offsetTop + innerHeight*0.5;
    for (let i=0;i<50;i++){ window.scrollTo(0, from + (to-from)*i/49); await new Promise(r=>requestAnimationFrame(r)); }
  });
}
await new Promise(r=>setTimeout(r,300));
await cdp.send('Tracing.end');
await new Promise(res => cdp.once('Tracing.tracingComplete', res));

let recalcs=0, elements=0, layouts=0, layoutRoots=0;
for (const e of chunks) {
  if (e.name === 'UpdateLayoutTree') { recalcs++; elements += (e.args?.elementCount)||0; }
  if (e.name === 'Layout') { layouts++; layoutRoots += (e.args?.beginData?.dirtyObjects)||0; }
}
console.log(`${URL_}`);
console.log(`  style recalcs ${recalcs}   ELEMENTS RESTYLED ${elements}   (${recalcs?Math.round(elements/recalcs):0} per pass)`);
console.log(`  layouts ${layouts}   dirty objects ${layoutRoots}`);
await b.close();
