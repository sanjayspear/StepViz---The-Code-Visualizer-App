// Hand-written Practice content (P2): starter code, tests and a hint for one question in one
// language. Kept apart from questions.json, which the script rebuilds from the PDF.
// Every test set is checked against a reference solution in tests/practice-python.spec.ts.

/** A value as JSON: numbers, text, true/false, null, lists. Python tuples are compared as lists. */
export type Value = number | string | boolean | null | Value[] | { [key: string]: Value };

/**
 * One test (see src/practice/harness.py for the details). Arguments may hold markers that
 * build values: {$list: [1, 2]} a linked list, {$cycle: [...], pos}, {$tree: [level order]},
 * {$randlist: [[val, randomIndex]]}, {$graph: [[neighbours of node 1], ...]}, {$guess: n},
 * {$bad: n}, {$reader: [...]}. Answers made of nodes are compared in the same marker form.
 */
export interface PracticeTest {
  /** the function to call, or "$ops" to make an object of `cls` and call its methods */
  call: string;
  args?: Value[];
  expected: Value;
  /**
   * exact (default), approx, unordered (a list in any order), sets (any order inside too),
   * output (what was printed), or a shape check: topo, peak, gray, inorder
   */
  compare?: 'exact' | 'approx' | 'unordered' | 'sets' | 'output' | 'topo' | 'peak' | 'gray' | 'inorder' | 'balanced';
  /** the argument after the call (in-place questions); prefix: only its first <answer> items */
  mutated?: { arg: number; value: Value; prefix?: boolean; check?: 'negfirst' };
  /** a node of the input list reported by its position or its value */
  returns?: 'index' | 'value';
  /** a second function applied to the answer (serialize, then deserialize) */
  then?: string;
  /** the answer must be new nodes, not the input's */
  copy?: boolean;
  /** two lists that share a tail: a + common and b + common */
  setup?: { intersect: { a: Value[]; b: Value[]; common: Value[] } };
  /** the expected dictionary has number keys: {"1": 2} here means {1: 2} */
  intKeys?: boolean;
  /** "$ops": the class and the calls, [["LRUCache", 2], ["put", 1, 1], ["get", 1]] */
  cls?: string;
  ops?: Value[][];
}

/**
 * A dictionary or set written with braces ({} or {1, 2}) where a value starts: after =, (, [, ",",
 * ":", return or yield. Not the braces inside f-strings, which newer Python tokenizes too.
 */
export const DICT_LITERAL = { regex: '(^|[=(\\[,:]|return|yield)\\{', shown: '{ }' };

export interface PracticeContent {
  /** question number (questions.json) */
  id: number;
  /** one line under the title: "Example: factorial(4) returns 24." */
  example: string;
  /** the code the student starts from (never stored) */
  starter: string;
  tests: PracticeTest[];
  /** a nudge in plain words, ending with a real-life comparison; never the whole answer */
  hint: string;
  /** what the question asks not to use ("without using %"), checked by Python's tokenizer */
  forbid?: { names?: string[]; ops?: string[]; patterns?: { regex: string; shown: string }[]; why: string };
}
