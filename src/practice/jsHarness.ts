// Practice tests for JavaScript answers: the JavaScript twin of src/practice/harness.py.
// Runs in the locked-down JavaScript worker (js.worker.ts), never on the page, and in Node tests.
//
// The answer is parsed with Acorn (same syntax messages as the visualiser), checked against the
// question's "without X" rule by tokens (text in quotes and comments does not count), and run once,
// untraced, with a small time check added at the start of every loop round and function call. Then
// each test calls the student's function (or makes their class and calls its methods) with fresh
// arguments, a time limit of its own, and compares the answer like the Python harness does.
// Test specs are the Python ones with camelCase names (see content/javascript/shared.ts).
import { tokenizer } from 'acorn';
import type { PracticeTest, Value } from './content/types';
import type { CheckResult, CheckTestResult } from '../runner/protocol';
import { findBlocked, parseProgram, walk } from '../runner/js/instrument';
import { formatLog } from '../runner/js/inspect';

export interface JsForbid {
  names?: string[];
  ops?: string[];
  patterns?: { regex: string; shown: string }[];
  why: string;
}
export interface JsCheckOptions {
  maxSeconds: number;
  perTestSeconds?: number;
  /** the worker's lockdown, called just before the answer runs */
  beforeRun?: () => void;
}

/** Names the answer must not reach (passed as undefined parameters, like the visualiser's runtime). */
const SHADOWED = [
  'self',
  'globalThis',
  'window',
  'postMessage',
  'close',
  'importScripts',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'Worker',
  'Function',
  'setTimeout',
  'setInterval',
  'queueMicrotask',
  'onmessage',
  'require',
  'process',
];

