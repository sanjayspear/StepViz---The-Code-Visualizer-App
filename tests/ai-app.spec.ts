// AI explanations with Llama in Ollama on this computer. Ollama is replaced by
// a stand-in at http://localhost:11434 that answers like the real one.
import { test, expect, type Page, type Route } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const OLLAMA = 'http://localhost:11434';
const visualize = (page: Page) => page.getByRole('button', { name: /Visualize my code|Loading Python…/ });
const aiButton = (page: Page) => page.getByRole('button', { name: 'Explain with AI (Llama on this computer)' });
const what = (page: Page) => page.locator('.explain-card__what');

interface Fake {
  running?: boolean;
  models?: string[];
  reply?: (body: string) => { status: number; content?: string };
}
/** Pretend Ollama; returns the list of requests it received. */
async function fakeOllama(page: Page, fake: Fake) {
  const seen: { url: string; body: string }[] = [];
  await page.route(`${OLLAMA}/**`, async (route: Route) => {
    const req = route.request();
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    seen.push({ url: req.url(), body: req.postData() ?? '' });
    if (!fake.running) return route.abort('connectionrefused');
    if (req.url().endsWith('/api/tags')) {
      return route.fulfill({ headers: cors, json: { models: (fake.models ?? []).map((name) => ({ name, model: name })) } });
    }
    const r = fake.reply?.(req.postData() ?? '') ?? { status: 500 };
    return route.fulfill({ status: r.status, headers: cors, json: { message: { role: 'assistant', content: r.content ?? '' } } });
  });
  return seen;
}

/** A small JavaScript program, traced live. Step 1: let a = 2. */
async function openLiveTrace(page: Page) {
  await page.goto('./');
  await page.locator('select').selectOption('javascript');
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText('let a = 2;\nlet b = a + 3;\nconsole.log(b);');
  await visualize(page).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 30_000 });
}

test('hand-written examples have no AI button; live traces do, with the desktop requirement line', async ({ page }) => {
  const seen = await fakeOllama(page, { running: true, models: ['llama3.2:3b'] });
  await page.goto('./');
  await visualize(page).click();
  await expect(page.locator('.step-screen')).toBeVisible({ timeout: 30_000 });
  await expect(aiButton(page)).toHaveCount(0);
  await openLiveTrace(page);
  await expect(aiButton(page)).toBeVisible();
  await expect(page.locator('.ai-panel__message')).toHaveText('AI explanations work on a desktop or laptop with Llama installed (free).');
  // Nothing talks to Ollama until the student asks.
  expect(seen).toEqual([]);
});

test('Ollama not found: the setup steps, with copy-ready commands for this site', async ({ page }) => {
  await fakeOllama(page, { running: false });
  await openLiveTrace(page);
  await aiButton(page).click();
  const panel = page.getByRole('group', { name: 'Set up AI explanations' });
  await expect(panel).toBeVisible();
  await expect(panel.locator('.ai-panel__note')).toContainText('We could not reach Llama on this computer.');
  await expect(panel.locator('code')).toHaveText([
    'ollama pull llama3.2:3b',
    'launchctl setenv OLLAMA_ORIGINS "http://localhost:4317"',
    'setx OLLAMA_ORIGINS "http://localhost:4317"',
  ]);
  await expect(panel).toContainText('Built with Llama');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(aiButton(page)).toBeVisible();
  await page.getByRole('button', { name: 'How to set it up →' }).click();
  await expect(panel).toBeVisible();
});

test('Ollama running without the model: asks for step 2; Try again finds it', async ({ page }) => {
  const fake: Fake = { running: true, models: ['mistral:7b'] };
  await fakeOllama(page, fake);
  await openLiveTrace(page);
  await aiButton(page).click();
  await expect(page.locator('.ai-panel__note')).toHaveText(
    'Ollama is running, but the Llama model is not downloaded yet. Do step 2, then press Try again.',
  );
  fake.models = ['llama3.2:3b'];
  fake.reply = () => ({ status: 200, content: JSON.stringify({ what: 'We make a box called a and put 2 in it.', life: 'Like dropping 2 coins into a jar.' }) });
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(what(page)).toHaveText('We make a box called a and put 2 in it.');
});

test('Llama explains: the AI text replaces the built-in text, tagged; only trace facts are sent', async ({ page }) => {
  const seen = await fakeOllama(page, {
    running: true,
    models: ['llama3.2:3b-instruct-q4_K_M'],
    reply: (body) => {
      const facts = JSON.parse(body).messages[1].content as string;
      if (facts.includes('Line 1:')) return { status: 200, content: JSON.stringify({ what: 'We make a box called a and put 2 in it.', life: 'Like dropping 2 coins into a jar.' }) };
      // Step 2: an invented number, so the accuracy guard keeps the built-in text.
      if (facts.includes('Line 2:')) return { status: 200, content: JSON.stringify({ what: 'b is now 99.', life: 'Like a jar of 99 coins.' }) };
      return { status: 500 };
    },
  });
  await openLiveTrace(page);
  const builtIn2: string[] = [];
  await aiButton(page).click();
  await expect(what(page)).toHaveText('We make a box called a and put 2 in it.');
  await expect(page.locator('.ai-tag')).toHaveText('AI-explained (beta)');
  await expect(page.locator('.life-box__text')).toHaveText('Like dropping 2 coins into a jar.');
  // Step 2: rejected by the guard, so the built-in text stays, with no tag.
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page.locator('.ai-panel')).toHaveCount(0);
  builtIn2.push((await what(page).textContent()) ?? '');
  expect(builtIn2[0]).not.toContain('99');
  await expect(page.locator('.ai-tag')).toHaveCount(0);
  // Step 3: Ollama fails, so the built-in text stays with a note.
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page.locator('.ai-panel__message')).toHaveText("AI explanation isn't available right now.");
  // Every request went to Ollama on this computer, with the model and trace facts only.
  const chats = seen.filter((r) => r.url.endsWith('/api/chat'));
  expect(chats.length).toBeGreaterThanOrEqual(3);
  for (const c of chats) {
    const body = JSON.parse(c.body);
    expect(body.model).toBe('llama3.2:3b');
    expect(body.messages[1].content).toMatch(/^Language: JavaScript\nLine \d: /);
  }
});

test('phone: no AI button; the menu says where AI works', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLiveTrace(page);
  await expect(aiButton(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('#step-menu')).toContainText('AI explanations are available on a desktop with Llama installed.');
});

test('the site policy allows only Ollama on this computer besides our own site', async ({ page }) => {
  await page.goto('./');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("connect-src 'self' http://localhost:11434;");
});
