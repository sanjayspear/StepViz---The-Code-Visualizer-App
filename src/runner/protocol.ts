// Messages between the main thread and the Python worker.

export interface SyntaxErrorInfo {
  line: number;
  /** Friendly text, e.g. "Line 3: A colon (:) is missing at the end of this line." */
  message: string;
}

export type AnalyzeResult = { ok: true; inputCalls: number } | { ok: false; error: SyntaxErrorInfo };

/** A step as recorded by tracer.py (before explanations are added). */
export interface RawStep {
  line: number;
  frames: {
    name: string;
    vars: Record<string, string>;
    status: 'running' | 'waiting' | 'returning' | 'error';
    returns?: string;
  }[];
  output: string;
  error?: { type: string; message: string };
  list?: { values: string[]; compare?: number[]; swap?: [number, number] };
}

export interface RawRunResult {
  status: 'ok' | 'cap' | 'runtime-error' | 'syntax-error';
  steps: RawStep[];
  listView?: import('../trace/types').ListView;
  error: null | { line: number | null; type?: string; message: string };
}

export type ToWorker =
  | { type: 'init'; indexURL: string }
  | { type: 'analyze'; id: number; source: string }
  | { type: 'run'; id: number; source: string; inputs: string[]; maxSteps: number; maxSeconds: number };

export type FromWorker =
  | { type: 'ready' }
  | { type: 'init-error'; message: string }
  | { type: 'analyze-result'; id: number; result: AnalyzeResult }
  | { type: 'run-result'; id: number; result: RawRunResult };