class TimeUp {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
type Fns = Record<string, Any>;

// ---- the rule ("without X") -------------------------------------------------------------------

export function forbiddenJs(source: string, forbid: JsForbid | undefined): [number, string] | null {
  if (!forbid) return null;
  const names = new Set(forbid.names ?? []);
  const ops = new Set(forbid.ops ?? []);
  const code: [number, string][] = [];
  try {
    for (const tok of tokenizer(source, { ecmaVersion: 'latest', locations: true })) {
      const line = tok.loc!.start.line;
      const text = source.slice(tok.start, tok.end);
      const label = tok.type.label;
      if ((label === 'name' || tok.type.keyword) && names.has(text)) return [line, text];
      if (ops.has(text) && label !== 'name' && label !== 'string' && label !== 'template') return [line, text];
      if (label === 'string' || label === 'template') code.push([line, '"…"']);
      else if (label === 'regexp') code.push([line, '/…/']);
      else if (label !== '`') code.push([line, text]);
    }
  } catch {
    return null;
  }
  for (const p of forbid.patterns ?? []) {
    const rx = new RegExp(p.regex);
    const byLine = new Map<number, string>();
    for (const [line, text] of code) byLine.set(line, (byLine.get(line) ?? '') + text);
    for (const line of [...byLine.keys()].sort((a, b) => a - b)) if (rx.test(byLine.get(line)!)) return [line, p.shown];
  }
  return null;
}

// ---- the time check ---------------------------------------------------------------------------

/** Adds __svTick(); at the start of every loop body and function body; no new lines, so line numbers stay. */
function withTicks(source: string, ast: Any): string {
  const inserts: [number, string][] = [];
  const atBody = (body: Any) => {
    if (body.type === 'BlockStatement') inserts.push([body.start + 1, '__svTick();']);
    else {
      inserts.push([body.start, '{__svTick();']);
      inserts.push([body.end, '}']);
    }
  };
  walk(ast, (n) => {
    if (/^(For|ForIn|ForOf|While|DoWhile)Statement$/.test(n.type)) atBody(n.body);
    if ((n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') && n.body.type === 'BlockStatement') {
      inserts.push([n.body.start + 1, '__svTick();']);
    }
  });
  inserts.sort((a, b) => b[0] - a[0]);
  let out = source;
  for (const [at, text] of inserts) out = out.slice(0, at) + text + out.slice(at);
  return out;
}

/** Line numbers of code made with new Function differ by browser: measure it once. */
let lineShift: number | null | undefined;
function measureShift(): number | null {
  if (lineShift !== undefined) return lineShift;
  try {
    new Function('"use strict";\nthrow new Error("probe");')();
  } catch (e) {
    const at = stackLine(e);
    lineShift = at === null ? null : at - 2;
  }
  return lineShift ?? null;
}
function stackLine(e: unknown): number | null {
  const stack = e instanceof Error ? (e.stack ?? '') : '';
  for (const line of stack.split('\n')) {
    if (!/anonymous|Function|eval/.test(line)) continue;
    const m = /:(\d+):\d+\)?\s*$/.exec(line);
    if (m) return Number(m[1]);
  }
  return null;
}
/** The student's line for an error (their line n is line n + 1 of the made function's body). */
function userLine(e: unknown): number | null {
  const shift = measureShift();
  const at = stackLine(e);
  if (shift === null || at === null) return null;
  const n = at - shift - 1;
  return n >= 1 ? n : null;
}

// ---- building values --------------------------------------------------------------------------

class ListNode {
  val: Any;
  next: Any;
  constructor(val: Any = 0, next: Any = null) {
    this.val = val;
    this.next = next;
  }
}
class TreeNode {
  val: Any;
  left: Any;
  right: Any;
  constructor(val: Any = 0, left: Any = null, right: Any = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
class Node {
  val: Any;
  [k: string]: Any;
  constructor(val: Any = 0) {
    this.val = val;
  }
}

interface Ctx {
  listCls: Any;
  treeCls: Any;
  nodeCls: Any;
  inputs: Any[];
  listNodes: Any[];
}

function makeList(values: Value[], ctx: Ctx, pos = -1): Any {
  const nodes = values.map((v) => {
    const n = new ctx.listCls(v);
    n.val = v;
    n.next = null;
    return n;
  });
  for (let i = 0; i + 1 < nodes.length; i++) nodes[i].next = nodes[i + 1];
  if (nodes.length && pos >= 0) nodes[nodes.length - 1].next = nodes[pos];
  ctx.inputs.push(...nodes);
  ctx.listNodes.push(...nodes);
  return nodes.length ? nodes[0] : null;
}

function makeTree(values: Value[], ctx: Ctx): Any {
  if (!values.length || values[0] === null) return null;
  const node = (v: Value) => {
    const n = new ctx.treeCls(v);
    n.val = v;
    n.left = null;
    n.right = null;
    ctx.inputs.push(n);
    return n;
  };
  const root = node(values[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const cur = queue.shift();
    if (i < values.length && values[i] !== null) queue.push((cur.left = node(values[i])));
    i++;
    if (i < values.length && values[i] !== null) queue.push((cur.right = node(values[i])));
    i++;
  }
  return root;
}

function build(value: Value, ctx: Ctx, counter: { calls: number }): Any {
  if (Array.isArray(value)) return value.map((v) => build(v, ctx, counter));
  if (value === null || typeof value !== 'object') return value;
  const v = value as Record<string, Any>;
  if ('$list' in v) return makeList(v.$list, ctx);
  if ('$cycle' in v) return makeList(v.$cycle, ctx, v.pos ?? -1);
  if ('$tree' in v) return makeTree(v.$tree, ctx);
  if ('$randlist' in v) {
    const pairs = v.$randlist as [Value, number | null][];
    const nodes = pairs.map(([val]) => {
      const n = new ctx.nodeCls(val);
      n.val = val;
      n.next = null;
      n.random = null;
      return n;
    });
    for (let i = 0; i + 1 < nodes.length; i++) nodes[i].next = nodes[i + 1];
    pairs.forEach(([, r], i) => (nodes[i].random = r === null ? null : nodes[r]));
    ctx.inputs.push(...nodes);
    return nodes.length ? nodes[0] : null;
  }
  if ('$graph' in v) {
    const adj = v.$graph as number[][];
    const nodes = adj.map((_, i) => {
      const n = new ctx.nodeCls(i + 1);
      n.val = i + 1;
      n.neighbors = [];
      return n;
    });
    adj.forEach((nbrs, i) => (nodes[i].neighbors = nbrs.map((k) => nodes[k - 1])));
    ctx.inputs.push(...nodes);
    return nodes.length ? nodes[0] : null;
  }
  if ('$guess' in v) {
    const pick = v.$guess as number;
    return (num: number) => {
      counter.calls++;
      return num === pick ? 0 : pick < num ? -1 : 1;
    };
  }
  if ('$bad' in v) {
    const first = v.$bad as number;
    return (version: number) => {
      counter.calls++;
      return version >= first;
    };
  }
  if ('$reader' in v) {
    const data = v.$reader as number[];
    return { get: (i: number) => (i >= 0 && i < data.length ? data[i] : 2147483647) };
  }
  const out: Record<string, Any> = {};
  for (const [k, x] of Object.entries(v)) out[k] = build(x, ctx, counter);
  return out;
}

// ---- reading answers back ---------------------------------------------------------------------

const isObj = (x: Any) => x !== null && typeof x === 'object';
const has = (x: Any, ...keys: string[]) => isObj(x) && !Array.isArray(x) && !(x instanceof Map) && keys.every((k) => k in x);

/** Plain values for comparing and showing: nodes become {$list: ...}, {$tree: ...}; Maps become objects. */
export function exportValue(value: Any, depth = 0): Value {
  if (depth > 50) return '...';
  if (value === undefined) return null;
  if (typeof value === 'function') return '<function>';
  if (typeof value === 'bigint') return Number(value);
  if (!isObj(value)) return value;
  if (Array.isArray(value)) return value.map((v) => exportValue(v, depth + 1));
  if (value instanceof Map) {
    const out: Record<string, Value> = {};
    for (const [k, v] of value) out[String(k)] = exportValue(v, depth + 1);
    return out;
  }
  if (value instanceof Set) return [...value].map((v) => exportValue(v, depth + 1));
  if (has(value, 'neighbors')) {
    const order: Any[] = [];
    const seen = new Set<Any>([value]);
    const queue = [value];
    while (queue.length) {
      const n = queue.shift();
      order.push(n);
      for (const m of n.neighbors ?? []) if (!seen.has(m)) (seen.add(m), queue.push(m));
    }
    order.sort((a, b) => a.val - b.val);
    return { $graph: order.map((n) => (n.neighbors ?? []).map((m: Any) => m.val).sort((a: number, b: number) => a - b)) };
  }
  if (has(value, 'random', 'next')) {
    const nodes: Any[] = [];
    const seen = new Set<Any>();
    for (let n = value; n && !seen.has(n) && nodes.length < 10000; n = n.next) (seen.add(n), nodes.push(n));
    return { $randlist: nodes.map((x) => [exportValue(x.val, depth + 1), x.random ? (nodes.indexOf(x.random) >= 0 ? nodes.indexOf(x.random) : null) : null]) };
  }
  if (has(value, 'left', 'right', 'val')) {
    const out: Value[] = [];
    const queue: Any[] = [value];
    while (queue.length && out.length <= 20000) {
      const n = queue.shift();
      if (!n) {
        out.push(null);
        continue;
      }
      out.push(exportValue(n.val, depth + 1));
      queue.push(n.left ?? null, n.right ?? null);
    }
    while (out.length && out[out.length - 1] === null) out.pop();
    return { $tree: out };
  }
  if (has(value, 'next', 'val')) {
    const values: Value[] = [];
    const seen = new Map<Any, number>();
    let n = value;
    while (n && !seen.has(n) && values.length < 10000) {
      seen.set(n, values.length);
      values.push(exportValue(n.val, depth + 1));
      n = n.next;
    }
    if (n) return { $cycle: values, pos: seen.get(n) ?? -1 };
    return { $list: values };
  }
  const out: Record<string, Value> = {};
  for (const [k, v] of Object.entries(value)) out[k] = exportValue(v, depth + 1);
  return out;
}

function nodesOf(value: Any): Any[] {
  const found: Any[] = [];
  const seen = new Set<Any>();
  const todo = [value];
  while (todo.length && found.length < 20000) {
    const x = todo.pop();
    if (!isObj(x) || seen.has(x)) continue;
    if (Array.isArray(x)) {
      todo.push(...x);
      continue;
    }
    if (!['next', 'left', 'neighbors', 'random'].some((k) => k in x)) continue;
    seen.add(x);
    found.push(x);
    todo.push(x.next, x.left, x.right, x.random, ...(x.neighbors ?? []));
  }
  return found;
}

/** How a value is shown in a test line (JavaScript style: "text", null, true). */
export function textOf(value: Value): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return `[${value.map(textOf).join(', ')}]`;
  const v = value as Record<string, Any>;
  if ('$list' in v) return 'list ' + (v.$list.length ? v.$list.map(textOf).join(' -> ') : '(empty)');
  if ('$cycle' in v) {
    const body = v.$cycle.map(textOf).join(' -> ');
    return (v.pos ?? -1) >= 0 ? `list ${body} (the last node links back to position ${v.pos})` : `list ${body}`;
  }
  if ('$tree' in v) return `tree ${textOf(v.$tree)}`;
  if ('$randlist' in v) return `list ${textOf(v.$randlist)}`;
  if ('$graph' in v) return `graph ${textOf(v.$graph)}`;
  if ('$guess' in v) return `guess (the hidden number is ${v.$guess})`;
  if ('$bad' in v) return `isBad (the first bad version is ${v.$bad})`;
  if ('$reader' in v) return `reader ${textOf(v.$reader)}`;
  return `{${Object.entries(v)
    .map(([k, x]) => `${JSON.stringify(k)}: ${textOf(x)}`)
    .join(', ')}}`;
}

// ---- comparing --------------------------------------------------------------------------------

const keyOf = (v: Value): string => JSON.stringify(v, (_k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort()) : x));

function same(got: Value, expected: Value, how = 'exact'): boolean {
  if (how === 'unordered' && Array.isArray(got) && Array.isArray(expected)) {
    return same([...got].sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : 1)), [...expected].sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : 1)));
  }
  if (how === 'sets' && Array.isArray(got) && Array.isArray(expected)) {
    const norm = (xs: Value[]) => xs.map((x) => (Array.isArray(x) ? [...x].sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : 1)) : x)).sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : 1));
    return same(norm(got), norm(expected));
  }
  if (how === 'approx' && typeof got === 'number' && typeof expected === 'number') return Math.abs(got - expected) <= 1e-9 * Math.max(1, Math.abs(expected));
  if (expected === null) return got === null;
  if (Array.isArray(expected)) return Array.isArray(got) && got.length === expected.length && got.every((g, i) => same(g, expected[i], how));
  if (typeof expected === 'object') {
    if (!got || typeof got !== 'object' || Array.isArray(got)) return false;
    const a = Object.keys(got).sort();
    const b = Object.keys(expected).sort();
    return a.length === b.length && a.every((k, i) => k === b[i]) && b.every((k) => same((got as Any)[k], (expected as Any)[k], how));
  }
  return typeof got === typeof expected && got === expected;
}

