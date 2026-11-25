/// <reference lib="webworker" />
// The only place pasted code runs. Loads Pyodide from our own site, then
// removes every network API from this worker before any student code runs.
import tracerSource from './tracer.py?raw';
import type { FromWorker, ToWorker } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

interface PyCallable {
  (...args: unknown[]): unknown;
}
interface Pyodide {
  runPython(code: string): unknown;
  globals: { get(name: string): PyCallable };
}

let analyzeFn: PyCallable | null = null;
let runFn: PyCallable | null = null;

const post = (msg: FromWorker) => self.postMessage(msg);

/** Remove network and sub-worker APIs. Called after Pyodide has loaded. */
function lockDownNetwork() {
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
}

async function init(indexURL: string) {
  try {
    const mod = (await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`)) as {
      loadPyodide: (opts: { indexURL: string; stdout?: (s: string) => void; stderr?: (s: string) => void }) => Promise<Pyodide>;
    };
    const py = await mod.loadPyodide({ indexURL, stdout: () => {}, stderr: () => {} });
    py.runPython(tracerSource);
    py.runPython('lock_down()');
    analyzeFn = py.globals.get('analyze');
    runFn = py.globals.get('run');
    lockDownNetwork();
    post({ type: 'ready' });
  } catch (e) {
    post({ type: 'init-error', message: e instanceof Error ? e.message : String(e) });
  }
}

self.onmessage = (event: MessageEvent<ToWorker>) => {
  const msg = event.data;
  if (msg.type === 'init') {
    void init(msg.indexURL);
  } else if (msg.type === 'analyze' && analyzeFn) {
    post({ type: 'analyze-result', id: msg.id, result: JSON.parse(String(analyzeFn(msg.source))) });
  } else if (msg.type === 'run' && runFn) {
    const json = String(runFn(msg.source, JSON.stringify(msg.inputs), msg.maxSteps, msg.maxSeconds));
    post({ type: 'run-result', id: msg.id, result: JSON.parse(json) });
  }
};
