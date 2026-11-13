const { chromium } = require('playwright');
(async () => {
  const [,, src, out, size] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:+size,height:+size}});
  const fs=require('fs'); const svg=fs.readFileSync(src,'utf8');
  await p.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" style="width:${size}px;height:${size}px;object-fit:contain"></body></html>`);
  await p.screenshot({path:out, omitBackground:true}); await b.close();
})();
