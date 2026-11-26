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
// L1: ArrayList<Integer> / List<String> (new ArrayList<>(), from Arrays.asList or
// List.of, or a copy) with add, get, set, remove (position or value), size,
// isEmpty, clear, contains, indexOf, addAll, equals; for-each over lists with
// Java's iterator (ConcurrentModificationException); Integer/Double... boxes
// (== on Integer objects compares objects, small ones are shared); Collections
// sort, reverse, swap, max, min; String substring, indexOf, lastIndexOf,
// contains, startsWith, endsWith, toUpperCase, toLowerCase, trim, strip,
// isEmpty, isBlank, replace, repeat, concat, compareTo, equalsIgnoreCase, split,
// toCharArray; String.join; Character.isDigit/isLetter/... and toUpperCase.
// T1: try / catch (several, A | B) / finally, throw new X("..."), throws, the
// standard exception family (catch (RuntimeException e) takes its children),
// getMessage(); Java's compile rules (Exception must be caught or declared; a
// catch can't follow one that already covers it). A caught error turns the line
// that failed into a "catch" step.
// K1: simple classes next to Main (class Dog { }) or inside it (static class):
// fields (with starting values), constructors (several, chosen by their values),
// methods (on an object, or static), this, private (checked like Java), toString()
// for printing, == / default equals compare objects, objects in arrays and lists,
// null objects (NullPointerException). Frames show objects as Dog {name: "Rex",
// age: 3}; a constructor runs in a "new Dog(...)" frame with this first.
// Not yet: inheritance, interfaces, static variables, inner classes, Object.
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
export type JType = Prim | 'null' | 'void' | 'array' | 'list' | 'Scanner' | 'exception' | 'object' | 'map' | 'entry' | 'set' | 'func' | 'stream' | 'optional';

/** A lambda, a method reference or a Comparator built from them (t = 'func'). */
type JFunc =
  | { kind: 'lambda'; node: Node; scope: unknown; cls: string }
  | { kind: 'println' }
  | { kind: 'method'; cls: string; name: string }
  | { kind: 'comparing'; key: JFunc; reversed: boolean; then?: JFunc }
  | { kind: 'natural'; reversed: boolean }
  /** Integer::sum, String::length...: a method of Java's own classes */
  | { kind: 'builtin'; name: string };

/** Java's own methods that can be used as method references (Integer::sum, String::length...). */
const BUILTIN_REFS = new Set([
  'Integer::sum', 'Integer::max', 'Integer::min', 'Integer::compare', 'Integer::parseInt', 'Integer::intValue', 'Integer::valueOf',
  'Double::sum', 'Double::max', 'Double::min', 'Double::compare',
  'String::length', 'String::toUpperCase', 'String::toLowerCase', 'String::trim', 'String::isEmpty', 'String::valueOf',
]);

/**
 * A stream: where its items come from and the steps they will go through. Nothing runs until the
 * last call (collect, sum, forEach...), and then each item goes through all the steps before the next
 * one starts, like Java (sorted waits for all items first).
 */
interface StreamData {
  source: JVal[];
  /** IntStream / DoubleStream (numbers that are not objects); undefined for a Stream of objects */
  prim?: 'int' | 'double';
  ops: StreamOp[];
}
type StreamOp =
  | { k: 'filter' | 'peek'; f: JFunc }
  | { k: 'map'; f: JFunc; to: 'int' | 'double' | 'obj' }
  | { k: 'boxed' | 'asDouble' | 'distinct' }
  | { k: 'sorted'; cmp?: JFunc }
  | { k: 'limit' | 'skip'; n: number };
/** One step of a running stream (Java's Sink): takes items, is told the end, and can ask to stop early. */
interface Sink {
  accept(x: JVal): void;
  end(): void;
  cancel(): boolean;
}

/** A HashMap / TreeMap / LinkedHashMap: entries by key id, in the order they were put in, and the table size. */
export interface MapData {
  entries: Map<string, [JVal, JVal]>;
  cap: number;
}
const MAP_KINDS: Record<string, 'hash' | 'tree' | 'linked'> = { HashMap: 'hash', TreeMap: 'tree', LinkedHashMap: 'linked' };
const MAP_TYPES = new Set(['Map', 'HashMap', 'TreeMap', 'LinkedHashMap']);
/** HashSet is a HashMap of keys in Java: the same order when printed. */
const SET_KINDS: Record<string, 'hash' | 'tree' | 'linked'> = { HashSet: 'hash', TreeSet: 'tree', LinkedHashSet: 'linked' };
const SET_TYPES = new Set(['Set', 'HashSet', 'TreeSet', 'LinkedHashSet']);
/** Which key: "String:Sam", "int:3" (an Integer 3 and a Long 3 are different keys, as in Java). */
const keyId = (k: JVal) => (k.v === null ? 'null' : `${k.t}:${String(k.v)}`);

/** Java's hashCode for keys (String, Integer, Long, Double, Character, Boolean). */
function javaHash(k: JVal): number {
  if (k.v === null) return 0;
  switch (k.t) {
    case 'String': {
      let h = 0;
      for (const ch of k.v as string) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0;
      return h;
    }
    case 'char':
      return (k.v as string).charCodeAt(0);
    case 'boolean':
      return k.v ? 1231 : 1237;
    case 'long': {
      const b = typeof k.v === 'bigint' ? k.v : BigInt(Math.trunc(k.v as number));
      return Number(BigInt.asIntN(32, b ^ (BigInt.asUintN(64, b) >> 32n)));
    }
    case 'double': {
      const view = new DataView(new ArrayBuffer(8));
      view.setFloat64(0, k.v as number);
      return (view.getInt32(0) ^ view.getInt32(4)) | 0;
    }
    default:
      return (k.v as number) | 0;
  }
}
/** The map's entries in Java's order: by key (TreeMap), as put in (LinkedHashMap), or by hash bucket (HashMap). */
function mapOrder(m: JVal, compare: (a: JVal, b: JVal) => number): [JVal, JVal][] {
  const data = m.v as MapData;
  const list = [...data.entries.values()];
  if (m.kind === 'tree') return list.sort(([a], [b]) => compare(a, b));
  if (m.kind === 'linked') return list;
  const bucket = (k: JVal) => {
    const h = javaHash(k);
    return (h ^ (h >>> 16)) & (data.cap - 1);
  };
  return list.map((e, i) => [e, bucket(e[0]), i] as const).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map(([e]) => e);
}
/** HashMap's table size for a wanted number of places (the next power of two). */
const tableSizeFor = (n: number) => {
  let c = 1;
  while (c < n) c *= 2;
  return c;
};

/** An object of one of the program's classes: its class name and its fields. */
export interface JObject {
  cls: string;
  fields: Map<string, { t: JType; elem?: Prim; box?: boolean; cls?: string; v: JVal | symbol }>;
}

/** The exceptions StepViz knows, each with its parent (catch (RuntimeException e) also catches an ArithmeticException). */
const EXCEPTION_PARENT: Record<string, string | null> = {
  Throwable: null,
  Exception: 'Throwable',
  RuntimeException: 'Exception',
  ArithmeticException: 'RuntimeException',
  IndexOutOfBoundsException: 'RuntimeException',
  ArrayIndexOutOfBoundsException: 'IndexOutOfBoundsException',
  StringIndexOutOfBoundsException: 'IndexOutOfBoundsException',
  NullPointerException: 'RuntimeException',
  IllegalArgumentException: 'RuntimeException',
  NumberFormatException: 'IllegalArgumentException',
  IllegalStateException: 'RuntimeException',
  UnsupportedOperationException: 'RuntimeException',
  NegativeArraySizeException: 'RuntimeException',
  NoSuchElementException: 'RuntimeException',
  InputMismatchException: 'NoSuchElementException',
  ConcurrentModificationException: 'RuntimeException',
  IllegalFormatException: 'IllegalArgumentException',
  IllegalFormatConversionException: 'IllegalFormatException',
  MissingFormatArgumentException: 'IllegalFormatException',
};
const JAVA_UTIL = new Set(['NoSuchElementException', 'InputMismatchException', 'ConcurrentModificationException', 'IllegalFormatException', 'IllegalFormatConversionException', 'MissingFormatArgumentException']);
/** Exceptions Java makes you catch or declare (throws): Exception and Throwable themselves. */
const CHECKED = new Set(['Exception', 'Throwable']);
function isA(type: string, ancestor: string): boolean {
  for (let t: string | null = type; t; t = EXCEPTION_PARENT[t] ?? null) if (t === ancestor) return true;
  return false;
}

/** Integer, Double... : the box types an ArrayList holds, and the value type inside. */
const WRAPPERS: Record<string, Prim> = { Integer: 'int', Long: 'long', Double: 'double', Boolean: 'boolean', Character: 'char', String: 'String' };
const WRAPPER_OF: Record<Prim, string> = { int: 'Integer', long: 'Long', double: 'Double', boolean: 'Boolean', char: 'Character', String: 'String' };

/**
 * A Java value with its type. char values hold the character as a string.
 * Arrays: t = 'array', v = the elements, elem = element type.
 * ArrayList: t = 'list', v = the elements, elem = the value type inside the boxes
 * (Integer -> 'int'), mod = how many times it was changed (for for-each loops).
 * Strings, arrays, lists and boxed values carry an identity (id), so == compares
 * objects like Java: the same text written in the program is one shared object;
 * text built while the program runs is a new object each time. A boxed value
 * (boxed: true) is an Integer, Double... object; small Integers are shared, like
 * Java's cache (-128 to 127).
 */
export interface JVal {
  t: JType;
  v: number | bigint | boolean | string | null | JVal[] | JObject | MapData | [JVal, JVal] | JFunc | StreamData | JVal;
  elem?: Prim;
  id?: string | number;
  boxed?: boolean;
  mod?: number;
  /** exception: its class (v is the message, or null); object: its class (v is the object, or null) */
  cls?: string;
  /** map: key type (elem is the value type) and which kind of map */
  kt?: Prim;
  kind?: 'hash' | 'tree' | 'linked';
  /** keySet() / values() / entrySet(): the map they show (a for-each over them watches it) */
  src?: JVal;
  /** a list from stream.toList(): it can only be read (changing it is an UnsupportedOperationException) */
  fixed?: boolean;
}

/** Arrays and lists of the program's objects keep the class name as their item type (Dog[]: elem 'Dog'). */
const isClassItem = (elem: Prim | undefined): boolean => !!elem && classNames.has(elem);
/** The name of an item type, for messages: Integer, Double, Dog... */
const typeName = (elem: Prim | undefined) => (elem ? WRAPPER_OF[elem] ?? elem : 'Integer');
/** println(dog): the program's own toString() if it has one (set by the interpreter for each run). */
let objectToText: (v: JVal) => string = (v) => defaultObjectText(v);
function defaultObjectText(v: JVal): string {
  const hash = (0x1b6d3586 + Number(v.id ?? 0) * 0x9e37) >>> 0;
  // The object's own class, even in an Animal box (Java prints Dog@...).
  return `${(v.v as JObject | null)?.cls ?? v.cls}@${hash.toString(16)}`;
}
/** How an object shows in a frame: Dog {name: "Rex", age: 3} (an object inside it: Node {…}). */
function objectFrameText(x: JVal, depth: number): string {
  if (x.v === null) return 'null';
  const o = x.v as JObject;
  if (depth > 0) return `${o.cls} {…}`;
  const parts = [...o.fields].map(([k, c]) => {
    const v = c.v;
    if (typeof v === 'symbol') return `${k}: ?`;
    return `${k}: ${v.t === 'object' ? objectFrameText(v, depth + 1) : formatJava(v)}`;
  });
  return `${o.cls} {${parts.join(', ')}}`;
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

const ARRAY_CODE: Record<string, string> = { int: 'I', long: 'J', double: 'D', boolean: 'Z', char: 'C', String: 'Ljava.lang.String;' };
/** Java's code for an item type in [I@... : I, [I (a row of an int[][]), LDog; */
const arrayCode = (elem: string): string => (elem.endsWith('[]') ? `[${arrayCode(elem.slice(0, -2))}` : ARRAY_CODE[elem] ?? `L${elem};`);
/** How many [] a type has: int[][] -> 2. */
const depthOf = (n: Node | null | undefined) => (n?.text.match(/\[/g) ?? []).length;

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
      if (val.v === null) return 'null';
      // Printing an array shows its type and an id, like Java ([I@1b6d3586).
      const hash = (0x1b6d3586 + Number(val.id ?? 0) * 0x9e37) >>> 0;
      return `[${arrayCode(val.elem ?? 'int')}@${hash.toString(16)}`;
    }
    case 'list':
      return arrayText(val);
    case 'Scanner':
      return 'java.util.Scanner';
    case 'object':
      return val.v === null ? 'null' : objectToText(val);
    case 'set':
      return val.v === null ? 'null' : `[${mapOrder(val, compareKeys).map(([k]) => javaString(k)).join(', ')}]`;
    case 'map':
      return val.v === null ? 'null' : `{${mapOrder(val, compareKeys).map(([k, v]) => `${javaString(k)}=${javaString(v)}`).join(', ')}}`;
    case 'entry': {
      const [k, v] = val.v as [JVal, JVal];
      return `${javaString(k)}=${javaString(v)}`;
    }
    case 'exception':
      if (val.cls === undefined) return 'null';
      return `${JAVA_UTIL.has(val.cls!) ? 'java.util' : 'java.lang'}.${val.cls}${val.v === null ? '' : `: ${val.v}`}`;
    case 'optional': {
      // Optional[5] / OptionalInt[5] / OptionalDouble[2.5] / Optional.empty
      const kind = val.elem === 'int' ? 'OptionalInt' : val.elem === 'double' ? 'OptionalDouble' : 'Optional';
      return val.v === null ? `${kind}.empty` : `${kind}[${javaString(val.v as JVal)}]`;
    }
    default:
      if (val.v === null) return 'null';
      return String(val.v);
  }
}

/** DoubleStream.sum(): Java adds with Kahan's compensation (Collectors.sumWithCompensation / computeFinalSum). */
function kahanSum(xs: number[]): number {
  let sum = 0;
  let comp = 0;
  let simple = 0;
  for (const x of xs) {
    const tmp = x - comp;
    const velvel = sum + tmp;
    comp = velvel - sum - tmp;
    sum = velvel;
    simple += x;
  }
  const total = sum - comp;
  return Number.isNaN(total) && !Number.isFinite(simple) ? simple : total;
}

/** TreeMap order: numbers by size, text by character codes. */
const compareKeys = (a: JVal, b: JVal): number =>
  a.t === 'String' ? compareText(a.v as string, b.v as string) : a.t === 'char' ? (a.v as string).charCodeAt(0) - (b.v as string).charCodeAt(0) : Number(a.v) - Number(b.v);

/** String.compareTo: the difference of the first different character codes, else of the lengths. */
function compareText(a: string, b: string): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a.charCodeAt(i) - b.charCodeAt(i);
  return a.length - b.length;
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
  if ((x.t === 'array' || x.t === 'list') && x.v === null) return 'null';
  if (x.t === 'array' || x.t === 'list') return formatJava(x.v);
  if (x.t === 'Scanner') return 'Scanner';
  if (x.t === 'object') return objectFrameText(x, 0);
  if (x.t === 'func') return (x.v as JFunc).kind === 'lambda' ? 'lambda' : 'Comparator';
  if (x.t === 'set') return x.v === null ? 'null' : `{${mapOrder(x, compareKeys).map(([k]) => formatJava(k)).join(', ')}}`;
  if (x.t === 'map') return x.v === null ? 'null' : `{${mapOrder(x, compareKeys).map(([k, v]) => `${formatJava(k)}: ${formatJava(v)}`).join(', ')}}`;
  if (x.t === 'entry') {
    const [k, v] = x.v as [JVal, JVal];
    return `${formatJava(k)}=${formatJava(v)}`;
  }
  if (x.t === 'exception') return x.cls === undefined ? 'null' : x.v === null ? x.cls : `${x.cls}: ${x.v}`;
  return javaString(x);
}

const int = (n: number): JVal => ({ t: 'int', v: n | 0 });
/**
 * A long: an exact 64-bit whole number that wraps like Java's. It is kept as a plain number while it
 * fits exactly (up to 2^53) and as a bigint beyond that, so most of the program never sees a bigint.
 */
const MAX_EXACT = BigInt(Number.MAX_SAFE_INTEGER);
function long64(b: bigint): number | bigint {
  const w = BigInt.asIntN(64, b);
  return w >= -MAX_EXACT && w <= MAX_EXACT ? Number(w) : w;
}
const lng = (b: bigint): JVal => ({ t: 'long', v: long64(b) });
/** The exact whole number in an int, long or char value. */
const bigOf = (v: JVal): bigint => (v.t === 'char' ? BigInt((v.v as string).charCodeAt(0)) : typeof v.v === 'bigint' ? v.v : BigInt(Math.trunc(v.v as number)));
const dbl = (n: number): JVal => ({ t: 'double', v: n });
const bool = (b: boolean): JVal => ({ t: 'boolean', v: b });
const str = (s: string, id: string | number = freshId()): JVal => ({ t: 'String', v: s, id });
const VOID: JVal = { t: 'void', v: null };

/** Autoboxing: an int becomes an Integer object. Small values share one object, like Java's cache. */
function box(v: JVal): JVal {
  if (v.boxed || !['int', 'long', 'double', 'boolean', 'char'].includes(v.t)) return v;
  const n = v.t === 'char' ? (v.v as string).charCodeAt(0) : (v.v as number);
  const cached =
    v.t === 'boolean' || ((v.t === 'int' || v.t === 'long') && n >= -128 && n <= 127) || (v.t === 'char' && n <= 127);
  return { t: v.t, v: v.v, boxed: true, id: cached ? `B:${v.t}:${String(v.v)}` : freshId() };
}
/** Unboxing: an Integer object gives its int (null cannot be unboxed). */
function unbox(v: JVal): JVal {
  if (!v.boxed || v.t === 'String') return v;
  if (v.v === null) throw new JavaException('NullPointerException', `Cannot unbox a null ${WRAPPER_OF[v.t as Prim] ?? 'value'}`);
  return { t: v.t, v: v.v };
}
/** Integer.equals, String.equals...: same kind of value and the same value. */
const sameValue = (a: JVal, b: JVal) => (a.v === null || b.v === null ? a.v === b.v : a.t === b.t && a.v === b.v);
const NULL: JVal = { t: 'null', v: null };

/** Default value of a new array element. */
function zeroOf(t: Prim): JVal {
  if (t.endsWith('[]')) return { t: 'array', v: null as unknown as JVal[], elem: t.slice(0, -2) as Prim };
  if (classNames.has(t)) return { t: 'object', cls: t, v: null };
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
    /** thrown by the program's own throw statement, with the exception object */
    public value?: JVal,
  ) {
    super(message);
    this.name = javaType;
  }
  /** The exception object a catch part receives (message '' means none: getMessage() gives null). */
  object(): JVal {
    return this.value ?? { t: 'exception', v: this.message === '' ? null : this.message, cls: this.javaType in EXCEPTION_PARENT ? this.javaType : 'RuntimeException' };
  }
}

class ReturnSignal {
  constructor(public value: JVal) {}
}
class BreakSignal {}
/** yield 31; in a switch that gives a value */
class YieldSignal {
  constructor(public value: JVal) {}
}
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
  enum_declaration: 'enums',
  record_declaration: 'records',
  field_declaration: 'variables outside methods',
  constructor_declaration: 'constructors',
  try_with_resources_statement: 'try with resources',
  labeled_statement: 'labels',
  synchronized_statement: 'synchronized',
  assert_statement: 'assert',
  local_class_declaration: 'classes inside methods',
  class_declaration: 'classes inside methods',
};

const IMPORTS = new Set([
  'java.util.Scanner', 'java.util.Arrays', 'java.util.ArrayList', 'java.util.List', 'java.util.Collections', 'java.util.*',
  'java.util.InputMismatchException', 'java.util.NoSuchElementException', 'java.util.ConcurrentModificationException',
  'java.util.Map', 'java.util.HashMap', 'java.util.TreeMap', 'java.util.LinkedHashMap', 'java.util.Map.Entry',
  'java.util.Set', 'java.util.HashSet', 'java.util.TreeSet', 'java.util.LinkedHashSet',
  'java.util.stream.Collectors', 'java.util.stream.IntStream', 'java.util.stream.Stream', 'java.util.stream.*', 'java.util.Optional',
]);
const ALLOWED_TYPES = new Set([
  'int', 'long', 'double', 'float', 'boolean', 'char', 'short', 'byte', 'String', 'void', 'Scanner',
  'Integer', 'Long', 'Double', 'Boolean', 'Character', 'ArrayList', 'List', 'Map', 'HashMap', 'TreeMap', 'LinkedHashMap',
  'Set', 'HashSet', 'TreeSet', 'LinkedHashSet', 'var', 'Comparator',
  ...Object.keys(EXCEPTION_PARENT),
]);
const LIST_TYPES = new Set(['ArrayList', 'List', ...SET_TYPES]);

