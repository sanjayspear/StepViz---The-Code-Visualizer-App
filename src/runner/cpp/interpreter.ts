// C++ (and C) interpreter for StepViz. A tree-walking interpreter over the tree-sitter
// C++ syntax tree for a beginner subset. It never compiles or runs real C++: it
// carries out each statement itself and reports to the shared step recorder
// (../recorder.ts), so steps, kinds, caps and crash steps follow the same rules
// as the other languages.
//
// Supported: #include <iostream> <vector> <string> <cmath> <algorithm> <iomanip>
// <utility> <climits>; using namespace std; int main(); other functions with
// parameters by value or by reference (&), recursion; global variables; int,
// long, long long, double, float, char, bool, string, auto, const; fixed-size
// arrays and vector<T>; operators, casts, static_cast, ? :; if/else, while,
// do/while, for, range-for, break, continue, return; cout << (endl, fixed,
// setprecision, boolalpha); cin >> and getline(cin, s); string length/size/[]/
// substr/+; vector push_back/pop_back/size/empty/at/front/back/clear; swap, max,
// min, abs, sqrt, pow, floor, ceil, round, sort(v.begin(), v.end()), to_string,
// stoi, stod; try / catch (exception classes by reference or value, int, string,
// const char*, ...), throw runtime_error("...") / throw 5 / throw "text" / throw;
// <stdexcept>. Only real C++ exceptions can be caught: .at(), substr, stoi/stod and
// the program's own throw (what() gives g++'s text); v[i] outside the list, / by
// zero and unset variables stay crashes, as they are not exceptions in C++.
//
// C mode (dialect 'c'): <stdio.h> <stdlib.h> <math.h> <string.h> <stdbool.h>
// <limits.h>; printf, puts, putchar, scanf (with &x), strlen, strcmp; text in
// char arrays ("Sam" plus '\0'); no string type, vector, cout, cin or references.
//
// StepViz is stricter than a real compiler where real C++ would quietly give
// garbage: an index outside a list, a variable used before it has a value and
// whole-number division by zero all stop the program with a plain-words crash.
import type { Node, Tree } from 'web-tree-sitter';
import type { RawRunResult } from '../protocol';
import { Input } from '../input';
import {
  finishRun,
  recordCrash,
  Recorder,
  StopRun,
  type Getter,
  type ListPlan,
  type Reads,
  type RunOptions,
  type StepInfo,
  type Swap,
} from '../recorder';

// --------------------------------------------------------------------------
// Values

type Prim = 'int' | 'long' | 'double' | 'bool' | 'char' | 'string';
type CType = Prim | 'vector' | 'array' | 'void' | 'auto' | 'exception';

/** A C++ value. char values hold the character; lists hold their items; an exception holds its what() text. */
interface CVal {
  t: CType;
  v: number | boolean | string | CVal[] | null;
  elem?: Prim;
  /** exception: its class (runtime_error, out_of_range...) */
  cls?: string;
}

/** The standard exceptions StepViz knows, each with its parent class. */
const EXCEPTION_PARENT: Record<string, string | null> = {
  exception: null,
  logic_error: 'exception',
  invalid_argument: 'logic_error',
  domain_error: 'logic_error',
  length_error: 'logic_error',
  out_of_range: 'logic_error',
  runtime_error: 'exception',
  range_error: 'runtime_error',
  overflow_error: 'runtime_error',
  underflow_error: 'runtime_error',
};
function isA(type: string, ancestor: string): boolean {
  for (let t: string | null = type; t; t = EXCEPTION_PARENT[t] ?? null) if (t === ancestor) return true;
  return false;
}

/** An item or variable that has no value yet. */
const UNSET_VAL: CVal = { t: 'int', v: null };
const isCVal = (x: unknown): x is CVal => typeof x === 'object' && x !== null && !Array.isArray(x) && 't' in x && 'v' in x;
const NUMERIC = new Set<CType>(['int', 'long', 'double', 'char', 'bool']);

const int = (n: number): CVal => ({ t: 'int', v: n | 0 });
const lng = (n: number): CVal => ({ t: 'long', v: Math.trunc(n) });
const dbl = (n: number): CVal => ({ t: 'double', v: n });
const bool = (b: boolean): CVal => ({ t: 'bool', v: b });
const chr = (c: string): CVal => ({ t: 'char', v: c });
const strv = (s: string): CVal => ({ t: 'string', v: s });
const VOID: CVal = { t: 'void', v: null };

/** cout's default way of writing a double: 6 significant digits, like %g. */
export function cppDouble(x: number, precision = 6): string {
  if (Number.isNaN(x)) return 'nan';
  if (!Number.isFinite(x)) return x > 0 ? 'inf' : '-inf';
  if (x === 0) return Object.is(x, -0) ? '-0' : '0';
  const p = Math.max(1, precision);
  const exp = Math.floor(Math.log10(Math.abs(x)));
  if (exp < -4 || exp >= p) {
    const [m, e] = x.toExponential(p - 1).split('e');
    const mantissa = m.includes('.') ? m.replace(/0+$/, '').replace(/\.$/, '') : m;
    const n = Number(e);
    return `${mantissa}e${n < 0 ? '-' : '+'}${String(Math.abs(n)).padStart(2, '0')}`;
  }
  const fixed = x.toFixed(Math.max(0, p - 1 - exp));
  return fixed.includes('.') ? fixed.replace(/0+$/, '').replace(/\.$/, '') : fixed;
}

/** How a value shows in a frame. */
export function formatCpp(x: unknown): string | undefined {
  if (x === undefined) return 'nothing';
  if (x === UNSET_VAL) return '?';
  if (Array.isArray(x)) return `[${x.map((e) => formatCpp(e) ?? String(e)).join(', ')}]`;
  if (typeof x === 'object' && x !== null && 'refOf' in x) {
    const r = x as { refOf: string; value: unknown };
    return `${formatCpp(r.value)} (same box as ${r.refOf})`;
  }
  if (!isCVal(x)) return undefined;
  switch (x.t) {
    case 'string':
      return JSON.stringify(x.v);
    case 'char':
      return `'${x.v}'`;
    case 'double':
      return cppDouble(x.v as number);
    case 'bool':
      return x.v ? 'true' : 'false';
    case 'void':
      return 'nothing';
    case 'exception':
      return `${x.cls}: ${x.v}`;
    case 'vector':
    case 'array':
      if (x.elem === 'char') {
        const items = x.v as CVal[];
        return items[0] === UNSET_VAL ? '?' : JSON.stringify(charText(items));
      }
      return formatCpp(x.v);
    default:
      return String(x.v);
  }
}

/** The text held in a char array: the letters up to '\0'. */
function charText(items: CVal[]): string {
  let out = '';
  for (const c of items) {
    if (c === UNSET_VAL || c.v === '\u0000') break;
    out += c.v as string;
  }
  return out;
}

/** Which language the program is in (set for each check or run). */
type Dialect = 'cpp' | 'c';
let dialect: Dialect = 'cpp';
const LANG_NAME = () => (dialect === 'c' ? 'C' : 'C++');

// --------------------------------------------------------------------------
// Errors

export class CompileError extends Error {
  constructor(
    public line: number,
    message: string,
  ) {
    super(`Line ${line}: ${message}`);
  }
}

/** A crash while running: ends with an error step, unless it is a real C++ exception that a catch part takes. */
export class CppCrash extends Error {
  constructor(
    public kind: string,
    message: string,
    /** A real C++ exception (out_of_range from .at(), or the program's own throw): what catch matches. */
    public thrown?: { value: CVal; tag: string; byProgram: boolean },
  ) {
    super(message);
    this.name = kind;
  }
}

/** A standard exception thrown by the library itself (vector::at, stoi...), with the what() text g++ gives. */
const libraryException = (cls: string, message: string, what: string) =>
  new CppCrash(cls, message, { value: { t: 'exception', cls, v: what }, tag: cls, byProgram: false });

class ReturnSignal {
  constructor(
    public value: CVal,
    public line: number,
  ) {}
}
class BreakSignal {}
class ContinueSignal {}

const lineOf = (n: Node) => n.startPosition.row + 1;
const unsupported = (n: Node, feature: string) => new CompileError(lineOf(n), `StepViz can't run ${feature} in ${LANG_NAME()} yet.`);
const named = (n: Node | null | undefined): Node[] =>
  (n?.namedChildren ?? []).filter((c): c is Node => !!c && c.type !== 'comment');

// --------------------------------------------------------------------------
// Syntax and subset checks (before running)

const FRIENDLY_MISSING: Record<string, string> = {
  ';': 'A semicolon (;) is missing at the end of this line.',
  ')': 'A closing bracket ) is missing.',
  '}': 'A closing brace } is missing.',
};

function syntaxError(tree: Tree): CompileError | null {
  if (!tree.rootNode.hasError) return null;
  let found: Node | null = null;
  const visit = (n: Node) => {
    if (found) return;
    if (n.isMissing || n.type === 'ERROR') {
      found = n;
      return;
    }
    for (const c of n.children) if (c) visit(c);
  };
  visit(tree.rootNode);
  const node = found as Node | null;
  if (!node) return new CompileError(1, `${LANG_NAME()} could not understand this program.`);
  if (node.isMissing) return new CompileError(lineOf(node), FRIENDLY_MISSING[node.type] ?? `${LANG_NAME()} could not understand this line.`);
  return new CompileError(lineOf(node), `${LANG_NAME()} could not understand this line.`);
}

const FEATURES: Record<string, string> = {
  pointer_declarator: 'pointers',
  pointer_expression: 'pointers',
  abstract_pointer_declarator: 'pointers',
  new_expression: 'new',
  delete_expression: 'delete',
  class_specifier: 'classes',
  struct_specifier: 'structs',
  union_specifier: 'unions',
  enum_specifier: 'enums',
  template_declaration: 'templates',
  lambda_expression: 'lambdas',
  namespace_definition: 'namespaces',
  goto_statement: 'goto',
  labeled_statement: 'labels',
  field_declaration_list: 'structs',
  preproc_def: '#define',
  preproc_function_def: '#define',
  preproc_ifdef: '#ifdef',
  preproc_if: '#if',
  type_definition: 'typedef',
  alias_declaration: 'using aliases',
  sizeof_expression: 'sizeof',
  comma_expression: 'the comma operator',
};

