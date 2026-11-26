/// <reference lib="webworker" />
// Runs one JavaScript program and is then terminated (a fresh worker per run).
// Before the program runs, every network API, eval, string timers and the
// Function constructors are removed, so pasted code cannot reach the network
// or build new code. `import()` is rejected when the code is parsed.
import { analyzeJs } from './js/instrument';
import { runJs } from './js/runtime';
import type { JsFromWorker, JsToWorker } from './protocol';
import { lockDown } from './lockdown';
import { checkJs } from '../practice/jsHarness';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (event: MessageEvent<JsToWorker>) => {
  const msg = event.data;
  if (msg.type === 'analyze') {
    self.postMessage({ type: 'analyze-result', result: analyzeJs(msg.source) } satisfies JsFromWorker);
  } else if (msg.type === 'run') {
    const result = runJs(msg.source, { maxSteps: msg.maxSteps, maxSeconds: msg.maxSeconds, beforeRun: lockDown });
    self.postMessage({ type: 'run-result', result } satisfies JsFromWorker);
  } else if (msg.type === 'check') {
    const result = checkJs(msg.source, JSON.parse(msg.spec), { maxSeconds: msg.maxSeconds, beforeRun: lockDown });
    self.postMessage({ type: 'check-result', result } satisfies JsFromWorker);
  }
};
