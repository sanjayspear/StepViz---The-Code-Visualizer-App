// Acceptance checklist, StepViz_Build_Spec.pdf section 9 (items 1-16), plus
// checks for behavior agreed during the build (crashes, input(), Beginner
// mode, Space on buttons, the For loop and Fibonacci examples).
// Runs against the production build (see playwright.config.ts).
import { test, expect, type Page, type Locator } from '@playwright/test';

const FACTORIAL = `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

result = factorial(3)
print(result)`;

// Section 6: Line column and texts for every step, copied from the spec.
const SECTION_6: { line: number; what: string; life: string }[] = [
  { line: 1, what: 'Python reads the def and saves factorial for later. Nothing runs yet.', life: 'Like writing a recipe on a card. It is saved, but nobody has cooked anything yet.' },
  { line: 6, what: 'We call factorial(3). A new box, called a frame, appears with n = 3.', life: 'Like starting a new job: you get a fresh sheet of paper just for it.' },
  { line: 2, what: 'Is n equal to 0? n is 3, so no. We skip the return 1.', life: 'Asking "is the queue empty?" It is not, so we keep going.' },
  { line: 4, what: 'To get 3 × factorial(2) we must first know factorial(2). This box pauses and a new one opens on top.', life: 'Like asking a friend a question. You wait while they work it out.' },
  { line: 2, what: 'Same check again. n is 2, not 0.', life: 'Your friend checks: "do I already know the answer?" Not yet.' },
  { line: 4, what: 'It needs factorial(1). Pause again, open another box.', life: 'Your friend asks another friend. Now three people are waiting in a chain.' },
  { line: 2, what: 'n is 1, still not 0.', life: 'The third friend also does not know the answer yet.' },
  { line: 4, what: 'It needs factorial(0). One last box opens.', life: 'The third friend asks a fourth friend.' },
  { line: 3, what: 'n is 0, so we return 1. This is the base case: the place where the chain finally stops.', life: 'The last friend knows the answer straight away and replies.' },
  { line: 4, what: 'The n = 1 box gets 1 back, works out 1 × 1 = 1 and returns it. The box above it is removed.', life: 'Each friend uses the reply to answer the one before them.' },
  { line: 4, what: 'The n = 2 box computes 2 × 1 = 2 and returns 2.', life: 'The answers travel back down the chain, one person at a time.' },
  { line: 4, what: 'The n = 3 box computes 3 × 2 = 6 and returns 6.', life: 'The first person finally gets the full answer.' },
  { line: 6, what: 'The answer 6 is stored in result. All the extra boxes are gone.', life: 'You write the final answer on your own paper and throw the scratch sheets away.' },
  { line: 7, what: 'print(result) shows 6 on the screen. The program is finished.', life: 'Like reading your answer out loud.' },
];

const ACCENT = 'rgb(67, 56, 202)';

// ---------------------------------------------------------------------------
// Helpers

const editor = (page: Page) => page.locator('.cm-content');
const visualizeButton = (page: Page) => page.getByRole('button', { name: /Visualize my code|Loading Python…/ });
const kicker = (page: Page) => page.locator('.explain-card__kicker');
const nextButton = (page: Page) => page.getByRole('button', { name: 'Next step' });
const backButton = (page: Page) => page.getByRole('button', { name: 'Back', exact: true });
const playButton = (page: Page) => page.getByRole('button', { name: /^(Play|Pause)$/ });
const activeLine = (page: Page) => page.locator('.code-line--active');
const frames = (page: Page) => page.getByTestId('frame');

async function openHome(page: Page) {
  await page.goto('./');
  await expect(editor(page)).toBeVisible();
}

async function setCode(page: Page, source: string) {
  await editor(page).click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');
  await page.keyboard.insertText(source);
}

/** Opens the Factorial example (section 6 fixture) on the Step-through screen. */
async function openFactorial(page: Page) {
  await openHome(page);
  await visualizeButton(page).click();
  await expect(kicker(page)).toContainText('Step 1 of 14');
}

async function goToStep(page: Page, step: number) {
  for (let i = 1; i < step; i++) await nextButton(page).click();
  await expect(kicker(page)).toContainText(`Step ${step} of`);
}

/** Visualize pasted code and wait for the Step-through screen (Pyodide may need to load). */
async function visualizeLive(page: Page, source: string) {
  await setCode(page, source);
  await visualizeButton(page).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 60_000 });
}

async function lastStep(page: Page) {
  while (await nextButton(page).isEnabled()) await nextButton(page).click();
}

/** Fake timers that only move when the test says so (page.clock.runFor). */
async function freezeClock(page: Page) {
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
}

const style = (loc: Locator, prop: string) =>
  loc.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

test.use({ reducedMotion: 'reduce' });

// ---------------------------------------------------------------------------
// Section 9 checklist

