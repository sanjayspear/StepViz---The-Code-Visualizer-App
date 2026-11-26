// Practice in JavaScript: every test set passes against its JavaScript reference solution, run through
// the app's own JavaScript harness (src/practice/jsHarness.ts, which the locked-down worker runs).
import { test, expect } from '@playwright/test';
import data from '../src/practice/questions.json' with { type: 'json' };
import { JS_TOPICS } from '../src/practice/content';
import { PYTHON_WORDS } from '../src/practice/content/javascript/shared';
import type { PracticeContent } from '../src/practice/content/types';
import { checkJs, type JsForbid } from '../src/practice/jsHarness';
import { JS_SOLUTIONS_BY_TOPIC } from './practice/js';

const check = (source: string, c: PracticeContent) => checkJs(source, { tests: c.tests, forbid: c.forbid as JsForbid | undefined }, { maxSeconds: 5 });

for (const [topic, items] of Object.entries(JS_TOPICS)) {
  const solutions = JS_SOLUTIONS_BY_TOPIC[topic];
  test(`JavaScript ${topic}: content for every question of the topic, well formed`, () => {
    const ids = data.questions.filter((q) => q.topic === topic).map((q) => q.id);
    expect(items.map((c) => c.id)).toEqual(ids);
    for (const c of items) {
      expect(c.example, `Q${c.id}`).toMatch(/^Example: /);
      expect(`${c.example}\n${c.starter}`, `Q${c.id}: no TODO left`).not.toContain('TODO');
      expect(c.hint, `Q${c.id}: the hint ends with a real-life comparison`).toMatch(/ Like [^.]+[.!]$|Like .+\.$/);
      expect(c.hint, `Q${c.id}: the hint talks JavaScript, not Python`).not.toMatch(PYTHON_WORDS);
      expect(`${c.example}\n${c.starter}`, `Q${c.id}: no Python words in the example or starter`).not.toMatch(/\b(True|False|None|def|self|elif)\b|print\(/);
      expect(c.starter, `Q${c.id}: the starter calls the function once, so it can be visualised`).toMatch(/\nconsole\.log\(/);
      for (const t of c.tests) {
        if (t.call === '$ops') expect(c.starter, `Q${c.id}: the starter defines class ${t.cls}`).toMatch(new RegExp(`class ${t.cls}\\b`));
        else expect(c.starter, `Q${c.id}: the starter defines ${t.call}`).toMatch(new RegExp(`function ${t.call}\\(`));
        if (t.then) expect(c.starter, `Q${c.id}: the starter defines ${t.then}`).toMatch(new RegExp(`function ${t.then}\\(`));
      }
    }
  });

  for (const c of items) {
    test(`JavaScript ${topic} Q${c.id}: the reference solution passes all ${c.tests.length} tests; the starter runs but does not pass`, () => {
      expect(solutions?.[c.id], `Q${c.id}: a reference solution exists`).toBeTruthy();
      const ref = check(solutions[c.id], c);
      expect(ref.status, JSON.stringify(ref)).toBe('ok');
      for (const r of ref.results) expect(r.passed, `${r.call}: expected ${r.expected}, got ${r.got} ${r.problem ?? ''} ${r.errorType ?? ''} ${r.message ?? ''}`).toBe(true);
      const start = check(c.starter, c);
      expect(start.status, JSON.stringify(start)).toBe('ok');
      expect(start.results.some((r) => !r.passed)).toBe(true);
    });
  }
}

test('JavaScript harness: strict answers, rules by tokens, time limits, error lines', () => {
  const tests = [{ call: 'isEven', args: [4], expected: true }];
  const one = checkJs('function isEven(n) {\n  return n % 2 === 0 ? 1 : 0;\n}\n', { tests }, { maxSeconds: 5 });
  expect(one.results[0]).toMatchObject({ passed: false, expected: 'true', got: '1' });
  const missing = checkJs('function other() {}\n', { tests }, { maxSeconds: 5 });
  expect(missing.results[0]).toMatchObject({ passed: false, problem: 'missing' });
  const forbid: JsForbid = { ops: ['%'], why: 'No %.' };
  expect(checkJs('function isEven(n) {\n  // n % 2 in a comment is fine\n  return "%" !== n % 2;\n}\n', { tests, forbid }, { maxSeconds: 5 })).toMatchObject({ status: 'forbidden', line: 3, word: '%' });
  const loop = checkJs('function isEven(n) {\n  while (true) {}\n}\n', { tests }, { maxSeconds: 5, perTestSeconds: 0.3 });
  expect(loop.results[0]).toMatchObject({ passed: false, problem: 'timeout' });
  const crash = checkJs('function isEven(n) {\n  const a = null;\n  return a.b;\n}\n', { tests }, { maxSeconds: 5 });
  expect(crash.results[0]).toMatchObject({ passed: false, problem: 'error', errorType: 'TypeError', line: 3 });
  const deep = checkJs('function isEven(n) {\n  return isEven(n + 1);\n}\n', { tests }, { maxSeconds: 5 });
  expect(deep.results[0]).toMatchObject({ problem: 'error', errorType: 'RangeError', message: 'the function kept calling itself' });
  expect(checkJs('function isEven(n) {\n  return n %% 2;\n}\n', { tests }, { maxSeconds: 5 }).status).toBe('syntax-error');
  // A Map answer compares like an object; an in-place change is checked on the argument.
  const freq = checkJs('function f(a) {\n  const m = new Map();\n  for (const x of a) m.set(x, (m.get(x) ?? 0) + 1);\n  return m;\n}\n', { tests: [{ call: 'f', args: [[1, 1, 2]], expected: { 1: 2, 2: 1 } }] }, { maxSeconds: 5 });
  expect(freq.results[0].passed).toBe(true);
  const rev = checkJs('function r(a) {\n  a.reverse();\n}\n', { tests: [{ call: 'r', args: [[1, 2]], expected: null, mutated: { arg: 0, value: [2, 1] } }] }, { maxSeconds: 5 });
  expect(rev.results[0]).toMatchObject({ passed: true, phrased: true, expected: 'should change argument 1 to [2, 1]' });
});
