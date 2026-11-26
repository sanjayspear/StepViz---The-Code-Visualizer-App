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
// C4: structs and classes (C++) and structs (C): members (public/private), member
// values written in the struct, constructors (with : member lists), methods
// (inside the class or as int Dog::getAge() { }), const methods, this->x,
// {1, 2} / {.x = 1} / Dog d("Rex", 3) / Dog("Rex", 3), typedef struct (C).
// Structs are values: copied when assigned or passed by value; references share.
// Vectors and arrays of structs; for (auto& p : pts) works on the items themselves.
// Not yet: destructors with code, templates, several bases.
// P1: pointers (C and C++): int* p = &x, *p, p->x, nullptr/NULL, pointers as
// parameters, ==; frames show "points to x" ("in main()" from another frame,
// "(gone)" once x's block or function ended: using it then is a Dangling crash,
// nullptr a NullPointer crash). std::map (sorted by key): m[k] (adds a missing key,
// like C++), count, contains, erase, at, size, empty, clear, find(k) != end(),
// for (auto& [k, v] : m) and kv.first / kv.second. Not yet: pointer arithmetic,
// pointers to pointers, char* text, general iterators.
//
// StepViz is stricter than a real compiler where real C++ would quietly give
// garbage: an index outside a list, a variable used before it has a value and
// whole-number division by zero all stop the program with a plain-words crash.
import { cFixed, cExp, cGeneral } from '../numfmt';
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

type Prim = 'int' | 'long' | 'double' | 'float' | 'bool' | 'char' | 'string';
type CType = Prim | 'vector' | 'array' | 'void' | 'auto' | 'exception' | 'struct' | 'pointer' | 'map' | 'iter' | 'set' | 'stream' | 'func';
/** stack, queue and priority_queue are kept as lists (a vector) with their own methods; pqmin: greater<T> */
type Coll = 'stack' | 'queue' | 'pq' | 'pqmin';
/** A lambda: its code and the variables around it (t = 'func'). */
interface CFunc {
  node: Node;
  scope: unknown;
}

/** A map's entries by key ("s:Sam", "n:3"): [key, value]. Shown and walked in key order, like std::map. */
type MapEntries = Map<string, [CVal, CVal]>;
const keyOf = (k: CVal): string =>
  k.t === 'string' ? `s:${k.v}` : k.t === 'char' ? `n:${(k.v as string).charCodeAt(0)}` : k.t === 'bool' ? `n:${k.v ? 1 : 0}` : `n:${typeof k.v === 'bigint' ? k.v : Number(k.v)}`;

// --------------------------------------------------------------------------
// unordered_map / unordered_set: libstdc++'s hash table, step for step, so the order the
// items are shown and walked in is g++'s (it depends on the hash, the number of buckets and
// the order the keys were put in).

const M64 = (1n << 64n) - 1n;
const MURMUR = (0xc6a4a793n << 32n) + 0x5bd1e995n;
const shiftMix = (v: bigint) => v ^ (v >> 47n);
/** std::_Hash_bytes (MurmurHash for a 64-bit size_t) with std::hash's seed 0xc70f6907. */
function hashBytes(bytes: Uint8Array, seed = 0xc70f6907n): bigint {
  const len = bytes.length;
  const aligned = len & ~7;
  let hash = (seed ^ ((BigInt(len) * MURMUR) & M64)) & M64;
  for (let p = 0; p < aligned; p += 8) {
    let data = 0n;
    for (let i = 7; i >= 0; i--) data = (data << 8n) | BigInt(bytes[p + i]);
    data = (shiftMix((data * MURMUR) & M64) * MURMUR) & M64;
    hash ^= data;
    hash = (hash * MURMUR) & M64;
  }
  if (len & 7) {
    let data = 0n;
    for (let i = (len & 7) - 1; i >= 0; i--) data = (data << 8n) | BigInt(bytes[aligned + i]);
    hash ^= data;
    hash = (hash * MURMUR) & M64;
  }
  hash = (shiftMix(hash) * MURMUR) & M64;
  return shiftMix(hash);
}
/** std::hash of a key: whole numbers are their own hash; text and doubles go through _Hash_bytes. */
function stdHash(k: CVal): bigint {
  if (k.t === 'string') return hashBytes(new TextEncoder().encode(k.v as string));
  if (k.t === 'double') {
    const x = k.v as number;
    if (x === 0) return 0n;
    const bytes = new Uint8Array(8);
    new DataView(bytes.buffer).setFloat64(0, x, true);
    return hashBytes(bytes);
  }
  const n = k.t === 'char' ? BigInt((k.v as string).charCodeAt(0)) : k.t === 'bool' ? BigInt(k.v ? 1 : 0) : typeof k.v === 'bigint' ? k.v : BigInt(k.v as number);
  return BigInt.asUintN(64, n);
}
/** _Prime_rehash_policy::_M_next_bkt (max_load_factor 1): [bucket count, size that triggers the next rehash]. */
const FAST_BKT = [2, 2, 2, 3, 5, 5, 7, 7, 11, 11, 11, 11, 13, 13];
const PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 103, 109, 113, 127, 137, 139, 149, 157, 167, 179, 193,
  199, 211, 227, 241, 257, 277, 293, 313, 337, 359, 383, 409, 439, 467, 503, 541, 577, 619, 661, 709, 761, 823, 887, 953, 1031, 1109, 1193, 1289, 1381,
  1493, 1613, 1741, 1879, 2029, 2179, 2357,
];
function nextBkt(n: number): [number, number] {
  if (n < FAST_BKT.length) return n === 0 ? [1, -1] : [FAST_BKT[n], FAST_BKT[n]];
  const p = PRIMES.slice(6).find((x) => x >= n);
  if (p === undefined) throw new CppCrash('TooBig', 'this unordered container grew larger than StepViz follows');
  return [p, p];
}
/** The entries of an unordered_map / unordered_set, kept in libstdc++'s node order. */
class HashEntries extends Map<string, [CVal, CVal]> {
  buckets = 1;
  nextResize = 0;
  /** libstdc++'s singly linked list of nodes: the order of iteration */
  order: string[] = [];
  private bucketOfId = new Map<string, number>();
  private hashOfId = new Map<string, bigint>();

  override set(id: string, entry: [CVal, CVal]): this {
    if (!super.has(id)) this.insertNode(id, entry[0]);
    return super.set(id, entry);
  }
  override delete(id: string): boolean {
    const i = this.order.indexOf(id);
    if (i >= 0) this.order.splice(i, 1);
    this.bucketOfId.delete(id);
    this.hashOfId.delete(id);
    return super.delete(id);
  }
  override clear() {
    // The buckets stay: clear() keeps bucket_count().
    this.order = [];
    this.bucketOfId.clear();
    this.hashOfId.clear();
    super.clear();
  }
  /** The range / initializer_list constructor sizes the table for n items first. */
  sizeFor(n: number) {
    if (n === 0) return;
    const [b, next] = nextBkt(n);
    this.nextResize = next;
    if (b > this.buckets) this.buckets = b;
  }
  ordered(): [CVal, CVal][] {
    return this.order.map((id) => super.get(id)!);
  }
  clone(copyValue: (v: CVal) => CVal): HashEntries {
    const c = new HashEntries();
    c.buckets = this.buckets;
    c.nextResize = this.nextResize;
    c.order = [...this.order];
    c.bucketOfId = new Map(this.bucketOfId);
    c.hashOfId = new Map(this.hashOfId);
    for (const id of this.order) {
      const [k, v] = super.get(id)!;
      Map.prototype.set.call(c, id, [k, copyValue(v)]);
    }
    return c;
  }
  /** _M_insert_unique_node: rehash if needed, then put the node first in its bucket (or first of all). */
  private insertNode(id: string, key: CVal) {
    const count = this.order.length;
    if (count + 1 > this.nextResize) {
      const minBkts = Math.max(count + 1, this.nextResize ? 0 : 11);
      if (minBkts >= this.buckets) {
        const [b, next] = nextBkt(Math.max(minBkts + 1, this.buckets * 2));
        this.nextResize = next;
        this.rehash(b);
      } else this.nextResize = this.buckets;
    }
    const hash = stdHash(key);
    this.hashOfId.set(id, hash);
    this.place(id, Number(hash % BigInt(this.buckets)), this.order);
  }
  private place(id: string, bucket: number, order: string[]) {
    this.bucketOfId.set(id, bucket);
    const first = order.findIndex((x) => x !== id && this.bucketOfId.get(x) === bucket);
    order.splice(first >= 0 ? first : 0, 0, id);
  }
  /** _M_rehash_aux: walk the old list; each node goes first in its new bucket, or first of all. */
  private rehash(n: number) {
    const old = this.order;
    const order: string[] = [];
    const placed = new Map<string, number>();
    for (const id of old) {
      const b = Number(this.hashOfId.get(id)! % BigInt(n));
      const first = order.findIndex((x) => placed.get(x) === b);
      order.splice(first >= 0 ? first : 0, 0, id);
      placed.set(id, b);
    }
    this.order = order;
    this.bucketOfId = placed;
    this.buckets = n;
  }
}

function sortedEntries(m: MapEntries): [CVal, CVal][] {
  if (m instanceof HashEntries) return m.ordered();
  return [...m.values()].sort(([a], [b]) => {
    if (a.t === 'string') return (a.v as string) < (b.v as string) ? -1 : (a.v as string) > (b.v as string) ? 1 : 0;
    const x = a.t === 'char' ? (a.v as string).charCodeAt(0) : Number(a.v);
    const y = b.t === 'char' ? (b.v as string).charCodeAt(0) : Number(b.v);
    return x - y;
  });
}
/** kv in for (auto& kv : m): first and second; with &, changing second changes the map. */
class PairFields extends Map<string, CVal> {
  constructor(private entry: [CVal, CVal] | null, first: CVal, second: CVal) {
    super([
      ['first', first],
      ['second', second],
    ]);
  }
  override set(k: string, v: CVal) {
    if (k === 'second' && this.entry) this.entry[1] = v;
    return super.set(k, v);
  }
}

/** What a pointer points to: a variable's box (or a list item or struct member), its name, and the frame it lives in. */
interface PtrTarget {
  cell: { v: unknown };
  name: string;
  frame: string;
  /** the variable whose box holds it (dead once its block or function has ended, or deleted) */
  owner: { dead?: boolean } | null;
  /** a pointer into a list: the items, the position (may be one past the end), the list's name */
  arr?: CVal[];
  index?: number;
  base?: string;
  /** a box made with new: deleted already? an array (new int[3])? */
  heap?: { dead?: boolean; deleted?: boolean; isArray: boolean };
}
/** A pointer to position i of a list (p + 1, &a[2], a used as a pointer). */
function itemPointer(items: CVal[], index: number, base: string, frame: string, owner: { dead?: boolean } | null, heap?: PtrTarget['heap']): PtrTarget {
  return {
    cell: {
      get v() {
        return items[index];
      },
      set v(x: unknown) {
        items[index] = x as CVal;
      },
    },
    name: heap ? `item ${index} of ${base}` : `${base}[${index}]`,
    frame,
    owner,
    arr: items,
    index,
    base,
    heap,
  };
}
let nextAddress = 1;

/** A C++ value. char values hold the character; lists hold their items; an exception holds its what() text. */
export interface CVal {
  t: CType;
  v: number | bigint | boolean | string | CVal[] | null | Map<string, CVal> | PtrTarget | MapEntries | CFunc;
  elem?: Prim;
  /** stack / queue / priority_queue: a vector with that container's own methods */
  coll?: Coll;
  /** unordered_map / unordered_set (v is a HashEntries) */
  hashed?: boolean;
  /** string::npos (an unsigned size_t): -1 here, printed as 18446744073709551615 like C++ */
  npos?: boolean;
  /** exception: its class (runtime_error, out_of_range...); struct: its struct or class name */
  cls?: string;
  /** pointer: the type it points to (v is a PtrTarget, or null for nullptr) */
  pt?: DeclType;
  /** map: the key type (elem is the value type) */
  kt?: Prim;
}

/** A struct or class of the program: its fields (in order), constructors and methods. */
interface CStruct {
  name: string;
  isClass: boolean;
  fields: { name: string; type: DeclType; size: Node | null | undefined; def: Node | null; isPrivate: boolean; isProtected?: boolean }[];
  ctors: Node[];
  methods: Map<string, Node>;
  privateMethods: Set<string>;
  /** class Dog : public Animal: "Animal" */
  parent?: string | null;
  protectedMethods?: Set<string>;
  /** methods marked virtual (or override) here; pure virtual ones (= 0) have no body */
  virtuals?: Set<string>;
  pure?: Set<string>;
  /** static int count; (one box for the whole class, shown as Dog::count in the Global frame) */
  statics?: Map<string, StaticInfo>;
  /** static int nextId() { ... }: methods that run without an object */
  staticMethods?: Set<string>;
}
interface StaticInfo {
  isPrivate: boolean;
  isProtected: boolean;
  isConst: boolean;
  line: number;
  /** a line gives it its box: inline / const with a value in the class, or int Dog::count = 0; outside */
  defined: boolean;
}
/** The static member called name of cls or a class it is built on, with the class it belongs to. */
function findStatic(cls: string, name: string): { owner: CStruct; info: StaticInfo } | null {
  for (let c = structs.get(cls); c; c = c.parent ? structs.get(c.parent) : undefined) {
    const info = c.statics?.get(name);
    if (info) return { owner: c, info };
  }
  return null;
}
/** The class a member declaration is written in. */
function ownerOf(n: Node): string {
  let p: Node | null = n.parent;
  while (p && p.type !== 'class_specifier' && p.type !== 'struct_specifier') p = p.parent;
  return p?.childForFieldName('name')?.text ?? '';
}
/** In-class statics with a value (static const int MAX = 3;): set up with the global variables. */
let inClassStatics: Node[] = [];
/** Is a Dog an Animal (the same struct, or one built on it)? */
function isDerived(cls: string, base: string): boolean {
  for (let c: string | null | undefined = cls; c; c = structs.get(c)?.parent) if (structs.get(c)?.name === structs.get(base)?.name) return true;
  return false;
}
/** The struct and the ones it is built on, the base first. */
function structChain(cls: string): CStruct[] {
  const out: CStruct[] = [];
  for (let c = structs.get(cls); c; c = c.parent ? structs.get(c.parent) : undefined) out.unshift(c);
  return out;
}
/** Members of a struct and its bases, the base's first (the order C++ builds them). */
const allMembers = (cls: string) => structChain(cls).flatMap((c) => c.fields.map((f) => ({ ...f, owner: c.name })));
/** A method by name, in the struct or the ones it is built on. */
function findStructMethod(cls: string, name: string): { owner: CStruct; m: Node } | null {
  for (let c = structs.get(cls); c; c = c.parent ? structs.get(c.parent) : undefined) {
    const m = c.methods.get(name);
    if (m) return { owner: c, m };
  }
  return null;
}
/** Is the method virtual here or in a base (then a pointer or reference uses the object's own version)? */
const isVirtualIn = (cls: string, name: string) => structChain(cls).some((c) => c.virtuals?.has(name));
/** A pure virtual method (= 0) that the struct does not give a body: it can't be made on its own. */
function missingPure(cls: string): string | null {
  for (const c of structChain(cls)) {
    for (const p of c.pure ?? []) if (!findStructMethod(cls, p)) return p;
  }
  return null;
}
/** The program's structs and classes (set by checkSubset, like dialect). */
let structs = new Map<string, CStruct>();
/** struct Point / Point / typedef name -> the struct's name, or null. */
function structName(typeNode: Node | null): string | null {
  if (!typeNode) return null;
  if (typeNode.type === 'struct_specifier' || typeNode.type === 'class_specifier') {
    const n = typeNode.childForFieldName('name')?.text;
    return n && structs.has(n) ? n : null;
  }
  const text = typeNode.text.replace(/^const\s+/, '').replace(/^struct\s+/, '');
  return structs.has(text) ? text : null;
}
/** Vectors and arrays of structs keep the struct name as their item type. */
const isStructItem = (elem: Prim | undefined) => !!elem && structs.has(elem);
/** pair<int,string> as an item type (vector<pair<int, string>>): 'pair<int,string>'. */
const isPairItem = (elem: Prim | undefined) => !!elem && elem.startsWith('pair<');
const pairParts = (elem: string): [Prim, Prim] => elem.slice(5, -1).split(',') as [Prim, Prim];

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
const NUMERIC = new Set<CType>(['int', 'long', 'double', 'float', 'char', 'bool']);
/** A double or a float (a float is a 32-bit number: every result is rounded to it, like C). */
const isReal = (t: CType) => t === 'double' || t === 'float';

const int = (n: number): CVal => ({ t: 'int', v: n | 0 });
/**
 * long / long long: an exact 64-bit whole number that wraps like g++ does. It is kept as a plain number
 * while it fits exactly (up to 2^53) and as a bigint beyond that.
 */
const MAX_EXACT = BigInt(Number.MAX_SAFE_INTEGER);
function long64(b: bigint): number | bigint {
  const w = BigInt.asIntN(64, b);
  return w >= -MAX_EXACT && w <= MAX_EXACT ? Number(w) : w;
}
const lng = (n: number | bigint): CVal => {
  if (typeof n === 'bigint') return { t: 'long', v: long64(n) };
  const x = Math.trunc(n);
  if (Number.isSafeInteger(x)) return { t: 'long', v: x };
  // A double too big for a long: x86 gives the smallest long (g++ calls it undefined).
  return { t: 'long', v: Number.isFinite(x) && Math.abs(x) < 2 ** 63 ? long64(BigInt(x)) : long64(-(2n ** 63n)) };
};
const dbl = (n: number): CVal => ({ t: 'double', v: n });
const flt = (n: number): CVal => ({ t: 'float', v: Math.fround(n) });
/** A whole number read from input: an int when it fits, a long otherwise (the box it goes into decides the rest). */
const wholeFrom = (word: string): CVal => {
  const b = BigInt(word);
  return b >= -2147483648n && b <= 2147483647n ? int(Number(b)) : lng(b);
};
const bool = (b: boolean): CVal => ({ t: 'bool', v: b });
const chr = (c: string): CVal => ({ t: 'char', v: c });
const strv = (s: string): CVal => ({ t: 'string', v: s });
const VOID: CVal = { t: 'void', v: null };
/** string::npos: "not found" from find (size_t's largest value). */
const NPOS: CVal = { t: 'long', v: -1, npos: true };

/** cout's default way of writing a double: 6 significant digits, like %g. */
export function cppDouble(x: number, precision = 6): string {
  // %g on the exact binary value, ties to even (printf's and cout's rounding).
  return cGeneral(x, precision);
}

