// Practice tests for C++ answers: the C++ twin of src/practice/javaHarness.ts, run in the locked-down
// C++ worker. The answer is read by StepViz's own C++ interpreter (never compiled or run as code).
//
// Each test is one quiet run of the answer (no steps recorded, its own time limit): the answer's
// main() is renamed so it does not run, and a new main() is added at the end of the file (so the
// answer's line numbers stay the same). It writes the arguments as C++ from the types in the
// answer's own function header (vector<int>&, string, vector<vector<char>>...), calls the function,
// and keeps the answer in global variables, which are read back and compared like the other
// languages (src/practice/jsHarness.ts). Test specs are the Python ones with camelCase names.
import type { Node, Parser, Tree } from 'web-tree-sitter';
import type { PracticeTest, Value } from './content/types';
import type { CheckResult, CheckTestResult } from '../runner/protocol';
import { checkCpp, runCppQuiet, type CVal } from '../runner/cpp/interpreter';
import { expectedText, exportValue, keyOf, nodesOf, same, shapeOk, shownCall, textOf, type JsForbid } from './jsHarness';
import { forbiddenJava } from './javaHarness';
import { errorSentence } from '../trace/explain';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const kids = (n: Node | null | undefined): Node[] => (n ? (n.namedChildren.filter(Boolean) as Node[]) : []);

interface Fn {
  ret: string;
  params: { type: string; name: string }[];
}
interface Shape {
  mainRow: number | null;
  functions: Map<string, Fn>;
  methods: Map<string, Map<string, Fn>>;
  constructors: Map<string, Fn[]>;
}

/** The name and parameters of a function_declarator (int f(vector<int>& a, int k)). */
function readDeclarator(fd: Node): { name: string; params: Fn['params'] } {
  const params = kids(fd.childForFieldName('parameters'))
    .filter((p) => p.type === 'parameter_declaration' || p.type === 'optional_parameter_declaration')
    .map((p) => {
      let d = p.childForFieldName('declarator');
      let extra = '';
      while (d && (d.type === 'reference_declarator' || d.type === 'pointer_declarator' || d.type === 'array_declarator')) {
        if (d.type === 'pointer_declarator') extra += '*';
        if (d.type === 'array_declarator') extra += '[]';
        d = d.type === 'reference_declarator' ? kids(d)[0] : d.childForFieldName('declarator');
      }
      return { type: (p.childForFieldName('type')?.text ?? 'int') + extra, name: d?.text ?? '' };
    });
  return { name: fd.childForFieldName('declarator')?.text ?? '', params };
}

function readShape(tree: Tree): Shape {
  const functions = new Map<string, Fn>();
  const methods = new Map<string, Map<string, Fn>>();
  const constructors = new Map<string, Fn[]>();
  let mainRow: number | null = null;
  const fnOf = (def: Node): { name: string; fn: Fn; row: number } | null => {
    let d = def.childForFieldName('declarator');
    let ptr = '';
    while (d && (d.type === 'pointer_declarator' || d.type === 'reference_declarator')) {
      if (d.type === 'pointer_declarator') ptr += '*';
      d = d.type === 'reference_declarator' ? kids(d)[0] : d.childForFieldName('declarator');
    }
    if (!d || d.type !== 'function_declarator') return null;
    const { name, params } = readDeclarator(d);
    return { name, fn: { ret: (def.childForFieldName('type')?.text ?? '') + ptr, params }, row: d.startPosition.row };
  };
  const visitClass = (spec: Node) => {
    const name = spec.childForFieldName('name')?.text ?? '';
    const own = new Map<string, Fn>();
    const cons: Fn[] = [];
    methods.set(name, own);
    constructors.set(name, cons);
    for (const m of kids(spec.childForFieldName('body'))) {
      if (m.type !== 'function_definition' && m.type !== 'declaration') continue;
      const f = fnOf(m);
      if (!f) continue;
      if (f.name === name && !m.childForFieldName('type')) cons.push(f.fn);
      else if (!own.has(f.name)) own.set(f.name, f.fn);
    }
  };
  const visit = (n: Node) => {
    for (const c of kids(n)) {
      if (c.type === 'function_definition') {
        const f = fnOf(c);
        if (!f) continue;
        if (f.name === 'main') mainRow = f.row;
        else if (!functions.has(f.name)) functions.set(f.name, f.fn);
      } else if (c.type === 'class_specifier' || c.type === 'struct_specifier') visitClass(c);
      else if (c.type === 'declaration' || c.type === 'type_definition') {
        for (const k of kids(c)) if (k.type === 'class_specifier' || k.type === 'struct_specifier') visitClass(k);
      } else if (c.type === 'namespace_definition' || c.type === 'linkage_specification') visit(c);
    }
  };
  visit(tree.rootNode);
  return { mainRow, functions, methods, constructors };
}