function treeNodes(values: Value[]): [Value, number | null, number | null][] {
  if (!values.length || values[0] === null) return [];
  const nodes: [Value, number | null, number | null][] = [[values[0], null, null]];
  const queue = [0];
  let i = 1;
  while (queue.length && i < values.length) {
    const cur = queue.shift()!;
    for (const side of [1, 2] as const) {
      if (i < values.length && values[i] !== null) {
        nodes.push([values[i], null, null]);
        nodes[cur][side] = nodes.length - 1;
        queue.push(nodes.length - 1);
      }
      i++;
    }
  }
  return nodes;
}
function treeInorder(values: Value[]): Value[] {
  const nodes = treeNodes(values);
  const out: Value[] = [];
  const go = (i: number | null) => {
    if (i === null) return;
    go(nodes[i][1]);
    out.push(nodes[i][0]);
    go(nodes[i][2]);
  };
  if (nodes.length) go(0);
  return out;
}
const isBst = (values: Value[]) => {
  const o = treeInorder(values) as number[];
  return o.every((x, i) => i === 0 || o[i - 1] < x);
};
function isBalanced(values: Value[]): boolean {
  const nodes = treeNodes(values);
  const height = (i: number | null): number => {
    if (i === null) return 0;
    const a = height(nodes[i][1]);
    const b = height(nodes[i][2]);
    return a < 0 || b < 0 || Math.abs(a - b) > 1 ? -1 : Math.max(a, b) + 1;
  };
  return !nodes.length || height(0) >= 0;
}