test('1. Home loads with the factorial sample in the editor and the Factorial chip selected', async ({ page }) => {
  await openHome(page);
  // One .cm-line per source line (blank line included).
  await expect(page.locator('.cm-line')).toHaveText(FACTORIAL.split('\n'));
  await expect(page.getByRole('button', { name: 'Factorial' })).toHaveAttribute('aria-pressed', 'true');
  for (const other of ['Bubble sort', 'Fibonacci', 'For loop']) {
    await expect(page.getByRole('button', { name: other, exact: true })).toHaveAttribute('aria-pressed', 'false');
  }
});

test('2. Clicking Bubble sort, Fibonacci or For loop replaces the editor text', async ({ page }) => {
  await openHome(page);
  const firstLine = async () => (await editor(page).evaluate((el) => (el as HTMLElement).innerText)).split('\n')[0];
  const expected: Record<string, string> = {
    'Bubble sort': 'nums = [5, 2, 8, 1]',
    Fibonacci: 'a, b = 0, 1',
    'For loop': 'total = 0',
  };
  for (const [chip, line] of Object.entries(expected)) {
    await page.getByRole('button', { name: chip, exact: true }).click();
    expect(await firstLine()).toBe(line);
    await expect(page.getByRole('button', { name: chip, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
});

test('3. "Visualize my code" opens the step view at "Step 1 of 14" for the factorial sample', async ({ page }) => {
  await openHome(page);
  await visualizeButton(page).click();
  await expect(page.getByRole('heading', { level: 1, name: 'factorial(3)' })).toBeVisible();
  await expect(kicker(page)).toHaveText('What is happening · Step 1 of 14');
});

test('4. Next step advances one step; the highlighted line matches section 6 for every step', async ({ page }) => {
  await openFactorial(page);
  for (let i = 0; i < SECTION_6.length; i++) {
    await expect(kicker(page)).toHaveText(`What is happening · Step ${i + 1} of 14`);
    await expect(activeLine(page)).toHaveCount(1);
    await expect(activeLine(page)).toHaveAttribute('data-line', String(SECTION_6[i].line));
    if (i < SECTION_6.length - 1) await nextButton(page).click();
  }
});

test('5. Back and Next are disabled (40% opacity) on step 1 and step 14 respectively', async ({ page }) => {
  await openFactorial(page);
  await expect(backButton(page)).toBeDisabled();
  expect(await style(backButton(page), 'opacity')).toBe('0.4');
  await expect(nextButton(page)).toBeEnabled();
  await goToStep(page, 14);
  await expect(nextButton(page)).toBeDisabled();
  expect(await style(nextButton(page), 'opacity')).toBe('0.4');
  await expect(backButton(page)).toBeEnabled();
  expect(await style(backButton(page), 'opacity')).toBe('1');
});

test('6. At step 8 the call stack shows 5 frames with factorial(0) running', async ({ page }) => {
  await openFactorial(page);
  await goToStep(page, 8);
  // DOM order is bottom to top (shown with column-reverse): Global first.
  await expect(frames(page).locator('.frame__name')).toHaveText([
    'Global',
    'factorial(3)',
    'factorial(2)',
    'factorial(1)',
    'factorial(0)',
  ]);
  await expect(frames(page).locator('.frame__status')).toHaveText(['waiting', 'waiting', 'waiting', 'waiting', 'running']);
  // Newest call sits on top visually.
  const top = await frames(page).nth(4).boundingBox();
  const bottom = await frames(page).nth(0).boundingBox();
  expect(top!.y).toBeLessThan(bottom!.y);
});

test('7. At step 9 factorial(0) shows status "returning" with text "n = 0 -> returns 1"', async ({ page }) => {
  await openFactorial(page);
  await goToStep(page, 9);
  const f0 = frames(page).filter({ hasText: 'factorial(0)' });
  await expect(f0.locator('.frame__status')).toHaveText('returning');
  // The screenshots and section 6 draw the arrow as "→".
  await expect(f0.locator('.frame__vars')).toHaveText(/^n = 0 (->|→) returns 1$/);
});

test('8. Output stays empty until step 14, where it shows 6', async ({ page }) => {
  await openFactorial(page);
  for (let step = 1; step <= 14; step++) {
    if (step > 1) await nextButton(page).click();
    await expect(page.getByTestId('output')).toHaveText(step < 14 ? '' : '6');
  }
});

test('9. Play moves one step every 1.5 s, label changes to Pause, stops on step 14; Play on step 14 restarts', async ({ page }) => {
  await page.clock.install();
  await openFactorial(page);
  await freezeClock(page);
  await playButton(page).click();
  await expect(playButton(page)).toHaveText('Pause');
  await page.clock.runFor(1499);
  await expect(kicker(page)).toContainText('Step 1 of 14');
  await page.clock.runFor(1);
  await expect(kicker(page)).toContainText('Step 2 of 14');
  for (let step = 3; step <= 14; step++) {
    await page.clock.runFor(1500);
    await expect(kicker(page)).toContainText(`Step ${step} of 14`);
  }
  await expect(playButton(page)).toHaveText('Play'); // stopped by itself
  await page.clock.runFor(5000);
  await expect(kicker(page)).toContainText('Step 14 of 14');
  // Play on the last step restarts from step 1.
  await playButton(page).click();
  await expect(kicker(page)).toContainText('Step 1 of 14');
  await expect(playButton(page)).toHaveText('Pause');
  await page.clock.runFor(1500);
  await expect(kicker(page)).toContainText('Step 2 of 14');
  // Next while playing pauses first.
  await nextButton(page).click();
  await expect(playButton(page)).toHaveText('Play');
  await expect(kicker(page)).toContainText('Step 3 of 14');
  await page.clock.runFor(3000);
  await expect(kicker(page)).toContainText('Step 3 of 14');
});

test('10. Restart returns to step 1 and stops playback', async ({ page }) => {
  await page.clock.install();
  await openFactorial(page);
  await freezeClock(page);
  await goToStep(page, 5);
  await playButton(page).click();
  await page.clock.runFor(1500);
  await expect(kicker(page)).toContainText('Step 6 of 14');
  await page.getByRole('button', { name: 'Restart' }).click();
  await expect(kicker(page)).toContainText('Step 1 of 14');
  await expect(playButton(page)).toHaveText('Play');
  await page.clock.runFor(4500);
  await expect(kicker(page)).toContainText('Step 1 of 14');
});

test('11. while True: pass stops with the friendly long-running message, and the page stays responsive', async ({ page }) => {
  await openHome(page);
  await setCode(page, 'while True: pass');
  await visualizeButton(page).click();
  await expect(page.locator('.editor-card__error')).toHaveText(
    'Your program ran for a very long time, so we stopped it. Check that every loop can end.',
    { timeout: 60_000 },
  );
  await expect(page.locator('.step-screen')).toHaveCount(0);
  // Responsive: the main thread answers at once and the UI still works.
  const t0 = Date.now();
  await page.evaluate(() => 1 + 1);
  expect(Date.now() - t0).toBeLessThan(1000);
  await page.getByRole('button', { name: 'For loop' }).click();
  await expect(page.getByRole('button', { name: 'For loop' })).toHaveAttribute('aria-pressed', 'true');
  await expect(visualizeButton(page)).toBeEnabled();
});

test('12. A Python syntax error shows a friendly message with the line number and does not open Screen 2', async ({ page }) => {
  await openHome(page);
  await setCode(page, 'total = 0\nfor i in range(3)\n    total = total + i');
  await visualizeButton(page).click();
  await expect(page.locator('.editor-card__error')).toHaveText('Line 2: A colon (:) is missing at the end of this line.', {
    timeout: 60_000,
  });
  await expect(page.locator('.step-screen')).toHaveCount(0);
});

test.describe('13. Phone, 390 px wide', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('layout matches Screen 4 and the bottom bar stays visible', async ({ page }) => {
    await openFactorial(page);
    await goToStep(page, 4);

    // One column in this order: top bar, code, call stack, explanation, bottom bar.
    const box = async (sel: string) => (await page.locator(sel).boundingBox())!;
    const [top, code, stack, expl, bar] = await Promise.all(
      ['.step-topbar', '.code-panel', '.stack-card', '.explain-card', '.controls-card'].map(box),
    );
    expect(top.y).toBeLessThan(code.y);
    expect(code.y).toBeLessThan(stack.y);
    expect(stack.y).toBeLessThan(expl.y);
    for (const b of [code, stack, expl]) expect(Math.round(b.width)).toBe(390 - 32);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

    // Top bar: back arrow and share icon are 44 x 44; title centered.
    for (const name of ['New code', 'Share link']) {
      const b = (await page.getByRole('button', { name }).boundingBox())!;
      expect([Math.round(b.width), Math.round(b.height)]).toEqual([44, 44]);
    }
    const title = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
    expect(Math.abs(title.x + title.width / 2 - 195)).toBeLessThanOrEqual(2);
    // Badge and Beginner mode live in the menu.
    await expect(page.locator('.step-badge')).toHaveCount(0);
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('#step-menu')).toContainText('Python · exact trace');
    await expect(page.locator('#step-menu').getByRole('button', { name: 'Beginner mode: on' })).toBeVisible();
    await page.keyboard.press('Escape');

    // Code: 13 px mono, 28 px rows. Frames: one line, 13 px mono, 2 px border.
    expect(await style(activeLine(page), 'height')).toBe('28px');
    expect(await style(page.locator('.code-line').first(), 'font-size')).toBe('13px');
    await expect(frames(page).nth(2)).toContainText('factorial(2) · n = 2');
    const f = frames(page).nth(2);
    expect(await style(f.locator('.frame__name'), 'font-size')).toBe('13px');
    expect(await style(f, 'border-top-width')).toBe('2px');
    expect((await f.boundingBox())!.height).toBeLessThanOrEqual(36);
    await expect(kicker(page)).toHaveText('Step 4 of 14');
    await expect(page.locator('.explain-card .life-box')).toContainText('In real life:');

    // Bottom bar: Back, Play, Next step (48 px, Next wider), progress above, fixed.
    const controls = page.locator('.controls-card').getByRole('button');
    await expect(controls).toHaveText(['Back', 'Play', 'Next step']);
    const [back, play, next] = await Promise.all([0, 1, 2].map(async (i) => (await controls.nth(i).boundingBox())!));
    for (const b of [back, play, next]) expect(Math.round(b.height)).toBe(48);
    expect(next.width).toBeGreaterThan(back.width);
    expect((await box('.progress')).y).toBeLessThan(back.y);
    expect(await style(page.locator('.controls-card'), 'position')).toBe('fixed');
    expect(Math.round(bar.y + bar.height)).toBe(844);

    // The page scrolls; the bar stays on screen and covers nothing.
    await page.setViewportSize({ width: 390, height: 560 });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const barAfter = await box('.controls-card');
    expect(Math.round(barAfter.y + barAfter.height)).toBe(560);
    const explAfter = await box('.explain-card');
    expect(explAfter.y + explAfter.height).toBeLessThanOrEqual(barAfter.y);
    await expect(nextButton(page)).toBeInViewport();
  });

  test('Screen 1 at phone width: single column, H1 34 px, full-width editor card, chips wrap', async ({ page }) => {
    await openHome(page);
    expect(await style(page.locator('h1'), 'font-size')).toBe('34px');
    const card = (await page.locator('.editor-card').boundingBox())!;
    expect(Math.round(card.width)).toBe(390 - 32);
    const features = (await page.locator('.features').boundingBox())!;
    expect(features.y).toBeGreaterThan(card.y + card.height); // stacked, not side by side
    const chipTops = await page.locator('.chip').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
    expect(new Set(chipTops.map(Math.round)).size).toBeGreaterThan(1); // wrapped
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});

test.describe('14. Touch targets, focus ring, arrow keys', () => {
  const visibleButtonHeights = (page: Page) =>
    page.locator('button:visible, select:visible').evaluateAll((els) =>
      els.map((e) => [e.textContent?.trim() || e.getAttribute('aria-label'), e.getBoundingClientRect().height] as const),
    );

  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`all buttons are at least 44 px tall at ${viewport.width} px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openHome(page);
      for (const [name, h] of await visibleButtonHeights(page)) expect(h, String(name)).toBeGreaterThanOrEqual(44);
      await visualizeButton(page).click();
      await expect(kicker(page)).toContainText('Step 1 of 14');
      for (const [name, h] of await visibleButtonHeights(page)) expect(h, String(name)).toBeGreaterThanOrEqual(44);
    });
  }

  test('keyboard Tab shows a visible focus ring', async ({ page }) => {
    await openHome(page);
    const ring = () =>
      page.evaluate(() => {
        const s = getComputedStyle(document.activeElement!);
        return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`;
      });
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      expect(await ring()).toBe(`solid 2px ${'rgb(67, 56, 202)'}`);
    }
    await visualizeButton(page).click();
    await expect(kicker(page)).toContainText('Step 1 of 14');
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      expect(await ring()).toBe('solid 2px rgb(67, 56, 202)');
    }
  });

  test('Left/Right arrows step', async ({ page }) => {
    await openFactorial(page);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(kicker(page)).toContainText('Step 3 of 14');
    await page.keyboard.press('ArrowLeft');
    await expect(kicker(page)).toContainText('Step 2 of 14');
  });
});

