// Runtime for instrumented JavaScript (see instrument.ts). Records steps in the
// same shape and with the same rules as the Python tracer (tracer.py):
// steps show the state after a line has run; a call shows the caller's line
// with the new frame "running"; a return shows the frame "returning"; a crash
// ends with an "error" step in the frame where it happened; a swap is shown
// before it runs. Pure TypeScript: runs in the worker and in Node tests.
import type { RawRunResult, RawStep } from '../protocol';
import type { ListView } from '../../trace/types';
import { instrument, type JsListPlan, type StepInfo } from './instrument';

const MAX_REPR = 40;
const MAX_DEPTH = 200;

/** Thrown to stop the program at a cap. Not an Error, so `catch (e)` handlers
 *  that inspect errors are less likely to treat it as one; hooks rethrow it. */
class StopRun {
  constructor(public reason: 'steps' | 'time' | 'depth') {}
}

type Getter = () => unknown;
type Reads = [string, Getter][] | null;
type Swap = [string, Getter, Getter] | null;

interface Frame {
  label: string;
  names: string[];
  getters: Getter[];
  pending: number | null;
  pendingReads: Reads;
  pendingInfo: StepInfo | null;
  /** header lines of loops that have started in this frame */
  activeLoops: Set<number>;
  raised: boolean;
  returned: boolean;
}

type StepKind = NonNullable<RawStep['kind']>;
type StepDetail = NonNullable<RawStep['detail']>;

const inRange = (line: number | null, r?: [number, number]) => line !== null && !!r && r[0] <= line && line <= r[1];

/** Kind of the line that just finished, given the line that runs next (same rules as tracer.py). */
function classify(info: StepInfo | null, line: number, next: number | null, active: Set<number>): { kind: StepKind; detail?: StepDetail } {
  if (!info) return { kind: 'other' };
  const detail: StepDetail = {};
  let kind: StepKind;
  switch (info.k) {
    case 'branch': {
      const taken = inRange(next, info.b);
      kind = taken ? 'branch-taken' : 'branch-skipped';
      if (info.c) detail.condition = info.c;
      if (!taken && inRange(next, info.e)) detail.toElse = true;
      break;
    }
    case 'loop':
      if (inRange(next, info.b)) {
        kind = active.has(line) ? 'loop-next' : 'loop-start';
        active.add(line);
      } else {
        kind = 'loop-end';
        active.delete(line);
      }
      if (info.v) detail.loopVar = info.v;
      if (info.c) detail.condition = info.c;
      break;
    case 'define':
    case 'assign':
      kind = info.k;
      if (info.t?.length) detail.targets = info.t;
      if (info.s) detail.simultaneous = true;
      break;
    case 'print':
    case 'swap':
      kind = info.k;
      break;
    default:
      kind = 'other';
  }
  return Object.keys(detail).length ? { kind, detail } : { kind };
}

// --------------------------------------------------------------------------
// Values as short text

const HIDDEN = (name: string) => name.startsWith('_');
// Kept before the worker's lockdown removes the global Function.
const fnToString = Function.prototype.toString;

function isClass(v: unknown): boolean {
  return typeof v === 'function' && /^class[\s{]/.test(fnToString.call(v));
}

export function formatValue(v: unknown, depth = 0): string {
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number') return Object.is(v, -0) ? '0' : String(v);
  if (typeof v === 'bigint') return `${v}n`;
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'boolean' || typeof v === 'symbol') return String(v);
  if (typeof v === 'function') return isClass(v) ? 'class' : 'function';
  if (depth > 2) return Array.isArray(v) ? '[…]' : '{…}';
  if (Array.isArray(v)) return `[${v.slice(0, 50).map((x) => formatValue(x, depth + 1)).join(', ')}${v.length > 50 ? ', …' : ''}]`;
  if (v instanceof Map) return `Map(${v.size})`;
  if (v instanceof Set) return `Set(${v.size})`;
  if (v instanceof Date) return isNaN(v.getTime()) ? 'Invalid Date' : v.toISOString();
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  const obj = v as Record<string, unknown>;
  const ctor = Object.getPrototypeOf(obj)?.constructor;
  const prefix = ctor && ctor !== Object && ctor.name ? `${ctor.name} ` : '';
  const entries = Object.keys(obj)
    .slice(0, 20)
    .map((k) => `${k}: ${formatValue(obj[k], depth + 1)}`);
  return `${prefix}{${entries.join(', ')}}`;
}