function shapeOk(how: string, got: Value, args: Value[], expected: Value): boolean {
  if (how === 'topo') {
    const [n, pre] = args as [number, number[][]];
    if (expected === false) return Array.isArray(got) && got.length === 0;
    if (!Array.isArray(got) || keyOf([...got].sort((a, b) => (a as number) - (b as number))) !== keyOf([...Array(n).keys()])) return false;
    const at = new Map(got.map((c, i) => [c, i]));
    return pre.every(([a, b]) => at.get(b)! < at.get(a)!);
  }
  if (how === 'peak') {
    const nums = args[0] as number[];
    if (typeof got !== 'number' || !Number.isInteger(got) || got < 0 || got >= nums.length) return false;
    const left = got > 0 ? nums[got - 1] : -Infinity;
    const right = got + 1 < nums.length ? nums[got + 1] : -Infinity;
    return nums[got] > left && nums[got] > right;
  }
  if (how === 'gray') {
    const n = args[0] as number;
    if (!Array.isArray(got) || got.length !== 2 ** n || got[0] !== 0) return false;
    if (keyOf([...got].sort((a, b) => (a as number) - (b as number))) !== keyOf([...Array(2 ** n).keys()])) return false;
    const bits = (x: number) => x.toString(2).replace(/0/g, '').length;
    return got.every((a, i) => i === 0 || bits((a as number) ^ (got[i - 1] as number)) === 1);
  }
  if (how === 'inorder' || how === 'balanced') {
    if (got === null) return Array.isArray(expected) && expected.length === 0;
    const values = got && typeof got === 'object' && '$tree' in (got as Any) ? ((got as Any).$tree as Value[]) : null;
    if (!values || keyOf(treeInorder(values)) !== keyOf(expected) || !isBst(values)) return false;
    return how === 'inorder' || isBalanced(values);
  }
  return false;
}

