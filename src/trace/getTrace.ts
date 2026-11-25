// Turns source code into a Trace, or a friendly error for the Home screen.
// Built-in examples with hand-written explanations (Factorial, For loop,
// Fibonacci, Bubble sort) play their fixture while the editor text is exactly the sample;
// anything else is traced live in the worker.
import { FACTORIAL_TRACE } from '../examples/factorialTrace';
import { FOR_LOOP_TRACE } from '../examples/forLoopTrace';
import { FIBONACCI_TRACE } from '../examples/fibonacciTrace';
import { BUBBLE_SORT_TRACE } from '../examples/bubbleSortTrace';
import { pythonRunner } from '../runner/pythonRunner';
import { errorSentence, genericExplanation } from './explain';
import type { Trace } from './types';

export const CAP_MESSAGE =
  'Your program ran for a very long time, so we stopped it. Check that every loop can end.';

const FIXTURES: Trace[] = [FACTORIAL_TRACE, FOR_LOOP_TRACE, FIBONACCI_TRACE, BUBBLE_SORT_TRACE];

export function fixtureFor(source: string): Trace | undefined {
  return FIXTURES.find((t) => t.source === source);
}

export type TraceOutcome =
  | { kind: 'trace'; trace: Trace }
  | { kind: 'error'; message: string; line?: number };

/** Syntax check; also tells the caller how many input() calls the code has. */
export async function checkSource(
  source: string,
): Promise<{ ok: true; inputCalls: number } | { ok: false; message: string; line: number }> {
  if (fixtureFor(source)) return { ok: true, inputCalls: 0 };
  const result = await pythonRunner.analyze(source);
  return result.ok ? result : { ok: false, message: result.error.message, line: result.error.line };
}

export async function getTrace(source: string, inputs: string[] = []): Promise<TraceOutcome> {
  const fixture = fixtureFor(source);
  if (fixture) return { kind: 'trace', trace: fixture };

  const raw = await pythonRunner.run(source, inputs);
  if (raw.status === 'syntax-error' && raw.error) {
    return { kind: 'error', message: raw.error.message, line: raw.error.line ?? undefined };
  }
  if (raw.status === 'cap') return { kind: 'error', message: CAP_MESSAGE };

  if (raw.status === 'runtime-error' && raw.error && !raw.steps.some((s) => s.error)) {
    // Crashed before any step was recorded: stay on Home.
    const sentence = errorSentence(raw.error.type ?? '');
    const where = raw.error.line ? `Line ${raw.error.line}: ` : '';
    return { kind: 'error', message: `${where}${sentence}`, line: raw.error.line ?? undefined };
  }
  if (raw.steps.length === 0) return { kind: 'error', message: 'Paste some code first' };

  return {
    kind: 'trace',
    trace: {
      language: 'python',
      source,
      ...(raw.listView ? { listView: raw.listView } : {}),
      steps: raw.steps.map((s) => ({
        ...s,
        explain: s.error ? { what: errorSentence(s.error.type), life: '' } : genericExplanation(source, s.line),
      })),
    },
  };
}
