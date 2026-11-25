// Page side of the AI explanations: checks the device, starts the AI worker,
// downloads the model (with progress and cancel), asks for one explanation at
// a time, and passes every reply through the accuracy guard.
import aiWorkerUrl from './ai.worker.ts?worker&url';
import type { Trace, TraceStep } from '../trace/types';
import { AI_MODEL_LIB_PATH, AI_MODEL_TOTAL_MB, AI_PREFETCH, AI_TIMEOUT_MS } from './config';
import { buildMessages, parseReply } from './prompt';
import { checkGrounded } from './guard';
import type { FromAiWorker, ToAiWorker } from './protocol';

export type AiStatus =
  | { kind: 'off' }
  | { kind: 'checking' }
  | { kind: 'unsupported' }
  | { kind: 'note' }
  | { kind: 'downloading'; mb: number }
  | { kind: 'preparing' }
  | { kind: 'ready' }
  | { kind: 'failed' };

export type AiExplanation =
  | { state: 'pending' }
  | { state: 'done'; what: string; life: string }
  | { state: 'rejected' } // failed the accuracy guard: the normal text stays
  | { state: 'failed' }; // error or timeout: the normal text stays, with a note

const NOTE_KEY = 'stepviz.aiNoteSeen';

/** Steps with the generic "Line N runs: ..." text can get an AI explanation. */
export const aiEligible = (step: TraceStep) => !step.error && step.explain.life === '';

function readNoteSeen(): boolean {
  try {
    return window.localStorage.getItem(NOTE_KEY) === 'yes';
  } catch {
    return false;
  }
}

async function webgpuSupported(): Promise<boolean> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<{ features: Set<string> } | null> } }).gpu;
  if (!gpu) return false;
  try {
    const adapter = await gpu.requestAdapter();
    // The 4-bit model uses 16-bit floats on the GPU.
    return !!adapter && adapter.features.has('shader-f16');
  } catch {
    return false;
  }
}

class AiClient {
  status: AiStatus = { kind: 'off' };
  menuMessage: string | null = null;
  private version = 0;
  private listeners = new Set<() => void>();
  private worker: Worker | null = null;
  private nextId = 1;
  private explanations = new WeakMap<Trace, Map<number, AiExplanation>>();
  private queue: { trace: Trace; index: number }[] = [];
  private busy = false;
  private pending = new Map<number, (msg: FromAiWorker) => void>();

  // ---- store for React (useSyncExternalStore) ------------------------------
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getVersion = () => this.version;
  private changed() {
    this.version++;
    this.listeners.forEach((fn) => fn());
  }
  private setStatus(status: AiStatus) {
    this.status = status;
    this.changed();
  }

  explanationFor(trace: Trace, index: number): AiExplanation | undefined {
    return this.explanations.get(trace)?.get(index);
  }

  // ---- user actions ----------------------------------------------------------

  /** "Explain with AI (beta)" was pressed. Nothing is downloaded before the checks. */
  async start() {
    if (this.status.kind !== 'off' && this.status.kind !== 'failed' && this.status.kind !== 'unsupported') return;
    this.menuMessage = null;
    this.setStatus({ kind: 'checking' });
    if (!(await webgpuSupported())) {
      this.setStatus({ kind: 'unsupported' });
      return;
    }
    if (!readNoteSeen()) {
      this.setStatus({ kind: 'note' });
      return;
    }
    this.load();
  }

  /** The first-use note was accepted. */
  acceptNote() {
    try {
      window.localStorage.setItem(NOTE_KEY, 'yes');
    } catch {
      // Not saved; the note shows again next time.
    }
    this.load();
  }

  /** Cancel the note or the download. */
  cancel() {
    this.stopWorker();
    this.setStatus({ kind: 'off' });
  }

  /** "Remove downloaded AI model" in the menu. */
  async removeModel() {
    this.stopWorker();
    this.setStatus({ kind: 'off' });
    const worker = this.createWorker();
    const had = await new Promise<boolean>((resolve) => {
      worker.onmessage = (e: MessageEvent<FromAiWorker>) => {
        if (e.data.type === 'removed') resolve(e.data.had);
      };
      worker.onerror = () => resolve(false);
      worker.postMessage({ type: 'remove', libUrl: this.libUrl() } satisfies ToAiWorker);
    });
    worker.terminate();
    this.menuMessage = had ? 'AI model removed.' : 'No AI model is downloaded.';
    this.changed();
  }

