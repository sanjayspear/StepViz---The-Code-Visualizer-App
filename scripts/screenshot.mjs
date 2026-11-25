// Dev helper: screenshot the running app for comparison with the spec PDF.
// Usage: node scripts/screenshot.mjs <url> <out.png> [width=1280] [height=953] [scale=1.5]
import { chromium } from '@playwright/test';

const [url, out, width = '1280', height = '953', scale = '1.5'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(height) },
  deviceScaleFactor: Number(scale),
});
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('saved', out);
