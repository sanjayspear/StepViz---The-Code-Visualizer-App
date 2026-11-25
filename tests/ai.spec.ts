// AI explanations in the app (Phase 2, stage i). The real model (880 MB, needs a
// GPU) is replaced by a small fake AI worker that speaks the same messages.
import { test, expect, type Page, type BrowserContext } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

type Mode = 'good' | 'wrong-number' | 'error' | 'slow-download';

/** A fake AI worker: same protocol as src/ai/ai.worker.ts. */
function fakeWorker(mode: Mode) {
  return `
const MODE = ${JSON.stringify(mode)};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let inFlight = 0;
self.onmessage = async (e) => {
  const m = e.data;
  console.log('ai-received ' + JSON.stringify({ type: m.type, keys: Object.keys(m).sort(), roles: (m.messages || []).map((x) => x.role) }));
  if (m.type === 'load') {
    const steps = MODE === 'slow-download' ? 200 : 4;
    for (let i = 1; i <= steps; i++) {
      await sleep(MODE === 'slow-download' ? 100 : 20);
      self.postMessage({ type: 'progress', progress: i / steps / 2, text: 'Fetching param cache[' + i + '/' + steps + ']' });
    }
    self.postMessage({ type: 'progress', progress: 0.9, text: 'Loading model from cache' });
    self.postMessage({ type: 'ready' });
  } else if (m.type === 'explain') {
    inFlight++;
    if (inFlight > 1) console.log('ai-overlap');
    await sleep(60);
    inFlight--;
    if (MODE === 'error') { self.postMessage({ type: 'explain-error', id: m.id, message: 'boom' }); return; }
    const line = /Line (\\d+):/.exec(m.messages[1].content)[1];
    const what = MODE === 'wrong-number' ? 'The answer is 999.' : 'Line ' + line + ' runs and the program moves on.';
    self.postMessage({ type: 'explained', id: m.id, text: JSON.stringify({ what, life: 'Like turning a page in a book.' }) });
  } else if (m.type === 'remove') {
    self.postMessage({ type: 'removed', had: true });
  }
};`;
}

async function withFakeAi(context: BrowserContext, page: Page, mode: Mode, gpu: 'f16' | 'none') {
  await context.route('**/assets/ai.worker-*.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: fakeWorker(mode) }),
  );
  await page.addInitScript((gpu) => {
    Object.defineProperty(Navigator.prototype, 'gpu', {
      configurable: true,
      get: () => (gpu === 'f16' ? { requestAdapter: async () => ({ features: new Set(['shader-f16']) }) } : undefined),
    });
  }, gpu);
}

const aiLogs = (page: Page) => {
  const logs: string[] = [];
  page.on('worker', (w) => w.on('console', (m) => logs.push(m.text())));
  return logs;
};

async function openPasted(page: Page, source = 'x = 2\ny = x + 3\nprint(y)') {
  await page.goto('./');
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText(source);
  await page.getByRole('button', { name: /Visualize my code|Loading Python…/ }).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 60_000 });
}

const aiButton = (page: Page) => page.getByRole('button', { name: 'Explain with AI (beta)' });
const what = (page: Page) => page.locator('.explain-card__what');

test('without WebGPU: the friendly message, and nothing is downloaded', async ({ page, context }) => {
  await withFakeAi(context, page, 'good', 'none');
  const requests: string[] = [];
  context.on('request', (r) => requests.push(r.url()));
  await openPasted(page);
  await aiButton(page).click();
  await expect(page.locator('.ai-panel__message')).toHaveText('AI explanations need a browser with WebGPU, such as Chrome on a computer.');
  expect(requests.filter((u) => /hf\.co|huggingface|ai\.worker|\/ai\//.test(u))).toEqual([]);
});

test('first use: the note, Cancel, then Continue with a download progress bar and AI text', async ({ page, context }) => {
  await withFakeAi(context, page, 'good', 'f16');
  await openPasted(page);
  await expect(what(page)).toHaveText('Line 1 runs: x = 2');
  await aiButton(page).click();
  await expect(page.locator('.ai-panel__note')).toHaveText(
    'This downloads a free AI model (about 1 GB) to your device the first time, so use Wi-Fi. Your code stays on your device.',
  );
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(aiButton(page)).toBeVisible();
  await aiButton(page).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  // AI text replaces the generic text, with the beta tag and a real-life line.
  await expect(what(page)).toHaveText('Line 1 runs and the program moves on.');
  await expect(page.locator('.ai-tag')).toHaveText('AI-explained (beta)');
  await expect(page.locator('.life-box__text')).toHaveText('Like turning a page in a book.');
  // Next steps were prepared in the background.
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(what(page)).toHaveText('Line 2 runs and the program moves on.');
  // The note is shown only before the first use.
  await page.reload();
  await page.getByRole('button', { name: /Visualize my code|Loading Python…/ }).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 60_000 });
});

