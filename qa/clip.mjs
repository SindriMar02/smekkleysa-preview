import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:'/tmp/smk-clip-'+Date.now(),args:['--no-first-run']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8812/',{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
await new Promise(r=>setTimeout(r,3000));
const out=await p.evaluate(()=>{
  const c=document.createElement('canvas').getContext('2d');
  const at=(px,w)=>{c.font=`${w} ${px}px Stencil`;
    const g=s=>{const t=c.measureText(s);return{asc:+t.actualBoundingBoxAscent.toFixed(1),desc:+t.actualBoundingBoxDescent.toFixed(1)};};
    return {A:g('Á'),U:g('Ú'),I:g('Í'),TH:g('Þ'),F:g('F'),g:g('g'),j:g('j'),y:g('y')};};
  const ink=at(100,800);
  // for each heading: mask top/bottom vs the actual painted ink extremes
  const res=[];
  document.querySelectorAll('.al-h2, .al-parent-h, #al-hist-h').forEach(h=>{
    h.querySelectorAll('.al-row').forEach((row,ri)=>{
      const cs=getComputedStyle(row); const fs=parseFloat(cs.fontSize);
      const rr=row.getBoundingClientRect();
      const inner=row.querySelector('.al-row-i'); if(!inner) return;
      const ir=inner.getBoundingClientRect();
      const txt=inner.textContent;
      // ink extremes for THIS row's text, in px at this font size
      c.font=`${cs.fontWeight} ${fs}px Stencil`;
      const t=c.measureText(txt);
      // baseline position inside the inline box: half-leading model
      const lh=parseFloat(cs.lineHeight);
      res.push({ id:h.id||h.className.slice(0,18), row:ri, fs:+fs.toFixed(1), lh:+lh.toFixed(1),
        padTop:+parseFloat(cs.paddingTop).toFixed(1), overflow:cs.overflow,
        inkAsc:+t.actualBoundingBoxAscent.toFixed(1), inkDesc:+t.actualBoundingBoxDescent.toFixed(1),
        maskTop:+rr.top.toFixed(1), maskBot:+rr.bottom.toFixed(1),
        innerTop:+ir.top.toFixed(1), innerBot:+ir.bottom.toFixed(1),
        text:txt.trim().slice(0,22) });
    });
  });
  return {inkPer100px:ink, rows:res};
});
console.log(JSON.stringify(out,null,1));
await b.close();
