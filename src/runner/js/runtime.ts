// JavaScript runner: instruments the program (instrument.ts) and runs it with
// the shared step recorder (../recorder.ts). Pure TypeScript: runs in the
// worker and in Node tests.
import type { RawRunResult } from '../protocol';
import { finishRun, recordCrash, Recorder, short, StopRun, type RunOptions } from '../recorder';
import { instrument } from './instrument';

export { formatValue } from '../recorder';
export type { RunOptions } from '../recorder';

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

/** Instrument, run and record a JavaScript program. */
export function runJs(source: string, opts: RunOptions): RawRunResult {
  const inst = instrument(source);
  if ('error' in inst) return { status: 'syntax-error', steps: [], error: { line: inst.error.line, message: inst.error.message } };

  const rt = new Recorder(inst.names, inst.plan, opts);
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
      error = recordCrash(rt, err?.name ?? 'Error', err ? err.message : short(e));
    }
  }
  return finishRun(rt, inst.plan, status, error);
}