/** How a value shows in a frame. */
export function formatCpp(x: unknown): string | undefined {
  if (x === undefined) return 'nothing';
  if (x === UNSET_VAL) return '?';
  if (Array.isArray(x)) return `[${x.map((e) => formatCpp(e) ?? String(e)).join(', ')}]`;
  if (typeof x === 'object' && x !== null && 'seenFrom' in x) {
    const r = x as { seenFrom: string; ptr: CVal };
    return pointerText(r.ptr, r.seenFrom);
  }
  if (typeof x === 'object' && x !== null && 'refOf' in x) {
    const r = x as { refOf: string; value: unknown };
    return `${formatCpp(r.value)} (same box as ${r.refOf})`;
  }
  if (!isCVal(x)) return undefined;
  if (x.t === 'func') return 'lambda';
  switch (x.t) {
    case 'string':
      return JSON.stringify(x.v);
    case 'char':
      return `'${x.v}'`;
    case 'double':
    case 'float':
      return cppDouble(x.v as number);
    case 'bool':
      return x.v ? 'true' : 'false';
    case 'void':
      return 'nothing';
    case 'exception':
      return `${x.cls}: ${x.v}`;
    case 'struct':
      return structText(x, 0);
    case 'pointer':
      return pointerText(x, null);
    case 'stream':
      return 'cout';
    case 'map':
      return `{${sortedEntries(x.v as MapEntries).map(([k, v]) => `${formatCpp(k)}: ${formatCpp(v)}`).join(', ')}}`;
    case 'set':
      return `{${sortedEntries(x.v as MapEntries).map(([k]) => formatCpp(k)).join(', ')}}`;
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

/** Do two pointers point to the same place? */
function samePlace(a: PtrTarget | null, b: PtrTarget | null): boolean {
  if (!a || !b) return a === b;
  if (a.arr || b.arr) return a.arr === b.arr && a.index === b.index;
  return a.cell === b.cell || (a.owner !== null && a.owner === b.owner && a.name === b.name);
}
/** A made-up address for printing a pointer (real ones differ from run to run). */
const addresses = new WeakMap<object, number>();
function addressOf(t: PtrTarget): string {
  const key = (t.owner ?? t.cell) as object;
  if (!addresses.has(key)) addresses.set(key, nextAddress++);
  const index = t.index ?? 0;
  return `0x7ffc${(0x1000 + addresses.get(key)! * 0x40 + index * 4).toString(16)}`;
}

/** How a pointer shows: nullptr, points to x, points to x in main() (seen from another frame), or (gone). */
const LABEL = '\u0000label';
function pointerText(x: CVal, here: string | null): string {
  const t = x.v as PtrTarget | null;
  if (!t) return 'nullptr';
  if (here === LABEL) return t.heap ? `${t.name}` : `&${t.name}`;
  if (t.owner?.dead) return `points to ${t.name}${t.heap ? '' : here !== null && t.frame !== here && t.frame !== 'Global' ? ` in ${t.frame}` : ''} (gone)`;
  // A box made with new has no name: show what is in it.
  if (t.heap) {
    if (t.arr) return `points to ${t.name} ${formatCpp(t.arr) ?? ''}`;
    const v = t.cell.v as CVal;
    if (v === UNSET_VAL) return `points to ${t.name} (no value yet)`;
    return v.t === 'struct' ? `points to new ${formatCpp(v)}` : `points to ${t.name} (${formatCpp(v) ?? '?'})`;
  }
  const where = here !== null && t.frame !== here && t.frame !== 'Global' ? ` in ${t.frame}` : '';
  return `points to ${t.name}${where}`;
}

/** How a struct shows: Point {x: 1, y: ?} (a struct inside it, one level deep: Point {…}). */
function structText(x: CVal, depth: number): string {
  if (depth > 1) return `${x.cls} {…}`;
  const parts = [...(x.v as Map<string, CVal>)].map(([k, v]) => `${k}: ${v.t === 'struct' ? structText(v, depth + 1) : formatCpp(v) ?? '?'}`);
  return `${x.cls} {${parts.join(', ')}}`;
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

// --------------------------------------------------------------------------
// libstdc++'s own algorithms, step for step, so the comparisons (visible when the program's
// operator< or a lambda decides) come in g++'s order and equal items end up where g++ puts them.

export type Less = (a: CVal, b: CVal) => boolean;
const half = (n: number) => Math.trunc(n / 2);

/** std::sort: introsort (median-of-three quicksort, heap sort when too deep), then insertion sort. */
export function stdSort(a: CVal[], less: Less, depth = 2 * (31 - Math.clz32(a.length))) {
  if (a.length < 2) return;
  introsortLoop(a, 0, a.length, depth, less);
  finalInsertionSort(a, 0, a.length, less);
}
function introsortLoop(a: CVal[], first: number, last: number, depth: number, less: Less) {
  while (last - first > 16) {
    if (depth === 0) {
      heapSortRange(a, first, last, less);
      return;
    }
    depth--;
    const mid = first + half(last - first);
    moveMedianToFirst(a, first, first + 1, mid, last - 1, less);
    const cut = unguardedPartition(a, first + 1, last, first, less);
    introsortLoop(a, cut, last, depth, less);
    last = cut;
  }
}
function swapAt(a: CVal[], i: number, j: number) {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
}
function moveMedianToFirst(a: CVal[], result: number, x: number, y: number, z: number, less: Less) {
  if (less(a[x], a[y])) {
    if (less(a[y], a[z])) swapAt(a, result, y);
    else if (less(a[x], a[z])) swapAt(a, result, z);
    else swapAt(a, result, x);
  } else if (less(a[x], a[z])) swapAt(a, result, x);
  else if (less(a[y], a[z])) swapAt(a, result, z);
  else swapAt(a, result, y);
}
function unguardedPartition(a: CVal[], first: number, last: number, pivot: number, less: Less): number {
  for (;;) {
    while (less(a[first], a[pivot])) first++;
    last--;
    while (less(a[pivot], a[last])) last--;
    if (!(first < last)) return first;
    swapAt(a, first, last);
    first++;
  }
}
function finalInsertionSort(a: CVal[], first: number, last: number, less: Less) {
  if (last - first > 16) {
    insertionSort(a, first, first + 16, less);
    for (let i = first + 16; i < last; i++) linearInsert(a, i, less);
  } else insertionSort(a, first, last, less);
}
function insertionSort(a: CVal[], first: number, last: number, less: Less) {
  for (let i = first + 1; i < last; i++) {
    if (less(a[i], a[first])) {
      const v = a[i];
      for (let k = i; k > first; k--) a[k] = a[k - 1];
      a[first] = v;
    } else linearInsert(a, i, less);
  }
}
function linearInsert(a: CVal[], last: number, less: Less) {
  const v = a[last];
  let next = last - 1;
  while (less(v, a[next])) {
    a[last] = a[next];
    last = next;
    next--;
  }
  a[last] = v;
}
/** std::__push_heap: the value moves up from hole towards top. */
function pushHeapAt(a: CVal[], first: number, hole: number, top: number, value: CVal, less: Less) {
  let parent = half(hole - 1);
  while (hole > top && less(a[first + parent], value)) {
    a[first + hole] = a[first + parent];
    hole = parent;
    parent = half(hole - 1);
  }
  a[first + hole] = value;
}
/** std::__adjust_heap: the hole moves down to a leaf, then the value moves back up. */
function adjustHeap(a: CVal[], first: number, hole: number, len: number, value: CVal, less: Less) {
  const top = hole;
  let second = hole;
  while (second < half(len - 1)) {
    second = 2 * (second + 1);
    if (less(a[first + second], a[first + second - 1])) second--;
    a[first + hole] = a[first + second];
    hole = second;
  }
  if ((len & 1) === 0 && second === half(len - 2)) {
    second = 2 * (second + 1);
    a[first + hole] = a[first + second - 1];
    hole = second - 1;
  }
  pushHeapAt(a, first, hole, top, value, less);
}
function makeHeap(a: CVal[], first: number, last: number, less: Less) {
  const len = last - first;
  if (len < 2) return;
  for (let parent = half(len - 2); ; parent--) {
    adjustHeap(a, first, parent, len, a[first + parent], less);
    if (parent === 0) return;
  }
}
/** std::__partial_sort(first, last, last): make a heap, then take the largest off one by one. */
function heapSortRange(a: CVal[], first: number, last: number, less: Less) {
  makeHeap(a, first, last, less);
  while (last - first > 1) {
    last--;
    const v = a[last];
    a[last] = a[first];
    adjustHeap(a, first, 0, last - first, v, less);
  }
}
/** priority_queue::push / pop: push_back + push_heap, pop_heap + pop_back. */
function heapPush(a: CVal[], x: CVal, less: Less) {
  a.push(x);
  pushHeapAt(a, 0, a.length - 1, 0, x, less);
}
function heapPop(a: CVal[], less: Less) {
  if (a.length > 1) {
    const last = a.length - 1;
    const v = a[last];
    a[last] = a[0];
    adjustHeap(a, 0, 0, last, v, less);
  }
  a.pop();
}

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
  abstract_pointer_declarator: 'pointers without a name',
  union_specifier: 'unions',
  enum_specifier: 'enums',
  template_declaration: 'templates',
  lambda_expression: 'lambdas',
  namespace_definition: 'namespaces',
  goto_statement: 'goto',
  labeled_statement: 'labels',
  preproc_def: '#define',
  preproc_function_def: '#define',
  preproc_ifdef: '#ifdef',
  preproc_if: '#if',
  type_definition: 'typedef inside functions',
  alias_declaration: 'using aliases',
  sizeof_expression: 'sizeof',
  comma_expression: 'the comma operator',
};

const INCLUDES = new Set([
  '<iostream>', '<vector>', '<string>', '<cmath>', '<algorithm>', '<iomanip>', '<utility>', '<climits>', '<bits/stdc++.h>', '<stdexcept>', '<exception>', '<map>', '<set>', '<stack>', '<queue>', '<numeric>', '<functional>', '<unordered_map>', '<unordered_set>', '<cctype>',
]);
const C_INCLUDES = new Set(['<stdio.h>', '<stdlib.h>', '<math.h>', '<string.h>', '<stdbool.h>', '<limits.h>', '<ctype.h>']);

interface Program {
  main: Node;
  functions: Map<string, Node>;
  globals: Node[];
}

/** Read a struct or class body: fields (public or private), constructors, methods. */
function readStruct(spec: Node, name: string): CStruct {
  const isClass = spec.type === 'class_specifier';
  const info: CStruct = { name, isClass, fields: [], ctors: [], methods: new Map(), privateMethods: new Set(), protectedMethods: new Set(), virtuals: new Set(), pure: new Set() };
  // class Dog : public Animal
  const bases = named(spec).find((c) => c.type === 'base_class_clause');
  if (bases) {
    const parts = named(bases);
    const types = parts.filter((c) => c.type === 'type_identifier' || c.type === 'qualified_identifier');
    if (types.length !== 1) throw unsupported(bases, 'building on several classes');
    const access = parts.find((c) => c.type === 'access_specifier')?.text ?? (isClass ? 'private' : 'public');
    if (access !== 'public') throw unsupported(bases, `${access} inheritance (write public ${types[0].text})`);
    if (!structs.has(types[0].text)) throw unsupported(bases, `building on ${types[0].text}`);
    info.parent = structs.get(types[0].text)!.name;
  }
  let access = isClass ? 'private' : 'public'; // class members are private until public:, struct members public
  for (const m of named(spec.childForFieldName('body'))) {
    if (m.type === 'access_specifier') {
      access = m.text.replace(/\s|:/g, '');
      continue;
    }
    const isPrivate = access === 'private';
    const isProtected = access === 'protected';
    const isStatic = dialect === 'cpp' && named(m).some((c) => c.type === 'storage_class_specifier' && c.text === 'static');
    if (isStatic && /\bvirtual\b/.test(m.text)) throw new CompileError(lineOf(m), 'A static method can\'t be virtual: it runs without an object.');
    if (isStatic && m.type === 'field_declaration' && m.childForFieldName('declarator')?.type !== 'function_declarator') {
      // static int count;  static const int MAX = 3;  static inline int made = 0;
      const ds = m.childrenForFieldName('declarator').filter((d): d is Node => !!d);
      if (ds.length !== 1) throw unsupported(m, 'several static members in one line');
      if (ds[0].type !== 'field_identifier') throw unsupported(ds[0], ds[0].type === 'pointer_declarator' ? 'static pointers' : 'static lists written with [ ]');
      const mName = ds[0].text;
      const isConst = named(m).some((c) => c.type === 'type_qualifier' && (c.text === 'const' || c.text === 'constexpr'));
      const isInline = /\binline\b/.test(m.text) || /\bconstexpr\b/.test(m.text);
      const value = m.childForFieldName('default_value');
      if (value && !isConst && !isInline) {
        throw new CompileError(lineOf(m), `${name}::${mName} can't get its value inside the class: write static inline int ${mName} = ...; or put a line after the class, like int ${name}::${mName} = 0;`);
      }
      if (info.statics?.has(mName) || info.fields.some((f) => f.name === mName)) throw unsupported(m, 'two members with the same name');
      (info.statics ??= new Map()).set(mName, { isPrivate, isProtected, isConst, line: lineOf(m), defined: !!value || isInline });
      if (value || isInline) inClassStatics.push(m);
      continue;
    }
    if (/^(friend|inline)\b/.test(m.text) || m.type === 'friend_declaration') {
      throw unsupported(m, /^friend/.test(m.text) || m.type === 'friend_declaration' ? 'friends' : m.text.split(/\s/)[0]);
    }
    if (/^static\b/.test(m.text) && !isStatic) throw unsupported(m, 'static members');
    const isVirtual = /^virtual\b/.test(m.text) || /\boverride\b/.test(m.childForFieldName('declarator')?.text ?? '');
    if (m.type === 'field_declaration') {
      const d = m.childForFieldName('declarator');
      if (d?.type === 'function_declarator') {
        // int getAge();  defined later as int Dog::getAge() { ... }  /  virtual string speak() = 0;
        const mName = d.childForFieldName('declarator')!.text;
        if (isStatic) (info.staticMethods ??= new Set()).add(mName);
        if (isPrivate) info.privateMethods.add(mName);
        if (isProtected) info.protectedMethods!.add(mName);
        if (isVirtual) info.virtuals!.add(mName);
        if (m.childForFieldName('default_value')?.text === '0') {
          if (!isVirtual) throw new CompileError(lineOf(m), `Only a virtual method can be = 0: write virtual before it.`);
          info.pure!.add(mName);
        }
        continue;
      }
      const typeNode = m.childForFieldName('type');
      if (typeNode && (typeNode.type === 'struct_specifier' || typeNode.type === 'class_specifier') && typeNode.childForFieldName('body')) throw unsupported(m, 'structs inside structs');
      for (const fd of m.childrenForFieldName('declarator')) {
        if (!fd) continue;
        let node = fd;
        let size: Node | null | undefined;
        if (node.type === 'array_declarator') {
          size = node.childForFieldName('size') ?? null;
          node = node.childForFieldName('declarator')!;
        }
        if (node.type !== 'field_identifier') throw unsupported(fd, node.type === 'pointer_declarator' ? 'pointers' : 'this kind of member');
        if (info.parent && allMembers(info.parent).some((f) => f.name === node.text)) throw unsupported(fd, `a member with the same name as one in ${info.parent}`);
        info.fields.push({ name: node.text, type: typeOf(typeNode), size, def: m.childForFieldName('default_value'), isPrivate, isProtected });
      }
      continue;
    }
    if (m.type === 'function_definition' || m.type === 'declaration') {
      const decl = m.childForFieldName('declarator');
      const inner = decl?.type === 'function_declarator' ? decl.childForFieldName('declarator') : null;
      if (!inner) throw unsupported(m, 'this kind of member');
      if (inner.type === 'destructor_name') {
        // virtual ~Animal() {}: an empty destructor changes nothing on screen.
        if (m.type === 'function_definition' && named(m.childForFieldName('body')).length) throw unsupported(m, 'destructors with code in them');
        continue;
      }
      if (inner.type === 'operator_name' && !OPERATOR_OK.test(inner.text.replace(/\s+/g, ''))) throw unsupported(m, `the operator ${inner.text}`);
      if (m.type === 'declaration') {
        // Dog(string n, int a);  defined later as Dog::Dog(...)
        continue;
      }
      if (inner.text === name) info.ctors.push(m);
      else {
        const key = inner.text.replace(/\s+/g, '');
        if (info.methods.has(key)) throw unsupported(m, 'two methods with the same name');
        info.methods.set(key, m);
        if (isStatic) {
          (info.staticMethods ??= new Set()).add(inner.text);
          const self = m.descendantsOfType('this')[0];
          if (self) throw new CompileError(lineOf(self), "this can't be used in a static method: it runs without an object.");
        }
        if (isPrivate) info.privateMethods.add(inner.text);
        if (isProtected) info.protectedMethods!.add(inner.text);
        if (isVirtual) info.virtuals!.add(inner.text);
      }
      continue;
    }
    throw unsupported(m, FEATURES[m.type] ?? m.type.replace(/_/g, ' '));
  }
  return info;
}

/** The function_declarator of a definition, also inside ostream& operator<<(...) (a reference_declarator). */
function fnDeclarator(def: Node): Node {
  let d = def.childForFieldName('declarator')!;
  while (d.type === 'reference_declarator') d = named(d)[0];
  return d;
}
function functionName(def: Node): string {
  return fnDeclarator(def).childForFieldName('declarator')!.text;
}

/** The program's own operators written outside a struct (operator<<, operator<...), by name. */
let operators = new Map<string, Node[]>();
const OPERATOR_OK = /^operator(==|!=|<|>|<=|>=|\+|-|\*|\/|\+=|-=|<<)$/;

function checkSubset(tree: Tree): Program {
  const functions = new Map<string, Node>();
  operators = new Map();
  const globals: Node[] = [];
  structs = new Map();
  inClassStatics = [];
  const outOfClass: Node[] = [];
  const addStruct = (spec: Node, name: string) => {
    if (structs.has(name)) throw unsupported(spec, 'two structs with the same name');
    structs.set(name, readStruct(spec, name));
  };
  for (const n of named(tree.rootNode)) {
    switch (n.type) {
      case 'struct_specifier':
      case 'class_specifier': {
        const name = n.childForFieldName('name')?.text;
        if (!name || !n.childForFieldName('body')) throw unsupported(n, 'this kind of struct');
        if (dialect === 'c' && n.type === 'class_specifier') throw unsupported(n, 'classes');
        addStruct(n, name);
        continue;
      }
      case 'type_definition': {
        // typedef struct { ... } Point;  /  typedef struct Point Point;
        const t = n.childForFieldName('type');
        const alias = n.childForFieldName('declarator');
        if (t?.type !== 'struct_specifier' || alias?.type !== 'type_identifier') throw unsupported(n, 'typedef');
        if (t.childForFieldName('body')) {
          addStruct(t, alias.text);
          const tag = t.childForFieldName('name')?.text;
          if (tag && tag !== alias.text) structs.set(tag, structs.get(alias.text)!);
        } else {
          const tag = t.childForFieldName('name')?.text ?? '';
          if (!structs.has(tag)) throw unsupported(n, 'typedef');
          structs.set(alias.text, structs.get(tag)!);
        }
        continue;
      }
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
        if (fnDeclarator(n).childForFieldName('declarator')?.type === 'operator_name') {
          // bool operator<(const Point& a, const Point& b) / ostream& operator<<(ostream& os, const Point& p)
          const key = name.replace(/\s+/g, '');
          operators.set(key, [...(operators.get(key) ?? []), n]);
          continue;
        }
        if (n.childForFieldName('declarator')?.type === 'reference_declarator') throw unsupported(n, 'functions that give back references');
        if (/::/.test(name)) {
          outOfClass.push(n); // int Dog::getAge() { ... }
          continue;
        }
        if (functions.has(name)) throw unsupported(n, 'two functions with the same name');
        functions.set(name, n);
        continue;
      }
      case 'declaration':
        if (n.childForFieldName('declarator')?.type === 'function_declarator') throw unsupported(n, 'function declarations without a body');
        if (n.childForFieldName('type')?.childForFieldName('body')) throw unsupported(n, 'a struct and a variable in one line');
        for (const d of declarators(n)) {
          const q = d.type === 'init_declarator' ? d.childForFieldName('declarator') : d;
          if (q?.type !== 'qualified_identifier') continue;
          // int Dog::count = 0;  the box for a static member.
          const owner = structs.get(q.childForFieldName('scope')?.text ?? '');
          const member = q.childForFieldName('name')?.text ?? '';
          const info = owner?.statics?.get(member);
          if (!owner) throw unsupported(q, q.text);
          if (!info) throw new CompileError(lineOf(n), `${owner.name} has no static member called ${member}.`);
          if (info.defined) throw new CompileError(lineOf(n), `${owner.name}::${member} already has its box: give it a value in one place only.`);
          if (info.isConst && d.type !== 'init_declarator') throw new CompileError(lineOf(n), `${owner.name}::${member} is const, so it needs a value here.`);
          info.defined = true;
        }
        globals.push(n);
        continue;
      default:
        throw unsupported(n, FEATURES[n.type] ?? n.type.replace(/_/g, ' '));
    }
  }
  for (const def of outOfClass) {
    const q = def.childForFieldName('declarator')!.childForFieldName('declarator')!;
    const owner = structs.get(q.childForFieldName('scope')?.text ?? '');
    const member = q.childForFieldName('name')?.text ?? '';
    if (!owner) throw unsupported(def, `the function ${q.text}`);
    if (member === owner.name) owner.ctors.push(def);
    else if (q.childForFieldName('name')?.type === 'destructor_name') {
      if (named(def.childForFieldName('body')).length) throw unsupported(def, 'destructors with code in them');
    }
    else {
      if (owner.methods.has(member)) throw unsupported(def, 'two methods with the same name');
      owner.methods.set(member, def);
    }
  }
  for (const st of new Set(structs.values())) {
    for (const [member, info] of st.statics ?? []) {
      if (!info.defined) {
        throw new CompileError(info.line, `${st.name}::${member} is static, so it also needs a line after the class that gives it its box, like int ${st.name}::${member} = 0;`);
      }
    }
  }
  // Static members with a value in the class are set up in program order with the global variables.
  globals.push(...inClassStatics);
  globals.sort((a, b) => a.startIndex - b.startIndex);
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
    const feature = FEATURES[n.type];
    // vector<Animal*>: a pointer type as the item type is fine.
    const itemPointer = n.type === 'abstract_pointer_declarator' && n.parent?.type === 'type_descriptor' && n.parent.parent?.type === 'template_argument_list';
    // sort(v.begin(), v.end(), [](int a, int b) { return a > b; }) / auto cmp = [](...) {...};
    const lambdaOk =
      n.type === 'lambda_expression' &&
      (n.parent?.type === 'argument_list' || (n.parent?.type === 'init_declarator' && n.parent.parent?.childForFieldName('type')?.text === 'auto'));
    if (feature && !scanfAddress && !itemPointer && !lambdaOk) throw unsupported(n, feature);
    if (n.type === 'pointer_declarator' && n.childForFieldName('declarator')?.type === 'pointer_declarator') throw unsupported(n, 'pointers to pointers');
    if (n.type === 'pointer_declarator' && n.childForFieldName('declarator')?.type === 'function_declarator') throw unsupported(n, 'functions that give back pointers');
    if (dialect === 'c' && n.type === 'reference_declarator') throw unsupported(n, 'references (&)');
    if (n.type === 'unary_expression' && n.childForFieldName('operator')?.type === '&') throw unsupported(n, 'pointers');
    // Inside functions: struct Point p (a type) is fine; a struct definition is not.
    if ((n.type === 'struct_specifier' || n.type === 'class_specifier') && n.childForFieldName('body')) throw unsupported(n, 'structs inside functions');

    if (n.type === 'template_type') {
      const name = n.childForFieldName('name')?.text;
      if (!['vector', 'map', 'set', 'unordered_map', 'unordered_set', 'stack', 'queue', 'priority_queue', 'greater', 'less', 'pair'].includes(name ?? '')) throw unsupported(n, name ?? 'templates');
      if (name === 'pair') {
        const args = named(n.childForFieldName('arguments'));
        if (args.length !== 2 || args.some((a) => /</.test(a.text))) throw unsupported(n, 'this kind of pair');
      }
      if (['stack', 'queue', 'priority_queue'].includes(name ?? '')) {
        // stack<int>, queue<string>, priority_queue<int, vector<int>, greater<int>>
        const args = named(n.childForFieldName('arguments'));
        const third = args[2]?.text.replace(/\s+/g, '');
        const ok = name === 'priority_queue' ? args.length === 1 || (args.length === 3 && /^(std::)?(greater|less)</.test(third ?? '')) : args.length === 1;
        if (!ok || /vector|map|set|</.test(args[0]?.text ?? '')) throw unsupported(n, `this kind of ${name}`);
      }
      const args = named(n.childForFieldName('arguments'));
      if ((name === 'set' || name === 'unordered_set') && args.some((a) => /vector|map|set|</.test(a.text))) throw unsupported(n, 'sets of lists');
      if ((name === 'map' || name === 'unordered_map') && args.some((a) => /vector|map|set|</.test(a.text))) throw unsupported(n, 'maps of lists');
      if ((name === 'unordered_map' || name === 'unordered_set') && args.length !== (name === 'unordered_map' ? 2 : 1)) throw unsupported(n, `this kind of ${name}`);
      // vector<vector<int>> is fine (a list of rows); vector<map<...>> and sets are not.
      if (name === 'vector' && args.some((a) => /map|set/.test(a.text))) throw unsupported(n, 'lists of maps');
    }
    if (n.type === 'sized_type_specifier' && /unsigned/.test(n.text)) throw unsupported(n, 'unsigned numbers');
    // static int calls = 0; inside a function keeps its value between calls: not traced yet.
    if (n.type === 'storage_class_specifier' && n.text === 'static' && n.parent?.type === 'declaration' && n.parent.parent?.type !== 'translation_unit') {
      throw unsupported(n.parent, 'static variables inside functions');
    }
    for (const c of named(n)) visit(c);
  };
  for (const f of functions.values()) visit(f);
  for (const list of operators.values()) {
    for (const o of list) {
      if (!OPERATOR_OK.test(functionName(o).replace(/\s+/g, ''))) throw unsupported(o, `the operator ${functionName(o).replace(/^operator/, '')}`);
      visit(o);
    }
  }
  for (const g of globals) visit(g);
  for (const st of new Set(structs.values())) {
    for (const m of [...st.ctors, ...st.methods.values()]) visit(m);
    for (const fd of st.fields) if (fd.def) visit(fd.def);
  }
  return { main, functions, globals };
}

