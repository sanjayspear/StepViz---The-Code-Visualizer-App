// Step kinds (Python and JavaScript tracers) and the rule-based explainer (Node).
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPyodide, type PyodideAPI } from 'pyodide';
import { runJs } from '../src/runner/js/runtime';
import { explainTrace, sayValue } from '../src/trace/explainer';
import { EXAMPLES } from '../src/examples/index';
import type { Trace } from '../src/trace/types';

let py: PyodideAPI;
let run: (source: string, inputs?: string) => string;

test.beforeAll(async () => {
  py = await loadPyodide();
  py.runPython(readFileSync(join(import.meta.dirname, '../src/runner/tracer.py'), 'utf8'));
  py.runPython('lock_down()');
  run = py.globals.get('run');
});

const blank = { what: '', life: '' };
function pyTrace(source: string, inputs: string[] = []): Trace {
  const r = JSON.parse(run(source, JSON.stringify(inputs)));
  return { language: 'python', source, steps: r.steps.map((s: object) => ({ ...s, explain: blank })), ...(r.listView ? { listView: r.listView } : {}) };
}
function jsTrace(source: string): Trace {
  const r = runJs(source, { maxSteps: 2000, maxSeconds: 5 });
  return { language: 'javascript', source, steps: r.steps.map((s) => ({ ...s, explain: blank })), ...(r.listView ? { listView: r.listView } : {}) };
}
const kinds = (t: Trace) => t.steps.map((s) => s.kind);
const ex = (id: string) => EXAMPLES.find((e) => e.id === id)!;

test('Python tracer reports a kind for every step', () => {
  expect(kinds(pyTrace(ex('factorial').source))).toEqual([
    'define', 'call', 'branch-skipped', 'call', 'branch-skipped', 'call', 'branch-skipped', 'call', 'branch-taken',
    'return', 'return', 'return', 'return', 'assign', 'print',
  ]);
  const t = pyTrace('total = 0\nwhile total < 3:\n    total += 2\nif total > 5:\n    print("big")\nelse:\n    print("small")\nname = input("Name? ")\na, b = b, a = 1, 2', ['Sam']);
  expect(kinds(t)).toEqual(['assign', 'loop-start', 'assign', 'loop-next', 'assign', 'loop-end', 'branch-skipped', 'print', 'input', 'assign']);
  expect(t.steps[1].detail).toEqual({ condition: 'total < 3' });
  expect(t.steps[6].detail).toEqual({ condition: 'total > 5', toElse: true });
  expect(t.steps[8].detail).toEqual({ targets: ['name'] });
  expect(kinds(pyTrace('x = 1\ny = x / 0'))).toEqual(['assign', 'crash']);
  expect(kinds(pyTrace(ex('bubble-sort').source)).filter((k) => k === 'swap')).toHaveLength(4);
});

test('JavaScript reports the same kinds as Python for the same programs', () => {
  for (const id of ['for-loop', 'fibonacci', 'bubble-sort', 'factorial']) {
    expect(kinds(jsTrace(ex(id).jsSource)), id).toEqual(kinds(pyTrace(ex(id).source)));
  }
});

test('assignments: new boxes, changes, "stays", values from a call', () => {
  const t = pyTrace('total = 0\ntotal = total + 3\ntotal = total + 0\na, b = 0, 1\na, b = b, a + b\ndef f():\n    return 6\nresult = f()');
  const e = explainTrace(t);
  expect(e[0].what).toMatch(/^(We make a box called total and put 0 in it|A new box called total now holds 0|total is created and set to 0)\.$/);
  expect(e[1].what).toMatch(/^(total changes from 0 to 3|total was 0 and is now 3|The box total gets a new value: 3 instead of 0)\.$/);
  expect(e[2].what).toMatch(/^total (stays 3|is set again, but it stays 3)\.$/);
  expect(e[3].what).toBe('We make new boxes: a starts at 0, and b starts at 1.');
  expect(e[4].what).toBe('a changes from 0 to 1, and b stays 1.');
  expect(e.at(-1)!.what).toMatch(/^(result gets the answer 6 from f\(\)|The answer 6 from f\(\) is stored in result)\.$/);
});