test('15. No network request is made while the code runs', async ({ page, context }) => {
  await openHome(page);
  // Load Pyodide first (it is served from our own site), with a first run.
  await visualizeLive(page, 'x = 1');
  await page.getByRole('button', { name: 'New code' }).click();

  // Every network API is gone from the worker that runs the code.
  const [worker] = page.workers();
  expect(worker).toBeTruthy();
  expect(
    await worker.evaluate(() => ({
      xhr: typeof (self as { XMLHttpRequest?: unknown }).XMLHttpRequest,
      ws: typeof (self as { WebSocket?: unknown }).WebSocket,
      fetchThrows: (() => {
        try {
          void fetch('/');
          return false;
        } catch {
          return true;
        }
      })(),
    })),
  ).toEqual({ xhr: 'undefined', ws: 'undefined', fetchThrows: true });

  const requests: string[] = [];
  context.on('request', (r) => requests.push(r.url()));
  await visualizeLive(page, 'nums = [3, 1, 2]\nfor n in nums:\n    print(n * 2)');
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('6\n2\n4');
  expect(requests).toEqual([]);
});

test.describe('16. Colors, fonts and copy match sections 2 to 6', () => {
  test('Home', async ({ page }) => {
    await openHome(page);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => ({
        heading: document.fonts.check('700 52px "Space Grotesk"'),
        body: document.fonts.check('400 16px "Inter"'),
        code: document.fonts.check('400 15px "JetBrains Mono"'),
      })),
    ).toEqual({ heading: true, body: true, code: true });

    expect(await style(page.locator('body'), 'background-color')).toBe('rgb(246, 245, 241)');
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Paste any code. Watch it run, one step at a time.');
    expect(await style(h1, 'font-family')).toContain('Space Grotesk');
    expect(await style(h1, 'font-size')).toBe('52px');
    expect(await style(h1, 'font-weight')).toBe('700');
    expect(parseFloat(await style(h1, 'line-height'))).toBeCloseTo(52 * 1.05, 1);
    const sub = page.locator('.home-hero__sub');
    await expect(sub).toHaveText(
      'See every line light up, every variable change, and every function call stack up, with a plain-English reason for each step.',
    );
    expect(await style(sub, 'font-size')).toBe('19px');
    expect(await style(sub, 'color')).toBe('rgb(85, 85, 95)');

    // Header
    await expect(page.locator('.home-logo__name')).toHaveText('StepViz');
    await expect(page.getByRole('navigation').getByRole('button')).toHaveText(['Examples', 'How it works', 'Sign in']);

    // Editor card: white, 18 px radius, 22 px padding; dark 250 px code area in JetBrains Mono 15 px / 1.7.
    const card = page.locator('.editor-card');
    expect(await style(card, 'background-color')).toBe('rgb(255, 255, 255)');
    expect(await style(card, 'border-radius')).toBe('18px');
    expect(await style(card, 'padding-top')).toBe('22px');
    await expect(page.locator('.editor-card__label')).toHaveText('Your code');
    await expect(page.locator('.editor-card__lang > span').first()).toHaveText('Language');
    await expect(page.locator('select option')).toHaveText([
      'Python',
      'JavaScript',
      'Java',
      'C++',
      'C (coming soon)',
    ]);
    const cm = page.locator('.cm-editor');
    expect(await style(cm, 'background-color')).toBe('rgb(23, 23, 43)');
    expect(await style(cm, 'height')).toBe('250px');
    expect(await style(page.locator('.cm-scroller'), 'font-family')).toContain('JetBrains Mono');
    expect(await style(cm, 'font-size')).toBe('15px');
    expect(parseFloat(await style(page.locator('.cm-line').first(), 'line-height'))).toBeCloseTo(15 * 1.7, 1);

    // Chips and primary button
    await expect(page.locator('.examples__label')).toHaveText('Try an example');
    await expect(page.locator('.chip')).toHaveText(['Factorial', 'Bubble sort', 'Fibonacci', 'For loop']);
    const selected = page.locator('.chip[aria-pressed="true"]');
    expect(await style(selected, 'background-color')).toBe('rgb(236, 235, 255)');
    expect(await style(selected, 'color')).toBe('rgb(46, 37, 160)');
    const btn = page.locator('.visualize-btn');
    await expect(btn).toHaveText('Visualize my code');
    expect(await style(btn, 'background-color')).toBe(ACCENT);
    expect(await style(btn, 'height')).toBe('56px');
    expect(await style(btn, 'font-size')).toBe('18px');
    expect(await style(btn, 'font-weight')).toBe('600');
    expect(await style(btn, 'color')).toBe('rgb(255, 255, 255)');

    // Right column and language strip
    await expect(page.locator('.features__title')).toHaveText('What you will see');
    await expect(page.locator('.feature-card__title')).toHaveText([
      'The running line, highlighted',
      'Variables and calls as boxes',
      'Explained like you are new',
    ]);
    await expect(page.locator('.feature-card__text')).toHaveText([
      'A marker walks through your code exactly like the computer does.',
      'Watch values change, arrays swap, and function calls stack up and unwind.',
      'Each step has a plain-English reason and an everyday real-life comparison.',
    ]);
    for (const tile of await page.locator('.feature-card__icon').all()) expect(await style(tile, 'width')).toBe('44px');
    await expect(page.locator('.lang-strip__label')).toHaveText('Language support');
    await expect(page.locator('.pill')).toHaveText([
      'Python · exact trace',
      'JavaScript · exact trace',
      'Java · exact trace',
      'C++ · exact trace',
      'C · coming soon',
    ]);
    expect(await style(page.locator('.pill--green').first(), 'background-color')).toBe('rgb(221, 243, 238)');
    expect(await style(page.locator('.pill--green').first(), 'color')).toBe('rgb(15, 95, 85)');
    expect(await style(page.locator('.pill--yellow'), 'background-color')).toBe('rgb(255, 243, 191)');
    expect(await style(page.locator('.pill--yellow'), 'color')).toBe('rgb(107, 79, 0)');
  });

  test('Step-through, with all section 6 texts', async ({ page }) => {
    await openFactorial(page);

    // Top bar
    await expect(page.getByRole('button', { name: 'New code' })).toHaveText('New code');
    const title = page.getByRole('heading', { level: 1 });
    await expect(title).toHaveText('factorial(3)');
    expect(await style(title, 'font-family')).toContain('Space Grotesk');
    expect(await style(title, 'font-size')).toBe('20px');
    await expect(page.locator('.step-badge')).toHaveText('Python · exact trace');
    await expect(page.locator('.step-topbar__right .outline-btn')).toHaveText(['Share link', 'Beginner mode: on']);
    expect(await style(page.locator('.step-topbar'), 'background-color')).toBe('rgb(255, 255, 255)');

    // Code panel
    const panel = page.locator('.code-panel');
    expect(await style(panel, 'background-color')).toBe('rgb(23, 23, 43)');
    expect(await style(panel, 'border-radius')).toBe('16px');
    await expect(page.locator('.code-panel__heading')).toHaveText('Code');
    expect(await style(page.locator('.code-panel__heading'), 'text-transform')).toBe('uppercase');
    expect(await style(page.locator('.code-panel__heading'), 'font-size')).toBe('13px');
    await expect(page.locator('.code-line')).toHaveCount(7); // blank line 5 kept
    expect(await style(page.locator('.code-line').first(), 'height')).toBe('40px');
    expect(await style(page.locator('.code-line__text').first(), 'font-family')).toContain('JetBrains Mono');
    expect(await style(page.locator('.code-line').first(), 'font-size')).toBe('16px');
    expect(await style(page.locator('.code-line__num').first(), 'color')).toBe('rgb(154, 154, 184)');
    const hl = page.locator('.code-lines__highlight');
    expect(await style(hl, 'background-color')).toBe('rgb(52, 52, 122)');
    expect(await style(hl, 'border-left')).toBe('4px solid rgb(255, 216, 77)');
    expect(await style(page.locator('.output-box'), 'background-color')).toBe('rgb(38, 38, 74)');
    await expect(page.locator('.output-box__label')).toHaveText('Output');
    expect(await style(page.locator('.output-box__label'), 'color')).toBe('rgb(255, 216, 77)');
    expect(await style(page.getByTestId('output'), 'font-size')).toBe('18px');

    // Call stack
    await expect(page.locator('.stack-card__title')).toHaveText('Call stack');
    await expect(page.locator('.stack-card__hint')).toHaveText('Newest call sits on top, like a stack of plates');
    const stack = page.locator('.stack');
    expect(await style(stack, 'border-top')).toBe('2px dashed rgb(201, 199, 188)');
    expect(await style(stack, 'flex-direction')).toBe('column-reverse');
    expect(parseFloat(await style(stack, 'min-height'))).toBe(360);

    // Explanation and real-life box
    const k = kicker(page);
    expect(await style(k, 'text-transform')).toBe('uppercase');
    expect(await style(k, 'font-size')).toBe('13px');
    expect(await style(k, 'color')).toBe(ACCENT);
    expect(await style(page.locator('.explain-card__what'), 'font-size')).toBe('20px');
    expect(await style(page.locator('.explain-card__what'), 'font-weight')).toBe('500');
    const life = page.locator('.life-box');
    expect(await style(life, 'background-color')).toBe('rgb(255, 248, 220)');
    expect(await style(life, 'border-top-color')).toBe('rgb(232, 212, 138)');
    await expect(page.locator('.life-box__kicker')).toHaveText('In real life');
    expect(await style(page.locator('.life-box__text'), 'font-size')).toBe('16px');
    expect(await style(page.locator('.life-box__text'), 'color')).toBe('rgb(59, 48, 0)');

    // Controls
    expect(await style(page.locator('.progress'), 'height')).toBe('8px');
    expect(await style(page.locator('.progress__fill'), 'background-color')).toBe(ACCENT);
    await expect(page.locator('.controls button')).toHaveText(['Restart', 'Back', 'Play', 'Next step', 'Speed 1×']);
    for (const name of ['Restart', 'Back', 'Play', 'Next step']) {
      expect(await style(page.locator('.controls').getByRole('button', { name, exact: true }), 'height')).toBe('48px');
    }
    expect(await style(playButton(page), 'background-color')).toBe('rgb(221, 243, 238)');
    expect(await style(nextButton(page), 'background-color')).toBe(ACCENT);
    expect(await style(nextButton(page), 'color')).toBe('rgb(255, 255, 255)');

    // Section 6: every step's texts, and frame statuses as text + colors.
    const statusColors: Record<string, [string, string, string]> = {
      running: ['rgb(236, 235, 255)', ACCENT, 'rgb(46, 37, 160)'],
      waiting: ['rgb(242, 241, 236)', 'rgb(201, 199, 188)', 'rgb(85, 85, 95)'],
      returning: ['rgb(221, 243, 238)', 'rgb(15, 118, 110)', 'rgb(15, 95, 85)'],
    };
    const globalVars: string[] = [];
    for (let i = 0; i < SECTION_6.length; i++) {
      if (i > 0) await nextButton(page).click();
      await expect(page.locator('.explain-card__what')).toHaveText(SECTION_6[i].what);
      await expect(page.locator('.life-box__text')).toHaveText(SECTION_6[i].life);
      for (const f of await frames(page).all()) {
        const status = (await f.locator('.frame__status').textContent())!;
        expect(Object.keys(statusColors)).toContain(status); // a text label, never color alone
        const [bg, border, text] = statusColors[status];
        expect(await style(f, 'background-color')).toBe(bg);
        expect(await style(f, 'border-top-color')).toBe(border);
        expect(await style(f.locator('.frame__status'), 'color')).toBe(text);
        expect(await style(f, 'border-radius')).toBe('12px');
        expect(await style(f.locator('.frame__name'), 'font-family')).toContain('JetBrains Mono');
      }
      globalVars.push((await frames(page).first().locator('.frame__vars').textContent())!);
    }
    // Global frame text, as the note under the section 6 table says.
    expect(globalVars[0]).toBe('factorial = function');
    expect(globalVars.slice(1, 12).every((v) => v === 'factorial = function, result = ?')).toBe(true);
    expect(globalVars[12]).toBe('factorial = function, result = 6');
    expect(globalVars[13]).toBe('factorial = function, result = 6');
    // Step 10: "n = 1 -> 1 x 1 = 1" style text on the returning frame.
    await page.getByRole('button', { name: 'Restart' }).click();
    await goToStep(page, 10);
    await expect(frames(page).filter({ hasText: 'factorial(1)' }).locator('.frame__vars')).toHaveText('n = 1 → 1 × 1 = 1');
  });
});