/** ArrayList<Integer>, List<String>, ArrayList<> (after new): checks the box type inside. */
function checkGeneric(n: Node) {
  const base = named(n)[0];
  const args = named(named(n)[1]);
  if (base?.text === 'Comparator') {
    // Comparator<Student> byScore = (a, b) -> ...;
    if (args.length !== 1 || (!(args[0].text in WRAPPERS) && !classNames.has(args[0].text))) throw unsupported(n, `the type ${n.text}`);
    return;
  }
  // HashMap<String, Integer>, Map.Entry<String, Integer>: two box types.
  if (base && (MAP_TYPES.has(base.text) || base.text === 'Map.Entry')) {
    if (args.length === 0 && n.parent?.type === 'object_creation_expression') return;
    if (args.length !== 2) throw unsupported(n, `the type ${n.text}`);
    for (const arg of args) {
      if (arg.type === 'generic_type' || arg.type === 'array_type') throw unsupported(n, 'maps of lists');
      if (arg.type === 'integral_type' || arg.type === 'floating_point_type' || arg.type === 'boolean_type') {
        const w = arg.text === 'char' ? 'Character' : arg.text === 'int' ? 'Integer' : arg.text.charAt(0).toUpperCase() + arg.text.slice(1);
        throw new CompileError(lineOf(n), `A ${base.text} holds objects, not ${arg.text} values: write ${w} instead of ${arg.text}.`);
      }
      if (!(arg.text in WRAPPERS) && !classNames.has(arg.text)) throw unsupported(n, `the type ${n.text}`);
    }
    if (classNames.has(args[0].text)) throw unsupported(n, `maps with ${args[0].text} keys`);
    return;
  }
  if (!base || !LIST_TYPES.has(base.text)) throw unsupported(n, `the type ${n.text}`);
  if (args.length === 0 && n.parent?.type === 'object_creation_expression') return;
  if (args.length !== 1) throw unsupported(n, `the type ${n.text}`);
  const arg = args[0];
  if (arg.type === 'generic_type') throw unsupported(n, 'lists of lists');
  if (arg.type === 'array_type') throw unsupported(n, 'lists of arrays');
  if (arg.type === 'integral_type' || arg.type === 'floating_point_type' || arg.type === 'boolean_type') {
    const w = arg.text === 'char' ? 'Character' : arg.text === 'int' ? 'Integer' : arg.text.charAt(0).toUpperCase() + arg.text.slice(1);
    throw new CompileError(lineOf(n), `An ${base.text} holds objects, not ${arg.text} values: write ${base.text}<${w}>.`);
  }
  if (!(arg.text in WRAPPERS) && !classNames.has(arg.text)) throw unsupported(n, `the type ${n.text}`);
  if (SET_TYPES.has(base.text) && classNames.has(arg.text)) throw unsupported(n, `sets of ${arg.text} objects`);
}

/** A class of the program: Main, or a class of its own (class Dog { ... }). */
export interface ClassInfo {
  name: string;
  node: Node;
  fields: { name: string; type: DeclType; init: Node | null; declarator: Node; isPrivate: boolean }[];
  constructors: Node[];
  methods: Map<string, Node>;
  /** class Dog extends Animal: "Animal" */
  parent: string | null;
  isAbstract: boolean;
  /** interface Shape { ... } */
  isInterface?: boolean;
  /** implements Shape, Comparable / interface A extends B */
  interfaces?: string[];
  /** methods an interface (or abstract class) only promises: no body */
  promises?: Set<string>;
  /** static int count = 0;  (shown in the "static" frame as count for Main, Dog.count for others) */
  statics?: { name: string; type: DeclType; init: Node | null; declarator: Node; isPrivate: boolean; isFinal: boolean; shown: string }[];
  /** a static class written inside Main (it can use Main's statics by name) */
  insideMain?: boolean;
}

/** Comparable<T>: Java's own interface; Collections.sort calls its compareTo. */
const COMPARABLE: ClassInfo = { name: 'Comparable', node: null as unknown as Node, fields: [], constructors: [], methods: new Map(), parent: null, isAbstract: true, isInterface: true, interfaces: [], promises: new Set(['compareTo']) };

/** All classes of the program (set by checkSubset), for inheritance. */
let classInfos = new Map<string, ClassInfo>();
/** Is a Dog an Animal? (the same class, or a class further down) */
function isSubclass(cls: string, ancestor: string): boolean {
  // Up through extends and implements (a Circle is a Shape if it implements Shape).
  const todo = [cls];
  const seen = new Set<string>();
  while (todo.length) {
    const c = todo.pop()!;
    if (c === ancestor) return true;
    if (seen.has(c)) continue;
    seen.add(c);
    const info = classInfos.get(c);
    if (info?.parent) todo.push(info.parent);
    todo.push(...(info?.interfaces ?? []));
  }
  return false;
}
/** The interfaces a class has, with the ones they extend (and those of the classes above). */
function interfacesOf(cls: string): ClassInfo[] {
  const out: ClassInfo[] = [];
  const todo = [cls];
  const seen = new Set<string>();
  while (todo.length) {
    const info = classInfos.get(todo.shift()!);
    if (!info || seen.has(info.name)) continue;
    seen.add(info.name);
    if (info.isInterface) out.push(info);
    if (info.parent) todo.push(info.parent);
    todo.push(...(info.interfaces ?? []));
  }
  return out;
}
/**
 * A method by name: the class's own (or a class above), else an interface's default method;
 * else the method an abstract class or interface only promises (no body).
 */
function findMethod(cls: string, name: string): { owner: ClassInfo; m: Node } | null {
  let promised: { owner: ClassInfo; m: Node } | null = null;
  for (let c = classInfos.get(cls); c; c = c.parent ? classInfos.get(c.parent) : undefined) {
    const m = c.methods.get(name);
    if (m && m.childForFieldName('body')) return { owner: c, m };
    if (m) promised ??= { owner: c, m };
  }
  for (const i of interfacesOf(cls)) {
    const m = i.methods.get(name);
    if (m && m.childForFieldName('body')) return { owner: i, m };
    if (m) promised ??= { owner: i, m };
  }
  return promised;
}
/** Fields of a class and the classes above it, the top class's first (the order Java builds them). */
function allFields(cls: string): (ClassInfo['fields'][number] & { owner: string })[] {
  const chain: ClassInfo[] = [];
  for (let c = classInfos.get(cls); c; c = c.parent ? classInfos.get(c.parent) : undefined) chain.unshift(c);
  return chain.flatMap((c) => c.fields.map((f) => ({ ...f, owner: c.name })));
}
const isAbstractMember = (m: Node) => /\babstract\b/.test(m.namedChildren.find((c) => c?.type === 'modifiers')?.text ?? '');

const isStaticMember = (m: Node) => /\bstatic\b/.test(m.namedChildren.find((c) => c?.type === 'modifiers')?.text ?? '');
const isPrivateMember = (m: Node) => /\bprivate\b/.test(m.namedChildren.find((c) => c?.type === 'modifiers')?.text ?? '');

/** The program's own class names (set by checkSubset, for types like Dog and Dog[]). */
let classNames = new Set<string>();
/** Names a class of the program can't take, because StepViz already gives them a meaning. */
const TAKEN_NAMES = new Set([...ALLOWED_TYPES, 'Math', 'System', 'Arrays', 'Collections', 'Object', 'Main', 'Collectors', 'IntStream', 'Stream', 'Optional']);

function checkSubset(tree: Tree): { main: Node; methods: Map<string, Node>; classes: Map<string, ClassInfo> } {
  const root = tree.rootNode;
  const top = named(root);
  for (const n of top) {
    if (n.type === 'import_declaration') {
      const what = n.text.replace(/^import\s+/, '').replace(/\s*;\s*$/, '').replace(/\s+/g, '');
      if (!IMPORTS.has(what)) throw unsupported(n, `the import ${what}`);
      continue;
    }
    if (n.type !== 'class_declaration' && n.type !== 'interface_declaration') throw unsupported(n, FEATURES[n.type] ?? n.type.replace(/_/g, ' '));
  }
  const interfaceNodes = [
    ...top.filter((n) => n.type === 'interface_declaration'),
    ...named(top.find((n) => n.type === 'class_declaration' && n.childForFieldName('name')?.text === 'Main')?.childForFieldName('body')).filter((n) => n.type === 'interface_declaration'),
  ];
  const topClasses = top.filter((n) => n.type === 'class_declaration');
  const NEED_MAIN = 'StepViz needs a public class Main with a main method.';
  const mainClass = topClasses.find((c) => c.childForFieldName('name')?.text === 'Main');
  if (!mainClass) throw new CompileError(topClasses[0] ? lineOf(topClasses[0]) : 1, NEED_MAIN);
  const modifiersOf = (c: Node) => c.namedChildren.find((x) => x?.type === 'modifiers')?.text ?? '';
  // Other classes: next to Main (class Dog { }), or inside it as static class Dog { }.
  const others: Node[] = [];
  for (const c of topClasses) {
    if (c === mainClass) continue;
    if (/\bpublic\b/.test(modifiersOf(c))) {
      throw new CompileError(lineOf(c), `Only one class in a file can be public: remove public from class ${c.childForFieldName('name')!.text}.`);
    }
    others.push(c);
  }
  for (const member of named(mainClass.childForFieldName('body'))) {
    if (member.type !== 'class_declaration') continue;
    if (!/\bstatic\b/.test(modifiersOf(member))) throw unsupported(member, 'inner classes (write static class instead)');
    others.push(member);
  }
  classNames = new Set([...others, ...interfaceNodes].map((c) => c.childForFieldName('name')!.text));

  const classes = new Map<string, ClassInfo>();
  // interface Shape extends Named { double area(); default String label() { ... } }
  for (const n of interfaceNodes) {
    const name = n.childForFieldName('name')!.text;
    if (TAKEN_NAMES.has(name)) throw unsupported(n, `an interface called ${name}`);
    if (classes.has(name)) throw unsupported(n, 'two classes with the same name');
    if (n.childForFieldName('type_parameters')) throw unsupported(n, 'generic interfaces');
    const ext = named(n).find((x) => x.type === 'extends_interfaces');
    const parents = named(named(ext)[0]).map((t) => t.text);
    const info: ClassInfo = { name, node: n, fields: [], constructors: [], methods: new Map(), parent: null, isAbstract: true, isInterface: true, interfaces: parents, promises: new Set() };
    for (const member of named(n.childForFieldName('body'))) {
      if (member.type === 'constant_declaration') throw unsupported(member, 'constants in interfaces');
      if (member.type !== 'method_declaration') throw unsupported(member, FEATURES[member.type] ?? member.type.replace(/_/g, ' '));
      const m = member.childForFieldName('name')!.text;
      if (info.methods.has(m)) throw unsupported(member, 'two methods with the same name');
      if (!member.childForFieldName('body')) info.promises!.add(m);
      else if (!/\b(default|static|private)\b/.test(member.namedChildren.find((c) => c?.type === 'modifiers')?.text ?? '')) {
        throw new CompileError(lineOf(member), `A method with a body in an interface needs the word default (default ${member.childForFieldName('type')?.text} ${m}() { ... }).`);
      }
      info.methods.set(m, member);
    }
    classes.set(name, info);
  }
  let usesComparable = false;
  for (const c of [mainClass, ...others]) {
    const name = c.childForFieldName('name')!.text;
    if (c !== mainClass && TAKEN_NAMES.has(name)) throw unsupported(c, `a class called ${name}`);
    if (classes.has(name)) throw unsupported(c, 'two classes with the same name');
    const superclass = c.childForFieldName('superclass');
    const parent = superclass ? named(superclass)[0]?.text ?? null : null;
    if (parent && (c === mainClass || !classNames.has(parent))) throw unsupported(c, parent && !classNames.has(parent) ? `extending ${parent}` : 'Main extending another class');
    // implements Shape, Comparable<Dog>
    const implemented: string[] = [];
    for (const t of named(named(c.childForFieldName('interfaces'))[0])) {
      if (t.type === 'generic_type' && named(t)[0]?.text === 'Comparable') {
        if (named(named(t)[1])[0]?.text !== name) throw unsupported(t, `Comparable<${named(named(t)[1])[0]?.text}> (write Comparable<${name}>)`);
        implemented.push('Comparable');
        usesComparable = true;
        continue;
      }
      if (!classes.get(t.text)?.isInterface) throw unsupported(t, classNames.has(t.text) ? `implements ${t.text} (${t.text} is a class: use extends)` : `the interface ${t.text}`);
      implemented.push(t.text);
    }
    if (c === mainClass && implemented.length) throw unsupported(c, 'Main implementing an interface');
    if (c.childForFieldName('type_parameters')) throw unsupported(c, 'generic classes');
    const info: ClassInfo = { name, node: c, fields: [], constructors: [], methods: new Map(), parent, isAbstract: /\babstract\b/.test(modifiersOf(c)), interfaces: implemented, statics: [], insideMain: c.parent?.parent?.id === mainClass.id };
    for (const member of named(c.childForFieldName('body'))) {
      if (member.type === 'class_declaration') {
        if (c === mainClass) continue; // handled above
        throw unsupported(member, 'classes inside classes other than Main');
      }
      if (member.type === 'method_declaration') {
        if (c === mainClass && !isStaticMember(member)) throw unsupported(member, 'methods that are not static');
        const m = member.childForFieldName('name')!.text;
        if (!member.childForFieldName('body')) {
          // abstract String speak();  only in an abstract class
          if (!isAbstractMember(member)) throw new CompileError(lineOf(member), `${m} needs a body { ... }, or the word abstract.`);
          if (!info.isAbstract) throw new CompileError(lineOf(member), `${name} has an abstract method, so it must be an abstract class (abstract class ${name}).`);
        }
        if (info.methods.has(m)) throw unsupported(member, 'two methods with the same name');
        info.methods.set(m, member);
        continue;
      }
      if (member.type === 'constructor_declaration' && c !== mainClass) {
        if (member.childForFieldName('name')?.text !== name) throw new CompileError(lineOf(member), `A constructor must have the class name, ${name}.`);
        info.constructors.push(member);
        continue;
      }
      if (member.type === 'field_declaration' && isStaticMember(member)) {
        // static int count = 0;  static final int MAX = 10;
        const isFinal = /\bfinal\b/.test(member.namedChildren.find((x) => x?.type === 'modifiers')?.text ?? '');
        for (const d of member.childrenForFieldName('declarator')) {
          if (!d) continue;
          const fname = d.childForFieldName('name')!.text;
          if (isFinal && !d.childForFieldName('value')) throw new CompileError(lineOf(d), `${fname} is final, so it needs a value here (final ... ${fname} = ...;).`);
          info.statics!.push({ name: fname, type: declType(member.childForFieldName('type'), d), init: d.childForFieldName('value'), declarator: d, isPrivate: isPrivateMember(member), isFinal, shown: c === mainClass ? fname : `${name}.${fname}` });
        }
        continue;
      }
      if (member.type === 'field_declaration' && c === mainClass) throw unsupported(member, 'fields in Main that are not static (write static before them)');
      if (member.type === 'field_declaration' && c !== mainClass) {
        for (const d of member.childrenForFieldName('declarator')) {
          if (!d) continue;
          info.fields.push({ name: d.childForFieldName('name')!.text, type: declType(member.childForFieldName('type'), d), init: d.childForFieldName('value'), declarator: d, isPrivate: isPrivateMember(member) });
        }
        continue;
      }
      throw unsupported(member, FEATURES[member.type] ?? member.type.replace(/_/g, ' '));
    }
    classes.set(name, info);
  }
  if (usesComparable) classes.set('Comparable', COMPARABLE);
  classInfos = classes;
  for (const info of [...classes.values()].filter((i) => i.isInterface)) {
    for (const p of info.interfaces ?? []) if (!classes.get(p)?.isInterface) throw unsupported(info.node, `the interface ${p}`);
  }
  for (const info of [...classes.values()].filter((i) => !i.isInterface)) {
    // No class may be its own ancestor; a field may not reuse a name from a class above it.
    const seen = new Set<string>();
    for (let p = info.parent; p; p = classes.get(p)?.parent ?? null) {
      if (seen.has(p) || p === info.name) throw new CompileError(lineOf(info.node), `${info.name} can't extend itself, even through other classes.`);
      seen.add(p);
      const above = classes.get(p)!;
      const clash = info.fields.find((f) => above.fields.some((g) => g.name === f.name));
      if (clash) throw unsupported(clash.declarator, `a field with the same name as one in ${p}`);
    }
    // A method an interface promises must be public in the class (Java's rule).
    for (const i of interfacesOf(info.name)) {
      for (const mName of i.promises ?? []) {
        const own = info.methods.get(mName);
        if (own && !/\bpublic\b/.test(own.namedChildren.find((x) => x?.type === 'modifiers')?.text ?? '')) {
          throw new CompileError(lineOf(own), `${mName}() must be public in ${info.name}, because ${i.name} makes it public (write public before it).`);
        }
      }
    }
    // A class that is not abstract must have every method an interface or a class above it only promises.
    if (!info.isAbstract) {
      for (const i of interfacesOf(info.name)) {
        for (const mName of i.promises ?? []) {
          if (!findMethod(info.name, mName)?.m.childForFieldName('body')) {
            throw new CompileError(lineOf(info.node), `${info.name} must have its own ${mName}() method, because ${i.name} only promises it.`);
          }
        }
      }
      for (let p = info.parent; p; p = classes.get(p)?.parent ?? null) {
        for (const [mName, m] of classes.get(p)!.methods) {
          if (m.childForFieldName('body')) continue;
          const found = findMethod(info.name, mName);
          if (!found?.m.childForFieldName('body')) {
            throw new CompileError(lineOf(info.node), `${info.name} must have its own ${mName}() method, because ${p} only promises it (abstract).`);
          }
        }
      }
    }
  }
  const methods = classes.get('Main')!.methods;
  const main = methods.get('main');
  const params = named(main?.childForFieldName('parameters'));
  const okMain =
    main &&
    main.childForFieldName('type')?.text === 'void' &&
    params.length === 1 &&
    /^String\s*\[\s*\]$|^String\.\.\.$/.test(params[0].childForFieldName('type')?.text ?? '');
  if (!main || !okMain) throw new CompileError(main ? lineOf(main) : lineOf(mainClass), NEED_MAIN);

  // Everything inside the methods, constructors and fields must be in the supported subset.
  const allowed = (t: string) => ALLOWED_TYPES.has(t) || classNames.has(t);
  const bodies = [...classes.values()].flatMap((c) => [...c.methods.values(), ...c.constructors]);
  for (const c of classes.values()) {
    for (const fd of named(c.node?.childForFieldName('body')).filter((x) => x.type === 'field_declaration')) {
      for (const part of named(fd)) if (part.type !== 'modifiers') visitSubset(part);
    }
  }
  for (const m of bodies) {
    const body = m.childForFieldName('body');
    if (body) visitSubset(body);
    if (m !== main) for (const p of named(m.childForFieldName('parameters'))) visitSubset(p);
    const rt = m.childForFieldName('type');
    if (rt) visitSubset(rt);
    for (const t of named(named(m).find((c) => c.type === 'throws'))) {
      if (!(t.text in EXCEPTION_PARENT)) throw unsupported(t, `the type ${t.text}`);
    }
  }
  checkExceptions(bodies, methods);
  return { main, methods, classes };

  function visitSubset(root: Node) {
    const visit = (n: Node) => {
      const feature = FEATURES[n.type];
      if (feature) throw unsupported(n, feature);
      // switch works as a statement; a switch that gives a value (int y = switch ...) does not yet.
      if (n.type === 'switch_expression' && !['block', 'switch_block_statement_group', 'switch_rule'].includes(n.parent?.type ?? '')) {
        // int days = switch (m) { ... }: Java wants every value covered, which here means a default part.
        const labels = named(n.childForFieldName('body')).flatMap((g) => named(g).filter((c) => c.type === 'switch_label'));
        if (!labels.some((l) => named(l).length === 0)) throw new CompileError(lineOf(n), 'A switch that gives a value needs a default part (default -> ...).');
      }
      if (n.type === 'yield_statement') {
        let p = n.parent;
        while (p && p.type !== 'switch_expression' && p.type !== 'method_declaration') p = p.parent;
        if (p?.type !== 'switch_expression') throw new CompileError(lineOf(n), 'yield gives the value of a switch, so it can only be inside one.');
      }
      if (n.type === 'local_variable_declaration' && n.childForFieldName('type')?.text === 'var') {
        for (const d of n.childrenForFieldName('declarator')) {
          const value = d?.childForFieldName('value');
          if (!value) throw new CompileError(lineOf(n), `var needs a value here, so Java can tell its type (var ${d?.childForFieldName('name')?.text} = ...;).`);
          if (value.type === 'null_literal') throw new CompileError(lineOf(n), "var can't start as null: write the type instead.");
          if (value.type === 'array_initializer') throw new CompileError(lineOf(n), 'var needs new int[] {...} here, not just {...}.');
        }
      }
      if (n.type === 'switch_label' && named(n).some((c) => !['decimal_integer_literal', 'character_literal', 'string_literal', 'unary_expression', 'identifier'].includes(c.type))) {
        throw unsupported(n, 'this kind of case');
      }
      if (n.type === 'type_identifier' && !allowed(n.text)) throw unsupported(n, `the type ${n.text}`);
      if (n.type === 'explicit_constructor_invocation') {
        if (n.childForFieldName('constructor')?.type !== 'super') throw unsupported(n, 'this(...) calls');
        const body = n.parent;
        if (body?.type !== 'constructor_body' || named(body)[0]?.id !== n.id) throw new CompileError(lineOf(n), 'super(...) must be the first line of a constructor.');
      }
      if (n.type === 'lambda_expression' || n.type === 'method_reference') {
        // As a value for a method (list.sort(...), forEach(...)), a Comparator variable, or Comparator.comparing(...).
        const p = n.parent;
        const declared = p?.type === 'variable_declarator' && p.parent?.childForFieldName('type')?.text.startsWith('Comparator');
        if (p?.type !== 'argument_list' && !declared) {
          throw unsupported(n, p?.type === 'variable_declarator' && p.parent?.childForFieldName('type')?.text === 'var' ? 'var with a lambda (write Comparator<...>)' : 'lambdas here');
        }
      }
      if (n.type === 'method_reference') {
        const [owner, member] = named(n);
        const ok =
          (owner?.text === 'System.out' && member?.text === 'println') ||
          (classNames.has(owner?.text ?? '') && member?.type === 'identifier') ||
          BUILTIN_REFS.has(`${owner?.text}::${member?.text}`);
        if (!ok) throw unsupported(n, `the method reference ${n.text}`);
      }
      if (n.type === 'instanceof_expression' && named(n).length > 2) throw unsupported(n, 'instanceof with a name (instanceof Dog d)');
      if (n.type === 'generic_type') {
        checkGeneric(n);
        return;
      }
      if (n.type === 'type_identifier' && (LIST_TYPES.has(n.text) || MAP_TYPES.has(n.text))) throw unsupported(n, MAP_TYPES.has(n.text) ? `${n.text} without the types of its keys and values (like ${n.text}<String, Integer>)` : `${n.text} without the type of its items (like ${n.text}<Integer>)`);
      if (n.type === 'array_type' && /^(Integer|Long|Double|Boolean|Character|ArrayList|List)\b/.test(n.text)) throw unsupported(n, `arrays of ${n.childForFieldName('element')!.text}`);
      if (n.type === 'object_creation_expression') {
        const type = n.childForFieldName('type');
        const isList = type?.type === 'generic_type' && ['ArrayList', 'HashMap', 'TreeMap', 'LinkedHashMap', 'HashSet', 'TreeSet', 'LinkedHashSet'].includes(named(type)[0]?.text ?? '');
        const isException = !!type && type.text in EXCEPTION_PARENT;
        if (n.childForFieldName('body') || named(n).some((x) => x.type === 'class_body')) throw unsupported(n, 'anonymous classes');
        if (type && classNames.has(type.text)) {
          // new Dog(...): a class of the program
        } else if (isException) {
          const args = named(n.childForFieldName('arguments'));
          if (args.length > 1) throw unsupported(n, 'exceptions with a cause');
        } else if (!isList && !/^new\s+Scanner\s*\(\s*System\.in\s*\)$/.test(n.text)) {
          throw unsupported(n, type?.text === 'List' || named(type)[0]?.text === 'List' ? 'new List (write new ArrayList<>())' : 'new objects');
        }
        if (isList && named(n.childForFieldName('arguments')).length > 1) throw unsupported(n, 'this kind of new ArrayList');
      }
      // Arrays.asList(...) and List.of(...) make lists that cannot grow: only as the start of a new ArrayList.
      if (n.type === 'method_invocation' && /^(Arrays\.asList|List\.of)$/.test(`${n.childForFieldName('object')?.text}.${n.childForFieldName('name')?.text}`)) {
        const creation = n.parent?.parent;
        if (n.parent?.type !== 'argument_list' || creation?.type !== 'object_creation_expression' || named(n.parent).length !== 1) {
          throw unsupported(n, `${n.childForFieldName('object')!.text}.${n.childForFieldName('name')!.text} outside new ArrayList<>(...)`);
        }
      }
      for (const c of named(n)) visit(c);
    };
    visit(root);
  }
}

