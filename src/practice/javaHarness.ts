// Practice tests for Java answers: the Java twin of src/practice/harness.py, run in the locked-down
// Java worker. The answer is read by StepViz's own Java interpreter (never compiled or run as code).
//
// Each test is one quiet run of the answer (no steps recorded, its own time limit): the answer's
// main() is renamed so it does not run, and a generated main() is added at the end of class Main
// (so the answer's line numbers stay the same). It builds the arguments as Java code from the types
// in the answer's own method header (int[], List<Integer>, ListNode, char[][]...), calls the method,
// and keeps the answer in a static variable, which is read back and compared like the other
// languages (src/practice/jsHarness.ts). Test specs are the Python ones with camelCase names.
import type { Node, Parser, Tree } from 'web-tree-sitter';
import type { PracticeTest, Value } from './content/types';
import type { CheckResult, CheckTestResult } from '../runner/protocol';
import { checkJava, runJavaQuiet, type JObject, type JVal, type MapData } from '../runner/java/interpreter';
import { expectedText, exportValue, keyOf, nodesOf, same, shapeOk, shownCall, textOf, type JsForbid } from './jsHarness';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

// ---- the rule ("without X"): Java tokens, text in quotes and comments do not count -------------

const OPS = ['>>>=', '<<=', '>>=', '>>>', '...', '->', '::', '++', '--', '&&', '||', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>'];

function javaTokens(source: string): { line: number; text: string; kind: 'name' | 'op' | 'text' | 'number' }[] {
  const out: { line: number; text: string; kind: 'name' | 'op' | 'text' | 'number' }[] = [];
  let i = 0;
  let line = 1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '\n') {
      line++;
      i++;
    } else if (/\s/.test(ch)) i++;
    else if (source.startsWith('//', i)) while (i < source.length && source[i] !== '\n') i++;
    else if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2);
      const stop = end < 0 ? source.length : end + 2;
      for (let k = i; k < stop; k++) if (source[k] === '\n') line++;
      i = stop;
    } else if (ch === '"' || ch === "'") {
      const start = line;
      let k = i + 1;
      while (k < source.length && source[k] !== ch && source[k] !== '\n') k += source[k] === '\\' ? 2 : 1;
      out.push({ line: start, text: '"…"', kind: 'text' });
      i = k + 1;
    } else if (/[A-Za-z_$]/.test(ch)) {
      let k = i;
      while (k < source.length && /[\w$]/.test(source[k])) k++;
      out.push({ line, text: source.slice(i, k), kind: 'name' });
      i = k;
    } else if (/\d/.test(ch)) {
      let k = i;
      while (k < source.length && /[\w.]/.test(source[k])) k++;
      out.push({ line, text: source.slice(i, k), kind: 'number' });
      i = k;
    } else {
      const op = OPS.find((o) => source.startsWith(o, i)) ?? ch;
      out.push({ line, text: op, kind: 'op' });
      i += op.length;
    }
  }
  return out;
}

export function forbiddenJava(source: string, forbid: JsForbid | undefined): [number, string] | null {
  if (!forbid) return null;
  const names = new Set(forbid.names ?? []);
  const ops = new Set(forbid.ops ?? []);
  const tokens = javaTokens(source);
  for (const t of tokens) {
    if (t.kind === 'name' && names.has(t.text)) return [t.line, t.text];
    if (t.kind === 'op' && ops.has(t.text)) return [t.line, t.text];
  }
  for (const p of forbid.patterns ?? []) {
    const rx = new RegExp(p.regex);
    const byLine = new Map<number, string>();
    for (const t of tokens) byLine.set(t.line, (byLine.get(t.line) ?? '') + t.text);
    for (const line of [...byLine.keys()].sort((a, b) => a - b)) if (rx.test(byLine.get(line)!)) return [line, p.shown];
  }
  return null;
}

// ---- reading the answer's code ----------------------------------------------------------------

const kids = (n: Node | null | undefined): Node[] => (n ? (n.namedChildren.filter(Boolean) as Node[]) : []);

interface Method {
  ret: string;
  params: { type: string; name: string }[];
}
interface Shape {
  /** line (0-based) and text position of main's name inside class Main, to rename it */
  mainName: { row: number } | null;
  /** last line (0-based) of class Main: its closing brace */
  mainEnd: number;
  /** methods by class ('Main' for the static ones) and name */
  methods: Map<string, Map<string, Method>>;
  constructors: Map<string, Method[]>;
}