// ---- describing tests -------------------------------------------------------------------------

function shownCall(t: PracticeTest): string {
  if (t.call === '$ops') {
    const ops = t.ops ?? [];
    return ops.map((op, i) => `${i === 0 ? 'new ' : ''}${op[0]}(${op.slice(1).map(textOf).join(', ')})`).join('; ');
  }
  if (t.setup?.intersect) {
    const s = t.setup.intersect;
    const a = [...s.a, ...s.common].map(textOf).join(' -> ');
    const b = [...s.b, ...s.common].map(textOf).join(' -> ');
    return `${t.call}(list ${a}, list ${b}) (they share ${s.common.length ? s.common.map(textOf).join(' -> ') : 'nothing'})`;
  }
  const text = `${t.call}(${(t.args ?? []).map(textOf).join(', ')})`;
  return t.then ? `${t.then}(${text})` : text;
}

function expectedText(t: PracticeTest): string {
  const how = t.compare ?? 'exact';
  if (how === 'output') return JSON.stringify(t.expected);
  if (how === 'topo') return t.expected !== false ? 'an order where each course comes after the ones it needs' : '[] (no order is possible)';
  if (how === 'peak') return 'the position of any peak';
  if (how === 'gray') return 'a Gray code: 0 first, each number differs from the next in one bit';
  const list = Array.isArray(t.expected) ? t.expected : [];
  if (how === 'inorder') return list.length ? `a valid BST holding ${textOf(list)}` : 'an empty tree (null)';
  if (how === 'balanced') return list.length ? `a height-balanced BST holding ${textOf(list)}` : 'an empty tree (null)';
  const anyOrder = how === 'unordered' || how === 'sets' ? ' (in any order)' : '';
  if (t.mutated) {
    const m = t.mutated;
    const arg = `argument ${m.arg + 1}`;
    if (m.check === 'negfirst') return `should rearrange ${arg} so every negative number comes first`;
    if (m.prefix) return `should give ${textOf(t.expected)} and leave ${textOf(m.value)}${anyOrder} at the start of ${arg}`;
    if (t.expected === null) return `should change ${arg} to ${textOf(m.value)}`;
    return `should give ${textOf(t.expected)} and change ${arg} to ${textOf(m.value)}`;
  }
  return textOf(t.expected) + anyOrder;
}

