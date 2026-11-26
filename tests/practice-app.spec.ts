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
  // Every question has Python and JavaScript (first and last checked); the other languages come later.
  await page.goto('./#/practice/q/7');
  await expect(page.locator('.practice-question select option').first()).toHaveText('Python');
  await page.goto('./#/practice/q/320');
  await expect(page.locator('.practice-work .cm-content')).toContainText('def largest_number(nums):');
  await expect(page.locator('.practice-question select option')).toHaveText([
    'Python',
    'JavaScript',
    'Java (coming soon)',
    'C++ (coming soon)',
    'C (coming soon)',
  ]);
  await page.locator('.practice-question select').selectOption('java');
  await expect(page.getByText('Starter code and tests in Java are coming soon.', { exact: false })).toBeVisible();
  await page.goto('./#/practice/q/999');
  await expect(page.locator('h1')).toHaveText('There is no question 999');
});

// ---- P2: Python starter code, tests and hints ------------------------------------

const answer = (page: Page) => page.locator('.practice-work .cm-content');
async function typeAnswer(page: Page, code: string) {
  await answer(page).click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');
  await page.keyboard.insertText(code);
}

test('P2: the starter fails its tests; a right answer passes them all and asks "Mark as solved?"', async ({ page }) => {
  await page.goto('./#/practice/q/3?from=basics-math');
  await expect(page.getByText('Example: digit_sum(1234) returns 10.')).toBeVisible();
  await expect(answer(page)).toContainText('def digit_sum(n):');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.getByText('0 of 5 tests passed')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('.practice-test').first()).toContainText('Failed');
  await expect(page.locator('.practice-test').first()).toContainText('It gave None.');
  await typeAnswer(page, 'def digit_sum(n):\n    return sum(int(c) for c in str(n))\n');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.getByText('5 of 5 tests passed')).toBeVisible();
  await expect(page.getByText('All tests passed.')).toBeVisible();
  await page.getByRole('button', { name: 'Mark as solved', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: /Solved/ })).toBeChecked();
  expect(Object.keys((await saved(page)).solved)).toEqual(['3']);
});

test('P2: the question\'s own rule (no % in Q2), the hint, and a crash in a test', async ({ page }) => {
  await page.goto('./#/practice/q/2');
  await typeAnswer(page, 'def is_even(n):\n    return n % 2 == 0\n');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.locator('.practice-problem')).toHaveText('Line 2: This question asks you to find the answer without %. Your code uses %.', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Hint' }).click();
  await expect(page.locator('.practice-hint')).toContainText('Like sharing sweets between two people');
  await typeAnswer(page, 'def is_even(n):\n    return 1 // (n - 4) == 0\n');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.locator('.practice-test').first()).toContainText('It stopped with ZeroDivisionError: division by zero (line 2).');
});

test('P2: "Visualize my code" shows the answer step by step; "New code" comes back with it; a reload forgets it', async ({ page }) => {
  await page.goto('./#/practice/q/7?from=basics-math');
  await typeAnswer(page, 'def factorial_iter(n):\n    r = 1\n    for i in range(2, n + 1):\n        r *= i\n    return r\n\nprint(factorial_iter(3))\n');
  await page.getByRole('button', { name: 'Visualize my code' }).click();
  const next = page.getByRole('button', { name: 'Next step' });
  await expect(next).toBeVisible({ timeout: 60_000 });
  while (await next.isEnabled()) await next.click();
  await expect(page.locator('.output, [class*=output]').first()).toContainText('6');
  await page.getByRole('button', { name: /New code/ }).click();
  await expect(page.locator('h1')).toHaveText('Compute the factorial of n, both iteratively and recursively.');
  await expect(answer(page)).toContainText('print(factorial_iter(3))');
  // Never stored: only the ticks are in localStorage, and a reload starts from the starter code.
  expect(await page.evaluate(() => Object.keys(localStorage))).not.toContain('stepviz.practice.answers');
  expect(JSON.stringify(await page.evaluate(() => ({ ...localStorage })))).not.toContain('factorial_iter(3)');
  await page.reload();
  await expect(answer(page)).toContainText('def factorial_rec(n):');
  await expect(answer(page)).not.toContainText('print(factorial_iter(3))');
});

test('JavaScript: the starter, Run tests in the JavaScript worker, a rule, and Visualize my code', async ({ page }) => {
  await page.goto('./#/practice/q/3?from=basics-math');
  await page.locator('.practice-question select').selectOption('javascript');
  await expect(page.getByText('Example: digitSum(1234) returns 10.')).toBeVisible();
  await expect(answer(page)).toContainText('function digitSum(n) {');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.getByText('0 of 5 tests passed')).toBeVisible();
  await expect(page.locator('.practice-test').first()).toContainText('It gave null.');
  await typeAnswer(page, 'function digitSum(n) {\n  let t = 0;\n  for (const c of String(n)) t += Number(c);\n  return t;\n}\nconsole.log(digitSum(42));\n');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.getByText('5 of 5 tests passed')).toBeVisible();
  await expect(page.getByText('All tests passed.')).toBeVisible();
  // Q2 forbids %.
  await page.goto('./#/practice/q/2?from=basics-math');
  await page.locator('.practice-question select').selectOption('javascript');
  await typeAnswer(page, 'function isEven(n) {\n  return n % 2 === 0;\n}\n');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.getByText('Line 2: This question asks you to find the answer without %. Your code uses %.')).toBeVisible();
  // The visualiser runs the JavaScript answer.
  await page.goto('./#/practice/q/3?from=basics-math');
  await page.locator('.practice-question select').selectOption('javascript');
  await typeAnswer(page, 'function digitSum(n) {\n  let t = 0;\n  while (n > 0) {\n    t += n % 10;\n    n = Math.floor(n / 10);\n  }\n  return t;\n}\nconsole.log(digitSum(42));\n');
  await page.getByRole('button', { name: 'Visualize my code' }).click();
  await expect(page.getByRole('button', { name: /New code/ })).toBeVisible();
  await expect(page.locator('body')).toContainText('digitSum(42)');
});

test('Java: the starter, Run tests in the Java worker, a rule, and Visualize my code', async ({ page }) => {
  await page.goto('./#/practice/q/3?from=basics-math');
  await page.locator('.practice-question select').selectOption('java');
  await expect(page.getByText('Example: digitSum(1234) returns 10.')).toBeVisible();
  await expect(answer(page)).toContainText('static int digitSum(int n) {');
  await page.getByRole('button', { name: 'Run tests' }).click();
  // The starter's placeholder return 0 passes digitSum(0) only.
  await expect(page.getByText('1 of 5 tests passed')).toBeVisible({ timeout: 30_000 });
  await typeAnswer(page, 'public class Main {\n    static int digitSum(int n) {\n        int t = 0;\n        while (n > 0) {\n            t += n % 10;\n            n /= 10;\n        }\n        return t;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(digitSum(42));\n    }\n}\n');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.getByText('5 of 5 tests passed')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Visualize my code' }).click();
  await expect(page.getByRole('button', { name: /New code/ })).toBeVisible({ timeout: 30_000 });
  await page.goto('./#/practice/q/2?from=basics-math');
  await page.locator('.practice-question select').selectOption('java');
  await typeAnswer(page, 'public class Main {\n    static boolean isEven(int n) {\n        return n % 2 == 0;\n    }\n\n    public static void main(String[] args) {\n    }\n}\n');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.getByText('Line 3: This question asks you to find the answer without %. Your code uses %.')).toBeVisible({ timeout: 30_000 });
});
