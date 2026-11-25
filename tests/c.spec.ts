// C mode of the C/C++ interpreter (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';
import { EXAMPLES } from '../src/examples/index';
import { FACTORIAL_C_TRACE } from '../src/examples/factorialCTrace';
import type { Trace } from '../src/trace/types';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({
    engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm',
    grammar: 'node_modules/tree-sitter-c/tree-sitter-c.wasm',
  });
});

const run = (src: string, input = '') => runCpp(parser.parse(src)!, { maxSteps: 2000, maxSeconds: 5, input, dialect: 'c' });
const main = (body: string, functions = '') => `#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\n${functions}int main() {\n${body}\n    return 0;\n}`;
const explain = (src: string, input = '') => {
  const r = run(src, input);
  return explainTrace({ language: 'c', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) } as Trace);
};

test('the four C examples run, and Factorial matches its fixture', () => {
  expect(EXAMPLES.map((e) => run(e.cSource).steps.at(-1)!.output)).toEqual(['6\n', '1 2 5 8 \n', '0\n1\n1\n2\n3\n', '6\n']);
  const live = run(FACTORIAL_C_TRACE.source);
  const strip = (s: { line: number; frames: { returns?: string }[]; output: string }) => ({
    line: s.line,
    output: s.output,
    frames: s.frames.map((f) => ({ ...f, returns: f.returns ? 'returns' : undefined })),
  });
  expect(live.steps.map(strip)).toEqual(FACTORIAL_C_TRACE.steps.map(strip));
});

test('printf formats like C: %d %5d %-4s %.2f %c %x %%', () => {
  const r = run(main('    int n = 42;\n    double x = 2.5;\n    char c = \'z\';\n    printf("%d|%5d|%-4s|%.2f|%c|%x|%%\\n", n, 7, "ab", x, c, 255);\n    puts("done");\n    putchar(\'!\');'));
  expect(r.steps.at(-2)!.output).toBe('42|    7|ab  |2.50|z|ff|%\ndone\n!');
});

test('scanf reads into &variables and char arrays; text in char arrays shows as text', () => {
  const src = main('    char name[20];\n    int age;\n    double h;\n    scanf("%s %d %lf", name, &age, &h);\n    printf("%s %d %.1f %lu\\n", name, age, h, strlen(name));');
  const r = run(src, 'Sam 15 1.75');
  expect(r.status).toBe('ok');
  expect(r.steps.at(-2)!.output).toBe('Sam 15 1.8 3\n');
  expect(r.steps.at(-1)!.frames[0].vars).toEqual({ name: '"Sam"', age: '15', h: '1.75' });
  const read = r.steps.findIndex((s) => s.kind === 'input');
  expect(explain(src, 'Sam 15 1.75')[read].what).toBe('We read "Sam", 15 and 1.75 with scanf and store them in name, age and h.');
  expect(run(main('    char word[] = "hi";\n    bool ok = strcmp(word, "hi") == 0;\n    printf("%d %s\\n", ok, word);')).steps.at(-2)!.output).toBe('1 hi\n');
});

test('plain-words crashes: printf pattern mismatch, / by zero, out of the list, running out of input', () => {
  const cases: [string, string, string, string][] = [
    ['    int x = 5;\n    printf("%f\\n", x);', '', 'BadFormat', 'The printf pattern does not match this value.'],
    ['    int x = 0;\n    printf("%d", 3 / x);', '', 'DivideByZero', "C can't divide a whole number by zero."],
    ['    int a[3] = {1, 2, 3};\n    a[3] = 0;', '', 'IndexOutOfRange', 'This position is outside the list.'],
    ['    int x;\n    printf("%d", x);', '', 'Uninitialized', 'This box was used before it was given a value.'],
    ['    int a, b;\n    scanf("%d %d", &a, &b);', '4', 'NoMoreInput', 'Your program asked for more input than you typed.'],
  ];
  for (const [body, input, type, sentence] of cases) {
    const src = main(body);
    const r = run(src, input);
    expect(r.error?.type, body).toBe(type);
    expect(explain(src, input).at(-1), body).toEqual({ what: sentence, life: '' });
  }
});

test('C-only rules stay on Home with a line number', () => {
  const msg = (src: string) => {
    const r = run(src);
    expect(r.status, src).toBe('syntax-error');
    return r.error!.message;
  };
  expect(msg(main('    int x;\n    scanf("%d", x);'))).toBe('Line 7: scanf needs &x to store a value in x.');
  expect(msg(main('    int x = 1;\n    int *p = &x;\n    p++;'))).toBe("Line 8: StepViz can't run pointer arithmetic in C yet.");
  expect(msg('#include <iostream>\nint main() {\n    return 0;\n}')).toBe("Line 1: StepViz can't run #include <iostream> in C yet.");
  expect(msg(main('    string s;'))).toBe("Line 6: StepViz can't run the type string in C yet.");
  expect(msg(main('    int x = 1\n    printf("%d", x);'))).toBe('Line 6: C could not understand this line.');
});

test('Bubble sort in C: list view with the temp-variable swap as one step', () => {
  const r = run(EXAMPLES[1].cSource);
  expect(r.listView).toMatchObject({ list: 'nums', loopVars: ['i', 'j'] });
  expect(r.steps.filter((s) => s.kind === 'swap').map((s) => s.list!.swap)).toEqual([[0, 1], [2, 3], [1, 2], [0, 1]]);
});
