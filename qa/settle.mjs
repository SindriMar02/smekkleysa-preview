/* Does the roster KEEP UP with the input?
 *
 * Frame-rate work does not touch this and it is the whole of the "the artists lag"
 * complaint. The roll was already moving at exactly 1.00x — one pixel of roster per
 * pixel of scroll — and still read as laggy, because a 0.13s time constant left it
 * about 130ms behind wherever you had put it. At 35fps. Smoothly.
 *
 * Counts FRAMES to settle, not milliseconds, so it says the same thing on a loaded
 * machine as on an idle one. Anything over ~15 frames on desktop reads as trailing;
 * touch should be 3 or fewer, because a finger is continuous and content that does not
 * track it reads as broken no matter how many frames a second it manages.
 *
 * It also reports how many plates are in layout, which is the other half of this
 * section's cost — see the comment on warm() in public/app.js.
 */
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true,
  userDataDir:'/private/tmp/claude-501/t12-qa-profile', args:['--hide-scrollbars','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
for (const [label, vp] of [['desktop',{width:1440,height:900,deviceScaleFactor:1}],
                           ['phone',  {width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true}]]) {
  const p = await b.newPage(); await p.setViewport(vp);
  await p.goto(process.env.URL||'http://localhost:8812/',{waitUntil:'load'});
  await p.evaluate(()=>document.fonts.ready); await new Promise(r=>setTimeout(r,3500));
  const r = await p.evaluate(async () => {
    const sec=document.querySelector('#rekkarnir'), list=document.querySelector('[data-roll-list]');
    const y=(el)=>{const m=new DOMMatrixReadOnly(getComputedStyle(el).transform); return -m.m42;};
    window.scrollTo(0, sec.offsetTop); await new Promise(r=>setTimeout(r,900));
    const from=y(list);
    window.scrollTo(0, sec.offsetTop+400);        /* an instant 400px jump */
    const seen=[]; let n=0;
    while(n++<40){ await new Promise(r=>requestAnimationFrame(r)); seen.push(Math.round(y(list)-from)); }
    const target=seen[seen.length-1];
    const settle=seen.findIndex(v=>Math.abs(v-target)<=1)+1;
    return { target, settle, first8:seen.slice(0,8),
             plates:[...document.querySelectorAll('#rekkarnir [data-plate]')].filter(q=>getComputedStyle(q).display!=='none').length,
             onHasImg: !!document.querySelector('#rekkarnir [data-plate][data-on] img')?.getAttribute('src') };
  });
  console.log(`${label.padEnd(8)} moved ${r.target}px in ${r.settle} frames   first 8: ${r.first8.join(', ')}`);
  console.log(`         plates in layout ${r.plates}/60   active plate has an image: ${r.onHasImg}`);
  await p.close();
}
await b.close();
