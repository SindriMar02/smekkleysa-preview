import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',userDataDir:'/tmp/smk-img-'+Date.now(),args:['--no-first-run']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8812/',{waitUntil:'load'}); await new Promise(r=>setTimeout(r,3500));
const out=await p.evaluate(()=>{
  const rows=[...document.images].filter(i=>i.complete&&i.naturalWidth===0).slice(0,6).map(i=>({
    cls:i.className, hasSrc:!!i.getAttribute('src'), src:(i.getAttribute('src')||'').slice(-40),
    dataSrc:!!i.getAttribute('data-src'), parent:i.parentElement.className.slice(0,30)}));
  return {count:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).length, rows};
});
console.log(JSON.stringify(out,null,1));
await b.close();
