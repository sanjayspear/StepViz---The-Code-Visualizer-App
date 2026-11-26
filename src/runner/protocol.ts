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
  kind?: import('../trace/types').StepKind;
  detail?: import('../trace/types').StepDetail;
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
  | { type: 'run'; id: number; source: string; inputs: string[]; maxSteps: number; maxSeconds: number }
  /** Practice: run a Python answer against its tests (src/practice/harness.py), untraced. */
  | { type: 'check'; id: number; source: string; spec: string; maxSeconds: number };

export type FromWorker =
  | { type: 'ready' }
  | { type: 'init-error'; message: string }
  | { type: 'analyze-result'; id: number; result: AnalyzeResult }
  | { type: 'run-result'; id: number; result: RawRunResult }
  | { type: 'check-result'; id: number; result: CheckResult };

/** Practice test results from src/practice/harness.py. */
export interface CheckTestResult {
  call: string;
  passed: boolean;
  expected: string;
  got: string;
  /** missing: no such function; error: it crashed; timeout: too slow; skipped: no time left */
  problem?: 'missing' | 'error' | 'timeout' | 'skipped';
  errorType?: string;
  message?: string;
  line?: number | null;
}
export interface CheckResult {
  /** ok: the tests ran; the others stopped before them */
  status: 'ok' | 'syntax-error' | 'forbidden' | 'error' | 'timeout';
  results: CheckTestResult[];
  error?: SyntaxErrorInfo;
  /** forbidden: the word used, its line, and why */
  word?: string;
  why?: string;
  line?: number | null;
  errorType?: string;
  message?: string;
}

// JavaScript worker (one fresh worker per message).
export type JsToWorker =
  | { type: 'analyze'; source: string }
  | { type: 'run'; source: string; maxSteps: number; maxSeconds: number };

export type JsFromWorker =
  | { type: 'analyze-result'; result: { ok: true } | { ok: false; error: SyntaxErrorInfo } }
  | { type: 'run-result'; result: RawRunResult };

// Java (and later C++/C) worker: tree-sitter files come from our own site.
export type TreeToWorker = JsToWorker & {
  files: { engine: string; grammar: string };
  input?: string;
  /** C++ worker: 'c' runs the program as C */
  dialect?: 'cpp' | 'c';
};
export type TreeFromWorker =
  | { type: 'analyze-result'; result: { ok: true; readsInput: boolean } | { ok: false; error: SyntaxErrorInfo } }
  | { type: 'run-result'; result: RawRunResult };