  /** The student is looking at step `index`: explain it and the next few. */
  request(trace: Trace, index: number) {
    if (this.status.kind !== 'ready') return;
    const wanted: number[] = [];
    for (let k = index; k < trace.steps.length && wanted.length <= AI_PREFETCH; k++) {
      if (aiEligible(trace.steps[k])) wanted.push(k);
    }
    const map = this.mapFor(trace);
    // Steps that were queued but not started go back to "not asked yet".
    for (const job of this.queue) {
      const m = this.mapFor(job.trace);
      if (m.get(job.index)?.state === 'pending') m.delete(job.index);
    }
    // The current step first; drop queued steps the student has moved past.
    this.queue = wanted.filter((k) => !map.has(k)).map((k) => ({ trace, index: k }));
    for (const { index: k } of this.queue) map.set(k, { state: 'pending' });
    this.changed();
    void this.pump();
  }

  // ---- internals -------------------------------------------------------------

  private libUrl() {
    return new URL(AI_MODEL_LIB_PATH, document.baseURI).href;
  }

  /** A module worker started from a blob: URL, so the page's CSP applies to it. */
  private createWorker(): Worker {
    const script = new URL(aiWorkerUrl, document.baseURI).href;
    const blob = new Blob([`import ${JSON.stringify(script)};`], { type: 'text/javascript' });
    return new Worker(URL.createObjectURL(blob), { type: 'module', name: 'stepviz-ai' });
  }

  private stopWorker() {
    this.worker?.terminate();
    this.worker = null;
    this.busy = false;
    this.queue = [];
    for (const resolve of this.pending.values()) resolve({ type: 'explain-error', id: -1, message: 'stopped' });
    this.pending.clear();
  }

  private mapFor(trace: Trace) {
    let map = this.explanations.get(trace);
    if (!map) {
      map = new Map();
      this.explanations.set(trace, map);
    }
    return map;
  }

  private load() {
    this.stopWorker();
    this.setStatus({ kind: 'downloading', mb: 0 });
    const worker = this.createWorker();
    this.worker = worker;
    worker.onmessage = (e: MessageEvent<FromAiWorker>) => {
      const msg = e.data;
      if (worker !== this.worker) return;
      if (msg.type === 'progress') {
        if (/fetch/i.test(msg.text)) {
          this.setStatus({ kind: 'downloading', mb: Math.min(AI_MODEL_TOTAL_MB, Math.round(msg.progress * AI_MODEL_TOTAL_MB)) });
        } else {
          this.setStatus({ kind: 'preparing' });
        }
      } else if (msg.type === 'ready') {
        this.setStatus({ kind: 'ready' });
      } else if (msg.type === 'load-error') {
        this.stopWorker();
        this.setStatus({ kind: 'failed' });
      } else if (msg.type === 'explained' || msg.type === 'explain-error') {
        this.pending.get(msg.id)?.(msg);
      }
    };
    worker.onerror = () => {
      if (worker !== this.worker) return;
      this.stopWorker();
      this.setStatus({ kind: 'failed' });
    };
    worker.postMessage({ type: 'load', libUrl: this.libUrl() } satisfies ToAiWorker);
  }

  /** One explanation at a time. */
  private async pump() {
    if (this.busy || !this.worker) return;
    const job = this.queue.shift();
    if (!job) return;
    this.busy = true;
    const worker = this.worker;
    const id = this.nextId++;
    const reply = await new Promise<FromAiWorker>((resolve) => {
      const timer = window.setTimeout(() => {
        worker.postMessage({ type: 'interrupt' } satisfies ToAiWorker);
        resolve({ type: 'explain-error', id, message: 'timeout' });
      }, AI_TIMEOUT_MS);
      this.pending.set(id, (msg) => {
        window.clearTimeout(timer);
        resolve(msg);
      });
      worker.postMessage({ type: 'explain', id, messages: buildMessages(job.trace, job.index) } satisfies ToAiWorker);
    });
    this.pending.delete(id);
    if (worker !== this.worker) return; // stopped meanwhile
    this.mapFor(job.trace).set(job.index, this.judge(reply, job.trace, job.index));
    this.busy = false;
    this.changed();
    void this.pump();
  }

  private judge(reply: FromAiWorker, trace: Trace, index: number): AiExplanation {
    if (reply.type !== 'explained') return { state: 'failed' };
    const parsed = parseReply(reply.text);
    if (!parsed) return { state: 'rejected' };
    const guard = checkGrounded([parsed.what, parsed.life], trace, index);
    return guard.ok ? { state: 'done', ...parsed } : { state: 'rejected' };
  }
}

export const aiClient = new AiClient();
