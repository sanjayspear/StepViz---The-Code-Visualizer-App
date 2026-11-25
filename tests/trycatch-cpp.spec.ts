// C++ try / catch / throw (Node). Only real C++ exceptions can be caught.
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({
    engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm',
    grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm',
  });
});

const opts = { maxSteps: 2000, maxSeconds: 5 };
const HEAD = '#include <iostream>\n#include <vector>\n#include <string>\n#include <stdexcept>\nusing namespace std;\n\n';
/** main's body starts on line 8 (or after the functions). */
const main = (body: string, functions = '') => `${HEAD}${functions}int main() {\n${body}\n    return 0;\n}`;
const run = (src: string, input = '') => runCpp(parser.parse(src)!, { ...opts, input });
const explain = (src: string) => {
  const r = run(src);
  return { r, e: explainTrace({ language: 'cpp', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) }) };
};
const out = (src: string) => {
  const r = run(src);
  if (r.status !== 'ok') throw new Error(JSON.stringify(r.error));
  return r.steps.at(-1)!.output;
};

test('v.at() outside the list throws out_of_range, which a catch part can take', () => {
  const src = main(`    vector<int> v = {1, 2, 3};
    try {
        int x = v.at(5);
        cout << "not shown" << endl;
    } catch (const out_of_range& e) {
        cout << "Caught: " << e.what() << endl;
    }`);
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  const k = r.steps.findIndex((s) => s.kind === 'catch');
  expect(r.steps[k]).toMatchObject({ line: 10, detail: { errorType: 'out_of_range' } });
  expect(r.steps.at(-1)!.output).toBe('Caught: vector::_M_range_check: __n (which is 5) >= this->size() (which is 3)\n');
  expect(e[k].what).toMatch(/^This position is outside the list\. (Instead of stopping, the program jumps to the catch part|The catch part takes over, so the program does not stop)\.$/);
});

test('throw runtime_error from a function, caught as exception& in main', () => {
  const fns = `double divide(int a, int b) {
    if (b == 0) {
        throw runtime_error("Cannot divide by zero");
    }
    return (double) a / b;
}

`;
  const src = main(`    try {
        cout << divide(6, 3) << endl;
        cout << divide(1, 0) << endl;
    } catch (const exception& e) {
        cout << "Error: " << e.what() << endl;
    }`, fns);
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('2\nError: Cannot divide by zero\n');
  const k = r.steps.findIndex((s) => s.kind === 'catch');
  expect(r.steps[k]).toMatchObject({ line: 17, detail: { errorType: 'runtime_error', errorMessage: 'Cannot divide by zero', thrown: true } });
  expect(r.steps[k].frames.map((f) => f.name)).toEqual(['main()']);
  expect(r.steps[k + 1].frames[0].vars.e).toBe('runtime_error: Cannot divide by zero');
  expect(e[k].what).toMatch(/throws a runtime_error with the message "Cannot divide by zero"/);
});

test('throw values: int, "text" (const char*), string; catch (...) and the order of catch parts', () => {
  expect(
    out(
      main(`    try {
        throw 42;
    } catch (double d) {
        cout << "double" << endl;
    } catch (int n) {
        cout << "int " << n << endl;
    }
    try {
        throw "Oops";
    } catch (string s) {
        cout << "string" << endl;
    } catch (const char* msg) {
        cout << "text " << msg << endl;
    }
    try {
        throw invalid_argument("bad");
    } catch (const logic_error& e) {
        cout << "logic " << e.what() << endl;
    } catch (...) {
        cout << "anything" << endl;
    }
    try {
        stoi("abc");
    } catch (...) {
        cout << "anything" << endl;
    }`),
    ),
  ).toBe('int 42\ntext Oops\nlogic bad\nanything\n');
});

test('throw; inside a catch part throws the same exception again', () => {
  expect(
    out(
      main(`    try {
        try {
            throw out_of_range("deep");
        } catch (const exception& e) {
            cout << "inner" << endl;
            throw;
        }
    } catch (const out_of_range& e) {
        cout << "outer " << e.what() << endl;
    }`),
    ),
  ).toBe('inner\nouter deep\n');
});

test('not exceptions in C++: v[i] outside the list and / by zero still stop, even inside try', () => {
  const r = run(main('    vector<int> v = {1};\n    try {\n        int x = v[3];\n    } catch (...) {\n        cout << "caught";\n    }'));
  expect(r.error).toMatchObject({ type: 'IndexOutOfRange', line: 10 });
  const d = run(main('    int z = 0;\n    try {\n        int x = 5 / z;\n    } catch (...) {\n    }'));
  expect(d.error).toMatchObject({ type: 'DivideByZero' });
});

test('nothing catches it: the program stops, and the explanation names the throw', () => {
  const { r, e } = explain(main('    throw runtime_error("broken");'));
  expect(r.status).toBe('runtime-error');
  expect(r.error).toMatchObject({ type: 'runtime_error', message: 'broken', line: 8 });
  // A crash on the first step stays on Home, so check one with a step before it.
  const two = explain(main('    int a = 1;\n    throw 7;'));
  expect(two.r.error).toMatchObject({ type: 'int', message: '7' });
  expect(two.e.at(-1)!.what).toBe('The program throws the value 7, and no catch part takes it, so the program stops.');
  expect(e).toBeDefined();
  expect(run(main('    try {\n        throw 1;\n    } catch (long x) {\n    }')).error).toMatchObject({ type: 'int' });
});