/** throws Exception after a method's brackets */
const throwsChecked = (m: Node | undefined) => !!m && named(named(m).find((c) => c.type === 'throws')).some((t) => CHECKED.has(t.text));
const catchTypes = (clause: Node): Node[] => named(named(named(clause).find((c) => c.type === 'catch_formal_parameter')).find((c) => c.type === 'catch_type'));

/** Java's compile rules: Exception must be caught or declared, and a catch can't come after one that already covers it. */
function checkExceptions(bodies: Node[], methods: Map<string, Node>) {
  const handled = (n: Node): boolean => {
    let child = n;
    for (let p = n.parent; p; child = p, p = p.parent) {
      if (p.type === 'method_declaration' || p.type === 'constructor_declaration') return throwsChecked(p);
      if (p.type === 'try_statement' && p.childForFieldName('body')?.id === child.id) {
        if (named(p).some((c) => c.type === 'catch_clause' && catchTypes(c).some((t) => CHECKED.has(t.text)))) return true;
      }
    }
    return false;
  };
  const NEEDS = 'Java needs this Exception to be handled: put this line inside a try/catch, or add throws Exception after the method name and brackets.';
  for (const m of bodies) {
    const visit = (n: Node) => {
      if (n.type === 'throw_statement') {
        const what = named(n)[0];
        const type = what?.type === 'object_creation_expression' ? what.childForFieldName('type')?.text : undefined;
        if (type && CHECKED.has(type) && !handled(n)) throw new CompileError(lineOf(n), NEEDS);
      }
      if (n.type === 'method_invocation' && (!n.childForFieldName('object') || n.childForFieldName('object')?.text === 'Main')) {
        if (throwsChecked(methods.get(n.childForFieldName('name')!.text)) && !handled(n)) throw new CompileError(lineOf(n), NEEDS);
      }
      if (n.type === 'try_statement') {
        const seen: string[] = [];
        for (const c of named(n).filter((x) => x.type === 'catch_clause')) {
          for (const t of catchTypes(c)) {
            const earlier = seen.find((e) => isA(t.text, e));
            if (earlier) throw new CompileError(lineOf(c), `${t.text} is already caught by the catch part above it (catch ${earlier}).`);
          }
          seen.push(...catchTypes(c).map((t) => t.text));
        }
      }
      for (const c of named(n)) visit(c);
    };
    const body = m.childForFieldName('body');
    if (body) visit(body); // abstract methods have no body
  }
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
/** ArrayList methods that change the list (list.add(5)), and Collections methods that do (Collections.sort(list)). */
const LIST_CHANGERS = new Set(['add', 'set', 'remove', 'clear', 'addAll', 'put', 'putIfAbsent']);
const LIST_CHANGERS_STATIC = new Set(['sort', 'reverse', 'swap']);

/** list.get(i) -> ["list", i] */
function listGet(n: Node | null): [string, Node] | null {
  if (n?.type !== 'method_invocation' || n.childForFieldName('name')?.text !== 'get') return null;
  const object = n.childForFieldName('object');
  const args = named(n.childForFieldName('arguments'));
  return object?.type === 'identifier' && args.length === 1 ? [object.text, args[0]] : null;
}
/** list.set(i, v) -> ["list", i, v] */
function listSet(n: Node | null): [string, Node, Node] | null {
  if (n?.type !== 'method_invocation' || n.childForFieldName('name')?.text !== 'set') return null;
  const object = n.childForFieldName('object');
  const args = named(n.childForFieldName('arguments'));
  return object?.type === 'identifier' && args.length === 2 ? [object.text, args[0], args[1]] : null;
}
/** Collections.swap(list, i, j) -> [list, i, j] (index nodes) */
function collectionsSwap(s: Node): [string, Node, Node] | null {
  const e = s.type === 'expression_statement' ? named(s)[0] : null;
  if (e?.type !== 'method_invocation' || e.childForFieldName('object')?.text !== 'Collections' || e.childForFieldName('name')?.text !== 'swap') return null;
  const [list, x, y] = named(e.childForFieldName('arguments'));
  return list?.type === 'identifier' && x && y && safeIndex(x) && safeIndex(y) ? [list.text, x, y] : null;
}

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
      if (n.type === 'method_invocation') {
        const object = n.childForFieldName('object');
        const name = n.childForFieldName('name')?.text ?? '';
        const arg = named(n.childForFieldName('arguments'))[0];
        if ((object?.text === 'Arrays' && name === 'sort') || (object?.text === 'Collections' && LIST_CHANGERS_STATIC.has(name))) {
          if (arg?.type === 'identifier') note(arg.text, loops);
        } else if (object?.type === 'identifier' && LIST_CHANGERS.has(name)) note(object.text, loops);
      }
    }
    // (tree-sitter hands out a new wrapper per lookup: compare node ids, not objects)
    const bodyId = LOOP_TYPES.has(n.type) ? n.childForFieldName('body')?.id : undefined;
    for (const c of named(n)) visit(c, bodyId !== undefined && c.id === bodyId ? [...loops, n] : loops);
  };
  for (const m of methods.values()) {
    const body = m.childForFieldName('body');
    if (body) visit(body, []);
  }
  return { candidates, loopOf };
}

/** int temp = a[x]; a[x] = a[y]; a[y] = temp;  ->  [a, x, y] (index nodes).
 *  The same with a list: int temp = a.get(x); a.set(x, a.get(y)); a.set(y, temp); */
