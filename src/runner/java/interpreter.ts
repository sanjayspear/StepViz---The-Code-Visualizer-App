// Java interpreter for StepViz (J1: basics). A tree-walking interpreter over the
// tree-sitter Java syntax tree for a beginner subset. It never compiles or runs
// real Java: it carries out each statement itself and reports to the shared
// step recorder (../recorder.ts), so steps, kinds, caps and crash steps follow
// the same rules as Python and JavaScript.
//
// J1 supports: public class Main with public static void main(String[] args);
// other static methods (with recursion); int, long, double, boolean, char and
// String values; arithmetic with Java rules (int wraps at 32 bits, whole-number
// division, / by zero); comparisons, && || !, ? :, casts; if/else, while,
// do/while, for, break, continue, return; ++ -- += and friends; string +;
// String length(), charAt(), equals(); Math.max/min/abs/sqrt/pow/floor/ceil/round;
// System.out.println and System.out.print.
import type { Node, Tree } from 'web-tree-sitter';
import type { RawRunResult } from '../protocol';
import { finishRun, recordCrash, Recorder, StopRun, type Getter, type RunOptions, type StepInfo } from '../recorder';

// --------------------------------------------------------------------------
// Values

type Prim = 'int' | 'long' | 'double' | 'boolean' | 'char' | 'String' | 'null' | 'void';
export type JType = Prim;

/** A Java value with its type. char values hold the character as a string. */
export interface JVal {
  t: JType;
  v: number | boolean | string | null;
}

const isJVal = (x: unknown): x is JVal => typeof x === 'object' && x !== null && 't' in x && 'v' in x;
const NUMERIC = new Set<JType>(['int', 'long', 'double', 'char']);

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

/** String.valueOf: how a value prints or joins a string. */
export function javaString(val: JVal): string {
  switch (val.t) {
    case 'double':
      return javaDouble(val.v as number);
    case 'null':
      return 'null';
    default:
      return String(val.v);
  }
}

/** How a value shows in a frame: "hi" in quotes, 'a' for a char, 2.0 for a double. */
export function formatJava(x: unknown): string | undefined {
  if (x === undefined) return 'nothing'; // a void method that reached its closing brace
  if (!isJVal(x)) return undefined;
  if (x.t === 'String') return x.v === null ? 'null' : JSON.stringify(x.v);
  if (x.t === 'char') return `'${x.v}'`;
  if (x.t === 'void') return 'nothing';
  return javaString(x);
}

const int = (n: number): JVal => ({ t: 'int', v: n | 0 });
const dbl = (n: number): JVal => ({ t: 'double', v: n });
const bool = (b: boolean): JVal => ({ t: 'boolean', v: b });
const str = (s: string): JVal => ({ t: 'String', v: s });
const VOID: JVal = { t: 'void', v: null };

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
  import_declaration: 'imports',
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
  object_creation_expression: 'new objects',
  array_creation_expression: 'arrays',
  array_initializer: 'arrays',
  array_access: 'arrays',
  enhanced_for_statement: 'for-each loops',
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

const ALLOWED_TYPES = new Set(['int', 'long', 'double', 'float', 'boolean', 'char', 'short', 'byte', 'String', 'void']);

function checkSubset(tree: Tree): { main: Node; methods: Map<string, Node> } {
  const root = tree.rootNode;
  const classes = root.namedChildren.filter((n): n is Node => !!n && n.type !== 'line_comment' && n.type !== 'block_comment');
  for (const n of classes) {
    if (n.type !== 'class_declaration') throw unsupported(n, FEATURES[n.type] ?? n.type.replace(/_/g, ' '));
  }
  const NEED_MAIN = 'StepViz needs a public class Main with a main method.';
  const mainClass = classes.find((c) => c.childForFieldName('name')?.text === 'Main');
  if (!mainClass) throw new CompileError(classes[0] ? lineOf(classes[0]) : 1, NEED_MAIN);
  const other = classes.find((c) => c !== mainClass);
  if (other) throw unsupported(other, 'classes other than Main');

  const methods = new Map<string, Node>();
  for (const member of mainClass.childForFieldName('body')?.namedChildren ?? []) {
    if (!member || member.type === 'line_comment' || member.type === 'block_comment') continue;
    if (member.type !== 'method_declaration') throw unsupported(member, FEATURES[member.type] ?? member.type.replace(/_/g, ' '));
    const modifiers = member.namedChildren.find((c) => c?.type === 'modifiers')?.text ?? '';
    if (!/\bstatic\b/.test(modifiers)) throw unsupported(member, 'methods that are not static');
    const name = member.childForFieldName('name')!.text;
    if (methods.has(name)) throw unsupported(member, 'two methods with the same name');
    methods.set(name, member);
  }
  const main = methods.get('main');
  const params = main?.childForFieldName('parameters')?.namedChildren.filter(Boolean) ?? [];
  const okMain =
    main &&
    main.childForFieldName('type')?.text === 'void' &&
    params.length === 1 &&
    /^String\s*\[\s*\]$|^String\.\.\.$/.test(params[0]!.childForFieldName('type')?.text ?? '');
  if (!main || !okMain) throw new CompileError(main ? lineOf(main) : lineOf(mainClass), NEED_MAIN);

  // Everything inside the methods must be in the J1 subset.
  for (const m of methods.values()) {
    const visit = (n: Node) => {
      const feature = FEATURES[n.type];
      if (feature) throw unsupported(n, feature);
      if (n.type === 'array_type') throw unsupported(n, 'arrays');
      if (n.type === 'type_identifier' && !ALLOWED_TYPES.has(n.text)) {
        throw unsupported(n, `the type ${n.text}`);
      }
      for (const c of n.namedChildren) if (c) visit(c);
    };
    visit(m.childForFieldName('body')!);
    for (const p of m.childForFieldName('parameters')?.namedChildren ?? []) if (p && m !== main) visit(p);
    const rt = m.childForFieldName('type');
    if (rt) visit(rt);
  }
  return { main, methods };
}

