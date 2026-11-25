// JavaScript instrumenter for the exact trace (Phase 2, stage h).
//
// Parses the program with Acorn and rewrites it so that it reports to a
// runtime object `__sv` (see runtime.ts):
//   - before every statement: __sv.l(line, namesId, getters, reads, swap)
//     (loops report their header line at the start of each round instead)
//   - at the start of every function: __sv.enter(name, paramNames, paramGetters)
//   - `return x` becomes `return __sv.ret(line, x)`; a try/catch/finally around
//     each function body calls __sv.thrown(e) and __sv.leave()
// `getters` are closures that read the variables in scope at that statement,
// so the runtime can show values without access to the engine's frames.
//
// It also finds what the loops-and-lists view (Screen 3) needs: arrays changed
// inside a loop, the array positions each statement reads, and swap statements.
import { parse } from 'acorn';
import { generate } from 'astring';

// ESTree nodes are walked and rebuilt generically here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = any;

export interface JsSyntaxError {
  line: number;
  message: string;
}

export interface JsListPlan {
  /** arrays changed inside a loop (strong first, then weak) */
  candidates: string[];
  loopOf: Record<string, { outerLine: number; outerEndLine: number; loopVars: string[] }>;
}

/** What a statement does, for the step kinds: k = kind, b/e = line ranges of the
 *  if body / else part or loop body, c = condition text, v = loop variable,
 *  t = names assigned, s = assigned at the same time (a, b = b, a + b). */
export interface StepInfo {
  k: 'define' | 'assign' | 'input' | 'print' | 'branch' | 'loop' | 'swap' | 'switch' | 'other';
  b?: [number, number];
  e?: [number, number];
  c?: string;
  v?: string;
  t?: string[];
  s?: boolean;
  /** switch: [label, first line, last line] of each case that has statements */
  cs?: [string, number, number][];
}

export interface Instrumented {
  code: string;
  /** name lists referenced by namesId in __sv.l / __sv.enter */
  names: string[][];
  plan: JsListPlan;
  lineCount: number;
}

const MUTATORS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin']);
const SAFE_INDEX = new Set(['Identifier', 'Literal', 'BinaryExpression', 'UnaryExpression']);
const SAFE_OPS = new Set(['+', '-', '*', '%', '/']);
const LOOPS = new Set(['ForStatement', 'WhileStatement', 'DoWhileStatement', 'ForInStatement', 'ForOfStatement']);
const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

// --------------------------------------------------------------------------
// Friendly syntax errors

const FRIENDLY: [string, string][] = [
  ['Unterminated string constant', 'Some text in quotes is missing its closing quote.'],
  ['Unterminated template', 'Some text in backticks is missing its closing backtick.'],
  ['Unterminated comment', 'A comment is opened here but never closed.'],
  ['Unexpected character', 'This line has a character JavaScript does not understand.'],
  ['has already been declared', 'This name is declared more than once.'],
  ['Assigning to rvalue', 'The left side of = must be a variable name.'],
  ['Unexpected token', 'JavaScript could not understand this line.'],
];

function friendly(message: string): string {
  for (const [needle, text] of FRIENDLY) if (message.includes(needle)) return text;
  return 'JavaScript could not understand this line.';
}

function parseProgram(source: string): { ast: N } | { error: JsSyntaxError } {
  try {
    const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'script', locations: true });
    return { ast };
  } catch (e) {
    const err = e as { loc?: { line: number }; message?: string };
    const line = err.loc?.line ?? 1;
    return { error: { line, message: `Line ${line}: ${friendly(err.message ?? '')}` } };
  }
}

// --------------------------------------------------------------------------
// Small helpers

function walk(node: N, visit: (n: N, parent: N | null) => boolean | void, parent: N | null = null) {
  if (!node || typeof node.type !== 'string') return;
  if (visit(node, parent) === false) return;
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const value = node[key];
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit, node));
    else if (value && typeof value.type === 'string') walk(value, visit, node);
  }
}

const id = (name: string): N => ({ type: 'Identifier', name });
const lit = (value: string | number | null): N => ({ type: 'Literal', value });
const arr = (elements: N[]): N => ({ type: 'ArrayExpression', elements });
const arrow = (body: N): N => ({ type: 'ArrowFunctionExpression', params: [], body, expression: true });
const call = (method: string, args: N[]): N => ({
  type: 'CallExpression',
  callee: { type: 'MemberExpression', object: id('__sv'), property: id(method), computed: false },
  arguments: args,
});
const exprStmt = (expression: N): N => ({ type: 'ExpressionStatement', expression });
const block = (body: N[]): N => ({ type: 'BlockStatement', body });
const clone = <T,>(node: T): T => JSON.parse(JSON.stringify(node));