function tempSwap(stmts: Node[], i: number): [string, Node, Node] | null {
  const [s1, s2, s3] = stmts.slice(i, i + 3);
  const single = s1 ? collectionsSwap(s1) : null;
  if (single) return single;
  if (!s1 || !s2 || !s3 || s2.type !== 'expression_statement' || s3.type !== 'expression_statement') return null;
  const viaList = listTempSwap(s1, named(s2)[0], named(s3)[0]);
  if (viaList) return viaList;
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

function listTempSwap(s1: Node, e2: Node | undefined, e3: Node | undefined): [string, Node, Node] | null {
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
  const get1 = listGet(first);
  const set2 = listSet(e2 ?? null);
  const set3 = listSet(e3 ?? null);
  if (!temp || !get1 || !set2 || !set3) return null;
  const get2 = listGet(set2[2]);
  const [list, x] = get1;
  if (!get2 || set2[0] !== list || get2[0] !== list || set3[0] !== list || set2[1].text !== x.text || set3[1].text !== get2[1].text || set3[2].text !== temp) return null;
  return safeIndex(x) && safeIndex(get2[1]) ? [list, x, get2[1]] : null;
}

// --------------------------------------------------------------------------
// The interpreter

const UNSET = Symbol('unset');
interface Cell {
  t: JType;
  elem?: Prim;
  kt?: Prim;
  box?: boolean;
  cls?: string;
  v: JVal | typeof UNSET;
}

/** One block's variables. Names declared later in the block exist from the start (shown as "?"). */
class Scope {
  vars = new Map<string, Cell>();
  /** `top`: a lambda's own scope: it reads the variables around it, but its frame lists only its own. */
  constructor(
    public parent: Scope | null,
    public top = false,
  ) {}
  lookup(name: string): Cell | undefined {
    return this.vars.get(name) ?? this.parent?.lookup(name);
  }
  /** The variable's own scope is inside this one (below a lambda's top)? */
  ownsUpTo(name: string): boolean {
    if (this.vars.has(name)) return true;
    return !this.top && !!this.parent?.ownsUpTo(name);
  }
  names(): string[] {
    const out = this.parent && !this.top ? this.parent.names() : [];
    for (const n of this.vars.keys()) if (!out.includes(n)) out.push(n);
    return out;
  }
}

interface DeclType {
  t: JType;
  elem?: Prim;
  /** map / entry: the key type */
  kt?: Prim;
  /** Integer, Double...: a box that holds an object (or null), not a plain value */
  box?: boolean;
  /** exception boxes: the class they hold (ArithmeticException, Exception...) */
  cls?: string;
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
  // int[] / int[][] (a 2-D array is an array of rows: its items are int[] arrays).
  const rows = (depth: number) => '[]'.repeat(Math.max(0, depth - 1));
  if (typeNode.type === 'array_type') {
    const depth = depthOf(typeNode.childForFieldName('dimensions')) + depthOf(extraDims);
    return { t: 'array', elem: (primOf(typeNode.childForFieldName('element')!.text) + rows(depth)) as Prim };
  }
  if (extraDims) return { t: 'array', elem: (primOf(typeNode.text) + rows(depthOf(extraDims))) as Prim };
  if (typeNode.type === 'generic_type' && (MAP_TYPES.has(named(typeNode)[0]?.text ?? '') || named(typeNode)[0]?.text === 'Map.Entry')) {
    const [k, v] = named(named(typeNode)[1]);
    const box = (a?: Node) => (a ? WRAPPERS[a.text] ?? (a.text as Prim) : undefined);
    return { t: named(typeNode)[0].text === 'Map.Entry' ? 'entry' : 'map', kt: box(k), elem: box(v) };
  }
  if (typeNode.type === 'generic_type' && named(typeNode)[0]?.text === 'Comparator') return { t: 'func' };
  if (typeNode.type === 'generic_type' && SET_TYPES.has(named(typeNode)[0]?.text ?? '')) {
    const arg = named(named(typeNode)[1])[0];
    const elem = arg ? WRAPPERS[arg.text] ?? (arg.text as Prim) : undefined;
    return { t: 'set', kt: elem, elem };
  }
  if (typeNode.type === 'generic_type') {
    const arg = named(named(typeNode)[1])[0];
    return { t: 'list', elem: arg ? WRAPPERS[arg.text] ?? (arg.text as Prim) : undefined };
  }
  if (classNames.has(typeNode.text)) return { t: 'object', cls: typeNode.text };
  if (typeNode.text in WRAPPERS && typeNode.text !== 'String') return { t: WRAPPERS[typeNode.text], box: true };
  if (typeNode.text === 'Scanner') return { t: 'Scanner' };
  if (typeNode.text in EXCEPTION_PARENT) return { t: 'exception', cls: typeNode.text };
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

const statementsOf = (n: Node | null): Node[] => (!n ? [] : n.type === 'block' || n.type === 'constructor_body' ? named(n) : [n]);
const rangeOf = (n: Node | null): [number, number] | undefined => {
  const s = statementsOf(n);
  return s.length ? [lineOf(s[0]), s[s.length - 1].endPosition.row + 1] : undefined;
};
const inner = (n: Node | null) => (n?.type === 'parenthesized_expression' ? named(n)[0] : n!);

/** One part of a switch: its case values (none for default), its statements, whether it is an arrow rule. */
interface SwitchPart {
  values: Node[];
  isDefault: boolean;
  body: Node[];
  rule: boolean;
}
function switchParts(s: Node): SwitchPart[] {
  return named(s.childForFieldName('body')).filter((g) => g.type === 'switch_block_statement_group' || g.type === 'switch_rule').map((g) => {
    const labels = named(g).filter((c) => c.type === 'switch_label');
    const body = named(g).filter((c) => c.type !== 'switch_label' && !c.type.endsWith('comment'));
    return {
      values: labels.flatMap((l) => named(l)),
      isDefault: labels.some((l) => named(l).length === 0),
      body: g.type === 'switch_rule' ? statementsOf(body[0] ?? null) : body,
      rule: g.type === 'switch_rule',
    };
  });
}
/** [label, first line, last line] of each part with statements; empty parts join the next ("1 or 2"). */
function switchCases(parts: { values: Node[]; isDefault: boolean; body: Node[] }[]): [string, number, number][] {
  const out: [string, number, number][] = [];
  let pending: string[] = [];
  for (const p of parts) {
    pending.push(...p.values.map((v) => v.text), ...(p.isDefault ? ['default'] : []));
    if (!p.body.length) continue;
    out.push([pending.join(' or '), lineOf(p.body[0]), p.body[p.body.length - 1].endPosition.row + 1]);
    pending = [];
  }
  return out;
}

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
        if (flags.includes(',')) text = text.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
  /** The class whose code is running (for private fields and for calls without an object). */
  private currentClass = 'Main';
  /** The object a constructor is making (a return in a constructor gives it back). */
  private making: JVal | null = null;
  /** Static variables by the name the static frame shows (count, Dog.total). */
  private statics = new Map<string, Cell & { owner: string; info: NonNullable<ClassInfo['statics']>[number] }>();

  /** count / total used by name: a static of this class (or the classes above), or of Main for a class inside Main. */
  private staticCell(name: string): (Cell & { owner: string; info: NonNullable<ClassInfo['statics']>[number] }) | undefined {
    for (let c = this.classes.get(this.currentClass); c; c = c.parent ? this.classes.get(c.parent) : undefined) {
      const st = c.statics?.find((x) => x.name === name);
      if (st) return this.statics.get(st.shown);
    }
    const here = this.classes.get(this.currentClass);
    if (this.currentClass === 'Main' || here?.insideMain) {
      const st = this.classes.get('Main')!.statics?.find((x) => x.name === name);
      if (st) return this.statics.get(st.shown);
    }
    return undefined;
  }

  /** Dog.total: a static of the class Dog (checked like Java: it exists, and is not private to Dog). */
  private qualifiedStatic(n: Node): (Cell & { owner: string; info: NonNullable<ClassInfo['statics']>[number] }) | undefined {
    const object = n.childForFieldName('object');
    if (object?.type !== 'identifier' || !this.classes.has(object.text) || this.scope.lookup(object.text)) return undefined;
    const field = n.childForFieldName('field')!.text;
    for (let c = this.classes.get(object.text); c; c = c.parent ? this.classes.get(c.parent) : undefined) {
      const st = c.statics?.find((x) => x.name === field);
      if (!st) continue;
      if (st.isPrivate && this.currentClass !== c.name) throw new CompileError(lineOf(n), `${field} is private in ${c.name}, so only code inside ${c.name} can use it.`);
      return this.statics.get(st.shown);
    }
    throw new CompileError(lineOf(n), `${object.text} has no static variable called ${field}.`);
  }

  /** count = 5 / Dog.total++: a final static can't get a new value after it is set. */
  private setStatic(cell: Cell & { info: { isFinal: boolean; name: string } }, value: JVal, at: Node): JVal {
    if (cell.info.isFinal) throw new CompileError(lineOf(at), `${cell.info.name} is final, so it can't be given a new value.`);
    cell.v = this.coerce(value, cell, at, cell.info.name);
    return cell.v;
  }

  constructor(
    private classes: Map<string, ClassInfo>,
    plan: ListPlan,
    opts: RunOptions & { input?: string },
  ) {
    this.input = new Input(opts.input ?? '', (message) => new JavaException('NoSuchElementException', message));
    // Static variables live in a "static" frame under main() (like C++ globals in "Global").
    const order = [classes.get('Main')!, ...[...classes.values()].filter((c) => c.name !== 'Main')];
    for (const c of order) {
      // A static written with a value shows ? until its line sets it; one without starts at 0 / null / false.
      for (const st of c.statics ?? []) this.statics.set(st.shown, { ...st.type, v: st.init ? UNSET : this.defaultOf(st.type), owner: c.name, info: st });
    }
    this.rt = new Recorder(this.nameSets, plan, { ...opts, rootLabel: this.statics.size ? 'static' : 'main()', format: formatJava });
    objectToText = (v) => this.objectToString(v);
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
      return cell.v.t === 'array' || cell.v.t === 'list' ? cell.v.v : cell.v;
    });
  }

  /** Readers for the array positions a statement looks at (for highlighting). */
  private readsOf(parts: (Node | null)[]): Reads {
    const out: [string, Getter][] = [];
    const seen = new Set<string>();
    const scope = this.scope;
    const visit = (n: Node) => {
      const get = listGet(n);
      const base = arrayBase(n) ?? get?.[0];
      const index = get ? get[1] : n.childForFieldName?.('index');
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
    if (!this.statics.size) {
      this.scope = new Scope(null);
      this.execBody(main.childForFieldName('body')!);
      this.rt.finish();
      return;
    }
    // The static frame: each static's value is set (a step for each one written with a value), then main() starts on top.
    const staticScope = new Scope(null);
    for (const [shown, cell] of this.statics) staticScope.vars.set(shown, cell);
    this.scope = staticScope;
    const names = staticScope.names();
    const root = this.rt.stack[0] as unknown as { names: string[]; getters: Getter[] };
    root.names = this.nameSets[this.namesId(names)];
    root.getters = this.getters(names);
    for (const cell of this.statics.values()) {
      const st = cell.info;
      if (!st.init) continue;
      this.currentClass = cell.owner;
      this.hook(lineOf(st.declarator), { k: 'assign', t: [st.shown] });
      const value = st.init.type === 'array_initializer' ? this.arrayFrom(st.init, st.type.elem ?? 'int') : this.eval(st.init);
      cell.v = this.coerce(value, cell, st.declarator, st.name);
    }
    this.currentClass = 'Main';
    this.rt.hooks.f(); // the last static's value is set
    this.rt.stack[0].pending = lineOf(main);
    this.scope = new Scope(null);
    this.rt.hooks.enter('main', this.namesId([]), [], 0);
    try {
      this.execBody(main.childForFieldName('body')!);
    } catch (e) {
      if (!(e instanceof ReturnSignal)) {
        this.rt.hooks.thrown(e);
        throw e;
      }
    }
    // main's last line is a step of its own; main itself has no return step (as without statics).
    this.rt.hooks.f();
    (this.rt.stack[this.rt.stack.length - 1] as unknown as { returned: boolean }).returned = true;
    this.rt.hooks.leave();
    this.rt.stack[0].pending = null;
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
    // Dog.total = 5: the static Dog.total (shown in the static frame).
    if (n.type === 'field_access' && n.childForFieldName('object')?.type === 'identifier' && this.classes.has(n.childForFieldName('object')!.text) && !this.scope.lookup(n.childForFieldName('object')!.text)) {
      const st = this.qualifiedStatic(n);
      if (st) return st.info.shown;
    }
    // this.name = ... / rex.age = ...: the object changes. name = ... inside a method, for a field: this changes.
    if (n.type === 'field_access') {
      let o = n;
      while (o.type === 'field_access') o = o.childForFieldName('object')!;
      return o.type === 'this' ? 'this' : o.text;
    }
    if (n.type === 'identifier' && !this.scope.lookup(n.text) && !this.implicitFieldExists(n.text)) {
      const st = this.staticCell(n.text);
      if (st) return st.info.shown; // a static: shown in the static frame
    }
    if (n.type === 'identifier' && !this.scope.lookup(n.text) && this.scope.lookup('this')) return 'this';
    // g[1][2] = 9: the table g changes.
    let base = n;
    while (base.type === 'array_access') base = base.childForFieldName('array')!;
    if (base !== n && base.type === 'identifier') return base.text;
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
          if ((object === 'Arrays' && name === 'sort') || (object === 'Collections' && LIST_CHANGERS_STATIC.has(name ?? ''))) {
            const arg = named(e.childForFieldName('arguments'))[0];
            if (arg) return { k: 'assign', t: [arg.text] };
          }
          // nums.add(5), nums.set(0, 2), nums.remove(1), nums.clear(): the list changes.
          if (object && LIST_CHANGERS.has(name ?? '') && ['list', 'map', 'set'].includes(this.scope.lookup(object)?.t ?? '')) return { k: 'assign', t: [object] };
        }
        return { k: 'other' };
      }
      case 'switch_expression':
        return { k: 'switch', c: inner(s.childForFieldName('condition')).text, cs: switchCases(switchParts(s)) };
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
    if (s.type === 'if_statement' || s.type === 'switch_expression') return [s.childForFieldName('condition')];
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
      case 'try_statement':
        this.execTry(s);
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
      case 'switch_expression':
        this.execSwitch(s);
        return;
      case 'return_statement': {
        const e = named(s)[0];
        const value = e ? this.eval(e) : VOID;
        // return; in a constructor gives back the new object (its return step is recorded there).
        if (!this.making) this.rt.hooks.ret(lineOf(s), value.t === 'array' || value.t === 'list' ? (value.v as JVal[]) : value);
        throw new ReturnSignal(value);
      }
      case 'explicit_constructor_invocation': {
        // super("Rex"): the class above makes its part of this object first.
        const args = named(s.childForFieldName('arguments')).map((a) => this.eval(a));
        const cls = this.classes.get(this.currentClass)!;
        this.superPart(this.making!, cls, args, s);
        this.fieldValues(this.making!, cls);
        return;
      }
      case 'throw_statement': {
        const v = this.eval(named(s)[0]);
        if (v.t === 'null') throw new JavaException('NullPointerException', 'Cannot throw a null exception');
        if (v.t !== 'exception') throw new CompileError(lineOf(s), 'throw needs an exception, like throw new IllegalArgumentException("...").');
        if (v.cls === undefined) throw new JavaException('NullPointerException', 'Cannot throw a null exception');
        throw new JavaException(v.cls!, (v.v as string | null) ?? '', v);
      }
      case 'yield_statement':
        throw new YieldSignal(this.eval(named(s)[0]));
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

  /** switch: jump to the matching case (or default); without arrows, run on until break. */
  private execSwitch(s: Node) {
    const value = this.eval(inner(s.childForFieldName('condition')));
    if (!['int', 'long', 'char', 'String'].includes(value.t)) throw new CompileError(lineOf(s), 'A switch needs a whole number, a char or text.');
    const key = (x: JVal) => (x.t === 'char' ? (x.v as string).charCodeAt(0) : x.v);
    const parts = switchParts(s);
    let start = parts.findIndex((p) => p.values.some((v) => key(this.eval(v)) === key(value)));
    if (start < 0) start = parts.findIndex((p) => p.isDefault);
    if (start < 0) return;
    const run = parts[start].rule ? parts[start].body : parts.slice(start).flatMap((p) => p.body);
    const saved = this.scope;
    this.scope = new Scope(saved);
    for (const d of declaredIn(parts.flatMap((p) => p.body))) this.scope.vars.set(d.name, { ...d.type, v: UNSET });
    try {
      for (let i = 0; i < run.length; i++) this.exec(run[i], tempSwap(run, i));
    } catch (e) {
      if (!(e instanceof BreakSignal)) throw e;
    } finally {
      this.scope = saved;
    }
  }

  /** try / catch / finally: a caught exception turns the line that failed into a catch step. */
  private execTry(s: Node) {
    const clauses = named(s).filter((c) => c.type === 'catch_clause');
    const fin = named(named(s).find((c) => c.type === 'finally_clause'))[0];
    const runFinally = () => {
      if (fin) this.execBody(fin);
    };
    try {
      try {
        this.execBody(s.childForFieldName('body')!);
      } catch (e) {
        if (!(e instanceof JavaException)) throw e;
        const clause = clauses.find((c) => catchTypes(c).some((t) => isA(e.javaType in EXCEPTION_PARENT ? e.javaType : 'RuntimeException', t.text)));
        if (!clause) throw e;
        const object = e.object();
        this.rt.hooks.caught(
          e.value
            ? { k: 'catch', et: e.javaType, ...(object.v !== null ? { em: object.v as string } : {}), th: true }
            : { k: 'catch', et: e.javaType },
        );
        const param = named(clause).find((c) => c.type === 'catch_formal_parameter')!;
        const types = catchTypes(clause);
        const saved = this.scope;
        this.scope = new Scope(saved);
        // catch (A | B e): e's box type is their closest shared parent.
        let cls = types[0].text;
        while (!types.every((t) => isA(t.text, cls))) cls = EXCEPTION_PARENT[cls]!;
        this.scope.vars.set(param.childForFieldName('name')!.text, { t: 'exception', cls, v: object });
        try {
          this.execBody(clause.childForFieldName('body')!);
        } finally {
          this.scope = saved;
        }
      }
    } catch (e) {
      // A cap or a compile problem ends the run at once; anything else still runs the finally part.
      if (fin && !(e instanceof StopRun) && !(e instanceof CompileError) && !(e instanceof RangeError)) {
        const info: StepInfo =
          e instanceof JavaException
            ? { k: 'catch', et: e.javaType, fo: true, ...(e.value ? { th: true, ...(e.message ? { em: e.message } : {}) } : {}) }
            : { k: 'other' };
        if (e instanceof JavaException) {
          const held = this.rt.hooks.holdCrash(e, info);
          runFinally();
          this.rt.hooks.resumeCrash(held);
        } else runFinally();
      }
      throw e;
    }
    runFinally();
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
      if (valueNode && s.childForFieldName('type')?.text === 'var') {
        // var x = 5;  the box takes the value's type (int), like Java.
        const value = this.eval(valueNode);
        if (value.t === 'stream' || value.t === 'optional') throw unsupported(valueNode, value.t === 'stream' ? 'streams kept in a variable (use the stream in one statement)' : 'Optional kept in a variable');
        const t: DeclType = { t: value.t === 'null' ? 'void' : value.t, elem: value.elem, kt: value.kt, cls: value.cls, box: value.boxed && value.t !== 'String' };
        Object.assign(cell, t);
        cell.v = this.coerce(value, t, d!, name);
        continue;
      }
      if (valueNode) {
        const value = valueNode.type === 'array_initializer' ? this.arrayFrom(valueNode, type.elem ?? 'int') : this.eval(valueNode);
        cell.v = this.coerce(value, type, d!, name);
      }
    }
  }

  /** int days = switch (m) { case 2 -> 28; default -> { ... yield 31; } }: the value of the part that matches. */
  private switchValue(n: Node): JVal {
    const value = this.eval(inner(n.childForFieldName('condition')));
    if (!['int', 'long', 'char', 'String'].includes(value.t)) throw new CompileError(lineOf(n), 'A switch needs a whole number, a char or text.');
    const key = (x: JVal) => (x.t === 'char' ? (x.v as string).charCodeAt(0) : x.v);
    const groups = named(n.childForFieldName('body')).filter((g) => g.type === 'switch_block_statement_group' || g.type === 'switch_rule');
    const matches = (g: Node) => named(g).filter((c) => c.type === 'switch_label').some((l) => named(l).some((v) => key(this.eval(v)) === key(value)));
    let start = groups.findIndex(matches);
    if (start < 0) start = groups.findIndex((g) => named(g).some((c) => c.type === 'switch_label' && named(c).length === 0));
    if (start < 0) throw new JavaException('MatchException', String(value.v));
    const saved = this.scope;
    this.scope = new Scope(saved);
    // The line with the switch (int days = switch ...) waits: its step comes after the value is known,
    // while the switch's own lines (a block with yield) get their steps first.
    const frame = this.rt.stack[this.rt.stack.length - 1] as unknown as { pending: number | null; pendingInfo: unknown; pendingReads: unknown };
    const waiting = { pending: frame.pending, pendingInfo: frame.pendingInfo, pendingReads: frame.pendingReads };
    frame.pending = null;
    let ranLines = false;
    const hooks = this.rt.hooks;
    const resume = () => {
      if (ranLines) hooks.f(); // the switch's last line (the yield) finishes
      frame.pending = waiting.pending;
      frame.pendingInfo = waiting.pendingInfo;
      frame.pendingReads = waiting.pendingReads;
    };
    try {
      const g = groups[start];
      const body = named(g).filter((c) => c.type !== 'switch_label');
      ranLines = g.type !== 'switch_rule' || body[0]?.type !== 'expression_statement';
      if (g.type === 'switch_rule') {
        // case 2 -> 28;  the value itself / case 3 -> { ... yield x; } / case 4 -> throw ...
        const part = body[0];
        if (part.type === 'expression_statement') return this.eval(named(part)[0]);
        this.execNested(part);
        throw new CompileError(lineOf(part), 'This part of the switch must give a value with yield.');
      }
      // case 1: ... yield "a";  (runs on into the next parts until a yield, like Java)
      const run = groups.slice(start).flatMap((x) => named(x).filter((c) => c.type !== 'switch_label'));
      for (const d of declaredIn(run)) this.scope.vars.set(d.name, { ...d.type, v: UNSET });
      for (const st of run) this.exec(st);
      throw new CompileError(lineOf(n), 'This switch must give a value with yield.');
    } catch (e) {
      if (e instanceof YieldSignal) {
        resume();
        return e.value;
      }
      throw e;
    } finally {
      this.scope = saved;
      if (frame.pending === null && waiting.pending !== null) resume();
    }
  }

  private condition(n: Node): boolean {
    const v = this.eval(inner(n));
    if (v.t !== 'boolean') throw new CompileError(lineOf(n), 'A condition must be true or false.');
    return unbox(v).v as boolean;
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
      let list: JVal | null = null;
      if (s.type === 'enhanced_for_statement') {
        const array = this.eval(s.childForFieldName('value')!);
        if (array.t === 'set' && array.v !== null) {
          // A for-each over a set walks its items in Java's order, and watches the set for changes.
          list = { t: 'list', v: mapOrder(array, compareKeys).map(([k]) => k), elem: array.elem, src: array };
          items = list.v as JVal[];
          const type = declType(s.childForFieldName('type'));
          itemCell = { ...type, v: UNSET };
          this.scope.vars.set(s.childForFieldName('name')!.text, itemCell);
        } else if (array.t === 'map') throw new CompileError(lineOf(s), `A map can't be walked directly: use ${s.childForFieldName('value')!.text}.keySet(), .values() or .entrySet().`);
        else {
          if (array.t !== 'array' && array.t !== 'list') throw unsupported(s, 'for-each loops over this value');
          if (array.v === null) throw new JavaException('NullPointerException', 'Cannot loop over a null value');
          if (array.t === 'list') list = array;
          items = array.v as JVal[];
          const declared = declType(s.childForFieldName('type'));
          // for (var x : list): x takes the items' type.
          const type: DeclType = s.childForFieldName('type')?.text === 'var' ? (array.t === 'array' || array.elem === 'String' || isClassItem(array.elem) ? this.itemType(array.elem ?? 'int') : { t: array.elem ?? 'int', box: true }) : declared;
          itemCell = { ...type, v: UNSET };
          this.scope.vars.set(s.childForFieldName('name')!.text, itemCell);
        }
      }
      let first = true;
      let k = 0;
      // A for-each over keySet() / values() / entrySet() watches the map itself.
      const watched = list?.src ?? list;
      const startMod = watched?.mod ?? 0;
      for (;;) {
        if (items) {
          // A list's for-each walks with Java's iterator: it stops when it reaches the size,
          // and stops with a crash if the list was changed during the loop.
          if (list) {
            items = list.v as JVal[];
            if (k === items.length) break; // hasNext(): the walk has not reached the size
            if ((watched!.mod ?? 0) !== startMod) throw new JavaException('ConcurrentModificationException', '');
          } else if (k >= items.length) break;
          itemCell!.v = this.coerce(items[k++], itemCell!, s, s.childForFieldName('name')!.text);
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
    } catch (e) {
      this.rt.hooks.dropLoop(line);
      throw e;
    } finally {
      this.scope = outer;
    }
    // loop-end, in the scope around the loop
    const names = this.scope.names();
    this.rt.hooks.x(line, this.namesId(names), this.getters(names), info);
  }

  // ---- methods ------------------------------------------------------------------

  /** A method with no object in front: factorial(3), or describe() inside a Dog method (on this, the object's own version). */
  private callUnqualified(node: Node, name: string, args: JVal[]): JVal {
    let found = findMethod(this.currentClass, name);
    if (!found && this.currentClass !== 'Main' && this.classes.get('Main')!.methods.has(name)) found = { owner: this.classes.get('Main')!, m: this.classes.get('Main')!.methods.get(name)! };
    if (!found || name === 'main') throw unsupported(node, `the method ${name}`);
    const { owner, m } = found;
    if (owner.name === 'Main' || isStaticMember(m)) return this.callMethod(node, owner, m, args, null, name);
    const self = this.scope.lookup('this')?.v;
    if (!self || typeof self === 'symbol') {
      throw new CompileError(lineOf(node), `${name} belongs to each ${owner.name} object, so a static method can't call it without one.`);
    }
    // speak() inside Animal's code, on a Dog: Dog's own speak() runs (unless it is private).
    const actual = isPrivateMember(m) ? found : findMethod((self.v as JObject).cls, name)!;
    return this.callMethod(node, actual.owner, actual.m, args, self, name);
  }

  /** Dog.create(...): a static method of a class. */
  private callStatic(node: Node, clsName: string, name: string, args: JVal[]): JVal {
    const found = findMethod(clsName, name);
    if (!found || name === 'main') throw new CompileError(lineOf(node), `${clsName} has no method called ${name}.`);
    if (clsName !== 'Main' && !isStaticMember(found.m)) {
      throw new CompileError(lineOf(node), `${name} belongs to each ${clsName} object: call it on one, like myObject.${name}().`);
    }
    this.checkPrivate(node, found.m, found.owner.name, name);
    return this.callMethod(node, found.owner, found.m, args, null, clsName === 'Main' ? name : `${clsName}.${name}`);
  }

  /** rex.bark(): the method of the object's own class (a Dog in an Animal box runs Dog's version). */
  private callOnObject(node: Node, objNode: Node, target: JVal, name: string, argNodes: Node[]): JVal {
    if (target.v === null) throw new JavaException('NullPointerException', `Cannot invoke "${target.cls}.${name}()" because "${objNode.text}" is null`);
    const o = target.v as JObject;
    // Java checks the box's type first: an Animal box only offers Animal's methods.
    const boxType = target.cls ?? o.cls;
    if (boxType !== o.cls && !findMethod(boxType, name) && name !== 'toString' && name !== 'equals') {
      throw new CompileError(lineOf(node), `${objNode.text} is ${/^[AEIOU]/.test(boxType) ? 'an' : 'a'} ${boxType} box, and ${boxType} has no method ${name}: cast it first, like ((${o.cls}) ${objNode.text}).${name}().`);
    }
    const found = findMethod(o.cls, name);
    const args = argNodes.map((a) => this.eval(a));
    if (!found) {
      // Every Java object has these, even without writing them.
      if (name === 'toString' && !args.length) return str(this.objectToString(target));
      if (name === 'equals' && args.length === 1) return bool(args[0].t === 'object' && args[0].v === o);
      throw new CompileError(lineOf(node), `${o.cls} has no method called ${name}.`);
    }
    this.checkPrivate(node, found.m, found.owner.name, name);
    const label = objNode.type === 'identifier' ? `${objNode.text}.${name}` : objNode.type === 'this' ? name : `${o.cls}.${name}`;
    return this.callMethod(node, found.owner, found.m, args, isStaticMember(found.m) ? null : { ...target, cls: o.cls }, label);
  }

  /** super.speak(): the version in the class above, on this same object. */
  private callSuper(node: Node, name: string, args: JVal[]): JVal {
    const parent = this.classes.get(this.currentClass)?.parent;
    const self = this.scope.lookup('this')?.v;
    if (!parent || !self || typeof self === 'symbol') throw new CompileError(lineOf(node), 'super.method() works only inside a class that extends another one.');
    const found = findMethod(parent, name);
    if (!found) {
      if (name === 'toString') return str(defaultObjectText(self));
      throw new CompileError(lineOf(node), `${parent} has no method called ${name}.`);
    }
    if (!found.m.childForFieldName('body')) throw new CompileError(lineOf(node), `${parent}'s ${name}() is abstract, so super.${name}() has nothing to run.`);
    this.checkPrivate(node, found.m, found.owner.name, name);
    return this.callMethod(node, found.owner, found.m, args, self, `super.${name}`);
  }

  private checkPrivate(node: Node, member: Node, owner: string, name: string) {
    if (isPrivateMember(member) && this.currentClass !== owner) {
      throw new CompileError(lineOf(node), `${name} is private in ${owner}, so only code inside ${owner} can use it.`);
    }
  }

  /**
   * Run a method (or a constructor, with `making` = the new object) in a new frame.
   * Methods of an object have this as their first variable; the label leaves it out.
   * `top`: the constructor new called (its return step shows the object); super(...) parts are not.
   */
  private callMethod(node: Node, cls: ClassInfo, m: Node, args: JVal[], self: JVal | null, label: string, making: JVal | null = null, top = true): JVal {
    const params = named(m.childForFieldName('parameters')).filter((p) => p.type === 'formal_parameter');
    const shown = label.replace(/^new /, '');
    if (params.length !== args.length) {
      throw new CompileError(lineOf(node), `${shown} needs ${params.length} value${params.length === 1 ? '' : 's'}, not ${args.length}.`);
    }
    const saved = this.scope;
    const savedClass = this.currentClass;
    const savedMaking = this.making;
    const scope = new Scope(null);
    const names: string[] = [];
    if (self) {
      scope.vars.set('this', { t: 'object', cls: cls.name, v: self });
      names.push('this');
    }
    params.forEach((p, i) => {
      const type = declType(p.childForFieldName('type'), p);
      const pname = p.childForFieldName('name')!.text;
      scope.vars.set(pname, { ...type, v: this.coerce(args[i], type, node, pname) });
      names.push(pname);
    });
    const returnType: DeclType = making ? { t: 'void' } : declType(m.childForFieldName('type'), m);
    this.scope = scope;
    this.currentClass = cls.name;
    this.making = making;
    this.rt.hooks.enter(label, this.namesId(names), this.getters(names), self ? 1 : 0);
    try {
      const body = m.childForFieldName('body')!;
      // A constructor without super(...) first: the class above is made first (super()), then this class's field values.
      if (making && named(body)[0]?.type !== 'explicit_constructor_invocation') {
        this.superPart(making, cls, [], node);
        this.fieldValues(making, cls);
      }
      this.execBody(body);
      if (making) return top ? this.made(m, making) : VOID;
      if (returnType.t !== 'void') throw new CompileError(lineOf(m), `${shown} must return a value.`);
      return VOID;
    } catch (e) {
      if (e instanceof ReturnSignal) {
        if (making) return top ? this.made(m, making) : VOID;
        return returnType.t === 'void' ? VOID : this.coerce(e.value, returnType, node, shown);
      }
      this.rt.hooks.thrown(e);
      throw e;
    } finally {
      this.scope = scope;
      this.rt.hooks.leave();
      this.scope = saved;
      this.currentClass = savedClass;
      this.making = savedMaking;
    }
  }

  /** A constructor is done: its return step shows the new object. */
  private made(ctor: Node, obj: JVal): JVal {
    const top = this.rt.stack[this.rt.stack.length - 1];
    this.rt.hooks.ret(top.pending ?? lineOf(ctor), obj);
    return obj;
  }

  /** new Dog("Rex", 3): every field (the classes above first) starts at 0 / null / false, then the constructors run, top class first. */
  private construct(node: Node, name: string, args: JVal[]): JVal {
    const cls = this.classes.get(name)!;
    if (cls.isInterface) throw new CompileError(lineOf(node), `${name} is an interface, so new ${name}() is not allowed: make an object of a class that implements it.`);
    if (cls.isAbstract) throw new CompileError(lineOf(node), `${name} is abstract, so new ${name}() is not allowed: make one of the classes that extend it.`);
    const o: JObject = { cls: name, fields: new Map() };
    const obj: JVal = { t: 'object', cls: name, v: o, id: freshId() };
    for (const f of allFields(name)) o.fields.set(f.name, { ...f.type, v: this.defaultOf(f.type) });
    const result = this.runConstructor(obj, cls, args, node, `new ${name}`, true);
    return result.t === 'object' ? result : obj;
  }

  /** The constructor of `cls` that fits the values (none: Java's empty one, which only makes the class above). */
  private runConstructor(obj: JVal, cls: ClassInfo, args: JVal[], node: Node, label: string, top: boolean): JVal {
    if (!cls.constructors.length) {
      if (args.length) throw new CompileError(lineOf(node), `${cls.name} has no constructor that takes ${args.length} value${args.length === 1 ? '' : 's'}.`);
      this.superPart(obj, cls, [], node);
      this.fieldValues(obj, cls);
      return obj;
    }
    const paramTypes = (c: Node) =>
      named(c.childForFieldName('parameters'))
        .filter((p) => p.type === 'formal_parameter')
        .map((p) => declType(p.childForFieldName('type'), p));
    const fits = (v: JVal, t: DeclType) => {
      try {
        this.coerce(v, t, node, 'this value');
        return true;
      } catch (e) {
        if (e instanceof CompileError) return false;
        throw e;
      }
    };
    const ctor = cls.constructors.find((c) => {
      const types = paramTypes(c);
      return types.length === args.length && types.every((t, i) => fits(args[i], t));
    });
    if (!ctor) {
      if (!top && !args.length) {
        throw new CompileError(lineOf(node), `${cls.name} has no constructor that takes no values, so the constructor below it must start with super(...).`);
      }
      throw new CompileError(lineOf(node), `${cls.name} has no constructor that takes ${args.length ? args.map((a) => formatJava(a)).join(', ') : 'no values'}.`);
    }
    this.checkPrivate(node, ctor, cls.name, `This constructor of ${cls.name}`);
    return this.callMethod(node, cls, ctor, args, obj, label, obj, top);
  }

  /** super(...) / the hidden super(): the part of the object that belongs to the class above. */
  private superPart(obj: JVal, cls: ClassInfo, args: JVal[], node: Node) {
    if (!cls.parent) {
      if (args.length) throw new CompileError(lineOf(node), `${cls.name} does not extend another class, so super(...) has nothing to call.`);
      return;
    }
    this.runConstructor(obj, this.classes.get(cls.parent)!, args, node, 'super', false);
  }

  /** int tricks = 0; written in a class: set after the class above is made, before the constructor's own lines. */
  private fieldValues(obj: JVal, cls: ClassInfo) {
    if (!cls.fields.some((f) => f.init)) return;
    const o = obj.v as JObject;
    const saved = this.scope;
    const savedClass = this.currentClass;
    this.scope = new Scope(null);
    this.scope.vars.set('this', { t: 'object', cls: cls.name, v: obj });
    this.currentClass = cls.name;
    try {
      for (const f of cls.fields) {
        if (!f.init) continue;
        const value = f.init.type === 'array_initializer' ? this.arrayFrom(f.init, f.type.elem ?? 'int') : this.eval(f.init);
        o.fields.get(f.name)!.v = this.coerce(value, f.type, f.declarator, f.name);
      }
    } finally {
      this.scope = saved;
      this.currentClass = savedClass;
    }
  }

  /** The starting value of a field: 0, false, '\u0000' or null. */
  private defaultOf(t: DeclType): JVal {
    if (t.box) return { t: t.t, v: null, boxed: true };
    if (t.t === 'array' || t.t === 'list') return { t: t.t, v: null as unknown as JVal[], elem: t.elem };
    if (t.t === 'object') return { t: 'object', cls: t.cls, v: null };
    if (t.t === 'exception') return { t: 'exception', v: null };
    if (t.t === 'Scanner') return { t: 'Scanner', v: null };
    return zeroOf(t.t as Prim);
  }

  /** println(rex): the class's own toString() runs (with its steps); without one, Java's Dog@1b6d3586. */
  private objectToString(v: JVal): string {
    const o = v.v as JObject;
    const found = findMethod(o.cls, 'toString');
    const m = found?.m;
    if (!found || !m || isStaticMember(m) || named(m.childForFieldName('parameters')).length) return defaultObjectText(v);
    const text = this.callMethod(m, found.owner, m, [], { ...v, cls: o.cls }, `${o.cls}.toString`);
    if (text.t !== 'String') throw new CompileError(lineOf(m), 'toString must give back text (String).');
    return text.v === null ? 'null' : (text.v as string);
  }

  /** The field cell for obj.name, with Java's checks (null object, unknown or private field). */
  private fieldOf(n: Node, obj: JVal): { t: JType; elem?: Prim; box?: boolean; cls?: string; v: JVal | symbol } {
    const objNode = n.childForFieldName('object')!;
    const field = n.childForFieldName('field')!.text;
    if (obj.v === null) throw new JavaException('NullPointerException', `Cannot read field "${field}" because "${objNode.text}" is null`);
    const o = obj.v as JObject;
    const cell = o.fields.get(field);
    if (!cell) throw new CompileError(lineOf(n), `${o.cls} has no field called ${field}.`);
    // Java checks the box's type: an Animal box only offers Animal's fields.
    const box = obj.cls ?? o.cls;
    if (box !== o.cls && !allFields(box).some((f) => f.name === field)) {
      throw new CompileError(lineOf(n), `${objNode.text} is ${/^[AEIOU]/.test(box) ? 'an' : 'a'} ${box} box, and ${box} has no field ${field}: cast it first, like ((${o.cls}) ${objNode.text}).${field}.`);
    }
    const info = allFields(o.cls).find((f) => f.name === field);
    if (info?.isPrivate && this.currentClass !== info.owner) {
      throw new CompileError(lineOf(n), `${field} is private in ${info.owner}, so only code inside ${info.owner} can use it.`);
    }
    return cell;
  }

  private insideLambda(): boolean {
    for (let sc: Scope | null = this.scope; sc; sc = sc.parent) if (sc.top) return true;
    return false;
  }

  private implicitFieldExists(name: string): boolean {
    const self = this.scope.lookup('this')?.v;
    return !!self && typeof self !== 'symbol' && self.v !== null && (self.v as JObject).fields.has(name);
  }

  /** A name that is not a variable: a field of this object (name instead of this.name). */
  private implicitField(id: Node) {
    const self = this.scope.lookup('this')?.v;
    if (self && typeof self !== 'symbol' && self.v !== null) {
      const cell = (self.v as JObject).fields.get(id.text);
      // A private field of the class above can't be used by name in a class below it.
      const info = allFields((self.v as JObject).cls).find((f) => f.name === id.text);
      if (cell && info?.isPrivate && info.owner !== this.currentClass && isSubclass(this.currentClass, info.owner)) {
        throw new CompileError(lineOf(id), `${id.text} is private in ${info.owner}, so ${this.currentClass} can't use it (make it protected, or use a method of ${info.owner}).`);
      }
      if (cell && (!info || isSubclass(this.currentClass, info.owner) || this.currentClass === info.owner)) return cell;
    }
    if (allFields(this.currentClass).some((f) => f.name === id.text)) {
      throw new CompileError(lineOf(id), `${id.text} belongs to each ${this.currentClass} object, so a static method can't use it on its own.`);
    }
    return undefined;
  }

  // ---- expressions ----------------------------------------------------------------

  /** Assign rules: widening is fine; narrowing needs a cast. */
  private coerce(v: JVal, to: DeclType, at: Node, name: string): JVal {
    const t = to.t;
    const what = t === 'set' ? `set of ${typeName(to.elem)}` : t === 'map' ? `map of ${typeName(to.kt)} to ${typeName(to.elem)}` : t === 'array' ? `${to.elem} array` : t === 'list' ? `list of ${typeName(to.elem)}` : t === 'object' ? to.cls! : t;
    const cantHold = () =>
      new CompileError(lineOf(at), `${name} is ${/^[aeiouAEIOU]/.test(what) ? 'an' : 'a'} ${what} box, so it can't hold ${formatJava(v)}.`);
    if (t === 'object') {
      if (v.t === 'null') return { t: 'object', cls: to.cls, v: null };
      // An Animal box can hold a Dog (a class below Animal).
      if (v.t !== 'object' || !isSubclass((v.v as JObject | null)?.cls ?? v.cls!, to.cls!)) throw cantHold();
      return { ...v, cls: to.cls };
    }
    if (t === 'array') {
      if (v.t === 'null') return { t: 'array', v: null as unknown as JVal[], elem: to.elem };
      if (v.t !== 'array' || v.elem !== to.elem) throw cantHold();
      return v;
    }
    if (t === 'map' || t === 'entry' || t === 'set') {
      if (v.t === 'null') return { t, v: null, kt: to.kt, elem: to.elem };
      if (v.t !== t) throw cantHold();
      if ((t === 'map' || t === 'set') && v.kt === undefined && to.kt) {
        // new HashMap<>(): the types come from the box it is stored in.
        v.kt = to.kt;
        v.elem = to.elem;
      }
      if (v.kt !== to.kt || v.elem !== to.elem) {
        throw new CompileError(lineOf(at), `${name} holds ${typeName(to.kt)} keys and ${typeName(to.elem)} values, so it can't hold this ${t === 'map' ? 'map' : 'entry'}.`);
      }
      return v;
    }
    if (t === 'list') {
      if (v.t === 'null') return { t: 'list', v: null as unknown as JVal[], elem: to.elem };
      if (v.t !== 'list') throw cantHold();
      if (v.elem === undefined && to.elem) {
        // new ArrayList<>(): the items' type comes from the box it is stored in.
        v.elem = to.elem;
        v.v = (v.v as JVal[]).map((x) => this.listItem(x, v, at, name));
      }
      if (v.elem !== to.elem) {
        throw new CompileError(lineOf(at), `${name} holds ${typeName(to.elem)} values, so it can't hold a list of ${typeName(v.elem)} values.`);
      }
      return v;
    }
    if (t === 'exception') {
      if (v.t === 'null') return { t: 'exception', v: null }; // no cls: the box is empty (null)
      if (v.t !== 'exception' || !isA(v.cls!, to.cls!)) {
        throw new CompileError(lineOf(at), `${name} is ${/^[AEIOU]/.test(to.cls!) ? 'an' : 'a'} ${to.cls} box, so it can't hold ${formatJava(v)}.`);
      }
      return v;
    }
    if (to.box) {
      // Integer x = 5: Java boxes the value, but only into the box of its own type (not 5 into a Double).
      if (v.t === 'null') return { t, v: null, boxed: true };
      if (v.t === t) return box(v);
      throw new CompileError(lineOf(at), `${name} is ${t === 'int' ? 'an' : 'a'} ${WRAPPER_OF[t as Prim]} box, so it can't hold ${formatJava(v)}.`);
    }
    if (v.t === t) return v.t === 'String' ? v : unbox(v);
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
    if (v.v === null) throw new JavaException('NullPointerException', `Cannot unbox a null ${WRAPPER_OF[v.t as Prim] ?? 'value'}`);
    return v.t === 'char' ? (v.v as string).charCodeAt(0) : Number(v.v);
  }

  /** A value going into a list: boxed, and of the list's own type (Integer into ArrayList<Integer>). */
  private listItem(x: JVal, list: JVal, at: Node, name: string): JVal {
    const objects = isClassItem(list.elem);
    if (x.t === 'null') return objects ? { t: 'object', cls: list.elem, v: null } : { t: list.elem!, v: null, boxed: true };
    if (list.elem && (objects ? x.t !== 'object' || !isSubclass((x.v as JObject | null)?.cls ?? x.cls!, list.elem) : x.t !== list.elem)) {
      throw new CompileError(lineOf(at), `${name} holds ${typeName(list.elem)} values, so it can't hold ${formatJava(x)}.`);
    }
    return box(x);
  }

  /** The type of one item of an array: int, String, or a class of the program. */
  private itemType(elem: Prim): DeclType {
    if (elem.endsWith('[]')) return { t: 'array', elem: elem.slice(0, -2) as Prim };
    return isClassItem(elem) ? { t: 'object', cls: elem } : { t: elem };
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
    // A shift keeps the type of its left side (int << long is an int).
    const isLong = a.t === 'long' || (b.t === 'long' && !['<<', '>>', '>>>'].includes(op));
    if ((op === '/' || op === '%') && y === 0) throw new JavaException('ArithmeticException', '/ by zero');
    if (isLong) {
      // Exact 64-bit arithmetic that wraps like Java (BigInt division and % round toward zero, as Java does).
      const p = bigOf(unbox(a));
      const q = bigOf(unbox(b));
      switch (op) {
        case '+': return lng(p + q);
        case '-': return lng(p - q);
        case '*': return lng(p * q);
        case '/': return lng(p / q);
        case '%': return lng(p % q);
        case '&': return lng(p & q);
        case '|': return lng(p | q);
        case '^': return lng(p ^ q);
        case '<<': return lng(p << (q & 63n));
        case '>>': return lng(p >> (q & 63n));
        case '>>>': return lng(BigInt.asUintN(64, p) >> (q & 63n));
      }
    }
    const wrap = (n: number): JVal => int(n);
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
      if (op === '&&' && !unbox(left).v) return bool(false);
      if (op === '||' && unbox(left).v) return bool(true);
      const right = this.eval(n.childForFieldName('right')!);
      if (right.t !== 'boolean') throw new CompileError(lineOf(n), `${op} needs true or false on both sides.`);
      return unbox(right);
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
      // Two Integer objects: == asks "the same object?", like Java (small ones are shared).
      if (a.boxed && b.boxed && a.v !== null && b.v !== null) same = a.id === b.id;
      else if (NUMERIC.has(a.t) && NUMERIC.has(b.t)) same = (a.t === 'long' || b.t === 'long') && a.t !== 'double' && b.t !== 'double' ? bigOf(unbox(a)) === bigOf(unbox(b)) : this.num(a) === this.num(b);
      else if (a.t === 'boolean' && b.t === 'boolean' && a.v !== null && b.v !== null) same = a.v === b.v;
      else if (a.v === null || b.v === null) same = a.v === b.v;
      // Text and arrays: == asks "the same object?", like Java (use .equals() for the letters).
      else same = a.id !== undefined && a.id === b.id;
      return bool(op === '==' ? same : !same);
    }
    if (['<', '<=', '>', '>='].includes(op)) {
      if (!NUMERIC.has(a.t) || !NUMERIC.has(b.t)) throw new CompileError(lineOf(n), `${op} only works on numbers.`);
      const exact = (a.t === 'long' || b.t === 'long') && a.t !== 'double' && b.t !== 'double';
      const x = exact ? bigOf(unbox(a)) : this.num(a);
      const y = exact ? bigOf(unbox(b)) : this.num(b);
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
    if (target.type === 'field_access') {
      const st = this.qualifiedStatic(target);
      if (st) return this.setStatic(st, value, target);
      const obj = this.eval(target.childForFieldName('object')!);
      if (obj.t !== 'object') throw unsupported(target, 'this kind of assignment');
      const cell = this.fieldOf(target, obj);
      cell.v = this.coerce(value, cell, target, target.childForFieldName('field')!.text);
      return cell.v;
    }
    if (target.type === 'array_access') {
      const { array, index, elem } = this.element(target);
      array[index] = this.coerce(value, this.itemType(elem), target, target.text);
      return array[index];
    }
    if (target.type !== 'identifier') throw unsupported(target, 'this kind of assignment');
    if (this.insideLambda() && this.scope.lookup(target.text) && !this.scope.ownsUpTo(target.text)) {
      throw new CompileError(lineOf(target), `${target.text} can't be changed inside a lambda: a lambda may only read the variables around it.`);
    }
    const st = this.scope.lookup(target.text) ? undefined : this.staticCell(target.text);
    if (st && !this.implicitFieldExists(target.text)) return this.setStatic(st, value, target);
    const cell = this.scope.lookup(target.text) ?? this.implicitField(target);
    if (!cell) throw new CompileError(lineOf(target), `${target.text} is used but never declared.`);
    cell.v = this.coerce(value, cell, target, target.text);
    return cell.v;
  }

  private read(id: Node): JVal {
    const cell = this.scope.lookup(id.text) ?? this.implicitField(id) ?? this.staticCell(id.text);
    if (!cell) throw new CompileError(lineOf(id), `${id.text} is used but never declared.`);
    if (typeof cell.v === 'symbol') throw new CompileError(lineOf(id), `${id.text} is used before it was given a value.`);
    return cell.v;
  }

  private readTarget(n: Node): JVal {
    if (n.type === 'field_access') return this.eval(n);
    if (n.type === 'array_access') {
      const { array, index } = this.element(n);
      return array[index];
    }
    return this.read(n);
  }

  private castTo(t: JType, v: JVal, at: Node): JVal {
    if (!NUMERIC.has(v.t) && t !== v.t) throw unsupported(at, 'this cast');
    // double to int / long: Java cuts off the part after the point and stops at the type's limits (NaN gives 0).
    const fromDouble = (lo: number, hi: number) => {
      const x = this.num(v);
      return Number.isNaN(x) ? 0 : x <= lo ? lo : x >= hi ? hi : Math.trunc(x);
    };
    if (t === 'int') return v.t === 'double' ? int(fromDouble(-2147483648, 2147483647)) : int(Number(BigInt.asIntN(32, bigOf(unbox(v)))));
    if (t === 'long') {
      if (v.t !== 'double') return lng(bigOf(unbox(v)));
      const x = this.num(v);
      return Number.isNaN(x) ? lng(0n) : x >= 9223372036854775807 ? lng(9223372036854775807n) : x <= -9223372036854775808 ? lng(-9223372036854775808n) : lng(BigInt(Math.trunc(x)));
    }
    if (t === 'double') return dbl(this.num(v));
    if (t === 'char') return { t: 'char', v: String.fromCharCode(v.t === 'double' ? fromDouble(-2147483648, 2147483647) & 0xffff : Number(BigInt.asUintN(16, bigOf(unbox(v))))) };
    if (t === v.t) return unbox(v);
    throw unsupported(at, 'this cast');
  }

  private arrayFrom(init: Node, elem: Prim): JVal {
    // {{1, 2}, {3, 4}}: each inner {...} is a row.
    const items = named(init).map((e) =>
      e.type === 'array_initializer' && elem.endsWith('[]') ? this.arrayFrom(e, elem.slice(0, -2) as Prim) : this.coerce(this.eval(e), this.itemType(elem), e, 'this array'),
    );
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
        if (isLong) {
          // 0x... / 0b... / 0... (octal) / decimal, exactly, then wrapped to 64 bits (0xFFFFFFFFFFFFFFFFL is -1).
          return lng(BigInt(n.type === 'octal_integer_literal' ? `0o${digits.slice(1) || '0'}` : digits));
        }
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
      case 'this': {
        const self = this.scope.lookup('this');
        if (!self) throw new CompileError(lineOf(n), "this can only be used inside an object's own methods and constructors.");
        return self.v as JVal;
      }
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
          return bool(!unbox(v).v);
        }
        if (!NUMERIC.has(v.t)) throw new CompileError(lineOf(n), `${op} only works on numbers.`);
        const x = this.num(v);
        const t = v.t === 'char' ? 'int' : v.t;
        if (op === '-') return t === 'double' ? dbl(-x) : t === 'long' ? lng(-bigOf(unbox(v))) : int(-x);
        if (op === '+') return t === 'double' ? dbl(x) : t === 'long' ? unbox(v) : int(x);
        if (op === '~') return t === 'long' ? lng(~bigOf(unbox(v))) : int(~x);
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
      case 'cast_expression': {
        const to = declType(n.childForFieldName('type'));
        const v = this.eval(n.childForFieldName('value')!);
        if (to.t === 'object') {
          // (Dog) a: fine if the object really is a Dog; otherwise Java stops with a ClassCastException.
          if (v.t === 'null' || (v.t === 'object' && v.v === null)) return { t: 'object', cls: to.cls, v: null };
          if (v.t !== 'object') throw new CompileError(lineOf(n), `${formatJava(v)} can't be turned into a ${to.cls}.`);
          const real = (v.v as JObject).cls;
          const anInterface = classInfos.get(to.cls!)?.isInterface || classInfos.get(v.cls!)?.isInterface;
          if (!anInterface && !isSubclass(real, to.cls!) && !isSubclass(to.cls!, v.cls!)) throw new CompileError(lineOf(n), `A ${v.cls} can never be a ${to.cls}, so this cast can't work.`);
          if (!isSubclass(real, to.cls!)) throw new JavaException('ClassCastException', `class ${real} cannot be cast to class ${to.cls}`);
          return { ...v, cls: to.cls };
        }
        return this.castTo(to.t, v, n);
      }
      case 'instanceof_expression': {
        // a instanceof Dog: is the object a Dog (or a class below Dog)? null is never one.
        const v = this.eval(n.childForFieldName('left')!);
        const type = n.childForFieldName('right')!.text;
        if (!classNames.has(type)) throw unsupported(n, `instanceof ${type}`);
        return bool(v.t === 'object' && v.v !== null && isSubclass((v.v as JObject).cls, type));
      }
      case 'super': {
        // super.name: a field of this object (fields are not repeated in the classes below).
        const self = this.scope.lookup('this');
        if (!self) throw new CompileError(lineOf(n), 'super can only be used inside an object\'s own methods and constructors.');
        return self.v as JVal;
      }
      case 'array_access': {
        const { array, index } = this.element(n);
        return array[index];
      }
      case 'array_creation_expression': {
        const base = primOf(n.childForFieldName('type')!.text);
        const dims = n.childrenForFieldName('dimensions').filter((d): d is Node => !!d);
        // new int[3][4]: sizes given; new int[3][]: rows not made yet (null).
        const sizes = dims.filter((d) => d.type === 'dimensions_expr').map((d) => named(d)[0]);
        const total = sizes.length + dims.filter((d) => d.type === 'dimensions').reduce((k, d) => k + depthOf(d), 0);
        const init = n.childForFieldName('value');
        if (init) return this.arrayFrom(init, (base + '[]'.repeat(Math.max(0, depthOf(dims[0]) + dims.slice(1).reduce((k, d) => k + depthOf(d), 0) - 1))) as Prim);
        const make = (level: number): JVal => {
          const elem = (base + '[]'.repeat(total - level - 1)) as Prim;
          const size = this.eval(sizes[level]);
          if (size.t !== 'int' && size.t !== 'char') throw new CompileError(lineOf(n), 'An array size must be a whole number.');
          const k = this.num(size);
          if (k < 0) throw new JavaException('NegativeArraySizeException', String(k));
          return { t: 'array', v: Array.from({ length: k }, () => (level + 1 < sizes.length ? make(level + 1) : zeroOf(elem))), elem, id: freshId() };
        };
        return make(0);
      }
      case 'field_access': {
        const object = n.childForFieldName('object')!;
        const field = n.childForFieldName('field')!.text;
        if (object.text === 'Integer' && (field === 'MAX_VALUE' || field === 'MIN_VALUE')) return int(field === 'MAX_VALUE' ? 2147483647 : -2147483648);
        if (object.text === 'Long' && (field === 'MAX_VALUE' || field === 'MIN_VALUE')) return lng(field === 'MAX_VALUE' ? 9223372036854775807n : -9223372036854775808n);
        const st = this.qualifiedStatic(n);
        if (st) return st.v as JVal;
        const value = this.eval(object);
        if (value.t === 'object') {
          const cell = this.fieldOf(n, value);
          return cell.v as JVal;
        }
        if (field === 'length') {
          const arr = value;
          if (arr.t === 'list') throw new CompileError(lineOf(n), `${object.text} is a list: use ${object.text}.size() for how many items it has.`);
          if (arr.t === 'String') throw new CompileError(lineOf(n), `${object.text} is text: use ${object.text}.length() with brackets.`);
          if (arr.t === 'array') {
            if (arr.v === null) throw new JavaException('NullPointerException', 'Cannot read the array length because it is null');
            return int((arr.v as JVal[]).length);
          }
        }
        throw unsupported(n, `the field ${n.text}`);
      }
      case 'switch_expression':
        return this.switchValue(n);
      case 'lambda_expression':
        // A lambda remembers the variables around it (it reads them when it runs).
        return { t: 'func', v: { kind: 'lambda', node: n, scope: this.scope, cls: this.currentClass } };
      case 'method_reference': {
        const [owner, member] = named(n);
        if (owner.text === 'System.out') return { t: 'func', v: { kind: 'println' } };
        if (BUILTIN_REFS.has(`${owner.text}::${member.text}`) && !classNames.has(owner.text)) return { t: 'func', v: { kind: 'builtin', name: `${owner.text}::${member.text}` } };
        return { t: 'func', v: { kind: 'method', cls: owner.text, name: member.text } };
      }
      case 'object_creation_expression': {
        const type = n.childForFieldName('type')!;
        if (classNames.has(type.text)) return this.construct(n, type.text, named(n.childForFieldName('arguments')).map((a) => this.eval(a)));
        if (type.text in EXCEPTION_PARENT) {
          const msgNode = named(n.childForFieldName('arguments'))[0];
          const msg = msgNode ? this.eval(msgNode) : null;
          if (msg && msg.t !== 'String' && msg.t !== 'null') throw new CompileError(lineOf(n), 'The message of an exception must be text.');
          return { t: 'exception', v: msg ? (msg.v as string | null) : null, cls: type.text, id: freshId() };
        }
        if (type.type !== 'generic_type') return { t: 'Scanner', v: null, id: freshId() };
        if (named(type)[0]?.text in MAP_KINDS) return this.newMap(n, type);
        if (named(type)[0]?.text in SET_KINDS) return this.newSet(n, type);
        const arg = named(named(type)[1])[0];
        const list: JVal = { t: 'list', v: [], elem: arg ? WRAPPERS[arg.text] ?? (arg.text as Prim) : undefined, id: freshId(), mod: 0 };
        const from = named(n.childForFieldName('arguments'))[0];
        if (!from) return list;
        // new ArrayList<>(Arrays.asList(1, 2, 3)) / (List.of(...)) / (other list) / (10 = room for 10)
        const call = from.type === 'method_invocation' ? `${from.childForFieldName('object')?.text}.${from.childForFieldName('name')?.text}` : '';
        if (call === 'Arrays.asList' || call === 'List.of') {
          list.v = named(from.childForFieldName('arguments')).map((a) => this.listItem(this.eval(a), list, a, 'the list'));
          return list;
        }
        const source = this.eval(from);
        if (source.t === 'int') {
          if ((source.v as number) < 0) throw new JavaException('IllegalArgumentException', `Illegal Capacity: ${source.v}`);
          return list;
        }
        if (source.t === 'set' && source.v !== null) {
          list.elem ??= source.elem;
          list.v = mapOrder(source, compareKeys).map(([k]) => k);
          return list;
        }
        if (source.t !== 'list') throw unsupported(n, 'this kind of new ArrayList');
        if (source.v === null) throw new JavaException('NullPointerException', 'Cannot copy a null list');
        list.elem ??= source.elem;
        list.v = (source.v as JVal[]).map((x) => this.listItem(x, list, from, 'the list'));
        return list;
      }
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
        if (v?.t === 'stream') throw unsupported(argNodes[0], 'printing a stream (collect it into a list first)');
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
    if (object?.text === 'String' && name === 'valueOf' && argNodes.length === 1) {
      const v = args()[0];
      return str(v.t === 'array' && v.elem === 'char' && v.v ? (v.v as JVal[]).map((c) => c.v).join('') : javaString(v));
    }
    if (object?.text === 'String' && name === 'join' && argNodes.length >= 2) {
      const [sep, ...rest] = args();
      if (sep.t !== 'String') throw new CompileError(lineOf(n), 'String.join needs the text to put between the items first.');
      const parts = rest.length === 1 && (rest[0].t === 'list' || rest[0].t === 'array') ? (rest[0].v as JVal[]) : rest;
      if (parts.some((p) => p.t !== 'String')) throw new CompileError(lineOf(n), 'String.join joins text only.');
      return str(parts.map(javaString).join(sep.v as string));
    }
    if (object?.text === 'Integer' && name === 'valueOf' && argNodes.length === 1) {
      const v = args()[0];
      if (v.t === 'String') return box(this.parseInt(v));
      if (v.t !== 'int' && v.t !== 'char') throw new CompileError(lineOf(n), 'Integer.valueOf needs a whole number or text.');
      return box(int(this.num(v)));
    }
    if (object?.text === 'Integer' && name === 'toString' && argNodes.length === 1) return str(javaString(unbox(args()[0])));
    if (object?.text === 'Character') return this.character(n, name, args());
    if (object?.text === 'Comparator' || (object?.text === 'Collections' && name === 'reverseOrder')) {
      // Comparator.comparing(s -> s.score) / comparingInt / naturalOrder() / reverseOrder()
      if (['comparing', 'comparingInt', 'comparingDouble', 'comparingLong'].includes(name) && argNodes.length === 1) {
        const key = args()[0];
        if (key.t !== 'func') throw new CompileError(lineOf(n), `Comparator.${name} needs a lambda or a method reference.`);
        return { t: 'func', v: { kind: 'comparing', key: key.v as JFunc, reversed: false } };
      }
      if ((name === 'naturalOrder' || name === 'reverseOrder') && !argNodes.length) return { t: 'func', v: { kind: 'natural', reversed: name === 'reverseOrder' } };
      throw unsupported(n, `${object.text}.${name}`);
    }
    if (object?.text === 'Collections') return this.collections(n, name, args());
    if (object?.text === 'Integer' && name === 'parseInt' && argNodes.length === 1) return this.parseInt(args()[0]);
    if (object?.text === 'Long' && name === 'parseLong' && argNodes.length === 1) {
      const s = args()[0];
      const ok = s.t === 'String' && s.v !== null && /^[+-]?\d+$/.test(s.v as string);
      const value = ok ? BigInt(s.v as string) : 0n;
      if (!ok || value >= 1n << 63n || value < -(1n << 63n)) throw new JavaException('NumberFormatException', `For input string: "${s.v}"`);
      return lng(value);
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
      if (name === 'stream' && argNodes.length === 1) {
        // Arrays.stream(int[]) is an IntStream; String[] / Dog[] give a Stream of objects.
        if (a.v === null) throw new JavaException('NullPointerException', 'Cannot read the array because it is null');
        if (a.elem === 'int' || a.elem === 'double') return this.stream([...(a.v as JVal[])], a.elem);
        if (a.elem === 'char' || a.elem === 'boolean' || a.elem === 'long') throw unsupported(n, `Arrays.stream of a ${a.elem} array`);
        return this.stream([...(a.v as JVal[])]);
      }
      if (name === 'deepToString') {
        const deep = (x: JVal): string => (x.t === 'array' ? (x.v === null ? 'null' : `[${(x.v as JVal[]).map(deep).join(', ')}]`) : javaString(x));
        return str(deep(a));
      }
      if (name === 'sort') {
        const cmp = argNodes.length === 2 ? this.funcArg(args()[1], n) : undefined;
        // Java: a comparing rule works on arrays of objects (String[], Dog[]), not int[].
        if (cmp && ['int', 'long', 'double', 'char', 'boolean'].includes(a.elem ?? '')) {
          throw new CompileError(lineOf(n), `Arrays.sort with a rule needs an array of objects (like String[]), not ${a.elem}[].`);
        }
        this.sortItems(a.v as JVal[], n, cmp);
        return VOID;
      }
      throw unsupported(n, `Arrays.${name}`);
    }
    if (object?.text === 'IntStream' || object?.text === 'Stream') {
      // IntStream.range(0, 5) / rangeClosed(1, 5) / IntStream.of(3, 1) / Stream.of("a", "b")
      const values = args();
      if (object.text === 'IntStream' && (name === 'range' || name === 'rangeClosed') && values.length === 2) {
        const [a, b] = values.map((v) => this.num(this.castTo('int', v, n)));
        const end = name === 'range' ? b : b + 1;
        return this.stream(Array.from({ length: Math.max(0, end - a) }, (_, i) => int(a + i)), 'int');
      }
      if (name === 'of' && values.length) {
        if (object.text === 'IntStream') return this.stream(values.map((v) => this.castTo('int', v, n)), 'int');
        return this.stream(values.map(box));
      }
      throw unsupported(n, `${object.text}.${name}`);
    }
    if (object?.text === 'Collectors') throw unsupported(n, `Collectors.${name}${['toList', 'toSet', 'joining'].includes(name) ? ' outside collect(...)' : ''}`);
    if (object?.text === 'Optional') throw unsupported(n, `Optional.${name}`);
    if (!object) return this.callUnqualified(n, name, args());
    if (object.type === 'super') return this.callSuper(n, name, args());
    if (object.type === 'identifier' && this.classes.has(object.text) && !this.scope.lookup(object.text)) {
      return this.callStatic(n, object.text, name, args());
    }

    const target = this.eval(object);
    if (target.t === 'object') return this.callOnObject(n, object, target, name, argNodes);
    if (target.t === 'Scanner') return this.scan(n, name, argNodes.length);
    if (target.t === 'String') {
      if (target.v === null) throw new JavaException('NullPointerException', `Cannot invoke "String.${name}()" because the value is null`);
      return this.stringMethod(n, target, name, args());
    }
    if (target.t === 'set') {
      if (target.v === null) throw new JavaException('NullPointerException', `Cannot invoke "Set.${name}()" because the value is null`);
      return this.setMethod(n, target, name, argNodes, args());
    }
    // collect(Collectors.toList()): the collector is read from the code, not run on its own.
    if (target.t === 'stream') return this.streamMethod(n, target.v as StreamData, name, argNodes, name === 'collect' ? argNodes.map(() => NULL) : args());
    if (target.t === 'optional') return this.optionalMethod(n, target, name, args());
    if (target.t === 'func') {
      const f = target.v as JFunc;
      if (name === 'reversed' && !argNodes.length) {
        return { t: 'func', v: f.kind === 'comparing' ? { ...f, reversed: !f.reversed } : f.kind === 'natural' ? { ...f, reversed: !f.reversed } : { kind: 'comparing', key: { kind: 'natural', reversed: false }, reversed: true, then: undefined } };
      }
      if ((name === 'thenComparing' || name === 'thenComparingInt' || name === 'thenComparingDouble') && argNodes.length === 1 && f.kind === 'comparing') {
        const next = args()[0];
        const nf = next.v as JFunc;
        return { t: 'func', v: { ...f, then: nf.kind === 'lambda' && named(nf.node.childForFieldName('parameters')).length === 2 ? nf : { kind: 'comparing', key: nf, reversed: false } } };
      }
      if (name === 'compare' && argNodes.length === 2) {
        const [x, y] = args();
        return int(this.compareWith(f, x, y, n));
      }
      throw unsupported(n, `the method ${name} on a lambda`);
    }
    if (target.t === 'map') {
      if (target.v === null) throw new JavaException('NullPointerException', `Cannot invoke "Map.${name}()" because the value is null`);
      if (name === 'forEach' && argNodes.length === 1) {
        // map.forEach((k, v) -> ...): each entry in the map's order.
        const f = this.funcArg(args()[0], n);
        for (const [k, v] of mapOrder(target, compareKeys)) this.callFunc(f, [k, v], n);
        return VOID;
      }
      return this.mapMethod(n, target, name, argNodes, args());
    }
    if (target.t === 'entry') {
      if (target.v === null) throw new JavaException('NullPointerException', `Cannot invoke "Map.Entry.${name}()" because the value is null`);
      const entry = target.v as [JVal, JVal];
      if (name === 'getKey' && !argNodes.length) return entry[0];
      if (name === 'getValue' && !argNodes.length) return entry[1];
      if (name === 'setValue' && argNodes.length === 1) {
        const old = entry[1];
        entry[1] = this.listItem(args()[0], { t: 'list', v: [], elem: target.elem }, argNodes[0], 'this entry');
        return old;
      }
      if (name === 'toString' && !argNodes.length) return str(javaString(target));
      throw unsupported(n, `the method ${name} on a map entry`);
    }
    if (target.t === 'list' && target.src && LIST_CHANGERS.has(name)) throw unsupported(n, `changing ${name === 'add' ? 'a map' : 'a map'} through keySet(), values() or entrySet()`);
    if (target.t === 'list') {
      if (target.v === null) throw new JavaException('NullPointerException', `Cannot invoke "List.${name}()" because the value is null`);
      return this.listMethod(n, target, name, argNodes, args());
    }
    if (target.t === 'exception') {
      if (target.cls === undefined) throw new JavaException('NullPointerException', `Cannot invoke "${name}()" because the value is null`);
      if (name === 'getMessage' && !argNodes.length) return target.v === null ? { t: 'String', v: null } : str(target.v as string);
      if (name === 'toString' && !argNodes.length) return str(javaString(target));
      throw unsupported(n, `the method ${name} on an exception`);
    }
    if (target.boxed && target.v !== null && argNodes.length <= 1) {
      // Integer objects: equals compares the value and the kind (an Integer 5 is not a Double 5.0).
      if (name === 'equals') return bool(sameValue(target, args()[0]));
      if (name === 'intValue' || name === 'doubleValue') return this.castTo(name === 'intValue' ? 'int' : 'double', target, n);
      if (name === 'toString') return str(javaString(target));
    }
    throw unsupported(n, `the method ${name}`);
  }

  private parseInt(s: JVal): JVal {
    if (s.t !== 'String' || s.v === null || !/^[+-]?\d+$/.test(s.v as string) || Math.abs(Number(s.v)) > 2147483648) {
      throw new JavaException('NumberFormatException', `For input string: "${s.v}"`);
    }
    return int(Number(s.v));
  }

  /** compareTo order, like Java: numbers by size, text by character codes ("B" before "a"). */
  /**
   * Sort like Java: numbers and text by value; objects with their compareTo (Comparable), in
   * Java's own order of comparisons for short lists (binary insertion sort, as TimSort does under 32 items).
   */
  private sortItems(items: JVal[], at: Node, comparator?: JFunc) {
    if (!comparator && !items.some((x) => x.t === 'object')) {
      items.sort((x, y) => this.compare(x, y));
      return;
    }
    const cmp = comparator ? (x: JVal, y: JVal) => this.compareWith(comparator, x, y, at) : (x: JVal, y: JVal) => this.compareObjects(x, y, at);
    const n = items.length;
    if (n < 2) return;
    if (n >= 32) {
      // Longer lists: a stable merge sort (the same result as Java; the comparisons may come in another order).
      const sorted = this.mergeSort(items, cmp);
      items.splice(0, n, ...sorted);
      return;
    }
    // countRunAndMakeAscending
    let runHi = 1;
    if (cmp(items[runHi++], items[0]) < 0) {
      while (runHi < n && cmp(items[runHi], items[runHi - 1]) < 0) runHi++;
      items.splice(0, runHi, ...items.slice(0, runHi).reverse());
    } else {
      while (runHi < n && cmp(items[runHi], items[runHi - 1]) >= 0) runHi++;
    }
    // binarySort
    for (let start = runHi; start < n; start++) {
      const pivot = items[start];
      let left = 0;
      let right = start;
      while (left < right) {
        const mid = (left + right) >>> 1;
        if (cmp(pivot, items[mid]) < 0) right = mid;
        else left = mid + 1;
      }
      items.splice(start, 1);
      items.splice(left, 0, pivot);
    }
  }

  // ---- streams ------------------------------------------------------------------

  private stream(source: JVal[], prim?: 'int' | 'double'): JVal {
    return { t: 'stream', v: { source, prim, ops: [] } as StreamData };
  }

  /** A stream call: a step to add (filter, map, sorted...) or the last call that runs the stream. */
  private streamMethod(n: Node, d: StreamData, name: string, argNodes: Node[], a: JVal[]): JVal {
    const fn = (i = 0) => this.funcArg(a[i], n);
    // add(op) keeps the kind of stream; add(op, undefined) makes it a Stream of objects again.
    const add = (op: StreamOp, ...to: ['int' | 'double' | undefined] | []): JVal => ({ t: 'stream', v: { ...d, ops: [...d.ops, op], prim: to.length ? to[0] : d.prim } as StreamData });
    const kind = d.prim === 'int' ? 'IntStream' : d.prim === 'double' ? 'DoubleStream' : 'Stream';
    const needNumbers = () => {
      if (!d.prim) throw new CompileError(lineOf(n), `${name}() works on a stream of numbers: use mapToInt(x -> x) first.`);
    };
    const count = (k: number) => {
      if (a.length !== k) throw new CompileError(lineOf(n), `${name} needs ${k} value${k === 1 ? '' : 's'} here, not ${a.length}.`);
    };
    const size = (v: JVal) => {
      const k = this.num(unbox(v));
      if (k < 0) throw new JavaException('IllegalArgumentException', String(k));
      return k;
    };
    switch (name) {
      // Steps: nothing runs yet.
      case 'filter':
      case 'peek':
        count(1);
        return add({ k: name, f: fn() });
      case 'map':
        count(1);
        return add({ k: 'map', f: fn(), to: d.prim ?? 'obj' });
      case 'mapToInt':
      case 'mapToDouble':
        count(1);
        if (d.prim && name === 'mapToInt') throw new CompileError(lineOf(n), `An ${kind} already holds numbers: use map(...).`);
        return add({ k: 'map', f: fn(), to: name === 'mapToInt' ? 'int' : 'double' }, name === 'mapToInt' ? 'int' : 'double');
      case 'mapToObj':
        count(1);
        needNumbers();
        return add({ k: 'map', f: fn(), to: 'obj' }, undefined);
      case 'boxed':
        count(0);
        needNumbers();
        return add({ k: 'boxed' }, undefined);
      case 'asDoubleStream':
        count(0);
        if (d.prim !== 'int') throw unsupported(n, `${kind}.asDoubleStream`);
        return add({ k: 'asDouble' }, 'double');
      case 'sorted':
        if (a.length > 1) count(1);
        if (d.prim && a.length) throw new CompileError(lineOf(n), `An ${kind} sorts its numbers from small to large only: use boxed().sorted(...) for another order.`);
        return add({ k: 'sorted', cmp: a.length && a[0].t !== 'null' ? fn() : undefined });
      case 'distinct':
        count(0);
        return add({ k: 'distinct' });
      case 'limit':
      case 'skip':
        count(1);
        return add({ k: name, n: size(a[0]) });

      // The last call: the stream runs now.
      case 'forEach':
      case 'forEachOrdered': {
        count(1);
        const f = fn();
        this.runStream(d, { accept: (x) => void this.callFunc(f, [x], n), end: () => {}, cancel: () => false }, n);
        return VOID;
      }
      case 'collect': {
        count(1);
        if (d.prim) throw new CompileError(lineOf(n), `An ${kind} can't collect(...) directly: use boxed() first.`);
        const c = argNodes[0];
        const how = c.type === 'method_invocation' && c.childForFieldName('object')?.text === 'Collectors' ? c.childForFieldName('name')!.text : '';
        const cArgs = c.type === 'method_invocation' ? named(c.childForFieldName('arguments')) : [];
        if ((how === 'toList' || how === 'toSet') && !cArgs.length) {
          const items = this.collectAll(d, n);
          if (how === 'toList') return { t: 'list', v: items, id: freshId(), mod: 0 };
          const set: JVal = { t: 'set', kind: 'hash', v: { entries: new Map(), cap: 16 }, id: freshId(), mod: 0 };
          for (const x of items) if (!(set.v as MapData).entries.has(keyId(x))) this.mapPut(set, x, x);
          return set;
        }
        if (how === 'joining' && (cArgs.length <= 1 || cArgs.length === 3)) {
          const parts = cArgs.map((x) => this.eval(x));
          if (parts.some((p) => p.t !== 'String')) throw new CompileError(lineOf(c), 'Collectors.joining needs text in quotes.');
          const [sep, pre, post] = parts.map((p) => p.v as string);
          const items = this.collectAll(d, n);
          if (items.some((x) => x.t !== 'String')) throw new CompileError(lineOf(n), 'Collectors.joining joins text only: use map(String::valueOf) first.');
          return str((pre ?? '') + items.map(javaString).join(sep ?? '') + (post ?? ''));
        }
        throw unsupported(c, c.text.replace(/\(.*$/s, ''));
      }
      case 'toList': {
        count(0);
        if (d.prim) throw new CompileError(lineOf(n), `An ${kind} has no toList(): use boxed() first.`);
        return { t: 'list', v: this.collectAll(d, n), id: freshId(), mod: 0, fixed: true };
      }
      case 'toArray': {
        count(0);
        if (!d.prim) throw unsupported(n, 'toArray() on a Stream of objects');
        return { t: 'array', elem: d.prim, v: this.collectAll(d, n), id: freshId() };
      }
      case 'count': {
        count(0);
        // Java 9 and later: when no step can change how many items there are, count() does not run the steps.
        if (!d.ops.some((o) => ['filter', 'distinct', 'limit', 'skip'].includes(o.k))) return { t: 'long', v: d.source.length };
        let k = 0;
        this.runStream(d, { accept: () => void k++, end: () => {}, cancel: () => false }, n);
        return { t: 'long', v: k };
      }
      case 'sum': {
        count(0);
        needNumbers();
        const items = this.collectAll(d, n).map((x) => this.num(x));
        if (d.prim === 'int') return int(items.reduce((t, x) => (t + x) | 0, 0));
        return dbl(kahanSum(items));
      }
      case 'average': {
        count(0);
        needNumbers();
        const items = this.collectAll(d, n).map((x) => this.num(x));
        const v = !items.length ? null : d.prim === 'int' ? dbl(items.reduce((t, x) => t + x, 0) / items.length) : dbl(kahanSum(items) / items.length);
        return { t: 'optional', v, elem: 'double' };
      }
      case 'min':
      case 'max': {
        if (d.prim) {
          count(0);
          const items = this.collectAll(d, n);
          const pick = (x: JVal, y: JVal) => (name === 'min' ? (this.num(y) < this.num(x) ? y : x) : this.num(y) > this.num(x) ? y : x);
          return { t: 'optional', v: items.length ? items.reduce(pick) : null, elem: d.prim };
        }
        if (a.length !== 1) throw new CompileError(lineOf(n), `${name} on a Stream needs a Comparator, like ${name}(Comparator.naturalOrder()).`);
        // BinaryOperator.minBy / maxBy: compare(best so far, next).
        const cmp = fn();
        return this.reduceStream(d, n, (x, y) => {
          const c = this.compareWith(cmp, x, y, n);
          return name === 'min' ? (c <= 0 ? x : y) : c >= 0 ? x : y;
        });
      }
      case 'reduce': {
        if (a.length === 1) {
          const f = fn();
          return this.reduceStream(d, n, (x, y) => this.streamItem(this.callFunc(f, [x, y], n), d.prim ?? 'obj', n));
        }
        count(2);
        const f = fn(1);
        let acc = this.streamItem(a[0], d.prim ?? 'obj', n);
        this.runStream(d, { accept: (x) => void (acc = this.streamItem(this.callFunc(f, [acc, x], n), d.prim ?? 'obj', n)), end: () => {}, cancel: () => false }, n);
        return acc;
      }
      case 'anyMatch':
      case 'allMatch':
      case 'noneMatch': {
        count(1);
        const f = fn();
        // Java's MatchOps: stop at the first item that decides the answer.
        const stopWhen = name === 'anyMatch';
        let stop = false;
        let value = name !== 'anyMatch';
        this.runStream(
          d,
          {
            accept: (x) => {
              if (!stop && this.test(f, x, n) === stopWhen) {
                stop = true;
                value = name === 'anyMatch';
              }
            },
            end: () => {},
            cancel: () => stop,
          },
          n,
        );
        return bool(value);
      }
      case 'findFirst':
      case 'findAny': {
        count(0);
        let found: JVal | null = null;
        this.runStream(d, { accept: (x) => void (found ??= x), end: () => {}, cancel: () => found !== null }, n);
        return { t: 'optional', v: found, elem: d.prim };
      }
    }
    throw unsupported(n, `${kind}.${name}`);
  }

  /** Every item that comes out of the stream, in order. */
  private collectAll(d: StreamData, at: Node): JVal[] {
    const out: JVal[] = [];
    this.runStream(d, { accept: (x) => void out.push(x), end: () => {}, cancel: () => false }, at);
    return out;
  }

  /** reduce(op) / min / max: the first item is the start, then op(so far, next). */
  private reduceStream(d: StreamData, at: Node, op: (x: JVal, y: JVal) => JVal): JVal {
    let acc: JVal | null = null;
    this.runStream(d, { accept: (x) => void (acc = acc === null ? x : op(acc, x)), end: () => {}, cancel: () => false }, at);
    return { t: 'optional', v: acc, elem: d.prim };
  }

  private test(f: JFunc, x: JVal, at: Node): boolean {
    const r = this.callFunc(f, [x], at);
    if (r.t !== 'boolean') throw new CompileError(lineOf(at), 'This lambda must give back true or false.');
    return unbox(r).v as boolean;
  }

  /** A value going into a stream: an int in an IntStream, a double in a DoubleStream, an object (Integer...) otherwise. */
  private streamItem(v: JVal, to: 'int' | 'double' | 'obj', at: Node): JVal {
    if (to === 'obj') {
      if (v.t === 'void') throw new CompileError(lineOf(at), 'This lambda must give back a value.');
      return box(v);
    }
    const u = unbox(v);
    if (to === 'int') {
      if (u.t !== 'int' && u.t !== 'char') throw new CompileError(lineOf(at), `This lambda must give back an int here, not ${formatJava(v)}.`);
      return int(this.num(u));
    }
    if (!NUMERIC.has(u.t)) throw new CompileError(lineOf(at), `This lambda must give back a number here, not ${formatJava(v)}.`);
    return dbl(this.num(u));
  }

  /** Run the stream: each item goes through every step before the next one starts (Java's sink chain). */
  private runStream(d: StreamData, terminal: Sink, at: Node) {
    let sink = terminal;
    for (let i = d.ops.length - 1; i >= 0; i--) sink = this.opSink(d.ops[i], sink, at);
    for (const x of d.source) {
      if (sink.cancel()) break;
      sink.accept(x);
    }
    sink.end();
  }

  private opSink(op: StreamOp, down: Sink, at: Node): Sink {
    const pass = { end: () => down.end(), cancel: () => down.cancel() };
    switch (op.k) {
      case 'filter':
        return { ...pass, accept: (x) => this.test(op.f, x, at) && down.accept(x) };
      case 'peek':
        return { ...pass, accept: (x) => (this.callFunc(op.f, [x], at), down.accept(x)) };
      case 'map':
        return { ...pass, accept: (x) => down.accept(this.streamItem(this.callFunc(op.f, [x], at), op.to, at)) };
      case 'boxed':
        return { ...pass, accept: (x) => down.accept(box(x)) };
      case 'asDouble':
        return { ...pass, accept: (x) => down.accept(dbl(this.num(x))) };
      case 'distinct': {
        // Equal values pass once (objects of the program's classes: the same object).
        const seen = new Set<string>();
        return {
          ...pass,
          accept: (x) => {
            const key = x.t === 'object' ? `o:${String(x.id)}:${x.v === null ? 'null' : ''}` : keyId(x);
            if (seen.has(key)) return;
            seen.add(key);
            down.accept(x);
          },
        };
      }
      case 'limit': {
        let m = op.n;
        return {
          end: () => down.end(),
          cancel: () => m === 0 || down.cancel(),
          accept: (x) => {
            if (m > 0) {
              m--;
              down.accept(x);
            }
          },
        };
      }
      case 'skip': {
        let k = op.n;
        return { ...pass, accept: (x) => (k > 0 ? void k-- : down.accept(x)) };
      }
      case 'sorted': {
        // Waits for every item, sorts them (Java's TimSort, so a comparing lambda is called in Java's order), then passes them on.
        const buffer: JVal[] = [];
        return {
          accept: (x) => void buffer.push(x),
          cancel: () => false,
          end: () => {
            this.sortItems(buffer, at, op.cmp);
            for (const x of buffer) {
              if (down.cancel()) break;
              down.accept(x);
            }
            down.end();
          },
        };
      }
    }
  }

  /** Optional / OptionalInt / OptionalDouble: get the value, or say what to do when there is none. */
  private optionalMethod(n: Node, o: JVal, name: string, a: JVal[]): JVal {
    const kind = o.elem === 'int' ? 'OptionalInt' : o.elem === 'double' ? 'OptionalDouble' : 'Optional';
    const value = o.v as JVal | null;
    const getter = o.elem === 'int' ? 'getAsInt' : o.elem === 'double' ? 'getAsDouble' : 'get';
    if ((name === getter || name === 'orElseThrow') && !a.length) {
      if (value === null) throw new JavaException('NoSuchElementException', 'No value present');
      return value;
    }
    if (['get', 'getAsInt', 'getAsDouble'].includes(name)) throw new CompileError(lineOf(n), `An ${kind} gives its value with ${getter}().`);
    if (name === 'isPresent' && !a.length) return bool(value !== null);
    if (name === 'isEmpty' && !a.length) return bool(value === null);
    if (name === 'orElse' && a.length === 1) return value ?? this.streamItem(a[0], o.elem === 'int' || o.elem === 'double' ? o.elem : 'obj', n);
    if (name === 'ifPresent' && a.length === 1) {
      if (value !== null) this.callFunc(this.funcArg(a[0], n), [value], n);
      return VOID;
    }
    throw unsupported(n, `${kind}.${name}`);
  }

  /** Integer::sum, String::length...: Java's own methods used as method references. */
  private callBuiltin(name: string, args: JVal[], at: Node): JVal {
    const [cls, method] = name.split('::');
    const x = args[0];
    if (cls === 'String' && method === 'valueOf') return str(javaString(x));
    if (cls === 'String') {
      if (x.t !== 'String') throw new CompileError(lineOf(at), `${name} works on text, not ${formatJava(x)}.`);
      if (x.v === null) throw new JavaException('NullPointerException', `Cannot invoke "String.${method}()" because the value is null`);
      return this.stringMethod(at, x, method, []);
    }
    if (method === 'parseInt') return this.parseInt(x);
    if (method === 'intValue') return int(this.num(unbox(x)));
    if (method === 'valueOf') return box(int(this.num(unbox(x))));
    const [p, q] = args.map((v) => this.num(unbox(v)));
    const make = cls === 'Integer' ? int : dbl;
    if (method === 'sum') return make(p + q);
    if (method === 'max') return make(Math.max(p, q));
    if (method === 'min') return make(Math.min(p, q));
    return int(p < q ? -1 : p > q ? 1 : 0); // compare
  }

  private funcArg(v: JVal, at: Node): JFunc {
    if (v.t !== 'func') throw new CompileError(lineOf(at), 'This needs a lambda (like x -> ...) or a method reference (like Dog::getName).');
    return v.v as JFunc;
  }

  /** Run a lambda (in its own small frame "lambda(...)") or a method reference with these values. */
  private callFunc(f: JFunc, args: JVal[], at: Node): JVal {
    if (f.kind === 'println') {
      this.rt.output += javaString(args[0]) + '\n';
      return VOID;
    }
    if (f.kind === 'method') {
      const self = args[0];
      if (self.t !== 'object' || self.v === null) throw new JavaException('NullPointerException', `Cannot invoke "${f.cls}.${f.name}()" on null`);
      const found = findMethod((self.v as JObject).cls, f.name);
      if (!found) throw new CompileError(lineOf(at), `${f.cls} has no method called ${f.name}.`);
      return this.callMethod(at, found.owner, found.m, args.slice(1), self, `${f.cls}.${f.name}`);
    }
    if (f.kind === 'builtin') return this.callBuiltin(f.name, args, at);
    if (f.kind !== 'lambda') return int(this.compareWith(f, args[0], args[1], at));
    const node = f.node;
    const paramsNode = node.childForFieldName('parameters')!;
    const params = paramsNode.type === 'identifier' ? [paramsNode] : named(paramsNode).map((p) => (p.type === 'formal_parameter' ? p.childForFieldName('name')! : p));
    if (params.length !== args.length) throw new CompileError(lineOf(node), `This lambda takes ${params.length} value${params.length === 1 ? '' : 's'}, but here it gets ${args.length}.`);
    const saved = this.scope;
    const savedClass = this.currentClass;
    const scope = new Scope(f.scope as Scope, true);
    params.forEach((p, i) => scope.vars.set(p.text, { t: args[i].t, elem: args[i].elem, kt: args[i].kt, cls: args[i].cls, box: args[i].boxed, v: args[i] }));
    const names = params.map((p) => p.text);
    this.scope = scope;
    this.currentClass = f.cls;
    this.rt.hooks.enter('lambda', this.namesId(names), this.getters(names), 0);
    const top = this.rt.stack[this.rt.stack.length - 1] as unknown as { pending: number | null };
    try {
      const body = node.childForFieldName('body')!;
      if (body.type === 'block') {
        this.execBody(body);
        return VOID;
      }
      // x -> x.score: the value of the expression is what the lambda gives back.
      top.pending = lineOf(body);
      const value = this.eval(body);
      if (value.t !== 'void') this.rt.hooks.ret(lineOf(body), value.t === 'array' || value.t === 'list' ? (value.v as JVal[]) : value);
      return value;
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      this.rt.hooks.thrown(e);
      throw e;
    } finally {
      if (top.pending === null) top.pending = lineOf(node);
      this.rt.hooks.leave();
      this.scope = saved;
      this.currentClass = savedClass;
    }
  }

  /** A Comparator's answer for two values: negative, 0 or positive. */
  private compareWith(f: JFunc, x: JVal, y: JVal, at: Node): number {
    if (f.kind === 'natural') {
      const c = x.t === 'object' ? this.compareObjects(x, y, at) : this.compare(x, y);
      return f.reversed ? -c : c;
    }
    if (f.kind === 'comparing') {
      const kx = this.callFunc(f.key, [x], at);
      const ky = this.callFunc(f.key, [y], at);
      let c = kx.t === 'object' ? this.compareObjects(kx, ky, at) : this.compare(kx, ky);
      if (f.reversed) c = -c;
      if (c === 0 && f.then) c = this.compareWith(f.then, x, y, at);
      return c;
    }
    const r = this.callFunc(f, [x, y], at);
    if (r.t !== 'int') throw new CompileError(lineOf(at), 'A comparing lambda must give back an int (negative, 0 or positive).');
    return unbox(r).v as number;
  }

  private mergeSort(items: JVal[], cmp: (a: JVal, b: JVal) => number): JVal[] {
    if (items.length < 2) return items.slice();
    const mid = items.length >> 1;
    const a = this.mergeSort(items.slice(0, mid), cmp);
    const b = this.mergeSort(items.slice(mid), cmp);
    const out: JVal[] = [];
    while (a.length && b.length) out.push(cmp(b[0], a[0]) < 0 ? b.shift()! : a.shift()!);
    return [...out, ...a, ...b];
  }

  /** a.compareTo(b) for objects that implement Comparable (its steps show, like any method). */
  private compareObjects(x: JVal, y: JVal, at: Node): number {
    if (x.t !== 'object' || y.t !== 'object') throw new CompileError(lineOf(at), 'A list to sort must hold one kind of value.');
    if (x.v === null || y.v === null) throw new JavaException('NullPointerException', 'Cannot compare a null value');
    const cls = (x.v as JObject).cls;
    const found = findMethod(cls, 'compareTo');
    if (!isSubclass(cls, 'Comparable') || !found) {
      throw new CompileError(lineOf(at), `${cls} objects can't be sorted by themselves: write class ${cls} implements Comparable<${cls}> with a compareTo method.`);
    }
    const result = this.callMethod(at, found.owner, found.m, [y], x, `${cls}.compareTo`);
    if (result.t !== 'int') throw new CompileError(lineOf(found.m), 'compareTo must give back an int.');
    return result.v as number;
  }

  private compare(x: JVal, y: JVal): number {
    if (x.v === null || y.v === null) throw new JavaException('NullPointerException', 'Cannot compare a null value');
    if (x.t === 'String' && y.t === 'String') return compareText(x.v as string, y.v as string);
    if (x.t === 'boolean') return Number(x.v) - Number(y.v);
    return this.num(x) - this.num(y);
  }

  private stringMethod(n: Node, target: JVal, name: string, a: JVal[]): JVal {
    const s = target.v as string;
    const need = (count: number[], ...types: JType[][]) => {
      if (!count.includes(a.length) || a.some((v, i) => types[i] && !types[i].includes(v.t))) {
        throw new CompileError(lineOf(n), `${name} can't be used with these values.`);
      }
    };
    const text = (v: JVal) => {
      if (v.v === null) throw new JavaException('NullPointerException', `Cannot use null in String.${name}`);
      return v.v as string;
    };
    // A method that changes nothing gives back the same object (like Java), anything else is new text.
    const result = (t: string) => (t === s ? target : str(t));
    const outOfText = (detail: string) => new JavaException('StringIndexOutOfBoundsException', detail);
    const whole = ['int', 'char'] as JType[];
    switch (name) {
      case 'length':
        need([0]);
        return int(s.length);
      case 'charAt': {
        need([1], whole);
        const i = this.num(a[0]);
        if (i < 0 || i >= s.length) throw outOfText(`Index ${i} out of bounds for length ${s.length}`);
        return { t: 'char', v: s[i] };
      }
      case 'equals':
        need([1]);
        return bool(a[0].t === 'String' && a[0].v === s);
      case 'equalsIgnoreCase':
        need([1]);
        return bool(a[0].t === 'String' && a[0].v !== null && (a[0].v as string).toLowerCase() === s.toLowerCase());
      case 'isEmpty':
        need([0]);
        return bool(s.length === 0);
      case 'isBlank':
        need([0]);
        return bool(s.trim().length === 0);
      case 'substring': {
        need([1, 2], whole, whole);
        const b = this.num(a[0]);
        const e = a[1] ? this.num(a[1]) : s.length;
        if (b < 0 || e > s.length || b > e) throw outOfText(`begin ${b}, end ${e}, length ${s.length}`);
        return result(s.slice(b, e));
      }
      case 'indexOf':
      case 'lastIndexOf': {
        need([1, 2], ['String', 'char', 'int'], whole);
        const what = a[0].t === 'String' ? text(a[0]) : a[0].t === 'char' ? (a[0].v as string) : String.fromCharCode(this.num(a[0]));
        if (name === 'indexOf') return int(s.indexOf(what, a[1] ? Math.max(0, this.num(a[1])) : 0));
        return int(a[1] ? (this.num(a[1]) < 0 ? -1 : s.lastIndexOf(what, this.num(a[1]))) : s.lastIndexOf(what));
      }
      case 'contains':
        need([1], ['String']);
        return bool(s.includes(text(a[0])));
      case 'startsWith':
        need([1], ['String']);
        return bool(s.startsWith(text(a[0])));
      case 'endsWith':
        need([1], ['String']);
        return bool(s.endsWith(text(a[0])));
      case 'toUpperCase':
        need([0]);
        return result(s.toUpperCase());
      case 'toLowerCase':
        need([0]);
        return result(s.toLowerCase());
      case 'trim':
        need([0]);
        return result(s.replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, ''));
      case 'strip':
        need([0]);
        return result(s.trim());
      case 'concat':
        need([1], ['String']);
        return text(a[0]) === '' ? target : str(s + text(a[0]));
      case 'repeat': {
        need([1], ['int']);
        const k = this.num(a[0]);
        if (k < 0) throw new JavaException('IllegalArgumentException', `count is negative: ${k}`);
        return k === 1 ? target : str(s.repeat(k));
      }
      case 'replace': {
        need([2]);
        const [x, y] = a;
        if (x.t === 'char' && y.t === 'char') return result(s.split(x.v as string).join(y.v as string));
        if (x.t === 'String' && y.t === 'String') return result(s.split(text(x)).join(text(y)));
        throw new CompileError(lineOf(n), 'replace needs two chars or two pieces of text.');
      }
      case 'compareTo':
        need([1], ['String']);
        return int(compareText(s, text(a[0])));
      case 'compareToIgnoreCase':
        need([1], ['String']);
        return int(compareText(s.toUpperCase().toLowerCase(), text(a[0]).toUpperCase().toLowerCase()));
      case 'split': {
        need([1], ['String']);
        let parts: string[];
        try {
          parts = s.split(new RegExp(text(a[0])));
        } catch {
          throw unsupported(n, 'this split pattern');
        }
        // Java drops empty pieces at the end, and an empty first piece made by a zero-width match.
        while (parts.length > 1 && parts[parts.length - 1] === '') parts.pop();
        return { t: 'array', v: parts.map((p) => str(p)), elem: 'String', id: freshId() };
      }
      case 'toCharArray':
        need([0]);
        return { t: 'array', v: [...s].map((c) => ({ t: 'char' as const, v: c })), elem: 'char', id: freshId() };
    }
    throw unsupported(n, `the method ${name}`);
  }

  private listMethod(n: Node, list: JVal, name: string, argNodes: Node[], a: JVal[]): JVal {
    const items = list.v as JVal[];
    if (name === 'stream' && !a.length) return this.stream([...items]);
    if (list.fixed && (LIST_CHANGERS.has(name) || ['sort', 'removeIf', 'replaceAll'].includes(name))) throw new JavaException('UnsupportedOperationException', '');
    if (name === 'sort' && a.length === 1) {
      // list.sort(comparator) / list.sort(null) (natural order)
      this.sortItems(items, n, a[0].t === 'null' ? undefined : this.funcArg(a[0], n));
      list.mod = (list.mod ?? 0) + 1;
      return VOID;
    }
    if (name === 'forEach' && a.length === 1) {
      const f = this.funcArg(a[0], n);
      const start = list.mod ?? 0;
      for (const x of [...items]) {
        this.callFunc(f, [x], n);
        if ((list.mod ?? 0) !== start) throw new JavaException('ConcurrentModificationException', '');
      }
      return VOID;
    }
    if (name === 'removeIf' && a.length === 1) {
      const f = this.funcArg(a[0], n);
      const keep: JVal[] = [];
      for (const x of items) {
        const r = this.callFunc(f, [x], n);
        if (r.t !== 'boolean') throw new CompileError(lineOf(n), 'removeIf needs a lambda that gives true or false.');
        if (!unbox(r).v) keep.push(x);
      }
      const removed = keep.length !== items.length;
      items.splice(0, items.length, ...keep);
      if (removed) list.mod = (list.mod ?? 0) + 1;
      return bool(removed);
    }
    if (name === 'replaceAll' && a.length === 1) {
      const f = this.funcArg(a[0], n);
      for (let i = 0; i < items.length; i++) items[i] = this.listItem(this.callFunc(f, [items[i]], n), list, n, 'the list');
      return VOID;
    }
    const listName = n.childForFieldName('object')!.text;
    const changed = () => {
      list.mod = (list.mod ?? 0) + 1;
    };
    const position = (i: number, size: number) => {
      if (i < 0 || i >= size) throw new JavaException('IndexOutOfBoundsException', `Index ${i} out of bounds for length ${size}`);
    };
    // A plain int (not an Integer object) is a position: nums.remove(1) takes out the item at position 1.
    const isPosition = (v: JVal) => (v.t === 'int' || v.t === 'char') && !v.boxed;
    const count = (k: number) => {
      if (a.length !== k) throw new CompileError(lineOf(n), `${listName}.${name} can't be used with ${a.length} value${a.length === 1 ? '' : 's'}.`);
    };
    switch (name) {
      case 'size':
        count(0);
        return int(items.length);
      case 'isEmpty':
        count(0);
        return bool(items.length === 0);
      case 'get': {
        count(1);
        const i = this.num(a[0]);
        position(i, items.length);
        return items[i];
      }
      case 'set': {
        count(2);
        const i = this.num(a[0]);
        position(i, items.length);
        const old = items[i];
        items[i] = this.listItem(a[1], list, argNodes[1], listName);
        return old;
      }
      case 'add': {
        if (a.length === 1) {
          items.push(this.listItem(a[0], list, argNodes[0], listName));
          changed();
          return bool(true);
        }
        count(2);
        if (!isPosition(a[0])) throw new CompileError(lineOf(n), `${listName}.add(position, value) needs a whole number first.`);
        const i = this.num(a[0]);
        if (i < 0 || i > items.length) throw new JavaException('IndexOutOfBoundsException', `Index: ${i}, Size: ${items.length}`);
        items.splice(i, 0, this.listItem(a[1], list, argNodes[1], listName));
        changed();
        return VOID;
      }
      case 'addAll': {
        count(1);
        if (a[0].t !== 'list') throw unsupported(n, `${listName}.addAll with this value`);
        if (a[0].v === null) throw new JavaException('NullPointerException', 'Cannot add a null list');
        const more = (a[0].v as JVal[]).map((x) => this.listItem(x, list, argNodes[0], listName));
        items.push(...more);
        changed();
        return bool(more.length > 0);
      }
      case 'remove': {
        count(1);
        if (isPosition(a[0])) {
          const i = this.num(a[0]);
          position(i, items.length);
          const [old] = items.splice(i, 1);
          changed();
          return old;
        }
        const k = items.findIndex((x) => sameValue(x, a[0]));
        if (k < 0) return bool(false);
        items.splice(k, 1);
        changed();
        return bool(true);
      }
      case 'clear':
        count(0);
        items.length = 0;
        changed();
        return VOID;
      case 'contains':
        count(1);
        return bool(items.some((x) => sameValue(x, a[0])));
      case 'indexOf':
        count(1);
        return int(items.findIndex((x) => sameValue(x, a[0])));
      case 'lastIndexOf': {
        count(1);
        let k = -1;
        items.forEach((x, i) => {
          if (sameValue(x, a[0])) k = i;
        });
        return int(k);
      }
      case 'equals': {
        count(1);
        const other = a[0];
        if (other.t !== 'list' || other.v === null) return bool(false);
        const b = other.v as JVal[];
        return bool(b.length === items.length && items.every((x, i) => sameValue(x, b[i])));
      }
      case 'toString':
        count(0);
        return str(arrayText(list));
    }
    throw unsupported(n, `the method ${name} on a list`);
  }

  /** new HashMap<>() / new TreeMap<>() / new LinkedHashMap<>(); (16) a starting size; (other) a copy. */
  private newMap(n: Node, type: Node): JVal {
    const [k, v] = named(named(type)[1]);
    const box = (a?: Node) => (a ? WRAPPERS[a.text] ?? (a.text as Prim) : undefined);
    const m: JVal = { t: 'map', kind: MAP_KINDS[named(type)[0].text], kt: box(k), elem: box(v), v: { entries: new Map(), cap: 16 }, id: freshId(), mod: 0 };
    const arg = named(n.childForFieldName('arguments'))[0];
    if (!arg) return m;
    const from = this.eval(arg);
    if (from.t === 'int') {
      if ((from.v as number) < 0) throw new JavaException('IllegalArgumentException', `Illegal initial capacity: ${from.v}`);
      (m.v as MapData).cap = tableSizeFor(from.v as number);
      return m;
    }
    if (from.t !== 'map') throw unsupported(n, 'this kind of new map');
    if (from.v === null) throw new JavaException('NullPointerException', 'Cannot copy a null map');
    m.kt ??= from.kt;
    m.elem ??= from.elem;
    const src = from.v as MapData;
    (m.v as MapData).cap = tableSizeFor(Math.floor(src.entries.size / 0.75 + 1));
    for (const [key, value] of mapOrder(from, compareKeys)) this.mapPut(m, key, value);
    return m;
  }

  /** new HashSet<>() / new TreeSet<>() / new LinkedHashSet<>(); (list or set) copies its items in. */
  private newSet(n: Node, type: Node): JVal {
    const arg0 = named(named(type)[1])[0];
    const elem = arg0 ? WRAPPERS[arg0.text] ?? (arg0.text as Prim) : undefined;
    const set: JVal = { t: 'set', kind: SET_KINDS[named(type)[0].text], kt: elem, elem, v: { entries: new Map(), cap: 16 }, id: freshId(), mod: 0 };
    const arg = named(n.childForFieldName('arguments'))[0];
    if (!arg) return set;
    // new HashSet<>(List.of(1, 2)) / (Arrays.asList(...)): the values written there.
    const call = arg.type === 'method_invocation' ? `${arg.childForFieldName('object')?.text}.${arg.childForFieldName('name')?.text}` : '';
    if (call === 'List.of' || call === 'Arrays.asList') {
      const values = named(arg.childForFieldName('arguments')).map((x) => this.listItem(this.eval(x), { t: 'list', v: [], elem: set.elem }, x, 'the set'));
      set.kt ??= values[0]?.t as Prim;
      set.elem ??= values[0]?.t as Prim;
      (set.v as MapData).cap = tableSizeFor(Math.max(Math.floor(values.length / 0.75) + 1, 16));
      for (const x of values) if (!(set.v as MapData).entries.has(keyId(x))) this.mapPut(set, x, x);
      return set;
    }
    const from = this.eval(arg);
    if (from.t === 'int') {
      (set.v as MapData).cap = tableSizeFor(from.v as number);
      return set;
    }
    if (from.t !== 'list' && from.t !== 'set') throw unsupported(n, 'this kind of new set');
    if (from.v === null) throw new JavaException('NullPointerException', 'Cannot copy a null collection');
    set.kt ??= from.elem;
    set.elem ??= from.elem;
    const items = from.t === 'set' ? mapOrder(from, compareKeys).map(([k]) => k) : (from.v as JVal[]);
    // Java's HashSet(collection) starts with room for the items (at least 16).
    (set.v as MapData).cap = tableSizeFor(Math.max(Math.floor(items.length / 0.75) + 1, 16));
    for (const x of items) this.mapPut(set, x, x);
    return set;
  }

  private setMethod(n: Node, set: JVal, name: string, argNodes: Node[], a: JVal[]): JVal {
    const data = set.v as MapData;
    const setName = n.childForFieldName('object')!.text;
    const item = (i = 0) => this.listItem(a[i], { t: 'list', v: [], elem: set.elem }, argNodes[i], setName);
    const itemsOf = (v: JVal) => (v.t === 'set' ? mapOrder(v, compareKeys).map(([k]) => k) : v.t === 'list' ? (v.v as JVal[]) : null);
    const changed = () => (set.mod = (set.mod ?? 0) + 1);
    switch (name) {
      case 'stream':
        if (a.length) break;
        return this.stream(mapOrder(set, compareKeys).map(([k]) => k));
      case 'add': {
        const x = item();
        if (data.entries.has(keyId(x))) return bool(false);
        this.mapPut(set, x, x);
        return bool(true);
      }
      case 'remove': {
        const removed = data.entries.delete(keyId(item()));
        if (removed) changed();
        return bool(removed);
      }
      case 'contains':
        return bool(data.entries.has(keyId(item())));
      case 'size':
        return int(data.entries.size);
      case 'isEmpty':
        return bool(data.entries.size === 0);
      case 'clear':
        data.entries.clear();
        changed();
        return VOID;
      case 'addAll':
      case 'removeAll':
      case 'retainAll':
      case 'containsAll': {
        const other = itemsOf(a[0]);
        if (!other) throw unsupported(n, `${setName}.${name} with this value`);
        const ids = new Set(other.map(keyId));
        if (name === 'containsAll') return bool(other.every((x) => data.entries.has(keyId(x))));
        const before = data.entries.size;
        if (name === 'addAll') for (const x of other) if (!data.entries.has(keyId(x))) this.mapPut(set, box(x), box(x));
        if (name === 'removeAll') for (const id of ids) data.entries.delete(id);
        if (name === 'retainAll') for (const id of [...data.entries.keys()]) if (!ids.has(id)) data.entries.delete(id);
        if (data.entries.size !== before) changed();
        return bool(data.entries.size !== before);
      }
      case 'first':
      case 'last': {
        if (set.kind !== 'tree') throw new CompileError(lineOf(n), `${name} is a TreeSet method.`);
        const keys = mapOrder(set, compareKeys);
        if (!keys.length) throw new JavaException('NoSuchElementException', '');
        return keys[name === 'first' ? 0 : keys.length - 1][0];
      }
      case 'toString':
        return str(javaString(set));
      case 'equals': {
        const other = a[0];
        if (other.t !== 'set' || other.v === null) return bool(false);
        const o = (other.v as MapData).entries;
        return bool(o.size === data.entries.size && [...data.entries.keys()].every((k) => o.has(k)));
      }
    }
    throw unsupported(n, `the method ${name} on a set`);
  }

  /** put: a new key goes in (the table doubles when it is 3/4 full, like Java); an old key keeps its place. */
  private mapPut(m: JVal, key: JVal, value: JVal): JVal {
    const data = m.v as MapData;
    const id = keyId(key);
    const old = data.entries.get(id);
    if (old) {
      const before = old[1];
      old[1] = value;
      return before;
    }
    if (m.kind === 'tree' && key.v === null) throw new JavaException('NullPointerException', 'A TreeMap key cannot be null');
    data.entries.set(id, [key, value]);
    while (data.entries.size > data.cap * 0.75) data.cap *= 2;
    m.mod = (m.mod ?? 0) + 1;
    return this.missing(m);
  }

  /** The null a map gives back for a key it does not have (an Integer null, a String null...). */
  private missing(m: JVal): JVal {
    return isClassItem(m.elem) ? { t: 'object', cls: m.elem, v: null } : m.elem === 'String' ? { t: 'String', v: null } : { t: m.elem ?? 'int', v: null, boxed: true };
  }

  private mapMethod(n: Node, m: JVal, name: string, argNodes: Node[], a: JVal[]): JVal {
    const data = m.v as MapData;
    const mapName = n.childForFieldName('object')!.text;
    const count = (k: number) => {
      if (a.length !== k) throw new CompileError(lineOf(n), `${mapName}.${name} can't be used with ${a.length} value${a.length === 1 ? '' : 's'}.`);
    };
    const key = (i = 0) => this.listItem(a[i], { t: 'list', v: [], elem: m.kt }, argNodes[i], `${mapName}'s keys`);
    const value = (i: number) => this.listItem(a[i], { t: 'list', v: [], elem: m.elem }, argNodes[i], `${mapName}'s values`);
    const view = (items: JVal[], elem: Prim | undefined): JVal => ({ t: 'list', v: items, elem, id: freshId(), src: m });
    switch (name) {
      case 'put':
        count(2);
        return this.mapPut(m, key(0), value(1));
      case 'putIfAbsent': {
        count(2);
        const old = data.entries.get(keyId(key(0)));
        if (old && old[1].v !== null) return old[1];
        return this.mapPut(m, key(0), value(1));
      }
      case 'get':
        count(1);
        return data.entries.get(keyId(key()))?.[1] ?? this.missing(m);
      case 'getOrDefault':
        count(2);
        return data.entries.get(keyId(key()))?.[1] ?? value(1);
      case 'containsKey':
        count(1);
        return bool(data.entries.has(keyId(key())));
      case 'containsValue':
        count(1);
        return bool([...data.entries.values()].some(([, v]) => sameValue(v, a[0].t === 'null' ? a[0] : box(a[0]))));
      case 'remove': {
        count(1);
        const id = keyId(key());
        const old = data.entries.get(id);
        if (!old) return this.missing(m);
        data.entries.delete(id);
        m.mod = (m.mod ?? 0) + 1;
        return old[1];
      }
      case 'size':
        count(0);
        return int(data.entries.size);
      case 'isEmpty':
        count(0);
        return bool(data.entries.size === 0);
      case 'clear':
        count(0);
        data.entries.clear();
        m.mod = (m.mod ?? 0) + 1;
        return VOID;
      case 'keySet':
        count(0);
        return view(mapOrder(m, compareKeys).map(([k]) => k), m.kt);
      case 'values':
        count(0);
        return view(mapOrder(m, compareKeys).map(([, v]) => v), m.elem);
      case 'entrySet':
        count(0);
        return view(
          mapOrder(m, compareKeys).map((e) => ({ t: 'entry', v: e, kt: m.kt, elem: m.elem, id: freshId() })),
          undefined,
        );
      case 'firstKey':
      case 'lastKey': {
        if (m.kind !== 'tree') throw new CompileError(lineOf(n), `${name} is a TreeMap method.`);
        const keys = mapOrder(m, compareKeys);
        if (!keys.length) throw new JavaException('NoSuchElementException', '');
        return keys[name === 'firstKey' ? 0 : keys.length - 1][0];
      }
      case 'toString':
        count(0);
        return str(javaString(m));
      case 'equals': {
        count(1);
        const other = a[0];
        if (other.t !== 'map' || other.v === null) return bool(false);
        const o = (other.v as MapData).entries;
        return bool(o.size === data.entries.size && [...data.entries].every(([id, [, v]]) => o.has(id) && sameValue(o.get(id)![1], v)));
      }
    }
    throw unsupported(n, `the method ${name} on a map`);
  }

  private collections(n: Node, name: string, a: JVal[]): JVal {
    const list = a[0];
    if (list?.t !== 'list') throw new CompileError(lineOf(n), `Collections.${name} needs a list.`);
    if (list.v === null) throw new JavaException('NullPointerException', `Cannot use Collections.${name} on a null list`);
    const items = list.v as JVal[];
    switch (name) {
      case 'sort':
        if (a.length !== 1 && a.length !== 2) break;
        this.sortItems(items, n, a[1] ? this.funcArg(a[1], n) : undefined);
        list.mod = (list.mod ?? 0) + 1;
        return VOID;
      case 'reverse':
        if (a.length !== 1) break;
        items.reverse();
        return VOID;
      case 'swap': {
        if (a.length !== 3) break;
        const i = this.num(a[1]);
        const j = this.num(a[2]);
        if (i < 0 || i >= items.length || j < 0 || j >= items.length) {
          throw new JavaException('IndexOutOfBoundsException', `Index ${i < 0 || i >= items.length ? i : j} out of bounds for length ${items.length}`);
        }
        [items[i], items[j]] = [items[j], items[i]];
        return VOID;
      }
      case 'max':
      case 'min': {
        if (a.length !== 1 && a.length !== 2) break;
        if (!items.length) throw new JavaException('NoSuchElementException', '');
        const rule = a[1] ? this.funcArg(a[1], n) : undefined;
        return items.reduce((best, x) => {
          const c = rule ? this.compareWith(rule, x, best, n) : x.t === 'object' ? this.compareObjects(x, best, n) : this.compare(x, best);
          return (name === 'max' ? c > 0 : c < 0) ? x : best;
        });
      }
    }
    throw unsupported(n, `Collections.${name}`);
  }

  private character(n: Node, name: string, a: JVal[]): JVal {
    if (a.length !== 1 || (a[0].t !== 'char' && a[0].t !== 'int')) throw new CompileError(lineOf(n), `Character.${name} needs a char.`);
    const code = this.num(a[0]);
    const c = String.fromCharCode(code);
    const same = (x: string): JVal => (a[0].t === 'char' ? { t: 'char', v: x } : int(x.charCodeAt(0)));
    switch (name) {
      case 'isDigit':
        return bool(/\p{Nd}/u.test(c));
      case 'isLetter':
        return bool(/\p{L}/u.test(c));
      case 'isLetterOrDigit':
        return bool(/[\p{L}\p{Nd}]/u.test(c));
      case 'isUpperCase':
        return bool(/\p{Lu}/u.test(c));
      case 'isLowerCase':
        return bool(/\p{Ll}/u.test(c));
      case 'isWhitespace':
        return bool(/[\t\n\u000b\f\r\u001c-\u001f ]/.test(c) || (/\s/.test(c) && !/[\u00a0\u2007\u202f]/.test(c)));
      case 'toUpperCase':
        return same(c.toUpperCase().length === 1 ? c.toUpperCase() : c);
      case 'toLowerCase':
        return same(c.toLowerCase().length === 1 ? c.toLowerCase() : c);
      case 'getNumericValue':
        return int(/[0-9]/.test(c) ? code - 48 : /[a-z]/i.test(c) ? c.toLowerCase().charCodeAt(0) - 87 : -1);
      case 'toString':
        return str(c);
    }
    throw unsupported(n, `Character.${name}`);
  }

  private scan(n: Node, name: string, argCount: number): JVal {
    if (argCount) throw unsupported(n, `Scanner.${name} with values`);
    switch (name) {
      case 'nextInt':
      case 'nextLong': {
        const w = this.input.peekWord();
        if (w === null) throw new JavaException('NoSuchElementException', 'No more input');
        if (!/^[+-]?\d+$/.test(w)) throw new JavaException('InputMismatchException', `For input string: "${w}"`);
        // A number too big for the box is not "an int" / "a long" to Scanner either.
        const value = BigInt(w);
        const limit = name === 'nextLong' ? 63n : 31n;
        if (value >= 1n << limit || value < -(1n << limit)) throw new JavaException('InputMismatchException', `For input string: "${w}"`);
        this.input.word();
        return name === 'nextLong' ? lng(value) : int(Number(w));
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
    const same = (x: number): JVal => (anyDouble ? dbl(x) : anyLong ? lng(BigInt(Math.trunc(x))) : int(x));
    if (anyLong && !anyDouble) {
      // Exact for big longs (Math.abs(Long.MIN_VALUE) stays negative, like Java).
      const [p, q] = a.map((v) => bigOf(unbox(v)));
      if ((name === 'max' || name === 'min') && a.length === 2) return lng(name === 'max' ? (p >= q ? p : q) : p <= q ? p : q);
      if (name === 'abs' && a.length === 1) return lng(p < 0n ? -p : p);
    }
    if ((name === 'max' || name === 'min') && nums.length === 2) return same(name === 'max' ? Math.max(nums[0], nums[1]) : Math.min(nums[0], nums[1]));
    if (name === 'abs' && nums.length === 1) return same(Math.abs(nums[0]));
    if (name === 'sqrt' && nums.length === 1) return dbl(Math.sqrt(nums[0]));
    if (name === 'pow' && nums.length === 2) return dbl(Math.pow(nums[0], nums[1]));
    if (name === 'floor' && nums.length === 1) return dbl(Math.floor(nums[0]));
    if (name === 'ceil' && nums.length === 1) return dbl(Math.ceil(nums[0]));
    if (name === 'round' && nums.length === 1) return anyDouble ? this.castTo('long', dbl(Math.floor(nums[0] + 0.5)), n) : a[0].t === 'long' ? unbox(a[0]) : int(nums[0]);
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
  const { main, classes } = checkSubset(tree);
  // Lists changed inside loops, in every method and constructor of every class.
  const bodies = new Map<string, Node>();
  for (const c of classes.values()) {
    for (const [k, m] of c.methods) bodies.set(`${c.name}.${k}`, m);
    c.constructors.forEach((m, i) => bodies.set(`${c.name}.<new>${i}`, m));
  }
  const plan = planLists(bodies);
  nextId = 1;
  const interp = new Interp(classes, plan, opts);
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
      error = recordCrash(rt, e.javaType, e.message, e.value ? { errorType: e.javaType, ...(e.message ? { errorMessage: e.message } : {}) } : undefined);
    } else throw e;
  }
  return finishRun(rt, plan, status, error);
}

