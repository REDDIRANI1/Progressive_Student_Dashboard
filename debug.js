const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', async (response) => {
    if (response.url().includes('/api/dashboard/student')) {
      console.log('Dashboard response status:', response.status());
      if (response.status() === 422) {
        console.log('422 Body:', await response.text());
        // Dump localStorage
        const ls = await page.evaluate(() => localStorage.getItem('token'));
        console.log('Token in localStorage:', ls);
      }
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:5173/login');
  
  await page.fill('input[type="email"]', 'student@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('http://localhost:5173/dashboard');
  await page.waitForTimeout(3000);
  
  await browser.close();
})();
