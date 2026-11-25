// Java interpreter for StepViz. A tree-walking interpreter over the tree-sitter
// Java syntax tree for a beginner subset. It never compiles or runs real Java:
// it carries out each statement itself and reports to the shared step recorder
// (../recorder.ts), so steps, kinds, caps and crash steps follow the same rules
// as Python and JavaScript.
//
// Supported (J1 + J2): public class Main with public static void main(String[]
// args); other static methods (with recursion); int, long, double, boolean,
// char, String and one-dimensional arrays of them, with Java's rules (int wraps
// at 32 bits, whole-number division, / by zero, index out of bounds, text ==
// compares objects); operators, casts, ? :; if/else, while, do/while, for,
// for-each over arrays, break, continue, return; System.out.println, print,
// printf; String.format, length(), charAt(), equals(); Math; Arrays.toString,
// Arrays.sort; Integer.parseInt, Double.parseDouble, String.valueOf;
// Integer.MAX_VALUE/MIN_VALUE; Scanner(System.in) with nextInt, nextDouble,
// next, nextLine, nextBoolean, hasNext, hasNextInt, hasNextLine.
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

type Prim = 'int' | 'long' | 'double' | 'boolean' | 'char' | 'String';
export type JType = Prim | 'null' | 'void' | 'array' | 'Scanner';

/**
 * A Java value with its type. char values hold the character as a string.
 * Arrays: t = 'array', v = the elements, elem = element type.
 * Strings and arrays carry an identity (id), so == compares objects like Java:
 * the same text written in the program is one shared object; text built while
 * the program runs is a new object each time.
 */
export interface JVal {
  t: JType;
  v: number | boolean | string | null | JVal[];
  elem?: Prim;
  id?: string | number;
}

const isJVal = (x: unknown): x is JVal => typeof x === 'object' && x !== null && !Array.isArray(x) && 't' in x && 'v' in x;
const NUMERIC = new Set<JType>(['int', 'long', 'double', 'char']);

let nextId = 1;
const freshId = () => nextId++;

/** Java's Double.toString for the common cases: 2.0, 0.1, 1.0E7, 1.0E-4. */
export function javaDouble(x: number): string {
  if (Number.isNaN(x)) return 'NaN';
  if (!Number.isFinite(x)) return x > 0 ? 'Infinity' : '-Infinity';
  if (Object.is(x, -0)) return '-0.0';
  const abs = Math.abs(x);
  if (abs >= 1e7 || (abs < 1e-3 && abs !== 0)) {
    const [m, e] = x.toExponential().split('e');
    const mantissa = m.includes('.') ? m : `${m}.0`;
    return `${mantissa}E${Number(e)}`;
  }
  return Number.isInteger(x) ? x.toFixed(1) : String(x);
}

const ARRAY_CODE: Record<Prim, string> = { int: 'I', long: 'J', double: 'D', boolean: 'Z', char: 'C', String: 'Ljava.lang.String;' };

/** String.valueOf: how a value prints or joins a string. */
export function javaString(val: JVal): string {
  switch (val.t) {
    case 'double':
      return javaDouble(val.v as number);
    case 'null':
      return 'null';
    case 'String':
      return val.v === null ? 'null' : (val.v as string);
    case 'array': {
      // Printing an array shows its type and an id, like Java ([I@1b6d3586).
      const hash = (0x1b6d3586 + Number(val.id ?? 0) * 0x9e37) >>> 0;
      return `[${ARRAY_CODE[val.elem ?? 'int']}@${hash.toString(16)}`;
    }
    case 'Scanner':
      return 'java.util.Scanner';
    default:
      return String(val.v);
  }
}

/** Arrays.toString: [1, 2, 3]. */
const arrayText = (a: JVal) => `[${(a.v as JVal[]).map(javaString).join(', ')}]`;

/** How a value shows in a frame: "hi" in quotes, 'a' for a char, 2.0 for a double, [1, 2] for an array. */
export function formatJava(x: unknown): string | undefined {
  if (x === undefined) return 'nothing'; // a void method that reached its closing brace
  if (Array.isArray(x)) return `[${x.map((e) => formatJava(e) ?? String(e)).join(', ')}]`;
  if (!isJVal(x)) return undefined;
  if (x.t === 'String') return x.v === null ? 'null' : JSON.stringify(x.v);
  if (x.t === 'char') return `'${x.v}'`;
  if (x.t === 'void') return 'nothing';
  if (x.t === 'array') return formatJava(x.v);
  if (x.t === 'Scanner') return 'Scanner';
  return javaString(x);
}

const int = (n: number): JVal => ({ t: 'int', v: n | 0 });
const dbl = (n: number): JVal => ({ t: 'double', v: n });
const bool = (b: boolean): JVal => ({ t: 'boolean', v: b });
const str = (s: string, id: string | number = freshId()): JVal => ({ t: 'String', v: s, id });
const VOID: JVal = { t: 'void', v: null };
const NULL: JVal = { t: 'null', v: null };

/** Default value of a new array element. */
function zeroOf(t: Prim): JVal {
  if (t === 'double') return dbl(0);
  if (t === 'boolean') return bool(false);
  if (t === 'char') return { t: 'char', v: '\u0000' };
  if (t === 'String') return { t: 'String', v: null };
  if (t === 'long') return { t: 'long', v: 0 };
  return int(0);
}

// --------------------------------------------------------------------------
// Errors

/** A problem found before the program runs: stays on Home, like a syntax error. */
export class CompileError extends Error {
  constructor(
    public line: number,
    message: string,
  ) {
    super(`Line ${line}: ${message}`);
  }
}

/** A Java exception while running (ArithmeticException...): ends with a crash step. */
export class JavaException extends Error {
  constructor(
    public javaType: string,
    message: string,
  ) {
    super(message);
    this.name = javaType;
  }
}

class ReturnSignal {
  constructor(public value: JVal) {}
}
class BreakSignal {}
class ContinueSignal {}

const lineOf = (n: Node) => n.startPosition.row + 1;
const unsupported = (n: Node, feature: string) => new CompileError(lineOf(n), `StepViz can't run ${feature} in Java yet.`);
const named = (n: Node | null | undefined): Node[] =>
  (n?.namedChildren ?? []).filter((c): c is Node => !!c && !/comment/.test(c.type));

// --------------------------------------------------------------------------
// Syntax and subset checks (before running)

const FRIENDLY_MISSING: Record<string, string> = {
  ';': 'A semicolon (;) is missing at the end of this line.',
  ')': 'A closing bracket ) is missing.',
  '(': 'An opening bracket ( is missing.',
  '}': 'A closing brace } is missing.',
  '{': 'An opening brace { is missing.',
};

/** The first syntax problem in the tree, as a friendly message. */
export function syntaxError(tree: Tree): CompileError | null {
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
  if (!node) return new CompileError(1, 'Java could not understand this program.');
  if (node.isMissing) return new CompileError(lineOf(node), FRIENDLY_MISSING[node.type] ?? 'Java could not understand this line.');
  return new CompileError(lineOf(node), 'Java could not understand this line.');
}

