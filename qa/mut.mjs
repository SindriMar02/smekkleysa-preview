/* WHAT is actually mutating, per frame, and how often.
 *
 * fps tells you a section is slow; a breakdown tells you it is style recalc; neither
 * tells you WHICH write. This does, and it is load-invariant, because it counts DOM
 * mutations rather than milliseconds — the same busy machine that makes qa/seg.mjs
 * swing 8fps between two identical runs cannot change how many attributes were written.
 *
 * It is how the header bug was found: `data-hidden` was being set on every scroll
 * frame whatever its value, 58 times over a 60-frame sweep, on a position:fixed element
 * sitting above the whole page. Nothing in the fps numbers pointed at the header at all.
 *
 * Read it as: anything at roughly one-per-frame that is not obviously per-frame work is
 * a suspect. A guarded write shows up as a handful; an unguarded one shows up as ~60.
 */
import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,
 userDataDir:'/private/tmp/claude-501/t12-qa-profile',args:['--hide-scrollbars','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
const cdp=await p.target().createCDPSession(); await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await p.goto('http://localhost:8812/',{waitUntil:'load'});
await p.evaluate(()=>document.fonts.ready); await new Promise(r=>setTimeout(r,3200));
const out=await p.evaluate(async()=>{
  const e=document.querySelector('#rekkarnir'), top=e.offsetTop;
  const end=Math.min(top+e.offsetHeight, document.documentElement.scrollHeight-innerHeight);
  window.scrollTo(0,top); await new Promise(r=>setTimeout(r,900));
  const tally={};
  const key=(m)=>{
    const t=m.target.nodeType===1?m.target:m.target.parentElement;
    const c=(t?.className||'').toString().split(' ')[0]||t?.tagName?.toLowerCase()||'?';
    return `${m.type}:${c}${m.attributeName?'['+m.attributeName+']':''}`;
  };
  const mo=new MutationObserver(l=>l.forEach(m=>{const k=key(m);tally[k]=(tally[k]||0)+1;}));
  mo.observe(document.documentElement,{attributes:true,childList:true,characterData:true,subtree:true});
  for(let i=0;i<60;i++){window.scrollTo(0, top+((end-top)*i/59)); await new Promise(r=>requestAnimationFrame(r));}
  mo.disconnect();
  return Object.entries(tally).sort((a,z)=>z[1]-a[1]).slice(0,18);
});
console.log('DOM mutations over a 60-frame sweep of #rekkarnir:');
out.forEach(([k,v])=>console.log(String(v).padStart(6), k));
await b.close();
