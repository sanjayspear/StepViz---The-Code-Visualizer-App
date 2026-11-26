// Practice in Java: every test set passes against its Java reference solution, run through the app's
// own Java harness (src/practice/javaHarness.ts) and StepViz's Java interpreter, like the Java worker.
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import data from '../src/practice/questions.json' with { type: 'json' };
import { JAVA_TOPICS } from '../src/practice/content';
import { PYTHON_WORDS } from '../src/practice/content/javascript/shared';
import type { PracticeContent } from '../src/practice/content/types';
import { checkJavaAnswer } from '../src/practice/javaHarness';
import type { JsForbid } from '../src/practice/jsHarness';
import { createParser } from '../src/runner/treeSitter';
import { JAVA_SOLUTIONS_BY_TOPIC } from './practice/java';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
});
const check = (source: string, c: PracticeContent) => checkJavaAnswer(parser, source, { tests: c.tests, forbid: c.forbid as JsForbid | undefined }, { maxSeconds: 10 });

for (const [topic, items] of Object.entries(JAVA_TOPICS)) {
  const solutions = JAVA_SOLUTIONS_BY_TOPIC[topic];
  test(`Java ${topic}: content for every question of the topic, well formed`, () => {
    const ids = data.questions.filter((q) => q.topic === topic).map((q) => q.id);
    expect(items.map((c) => c.id)).toEqual(ids);
    const pythonHints = items.filter((c) => PYTHON_WORDS.test(c.hint)).map((c) => `Q${c.id}: ${c.hint.match(PYTHON_WORDS)![0]}`);
    expect(pythonHints, 'hints that still talk Python').toEqual([]);
    for (const c of items) {
      expect(c.example, `Q${c.id}`).toMatch(/^Example: /);
      expect(`${c.example}\n${c.starter}`, `Q${c.id}: no TODO left`).not.toContain('TODO');
      expect(c.hint, `Q${c.id}: the hint ends with a real-life comparison`).toMatch(/ Like [^.]+[.!]$|Like .+\.$/);
      expect(`${c.example}\n${c.starter}`, `Q${c.id}: no Python words in the example or starter`).not.toMatch(/\b(True|False|None|self|elif)\b|\bdef \w+\(|print\(/);
      expect(c.starter, `Q${c.id}: a public class Main`).toContain('public class Main {');
      expect(c.starter, `Q${c.id}: main() tries the method once, so it can be visualised`).toMatch(/System\.out\.println\(/);
      for (const t of c.tests) {
        if (t.call === '$ops') expect(c.starter, `Q${c.id}: the starter defines class ${t.cls}`).toMatch(new RegExp(`class ${t.cls}\\b`));
        else expect(c.starter, `Q${c.id}: the starter defines ${t.call}`).toMatch(new RegExp(`static [^=;(]+ ${t.call}\\(`));
      }
    }
  });

  for (const c of items) {
    test(`Java ${topic} Q${c.id}: the reference solution passes all ${c.tests.length} tests; the starter runs but does not pass`, () => {
      expect(solutions?.[c.id], `Q${c.id}: a reference solution exists`).toBeTruthy();
      const ref = check(solutions[c.id], c);
      expect(ref.status, JSON.stringify(ref)).toBe('ok');
      for (const r of ref.results) expect(r.passed, `${r.call}: expected ${r.expected}, got ${r.got} ${r.problem ?? ''} ${r.errorType ?? ''} ${r.message ?? ''} ${r.line ?? ''}`).toBe(true);
      const start = check(c.starter, c);
      expect(start.status, JSON.stringify(start)).toBe('ok');
      expect(start.results.some((r) => !r.passed)).toBe(true);
    });
  }
}