// ---------------------------------------------------------------------------
// Agreed during the build

test('crash: 10 / 0 opens the steps up to the crash with an error frame and the raw message', async ({ page }) => {
  await openHome(page);
  await visualizeLive(page, 'print("start")\nx = 10\ny = x / 0\nprint(y)');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your code');
  await lastStep(page);
  await expect(kicker(page)).toContainText('Step 3 of 3');
  await expect(activeLine(page)).toHaveAttribute('data-line', '3');
  await expect(page.locator('.explain-card__what')).toHaveText("Python can't divide a number by zero.");
  await expect(page.locator('.life-box')).toHaveCount(0);
  const errorFrame = frames(page).last();
  await expect(errorFrame.locator('.frame__status')).toHaveText('error');
  expect(await style(errorFrame, 'background-color')).toBe('rgb(253, 232, 227)');
  expect(await style(errorFrame, 'border-top-color')).toBe('rgb(180, 35, 24)');
  expect(await style(errorFrame.locator('.frame__status'), 'color')).toBe('rgb(138, 28, 18)');
  await expect(page.getByTestId('output')).toHaveText('start');
  const raw = page.getByTestId('output-error');
  await expect(raw).toHaveText('ZeroDivisionError: division by zero');
  expect(await style(raw, 'font-family')).toContain('JetBrains Mono');
  expect(await style(raw, 'color')).toBe('rgb(138, 28, 18)');
});