function short(v: unknown): string {
  let text: string;
  try {
    text = formatValue(v);
  } catch {
    text = '?';
  }
  return text.length > MAX_REPR ? `${text.slice(0, MAX_REPR - 1)}…` : text;
}

/** console.log formatting: strings as they are, other values as short text. */
function logText(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === 'string') return a;
      try {
        const t = formatValue(a);
        return t.length > 1000 ? `${t.slice(0, 999)}…` : t;
      } catch {
        return '?';
      }
    })
    .join(' ');
}

// --------------------------------------------------------------------------

export interface RunOptions {
  maxSteps: number;
  maxSeconds: number;
  now?: () => number;
  /** Called after the program is compiled and before it runs (the worker locks down here). */
  beforeRun?: () => void;
}

class Runtime {
  steps: (RawStep & { _lists?: Record<string, string[]>; _looks?: Record<string, number[]>; _swap?: { list: string; pair: [number, number] } })[] = [];
  stack: Frame[];
  output = '';
  crash: RawStep | null = null;
  crashExc: unknown = undefined;
  hasCrash = false;
  private deadline: number;
  private now: () => number;

  constructor(
    private nameSets: string[][],
    private plan: JsListPlan,
    private opts: RunOptions,
  ) {
    this.now = opts.now ?? (() => performance.now());
    this.deadline = this.now() + opts.maxSeconds * 1000;
    this.stack = [this.newFrame('Global', -1, [])];
  }

  private newFrame(label: string, namesId: number, getters: Getter[]): Frame {
    return {
      label,
      names: this.nameSets[namesId] ?? [],
      getters,
      pending: null,
      pendingReads: null,
      pendingInfo: null,
      activeLoops: new Set(),
      raised: false,
      returned: false,
    };
  }

  private checkTime() {
    if (this.now() > this.deadline) throw new StopRun('time');
  }

  private read(frame: Frame, k: number): { ok: true; value: unknown } | { ok: false } {
    try {
      return { ok: true, value: frame.getters[k]() };
    } catch {
      return { ok: false };
    }
  }

  private varsOf(frame: Frame): Record<string, string> {
    const out: Record<string, string> = {};
    frame.names.forEach((name, k) => {
      if (HIDDEN(name)) return;
      const r = this.read(frame, k);
      out[name] = r.ok ? short(r.value) : '?';
    });
    return out;
  }