// --------------------------------------------------------------------------
// The interpreter

const UNSET = Symbol('unset');
interface Cell {
  t: JType;
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

function typeOf(node: Node | null): JType {
  const text = node?.text ?? 'void';
  if (text === 'float') return 'double';
  if (text === 'short' || text === 'byte') return 'int';
  return text as JType;
}

/** Declared names directly in a list of statements (for "?" before they are set). */
function declaredIn(stmts: (Node | null)[]): { name: string; t: JType }[] {
  const out: { name: string; t: JType }[] = [];
  for (const s of stmts) {
    if (s?.type !== 'local_variable_declaration') continue;
    const t = typeOf(s.childForFieldName('type'));
    for (const d of s.childrenForFieldName('declarator')) if (d) out.push({ name: d.childForFieldName('name')!.text, t });
  }
  return out;
}

const statementsOf = (n: Node | null): Node[] =>
  !n ? [] : n.type === 'block' ? (n.namedChildren.filter((c) => c && !/comment/.test(c.type)) as Node[]) : [n];
const rangeOf = (n: Node | null): [number, number] | undefined => {
  const s = statementsOf(n);
  return s.length ? [lineOf(s[0]), s[s.length - 1].endPosition.row + 1] : undefined;
};
const inner = (n: Node | null) => (n?.type === 'parenthesized_expression' ? n.namedChildren[0]! : n!);

class Interp {
  rt: Recorder;
  private nameSets: string[][] = [];
  private nameIds = new Map<string, number>();
  private scope: Scope = new Scope(null);