const INCLUDES = new Set([
  '<iostream>', '<vector>', '<string>', '<cmath>', '<algorithm>', '<iomanip>', '<utility>', '<climits>', '<bits/stdc++.h>', '<stdexcept>', '<exception>',
]);
const C_INCLUDES = new Set(['<stdio.h>', '<stdlib.h>', '<math.h>', '<string.h>', '<stdbool.h>', '<limits.h>']);

interface Program {
  main: Node;
  functions: Map<string, Node>;
  globals: Node[];
}

function functionName(def: Node): string {
  const decl = def.childForFieldName('declarator')!;
  return decl.childForFieldName('declarator')!.text;
}

function checkSubset(tree: Tree): Program {
  const functions = new Map<string, Node>();
  const globals: Node[] = [];
  for (const n of named(tree.rootNode)) {
    switch (n.type) {
      case 'preproc_include': {
        const path = n.childForFieldName('path')?.text ?? '';
        if (!(dialect === 'c' ? C_INCLUDES : INCLUDES).has(path)) throw unsupported(n, `#include ${path}`);
        continue;
      }
      case 'using_declaration':
        if (dialect === 'c' || !/^using\s+namespace\s+std\s*;$/.test(n.text)) throw unsupported(n, n.text.replace(/;$/, ''));
        continue;
      case 'function_definition': {
        const name = functionName(n);
        if (functions.has(name)) throw unsupported(n, 'two functions with the same name');
        functions.set(name, n);
        continue;
      }
      case 'declaration':
        if (n.childForFieldName('declarator')?.type === 'function_declarator') throw unsupported(n, 'function declarations without a body');
        globals.push(n);
        continue;
      default:
        throw unsupported(n, FEATURES[n.type] ?? n.type.replace(/_/g, ' '));
    }
  }
  const main = functions.get('main');
  if (!main || main.childForFieldName('type')?.text !== 'int') {
    throw new CompileError(main ? lineOf(main) : 1, 'StepViz needs an int main() function to start the program.');
  }
  const visit = (n: Node) => {
    // C: &x is allowed only as an argument of scanf.
    const scanfAddress =
      dialect === 'c' &&
      n.type === 'pointer_expression' &&
      n.childForFieldName('operator')?.type === '&' &&
      n.parent?.type === 'argument_list' &&
      n.parent.parent?.childForFieldName('function')?.text === 'scanf';
    // catch (const char* message): the one pointer StepViz allows, for throw "text".
    const catchText = n.type === 'pointer_declarator' && n.parent?.type === 'parameter_declaration' && n.parent.parent?.parent?.type === 'catch_clause';
    const feature = FEATURES[n.type];
    if (feature && !scanfAddress && !catchText) throw unsupported(n, feature);
    if (dialect === 'c' && n.type === 'reference_declarator') throw unsupported(n, 'references (&)');
    if (n.type === 'unary_expression' && n.childForFieldName('operator')?.type === '&') throw unsupported(n, 'pointers');
    if (n.type === 'template_type') {
      const name = n.childForFieldName('name')?.text;
      if (name !== 'vector') throw unsupported(n, name ?? 'templates');
      const arg = named(n.childForFieldName('arguments'))[0];
      if (arg && /vector|map|set|</.test(arg.text)) throw unsupported(n, 'lists of lists');
    }
    if (n.type === 'array_declarator' && n.childForFieldName('declarator')?.type === 'array_declarator') throw unsupported(n, 'arrays of arrays');
    if (n.type === 'sized_type_specifier' && /unsigned/.test(n.text)) throw unsupported(n, 'unsigned numbers');
    for (const c of named(n)) visit(c);
  };
  for (const f of functions.values()) visit(f);
  for (const g of globals) visit(g);
  return { main, functions, globals };
}

// --------------------------------------------------------------------------
// Types and declarations

interface DeclType {
  t: CType;
  elem?: Prim;
}

function primOf(n: Node | null): Prim | 'void' | 'auto' {
  const text = (n?.text ?? 'void').replace(/^const\s+/, '').replace(/^std::/, '');
  if (n?.type === 'placeholder_type_specifier' || text === 'auto') return 'auto';
  if (['int', 'short'].includes(text)) return 'int';
  if (/^(long|long long|long int|long long int|size_t)$/.test(text)) return 'long';
  if (text === 'double' || text === 'float' || text === 'long double') return 'double';
  if (text === 'char') return 'char';
  if (text === 'bool' || text === '_Bool') return 'bool';
  if (text === 'string' && dialect === 'cpp') return 'string';
  if (text === 'void') return 'void';
  throw unsupported(n!, `the type ${text}`);
}

function typeOf(typeNode: Node | null): DeclType {
  if (typeNode?.type === 'template_type') {
    const arg = named(named(typeNode.childForFieldName('arguments'))[0]);
    const elem = primOf(arg.find((c) => c.type !== 'type_qualifier') ?? null);
    if (elem === 'void' || elem === 'auto') throw unsupported(typeNode, `vector<${elem}>`);
    return { t: 'vector', elem };
  }
  if (typeNode?.type === 'qualified_identifier' && /vector/.test(typeNode.text)) return typeOf(typeNode.childForFieldName('name'));
  return { t: primOf(typeNode) };
}

/** The name and shape of one declarator: x, x = 1, a[3], a[] = {...}, &r. */
interface DeclaratorInfo {
  name: string;
  value: Node | null;
  arraySize: Node | null | undefined; // undefined: not an array; null: int a[] = {...}
  reference: boolean;
}

function declaratorInfo(d: Node): DeclaratorInfo {
  let node = d;
  let value: Node | null = null;
  if (node.type === 'init_declarator') {
    value = node.childForFieldName('value');
    node = node.childForFieldName('declarator')!;
  }
  let reference = false;
  if (node.type === 'reference_declarator') {
    reference = true;
    node = named(node)[0];
  }
  let arraySize: Node | null | undefined;
  if (node.type === 'array_declarator') {
    arraySize = node.childForFieldName('size') ?? null;
    node = node.childForFieldName('declarator')!;
  }
  if (node.type !== 'identifier') throw unsupported(node, 'this kind of declaration');
  return { name: node.text, value, arraySize, reference };
}

const declarators = (s: Node) => s.childrenForFieldName('declarator').filter((d): d is Node => !!d);

// --------------------------------------------------------------------------
// Loops-and-lists view

const LOOP_TYPES = new Set(['for_statement', 'for_range_loop', 'while_statement', 'do_statement']);
const MUTATORS = new Set(['push_back', 'pop_back', 'clear', 'insert', 'erase']);

const subscriptBase = (n: Node | null): string | null =>
  n?.type === 'subscript_expression' && n.childForFieldName('argument')?.type === 'identifier' ? n.childForFieldName('argument')!.text : null;
const subscriptIndex = (n: Node): Node => named(n.childForFieldName('indices'))[0] ?? named(n)[1];

function safeIndex(n: Node): boolean {
  if (n.type === 'identifier' || n.type === 'number_literal') return true;
  if (n.type === 'parenthesized_expression') return safeIndex(named(n)[0]);
  if (n.type === 'binary_expression') {
    const op = n.childForFieldName('operator')!.type;
    return ['+', '-', '*', '/', '%'].includes(op) && safeIndex(n.childForFieldName('left')!) && safeIndex(n.childForFieldName('right')!);
  }
  return false;
}

function loopVarOf(loop: Node): string | null {
  if (loop.type === 'for_range_loop') {
    const d = loop.childForFieldName('declarator');
    return d?.type === 'identifier' ? d.text : d ? named(d).find((c) => c.type === 'identifier')?.text ?? null : null;
  }
  if (loop.type === 'for_statement') {
    const init = loop.childForFieldName('initializer');
    if (init?.type === 'declaration') {
      const ds = declarators(init);
      if (ds.length === 1) return declaratorInfo(ds[0]).name;
    }
  }
  return null;
}

/** swap(a[x], a[y]) -> [a, x, y] */
function swapCall(s: Node): [string, Node, Node] | null {
  const e = s.type === 'expression_statement' ? named(s)[0] : null;
  if (e?.type !== 'call_expression' || !/^(std::)?swap$/.test(e.childForFieldName('function')?.text ?? '')) return null;
  const [a, b] = named(e.childForFieldName('arguments'));
  const base = subscriptBase(a);
  if (!base || subscriptBase(b) !== base) return null;
  const x = subscriptIndex(a);
  const y = subscriptIndex(b);
  return safeIndex(x) && safeIndex(y) ? [base, x, y] : null;
}

/** int temp = a[x]; a[x] = a[y]; a[y] = temp;  ->  [a, x, y] */
function tempSwap(stmts: Node[], i: number): [string, Node, Node] | null {
  const [s1, s2, s3] = stmts.slice(i, i + 3);
  if (!s1 || !s2 || !s3 || s2.type !== 'expression_statement' || s3.type !== 'expression_statement') return null;
  let temp: string | null = null;
  let first: Node | null = null;
  if (s1.type === 'declaration') {
    const ds = declarators(s1);
    if (ds.length !== 1 || ds[0].type !== 'init_declarator') return null;
    temp = ds[0].childForFieldName('declarator')!.text;
    first = ds[0].childForFieldName('value');
  } else if (s1.type === 'expression_statement' && named(s1)[0]?.type === 'assignment_expression') {
    const a = named(s1)[0];
    if (a.childForFieldName('operator')?.type !== '=' || a.childForFieldName('left')?.type !== 'identifier') return null;
    temp = a.childForFieldName('left')!.text;
    first = a.childForFieldName('right');
  }
  const a2 = named(s2)[0];
  const a3 = named(s3)[0];
  if (!temp || !first || a2?.type !== 'assignment_expression' || a3?.type !== 'assignment_expression') return null;
  const base = subscriptBase(first);
  const l2 = a2.childForFieldName('left')!;
  const r2 = a2.childForFieldName('right')!;
  const l3 = a3.childForFieldName('left')!;
  const r3 = a3.childForFieldName('right')!;
  if (!base || subscriptBase(l2) !== base || subscriptBase(r2) !== base || subscriptBase(l3) !== base || r3.text !== temp) return null;
  const x = subscriptIndex(first);
  const y = subscriptIndex(r2);
  if (l2.text !== first.text || subscriptIndex(l3).text !== y.text || !safeIndex(x) || !safeIndex(y)) return null;
  return [base, x, y];
}

