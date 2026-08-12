import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:'/tmp/smk-diag-'+Date.now(),args:['--no-first-run']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8812/',{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
await new Promise(r=>setTimeout(r,3500));

const clip = await p.evaluate(()=>{
  const c=document.createElement('canvas').getContext('2d');
  const out={};
  for (const size of [124]) {
    c.font=`800 ${size}px Stencil`;
    const m=s=>{const t=c.measureText(s);return{asc:+t.actualBoundingBoxAscent.toFixed(1),desc:+t.actualBoundingBoxDescent.toFixed(1)};};
    out.ink={ 'Á':m('Á'),'F':m('F'),'Þ':m('Þ'),'É':m('É'),'g':m('g'),'ú':m('ú') };
    out.size=size;
  }
  const heads=[...document.querySelectorAll('.al-h2, .al-parent-h, .al-hist-h')];
  out.rows=heads.slice(0,4).map(h=>{
    const row=h.querySelector('.al-row'); if(!row) return null;
    const cs=getComputedStyle(row), ch=h.querySelector('.al-ch');
    const rr=row.getBoundingClientRect(), cr=ch.getBoundingClientRect();
    return { id:h.id||h.className.slice(0,20), fontSize:parseFloat(cs.fontSize), lineHeight:parseFloat(cs.lineHeight),
             padTop:parseFloat(cs.paddingTop), overflow:cs.overflow,
             headroom:+(cr.top-rr.top).toFixed(1), footroom:+(rr.bottom-cr.bottom).toFixed(1) };
  }).filter(Boolean);
  return out;
});

const rail = await p.evaluate(async ()=>{
  const sec=document.querySelector('#plotur'), card=document.querySelector('.al-rel');
  const top=sec.getBoundingClientRect().top+scrollY, out=[];
  for(let f=-0.3;f<=1.3;f+=0.1){
    window.scrollTo({top:top+f*innerHeight,behavior:'instant'});
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    await new Promise(r=>setTimeout(r,90));
    const scs=getComputedStyle(sec), ccs=getComputedStyle(card);
    out.push({f:+f.toFixed(1), exit:+(scs.getPropertyValue('--al-exit').trim()||0),
      secScale:+new DOMMatrix(scs.transform).a.toFixed(3),
      rv:+Number(ccs.getPropertyValue('--rv').trim()||0).toFixed(2), cardOp:+Number(ccs.opacity).toFixed(2)});
  }
  return out;
});
console.log('CLIP', JSON.stringify(clip,null,1));
console.log('RAIL f=fraction of viewport scrolled past section top');
rail.forEach(r=>console.log(`  f=${String(r.f).padStart(5)}  exit=${String(r.exit).padStart(5)}  secScale=${r.secScale}  rv=${String(r.rv).padStart(4)}  cardOpacity=${r.cardOp}`));
await b.close();
