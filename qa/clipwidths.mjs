import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:'/tmp/smk-cw-'+Date.now(),args:['--no-first-run']});
for (const W of [1200,1280,1440,1024,900,600,390]) {
  const p=await b.newPage(); await p.setViewport({width:W,height:900});
  await p.goto('http://localhost:8812/',{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
  await new Promise(r=>setTimeout(r,2600));
  const r=await p.evaluate(()=>{
    const out=[];
    // any element whose INK is cut by an ancestor with overflow hidden
    const probe=(el,label)=>{
      if(!el) return;
      const er=el.getBoundingClientRect();
      let n=el.parentElement, clipped=null;
      while(n && n!==document.body){
        const cs=getComputedStyle(n);
        if(cs.overflow!=='visible'&&cs.overflowY!=='visible'){
          const nr=n.getBoundingClientRect();
          const cutTop=+(nr.top-er.top).toFixed(1), cutBot=+(er.bottom-nr.bottom).toFixed(1);
          if(cutTop>0.6||cutBot>0.6) clipped={by:n.className.toString().slice(0,22),cutTop,cutBot};
          break;
        }
        n=n.parentElement;
      }
      if(clipped) out.push({label,...clipped});
    };
    document.querySelectorAll('.al-row-i').forEach((e,i)=>probe(e,'row-i['+i+'] "'+e.textContent.trim().slice(0,14)+'"'));
    document.querySelectorAll('.al-odo-i').forEach((e,i)=>probe(e,'odo['+i+'] "'+e.textContent.trim()+'"'));
    return out;
  });
  console.log(`${String(W).padStart(4)}px  ${r.length? JSON.stringify(r.slice(0,4)) : 'clean'}`);
  await p.close();
}
await b.close();