function planLists(p: Program): ListPlan {
  const candidates: string[] = [];
  const loopOf: ListPlan['loopOf'] = {};
  const note = (name: string, loops: Node[]) => {
    if (!candidates.includes(name)) candidates.push(name);
    if (!loopOf[name]) {
      const outer = loops[0];
      const innerLoop = loops[loops.length - 1];
      loopOf[name] = {
        outerLine: lineOf(outer),
        outerEndLine: outer.endPosition.row + 1,
        loopVars: [...new Set([loopVarOf(outer), loopVarOf(innerLoop)].filter((v): v is string => !!v))],
      };
    }
  };
  const visit = (n: Node, loops: Node[]) => {
    if (loops.length) {
      if (n.type === 'assignment_expression') {
        const base = subscriptBase(n.childForFieldName('left'));
        if (base) note(base, loops);
      }
      if (n.type === 'update_expression') {
        const base = subscriptBase(n.childForFieldName('argument'));
        if (base) note(base, loops);
      }
      if (n.type === 'call_expression') {
        const f = n.childForFieldName('function');
        if (f?.type === 'field_expression' && MUTATORS.has(f.childForFieldName('field')?.text ?? '')) {
          const obj = f.childForFieldName('argument');
          if (obj?.type === 'identifier') note(obj.text, loops);
        }
        if (/^(std::)?(swap|sort)$/.test(f?.text ?? '')) {
          const arg = named(n.childForFieldName('arguments'))[0];
          const base = subscriptBase(arg) ?? (arg?.type === 'call_expression' ? arg.childForFieldName('function')?.childForFieldName('argument')?.text : null);
          if (base) note(base, loops);
        }
      }
    }
    const bodyId = LOOP_TYPES.has(n.type) ? n.childForFieldName('body')?.id : undefined;
    for (const c of named(n)) visit(c, bodyId !== undefined && c.id === bodyId ? [...loops, n] : loops);
  };
  for (const f of p.functions.values()) visit(f, []);
  return { candidates, loopOf };
}

// --------------------------------------------------------------------------
// The interpreter

const UNSET = Symbol('unset');
interface Cell {
  t: CType;
  elem?: Prim;
  v: CVal | typeof UNSET;
}

/** A variable in a scope: its box, and (for a reference) the name of the box it shares. */
interface Binding {
  cell: Cell;
  refOf?: string;
}

class Scope {
  vars = new Map<string, Binding>();
  /** `functionTop`: the outermost scope of a function; its frame does not list globals. */
  constructor(
    public parent: Scope | null,
    public functionTop = false,
  ) {}
  lookup(name: string): Binding | undefined {
    return this.vars.get(name) ?? this.parent?.lookup(name);
  }
  names(): string[] {
    const out = this.parent && !this.functionTop ? this.parent.names() : [];
    for (const n of this.vars.keys()) if (!out.includes(n)) out.push(n);
    return out;
  }
}

const statementsOf = (n: Node | null): Node[] => (!n ? [] : n.type === 'compound_statement' ? named(n) : [n]);
const rangeOf = (n: Node | null): [number, number] | undefined => {
  const s = statementsOf(n);
  return s.length ? [lineOf(s[0]), s[s.length - 1].endPosition.row + 1] : undefined;
};
/** [label, first line, last line] of each case with statements; empty cases join the next ("1 or 2"). */
function switchCases(s: Node): [string, number, number][] {
  const out: [string, number, number][] = [];
  let pending: string[] = [];
  for (const c of named(s.childForFieldName('body')).filter((x) => x.type === 'case_statement')) {
    const value = c.childForFieldName('value');
    pending.push(value ? value.text : 'default');
    const body = named(c).filter((x) => x.id !== value?.id && x.type !== 'comment');
    if (!body.length) continue;
    out.push([pending.join(' or '), lineOf(body[0]), body[body.length - 1].endPosition.row + 1]);
    pending = [];
  }
  return out;
}

const conditionOf = (s: Node): Node => {
  const c = s.childForFieldName('condition')!;
  if (c.type === 'condition_clause') return c.childForFieldName('value') ?? named(c)[0];
  if (c.type === 'parenthesized_expression') return named(c)[0];
  return c;
};

/** The leftmost operand of a << or >> chain, and the operands after it. */
function chain(n: Node, op: '<<' | '>>'): { head: Node; items: Node[] } {
  const items: Node[] = [];
  let cur = n;
  while (cur.type === 'binary_expression' && cur.childForFieldName('operator')?.type === op) {
    items.unshift(cur.childForFieldName('right')!);
    cur = cur.childForFieldName('left')!;
  }
  return { head: cur, items };
}
const isStream = (n: Node, name: 'cout' | 'cin') => n.text === name || n.text === `std::${name}`;

const declaredNames = (stmts: Node[]): { name: string; type: DeclType; arrayLen?: number }[] => {
  const out: { name: string; type: DeclType }[] = [];
  for (const s of stmts) {
    if (s.type !== 'declaration') continue;
    const type = typeOf(s.childForFieldName('type'));
    for (const d of declarators(s)) {
      const info = declaratorInfo(d);
      out.push({ name: info.name, type: info.arraySize !== undefined ? { t: 'array', elem: type.t as Prim } : type });
    }
  }
  return out;
};

class Interp {
  rt: Recorder;
  private nameSets: string[][] = [];
  private nameIds = new Map<string, number>();
  private scope: Scope = new Scope(null);
  private globals: Scope = new Scope(null);
  private input: Input;
  private stream = { fixed: false, precision: 6, boolalpha: false };

  constructor(
    private program: Program,
    plan: ListPlan,
    opts: RunOptions & { input?: string },
  ) {
    this.input = new Input(opts.input ?? '', (message) => new CppCrash('NoMoreInput', message));
    const hasGlobals = program.globals.length > 0;
    this.rt = new Recorder(this.nameSets, plan, { ...opts, rootLabel: hasGlobals ? 'Global' : 'main()', format: formatCpp });
  }

  private namesId(names: string[]): number {
    const key = names.join('\u0000');
    let id = this.nameIds.get(key);
    if (id === undefined) {
      id = this.nameSets.length;
      this.nameSets.push(names);
      this.nameIds.set(key, id);
    }
    return id;
  }

  private getters(names: string[]): Getter[] {
    const scope = this.scope;
    return names.map((n) => () => {
      const b = scope.lookup(n);
      if (!b || b.cell.v === UNSET) throw new Error('unset');
      // Lists are handed over as their items (for the list view); char arrays as text.
      const value = (b.cell.v.t === 'vector' || b.cell.v.t === 'array') && b.cell.v.elem !== 'char' ? b.cell.v.v : b.cell.v;
      return b.refOf ? { refOf: b.refOf, value } : value;
    });
  }

  private readsOf(parts: (Node | null)[]): Reads {
    const out: [string, Getter][] = [];
    const seen = new Set<string>();
    const scope = this.scope;
    const visit = (n: Node) => {
      const base = subscriptBase(n);
      if (base && !seen.has(n.text)) {
        const index = subscriptIndex(n);
        if (safeIndex(index)) {
          seen.add(n.text);
          out.push([base, () => this.indexValue(index, scope)]);
        }
      }
      for (const c of named(n)) visit(c);
    };
    for (const p of parts) if (p) visit(p);
    return out.length ? out : null;
  }

  private indexValue(n: Node, scope: Scope): number {
    const saved = this.scope;
    this.scope = scope;
    try {
      return this.num(this.eval(n));
    } finally {
      this.scope = saved;
    }
  }

  private hook(line: number, info: StepInfo, reads: Reads = null, swap: Swap = null) {
    const names = this.scope.names();
    this.rt.hooks.l(line, this.namesId(names), this.getters(names), reads, swap, info);
  }

  // ---- program ----------------------------------------------------------------

  run() {
    this.scope = this.globals;
    for (const d of declaredNames(this.program.globals)) this.globals.vars.set(d.name, { cell: { ...d.type, v: UNSET } });
    for (const g of this.program.globals) {
      this.hook(lineOf(g), this.infoOf(g));
      this.declare(g, true);
    }
    const main = this.program.main;
    if (this.program.globals.length) {
      // Global variables get their own frame under main().
      this.rt.hooks.f(); // the last global declaration has finished
      this.rt.stack[0].pending = lineOf(main);
      this.call(main, 'main', []);
      this.rt.stack[0].pending = null;
    } else {
      this.scope = new Scope(this.globals, true);
      try {
        this.execBody(main.childForFieldName('body')!);
      } catch (e) {
        if (!(e instanceof ReturnSignal)) throw e;
        // return 0; ends the program: main() is done and returns 0.
        this.rt.hooks.ret(e.line, e.value);
        this.rt.stack[0].pending = null;
      }
    }
    this.rt.finish();
  }

  private execBody(block: Node) {
    const saved = this.scope;
    this.scope = new Scope(saved);
    const stmts = statementsOf(block);
    for (const d of declaredNames(stmts)) this.scope.vars.set(d.name, { cell: { ...d.type, v: UNSET } });
    try {
      for (let i = 0; i < stmts.length; i++) this.exec(stmts[i], tempSwap(stmts, i));
    } finally {
      this.scope = saved;
    }
  }

  // ---- statements ---------------------------------------------------------------

  private targetName(n: Node): string {
    return subscriptBase(n) ?? n.text;
  }