// ---- writing the arguments as C++ -------------------------------------------------------------

/** The value type written in a parameter: const vector<int>& -> vector<int>. */
const bare = (t: string) => t.replace(/\bconst\b/g, '').replace(/&/g, '').replace(/\s+/g, ' ').trim().replace(/\s*([<>,])\s*/g, '$1');

/**
 * Nodes written for one test: the lines that build them (before the declaration that uses them),
 * the variables holding them (for the "copy" and "returns index" checks), and their type.
 */
let nodeCtx: { lines: string[]; nodes: string[]; nodeType: string; n: number } = { lines: [], nodes: [], nodeType: '', n: 0 };
const isNodeMarker = (m: Record<string, Any>) => ['$list', '$cycle', '$tree', '$randlist', '$graph'].some((k) => k in m);

/** ListNode* (or struct Node* in C): build the nodes with new, linked by ->, and give the first one. */
function nodes(type: string, m: Record<string, Any>): string {
  const ctx = nodeCtx;
  const cls = type.replace(/\*$/, '').replace(/^struct\s+/, '').trim();
  if (!ctx.nodeType) ctx.nodeType = type;
  const make = (prefix: string, v: Value) => {
    const name = `stepviz${prefix}${ctx.n++}`;
    ctx.lines.push(`${type} ${name} = new ${cls}(${literal('int', v)});`);
    ctx.nodes.push(name);
    return name;
  };
  if ('$list' in m || '$cycle' in m) {
    const values: Value[] = m.$list ?? m.$cycle;
    if (!values.length) return 'nullptr';
    const names = values.map((v) => make('N', v));
    for (let i = 0; i + 1 < names.length; i++) ctx.lines.push(`${names[i]}->next = ${names[i + 1]};`);
    if ((m.pos ?? -1) >= 0) ctx.lines.push(`${names[names.length - 1]}->next = ${names[m.pos]};`);
    return names[0];
  }
  if ('$tree' in m) {
    const values: Value[] = m.$tree;
    if (!values.length || values[0] === null) return 'nullptr';
    const root = make('T', values[0]);
    const queue = [root];
    let i = 1;
    while (queue.length && i < values.length) {
      const cur = queue.shift()!;
      for (const side of ['left', 'right']) {
        if (i < values.length && values[i] !== null) {
          const name = make('T', values[i]);
          ctx.lines.push(`${cur}->${side} = ${name};`);
          queue.push(name);
        }
        i++;
      }
    }
    return root;
  }
  if ('$randlist' in m) {
    const pairs: [Value, number | null][] = m.$randlist;
    if (!pairs.length) return 'nullptr';
    const names = pairs.map(([v]) => make('R', v));
    names.forEach((name, i) => {
      if (i + 1 < names.length) ctx.lines.push(`${name}->next = ${names[i + 1]};`);
      if (pairs[i][1] !== null) ctx.lines.push(`${name}->random = ${names[pairs[i][1]!]};`);
    });
    return names[0];
  }
  const adj: number[][] = m.$graph;
  if (!adj.length) return 'nullptr';
  const names = adj.map((_, i) => make('G', i + 1));
  adj.forEach((nbrs, i) => nbrs.forEach((k) => ctx.lines.push(`${names[i]}->neighbors.push_back(${names[k - 1]});`)));
  return names[0];
}