/** A plain value (string, number, boolean, array, object) as an AST literal. */
function toAst(value: unknown): N {
  if (Array.isArray(value)) return arr(value.map(toAst));
  if (value !== null && typeof value === 'object') {
    return {
      type: 'ObjectExpression',
      properties: Object.entries(value).map(([k, v]) => ({
        type: 'Property',
        key: id(k),
        value: toAst(v),
        kind: 'init',
        computed: false,
        method: false,
        shorthand: false,
      })),
    };
  }
  return lit(value as string | number | null);
}

/** Names bound by a pattern (let { a, b: [c] } = ...). */
function patternNames(p: N, out: string[] = []): string[] {
  if (!p) return out;
  switch (p.type) {
    case 'Identifier':
      out.push(p.name);
      break;
    case 'ArrayPattern':
      p.elements.forEach((e: N) => patternNames(e, out));
      break;
    case 'ObjectPattern':
      p.properties.forEach((prop: N) => patternNames(prop.type === 'RestElement' ? prop.argument : prop.value, out));
      break;
    case 'AssignmentPattern':
      patternNames(p.left, out);
      break;
    case 'RestElement':
      patternNames(p.argument, out);
      break;
  }
  return out;
}

/** `name[index]` with a side-effect-free index: [name, index node]. */
function subscriptOf(n: N): [string, N] | null {
  if (n?.type === 'MemberExpression' && n.computed && n.object.type === 'Identifier') return [n.object.name, n.property];
  return null;
}

function safeIndex(n: N): boolean {
  let ok = true;
  walk(n, (node) => {
    if (!SAFE_INDEX.has(node.type)) ok = false;
    if ((node.type === 'BinaryExpression' || node.type === 'UnaryExpression') && !SAFE_OPS.has(node.operator)) ok = false;
    if (node.type === 'UnaryExpression' && node.operator !== '-' && node.operator !== '+') ok = false;
    return ok;
  });
  return ok;
}

// --------------------------------------------------------------------------
// Scopes: which names a statement can see (within its own function)

interface Scope {
  names: string[];
  parent: Scope | null;
  isFunction: boolean;
}

/** Function declarations and `var` names hoisted to a function or program scope. */
function hoisted(body: N[]): string[] {
  const out: string[] = [];
  for (const stmt of body) {
    if (stmt.type === 'FunctionDeclaration') {
      out.push(stmt.id.name);
      continue;
    }
    walk(stmt, (node) => {
      if (FUNCTIONS.has(node.type) || node.type === 'ClassExpression' || node.type === 'ClassDeclaration') return false;
      if (node.type === 'VariableDeclaration' && node.kind === 'var') {
        node.declarations.forEach((d: N) => patternNames(d.id, out));
      }
      return undefined;
    });
  }
  return out;
}

/** let/const/class/function declared directly in a block (block-scoped in strict mode). */
function lexical(body: N[]): string[] {
  const out: string[] = [];
  for (const stmt of body) {
    if (stmt.type === 'VariableDeclaration' && stmt.kind !== 'var') stmt.declarations.forEach((d: N) => patternNames(d.id, out));
    if (stmt.type === 'ClassDeclaration' || stmt.type === 'FunctionDeclaration') out.push(stmt.id.name);
  }
  return out;
}

/** Names visible at a statement, outer scopes first, up to its own function. */
function visibleNames(scope: Scope | null): string[] {
  const chain: Scope[] = [];
  for (let s = scope; s; s = s.parent) {
    chain.push(s);
    if (s.isFunction) break;
  }
  chain.reverse();
  const seen: string[] = [];
  for (const s of chain) for (const name of s.names) if (!seen.includes(name)) seen.push(name);
  return seen.filter((n) => n !== 'arguments' && !n.startsWith('__sv'));
}

// --------------------------------------------------------------------------
// The transform

export function analyzeJs(source: string): { ok: true } | { ok: false; error: JsSyntaxError } {
  const parsed = parseProgram(source);
  if ('error' in parsed) return { ok: false, error: parsed.error };
  const blocked = findBlocked(parsed.ast);
  return blocked ? { ok: false, error: blocked } : { ok: true };
}