  private infoOf(s: Node): StepInfo {
    switch (s.type) {
      case 'declaration': {
        const ds = declarators(s);
        const t = ds.map((d) => declaratorInfo(d).name);
        return { k: 'assign', t };
      }
      case 'expression_statement': {
        const e = named(s)[0];
        if (!e) return { k: 'other' };
        if (e.type === 'assignment_expression') return { k: 'assign', t: [this.targetName(e.childForFieldName('left')!)] };
        if (e.type === 'update_expression') return { k: 'assign', t: [this.targetName(e.childForFieldName('argument')!)] };
        if (e.type === 'binary_expression') {
          const { head, items } = chain(e, '<<');
          if (isStream(head, 'cout')) return { k: 'print' };
          const input = chain(e, '>>');
          if (isStream(input.head, 'cin')) return { k: 'input', t: input.items.map((i) => this.targetName(i)) };
          void items;
        }
        if (e.type === 'call_expression') {
          const f = e.childForFieldName('function')!;
          const args = named(e.childForFieldName('arguments'));
          if (/^(std::)?getline$/.test(f.text) && args[1]) return { k: 'input', t: [args[1].text] };
          if (['printf', 'puts', 'putchar'].includes(f.text)) return { k: 'print' };
          if (f.text === 'scanf') {
            return { k: 'input', t: args.slice(1).map((a) => (a.type === 'pointer_expression' ? this.targetName(a.childForFieldName('argument')!) : this.targetName(a))) };
          }
          if (/^(std::)?swap$/.test(f.text)) {
            return { k: 'assign', t: [...new Set(args.map((a) => this.targetName(a)))], s: true };
          }
          if (/^(std::)?sort$/.test(f.text) && args[0]?.type === 'call_expression') {
            const obj = args[0].childForFieldName('function')?.childForFieldName('argument');
            if (obj) return { k: 'assign', t: [obj.text] };
          }
          if (f.type === 'field_expression' && MUTATORS.has(f.childForFieldName('field')?.text ?? '')) {
            return { k: 'assign', t: [f.childForFieldName('argument')!.text] };
          }
        }
        return { k: 'other' };
      }
      case 'switch_statement':
        return { k: 'switch', c: conditionOf(s).text, cs: switchCases(s) };
      case 'if_statement': {
        const info: StepInfo = { k: 'branch', c: conditionOf(s).text };
        const b = rangeOf(s.childForFieldName('consequence'));
        const alt = s.childForFieldName('alternative');
        const e = rangeOf(alt?.type === 'else_clause' ? named(alt)[0] : alt);
        if (b) info.b = b;
        if (e) info.e = e;
        return info;
      }
      default:
        return { k: 'other' };
    }
  }

  private headOf(s: Node): (Node | null)[] {
    if (s.type === 'if_statement' || s.type === 'switch_statement') return [conditionOf(s)];
    if (s.type === 'compound_statement') return [];
    return [s];
  }

  private exec(s: Node, tempSwapInfo: [string, Node, Node] | null = null) {
    switch (s.type) {
      case 'compound_statement':
        this.execBody(s);
        return;
      case 'while_statement':
      case 'do_statement':
      case 'for_statement':
      case 'for_range_loop':
        this.execLoop(s);
        return;
      case 'try_statement':
        this.execTry(s);
        return;
    }
    const swap = swapCall(s) ?? tempSwapInfo;
    const swapInfo: Swap = swap
      ? (() => {
          const scope = this.scope;
          return [swap[0], () => this.indexValue(swap[1], scope), () => this.indexValue(swap[2], scope)];
        })()
      : null;
    this.hook(lineOf(s), swapInfo ? { k: 'swap' } : this.infoOf(s), this.readsOf(this.headOf(s)), swapInfo);
    switch (s.type) {
      case 'declaration':
        this.declare(s, false);
        return;
      case 'expression_statement':
        if (named(s)[0]) this.eval(named(s)[0]);
        return;
      case 'if_statement': {
        const cond = this.truthy(this.eval(conditionOf(s)));
        let branch = cond ? s.childForFieldName('consequence') : s.childForFieldName('alternative');
        if (branch?.type === 'else_clause') branch = named(branch)[0];
        if (branch) this.execNested(branch);
        return;
      }
      case 'switch_statement':
        this.execSwitch(s);
        return;
      case 'return_statement': {
        const e = named(s)[0];
        const value = e ? this.eval(e) : VOID;
        throw new ReturnSignal(value, lineOf(s));
      }
      case 'throw_statement':
        throw this.throwValue(s);
      case 'break_statement':
        throw new BreakSignal();
      case 'continue_statement':
        throw new ContinueSignal();
      default:
        throw unsupported(s, s.type.replace(/_/g, ' '));
    }
  }

  /** switch: jump to the matching case (or default), then run on until break. */
  private execSwitch(s: Node) {
    const value = this.eval(conditionOf(s));
    if (!['int', 'long', 'char', 'bool'].includes(value.t)) throw new CompileError(lineOf(s), 'A switch needs a whole number or a char.');
    const cases = named(s.childForFieldName('body')).filter((x) => x.type === 'case_statement');
    const bodyOf = (c: Node) => {
      const v = c.childForFieldName('value');
      return named(c).filter((x) => x.id !== v?.id && x.type !== 'comment');
    };
    let start = cases.findIndex((c) => {
      const v = c.childForFieldName('value');
      return !!v && this.num(this.eval(v)) === this.num(value);
    });
    if (start < 0) start = cases.findIndex((c) => !c.childForFieldName('value'));
    if (start < 0) return;
    const run = cases.slice(start).flatMap(bodyOf);
    const saved = this.scope;
    this.scope = new Scope(saved);
    for (const d of declaredNames(cases.flatMap(bodyOf))) this.scope.vars.set(d.name, { cell: { ...d.type, v: UNSET } });
    try {
      for (let i = 0; i < run.length; i++) this.exec(run[i], tempSwap(run, i));
    } catch (e) {
      if (!(e instanceof BreakSignal)) throw e;
    } finally {
      this.scope = saved;
    }
  }

  private execNested(n: Node) {
    if (n.type === 'compound_statement') this.execBody(n);
    else {
      const saved = this.scope;
      this.scope = new Scope(saved);
      for (const d of declaredNames([n])) this.scope.vars.set(d.name, { cell: { ...d.type, v: UNSET } });
      try {
        this.exec(n);
      } finally {
        this.scope = saved;
      }
    }
  }

  /** The exceptions being handled (innermost last), for throw; inside a catch part. */
  private handling: CppCrash[] = [];

  /** throw runtime_error("..."), throw 5, throw "text", throw; (again, inside a catch part). */
  private throwValue(s: Node): CppCrash {
    const e = named(s)[0];
    if (!e) {
      const current = this.handling[this.handling.length - 1];
      if (!current) throw unsupported(s, 'throw; outside a catch part');
      return current;
    }
    const fn = e.type === 'call_expression' ? e.childForFieldName('function')!.text.replace(/^std::/, '') : '';
    if (fn in EXCEPTION_PARENT) {
      const args = named(e.childForFieldName('arguments'));
      if (fn === 'exception' ? args.length !== 0 : args.length !== 1) {
        throw new CompileError(lineOf(e), fn === 'exception' ? 'exception() takes no message.' : `${fn} needs a message, like ${fn}("...").`);
      }
      const msg = fn === 'exception' ? 'std::exception' : this.eval(args[0]);
      if (typeof msg !== 'string' && msg.t !== 'string') throw new CompileError(lineOf(e), `The message of ${fn} must be text.`);
      const what = typeof msg === 'string' ? msg : (msg.v as string);
      return new CppCrash(fn, what, { value: { t: 'exception', cls: fn, v: what }, tag: fn, byProgram: true });
    }
    const v = this.eval(e);
    if (v.t === 'vector' || v.t === 'array' || v.t === 'void') throw unsupported(s, 'throwing this kind of value');
    // "text" in quotes is a const char* in C++ (catch (string s) does not catch it); a string variable is a string.
    const tag = e.type === 'string_literal' || e.type === 'concatenated_string' ? 'const char*' : v.t === 'exception' ? v.cls! : v.t;
    const text = formatCpp(v) ?? String(v.v);
    return new CppCrash(tag, text, { value: v, tag, byProgram: true });
  }

  /** What one catch part takes: (...), an exception class (and the classes under it), or exactly one plain type. */
  private catchTarget(clause: Node): { all: boolean; tag?: string; name?: string; byValue: boolean } {
    const params = clause.childForFieldName('parameters')!;
    const p = named(params)[0];
    if (!p) return { all: /\.\.\./.test(params.text), byValue: false };
    const typeNode = p.childForFieldName('type')!;
    let decl = p.childForFieldName('declarator');
    let pointer = false;
    let byValue = true;
    while (decl && decl.type !== 'identifier') {
      if (decl.type === 'pointer_declarator') pointer = true;
      if (decl.type === 'reference_declarator') byValue = false;
      decl = decl.childForFieldName('declarator') ?? named(decl).find((c) => c.type !== 'type_qualifier') ?? null;
    }
    const name = decl?.text;
    const typeText = typeNode.text.replace(/^std::/, '');
    if (typeText in EXCEPTION_PARENT) return { all: false, tag: typeText, name, byValue };
    if (pointer) {
      if (typeText !== 'char') throw unsupported(p, 'pointers');
      return { all: false, tag: 'const char*', name, byValue };
    }
    return { all: false, tag: primOf(typeNode), name, byValue };
  }

  /** try / catch: a C++ exception that a catch part takes turns the line that failed into a catch step. */
  private execTry(s: Node) {
    try {
      this.execBody(s.childForFieldName('body')!);
    } catch (e) {
      if (!(e instanceof CppCrash) || !e.thrown) throw e;
      const thrown = e.thrown;
      const clause = named(s)
        .filter((c) => c.type === 'catch_clause')
        .find((c) => {
          const t = this.catchTarget(c);
          if (t.all) return true;
          return thrown.value.t === 'exception' && t.tag! in EXCEPTION_PARENT ? isA(thrown.tag, t.tag!) : thrown.tag === t.tag;
        });
      if (!clause) throw e;
      const isException = thrown.value.t === 'exception';
      this.rt.hooks.caught(
        !thrown.byProgram
          ? { k: 'catch', et: e.kind }
          : isException
            ? { k: 'catch', th: true, et: thrown.tag, ...(thrown.tag !== 'exception' ? { em: thrown.value.v as string } : {}) }
            : { k: 'catch', th: true, em: e.message },
      );
      const target = this.catchTarget(clause);
      const saved = this.scope;
      this.scope = new Scope(saved);
      if (target.name) {
        let value = thrown.value;
        // catch (exception e) by value keeps only the exception part: what() says "std::exception".
        if (isException && target.byValue && target.tag === 'exception' && thrown.tag !== 'exception') value = { t: 'exception', cls: 'exception', v: 'std::exception' };
        const cell: Cell = isException ? { t: 'exception', v: value } : { t: value.t, elem: value.elem, v: this.copy(value) };
        this.scope.vars.set(target.name, { cell });
      }
      this.handling.push(e);
      try {
        this.execBody(clause.childForFieldName('body')!);
      } finally {
        this.handling.pop();
        this.scope = saved;
      }
    }
  }

