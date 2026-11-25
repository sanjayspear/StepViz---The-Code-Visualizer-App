// C++ interpreter (Node). Same trace shape, kinds and rules as the other languages.
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp, cppDouble } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';
import { EXAMPLES } from '../src/examples/index';
import { FACTORIAL_CPP_TRACE } from '../src/examples/factorialCppTrace';
import type { Trace } from '../src/trace/types';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({
    engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm',
    grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm',
  });
});

const opts = { maxSteps: 2000, maxSeconds: 5 };
const run = (src: string, input = '') => runCpp(parser.parse(src)!, { ...opts, input });
const HEAD = '#include <iostream>\n#include <vector>\n#include <string>\n#include <iomanip>\nusing namespace std;\n\n';
/** A program with this body inside main (main starts on line 7, its body on line 8). */
const main = (body: string, functions = '') => `${HEAD}${functions}int main() {\n${body}\n    return 0;\n}`;
const out = (src: string, input = '') => run(src, input).steps.at(-1)!.output;
const explain = (src: string, input = '') => {
  const r = run(src, input);
  return explainTrace({
    language: 'cpp',
    source: src,
    steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })),
    ...(r.listView ? { listView: r.listView } : {}),
  } as Trace);
};

test('factorial: calls, returns, main() at the bottom; return 0 ends main', () => {
  const r = run(EXAMPLES[0].cppSource);
  expect(r.status).toBe('ok');
  expect(r.steps.map((s) => s.kind)).toEqual([
    'call', 'branch-skipped', 'call', 'branch-skipped', 'call', 'branch-skipped', 'call', 'branch-taken',
    'return', 'return', 'return', 'return', 'assign', 'print', 'return',
  ]);
  expect(r.steps[0].frames.map((f) => f.name)).toEqual(['main()', 'factorial(3)']);
  expect(r.steps.at(-1)).toMatchObject({ line: 14, output: '6\n', frames: [{ name: 'main()', status: 'returning', returns: 'returns 0' }] });
});

test('C++ number and output rules: whole-number division, cout formats, bool as 1, fixed/setprecision', () => {
  expect(
    out(
      main(`    double avg = 7 / 2;
    double real = 7 / 2.0;
    bool ok = real > 3;
    char c = 'a';
    c++;
    int wrap = 2147483647;
    wrap = wrap + 1;
    cout << avg << " " << real << " " << ok << " " << c << " " << wrap << endl;
    cout << 1.0 / 3 << " " << 1e7 << " " << 0.0001 << " " << boolalpha << ok << endl;
    cout << fixed << setprecision(2) << 3.14159 << endl;`),
    ),
  ).toBe('3 3.5 1 b -2147483648\n0.333333 1e+07 0.0001 true\n3.14\n');
  expect([cppDouble(2), cppDouble(2.5), cppDouble(1e-5), cppDouble(123456789)]).toEqual(['2', '2.5', '1e-05', '1.23457e+08']);
  const vars = run(main('    string s = "hi";\n    char c = \'x\';\n    bool b = true;\n    double d = 2;')).steps.at(-1)!.frames[0].vars;
  expect(vars).toEqual({ s: '"hi"', c: "'x'", b: 'true', d: '2' });
});

test('strings: +, +=, length, [], substr, to_string, comparisons', () => {
  expect(
    out(
      main(`    string s = "Hi";
    s += ", Sam";
    string t = s.substr(4) + "!";
    cout << s << " " << s.length() << " " << s[0] << " " << t << " " << to_string(42) << " " << (s < t) << endl;`),
    ),
  ).toBe('Hi, Sam 7 H Sam! 42 1\n');
});

test('functions: by value copies, by reference shares the box ("same box as x")', () => {
  const src = main(
    '    int x = 5;\n    addOne(x);\n    vector<int> a = {1};\n    grow(a);\n    cout << x << " " << a.size() << endl;',
    'void addOne(int& n) {\n    n++;\n}\n\nvoid grow(vector<int> v) {\n    v.push_back(2);\n}\n\n',
  );
  const r = run(src);
  expect(r.steps.at(-2)!.output).toBe('6 1\n');
  const call = r.steps.find((s) => s.kind === 'call')!;
  expect(call.frames.at(-1)).toEqual({ name: 'addOne(5)', vars: { n: '5 (same box as x)' }, status: 'running' });
  const e = explain(src);
  expect(e[r.steps.indexOf(call)].what).toMatch(/addOne\(5\)/);
  expect(e.every((x) => !x.what.includes('same box as') || x.what.includes('changes'))).toBe(true);
});

test('vectors and arrays: push_back, pop_back, size, at, range-for, list view with swap()', () => {
  expect(
    out(
      main(`    vector<int> v = {3, 1};
    v.push_back(2);
    v.pop_back();
    v.push_back(7);
    int a[3] = {1, 2};
    int total = 0;
    for (int x : v) {
        total += x;
    }
    cout << v.size() << " " << v.at(2) << " " << a[2] << " " << total << " " << v.front() << v.back() << endl;`),
    ),
  ).toBe('3 7 0 11 37\n');
  const r = run(EXAMPLES[1].cppSource);
  expect(r.listView).toEqual({ list: 'nums', outerLine: 7, outerEndLine: 13, loopVars: ['i', 'j'] });
  expect(r.steps.filter((s) => s.kind === 'swap').map((s) => [s.list!.values.join(','), s.list!.swap])).toEqual([
    ['5,2,8,1', [0, 1]],
    ['2,5,8,1', [2, 3]],
    ['2,5,1,8', [1, 2]],
    ['2,1,5,8', [0, 1]],
  ]);
  expect(r.steps.at(-1)!.output).toBe('1 2 5 8 \n');
});

