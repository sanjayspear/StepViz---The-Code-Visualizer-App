// Java interpreter, J1 (Node). Same trace shape, kinds and rules as Python/JavaScript.
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava, javaDouble } from '../src/runner/java/interpreter';
import { explainTrace } from '../src/trace/explainer';
import type { Trace } from '../src/trace/types';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({
    engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm',
    grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm',
  });
});

const opts = { maxSteps: 2000, maxSeconds: 5 };
const run = (src: string) => runJava(parser.parse(src)!, opts);
/** A program with this body inside main. */
const main = (body: string, methods = '') =>
  `public class Main {\n${methods}    public static void main(String[] args) {\n${body}\n    }\n}`;
const lastOut = (src: string) => run(src).steps.at(-1)!.output;
const asTrace = (src: string): Trace => ({
  language: 'java',
  source: src,
  steps: run(src).steps.map((s) => ({ ...s, explain: { what: '', life: '' } })),
});

const FACTORIAL = `public class Main {
    static int factorial(int n) {
        if (n == 0) {
            return 1;
        }
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        int result = factorial(3);
        System.out.println(result);
    }
}`;

test('factorial: calls, returns, main() at the bottom, output 6', () => {
  const r = run(FACTORIAL);
  expect(r.status).toBe('ok');
  expect(r.steps.map((s) => s.line)).toEqual([10, 3, 6, 3, 6, 3, 6, 3, 4, 6, 6, 6, 10, 11]);
  expect(r.steps.map((s) => s.kind)).toEqual([
    'call', 'branch-skipped', 'call', 'branch-skipped', 'call', 'branch-skipped', 'call', 'branch-taken',
    'return', 'return', 'return', 'return', 'assign', 'print',
  ]);
  expect(r.steps[0].frames).toEqual([
    { name: 'main()', vars: { result: '?' }, status: 'waiting' },
    { name: 'factorial(3)', vars: { n: '3' }, status: 'running' },
  ]);
  expect(r.steps[8].frames.at(-1)).toEqual({ name: 'factorial(0)', vars: { n: '0' }, status: 'returning', returns: 'returns 1' });
  expect(r.steps.at(-1)).toMatchObject({ line: 11, output: '6\n', frames: [{ name: 'main()', vars: { result: '6' }, status: 'running' }] });
});

test('for loop: the same kinds as JavaScript, loop variable gone after the loop', () => {
  const r = run(main('        int total = 0;\n        for (int i = 1; i <= 3; i++) {\n            total = total + i;\n        }\n        System.out.println(total);'));
  expect(r.steps.map((s) => s.kind)).toEqual(['assign', 'loop-start', 'assign', 'loop-next', 'assign', 'loop-next', 'assign', 'loop-end', 'print']);
  expect(r.steps.map((s) => s.frames[0].vars)).toEqual([
    { total: '0' }, { total: '0', i: '1' }, { total: '1', i: '1' }, { total: '1', i: '2' }, { total: '3', i: '2' },
    { total: '3', i: '3' }, { total: '6', i: '3' }, { total: '6' }, { total: '6' },
  ]);
  expect(r.steps.at(-1)!.output).toBe('6\n');
});

test('Java number rules: whole-number division, doubles print as 2.0, int wraps, char arithmetic', () => {
  const src = main(`        double avg = 7 / 2;
        double real = 7 / 2.0;
        int wrap = 2147483647 + 1;
        long big = 2147483647L + 1;
        char c = 'a';
        c++;
        int cast = (int) 3.9;
        int total = 10;
        total += 1.5;
        System.out.println(avg + " " + real + " " + wrap + " " + big + " " + c + " " + cast + " " + total);
        System.out.println(-7 / 2 + " " + -7 % 2 + " " + 1.0 / 3);`);
  const r = run(src);
  expect(r.steps.at(-1)!.output).toBe('3.0 3.5 -2147483648 2147483648 b 3 11\n-3 -1 0.3333333333333333\n');
  const vars = r.steps.at(-1)!.frames[0].vars;
  expect(vars).toMatchObject({ avg: '3.0', real: '3.5', wrap: '-2147483648', c: "'b'", cast: '3', total: '11' });
  expect([javaDouble(2), javaDouble(0.1), javaDouble(1e7), javaDouble(0.0001), javaDouble(-0)]).toEqual(['2.0', '0.1', '1.0E7', '1.0E-4', '-0.0']);
});

test('strings, booleans, Math and print without a new line', () => {
  const out = lastOut(
    main(`        String s = "Hi";
        s = s + ", Sam";
        boolean ok = s.length() == 7 && s.charAt(0) == 'H' && s.equals("Hi, Sam");
        System.out.print(s);
        System.out.print(" ");
        System.out.println(ok);
        System.out.println(Math.max(3, 9) + Math.abs(-2) + " " + Math.sqrt(16) + " " + Math.pow(2, 10));
        System.out.println(5 > 3 ? "yes" : "no");`),
  );
  expect(out).toBe('Hi, Sam true\n11 4.0 1024.0\nyes\n');
  const vars = run(main('        String s = "Hi";\n        char c = \'x\';\n        boolean b = true;')).steps.at(-1)!.frames[0].vars;
  expect(vars).toEqual({ s: '"Hi"', c: "'x'", b: 'true' });
});

