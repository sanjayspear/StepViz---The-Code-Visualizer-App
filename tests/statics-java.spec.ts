// Java static variables and constants: a "static" frame under main() (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
});
const run = (src: string) => runJava(parser.parse(src)!, { maxSteps: 2000, maxSeconds: 5 });
const SRC = `class Dog {
    static int total = 0;
    String name;

    Dog(String name) {
        this.name = name;
        total++;
    }
}

public class Main {
    static final int MAX = 3;
    static int calls;

    static void count() {
        calls = calls + 1;
    }

    public static void main(String[] args) {
        Dog a = new Dog("Rex");
        Dog b = new Dog("Bo");
        count();
        System.out.println(Dog.total + " " + calls + " " + MAX);
    }
}`;

test('statics live in a "static" frame under main(); set first, then main() starts; changed from anywhere', () => {
  const r = run(SRC);
  const e = explainTrace({ language: 'java', source: SRC, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('2 1 3\n');
  expect(r.steps[0]).toMatchObject({ line: 12, kind: 'assign', frames: [{ name: 'static', vars: { MAX: '3', calls: '0', 'Dog.total': '?' } }] });
  expect(e[1].what).toMatch(/Dog\.total/);
  expect(r.steps[2]).toMatchObject({ line: 19, kind: 'call' });
  expect(r.steps[2].frames.map((f) => f.name)).toEqual(['static', 'main()']);
  const counted = r.steps.findIndex((s) => s.kind === 'return' && s.frames.at(-1)!.name === 'count()');
  expect(r.steps[counted].frames[0].vars.calls).toBe('1');
  expect(r.steps.at(-1)).toMatchObject({ line: 23, kind: 'print' });
  // A static changed in main() reads like any other change (it lives in the static frame).
  const src2 = SRC.replace('        count();\n', '        calls = 7;\n        count();\n');
  const r2 = run(src2);
  const e2 = explainTrace({ language: 'java', source: src2, steps: r2.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  expect(e2[r2.steps.findIndex((s) => s.line === 22)].what).toMatch(/^(calls changes from 0 to 7|calls was 0 and is now 7|the box calls gets a new value: 7 instead of 0)\.$/i);
});

test("Java's rules for statics stay on Home", () => {
  const msg = (src: string) => run(src).error?.message;
  const main = (fields: string, body: string) => `public class Main {\n${fields}\n    public static void main(String[] args) {\n${body}\n    }\n}`;
  expect(msg(main('    static final int MAX = 3;', '        MAX = 4;'))).toBe("Line 4: MAX is final, so it can't be given a new value.");
  expect(msg(main('    static final int MAX;', '        int x = 1;'))).toBe('Line 2: MAX is final, so it needs a value here (final ... MAX = ...;).');
  expect(msg(main('    int notStatic = 1;', '        int x = 1;'))).toBe("Line 2: StepViz can't run fields in Main that are not static (write static before them) in Java yet.");
  expect(msg(`class A {\n    private static int secret = 1;\n}\n\n${main('', '        int s = A.secret;')}`)).toBe('Line 8: secret is private in A, so only code inside A can use it.');
  // Programs without statics are unchanged: main() is the bottom frame.
  expect(run(main('', '        int x = 1;')).steps[0].frames[0].name).toBe('main()');
});