test('crash before any step stays on Home with the message under the editor', async ({ page }) => {
  await openHome(page);
  await setCode(page, 'x = 10 / 0');
  await visualizeButton(page).click();
  await expect(page.locator('.editor-card__error')).toHaveText("Line 1: Python can't divide a number by zero.", {
    timeout: 60_000,
  });
  await expect(page.locator('.step-screen')).toHaveCount(0);
});

test('input(): a prompt box collects one line per input() call before running', async ({ page }) => {
  await openHome(page);
  await setCode(page, 'name = input("Name? ")\nprint("Hi", name)');
  await visualizeButton(page).click();
  const box = page.getByLabel('Your program asks for input. Type one line per input() call.');
  await expect(box).toBeFocused({ timeout: 60_000 });
  await box.fill('Sam');
  await visualizeButton(page).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 60_000 });
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('Name? Sam\nHi Sam');
});

test('Beginner mode off hides the In real life box and is remembered', async ({ page }) => {
  await openFactorial(page);
  await page.getByRole('button', { name: 'Beginner mode: on' }).click();
  await expect(page.getByRole('button', { name: 'Beginner mode: off' })).toBeVisible();
  await expect(page.locator('.life-box')).toHaveCount(0);
  await expect(page.locator('.explain-card__what')).toBeVisible();
  await page.reload();
  await visualizeButton(page).click();
  await expect(page.getByRole('button', { name: 'Beginner mode: off' })).toBeVisible();
  await expect(page.locator('.life-box')).toHaveCount(0);
});