/** Names of features StepViz cannot run yet, by syntax node type. */
const FEATURES: Record<string, string> = {
  package_declaration: 'packages',
  interface_declaration: 'interfaces',
  enum_declaration: 'enums',
  record_declaration: 'records',
  field_declaration: 'variables outside methods',
  constructor_declaration: 'constructors',
  switch_expression: 'switch',
  switch_statement: 'switch',
  try_statement: 'try/catch',
  try_with_resources_statement: 'try/catch',
  throw_statement: 'throw',
  lambda_expression: 'lambdas',
  method_reference: 'method references',
  generic_type: 'generics',
  this: 'this',
  super: 'super',
  instanceof_expression: 'instanceof',
  labeled_statement: 'labels',
  synchronized_statement: 'synchronized',
  assert_statement: 'assert',
  yield_statement: 'yield',
  local_class_declaration: 'classes inside methods',
  class_declaration: 'classes other than Main',
};

const IMPORTS = new Set(['java.util.Scanner', 'java.util.Arrays', 'java.util.*']);
const ALLOWED_TYPES = new Set(['int', 'long', 'double', 'float', 'boolean', 'char', 'short', 'byte', 'String', 'void', 'Scanner']);

function checkSubset(tree: Tree): { main: Node; methods: Map<string, Node> } {
  const root = tree.rootNode;
  const top = named(root);
  for (const n of top) {
    if (n.type === 'import_declaration') {
      const what = n.text.replace(/^import\s+/, '').replace(/\s*;\s*$/, '').replace(/\s+/g, '');
      if (!IMPORTS.has(what)) throw unsupported(n, `the import ${what}`);
      continue;
    }
    if (n.type !== 'class_declaration') throw unsupported(n, FEATURES[n.type] ?? n.type.replace(/_/g, ' '));
  }
  const classes = top.filter((n) => n.type === 'class_declaration');
  const NEED_MAIN = 'StepViz needs a public class Main with a main method.';
  const mainClass = classes.find((c) => c.childForFieldName('name')?.text === 'Main');
  if (!mainClass) throw new CompileError(classes[0] ? lineOf(classes[0]) : 1, NEED_MAIN);
  const other = classes.find((c) => c !== mainClass);
  if (other) throw unsupported(other, 'classes other than Main');

  const methods = new Map<string, Node>();
  for (const member of named(mainClass.childForFieldName('body'))) {
    if (member.type !== 'method_declaration') throw unsupported(member, FEATURES[member.type] ?? member.type.replace(/_/g, ' '));
    const modifiers = member.namedChildren.find((c) => c?.type === 'modifiers')?.text ?? '';
    if (!/\bstatic\b/.test(modifiers)) throw unsupported(member, 'methods that are not static');
    const name = member.childForFieldName('name')!.text;
    if (methods.has(name)) throw unsupported(member, 'two methods with the same name');
    methods.set(name, member);
  }
  const main = methods.get('main');
  const params = named(main?.childForFieldName('parameters'));
  const okMain =
    main &&
    main.childForFieldName('type')?.text === 'void' &&
    params.length === 1 &&
    /^String\s*\[\s*\]$|^String\.\.\.$/.test(params[0].childForFieldName('type')?.text ?? '');
  if (!main || !okMain) throw new CompileError(main ? lineOf(main) : lineOf(mainClass), NEED_MAIN);

  // Everything inside the methods must be in the supported subset.
  for (const m of methods.values()) {
    const visit = (n: Node) => {
      const feature = FEATURES[n.type];
      if (feature) throw unsupported(n, feature);
      if (n.type === 'type_identifier' && !ALLOWED_TYPES.has(n.text)) throw unsupported(n, `the type ${n.text}`);
      if (n.type === 'array_type' && n.childForFieldName('element')?.type === 'array_type') throw unsupported(n, 'arrays of arrays');
      if (n.type === 'array_type' && /\]\s*\[/.test(n.text)) throw unsupported(n, 'arrays of arrays');
      if (n.type === 'array_creation_expression' && n.childrenForFieldName('dimensions').length > 1) throw unsupported(n, 'arrays of arrays');
      if (n.type === 'object_creation_expression' && !/^new\s+Scanner\s*\(\s*System\.in\s*\)$/.test(n.text)) {
        throw unsupported(n, 'new objects');
      }
      for (const c of named(n)) visit(c);
    };
    visit(m.childForFieldName('body')!);
    if (m !== main) for (const p of named(m.childForFieldName('parameters'))) visit(p);
    const rt = m.childForFieldName('type');
    if (rt) visit(rt);
  }
  return { main, methods };
}

/** A compile-time constant: only literals and operators on them. */
function isConstant(n: Node): boolean {
  if (/literal$/.test(n.type) || n.type === 'true' || n.type === 'false') return n.type !== 'null_literal';
  if (n.type === 'parenthesized_expression') return isConstant(named(n)[0]);
  if (n.type === 'binary_expression') return isConstant(n.childForFieldName('left')!) && isConstant(n.childForFieldName('right')!);
  return false;
}

// --------------------------------------------------------------------------
// The loops-and-lists view: arrays changed inside a loop, the positions each
// statement reads, and swaps through a temp variable.

const LOOP_TYPES = new Set(['for_statement', 'enhanced_for_statement', 'while_statement', 'do_statement']);

/** a[...] -> "a" */
const arrayBase = (n: Node | null): string | null =>
  n?.type === 'array_access' && n.childForFieldName('array')?.type === 'identifier' ? n.childForFieldName('array')!.text : null;

function safeIndex(n: Node): boolean {
  if (n.type === 'identifier' || n.type === 'decimal_integer_literal') return true;
  if (n.type === 'parenthesized_expression') return safeIndex(named(n)[0]);
  if (n.type === 'binary_expression') {
    const op = n.childForFieldName('operator')!.type;
    return ['+', '-', '*', '/', '%'].includes(op) && safeIndex(n.childForFieldName('left')!) && safeIndex(n.childForFieldName('right')!);
  }
  return false;
}

function loopVarOf(loop: Node): string | null {
  if (loop.type === 'enhanced_for_statement') return loop.childForFieldName('name')?.text ?? null;
  if (loop.type === 'for_statement') {
    const init = loop.childrenForFieldName('init')[0];
    if (init?.type === 'local_variable_declaration') {
      const ds = init.childrenForFieldName('declarator');
      if (ds.length === 1) return ds[0]!.childForFieldName('name')!.text;
    }
  }
  return null;
}

