// Practice in C: every test set passes against its C reference solution, run through the app's
// own C++ harness in C mode (src/practice/cppHarness.ts) and StepViz's C interpreter, like the C worker.
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import data from '../src/practice/questions.json' with { type: 'json' };
import { C_TOPICS } from '../src/practice/content';
import { PYTHON_WORDS } from '../src/practice/content/javascript/shared';
import type { PracticeContent } from '../src/practice/content/types';
import { checkCppAnswer } from '../src/practice/cppHarness';
import { runCpp } from '../src/runner/cpp/interpreter';
import type { JsForbid } from '../src/practice/jsHarness';
import { createParser } from '../src/runner/treeSitter';
import { C_SOLUTIONS_BY_TOPIC } from './practice/c';

// isalpha, isdigit and isalnum are C functions too.
const PYTHON_ONLY = new RegExp(PYTHON_WORDS.source.replace('|isdigit|isalpha|isalnum', ''));

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-c/tree-sitter-c.wasm' });
});
const check = (source: string, c: PracticeContent) => checkCppAnswer(parser, source, { tests: c.tests, forbid: c.forbid as JsForbid | undefined }, { maxSeconds: 10, dialect: 'c' });

for (const [topic, items] of Object.entries(C_TOPICS)) {
  const solutions = C_SOLUTIONS_BY_TOPIC[topic];
  test(`C ${topic}: content for the questions that fit C, well formed`, () => {
    // Only the questions that fit C, in order; each one belongs to this topic.
    const ids = data.questions.filter((q) => q.topic === topic).map((q) => q.id);
    expect(items.length).toBeGreaterThan(0);
    expect(items.map((c) => c.id).every((id) => ids.includes(id))).toBe(true);
    const pythonHints = items.filter((c) => PYTHON_ONLY.test(c.hint)).map((c) => `Q${c.id}: ${c.hint.match(PYTHON_ONLY)![0]}`);
    expect(pythonHints, 'hints that still talk Python').toEqual([]);
    for (const c of items) {
      expect(c.example, `Q${c.id}`).toMatch(/^Example: /);
      expect(`${c.example}\n${c.starter}`, `Q${c.id}: no TODO left`).not.toContain('TODO');
      expect(c.hint, `Q${c.id}: the hint ends with a real-life comparison`).toMatch(/ Like [^.]+[.!]$|Like .+\.$/);
      expect(`${c.example}\n${c.starter}`, `Q${c.id}: no Python words in the example or starter`).not.toMatch(/\b(True|False|None|self|elif)\b|\bdef \w+\(|print\(/);
      expect(c.starter, `Q${c.id}: an int main()`).toContain('int main() {');
      expect(c.starter, `Q${c.id}: main() tries the function once, so it can be visualised`).toMatch(/printf\(|puts\(/);
      expect(c.starter, `Q${c.id}: C, not C++`).not.toMatch(/\b(cout|cin|vector|std::|using namespace|string |nullptr)\b/);
      for (const t of c.tests) {
        if (t.call === '$ops') expect(c.starter, `Q${c.id}: the starter defines class ${t.cls}`).toMatch(new RegExp(`class ${t.cls}\\b`));
        else expect(c.starter, `Q${c.id}: the starter defines ${t.call}`).toMatch(new RegExp(`^[\\w<>:, *&]+ ${t.call}\\(`, 'm'));
      }
    }
  });

  for (const c of items) {
    test(`C ${topic} Q${c.id}: the reference solution passes all ${c.tests.length} tests; the starter runs but does not pass`, () => {
      expect(solutions?.[c.id], `Q${c.id}: a reference solution exists`).toBeTruthy();
      const ref = check(solutions[c.id], c);
      expect(ref.status, JSON.stringify(ref)).toBe('ok');
      for (const r of ref.results) expect(r.passed, `${r.call}: expected ${r.expected}, got ${r.got} ${r.problem ?? ''} ${r.errorType ?? ''} ${r.message ?? ''} ${r.line ?? ''}`).toBe(true);
      // The starter's own main() runs in the visualiser.
      const shown = runCpp(parser.parse(c.starter)!, { maxSteps: 2000, maxSeconds: 5, dialect: 'c' });
      expect(shown.status, `Q${c.id}: the starter's main() runs: ${JSON.stringify(shown.error)}`).toBe('ok');
      const start = check(c.starter, c);
      expect(start.status, JSON.stringify(start)).toBe('ok');
      expect(start.results.some((r) => !r.passed)).toBe(true);
    });
  }
}