test('"In real life" lines fit the event: swapping seats only for swaps and simultaneous changes', () => {
  const programs = [
    pyTrace(ex('fibonacci').source),
    pyTrace(ex('bubble-sort').source),
    pyTrace('a, b = 0, 1\nx = 1\ny = 2\nx, y = y, x\nc, d = 5, 6'),
    jsTrace(ex('fibonacci').jsSource),
    jsTrace(ex('bubble-sort').jsSource),
  ];
  let seats = 0;
  for (const t of programs) {
    explainTrace(t).forEach((e, i) => {
      if (!e.life.includes('swapping seats')) return;
      seats++;
      const s = t.steps[i];
      expect(s.kind === 'swap' || (s.kind === 'assign' && s.detail?.simultaneous), `${t.source}\nstep ${i + 1}`).toBe(true);
    });
  }
  expect(seats).toBeGreaterThan(0);
  // Setting up new boxes at once is not a swap.
  const setup = explainTrace(pyTrace('a, b = 0, 1'));
  expect(setup[0].life).not.toContain('swapping seats');
});

test('branches, loops, calls, returns, print, swap', () => {
  const t = pyTrace('total = 0\nwhile total < 3:\n    total += 2\nfor i in range(2):\n    pass\nif total > 5:\n    print("big")\nelse:\n    print("small")');
  const e = explainTrace(t);
  expect(e[1].what).toMatch(/^(The loop starts: total < 3 is true|total < 3 is true, so the loop begins)\.$/);
  expect(e[3].what).toBe('Checking the condition again: total < 3 is still true.');
  expect(e[5].what).toMatch(/^(The loop is finished: total < 3 is no longer true|total < 3 is now false, so the loop stops)\.$/);
  expect(e[6].what).toMatch(/^(The loop starts\. i is 0 for the first round|Round one of the loop: i starts at 0)\.$/);
  const elseStep = t.steps.findIndex((s) => s.kind === 'branch-skipped');
  expect(e[elseStep].what).toMatch(/so the else part runs instead\.$/);
  expect(e[elseStep].what).toContain('total is 4');
  expect(e.at(-1)!.what).toMatch(/small/);

  const fact = explainTrace(pyTrace(ex('factorial').source));
  expect(fact[1].what).toMatch(/factorial\(3\)/);
  expect(fact[3].what).toMatch(/factorial\(3\).*factorial\(2\)|factorial\(2\).*factorial\(3\)/);
  expect(fact[9].what).toMatch(/^factorial\(0\) (is done and returns 1\. Its box is removed on the next step|hands back 1\. Its box will disappear next)\.$/);
  expect(fact[14].what).toMatch(/6/);

  const bubble = explainTrace(pyTrace(ex('bubble-sort').source));
  expect(bubble[3].what).toContain('nums[j] > nums[j + 1] (here: 5 > 2)');
  expect(bubble[4].what).toMatch(/^5 and 2 (are about to swap places|trade places now)\.$/);
});

test('long values are summarised in sentences; frames keep the real values', () => {
  expect(sayValue('[1, 2, 3, 4, 5, 6, 7, 8]')).toBe('a list of 8 numbers');
  expect(sayValue("['a', 'b', 'c', 'd', 'e', 'f', 'g']")).toBe('a list of 7 items');
  expect(sayValue('[1, 2, 3, 4, 5, 6]')).toBe('[1, 2, 3, 4, 5, 6]');
  expect(sayValue("'this is quite a long piece of text'")).toBe('a long piece of text');
  expect(sayValue('"short text"')).toBe('"short text"');
  const t = pyTrace('big = [1, 2, 3, 4, 5, 6, 7, 8]\nmsg = "this is quite a long piece of text"');
  const e = explainTrace(t);
  expect(e[0].what).toContain('a list of 8 numbers');
  expect(e[1].what).toContain('a long piece of text');
  expect(t.steps[1].frames[0].vars.big).toBe('[1, 2, 3, 4, 5, 6, 7, 8]');
});

test('crash steps have no real-life line; unknown statements keep "Line N runs: ..." with one', () => {
  const crash = explainTrace(pyTrace('x = 1\ny = x / 0'));
  expect(crash[1]).toEqual({ what: "Python can't divide a number by zero.", life: '' });
  const other = explainTrace(pyTrace('import math\nx = 1'));
  expect(other[0].what).toBe('Line 1 runs: import math');
  expect(other[0].life).toMatch(/^Like /);
});

test('wording varies: the same kind never repeats its sentence on consecutive steps', () => {
  for (const t of [pyTrace(ex('fibonacci').source), pyTrace(ex('bubble-sort').source), jsTrace(ex('for-loop').jsSource)]) {
    const e = explainTrace(t);
    for (let i = 1; i < e.length; i++) {
      expect(e[i].life, `${t.source} step ${i + 1}`).not.toBe(e[i - 1].life);
      if (t.steps[i].kind === t.steps[i - 1].kind) expect(e[i].what).not.toBe(e[i - 1].what);
    }
    expect(explainTrace(t)).toEqual(e); // the same program always reads the same
  }
});

