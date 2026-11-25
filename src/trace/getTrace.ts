// Turns source code into a Trace, or a friendly error for the Home screen.
// Built-in examples with hand-written explanations play their fixture while the
// editor text is exactly the sample; anything else is traced live in a worker
// (Python: Pyodide; JavaScript: instrumented code in its own worker).
import { FACTORIAL_TRACE } from '../examples/factorialTrace';
import { FOR_LOOP_TRACE } from '../examples/forLoopTrace';
import { FIBONACCI_TRACE } from '../examples/fibonacciTrace';
import { BUBBLE_SORT_TRACE } from '../examples/bubbleSortTrace';
import { FACTORIAL_JS_TRACE } from '../examples/factorialJsTrace';
import type { CodeLanguage } from '../examples';
import { pythonRunner } from '../runner/pythonRunner';
import { analyzeJavaScript, runJavaScript } from '../runner/jsRunner';
import type { RawRunResult } from '../runner/protocol';
import { errorSentence } from './explain';
import { explainTrace } from './explainer';
import type { Trace } from './types';

export const CAP_MESSAGE =
  'Your program ran for a very long time, so we stopped it. Check that every loop can end.';

const FIXTURES: Trace[] = [FACTORIAL_TRACE, FOR_LOOP_TRACE, FIBONACCI_TRACE, BUBBLE_SORT_TRACE, FACTORIAL_JS_TRACE];

export function fixtureFor(source: string, language: CodeLanguage = 'python'): Trace | undefined {
  return FIXTURES.find((t) => t.source === source && t.language === language);
}

export type TraceOutcome =
  | { kind: 'trace'; trace: Trace }
  | { kind: 'error'; message: string; line?: number };

/** Syntax check; also tells the caller how many input() calls the code has (Python). */
export async function checkSource(
  source: string,
  language: CodeLanguage = 'python',
): Promise<{ ok: true; inputCalls: number } | { ok: false; message: string; line: number }> {
  if (fixtureFor(source, language)) return { ok: true, inputCalls: 0 };
  if (language === 'javascript') {
    const result = await analyzeJavaScript(source);
    return result.ok ? { ok: true, inputCalls: 0 } : { ok: false, message: result.error.message, line: result.error.line };
  }
  const result = await pythonRunner.analyze(source);
  return result.ok ? result : { ok: false, message: result.error.message, line: result.error.line };
}

export async function getTrace(
  source: string,
  inputs: string[] = [],
  language: CodeLanguage = 'python',
): Promise<TraceOutcome> {
  const fixture = fixtureFor(source, language);
  if (fixture) return { kind: 'trace', trace: fixture };

  const raw: RawRunResult = language === 'javascript' ? await runJavaScript(source) : await pythonRunner.run(source, inputs);
  if (raw.status === 'syntax-error' && raw.error) {
    return { kind: 'error', message: raw.error.message, line: raw.error.line ?? undefined };
  }
  if (raw.status === 'cap') return { kind: 'error', message: CAP_MESSAGE };

  if (raw.status === 'runtime-error' && raw.error && !raw.steps.some((s) => s.error)) {
    // Crashed before any step was recorded: stay on Home.
    const sentence = errorSentence(raw.error.type ?? '', language);
    const where = raw.error.line ? `Line ${raw.error.line}: ` : '';
    return { kind: 'error', message: `${where}${sentence}`, line: raw.error.line ?? undefined };
  }
  if (raw.steps.length === 0) return { kind: 'error', message: 'Paste some code first' };

  // Live traces are explained by the rule-based explainer (built from each
  // step's kind and what changed); hand-written fixtures returned above.
  const trace: Trace = {
    language,
    source,
    ...(raw.listView ? { listView: raw.listView } : {}),
    steps: raw.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })),
  };
  const texts = explainTrace(trace);
  trace.steps.forEach((s, i) => (s.explain = texts[i]));
  return { kind: 'trace', trace };
}