// --------------------------------------------------------------------------
// Types and declarations

interface DeclType {
  t: CType;
  elem?: Prim;
  /** struct: its name */
  cls?: string;
  /** pointer: the type it points to */
  pt?: DeclType;
  /** map: the key type */
  kt?: Prim;
  coll?: Coll;
  hashed?: boolean;
}

function primOf(n: Node | null): Prim | 'void' | 'auto' {
  const sname = structName(n);
  if (sname) return sname as Prim; // vector<Point>: the struct name is the item type
  const text = (n?.text ?? 'void').replace(/^const\s+/, '').replace(/^std::/, '');
  if (n?.type === 'placeholder_type_specifier' || text === 'auto') return 'auto';
  if (['int', 'short'].includes(text)) return 'int';
  if (/^(long|long long|long int|long long int|size_t)$/.test(text)) return 'long';
  if (text === 'double' || text === 'long double') return 'double';
  if (text === 'float') return 'float';
  if (text === 'char') return 'char';
  if (text === 'bool' || text === '_Bool') return 'bool';
  if (text === 'string' && dialect === 'cpp') return 'string';
  if (text === 'void') return 'void';
  throw unsupported(n!, `the type ${text}`);
}

function typeOf(typeNode: Node | null): DeclType {
  if (typeNode?.type === 'template_type' && /^unordered_(map|set)$/.test(typeNode.childForFieldName('name')?.text ?? '')) {
    // unordered_map<string, int> / unordered_set<int>: like map / set, kept in libstdc++'s hash-table order.
    const name = typeNode.childForFieldName('name')!.text;
    const args = named(typeNode.childForFieldName('arguments')).map((x) => primOf(named(x).find((c) => c.type !== 'type_qualifier') ?? null));
    const [k, v] = name === 'unordered_map' ? args : [args[0], args[0]];
    if (!k || !v || k === 'void' || k === 'auto' || v === 'void' || v === 'auto' || isReal(k)) throw unsupported(typeNode, `this kind of ${name}`);
    if (isStructItem(k)) throw unsupported(typeNode, `${name} with struct keys`);
    return { t: name === 'unordered_map' ? 'map' : 'set', kt: k, elem: v, hashed: true };
  }
  if (typeNode?.type === 'template_type' && typeNode.childForFieldName('name')?.text === 'map') {
    const [k, v] = named(typeNode.childForFieldName('arguments')).map((a) => primOf(named(a).find((c) => c.type !== 'type_qualifier') ?? null));
    if (!k || !v || k === 'void' || k === 'auto' || v === 'void' || v === 'auto') throw unsupported(typeNode, 'this kind of map');
    if (isStructItem(k)) throw unsupported(typeNode, 'maps with struct keys');
    return { t: 'map', kt: k, elem: v };
  }
  if (typeNode?.type === 'template_type' && typeNode.childForFieldName('name')?.text === 'set') {
    const arg = named(named(typeNode.childForFieldName('arguments'))[0]).find((c) => c.type !== 'type_qualifier') ?? null;
    const elem = primOf(arg);
    if (elem === 'void' || elem === 'auto') throw unsupported(typeNode, 'this kind of set');
    if (isStructItem(elem)) throw unsupported(typeNode, 'sets of structs');
    return { t: 'set', kt: elem, elem };
  }
  if (typeNode?.type === 'qualified_identifier' && /^std::(map|set|unordered_map|unordered_set)/.test(typeNode.text)) return typeOf(typeNode.childForFieldName('name'));
  if (typeNode?.type === 'qualified_identifier' && /map/.test(typeNode.text) && !/vector/.test(typeNode.text)) return typeOf(typeNode.childForFieldName('name'));
  if (typeNode?.type === 'template_type' && typeNode.childForFieldName('name')?.text === 'pair') {
    // pair<int, string>: a struct with first and second.
    const [a, b] = named(typeNode.childForFieldName('arguments')).map((x) => primOf(named(x).find((c) => c.type !== 'type_qualifier') ?? x));
    if (!a || !b || a === 'void' || a === 'auto' || b === 'void' || b === 'auto') throw unsupported(typeNode, 'this kind of pair');
    return { t: 'struct', cls: 'pair', kt: a, elem: b };
  }
  if (typeNode?.type === 'template_type' && ['stack', 'queue', 'priority_queue'].includes(typeNode.childForFieldName('name')?.text ?? '')) {
    const name = typeNode.childForFieldName('name')!.text;
    const args = named(typeNode.childForFieldName('arguments'));
    const elem = primOf(named(args[0]).find((c) => c.type !== 'type_qualifier') ?? args[0]);
    if (elem === 'void' || elem === 'auto') throw unsupported(typeNode, `this kind of ${name}`);
    const coll: Coll = name === 'stack' ? 'stack' : name === 'queue' ? 'queue' : /greater/.test(args[2]?.text ?? '') ? 'pqmin' : 'pq';
    return { t: 'vector', elem, coll };
  }
  // vector<int> as a type, or as the start of a value (vector<int>(4, 0)).
  if (typeNode?.type === 'template_type' || (typeNode?.type === 'template_function' && /vector$/.test(typeNode.childForFieldName('name')?.text ?? ''))) {
    const arg = named(named(typeNode.childForFieldName('arguments'))[0]);
    const argType = arg.find((c) => c.type !== 'type_qualifier') ?? null;
    // vector<vector<int>>: the items are vector<int> rows.
    if (argType?.type === 'template_type' || (argType?.type === 'qualified_identifier' && /vector/.test(argType.text))) {
      const inner = typeOf(argType);
      if (inner.t === 'struct' && inner.cls === 'pair') return { t: 'vector', elem: `pair<${inner.kt},${inner.elem}>` as Prim };
      if (inner.t !== 'vector') throw unsupported(typeNode, 'this kind of vector');
      return { t: 'vector', elem: `vector<${inner.elem}>` as Prim };
    }
    // vector<Animal*> / vector<int*>: the items are pointers.
    if (arg.some((c) => c.type === 'abstract_pointer_declarator')) return { t: 'vector', elem: `${primOf(argType)}*` as Prim };
    const elem = primOf(argType);
    if (elem === 'void' || elem === 'auto') throw unsupported(typeNode, `vector<${elem}>`);
    return { t: 'vector', elem };
  }
  if (typeNode?.type === 'qualified_identifier' && /vector/.test(typeNode.text)) return typeOf(typeNode.childForFieldName('name'));
  const sname = structName(typeNode);
  if (sname) return { t: 'struct', cls: structs.get(sname)!.name };
  if (/^(const\s+)?(std::)?ostream$/.test(typeNode?.text ?? '')) return { t: 'stream' };
  return { t: primOf(typeNode) };
}

/** The name and shape of one declarator: x, x = 1, a[3], a[] = {...}, &r. */
interface DeclaratorInfo {
  name: string;
  value: Node | null;
  arraySize: Node | null | undefined; // undefined: not an array; null: int a[] = {...}
  reference: boolean;
  /** int* p */
  pointer?: boolean;
  /** int g[3][4]: the sizes after the first ([4]) */
  moreSizes?: (Node | null)[];
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
  let pointer = false;
  if (node.type === 'pointer_declarator') {
    pointer = true;
    node = node.childForFieldName('declarator')!;
    if (node.type === 'array_declarator') throw unsupported(node, 'arrays of pointers');
  }
  // int g[3][4]: the tree has [4] outside [3]; collect them first to last.
  const sizes: (Node | null)[] = [];
  while (node.type === 'array_declarator') {
    sizes.unshift(node.childForFieldName('size') ?? null);
    node = node.childForFieldName('declarator')!;
  }
  // int Dog::count = 0;  /  static const int MAX = 3; in the class: the box is called Dog::count.
  if (node.type === 'qualified_identifier') return { name: node.text.replace(/\s+/g, ''), value, arraySize: undefined, reference, pointer: false, moreSizes: [] };
  if (node.type === 'field_identifier' && node.parent?.type === 'field_declaration') {
    return { name: `${ownerOf(node)}::${node.text}`, value: node.parent.childForFieldName('default_value'), arraySize: undefined, reference, pointer: false, moreSizes: [] };
  }
  if (node.type !== 'identifier') throw unsupported(node, 'this kind of declaration');
  const arraySize = sizes.length ? sizes[0] : undefined;
  return { name: node.text, value, arraySize, reference, pointer, moreSizes: sizes.slice(1) };
}

const declarators = (s: Node) => s.childrenForFieldName('declarator').filter((d): d is Node => !!d);

// --------------------------------------------------------------------------
// Loops-and-lists view

const LOOP_TYPES = new Set(['for_statement', 'for_range_loop', 'while_statement', 'do_statement']);
const MUTATORS = new Set(['push_back', 'pop_back', 'clear', 'insert', 'erase', 'emplace_back', 'resize', 'push', 'pop', 'append', 'replace']);

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
    let d = loop.childForFieldName('declarator');
    if (d?.type === 'reference_declarator') d = named(d)[0];
    // for (auto& [name, n] : m): the key's name
    if (d?.type === 'structured_binding_declarator') d = named(d)[0];
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
  cls?: string;
  pt?: DeclType;
  kt?: Prim;
  v: CVal | typeof UNSET;
  /** its block or function has ended (a pointer to it is left dangling) */
  dead?: boolean;
}