function literal(type: string, value: Value): string {
  type = bare(type);
  if (value && typeof value === 'object' && !Array.isArray(value) && type.endsWith('*') && isNodeMarker(value as Record<string, Any>)) return nodes(type, value as Record<string, Any>);
  if (value === null) return type.endsWith('*') ? 'nullptr' : '{}';
  const vec = /^(?:std::)?vector<(.+)>$/.exec(type);
  if (vec) return `{${(value as Value[]).map((x) => literal(vec[1], x)).join(', ')}}`;
  // C text in a char array: char s[] = "hello";
  if (type === 'char[]' && typeof value === 'string') return JSON.stringify(value);
  if (type.endsWith('[]')) return `{${(value as Value[]).map((x) => literal(type.slice(0, -2), x)).join(', ')}}`;
  switch (type) {
    case 'int':
    case 'long':
    case 'long long':
    case 'short':
    case 'unsigned':
    case 'size_t':
      return String(value);
    case 'double':
    case 'float':
      return Number.isInteger(value) ? `${value}.0` : String(value);
    case 'bool':
      return String(value);
    case 'char':
      return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    case 'string':
    case 'std::string':
      return JSON.stringify(value);
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const m = value as Record<string, Any>;
    if ('$guess' in m || '$bad' in m) return `${type}(${m.$guess ?? m.$bad})`;
    if ('$reader' in m) return `${type}(${literal('vector<int>', m.$reader)})`;
  }
  throw new Error(`Practice tests can't write a ${type} value yet.`);
}

/** A variable declaration holding the value (arrays keep their size from the list). */
function declare(type: string, name: string, value: Value): string {
  const t = bare(type);
  // An empty list: C has no zero-length array, so it gets one unused place (the length passed is 0).
  if (t.endsWith('[]') && Array.isArray(value) && !value.length) return `${t.slice(0, -2)} ${name}[1];`;
  if (t.endsWith('[]')) return `${t.slice(0, -2)} ${name}[] = ${literal(t, value)};`;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    // A Reader is made from a vector variable: StepViz's C++ can't pass {...} straight to a constructor.
    if ('$reader' in value) return `vector<int> ${name}Data = ${literal('vector<int>', (value as Record<string, Value>).$reader)};\n    ${t} ${name}(${name}Data);`;
    return `${t} ${name} = ${literal(t, value)};`;
  }
  return `${t} ${name} = ${literal(t, value)};`;
}

// ---- reading the answer back ------------------------------------------------------------------

function mirror(v: CVal | undefined, memo: Map<unknown, Any>): Any {
  if (!v || v.v === null || v.v === undefined || typeof v.v === 'symbol' || v.t === 'void') return null;
  switch (v.t) {
    case 'pointer':
      // A node: follow the pointer (the same node gives the same object, so shared nodes stay shared).
      return mirror((v.v as unknown as { cell: { v: CVal } }).cell.v, memo);
    case 'int':
    case 'long':
    case 'double':
    case 'float':
      return typeof v.v === 'bigint' ? Number(v.v) : v.v;
    case 'bool':
    case 'char':
    case 'string':
      return v.v;
    case 'vector':
    case 'array': {
      if (memo.has(v.v)) return memo.get(v.v);
      const out: Any[] = [];
      memo.set(v.v, out);
      for (const x of v.v as CVal[]) out.push(mirror(x, memo));
      return out;
    }
    case 'set':
      return [...(v.v as Map<string, [CVal, CVal]>).values()].map(([k]) => mirror(k, memo));
    case 'map': {
      const out = new Map();
      for (const [k, x] of (v.v as Map<string, [CVal, CVal]>).values()) out.set(mirror(k, memo), mirror(x, memo));
      return out;
    }
    case 'struct': {
      if (memo.has(v.v)) return memo.get(v.v);
      const out: Record<string, Any> = {};
      memo.set(v.v, out);
      for (const [k, x] of v.v as Map<string, CVal>) out[k] = mirror(x, memo);
      return out;
    }
    default:
      return String(v.v);
  }
}

// ---- running ----------------------------------------------------------------------------------

export interface CppCheckOptions {
  maxSeconds: number;
  perTestSeconds?: number;
  dialect?: 'cpp' | 'c';
  beforeRun?: () => void;
}

