// Java HashMap / TreeMap / LinkedHashMap (Node). Printing follows Java's real order.
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
});
const opts = { maxSteps: 2000, maxSeconds: 5 };
/** import java.util.*; then main's body from line 4. */
const prog = (body: string) => `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
const run = (src: string) => runJava(parser.parse(src)!, opts);
const out = (body: string) => {
  const r = run(prog(body));
  if (r.status !== 'ok') throw new Error(JSON.stringify(r.error));
  return r.steps.at(-1)!.output;
};

test('HashMap prints in the same order as Java (hash buckets); frames and sentences read key by key', () => {
  const src = prog('        Map<String, Integer> m = new HashMap<>();\n        m.put("apple", 1);\n        m.put("banana", 2);\n        m.put("cherry", 3);\n        m.put("apple", 5);\n        m.remove("banana");\n        System.out.println(m);');
  const r = run(src);
  const e = explainTrace({ language: 'java', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  expect(r.steps[2].frames[0].vars.m).toBe('{"banana": 2, "apple": 1}');
  expect(e[1].what).toMatch(/^(m gets a new key "apple" with the value 1|"apple" is added to m with the value 1)\.$/);
  expect(e[4].what).toBe('m["apple"] changes from 1 to 5.');
  expect(e[5].what).toBe('"banana" is taken out of m.');
  expect(r.steps.at(-1)!.output).toBe('{apple=5, cherry=3}\n');
  expect(out('        Map<Integer, String> nums = new HashMap<>();\n        for (int i = 20; i > 0; i -= 3) {\n            nums.put(i, "n" + i);\n        }\n        System.out.println(nums);')).toBe(
    '{17=n17, 2=n2, 20=n20, 5=n5, 8=n8, 11=n11, 14=n14}\n',
  );
});

test('counting words: getOrDefault, TreeMap order, entrySet / keySet / values, LinkedHashMap keeps insertion order', () => {
  expect(
    out(`        String[] words = {"pear", "fig", "pear", "apple"};
        Map<String, Integer> counts = new TreeMap<>();
        for (String w : words) {
            counts.put(w, counts.getOrDefault(w, 0) + 1);
        }
        for (Map.Entry<String, Integer> e : counts.entrySet()) {
            System.out.print(e.getKey() + "=" + e.getValue() + " ");
        }
        Map<String, Integer> seen = new LinkedHashMap<>();
        seen.put("z", 1);
        seen.put("a", 2);
        int total = 0;
        for (int v : seen.values()) {
            total += v;
        }
        System.out.println(seen.keySet() + " " + total + " " + counts.size() + " " + counts.containsKey("fig") + " " + seen.get("q"));`),
  ).toBe('apple=1 fig=1 pear=2 [z, a] 3 3 true null\n');
});

test('Java rules: unboxing a missing key, changing a map inside its for-each, maps of int, walking a map directly', () => {
  expect(run(prog('        Map<String, Integer> m = new HashMap<>();\n        int n = m.get("x");')).error).toMatchObject({ type: 'NullPointerException', line: 5 });
  expect(
    run(prog('        Map<String, Integer> m = new HashMap<>();\n        m.put("a", 1);\n        m.put("b", 2);\n        for (String k : m.keySet()) {\n            m.remove("b");\n        }')).error,
  ).toMatchObject({ type: 'ConcurrentModificationException' });
  const msg = (body: string) => run(prog(body)).error?.message;
  expect(msg('        Map<String, int> m = new HashMap<>();')).toBe('Line 4: A Map holds objects, not int values: write Integer instead of int.');
  expect(msg('        Map<String, Integer> m = new HashMap<>();\n        for (String k : m) {\n        }')).toBe("Line 5: A map can't be walked directly: use m.keySet(), .values() or .entrySet().");
});
