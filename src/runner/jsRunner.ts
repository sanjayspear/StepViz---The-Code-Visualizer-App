// Main-thread side of the JavaScript runner. Each call gets a fresh worker,
// which is terminated afterwards. A watchdog terminates it if a run goes past
// the time limit (for example a long built-in call the hooks cannot interrupt),
// so the page stays responsive.
import type { CheckResult, JsFromWorker, JsToWorker, RawRunResult, SyntaxErrorInfo } from './protocol';
import { MAX_SECONDS, MAX_STEPS } from './pythonRunner';

const WATCHDOG_GRACE_MS = 1500;

function inWorker<T extends JsFromWorker>(msg: JsToWorker, timeoutMs: number): Promise<T | null> {
  const worker = new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module' });
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      worker.terminate();
      resolve(null);
    }, timeoutMs);
    worker.onmessage = (event: MessageEvent<T>) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = (e) => {
      window.clearTimeout(timer);
      worker.terminate();
      reject(new Error(e.message || 'The JavaScript worker failed.'));
    };
    worker.postMessage(msg);
  });
}

export async function analyzeJavaScript(source: string): Promise<{ ok: true } | { ok: false; error: SyntaxErrorInfo }> {
  const reply = await inWorker<Extract<JsFromWorker, { type: 'analyze-result' }>>({ type: 'analyze', source }, 10_000);
  if (!reply) throw new Error('The JavaScript worker did not answer.');
  return reply.result;
}

export async function runJavaScript(source: string): Promise<RawRunResult> {
  const reply = await inWorker<Extract<JsFromWorker, { type: 'run-result' }>>(
    { type: 'run', source, maxSteps: MAX_STEPS, maxSeconds: MAX_SECONDS },
    MAX_SECONDS * 1000 + WATCHDOG_GRACE_MS,
  );
  return reply ? reply.result : { status: 'cap', steps: [], error: null };
}

/** Practice: run an answer against its tests (5 s in all, 2 s per test; the watchdog stops a stuck worker). */
export async function checkJavaScript(source: string, spec: string): Promise<CheckResult> {
  const reply = await inWorker<Extract<JsFromWorker, { type: 'check-result' }>>({ type: 'check', source, spec, maxSeconds: MAX_SECONDS }, MAX_SECONDS * 1000 + WATCHDOG_GRACE_MS);
  return reply ? reply.result : { status: 'timeout', results: [] };
}
