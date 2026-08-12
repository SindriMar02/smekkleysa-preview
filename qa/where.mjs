/* Where does the frame actually GO — script, style, layout, or paint?
 *
 * Durations from CDP Performance metrics, which are far less load-sensitive than frame
 * counts. Whatever TaskDuration exceeds script+style+layout by is paint and compositing.
 *
 * A warning worth keeping, learned here: this is a MEASUREMENT, not a comparison
 * harness. Two identical baseline runs on a machine at load average 4 came back 1610
 * and 1484, an 8% spread with nothing changed, which is wider than most of the changes
 * worth making. Do not conclude anything from a single A/B inside that band. Kill every
 * leftover headless Chrome, check `uptime`, and run the baseline twice before believing
 * a delta.
 */
import puppeteer from 'puppeteer-core';
const SEC=process.env.SEC||'#rekkarnir';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,
 userDataDir:'/private/tmp/claude-501/t12-qa-profile',args:['--hide-scrollbars','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
const cdp=await p.target().createCDPSession();
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await cdp.send('Performance.enable');
await p.goto('http://localhost:8812/',{waitUntil:'load'});
await p.evaluate(()=>document.fonts.ready); await new Promise(r=>setTimeout(r,3500));
const get=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
await p.evaluate(async(s)=>{const e=document.querySelector(s);window.scrollTo(0,e.offsetTop);await new Promise(r=>setTimeout(r,900));},SEC);
const a=await get();
await p.evaluate(async(s)=>{
  const e=document.querySelector(s), top=e.offsetTop;
  const end=Math.min(top+e.offsetHeight, document.documentElement.scrollHeight-innerHeight);
  for(let i=0;i<60;i++){window.scrollTo(0, top+((end-top)*i/59)); await new Promise(r=>requestAnimationFrame(r));}
},SEC);
const z=await get();
const d=(k)=>+(z[k]-a[k]).toFixed(3);
console.log(`--- ${SEC} : 60-frame sweep, CPU x4 ---`);
console.log(`script      ${String(d('ScriptDuration')*1000|0).padStart(6)}ms`);
console.log(`recalcStyle ${String(d('RecalcStyleDuration')*1000|0).padStart(6)}ms   ${d('RecalcStyleCount')} passes`);
console.log(`layout      ${String(d('LayoutDuration')*1000|0).padStart(6)}ms   ${d('LayoutCount')} passes`);
console.log(`task total  ${String(d('TaskDuration')*1000|0).padStart(6)}ms`);
console.log(`nodes ${z.Nodes|0}  layoutObjects ${z.LayoutObjects|0}  jsHeap ${(z.JSHeapUsedSize/1048576).toFixed(1)}MB`);
await b.close();
