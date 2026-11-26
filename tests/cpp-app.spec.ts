// C++ in the app.
import { test, expect, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const visualize = (page: Page) => page.getByRole('button', { name: /Visualize my code|Loading Python…/ });
const nextButton = (page: Page) => page.getByRole('button', { name: 'Next step' });

async function chooseCpp(page: Page) {
  await page.goto('./');
  await page.locator('select').selectOption('cpp');
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

test('C++ Factorial plays its hand-written steps; the badge says C++', async ({ page }) => {
  await chooseCpp(page);
  expect((await page.locator('.cm-line').allTextContents())[0]).toBe('#include <iostream>');
  await visualize(page).click();
  await expect(page.locator('.step-badge')).toHaveText('C++ · exact trace');
  await expect(page.locator('.explain-card__kicker')).toHaveText('What is happening · Step 1 of 15');
  await expect(page.getByTestId('frame').locator('.frame__name')).toHaveText(['main()', 'factorial(3)']);
  await lastStep(page);
  await expect(page.locator('.explain-card__what')).toHaveText('main() returns 0, which tells the computer the program finished without problems.');
  await expect(page.getByTestId('output')).toHaveText('6');
});

test('C++ Bubble sort uses the loops view with swap()', async ({ page }) => {
  await chooseCpp(page);
  await page.getByRole('button', { name: 'Bubble sort', exact: true }).click();
  await visualize(page).click();
  await expect(page.locator('.list-card__title')).toHaveText('nums, as a list', { timeout: 30_000 });
  for (let i = 0; i < 4; i++) await nextButton(page).click();
  await expect(page.locator('.swap-arrow')).toHaveCount(1);
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('1 2 5 8');
});

test('cin: the input box asks for input, and the program reads it', async ({ page }) => {
  await chooseCpp(page);
  await setCode(page, '#include <iostream>\nusing namespace std;\n\nint main() {\n    int age;\n    cin >> age;\n    cout << age + 1 << endl;\n    return 0;\n}');
  await visualize(page).click();
  const box = page.getByLabel('Your program reads input. Type your input here, one value per line or separated by spaces.');
  await expect(box).toBeFocused({ timeout: 30_000 });
  await box.fill('41');
  await visualize(page).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 30_000 });
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('42');
});

test('C++ errors: pointers to pointers stay on Home; an unset variable crashes with a plain-words sentence', async ({ page }) => {
  await chooseCpp(page);
  await setCode(page, '#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 1;\n    int** pp = nullptr;\n    return 0;\n}');
  await visualize(page).click();
  await expect(page.locator('.editor-card__error')).toHaveText("Line 6: StepViz can't run pointers to pointers in C++ yet.", { timeout: 30_000 });
  await setCode(page, '#include <iostream>\nusing namespace std;\n\nint main() {\n    int x;\n    cout << x << endl;\n    return 0;\n}');
  await visualize(page).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 30_000 });
  await lastStep(page);
  await expect(page.locator('.explain-card__what')).toHaveText('This box was used before it was given a value.');
  await expect(page.getByTestId('frame').last().locator('.frame__status')).toHaveText('error');
});
