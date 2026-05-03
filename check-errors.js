const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
    } else {
      console.log(`PAGE LOG: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`UNCAUGHT ERROR: ${error.message}`);
  });

  console.log("Navigating to /...");
  const res = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  console.log("Status:", res.status());
  
  console.log("Navigating to /dashboard...");
  const res2 = await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  console.log("Status Dashboard:", res2.status());

  await browser.close();
})();
