// Accuracy guard: AI text may only use facts from the exact trace. Every number
// and every variable name in the text must appear in that step's trace data
// (line number and code, variables, output, call stack, list). Otherwise the
// text is thrown away and the normal "Line N runs: ..." text stays.
import type { Trace } from '../trace/types';

/** Number words checked like digits. ("one", "first", "second" are left out: in
 *  plain English they are usually not numbers, as in "a new one opens".) */
const NUMBER_WORDS: Record<string, number> = {
  zero: 0, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20,
};

/** Common English words that are also short variable names; not checked as names. */
const ENGLISH = new Set(['a', 'an', 'and', 'as', 'at', 'be', 'by', 'do', 'if', 'in', 'is', 'it', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'we', 'the']);

const IDENT = /[A-Za-z_][A-Za-z0-9_]*/g;
const NUMBER = /(?<![A-Za-z_\d.])-?\d+(?:\.\d+)?/g;

const numbersIn = (text: string): number[] => (text.match(NUMBER) ?? []).map(Number);
const functionName = (frameName: string) => frameName.replace(/\(.*$/, '');

/** Everything the trace says about step `index`, as text. */
function stepText(trace: Trace, index: number): { text: string; names: Set<string> } {
  const step = trace.steps[index];
  const code = trace.source.split('\n')[step.line - 1] ?? '';
  const parts = [String(step.line), code, step.output];
  const names = new Set<string>(code.match(IDENT) ?? []);
  for (const f of step.frames) {
    parts.push(f.name, f.returns ?? '');
    names.add(functionName(f.name));
    for (const [k, v] of Object.entries(f.vars)) {
      parts.push(k, v);
      names.add(k);
    }
  }
  if (step.list) {
    parts.push(step.list.values.join(' '));
    if (trace.listView) names.add(trace.listView.list);
  }
  if (step.error) parts.push(step.error.type, step.error.message);
  return { text: parts.join('\n'), names };
}

/** Variable and function names used anywhere in the trace. */
function programNames(trace: Trace): Set<string> {
  const names = new Set<string>();
  for (const step of trace.steps) {
    for (const f of step.frames) {
      names.add(functionName(f.name));
      Object.keys(f.vars).forEach((k) => names.add(k));
    }
  }
  if (trace.listView) names.add(trace.listView.list);
  names.delete('Global');
  return names;
}

export interface GuardResult {
  ok: boolean;
  /** Why the text was rejected (for tests and debugging). */
  reason?: string;
}

export function checkGrounded(texts: string[], trace: Trace, index: number): GuardResult {
  const { text: facts, names: stepNames } = stepText(trace, index);
  const allowedNumbers = new Set(numbersIn(facts));
  const known = programNames(trace);

  for (const text of texts) {
    for (const n of numbersIn(text)) {
      if (!allowedNumbers.has(n)) return { ok: false, reason: `number ${n} is not in the trace for this step` };
    }
    for (const word of text.match(/[A-Za-z]+/g) ?? []) {
      const n = NUMBER_WORDS[word.toLowerCase()];
      if (n !== undefined && !allowedNumbers.has(n)) {
        return { ok: false, reason: `number word "${word}" is not in the trace for this step` };
      }
    }
    for (const word of text.match(IDENT) ?? []) {
      if (ENGLISH.has(word) || !known.has(word)) continue;
      if (!stepNames.has(word)) return { ok: false, reason: `name "${word}" is not in the trace for this step` };
    }
  }
  return { ok: true };
}
