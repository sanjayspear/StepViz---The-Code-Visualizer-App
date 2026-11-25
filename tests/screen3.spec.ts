// Screen 3: loops and arrays (spec section 4), Phase 2 stage (g).
import { test, expect, type Page, type Locator } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const kicker = (page: Page) => page.locator('.explain-card__kicker');
const nextButton = (page: Page) => page.getByRole('button', { name: 'Next step' });
const skipButton = (page: Page) => page.getByRole('button', { name: 'Skip to next pass' });
const columns = (page: Page) => page.locator('.list-col');
const style = (loc: Locator, prop: string) => loc.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

async function openBubbleSort(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Bubble sort', exact: true }).click();
  await page.getByRole('button', { name: /Visualize my code|Loading Python…/ }).click();
  await expect(page.locator('.list-card')).toBeVisible({ timeout: 60_000 });
}

async function goToStep(page: Page, step: number) {
  for (let i = 1; i < step; i++) await nextButton(page).click();
  await expect(kicker(page)).toContainText(new RegExp(`Step ${step} of|Pass|comparison`, 'i'));
}

async function values(page: Page) {
  return page.locator('.list-col__value').allTextContents();
}

test('a list that changes inside a loop shows the list view instead of the call stack', async ({ page }) => {
  await openBubbleSort(page);
  await expect(page.locator('.stack-card')).toHaveCount(0);
  await expect(page.locator('.list-card__title')).toHaveText('nums, as a list');
  await expect(page.locator('.list-card__hint')).toHaveText('Taller bar = bigger number');
  expect(await values(page)).toEqual(['5', '2', '8', '1']);
  await expect(page.locator('.list-col__index')).toHaveText(['index 0', 'index 1', 'index 2', 'index 3']);
  // Value box 88 x 56, mono 24 px semibold; bar 20 px per unit.
  const box = columns(page).first().locator('.list-col__value');
  expect(await style(box, 'width')).toBe('88px');
  expect(await style(box, 'height')).toBe('56px');
  expect(await style(box, 'font-size')).toBe('24px');
  expect(await style(box, 'font-weight')).toBe('600');
  expect(await style(box, 'font-family')).toContain('JetBrains Mono');
  const heights = await page.locator('.list-col__bar').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  expect(heights).toEqual([100, 40, 160, 20]);
  // Other elements: fill #ECEBFF, 2 px #C9C7BC border.
  expect(await style(box, 'background-color')).toBe('rgb(236, 235, 255)');
  expect(await style(box, 'border-top')).toBe('2px solid rgb(201, 199, 188)');
});

test('compared items are yellow with a 3 px border; a swap shows the old list and a curved arrow', async ({ page }) => {
  await openBubbleSort(page);
  await goToStep(page, 4);
  await expect(page.locator('.code-line--active')).toHaveAttribute('data-line', '4');
  await expect(page.locator('.list-col--compared')).toHaveCount(2);
  await expect(page.locator('.swap-arrow')).toHaveCount(0);
  const compared = page.locator('.list-col--compared .list-col__value').first();
  expect(await style(compared, 'background-color')).toBe('rgb(255, 216, 77)');
  expect(await style(compared, 'border-top')).toBe('3px solid rgb(122, 91, 0)');
  expect(await style(page.locator('.list-col--compared .list-col__bar').first(), 'background-color')).toBe('rgb(67, 56, 202)');

  // Step 5: the swap line, shown before it runs.
  await nextButton(page).click();
  await expect(page.locator('.code-line--active')).toHaveAttribute('data-line', '5');
  expect(await values(page)).toEqual(['5', '2', '8', '1']);
  await expect(page.locator('.swap-arrow')).toHaveCount(1);
  await expect(page.locator('.list-col--compared .list-col__value')).toHaveText(['5', '2']);
  await expect(page.locator('.history-chip')).toHaveText(['start [5, 2, 8, 1]', 'now [5, 2, 8, 1] → swapping 5 and 2']);
  expect(await style(page.locator('.history-chip--now'), 'background-color')).toBe('rgb(255, 243, 191)');

  // The next step shows the swapped list; one history chip per swap.
  await nextButton(page).click();
  expect(await values(page)).toEqual(['2', '5', '8', '1']);
  await expect(page.locator('.swap-arrow')).toHaveCount(0);
  await expect(page.locator('.history-chip')).toHaveText([
    'start [5, 2, 8, 1]',
    'swapped 5 and 2',
    'now [2, 5, 8, 1]',
  ]);
});