test('only facts from the trace: every number in a sentence appears in that step', () => {
  const programs = [
    pyTrace(ex('factorial').source),
    pyTrace(ex('fibonacci').source),
    pyTrace(ex('bubble-sort').source),
    jsTrace(ex('bubble-sort').jsSource),
    jsTrace(ex('for-loop').jsSource),
  ];
  for (const t of programs) {
    explainTrace(t).forEach((e, i) => {
      const s = t.steps[i];
      const prev = t.steps[i - 1];
      const facts = [
        String(s.line),
        t.source.split('\n')[s.line - 1],
        s.output,
        JSON.stringify(s.frames),
        JSON.stringify(s.list ?? ''),
        JSON.stringify(prev?.frames ?? ''),
      ].join('\n');
      for (const n of e.what.match(/(?<![\w.])\d+(?:\.\d+)?/g) ?? []) {
        expect(facts, `"${e.what}" (step ${i + 1})`).toContain(n);
      }
    });
  }
});

test('language words: print, function and input change per language', () => {
  const base = pyTrace('def f():\n    pass\nprint(1)');
  const words = (language: string) => explainTrace({ ...base, language: language as Trace['language'] }).map((e) => e.what).join(' ');
  expect(words('python')).toMatch(/print/);
  expect(explainTrace(jsTrace('console.log(1);'))[0].what).toMatch(/console\.log|The screen now shows 1/);
  expect(words('java')).toMatch(/System\.out\.println|The screen now shows 1/);
  expect(words('java')).toMatch(/method|is defined now/);
  expect(words('cpp')).toMatch(/cout|The screen now shows 1/);
  expect(words('c')).toMatch(/printf|The screen now shows 1/);
});

test('list changes: added to the end, removed from the end, one item changed (Python and JavaScript)', () => {
  const py = pyTrace('squares = []\nfor n in range(2):\n    squares.append(n * n)\nsquares.pop()\nsquares[0] = 9');
  expect(kinds(py).filter((k) => k === 'assign')).toHaveLength(5);
  const e = explainTrace(py);
  expect(e[2].what).toMatch(/^(0 is added to the end of squares|squares grows by one: 0 goes on the end)\.$/);
  expect(e.at(-2)!.what).toMatch(/^(1 is taken off the end of squares|squares gets shorter: 1 is removed from the end)\.$/);
  expect(e.at(-1)!.what).toMatch(/^(squares\[0\] changes from 0 to 9|Position 0 of squares was 0 and is now 9)\.$/);
  const js = jsTrace('const xs = [];\nxs.push(5);');
  expect(js.steps.at(-1)!.kind).toBe('assign');
  expect(explainTrace(js).at(-1)!.what).toMatch(/^(5 is added to the end of xs|xs grows by one: 5 goes on the end)\.$/);
});

test('list changes in the middle and emptying a list read item by item', () => {
  const e = explainTrace(jsTrace('const xs = [1, 2, 3];\nxs.splice(1, 0, 7);\nxs.shift();\nxs.splice(0);'));
  expect(e[1].what).toMatch(/^(7 is put in at position 1 of xs|xs grows by one: 7 goes in at position 1)\.$/);
  expect(e[2].what).toMatch(/^(1 is taken out of xs at position 0|xs gets shorter: 1 at position 0 is removed)\.$/);
  expect(e[3].what).toMatch(/^(xs is emptied: it has no items now|All the items are taken out of xs, so it is empty now)\.$/);
});

test('dictionaries read key by key, like C++ maps', () => {
  const e = explainTrace(pyTrace('d = {}\nd["a"] = 1\nd["a"] = 5\ndel d["a"]'));
  expect(e[1].what).toMatch(/^(d gets a new key 'a' with the value 1|'a' is added to d with the value 1)\.$/);
  expect(e[2].what).toBe("d['a'] changes from 1 to 5.");
  expect(e[3].what).toBe("'a' is taken out of d.");
});

test('Python sets read item by item, like Java and C++ sets', () => {
  const e = explainTrace(pyTrace('s = set()\ns.add(3)\ns.add(3)\ns.discard(3)'));
  expect(e[1].what).toMatch(/^(3 is added to s|s gets 3)\.$/);
  expect(e[2].what).toBe('s does not change: a set holds each value only once.');
  expect(e[3].what).toBe('3 is taken out of s.');
});
