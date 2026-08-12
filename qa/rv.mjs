import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:'/tmp/smk-rv-'+Date.now(),args:['--no-first-run']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8812/',{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
await new Promise(r=>setTimeout(r,3500));
const out=await p.evaluate(async()=>{
  const targets=[['.al-rel','rail card'],['#al-hist-h','history h2'],['#al-shop-h','shop h2'],
                 ['.al-era','timeline card'],['#al-parent-h','band h2'],['.al-lead','lead p']];
  const res={};
  for(const [sel,label] of targets){
    const el=document.querySelector(sel); if(!el){res[label]='(missing)';continue;}
    const top=el.getBoundingClientRect().top+scrollY;
    const seen=[];
    for(let f=-0.9;f<=0.9;f+=0.3){
      window.scrollTo({top:top-innerHeight*0.5+f*innerHeight,behavior:'instant'});
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      await new Promise(r=>setTimeout(r,70));
      const cs=getComputedStyle(el);
      seen.push(Number(cs.getPropertyValue('--rv').trim()||-1).toFixed(2));
    }
    const cs=getComputedStyle(el);
    res[label]={rvAcrossScroll:seen, inHorizScroller:!!el.closest('[class*=rail],[class*=track],.al-shop-rail'),
                animationTimeline:cs.animationTimeline, animationName:cs.animationName};
  }
  res.supportsViewTimeline=CSS.supports('animation-timeline: view()');
  res.dataSdp=document.documentElement.dataset.sdp??document.body.dataset.sdp??'(unset)';
  return res;
});
console.log(JSON.stringify(out,null,1));
await b.close();
