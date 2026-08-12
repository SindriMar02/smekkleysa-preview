import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:'/tmp/smk-c-'+Date.now(),args:['--no-first-run']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto(process.env.URL||'http://localhost:8812/',{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
await new Promise(r=>setTimeout(r,3800));
await p.evaluate(()=>{ // reveal everything so nothing is skipped for being mid-transition
  document.querySelectorAll('[class*=al-]').forEach(e=>e.classList.add('is-in'));
});
const bad=await p.evaluate(()=>{
  const lum=c=>{const m=(c||'').match(/[\d.]+/g); if(!m) return null;
    const [r,g,bb]=m.slice(0,3).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
    return 0.2126*r+0.7152*g+0.0722*bb;};
  const bgOf=e=>{let n=e; while(n&&n!==document.documentElement){const c=getComputedStyle(n).backgroundColor;
    if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; n=n.parentElement;} return 'rgb(11,8,9)';};
  const out=[];
  document.querySelectorAll('p,a,span,h1,h2,h3,h4,li,button,em,strong,figcaption,time,small').forEach(e=>{
    const t=e.textContent.trim(); if(!t||e.children.length) return;
    const cs=getComputedStyle(e);
    if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity<0.15) return;
    const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) return;
    const L1=lum(cs.color), L2=lum(bgOf(e)); if(L1==null||L2==null) return;
    const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    const px=parseFloat(cs.fontSize), bold=+cs.fontWeight>=700;
    const need=(px>=24||(px>=18.66&&bold))?3:4.5;
    if(ratio<need) out.push({cls:(e.className||e.tagName).toString().slice(0,34), color:cs.color,
      bg:bgOf(e), px:+px.toFixed(1), ratio:+ratio.toFixed(2), need, text:t.slice(0,26)});
  });
  const seen=new Set();
  return out.filter(o=>{const k=o.cls+o.ratio; if(seen.has(k))return false; seen.add(k); return true;});
});
console.log(bad.length? JSON.stringify(bad,null,1) : 'CONTRAST PASS: no element below AA');
await b.close();
