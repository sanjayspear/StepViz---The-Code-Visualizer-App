// Dev helper: open the Factorial example at a given step and screenshot it.
// Usage: node scripts/screenshot-step.mjs <url> <step> <out.png> [width=1280] [height=875] [scale=1.5]
import { chromium } from '@playwright/test';

const [url, stepArg, out, width = '1280', height = '875', scale = '1.5'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(height) },
  deviceScaleFactor: Number(scale),
  reducedMotion: 'reduce',
});
await page.goto(url);
await page.getByRole('button', { name: /Visualize my code/ }).click();
for (let i = 1; i < Number(stepArg); i++) await page.keyboard.press('ArrowRight');
await page.evaluate(() => document.fonts.ready);
await page.mouse.move(0, 0);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('saved', out);
