// Practice section in the browser: navigation, ticks and progress, search, filters,
// "Surprise me", previous / next along the current list, the language picker.
import { test, expect, type Page } from '@playwright/test';

const KEY = 'stepviz.practice.v1';
const saved = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), KEY);
const today = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
});

test('Home links to Practice; the tabs go back to Home with the code still there', async ({ page }) => {
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText('x = 1');
  await page.getByRole('navigation').getByRole('link', { name: 'Practice' }).click();
  await expect(page).toHaveURL(/#\/practice$/);
  await expect(page.locator('h1')).toHaveText('0 of 320 solved');
  await expect(page.getByText('Today: 0 of 3 questions done')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Practice' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.practice-topic')).toHaveCount(4);
  await page.getByRole('button', { name: '+ 10 more topics' }).click();
  await expect(page.locator('.practice-topic')).toHaveCount(14);
  await page.getByRole('navigation').getByRole('link', { name: 'Home' }).click();
  await expect(page.locator('.cm-content')).toHaveText('x = 1');
});

test('ticks: kept in localStorage with the day; counts on every screen; untick removes it', async ({ page }) => {
  await page.goto('./#/practice/topic/basics-math');
  await expect(page.locator('h1')).toHaveText('Basics & math');
  await expect(page.locator('.practice-item')).toHaveCount(25);
  await page.getByLabel('Mark Q7 as solved').check();
  await page.getByLabel('Mark Q3 as solved').check();
  await expect(page.getByText('2 of 25 solved')).toBeVisible();
  expect(await saved(page)).toEqual({ version: 1, solved: { 3: today(), 7: today() } });
  // A tick from an earlier day counts as solved but not for today.
  await page.evaluate((k) => {
    const s = JSON.parse(localStorage.getItem(k)!);
    s.solved['30'] = '2020-01-01';
    localStorage.setItem(k, JSON.stringify(s));
  }, KEY);
  await page.goto('./#/practice');
  await page.reload();
  await expect(page.locator('h1')).toHaveText('3 of 320 solved');
  await expect(page.getByText('Today: 2 of 3 questions done')).toBeVisible();
  await expect(page.locator('.practice-topic').first()).toContainText('2 of 25');
  await page.goto('./#/practice/q/7?from=basics-math');
  await expect(page.getByRole('checkbox', { name: /Solved/ })).toBeChecked();
  await page.getByRole('checkbox', { name: /Solved/ }).uncheck();
  await expect(page.getByText('Mark as solved')).toBeVisible();
  expect((await saved(page)).solved).toEqual({ 3: today(), 30: '2020-01-01' });
});

test('every tick target is at least 44 px', async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('./#/practice/topic/strings');
    const box = await page.locator('.practice-tick').first().boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('search by number opens the question; by title filters the list; filters live in the address', async ({ page }) => {
  await page.goto('./#/practice');
  await page.getByRole('searchbox').fill('q145');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page).toHaveURL(/#\/practice\/q\/145$/);
  await expect(page.locator('h1')).toHaveText('Take k cards from either end of a row to get the max total points.');
  await page.goto('./#/practice');
  await page.getByRole('searchbox').fill('palindrome string');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('h1')).toHaveText('All questions');
  await expect(page.locator('.practice-item__num')).toHaveText(['Q5', 'Q27', 'Q118', 'Q194', 'Q208']);
  await expect(page.getByText('Showing 5 of 320 questions')).toBeVisible();
  // Difficulty chips (several at once) and the topic select.
  await page.goto('./#/practice/all');
  await page.getByRole('button', { name: 'Hard' }).click();
  await expect(page).toHaveURL(/d=H/);
  await expect(page.locator('.practice-item')).toHaveCount(23);
  await page.getByRole('button', { name: 'Medium' }).click();
  await expect(page.locator('.practice-item')).toHaveCount(185);
  await page.getByRole('combobox').selectOption('two-pointers');
  await expect(page).toHaveURL(/#\/practice\/topic\/two-pointers\?d=MH/);
  await expect(page.locator('.practice-item')).toHaveCount(11);
  await page.getByRole('searchbox').fill('zzzz');
  await expect(page.getByText('No questions match.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear the search and filters' }).click();
  await expect(page.locator('.practice-item')).toHaveCount(20);
});

test('hide solved, and "Surprise me" opens an unsolved question of the current list', async ({ page }) => {
  await page.goto('./#/practice/topic/basics-math?d=H');
  await expect(page.locator('.practice-item')).toHaveCount(1); // only Q25 is hard in Basics & math
  await page.getByRole('button', { name: 'Surprise me' }).click();
  await expect(page).toHaveURL(/#\/practice\/q\/25\?/);
  await page.getByRole('checkbox', { name: /Mark as solved/ }).check();
  await page.goto('./#/practice/topic/basics-math?d=H');
  await page.getByRole('button', { name: 'Surprise me' }).click();
  await expect(page.getByText('Every question here is solved.')).toBeVisible();
  await page.getByLabel('Hide solved').check();
  await expect(page.getByText('No questions match.')).toBeVisible();
});

test('previous / next follow the list the question was opened from', async ({ page }) => {
  // All topics, hard only: Q25 -> Q55 -> Q85 ...
  await page.goto('./#/practice/all?d=H');
  await page.getByRole('link', { name: /^Q25 / }).click();
  await expect(page.getByText('1 of 23 in All questions')).toBeVisible();
  await expect(page.getByText('First')).toBeVisible();
  await page.getByRole('link', { name: 'Q55' }).click();
  await expect(page.locator('h1')).toHaveText('Find the smallest window in s that contains all characters of t.');
  await page.getByRole('link', { name: 'Q85' }).click();
  await expect(page.getByText('3 of 23 in All questions')).toBeVisible();
  // In a topic list the neighbours are the topic's own.
  await page.goto('./#/practice/q/25?from=basics-math');
  await expect(page.getByText('Last')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Q24' })).toBeVisible();
  // Back goes to the same list, filters kept.
  await page.goto('./#/practice/q/85?d=H');
  await page.getByRole('link', { name: 'All questions' }).click();
  await expect(page).toHaveURL(/#\/practice\/all\?d=H$/);
});

test('language picker: languages without starter code say "coming soon"; unknown questions say so', async ({ page }) => {
  await page.goto('./#/practice/q/7');
  await expect(page.locator('.practice-question select option')).toHaveText([
    'Python (coming soon)',
    'JavaScript (coming soon)',
    'Java (coming soon)',
    'C++ (coming soon)',
    'C (coming soon)',
  ]);
  await page.locator('.practice-question select').selectOption('java');
  await expect(page.getByText('Starter code and tests in Java are coming soon.', { exact: false })).toBeVisible();
  await page.goto('./#/practice/q/999');
  await expect(page.locator('h1')).toHaveText('There is no question 999');
});