  /** The array called `name` in the newest frame that can see it. */
  private findArray(name: string): unknown[] | null {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const f = this.stack[i];
      const k = f.names.indexOf(name);
      if (k < 0) continue;
      const r = this.read(f, k);
      return r.ok && Array.isArray(r.value) ? r.value : null;
    }
    return null;
  }

  private evalIndex(get: Getter, length: number): number | null {
    let i: unknown;
    try {
      i = get();
    } catch {
      return null;
    }
    if (typeof i !== 'number' || !Number.isInteger(i)) return null;
    return i >= 0 && i < length ? i : null;
  }

  private snapshot(
    line: number,
    opts: { returning?: unknown; isReturn?: boolean; error?: boolean; reads?: Reads; kind?: StepKind; detail?: StepDetail } = {},
  ) {
    const top = this.stack.length - 1;
    const frames = this.stack.map((f, i) => {
      let status: RawStep['frames'][number]['status'] = 'running';
      if (i < top) status = 'waiting';
      else if (opts.error) status = 'error';
      else if (opts.isReturn) status = 'returning';
      const entry: RawStep['frames'][number] = { name: f.label, vars: this.varsOf(f), status };
      if (i === top && opts.isReturn && !opts.error) entry.returns = `returns ${short(opts.returning)}`;
      return entry;
    });
    const step: Runtime['steps'][number] = { line, frames, output: this.output, kind: opts.kind ?? 'other' };
    if (opts.detail) step.detail = opts.detail;
    if (this.plan.candidates.length) {
      const lists: Record<string, string[]> = {};
      const looks: Record<string, number[]> = {};
      for (const name of this.plan.candidates) {
        const a = this.findArray(name);
        if (!a) continue;
        lists[name] = a.map(short);
        for (const [ref, get] of opts.reads ?? []) {
          if (ref !== name) continue;
          const i = this.evalIndex(get, a.length);
          if (i !== null && !(looks[name] ??= []).includes(i)) looks[name].push(i);
        }
      }
      step._lists = lists;
      step._looks = looks;
    }
    return step;
  }

  private record(line: number, opts: Parameters<Runtime['snapshot']>[1] = {}) {
    if (this.steps.length >= this.opts.maxSteps) throw new StopRun('steps');
    const step = this.snapshot(line, opts);
    this.steps.push(step);
    return step;
  }

  /** Record the pending line of a frame; `next` is the line that runs next. */
  private recordPending(frame: Frame, next: number | null) {
    if (frame.pending === null) return;
    const { kind, detail } = classify(frame.pendingInfo, frame.pending, next, frame.activeLoops);
    this.record(frame.pending, { reads: frame.pendingReads, kind, detail });
  }

  // ---- hooks called by the instrumented program ----------------------------

  hooks = {
    l: (line: number, namesId: number, getters: Getter[], reads: Reads, swap: Swap, info: StepInfo) => {
      this.checkTime();
      this.hasCrash = false; // the program carried on, so any error was caught
      this.crash = null;
      const top = this.stack[this.stack.length - 1];
      // The previous line in this frame has finished: record it with the
      // variables it could see, before switching to this statement's.
      this.recordPending(top, line);
      top.names = this.nameSets[namesId];
      top.getters = getters;
      top.pending = line;
      top.pendingReads = reads;
      top.pendingInfo = info;
      top.raised = false;
      if (swap) {
        const [name, getA, getB] = swap;
        const a = this.findArray(name);
        const i = a ? this.evalIndex(getA, a.length) : null;
        const j = a ? this.evalIndex(getB, a.length) : null;
        if (i !== null && j !== null) {
          // A swap is shown before it runs: the old list and an arrow.
          const step = this.record(line, { reads, kind: 'swap' });
          step._swap = { list: name, pair: [i, j] };
          top.pending = null;
        }
      }
    },
    /** End of a loop body: record its last line before the loop's update (i++) runs. */
    f: () => {
      const top = this.stack[this.stack.length - 1];
      if (!top.raised) this.recordPending(top, null);
      top.pending = null;
    },
    /** After a loop: record its loop-end step, in the scope around the loop. */
    x: (line: number, namesId: number, getters: Getter[], info: StepInfo) => {
      this.checkTime();
      const top = this.stack[this.stack.length - 1];
      this.recordPending(top, line); // a loop that never ran a round
      top.names = this.nameSets[namesId];
      top.getters = getters;
      top.pending = null;
      top.activeLoops.delete(line);
      const { kind, detail } = classify(info, line, null, top.activeLoops);
      this.record(line, { kind, detail });
    },
    enter: (name: string, namesId: number, getters: Getter[]) => {
      this.checkTime();
      if (this.stack.length >= MAX_DEPTH) throw new StopRun('depth');
      const caller = this.stack[this.stack.length - 1];
      const values = getters.map((g) => {
        try {
          return short(g());
        } catch {
          return '?';
        }
      });
      this.stack.push(this.newFrame(`${name}(${values.join(', ')})`, namesId, getters));
      this.record(caller.pending ?? 1, { kind: 'call' });
    },
    ret: <T,>(line: number, value: T): T => {
      const top = this.stack[this.stack.length - 1];
      if (!top.raised) this.record(line, { returning: value, isReturn: true, kind: 'return' });
      top.returned = true;
      return value;
    },
    thrown: (e: unknown) => {
      if (e instanceof StopRun) return;
      const top = this.stack[this.stack.length - 1];
      top.raised = true;
      if (!this.hasCrash || this.crashExc !== e) {
        this.crash = this.snapshot(top.pending ?? 1, { error: true, kind: 'crash' });
        this.crashExc = e;
        this.hasCrash = true;
      }
    },
    leave: () => {
      const top = this.stack[this.stack.length - 1];
      try {
        if (!top.returned && !top.raised) this.record(top.pending ?? 1, { returning: undefined, isReturn: true, kind: 'return' });
      } finally {
        this.stack.pop();
      }
    },
  };

  console = {
    log: (...args: unknown[]) => {
      this.output += `${logText(args)}\n`;
    },
  };

  /** The last line of the program has finished. */
  finish() {
    const g = this.stack[0];
    if (!g.raised) this.recordPending(g, null);
  }
}