function readShape(tree: Tree): Shape | null {
  const methods = new Map<string, Map<string, Method>>();
  const constructors = new Map<string, Method[]>();
  let mainName: Shape['mainName'] = null;
  let mainEnd = -1;
  const visitClass = (cls: Node) => {
    const name = cls.childForFieldName('name')?.text ?? '';
    const body = cls.childForFieldName('body');
    const own = new Map<string, Method>();
    methods.set(name, own);
    const cons: Method[] = [];
    constructors.set(name, cons);
    for (const m of kids(body)) {
      if (m.type === 'class_declaration' || m.type === 'interface_declaration') visitClass(m);
      if (m.type !== 'method_declaration' && m.type !== 'constructor_declaration') continue;
      const params = kids(m.childForFieldName('parameters'))
        .filter((p) => p.type === 'formal_parameter')
        .map((p) => ({ type: p.childForFieldName('type')?.text ?? '', name: p.childForFieldName('name')?.text ?? '' }));
      if (m.type === 'constructor_declaration') {
        cons.push({ ret: name, params });
        continue;
      }
      const mname = m.childForFieldName('name')!;
      if (name === 'Main' && mname.text === 'main') mainName = { row: mname.startPosition.row };
      if (!own.has(mname.text)) own.set(mname.text, { ret: m.childForFieldName('type')?.text ?? 'void', params });
    }
    if (name === 'Main' && body) mainEnd = body.endPosition.row;
  };
  for (const c of kids(tree.rootNode)) if (c.type === 'class_declaration' || c.type === 'interface_declaration') visitClass(c);
  return mainEnd < 0 ? null : { mainName, mainEnd, methods, constructors };
}

// ---- writing the arguments as Java -------------------------------------------------------------

const strip = (t: string) => t.replace(/\s+/g, '').replace(/^final/, '');
const unbox: Record<string, string> = { Integer: 'int', Long: 'long', Double: 'double', Boolean: 'boolean', Character: 'char' };

class Writer {
  lines: string[] = [];
  private n = 0;
  fresh(prefix = 'a') {
    return `stepviz${prefix}${this.n++}`;
  }

  /** A Java expression of `type` holding `value` (statements it needs go into lines). */
  expr(type: string, value: Value): string {
    type = strip(type);
    if (value === null) return 'null';
    if (typeof value === 'object' && !Array.isArray(value)) return this.marker(type, value as Record<string, Any>);
    const prim = unbox[type] ?? type;
    switch (prim) {
      case 'int':
      case 'short':
      case 'byte':
        return String(value);
      case 'long':
        return `${value}L`;
      case 'double':
      case 'float':
        return Number.isInteger(value) ? `${value}.0` : String(value);
      case 'boolean':
        return String(value);
      case 'char':
        return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
      case 'String':
      case 'CharSequence':
        return JSON.stringify(value);
    }
    if (type.endsWith('[]')) return `new ${type}${this.init(type.slice(0, -2), value as Value[])}`;
    const generic = /^(List|ArrayList|Collection|Iterable|LinkedList|Queue|Deque)<(.+)>$/.exec(type);
    if (generic) {
      const v = this.fresh();
      const item = generic[2];
      this.lines.push(`${type.startsWith('LinkedList') || type.startsWith('Queue') || type.startsWith('Deque') ? type : `List<${item}>`} ${v} = new ${type.startsWith('LinkedList') || type.startsWith('Queue') || type.startsWith('Deque') ? 'LinkedList' : 'ArrayList'}<>();`);
      for (const x of value as Value[]) this.lines.push(`${v}.add(${this.expr(item, x)});`);
      return v;
    }
    throw new Error(`Practice tests can't write a ${type} value yet.`);
  }

  /** {1, 2} for an array initializer (inner arrays as {...} too). */
  private init(elem: string, values: Value[]): string {
    return `{${values.map((x) => (elem.endsWith('[]') && Array.isArray(x) ? this.init(elem.slice(0, -2), x) : this.expr(elem, x))).join(', ')}}`;
  }

