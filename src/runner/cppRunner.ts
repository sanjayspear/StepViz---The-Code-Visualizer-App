// Main-thread side of the C++ runner: a fresh worker per call, terminated
// afterwards, with the same watchdog as the other runners.
import type { RawRunResult, SyntaxErrorInfo, TreeFromWorker, TreeToWorker } from './protocol';
import { MAX_SECONDS, MAX_STEPS } from './pythonRunner';

const WATCHDOG_GRACE_MS = 1500;

const files = () => ({
  engine: new URL('tree-sitter/web-tree-sitter.wasm', document.baseURI).href,
  grammar: new URL('tree-sitter/tree-sitter-cpp.wasm', document.baseURI).href,
});

function inWorker<T extends TreeFromWorker>(msg: TreeToWorker, timeoutMs: number): Promise<T | null> {
  const worker = new Worker(new URL('./cpp.worker.ts', import.meta.url), { type: 'module' });
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
      reject(new Error(e.message || 'The C++ worker failed.'));
    };
    worker.postMessage(msg);
  });
}

export async function analyzeCpp(
  source: string,
): Promise<{ ok: true; readsInput: boolean } | { ok: false; error: SyntaxErrorInfo }> {
  const reply = await inWorker<Extract<TreeFromWorker, { type: 'analyze-result' }>>(
    { type: 'analyze', source, files: files() },
    15_000,
  );
  if (!reply) throw new Error('The C++ worker did not answer.');
  return reply.result;
}

export async function runCppProgram(source: string, input = ''): Promise<RawRunResult> {
  const reply = await inWorker<Extract<TreeFromWorker, { type: 'run-result' }>>(
    { type: 'run', source, maxSteps: MAX_STEPS, maxSeconds: MAX_SECONDS, files: files(), input },
    MAX_SECONDS * 1000 + WATCHDOG_GRACE_MS + 5000, // + time to load tree-sitter
  );
  return reply ? reply.result : { status: 'cap', steps: [], error: null };
}
