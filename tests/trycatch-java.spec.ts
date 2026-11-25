// Java try / catch / finally / throw (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({
    engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm',
    grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm',
  });
});

const opts = { maxSteps: 2000, maxSeconds: 5 };
/** main's body starts on line 3 (or after the methods). */
const prog = (body: string, methods = '') => `public class Main {\n${methods}    public static void main(String[] args) {\n${body}\n    }\n}`;
const run = (src: string, input = '') => runJava(parser.parse(src)!, { ...opts, input });
const explain = (src: string, input = '') => {
  const r = run(src, input);
  return { r, e: explainTrace({ language: 'java', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) }) };
};
const out = (src: string, input = '') => {
  const r = run(src, input);
  if (r.status !== 'ok') throw new Error(JSON.stringify(r.error));
  return r.steps.at(-1)!.output;
};

test('a caught ArithmeticException: the failing line is a catch step, then the catch part runs', () => {
  const src = prog(`        int x = 0;
        try {
            x = 10 / 0;
            System.out.println("not shown");
        } catch (ArithmeticException e) {
            System.out.println("Oops: " + e.getMessage());
        } finally {
            System.out.println("done");
        }
        System.out.println(x);`);
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  expect(r.steps.map((s) => [s.line, s.kind])).toEqual([[3, 'assign'], [5, 'catch'], [8, 'print'], [10, 'print'], [12, 'print']]);
  expect(r.steps[1].detail).toEqual({ errorType: 'ArithmeticException' });
  expect(r.steps[1].frames[0].status).toBe('running');
  expect(r.steps[2].frames[0].vars.e).toBe('ArithmeticException: / by zero');
  expect(r.steps.at(-1)!.output).toBe('Oops: / by zero\ndone\n0\n');
  expect(e[1].what).toMatch(/^Java can't divide a whole number by zero\. (Instead of stopping, the program jumps to the catch part|The catch part takes over, so the program does not stop)\.$/);
  expect(e[1].life).not.toBe('');
});

test('throw: caught in the caller, with the message; println(e) shows the full name', () => {
  const methods = `    static int checkAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("Age can't be negative");
        }
        return age;
    }

`;
  const src = prog(`        try {
            int a = checkAge(-5);
        } catch (IllegalArgumentException e) {
            System.out.println(e);
        }`, methods);
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  const c = r.steps.find((s) => s.kind === 'catch')!;
  expect(c.line).toBe(11);
  expect(c.detail).toEqual({ errorType: 'IllegalArgumentException', errorMessage: "Age can't be negative", thrown: true });
  expect(c.frames.map((f) => f.name)).toEqual(['main()']);
  expect(r.steps.at(-1)!.output).toBe("java.lang.IllegalArgumentException: Age can't be negative\n");
  expect(e[r.steps.indexOf(c)].what).toMatch(/^(The program throws an IllegalArgumentException with the message "Age can't be negative", and the catch part takes over|This line throws an IllegalArgumentException with the message "Age can't be negative"\. Instead of stopping, the program jumps to the catch part)\.$/);
});

test('catch by parent type, multi-catch, the first matching catch wins, finally runs on return', () => {
  expect(
    out(
      prog(`        int[] a = new int[2];
        try {
            a[5] = 1;
        } catch (NullPointerException | IndexOutOfBoundsException e) {
            System.out.println("index: " + e.getMessage());
        } catch (RuntimeException e) {
            System.out.println("other");
        }
        try {
            Integer.parseInt("abc");
        } catch (IllegalArgumentException e) {
            System.out.println("bad number");
        }
        System.out.println(f());`, `    static int f() {
        try {
            return 1;
        } finally {
            System.out.println("finally first");
        }
    }

`),
    ),
  ).toBe('index: Index 5 out of bounds for length 2\nbad number\nfinally first\n1\n');
});

test('Scanner input mistakes can be caught and the loop asks again', () => {
  const src = `import java.util.Scanner;
import java.util.InputMismatchException;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = -1;
        while (n < 0) {
            try {
                n = sc.nextInt();
            } catch (InputMismatchException e) {
                System.out.println("Not a number: " + sc.next());
            }
        }
        System.out.println(n);
    }
}`;
  const r = run(src, 'abc\n7');
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('Not a number: abc\n7\n');
  expect(r.steps.filter((s) => s.kind === 'loop-start')).toHaveLength(1);
});

test('nothing catches it: a crash, and the finally part still runs first', () => {
  const { r, e } = explain(prog(`        try {
            throw new IllegalStateException("broken");
        } finally {
            System.out.println("cleanup");
        }`));
  expect(r.status).toBe('runtime-error');
  expect(r.error).toEqual({ line: 4, type: 'IllegalStateException', message: 'broken' });
  expect(r.steps.at(-1)!.output).toBe('cleanup\n');
  expect(r.steps.map((s) => [s.line, s.kind])).toEqual([[4, 'catch'], [6, 'print'], [4, 'crash']]);
  expect(e[0].what).toBe('The program throws an IllegalStateException with the message "broken". Nothing catches it here, so the finally part runs first.');
  expect(e.at(-1)!.what).toBe('The program throws an IllegalStateException with the message "broken", and no catch part takes it, so the program stops.');
  // A catch for a different kind of error does not catch it.
  expect(run(prog('        try {\n            int x = 1 / 0;\n        } catch (NullPointerException e) {\n        }')).error).toMatchObject({ type: 'ArithmeticException' });
});

test("Java's compile rules for exceptions stay on Home", () => {
  const msg = (src: string) => run(src).error?.message;
  const NEEDS = 'Java needs this Exception to be handled: put this line inside a try/catch, or add throws Exception after the method name and brackets.';
  expect(msg(prog('        throw new Exception("x");'))).toBe(`Line 3: ${NEEDS}`);
  expect(msg(prog('        f();', '    static void f() throws Exception {\n        throw new Exception("x");\n    }\n\n'))).toBe(`Line 7: ${NEEDS}`);
  expect(run(prog('        try {\n            f();\n        } catch (Exception e) {\n            System.out.println(e.getMessage());\n        }', '    static void f() throws Exception {\n        throw new Exception("x");\n    }\n\n')).steps.at(-1)!.output).toBe('x\n');
  expect(msg(prog('        try {\n            int x = 1;\n        } catch (Exception e) {\n        } catch (ArithmeticException e) {\n        }'))).toBe(
    'Line 6: ArithmeticException is already caught by the catch part above it (catch Exception).',
  );
  expect(msg(prog('        try {\n        } catch (java.io.IOException e) {\n        }'))).toMatch(/^Line 4: StepViz can't run/);
});