test('cin and getline follow C++ (getline after cin >> reads the rest of the line)', () => {
  const src = main('    int age;\n    string rest, name;\n    cin >> age;\n    getline(cin, rest);\n    getline(cin, name);\n    cout << name << " is " << age << " [" << rest << "]" << endl;');
  const r = run(src, '15\nSam Lee\n');
  expect(r.steps.at(-2)!.output).toBe('Sam Lee is 15 []\n');
  expect(r.steps.filter((s) => s.kind === 'input').map((s) => s.line)).toEqual([10, 11, 12]);
  expect(explain(src, '15\nSam Lee\n')[2].what).toMatch(/^(We read 15 with cin and store it in age|age gets 15, the next value from the input)\.$/);
  expect(run(main('    int a, b;\n    cin >> a >> b;'), '4').error).toMatchObject({ type: 'NoMoreInput' });
  expect(run(main('    int a;\n    cin >> a;'), 'abc').error).toMatchObject({ type: 'BadInput' });
});

test('StepViz stops where real C++ would give garbage: unset values, outside the list, / by zero', () => {
  const cases: [string, string, string][] = [
    ['    int x;\n    cout << x << endl;', 'Uninitialized', 'This box was used before it was given a value.'],
    ['    int a[3];\n    int y = a[0];', 'Uninitialized', 'This box was used before it was given a value.'],
    ['    int a[3] = {1, 2, 3};\n    a[5] = 1;', 'IndexOutOfRange', 'This position is outside the list.'],
    ['    vector<int> v = {1};\n    int y = v.at(3);', 'out_of_range', 'This position is outside the list.'],
    ['    int x = 0;\n    cout << 10 / x;', 'DivideByZero', "C++ can't divide a whole number by zero."],
  ];
  for (const [body, type, sentence] of cases) {
    const src = main(body);
    const r = run(src);
    expect(r.status, body).toBe('runtime-error');
    expect(r.error!.type, body).toBe(type);
    expect(r.steps.at(-1)!.kind).toBe('crash');
    expect(explain(src).at(-1), body).toEqual({ what: sentence, life: '' });
  }
});

test('global variables get a Global frame under main(); function frames list only their own variables', () => {
  const r = run(`#include <iostream>
using namespace std;
int counter = 0;
void bump() {
    counter++;
}
int main() {
    bump();
    cout << counter << endl;
    return 0;
}`);
  expect(r.steps[0]).toMatchObject({ line: 3, kind: 'assign', frames: [{ name: 'Global', vars: { counter: '0' } }] });
  expect(r.steps[1].frames.map((f) => [f.name, f.vars])).toEqual([['Global', { counter: '0' }], ['main()', {}]]);
  expect(r.steps.at(-2)!.output).toBe('1\n');
  expect(r.steps.at(-1)!.frames.map((f) => f.name)).toEqual(['Global', 'main()']);
});

test('problems found before running stay on Home with a line number', () => {
  const msg = (src: string) => {
    const r = run(src);
    expect(r.status, src).toBe('syntax-error');
    return r.error!.message;
  };
  expect(msg(main('    int x = 1\n    cout << x;'))).toBe('Line 8: C++ could not understand this line.');
  expect(msg(main('    int x = 1;\n    int* p = &x;'))).toBe("Line 9: StepViz can't run pointers in C++ yet.");
  expect(msg('#include <map>\n' + main('    int x = 1;'))).toBe("Line 1: StepViz can't run #include <map> in C++ yet.");
  expect(msg(HEAD + 'void f() {}')).toBe('Line 1: StepViz needs an int main() function to start the program.');
  expect(msg(main('    struct P { int x; };'))).toBe("Line 8: StepViz can't run structs in C++ yet.");
  expect(msg(main('    int x = 1;\n    int y = sizeof(x);'))).toBe("Line 9: StepViz can't run sizeof in C++ yet.");
  expect(msg(main('    string s = "a" + 5;'))).toBe('Line 8: Text can only be joined with text here. Use to_string() for numbers.');
  expect(msg(main('    y = 5;'))).toBe('Line 8: y is used but never declared.');
});

test('caps: endless loops and endless recursion stop', () => {
  expect(run(main('    while (true) { }')).status).toBe('cap');
  expect(run(main('    f(0);', 'int f(int n) {\n    return f(n + 1);\n}\n\n')).status).toBe('cap');
});

test('the C++ Factorial fixture still matches the interpreter; all four examples run', () => {
  const live = run(FACTORIAL_CPP_TRACE.source);
  const strip = (s: { line: number; frames: { returns?: string }[]; output: string }) => ({
    line: s.line,
    output: s.output,
    frames: s.frames.map((f) => ({ ...f, returns: f.returns ? 'returns' : undefined })),
  });
  expect(live.steps.map(strip)).toEqual(FACTORIAL_CPP_TRACE.steps.map(strip));
  expect(EXAMPLES.map((e) => run(e.cppSource).steps.at(-1)!.output)).toEqual(['6\n', '1 2 5 8 \n', '0\n1\n1\n2\n3\n', '6\n']);
});

test('the explainer reads C++ traces with C++ words', () => {
  const e = explain(EXAMPLES[3].cppSource);
  expect(e.at(-2)!.what).toMatch(/cout|The screen now shows 6/);
  expect(e.at(-1)!.what).toMatch(/main\(\)/);
});