  private marker(type: string, m: Record<string, Any>): string {
    const item = (cls: string, v: Value) => `new ${cls}(${this.expr(this.valType(cls), v)})`;
    if ('$list' in m || '$cycle' in m) {
      const values: Value[] = m.$list ?? m.$cycle;
      if (!values.length) return 'null';
      const names = values.map((v) => {
        const name = this.fresh('n');
        this.lines.push(`${type} ${name} = ${item(type, v)};`);
        return name;
      });
      for (let i = 0; i + 1 < names.length; i++) this.lines.push(`${names[i]}.next = ${names[i + 1]};`);
      if ((m.pos ?? -1) >= 0) this.lines.push(`${names[names.length - 1]}.next = ${names[m.pos]};`);
      this.nodes.push(...names);
      return names[0];
    }
    if ('$tree' in m) {
      const values: Value[] = m.$tree;
      if (!values.length || values[0] === null) return 'null';
      const root = this.fresh('t');
      this.lines.push(`${type} ${root} = ${item(type, values[0])};`);
      this.nodes.push(root);
      const queue = [root];
      let i = 1;
      while (queue.length && i < values.length) {
        const cur = queue.shift()!;
        for (const side of ['left', 'right']) {
          if (i < values.length && values[i] !== null) {
            const name = this.fresh('t');
            this.lines.push(`${type} ${name} = ${item(type, values[i])};`, `${cur}.${side} = ${name};`);
            this.nodes.push(name);
            queue.push(name);
          }
          i++;
        }
      }
      return root;
    }
    if ('$randlist' in m) {
      const pairs: [Value, number | null][] = m.$randlist;
      if (!pairs.length) return 'null';
      const names = pairs.map(([v]) => {
        const name = this.fresh('r');
        this.lines.push(`${type} ${name} = ${item(type, v)};`);
        return name;
      });
      names.forEach((name, i) => {
        if (i + 1 < names.length) this.lines.push(`${name}.next = ${names[i + 1]};`);
        if (pairs[i][1] !== null) this.lines.push(`${name}.random = ${names[pairs[i][1]!]};`);
      });
      this.nodes.push(...names);
      return names[0];
    }
    if ('$graph' in m) {
      const adj: number[][] = m.$graph;
      if (!adj.length) return 'null';
      const names = adj.map((_, i) => {
        const name = this.fresh('g');
        this.lines.push(`${type} ${name} = new ${type}(${i + 1});`);
        return name;
      });
      adj.forEach((nbrs, i) => nbrs.forEach((k) => this.lines.push(`${names[i]}.neighbors.add(${names[k - 1]});`)));
      this.nodes.push(...names);
      return names[0];
    }
    if ('$guess' in m) return `new ${type}(${m.$guess})`;
    if ('$bad' in m) return `new ${type}(${m.$bad})`;
    if ('$reader' in m) return `new ${type}(${this.expr('int[]', m.$reader)})`;
    throw new Error(`Practice tests can't write this ${type} value yet.`);
  }

  /** The variables holding input nodes (for "copy" and "returns index"). */
  nodes: string[] = [];
  /** Node value types: TreeNode / ListNode hold int, the others too. */
  private valType(_cls: string) {
    return 'int';
  }
}

// ---- reading the answer back ------------------------------------------------------------------

/** A Java value as plain JavaScript (objects keep their identity, so shared nodes stay shared). */
function mirror(v: JVal | undefined, memo: Map<unknown, Any>): Any {
  if (!v || v.v === null || v.t === 'null' || v.t === 'void') return null;
  switch (v.t) {
    case 'int':
    case 'double':
      return v.v as number;
    case 'long':
      return typeof v.v === 'bigint' ? Number(v.v) : (v.v as number);
    case 'boolean':
    case 'char':
    case 'String':
      return v.v;
    case 'builder':
      return (v.v as { text: string }).text;
    case 'array':
    case 'list':
    case 'set': {
      if (memo.has(v.v)) return memo.get(v.v);
      const out: Any[] = [];
      memo.set(v.v, out);
      const items = v.t === 'set' ? [...((v.v as MapData).entries?.values() ?? [])].map((e) => e[0]) : (v.v as JVal[]);
      for (const x of items) out.push(mirror(x, memo));
      return out;
    }
    case 'map': {
      const out = new Map();
      for (const [k, x] of (v.v as MapData).entries.values()) out.set(mirror(k, memo), mirror(x, memo));
      return out;
    }
    case 'object': {
      const o = v.v as JObject;
      if (memo.has(o)) return memo.get(o);
      const out: Record<string, Any> = {};
      memo.set(o, out);
      for (const [k, cell] of o.fields) out[k] = typeof cell.v === 'symbol' ? null : mirror(cell.v, memo);
      return out;
    }
    default:
      return String(v.v);
  }
}

// ---- running ----------------------------------------------------------------------------------

export interface JavaCheckOptions {
  maxSeconds: number;
  perTestSeconds?: number;
  beforeRun?: () => void;
}

