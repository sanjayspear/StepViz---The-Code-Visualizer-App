// C in the app.
import { test, expect, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const visualize = (page: Page) => page.getByRole('button', { name: /Visualize my code|Loading Python…/ });
const nextButton = (page: Page) => page.getByRole('button', { name: 'Next step' });
async function lastStep(page: Page) {
  while (await nextButton(page).isEnabled()) await nextButton(page).click();
}

test('C is selectable: Factorial plays its steps; the badge says C', async ({ page }) => {
  await page.goto('./');
  await page.locator('select').selectOption('c');
  await expect(page.locator('select option:checked')).toHaveText('C');
  expect((await page.locator('.cm-line').allTextContents())[0]).toBe('#include <stdio.h>');
  await visualize(page).click();
  await expect(page.locator('.step-badge')).toHaveText('C · exact trace');
  await expect(page.locator('.explain-card__kicker')).toHaveText('What is happening · Step 1 of 15');
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('6');
});

test('scanf: the input box, then the program reads the values', async ({ page }) => {
  await page.goto('./');
  await page.locator('select').selectOption('c');
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText('#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d\\n", a + b);\n    return 0;\n}');
  await visualize(page).click();
  const box = page.getByLabel('Your program reads input. Type your input here, one value per line or separated by spaces.');
  await expect(box).toBeFocused({ timeout: 30_000 });
  await box.fill('40 2');
  await visualize(page).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 30_000 });
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('42');
  await nextButton(page).isDisabled();
});