test('loop variable cards under the code; the moving one (j) is yellow', async ({ page }) => {
  await openBubbleSort(page);
  await goToStep(page, 3);
  const cards = page.locator('.var-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.locator('.var-card__value')).toHaveText(['0', '0']);
  expect(await style(cards.nth(0).locator('.var-card__value'), 'color')).toBe('rgb(232, 232, 244)');
  expect(await style(cards.nth(1).locator('.var-card__value'), 'color')).toBe('rgb(255, 216, 77)');
  expect(await style(cards.nth(0), 'background-color')).toBe('rgb(38, 38, 74)');
});

test('"Skip to next pass" jumps to the first step of the next outer-loop pass', async ({ page }) => {
  await openBubbleSort(page);
  await goToStep(page, 5);
  await skipButton(page).click();
  // Pass 2 starts at step 12 (line 2, i = 1).
  await expect(page.locator('.code-line--active')).toHaveAttribute('data-line', '2');
  await expect(page.locator('.var-card__value').first()).toHaveText('1');
  await skipButton(page).click();
  await expect(page.locator('.var-card__value').first()).toHaveText('2');
  await skipButton(page).click();
  await expect(page.locator('.var-card__value').first()).toHaveText('3');
  // The last pass: nothing to skip to.
  await expect(skipButton(page)).toBeDisabled();
  expect(await style(skipButton(page), 'opacity')).toBe('0.4');
  expect((await skipButton(page).boundingBox())!.height).toBe(48);
});

test('Skip to next pass pauses playback first', async ({ page }) => {
  await page.clock.install();
  await openBubbleSort(page);
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await skipButton(page).click();
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  const line = await page.locator('.code-line--active').getAttribute('data-line');
  await page.clock.runFor(4000);
  await expect(page.locator('.code-line--active')).toHaveAttribute('data-line', line!);
});

test('top bar: Loops view note, Share link, Beginner mode in the menu', async ({ page }) => {
  await openBubbleSort(page);
  await expect(page.locator('.step-topbar__note')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Share link' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Beginner mode/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Beginner mode: on' }).click();
  await expect(page.getByRole('button', { name: 'Beginner mode: off' })).toBeVisible();
  await page.getByRole('button', { name: 'Beginner mode: off' }).click();
});

test('pasted code with a list built in a loop: list view, plain variable names, Step X of N', async ({ page }) => {
  await page.goto('./');
  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText('squares = []\nfor n in range(3):\n    squares.append(n * n)\nprint(squares)');
  await page.getByRole('button', { name: /Visualize my code|Loading Python…/ }).click();
  await expect(page.locator('.list-card__title')).toHaveText('squares, as a list', { timeout: 60_000 });
  await expect(page.locator('.step-topbar__note')).toHaveText('Loops view');
  await expect(kicker(page)).toHaveText('What is happening · Step 1 of 9');
  await expect(page.locator('.var-card__label')).toHaveText(['n']);
  while (await nextButton(page).isEnabled()) await nextButton(page).click();
  expect(await values(page)).toEqual(['0', '1', '4']);
  await expect(page.getByTestId('output')).toHaveText('[0, 1, 4]');
  await expect(page.locator('.history-chip')).toHaveText(['start []', 'now [0, 1, 4]']);
});