  /** A declaration: values, arrays (a[3], a[] = {...}), vectors, references, auto. */
  private declare(s: Node, isGlobal: boolean) {
    const type = typeOf(s.childForFieldName('type'));
    for (const d of declarators(s)) {
      const info = declaratorInfo(d);
      const binding = this.scope.vars.get(info.name) ?? { cell: { ...type, v: UNSET } };
      this.scope.vars.set(info.name, binding);
      if (info.reference) {
        const target = info.value;
        if (target?.type !== 'identifier' && target?.type !== 'subscript_expression') throw unsupported(d, 'this kind of reference');
        const other = this.scope.lookup(target.text);
        if (!other) throw new CompileError(lineOf(d), `${target.text} is used but never declared.`);
        this.scope.vars.set(info.name, { cell: other.cell, refOf: target.text });
        continue;
      }
      if (info.arraySize !== undefined) {
        const elem = type.t as Prim;
        const fromText = info.value?.type === 'string_literal' || info.value?.type === 'concatenated_string';
        if (fromText && elem !== 'char') throw new CompileError(lineOf(d), `${info.name} is a list of ${elem}, so it can't hold text.`);
        const items = !info.value
          ? []
          : fromText
            ? [...(this.eval(info.value).v as string), '\u0000'].map(chr)
            : named(info.value).map((e) => this.convert(this.eval(e), { t: elem }, e, info.name));
        const size = info.arraySize ? this.num(this.eval(info.arraySize)) : items.length;
        if (items.length > size) throw new CompileError(lineOf(d), `${info.name} has room for ${size} items, not ${items.length}.`);
        // Items without a value: 0 for global arrays or a partly filled {...}; otherwise "no value yet".
        const filler = isGlobal || info.value ? this.zeroOf(elem) : UNSET_VAL;
        while (items.length < size) items.push(filler);
        binding.cell = { t: 'array', elem, v: { t: 'array', elem, v: items } };
        continue;
      }
      if (type.t === 'vector') {
        const items = info.value ? this.vectorFrom(info.value, type.elem!) : [];
        binding.cell.v = { t: 'vector', elem: type.elem, v: items };
        continue;
      }
      if (info.value) {
        const value = info.value.type === 'initializer_list' ? this.eval(named(info.value)[0]) : this.eval(info.value);
        if (type.t === 'auto') binding.cell = { t: value.t, elem: value.elem, v: this.copy(value) };
        else binding.cell.v = this.convert(value, binding.cell, d, info.name);
      } else if (type.t === 'string') binding.cell.v = strv('');
      else if (isGlobal) binding.cell.v = this.zeroOf(type.t as Prim);
    }
  }

  private vectorFrom(value: Node, elem: Prim): CVal[] {
    if (value.type === 'initializer_list') return named(value).map((e) => this.convert(this.eval(e), { t: elem }, e, 'this list'));
    const v = this.eval(value);
    if (v.t !== 'vector') throw new CompileError(lineOf(value), 'A vector needs a list of values like {1, 2, 3}.');
    return [...(v.v as CVal[])];
  }

  private zeroOf(t: Prim): CVal {
    if (t === 'double') return dbl(0);
    if (t === 'bool') return bool(false);
    if (t === 'char') return chr('\u0000');
    if (t === 'string') return strv('');
    if (t === 'long') return lng(0);
    return int(0);
  }

  /** Lists and text are copied when assigned or passed by value. */
  private copy(v: CVal): CVal {
    return v.t === 'vector' ? { ...v, v: [...(v.v as CVal[])] } : v;
  }

  private truthy(v: CVal): boolean {
    if (v.t === 'bool') return v.v as boolean;
    if (NUMERIC.has(v.t)) return this.num(v) !== 0;
    throw new CompileError(1, 'A condition must be true or false.');
  }

  private execLoop(s: Node) {
    const line = lineOf(s);
    const info: StepInfo = { k: 'loop' };
    const body = s.childForFieldName('body')!;
    const b = rangeOf(body);
    if (b) info.b = b;
    const condNode = s.type === 'for_range_loop' ? null : s.type === 'for_statement' ? s.childForFieldName('condition') : conditionOf(s);
    if (condNode) info.c = condNode.text;
    const v = loopVarOf(s);
    if (v) info.v = v;
    const head = s.type === 'for_range_loop' ? [s.childForFieldName('right')] : [condNode];

    const outer = this.scope;
    this.scope = new Scope(outer);
    try {
      let items: CVal[] | null = null;
      let itemBinding: Binding | null = null;
      if (s.type === 'for_statement') {
        const init = s.childForFieldName('initializer');
        if (init?.type === 'declaration') {
          for (const d of declaredNames([init])) this.scope.vars.set(d.name, { cell: { ...d.type, v: UNSET } });
          this.declare(init, false);
        } else if (init) this.eval(init.type === 'expression_statement' ? named(init)[0] : init);
      }
      if (s.type === 'for_range_loop') {
        const list = this.eval(s.childForFieldName('right')!);
        if (list.t !== 'vector' && list.t !== 'array' && list.t !== 'string') throw unsupported(s, 'this kind of range-for loop');
        items = list.t === 'string' ? [...(list.v as string)].map(chr) : (list.v as CVal[]);
        const declNode = s.childForFieldName('declarator')!;
        const isRef = declNode.type === 'reference_declarator';
        const type = typeOf(s.childForFieldName('type'));
        itemBinding = { cell: { t: type.t === 'auto' ? list.elem ?? 'int' : type.t, v: UNSET } };
        this.scope.vars.set(v ?? 'item', itemBinding);
        if (isRef) throw unsupported(s, 'range-for loops with &');
      }
      let first = true;
      let k = 0;
      for (;;) {
        if (items) {
          if (k >= items.length) break;
          const item = items[k++];
          if (item === UNSET_VAL) throw new CppCrash('Uninitialized', `item ${k - 1} has no value yet`);
          itemBinding!.cell.v = this.convert(item, itemBinding!.cell, s, v ?? 'item');
        } else if (s.type !== 'do_statement' || !first) {
          if (condNode && !this.truthy(this.eval(condNode))) break;
        }
        first = false;
        this.hook(line, info, this.readsOf(head));
        try {
          this.execNested(body);
        } catch (e) {
          if (e instanceof BreakSignal) {
            this.rt.hooks.f();
            break;
          }
          if (!(e instanceof ContinueSignal)) throw e;
        }
        this.rt.hooks.f();
        if (s.type === 'for_statement') {
          const update = s.childForFieldName('update');
          if (update) this.eval(update);
        }
        if (s.type === 'do_statement' && !this.truthy(this.eval(condNode!))) break;
      }
    } catch (e) {
      this.rt.hooks.dropLoop(line);
      throw e;
    } finally {
      this.scope = outer;
    }
    const names = this.scope.names();
    this.rt.hooks.x(line, this.namesId(names), this.getters(names), info);
  }

  // ---- functions ----------------------------------------------------------------

  private call(node: Node, name: string, argNodes: Node[]): CVal {
    const f = this.program.functions.get(name);
    if (!f) throw unsupported(node, `the function ${name}`);
    const params = named(f.childForFieldName('declarator')!.childForFieldName('parameters')).filter((p) => p.type === 'parameter_declaration');
    if (params.length !== argNodes.length) {
      throw new CompileError(lineOf(node), `${name} needs ${params.length} value${params.length === 1 ? '' : 's'}, not ${argNodes.length}.`);
    }
    const scope = new Scope(this.globals, true);
    const names: string[] = [];
    params.forEach((p, i) => {
      const decl = p.childForFieldName('declarator');
      const info = decl ? declaratorInfo(decl) : { name: `arg${i}`, reference: false, arraySize: undefined, value: null };
      const type = typeOf(p.childForFieldName('type'));
      const arg = argNodes[i];
      if (info.reference) {
        // A reference shares the caller's box.
        if (arg.type !== 'identifier') throw unsupported(arg, 'passing this by reference');
        const b = this.scope.lookup(arg.text);
        if (!b) throw new CompileError(lineOf(arg), `${arg.text} is used but never declared.`);
        scope.vars.set(info.name, { cell: b.cell, refOf: b.refOf ?? arg.text });
      } else if (info.arraySize !== undefined) {
        const a = this.eval(arg);
        if (a.t !== 'array') throw new CompileError(lineOf(arg), `${info.name} needs an array.`);
        scope.vars.set(info.name, { cell: { t: 'array', elem: a.elem, v: a } }); // arrays are not copied
      } else {
        scope.vars.set(info.name, { cell: { ...type, v: this.copy(this.convert(this.eval(arg), type, arg, info.name)) } });
      }
      names.push(info.name);
    });
    const returnType = typeOf(f.childForFieldName('type'));
    const saved = this.scope;
    this.scope = scope;
    this.rt.hooks.enter(name, this.namesId(names), this.getters(names));
    try {
      this.execBody(f.childForFieldName('body')!);
      if (returnType.t !== 'void' && name !== 'main') throw new CompileError(lineOf(f), `${name} must return a value.`);
      return VOID;
    } catch (e) {
      if (e instanceof ReturnSignal) {
        const value = returnType.t === 'void' ? VOID : this.convert(e.value, returnType, node, name);
        this.rt.hooks.ret(e.line, value.t === 'vector' || value.t === 'array' ? value.v : value);
        return value;
      }
      this.rt.hooks.thrown(e);
      throw e;
    } finally {
      this.scope = scope;
      this.rt.hooks.leave();
      this.scope = saved;
    }
  }

