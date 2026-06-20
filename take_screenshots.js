const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  
  // Student Context
  const studentContext = await browser.newContext();
  const studentPage = await studentContext.newPage();
  
  console.log('Navigating to login...');
  await studentPage.goto('http://localhost:5173/login');
  
  console.log('Logging in as student...');
  await studentPage.fill('input[type="email"]', 'student@example.com');
  await studentPage.fill('input[type="password"]', 'password123');
  await studentPage.click('button[type="submit"]');
  
  console.log('Waiting for student dashboard to load...');
  await studentPage.waitForURL('http://localhost:5173/dashboard');
  await studentPage.waitForLoadState('networkidle');
  // Wait a bit for charts to animate
  await studentPage.waitForTimeout(2000);
  
  console.log('Taking student dashboard screenshot...');
  await studentPage.screenshot({ path: path.join(__dirname, 'docs', 'screenshots', 'student_dashboard.png'), fullPage: true });
  
  console.log('Navigating to course details...');
  await studentPage.goto('http://localhost:5173/courses/1');
  await studentPage.waitForLoadState('networkidle');
  await studentPage.waitForTimeout(1000);
  
  console.log('Taking course details screenshot...');
  await studentPage.screenshot({ path: path.join(__dirname, 'docs', 'screenshots', 'course_details.png'), fullPage: true });

  await studentContext.close();
  
  // Mentor Context
  const mentorContext = await browser.newContext();
  const mentorPage = await mentorContext.newPage();
  
  console.log('Navigating to login for mentor...');
  await mentorPage.goto('http://localhost:5173/login');
  
  console.log('Logging in as mentor...');
  await mentorPage.fill('input[type="email"]', 'mentor@example.com');
  await mentorPage.fill('input[type="password"]', 'password123');
  await mentorPage.click('button[type="submit"]');
  
  console.log('Waiting for mentor dashboard to load...');
  await mentorPage.waitForURL('http://localhost:5173/mentor');
  await mentorPage.waitForLoadState('networkidle');
  await mentorPage.waitForTimeout(2000);
  
  console.log('Taking mentor dashboard screenshot...');
  await mentorPage.screenshot({ path: path.join(__dirname, 'docs', 'screenshots', 'mentor_dashboard.png'), fullPage: true });
  
  await mentorContext.close();
  await browser.close();
  console.log('All screenshots captured!');
})();
