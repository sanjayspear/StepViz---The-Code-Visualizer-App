// Java: switch that gives a value (arrow and yield forms) and var (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
});
const prog = (body: string) => `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
const run = (body: string) => runJava(parser.parse(prog(body))!, { maxSteps: 2000, maxSeconds: 5 });

test('switch as a value: arrow cases, several labels, a block with yield, old-style cases with yield', () => {
  const body = `        int total = 0;
        for (int m = 1; m <= 4; m++) {
            int days = switch (m) {
                case 2 -> 28;
                case 4, 6, 9, 11 -> 30;
                default -> {
                    int extra = 1;
                    yield 30 + extra;
                }
            };
            total += days;
        }
        String size = switch (total) {
            case 120: yield "small";
            default: yield "other";
        };
        System.out.println(total + " " + size);`;
  const r = run(body);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('120 small\n');
  const src = prog(body);
  const e = explainTrace({ language: 'java', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  const firstDays = r.steps.findIndex((s) => s.line === 6 && s.kind === 'assign');
  expect(r.steps[firstDays].frames[0].vars.days).toBe('31');
  expect(e[firstDays].what).toMatch(/days/);
});

test('var takes its type from the value, like Java', () => {
  const r = run(`        var n = 5;
        var name = "Sam";
        var list = new ArrayList<Integer>();
        list.add(n);
        for (var x : list) {
            n += x;
        }
        var words = new ArrayList<String>(List.of("a", "b"));
        for (var w : words) {
            name += w;
        }
        System.out.println(n + " " + name + " " + list);`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('10 Samab [5]\n');
  expect(r.steps[0].frames[0].vars.n).toBe('5');
});

test("Java's rules for switch values and var stay on Home", () => {
  const msg = (body: string) => run(body).error?.message;
  expect(msg('        int m = 1;\n        int d = switch (m) {\n            case 1 -> 31;\n        };')).toBe('Line 5: A switch that gives a value needs a default part (default -> ...).');
  expect(msg('        var x;')).toBe('Line 4: var needs a value here, so Java can tell its type (var x = ...;).');
  expect(msg('        var x = null;')).toBe("Line 4: var can't start as null: write the type instead.");
  expect(msg('        var n = 5;\n        n = "text";')).toBe("Line 5: n is an int box, so it can't hold \"text\".");
});