test('download shows MB of 880 MB and can be cancelled', async ({ page, context }) => {
  await withFakeAi(context, page, 'slow-download', 'f16');
  await openPasted(page);
  await aiButton(page).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  const label = page.locator('#ai-progress-label');
  await expect(label).toHaveText(/^Downloading the AI model: [1-9]\d* MB of 880 MB$/);
  await expect(page.getByRole('progressbar', { name: /Downloading the AI model/ })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(aiButton(page)).toBeVisible();
  await expect(label).toHaveCount(0);
  await expect(what(page)).toHaveText('Line 1 runs: x = 2');
});

test('accuracy guard: AI text with a number that is not in the trace is discarded', async ({ page, context }) => {
  await withFakeAi(context, page, 'wrong-number', 'f16');
  await page.addInitScript(() => localStorage.setItem('stepviz.aiNoteSeen', 'yes'));
  await openPasted(page);
  await aiButton(page).click();
  await expect(page.locator('.ai-panel')).toHaveCount(0); // finished: nothing to show
  await expect(what(page)).toHaveText('Line 1 runs: x = 2');
  await expect(page.locator('.ai-tag')).toHaveCount(0);
  await expect(page.locator('.life-box')).toHaveCount(0);
});

test('if the AI fails, the normal text stays with "AI explanation isn\'t available right now."', async ({ page, context }) => {
  await withFakeAi(context, page, 'error', 'f16');
  await page.addInitScript(() => localStorage.setItem('stepviz.aiNoteSeen', 'yes'));
  await openPasted(page);
  await aiButton(page).click();
  await expect(page.locator('.ai-panel__message')).toHaveText("AI explanation isn't available right now.");
  await expect(what(page)).toHaveText('Line 1 runs: x = 2');
  await expect(page.locator('.ai-tag')).toHaveCount(0);
});

test('one explanation at a time; the AI worker only receives chat text', async ({ page, context }) => {
  await withFakeAi(context, page, 'good', 'f16');
  await page.addInitScript(() => localStorage.setItem('stepviz.aiNoteSeen', 'yes'));
  const logs = aiLogs(page);
  await openPasted(page, 'a = 1\nb = 2\nc = 3\nd = 4\ne = 5\nprint(a + b + c + d + e)');
  await aiButton(page).click();
  await expect(what(page)).toHaveText('Line 1 runs and the program moves on.');
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Next step' }).click();
  await expect(what(page)).toHaveText('Line 6 runs and the program moves on.');
  expect(logs).not.toContain('ai-overlap');
  const received = logs.filter((l) => l.startsWith('ai-received ')).map((l) => JSON.parse(l.slice('ai-received '.length)));
  expect(new Set(received.map((r) => r.type))).toEqual(new Set(['load', 'explain']));
  for (const r of received.filter((r) => r.type === 'explain')) {
    expect(r.keys).toEqual(['id', 'messages', 'type']);
    expect(r.roles).toEqual(['system', 'user']);
  }
});

test('built-in examples keep their hand-written text and have no AI button', async ({ page, context }) => {
  await withFakeAi(context, page, 'good', 'f16');
  await page.goto('./');
  await page.getByRole('button', { name: /Visualize my code/ }).click();
  await expect(page.locator('.step-screen')).toBeVisible();
  await expect(aiButton(page)).toHaveCount(0);
});

test('menu: "Remove downloaded AI model"', async ({ page, context }) => {
  await withFakeAi(context, page, 'good', 'f16');
  await openPasted(page);
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Remove downloaded AI model' }).click();
  await expect(page.locator('#step-menu')).toContainText('AI model removed.');
});

test('CSP: only our site and Hugging Face may be contacted, and it applies inside blob workers', async ({ page }) => {
  await page.goto('./');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("connect-src 'self' https://huggingface.co https://*.hf.co;");
  expect(csp).toContain("worker-src 'self' blob:");
  // A blob: worker (like the AI worker) inherits the page's CSP.
  const result = await page.evaluate(async () => {
    const code = `
      const tryFetch = (u) => fetch(u).then(() => 'ok', () => 'blocked');
      Promise.all([tryFetch(${JSON.stringify(location.origin + '/')}), tryFetch('https://example.com/')]).then((r) => postMessage(r));`;
    const w = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
    return new Promise((resolve) => (w.onmessage = (e) => resolve(e.data)));
  });
  expect(result).toEqual(['ok', 'blocked']);
});

test('no network request while code runs, even with the AI on', async ({ page, context }) => {
  await withFakeAi(context, page, 'good', 'f16');
  await page.addInitScript(() => localStorage.setItem('stepviz.aiNoteSeen', 'yes'));
  await openPasted(page, 'x = 1');
  await aiButton(page).click();
  await expect(page.locator('.ai-tag')).toBeVisible();
  await page.getByRole('button', { name: 'New code' }).click();
  for (const lang of ['python', 'javascript'] as const) {
    await page.locator('select').selectOption(lang);
    const source = lang === 'python' ? 'total = 0\nfor i in range(3):\n    total += i\nprint(total)' : 'let total = 0;\nfor (let i = 0; i < 3; i++) { total += i; }\nconsole.log(total);';
    await page.locator('.cm-content').click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.insertText(source);
    const requests: string[] = [];
    const onRequest = (r: { url(): string }) => requests.push(r.url());
    context.on('request', onRequest);
    await page.getByRole('button', { name: /Visualize my code/ }).click();
    await expect(page.locator('.step-screen')).toBeVisible({ timeout: 60_000 });
    context.off('request', onRequest);
    // Only the JavaScript runner's own worker script (same site) may load.
    expect(requests.filter((u) => !/\/assets\/js\.worker-/.test(u)), lang).toEqual([]);
    await page.getByRole('button', { name: 'New code' }).click();
  }
});
