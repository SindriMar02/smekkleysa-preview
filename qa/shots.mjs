import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:'/tmp/smk-shot-'+Date.now(),args:['--no-first-run']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8812/',{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
await new Promise(r=>setTimeout(r,3800));
const targets=['#sagan','.al-parent','.al-cta','.al-ft'];
for(const t of targets){
  const ok=await p.evaluate(sel=>{const e=document.querySelector(sel); if(!e) return false;
    window.scrollTo({top: e.getBoundingClientRect().top+scrollY-40, behavior:'instant'}); return true;}, t);
  if(!ok){ console.log('missing', t); continue; }
  await new Promise(r=>setTimeout(r,1400));
  await p.screenshot({path:`/tmp/smk-sec-${t.replace(/[#.]/g,'')}.png`});
  console.log('shot', t);
}
await b.close();