test('programs without a changing list keep the call stack view', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Visualize my code/ }).click();
  await expect(page.locator('.stack-card')).toBeVisible();
  await expect(page.locator('.list-card')).toHaveCount(0);
  await expect(skipButton(page)).toHaveCount(0);
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('list view fits at 390 px with Skip under the list and the bottom bar fixed', async ({ page }) => {
    await openBubbleSort(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    const list = (await page.locator('.list-card').boundingBox())!;
    const code = (await page.locator('.code-panel').boundingBox())!;
    expect(code.y).toBeLessThan(list.y);
    const skip = (await skipButton(page).boundingBox())!;
    expect(skip.y).toBeGreaterThan(list.y + list.height - 1);
    expect(Math.round(skip.height)).toBe(48);
    await expect(page.locator('.controls-card').getByRole('button')).toHaveText(['Back', 'Play', 'Next step']);
    expect(await style(page.locator('.controls-card'), 'position')).toBe('fixed');
  });
});

test('loops view at 1280 px: code panel about 55% / list 45%, and line 5 fits without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openBubbleSort(page);
  const code = (await page.locator('.code-panel').boundingBox())!;
  const list = (await page.locator('.list-card').boundingBox())!;
  const share = code.width / (code.width + list.width);
  expect(share).toBeGreaterThan(0.54);
  expect(share).toBeLessThan(0.56);
  const lines = page.locator('.code-lines');
  const { scrollWidth, clientWidth } = await lines.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  const line5 = page.locator('.code-line[data-line="5"] .code-line__text');
  await expect(line5).toHaveText('            nums[j], nums[j + 1] = nums[j + 1], nums[j]');
  expect(await style(line5, 'font-size')).toBe('16px');
  const right = await line5.evaluate((el) => el.getBoundingClientRect().right);
  expect(right).toBeLessThanOrEqual(code.x + code.width);
});

test('long pasted lines scroll inside the code panel only', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText(
    'values = [3, 1, 2]\nfor k in range(len(values)):\n    values[k] = values[k] * 2 + 0 * 1111111111111111111111111111111111111111111111\nprint(values)',
  );
  await page.getByRole('button', { name: /Visualize my code|Loading Python…/ }).click();
  await expect(page.locator('.list-card')).toBeVisible({ timeout: 60_000 });
  const lines = page.locator('.code-lines');
  expect(await lines.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  expect(await style(lines, 'overflow-x')).toBe('auto');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1280);
});

test('Bubble sort plays its hand-written explanations', async ({ page }) => {
  await openBubbleSort(page);
  await expect(page.locator('.step-topbar__note')).toHaveText('Loops view: i = outer pass, j = position being compared');
  await expect(page.locator('.var-card__label')).toHaveText(['i (pass)', 'j (comparing)']);
  await expect(kicker(page)).toHaveText('What is happening · Step 1 of 27');
  await goToStep(page, 5);
  await expect(kicker(page)).toHaveText('What is happening · Pass 1, comparison 1');
  await expect(page.locator('.explain-card__what')).toHaveText(
    '5 is bigger than 2, and 5 sits to the left. The rule says the bigger one must move right, so these two swap places.',
  );
  await expect(page.locator('.life-box__text')).toHaveText(
    'Kids lining up by height. You look at two neighbours, and if the taller one is in front, you ask them to trade places. Repeat down the line until nobody needs to swap.',
  );
  await nextButton(page).click();
  await nextButton(page).click();
  await expect(page.locator('.explain-card__what')).toContainText('No swap needed, the smaller one is already in front.');
  await page.getByRole('button', { name: 'Skip to next pass' }).click();
  await expect(page.locator('.explain-card__what')).toContainText('stop one place earlier');
  while (await nextButton(page).isEnabled()) await nextButton(page).click();
  await expect(kicker(page)).toHaveText('What is happening · Step 27 of 27');
  await expect(page.locator('.explain-card__what')).toContainText('The list is sorted: [1, 2, 5, 8].');
  await expect(page.getByTestId('output')).toHaveText('[1, 2, 5, 8]');
});
