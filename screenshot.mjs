import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  const screenshotsDir = path.join(process.cwd(), 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)){
      fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Helper to wait for network idle to ensure everything is loaded
  const waitUntil = 'networkidle';

  console.log('Logging in as student...');
  await page.goto('http://localhost:5173/', { waitUntil });
  await page.fill('input[type="email"]', 'student@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(2000); // Give it some time to render
  console.log('Taking student_dashboard screenshot...');
  await page.screenshot({ path: path.join(screenshotsDir, 'student_dashboard.png') });
  
  console.log('Navigating to course 1...');
  await page.goto('http://localhost:5173/courses/1', { waitUntil });
  await page.waitForTimeout(2000);
  console.log('Taking course_details screenshot...');
  await page.screenshot({ path: path.join(screenshotsDir, 'course_details.png') });

  // Logout
  await context.clearCookies();
  
  console.log('Logging in as mentor...');
  await page.goto('http://localhost:5173/', { waitUntil });
  await page.fill('input[type="email"]', 'mentor@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/mentor');
  await page.waitForTimeout(2000);
  console.log('Taking mentor_dashboard screenshot...');
  await page.screenshot({ path: path.join(screenshotsDir, 'mentor_dashboard.png') });

  await browser.close();
  console.log('Done!');
})();
