// The live tracer (src/runner/tracer.py) must produce a valid trace for the
// factorial sample. It does not have to match the hand-written section 6
// fixture, which the app plays instead while the editor text is unchanged.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPyodide, type PyodideAPI } from 'pyodide';
import { EXAMPLES } from '../src/examples/index';
import type { RawRunResult } from '../src/runner/protocol';
import { FOR_LOOP_TRACE } from '../src/examples/forLoopTrace';
import { FIBONACCI_TRACE } from '../src/examples/fibonacciTrace';

let py: PyodideAPI;
let run: (source: string, inputs?: string, maxSteps?: number, maxSeconds?: number) => string;
let analyze: (source: string) => string;

test.beforeAll(async () => {
  py = await loadPyodide();
  py.runPython(readFileSync(join(import.meta.dirname, '../src/runner/tracer.py'), 'utf8'));
  py.runPython('lock_down()');
  run = py.globals.get('run');
  analyze = py.globals.get('analyze');
});

const source = (id: string) => EXAMPLES.find((e) => e.id === id)!.source;
const runJson = (src: string, inputs: string[] = []): RawRunResult => JSON.parse(run(src, JSON.stringify(inputs)));

test('live trace of the factorial sample is valid', () => {
  const src = source('factorial');
  const lineCount = src.split('\n').length;
  const result = runJson(src);

  expect(result.status).toBe('ok');
  expect(result.error).toBeNull();
  expect(result.steps.length).toBeGreaterThan(0);
  expect(result.steps.length).toBeLessThanOrEqual(2000);

  for (const step of result.steps) {
    // Line numbers point into the source.
    expect(step.line).toBeGreaterThanOrEqual(1);
    expect(step.line).toBeLessThanOrEqual(lineCount);
    // Global is always at the bottom.
    expect(step.frames[0].name).toBe('Global');
    // Exactly one frame is active (running or returning), and it is the top one.
    const active = step.frames.filter((f) => f.status !== 'waiting');
    expect(active).toHaveLength(1);
    expect(step.frames.at(-1)!.status).not.toBe('waiting');
    // Every value is a short string (at most 40 characters).
    for (const f of step.frames) {
      for (const v of Object.values(f.vars)) {
        expect(typeof v).toBe('string');
        expect(v.length).toBeLessThanOrEqual(40);
      }
      if (f.status === 'returning') expect(f.returns).toMatch(/^returns /);
    }
  }

  // The stack grows to Global + factorial(3), (2), (1), (0).
  const deepest = Math.max(...result.steps.map((s) => s.frames.length));
  expect(deepest).toBe(5);
  expect(result.steps.flatMap((s) => s.frames.map((f) => f.name))).toEqual(
    expect.arrayContaining(['factorial(3)', 'factorial(2)', 'factorial(1)', 'factorial(0)']),
  );
  // factorial(0) returns 1; the program prints 6 at the end, and not before.
  expect(
    result.steps.some((s) => s.frames.some((f) => f.name === 'factorial(0)' && f.returns === 'returns 1')),
  ).toBe(true);
  const last = result.steps.at(-1)!;
  expect(last.line).toBe(7);
  expect(last.output).toBe('6\n');
  expect(last.frames).toEqual([{ name: 'Global', vars: { factorial: 'function', result: '6' }, status: 'running' }]);
  expect(result.steps.slice(0, -1).every((s) => s.output === '')).toBe(true);
});

test('the other built-in examples trace without errors', () => {
  for (const id of ['for-loop', 'fibonacci', 'bubble-sort']) {
    const result = runJson(source(id));
    expect(result.status, id).toBe('ok');
    expect(result.steps.length, id).toBeGreaterThan(0);
  }
  expect(runJson(source('for-loop')).steps.at(-1)!.output).toBe('6\n');
  expect(runJson(source('fibonacci')).steps.at(-1)!.output).toBe('0\n1\n1\n2\n3\n');
  expect(runJson(source('bubble-sort')).steps.at(-1)!.output).toBe('[1, 2, 5, 8]\n');
});

test('step cap stops an endless loop', () => {
  const result = runJson('while True: pass');
  expect(result.status).toBe('cap');
  expect(result.steps.length).toBe(2000);
});

test('syntax errors come back with a line number in plain words', () => {
  expect(JSON.parse(analyze('for i in range(3)\n    print(i)'))).toEqual({
    ok: false,
    error: { line: 1, message: 'Line 1: A colon (:) is missing at the end of this line.' },
  });
});

test('pasted code cannot reach the JavaScript bridge or files', () => {
  for (const src of ['import js', 'import pyodide', 'from pyodide.code import run_js', 'import os']) {
    const result = runJson(src);
    expect(result.status, src).toBe('runtime-error');
    expect(result.error!.type, src).toBe('ImportError');
  }
  expect(runJson('open("x.txt")').error!.type).toBe('NameError');
});

test('input() reads the lines typed before running', () => {
  expect(JSON.parse(analyze('name = input("Name? ")\nprint("Hi", name)'))).toEqual({ ok: true, inputCalls: 1 });
  const result = runJson('name = input("Name? ")\nprint("Hi", name)', ['Sam']);
  expect(result.steps.at(-1)!.output).toBe('Name? Sam\nHi Sam\n');
});

test('For loop and Fibonacci fixtures still match the live tracer', () => {
  for (const fixture of [FOR_LOOP_TRACE, FIBONACCI_TRACE]) {
    const live = runJson(fixture.source);
    expect(live.status).toBe('ok');
    expect(live.steps.map(({ line, frames, output }) => ({ line, frames, output }))).toEqual(
      fixture.steps.map(({ line, frames, output }) => ({ line, frames, output })),
    );
    // Hand-written explanations: one per step, and no comparison is repeated.
    const lifes = fixture.steps.map((s) => s.explain.life);
    expect(new Set(lifes).size).toBe(lifes.length);
    expect(fixture.steps.every((s) => s.explain.what.length > 0)).toBe(true);
  }
});

test('a crash (10 / 0) ends with an error step in the crashing frame', () => {
  const result = runJson('print("start")\nx = 10\ny = x / 0\nprint(y)');
  expect(result.status).toBe('runtime-error');
  expect(result.error).toEqual({ line: 3, type: 'ZeroDivisionError', message: 'division by zero' });
  const last = result.steps.at(-1)!;
  expect(last.line).toBe(3);
  expect(last.error).toEqual({ type: 'ZeroDivisionError', message: 'division by zero' });
  expect(last.output).toBe('start\n');
  expect(last.frames).toEqual([{ name: 'Global', vars: { x: '10', y: '?' }, status: 'error' }]);
  // Only the last step is an error step.
  expect(result.steps.slice(0, -1).some((s) => s.error)).toBe(false);
});

test('a crash inside a function marks that frame as error', () => {
  const result = runJson('def f(n):\n    return 10 / n\nprint(f(2))\nprint(f(0))');
  const last = result.steps.at(-1)!;
  expect(last.line).toBe(2);
  expect(last.frames.map((f) => [f.name, f.status])).toEqual([
    ['Global', 'waiting'],
    ['f(0)', 'error'],
  ]);
});

test('a crash on the first line records no steps; a caught error is not a crash', () => {
  const first = runJson('x = 10 / 0');
  expect(first.status).toBe('runtime-error');
  expect(first.steps).toHaveLength(0);
  const caught = runJson('try:\n    1 / 0\nexcept ZeroDivisionError:\n    print("caught")');
  expect(caught.status).toBe('ok');
  expect(caught.steps.some((s) => s.error || s.frames.some((f) => f.status === 'error'))).toBe(false);
});
