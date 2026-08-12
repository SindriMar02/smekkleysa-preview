import puppeteer from 'puppeteer-core';
const MOB=process.argv[2]==='mobile';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:'/tmp/smk-lag-'+Date.now(),args:['--no-first-run']});
const p=await b.newPage();
await p.setViewport(MOB?{width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true}:{width:1440,height:900});
const cdp=await p.createCDPSession();
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await p.goto('http://localhost:8812/',{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
await new Promise(r=>setTimeout(r,3000));
const secs=['#plotur','#rekkarnir','#sagan','#utgafan'];
for(const s of secs){
  const ok=await p.evaluate(sel=>{const e=document.querySelector(sel); if(!e)return false;
    scrollTo({top:e.getBoundingClientRect().top+scrollY-200,behavior:'instant'}); return true;},s);
  if(!ok){console.log(s,'missing');continue;}
  await new Promise(r=>setTimeout(r,700));
  const res=await p.evaluate(async()=>{
    const t=[]; let last=performance.now(); let stop=false;
    const tick=n=>{t.push(n-last); last=n; if(!stop) requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
    const start=performance.now();
    while(performance.now()-start<2200){ scrollBy(0,14); await new Promise(r=>requestAnimationFrame(r)); }
    stop=true;
    const f=t.slice(3).sort((a,b)=>a-b);
    const p95=f[Math.floor(f.length*0.95)]||0;
    return {frames:f.length, fps:+(1000/(f.reduce((a,b)=>a+b,0)/f.length)).toFixed(1),
            p95:+p95.toFixed(1), over32:f.filter(x=>x>32).length};
  });
  console.log(`${(MOB?'M ':'D ')+s.padEnd(12)} fps ${String(res.fps).padStart(5)}  p95 ${String(res.p95).padStart(6)}ms  frames>32ms ${res.over32}/${res.frames}`);
}
await b.close();
