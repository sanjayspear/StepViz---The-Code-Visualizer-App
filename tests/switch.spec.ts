// switch in JavaScript, Java, C++ and C (Node): the switch-case step and its explanation.
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJs } from '../src/runner/js/runtime';
import { runJava } from '../src/runner/java/interpreter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';
import type { RawRunResult } from '../src/runner/protocol';
import type { Trace } from '../src/trace/types';

const opts = { maxSteps: 2000, maxSeconds: 5 };
const engine = 'node_modules/web-tree-sitter/web-tree-sitter.wasm';
let java: Parser, cpp: Parser, c: Parser;
test.beforeAll(async () => {
  java = await createParser({ engine, grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
  cpp = await createParser({ engine, grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
  c = await createParser({ engine, grammar: 'node_modules/tree-sitter-c/tree-sitter-c.wasm' });
});

const explain = (language: string, source: string, r: RawRunResult) =>
  explainTrace({ language, source, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) } as Trace);
/** The switch step: its case label and explanation. */
const switchStep = (language: string, source: string, r: RawRunResult) => {
  expect(r.status, JSON.stringify(r.error)).toBe('ok');
  const i = r.steps.findIndex((s) => s.kind === 'switch-case');
  return { label: r.steps[i].detail?.caseLabel, ...explain(language, source, r)[i], output: r.steps.at(-1)!.output };
};

const javaSrc = (day: number) => `public class Main {
    public static void main(String[] args) {
        int day = ${day};
        switch (day) {
            case 1:
            case 7:
                System.out.println("weekend");
                break;
            case 3:
                System.out.println("midweek");
            default:
                System.out.println("weekday");
        }
    }
}`;
const cSrc = (n: number) => `#include <stdio.h>
int main() {
    int n = ${n};
    switch (n) {
        case 1:
            printf("one\\n");
            break;
        case 2:
            printf("two\\n");
            break;
    }
    return 0;
}`;
const cppSrc = (ch: string) => `#include <iostream>
using namespace std;
int main() {
    char grade = '${ch}';
    switch (grade) {
        case 'A':
            cout << "great" << endl;
            break;
        default:
            cout << "keep going" << endl;
    }
    return 0;
}`;
const jsSrc = (x: string) => `const fruit = "${x}";
switch (fruit) {
  case "apple":
    console.log("red");
    break;
  case "kiwi":
  case "lime":
    console.log("green");
    break;
}`;

test('Java: empty cases join the next one; fall-through runs on until break; default', () => {
  const run = (d: number) => switchStep('java', javaSrc(d), runJava(java.parse(javaSrc(d))!, opts));
  expect(run(7)).toMatchObject({ label: '1 or 7', output: 'weekend\n' });
  expect(run(7).what).toMatch(/^(day is 7, so the switch jumps to case 1 or 7\.|The switch looks at day \(7\) and goes to case 1 or 7\.)$/);
  expect(run(3)).toMatchObject({ label: '3', output: 'midweek\nweekday\n' });
  expect(run(4)).toMatchObject({ label: 'default', what: 'day is 4 and no case matches, so the default part runs.', output: 'weekday\n' });
  expect(run(4).life).not.toBe('');
});

test('Java: arrow cases, text and continue inside a loop; switch as a value works', () => {
  const src = `public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 3; i++) {
            String s = i == 0 ? "a" : "b";
            switch (s) {
                case "a" -> System.out.println("A");
                case "b", "c" -> {
                    if (i == 1) continue;
                    System.out.println("B");
                }
            }
        }
    }
}`;
  expect(runJava(java.parse(src)!, opts).steps.at(-1)!.output).toBe('A\nB\n');
  const value = 'public class Main {\n    public static void main(String[] args) {\n        int y = switch (2) { case 2 -> 5; default -> 0; };\n    }\n}';
  // A switch that gives a value works now (switchvar-java.spec.ts has more).
  expect(runJava(java.parse(value)!, opts).steps.at(-1)!.frames[0].vars.y).toBe('5');
});

test('C: no case matches and there is no default, so the switch is skipped', () => {
  const run = (n: number) => switchStep('c', cSrc(n), runCpp(c.parse(cSrc(n))!, { ...opts, dialect: 'c' }));
  expect(run(2)).toMatchObject({ label: '2', output: 'two\n' });
  expect(run(9)).toMatchObject({ label: undefined, what: 'n is 9 and no case matches, so the whole switch is skipped.', output: '' });
});

test('C++: switch on a char', () => {
  const run = (ch: string) => switchStep('cpp', cppSrc(ch), runCpp(cpp.parse(cppSrc(ch))!, opts));
  expect(run('A')).toMatchObject({ label: "'A'", output: 'great\n' });
  expect(run('B')).toMatchObject({ label: 'default', output: 'keep going\n' });
});

test('JavaScript: same switch step', () => {
  const run = (x: string) => switchStep('javascript', jsSrc(x), runJs(jsSrc(x), opts));
  expect(run('lime')).toMatchObject({ label: '"kiwi" or "lime"', output: 'green\n' });
  expect(run('plum')).toMatchObject({ label: undefined, what: 'fruit is "plum" and no case matches, so the whole switch is skipped.' });
});