// ---- running ----------------------------------------------------------------------------------

const errorOf = (e: unknown): { errorType: string; message: string; line: number | null } => {
  if (e instanceof RangeError && /call stack/i.test(e.message)) return { errorType: 'RangeError', message: 'the function kept calling itself', line: null };
  const err = e instanceof Error ? e : null;
  return { errorType: err?.name ?? 'Error', message: err ? err.message : `${String(e)} was thrown`, line: userLine(e) };
};

/** The names a test needs from the answer. */
function namesOf(tests: PracticeTest[]): string[] {
  const names = new Set(['ListNode', 'TreeNode', 'Node']);
  for (const t of tests) {
    names.add(t.call === '$ops' ? t.cls! : t.call);
    if (t.then) names.add(t.then);
  }
  names.delete('$ops');
  return [...names].filter((n) => /^[A-Za-z_$][\w$]*$/.test(n));
}

export function checkJs(source: string, spec: { tests: PracticeTest[]; forbid?: JsForbid }, opts: JsCheckOptions): CheckResult {
  const parsed = parseProgram(source);
  if ('error' in parsed) return { status: 'syntax-error', error: parsed.error, results: [] };
  const blocked = findBlocked(parsed.ast);
  if (blocked) return { status: 'syntax-error', error: blocked, results: [] };
  const hit = forbiddenJs(source, spec.forbid);
  if (hit) return { status: 'forbidden', line: hit[0], word: hit[1], why: spec.forbid!.why, results: [] };

  measureShift();
  const perTest = (opts.perTestSeconds ?? 2) * 1000;
  const totalDeadline = performance.now() + opts.maxSeconds * 1000;
  let deadline = totalDeadline;
  let ticks = 0;
  const tick = () => {
    if ((++ticks & 255) === 0 && performance.now() > deadline) throw new TimeUp();
  };
  let out = '';
  const write = (...args: unknown[]) => {
    if (out.length < 100_000) out += formatLog(args) + '\n';
  };
  const console = { log: write, info: write, warn: write, error: write, debug: write };

  const names = namesOf(spec.tests);
  const body =
    '"use strict";\n' +
    withTicks(source, parsed.ast) +
    `\n;return {${names.map((n) => `${JSON.stringify(n)}: typeof ${n} === "undefined" ? undefined : ${n}`).join(', ')}};`;
  let fns: Fns;
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const program = new Function('__svTick', 'console', ...SHADOWED, body);
    opts.beforeRun?.();
    fns = program(tick, console);
  } catch (e) {
    if (e instanceof TimeUp) return { status: 'timeout', results: [] };
    const err = errorOf(e);
    return { status: 'error', ...err, results: [] };
  }

  const results: CheckTestResult[] = [];
  for (const t of spec.tests) {
    const entry: CheckTestResult = { call: shownCall(t), expected: expectedText(t), passed: false, got: '' };
    if (t.mutated) entry.phrased = true;
    results.push(entry);
    const isOps = t.call === '$ops';
    const target = fns[isOps ? t.cls! : t.call];
    if (typeof target !== 'function') {
      Object.assign(entry, { problem: 'missing', missing: isOps ? t.cls : t.call });
      continue;
    }
    if (performance.now() >= totalDeadline) {
      entry.problem = 'skipped';
      continue;
    }
    deadline = Math.min(performance.now() + perTest, totalDeadline);
    out = '';
    const ctx: Ctx = {
      listCls: typeof fns.ListNode === 'function' ? fns.ListNode : ListNode,
      treeCls: typeof fns.TreeNode === 'function' ? fns.TreeNode : TreeNode,
      nodeCls: typeof fns.Node === 'function' ? fns.Node : Node,
      inputs: [],
      listNodes: [],
    };
    const counter = { calls: 0 };
    let args: Any[];
    let got: Any;
    try {
      if (t.setup?.intersect) {
        const s = t.setup.intersect;
        const common = makeList(s.common, ctx);
        const withTail = (values: Value[]) => {
          const head = makeList(values, ctx);
          if (!head) return common;
          let n = head;
          while (n.next) n = n.next;
          n.next = common;
          return head;
        };
        ctx.listNodes = [];
        args = [withTail(s.a), withTail(s.b)];
      } else {
        args = build(structuredClone(t.args ?? []), ctx, counter);
      }
      if (isOps) {
        const ops = t.ops ?? [];
        const obj = new target(...build(structuredClone(ops[0].slice(1)), ctx, counter));
        got = [null];
        for (const op of ops.slice(1)) {
          const method = obj[op[0] as string];
          if (typeof method !== 'function') throw new TypeError(`${t.cls} has no method ${op[0]}`);
          got.push(method.apply(obj, build(structuredClone(op.slice(1)), ctx, counter)));
        }
      } else {
        got = target(...args);
        if (t.then) {
          const then = fns[t.then];
          if (typeof then !== 'function') {
            Object.assign(entry, { problem: 'missing', missing: t.then });
            continue;
          }
          got = then(got);
        }
      }
    } catch (e) {
      if (e instanceof TimeUp) entry.problem = 'timeout';
      else Object.assign(entry, { problem: 'error', ...errorOf(e) });
      continue;
    } finally {
      deadline = totalDeadline;
    }

    const how = t.compare ?? 'exact';
    let gotPlain: Value;
    if (t.returns === 'index') {
      const i = got ? ctx.listNodes.indexOf(got) : -1;
      gotPlain = got && i === -1 ? 'a node that is not in the list' : i;
    } else if (t.returns === 'value') gotPlain = got ? exportValue(got.val) : null;
    else gotPlain = exportValue(got);

    if (how === 'output') {
      entry.passed = out === t.expected;
      entry.got = JSON.stringify(out);
      continue;
    }
    let passed = ['topo', 'peak', 'gray', 'inorder', 'balanced'].includes(how)
      ? shapeOk(how, gotPlain, structuredClone(t.args ?? []), t.expected)
      : same(gotPlain, t.expected, how);
    let gotText = textOf(gotPlain);
    if (t.mutated) {
      const m = t.mutated;
      let after = exportValue(args[m.arg]);
      const arg = `argument ${m.arg + 1}`;
      if (m.prefix) {
        const k = typeof got === 'number' && Number.isInteger(got) ? got : -1;
        after = Array.isArray(after) && k >= 0 ? after.slice(0, k) : after;
      }
      let okAfter: boolean;
      if (m.check === 'negfirst') {
        const before = m.value as number[];
        const a = after as number[];
        okAfter = Array.isArray(a) && keyOf([...a].sort((x, y) => x - y)) === keyOf([...before].sort((x, y) => x - y)) && a.every((x, i) => i === 0 || !(a[i - 1] >= 0 && x < 0));
      } else okAfter = same(after, m.value, how === 'unordered' || how === 'sets' ? how : 'exact');
      const okReturn = t.expected !== null || m.prefix ? passed : true;
      if (m.prefix) gotText = `It gave ${gotText}, and ${arg} started with ${textOf(after)}.`;
      else if (t.expected === null) gotText = `Argument ${m.arg + 1} became ${textOf(after)}.`;
      else gotText = `It gave ${gotText}, and ${arg} became ${textOf(after)}.`;
      passed = okAfter && okReturn;
    }
    if (t.copy && passed) {
      const inputs = new Set(ctx.inputs);
      if (nodesOf(got).some((n) => inputs.has(n))) {
        Object.assign(entry, { passed: false, got: gotText, problem: 'shared' });
        continue;
      }
    }
    entry.passed = passed;
    entry.got = gotText;
  }
  return { status: 'ok', results };
}
