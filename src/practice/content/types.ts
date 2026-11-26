// Hand-written Practice content (P2): starter code, tests and a hint for one question in one
// language. Kept apart from questions.json, which the script rebuilds from the PDF.
// Every test set is checked against a reference solution in tests/practice-python.spec.ts.

/** A value as JSON: numbers, text, true/false, null, lists. Python tuples are compared as lists. */
export type Value = number | string | boolean | null | Value[] | { [key: string]: Value };

export interface PracticeTest {
  /** the function to call */
  call: string;
  args: Value[];
  expected: Value;
  /** exact (the default), approx (numbers within 1e-9), unordered (a list in any order) */
  compare?: 'exact' | 'approx' | 'unordered';
}

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
  forbid?: { names?: string[]; ops?: string[]; why: string };
}
