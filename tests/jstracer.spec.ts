// The JavaScript tracer (src/runner/js), run under Node. Same trace shape and
// rules as the Python tracer.
import { test, expect } from '@playwright/test';
import { runJs } from '../src/runner/js/runtime';
import { analyzeJs } from '../src/runner/js/instrument';
import { EXAMPLES } from '../src/examples/index';
import { FACTORIAL_JS_TRACE } from '../src/examples/factorialJsTrace';

const opts = { maxSteps: 2000, maxSeconds: 5 };
const js = (id: string) => EXAMPLES.find((e) => e.id === id)!.jsSource;

test('live trace of the JavaScript factorial is valid and matches the Python shape', () => {
  const r = runJs(js('factorial'), opts);
  expect(r.status).toBe('ok');
  expect(r.steps.map((s) => s.line)).toEqual([1, 8, 2, 5, 2, 5, 2, 5, 2, 3, 5, 5, 5, 8, 9]);
  for (const step of r.steps) {
    expect(step.frames[0].name).toBe('Global');
    expect(step.frames.filter((f) => f.status !== 'waiting')).toHaveLength(1);
    expect(step.frames.at(-1)!.status).not.toBe('waiting');
  }
  expect(Math.max(...r.steps.map((s) => s.frames.length))).toBe(5);
  expect(r.steps.some((s) => s.frames.some((f) => f.name === 'factorial(0)' && f.returns === 'returns 1'))).toBe(true);
  expect(r.steps.at(-1)).toEqual({
    line: 9,
    frames: [{ name: 'Global', vars: { factorial: 'function', result: '6' }, status: 'running' }],
    output: '6\n',
    kind: 'print',
  });
  expect(r.steps[0].frames[0].vars).toEqual({ factorial: 'function', result: '?' }); // const before it is set
});

test('the JavaScript Factorial fixture still matches the live tracer', () => {
  const live = runJs(FACTORIAL_JS_TRACE.source, opts);
  const strip = (s: { line: number; frames: { returns?: string }[]; output: string }) => ({
    line: s.line,
    output: s.output,
    frames: s.frames.map((f) => ({ ...f, returns: f.returns ? 'returns' : undefined })),
  });
  expect(live.steps.map(strip)).toEqual(FACTORIAL_JS_TRACE.steps.map(strip));
  const lifes = FACTORIAL_JS_TRACE.steps.map((s) => s.explain.life);
  expect(new Set(lifes).size).toBe(lifes.length);
});

test('loop variables: a step shows the state after its line, before the loop update', () => {
  const r = runJs(js('for-loop'), opts);
  expect(r.status).toBe('ok');
  expect(r.steps.map((s) => [s.line, s.frames[0].vars])).toEqual([
    [1, { total: '0' }],
    [2, { total: '0', i: '1' }],
    [3, { total: '1', i: '1' }],
    [2, { total: '1', i: '2' }],
    [3, { total: '3', i: '2' }],
    [2, { total: '3', i: '3' }],
    [3, { total: '6', i: '3' }],
    [2, { total: '6' }], // loop-end, in the scope after the loop (i is gone)
    [5, { total: '6' }],
  ]);
  expect(r.steps.map((s) => s.kind)).toEqual([
    'assign', 'loop-start', 'assign', 'loop-next', 'assign', 'loop-next', 'assign', 'loop-end', 'print',
  ]);
  expect(r.steps.at(-1)!.output).toBe('6\n');
  expect(runJs(js('fibonacci'), opts).steps.at(-1)!.output).toBe('0\n1\n1\n2\n3\n');
});

