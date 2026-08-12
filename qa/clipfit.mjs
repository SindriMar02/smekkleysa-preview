import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';
import fs from 'node:fs';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:'/tmp/smk-cf-'+Date.now(),args:['--no-first-run']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8812/',{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
await new Promise(r=>setTimeout(r,3000));
await p.addStyleTag({content:'#pad{}'});
async function measure(em, sel){
  await p.evaluate((e,s,vis)=>{
    let st=document.getElementById('padtest');
    if(!st){st=document.createElement('style');st.id='padtest';document.head.appendChild(st);}
    st.textContent = e===null ? '' :
      `.al-row{padding-top:${e}em !important;margin-top:-${e}em !important;}`;
    document.querySelector(s).scrollIntoView({block:'center',behavior:'instant'});
    document.querySelectorAll('.al-row').forEach(r=>r.style.overflow = vis?'visible':'');
  }, em, sel, false);
  await new Promise(r=>setTimeout(r,700));
  const el=await p.$(sel); await el.screenshot({path:'/tmp/cf-a.png'});
  await p.evaluate(()=>document.querySelectorAll('.al-row').forEach(r=>r.style.overflow='visible'));
  await new Promise(r=>setTimeout(r,500));
  await el.screenshot({path:'/tmp/cf-b.png'});
  const A=PNG.sync.read(fs.readFileSync('/tmp/cf-a.png')), B=PNG.sync.read(fs.readFileSync('/tmp/cf-b.png'));
  if(A.width!==B.width||A.height!==B.height) return 'size-diff';
  let d=0; for(let i=0;i<A.data.length;i+=4)
    if(Math.abs(A.data[i]-B.data[i])>12||Math.abs(A.data[i+1]-B.data[i+1])>12||Math.abs(A.data[i+2]-B.data[i+2])>12) d++;
  return d;
}
for (const sel of ['#al-shop-h','#al-hist-h','#al-roll-h','#al-parent-h']) {
  const row=[];
  for (const em of [0.20,0.26,0.30,0.34,0.38]) row.push(`${em}:${await measure(em,sel)}`);
  console.log(sel.padEnd(16), row.join('  '));
}
await b.close();
