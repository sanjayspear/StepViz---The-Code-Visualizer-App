// Practice in Python: every test set passes against its reference solution, run through the
// same harness (src/practice/harness.py) and sandbox (src/runner/tracer.py) the app uses (Node).
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPyodide } from 'pyodide';
import data from '../src/practice/questions.json' with { type: 'json' };
import { PYTHON_TOPICS } from '../src/practice/content';
import { BASICS_MATH } from '../src/practice/content/python/basics-math';
import type { PracticeContent } from '../src/practice/content/types';
import { SOLUTIONS_BY_TOPIC } from './practice';
import { SOLUTIONS } from './practice/basics-math.solutions';

interface Result {
  call: string;
  passed: boolean;
  expected: string;
  got: string;
  problem?: string;
  errorType?: string;
}
interface Outcome {
  status: string;
  results: Result[];
  word?: string;
  line?: number;
}

let checkPy: (source: string, spec: string, seconds: number) => string;
test.beforeAll(async () => {
  const py = await loadPyodide();
  py.runPython(readFileSync(join(import.meta.dirname, '../src/runner/tracer.py'), 'utf8'));
  py.runPython(readFileSync(join(import.meta.dirname, '../src/practice/harness.py'), 'utf8'));
  py.runPython('lock_down()');
  checkPy = py.globals.get('check');
});
const check = (source: string, c: PracticeContent, seconds = 5): Outcome => JSON.parse(checkPy(source, JSON.stringify({ tests: c.tests, forbid: c.forbid }), seconds));
const byId = (id: number) => BASICS_MATH.find((c) => c.id === id)!;

for (const [topic, items] of Object.entries(PYTHON_TOPICS)) {
  const solutions = SOLUTIONS_BY_TOPIC[topic];
  test(`${topic}: content for every question of the topic, well formed`, () => {
    const ids = data.questions.filter((q) => q.topic === topic).map((q) => q.id);
    expect(items.map((c) => c.id)).toEqual(ids);
    for (const c of items) {
      // At least 4 tests; a class question's tests are whole scenarios of calls, so 3 of those.
      expect(c.tests.length, `Q${c.id}`).toBeGreaterThanOrEqual(c.tests.every((t) => t.call === '$ops') ? 3 : 4);
      expect(c.example, `Q${c.id}`).toMatch(/^Example: /);
      expect(c.hint, `Q${c.id}: the hint ends with a real-life comparison`).toMatch(/ Like [^.]+[.!]$|Like .+\.$/);
      expect(c.starter, `Q${c.id}: the starter calls the function once, so it can be visualised`).toMatch(/\nprint\(/);
      for (const t of c.tests) {
        if (t.call === '$ops') expect(c.starter, `Q${c.id}: the starter defines class ${t.cls}`).toMatch(new RegExp(`class ${t.cls}\\b`));
        else expect(c.starter, `Q${c.id}: the starter defines ${t.call}`).toContain(`def ${t.call}(`);
        if (t.then) expect(c.starter, `Q${c.id}: the starter defines ${t.then}`).toContain(`def ${t.then}(`);
      }
      // Whole numbers past 2^53 lose digits in JavaScript before Python sees them: write those as text instead.
      const walk = (v: unknown): void => {
        if (typeof v === 'number' && Number.isInteger(v)) expect(Number.isSafeInteger(v), `Q${c.id}: ${v} is too big to be exact`).toBe(true);
        else if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === 'object') Object.values(v).forEach(walk);
      };
      for (const t of c.tests) walk([t.args, t.expected]);
    }
  });

  for (const c of items) {
    test(`${topic} Q${c.id}: the reference solution passes all ${c.tests.length} tests; the starter runs but does not pass`, () => {
      expect(solutions?.[c.id], `Q${c.id}: a reference solution exists`).toBeTruthy();
      const ref = check(solutions[c.id], c);
      expect(ref.status, JSON.stringify(ref)).toBe('ok');
      for (const r of ref.results) expect(r.passed, `${r.call}: expected ${r.expected}, got ${r.got} ${r.problem ?? ''}`).toBe(true);
      const start = check(c.starter, c);
      expect(start.status, JSON.stringify(start)).toBe('ok');
      expect(start.results.some((r) => !r.passed)).toBe(true);
    });
  }
}

test('the harness is strict: 1 is not True, 2.0 is not 2, a missing function says so', () => {
  const evenOne = check('def is_even(n):\n    return 1 if n // 2 * 2 == n else 0\n', byId(2));
  expect(evenOne.results[0]).toMatchObject({ passed: false, expected: 'True', got: '1' });
  const floaty = check('def digit_sum(n):\n    return float(sum(int(c) for c in str(n)))\n', byId(3));
  expect(floaty.results[0]).toMatchObject({ passed: false, expected: '10', got: '10.0' });
  const missing = check('def something_else():\n    pass\n', byId(3));
  expect(missing.results[0]).toMatchObject({ passed: false, problem: 'missing' });
  // A tuple answer is shown as a tuple.
  const swap = check(SOLUTIONS[1], byId(1));
  expect(swap.results[0]).toMatchObject({ passed: true, expected: '(5, 3)', got: '(5, 3)' });
});

test('the question\'s own rules: % for Q2, bin() for Q15, ** for Q19 (text in quotes and comments does not count)', () => {
  expect(check('def is_even(n):\n    return n % 2 == 0\n', byId(2))).toMatchObject({ status: 'forbidden', word: '%', line: 2 });
  expect(check('def to_binary(n):\n    return bin(n)[2:]\n', byId(15))).toMatchObject({ status: 'forbidden', word: 'bin', line: 2 });
  expect(check('def int_sqrt(n):\n    return int(n ** 0.5)\n', byId(19))).toMatchObject({ status: 'forbidden', word: '**' });
  const quoted = check('def is_even(n):\n    # not using % here\n    s = "50%"\n    return n // 2 * 2 == n\n', byId(2));
  expect(quoted.status).toBe('ok');
});

test('slow answers time out per test instead of freezing (a naive fib, O(n) power)', () => {
  const naive = check('def fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n', byId(13));
  expect(naive.status).toBe('ok');
  expect(naive.results.slice(0, 4).every((r) => r.passed)).toBe(true);
  expect(naive.results.slice(4).every((r) => !r.passed && (r.problem === 'timeout' || r.problem === 'skipped'))).toBe(true);
  const slowPower = check('def power(x, n):\n    r = 1\n    for _ in range(n):\n        r *= x\n    return r\n', byId(18));
  expect(slowPower.results.at(-1)).toMatchObject({ passed: false, problem: 'timeout' });
});

test('errors: a syntax error, a crash in a test, a crash while the program starts, a blocked import', () => {
  expect(check('def is_even(n)\n    return True\n', byId(2))).toMatchObject({ status: 'syntax-error' });
  const crash = check('def digit_sum(n):\n    return 10 // (n - 1234)\n', byId(3));
  expect(crash.results[0]).toMatchObject({ passed: false, problem: 'error', errorType: 'ZeroDivisionError' });
  expect(check('x = 1 / 0\n', byId(3))).toMatchObject({ status: 'error', errorType: 'ZeroDivisionError', line: 1 });
  expect(check('import os\n', byId(3))).toMatchObject({ status: 'error', errorType: 'ImportError' });
});
