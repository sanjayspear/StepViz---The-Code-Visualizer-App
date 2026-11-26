// Sets: Java HashSet / TreeSet / LinkedHashSet and C++ std::set (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';

let java: Parser;
let cpp: Parser;
test.beforeAll(async () => {
  const engine = 'node_modules/web-tree-sitter/web-tree-sitter.wasm';
  java = await createParser({ engine, grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
  cpp = await createParser({ engine, grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
});
const opts = { maxSteps: 2000, maxSeconds: 5 };
const jprog = (body: string) => `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`;

test('Java HashSet: print order like Java, add tells whether it was new, sentences read item by item', () => {
  const src = jprog('        Set<String> seen = new HashSet<>();\n        seen.add("pear");\n        seen.add("apple");\n        boolean again = seen.add("pear");\n        seen.add("fig");\n        seen.remove("apple");\n        System.out.println(seen + " " + again + " " + seen.contains("fig") + " " + seen.size());');
  const r = runJava(java.parse(src)!, opts);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('[pear, fig] false true 2\n');
  const e = explainTrace({ language: 'java', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  expect(r.steps[1].frames[0].vars.seen).toBe('{"pear"}');
  expect(e[1].what).toMatch(/^("pear" is added to seen|seen gets "pear")\.$/);
  expect(e[5].what).toBe('"apple" is taken out of seen.');
});

test('Java TreeSet / LinkedHashSet, a set made from a list (duplicates go), for-each, first/last, changing a set inside its for-each', () => {
  const out = (body: string) => runJava(java.parse(jprog(body))!, opts).steps.at(-1)!.output;
  expect(
    out(`        List<Integer> nums = new ArrayList<>(List.of(5, 3, 5, 1, 3));
        TreeSet<Integer> sorted = new TreeSet<>(nums);
        Set<Integer> order = new LinkedHashSet<>(nums);
        int total = 0;
        for (int x : sorted) {
            total += x;
        }
        System.out.println(sorted + " " + order + " " + total + " " + sorted.first() + " " + sorted.last());`),
  ).toBe('[1, 3, 5] [5, 3, 1] 9 1 5\n');
  const r = runJava(java.parse(jprog('        Set<Integer> s = new HashSet<>(List.of(1, 2));\n        for (int x : s) {\n            s.add(x + 10);\n        }'))!, opts);
  expect(r.error).toMatchObject({ type: 'ConcurrentModificationException' });
});

test('C++ std::set: sorted, insert keeps one of each, erase / count / find, range-for', () => {
  const src = '#include <iostream>\n#include <set>\nusing namespace std;\n\nint main() {\n    set<int> s = {5, 1, 3};\n    s.insert(3);\n    s.insert(2);\n    s.erase(5);\n    int total = 0;\n    for (int x : s) {\n        total += x;\n    }\n    cout << s.size() << " " << total << " " << s.count(1) << " " << (s.find(9) == s.end()) << endl;\n    return 0;\n}';
  const r = runCpp(cpp.parse(src)!, opts);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('3 6 1 1\n');
  const e = explainTrace({ language: 'cpp', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  expect(r.steps[0].frames[0].vars.s).toBe('{1, 3, 5}');
  expect(e[1].what).toBe('s does not change: a set holds each value only once.');
  expect(e[2].what).toMatch(/^(2 is added to s|s gets 2)\.$/);
  expect(e[3].what).toBe('5 is taken out of s.');
  expect(runCpp(cpp.parse('#include <unordered_set>\nint main() {\n    return 0;\n}')!, opts).status).toBe('syntax-error');
});