function findBlocked(ast: N): JsSyntaxError | null {
  let found: JsSyntaxError | null = null;
  walk(ast, (n) => {
    if (found) return false;
    if (n.type === 'ImportExpression' || (n.type === 'MetaProperty' && n.meta?.name === 'import')) {
      const line = n.loc.start.line;
      found = { line, message: `Line ${line}: import is not available in StepViz.` };
    }
    return undefined;
  });
  return found;
}

export function instrument(source: string): Instrumented | { error: JsSyntaxError } {
  const parsed = parseProgram(source);
  if ('error' in parsed) return parsed;
  const ast = parsed.ast;
  const blocked = findBlocked(ast);
  if (blocked) return { error: blocked };

  const nameSets: string[][] = [];
  const nameSetId = (names: string[]) => {
    const key = JSON.stringify(names);
    const found = nameSets.findIndex((s) => JSON.stringify(s) === key);
    if (found >= 0) return found;
    nameSets.push(names);
    return nameSets.length - 1;
  };

  // ---- list plan (Screen 3) -------------------------------------------------
  const strong: string[] = [];
  const weak: string[] = [];
  const loopOf: JsListPlan['loopOf'] = {};
  const loopVar = (loop: N): string | null => {
    if (loop.type === 'ForStatement' && loop.init?.type === 'VariableDeclaration') {
      const names = patternNames(loop.init.declarations[0]?.id);
      return names.length === 1 ? names[0] : null;
    }
    if ((loop.type === 'ForOfStatement' || loop.type === 'ForInStatement') && loop.left.type === 'VariableDeclaration') {
      const names = patternNames(loop.left.declarations[0]?.id);
      return names.length === 1 ? names[0] : null;
    }
    return null;
  };
  const noteCandidate = (name: string, loops: N[], isStrong: boolean) => {
    const bucket = isStrong ? strong : weak;
    if (!bucket.includes(name)) bucket.push(name);
    if (!loopOf[name]) {
      const outer = loops[0];
      const inner = loops[loops.length - 1];
      loopOf[name] = {
        outerLine: outer.loc.start.line,
        outerEndLine: outer.loc.end.line,
        loopVars: [...new Set([loopVar(outer), loopVar(inner)].filter((v): v is string => !!v))],
      };
    }
  };
  const findCandidates = (node: N, loops: N[]) => {
    if (!node || typeof node.type !== 'string') return;
    if (FUNCTIONS.has(node.type)) {
      findCandidates(node.body, []); // a function body starts a new loop context
      return;
    }
    if (loops.length > 0) {
      if (node.type === 'AssignmentExpression') {
        walk(node.left, (n) => {
          const sub = subscriptOf(n);
          if (sub) noteCandidate(sub[0], loops, true);
          else if (n.type === 'Identifier' && n === node.left) noteCandidate(n.name, loops, false);
          return sub ? false : undefined;
        });
      }
      if (node.type === 'UpdateExpression') {
        const sub = subscriptOf(node.argument);
        if (sub) noteCandidate(sub[0], loops, true);
      }
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        !node.callee.computed &&
        node.callee.object.type === 'Identifier' &&
        MUTATORS.has(node.callee.property.name)
      ) {
        noteCandidate(node.callee.object.name, loops, true);
      }
    }
    const isLoop = LOOPS.has(node.type);
    for (const key of Object.keys(node)) {
      if (key === 'loc') continue;
      const childLoops = isLoop && key === 'body' ? [...loops, node] : loops;
      const v = node[key];
      if (Array.isArray(v)) v.forEach((c) => findCandidates(c, childLoops));
      else if (v && typeof v.type === 'string') findCandidates(v, childLoops);
    }
  };
  findCandidates(ast, []);

  // Array reads (`a[i]`) in the head of a statement, for highlighting compared items.
  const readsOf = (parts: N[]): N => {
    const entries: N[] = [];
    const seen = new Set<string>();
    for (const part of parts) {
      walk(part, (n) => {
        if (FUNCTIONS.has(n.type)) return false;
        const sub = subscriptOf(n);
        if (sub && safeIndex(sub[1])) {
          const key = `${sub[0]}[${generate(sub[1])}]`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push(arr([lit(sub[0]), arrow(clone(sub[1]))]));
          }
        }
        return undefined;
      });
    }
    return entries.length ? arr(entries) : lit(null);
  };

  /** [a[x], a[y]] = [a[y], a[x]] */
  const swapOf = (stmt: N): N => {
    const e = stmt.type === 'ExpressionStatement' ? stmt.expression : null;
    if (!e || e.type !== 'AssignmentExpression' || e.operator !== '=') return lit(null);
    if (e.left.type !== 'ArrayPattern' || e.right.type !== 'ArrayExpression') return lit(null);
    if (e.left.elements.length !== 2 || e.right.elements.length !== 2) return lit(null);
    const subs = [...e.left.elements, ...e.right.elements].map(subscriptOf);
    if (subs.some((s) => !s) || new Set(subs.map((s) => s![0])).size !== 1) return lit(null);
    if (!subs.every((s) => safeIndex(s![1]))) return lit(null);
    const idx = subs.map((s) => generate(s![1]));
    if (idx[0] !== idx[3] || idx[1] !== idx[2]) return lit(null);
    return arr([lit(subs[0]![0]), arrow(clone(subs[0]![1])), arrow(clone(subs[1]![1]))]);
  };

  const hook = (line: number, scope: Scope, readParts: N[], swap: N = lit(null), info: StepInfo = { k: 'other' }): N => {
    const names = visibleNames(scope);
    return exprStmt(
      call('l', [lit(line), lit(nameSetId(names)), arr(names.map((n) => arrow(id(n)))), readsOf(readParts), swap, toAst(info)]),
    );
  };

  // ---- step kinds (for the rule-based explainer) ---------------------------
  const text = (n: N) => source.slice(n.start, n.end).trim();
  const rangeOf = (stmt: N): [number, number] | undefined => {
    if (!stmt) return undefined;
    const body = stmt.type === 'BlockStatement' ? stmt.body : [stmt];
    if (!body.length) return undefined;
    return [body[0].loc.start.line, body[body.length - 1].loc.end.line];
  };
  const isConsoleCall = (e: N) =>
    e?.type === 'CallExpression' &&
    e.callee.type === 'MemberExpression' &&
    e.callee.object.type === 'Identifier' &&
    e.callee.object.name === 'console';
  const assignedNames = (target: N): string[] => {
    const out: string[] = [];
    walk(target, (n) => {
      const sub = subscriptOf(n);
      if (sub) {
        if (!out.includes(sub[0])) out.push(sub[0]);
        return false;
      }
      if (n.type === 'MemberExpression') return false;
      if (n.type === 'Identifier' && !out.includes(n.name)) out.push(n.name);
      return undefined;
    });
    return out;
  };
  const infoOf = (stmt: N): StepInfo => {
    switch (stmt.type) {
      case 'FunctionDeclaration':
      case 'ClassDeclaration':
        return { k: 'define', t: [stmt.id.name] };
      case 'IfStatement': {
        const info: StepInfo = { k: 'branch', c: text(stmt.test) };
        const b = rangeOf(stmt.consequent);
        const e = rangeOf(stmt.alternate);
        if (b) info.b = b;
        if (e) info.e = e;
        return info;
      }
      case 'SwitchStatement': {
        // Empty cases fall through into the next case with statements: "1 or 2".
        const cs: [string, number, number][] = [];
        let pending: string[] = [];
        for (const c of stmt.cases) {
          pending.push(c.test ? text(c.test) : 'default');
          const body = c.consequent.filter((x: N) => x.type !== 'EmptyStatement');
          if (!body.length) continue;
          cs.push([pending.join(' or '), body[0].loc.start.line, body[body.length - 1].loc.end.line]);
          pending = [];
        }
        return { k: 'switch', c: text(stmt.discriminant), cs };
      }
      case 'VariableDeclaration': {
        const t = stmt.declarations.flatMap((d: N) => patternNames(d.id));
        const simultaneous = stmt.declarations.some((d: N) => d.id.type !== 'Identifier' && patternNames(d.id).length > 1);
        return simultaneous ? { k: 'assign', t, s: true } : { k: 'assign', t };
      }
      case 'ExpressionStatement': {
        const e = stmt.expression;
        if (isConsoleCall(e)) return { k: 'print' };
        if (
          e.type === 'CallExpression' &&
          e.callee.type === 'MemberExpression' &&
          !e.callee.computed &&
          e.callee.object.type === 'Identifier' &&
          MUTATORS.has(e.callee.property.name)
        ) {
          return { k: 'assign', t: [e.callee.object.name] };
        }
        if (e.type === 'AssignmentExpression') {
          const t = assignedNames(e.left);
          return e.left.type === 'ArrayPattern' && e.left.elements.length > 1 ? { k: 'assign', t, s: true } : { k: 'assign', t };
        }
        if (e.type === 'UpdateExpression') return { k: 'assign', t: assignedNames(e.argument) };
        if (e.type === 'SequenceExpression' && e.expressions.every((x: N) => x.type === 'AssignmentExpression' || x.type === 'UpdateExpression')) {
          return { k: 'assign', t: e.expressions.flatMap((x: N) => assignedNames(x.left ?? x.argument)) };
        }
        return { k: 'other' };
      }
      default:
        return { k: 'other' };
    }
  };
  const loopInfo = (loop: N): StepInfo => {
    const info: StepInfo = { k: 'loop' };
    const b = rangeOf(loop.body);
    if (b) info.b = b;
    if (loop.test) info.c = text(loop.test);
    const v = loopVar(loop);
    if (v) info.v = v;
    return info;
  };

  // Parts of a statement evaluated before its body runs.
  const headOf = (stmt: N): N[] => {
    switch (stmt.type) {
      case 'IfStatement':
        return [stmt.test];
      case 'SwitchStatement':
        return [stmt.discriminant];
      case 'ForStatement':
        return [stmt.test, stmt.update].filter(Boolean);
      case 'WhileStatement':
      case 'DoWhileStatement':
        return [stmt.test];
      case 'ForInStatement':
      case 'ForOfStatement':
        return [stmt.right];
      case 'FunctionDeclaration':
      case 'ClassDeclaration':
      case 'BlockStatement':
      case 'TryStatement':
        return [];
      default:
        return [stmt];
    }
  };

  const asBlock = (stmt: N): N => (stmt.type === 'BlockStatement' ? stmt : block([stmt]));

  const transformStatements = (body: N[], scope: Scope): N[] => {
    const out: N[] = [];
    for (const stmt of body) {
      const info = LOOPS.has(stmt.type) ? loopInfo(stmt) : infoOf(stmt); // before the body is rewritten
      transformStatement(stmt, scope);
      if (LOOPS.has(stmt.type)) {
        // Loops report their header line at the start of each round, and a
        // loop-end step when they finish (in the scope around the loop).
        const names = visibleNames(scope);
        out.push(
          stmt,
          exprStmt(call('x', [lit(stmt.loc.start.line), lit(nameSetId(names)), arr(names.map((n) => arrow(id(n)))), toAst(info)])),
        );
      } else if (stmt.type === 'EmptyStatement') {
        continue;
      } else {
        const swap = swapOf(stmt);
        out.push(hook(stmt.loc.start.line, scope, headOf(stmt), swap, swap.type === 'Literal' ? info : { k: 'swap' }), stmt);
      }
    }
    return out;
  };

  const transformBlock = (blk: N, parent: Scope, extra: string[] = []) => {
    const scope: Scope = { names: [...extra, ...lexical(blk.body)], parent, isFunction: false };
    blk.body = transformStatements(blk.body, scope);
  };

  const transformLoop = (loop: N, scope: Scope) => {
    const info = loopInfo(loop); // before the body is rewritten
    // let/const in the loop head belong to the loop's own scope.
    let headNames: string[] = [];
    if (loop.type === 'ForStatement' && loop.init?.type === 'VariableDeclaration' && loop.init.kind !== 'var') {
      headNames = loop.init.declarations.flatMap((d: N) => patternNames(d.id));
    }
    if ((loop.type === 'ForInStatement' || loop.type === 'ForOfStatement') && loop.left.type === 'VariableDeclaration' && loop.left.kind !== 'var') {
      headNames = loop.left.declarations.flatMap((d: N) => patternNames(d.id));
    }
    const headScope: Scope = { names: headNames, parent: scope, isFunction: false };
    transformExpressions(loop, headScope, ['init', 'test', 'update', 'right']);
    loop.body = asBlock(loop.body);
    const bodyScope: Scope = { names: lexical(loop.body.body), parent: headScope, isFunction: false };
    const inner = transformStatements(loop.body.body, bodyScope);
    loop.body.body = [hook(loop.loc.start.line, bodyScope, headOf(loop), lit(null), info), ...inner, exprStmt(call('f', []))];
  };

  /** Transform functions nested inside expressions. */
  const transformExpressions = (node: N, scope: Scope, keys?: string[]) => {
    const visitChild = (child: N) => {
      walk(child, (n) => {
        if (FUNCTIONS.has(n.type)) {
          transformFunction(n, scope);
          return false;
        }
        if (n.type === 'ClassExpression' || n.type === 'ClassDeclaration') {
          transformClass(n, scope);
          return false;
        }
        return undefined;
      });
    };
    if (keys) keys.forEach((k) => node[k] && visitChild(node[k]));
    else visitChild(node);
  };

  const transformClass = (cls: N, scope: Scope) => {
    for (const member of cls.body.body) {
      if (member.type === 'MethodDefinition') {
        const label = member.kind === 'constructor' ? cls.id?.name ?? 'constructor' : member.key.name ?? 'method';
        transformFunction(member.value, scope, label);
      } else if (member.value) {
        transformExpressions(member.value, scope);
      }
    }
  };

  const transformFunction = (fn: N, _outer: Scope, label?: string) => {
    const name = label ?? fn.id?.name ?? 'anonymous';
    if (fn.async || fn.generator) return; // not traced: their steps would interleave
    if (fn.expression || fn.body.type !== 'BlockStatement') {
      fn.body = block([{ type: 'ReturnStatement', argument: fn.body, loc: fn.body.loc }]);
      fn.expression = false;
    }
    const params = fn.params.flatMap((p: N) => patternNames(p));
    const fnScope: Scope = { names: [...params, ...hoisted(fn.body.body)], parent: null, isFunction: true };
    const bodyScope: Scope = { names: lexical(fn.body.body), parent: fnScope, isFunction: false };
    const inner = transformStatements(fn.body.body, bodyScope);
    const enter = exprStmt(call('enter', [lit(name), lit(nameSetId(params)), arr(params.map((p: string) => arrow(id(p))))]));
    fn.body.body = [
      enter,
      {
        type: 'TryStatement',
        block: block(inner),
        handler: {
          type: 'CatchClause',
          param: id('__svE'),
          body: block([exprStmt(call('thrown', [id('__svE')])), { type: 'ThrowStatement', argument: id('__svE') }]),
        },
        finalizer: block([exprStmt(call('leave', []))]),
      },
    ];
  };

  function transformStatement(stmt: N, scope: Scope) {
    switch (stmt.type) {
      case 'FunctionDeclaration':
        transformFunction(stmt, scope);
        return;
      case 'ClassDeclaration':
        transformClass(stmt, scope);
        return;
      case 'BlockStatement':
        transformBlock(stmt, scope);
        return;
      case 'IfStatement':
        transformExpressions(stmt, scope, ['test']);
        stmt.consequent = asBlock(stmt.consequent);
        transformBlock(stmt.consequent, scope);
        if (stmt.alternate) {
          if (stmt.alternate.type === 'IfStatement') {
            // else if: report the "else if" line too
            stmt.alternate = block([stmt.alternate]);
          } else {
            stmt.alternate = asBlock(stmt.alternate);
          }
          transformBlock(stmt.alternate, scope);
        }
        return;
      case 'ForStatement':
      case 'WhileStatement':
      case 'DoWhileStatement':
      case 'ForInStatement':
      case 'ForOfStatement':
        transformLoop(stmt, scope);
        return;
      case 'TryStatement':
        transformBlock(stmt.block, scope);
        if (stmt.handler) transformBlock(stmt.handler.body, scope, stmt.handler.param ? patternNames(stmt.handler.param) : []);
        if (stmt.finalizer) transformBlock(stmt.finalizer, scope);
        return;
      case 'SwitchStatement':
        transformExpressions(stmt, scope, ['discriminant']);
        for (const c of stmt.cases) c.consequent = transformStatements(c.consequent, scope);
        return;
      case 'LabeledStatement':
        transformStatement(stmt.body, scope);
        return;
      case 'ReturnStatement':
        transformExpressions(stmt, scope, ['argument']);
        stmt.argument = call('ret', [lit(stmt.loc.start.line), stmt.argument ?? id('undefined')]);
        return;
      default:
        transformExpressions(stmt, scope);
    }
  }

  // Program: the Global frame.
  const programScope: Scope = { names: [...hoisted(ast.body), ...lexical(ast.body)], parent: null, isFunction: true };
  ast.body = [
    {
      type: 'TryStatement',
      block: block(transformStatements(ast.body, programScope)),
      handler: {
        type: 'CatchClause',
        param: id('__svE'),
        body: block([exprStmt(call('thrown', [id('__svE')])), { type: 'ThrowStatement', argument: id('__svE') }]),
      },
      finalizer: null,
    },
  ];

  const candidates = [...strong, ...weak.filter((n) => !strong.includes(n))];
  return {
    code: generate(ast),
    names: nameSets,
    plan: { candidates, loopOf },
    lineCount: source.split('\n').length,
  };
}
