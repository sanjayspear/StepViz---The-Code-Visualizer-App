// Phase 1 generic explanation for pasted code (spec section 7):
// "Line 4 runs: return n * factorial(n - 1)". There is no "In real life"
// comparison for pasted code in Phase 1 (life is empty).
import type { TraceStep } from './types';

export function genericExplanation(source: string, line: number): TraceStep['explain'] {
  const text = (source.split('\n')[line - 1] ?? '').trim();
  return { what: `Line ${line} runs: ${text}`, life: '' };
}
