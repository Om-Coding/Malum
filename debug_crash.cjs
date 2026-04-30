const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:4173/login', { waitUntil: 'networkidle0' });
    
    // Check if we need to pick a role
    const studentBtn = await page.$('text/Student');
    if (studentBtn) {
      await studentBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Fill in email and password
    console.log('Typing credentials...');
    const inputs = await page.$$('input');
    // Assuming 0 is email, 1 is password
    await inputs[0].type('test@test.com');
    await inputs[1].type('password123');
    
    console.log('Clicking login...');
    const btn = await page.$('button[type="submit"]');
    await btn.click();
    
    // Wait a bit to see if there's a crash
    await page.waitForTimeout(3000);
    console.log('Done waiting.');
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  } finally {
    await browser.close();
  }
})();