function planLists(methods: Map<string, Node>): ListPlan {
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
        const base = arrayBase(n.childForFieldName('left'));
        if (base) note(base, loops);
      }
      if (n.type === 'update_expression') {
        const base = arrayBase(named(n)[0]);
        if (base) note(base, loops);
      }
      if (n.type === 'method_invocation' && n.childForFieldName('object')?.text === 'Arrays' && n.childForFieldName('name')?.text === 'sort') {
        const arg = named(n.childForFieldName('arguments'))[0];
        if (arg?.type === 'identifier') note(arg.text, loops);
      }
    }
    // (tree-sitter hands out a new wrapper per lookup: compare node ids, not objects)
    const bodyId = LOOP_TYPES.has(n.type) ? n.childForFieldName('body')?.id : undefined;
    for (const c of named(n)) visit(c, bodyId !== undefined && c.id === bodyId ? [...loops, n] : loops);
  };
  for (const m of methods.values()) visit(m.childForFieldName('body')!, []);
  return { candidates, loopOf };
}

/** int temp = a[x]; a[x] = a[y]; a[y] = temp;  ->  [a, x, y] (index nodes) */
function tempSwap(stmts: Node[], i: number): [string, Node, Node] | null {
  const [s1, s2, s3] = stmts.slice(i, i + 3);
  if (!s1 || !s2 || !s3 || s2.type !== 'expression_statement' || s3.type !== 'expression_statement') return null;
  let temp: string | null = null;
  let first: Node | null = null;
  if (s1.type === 'local_variable_declaration') {
    const ds = s1.childrenForFieldName('declarator');
    if (ds.length !== 1) return null;
    temp = ds[0]!.childForFieldName('name')!.text;
    first = ds[0]!.childForFieldName('value');
  } else if (s1.type === 'expression_statement' && named(s1)[0]?.type === 'assignment_expression') {
    const a = named(s1)[0];
    if (a.childForFieldName('operator')?.type !== '=' || a.childForFieldName('left')?.type !== 'identifier') return null;
    temp = a.childForFieldName('left')!.text;
    first = a.childForFieldName('right');
  }
  const a2 = named(s2)[0];
  const a3 = named(s3)[0];
  if (!temp || !first || a2?.type !== 'assignment_expression' || a3?.type !== 'assignment_expression') return null;
  const base = arrayBase(first);
  const l2 = a2.childForFieldName('left')!;
  const r2 = a2.childForFieldName('right')!;
  const l3 = a3.childForFieldName('left')!;
  const r3 = a3.childForFieldName('right')!;
  if (!base || arrayBase(l2) !== base || arrayBase(r2) !== base || arrayBase(l3) !== base || r3.text !== temp) return null;
  const x = first.childForFieldName('index')!;
  const y = r2.childForFieldName('index')!;
  if (l2.text !== first.text || l3.childForFieldName('index')!.text !== y.text || !safeIndex(x) || !safeIndex(y)) return null;
  return [base, x, y];
}

// --------------------------------------------------------------------------
// The interpreter

const UNSET = Symbol('unset');
interface Cell {
  t: JType;
  elem?: Prim;
  v: JVal | typeof UNSET;
}

/** One block's variables. Names declared later in the block exist from the start (shown as "?"). */
class Scope {
  vars = new Map<string, Cell>();
  constructor(public parent: Scope | null) {}
  lookup(name: string): Cell | undefined {
    return this.vars.get(name) ?? this.parent?.lookup(name);
  }
  names(): string[] {
    const out = this.parent ? this.parent.names() : [];
    for (const n of this.vars.keys()) if (!out.includes(n)) out.push(n);
    return out;
  }
}

interface DeclType {
  t: JType;
  elem?: Prim;
}

function primOf(text: string): Prim {
  if (text === 'float') return 'double';
  if (text === 'short' || text === 'byte') return 'int';
  return text as Prim;
}

/** int, double[], String... (dimensions may also follow the variable name: int a[]). */
function declType(typeNode: Node | null, declarator?: Node | null): DeclType {
  if (!typeNode) return { t: 'void' };
  const extraDims = declarator?.childForFieldName('dimensions');
  if (typeNode.type === 'array_type') return { t: 'array', elem: primOf(typeNode.childForFieldName('element')!.text) };
  if (extraDims) return { t: 'array', elem: primOf(typeNode.text) };
  if (typeNode.text === 'Scanner') return { t: 'Scanner' };
  if (typeNode.text === 'void') return { t: 'void' };
  return { t: primOf(typeNode.text) };
}

/** Declared names directly in a list of statements (for "?" before they are set). */
function declaredIn(stmts: Node[]): { name: string; type: DeclType }[] {
  const out: { name: string; type: DeclType }[] = [];
  for (const s of stmts) {
    if (s.type !== 'local_variable_declaration') continue;
    for (const d of s.childrenForFieldName('declarator')) {
      if (d) out.push({ name: d.childForFieldName('name')!.text, type: declType(s.childForFieldName('type'), d) });
    }
  }
  return out;
}

const statementsOf = (n: Node | null): Node[] => (!n ? [] : n.type === 'block' ? named(n) : [n]);
const rangeOf = (n: Node | null): [number, number] | undefined => {
  const s = statementsOf(n);
  return s.length ? [lineOf(s[0]), s[s.length - 1].endPosition.row + 1] : undefined;
};
const inner = (n: Node | null) => (n?.type === 'parenthesized_expression' ? named(n)[0] : n!);

const SCANNER_READS = new Set(['nextInt', 'nextDouble', 'next', 'nextLine', 'nextBoolean', 'nextLong']);
const isScannerRead = (e: Node | null) =>
  e?.type === 'method_invocation' && SCANNER_READS.has(e.childForFieldName('name')?.text ?? '') && !!e.childForFieldName('object');

/** System.out.printf / String.format for %d %s %f %.2f %c %b %x %n %% and widths. */
function javaFormat(format: string, args: JVal[]): string {
  let k = 0;
  return format.replace(/%([-0+ ,]*)(\d+)?(?:\.(\d+))?([dsfcbxXneE%])/g, (_m, flags: string, width: string, prec: string, conv: string) => {
    if (conv === 'n') return '\n';
    if (conv === '%') return '%';
    const a = args[k++];
    if (!a) throw new JavaException('MissingFormatArgumentException', `Format specifier '%${conv}'`);
    let text: string;
    switch (conv) {
      case 'd':
        if (a.t !== 'int' && a.t !== 'long') throw new JavaException('IllegalFormatConversionException', `d != ${a.t}`);
        text = String(a.v);
        if (flags.includes(',')) text = Number(a.v).toLocaleString('en-US');
        if (flags.includes('+') && Number(a.v) >= 0) text = `+${text}`;
        break;
      case 'f':
      case 'e':
      case 'E': {
        if (a.t !== 'double') throw new JavaException('IllegalFormatConversionException', `${conv} != ${a.t}`);
        const p = prec === undefined ? 6 : Number(prec);
        text = conv === 'f' ? (a.v as number).toFixed(p) : (a.v as number).toExponential(p).replace(/e([+-])(\d)$/, 'e$10$2');
        if (conv === 'E') text = text.toUpperCase();
        if (flags.includes(',')) {
          const [i, f] = text.split('.');
          text = Number(i).toLocaleString('en-US') + (f !== undefined ? `.${f}` : '');
        }
        break;
      }
      case 'c':
        text = a.t === 'char' ? (a.v as string) : String.fromCharCode(Number(a.v));
        break;
      case 'b':
        text = a.t === 'null' ? 'false' : a.t === 'boolean' ? String(a.v) : 'true';
        break;
      case 'x':
      case 'X':
        text = (Number(a.v) >>> 0).toString(16);
        if (conv === 'X') text = text.toUpperCase();
        break;
      default:
        text = javaString(a);
        if (prec !== undefined) text = text.slice(0, Number(prec));
    }
    if (width && text.length < Number(width)) {
      const pad = (flags.includes('0') && !flags.includes('-') ? '0' : ' ').repeat(Number(width) - text.length);
      text = flags.includes('-') ? text + pad : pad[0] === '0' && /^[+-]/.test(text) ? text[0] + pad + text.slice(1) : pad + text;
    }
    return text;
  });
}