  // ---- expressions ----------------------------------------------------------------

  /** Assignment conversions (C++ converts numbers silently; text and lists must match). */
  private convert(v: CVal, to: { t: CType; elem?: Prim }, at: Node, name: string): CVal {
    if (v === UNSET_VAL) throw new CppCrash('Uninitialized', `${name} was given a value that has no value yet`);
    const t = to.t;
    if (t === 'auto' || v.t === t) return v.t === 'vector' && v.elem !== to.elem && to.elem ? this.mismatch(v, to, at, name) : v;
    if (NUMERIC.has(t) && NUMERIC.has(v.t)) {
      const x = this.num(v);
      if (t === 'int') return int(Math.trunc(x));
      if (t === 'long') return lng(x);
      if (t === 'double') return dbl(x);
      if (t === 'char') return chr(String.fromCharCode(Math.trunc(x) & 0xff));
      if (t === 'bool') return bool(x !== 0);
    }
    if (t === 'string' && v.t === 'char') return strv(v.v as string);
    return this.mismatch(v, to, at, name);
  }

  private mismatch(v: CVal, to: { t: CType; elem?: Prim }, at: Node, name: string): never {
    const what = to.t === 'vector' ? `vector<${to.elem}>` : to.t;
    throw new CompileError(lineOf(at), `${name} is ${/^[aeiou]/.test(what) ? 'an' : 'a'} ${what} box, so it can't hold ${formatCpp(v)}.`);
  }

  private num(v: CVal): number {
    if (v === UNSET_VAL) throw new CppCrash('Uninitialized', 'a value was used before it was given one');
    if (v.t === 'char') return (v.v as string).charCodeAt(0);
    if (v.t === 'bool') return v.v ? 1 : 0;
    return v.v as number;
  }

  private arith(op: string, a: CVal, b: CVal, at: Node): CVal {
    const x = this.num(a);
    const y = this.num(b);
    if (a.t === 'double' || b.t === 'double') {
      switch (op) {
        case '+': return dbl(x + y);
        case '-': return dbl(x - y);
        case '*': return dbl(x * y);
        case '/': return dbl(x / y);
        case '%': throw new CompileError(lineOf(at), '% only works on whole numbers in C++.');
      }
    }
    const isLong = a.t === 'long' || b.t === 'long';
    const wrap = (n: number): CVal => (isLong ? lng(n) : int(n));
    if ((op === '/' || op === '%') && y === 0) throw new CppCrash('DivideByZero', 'whole-number division by zero');
    switch (op) {
      case '+': return wrap(x + y);
      case '-': return wrap(x - y);
      case '*': return isLong ? wrap(x * y) : int(Math.imul(x, y));
      case '/': return wrap(Math.trunc(x / y));
      case '%': return wrap(x % y);
      case '&': return wrap(x & y);
      case '|': return wrap(x | y);
      case '^': return wrap(x ^ y);
      case '<<': return wrap(x << y);
      case '>>': return wrap(x >> y);
    }
    throw unsupported(at, `the operator ${op}`);
  }

  private binary(n: Node): CVal {
    const op = n.childForFieldName('operator')!.type;
    if (op === '<<') {
      const { head, items } = chain(n, '<<');
      if (isStream(head, 'cout')) return this.print(items);
    }
    if (op === '>>') {
      const { head, items } = chain(n, '>>');
      if (isStream(head, 'cin')) return this.read(items);
    }
    if (op === '&&' || op === '||' || op === 'and' || op === 'or') {
      const left = this.truthy(this.eval(n.childForFieldName('left')!));
      if ((op === '&&' || op === 'and') && !left) return bool(false);
      if ((op === '||' || op === 'or') && left) return bool(true);
      return bool(this.truthy(this.eval(n.childForFieldName('right')!)));
    }
    const a = this.eval(n.childForFieldName('left')!);
    const b = this.eval(n.childForFieldName('right')!);
    if (a.t === 'string' || b.t === 'string') {
      if (op === '+') {
        if ((a.t !== 'string' && a.t !== 'char') || (b.t !== 'string' && b.t !== 'char')) {
          throw new CompileError(lineOf(n), 'Text can only be joined with text here. Use to_string() for numbers.');
        }
        return strv(String(a.v) + String(b.v));
      }
      if (['==', '!=', '<', '<=', '>', '>='].includes(op)) {
        const x = String(a.v);
        const y = String(b.v);
        return bool(op === '==' ? x === y : op === '!=' ? x !== y : op === '<' ? x < y : op === '<=' ? x <= y : op === '>' ? x > y : x >= y);
      }
      throw new CompileError(lineOf(n), `${op} does not work on text.`);
    }
    if (['==', '!=', '<', '<=', '>', '>='].includes(op)) {
      const x = this.num(a);
      const y = this.num(b);
      return bool(op === '==' ? x === y : op === '!=' ? x !== y : op === '<' ? x < y : op === '<=' ? x <= y : op === '>' ? x > y : x >= y);
    }
    if (!NUMERIC.has(a.t) || !NUMERIC.has(b.t)) throw new CompileError(lineOf(n), `${op} only works on numbers.`);
    return this.arith(op, a, b, n);
  }

  /** cout << a << b << endl */
  private print(items: Node[]): CVal {
    for (const item of items) {
      const name = item.text.replace(/^std::/, '');
      if (name === 'endl') {
        this.rt.output += '\n';
        continue;
      }
      if (name === 'fixed') {
        this.stream.fixed = true;
        continue;
      }
      if (name === 'boolalpha') {
        this.stream.boolalpha = true;
        continue;
      }
      if (item.type === 'call_expression' && /^(std::)?setprecision$/.test(item.childForFieldName('function')!.text)) {
        this.stream.precision = this.num(this.eval(named(item.childForFieldName('arguments'))[0]));
        continue;
      }
      const v = this.eval(item);
      this.rt.output += this.coutText(v, item);
    }
    return VOID;
  }

  private coutText(v: CVal, at: Node): string {
    switch (v.t) {
      case 'double':
        return this.stream.fixed ? (v.v as number).toFixed(this.stream.precision) : cppDouble(v.v as number, this.stream.precision);
      case 'bool':
        return this.stream.boolalpha ? String(v.v) : v.v ? '1' : '0';
      case 'vector':
      case 'array':
        throw unsupported(at, 'printing a whole list with cout');
      default:
        if (v === UNSET_VAL) throw new CppCrash('Uninitialized', 'a value was printed before it was given one');
        return String(v.v);
    }
  }

  /** cin >> a >> b: one word per target. */
  private read(targets: Node[]): CVal {
    for (const t of targets) {
      const current = this.lvalueType(t);
      const word = this.input.peekWord();
      if (word === null) throw new CppCrash('NoMoreInput', 'No more input');
      let value: CVal;
      if (current === 'string') value = strv(this.input.word());
      else if (current === 'char') {
        value = chr(word[0]);
        this.input.word();
        if (word.length > 1) throw new CppCrash('BadInput', `expected one character but read "${word}"`);
      } else if (current === 'double') {
        if (Number.isNaN(Number(word))) throw new CppCrash('BadInput', `"${word}" is not a number`);
        value = dbl(Number(this.input.word()));
      } else if (current === 'bool') {
        if (word !== '0' && word !== '1') throw new CppCrash('BadInput', `"${word}" is not 0 or 1`);
        value = bool(this.input.word() === '1');
      } else {
        if (!/^[+-]?\d+$/.test(word)) throw new CppCrash('BadInput', `"${word}" is not a whole number`);
        value = int(Number(this.input.word()));
      }
      this.assignTo(t, value);
    }
    return VOID;
  }

  private lvalueType(t: Node): CType {
    if (t.type === 'subscript_expression') {
      const list = this.eval(t.childForFieldName('argument')!);
      return list.elem ?? (list.t === 'string' ? 'char' : 'int');
    }
    const b = this.scope.lookup(t.text);
    if (!b) throw new CompileError(lineOf(t), `${t.text} is used but never declared.`);
    return b.cell.t;
  }

  /** The list and position for v[i] (or s[i] for text), with StepViz's bounds check. */
  private element(n: Node, atCall = false): { list: CVal; index: number } {
    const list = this.eval(n.childForFieldName('argument')!);
    const i = this.num(this.eval(subscriptIndex(n)));
    const length = list.t === 'string' ? (list.v as string).length : list.t === 'vector' || list.t === 'array' ? (list.v as CVal[]).length : -1;
    if (length < 0) throw new CompileError(lineOf(n), `${n.childForFieldName('argument')!.text} is not a list.`);
    if (i < 0 || i >= length) {
      const message = `position ${i} is outside a ${list.t === 'string' ? 'text' : 'list'} of length ${length}`;
      // v.at(i) throws a real out_of_range (a catch part can take it); v[i] outside the list is not an exception in C++.
      if (atCall) {
        const what = list.t === 'string' ? `basic_string::at: __n (which is ${i}) >= this->size() (which is ${length})` : `vector::_M_range_check: __n (which is ${i}) >= this->size() (which is ${length})`;
        throw libraryException('out_of_range', message, what);
      }
      throw new CppCrash('IndexOutOfRange', message);
    }
    return { list, index: i };
  }

  private assignTo(target: Node, value: CVal): CVal {
    if (target.type === 'subscript_expression') {
      const { list, index } = this.element(target);
      if (list.t === 'string') throw unsupported(target, 'changing one letter of text');
      const items = list.v as CVal[];
      items[index] = this.convert(value, { t: list.elem ?? 'int' }, target, target.text);
      return items[index];
    }
    if (target.type === 'parenthesized_expression') return this.assignTo(named(target)[0], value);
    if (target.type !== 'identifier') throw unsupported(target, 'this kind of assignment');
    const b = this.scope.lookup(target.text);
    if (!b) throw new CompileError(lineOf(target), `${target.text} is used but never declared.`);
    if (b.cell.t === 'vector') {
      if (value.t !== 'vector') this.mismatch(value, b.cell, target, target.text);
      b.cell.v = this.copy(value);
    } else b.cell.v = this.convert(value, b.cell, target, target.text);
    return b.cell.v;
  }

