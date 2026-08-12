import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';
import fs from 'node:fs';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:'/tmp/smk-ct-'+Date.now(),args:['--no-first-run']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8812/',{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
await new Promise(r=>setTimeout(r,3000));
async function shot(sel,file,visible){
  await p.evaluate((s,v)=>{
    const el=document.querySelector(s);
    el.scrollIntoView({block:'center',behavior:'instant'});
    document.querySelectorAll('.al-row').forEach(r=>{ r.style.overflow = v?'visible':''; });
  }, sel, visible);
  await new Promise(r=>setTimeout(r,1200));
  const el=await p.$(sel);
  await el.screenshot({path:file});
}
for (const [sel,name] of [['#al-hist-h','hist'],['#al-shop-h','shop'],['#al-parent-h','band']]) {
  await shot(sel,`/tmp/clip-${name}-masked.png`,false);
  await shot(sel,`/tmp/clip-${name}-visible.png`,true);
  const a=PNG.sync.read(fs.readFileSync(`/tmp/clip-${name}-masked.png`));
  const c=PNG.sync.read(fs.readFileSync(`/tmp/clip-${name}-visible.png`));
  if(a.width!==c.width||a.height!==c.height){ console.log(name,'SIZE DIFF',a.width+'x'+a.height,'vs',c.width+'x'+c.height); continue; }
  let diff=0, firstRow=-1;
  for(let y=0;y<a.height;y++) for(let x=0;x<a.width;x++){
    const i=(a.width*y+x)<<2;
    if(Math.abs(a.data[i]-c.data[i])>12||Math.abs(a.data[i+1]-c.data[i+1])>12||Math.abs(a.data[i+2]-c.data[i+2])>12){
      diff++; if(firstRow<0) firstRow=y; }
  }
  console.log(`${name.padEnd(6)} ${a.width}x${a.height}  differing px: ${diff}  first differing row: ${firstRow}`);
}
await b.close();
