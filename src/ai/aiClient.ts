// Page side of the AI explanations. Looks for Ollama on this computer only
// when the student asks (so other visitors never get a browser prompt), asks
// for one explanation at a time, and passes every reply through the accuracy
// guard. The code-runner workers stay fully offline; this talks only to
// localhost.
import type { Trace } from '../trace/types';
import { AI_CHECK_TIMEOUT_MS, AI_MODEL, AI_PREFETCH, AI_TIMEOUT_MS, OLLAMA_URL } from './config';
import { buildMessages, parseReply } from './prompt';
import { checkGrounded } from './guard';

export type AiStatus =
  | { kind: 'off' }
  | { kind: 'checking' }
  | { kind: 'setup'; missing: 'ollama' | 'model' } // the help panel with the setup steps
  | { kind: 'ready' };

export type AiExplanation =
  | { state: 'pending' }
  | { state: 'done'; what: string; life: string }
  | { state: 'rejected' } // failed the accuracy guard: the built-in text stays
  | { state: 'failed' }; // Ollama error or timeout: the built-in text stays, with a note

/** fetch with a time limit. */
async function fetchWithin(url: string, ms: number, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

/** "llama3.2:3b" also matches "llama3.2:3b-instruct-q4_K_M" and the like. */
const hasModel = (names: string[]) => names.some((n) => n === AI_MODEL || n.startsWith(`${AI_MODEL}-`));

class AiClient {
  status: AiStatus = { kind: 'off' };
  private version = 0;
  private listeners = new Set<() => void>();
  private explanations = new WeakMap<Trace, Map<number, AiExplanation>>();
  private queue: { trace: Trace; index: number }[] = [];
  private busy = false;

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

  /** "Explain with AI" or "Try again": look for Ollama and the Llama model. */
  async start() {
    if (this.status.kind === 'checking' || this.status.kind === 'ready') return;
    this.setStatus({ kind: 'checking' });
    try {
      const res = await fetchWithin(`${OLLAMA_URL}/api/tags`, AI_CHECK_TIMEOUT_MS);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { models?: { name?: string; model?: string }[] };
      const names = (data.models ?? []).flatMap((m) => [m.name ?? '', m.model ?? '']);
      this.setStatus(hasModel(names) ? { kind: 'ready' } : { kind: 'setup', missing: 'model' });
    } catch {
      // Not installed, not running, or not allowed to talk to this site.
      this.setStatus({ kind: 'setup', missing: 'ollama' });
    }
  }

  /** "How to set it up" */
  showSetup() {
    this.setStatus({ kind: 'setup', missing: 'ollama' });
  }

  /** Close the help panel. */
  close() {
    this.setStatus({ kind: 'off' });
  }

  /** The student is looking at step `index`: explain it and the next few. */
  request(trace: Trace, index: number, eligible: (index: number) => boolean) {
    if (this.status.kind !== 'ready') return;
    const wanted: number[] = [];
    for (let k = index; k < trace.steps.length && wanted.length <= AI_PREFETCH; k++) if (eligible(k)) wanted.push(k);
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

  private mapFor(trace: Trace) {
    let map = this.explanations.get(trace);
    if (!map) {
      map = new Map();
      this.explanations.set(trace, map);
    }
    return map;
  }

  /** One explanation at a time. */
  private async pump() {
    if (this.busy) return;
    const job = this.queue.shift();
    if (!job) return;
    this.busy = true;
    let result: AiExplanation;
    try {
      const res = await fetchWithin(`${OLLAMA_URL}/api/chat`, AI_TIMEOUT_MS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: buildMessages(job.trace, job.index),
          stream: false,
          format: 'json',
          options: { temperature: 0.3 },
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { message?: { content?: string } };
      result = this.judge(data.message?.content ?? '', job.trace, job.index);
    } catch {
      result = { state: 'failed' };
    }
    this.mapFor(job.trace).set(job.index, result);
    this.busy = false;
    this.changed();
    void this.pump();
  }

  private judge(text: string, trace: Trace, index: number): AiExplanation {
    const parsed = parseReply(text);
    if (!parsed) return { state: 'rejected' };
    const guard = checkGrounded([parsed.what, parsed.life], trace, index);
    return guard.ok ? { state: 'done', ...parsed } : { state: 'rejected' };
  }
}

export const aiClient = new AiClient();
