// C++ static class members (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
});
const run = (src: string) => runCpp(parser.parse(src)!, { maxSteps: 3000, maxSeconds: 5 });
const explain = (src: string) => {
  const r = run(src);
  return { r, e: explainTrace({ language: 'cpp', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) }) };
};
const HEAD = '#include <iostream>\n#include <vector>\nusing namespace std;\n\n';
const msg = (src: string) => run(`${HEAD}${src}`).error?.message;

const DOG = `${HEAD}class Dog {
public:
    static int count;
    static const int MAX = 3;
    string name;
    int id;
    Dog(string n) {
        name = n;
        count++;
        id = count;
    }
    static int total() {
        return count;
    }
};

int Dog::count = 0;

int main() {
    Dog a("Rex");
    Dog b("Bo");
    cout << Dog::count << " " << Dog::total() << " " << Dog::MAX << endl;
    Dog::count = 10;
    return 0;
}`;

test('static members are one box for the whole class, shown as Dog::count in the Global frame', () => {
  const { r, e } = explain(DOG);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('2 2 3\n');
  // Set up in program order before main(): MAX in the class, then int Dog::count = 0;
  expect(r.steps.slice(0, 2).map((s) => [s.line, s.frames[0].name, s.frames[0].vars])).toEqual([
    [8, 'Global', { 'Dog::MAX': '3', 'Dog::count': '?' }],
    [21, 'Global', { 'Dog::MAX': '3', 'Dog::count': '0' }],
  ]);
  expect(e[0].what).toMatch(/Dog::MAX\b.*\b3\b/);
  // count++ inside the constructor changes the class's box; the object holds only name and id.
  const inCtor = r.steps.findIndex((s) => s.line === 13 && s.frames[0].vars['Dog::count'] === '2');
  expect(e[inCtor].what).toMatch(/^(The box )?Dog::count\b.*\b1\b.*\b2\b|^(The box )?Dog::count\b.*\b2 instead of 1/);
  expect(r.steps[inCtor].frames.at(-1)!.vars.this).toBe('Dog {name: "Bo", id: ?}');
  // A static method runs without an object: no this in its frame.
  const call = r.steps.find((s) => s.kind === 'call' && s.frames.at(-1)!.name === 'Dog::total()')!;
  expect(call.frames.at(-1)!.vars).toEqual({});
  const set = r.steps.findIndex((s) => s.line === 27);
  expect(r.steps[set].frames[0].vars['Dog::count']).toBe('10');
  expect(e[set].what).toMatch(/Dog::count\b.*\b(2\b.*\b10|10 instead of 2)\b/);
});

test('static inline members, static methods called from other code, on an object and in a class built on another', () => {
  const src = `${HEAD}class Animal {
protected:
    static int made;
public:
    static inline vector<string> names;
    Animal(string n) {
        made++;
        names.push_back(n);
        int k = 0;
    }
    static int howMany() {
        return made;
    }
};
int Animal::made = 0;

class Dog : public Animal {
public:
    Dog(string n) : Animal(n) {
        made += 10;
        int k = 0;
    }
};

int main() {
    Dog d("Rex");
    int n = d.howMany();
    cout << n << " " << Animal::names.size() << " " << Dog::howMany() << endl;
    return 0;
}`;
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('11 1 11\n');
  const push = r.steps.findIndex((s) => s.line === 12);
  expect(r.steps[push].frames[0].vars['Animal::names']).toBe('["Rex"]');
  expect(e[push].what).toBe('"Rex" is added to the end of Animal::names.');
  const derived = r.steps.findIndex((s) => s.line === 24);
  expect(e[derived].what).toMatch(/Animal::made\b.*\b(1\b.*\b11|11 instead of 1)\b/);
  const calls = r.steps.filter((s) => s.kind === 'call').map((s) => s.frames.at(-1)!.name);
  expect(calls.filter((c) => c.includes('howMany'))).toEqual(['Animal::howMany()', 'Animal::howMany()']);
});

test('a static const member can size a list in the class and in main()', () => {
  const r = run(`${HEAD}struct Grid {\n    static const int N = 3;\n    int cells[N];\n};\n\nint main() {\n    int row[Grid::N];\n    Grid g;\n    g.cells[2] = 7;\n    cout << Grid::N << g.cells[2] << endl;\n    return 0;\n}`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('37\n');
});

test('C++ rules for static members stay on Home', () => {
  expect(msg('struct A {\n    static int n;\n};\n\nint main() {\n    return 0;\n}')).toBe(
    'Line 6: A::n is static, so it also needs a line after the class that gives it its box, like int A::n = 0;',
  );
  expect(msg('struct A {\n    static int n = 2;\n};\n\nint main() {\n    return 0;\n}')).toBe(
    "Line 6: A::n can't get its value inside the class: write static inline int n = ...; or put a line after the class, like int A::n = 0;",
  );
  expect(msg('struct A {\n    static const int MAX = 2;\n};\n\nint main() {\n    A::MAX = 3;\n    return 0;\n}')).toBe("Line 10: A::MAX is const, so it can't be given a new value.");
  expect(msg('class A {\n    static int n;\n};\nint A::n = 0;\n\nint main() {\n    cout << A::n;\n    return 0;\n}')).toBe('Line 11: n is private in A, so only code inside A can use it.');
  expect(msg('struct A {\n    int k;\n    static int f() {\n        return k;\n    }\n};\n\nint main() {\n    cout << A::f();\n    return 0;\n}')).toBe(
    "Line 8: k belongs to each A object, so a static method can't use it on its own.",
  );
  expect(msg('struct A {\n    int k;\n    static int f() {\n        return this->k;\n    }\n};\n\nint main() {\n    return 0;\n}')).toBe(
    "Line 8: this can't be used in a static method: it runs without an object.",
  );
  expect(msg('struct A {\n    void g() {}\n    static void f() {\n        g();\n    }\n};\n\nint main() {\n    A::f();\n    return 0;\n}')).toBe(
    "Line 8: g() belongs to each A object, so a static method can't call it on its own.",
  );
  expect(msg('struct A {\n    void g() {}\n};\n\nint main() {\n    A::g();\n    return 0;\n}')).toBe('Line 10: g() is not static, so it needs an object: call it like d.g().');
  expect(msg('struct A {\n    static int n;\n};\nint A::n = 0;\nint A::m = 0;\n\nint main() {\n    return 0;\n}')).toBe('Line 9: A has no static member called m.');
  expect(msg('struct A {\n    int k;\n};\n\nint main() {\n    int x = A::k;\n    return 0;\n}')).toBe('Line 10: k belongs to each A object, so A::k needs an object: use it like d.k.');
});

test('a static variable inside a function stays on Home (it keeps its value between calls)', () => {
  expect(msg('int counter() {\n    static int calls = 0;\n    calls++;\n    return calls;\n}\n\nint main() {\n    counter();\n    return 0;\n}')).toBe(
    "Line 6: StepViz can't run static variables inside functions in C++ yet.",
  );
});