test('bubble sort: list view, compared positions, swaps shown before they run', () => {
  const r = runJs(js('bubble-sort'), opts);
  expect(r.status).toBe('ok');
  expect(r.listView).toEqual({ list: 'nums', outerLine: 2, outerEndLine: 8, loopVars: ['i', 'j'] });
  const swaps = r.steps.filter((s) => s.list?.swap);
  expect(swaps.map((s) => [s.line, s.list!.values.join(','), s.list!.swap])).toEqual([
    [5, '5,2,8,1', [0, 1]],
    [5, '2,5,8,1', [2, 3]],
    [5, '2,5,1,8', [1, 2]],
    [5, '2,1,5,8', [0, 1]],
  ]);
  expect(r.steps[r.steps.indexOf(swaps[0]) + 1].list!.values).toEqual(['2', '5', '8', '1']);
  expect(r.steps.find((s) => s.line === 4)!.list!.compare).toEqual([0, 1]);
  expect(r.steps.at(-1)!.output).toBe('[1, 2, 5, 8]\n');
  expect(runJs(js('factorial'), opts).listView).toBeUndefined();
});

test('caps: endless loops and endless recursion stop', () => {
  for (const src of ['while (true) {}', 'for (;;) {}', 'let n = 0;\nwhile (true) { n++; }', 'function f() { return f(); }\nf();']) {
    expect(runJs(src, opts).status, src).toBe('cap');
  }
  const caught = runJs('while (true) { try { } catch (e) { } }', opts);
  expect(caught.status).toBe('cap');
});

test('a crash ends with an error step in the crashing frame', () => {
  const r = runJs('console.log("start");\nlet x = 10;\nlet y = x.foo.bar;\nconsole.log(y);', opts);
  expect(r.status).toBe('runtime-error');
  expect(r.error).toMatchObject({ line: 3, type: 'TypeError' });
  const last = r.steps.at(-1)!;
  expect(last.line).toBe(3);
  expect(last.error?.type).toBe('TypeError');
  expect(last.frames).toEqual([{ name: 'Global', vars: { x: '10', y: '?' }, status: 'error' }]);

  const inFn = runJs('function f(n) {\n  return n.length.x;\n}\nf(5);', opts);
  expect(inFn.steps.at(-1)!.frames.map((f) => [f.name, f.status])).toEqual([
    ['Global', 'waiting'],
    ['f(5)', 'error'],
  ]);
  const first = runJs('x = 5;', opts); // strict mode: undeclared name
  expect(first).toMatchObject({ status: 'runtime-error', steps: [], error: { line: 1, type: 'ReferenceError' } });
  const handled = runJs('try {\n  null.x;\n} catch (e) {\n  console.log("caught");\n}', opts);
  expect(handled.status).toBe('ok');
  expect(handled.steps.some((s) => s.error)).toBe(false);
});

test('syntax errors and import() come back as friendly messages with a line number', () => {
  expect(analyzeJs('let total = 0;\nfor (let i = 0; i < 3; i++ {\n}')).toEqual({
    ok: false,
    error: { line: 2, message: 'Line 2: JavaScript could not understand this line.' },
  });
  expect(analyzeJs('let s = "hello;')).toEqual({
    ok: false,
    error: { line: 1, message: 'Line 1: Some text in quotes is missing its closing quote.' },
  });
  expect(analyzeJs('import("https://example.com/x.js");')).toEqual({
    ok: false,
    error: { line: 1, message: 'Line 1: import is not available in StepViz.' },
  });
});

test('values are shown as short text; console.log prints like a beginner expects', () => {
  const r = runJs(
    'const s = "hi";\nconst o = { a: 1, b: [1, 2] };\nconst long = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";\nconsole.log(s, o, 3, [1, "x"]);',
    opts,
  );
  const vars = r.steps.at(-1)!.frames[0].vars;
  expect(vars.s).toBe('"hi"');
  expect(vars.o).toBe('{a: 1, b: [1, 2]}');
  expect(vars.long.length).toBe(40);
  expect(vars.long.endsWith('…')).toBe(true);
  expect(r.steps.at(-1)!.output).toBe('hi {a: 1, b: [1, 2]} 3 [1, "x"]\n');
});

test('pasted code cannot reach the network, globals or the Function constructor', () => {
  for (const src of [
    'fetch("https://example.com");',
    'self.postMessage("x");',
    'globalThis.fetch("https://example.com");',
    'new Function("return 1")();',
  ]) {
    expect(runJs(src, opts).status, src).toBe('runtime-error');
  }
});