// --------------------------------------------------------------------------

/** Names the program must not reach. Passed as undefined parameters. */
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
  // eval cannot be a parameter name in strict mode; the worker removes it instead.
  'Function',
  'setTimeout',
  'setInterval',
  'queueMicrotask',
  'onmessage',
  'require',
  'process',
];

function chooseListView(plan: JsListPlan, steps: Runtime['steps']): ListView | undefined {
  for (const name of plan.candidates) {
    const loop = plan.loopOf[name];
    if (!loop) continue;
    let prev: string[] | undefined;
    for (const step of steps) {
      const values = step._lists?.[name];
      if (values && prev && values.join('\u0000') !== prev.join('\u0000') && step.line >= loop.outerLine && step.line <= loop.outerEndLine) {
        return { list: name, outerLine: loop.outerLine, outerEndLine: loop.outerEndLine, loopVars: loop.loopVars };
      }
      if (values) prev = values;
    }
  }
  return undefined;
}

/** Instrument, run and record a JavaScript program. */
export function runJs(source: string, opts: RunOptions): RawRunResult {
  const inst = instrument(source);
  if ('error' in inst) return { status: 'syntax-error', steps: [], error: { line: inst.error.line, message: inst.error.message } };

  const rt = new Runtime(inst.names, inst.plan, opts);
  let status: RawRunResult['status'] = 'ok';
  let error: RawRunResult['error'] = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const program = new Function('__sv', 'console', ...SHADOWED, `"use strict";\n${inst.code}`);
    opts.beforeRun?.();
    program(rt.hooks, rt.console);
    rt.finish();
  } catch (e) {
    if (e instanceof StopRun || (e instanceof RangeError && /call stack/i.test(e.message))) {
      status = 'cap';
    } else {
      status = 'runtime-error';
      const err = e instanceof Error ? e : null;
      const crash = rt.crash;
      error = {
        line: crash?.line ?? null,
        type: err?.name ?? 'Error',
        message: err ? err.message : short(e),
      };
      if (crash && rt.steps.length) {
        crash.output = rt.output;
        crash.error = { type: error.type!, message: error.message };
        rt.steps.push(crash);
      }
    }
  }

  const listView = chooseListView(inst.plan, rt.steps);
  const steps: RawStep[] = rt.steps.map((s) => {
    const { _lists, _looks, _swap, ...step } = s as Runtime['steps'][number];
    if (listView && _lists && _lists[listView.list]) {
      const entry: NonNullable<RawStep['list']> = { values: _lists[listView.list] };
      const look = _looks?.[listView.list];
      if (look?.length) entry.compare = look;
      if (_swap && _swap.list === listView.list) {
        entry.swap = _swap.pair;
        entry.compare = _swap.pair;
      }
      step.list = entry;
    }
    return step;
  });
  return { status, steps, error, ...(listView ? { listView } : {}) };
}