test('while, do/while, break, continue and else if', () => {
  const out = lastOut(
    main(`        int n = 0;
        while (true) {
            n++;
            if (n == 2) continue;
            if (n > 4) break;
            System.out.print(n);
        }
        int k = 0;
        do {
            k += 3;
        } while (k < 5);
        if (k > 10) {
            System.out.println("big");
        } else if (k > 5) {
            System.out.println(" " + k);
        } else {
            System.out.println("small");
        }`),
  );
  expect(out).toBe('134 6\n');
});

test('a method that returns nothing; arguments become the frame label', () => {
  const r = run(main('        greet(3, "Sam");', '    static void greet(int times, String name) {\n        System.out.println(name + times);\n    }\n\n'));
  expect(r.steps[0].frames.at(-1)!.name).toBe('greet(3, "Sam")');
  const ret = r.steps.find((s) => s.kind === 'return')!;
  expect(ret.frames.at(-1)!.returns).toBe('returns nothing');
  expect(r.steps.at(-1)!.output).toBe('Sam3\n');
});

test('a crash (/ by zero) ends with an error step and a plain-words sentence', () => {
  const src = main('        int x = 10;\n        int y = 0;\n        System.out.println(x / y);');
  const r = run(src);
  expect(r.status).toBe('runtime-error');
  expect(r.error).toEqual({ line: 5, type: 'ArithmeticException', message: '/ by zero' });
  expect(r.steps.at(-1)).toMatchObject({ line: 5, kind: 'crash', frames: [{ name: 'main()', status: 'error' }] });
  expect(explainTrace(asTrace(src)).at(-1)).toEqual({ what: "Java can't divide a whole number by zero.", life: '' });
  const text = run(main('        String s = "ab";\n        char c = s.charAt(5);'));
  expect(text.error).toMatchObject({ type: 'StringIndexOutOfBoundsException' });
});

test('problems found before running stay on Home with a line number', () => {
  const msg = (src: string) => {
    const r = run(src);
    expect(r.status, src).toBe('syntax-error');
    expect(r.steps).toEqual([]);
    return r.error!.message;
  };
  expect(msg(main('        int x = 1\n        System.out.println(x);'))).toBe('Line 3: Java could not understand this line.');
  expect(msg('public class Hello {\n    public static void main(String[] args) {}\n}')).toBe('Line 1: StepViz needs a public class Main with a main method.');
  expect(msg('public class Main {\n    static void hi() {}\n}')).toBe('Line 1: StepViz needs a public class Main with a main method.');
  expect(msg(main('        int[] a = {1, 2};'))).toBe("Line 3: StepViz can't run arrays in Java yet.");
  expect(msg(main('        int x = 1;\n        switch (x) { case 1: break; }'))).toBe("Line 4: StepViz can't run switch in Java yet.");
  expect(msg('import java.util.Scanner;\n' + main('        int x = 1;'))).toBe("Line 1: StepViz can't run imports in Java yet.");
  expect(msg(main('        Object o = new Object();'))).toMatch(/^Line 3: StepViz can't run (the type Object|new objects) in Java yet\.$/);
  expect(msg(main('        try { int x = 1; } catch (Exception e) { }'))).toBe("Line 3: StepViz can't run try/catch in Java yet.");
  expect(msg(main('        int x = 2.5;'))).toBe("Line 3: x is an int box, so it can't hold 2.5.");
  expect(msg(main('        int x;\n        System.out.println(x);'))).toBe('Line 4: x is used before it was given a value.');
  expect(msg(main('        y = 5;'))).toBe('Line 3: y is used but never declared.');
  expect(msg(main('        System.out.println(1);', '    int notStatic() { return 1; }\n'))).toBe("Line 2: StepViz can't run methods that are not static in Java yet.");
});

test('caps: endless loops and endless recursion stop', () => {
  expect(run(main('        while (true) { }')).status).toBe('cap');
  expect(run(main('        int n = 0;\n        for (;;) { n++; }')).status).toBe('cap');
  expect(run(main('        f(0);', '    static int f(int n) { return f(n + 1); }\n')).status).toBe('cap');
  // An empty loop body is still rounds of the loop, not its end.
  expect(run(main('        while (true) { }')).steps.slice(0, 3).map((s) => s.kind)).toEqual(['loop-start', 'loop-next', 'loop-next']);
});

test('the rule-based explainer reads Java traces with Java words', () => {
  const e = explainTrace(asTrace(FACTORIAL));
  expect(e[0].what).toMatch(/^(factorial\(3\) starts in a new box with n = 3|We call factorial\(3\)\. A new box, called a frame, opens with n = 3)\.$/);
  expect(e.at(-1)!.what).toMatch(/System\.out\.println|The screen now shows 6/);
  expect(e.every((x) => x.life.startsWith('Like '))).toBe(true);
});
