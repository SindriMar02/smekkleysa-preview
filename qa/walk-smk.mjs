import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new', userDataDir:'/tmp/smk-walk-'+Date.now(), args:['--no-first-run'] });
const p = await b.newPage();
const MOB = process.argv[2]==='mobile';
await p.setViewport(MOB?{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true}:{width:1440,height:900});
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message.slice(0,110)));
p.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text().slice(0,110)); });
const bad=[]; p.on('response',r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url().split('/').pop()); });
await p.goto(process.env.URL||'http://localhost:8812/',{waitUntil:'load',timeout:45000});
await p.evaluate(()=>document.fonts.ready);
await new Promise(r=>setTimeout(r,3800));
const H = await p.evaluate(()=>document.documentElement.scrollHeight);
const vh = MOB?844:900;
const shots = Math.min(9, Math.ceil(H/vh));
for(let i=0;i<shots;i++){
  await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}), i*vh*0.92);
  await new Promise(r=>setTimeout(r,900));
  await p.screenshot({path:`/tmp/smk-${MOB?'m':'d'}${i}.png`});
}
const info = await p.evaluate(()=>({
  h1: document.querySelectorAll('h1').length,
  hScroll: document.documentElement.scrollWidth > innerWidth+2,
  scrollW: document.documentElement.scrollWidth, innerW: innerWidth,
  height: document.documentElement.scrollHeight,
  jsonld: document.querySelectorAll('script[type="application/ld+json"]').length,
  imgs: document.images.length,
  brokenImg: [...document.images].filter(i=>i.complete&&i.naturalWidth===0).length,
}));
console.log(JSON.stringify({shots, ...info, errors:errs.slice(0,6), http:bad.slice(0,8)},null,1));
await b.close();
