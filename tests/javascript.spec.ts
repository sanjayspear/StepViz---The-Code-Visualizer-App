// JavaScript exact trace in the app (Phase 2, stage h).
import { test, expect, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const editorText = (page: Page) => page.locator('.cm-line').allTextContents();
const kicker = (page: Page) => page.locator('.explain-card__kicker');
const nextButton = (page: Page) => page.getByRole('button', { name: 'Next step' });
const visualize = (page: Page) => page.getByRole('button', { name: /Visualize my code|Loading Python…/ });

async function chooseJavaScript(page: Page) {
  await page.goto('./');
  await page.locator('select').selectOption('javascript');
}

async function setCode(page: Page, source: string) {
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');
  await page.keyboard.insertText(source);
}

async function lastStep(page: Page) {
  while (await nextButton(page).isEnabled()) await nextButton(page).click();
}

test('choosing JavaScript swaps the example and the chips to JavaScript', async ({ page }) => {
  await chooseJavaScript(page);
  await expect(page.locator('.editor-card__helper')).toHaveCount(0);
  await expect(visualize(page)).toBeEnabled();
  expect((await editorText(page))[0]).toBe('function factorial(n) {');
  await expect(page.getByRole('button', { name: 'Factorial' })).toHaveAttribute('aria-pressed', 'true');
  const firstLines: Record<string, string> = {
    'Bubble sort': 'const nums = [5, 2, 8, 1];',
    Fibonacci: 'let a = 0, b = 1;',
    'For loop': 'let total = 0;',
  };
  for (const [chip, line] of Object.entries(firstLines)) {
    await page.getByRole('button', { name: chip, exact: true }).click();
    expect((await editorText(page))[0]).toBe(line);
    await expect(page.getByRole('button', { name: chip, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  // Back to Python: the same example in Python.
  await page.locator('select').selectOption('python');
  expect((await editorText(page))[0]).toBe('total = 0');
  // The student's own code is left alone when the language changes.
  await setCode(page, 'my own code');
  await page.locator('select').selectOption('javascript');
  expect(await editorText(page)).toEqual(['my own code']);
});

test('JavaScript Factorial plays its hand-written explanations', async ({ page }) => {
  await chooseJavaScript(page);
  await visualize(page).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('factorial(3)');
  await expect(page.locator('.step-badge')).toHaveText('JavaScript · exact trace');
  await expect(kicker(page)).toHaveText('What is happening · Step 1 of 15');
  await expect(page.locator('.explain-card__what')).toHaveText(
    'JavaScript reads the function and saves factorial for later. Nothing runs yet.',
  );
  for (let i = 0; i < 10; i++) await nextButton(page).click();
  await expect(page.getByTestId('frame').filter({ hasText: 'factorial(1)' }).locator('.frame__vars')).toHaveText(
    'n = 1 → 1 × 1 = 1',
  );
  await lastStep(page);
  await expect(page.locator('.explain-card__what')).toHaveText('console.log(result) shows 6 on the screen. The program is finished.');
  await expect(page.getByTestId('output')).toHaveText('6');
});

test('pasted JavaScript is traced live and explained by the rule-based explainer', async ({ page }) => {
  await chooseJavaScript(page);
  await setCode(page, 'function double(x) {\n  return x * 2;\n}\nconst y = double(4);\nconsole.log(y);');
  await visualize(page).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your code');
  await expect(page.locator('.explain-card__what')).toHaveText(/^(JavaScript saves the function double for later\. Nothing inside it runs yet\.|double is defined now, but its code waits until it is called\.)$/);
  await expect(page.locator('.life-box__text')).toHaveText(/^Like /);
  await nextButton(page).click();
  await expect(page.getByTestId('frame').locator('.frame__name')).toHaveText(['Global', 'double(4)']);
  await expect(page.locator('.explain-card__what')).toContainText('double(4)');
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('8');
  await expect(page.locator('.explain-card__what')).toContainText('8');
});

test('JavaScript Bubble sort uses the loops view', async ({ page }) => {
  await chooseJavaScript(page);
  await page.getByRole('button', { name: 'Bubble sort', exact: true }).click();
  await visualize(page).click();
  await expect(page.locator('.list-card__title')).toHaveText('nums, as a list');
  await expect(page.locator('.var-card__label')).toHaveText(['i', 'j']);
  for (let i = 0; i < 4; i++) await nextButton(page).click();
  await expect(page.locator('.swap-arrow')).toHaveCount(1);
  await expect(page.locator('.history-chip--now')).toHaveText('now [5, 2, 8, 1] → swapping 5 and 2');
});

test('JavaScript errors: syntax stays on Home; a crash shows the error step; endless loops stop', async ({ page }) => {
  await chooseJavaScript(page);
  await setCode(page, 'let total = 0;\nfor (let i = 0; i < 3; i++ {\n}');
  await visualize(page).click();
  await expect(page.locator('.editor-card__error')).toHaveText('Line 2: JavaScript could not understand this line.');

  await setCode(page, 'x = 5;');
  await visualize(page).click();
  await expect(page.locator('.editor-card__error')).toHaveText('Line 1: This name was used before it was given a value.');

  await setCode(page, 'while (true) {}');
  await visualize(page).click();
  await expect(page.locator('.editor-card__error')).toHaveText(
    'Your program ran for a very long time, so we stopped it. Check that every loop can end.',
  );

  await setCode(page, 'console.log("start");\nconst box = null;\nconsole.log(box.size);');
  await visualize(page).click();
  await expect(page.locator('.step-screen')).toBeVisible();
  await lastStep(page);
  await expect(page.locator('.explain-card__what')).toHaveText("These values can't be used together like this.");
  await expect(page.getByTestId('frame').last().locator('.frame__status')).toHaveText('error');
  await expect(page.getByTestId('output-error')).toContainText('TypeError');
});

test('JavaScript runs in a locked-down worker with no network requests', async ({ page, context }) => {
  await chooseJavaScript(page);
  const requests: string[] = [];
  context.on('request', (r) => requests.push(r.url()));
  await setCode(page, 'let n = 0;\ntry {\n  fetch("https://example.com/steal");\n} catch (e) {\n  n = 1;\n}\nconsole.log(n);');
  await visualize(page).click();
  await expect(page.locator('.step-screen')).toBeVisible();
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('1');
  // Only the worker script itself may load (same origin); nothing else.
  expect(requests.filter((u) => !u.includes('js.worker'))).toEqual([]);
  expect(requests.every((u) => u.startsWith('http://localhost:4317/'))).toBe(true);
});

test('no language in the list says "Coming soon" any more', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('select option')).not.toContainText(['coming soon']);
});
