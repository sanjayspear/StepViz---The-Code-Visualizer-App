// Turns source code into a Trace, or a friendly error for the Home screen.
// The built-in Factorial example plays the section 6 fixture while the editor
// text is exactly the sample; anything else is traced live in the worker.
import { FACTORIAL_TRACE } from '../examples/factorialTrace';
import { pythonRunner } from '../runner/pythonRunner';
import { genericExplanation } from './explain';
import type { Trace } from './types';

export const CAP_MESSAGE =
  'Your program ran for a very long time, so we stopped it. Check that every loop can end.';

export type TraceOutcome =
  | { kind: 'trace'; trace: Trace }
  | { kind: 'error'; message: string; line?: number };

/** Syntax check; also tells the caller how many input() calls the code has. */
export async function checkSource(
  source: string,
): Promise<{ ok: true; inputCalls: number } | { ok: false; message: string; line: number }> {
  if (source === FACTORIAL_TRACE.source) return { ok: true, inputCalls: 0 };
  const result = await pythonRunner.analyze(source);
  return result.ok ? result : { ok: false, message: result.error.message, line: result.error.line };
}

export async function getTrace(source: string, inputs: string[] = []): Promise<TraceOutcome> {
  if (source === FACTORIAL_TRACE.source) return { kind: 'trace', trace: FACTORIAL_TRACE };

  const raw = await pythonRunner.run(source, inputs);
  if (raw.status === 'syntax-error' && raw.error) {
    return { kind: 'error', message: raw.error.message, line: raw.error.line ?? undefined };
  }
  if (raw.status === 'cap') return { kind: 'error', message: CAP_MESSAGE };
  if (raw.status === 'runtime-error' && raw.error) {
    // Handled fully in stage (f); for now report it on the Home screen.
    const where = raw.error.line ? `Line ${raw.error.line}: ` : '';
    return { kind: 'error', message: `${where}${raw.error.type}: ${raw.error.message}`, line: raw.error.line ?? undefined };
  }
  if (raw.steps.length === 0) return { kind: 'error', message: 'Paste some code first' };

  return {
    kind: 'trace',
    trace: {
      language: 'python',
      source,
      steps: raw.steps.map((s) => ({ ...s, explain: genericExplanation(source, s.line) })),
    },
  };
}
