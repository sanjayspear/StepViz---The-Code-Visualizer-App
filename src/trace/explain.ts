// Phase 1 explanations that are not hand-written.
import type { TraceStep } from './types';

/**
 * Generic explanation for pasted code (spec section 7):
 * "Line 4 runs: return n * factorial(n - 1)". Pasted code has no
 * "In real life" comparison in Phase 1 (life is empty).
 */
export function genericExplanation(source: string, line: number): TraceStep['explain'] {
  const text = (source.split('\n')[line - 1] ?? '').trim();
  return { what: `Line ${line} runs: ${text}`, life: '' };
}

const ERROR_SENTENCES: Record<string, string> = {
  ZeroDivisionError: "Python can't divide a number by zero.",
  NameError: 'This name was used before it was given a value.',
  UnboundLocalError: 'This name was used before it was given a value.',
  IndexError: 'This position is outside the list.',
  TypeError: "These values can't be used together like this.",
  KeyError: 'This key is not in the dictionary.',
  ValueError: "This value can't be used here.",
  // JavaScript
  ReferenceError: 'This name was used before it was given a value.',
};

/** A plain-words sentence for an error type. */
export function errorSentence(type: string, language: 'python' | 'javascript' = 'python'): string {
  return ERROR_SENTENCES[type] ?? `${language === 'javascript' ? 'JavaScript' : 'Python'} stopped with an error.`;
}

/** The raw Python message, e.g. "ZeroDivisionError: division by zero". */
export function rawErrorText(error: { type: string; message: string }): string {
  return error.message ? `${error.type}: ${error.message}` : error.type;
}
