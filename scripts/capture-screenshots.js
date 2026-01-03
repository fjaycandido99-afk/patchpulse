const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// App Store screenshot dimensions (CSS pixels with 3x DPR)
const VIEWPORT = {
  width: 430,
  height: 932,
  deviceScaleFactor: 3, // Results in 1290 x 2796 actual pixels
};

const SCREENSHOTS = [
  { name: '01-home', url: '/home', caption: 'All Your Games In One Place' },
  { name: '02-patches', url: '/patches', caption: 'Never Miss An Update' },
  { name: '03-news', url: '/news', caption: 'Gaming News Curated For You' },
  { name: '04-search', url: '/search', caption: 'Find Any Game' },
  { name: '05-game', url: '/games/fortnite', caption: 'Track Every Game You Love' },
  { name: '06-releases', url: '/releases', caption: 'Upcoming Releases' },
];

const BASE_URL = process.env.BASE_URL || 'https://patchpulse.app';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots', 'appstore');

async function captureScreenshots() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Set mobile user agent
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  );

  // First, enter guest mode
  console.log('Entering guest mode...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });

  try {
    // Click "Continue as Guest" button
    await page.waitForSelector('button:has-text("Continue as Guest"), a:has-text("Continue as Guest"), [href*="guest"]', { timeout: 5000 });
    await page.click('button:has-text("Continue as Guest"), a:has-text("Continue as Guest")');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Guest mode activated!\n');
  } catch (e) {
    // Try clicking by text content
    const guestButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.find(b => b.textContent?.includes('Guest'));
    });
    if (guestButton) {
      await guestButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      console.log('Guest mode activated!\n');
    } else {
      console.log('Could not find guest button, continuing anyway...\n');
    }
  }

  console.log(`Taking screenshots from ${BASE_URL}...\n`);

  for (const screenshot of SCREENSHOTS) {
    const url = `${BASE_URL}${screenshot.url}`;
    const filename = `${screenshot.name}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    try {
      console.log(`Capturing: ${screenshot.caption}`);
      console.log(`  URL: ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait a bit for any animations
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

      await page.screenshot({
        path: filepath,
        fullPage: false, // Capture viewport only
      });

      console.log(`  Saved: ${filename}\n`);
    } catch (error) {
      console.error(`  Error: ${error.message}\n`);
    }
  }

  await browser.close();

  console.log('Done! Screenshots saved to:', OUTPUT_DIR);
  console.log('\nScreenshot dimensions: 1290 x 2796 pixels (iPhone 15 Pro Max)');
}

captureScreenshots().catch(console.error);