export function checkJavaAnswer(parser: Parser, source: string, spec: { tests: PracticeTest[]; forbid?: JsForbid }, opts: JavaCheckOptions): CheckResult {
  const tree = parser.parse(source);
  if (!tree) return { status: 'syntax-error', error: { line: 1, message: 'Java could not read this code.' }, results: [] };
  const problem = checkJava(tree);
  if (problem) return { status: 'syntax-error', error: { line: problem.line, message: problem.message }, results: [] };
  const hit = forbiddenJava(source, spec.forbid);
  if (hit) return { status: 'forbidden', line: hit[0], word: hit[1], why: spec.forbid!.why, results: [] };
  const shape = readShape(tree);
  if (!shape) return { status: 'syntax-error', error: { line: 1, message: 'StepViz needs a public class Main with your methods in it.' }, results: [] };

  const lines = source.split('\n');
  if (shape.mainName) lines[shape.mainName.row] = lines[shape.mainName.row].replace(/\bmain(\s*\()/, 'studentMain$1');
  const studentLines = lines.length;
  const deadline = performance.now() + opts.maxSeconds * 1000;
  opts.beforeRun?.();

  const results: CheckTestResult[] = [];
  for (const t of spec.tests) {
    const entry: CheckTestResult = { call: shownCall(t), expected: expectedText(t), passed: false, got: '' };
    if (t.mutated) entry.phrased = true;
    results.push(entry);
    const left = deadline - performance.now();
    if (left <= 0) {
      entry.problem = 'skipped';
      continue;
    }
    const isOps = t.call === '$ops';
    const owner = isOps ? t.cls! : 'Main';
    const found = isOps ? shape.methods.get(owner) : shape.methods.get('Main')?.get(t.call);
    if (!found || (t.then && !shape.methods.get('Main')?.has(t.then))) {
      Object.assign(entry, { problem: 'missing', missing: !found ? (isOps ? t.cls : t.call) : t.then });
      continue;
    }

    // The generated main(): build the arguments, call, keep the answer in statics.
    const w = new Writer();
    const statics: string[] = [];
    const keep = (type: string, name: string, expr: string) => {
      statics.push(`  static ${type} ${name};`);
      w.lines.push(`${name} = ${expr};`);
    };
    let argNames: string[] = [];
    try {
      if (isOps) {
        const ops = t.ops ?? [];
        const cons = shape.constructors.get(owner) ?? [];
        const consArgs = ops[0].slice(1);
        const c = cons.find((m) => m.params.length === consArgs.length) ?? { ret: owner, params: [] };
        w.lines.push(`${owner} stepvizObj = new ${owner}(${consArgs.map((a, i) => w.expr(c.params[i]?.type ?? 'int', a)).join(', ')});`);
        ops.slice(1).forEach((op, k) => {
          const m = (found as Map<string, Method>).get(op[0] as string);
          if (!m) throw new Error(`missing:${owner}.${op[0]}`);
          const call = `stepvizObj.${op[0]}(${op.slice(1).map((a, i) => w.expr(m.params[i]?.type ?? 'int', a)).join(', ')})`;
          if (strip(m.ret) === 'void') w.lines.push(`${call};`);
          else keep(m.ret, `stepvizOp${k}`, call);
        });
      } else {
        const m = found as Method;
        if (t.setup?.intersect) {
          const s = t.setup.intersect;
          const type = m.params[0]?.type ?? 'ListNode';
          const common = w.expr(type, { $list: s.common });
          const withTail = (values: Value[]) => {
            if (!values.length) return common;
            const head = w.expr(type, { $list: values });
            const last = w.nodes[w.nodes.length - 1];
            w.lines.push(`${last}.next = ${common};`);
            return head;
          };
          w.nodes = [];
          argNames = [withTail(s.a), withTail(s.b)];
        } else {
          argNames = (t.args ?? []).map((a, i) => {
            const type = m.params[i]?.type ?? 'int';
            const name = w.fresh('arg');
            w.lines.push(`${type} ${name} = ${w.expr(type, a)};`);
            return name;
          });
        }
        if (w.nodes.length) keep(m.params[0]?.type ?? 'ListNode', 'stepvizInput', w.nodes[0]);
        const call = `${t.call}(${argNames.join(', ')})`;
        if (t.then) {
          const then = shape.methods.get('Main')!.get(t.then)!;
          keep(then.ret, 'stepvizResult', `${t.then}(${call})`);
        } else if (strip(m.ret) === 'void') w.lines.push(`${call};`);
        else keep(m.ret, 'stepvizResult', call);
        if (t.mutated) keep(m.params[t.mutated.arg]?.type ?? 'int[]', 'stepvizArg', argNames[t.mutated.arg]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.startsWith('missing:')) Object.assign(entry, { problem: 'missing', missing: message.slice(8) });
      else Object.assign(entry, { problem: 'error', errorType: 'a test that could not be set up', message });
      continue;
    }
    const driver = [...lines];
    const close = driver[shape.mainEnd].lastIndexOf('}');
    const inject = `\n${statics.join('\n')}\n  public static void main(String[] args) {\n    ${w.lines.join('\n    ')}\n  }\n`;
    driver[shape.mainEnd] = driver[shape.mainEnd].slice(0, close) + inject + driver[shape.mainEnd].slice(close);
    const testTree = parser.parse(driver.join('\n'));
    if (!testTree) {
      Object.assign(entry, { problem: 'error', errorType: 'a test that could not be set up', message: 'Java could not read the test.' });
      continue;
    }
    const run = runJavaQuiet(testTree, { maxSeconds: Math.min(opts.perTestSeconds ?? 2, left / 1000) });
    testTree.delete();
    const inStudent = (line: number | null | undefined) => (line && line <= studentLines ? line : null);
    if (run.status === 'timeout') {
      entry.problem = 'timeout';
      continue;
    }
    if (run.status === 'too-deep') {
      Object.assign(entry, { problem: 'error', errorType: 'StackOverflowError', message: 'the method kept calling itself' });
      continue;
    }
    if (run.status === 'compile-error') {
      const line = inStudent(run.error?.line);
      Object.assign(entry, line ? { problem: 'error', errorType: 'a compile error', message: run.error!.message, line } : { problem: 'error', errorType: 'a test that does not fit your method', message: run.error!.message });
      continue;
    }
    if (run.status === 'runtime-error') {
      Object.assign(entry, { problem: 'error', errorType: run.error!.type, message: run.error!.message, line: inStudent(run.error!.line) });
      continue;
    }

    const memo = new Map<unknown, Any>();
    const how = t.compare ?? 'exact';
    let got: Any;
    if (isOps) {
      const m = found as Map<string, Method>;
      got = [null, ...(t.ops ?? []).slice(1).map((op, k) => (strip(m.get(op[0] as string)!.ret) === 'void' ? null : mirror(run.value(`stepvizOp${k}`), memo)))];
    } else got = mirror(run.value('stepvizResult'), memo);
    const input = mirror(run.value('stepvizInput'), memo);

    if (how === 'output') {
      entry.passed = run.output === t.expected;
      entry.got = JSON.stringify(run.output);
      continue;
    }
    let gotPlain: Value;
    if (t.returns === 'index') {
      const order: Any[] = [];
      for (let n = input; n && !order.includes(n); n = n.next) order.push(n);
      const i = got ? order.indexOf(got) : -1;
      gotPlain = got && i === -1 ? 'a node that is not in the list' : i;
    } else if (t.returns === 'value') gotPlain = got ? exportValue(got.val) : null;
    else gotPlain = exportValue(got);

    let passed = ['topo', 'peak', 'gray', 'inorder', 'balanced'].includes(how) ? shapeOk(how, gotPlain, structuredClone(t.args ?? []), t.expected) : same(gotPlain, t.expected, how);
    let gotText = textOf(gotPlain);
    if (t.mutated) {
      const m = t.mutated;
      let after = exportValue(mirror(run.value('stepvizArg'), memo));
      const arg = `argument ${m.arg + 1}`;
      if (m.prefix) {
        const k = typeof gotPlain === 'number' ? gotPlain : -1;
        after = Array.isArray(after) && k >= 0 ? after.slice(0, k) : after;
      }
      let okAfter: boolean;
      if (m.check === 'negfirst') {
        const a = after as number[];
        okAfter = Array.isArray(a) && keyOf([...a].sort((x, y) => x - y)) === keyOf([...(m.value as number[])].sort((x, y) => x - y)) && a.every((x, i) => i === 0 || !(a[i - 1] >= 0 && x < 0));
      } else okAfter = same(after, m.value, how === 'unordered' || how === 'sets' ? how : 'exact');
      const okReturn = t.expected !== null || m.prefix ? passed : true;
      if (m.prefix) gotText = `It gave ${gotText}, and ${arg} started with ${textOf(after)}.`;
      else if (t.expected === null) gotText = `Argument ${m.arg + 1} became ${textOf(after)}.`;
      else gotText = `It gave ${gotText}, and ${arg} became ${textOf(after)}.`;
      passed = okAfter && okReturn;
    }
    if (t.copy && passed) {
      const inputs = new Set(nodesOf(input));
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
