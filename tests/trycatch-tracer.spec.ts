// try/except in Python and try/catch in JavaScript: the same catch steps as Java and C++ (Node).
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPyodide } from 'pyodide';
import type { RawRunResult } from '../src/runner/protocol';
import { runJs } from '../src/runner/js/runtime';
import { explainTrace } from '../src/trace/explainer';

let runPy: (source: string, inputs?: string) => string;
test.beforeAll(async () => {
  const py = await loadPyodide();
  py.runPython(readFileSync(join(import.meta.dirname, '../src/runner/tracer.py'), 'utf8'));
  py.runPython('lock_down()');
  runPy = py.globals.get('run');
});

const python = (src: string): RawRunResult => JSON.parse(runPy(src, '[]'));
const js = (src: string): RawRunResult => runJs(src, { maxSteps: 2000, maxSeconds: 5 });
const steps = (r: RawRunResult) => r.steps.map((s) => [s.line, s.kind]);
const explain = (language: 'python' | 'javascript', source: string, r: RawRunResult) =>
  explainTrace({ language, source, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });

test('Python: the failing line is a catch step; except headers get no step', () => {
  const src = 'x = 0\ntry:\n    x = 10 / 0\n    print("no")\nexcept ValueError:\n    print("v")\nexcept ZeroDivisionError as e:\n    print("z", e)\nfinally:\n    print("f")\nprint(x)';
  const r = python(src);
  expect(r.status).toBe('ok');
  expect(steps(r)).toEqual([[1, 'assign'], [2, 'other'], [3, 'catch'], [8, 'print'], [10, 'print'], [11, 'print']]);
  expect(r.steps[2].detail).toEqual({ errorType: 'ZeroDivisionError' });
  const e = explain('python', src, r);
  expect(e[2].what).toMatch(/^Python can't divide a number by zero\. (Instead of stopping, the program jumps to the except part|The except part takes over, so the program does not stop)\.$/);
  expect(e[2].life).not.toBe('');
});

test('Python: raise in a function, caught in the caller; uncaught raise names itself', () => {
  const src = 'def check(a):\n    if a < 0:\n        raise ValueError("neg")\n    return a\n\ntry:\n    n = check(-1)\nexcept ValueError as e:\n    print(e)';
  const r = python(src);
  const k = r.steps.findIndex((s) => s.kind === 'catch');
  expect(r.steps[k]).toMatchObject({ line: 7, detail: { errorType: 'ValueError', errorMessage: 'neg', thrown: true } });
  expect(r.steps[k].frames.map((f) => f.name)).toEqual(['Global']);
  expect(explain('python', src, r)[k].what).toMatch(/^(The program raises a ValueError with the message "neg", and the except part takes over|This line raises a ValueError with the message "neg"\. Instead of stopping, the program jumps to the except part)\.$/);
  const up = 'a = 1\nraise RuntimeError("boom")';
  const u = python(up);
  expect(u.status).toBe('runtime-error');
  expect(explain('python', up, u).at(-1)!.what).toBe('The program raises a RuntimeError with the message "boom", and no except part takes it, so the program stops.');
});

test('Python: only a finally part runs first; the crash stays on the line that failed', () => {
  const src = 'a = 1\ntry:\n    raise RuntimeError("boom")\nfinally:\n    print("clean")';
  const r = python(src);
  expect(r.status).toBe('runtime-error');
  expect(steps(r)).toEqual([[1, 'assign'], [2, 'other'], [3, 'catch'], [5, 'print'], [3, 'crash']]);
  expect(explain('python', src, r)[2].what).toBe('The program raises a RuntimeError with the message "boom". Nothing catches it here, so the finally part runs first.');
  const inFn = python('def f():\n    try:\n        return 1 / 0\n    finally:\n        print("f")\n\nb = 2\nf()');
  expect(inFn.steps.map((s) => s.kind)).not.toContain('return');
  expect(inFn.steps.at(-1)).toMatchObject({ line: 3, kind: 'crash' });
  // A finally part that swallows the error (break): the program goes on normally, return steps included.
  const swallow = python('def g():\n    for i in range(1):\n        try:\n            1 / 0\n        finally:\n            break\n    return 5\n\nr = g()\nprint(r)');
  expect(swallow.status).toBe('ok');
  expect(swallow.steps.filter((s) => s.kind === 'return').map((s) => s.line)).toEqual([7]);
});

test('Python: a loop left by an error starts from its first round again', () => {
  const r = python('for i in range(2):\n    try:\n        x = 1 / i\n    except ZeroDivisionError:\n        x = 0\nprint(x)');
  expect(steps(r)).toEqual([[1, 'loop-start'], [2, 'other'], [3, 'catch'], [5, 'assign'], [1, 'loop-next'], [2, 'other'], [3, 'assign'], [1, 'loop-end'], [6, 'print']]);
});

test('JavaScript: engine errors and the program\'s own throw become catch steps', () => {
  const src = 'let x = 0;\ntry {\n  x = null.y;\n  console.log("no");\n} catch (e) {\n  console.log("caught", e.name);\n} finally {\n  console.log("f");\n}\nconsole.log(x);';
  const r = js(src);
  expect(r.status).toBe('ok');
  expect(steps(r)).toEqual([[1, 'assign'], [2, 'other'], [3, 'catch'], [6, 'print'], [8, 'print'], [10, 'print']]);
  expect(r.steps[2].detail).toEqual({ errorType: 'TypeError' });
  expect(r.steps.at(-1)!.output).toBe('caught TypeError\nf\n0\n');
  const fn = 'function check(a) {\n  if (a < 0) {\n    throw new RangeError("neg");\n  }\n  return a;\n}\ntry {\n  const n = check(-1);\n} catch ({ message }) {\n  console.log(message);\n}';
  const t = js(fn);
  const k = t.steps.findIndex((s) => s.kind === 'catch');
  expect(t.steps[k]).toMatchObject({ line: 8, detail: { errorType: 'RangeError', errorMessage: 'neg', thrown: true } });
  expect(t.steps[k + 1].frames[0].vars.message).toBe('"neg"');
  expect(explain('javascript', fn, t)[k].what).toMatch(/throws a RangeError with the message "neg"/);
});

test('JavaScript: finally only, catch without a name, uncaught throw of a plain value', () => {
  const src = 'let a = 1;\ntry {\n  throw "boom";\n} finally {\n  console.log("clean");\n}';
  const r = js(src);
  expect(steps(r)).toEqual([[1, 'assign'], [2, 'other'], [3, 'catch'], [5, 'print'], [3, 'crash']]);
  const e = explain('javascript', src, r);
  expect(e[2].what).toBe('The program throws the value "boom". Nothing catches it here, so the finally part runs first.');
  expect(e.at(-1)!.what).toBe('The program throws the value "boom", and no catch part takes it, so the program stops.');
  expect(js('let t = 0;\ntry {\n  t = JSON.parse("{");\n} catch {\n  t = 2;\n}\nconsole.log(t);').steps.at(-1)!.output).toBe('2\n');
  // return inside try with finally still returns normally.
  expect(js('function f() {\n  try {\n    return 1;\n  } finally {\n    console.log("f");\n  }\n}\nconsole.log(f());').steps.at(-1)!.output).toBe('f\n1\n');
});

test('JavaScript: names starting with __sv are kept for StepViz', () => {
  expect(js('let a = 1;\n__sv.l = null;').error).toEqual({ line: 2, message: 'Line 2: names starting with __sv are used by StepViz. Please choose another name.' });
});