class Interp {
  rt: Recorder;
  private nameSets: string[][] = [];
  private nameIds = new Map<string, number>();
  private scope: Scope = new Scope(null);
  private input: Input;

  constructor(
    private methods: Map<string, Node>,
    plan: ListPlan,
    opts: RunOptions & { input?: string },
  ) {
    this.input = new Input(opts.input ?? '', (message) => new JavaException('NoSuchElementException', message));
    this.rt = new Recorder(this.nameSets, plan, { ...opts, rootLabel: 'main()', format: formatJava });
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

  /** Readers for the frame: arrays are handed over as their elements, for the list view. */
  private getters(names: string[]): Getter[] {
    const scope = this.scope;
    return names.map((n) => () => {
      const cell = scope.lookup(n);
      if (!cell || cell.v === UNSET) throw new Error('unset');
      return cell.v.t === 'array' ? cell.v.v : cell.v;
    });
  }

  /** Readers for the array positions a statement looks at (for highlighting). */
  private readsOf(parts: (Node | null)[]): Reads {
    const out: [string, Getter][] = [];
    const seen = new Set<string>();
    const scope = this.scope;
    const visit = (n: Node) => {
      const base = arrayBase(n);
      const index = n.childForFieldName?.('index');
      if (base && index && safeIndex(index) && !seen.has(n.text)) {
        seen.add(n.text);
        out.push([base, () => this.indexValue(index, scope)]);
      }
      for (const c of named(n)) if (c.type !== 'method_invocation' || c.childForFieldName('object')?.text !== 'System.out') visit(c);
    };
    for (const p of parts) if (p) visit(p);
    return out.length ? out : null;
  }

  /** Evaluates a side-effect-free index (names, numbers, arithmetic) in a saved scope. */
  private indexValue(n: Node, scope: Scope): number {
    const saved = this.scope;
    this.scope = scope;
    try {
      return this.num(this.eval(n));
    } finally {
      this.scope = saved;
    }
  }

  /** Report a statement to the recorder, before it runs. */
  private hook(line: number, info: StepInfo, reads: Reads = null, swap: Swap = null) {
    const names = this.scope.names();
    this.rt.hooks.l(line, this.namesId(names), this.getters(names), reads, swap, info);
  }

  // ---- program ----------------------------------------------------------------

  runMain(main: Node) {
    this.scope = new Scope(null);
    this.execBody(main.childForFieldName('body')!);
    this.rt.finish();
  }

  private execBody(block: Node) {
    const saved = this.scope;
    this.scope = new Scope(saved);
    const stmts = statementsOf(block);
    for (const d of declaredIn(stmts)) this.scope.vars.set(d.name, { ...d.type, v: UNSET });
    try {
      for (let i = 0; i < stmts.length; i++) this.exec(stmts[i], tempSwap(stmts, i));
    } finally {
      this.scope = saved;
    }
  }

  // ---- statements ---------------------------------------------------------------

  private targetName(n: Node): string {
    return arrayBase(n) ?? n.text;
  }

  private infoOf(s: Node): StepInfo {
    switch (s.type) {
      case 'local_variable_declaration': {
        const ds = s.childrenForFieldName('declarator');
        const t = ds.map((d) => d!.childForFieldName('name')!.text);
        const reads = ds.some((d) => isScannerRead(d!.childForFieldName('value')));
        return { k: reads ? 'input' : 'assign', t };
      }
      case 'expression_statement': {
        const e = named(s)[0];
        if (e.type === 'assignment_expression') {
          const t = [this.targetName(e.childForFieldName('left')!)];
          return { k: isScannerRead(e.childForFieldName('right')) ? 'input' : 'assign', t };
        }
        if (e.type === 'update_expression') return { k: 'assign', t: [this.targetName(named(e)[0])] };
        if (e.type === 'method_invocation') {
          const object = e.childForFieldName('object')?.text;
          const name = e.childForFieldName('name')?.text;
          if (object === 'System.out') return { k: 'print' };
          if (object === 'Arrays' && name === 'sort') {
            const arg = named(e.childForFieldName('arguments'))[0];
            if (arg) return { k: 'assign', t: [arg.text] };
          }
        }
        return { k: 'other' };
      }
      case 'if_statement': {
        const info: StepInfo = { k: 'branch', c: inner(s.childForFieldName('condition')).text };
        const b = rangeOf(s.childForFieldName('consequence'));
        const e = rangeOf(s.childForFieldName('alternative'));
        if (b) info.b = b;
        if (e) info.e = e;
        return info;
      }
      default:
        return { k: 'other' };
    }
  }

  /** The parts of a statement evaluated before its body (for array reads). */
  private headOf(s: Node): (Node | null)[] {
    if (s.type === 'if_statement') return [s.childForFieldName('condition')];
    if (s.type === 'block') return [];
    return [s];
  }

  private exec(s: Node, swap: [string, Node, Node] | null = null) {
    switch (s.type) {
      case 'block':
        this.execBody(s);
        return;
      case 'while_statement':
      case 'do_statement':
      case 'for_statement':
      case 'enhanced_for_statement':
        this.execLoop(s);
        return;
      case ';':
        return;
    }
    const swapInfo: Swap = swap
      ? (() => {
          const scope = this.scope;
          return [swap[0], () => this.indexValue(swap[1], scope), () => this.indexValue(swap[2], scope)];
        })()
      : null;
    this.hook(lineOf(s), swapInfo ? { k: 'swap' } : this.infoOf(s), this.readsOf(this.headOf(s)), swapInfo);
    switch (s.type) {
      case 'local_variable_declaration':
        this.declare(s);
        return;
      case 'expression_statement':
        this.eval(named(s)[0]);
        return;
      case 'if_statement': {
        const cond = this.condition(s.childForFieldName('condition')!);
        const branch = cond ? s.childForFieldName('consequence') : s.childForFieldName('alternative');
        if (branch) this.execNested(branch);
        return;
      }
      case 'return_statement': {
        const e = named(s)[0];
        const value = e ? this.eval(e) : VOID;
        this.rt.hooks.ret(lineOf(s), value.t === 'array' ? (value.v as JVal[]) : value);
        throw new ReturnSignal(value);
      }
      case 'break_statement':
        if (named(s).length) throw unsupported(s, 'labels');
        throw new BreakSignal();
      case 'continue_statement':
        if (named(s).length) throw unsupported(s, 'labels');
        throw new ContinueSignal();
      default:
        throw unsupported(s, s.type.replace(/_/g, ' '));
    }
  }

  /** A statement inside if/else or a loop: blocks get their own scope. */
  private execNested(n: Node) {
    if (n.type === 'block') this.execBody(n);
    else {
      const saved = this.scope;
      this.scope = new Scope(saved);
      for (const d of declaredIn([n])) this.scope.vars.set(d.name, { ...d.type, v: UNSET });
      try {
        this.exec(n);
      } finally {
        this.scope = saved;
      }
    }
  }

  private declare(s: Node) {
    for (const d of s.childrenForFieldName('declarator')) {
      const type = declType(s.childForFieldName('type'), d);
      const name = d!.childForFieldName('name')!.text;
      const valueNode = d!.childForFieldName('value');
      let cell = this.scope.vars.get(name);
      if (!cell) {
        cell = { ...type, v: UNSET };
        this.scope.vars.set(name, cell);
      }
      if (valueNode) {
        const value = valueNode.type === 'array_initializer' ? this.arrayFrom(valueNode, type.elem ?? 'int') : this.eval(valueNode);
        cell.v = this.coerce(value, type, d!, name);
      }
    }
  }

  private condition(n: Node): boolean {
    const v = this.eval(inner(n));
    if (v.t !== 'boolean') throw new CompileError(lineOf(n), 'A condition must be true or false.');
    return v.v as boolean;
  }

  private execLoop(s: Node) {
    const line = lineOf(s);
    const info: StepInfo = { k: 'loop' };
    const body = s.childForFieldName('body')!;
    const b = rangeOf(body);
    if (b) info.b = b;
    const condNode = s.childForFieldName('condition');
    if (condNode) info.c = inner(condNode).text;
    const v = loopVarOf(s);
    if (v) info.v = v;
    const head = s.type === 'enhanced_for_statement' ? [s.childForFieldName('value')] : [condNode];

    const outer = this.scope;
    this.scope = new Scope(outer); // the loop's own scope (for (int i = ...))
    try {
      let items: JVal[] | null = null;
      let itemCell: Cell | null = null;
      if (s.type === 'for_statement') {
        for (const init of s.childrenForFieldName('init')) {
          if (!init) continue;
          if (init.type === 'local_variable_declaration') {
            for (const d of declaredIn([init])) this.scope.vars.set(d.name, { ...d.type, v: UNSET });
            this.declare(init);
          } else this.eval(init);
        }
      }
      if (s.type === 'enhanced_for_statement') {
        const array = this.eval(s.childForFieldName('value')!);
        if (array.t !== 'array') throw unsupported(s, 'for-each loops over this value');
        items = array.v as JVal[];
        const type = declType(s.childForFieldName('type'));
        itemCell = { ...type, v: UNSET };
        this.scope.vars.set(s.childForFieldName('name')!.text, itemCell);
      }
      let first = true;
      let k = 0;
      for (;;) {
        if (items) {
          if (k >= items.length) break;
          itemCell!.v = this.coerce(items[k++], { t: itemCell!.t, elem: itemCell!.elem }, s, s.childForFieldName('name')!.text);
        } else if (s.type !== 'do_statement' || !first) {
          if (condNode && !this.condition(condNode)) break;
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
        if (s.type === 'for_statement') for (const u of s.childrenForFieldName('update')) if (u) this.eval(u);
        if (s.type === 'do_statement' && !this.condition(condNode!)) break;
      }
    } finally {
      this.scope = outer;
    }
    // loop-end, in the scope around the loop
    const names = this.scope.names();
    this.rt.hooks.x(line, this.namesId(names), this.getters(names), info);
  }

  // ---- methods ------------------------------------------------------------------

  private call(node: Node, name: string, args: JVal[]): JVal {
    const m = this.methods.get(name);
    if (!m || name === 'main') throw unsupported(node, `the method ${name}`);
    const params = named(m.childForFieldName('parameters')).filter((p) => p.type === 'formal_parameter');
    if (params.length !== args.length) {
      throw new CompileError(lineOf(node), `${name} needs ${params.length} value${params.length === 1 ? '' : 's'}, not ${args.length}.`);
    }
    const saved = this.scope;
    const scope = new Scope(null);
    const names: string[] = [];
    params.forEach((p, i) => {
      const type = declType(p.childForFieldName('type'), p);
      const pname = p.childForFieldName('name')!.text;
      scope.vars.set(pname, { ...type, v: this.coerce(args[i], type, node, pname) });
      names.push(pname);
    });
    const returnType = declType(m.childForFieldName('type'), m);
    this.scope = scope;
    this.rt.hooks.enter(name, this.namesId(names), this.getters(names));
    try {
      this.execBody(m.childForFieldName('body')!);
      if (returnType.t !== 'void') throw new CompileError(lineOf(m), `${name} must return a value.`);
      return VOID;
    } catch (e) {
      if (e instanceof ReturnSignal) return returnType.t === 'void' ? VOID : this.coerce(e.value, returnType, node, name);
      this.rt.hooks.thrown(e);
      throw e;
    } finally {
      this.scope = scope;
      this.rt.hooks.leave();
      this.scope = saved;
    }
  }

  // ---- expressions ----------------------------------------------------------------

  /** Assign rules: widening is fine; narrowing needs a cast. */
  private coerce(v: JVal, to: DeclType, at: Node, name: string): JVal {
    const t = to.t;
    const cantHold = () =>
      new CompileError(lineOf(at), `${name} is ${t === 'int' || t === 'array' ? 'an' : 'a'} ${t === 'array' ? `${to.elem} array` : t} box, so it can't hold ${formatJava(v)}.`);
    if (t === 'array') {
      if (v.t === 'null') return { t: 'array', v: null as unknown as JVal[], elem: to.elem };
      if (v.t !== 'array' || v.elem !== to.elem) throw cantHold();
      return v;
    }
    if (v.t === t) return v;
    if (t === 'double' && NUMERIC.has(v.t)) return dbl(this.num(v));
    if (t === 'long' && (v.t === 'int' || v.t === 'char')) return { t: 'long', v: this.num(v) };
    if (t === 'int' && v.t === 'char') return int(this.num(v));
    if (t === 'char' && v.t === 'int' && at.childForFieldName?.('value')?.type === 'decimal_integer_literal') {
      return { t: 'char', v: String.fromCharCode(v.v as number) };
    }
    if (t === 'String' && v.t === 'null') return { t: 'String', v: null };
    if (t === 'Scanner' && v.t === 'Scanner') return v;
    throw cantHold();
  }

  private num(v: JVal): number {
    return v.t === 'char' ? (v.v as string).charCodeAt(0) : (v.v as number);
  }

  /** Binary numeric promotion: double > long > int. */
  private arith(op: string, a: JVal, b: JVal, at: Node): JVal {
    const x = this.num(a);
    const y = this.num(b);
    if (a.t === 'double' || b.t === 'double') {
      switch (op) {
        case '+': return dbl(x + y);
        case '-': return dbl(x - y);
        case '*': return dbl(x * y);
        case '/': return dbl(x / y);
        case '%': return dbl(x % y);
      }
    }
    const isLong = a.t === 'long' || b.t === 'long';
    const wrap = (n: number): JVal => (isLong ? { t: 'long', v: Math.trunc(n) } : int(n));
    if ((op === '/' || op === '%') && y === 0) throw new JavaException('ArithmeticException', '/ by zero');
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
      case '>>>': return wrap(x >>> y);
    }
    throw unsupported(at, `the operator ${op}`);
  }

  private binary(n: Node): JVal {
    const op = n.childForFieldName('operator')!.type;
    if (op === '&&' || op === '||') {
      const left = this.eval(n.childForFieldName('left')!);
      if (left.t !== 'boolean') throw new CompileError(lineOf(n), `${op} needs true or false on both sides.`);
      if (op === '&&' && !left.v) return bool(false);
      if (op === '||' && left.v) return bool(true);
      const right = this.eval(n.childForFieldName('right')!);
      if (right.t !== 'boolean') throw new CompileError(lineOf(n), `${op} needs true or false on both sides.`);
      return right;
    }
    const a = this.eval(n.childForFieldName('left')!);
    const b = this.eval(n.childForFieldName('right')!);
    if (op === '+' && (a.t === 'String' || b.t === 'String')) {
      // Only text joined from values written in the program ("h" + "i") is one shared
      // constant; text built from variables is a new object each time, as in Java.
      const text = javaString(a) + javaString(b);
      return str(text, isConstant(n) ? `L:${text}` : freshId());
    }
    if (op === '==' || op === '!=') {
      let same: boolean;
      if (NUMERIC.has(a.t) && NUMERIC.has(b.t)) same = this.num(a) === this.num(b);
      else if (a.t === 'boolean' && b.t === 'boolean') same = a.v === b.v;
      else if (a.v === null || b.v === null) same = a.v === b.v;
      // Text and arrays: == asks "the same object?", like Java (use .equals() for the letters).
      else same = a.id !== undefined && a.id === b.id;
      return bool(op === '==' ? same : !same);
    }
    if (['<', '<=', '>', '>='].includes(op)) {
      if (!NUMERIC.has(a.t) || !NUMERIC.has(b.t)) throw new CompileError(lineOf(n), `${op} only works on numbers.`);
      const x = this.num(a);
      const y = this.num(b);
      return bool(op === '<' ? x < y : op === '<=' ? x <= y : op === '>' ? x > y : x >= y);
    }
    if ((op === '&' || op === '|' || op === '^') && a.t === 'boolean' && b.t === 'boolean') {
      return bool(op === '&' ? !!(a.v && b.v) : op === '|' ? !!(a.v || b.v) : a.v !== b.v);
    }
    if (!NUMERIC.has(a.t) || !NUMERIC.has(b.t)) throw new CompileError(lineOf(n), `${op} only works on numbers.`);
    return this.arith(op, a, b, n);
  }

  /** The array and position for a[i], with Java's bounds check. */
  private element(n: Node): { array: JVal[]; index: number; elem: Prim } {
    const arr = this.eval(n.childForFieldName('array')!);
    if (arr.t !== 'array') throw new CompileError(lineOf(n), `${n.childForFieldName('array')!.text} is not an array.`);
    if (arr.v === null) throw new JavaException('NullPointerException', 'Cannot load from array because it is null');
    const index = this.eval(n.childForFieldName('index')!);
    if (index.t !== 'int' && index.t !== 'char' && index.t !== 'long') throw new CompileError(lineOf(n), 'An array position must be a whole number.');
    const i = this.num(index);
    const items = arr.v as JVal[];
    if (i < 0 || i >= items.length) {
      throw new JavaException('ArrayIndexOutOfBoundsException', `Index ${i} out of bounds for length ${items.length}`);
    }
    return { array: items, index: i, elem: arr.elem ?? 'int' };
  }

  private assignTo(target: Node, value: JVal): JVal {
    if (target.type === 'array_access') {
      const { array, index, elem } = this.element(target);
      array[index] = this.coerce(value, { t: elem }, target, target.text);
      return array[index];
    }
    if (target.type !== 'identifier') throw unsupported(target, 'this kind of assignment');
    const cell = this.scope.lookup(target.text);
    if (!cell) throw new CompileError(lineOf(target), `${target.text} is used but never declared.`);
    cell.v = this.coerce(value, cell, target, target.text);
    return cell.v;
  }

  private read(id: Node): JVal {
    const cell = this.scope.lookup(id.text);
    if (!cell) throw new CompileError(lineOf(id), `${id.text} is used but never declared.`);
    if (cell.v === UNSET) throw new CompileError(lineOf(id), `${id.text} is used before it was given a value.`);
    return cell.v;
  }

  private readTarget(n: Node): JVal {
    if (n.type === 'array_access') {
      const { array, index } = this.element(n);
      return array[index];
    }
    return this.read(n);
  }

  private castTo(t: JType, v: JVal, at: Node): JVal {
    if (!NUMERIC.has(v.t) && t !== v.t) throw unsupported(at, 'this cast');
    if (t === 'int') return int(Math.trunc(this.num(v)));
    if (t === 'long') return { t: 'long', v: Math.trunc(this.num(v)) };
    if (t === 'double') return dbl(this.num(v));
    if (t === 'char') return { t: 'char', v: String.fromCharCode(this.num(v) & 0xffff) };
    if (t === v.t) return v;
    throw unsupported(at, 'this cast');
  }

  private arrayFrom(init: Node, elem: Prim): JVal {
    const items = named(init).map((e) => this.coerce(this.eval(e), { t: elem }, e, 'this array'));
    return { t: 'array', v: items, elem, id: freshId() };
  }

  eval(n: Node): JVal {
    switch (n.type) {
      case 'decimal_integer_literal':
      case 'hex_integer_literal':
      case 'binary_integer_literal':
      case 'octal_integer_literal': {
        const text = n.text.replace(/_/g, '');
        const isLong = /[lL]$/.test(text);
        const digits = text.replace(/[lL]$/, '');
        const value =
          n.type === 'hex_integer_literal' ? parseInt(digits.slice(2), 16)
          : n.type === 'binary_integer_literal' ? parseInt(digits.slice(2), 2)
          : n.type === 'octal_integer_literal' ? parseInt(digits, 8)
          : Number(digits);
        return isLong ? { t: 'long', v: value } : int(value);
      }
      case 'decimal_floating_point_literal':
        return dbl(parseFloat(n.text.replace(/_/g, '').replace(/[dDfF]$/, '')));
      case 'string_literal': {
        const text = JSON.parse(`"${n.text.slice(1, -1).replace(/\\'/g, "'")}"`) as string;
        return str(text, `L:${text}`); // the same text in the program is one shared object
      }
      case 'character_literal': {
        const body = n.text.slice(1, -1);
        const ch = body.startsWith('\\') ? JSON.parse(`"${body === "\\'" ? "'" : body}"`) : body;
        return { t: 'char', v: ch };
      }
      case 'true':
        return bool(true);
      case 'false':
        return bool(false);
      case 'null_literal':
        return NULL;
      case 'identifier':
        return this.read(n);
      case 'parenthesized_expression':
        return this.eval(named(n)[0]);
      case 'binary_expression':
        return this.binary(n);
      case 'unary_expression': {
        const op = n.childForFieldName('operator')!.type;
        const v = this.eval(n.childForFieldName('operand')!);
        if (op === '!') {
          if (v.t !== 'boolean') throw new CompileError(lineOf(n), '! needs true or false.');
          return bool(!v.v);
        }
        if (!NUMERIC.has(v.t)) throw new CompileError(lineOf(n), `${op} only works on numbers.`);
        const x = this.num(v);
        const t = v.t === 'char' ? 'int' : v.t;
        if (op === '-') return t === 'double' ? dbl(-x) : t === 'long' ? { t: 'long', v: -x } : int(-x);
        if (op === '+') return t === 'double' ? dbl(x) : { t, v: x };
        if (op === '~') return t === 'long' ? { t: 'long', v: ~x } : int(~x);
        throw unsupported(n, `the operator ${op}`);
      }
      case 'update_expression': {
        const target = named(n)[0];
        const prefix = n.child(0)?.type === '++' || n.child(0)?.type === '--';
        const op = (prefix ? n.child(0) : n.child(1))!.type;
        const before = this.readTarget(target);
        if (!NUMERIC.has(before.t)) throw new CompileError(lineOf(n), `${op} only works on numbers.`);
        // x++ keeps x's type (a char stays a char, an int wraps at 32 bits).
        const after = this.castTo(before.t, this.arith(op === '++' ? '+' : '-', before, int(1), n), n);
        const stored = this.assignTo(target, after);
        return prefix ? stored : before;
      }
      case 'assignment_expression': {
        const op = n.childForFieldName('operator')!.type;
        const left = n.childForFieldName('left')!;
        const rightNode = n.childForFieldName('right')!;
        if (op === '=') {
          const cell = left.type === 'identifier' ? this.scope.lookup(left.text) : undefined;
          const right = rightNode.type === 'array_initializer' ? this.arrayFrom(rightNode, cell?.elem ?? 'int') : this.eval(rightNode);
          return this.assignTo(left, right);
        }
        const current = this.readTarget(left);
        const right = this.eval(rightNode);
        const bin = op.slice(0, -1);
        const result =
          bin === '+' && current.t === 'String' ? str(javaString(current) + javaString(right)) : this.arith(bin, current, right, n);
        // Compound assignment casts back to the variable's type (total += 1.5 into an int).
        return this.assignTo(left, result.t === current.t || current.t === 'String' ? result : this.castTo(current.t, result, n));
      }
      case 'ternary_expression': {
        const c = this.eval(n.childForFieldName('condition')!);
        if (c.t !== 'boolean') throw new CompileError(lineOf(n), 'A condition must be true or false.');
        return this.eval(n.childForFieldName(c.v ? 'consequence' : 'alternative')!);
      }
      case 'cast_expression':
        return this.castTo(declType(n.childForFieldName('type')).t, this.eval(n.childForFieldName('value')!), n);
      case 'array_access': {
        const { array, index } = this.element(n);
        return array[index];
      }
      case 'array_creation_expression': {
        const elem = primOf(n.childForFieldName('type')!.text);
        const init = n.childForFieldName('value');
        if (init) return this.arrayFrom(init, elem);
        const sizeNode = named(n.childrenForFieldName('dimensions')[0])[0];
        const size = this.eval(sizeNode);
        if (size.t !== 'int') throw new CompileError(lineOf(n), 'An array size must be a whole number.');
        if ((size.v as number) < 0) throw new JavaException('NegativeArraySizeException', String(size.v));
        return { t: 'array', v: Array.from({ length: size.v as number }, () => zeroOf(elem)), elem, id: freshId() };
      }
      case 'field_access': {
        const object = n.childForFieldName('object')!;
        const field = n.childForFieldName('field')!.text;
        if (object.text === 'Integer' && (field === 'MAX_VALUE' || field === 'MIN_VALUE')) return int(field === 'MAX_VALUE' ? 2147483647 : -2147483648);
        if (field === 'length') {
          const arr = this.eval(object);
          if (arr.t === 'array') {
            if (arr.v === null) throw new JavaException('NullPointerException', 'Cannot read the array length because it is null');
            return int((arr.v as JVal[]).length);
          }
        }
        throw unsupported(n, `the field ${n.text}`);
      }
      case 'object_creation_expression':
        return { t: 'Scanner', v: null, id: freshId() };
      case 'method_invocation':
        return this.invoke(n);
      default:
        throw unsupported(n, n.type.replace(/_/g, ' '));
    }
  }

  private invoke(n: Node): JVal {
    const object = n.childForFieldName('object');
    const name = n.childForFieldName('name')!.text;
    const argNodes = named(n.childForFieldName('arguments'));
    const args = () => argNodes.map((a) => this.eval(a));

    if (object?.text === 'System.out') {
      if (name === 'println' || name === 'print') {
        const values = args();
        if (values.length > 1) throw new CompileError(lineOf(n), `${name} takes one value.`);
        const v = values[0];
        // println(char[]) prints the letters, like Java.
        const text = !v ? '' : v.t === 'array' && v.elem === 'char' && v.v ? (v.v as JVal[]).map((c) => c.v).join('') : javaString(v);
        this.rt.output += text + (name === 'println' ? '\n' : '');
        return VOID;
      }
      if (name === 'printf' || name === 'format') {
        const [fmt, ...rest] = args();
        if (fmt?.t !== 'String') throw new CompileError(lineOf(n), `${name} needs a text pattern first.`);
        this.rt.output += javaFormat(fmt.v as string, rest);
        return VOID;
      }
      throw unsupported(n, `System.out.${name}`);
    }
    if (object?.text === 'Math') return this.math(n, name, args());
    if (object?.text === 'String' && name === 'format') {
      const [fmt, ...rest] = args();
      if (fmt?.t !== 'String') throw new CompileError(lineOf(n), 'String.format needs a text pattern first.');
      return str(javaFormat(fmt.v as string, rest));
    }
    if (object?.text === 'String' && name === 'valueOf' && argNodes.length === 1) return str(javaString(args()[0]));
    if (object?.text === 'Integer' && name === 'parseInt' && argNodes.length === 1) {
      const s = args()[0];
      if (s.t !== 'String' || s.v === null || !/^[+-]?\d+$/.test(s.v as string) || Math.abs(Number(s.v)) > 2147483648) {
        throw new JavaException('NumberFormatException', `For input string: "${s.v}"`);
      }
      return int(Number(s.v));
    }
    if (object?.text === 'Double' && name === 'parseDouble' && argNodes.length === 1) {
      const s = args()[0];
      const x = s.t === 'String' && s.v !== null ? Number((s.v as string).trim()) : NaN;
      if (Number.isNaN(x)) throw new JavaException('NumberFormatException', `For input string: "${s.v}"`);
      return dbl(x);
    }
    if (object?.text === 'Arrays') {
      const a = args()[0];
      if (!a || a.t !== 'array') throw new CompileError(lineOf(n), `Arrays.${name} needs an array.`);
      if (name === 'toString') return str(a.v === null ? 'null' : arrayText(a));
      if (name === 'sort') {
        const items = a.v as JVal[];
        items.sort((x, y) => (x.t === 'String' ? String(x.v).localeCompare(String(y.v)) : this.num(x) - this.num(y)));
        return VOID;
      }
      throw unsupported(n, `Arrays.${name}`);
    }
    if (!object || object.text === 'Main') return this.call(n, name, args());

    const target = this.eval(object);
    if (target.t === 'Scanner') return this.scan(n, name, argNodes.length);
    if (target.t === 'String') {
      if (target.v === null) throw new JavaException('NullPointerException', `Cannot invoke "String.${name}()" because the value is null`);
      const s = target.v as string;
      const a = args();
      if (name === 'length' && a.length === 0) return int(s.length);
      if (name === 'charAt' && a.length === 1) {
        const i = this.num(a[0]);
        if (i < 0 || i >= s.length) throw new JavaException('StringIndexOutOfBoundsException', `Index ${i} out of bounds for length ${s.length}`);
        return { t: 'char', v: s[i] };
      }
      if (name === 'equals' && a.length === 1) return bool(a[0].t === 'String' && a[0].v === s);
    }
    throw unsupported(n, `the method ${name}`);
  }

  private scan(n: Node, name: string, argCount: number): JVal {
    if (argCount) throw unsupported(n, `Scanner.${name} with values`);
    switch (name) {
      case 'nextInt':
      case 'nextLong': {
        const w = this.input.peekWord();
        if (w === null) throw new JavaException('NoSuchElementException', 'No more input');
        if (!/^[+-]?\d+$/.test(w)) throw new JavaException('InputMismatchException', `For input string: "${w}"`);
        this.input.word();
        return name === 'nextLong' ? { t: 'long', v: Number(w) } : int(Number(w));
      }
      case 'nextDouble': {
        const w = this.input.peekWord();
        if (w === null) throw new JavaException('NoSuchElementException', 'No more input');
        if (Number.isNaN(Number(w))) throw new JavaException('InputMismatchException', `For input string: "${w}"`);
        this.input.word();
        return dbl(Number(w));
      }
      case 'nextBoolean': {
        const w = this.input.peekWord();
        if (w === null) throw new JavaException('NoSuchElementException', 'No more input');
        if (!/^(true|false)$/i.test(w)) throw new JavaException('InputMismatchException', `For input string: "${w}"`);
        this.input.word();
        return bool(w.toLowerCase() === 'true');
      }
      case 'next':
        return str(this.input.word());
      case 'nextLine':
        return str(this.input.line());
      case 'hasNext':
        return bool(this.input.hasNext());
      case 'hasNextInt': {
        const w = this.input.peekWord();
        return bool(w !== null && /^[+-]?\d+$/.test(w));
      }
      case 'hasNextLine':
        return bool(this.input.hasNextLine());
      case 'close':
        return VOID;
    }
    throw unsupported(n, `Scanner.${name}`);
  }

  private math(n: Node, name: string, a: JVal[]): JVal {
    const nums = a.map((v) => {
      if (!NUMERIC.has(v.t)) throw new CompileError(lineOf(n), `Math.${name} works on numbers.`);
      return this.num(v);
    });
    const anyDouble = a.some((v) => v.t === 'double');
    const anyLong = a.some((v) => v.t === 'long');
    const same = (x: number): JVal => (anyDouble ? dbl(x) : anyLong ? { t: 'long', v: x } : int(x));
    if ((name === 'max' || name === 'min') && nums.length === 2) return same(name === 'max' ? Math.max(nums[0], nums[1]) : Math.min(nums[0], nums[1]));
    if (name === 'abs' && nums.length === 1) return same(Math.abs(nums[0]));
    if (name === 'sqrt' && nums.length === 1) return dbl(Math.sqrt(nums[0]));
    if (name === 'pow' && nums.length === 2) return dbl(Math.pow(nums[0], nums[1]));
    if (name === 'floor' && nums.length === 1) return dbl(Math.floor(nums[0]));
    if (name === 'ceil' && nums.length === 1) return dbl(Math.ceil(nums[0]));
    if (name === 'round' && nums.length === 1) return anyDouble ? { t: 'long', v: Math.floor(nums[0] + 0.5) } : int(nums[0]);
    throw unsupported(n, `Math.${name}`);
  }
}

// --------------------------------------------------------------------------

export function checkJava(tree: Tree): CompileError | null {
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

/** How many places read input (for the input box): Scanner objects created. */
export function javaReadsInput(tree: Tree): boolean {
  return /\bnew\s+Scanner\s*\(\s*System\.in\s*\)/.test(tree.rootNode.text);
}

/** Check, run and record a Java program from its tree-sitter tree. */
export function runJava(tree: Tree, opts: RunOptions & { input?: string }): RawRunResult {
  const problem = checkJava(tree);
  if (problem) return { status: 'syntax-error', steps: [], error: { line: problem.line, message: problem.message } };
  const { main, methods } = checkSubset(tree);
  const plan = planLists(methods);
  nextId = 1;
  const interp = new Interp(methods, plan, opts);
  const rt = interp.rt;
  let status: RawRunResult['status'] = 'ok';
  let error: RawRunResult['error'] = null;
  opts.beforeRun?.();
  try {
    try {
      interp.runMain(main);
    } catch (e) {
      rt.hooks.thrown(e);
      throw e;
    }
  } catch (e) {
    if (e instanceof CompileError) {
      // Found while running (e.g. a value that does not fit): Java would not have compiled it.
      return { status: 'syntax-error', steps: [], error: { line: e.line, message: e.message } };
    }
    if (e instanceof StopRun || (e instanceof RangeError && /call stack/i.test(e.message))) status = 'cap';
    else if (e instanceof JavaException) {
      status = 'runtime-error';
      error = recordCrash(rt, e.javaType, e.message);
    } else throw e;
  }
  return finishRun(rt, plan, status, error);
}