test('Space toggles play on the page, but presses a focused button as normal', async ({ page }) => {
  await page.clock.install();
  await openFactorial(page);
  await freezeClock(page);
  await page.locator('.stack-card').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('Space');
  await expect(playButton(page)).toHaveText('Pause');
  await page.keyboard.press('Space');
  await expect(playButton(page)).toHaveText('Play');
  await nextButton(page).focus();
  await page.keyboard.press('Space');
  await expect(kicker(page)).toContainText('Step 2 of 14');
  await expect(playButton(page)).toHaveText('Play');
});

test('speed cycles 0.5×, 1×, 2×', async ({ page }) => {
  await openFactorial(page);
  const speed = page.getByRole('button', { name: /^Speed/ });
  await expect(speed).toHaveText('Speed 1×');
  await speed.click();
  await expect(speed).toHaveText('Speed 2×');
  await speed.click();
  await expect(speed).toHaveText('Speed 0.5×');
  await speed.click();
  await expect(speed).toHaveText('Speed 1×');
});

test('For loop, Fibonacci and Bubble sort play their hand-written explanations; edited code uses the rule-based explainer', async ({ page }) => {
  const cases = [
    { chip: 'For loop', title: 'For loop: sum of 1 to 3', steps: 9, life: 'Like setting a scoreboard to zero before the game starts.', output: '6' },
    { chip: 'Fibonacci', title: 'fibonacci(5)', steps: 17, life: 'Like writing the first two numbers of a pattern on a card.', output: '0\n1\n1\n2\n3' },
  ];
  await openHome(page);
  for (const c of cases) {
    await page.getByRole('button', { name: c.chip, exact: true }).click();
    await visualizeButton(page).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(c.title);
    await expect(kicker(page)).toContainText(`Step 1 of ${c.steps}`);
    await expect(page.locator('.life-box__text')).toHaveText(c.life);
    await lastStep(page);
    await expect(page.getByTestId('output')).toHaveText(c.output);
    await page.getByRole('button', { name: 'New code' }).click();
  }
  await page.getByRole('button', { name: 'Bubble sort', exact: true }).click();
  await visualizeButton(page).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bubble sort', { timeout: 60_000 });
  await expect(page.locator('.explain-card__what')).toHaveText(
    'We make a list called nums with four numbers: 5, 2, 8 and 1. They are not in order yet.',
  );
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('[1, 2, 5, 8]');
  // Edited code is traced live and gets the generic explanation.
  await page.getByRole('button', { name: 'New code' }).click();
  await editor(page).click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type(' # edited');
  await visualizeButton(page).click();
  // Edited code is explained by the rule-based explainer, with a real-life line.
  await expect(page.locator('.explain-card__what')).toContainText('nums', { timeout: 60_000 });
  await expect(page.locator('.explain-card__what')).not.toHaveText(
    'We make a list called nums with four numbers: 5, 2, 8 and 1. They are not in order yet.',
  );
  await expect(page.locator('.life-box__text')).toHaveText(/^Like /);
});

