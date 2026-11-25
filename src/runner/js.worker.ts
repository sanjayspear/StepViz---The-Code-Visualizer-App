/// <reference lib="webworker" />
// Runs one JavaScript program and is then terminated (a fresh worker per run).
// Before the program runs, every network API, eval, string timers and the
// Function constructors are removed, so pasted code cannot reach the network
// or build new code. `import()` is rejected when the code is parsed.
import { analyzeJs } from './js/instrument';
import { runJs } from './js/runtime';
import type { JsFromWorker, JsToWorker } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

// Taken before the lockdown removes the global Function.
const FUNCTION_PROTOS = [
  Function.prototype,
  Object.getPrototypeOf(async function () {}),
  Object.getPrototypeOf(function* () {}),
  Object.getPrototypeOf(async function* () {}),
];

function lockDown() {
  const blocked = () => {
    throw new Error('Network access is disabled in StepViz.');
  };
  const names = [
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'WebTransport',
    'EventSource',
    'importScripts',
    'Worker',
    'SharedWorker',
    'BroadcastChannel',
    'indexedDB',
    'caches',
    'eval',
    'Function',
    'setTimeout',
    'setInterval',
  ];
  for (const name of names) {
    try {
      Object.defineProperty(self, name, {
        value: name === 'fetch' || name === 'importScripts' ? blocked : undefined,
        writable: false,
        configurable: false,
      });
    } catch {
      // Already non-configurable in this browser: leave it.
    }
  }
  // No way back to a Function constructor through a function's prototype.
  for (const proto of FUNCTION_PROTOS) {
    try {
      Object.defineProperty(proto, 'constructor', { value: undefined, writable: false, configurable: false });
    } catch {
      // ignore
    }
  }
}

self.onmessage = (event: MessageEvent<JsToWorker>) => {
  const msg = event.data;
  if (msg.type === 'analyze') {
    self.postMessage({ type: 'analyze-result', result: analyzeJs(msg.source) } satisfies JsFromWorker);
  } else if (msg.type === 'run') {
    const result = runJs(msg.source, { maxSteps: msg.maxSteps, maxSeconds: msg.maxSeconds, beforeRun: lockDown });
    self.postMessage({ type: 'run-result', result } satisfies JsFromWorker);
  }
};