  constructor(
    private methods: Map<string, Node>,
    opts: RunOptions,
  ) {
    this.rt = new Recorder(this.nameSets, { candidates: [], loopOf: {} }, { ...opts, rootLabel: 'main()', format: formatJava });
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
      const cell = scope.lookup(n);
      if (!cell || cell.v === UNSET) throw new Error('unset');
      return cell.v;
    });
  }

  /** Report a statement to the recorder, before it runs. */
  private hook(line: number, info: StepInfo) {
    const names = this.scope.names();
    this.rt.hooks.l(line, this.namesId(names), this.getters(names), null, null, info);
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
    for (const d of declaredIn(statementsOf(block))) this.scope.vars.set(d.name, { t: d.t, v: UNSET });
    try {
      for (const s of statementsOf(block)) this.exec(s);
    } finally {
      this.scope = saved;
    }
  }

  // ---- statements ---------------------------------------------------------------

  private infoOf(s: Node): StepInfo {
    switch (s.type) {
      case 'local_variable_declaration':
        return { k: 'assign', t: s.childrenForFieldName('declarator').map((d) => d!.childForFieldName('name')!.text) };
      case 'expression_statement': {
        const e = s.namedChildren[0]!;
        if (e.type === 'assignment_expression') return { k: 'assign', t: [e.childForFieldName('left')!.text] };
        if (e.type === 'update_expression') return { k: 'assign', t: [e.namedChildren[0]!.text] };
        if (e.type === 'method_invocation' && /^System\.out\.print/.test(`${e.childForFieldName('object')?.text}.${e.childForFieldName('name')?.text}`)) {
          return { k: 'print' };
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

  private exec(s: Node) {
    switch (s.type) {
      case 'block':
        this.execBody(s);
        return;
      case 'while_statement':
      case 'do_statement':
      case 'for_statement':
        this.execLoop(s);
        return;
      case 'line_comment':
      case 'block_comment':
      case ';':
        return;
    }
    this.hook(lineOf(s), this.infoOf(s));
    switch (s.type) {
      case 'local_variable_declaration':
        this.declare(s);
        return;
      case 'expression_statement':
        this.eval(s.namedChildren[0]!);
        return;
      case 'if_statement': {
        const cond = this.condition(s.childForFieldName('condition')!);
        const branch = cond ? s.childForFieldName('consequence') : s.childForFieldName('alternative');
        if (branch) this.execNested(branch);
        return;
      }
      case 'return_statement': {
        const e = s.namedChildren[0];
        const value = e ? this.eval(e) : VOID;
        this.rt.hooks.ret(lineOf(s), value);
        throw new ReturnSignal(value);
      }
      case 'break_statement':
        if (s.namedChildren.length) throw unsupported(s, 'labels');
        throw new BreakSignal();
      case 'continue_statement':
        if (s.namedChildren.length) throw unsupported(s, 'labels');
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
      for (const d of declaredIn([n])) this.scope.vars.set(d.name, { t: d.t, v: UNSET });
      try {
        this.exec(n);
      } finally {
        this.scope = saved;
      }
    }
  }

  private declare(s: Node) {
    const t = typeOf(s.childForFieldName('type'));
    for (const d of s.childrenForFieldName('declarator')) {
      const name = d!.childForFieldName('name')!.text;
      const valueNode = d!.childForFieldName('value');
      let cell = this.scope.vars.get(name);
      if (!cell) {
        cell = { t, v: UNSET };
        this.scope.vars.set(name, cell);
      }
      if (valueNode) cell.v = this.coerce(this.eval(valueNode), t, d!, name);
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
    const body = s.childForFieldName('body');
    const b = rangeOf(body);
    if (b) info.b = b;
    const condNode = s.childForFieldName('condition');
    if (condNode) info.c = inner(condNode).text;

    const outer = this.scope;
    this.scope = new Scope(outer); // the loop's own scope (for (int i = ...))
    try {
      if (s.type === 'for_statement') {
        for (const init of s.childrenForFieldName('init')) {
          if (!init) continue;
          if (init.type === 'local_variable_declaration') {
            const t = typeOf(init.childForFieldName('type'));
            for (const d of init.childrenForFieldName('declarator')) {
              const name = d!.childForFieldName('name')!.text;
              this.scope.vars.set(name, { t, v: UNSET });
              if (!info.v) info.v = name;
            }
            this.declare(init);
          } else this.eval(init);
        }
      }
      let first = true;
      for (;;) {
        if (s.type !== 'do_statement' || !first) {
          if (condNode && !this.condition(condNode)) break;
        }
        first = false;
        this.hookIn(line, info);
        try {
          this.execNested(body!);
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

  /** The loop header at the start of a round (its variables are in scope). */
  private hookIn(line: number, info: StepInfo) {
    this.hook(line, info);
  }

  // ---- methods ------------------------------------------------------------------

  private call(node: Node, name: string, args: JVal[]): JVal {
    const m = this.methods.get(name);
    if (!m) throw unsupported(node, `the method ${name}`);
    const params = (m.childForFieldName('parameters')?.namedChildren ?? []).filter((p): p is Node => !!p && p.type === 'formal_parameter');
    if (params.length !== args.length) throw new CompileError(lineOf(node), `${name} needs ${params.length} value${params.length === 1 ? '' : 's'}, not ${args.length}.`);
    const saved = this.scope;
    const scope = new Scope(null);
    const names: string[] = [];
    params.forEach((p, i) => {
      const t = typeOf(p.childForFieldName('type'));
      const pname = p.childForFieldName('name')!.text;
      scope.vars.set(pname, { t, v: this.coerce(args[i], t, node, pname) });
      names.push(pname);
    });
    const returnType = typeOf(m.childForFieldName('type'));
    this.scope = scope;
    this.rt.hooks.enter(name, this.namesId(names), this.getters(names));
    try {
      this.execBody(m.childForFieldName('body')!);
      if (returnType !== 'void') throw new CompileError(lineOf(m), `${name} must return a value.`);
      return VOID;
    } catch (e) {
      if (e instanceof ReturnSignal) return returnType === 'void' ? VOID : this.coerce(e.value, returnType, node, name);
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
  private coerce(v: JVal, t: JType, at: Node, name: string): JVal {
    if (v.t === t) return v;
    if (t === 'double' && NUMERIC.has(v.t)) return dbl(v.t === 'char' ? (v.v as string).charCodeAt(0) : (v.v as number));
    if (t === 'long' && (v.t === 'int' || v.t === 'char')) return { t: 'long', v: v.t === 'char' ? (v.v as string).charCodeAt(0) : (v.v as number) };
    if (t === 'int' && v.t === 'char') return int((v.v as string).charCodeAt(0));
    if (t === 'char' && v.t === 'int' && at.childForFieldName?.('value')?.type === 'decimal_integer_literal') {
      return { t: 'char', v: String.fromCharCode(v.v as number) };
    }
    if (t === 'String' && v.t === 'null') return { t: 'String', v: null };
    throw new CompileError(lineOf(at), `${name} is ${t === 'int' ? 'an' : 'a'} ${t} box, so it can't hold ${formatJava(v)}.`);
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
    if (op === '+' && (a.t === 'String' || b.t === 'String')) return str(javaString(a) + javaString(b));
    if (op === '==' || op === '!=') {
      let same: boolean;
      if (NUMERIC.has(a.t) && NUMERIC.has(b.t)) same = this.num(a) === this.num(b);
      else same = a.v === b.v; // text compared by its letters (real Java compares objects; use .equals())
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

  private assignTo(target: Node, value: JVal): JVal {
    if (target.type !== 'identifier') throw unsupported(target, 'this kind of assignment');
    const cell = this.scope.lookup(target.text);
    if (!cell) throw new CompileError(lineOf(target), `${target.text} is used but never declared.`);
    cell.v = this.coerce(value, cell.t, target, target.text);
    return cell.v;
  }

  private read(id: Node): JVal {
    const cell = this.scope.lookup(id.text);
    if (!cell) throw new CompileError(lineOf(id), `${id.text} is used but never declared.`);
    if (cell.v === UNSET) throw new CompileError(lineOf(id), `${id.text} is used before it was given a value.`);
    return cell.v;
  }

  private castTo(t: JType, v: JVal, at: Node): JVal {
    if (t === 'int') return v.t === 'char' ? int((v.v as string).charCodeAt(0)) : int(Math.trunc(this.num(v)));
    if (t === 'long') return { t: 'long', v: Math.trunc(this.num(v)) };
    if (t === 'double') return dbl(this.num(v));
    if (t === 'char') return { t: 'char', v: String.fromCharCode(this.num(v) & 0xffff) };
    if (t === v.t) return v;
    throw unsupported(at, `this cast`);
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
      case 'string_literal':
        return str(JSON.parse(`"${n.text.slice(1, -1).replace(/\\'/g, "'")}"`));
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
        return { t: 'null', v: null };
      case 'identifier':
        return this.read(n);
      case 'parenthesized_expression':
        return this.eval(n.namedChildren[0]!);
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
        const target = n.namedChildren[0]!;
        const prefix = n.child(0)?.type === '++' || n.child(0)?.type === '--';
        const op = (prefix ? n.child(0) : n.child(1))!.type;
        const before = this.read(target);
        if (!NUMERIC.has(before.t)) throw new CompileError(lineOf(n), `${op} only works on numbers.`);
        // x++ keeps x's type (a char stays a char, an int wraps at 32 bits).
        const after = this.castTo(before.t, this.arith(op === '++' ? '+' : '-', before, int(1), n), n);
        const stored = this.assignTo(target, after);
        return prefix ? stored : before;
      }
      case 'assignment_expression': {
        const op = n.childForFieldName('operator')!.type;
        const left = n.childForFieldName('left')!;
        const right = this.eval(n.childForFieldName('right')!);
        if (op === '=') return this.assignTo(left, right);
        const current = this.read(left);
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
        return this.castTo(typeOf(n.childForFieldName('type')), this.eval(n.childForFieldName('value')!), n);
      case 'method_invocation':
        return this.invoke(n);
      default:
        throw unsupported(n, n.type.replace(/_/g, ' '));
    }
  }

  private invoke(n: Node): JVal {
    const object = n.childForFieldName('object');
    const name = n.childForFieldName('name')!.text;
    const argNodes = (n.childForFieldName('arguments')?.namedChildren ?? []).filter((a): a is Node => !!a && !/comment/.test(a.type));
    const args = () => argNodes.map((a) => this.eval(a));

    if (object?.text === 'System.out') {
      if (name === 'println' || name === 'print') {
        const values = args();
        if (values.length > 1) throw new CompileError(lineOf(n), `${name} takes one value.`);
        this.rt.output += (values[0] ? javaString(values[0]) : '') + (name === 'println' ? '\n' : '');
        return VOID;
      }
      throw unsupported(n, `System.out.${name}`);
    }
    if (object?.text === 'Math') return this.math(n, name, args());
    if (!object || object.text === 'Main') return this.call(n, name, args());

    // Methods on a String value.
    const target = this.eval(object);
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

/** Check, run and record a Java program from its tree-sitter tree. */
export function runJava(tree: Tree, opts: RunOptions): RawRunResult {
  const problem = checkJava(tree);
  if (problem) return { status: 'syntax-error', steps: [], error: { line: problem.line, message: problem.message } };
  const { main, methods } = checkSubset(tree);
  const interp = new Interp(methods, opts);
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
  return finishRun(rt, { candidates: [], loopOf: {} }, status, error);
}
