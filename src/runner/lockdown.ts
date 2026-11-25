/// <reference lib="webworker" />
// Removes every network API, eval, string timers and the Function constructors
// from a worker, before the student's program runs. Shared by the JavaScript,
// Java (and later C++ and C) workers.
declare const self: DedicatedWorkerGlobalScope;

// Taken before the lockdown removes the global Function.
const FUNCTION_PROTOS = [
  Function.prototype,
  Object.getPrototypeOf(async function () {}),
  Object.getPrototypeOf(function* () {}),
  Object.getPrototypeOf(async function* () {}),
];

export function lockDown() {
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