/** A variable in a scope: its box, and (for a reference) the name of the box it shares. */
interface Binding {
  cell: Cell;
  refOf?: string;
  /** Animal& r = dog: the type the reference was declared with (it decides non-virtual calls) */
  staticCls?: string;
  /** static const int MAX = 3: it can't be given a new value */
  isConst?: boolean;
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
    if (s.type !== 'declaration' && s.type !== 'field_declaration') continue;
    const type = typeOf(s.childForFieldName('type'));
    for (const d of declarators(s)) {
      const info = declaratorInfo(d);
      const elem = ((type.t === 'struct' ? type.cls : type.t) + '[]'.repeat(info.moreSizes?.length ?? 0)) as Prim;
      out.push({ name: info.name, type: info.pointer ? { t: 'pointer', pt: type } : info.arraySize !== undefined ? { t: 'array', elem } : type });
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

  /** Practice tests: a global variable's value after the run (undefined if unset). */
  globalValue(name: string): CVal | undefined {
    const b = this.globals.vars.get(name);
    const v = b?.cell.v as CVal | typeof UNSET | undefined;
    return v === undefined || v === UNSET || v === UNSET_VAL ? undefined : (v as CVal);
  }
  private input: Input;
  /** cout's settings: fixed / setprecision / boolalpha stay; setw is for the next value only; setfill and left / right stay. */
  private stream = { fixed: false, precision: 6, boolalpha: false, width: 0, fill: ' ', left: false };
  /** The struct whose method or constructor is running (for private members and members without this->). */
  private currentStruct: CStruct | null = null;
  /** The const method that is running, if any (it may not change its object). */
  private constMethod: string | null = null;

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

  /** `frame`: the frame these values belong to (a pointer says "points to x in main()" when x is elsewhere). */
  private getters(names: string[], frame: { label: string } = this.rt.stack[this.rt.stack.length - 1]): Getter[] {
    const scope = this.scope;
    return names.map((n) => () => {
      const b = scope.lookup(n);
      if (!b || b.cell.v === UNSET) throw new Error('unset');
      if (b.cell.v.t === 'pointer') return { seenFrom: frame.label, ptr: b.cell.v };
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
        this.execBody(main.childForFieldName('body')!, []); // main's variables live to the end
      } catch (e) {
        if (!(e instanceof ReturnSignal)) throw e;
        // return 0; ends the program: main() is done and returns 0.
        this.rt.hooks.ret(e.line, e.value);
        this.rt.stack[0].pending = null;
      }
    }
    this.rt.finish();
  }

  /**
   * Run a block. When it ends, its variables are gone (a pointer to them dangles);
   * a function body hands them to `collect` instead, to be marked after its return step.
   */
  private execBody(block: Node, collect: Binding[] | null = null) {
    const saved = this.scope;
    const scope = (this.scope = new Scope(saved));
    const stmts = statementsOf(block);
    for (const d of declaredNames(stmts)) this.scope.vars.set(d.name, { cell: { ...d.type, v: UNSET } });
    try {
      for (let i = 0; i < stmts.length; i++) this.exec(stmts[i], tempSwap(stmts, i));
    } finally {
      this.scope = saved;
      const ended = [...scope.vars.values()].filter((b) => !b.refOf);
      if (collect) collect.push(...ended);
      else for (const b of ended) b.cell.dead = true;
    }
  }

  // ---- statements ---------------------------------------------------------------

  private targetName(n: Node): string {
    // *p = 5 / (*p)++: the box p points to changes (the explainer finds it from p).
    if (n.type === 'parenthesized_expression') return this.targetName(named(n)[0]);
    if (n.type === 'pointer_expression' && n.childForFieldName('argument')?.type === 'identifier') return `*${n.childForFieldName('argument')!.text}`;
    // p.x = ... / this->age = ... / pts[0].x = ...: the struct changes.
    if (n.type === 'field_expression') {
      let o = n;
      let viaPointer = false;
      while (o.type === 'field_expression' || o.type === 'subscript_expression') {
        if (o.type === 'field_expression' && o.childForFieldName('operator')?.type === '->') viaPointer = true;
        o = o.childForFieldName('argument')!;
      }
      // pa->x = 7: the struct pa points to changes.
      return o.type === 'this' ? 'this' : viaPointer ? `*${o.text}` : o.text;
    }
    // count++ inside Dog's code / Dog::count = 5: the static box Dog::count changes.
    if (n.type === 'qualified_identifier' && structs.has(n.childForFieldName('scope')?.text ?? '')) {
      const found = findStatic(n.childForFieldName('scope')!.text, n.childForFieldName('name')?.text ?? '');
      if (found) return `${found.owner.name}::${n.childForFieldName('name')!.text}`;
    }
    if (n.type === 'identifier' && this.currentStruct && !this.isLocal(n.text)) {
      const found = findStatic(this.currentStruct.name, n.text);
      if (found) return `${found.owner.name}::${n.text}`;
    }
    if (n.type === 'identifier' && !this.scope.lookup(n.text) && this.scope.lookup('this')) return 'this';
    // g[1][2] = 9: the table g changes.
    let base = n;
    while (base.type === 'subscript_expression') base = base.childForFieldName('argument')!;
    if (base !== n && base.type === 'identifier') return base.text;
    return subscriptBase(n) ?? n.text;
  }

  /** Where input goes: s.age keeps its full name (the explainer reads the member), a[i] is the list a. */
  private inputTarget(n: Node): string {
    return n.type === 'field_expression' && n.childForFieldName('argument')?.type === 'identifier' ? n.text : this.targetName(n);
  }

  private infoOf(s: Node): StepInfo {
    switch (s.type) {
      case 'field_declaration': // static const int MAX = 3; in a class
      case 'declaration': {
        const ds = declarators(s);
        const t = ds.map((d) => declaratorInfo(d).name);
        return { k: 'assign', t };
      }
      case 'expression_statement': {
        const e = named(s)[0];
        if (!e) return { k: 'other' };
        if (e.type === 'assignment_expression') return { k: 'assign', t: [this.targetName(e.childForFieldName('left')!)] };
        if (e.type === 'delete_expression' && named(e)[0]?.type === 'identifier') return { k: 'assign', t: [named(e)[0].text] };
        if (e.type === 'update_expression') return { k: 'assign', t: [this.targetName(e.childForFieldName('argument')!)] };
        if (e.type === 'binary_expression') {
          const { head, items } = chain(e, '<<');
          if (isStream(head, 'cout') || this.isStreamVar(head)) return { k: 'print' };
          const input = chain(e, '>>');
          if (isStream(input.head, 'cin')) return { k: 'input', t: input.items.map((i) => this.inputTarget(i)) };
          void items;
        }
        if (e.type === 'call_expression') {
          const f = e.childForFieldName('function')!;
          const args = named(e.childForFieldName('arguments'));
          if (/^(std::)?getline$/.test(f.text) && args[1]) return { k: 'input', t: [args[1].text] };
          if (['printf', 'puts', 'putchar'].includes(f.text)) return { k: 'print' };
          if (['strcpy', 'strcat', 'strncpy'].includes(f.text) && args[0]) return { k: 'assign', t: [this.targetName(args[0])] };
          if (f.text === 'scanf') {
            return { k: 'input', t: args.slice(1).map((a) => (a.type === 'pointer_expression' ? this.inputTarget(a.childForFieldName('argument')!) : this.inputTarget(a))) };
          }
          if (/^(std::)?swap$/.test(f.text)) {
            return { k: 'assign', t: [...new Set(args.map((a) => this.targetName(a)))], s: true };
          }
          if (/^(std::)?sort$/.test(f.text) && args[0]?.type === 'call_expression') {
            const obj = args[0].childForFieldName('function')?.childForFieldName('argument');
            if (obj) return { k: 'assign', t: [obj.text] };
          }
          if (f.type === 'field_expression' && MUTATORS.has(f.childForFieldName('field')?.text ?? '')) {
            return { k: 'assign', t: [this.targetName(f.childForFieldName('argument')!)] };
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
      const [owner, member] = info.name.split('::');
      if (member && findStatic(owner, member)?.info.isConst) binding.isConst = true;
      if (info.reference) {
        const target = info.value;
        if (target?.type !== 'identifier' && target?.type !== 'subscript_expression') throw unsupported(d, 'this kind of reference');
        const other = this.scope.lookup(target.text);
        if (!other) throw new CompileError(lineOf(d), `${target.text} is used but never declared.`);
        if (type.t === 'struct' && other.cell.t === 'struct' && !isDerived(other.cell.cls!, type.cls!)) this.mismatch(other.cell.v as CVal, type, d, info.name);
        this.scope.vars.set(info.name, { cell: other.cell, refOf: target.text, staticCls: type.t === 'struct' ? type.cls : undefined });
        continue;
      }
      if (info.pointer) {
        const ptrType: DeclType = { t: 'pointer', pt: type };
        binding.cell = { ...ptrType, v: UNSET };
        if (info.value?.type === 'string_literal' || info.value?.type === 'concatenated_string') throw unsupported(d, 'text pointers (char*)');
        if (info.value) binding.cell.v = this.convert(this.decay(this.eval(info.value), info.value), ptrType, d, info.name);
        else if (isGlobal) binding.cell.v = { t: 'pointer', v: null, pt: type };
        continue;
      }
      if (info.arraySize !== undefined && info.moreSizes?.length) {
        if (type.t === 'struct') throw unsupported(d, 'tables of structs');
        const base = type.t as Prim;
        const sizes = [info.arraySize, ...info.moreSizes];
        if (sizes.slice(1).some((x) => !x)) throw new CompileError(lineOf(d), `Every size after the first must be written, like ${info.name}[3][4].`);
        const v = this.tableFrom(base, sizes, 0, info.value, isGlobal || !!info.value, d, info.name);
        binding.cell = { t: 'array', elem: v.elem, v };
        continue;
      }
      if (info.arraySize !== undefined) {
        const elem = (type.t === 'struct' ? type.cls : type.t) as Prim;
        if (isStructItem(elem)) {
          const st = structs.get(elem)!;
          const given = info.value ? named(info.value).map((e) => this.structFrom(e, st, info.name)) : [];
          const size = info.arraySize ? this.num(this.eval(info.arraySize)) : given.length;
          if (given.length > size) throw new CompileError(lineOf(d), `${info.name} has room for ${size} items, not ${given.length}.`);
          while (given.length < size) given.push(info.value || isGlobal ? this.structFromValues(st, [], d) : this.construct(d, st, []));
          binding.cell = { t: 'array', elem, v: { t: 'array', elem, v: given } };
          continue;
        }
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
        // vector<int> v(5, 0);  vector<vector<int>> g(3, vector<int>(4, 0));
        if (type.coll && info.value) throw unsupported(d, `giving a ${type.coll === 'stack' ? 'stack' : type.coll === 'queue' ? 'queue' : 'priority_queue'} values here (use push)`);
        const items = !info.value ? [] : info.value.type === 'argument_list' ? this.vectorSized(named(info.value), type.elem!, d) : this.vectorFrom(info.value, type.elem!);
        binding.cell.v = { t: 'vector', elem: type.elem, v: items, coll: type.coll };
        continue;
      }
      if (type.t === 'set') {
        // set<int> s;  set<int> s = {3, 1, 2};  set<int> copy = other;
        const set: CVal = { t: 'set', kt: type.kt, elem: type.elem, hashed: type.hashed, v: type.hashed ? new HashEntries() : new Map() };
        if (info.value?.type === 'initializer_list' && set.v instanceof HashEntries) set.v.sizeFor(named(info.value).length);
        if (info.value?.type === 'initializer_list') for (const e of named(info.value)) this.setInsert(set, this.eval(e), e, info.name);
        else if (info.value) binding.cell.v = this.copy(this.convert(this.eval(info.value), type, d, info.name));
        if (!info.value || info.value.type === 'initializer_list') binding.cell.v = set;
        continue;
      }
      if (type.t === 'map') {
        // map<string, int> m;  m = {{"a", 1}, {"b", 2}};  map<...> copy = other;
        binding.cell.v = info.value ? this.mapFrom(info.value, type, d, info.name) : { t: 'map', kt: type.kt, elem: type.elem, hashed: type.hashed, v: type.hashed ? new HashEntries() : new Map() };
        continue;
      }
      if (type.t === 'struct' && type.cls === 'pair') {
        // pair<int, string> p;  p = {1, "a"};  p(1, "a");  p = make_pair(1, "a");
        binding.cell = { ...type, v: info.value ? this.pairFrom(info.value, type, d, info.name) : this.emptyItem(`pair<${type.kt},${type.elem}>` as Prim) };
        continue;
      }
      if (type.t === 'struct') {
        const st = structs.get(type.cls!)!;
        // Point p;  Point p = {1, 2};  Point p{1, 2};  Dog d("Rex", 3);  Dog d = Dog("Rex", 3);  Point q = p; (a copy)
        if (!info.value) binding.cell.v = isGlobal && !st.ctors.length ? this.structFromValues(st, [], d) : this.construct(d, st, []);
        else if (info.value.type === 'argument_list') binding.cell.v = this.construct(d, st, named(info.value));
        else binding.cell.v = this.structFrom(info.value, st, info.name);
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
    if (value.type === 'initializer_list' && elem.startsWith('vector<')) {
      const inner = elem.slice(7, -1) as Prim;
      return named(value).map((e) => (e.type === 'initializer_list' ? { t: 'vector', elem: inner, v: this.vectorFrom(e, inner) } : this.copy(this.convert(this.eval(e), this.itemType(elem), e, 'this list'))));
    }
    if (value.type === 'initializer_list' && isStructItem(elem)) return named(value).map((e) => this.structFrom(e, structs.get(elem)!, 'this list'));
    if (value.type === 'initializer_list' && isPairItem(elem)) return named(value).map((e) => this.pairFrom(e, this.itemType(elem), e, 'this list'));
    if (value.type === 'initializer_list') return named(value).map((e) => this.convert(this.eval(e), this.itemType(elem), e, 'this list'));
    const v = this.eval(value);
    if (v.t !== 'vector') throw new CompileError(lineOf(value), 'A vector needs a list of values like {1, 2, 3}.');
    return [...(v.v as CVal[])];
  }

  private zeroOf(t: Prim): CVal {
    if (t === 'double') return dbl(0);
    if (t === 'float') return flt(0);
    if (t === 'bool') return bool(false);
    if (t === 'char') return chr('\u0000');
    if (t === 'string') return strv('');
    if (t === 'long') return lng(0);
    return int(0);
  }

  /** Lists, text and structs are copied when assigned or passed by value (a struct copies its arrays too). */
  private copy(v: CVal): CVal {
    if (v.t === 'vector') return { ...v, v: (v.v as CVal[]).map((x) => this.copy(x)) };
    if ((v.t === 'map' || v.t === 'set') && v.v instanceof HashEntries) return { ...v, v: v.v.clone((x) => this.copy(x)) };
    if (v.t === 'map' || v.t === 'set') return { ...v, v: new Map([...(v.v as MapEntries)].map(([k, [key, val]]) => [k, [key, this.copy(val)] as [CVal, CVal]])) };
    if (v.t === 'struct') {
      const fields = new Map<string, CVal>();
      for (const [k, x] of v.v as Map<string, CVal>) fields.set(k, x.t === 'array' ? { ...x, v: (x.v as CVal[]).map((y) => this.copy(y)) } : this.copy(x));
      return { ...v, v: fields };
    }
    return v;
  }

  /** A map from {{"a", 1}, {"b", 2}} or from another map (a copy). */
  private mapFrom(n: Node, type: DeclType, at: Node, name: string): CVal {
    const m: CVal = { t: 'map', kt: type.kt, elem: type.elem, hashed: type.hashed, v: type.hashed ? new HashEntries() : new Map() };
    if (n.type !== 'initializer_list') return this.copy(this.convert(this.eval(n), type, at, name));
    if (m.v instanceof HashEntries) m.v.sizeFor(named(n).length);
    for (const pair of named(n)) {
      const [k, v] = named(pair);
      if (pair.type !== 'initializer_list' || !k || !v) throw new CompileError(lineOf(pair), 'Each item of a map needs a key and a value, like {"a", 1}.');
      const key = this.convert(this.eval(k), { t: type.kt! }, k, name);
      (m.v as MapEntries).set(keyOf(key), [key, this.convert(this.eval(v), this.itemType(type.elem), v, name)]);
    }
    return m;
  }

  /** m[k]: the entry for k; like C++, a missing key is added first (with 0, "" or an empty struct). */
  private mapSlot(m: CVal, keyNode: Node): [CVal, CVal] {
    const key = this.convert(this.eval(keyNode), { t: m.kt! }, keyNode, 'the key');
    const entries = m.v as MapEntries;
    let entry = entries.get(keyOf(key));
    if (!entry) {
      const elem = m.elem!;
      const start = isStructItem(elem) ? this.blank(structs.get(elem)!, true) : elem === 'string' ? strv('') : this.zeroOf(elem);
      entry = [key, start];
      entries.set(keyOf(key), entry);
    }
    return entry;
  }

  /** insert: a set holds each value once, in order. */
  private setInsert(set: CVal, v: CVal, at: Node, name: string): boolean {
    const key = this.convert(v, { t: set.elem! }, at, name);
    const entries = set.v as MapEntries;
    if (entries.has(keyOf(key))) return false;
    entries.set(keyOf(key), [key, key]);
    return true;
  }

  private setMethod(n: Node, objNode: Node, set: CVal, method: string, argNodes: Node[]): CVal {
    const entries = set.v as MapEntries;
    const value = () => this.convert(this.eval(argNodes[0]), { t: set.elem! }, argNodes[0], objNode.text);
    switch (method) {
      case 'insert':
        this.setInsert(set, this.eval(argNodes[0]), argNodes[0], objNode.text);
        return VOID;
      case 'erase':
        return int(entries.delete(keyOf(value())) ? 1 : 0);
      case 'count':
        return int(entries.has(keyOf(value())) ? 1 : 0);
      case 'contains':
        return bool(entries.has(keyOf(value())));
      case 'size':
        return lng(entries.size);
      case 'empty':
        return bool(entries.size === 0);
      case 'clear':
        entries.clear();
        return VOID;
      case 'find': {
        const k = keyOf(value());
        return { t: 'iter', v: entries.has(k) ? k : null };
      }
      case 'end':
        return { t: 'iter', v: null };
    }
    throw unsupported(n, `set.${method}()`);
  }

  private mapMethod(n: Node, objNode: Node, m: CVal, method: string, argNodes: Node[]): CVal {
    const entries = m.v as MapEntries;
    const key = () => this.convert(this.eval(argNodes[0]), { t: m.kt! }, argNodes[0], 'the key');
    switch (method) {
      case 'size':
        return lng(entries.size);
      case 'empty':
        return bool(entries.size === 0);
      case 'count':
      case 'contains': {
        const has = entries.has(keyOf(key()));
        return method === 'count' ? int(has ? 1 : 0) : bool(has);
      }
      case 'erase':
        return int(entries.delete(keyOf(key())) ? 1 : 0);
      case 'clear':
        entries.clear();
        return VOID;
      case 'at': {
        const k = key();
        const entry = entries.get(keyOf(k));
        if (!entry) throw libraryException('out_of_range', `the key ${formatCpp(k)} is not in ${objNode.text}`, 'map::at');
        return entry[1];
      }
      case 'find':
        return { t: 'iter', v: entries.has(keyOf(key())) ? keyOf(key()) : null };
      case 'end':
        return { t: 'iter', v: null };
    }
    throw unsupported(n, `map.${method}()`);
  }

  /** The type of one item of a vector or array: a value type, or a struct. */
  private itemType(elem: Prim | undefined): DeclType {
    // Rows: int g[3][4] has int[] items; vector<vector<int>> has vector<int> items.
    if (elem?.endsWith('[]')) return { t: 'array', elem: elem.slice(0, -2) as Prim };
    if (elem?.startsWith('vector<')) return { t: 'vector', elem: elem.slice(7, -1) as Prim };
    if (isPairItem(elem)) {
      const [a, b] = pairParts(elem!);
      return { t: 'struct', cls: 'pair', kt: a, elem: b };
    }
    if (elem?.endsWith('*')) {
      const base = elem.slice(0, -1) as Prim;
      return { t: 'pointer', pt: isStructItem(base) ? { t: 'struct', cls: structs.get(base)!.name } : { t: base } };
    }
    return isStructItem(elem) ? { t: 'struct', cls: structs.get(elem!)!.name } : { t: elem ?? 'int' };
  }

  /** A new item with nothing in it yet: 0, "", an empty row or struct. */
  private emptyItem(elem: Prim): CVal {
    if (elem.endsWith('*')) return { t: 'pointer', v: null, pt: this.itemType(elem).pt };
    if (elem.startsWith('vector<')) return { t: 'vector', elem: elem.slice(7, -1) as Prim, v: [] };
    if (isPairItem(elem)) {
      const [a, b] = pairParts(elem);
      return this.makePair(this.emptyItem(a), this.emptyItem(b), a, b);
    }
    if (isStructItem(elem)) return this.blank(structs.get(elem)!, true);
    return elem === 'string' ? strv('') : this.zeroOf(elem);
  }

  /** vector<int> v(n) / v(n, value): n items (copies of value, or empty ones). */
  private vectorSized(args: Node[], elem: Prim, at: Node): CVal[] {
    if (args.length === 0 || args.length > 2) throw unsupported(at, 'this kind of vector');
    const n = this.num(this.eval(args[0]));
    if (n < 0) throw new CppCrash('IndexOutOfRange', `a vector can't have ${n} items`);
    const fill = args[1] ? this.convert(this.eval(args[1]), this.itemType(elem), args[1], 'the vector') : this.emptyItem(elem);
    return Array.from({ length: n }, () => this.copy(fill));
  }

  /** int g[3][4] = {{1, 2}, {3}}: rows of rows; missing items are 0 (or "no value yet" without any {...}). */
  private tableFrom(base: Prim, sizes: (Node | null)[], level: number, init: Node | null, zero: boolean, at: Node, name: string): CVal {
    const elem = (base + '[]'.repeat(sizes.length - level - 1)) as Prim;
    const given = init && init.type === 'initializer_list' ? named(init) : [];
    const size = sizes[level] ? this.num(this.eval(sizes[level]!)) : given.length;
    if (given.length > size) throw new CompileError(lineOf(at), `${name} has room for ${size} items, not ${given.length}.`);
    const items: CVal[] = [];
    for (let i = 0; i < size; i++) {
      const g = given[i] ?? null;
      if (level + 1 < sizes.length) {
        // A row: {...}, or text for a row of letters (char names[3][10] = {"Sam", "Bo"}).
        if (g && (g.type === 'string_literal' || g.type === 'concatenated_string') && level + 2 === sizes.length && base === 'char') {
          const text = this.eval(g).v as string;
          const width = this.num(this.eval(sizes[level + 1]!));
          if (text.length + 1 > width) throw new CompileError(lineOf(g), `Each row of ${name} has room for ${width - 1} letters.`);
          const row = [...text, '\u0000'].map(chr);
          while (row.length < width) row.push(chr('\u0000'));
          items.push({ t: 'array', elem: 'char', v: row });
        } else items.push(this.tableFrom(base, sizes, level + 1, g, zero, at, name));
      } else items.push(g ? this.convert(this.eval(g), { t: base }, g, name) : zero ? this.zeroOf(base) : UNSET_VAL);
    }
    return { t: 'array', elem, v: items };
  }

  // ---- structs and classes ---------------------------------------------------------

  /** A struct with every member at its start: no value yet (or 0 when `zero`), then the values written in the struct. */
  private blank(st: CStruct, zero: boolean): CVal {
    const fields = new Map<string, CVal>();
    const members = allMembers(st.name);
    for (const f of members) {
      let v: CVal;
      if (f.size !== undefined) {
        const elem = (f.type.t === 'struct' ? f.type.cls : f.type.t) as Prim;
        // int a[N]; with static const int N = 3; in the class: the size may use the class's statics.
        const saved = this.currentStruct;
        this.currentStruct = structs.get(f.owner) ?? saved;
        let n = 0;
        try {
          n = f.size ? this.num(this.eval(f.size)) : 0;
        } finally {
          this.currentStruct = saved;
        }
        v = { t: 'array', elem, v: Array.from({ length: n }, () => (isStructItem(elem) ? this.blank(structs.get(elem)!, zero) : zero ? this.zeroOf(elem) : UNSET_VAL)) };
      } else if (f.type.t === 'struct') v = this.blank(structs.get(f.type.cls!)!, zero);
      else if (f.type.t === 'vector') v = { t: 'vector', elem: f.type.elem, v: [] };
      else if (f.type.t === 'string') v = strv('');
      else v = zero ? this.zeroOf(f.type.t as Prim) : UNSET_VAL;
      fields.set(f.name, v);
    }
    const obj: CVal = { t: 'struct', cls: st.name, v: fields };
    // int count = 0; / int b = a + 1; written in the struct: set as the object is made,
    // inside the object (other members are read from it, not from the caller).
    if (members.some((f) => f.def)) {
      const saved = this.scope;
      const savedStruct = this.currentStruct;
      this.scope = new Scope(this.globals, true);
      this.scope.vars.set('this', { cell: { t: 'struct', cls: st.name, v: obj } });
      this.currentStruct = st;
      try {
        for (const f of members) {
          if (!f.def) continue;
          const value = f.def.type === 'initializer_list' && f.type.t === 'struct' ? this.structFrom(f.def, structs.get(f.type.cls!)!, f.name) : this.eval(f.def);
          fields.set(f.name, this.copy(this.convert(value, f.type, f.def, f.name)));
        }
      } finally {
        this.scope = saved;
        this.currentStruct = savedStruct;
      }
    }
    return obj;
  }

  /** A struct from {1, 2}, {.x = 1}, another struct, or Dog("Rex", 3). */
  private structFrom(n: Node, st: CStruct, name: string): CVal {
    if (n.type === 'initializer_list') {
      if (st.ctors.length) return this.construct(n, st, named(n));
      return this.structFromValues(st, named(n), n);
    }
    return this.copy(this.convert(this.eval(n), { t: 'struct', cls: st.name }, n, name));
  }

  /** {1, 2} for a struct without constructors: members in order (or by name, .x = 1); the rest start at 0. */
  private structFromValues(st: CStruct, items: Node[], at: Node): CVal {
    if (st.parent && items.length) throw unsupported(at, `{...} for ${st.name}, which is built on ${st.parent} (give it a constructor)`);
    if (items.length > st.fields.length) throw new CompileError(lineOf(at), `${st.name} has ${st.fields.length} members, not ${items.length}.`);
    const obj = this.blank(st, true);
    const fields = obj.v as Map<string, CVal>;
    items.forEach((item, i) => {
      let node = item;
      let field = st.fields[i];
      if (item.type === 'initializer_pair') {
        const fname = named(item.childForFieldName('designator') ?? named(item)[0])[0]?.text ?? '';
        field = st.fields.find((f) => f.name === fname)!;
        if (!field) throw new CompileError(lineOf(item), `${st.name} has no member called ${fname}.`);
        node = item.childForFieldName('value')!;
      }
      let value: CVal;
      if (field.size !== undefined && node.type === 'initializer_list') {
        const elem = (field.type.t === 'struct' ? field.type.cls : field.type.t) as Prim;
        const current = fields.get(field.name)!;
        const slots = current.v as CVal[];
        named(node).forEach((e, k) => {
          if (k >= slots.length) throw new CompileError(lineOf(e), `${field.name} has room for ${slots.length} items.`);
          slots[k] = isStructItem(elem) ? this.structFrom(e, structs.get(elem)!, field.name) : this.convert(this.eval(e), { t: elem }, e, field.name);
        });
        return;
      } else if (field.size !== undefined && (node.type === 'string_literal' || node.type === 'concatenated_string')) {
        const text = this.eval(node).v as string;
        const slots = fields.get(field.name)!.v as CVal[];
        if (text.length + 1 > slots.length) throw new CompileError(lineOf(node), `${field.name} has room for ${slots.length - 1} letters.`);
        [...text, '\u0000'].forEach((c, k) => (slots[k] = chr(c)));
        return;
      } else if (field.type.t === 'struct') value = this.structFrom(node, structs.get(field.type.cls!)!, field.name);
      else if (field.type.t === 'vector') value = { t: 'vector', elem: field.type.elem, v: this.vectorFrom(node, field.type.elem!) };
      else value = this.convert(this.eval(node), field.type, node, field.name);
      fields.set(field.name, value);
    });
    return obj;
  }

  /** Make an object: run the constructor that fits the values (Dog d("Rex", 3)); without constructors, members have no value yet. */
  private construct(at: Node, st: CStruct, argNodes: Node[]): CVal {
    const pure = missingPure(st.name);
    if (pure) throw new CompileError(lineOf(at), `${st.name} has a pure virtual method (${pure}() = 0), so you can't make ${/^[AEIOU]/.test(st.name) ? 'an' : 'a'} ${st.name} itself: make one of the classes built on it.`);
    if (!st.ctors.length) {
      if (argNodes.length) throw new CompileError(lineOf(at), `${st.name} has no constructor that takes ${argNodes.length} value${argNodes.length === 1 ? '' : 's'}.`);
      const obj = this.blank(st, false);
      if (st.parent) this.constructBase(obj, structs.get(st.parent)!, [], at, st);
      return obj;
    }
    const paramsOf = (c: Node) => named(c.childForFieldName('declarator')!.childForFieldName('parameters')).filter((p) => p.type === 'parameter_declaration');
    let fitting = st.ctors.filter((c) => paramsOf(c).length === argNodes.length);
    if (fitting.length > 1) {
      // Several with the same number of values: the one whose types fit (no conversions needed).
      const values = argNodes.map((a) => this.eval(a));
      const exact = fitting.filter((c) => paramsOf(c).every((p, i) => typeOf(p.childForFieldName('type')).t === values[i].t));
      if (exact.length) fitting = exact;
    }
    const ctor = fitting[0];
    if (!ctor) {
      throw new CompileError(lineOf(at), `${st.name} has no constructor that takes ${argNodes.length ? `${argNodes.length} value${argNodes.length === 1 ? '' : 's'}` : 'no values'}.`);
    }
    const obj = this.blank(st, false);
    return this.callFn(at, ctor, argNodes, obj, `${st.name}::${st.name}`, obj, st);
  }

  /** The base part of an object: : Animal(n) in the member list, or the base's own constructor without values. */
  private constructBase(obj: CVal, base: CStruct, argNodes: Node[], at: Node, below: CStruct) {
    if (!base.ctors.length) {
      if (argNodes.length) throw new CompileError(lineOf(at), `${base.name} has no constructor that takes ${argNodes.length} value${argNodes.length === 1 ? '' : 's'}.`);
      if (base.parent) this.constructBase(obj, structs.get(base.parent)!, [], at, base);
      return;
    }
    const paramsOf = (c: Node) => named(c.childForFieldName('declarator')!.childForFieldName('parameters')).filter((p) => p.type === 'parameter_declaration');
    const ctor = base.ctors.find((c) => paramsOf(c).length === argNodes.length);
    if (!ctor) {
      if (!argNodes.length) throw new CompileError(lineOf(at), `${base.name} has no constructor that takes no values, so ${below.name}'s constructor must call ${base.name}(...) in its member list.`);
      throw new CompileError(lineOf(at), `${base.name} has no constructor that takes ${argNodes.length} value${argNodes.length === 1 ? '' : 's'}.`);
    }
    this.callFn(at, ctor, argNodes, obj, `${base.name}::${base.name}`, obj, base, true);
  }

  /** : Animal(n), name(n), age(a) before a constructor's body (the base part first, like C++). */
  private initMembers(ctor: Node, st: CStruct, obj: CVal) {
    const list = named(ctor).find((c) => c.type === 'field_initializer_list');
    const fields = obj.v as Map<string, CVal>;
    const baseInit = st.parent ? named(list).find((fi) => named(fi)[0]?.text === st.parent) : undefined;
    if (st.parent) {
      // The base part is made while this constructor's first line is shown.
      const frame = this.rt.stack[this.rt.stack.length - 1];
      const was = frame.pending;
      frame.pending = lineOf(baseInit ?? ctor);
      try {
        this.constructBase(obj, structs.get(st.parent)!, baseInit ? named(named(baseInit)[1]) : [], baseInit ?? ctor, st);
      } finally {
        frame.pending = was;
      }
    }
    for (const fi of named(list)) {
      if (fi === baseInit || fi.id === baseInit?.id) continue;
      const fname = named(fi)[0]?.text ?? '';
      const field = st.fields.find((f) => f.name === fname);
      if (!field) throw new CompileError(lineOf(fi), `${st.name} has no member called ${fname}.`);
      const args = named(named(fi)[1]);
      let value: CVal;
      if (field.type.t === 'struct') {
        const inner = structs.get(field.type.cls!)!;
        value = args.length === 1 && !inner.ctors.length ? this.structFrom(args[0], inner, fname) : this.construct(fi, inner, args);
      } else if (field.type.t === 'vector') value = args.length ? { t: 'vector', elem: field.type.elem, v: this.vectorFrom(args[0], field.type.elem!) } : { t: 'vector', elem: field.type.elem, v: [] };
      else if (!args.length) value = field.type.t === 'string' ? strv('') : this.zeroOf(field.type.t as Prim);
      else value = this.convert(this.eval(args[0]), field.type, fi, fname);
      fields.set(fname, this.copy(value));
    }
  }

  /** A constructor is done: its return step shows the new object. */
  private made(ctor: Node, obj: CVal): CVal {
    const top = this.rt.stack[this.rt.stack.length - 1];
    this.rt.hooks.ret(top.pending ?? lineOf(ctor), obj);
    return obj;
  }

  /** *p: the value p points to, with StepViz's checks (nullptr, a box that is gone, no value yet). */
  private deref(p: CVal, at: Node): CVal {
    const t = this.targetOf(p, at);
    const v = t.cell.v as CVal | typeof UNSET;
    if (v === UNSET || v === UNSET_VAL) throw new CppCrash('Uninitialized', `${at.text} points to ${t.name}, which has no value yet`);
    return v;
  }

  private targetOf(p: CVal, at: Node): PtrTarget {
    if (p.t !== 'pointer') throw new CompileError(lineOf(at), `${at.text} is not a pointer, so * can't be used on it.`);
    const t = p.v as PtrTarget | null;
    if (!t) throw new CppCrash('NullPointer', `${at.text} is nullptr`);
    if (t.owner?.dead) throw new CppCrash('Dangling', `${at.text} points to ${t.name}, which no longer exists`);
    if (t.arr && (t.index! < 0 || t.index! >= t.arr.length)) throw new CppCrash('IndexOutOfRange', `${at.text} points outside ${t.base}`);
    return t;
  }

  /** a used as a pointer (int* p = a; sum(a, 5)): it points to a[0]. */
  private decay(v: CVal, node: Node | null): CVal {
    if (v.t !== 'array') return v;
    const b = node?.type === 'identifier' ? this.scope.lookup(node.text) : undefined;
    const frame = b && this.globals.vars.get(node!.text) === b ? 'Global' : this.rt.stack[this.rt.stack.length - 1].label;
    return { t: 'pointer', pt: this.itemType(v.elem), v: itemPointer(v.v as CVal[], 0, node?.text ?? 'the list', frame, b?.cell ?? null) };
  }

  /** p + k: k places further along the same list (one past the end is allowed; reading there is not). */
  private move(p: CVal, k: number, at: Node): CVal {
    const t = p.v as PtrTarget | null;
    if (!t) throw new CppCrash('NullPointer', `${at.text} uses a nullptr`);
    if (!t.arr) throw unsupported(at, 'moving a pointer that does not point into a list');
    const index = t.index! + k;
    if (index < 0 || index > t.arr.length) throw new CppCrash('IndexOutOfRange', `${at.text} would point outside ${t.base}`);
    return { ...p, v: itemPointer(t.arr, index, t.base!, t.frame, t.owner, t.heap) };
  }

  /** new int(5) / new int / new int[n] / new int[3]() / new Point{1, 2} / new Dog("Rex", 3): a box with no name. */
  private newBox(n: Node): CVal {
    const typeNode = n.childForFieldName('type')!;
    const type = typeOf(typeNode);
    const typeText = type.t === 'struct' ? type.cls! : typeNode.text;
    const args = n.childForFieldName('arguments');
    const length = n.childForFieldName('declarator')?.childForFieldName('length');
    if (n.childForFieldName('placement')) throw unsupported(n, 'placement new');
    if (length) {
      const size = this.num(this.eval(length));
      if (size < 0) throw new CppCrash('IndexOutOfRange', `new can't make ${size} items`);
      const given = args?.type === 'initializer_list' ? named(args) : [];
      const st = type.t === 'struct' ? structs.get(type.cls!)! : null;
      const items: CVal[] = Array.from({ length: size }, (_, i) => {
        if (st) return given[i] ? this.structFrom(given[i], st, 'the new list') : args ? this.structFromValues(st, [], n) : this.construct(n, st, []);
        if (given[i]) return this.convert(this.eval(given[i]), type, given[i], 'the new list');
        return args ? this.zeroOf(type.t as Prim) : UNSET_VAL; // new int[3]() fills with 0
      });
      const heap: NonNullable<PtrTarget['heap']> = { isArray: true };
      return { t: 'pointer', pt: type, v: itemPointer(items, 0, `new ${typeText}[${size}]`, 'heap', heap, heap) };
    }
    let value: CVal;
    if (type.t === 'struct') {
      const st = structs.get(type.cls!)!;
      value = !args ? this.construct(n, st, []) : args.type === 'initializer_list' ? this.structFrom(args, st, 'the new box') : this.construct(n, st, named(args));
    } else if (!args) value = UNSET_VAL;
    else {
      const items = named(args);
      if (items.length > 1) throw new CompileError(lineOf(n), `new ${typeText} takes one starting value.`);
      value = items[0] ? this.convert(this.eval(items[0]), type, items[0], `new ${typeText}`) : this.zeroOf(type.t as Prim);
    }
    const heap: NonNullable<PtrTarget['heap']> = { isArray: false };
    return { t: 'pointer', pt: type, v: { cell: { v: value }, name: `new ${typeText}`, frame: 'heap', owner: heap, heap } };
  }

  /** delete p / delete[] p: the box made with new is gone (using it again is a crash). */
  private deleteBox(n: Node): CVal {
    const arg = named(n)[0];
    const p = this.eval(arg);
    if (p.t !== 'pointer') throw new CompileError(lineOf(n), `delete needs a pointer, and ${arg.text} is not one.`);
    const t = p.v as PtrTarget | null;
    if (!t) return VOID; // delete nullptr does nothing
    if (!t.heap || (t.arr && t.index !== 0)) throw new CppCrash('BadDelete', `${arg.text} does not point to a box made with new`);
    if (t.heap.deleted) throw new CppCrash('DoubleDelete', `${t.name} was deleted already`);
    const isArray = /^delete\s*\[\s*\]/.test(n.text);
    if (isArray !== t.heap.isArray) throw new CompileError(lineOf(n), t.heap.isArray ? `${arg.text} points to a list made with new[]: use delete[] ${arg.text}.` : `${arg.text} points to one box: use delete ${arg.text} (without []).`);
    t.heap.deleted = true;
    t.heap.dead = true;
    return VOID;
  }

  /** &x, &a[2], &p.x: a pointer to that box. */
  private addressOf(n: Node): CVal {
    const frame = (b: Binding | undefined) => (b && this.globals.vars.get(n.text) === b ? 'Global' : this.rt.stack[this.rt.stack.length - 1].label);
    if (n.type === 'identifier') {
      const b = this.scope.lookup(n.text);
      if (!b) throw new CompileError(lineOf(n), `${n.text} is used but never declared.`);
      if (b.cell.t === 'array') throw unsupported(n, 'pointers to whole arrays');
      const pt: DeclType = { t: b.cell.t, elem: b.cell.elem, cls: b.cell.cls, pt: b.cell.pt };
      return { t: 'pointer', pt, v: { cell: b.cell, name: b.refOf ?? n.text, frame: frame(b), owner: b.cell } };
    }
    // A list item or a struct member: a box inside another variable's box.
    let base = n;
    while (base.type === 'subscript_expression' || base.type === 'field_expression') base = base.childForFieldName('argument')!;
    const owner = base.type === 'identifier' ? this.scope.lookup(base.text) : undefined;
    if (n.type === 'subscript_expression') {
      const { list, index } = this.element(n);
      if (list.t === 'string') throw unsupported(n, 'pointers to letters of text');
      return { t: 'pointer', pt: this.itemType(list.elem), v: itemPointer(list.v as CVal[], index, n.childForFieldName('argument')!.text, frame(owner), owner?.cell ?? null) };
    }
    if (n.type === 'field_expression') {
      const m = this.member(n);
      const fields = m.fields;
      const cell = { get v() { return fields.get(m.name)!; }, set v(x: CVal) { fields.set(m.name, x); } };
      return { t: 'pointer', pt: m.type, v: { cell, name: n.text, frame: frame(owner), owner: owner?.cell ?? null } };
    }
    throw unsupported(n, 'pointers to this');
  }

  /** p.x / this->age / pts[0].x: the struct, its member's name and type, with C++'s checks. */
  private member(n: Node): { fields: Map<string, CVal>; name: string; type: DeclType; size: Node | null | undefined; isSelf: boolean } {
    const objNode = n.childForFieldName('argument')!;
    const name = n.childForFieldName('field')!.text;
    const arrow = n.childForFieldName('operator')?.type === '->';
    let obj = this.eval(objNode);
    if (obj.t === 'pointer') {
      if (!arrow) throw new CompileError(lineOf(n), `${objNode.text} is a pointer: use -> to reach its member, like ${objNode.text}->${name}.`);
      obj = this.deref(obj, objNode);
    } else if (arrow && objNode.type !== 'this') {
      throw new CompileError(lineOf(n), `${objNode.text} is not a pointer: use . to reach its member, like ${objNode.text}.${name}.`);
    }
    if (obj.t === 'iter') throw unsupported(n, 'iterators like this');
    if (obj.t !== 'struct') throw new CompileError(lineOf(n), `${objNode.text} is not a struct, so it has no member ${name}.`);
    if (obj.cls === 'pair') {
      // kv.first / kv.second in for (auto& kv : m)
      if (name !== 'first' && name !== 'second') throw new CompileError(lineOf(n), `A pair has first and second, not ${name}.`);
      const fields = obj.v as Map<string, CVal>;
      const v = fields.get(name)!;
      return { fields, name, type: { t: v.t, elem: v.elem, cls: v.cls }, size: undefined, isSelf: false };
    }
    const st = structs.get(obj.cls!)!;
    const field = allMembers(st.name).find((f) => f.name === name);
    if (!field) throw new CompileError(lineOf(n), `${st.name} has no member called ${name}.`);
    // Through an Animal pointer, only Animal's members can be reached (like the compiler checks).
    const ptrType = arrow && objNode.type !== 'this' ? (this.eval(objNode).pt?.cls ?? null) : null;
    if (ptrType && !allMembers(ptrType).some((f) => f.name === name)) {
      throw new CompileError(lineOf(n), `${objNode.text} is ${/^[AEIOU]/.test(ptrType) ? 'an' : 'a'} ${ptrType} pointer, and ${ptrType} has no member ${name}.`);
    }
    if (field.isPrivate && this.currentStruct?.name !== field.owner) {
      throw new CompileError(lineOf(n), `${name} is private in ${field.owner}, so only code inside ${field.owner} can use it.`);
    }
    if (field.isProtected && !(this.currentStruct && isDerived(this.currentStruct.name, field.owner))) {
      throw new CompileError(lineOf(n), `${name} is protected in ${field.owner}, so only code inside ${field.owner} and the classes built on it can use it.`);
    }
    const self = this.scope.lookup('this')?.cell.v;
    return { fields: obj.v as Map<string, CVal>, name, type: field.type, size: field.size, isSelf: self === obj };
  }

  /** A member used without this-> inside a method (age instead of this->age). */
  private implicitMember(id: Node): Binding | undefined {
    const self = this.scope.lookup('this')?.cell.v;
    if (!self || self === UNSET || self.t !== 'struct' || this.scope.lookup(id.text)) return undefined;
    const fields = self.v as Map<string, CVal>;
    if (!fields.has(id.text)) return undefined;
    const field = allMembers(self.cls!).find((f) => f.name === id.text)!;
    if (field.isPrivate && this.currentStruct && field.owner !== this.currentStruct.name) {
      throw new CompileError(lineOf(id), `${id.text} is private in ${field.owner}, so ${this.currentStruct.name} can't use it (make it protected).`);
    }
    const constMethod = this.constMethod;
    // A cell that reads and writes the member in place.
    const cell = {
      t: field.size !== undefined ? ('array' as CType) : field.type.t,
      elem: field.type.elem,
      cls: field.type.cls,
      get v() {
        return fields.get(id.text)!;
      },
      set v(x: CVal) {
        if (constMethod) throw new CompileError(lineOf(id), `${constMethod} is a const method, so it can't change ${id.text}.`);
        fields.set(id.text, x);
      },
    };
    return { cell: cell as Cell };
  }

  private truthy(v: CVal): boolean {
    if (v.t === 'bool') return v.v as boolean;
    if (v.t === 'pointer') return v.v !== null;
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
      let isRef = false;
      let listText = '';
      if (s.type === 'for_statement') {
        const init = s.childForFieldName('initializer');
        if (init?.type === 'declaration') {
          for (const d of declaredNames([init])) this.scope.vars.set(d.name, { cell: { ...d.type, v: UNSET } });
          this.declare(init, false);
        } else if (init) this.eval(init.type === 'expression_statement' ? named(init)[0] : init);
      }
      if (s.type === 'for_range_loop' && this.eval(s.childForFieldName('right')!).t === 'map') {
        this.mapLoop(s, line, info, body);
        return;
      }
      if (s.type === 'for_range_loop') {
        const list = this.eval(s.childForFieldName('right')!);
        if (list.t !== 'vector' && list.t !== 'array' && list.t !== 'string' && list.t !== 'set') throw unsupported(s, 'this kind of range-for loop');
        items = list.t === 'string' ? [...(list.v as string)].map(chr) : list.t === 'set' ? sortedEntries(list.v as MapEntries).map(([k]) => k) : (list.v as CVal[]);
        const declNode = s.childForFieldName('declarator')!;
        isRef = declNode.type === 'reference_declarator';
        if (isRef && list.t === 'string') throw unsupported(s, 'range-for loops with & over text');
        listText = s.childForFieldName('right')!.text;
        const declared = typeOf(s.childForFieldName('type'));
        const type: DeclType = declNode.type === 'pointer_declarator' ? { t: 'pointer', pt: declared } : declared;
        const itemT = type.t === 'auto' ? this.itemType(list.t === 'string' ? 'char' : list.elem) : type;
        itemBinding = { cell: { ...itemT, v: UNSET } };
        this.scope.vars.set(v ?? 'item', itemBinding);
      }
      let first = true;
      let k = 0;
      for (;;) {
        if (items) {
          if (k >= items.length) break;
          const at = k++;
          const item = items[at];
          if (item === UNSET_VAL) throw new CppCrash('Uninitialized', `item ${at} has no value yet`);
          const declNode = s.childForFieldName('declarator')!;
          const bindNode = declNode.type === 'structured_binding_declarator' ? declNode : declNode.type === 'reference_declarator' && named(declNode)[0]?.type === 'structured_binding_declarator' ? named(declNode)[0] : null;
          if (bindNode) {
            // for (auto [a, b] : pairs) / for (auto& [x, y] : points): one name for each part, in order.
            const names = named(bindNode).map((c) => c.text);
            const whole = isRef ? item : this.copy(item);
            if (whole.t !== 'struct') throw new CompileError(lineOf(bindNode), `[${names.join(', ')}] needs pairs or structs to take apart.`);
            const fields = whole.v as Map<string, CVal>;
            const keys = [...fields.keys()];
            if (keys.length !== names.length) throw new CompileError(lineOf(bindNode), `A ${whole.cls} has ${keys.length} parts, so write ${keys.length} names in [...].`);
            names.forEach((name, i) => {
              const key = keys[i];
              const now = fields.get(key)!;
              if (!isRef) {
                this.scope.vars.set(name, { cell: { t: now.t, elem: now.elem, cls: now.cls, v: now } });
                return;
              }
              const cell = { t: now.t, elem: now.elem, cls: now.cls, get v() { return fields.get(key)!; }, set v(x: CVal) { fields.set(key, x); } };
              this.scope.vars.set(name, { cell: cell as Cell, refOf: `${listText}[${at}].${key}` });
            });
          } else if (isRef) {
            // for (auto& p : pts): p is the item itself (changing p changes pts[at]).
            const list = items;
            const base = itemBinding!.cell;
            const cell = {
              t: base.t,
              elem: base.elem,
              cls: base.cls,
              get v() {
                return list[at];
              },
              set v(x: CVal) {
                list[at] = x;
              },
            };
            this.scope.vars.set(v ?? 'item', { cell: cell as Cell, refOf: `${listText}[${at}]` });
          } else itemBinding!.cell.v = this.copy(this.convert(item, itemBinding!.cell, s, v ?? 'item'));
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

  /** for (auto& [k, v] : m) / for (auto& kv : m): the entries in key order. */
  private mapLoop(s: Node, line: number, info: StepInfo, body: Node) {
    const m = this.eval(s.childForFieldName('right')!);
    const mapText = s.childForFieldName('right')!.text;
    let decl = s.childForFieldName('declarator')!;
    const isRef = decl.type === 'reference_declarator';
    if (isRef) decl = named(decl)[0];
    const names = decl.type === 'structured_binding_declarator' ? named(decl).map((c) => c.text) : [decl.text];
    if (names.length > 2) throw new CompileError(lineOf(decl), 'A map entry has two parts: the key and the value.');
    const outer = this.scope;
    let done = false;
    try {
      for (const entry of sortedEntries(m.v as MapEntries)) {
        this.scope = new Scope(outer);
        const [key, value] = entry;
        const where = `${mapText}[${formatCpp(key)}]`;
        if (names.length === 2) {
          this.scope.vars.set(names[0], { cell: { t: key.t, v: key } });
          if (isRef) {
            const cell = { t: value.t, elem: value.elem, cls: value.cls, get v() { return entry[1]; }, set v(x: CVal) { entry[1] = x; } };
            this.scope.vars.set(names[1], { cell: cell as Cell, refOf: where });
          } else this.scope.vars.set(names[1], { cell: { t: value.t, elem: value.elem, cls: value.cls, v: this.copy(value) } });
        } else {
          const pair: CVal = { t: 'struct', cls: 'pair', v: new PairFields(isRef ? entry : null, key, isRef ? value : this.copy(value)) };
          this.scope.vars.set(names[0], { cell: { t: 'struct', cls: 'pair', v: pair } });
        }
        this.hook(line, info, null);
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
      }
      done = true;
    } finally {
      this.scope = outer;
      if (!done) this.rt.hooks.dropLoop(line);
    }
    const all = this.scope.names();
    this.rt.hooks.x(line, this.namesId(all), this.getters(all), info);
  }

  // ---- functions ----------------------------------------------------------------

  private call(node: Node, name: string, argNodes: Node[]): CVal {
    const f = this.program.functions.get(name);
    if (!f) throw unsupported(node, `the function ${name}`);
    return this.callFn(node, f, argNodes, null, name, null, null);
  }

  /**
   * Run a function, a method (with `self`: this, the first variable of its frame)
   * or a constructor (with `making`: the new object; its member list runs first).
   */
  private callFn(node: Node, f: Node, argNodes: (Node | CVal)[], self: CVal | null, label: string, making: CVal | null, st: CStruct | null, basePart = false, fullLabel?: string): CVal {
    const declarator = fnDeclarator(f);
    const params = named(declarator.childForFieldName('parameters')).filter((p) => p.type === 'parameter_declaration');
    const shown = label.replace(/^\w+::/, '');
    if (params.length !== argNodes.length) {
      throw new CompileError(lineOf(node), `${shown} needs ${params.length} value${params.length === 1 ? '' : 's'}, not ${argNodes.length}.`);
    }
    const scope = new Scope(this.globals, true);
    const names: string[] = [];
    if (self) {
      scope.vars.set('this', { cell: { t: 'struct', cls: self.cls, v: self } });
      names.push('this');
    }
    params.forEach((p, i) => {
      const decl = p.childForFieldName('declarator');
      const info = decl ? declaratorInfo(decl) : { name: `arg${i}`, reference: false, arraySize: undefined, value: null };
      const type = typeOf(p.childForFieldName('type'));
      const given = argNodes[i];
      if (isCVal(given)) {
        // A value already worked out (an operator's operands): a reference gets a box of its own.
        scope.vars.set(info.name, { cell: { ...type, v: type.t === 'stream' ? given : this.copy(this.convert(given, type, node, info.name)) } });
        names.push(info.name);
        return;
      }
      const arg = given;
      if (info.reference) {
        // A reference shares the caller's box.
        if (arg.type !== 'identifier') throw unsupported(arg, 'passing this by reference');
        const b = this.scope.lookup(arg.text);
        if (!b) throw new CompileError(lineOf(arg), `${arg.text} is used but never declared.`);
        if (type.t === 'struct' && b.cell.t === 'struct' && !isDerived(b.cell.cls!, type.cls!)) this.mismatch(b.cell.v as CVal, type, arg, info.name);
        scope.vars.set(info.name, { cell: b.cell, refOf: b.refOf ?? arg.text, staticCls: type.t === 'struct' ? type.cls : undefined });
      } else if (info.arraySize !== undefined) {
        const a = this.eval(arg);
        if (a.t !== 'array') throw new CompileError(lineOf(arg), `${info.name} needs an array.`);
        scope.vars.set(info.name, { cell: { t: 'array', elem: a.elem, v: a } }); // arrays are not copied
      } else if (info.pointer) {
        const ptrType: DeclType = { t: 'pointer', pt: type };
        scope.vars.set(info.name, { cell: { ...ptrType, v: this.convert(this.decay(this.eval(arg), arg), ptrType, arg, info.name) } });
      } else if (type.t === 'struct' && arg.type === 'initializer_list') {
        scope.vars.set(info.name, { cell: { ...type, v: this.structFrom(arg, structs.get(type.cls!)!, info.name) } });
      } else {
        scope.vars.set(info.name, { cell: { ...type, v: this.copy(this.convert(this.eval(arg), type, arg, info.name)) } });
      }
      names.push(info.name);
    });
    const returnType = making ? ({ t: 'void' } as DeclType) : typeOf(f.childForFieldName('type'));
    const saved = this.scope;
    const savedStruct = this.currentStruct;
    const savedConst = this.constMethod;
    this.scope = scope;
    this.currentStruct = st;
    // int getAge() const { ... }: the method may not change its object.
    const methodName = declarator.childForFieldName('declarator')!.text.replace(/^\w+::/, '');
    this.constMethod = named(declarator).some((c) => c.type === 'type_qualifier' && c.text === 'const') ? methodName : null;
    // The label shows pointers as &x (addOne(&x)); the frame shows "points to x in main()".
    const frame = { label };
    const shownArgs = names.slice(self ? 1 : 0).map((n) => {
      const v = scope.vars.get(n)!.cell.v;
      const text = v === UNSET ? '?' : v.t === 'pointer' ? pointerText(v, LABEL) : this.rt.fmt((v.t === 'vector' || v.t === 'array') && v.elem !== 'char' ? v.v : v);
      return text.replace(/ \(same box as [^)]*\)$/, '');
    });
    this.rt.hooks.enter(label, this.namesId(names), this.getters(names, frame), self ? 1 : 0, fullLabel ?? `${label}(${shownArgs.join(', ')})`);
    frame.label = this.rt.stack[this.rt.stack.length - 1].label;
    const ended: Binding[] = [];
    try {
      if (making && st) this.initMembers(f, st, making);
      this.execBody(f.childForFieldName('body')!, label === 'main' ? [] : ended);
      if (making) return basePart ? VOID : this.made(f, making);
      if (returnType.t !== 'void' && label !== 'main') throw new CompileError(lineOf(f), `${shown} must return a value.`);
      return VOID;
    } catch (e) {
      if (e instanceof ReturnSignal) {
        if (making) return basePart ? VOID : this.made(f, making);
        const value = returnType.t === 'void' ? VOID : this.copy(this.convert(e.value, returnType, node, shown));
        this.rt.hooks.ret(e.line, value.t === 'vector' || value.t === 'array' ? value.v : value);
        return value;
      }
      this.rt.hooks.thrown(e);
      throw e;
    } finally {
      this.scope = scope;
      // A function with no lines that ran (Animal(string n) : name(n) {}): its steps show its own line.
      const top = this.rt.stack[this.rt.stack.length - 1];
      if (top.pending === null) top.pending = lineOf(f);
      this.rt.hooks.leave();
      this.scope = saved;
      this.currentStruct = savedStruct;
      this.constMethod = savedConst;
      // The function is over: its variables and values are gone.
      if (label !== 'main') for (const b of [...ended, ...scope.vars.values()]) if (!b.refOf && b.cell !== scope.vars.get('this')?.cell) b.cell.dead = true;
    }
  }

  // ---- expressions ----------------------------------------------------------------

  /** Assignment conversions (C++ converts numbers silently; text and lists must match). */
  private convert(v: CVal, to: { t: CType; elem?: Prim; cls?: string; pt?: DeclType; kt?: Prim }, at: Node, name: string): CVal {
    if (v === UNSET_VAL) throw new CppCrash('Uninitialized', `${name} was given a value that has no value yet`);
    const t = to.t;
    if (t === 'map' || v.t === 'map' || t === 'set' || v.t === 'set') {
      if (t === 'auto' || (t === v.t && v.kt === to.kt && v.elem === to.elem && !!(v as CVal).hashed === !!(to as DeclType).hashed)) return v;
      return this.mismatch(v, to, at, name);
    }
    if ((t === 'struct' && to.cls === 'pair') || (v.t === 'struct' && v.cls === 'pair')) {
      if (t === 'auto') return v;
      if (t !== 'struct' || to.cls !== 'pair' || v.t !== 'struct' || v.cls !== 'pair') return this.mismatch(v, to, at, name);
      const f = v.v as Map<string, CVal>;
      const a = to.kt ? this.convert(f.get('first')!, this.itemType(to.kt), at, `${name}.first`) : f.get('first')!;
      const b = to.elem ? this.convert(f.get('second')!, this.itemType(to.elem), at, `${name}.second`) : f.get('second')!;
      return this.makePair(a, b, to.kt ?? v.kt, to.elem ?? v.elem);
    }
    if (t === 'pointer' || v.t === 'pointer') {
      // Animal* can point to a Dog (a class built on Animal).
      const same = (a?: DeclType, b?: DeclType) => !a || !b || (a.t === b.t && a.elem === b.elem && (a.cls === b.cls || (!!a.cls && !!b.cls && isDerived(a.cls, b.cls))));
      if (t === 'auto') return v;
      if (t === 'pointer' && v.t === 'pointer' && (v.v === null || same(v.pt, to.pt))) return { ...v, pt: to.pt ?? v.pt };
      return this.mismatch(v, to, at, name);
    }
    if (t === 'struct' || v.t === 'struct') {
      if (t === 'auto' || (t === 'struct' && v.t === 'struct' && structs.get(v.cls!)?.name === structs.get(to.cls!)?.name)) return v;
      if (t === 'struct' && v.t === 'struct' && isDerived(v.cls!, to.cls!)) {
        // Animal a = dog;  only the Animal part is copied (slicing).
        const keep = new Set(allMembers(to.cls!).map((f) => f.name));
        const fields = new Map([...(v.v as Map<string, CVal>)].filter(([k]) => keep.has(k)));
        return { t: 'struct', cls: structs.get(to.cls!)!.name, v: fields };
      }
      return this.mismatch(v, to, at, name);
    }
    if (t === 'auto' || v.t === t) return v.t === 'vector' && v.elem !== to.elem && to.elem ? this.mismatch(v, to, at, name) : v;
    if (NUMERIC.has(t) && NUMERIC.has(v.t)) {
      const x = this.num(v);
      if (t === 'int') return v.t === 'long' ? int(Number(BigInt.asIntN(32, this.big(v)))) : int(Math.trunc(x));
      if (t === 'long') return isReal(v.t) ? lng(x) : lng(this.big(v));
      if (t === 'double') return dbl(x);
      if (t === 'float') return flt(x);
      if (t === 'char') return chr(String.fromCharCode(Math.trunc(x) & 0xff));
      if (t === 'bool') return bool(x !== 0);
    }
    if (t === 'string' && v.t === 'char') return strv(v.v as string);
    return this.mismatch(v, to, at, name);
  }

  private mismatch(v: CVal, to: { t: CType; elem?: Prim; cls?: string; pt?: DeclType; kt?: Prim }, at: Node, name: string): never {
    const typeText = (d?: DeclType): string => (!d ? '?' : d.t === 'struct' ? d.cls! : d.t === 'vector' ? `vector<${d.elem}>` : d.t);
    const what = to.t === 'set' ? `set<${to.elem}>` : to.t === 'map' ? `map<${to.kt}, ${to.elem}>` : to.t === 'pointer' ? `${typeText(to.pt)}*` : to.t === 'vector' ? `vector<${to.elem}>` : to.t === 'struct' ? to.cls! : to.t;
    throw new CompileError(lineOf(at), `${name} is ${/^[aeiou]/.test(what) ? 'an' : 'a'} ${what} box, so it can't hold ${formatCpp(v)}.`);
  }

  private num(v: CVal): number {
    if (v === UNSET_VAL) throw new CppCrash('Uninitialized', 'a value was used before it was given one');
    if (v.t === 'char') return (v.v as string).charCodeAt(0);
    if (v.t === 'bool') return v.v ? 1 : 0;
    return Number(v.v);
  }

  /** The exact whole number in an int, long, char or bool value. */
  private big(v: CVal): bigint {
    if (typeof v.v === 'bigint') return v.v;
    return BigInt(Math.trunc(this.num(v)));
  }

  private arith(op: string, a: CVal, b: CVal, at: Node): CVal {
    const x = this.num(a);
    const y = this.num(b);
    if (isReal(a.t) || isReal(b.t)) {
      // double if either side is a double; float if the real side is a float (rounded to 32 bits).
      const make = a.t === 'double' || b.t === 'double' ? dbl : flt;
      switch (op) {
        case '+': return make(x + y);
        case '-': return make(x - y);
        case '*': return make(x * y);
        case '/': return make(x / y);
        case '%': throw new CompileError(lineOf(at), `% only works on whole numbers in ${LANG_NAME()}.`);
      }
    }
    // A shift keeps the type of its left side (int << long long is an int).
    const isLong = a.t === 'long' || (b.t === 'long' && op !== '<<' && op !== '>>');
    if ((op === '/' || op === '%') && y === 0) throw new CppCrash('DivideByZero', 'whole-number division by zero');
    if (isLong) {
      // Exact 64-bit arithmetic that wraps like g++ (BigInt division and % round toward zero, as C++ does).
      const p = this.big(a);
      const q = this.big(b);
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
      }
    }
    const wrap = (n: number): CVal => int(n);
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
      if (isStream(head, 'cout') || this.isStreamVar(head)) return this.print(items);
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
    if (a.t === 'iter' || b.t === 'iter') {
      // m.find(k) != m.end(): is k in the map?
      if ((op !== '==' && op !== '!=') || a.t !== b.t) throw unsupported(n, 'iterators like this');
      return bool(op === '==' ? a.v === b.v : a.v !== b.v);
    }
    // a + 2 with an array a: a list used as a pointer to its first item.
    const asPointer = (x: CVal, y: CVal) => x.t === 'pointer' || (x.t === 'array' && x.elem !== 'char' && NUMERIC.has(y.t));
    if ((asPointer(a, b) || asPointer(b, a)) && (op === '+' || op === '-')) {
      // p + 2, 2 + p, a + 1 (a list used as a pointer), p - 1, q - p (how far apart)
      const x = this.decay(a, n.childForFieldName('left'));
      const y = this.decay(b, n.childForFieldName('right'));
      if (x.t === 'pointer' && y.t === 'pointer') {
        const [s1, s2] = [x.v as PtrTarget | null, y.v as PtrTarget | null];
        if (op !== '-' || !s1?.arr || s1.arr !== s2?.arr) throw unsupported(n, 'this pointer arithmetic');
        return lng(s1.index! - s2.index!);
      }
      if (x.t === 'pointer') return this.move(x, (op === '+' ? 1 : -1) * this.num(y), n);
      if (op === '+') return this.move(y, this.num(x), n);
      throw unsupported(n, 'this pointer arithmetic');
    }
    if (a.t === 'pointer' || b.t === 'pointer') {
      // q < arr + 5: an array next to a pointer is a pointer to its first item.
      const pa = this.decay(a, n.childForFieldName('left'));
      const pb = this.decay(b, n.childForFieldName('right'));
      if (['<', '<=', '>', '>='].includes(op) && pa.t === 'pointer' && pb.t === 'pointer') {
        const [s1, s2] = [pa.v as PtrTarget | null, pb.v as PtrTarget | null];
        if (!s1?.arr || s1.arr !== s2?.arr) throw unsupported(n, 'comparing pointers into different lists');
        const d = s1.index! - s2.index!;
        return bool(op === '<' ? d < 0 : op === '<=' ? d <= 0 : op === '>' ? d > 0 : d >= 0);
      }
      if (op !== '==' && op !== '!=') throw unsupported(n, 'pointer arithmetic');
      if (a.t !== 'pointer' || b.t !== 'pointer') throw new CompileError(lineOf(n), `${LANG_NAME()} can't compare a pointer with ${formatCpp(a.t === 'pointer' ? b : a)}.`);
      const same = samePlace(a.v as PtrTarget | null, b.v as PtrTarget | null);
      return bool(op === '==' ? same : !same);
    }
    if ((a.t === 'vector' || b.t === 'vector') && ['==', '!=', '<', '<=', '>', '>='].includes(op)) {
      // Two vectors compare item by item (== needs every item equal; < works like a dictionary).
      if (a.t !== 'vector' || b.t !== 'vector') throw new CompileError(lineOf(n), `${LANG_NAME()} can't compare a vector with ${formatCpp(a.t === 'vector' ? b : a)}.`);
      const lt = this.lessThan(a, b, n);
      const gt = this.lessThan(b, a, n);
      return bool(op === '==' ? !lt && !gt : op === '!=' ? lt || gt : op === '<' ? lt : op === '<=' ? !gt : op === '>' ? gt : !lt);
    }
    if (a.t === 'struct' && b.t === 'struct' && a.cls === 'pair' && b.cls === 'pair' && ['==', '!=', '<', '<=', '>', '>='].includes(op)) {
      // pairs compare first, then second.
      const lt = this.lessThan(a, b, n);
      const gt = this.lessThan(b, a, n);
      return bool(op === '==' ? !lt && !gt : op === '!=' ? lt || gt : op === '<' ? lt : op === '<=' ? !gt : op === '>' ? gt : !lt);
    }
    if (a.t === 'struct' || b.t === 'struct') {
      const own = this.callOperator(op, a, b, n.childForFieldName('left'), n, n.childForFieldName('right'));
      if (own) return own;
      // C++20: a != b uses the program's == (and gives the opposite answer).
      if (op === '!=') {
        const eq = this.callOperator('==', a, b, n.childForFieldName('left'), n, n.childForFieldName('right'));
        if (eq) return bool(!this.truthy(eq));
      }
      const s = (a.t === 'struct' ? a : b) as CVal;
      const first = structs.get(s.cls!)!.fields[0]?.name ?? 'x';
      if (['==', '!=', '<', '<=', '>', '>='].includes(op)) {
        throw new CompileError(lineOf(n), `${LANG_NAME()} can't compare two ${s.cls} values with ${op}: compare their parts, like a.${first} ${op} b.${first}.`);
      }
      throw new CompileError(lineOf(n), `${op} does not work on ${s.cls} values: use their parts, like a.${first}.`);
    }
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
      const exact = (a.t === 'long' || b.t === 'long') && !isReal(a.t) && !isReal(b.t);
      const x = exact ? this.big(a) : this.num(a);
      const y = exact ? this.big(b) : this.num(b);
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
      if (name === 'boolalpha' || name === 'noboolalpha') {
        this.stream.boolalpha = name === 'boolalpha';
        continue;
      }
      if (name === 'left' || name === 'right') {
        this.stream.left = name === 'left';
        continue;
      }
      if (item.type === 'call_expression' && /^(std::)?(setprecision|setw|setfill)$/.test(item.childForFieldName('function')!.text)) {
        const which = item.childForFieldName('function')!.text.replace(/^std::/, '');
        const arg = this.eval(named(item.childForFieldName('arguments'))[0]);
        if (which === 'setprecision') this.stream.precision = this.num(arg);
        else if (which === 'setw') this.stream.width = this.num(arg);
        else this.stream.fill = arg.t === 'char' ? (arg.v as string) : String.fromCharCode(this.num(arg));
        continue;
      }
      const v = this.eval(item);
      // cout << p with the program's own operator<<: it runs (its frame shows) and writes the text.
      if (v.t === 'struct') {
        const op = this.findFreeOperator('operator<<', [{ t: 'stream', v: null }, v]);
        if (op) {
          this.callFn(item, op, [{ t: 'stream', v: null }, v], null, 'operator<<', null, null, false, item.text.length <= 20 ? `operator<<(cout, ${item.text})` : undefined);
          continue;
        }
      }
      let text = this.coutText(v, item);
      // setw(n): the next value takes at least n places, filled with the setfill letter (right side unless left).
      if (this.stream.width > text.length) {
        const pad = this.stream.fill.repeat(this.stream.width - text.length);
        text = this.stream.left ? text + pad : pad + text;
      }
      this.stream.width = 0;
      this.rt.output += text;
    }
    return { t: 'stream', v: null };
  }

  private isStreamVar(n: Node): boolean {
    if (n.type !== 'identifier') return false;
    const b = this.scope.lookup(n.text);
    return !!b && b.cell.t === 'stream';
  }

  /** A free operator (written outside a struct) whose parameter types fit these values. */
  private findFreeOperator(name: string, values: CVal[]): Node | null {
    const fits = (p: Node, v: CVal) => {
      const t = typeOf(p.childForFieldName('type'));
      if (t.t === 'struct') return v.t === 'struct' && isDerived(v.cls!, t.cls!);
      if (t.t === 'stream') return v.t === 'stream';
      return t.t === v.t || (NUMERIC.has(t.t) && NUMERIC.has(v.t));
    };
    for (const def of operators.get(name) ?? []) {
      const params = named(fnDeclarator(def).childForFieldName('parameters')).filter((p) => p.type === 'parameter_declaration');
      if (params.length === values.length && params.every((p, i) => fits(p, values[i]))) return def;
    }
    return null;
  }

  /** a == b, a + b, a < b with the program's own operator (a method of a's struct, or a free one); null if there is none. */
  private callOperator(op: string, a: CVal, b: CVal, leftNode: Node | null, at: Node, rightNode: Node | null = null): CVal | null {
    const name = `operator${op}`;
    // The label uses the operands as written, when they are short: a.operator+(b), operator<(a, b).
    const text = (x: Node | null) => (x && x.text.length <= 20 ? x.text : null);
    const l = text(leftNode);
    const r = text(rightNode);
    if (a.t === 'struct') {
      const found = findStructMethod(a.cls!, name);
      if (found) {
        const label = leftNode?.type === 'identifier' ? `${leftNode.text}.${name}` : `${found.owner.name}::${name}`;
        return this.callFn(at, found.m, [b], a, label, null, found.owner, false, l && r ? `${l}.${name}(${r})` : undefined);
      }
    }
    const free = this.findFreeOperator(name, [a, b]);
    return free ? this.callFn(at, free, [a, b], null, name, null, null, false, l && r ? `${name}(${l}, ${r})` : undefined) : null;
  }

  private coutText(v: CVal, at: Node): string {
    switch (v.t) {
      case 'long':
        if (v.npos) return '18446744073709551615';
        return String(v.v);
      case 'double':
      case 'float':
        return this.stream.fixed ? cFixed(v.v as number, this.stream.precision) : cppDouble(v.v as number, this.stream.precision);
      case 'bool':
        return this.stream.boolalpha ? String(v.v) : v.v ? '1' : '0';
      case 'vector':
      case 'array':
      case 'set':
      case 'map':
        throw unsupported(at, 'printing a whole list with cout');
      case 'struct': {
        const first = v.cls === 'pair' ? 'first' : structs.get(v.cls!)!.fields[0]?.name ?? 'x';
        throw new CompileError(lineOf(at), `cout can't print a ${v.cls} directly: print its parts, like ${at.text}.${first}.`);
      }
      case 'pointer':
        // cout << p prints an address in real C++.
        return v.v === null ? '0' : addressOf(v.v as PtrTarget);
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
      } else if (isReal(current as CType)) {
        if (Number.isNaN(Number(word))) throw new CppCrash('BadInput', `"${word}" is not a number`);
        value = (current === 'float' ? flt : dbl)(Number(this.input.word()));
      } else if (current === 'bool') {
        if (word !== '0' && word !== '1') throw new CppCrash('BadInput', `"${word}" is not 0 or 1`);
        value = bool(this.input.word() === '1');
      } else {
        if (!/^[+-]?\d+$/.test(word)) throw new CppCrash('BadInput', `"${word}" is not a whole number`);
        value = wholeFrom(this.input.word());
      }
      this.assignTo(t, value);
    }
    return VOID;
  }

  private lvalueType(t: Node): CType {
    if (t.type === 'field_expression') return this.member(t).type.t;
    if (t.type === 'subscript_expression') {
      const list = this.eval(t.childForFieldName('argument')!);
      if (list.t === 'map') return this.itemType(list.elem).t;
      if (list.t === 'pointer') return list.pt?.t ?? 'int';
      return list.elem ?? (list.t === 'string' ? 'char' : 'int');
    }
    const b = this.varBinding(t);
    if (!b) throw new CompileError(lineOf(t), `${t.text} is used but never declared.`);
    return b.cell.t;
  }

  /** The list and position for v[i] (or s[i] for text), with StepViz's bounds check. */
  private element(n: Node, atCall = false): { list: CVal; index: number } {
    const list = this.eval(n.childForFieldName('argument')!);
    const i = this.num(this.eval(subscriptIndex(n)));
    const length = list.t === 'string' ? (list.v as string).length : list.t === 'vector' || list.t === 'array' ? (list.v as CVal[]).length : -1;
    if (length < 0) throw new CompileError(lineOf(n), `${n.childForFieldName('argument')!.text} is not a list.`);
    if (list.coll) throw new CompileError(lineOf(n), `A ${list.coll === 'stack' ? 'stack' : list.coll === 'queue' ? 'queue' : 'priority_queue'} can't be read by position: use ${list.coll === 'queue' ? 'front()' : 'top()'}.`);
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
      const container = this.eval(target.childForFieldName('argument')!);
      if (container.t === 'pointer') {
        const t = this.targetOf(this.move(container, this.num(this.eval(subscriptIndex(target))), target), target);
        const stored = this.copy(this.convert(value, container.pt ?? { t: 'int' }, target, target.text));
        t.cell.v = stored;
        return stored;
      }
      if (container.t === 'map') {
        const entry = this.mapSlot(container, subscriptIndex(target));
        entry[1] = this.copy(this.convert(value, this.itemType(container.elem), target, target.text));
        return entry[1];
      }
      const { list, index } = this.element(target);
      if (list.t === 'string') {
        // s[0] = 'J': the text gets the new letter (C++ strings can be changed in place).
        const base = target.childForFieldName('argument')!;
        const letter = this.convert(value, { t: 'char' }, target, target.text);
        const text = list.v as string;
        this.assignTo(base, strv(text.slice(0, index) + (letter.v as string) + text.slice(index + 1)));
        return letter;
      }
      const items = list.v as CVal[];
      items[index] = this.copy(this.convert(value, this.itemType(list.elem), target, target.text));
      return items[index];
    }
    if (target.type === 'pointer_expression' && target.childForFieldName('operator')?.type === '*') {
      const arg = target.childForFieldName('argument')!;
      const t = this.targetOf(this.eval(arg), arg);
      const p = this.eval(arg);
      const stored = this.copy(this.convert(value, p.pt ?? { t: 'int' }, target, target.text));
      t.cell.v = stored;
      return stored;
    }
    if (target.type === 'field_expression') {
      const m = this.member(target);
      if (m.isSelf && this.constMethod) throw new CompileError(lineOf(target), `${this.constMethod} is a const method, so it can't change ${m.name}.`);
      if (m.size !== undefined) throw new CompileError(lineOf(target), `${LANG_NAME()} can't give a whole array a new value: change its items one by one.`);
      const stored = this.copy(this.convert(value, m.type, target, target.text));
      m.fields.set(m.name, stored);
      return stored;
    }
    if (target.type === 'parenthesized_expression') return this.assignTo(named(target)[0], value);
    if (target.type !== 'identifier' && target.type !== 'qualified_identifier') throw unsupported(target, 'this kind of assignment');
    const b = this.varBinding(target);
    if (!b) throw new CompileError(lineOf(target), `${target.text} is used but never declared.`);
    if (b.isConst) throw new CompileError(lineOf(target), `${target.text} is const, so it can't be given a new value.`);
    if (b.cell.t === 'vector') {
      if (value.t !== 'vector') this.mismatch(value, b.cell, target, target.text);
      b.cell.v = this.copy(value);
    } else b.cell.v = this.copy(this.convert(value, b.cell, target, target.text));
    return b.cell.v;
  }

  /**
   * The box a name stands for: a variable, a member used without this->, or a static member
   * (count inside Dog's code, or Dog::count anywhere), with C++'s private / protected checks.
   */
  private varBinding(id: Node): Binding | undefined {
    if (id.type === 'qualified_identifier') {
      const scopeName = id.childForFieldName('scope')?.text ?? '';
      const member = id.childForFieldName('name')?.text ?? '';
      const st = structs.get(scopeName);
      if (!st) return this.scope.lookup(id.text);
      const found = findStatic(st.name, member);
      if (!found) {
        if (st.fields.some((f) => f.name === member) || allMembers(st.name).some((f) => f.name === member)) {
          throw new CompileError(lineOf(id), `${member} belongs to each ${st.name} object, so ${id.text} needs an object: use it like d.${member}.`);
        }
        throw new CompileError(lineOf(id), `${st.name} has no static member called ${member}.`);
      }
      this.checkStaticAccess(found, member, id);
      return this.globals.vars.get(`${found.owner.name}::${member}`);
    }
    const local = this.scope.lookup(id.text);
    if (local && this.globals.vars.get(id.text) !== local) return local;
    const member = this.implicitMember(id);
    if (member) return member;
    if (this.currentStruct) {
      const found = findStatic(this.currentStruct.name, id.text);
      if (found) {
        this.checkStaticAccess(found, id.text, id);
        return this.globals.vars.get(`${found.owner.name}::${id.text}`);
      }
      const self = this.scope.lookup('this');
      if (!self && allMembers(this.currentStruct.name).some((f) => f.name === id.text)) {
        throw new CompileError(lineOf(id), `${id.text} belongs to each ${this.currentStruct.name} object, so a static method can't use it on its own.`);
      }
    }
    return local;
  }

  private checkMethodAccess(owner: CStruct, method: string, at: Node) {
    if (owner.privateMethods.has(method) && this.currentStruct?.name !== owner.name) {
      throw new CompileError(lineOf(at), `${method} is private in ${owner.name}, so only code inside ${owner.name} can use it.`);
    }
    if (owner.protectedMethods?.has(method) && !(this.currentStruct && isDerived(this.currentStruct.name, owner.name))) {
      throw new CompileError(lineOf(at), `${method} is protected in ${owner.name}, so only code inside ${owner.name} and the classes built on it can use it.`);
    }
  }

  /** A variable of the running function (not a global one). */
  private isLocal(name: string): boolean {
    const b = this.scope.lookup(name);
    return !!b && this.globals.vars.get(name) !== b;
  }

  private checkStaticAccess(found: { owner: CStruct; info: StaticInfo }, member: string, at: Node) {
    const owner = found.owner.name;
    if (found.info.isPrivate && this.currentStruct?.name !== owner) {
      throw new CompileError(lineOf(at), `${member} is private in ${owner}, so only code inside ${owner} can use it.`);
    }
    if (found.info.isProtected && !(this.currentStruct && isDerived(this.currentStruct.name, owner))) {
      throw new CompileError(lineOf(at), `${member} is protected in ${owner}, so only code inside ${owner} and the classes built on it can use it.`);
    }
  }

  private readVar(id: Node): CVal {
    const b = this.varBinding(id);
    if (!b) {
      if (/^(std::)?(endl|cout|cin)$/.test(id.text)) throw unsupported(id, `${id.text} here`);
      if (id.text === 'NULL') return { t: 'pointer', v: null };
      if (/^(std::)?string::npos$/.test(id.text.replace(/\s+/g, ''))) return NPOS;
      if (id.text === 'INT_MAX') return int(2147483647);
      if (id.text === 'INT_MIN') return int(-2147483648);
      throw new CompileError(lineOf(id), `${id.text} is used but never declared.`);
    }
    if (b.cell.v === UNSET) throw new CppCrash('Uninitialized', `${id.text} was used before it was given a value`);
    return b.cell.v;
  }

  private readTarget(n: Node): CVal {
    if (n.type === 'parenthesized_expression') return this.readTarget(named(n)[0]);
    if (n.type === 'pointer_expression' && n.childForFieldName('operator')?.type === '*') {
      const arg = n.childForFieldName('argument')!;
      return this.deref(this.eval(arg), arg);
    }
    if (n.type === 'field_expression') {
      const m = this.member(n);
      const v = m.fields.get(m.name)!;
      if (v === UNSET_VAL) throw new CppCrash('Uninitialized', `${n.text} was used before it was given a value`);
      return v;
    }
    if (n.type === 'subscript_expression') {
      const container = this.eval(n.childForFieldName('argument')!);
      if (container.t === 'map') return this.mapSlot(container, subscriptIndex(n))[1];
      if (container.t === 'pointer') return this.deref(this.move(container, this.num(this.eval(subscriptIndex(n))), n), n);
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
        // 9.99f is a float; 9.99 a double.
        if (/[.e]/.test(text) && !text.startsWith('0x')) return /f$/.test(text) ? flt(parseFloat(text.slice(0, -1))) : dbl(parseFloat(text));
        const digits = text.replace(/[ul]+$/, '');
        const value = BigInt(digits.startsWith('0x') || digits.startsWith('0b') ? digits : /^0\d/.test(digits) ? `0o${digits.slice(1)}` : digits);
        // A whole number too big for an int is a long in C++ (3000000000 needs no L).
        return /l$/.test(text) || value > 2147483647n ? lng(value) : int(Number(value));
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
      case 'null':
        return { t: 'pointer', v: null };
      case 'new_expression':
        return this.newBox(n);
      case 'compound_literal_expression': {
        // Point{1, 2}: a new struct value
        const t = typeOf(n.childForFieldName('type'));
        if (t.t !== 'struct') throw unsupported(n, 'this kind of value');
        return this.structFrom(n.childForFieldName('value')!, structs.get(t.cls!)!, t.cls!);
      }
      case 'delete_expression':
        return this.deleteBox(n);
      case 'pointer_expression': {
        const arg = n.childForFieldName('argument')!;
        if (n.childForFieldName('operator')?.type === '&') return this.addressOf(arg);
        return this.deref(this.eval(arg), arg);
      }
      case 'lambda_expression':
        // A lambda remembers the variables around it (it reads them when it runs).
        return { t: 'func', v: { node: n, scope: this.scope } as CFunc };
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
        if (op === '-') return t === 'double' ? dbl(-x) : t === 'float' ? flt(-x) : t === 'long' ? lng(-this.big(v)) : int(-x);
        if (op === '+') return isReal(t) ? v : t === 'long' ? v : int(x);
        if (op === '~') return t === 'long' ? lng(~this.big(v)) : int(~x);
        throw unsupported(n, `the operator ${op}`);
      }
      case 'update_expression': {
        const target = n.childForFieldName('argument')!;
        const op = n.childForFieldName('operator')!.type;
        const prefix = n.child(0)?.type === op;
        const before = this.readTarget(target);
        if (before.t === 'pointer') {
          const moved = this.move(before, op === '++' ? 1 : -1, n);
          this.assignTo(target, moved);
          return prefix ? moved : before;
        }
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
            if (b?.cell.t === 'struct' && b.cell.cls === 'pair') return this.assignTo(left, this.pairFrom(rightNode, b.cell, rightNode, left.text));
            if (b?.cell.t === 'vector') return this.assignTo(left, { t: 'vector', elem: b.cell.elem, v: this.vectorFrom(rightNode, b.cell.elem!) });
          }
          const value = this.eval(rightNode);
          return this.assignTo(left, value.t === 'array' && this.lvalueType(left) === 'pointer' ? this.decay(value, rightNode) : value);
        }
        const current = this.readTarget(left);
        const right = this.eval(rightNode);
        const bin = op.slice(0, -1);
        if (current.t === 'struct') {
          // a += b: the struct's own operator+= (it changes a), or a = a + b with its operator+.
          const found = findStructMethod(current.cls!, `operator${op}`);
          if (found) return this.callFn(n, found.m, [right], current, `${left.text}.operator${op}`, null, found.owner, false, rightNode.text.length <= 20 ? `${left.text}.operator${op}(${rightNode.text})` : undefined);
          const sum = this.callOperator(bin, current, right, left, n);
          if (sum) return this.assignTo(left, sum);
          throw new CompileError(lineOf(n), `${current.cls} has no operator${op} (or operator${bin}) for this.`);
        }
        if (current.t === 'pointer') {
          // p += 2 / p -= 1
          if (bin !== '+' && bin !== '-') throw unsupported(n, 'this pointer arithmetic');
          return this.assignTo(left, this.move(current, (bin === '+' ? 1 : -1) * this.num(right), n));
        }
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
      case 'field_expression':
        return this.readTarget(n);
      case 'this': {
        const self = this.scope.lookup('this');
        if (!self && this.currentStruct) throw new CompileError(lineOf(n), "this can't be used in a static method: it runs without an object.");
        if (!self) throw new CompileError(lineOf(n), "this can only be used inside a struct's own methods and constructors.");
        return self.cell.v as CVal;
      }
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
    if (f.type === 'template_function' && /^(std::)?vector$/.test(f.childForFieldName('name')?.text ?? '')) {
      // vector<int>(4, 0): a new list of 4 zeros.
      const t = typeOf(f);
      return { t: 'vector', elem: t.elem, v: this.vectorSized(argNodes, t.elem!, n) };
    }
    if (f.type === 'template_function' && f.childForFieldName('name')?.text === 'static_cast') {
      const t = typeOf(named(named(f.childForFieldName('arguments'))[0])[0] ?? null);
      return this.convert(this.eval(argNodes[0]), t, n, 'this value');
    }

    // Methods: v.push_back(3), s.length() ...
    if (f.type === 'field_expression') {
      const objNode = f.childForFieldName('argument')!;
      const method = f.childForFieldName('field')!.text;
      const obj = this.eval(objNode);
      if (obj.t === 'string') return this.stringMethod(n, obj, method, args(), objNode);
      if (obj.t === 'exception' && method === 'what' && !argNodes.length) return strv(obj.v as string);
      if (obj.t === 'vector') return this.vectorMethod(n, objNode, obj, method, argNodes);
      if (obj.t === 'map') return this.mapMethod(n, objNode, obj, method, argNodes);
      if (obj.t === 'set') return this.setMethod(n, objNode, obj, method, argNodes);
      let target = obj;
      let viaPointer: string | null = null;
      if (obj.t === 'pointer') {
        if (f.childForFieldName('operator')?.type !== '->') throw new CompileError(lineOf(n), `${objNode.text} is a pointer: use -> to call its method, like ${objNode.text}->${method}().`);
        viaPointer = obj.pt?.cls ?? null;
        target = this.deref(obj, objNode);
      }
      if (target.t === 'struct') {
        // Which version runs: a virtual method through a pointer or reference uses the object's own class;
        // otherwise the variable's type decides (like C++).
        const b = objNode.type === 'identifier' ? this.scope.lookup(objNode.text) : undefined;
        const staticCls = viaPointer ?? (objNode.type === 'this' ? this.currentStruct?.name : undefined) ?? b?.staticCls ?? target.cls!;
        const byPlace = !!viaPointer || objNode.type === 'this' || !!b?.refOf;
        const virtual = isVirtualIn(staticCls, method);
        // A pure virtual method (= 0) has no body in the base: the object's own class gives it.
        const found = findStructMethod(staticCls, method) ?? (virtual && byPlace ? findStructMethod(target.cls!, method) : null);
        if (!found) throw new CompileError(lineOf(n), `${staticCls} has no method called ${method}.`);
        this.checkMethodAccess(found.owner, method, n);
        // d.nextId() on a static method: it still runs without the object.
        if (found.owner.staticMethods?.has(method)) return this.callFn(n, found.m, argNodes, null, `${found.owner.name}::${method}`, null, found.owner);
        const actual = byPlace && virtual ? findStructMethod(target.cls!, method)! : found;
        const label = objNode.type === 'identifier' ? `${objNode.text}${viaPointer ? '->' : '.'}${method}` : objNode.type === 'this' ? method : `${actual.owner.name}::${method}`;
        return this.callFn(n, actual.m, argNodes, target, label, null, actual.owner);
      }
      throw unsupported(n, `.${method}()`);
    }

    const name = f.text.replace(/^std::/, '');
    // A method of this struct, called inside another one (bark() instead of this->bark()): virtual ones use the object's own class.
    const self = this.scope.lookup('this')?.cell.v;
    const own = this.currentStruct ? findStructMethod(this.currentStruct.name, name) : null;
    // Dog::nextId() anywhere, or nextId() inside Dog's code: a static method runs without an object.
    const qualifiedSt = f.type === 'qualified_identifier' ? structs.get(f.childForFieldName('scope')?.text ?? '') : undefined;
    const staticName = qualifiedSt ? f.childForFieldName('name')!.text : name;
    const staticOwner = qualifiedSt ?? (own && !this.program.functions.has(name) ? this.currentStruct : undefined);
    const staticFound = staticOwner ? findStructMethod(staticOwner.name, staticName) : null;
    if (staticFound?.owner.staticMethods?.has(staticName)) {
      this.checkMethodAccess(staticFound.owner, staticName, n);
      return this.callFn(n, staticFound.m, argNodes, null, `${staticFound.owner.name}::${staticName}`, null, staticFound.owner);
    }
    if (own && (!self || self === UNSET) && !this.program.functions.has(name)) {
      throw new CompileError(lineOf(n), `${name}() belongs to each ${this.currentStruct!.name} object, so a static method can't call it on its own.`);
    }
    if (qualifiedSt && (!self || self === UNSET)) {
      if (findStructMethod(qualifiedSt.name, staticName)) throw new CompileError(lineOf(n), `${staticName}() is not static, so it needs an object: call it like d.${staticName}().`);
      throw new CompileError(lineOf(n), `${qualifiedSt.name} has no method called ${staticName}.`);
    }
    const virtual = !!this.currentStruct && isVirtualIn(this.currentStruct.name, name);
    if ((own || virtual) && self && self !== UNSET && !this.program.functions.has(name)) {
      const actual = virtual ? findStructMethod(self.cls!, name)! : own!;
      return this.callFn(n, actual.m, argNodes, self, name, null, actual.owner);
    }
    // Animal::speak() inside Dog's code: the base version, on this same object.
    if (f.type === 'qualified_identifier' && self && self !== UNSET && structs.has(f.childForFieldName('scope')?.text ?? '')) {
      const base = structs.get(f.childForFieldName('scope')!.text)!;
      const found = findStructMethod(base.name, f.childForFieldName('name')!.text);
      if (!found || !found.m.childForFieldName('body')) throw new CompileError(lineOf(n), `${base.name} has no method ${f.childForFieldName('name')!.text} with a body to call.`);
      return this.callFn(n, found.m, argNodes, self, f.text, null, found.owner);
    }
    // Dog("Rex", 3) as a value: a new object.
    if (structs.has(name) && dialect === 'cpp') return this.construct(n, structs.get(name)!, argNodes);
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
      case 'char':
      case 'int':
      case 'double':
      case 'long':
      case 'bool': {
        // char(66) / int(x) / double(n): a cast written like a call.
        const a = args();
        if (a.length !== 1) throw new CompileError(lineOf(n), `${name}(...) needs one value.`);
        return this.convert(a[0], { t: name as Prim }, n, `${name}(...)`);
      }
      case 'string': {
        // string("text") / string(3, 'x') ("xxx") / string() ("")
        if (dialect !== 'cpp') break;
        const a = args();
        if (a.length === 0) return strv('');
        if (a.length === 1 && a[0].t === 'string') return strv(a[0].v as string);
        if (a.length === 1 && a[0].t === 'char') throw new CompileError(lineOf(n), "string('a') does not work in C++: write string(1, 'a').");
        if (a.length === 2 && a[1].t === 'char') return strv((a[1].v as string).repeat(Math.max(0, this.num(a[0]))));
        throw unsupported(n, 'this kind of string(...)');
      }
      case 'toupper':
      case 'tolower': {
        // They give back an int: cout << toupper(c) prints a number, (char) toupper(c) the letter.
        const c = this.num(args()[0]);
        const ch = String.fromCharCode(c);
        return int(name === 'toupper' ? (/[a-z]/.test(ch) ? c - 32 : c) : /[A-Z]/.test(ch) ? c + 32 : c);
      }
      case 'isdigit':
      case 'isalpha':
      case 'isalnum':
      case 'isspace':
      case 'isupper':
      case 'islower':
      case 'ispunct': {
        // glibc's answers (what g++ on Linux prints): 0 for no, a bit of its table for yes.
        const c = this.num(args()[0]);
        const ch = c >= 0 && c < 128 ? String.fromCharCode(c) : '';
        const yes: Record<string, [RegExp, number]> = {
          isdigit: [/[0-9]/, 2048], isalpha: [/[A-Za-z]/, 1024], isalnum: [/[A-Za-z0-9]/, 8], isspace: [/[ \t\n\v\f\r]/, 8192],
          isupper: [/[A-Z]/, 256], islower: [/[a-z]/, 512], ispunct: [/[!-\/:-@[-`{-~]/, 4],
        };
        const [re, bit] = yes[name];
        return int(ch && re.test(ch) ? bit : 0);
      }
      case 'strcpy':
      case 'strcat':
      case 'strncpy': {
        // strcpy(dst, src) / strcat(dst, src): the letters go into the char array dst (it must have room).
        const [dst, src, count] = argNodes;
        const arr = this.eval(dst);
        if (arr.t !== 'array' || arr.elem !== 'char') throw new CompileError(lineOf(dst), `${dst.text} must be a char array to hold text.`);
        const items = arr.v as CVal[];
        let text = this.textOf(this.eval(src), n);
        if (name === 'strncpy') text = text.slice(0, this.num(this.eval(count)));
        const start = name === 'strcat' ? charText(items).length : 0;
        if (start + text.length + 1 > items.length) throw new CppCrash('IndexOutOfRange', `"${text}" does not fit in ${dst.text} (room for ${items.length - 1} letters)`);
        [...text, '\u0000'].forEach((c, j) => (items[start + j] = chr(c)));
        return VOID;
      }
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
        // libstdc++'s std::sort, step for step: a lambda or the program's operator< is called in g++'s order.
        const r = this.range(n, argNodes[0], argNodes[1]);
        if (r.whole.t === 'string') throw unsupported(n, 'sorting the letters of text');
        if (r.whole.elem?.startsWith('vector<') || r.whole.elem?.endsWith('[]')) throw unsupported(n, 'sorting a list of lists');
        if (r.items.slice(r.from, r.to).some((x) => x === UNSET_VAL)) throw new CppCrash('Uninitialized', 'sort read an item that has no value yet');
        const less = argNodes[2] ? this.comparator(argNodes[2], n) : (x: CVal, y: CVal) => this.lessThan(x, y, n);
        const part = r.items.slice(r.from, r.to);
        stdSort(part, less);
        r.items.splice(r.from, part.length, ...part);
        return VOID;
      }
      case 'make_pair': {
        const [a, b] = args();
        if (!a || !b || argNodes.length !== 2) throw new CompileError(lineOf(n), 'make_pair needs two values, like make_pair(1, "a").');
        // make_pair("a", 1): text written in quotes becomes a string.
        return this.makePair(a, b, a.t as Prim, b.t as Prim);
      }
      case 'reverse': {
        const r = this.range(n, argNodes[0], argNodes[1]);
        const part = r.items.slice(r.from, r.to).reverse();
        if (r.whole.t === 'string') {
          this.assignTo(r.owner, strv([...part, ...r.items.slice(r.to)].map((c) => c.v).join('')));
          return VOID;
        }
        r.items.splice(r.from, part.length, ...part);
        return VOID;
      }
      case 'accumulate': {
        // accumulate(v.begin(), v.end(), 0): the start value decides the type (0 int, 0LL long long, 0.0 double).
        const r = this.range(n, argNodes[0], argNodes[1]);
        if (!argNodes[2]) throw new CompileError(lineOf(n), 'accumulate needs a start value, like accumulate(v.begin(), v.end(), 0).');
        let total = this.eval(argNodes[2]);
        for (const x of r.items.slice(r.from, r.to)) total = this.arith('+', total, x, n);
        return total;
      }
      case 'count': {
        const r = this.range(n, argNodes[0], argNodes[1]);
        const want = this.eval(argNodes[2]);
        return lng(r.items.slice(r.from, r.to).filter((x) => !this.lessThan(x, want, n) && !this.lessThan(want, x, n)).length);
      }
      case 'max_element':
      case 'min_element':
      case 'find': {
        // A place in the list: *max_element(...) is the item, max_element(...) - v.begin() its position.
        const r = this.range(n, argNodes[0], argNodes[1]);
        if (r.whole.t === 'string') throw unsupported(n, `${name} on text (use s.find)`);
        const items = r.items;
        let at = r.from;
        if (name === 'find') {
          const want = this.eval(argNodes[2]);
          while (at < r.to && (this.lessThan(items[at], want, n) || this.lessThan(want, items[at], n))) at++;
        } else if (r.to > r.from) {
          // libstdc++: the first largest (max) / first smallest (min).
          for (let i = r.from + 1; i < r.to; i++) {
            if (name === 'max_element' ? this.lessThan(items[at], items[i], n) : this.lessThan(items[i], items[at], n)) at = i;
          }
        } else at = r.to;
        const b = r.owner.type === 'identifier' ? this.scope.lookup(r.owner.text) : undefined;
        return { t: 'pointer', pt: this.itemType(r.whole.elem), v: itemPointer(items, at, r.owner.text, this.rt.stack[this.rt.stack.length - 1].label, b?.cell ?? null) };
      }
      case 'to_string': {
        const v = args()[0];
        return strv(isReal(v.t) ? cFixed(v.v as number, 6) : v.t === 'long' ? String(v.v) : String(this.num(v)));
      }
      case 'stoi': {
        const s = args()[0];
        const m = /^\s*([+-]?\d+)/.exec(String(s.v));
        if (!m) throw libraryException('invalid_argument', `"${s.v}" is not a whole number`, 'stoi');
        return int(Number(m[1]));
      }
      case 'stol':
      case 'stoll': {
        const s = args()[0];
        const m = /^\s*([+-]?\d+)/.exec(String(s.v));
        if (!m) throw libraryException('invalid_argument', `"${s.v}" is not a whole number`, name);
        return lng(BigInt(m[1]));
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
        const exact = a.t === 'long' && b.t === 'long';
        const [x, y] = exact ? [this.big(a), this.big(b)] : [this.num(a), this.num(b)];
        const pick = name === 'max' ? x >= y : x <= y;
        return pick ? a : b;
      }
      case 'abs': {
        const a = args()[0];
        if (a.t === 'long') {
          const x = this.big(a);
          return lng(x < 0n ? -x : x);
        }
        if (a.t === 'float') return flt(Math.abs(a.v as number));
        return a.t === 'double' ? dbl(Math.abs(a.v as number)) : int(Math.abs(this.num(a)));
      }
      case 'round': {
        // C's round: halves go away from zero (round(-2.5) is -3).
        const x = this.num(args()[0]);
        return dbl(x < 0 ? -Math.round(-x) : Math.round(x));
      }
      case 'sqrt':
      case 'floor':
      case 'ceil':
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
          text = v.t === 'long' ? String(v.v) : String(this.num(v));
          if (flags.includes('+') && this.num(v) >= 0) text = `+${text}`;
          break;
        case 'f':
        case 'F':
        case 'e':
        case 'E':
        case 'g':
        case 'G': {
          if (!isReal(v.t)) throw bad(conv, v); // a float is passed to printf as a double
          const x = v.v as number;
          const p = prec === undefined ? 6 : Number(prec);
          if (conv === 'f' || conv === 'F') text = cFixed(x, p);
          else if (conv === 'g' || conv === 'G') text = cGeneral(x, p);
          else text = cExp(x, p);
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
        // scanf("%s", name) / ("%s", names[2]) / ("%s", s.name): a char array.
        if (!['identifier', 'subscript_expression', 'field_expression'].includes(target.type)) throw unsupported(target, 'scanf %s into this');
        const arr = target.type === 'identifier' ? this.scope.lookup(target.text)?.cell.v : this.eval(target);
        if (!arr || arr === UNSET || arr.t !== 'array' || arr.elem !== 'char') {
          throw new CompileError(lineOf(target), `${target.text} must be a char array to hold text.`);
        }
        const items = arr.v as CVal[];
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
        value = wholeFrom(this.input.word());
      }
      this.assignTo(place, value);
    });
    return int(convs.length);
  }

  private stringMethod(n: Node, s: CVal, method: string, a: CVal[], objNode?: Node): CVal {
    const text = s.v as string;
    const textArg = (v: CVal | undefined) => {
      if (!v || (v.t !== 'string' && v.t !== 'char')) throw new CompileError(lineOf(n), `${method} needs text or a char here.`);
      return String(v.v);
    };
    const pos = (v: CVal | undefined, what = 'position') => {
      const i = this.num(v!);
      if (i < 0 || i > text.length) {
        throw libraryException('out_of_range', `${what} ${i} is outside a text of length ${text.length}`, `basic_string::${method}: __pos (which is ${i}) > this->size() (which is ${text.length})`);
      }
      return i;
    };
    // Changing the text in place: s.insert(...), s.erase(...), s.append(...), s.push_back(c)...
    const store = (next: string): CVal => {
      if (!objNode) throw unsupported(n, `string.${method}() here`);
      this.assignTo(objNode, strv(next));
      return VOID;
    };
    switch (method) {
      case 'find':
      case 'rfind': {
        // Not found: string::npos.
        const what = textArg(a[0]);
        const from = a[1] ? this.num(a[1]) : method === 'find' ? 0 : text.length;
        const i = method === 'find' ? (from > text.length ? -1 : text.indexOf(what, from)) : text.lastIndexOf(what, from);
        return i < 0 ? NPOS : lng(i);
      }
      case 'insert':
        if (a.length !== 2) break;
        {
          const i = pos(a[0]);
          return store(text.slice(0, i) + textArg(a[1]) + text.slice(i));
        }
      case 'erase': {
        const i = a.length ? pos(a[0]) : 0;
        const len = a.length > 1 ? this.num(a[1]) : text.length;
        return store(text.slice(0, i) + text.slice(i + Math.max(0, len)));
      }
      case 'replace': {
        if (a.length !== 3) break;
        const i = pos(a[0]);
        return store(text.slice(0, i) + textArg(a[2]) + text.slice(i + Math.max(0, this.num(a[1]))));
      }
      case 'append':
        if (a.length !== 1) break;
        return store(text + textArg(a[0]));
      case 'push_back':
        if (a[0]?.t !== 'char') throw new CompileError(lineOf(n), 'push_back on text needs a char, like s.push_back(\'a\').');
        return store(text + String(a[0].v));
      case 'pop_back':
        if (!text.length) throw new CppCrash('IndexOutOfRange', 'pop_back on empty text');
        return store(text.slice(0, -1));
      case 'clear':
        return store('');
    }
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

  private makePair(first: CVal, second: CVal, kt?: Prim, elem?: Prim): CVal {
    return { t: 'struct', cls: 'pair', kt, elem, v: new Map([['first', this.copy(first)], ['second', this.copy(second)]]) };
  }

  /** A pair from {1, "a"}, (1, "a"), make_pair(1, "a") or another pair. */
  private pairFrom(n: Node, type: DeclType, at: Node, name: string): CVal {
    if (n.type === 'initializer_list' || n.type === 'argument_list') return this.pairFromValues(named(n), type, at, name);
    return this.convert(this.eval(n), type, at, name);
  }
  private pairFromValues(parts: Node[], type: DeclType, at: Node, name: string): CVal {
    if (parts.length !== 2) throw new CompileError(lineOf(at), `A pair has two parts (first and second), not ${parts.length}.`);
    const [a, b] = parts.map((p) => this.eval(p));
    return this.convert(this.makePair(a, b), type, at, name);
  }

  /** stack (top is the end), queue (front is position 0) and priority_queue (libstdc++'s heap, top first). */
  private containerMethod(n: Node, objNode: Node, c: CVal, method: string, a: CVal[]): CVal {
    const items = c.v as CVal[];
    const kind = c.coll === 'stack' ? 'stack' : c.coll === 'queue' ? 'queue' : 'priority_queue';
    const less = c.coll === 'pqmin' ? (x: CVal, y: CVal) => this.lessThan(y, x, n) : (x: CVal, y: CVal) => this.lessThan(x, y, n);
    const empty = () => new CppCrash(c.coll === 'stack' ? 'EmptyStack' : 'EmptyContainer', `${method}() on an empty ${kind}`);
    const count = (k: number) => {
      if (a.length !== k) throw new CompileError(lineOf(n), `${objNode.text}.${method}() needs ${k} value${k === 1 ? '' : 's'} here.`);
    };
    switch (method) {
      case 'push': {
        count(1);
        const x = this.copy(this.convert(a[0], this.itemType(c.elem), n, objNode.text));
        if (c.coll === 'pq' || c.coll === 'pqmin') heapPush(items, x, less);
        else items.push(x);
        return VOID;
      }
      case 'pop':
        count(0);
        if (!items.length) throw empty();
        if (c.coll === 'stack') items.pop();
        else if (c.coll === 'queue') items.shift();
        else heapPop(items, less);
        return VOID;
      case 'top':
        count(0);
        if (c.coll === 'queue') throw new CompileError(lineOf(n), 'A queue has no top(): use front() for the next item and back() for the last one.');
        if (!items.length) throw empty();
        return c.coll === 'stack' ? items[items.length - 1] : items[0];
      case 'front':
      case 'back':
        count(0);
        if (c.coll !== 'queue') throw new CompileError(lineOf(n), `A ${kind} has no ${method}(): use top().`);
        if (!items.length) throw empty();
        return items[method === 'front' ? 0 : items.length - 1];
      case 'size':
        return lng(items.length);
      case 'empty':
        return bool(items.length === 0);
    }
    throw new CompileError(lineOf(n), `A ${kind} has no ${method}(): it only has push, pop, ${c.coll === 'queue' ? 'front, back' : 'top'}, size and empty.`);
  }

  /** a < b like C++: numbers, text by character codes, structs with the program's operator<. */
  private lessThan(a: CVal, b: CVal, at: Node): boolean {
    if ((a.t === 'vector' || a.t === 'array') && (b.t === 'vector' || b.t === 'array')) {
      // Vectors compare item by item, like words in a dictionary (a shorter one that matches so far comes first).
      const [x, y] = [a.v as CVal[], b.v as CVal[]];
      for (let i = 0; i < Math.min(x.length, y.length); i++) {
        if (this.lessThan(x[i], y[i], at)) return true;
        if (this.lessThan(y[i], x[i], at)) return false;
      }
      return x.length < y.length;
    }
    if (a.cls === 'pair' && b.cls === 'pair' && a.t === 'struct' && b.t === 'struct') {
      // pair: first decides; when the firsts are equal, second decides (like C++).
      const [x, y] = [a.v as Map<string, CVal>, b.v as Map<string, CVal>];
      if (this.lessThan(x.get('first')!, y.get('first')!, at)) return true;
      if (this.lessThan(y.get('first')!, x.get('first')!, at)) return false;
      return this.lessThan(x.get('second')!, y.get('second')!, at);
    }
    if (a.t === 'struct' || b.t === 'struct') {
      const r = this.callOperator('<', a, b, null, at);
      if (!r) throw new CompileError(lineOf(at), `C++ can't put ${a.cls} values in order by itself: write bool operator<.`);
      return this.truthy(r);
    }
    if (a.t === 'string' || b.t === 'string') return String(a.v) < String(b.v);
    if (a.t === 'long' || b.t === 'long') return this.big(a) < this.big(b);
    return this.num(a) < this.num(b);
  }

  /** A comparing rule given to sort: a lambda (or a variable holding one), greater<T>() or less<T>(). */
  private comparator(node: Node, at: Node): Less {
    const text = node.text.replace(/\s+/g, '');
    if (/^(std::)?greater<[^>]*>\(\)$/.test(text)) return (x, y) => this.lessThan(y, x, at);
    if (/^(std::)?less<[^>]*>\(\)$/.test(text)) return (x, y) => this.lessThan(x, y, at);
    const f = this.eval(node);
    if (f.t !== 'func') throw new CompileError(lineOf(node), 'sort needs a lambda here, like [](int a, int b) { return a > b; }.');
    return (x, y) => {
      const r = this.callLambda(f.v as CFunc, [x, y], at);
      if (!NUMERIC.has(r.t)) throw new CompileError(lineOf(node), 'A comparing lambda must give back true or false.');
      return this.truthy(r);
    };
  }

  /** Run a lambda in its own small frame "lambda(...)" (it can still read the variables around it). */
  private callLambda(f: CFunc, values: CVal[], at: Node): CVal {
    const node = f.node;
    const params = named(node.childForFieldName('declarator')?.childForFieldName('parameters') ?? null).filter((p) => p.type === 'parameter_declaration');
    if (params.length !== values.length) throw new CompileError(lineOf(node), `This lambda takes ${params.length} value${params.length === 1 ? '' : 's'}, but here it gets ${values.length}.`);
    const scope = new Scope(f.scope as Scope, true);
    const names: string[] = [];
    params.forEach((p, i) => {
      const decl = p.childForFieldName('declarator');
      const name = decl ? declaratorInfo(decl).name : `arg${i}`;
      const type = typeOf(p.childForFieldName('type'));
      scope.vars.set(name, { cell: { ...type, v: type.t === 'auto' ? this.copy(values[i]) : this.copy(this.convert(values[i], type, at, name)) } });
      names.push(name);
    });
    const saved = this.scope;
    this.scope = scope;
    const shown = names.map((nm) => formatCpp(scope.vars.get(nm)!.cell.v) ?? '?');
    this.rt.hooks.enter('lambda', this.namesId(names), this.getters(names), 0, `lambda(${shown.join(', ')})`);
    try {
      this.execBody(node.childForFieldName('body')!, []);
      return VOID;
    } catch (e) {
      if (e instanceof ReturnSignal) {
        this.rt.hooks.ret(e.line, e.value);
        return e.value;
      }
      this.rt.hooks.thrown(e);
      throw e;
    } finally {
      const top = this.rt.stack[this.rt.stack.length - 1];
      if (top.pending === null) top.pending = lineOf(node);
      this.rt.hooks.leave();
      this.scope = saved;
    }
  }

  /**
   * The items an algorithm works on: (v.begin(), v.end()), (v.begin(), v.begin() + k),
   * (a, a + n) for an array, or (s.begin(), s.end()) for text.
   */
  private range(n: Node, first: Node | undefined, last: Node | undefined): { items: CVal[]; from: number; to: number; whole: CVal; owner: Node } {
    const ownerOf = (x: Node | undefined, end: 'begin' | 'end'): Node | null => {
      if (x?.type === 'call_expression' && x.childForFieldName('function')?.type === 'field_expression' && x.childForFieldName('function')?.childForFieldName('field')?.text === end) {
        return x.childForFieldName('function')!.childForFieldName('argument');
      }
      return null;
    };
    const plus = (x: Node | undefined): { base: Node; k: Node } | null =>
      x?.type === 'binary_expression' && x.childForFieldName('operator')?.type === '+' ? { base: x.childForFieldName('left')!, k: x.childForFieldName('right')! } : null;
    let owner = ownerOf(first, 'begin');
    let to: number | null = null;
    if (owner && ownerOf(last, 'end')?.text === owner.text) to = -1;
    else if (owner && plus(last) && ownerOf(plus(last)!.base, 'begin')?.text === owner.text) to = this.num(this.eval(plus(last)!.k));
    else if (first?.type === 'identifier' && plus(last)?.base.text === first.text) {
      owner = first;
      to = this.num(this.eval(plus(last)!.k));
    }
    if (!owner || to === null) throw unsupported(n, 'this range (use v.begin(), v.end())');
    const whole = this.eval(owner);
    if (whole.t === 'string') {
      const items = [...(whole.v as string)].map(chr);
      return { items, from: 0, to: to < 0 ? items.length : to, whole, owner };
    }
    if (whole.t !== 'vector' && whole.t !== 'array') throw new CompileError(lineOf(owner), `${owner.text} is not a list.`);
    const items = whole.v as CVal[];
    const end = to < 0 ? items.length : to;
    if (end < 0 || end > items.length) throw new CppCrash('IndexOutOfRange', `the range ends outside ${owner.text}`);
    return { items, from: 0, to: end, whole, owner };
  }

  private vectorMethod(n: Node, objNode: Node, vec: CVal, method: string, argNodes: Node[]): CVal {
    const items = vec.v as CVal[];
    const args = () => argNodes.map((a) => this.eval(a));
    if (vec.coll) return this.containerMethod(n, objNode, vec, method, args());
    switch (method) {
      case 'begin':
      case 'end': {
        // v.begin() / v.end(): a place in the list (max_element(...) - v.begin() is a position).
        const b = objNode.type === 'identifier' ? this.scope.lookup(objNode.text) : undefined;
        const frame = this.rt.stack[this.rt.stack.length - 1].label;
        return { t: 'pointer', pt: this.itemType(vec.elem), v: itemPointer(items, method === 'begin' ? 0 : items.length, objNode.text, frame, b?.cell ?? null) };
      }
      case 'push_back':
        if (isPairItem(vec.elem)) items.push(this.pairFrom(argNodes[0], this.itemType(vec.elem), n, objNode.text));
        else if (isStructItem(vec.elem)) items.push(this.structFrom(argNodes[0], structs.get(vec.elem!)!, objNode.text));
        else if (vec.elem?.startsWith('vector<') && argNodes[0]?.type === 'initializer_list') {
          const inner = vec.elem.slice(7, -1) as Prim;
          items.push({ t: 'vector', elem: inner, v: this.vectorFrom(argNodes[0], inner) });
        } else items.push(this.copy(this.convert(args()[0], this.itemType(vec.elem), n, objNode.text)));
        return VOID;
      case 'resize': {
        const [size, fill] = args();
        const k = this.num(size);
        if (k < 0) throw new CppCrash('IndexOutOfRange', `a vector can't have ${k} items`);
        const item = fill ? this.convert(fill, this.itemType(vec.elem), n, objNode.text) : this.emptyItem(vec.elem ?? 'int');
        while (items.length < k) items.push(this.copy(item));
        items.length = k;
        return VOID;
      }
      case 'insert':
      case 'erase': {
        // v.insert(v.begin() + 1, x) / v.erase(v.begin() + 2) / v.erase(v.begin(), v.begin() + 2)
        const place = (v: CVal | undefined) => {
          const t = v?.t === 'pointer' ? (v.v as PtrTarget | null) : null;
          if (!t || t.arr !== items) throw unsupported(n, `vector.${method}() without a place like ${objNode.text}.begin() + 1`);
          if (t.index! < 0 || t.index! > items.length) throw new CppCrash('IndexOutOfRange', `the place is outside ${objNode.text}`);
          return t.index!;
        };
        const [first, second] = argNodes.map((x) => this.eval(x));
        const at = place(first);
        if (method === 'insert') {
          if (argNodes.length !== 2) throw unsupported(n, 'this kind of vector.insert()');
          items.splice(at, 0, this.copy(this.convert(second, this.itemType(vec.elem), n, objNode.text)));
          return VOID;
        }
        const end = second ? place(second) : at + 1;
        if (end > items.length || at >= items.length) throw new CppCrash('IndexOutOfRange', `erase outside ${objNode.text}`);
        items.splice(at, end - at);
        return VOID;
      }
      case 'emplace_back':
        if (isPairItem(vec.elem)) {
          // v.emplace_back(1, "a"): a pair made from the two values.
          items.push(this.pairFromValues(argNodes, this.itemType(vec.elem), n, objNode.text));
          return VOID;
        }
        if (!isStructItem(vec.elem)) throw unsupported(n, 'vector.emplace_back() here');
        items.push(this.construct(n, structs.get(vec.elem!)!, argNodes));
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

/** What a quiet run (Practice tests) gives back: how it ended, what it printed, and the global variables. */
export interface QuietCppRun {
  status: 'ok' | 'compile-error' | 'runtime-error' | 'timeout' | 'too-deep';
  output: string;
  error?: { line: number | null; type: string; message: string };
  value: (name: string) => CVal | undefined;
}

/** Practice tests: run a C++ (or C) program without recording steps (only the time limit applies). */
export function runCppQuiet(tree: Tree, opts: { maxSeconds: number; dialect?: Dialect; beforeRun?: () => void }): QuietCppRun {
  const none = () => undefined;
  const problem = checkCpp(tree, opts.dialect ?? 'cpp');
  if (problem) return { status: 'compile-error', output: '', error: { line: problem.line, type: 'CompileError', message: problem.message }, value: none };
  const program = checkSubset(tree);
  const interp = new Interp(program, { candidates: [], loopOf: {} } as unknown as ListPlan, { maxSteps: Infinity, maxSeconds: opts.maxSeconds, quiet: true, dialect: opts.dialect ?? 'cpp' } as RunOptions & { dialect: Dialect });
  const rt = interp.rt;
  const value = (name: string) => interp.globalValue(name);
  opts.beforeRun?.();
  try {
    try {
      interp.run();
    } catch (e) {
      rt.hooks.thrown(e);
      throw e;
    }
  } catch (e) {
    if (e instanceof CompileError) return { status: 'compile-error', output: rt.output, error: { line: e.line, type: 'CompileError', message: e.message }, value };
    if (e instanceof StopRun) return { status: e.reason === 'depth' ? 'too-deep' : 'timeout', output: rt.output, value };
    if (e instanceof RangeError && /call stack/i.test(e.message)) return { status: 'too-deep', output: rt.output, value };
    if (e instanceof CppCrash) {
      const crash = recordCrash(rt, e.kind, e.message);
      return { status: 'runtime-error', output: rt.output, error: { line: crash.line, type: e.kind, message: e.message }, value };
    }
    throw e;
  }
  return { status: 'ok', output: rt.output, value };
}