test('empty editor and other languages', async ({ page }) => {
  await openHome(page);
  await setCode(page, '');
  await expect(visualizeButton(page)).toBeDisabled();
  await expect(page.locator('.editor-card__helper')).toHaveText('Paste some code first');
  await page.getByRole('button', { name: 'Factorial' }).click();
  await page.locator('select').selectOption('c');
  await expect(page.locator('.editor-card__helper')).toHaveText('Coming soon');
  await expect(visualizeButton(page)).toBeDisabled();
  await page.locator('select').selectOption('python');
  await expect(visualizeButton(page)).toBeEnabled();
});

test('pasted code is explained step by step, with "In real life" lines that Beginner mode can hide', async ({ page }) => {
  await openHome(page);
  await visualizeLive(page, 'total = 0\nfor i in range(1, 3):\n    total = total + i\nprint(total)');
  await expect(page.locator('.explain-card__what')).toHaveText(
    /^(We make a box called total and put 0 in it|A new box called total now holds 0|total is created and set to 0)\.$/,
  );
  await expect(page.locator('.life-box__text')).toHaveText(/^Like /);
  await nextButton(page).click();
  await expect(page.locator('.explain-card__what')).toHaveText(
    /^(The loop starts\. i is 1 for the first round|Round one of the loop: i starts at 1)\.$/,
  );
  await lastStep(page);
  await expect(page.locator('.explain-card__what')).toContainText('3');
  await page.getByRole('button', { name: 'Beginner mode: on' }).click();
  await expect(page.locator('.life-box')).toHaveCount(0);
  await page.getByRole('button', { name: 'Beginner mode: off' }).click();
});