  private readVar(id: Node): CVal {
    const b = this.scope.lookup(id.text);
    if (!b) {
      if (/^(std::)?(endl|cout|cin)$/.test(id.text)) throw unsupported(id, `${id.text} here`);
      if (id.text === 'INT_MAX') return int(2147483647);
      if (id.text === 'INT_MIN') return int(-2147483648);
      throw new CompileError(lineOf(id), `${id.text} is used but never declared.`);
    }
    if (b.cell.v === UNSET) throw new CppCrash('Uninitialized', `${id.text} was used before it was given a value`);
    return b.cell.v;
  }

  private readTarget(n: Node): CVal {
    if (n.type === 'subscript_expression') {
      const { list, index } = this.element(n);
      if (list.t === 'string') return chr((list.v as string)[index]);
      const item = (list.v as CVal[])[index];
      if (item === UNSET_VAL) throw new CppCrash('Uninitialized', `${n.text} was used before it was given a value`);
      return item;
    }
    return this.readVar(n);
  }

  eval(n: Node): CVal {
    switch (n.type) {
      case 'number_literal': {
        const text = n.text.replace(/'/g, '').toLowerCase();
        if (/[.e]/.test(text) && !text.startsWith('0x')) return dbl(parseFloat(text.replace(/f$/, '')));
        const digits = text.replace(/[ul]+$/, '');
        const value = digits.startsWith('0x') ? parseInt(digits, 16) : digits.startsWith('0b') ? parseInt(digits.slice(2), 2) : Number(digits);
        return /l$/.test(text) ? lng(value) : int(value);
      }
      case 'string_literal': {
        const raw = n.text.slice(1, -1);
        return strv(JSON.parse(`"${raw.replace(/\\'/g, "'")}"`));
      }
      case 'concatenated_string':
        return strv(named(n).map((s) => this.eval(s).v as string).join(''));
      case 'char_literal': {
        const body = n.text.slice(1, -1);
        return chr(body.startsWith('\\') ? JSON.parse(`"${body === "\\'" ? "'" : body}"`) : body);
      }
      case 'true':
        return bool(true);
      case 'false':
        return bool(false);
      case 'identifier':
      case 'qualified_identifier':
        return this.readVar(n);
      case 'parenthesized_expression':
        return this.eval(named(n)[0]);
      case 'binary_expression':
        return this.binary(n);
      case 'unary_expression': {
        const op = n.childForFieldName('operator')!.type;
        const v = this.eval(n.childForFieldName('argument')!);
        if (op === '!' || op === 'not') return bool(!this.truthy(v));
        const x = this.num(v);
        const t = v.t === 'char' || v.t === 'bool' ? 'int' : v.t;
        if (op === '-') return t === 'double' ? dbl(-x) : t === 'long' ? lng(-x) : int(-x);
        if (op === '+') return t === 'double' ? dbl(x) : t === 'long' ? lng(x) : int(x);
        if (op === '~') return int(~x);
        throw unsupported(n, `the operator ${op}`);
      }
      case 'update_expression': {
        const target = n.childForFieldName('argument')!;
        const op = n.childForFieldName('operator')!.type;
        const prefix = n.child(0)?.type === op;
        const before = this.readTarget(target);
        if (!NUMERIC.has(before.t)) throw new CompileError(lineOf(n), `${op} only works on numbers.`);
        const after = this.convert(this.arith(op === '++' ? '+' : '-', before, int(1), n), { t: before.t }, n, target.text);
        const stored = this.assignTo(target, after);
        return prefix ? stored : before;
      }
      case 'assignment_expression': {
        const op = n.childForFieldName('operator')!.type;
        const left = n.childForFieldName('left')!;
        const rightNode = n.childForFieldName('right')!;
        if (op === '=') {
          if (rightNode.type === 'initializer_list') {
            const b = this.scope.lookup(left.text);
            if (b?.cell.t === 'vector') return this.assignTo(left, { t: 'vector', elem: b.cell.elem, v: this.vectorFrom(rightNode, b.cell.elem!) });
          }
          return this.assignTo(left, this.eval(rightNode));
        }
        const current = this.readTarget(left);
        const right = this.eval(rightNode);
        const bin = op.slice(0, -1);
        if (current.t === 'string' && bin === '+') {
          if (right.t !== 'string' && right.t !== 'char') throw new CompileError(lineOf(n), 'Text can only be joined with text here. Use to_string() for numbers.');
          return this.assignTo(left, strv(String(current.v) + String(right.v)));
        }
        return this.assignTo(left, this.arith(bin, current, right, n));
      }
      case 'conditional_expression':
        return this.eval(n.childForFieldName(this.truthy(this.eval(n.childForFieldName('condition')!)) ? 'consequence' : 'alternative')!);
      case 'cast_expression': {
        const t = typeOf(named(n.childForFieldName('type'))[0] ?? n.childForFieldName('type'));
        return this.convert(this.eval(n.childForFieldName('value')!), t, n, 'this value');
      }
      case 'subscript_expression':
        return this.readTarget(n);
      case 'call_expression':
        return this.invoke(n);
      default:
        throw unsupported(n, n.type.replace(/_/g, ' '));
    }
  }

  private invoke(n: Node): CVal {
    const f = n.childForFieldName('function')!;
    const argNodes = named(n.childForFieldName('arguments'));
    const args = () => argNodes.map((a) => this.eval(a));

    // static_cast<int>(x)
    if (f.type === 'template_function' && f.childForFieldName('name')?.text === 'static_cast') {
      const t = typeOf(named(named(f.childForFieldName('arguments'))[0])[0] ?? null);
      return this.convert(this.eval(argNodes[0]), t, n, 'this value');
    }

    // Methods: v.push_back(3), s.length() ...
    if (f.type === 'field_expression') {
      const objNode = f.childForFieldName('argument')!;
      const method = f.childForFieldName('field')!.text;
      const obj = this.eval(objNode);
      if (obj.t === 'string') return this.stringMethod(n, obj, method, args());
      if (obj.t === 'exception' && method === 'what' && !argNodes.length) return strv(obj.v as string);
      if (obj.t === 'vector') return this.vectorMethod(n, objNode, obj, method, argNodes);
      throw unsupported(n, `.${method}()`);
    }

    const name = f.text.replace(/^std::/, '');
    if (this.program.functions.has(name)) return this.call(n, name, argNodes);
    switch (name) {
      case 'printf': {
        const [fmt, ...rest] = argNodes;
        const pattern = fmt ? this.eval(fmt) : null;
        if (pattern?.t !== 'string') throw new CompileError(lineOf(n), 'printf needs a text pattern in quotes first.');
        this.rt.output += this.cFormat(pattern.v as string, rest.map((a) => this.eval(a)));
        return int(0);
      }
      case 'puts':
        this.rt.output += `${this.textOf(this.eval(argNodes[0]), n)}\n`;
        return int(0);
      case 'putchar': {
        const c = this.eval(argNodes[0]);
        this.rt.output += c.t === 'char' ? (c.v as string) : String.fromCharCode(this.num(c));
        return int(0);
      }
      case 'scanf':
        return this.scanf(n, argNodes);
      case 'strlen':
        return lng(this.textOf(this.eval(argNodes[0]), n).length);
      case 'strcmp': {
        const [a, b] = args().map((v) => this.textOf(v, n));
        return int(a < b ? -1 : a > b ? 1 : 0);
      }
      case 'fabs':
        return dbl(Math.abs(this.num(args()[0])));
      case 'getline': {
        const [stream, target] = argNodes;
        if (!stream || !isStream(stream, 'cin') || !target) throw unsupported(n, 'getline like this');
        this.assignTo(target, strv(this.input.line()));
        return VOID;
      }
      case 'swap': {
        const [a, b] = argNodes;
        const x = this.readTarget(a);
        const y = this.readTarget(b);
        this.assignTo(a, y);
        this.assignTo(b, x);
        return VOID;
      }
      case 'sort': {
        const [begin, end] = argNodes;
        const owner = (c: Node) => (c?.type === 'call_expression' ? c.childForFieldName('function')?.childForFieldName('argument')?.text : null);
        if (!owner(begin) || owner(begin) !== owner(end)) throw unsupported(n, 'sort like this');
        const list = this.eval(begin.childForFieldName('function')!.childForFieldName('argument')!);
        (list.v as CVal[]).sort((x, y) => (x.t === 'string' ? String(x.v).localeCompare(String(y.v)) : this.num(x) - this.num(y)));
        return VOID;
      }
      case 'to_string': {
        const v = args()[0];
        return strv(v.t === 'double' ? (v.v as number).toFixed(6) : String(this.num(v)));
      }
      case 'stoi': {
        const s = args()[0];
        const m = /^\s*([+-]?\d+)/.exec(String(s.v));
        if (!m) throw libraryException('invalid_argument', `"${s.v}" is not a whole number`, 'stoi');
        return int(Number(m[1]));
      }
      case 'stod': {
        const s = args()[0];
        const x = parseFloat(String(s.v));
        if (Number.isNaN(x)) throw libraryException('invalid_argument', `"${s.v}" is not a number`, 'stod');
        return dbl(x);
      }
      case 'max':
      case 'min': {
        const [a, b] = args();
        const pick = name === 'max' ? this.num(a) >= this.num(b) : this.num(a) <= this.num(b);
        return pick ? a : b;
      }
      case 'abs': {
        const a = args()[0];
        return a.t === 'double' ? dbl(Math.abs(a.v as number)) : int(Math.abs(this.num(a)));
      }
      case 'sqrt':
      case 'floor':
      case 'ceil':
      case 'round':
        return dbl(Math[name](this.num(args()[0])));
      case 'pow': {
        const [a, b] = args();
        return dbl(Math.pow(this.num(a), this.num(b)));
      }
    }
    throw unsupported(n, `the function ${name}`);
  }

  /** Text from a string value or a char array. */
  private textOf(v: CVal, at: Node): string {
    if (v.t === 'string') return v.v as string;
    if ((v.t === 'array' || v.t === 'vector') && v.elem === 'char') return charText(v.v as CVal[]);
    throw new CompileError(lineOf(at), 'This needs text here.');
  }

  /** printf: %d %i %ld %lld %u %f %lf %e %g %c %s %x %o %% with widths and flags. */
  private cFormat(format: string, args: CVal[]): string {
    let k = 0;
    const bad = (conv: string, v: CVal) =>
      new CppCrash('BadFormat', `%${conv} does not match ${formatCpp(v) ?? 'this value'}`);
    return format.replace(/%([-+ 0#]*)(\d+)?(?:\.(\d+))?(hh|h|ll|l|L|z)?([diufFeEgGcsxXo%])/g, (_m, flags: string, width: string, prec: string, _len: string, conv: string) => {
      if (conv === '%') return '%';
      const v = args[k++];
      if (!v) throw new CppCrash('BadFormat', `%${conv} has no value to print`);
      let text: string;
      switch (conv) {
        case 'd':
        case 'i':
        case 'u':
          if (!['int', 'long', 'char', 'bool'].includes(v.t)) throw bad(conv, v);
          text = String(this.num(v));
          if (flags.includes('+') && this.num(v) >= 0) text = `+${text}`;
          break;
        case 'f':
        case 'F':
        case 'e':
        case 'E':
        case 'g':
        case 'G': {
          if (v.t !== 'double') throw bad(conv, v);
          const x = v.v as number;
          const p = prec === undefined ? 6 : Number(prec);
          if (conv === 'f' || conv === 'F') text = x.toFixed(p);
          else if (conv === 'g' || conv === 'G') text = cppDouble(x, p || 1);
          else text = x.toExponential(p).replace(/e([+-])(\d)$/, 'e$10$2');
          if (conv === 'E' || conv === 'G') text = text.toUpperCase();
          if (flags.includes('+') && x >= 0) text = `+${text}`;
          break;
        }
        case 'c':
          if (v.t !== 'char' && v.t !== 'int') throw bad(conv, v);
          text = v.t === 'char' ? (v.v as string) : String.fromCharCode(v.v as number);
          break;
        case 's':
          if (v.t !== 'string' && !((v.t === 'array' || v.t === 'vector') && v.elem === 'char')) throw bad(conv, v);
          text = this.textOf(v, null as unknown as Node);
          if (prec !== undefined) text = text.slice(0, Number(prec));
          break;
        case 'x':
        case 'X':
        case 'o':
          if (!['int', 'long', 'char'].includes(v.t)) throw bad(conv, v);
          text = (this.num(v) >>> 0).toString(conv === 'o' ? 8 : 16);
          if (conv === 'X') text = text.toUpperCase();
          break;
        default:
          text = String(v.v);
      }
      if (width && text.length < Number(width)) {
        const zero = flags.includes('0') && !flags.includes('-') && conv !== 's' && conv !== 'c';
        const pad = (zero ? '0' : ' ').repeat(Number(width) - text.length);
        text = flags.includes('-') ? text + pad : zero && /^[+-]/.test(text) ? text[0] + pad + text.slice(1) : pad + text;
      }
      return text;
    });
  }

  /** scanf("%d %s", &age, name): one value per conversion; returns how many were read. */
  private scanf(n: Node, argNodes: Node[]): CVal {
    const [fmtNode, ...targets] = argNodes;
    const fmt = fmtNode ? this.eval(fmtNode) : null;
    if (fmt?.t !== 'string') throw new CompileError(lineOf(n), 'scanf needs a text pattern in quotes first.');
    const convs = [...(fmt.v as string).matchAll(/%(l{0,2})([difscu])/g)];
    if (convs.length !== targets.length) throw new CompileError(lineOf(n), `scanf has ${convs.length} patterns but ${targets.length} places to store them.`);
    // Mistakes in the code come before running out of input.
    convs.forEach((m, i) => {
      const target = targets[i];
      if (m[2] !== 's' && target.type !== 'pointer_expression') {
        throw new CompileError(lineOf(target), `scanf needs &${target.text} to store a value in ${target.text}.`);
      }
    });
    convs.forEach((m, i) => {
      const conv = m[2];
      const target = targets[i];
      const word = this.input.peekWord();
      if (word === null) throw new CppCrash('NoMoreInput', 'No more input');
      if (conv === 's') {
        if (target.type !== 'identifier') throw unsupported(target, 'scanf %s into this');
        const b = this.scope.lookup(target.text);
        if (!b || b.cell.v === UNSET || b.cell.v.t !== 'array' || b.cell.v.elem !== 'char') {
          throw new CompileError(lineOf(target), `${target.text} must be a char array to hold text.`);
        }
        const items = b.cell.v.v as CVal[];
        const text = this.input.word();
        if (text.length + 1 > items.length) throw new CppCrash('IndexOutOfRange', `"${text}" does not fit in ${target.text} (room for ${items.length - 1} letters)`);
        [...text, '\u0000'].forEach((c, j) => (items[j] = chr(c)));
        return;
      }
      if (target.type !== 'pointer_expression') throw new CompileError(lineOf(target), `scanf needs &${target.text} to store a value in ${target.text}.`);
      const place = target.childForFieldName('argument')!;
      let value: CVal;
      if (conv === 'c') {
        value = chr(word[0]);
        this.input.word();
      } else if (conv === 'f') {
        if (Number.isNaN(Number(word))) throw new CppCrash('BadInput', `"${word}" is not a number`);
        value = dbl(Number(this.input.word()));
      } else {
        if (!/^[+-]?\d+$/.test(word)) throw new CppCrash('BadInput', `"${word}" is not a whole number`);
        value = int(Number(this.input.word()));
      }
      this.assignTo(place, value);
    });
    return int(convs.length);
  }

  private stringMethod(n: Node, s: CVal, method: string, a: CVal[]): CVal {
    const text = s.v as string;
    if ((method === 'length' || method === 'size') && a.length === 0) return lng(text.length);
    if (method === 'empty' && a.length === 0) return bool(text.length === 0);
    if (method === 'at' && a.length === 1) {
      const i = this.num(a[0]);
      if (i < 0 || i >= text.length) {
        throw libraryException('out_of_range', `position ${i} is outside a text of length ${text.length}`, `basic_string::at: __n (which is ${i}) >= this->size() (which is ${text.length})`);
      }
      return chr(text[i]);
    }
    if (method === 'substr' && a.length >= 1) {
      const start = this.num(a[0]);
      if (start > text.length) {
        throw libraryException('out_of_range', `position ${start} is outside a text of length ${text.length}`, `basic_string::substr: __pos (which is ${start}) > this->size() (which is ${text.length})`);
      }
      return strv(a.length > 1 ? text.substr(start, this.num(a[1])) : text.slice(start));
    }
    throw unsupported(n, `string.${method}()`);
  }

  private vectorMethod(n: Node, objNode: Node, vec: CVal, method: string, argNodes: Node[]): CVal {
    const items = vec.v as CVal[];
    const args = () => argNodes.map((a) => this.eval(a));
    switch (method) {
      case 'push_back':
        items.push(this.convert(args()[0], { t: vec.elem ?? 'int' }, n, objNode.text));
        return VOID;
      case 'pop_back':
        if (!items.length) throw new CppCrash('IndexOutOfRange', 'pop_back on an empty list');
        items.pop();
        return VOID;
      case 'size':
        return lng(items.length);
      case 'empty':
        return bool(items.length === 0);
      case 'clear':
        items.length = 0;
        return VOID;
      case 'front':
      case 'back':
        if (!items.length) throw new CppCrash('IndexOutOfRange', `${method} on an empty list`);
        return items[method === 'front' ? 0 : items.length - 1];
      case 'at': {
        const i = this.num(args()[0]);
        if (i < 0 || i >= items.length) {
          throw libraryException('out_of_range', `position ${i} is outside a list of length ${items.length}`, `vector::_M_range_check: __n (which is ${i}) >= this->size() (which is ${items.length})`);
        }
        return items[i];
      }
    }
    throw unsupported(n, `vector.${method}()`);
  }
}

// --------------------------------------------------------------------------

export function checkCpp(tree: Tree, lang: Dialect = 'cpp'): CompileError | null {
  dialect = lang;
  const syntax = syntaxError(tree);
  if (syntax) return syntax;
  try {
    checkSubset(tree);
    return null;
  } catch (e) {
    if (e instanceof CompileError) return e;
    throw e;
  }
}

/** Does the program read input (cin or getline)? */
export function cppReadsInput(tree: Tree): boolean {
  return /\b(std::)?cin\b|\bscanf\s*\(/.test(tree.rootNode.text);
}

export function runCpp(tree: Tree, opts: RunOptions & { input?: string; dialect?: Dialect }): RawRunResult {
  const problem = checkCpp(tree, opts.dialect ?? 'cpp');
  if (problem) return { status: 'syntax-error', steps: [], error: { line: problem.line, message: problem.message } };
  const program = checkSubset(tree);
  const plan = planLists(program);
  const interp = new Interp(program, plan, opts);
  const rt = interp.rt;
  let status: RawRunResult['status'] = 'ok';
  let error: RawRunResult['error'] = null;
  opts.beforeRun?.();
  try {
    try {
      interp.run();
    } catch (e) {
      rt.hooks.thrown(e);
      throw e;
    }
  } catch (e) {
    if (e instanceof CompileError) return { status: 'syntax-error', steps: [], error: { line: e.line, message: e.message } };
    if (e instanceof StopRun || (e instanceof RangeError && /call stack/i.test(e.message))) status = 'cap';
    else if (e instanceof CppCrash) {
      status = 'runtime-error';
      const by = e.thrown?.byProgram ? e.thrown : null;
      error = recordCrash(
        rt,
        e.kind,
        e.message,
        by ? (by.value.t === 'exception' ? { errorType: by.tag, ...(by.tag !== 'exception' ? { errorMessage: e.message } : {}) } : { errorMessage: e.message }) : undefined,
      );
    } else throw e;
  }
  return finishRun(rt, plan, status, error);
}
