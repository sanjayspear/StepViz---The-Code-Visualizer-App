// Java in the app (J2).
import { test, expect, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const visualize = (page: Page) => page.getByRole('button', { name: /Visualize my code|Loading Python…/ });
const nextButton = (page: Page) => page.getByRole('button', { name: 'Next step' });
const editorLines = (page: Page) => page.locator('.cm-line').allTextContents();

async function chooseJava(page: Page) {
  await page.goto('./');
  await page.locator('select').selectOption('java');
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

test('Java is selectable: examples switch to Java, the strip says "Java · exact trace"', async ({ page }) => {
  await chooseJava(page);
  await expect(page.locator('select option:checked')).toHaveText('Java');
  await expect(page.locator('.editor-card__helper')).toHaveCount(0);
  expect((await editorLines(page))[0]).toBe('public class Main {');
  await expect(page.getByRole('button', { name: 'Factorial' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Bubble sort', exact: true }).click();
  expect((await editorLines(page))[0]).toBe('import java.util.Arrays;');
  await expect(page.locator('.pill--green')).toHaveText([
    'Python · exact trace',
    'JavaScript · exact trace',
    'Java · exact trace',
    'C++ · exact trace',
    'C · exact trace',
  ]);
});

test('Java Factorial plays its hand-written steps with main() at the bottom', async ({ page }) => {
  await chooseJava(page);
  await visualize(page).click();
  await expect(page.locator('.step-badge')).toHaveText('Java · exact trace');
  await expect(page.locator('.explain-card__kicker')).toHaveText('What is happening · Step 1 of 14');
  await expect(page.locator('.explain-card__what')).toHaveText('We call factorial(3). A new box, called a frame, appears with n = 3.');
  await expect(page.getByTestId('frame').locator('.frame__name')).toHaveText(['main()', 'factorial(3)']);
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('6');
  await expect(page.locator('.explain-card__what')).toHaveText('System.out.println(result) shows 6 on the screen. The program is finished.');
});

test('Java For loop uses the rule-based explainer; Bubble sort uses the loops view', async ({ page }) => {
  await chooseJava(page);
  await page.getByRole('button', { name: 'For loop', exact: true }).click();
  await visualize(page).click();
  await expect(page.locator('.explain-card__what')).toHaveText(/total/, { timeout: 30_000 });
  await expect(page.locator('.life-box__text')).toHaveText(/^Like /);
  await lastStep(page);
  await expect(page.locator('.explain-card__what')).toContainText('System.out.println');
  await page.getByRole('button', { name: 'New code' }).click();

  await page.getByRole('button', { name: 'Bubble sort', exact: true }).click();
  await visualize(page).click();
  await expect(page.locator('.list-card__title')).toHaveText('nums, as a list', { timeout: 30_000 });
  for (let i = 0; i < 4; i++) await nextButton(page).click();
  await expect(page.locator('.swap-arrow')).toHaveCount(1);
  await expect(page.locator('.history-chip--now')).toHaveText('now [5, 2, 8, 1] → swapping 5 and 2');
});

test('Scanner: the input box asks for input, and the program reads it', async ({ page }) => {
  await chooseJava(page);
  await setCode(
    page,
    'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int age = sc.nextInt();\n        System.out.println(age + 1);\n    }\n}',
  );
  await visualize(page).click();
  const box = page.getByLabel('Your program reads input. Type your input here, one value per line or separated by spaces.');
  await expect(box).toBeFocused({ timeout: 30_000 });
  await box.fill('41');
  await visualize(page).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 30_000 });
  await lastStep(page);
  await expect(page.getByTestId('output')).toHaveText('42');
});

test('Java errors: unsupported code and type problems stay on Home; a crash shows the error step', async ({ page }) => {
  await chooseJava(page);
  const wrap = (body: string) => `public class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
  await setCode(page, wrap('        int x = 1;\n        Runnable r = () -> { };'));
  await visualize(page).click();
  await expect(page.locator('.editor-card__error')).toHaveText(/^Line 4: StepViz can't run /, { timeout: 30_000 });
  await setCode(page, wrap('        int x = 2.5;'));
  await visualize(page).click();
  await expect(page.locator('.editor-card__error')).toHaveText("Line 3: x is an int box, so it can't hold 2.5.");
  await setCode(page, wrap('        int[] a = {1, 2};\n        System.out.println(a[2]);'));
  await visualize(page).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 30_000 });
  await lastStep(page);
  await expect(page.locator('.explain-card__what')).toHaveText('This position is outside the list.');
  await expect(page.getByTestId('output-error')).toHaveText('ArrayIndexOutOfBoundsException: Index 2 out of bounds for length 2');
});
