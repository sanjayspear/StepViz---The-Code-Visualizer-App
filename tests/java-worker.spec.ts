// The built Java worker in a real browser (Java is not selectable in the app
// until J2, so this talks to the worker directly).
import { test, expect } from '@playwright/test';

test('the Java worker runs a program from our own site and makes no other requests', async ({ page, context }) => {
  await page.goto('./');
  const mainScript = await page.evaluate(() => [...document.scripts].map((s) => s.src).find((s) => /index-.*\.js/.test(s))!);
  const bundle = await (await page.request.get(mainScript)).text();
  const worker = `assets/${bundle.match(/java\.worker-[\w-]+\.js/)![0]}`;

  const requests: string[] = [];
  context.on('request', (r) => requests.push(r.url()));
  const result = await page.evaluate(async (worker) => {
    const files = {
      engine: new URL('tree-sitter/web-tree-sitter.wasm', document.baseURI).href,
      grammar: new URL('tree-sitter/tree-sitter-java.wasm', document.baseURI).href,
    };
    const source = 'public class Main {\n    public static void main(String[] args) {\n        int total = 0;\n        for (int i = 1; i <= 3; i++) {\n            total += i;\n        }\n        System.out.println(total);\n    }\n}';
    return new Promise<{ status: string; steps: number; output: string }>((resolve) => {
      const w = new Worker(worker, { type: 'module' });
      w.onmessage = (e) => {
        const r = e.data.result;
        resolve({ status: r.status, steps: r.steps.length, output: r.steps.at(-1).output });
        w.terminate();
      };
      w.postMessage({ type: 'run', source, maxSteps: 2000, maxSeconds: 5, files });
    });
  }, worker);
  expect(result).toEqual({ status: 'ok', steps: 9, output: '6\n' });
  const origin = new URL(page.url()).origin;
  expect(requests.every((u) => u.startsWith(origin))).toBe(true);
  expect(requests.map((u) => new URL(u).pathname.replace(/^.*\/(assets|tree-sitter)\//, '$1/'))).toEqual([
    expect.stringMatching(/^assets\/java\.worker-[\w-]+\.js$/),
    'tree-sitter/web-tree-sitter.wasm',
    'tree-sitter/tree-sitter-java.wasm',
  ]);
});

test('Java is still "coming soon" in the app', async ({ page }) => {
  await page.goto('./');
  await page.locator('select').selectOption('java');
  await expect(page.locator('select option:checked')).toHaveText('Java (coming soon)');
  await expect(page.locator('.editor-card__helper')).toHaveText('Coming soon');
});
