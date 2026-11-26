// Main-thread side of the Python runner. Owns the worker, and a watchdog that
// terminates it if a run goes past the time limit (for example a long-running
// built-in call that the tracer cannot interrupt), so the page stays responsive.
import type { AnalyzeResult, CheckResult, FromWorker, RawRunResult, ToWorker } from './protocol';

export const MAX_STEPS = 2000;
export const MAX_SECONDS = 5;
/** Extra time before the watchdog kills the worker. */
const WATCHDOG_GRACE_MS = 1500;

type Pending = { resolve: (value: never) => void; reject: (e: Error) => void };

export class PythonRunner {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private nextId = 1;
  private pending = new Map<number, Pending>();

  /** Start loading Pyodide (idempotent). */
  load(): Promise<void> {
    if (this.ready) return this.ready;
    const worker = new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    this.ready = new Promise<void>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<FromWorker>) => {
        const msg = event.data;
        if (msg.type === 'ready') resolve();
        else if (msg.type === 'init-error') reject(new Error(msg.message));
        else {
          const p = this.pending.get(msg.id);
          if (!p) return;
          this.pending.delete(msg.id);
          (p.resolve as (v: unknown) => void)(msg.result);
        }
      };
      worker.onerror = (e) => reject(new Error(e.message || 'The Python worker failed to start.'));
    });
    this.ready.then(
      () => {
        this.isReady = true;
      },
      () => this.reset(),
    );
    const indexURL = new URL('pyodide/', document.baseURI).href;
    this.post({ type: 'init', indexURL });
    return this.ready;
  }

  /** True once Pyodide has loaded in the current worker. */
  isReady = false;

  async analyze(source: string): Promise<AnalyzeResult> {
    await this.load();
    return this.request<AnalyzeResult>((id) => ({ type: 'analyze', id, source }));
  }

  /** Run with the step and time caps. Resolves with status 'cap' if the watchdog fires. */
  async run(source: string, inputs: string[] = []): Promise<RawRunResult> {
    await this.load();
    let timer: number | undefined;
    const watchdog = new Promise<RawRunResult>((resolve) => {
      timer = window.setTimeout(() => {
        // Resolve first, so the race settles as 'cap' before reset() rejects
        // the pending request.
        resolve({ status: 'cap', steps: [], error: null });
        this.reset();
        void this.load().catch(() => {}); // start a fresh worker right away
      }, MAX_SECONDS * 1000 + WATCHDOG_GRACE_MS);
    });
    const result = this.request<RawRunResult>((id) => ({
      type: 'run',
      id,
      source,
      inputs,
      maxSteps: MAX_STEPS,
      maxSeconds: MAX_SECONDS,
    }));
    result.catch(() => {}); // rejected only when the watchdog has already answered
    try {
      return await Promise.race([result, watchdog]);
    } finally {
      window.clearTimeout(timer);
    }
  }

  /**
   * Practice: run a Python answer against its tests (spec: {tests, forbid} as JSON), untraced.
   * The harness keeps within MAX_SECONDS itself; the watchdog is the last resort.
   */
  async check(source: string, spec: string): Promise<CheckResult> {
    await this.load();
    let timer: number | undefined;
    const watchdog = new Promise<CheckResult>((resolve) => {
      timer = window.setTimeout(() => {
        resolve({ status: 'timeout', results: [] });
        this.reset();
        void this.load().catch(() => {});
      }, MAX_SECONDS * 1000 + WATCHDOG_GRACE_MS);
    });
    const result = this.request<CheckResult>((id) => ({ type: 'check', id, source, spec, maxSeconds: MAX_SECONDS }));
    result.catch(() => {});
    try {
      return await Promise.race([result, watchdog]);
    } finally {
      window.clearTimeout(timer);
    }
  }

  private request<T>(make: (id: number) => ToWorker): Promise<T> {
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: never) => void, reject });
      this.post(make(id));
    });
  }

  private post(msg: ToWorker) {
    this.worker?.postMessage(msg);
  }

  /** Kill the worker; the next call starts a fresh one. */
  private reset() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    this.isReady = false;
    for (const p of this.pending.values()) p.reject(new Error('The Python worker was stopped.'));
    this.pending.clear();
  }
}

export const pythonRunner = new PythonRunner();
