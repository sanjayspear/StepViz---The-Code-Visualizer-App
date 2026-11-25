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
  // Java
  ArithmeticException: "Java can't divide a whole number by zero.",
  ArrayIndexOutOfBoundsException: 'This position is outside the list.',
  StringIndexOutOfBoundsException: 'This position is outside the text.',
  NullPointerException: "This box is empty (null), so it can't be used here.",
  NoSuchElementException: 'Your program asked for more input than you typed.',
  InputMismatchException: 'The input was not the kind of value the program expected.',
  NumberFormatException: 'This text is not a number.',
  IndexOutOfBoundsException: 'This position is outside the list.',
  ConcurrentModificationException: 'The list was changed while a for-each loop was going through it.',
  IllegalArgumentException: "This value can't be used here.",
  // C++ (StepViz stops where real C++ would quietly give garbage)
  DivideByZero: "{lang} can't divide a whole number by zero.",
  BadFormat: 'The printf pattern does not match this value.',
  IndexOutOfRange: 'This position is outside the list.',
  out_of_range: 'This position is outside the list.',
  Uninitialized: 'This box was used before it was given a value.',
  NoMoreInput: 'Your program asked for more input than you typed.',
  BadInput: 'The input was not the kind of value the program expected.',
};

const LANGUAGE_NAMES = { python: 'Python', javascript: 'JavaScript', java: 'Java', cpp: 'C++', c: 'C' } as const;

/** A plain-words sentence for an error type. */
export function errorSentence(type: string, language: keyof typeof LANGUAGE_NAMES = 'python'): string {
  const name = LANGUAGE_NAMES[language] ?? 'Python';
  return (ERROR_SENTENCES[type] ?? '{lang} stopped with an error.').replace('{lang}', name);
}

/** The raw Python message, e.g. "ZeroDivisionError: division by zero". */
export function rawErrorText(error: { type: string; message: string }): string {
  return error.message ? `${error.type}: ${error.message}` : error.type;
}