export function checkCppAnswer(parser: Parser, source: string, spec: { tests: PracticeTest[]; forbid?: JsForbid }, opts: CppCheckOptions): CheckResult {
  const dialect = opts.dialect ?? 'cpp';
  const lang = dialect === 'c' ? 'C' : 'C++';
  const tree = parser.parse(source);
  if (!tree) return { status: 'syntax-error', error: { line: 1, message: `${lang} could not read this code.` }, results: [] };
  const problem = checkCpp(tree, dialect);
  if (problem) return { status: 'syntax-error', error: { line: problem.line, message: problem.message }, results: [] };
  const hit = forbiddenJava(source, spec.forbid);
  if (hit) return { status: 'forbidden', line: hit[0], word: hit[1], why: spec.forbid!.why, results: [] };
  const shape = readShape(tree);
  tree.delete();

  const lines = source.split('\n');
  if (shape.mainRow !== null) lines[shape.mainRow] = lines[shape.mainRow].replace(/\bmain(\s*\()/, 'studentMain$1');
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
    const fn = isOps ? undefined : shape.functions.get(t.call);
    const cls = isOps ? shape.methods.get(t.cls!) : undefined;
    if ((isOps && !cls) || (!isOps && !fn) || (t.then && !shape.functions.has(t.then))) {
      Object.assign(entry, { problem: 'missing', missing: isOps ? t.cls : !fn ? t.call : t.then });
      continue;
    }

    const globals: string[] = [];
    const body: string[] = [];
    let emptyArg = false;
    nodeCtx = { lines: [], nodes: [], nodeType: '', n: 0 };
    /** A declaration, after the lines that build the nodes it uses. */
    const declareHere = (type: string, name: string, value: Value) => {
      const d = declare(type, name, value);
      body.push(...nodeCtx.lines.splice(0), d);
    };
    const keep = (type: string, name: string, expr: string) => {
      globals.push(`${bare(type)} ${name};`);
      body.push(`${name} = ${expr};`);
    };
    try {
      if (isOps) {
        const ops = t.ops ?? [];
        const consArgs = ops[0].slice(1);
        const cons = (shape.constructors.get(t.cls!) ?? []).find((c) => c.params.length === consArgs.length) ?? { ret: t.cls!, params: [] };
        // Written as values: StepViz's C++ reads T x(n) with a variable n as a declaration it can't run.
        const made = consArgs.map((a, i) => literal(cons.params[i]?.type ?? 'int', a));
        body.push(made.length ? `${t.cls} stepvizObj(${made.join(', ')});` : `${t.cls} stepvizObj;`);
        ops.slice(1).forEach((op, k) => {
          const m = cls!.get(op[0] as string);
          if (!m) throw new Error(`missing:${t.cls}::${op[0]}`);
          const args = op.slice(1).map((a, i) => {
            declareHere(m.params[i]?.type ?? 'int', `stepvizA${k}_${i}`, a);
            return `stepvizA${k}_${i}`;
          });
          const call = `stepvizObj.${op[0]}(${args.join(', ')})`;
          if (bare(m.ret) === 'void') body.push(`${call};`);
          else keep(m.ret, `stepvizOp${k}`, call);
        });
      } else {
        let names: string[];
        if (t.setup?.intersect) {
          // Two lists that join: both end in the same common nodes.
          const s = t.setup.intersect;
          const type = bare(fn!.params[0]?.type ?? 'ListNode*');
          const common = literal(type, { $list: s.common });
          const withTail = (values: Value[]) => {
            if (!values.length) return common;
            const head = literal(type, { $list: values });
            nodeCtx.lines.push(`${nodeCtx.nodes[nodeCtx.nodes.length - 1]}->next = ${common};`);
            return head;
          };
          const heads = [withTail(s.a), withTail(s.b)];
          body.push(...nodeCtx.lines.splice(0));
          nodeCtx.nodes = [];
          names = heads;
        } else {
          names = [];
          const args = t.args ?? [];
          // C: int sum(int nums[], int n) takes the length after an array; the tests give only the list.
          let extra = fn!.params.length - args.length;
          let p = 0;
          args.forEach((a, i) => {
            const type = fn!.params[p]?.type ?? 'int';
            declareHere(type, `stepvizArg${i}`, a);
            names.push(`stepvizArg${i}`);
            p++;
            if (extra > 0 && bare(type).endsWith('[]') && bare(type) !== 'char[]' && Array.isArray(a) && /^(int|long|long long|size_t)$/.test(bare(fn!.params[p]?.type ?? ''))) {
              names.push(String(a.length));
              p++;
              extra--;
            }
          });
        }
        if (nodeCtx.nodes.length) keep(nodeCtx.nodeType, 'stepvizInput', nodeCtx.nodes[0]);
        const call = `${t.call}(${names.join(', ')})`;
        if (t.then) keep(shape.functions.get(t.then)!.ret, 'stepvizResult', `${t.then}(${call})`);
        else if (bare(fn!.ret) === 'void') body.push(`${call};`);
        else keep(fn!.ret, 'stepvizResult', call);
        if (t.mutated) {
          const type = bare(fn!.params[t.mutated.arg]?.type ?? 'vector<int>');
          if (type.endsWith('[]')) {
            // An array can't be copied by =: keep it as a vector (C: a global array of the same length).
            const name = `stepvizArg${t.mutated.arg}`;
            const len = (t.args?.[t.mutated.arg] as Value[]).length;
            if (dialect === 'c') {
              globals.push(`${type.slice(0, -2)} stepvizArg[${Math.max(1, len)}];`);
              body.push(`for (int stepvizI = 0; stepvizI < ${len}; stepvizI++) stepvizArg[stepvizI] = ${name}[stepvizI];`);
              emptyArg = len === 0;
            } else {
              globals.push(`vector<${type.slice(0, -2)}> stepvizArg;`);
              body.push(`for (int stepvizI = 0; stepvizI < ${len}; stepvizI++) stepvizArg.push_back(${name}[stepvizI]);`);
            }
          } else keep(type, 'stepvizArg', `stepvizArg${t.mutated.arg}`);
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.startsWith('missing:')) Object.assign(entry, { problem: 'missing', missing: message.slice(8) });
      else Object.assign(entry, { problem: 'error', errorType: 'a test that could not be set up', message });
      continue;
    }
    const driver = `${lines.join('\n')}\n\n${globals.join('\n')}\n\nint main() {\n    ${body.join('\n    ')}\n    return 0;\n}\n`;
    const testTree = parser.parse(driver);
    if (!testTree) {
      Object.assign(entry, { problem: 'error', errorType: 'a test that could not be set up', message: `${lang} could not read the test.` });
      continue;
    }
    const run = runCppQuiet(testTree, { maxSeconds: Math.min(opts.perTestSeconds ?? 2, left / 1000), dialect });
    testTree.delete();
    const inStudent = (line: number | null | undefined) => (line && line <= studentLines ? line : null);
    if (run.status === 'timeout') {
      entry.problem = 'timeout';
      continue;
    }
    if (run.status === 'too-deep') {
      Object.assign(entry, { problem: 'error', errorType: 'a stack overflow', message: 'the function kept calling itself' });
      continue;
    }
    if (run.status === 'compile-error') {
      const line = inStudent(run.error?.line);
      Object.assign(entry, line ? { problem: 'error', errorType: 'a compile error', message: run.error!.message, line } : { problem: 'error', errorType: 'a test that does not fit your function', message: run.error!.message });
      continue;
    }
    if (run.status === 'runtime-error') {
      // The visualiser's plain-words sentence ("This position is outside the list.").
      const sentence = errorSentence(run.error!.type, dialect, run.error!.message).replace(/\.$/, '');
      Object.assign(entry, { problem: 'error', errorType: 'an error', message: sentence, line: inStudent(run.error!.line) });
      continue;
    }

    const memo = new Map<unknown, Any>();
    const how = t.compare ?? 'exact';
    let got: Any;
    if (isOps) got = [null, ...(t.ops ?? []).slice(1).map((op, k) => (bare(cls!.get(op[0] as string)!.ret) === 'void' ? null : mirror(run.value(`stepvizOp${k}`), memo)))];
    else got = mirror(run.value('stepvizResult'), memo);
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
      let after = emptyArg ? [] : exportValue(mirror(run.value('stepvizArg'), memo));
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
