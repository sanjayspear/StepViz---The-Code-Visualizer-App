// JavaScript Practice content is built on the Python content of the same question: the tests are the
// same values (checked in tests/practice-js.spec.ts against JavaScript reference solutions), with the
// names written the JavaScript way (two_sum -> twoSum). The example, the starter code, the "without X"
// rule and any hint that talks about Python itself are written for JavaScript.
import type { PracticeContent, PracticeTest } from '../types';
import type { JsForbid } from '../../jsHarness';

export interface JsPart {
  example: string;
  starter: string;
  /** only when the Python hint talks about Python itself (checked in tests/practice-js.spec.ts) */
  hint?: string;
  /** required when the Python question has a rule; null when JavaScript needs none */
  forbid?: JsForbid | null;
  /** only when a test must differ from the Python one */
  tests?: PracticeTest[];
}

/** two_sum_sorted -> twoSumSorted (class names and camelCase names stay as they are). */
export const camel = (name: string) => name.replace(/_([a-z0-9])/g, (_m, c: string) => c.toUpperCase());

export function jsTests(tests: PracticeTest[]): PracticeTest[] {
  return tests.map((t) => {
    const out: PracticeTest = { ...t, call: t.call === '$ops' ? '$ops' : camel(t.call) };
    if (t.then) out.then = camel(t.then);
    if (t.ops) out.ops = t.ops.map((op, i) => (i === 0 ? op : [camel(op[0] as string), ...op.slice(1)]));
    delete out.intKeys; // JavaScript object keys are text anyway
    return out;
  });
}

export function fromPython(python: PracticeContent[], parts: Record<number, JsPart>): PracticeContent[] {
  return python.map((py) => {
    const js = parts[py.id];
    if (!js) throw new Error(`JavaScript content for Q${py.id} is missing`);
    if (py.forbid && js.forbid === undefined) throw new Error(`Q${py.id}: the Python rule needs a JavaScript version (or forbid: null)`);
    return {
      id: py.id,
      example: js.example,
      starter: js.starter,
      tests: js.tests ?? jsTests(py.tests),
      hint: js.hint ?? py.hint,
      ...(js.forbid ? { forbid: js.forbid } : {}),
    };
  });
}

/** Words that only make sense in Python: a hint using them needs a JavaScript version. */
export const PYTHON_WORDS =
  /\b(Python|True|False|None|def|self|dict|dictionary|tuple|heapq|deque|append|enumerate|elif|nonlocal|Counter|cmp_to_key|isdigit|isalpha|isalnum|popleft|f-string|bisect)\b|\b(sorted|zip|ord|chr)\(|\b[a-z]+_[a-z0-9_]+\(|float\("inf"\)|\blen\(|\brange\(|\bprint\(|\bstr\(|\bint\(|\blist\(|\bset\(|\.lower\(\)|\.upper\(\)|\[::-1\]|\/\/|\[1:\]|\[:-1\]|\[1:-1\]|\[i:\]|\[:i\]|\[j:i\]|s\[[a-z0-9 +-]*:[a-z0-9 +-]*\]/;
