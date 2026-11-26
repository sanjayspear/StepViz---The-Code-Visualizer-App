// C++ structs and classes, and C structs (Node). C++ objects are values: copies stay separate, references share.
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';

let cpp: Parser;
let c: Parser;
test.beforeAll(async () => {
  const engine = 'node_modules/web-tree-sitter/web-tree-sitter.wasm';
  cpp = await createParser({ engine, grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
  c = await createParser({ engine, grammar: 'node_modules/tree-sitter-c/tree-sitter-c.wasm' });
});

const opts = { maxSteps: 2000, maxSeconds: 5 };
const run = (src: string, input = '') => runCpp(cpp.parse(src)!, { ...opts, input });
const runC = (src: string, input = '') => runCpp(c.parse(src)!, { ...opts, input, dialect: 'c' });
const explain = (src: string, language: 'cpp' | 'c' = 'cpp', input = '') => {
  const r = language === 'c' ? runC(src, input) : run(src, input);
  return { r, e: explainTrace({ language, source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) }) };
};
const HEAD = '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n';
const POINT = 'struct Point {\n    int x;\n    int y;\n};\n\n';
/** HEAD + POINT (lines 1-10) + more, then main (whose body starts on the line after "int main() {"). */
const prog = (body: string, more = '') => `${HEAD}${POINT}${more}int main() {\n${body}\n    return 0;\n}`;
const out = (src: string) => {
  const r = run(src);
  if (r.status !== 'ok') throw new Error(JSON.stringify(r.error));
  return r.steps.at(-1)!.output;
};

test('structs are values: a copy stays separate, a reference changes the original', () => {
  const src = prog(
    '    Point a = {1, 2};\n    Point b = a;\n    b.x = 10;\n    moveRight(a);\n    cout << a.x << " " << b.x << endl;',
    'void moveRight(Point& p) {\n    p.x = p.x + 1;\n}\n\n',
  );
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('2 10\n');
  expect(r.steps[0].frames[0].vars.a).toBe('Point {x: 1, y: 2}');
  expect(r.steps[2].frames[0].vars).toMatchObject({ a: 'Point {x: 1, y: 2}', b: 'Point {x: 10, y: 2}' });
  expect(e[2].what).toMatch(/^(b\.x changes from 1 to 10|In b, x was 1 and is now 10)\.$/);
  const call = r.steps.find((s) => s.kind === 'call')!;
  expect(call.frames[1]).toEqual({ name: 'moveRight(Point {x: 1, y: 2})', vars: { p: 'Point {x: 1, y: 2} (same box as a)' }, status: 'running' });
});

test('a class: constructor with a member list, private members, methods, a const method defined outside', () => {
  const dog = `class Dog {
public:
    Dog(string n, int a) : name(n), age(a) {}
    void birthday() {
        age++;
    }
    int getAge() const;
private:
    string name;
    int age;
};

int Dog::getAge() const {
    return age;
}

`;
  const src = `${HEAD}${dog}int main() {\n    Dog d("Rex", 3);\n    d.birthday();\n    cout << d.getAge() << endl;\n    return 0;\n}`;
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('4\n');
  expect(r.steps[0].frames[1]).toEqual({ name: 'Dog::Dog("Rex", 3)', vars: { this: 'Dog {name: "", age: ?}', n: '"Rex"', a: '3' }, status: 'running' });
  expect(e[0].what).toMatch(/new Dog object/);
  expect(r.steps[1].frames[1].returns).toBe('returns Dog {name: "Rex", age: 3}');
  expect(e[2].what).toMatch(/^(The new Dog object is stored in d|d now holds the new Dog object)\.$/);
  expect(r.steps.find((s) => s.frames.at(-1)!.name === 'd.birthday()')).toBeDefined();
  const msg = (body: string) => run(`${HEAD}${dog}int main() {\n${body}\n    return 0;\n}`).error?.message;
  expect(msg('    Dog d("Rex", 3);\n    cout << d.age;')).toBe('Line 24: age is private in Dog, so only code inside Dog can use it.');
  expect(msg('    Dog d;')).toBe('Line 23: Dog has no constructor that takes no values.');
  const constBad = dog.replace('int Dog::getAge() const {\n    return age;', 'int Dog::getAge() const {\n    age = 0;\n    return age;');
  expect(run(`${HEAD}${constBad}int main() {\n    Dog d("Rex", 3);\n    int a = d.getAge();\n    return 0;\n}`).error?.message).toBe("Line 19: getAge is a const method, so it can't change age.");
});

test('vectors and arrays of structs; range-for copies unless it uses &', () => {
  expect(
    out(
      prog(`    vector<Point> pts = {{1, 1}, {2, 2}};
    pts.push_back({3, 3});
    for (Point p : pts) {
        p.x = 0;
    }
    for (auto& q : pts) {
        q.y = 0;
    }
    Point arr[2] = {{5, 6}, {7, 8}};
    arr[1].x = 9;
    cout << pts[0].x << pts[2].x << pts[2].y << " " << arr[1].x << arr[1].y << " " << pts.size() << endl;`),
    ),
  ).toBe('130 98 3\n');
  const ref = run(prog('    vector<Point> pts = {{1, 1}};\n    for (auto& q : pts) {\n        q.y = 5;\n    }'));
  const inLoop = ref.steps.find((s) => s.line === 14 && s.kind === 'assign')!;
  expect(inLoop.frames[0].vars.q).toBe('Point {x: 1, y: 5} (same box as pts[0])');
});

test('C++ rules for structs stay on Home; a member with no value yet stops the program', () => {
  const msg = (body: string, more = '') => run(prog(body, more)).error?.message;
  expect(msg('    Point a = {1, 2};\n    Point b = {1, 2};\n    bool same = a == b;')).toBe("Line 14: C++ can't compare two Point values with ==: compare their parts, like a.x == b.x.");
  expect(msg('    Point a = {1, 2};\n    cout << a;')).toBe("Line 13: cout can't print a Point directly: print its parts, like a.x.");
  expect(msg('    Point a = {1, 2, 3};')).toBe('Line 12: Point has 2 members, not 3.');
  expect(msg('    int x = 1;', 'class Big : Point {\n};\n\n')).toBe("Line 11: StepViz can't run private inheritance (write public Point) in C++ yet.");
  expect(msg('    int x = 1;', 'struct Box {\n    ~Box() { int z = 1; }\n};\n\n')).toBe("Line 12: StepViz can't run destructors with code in them in C++ yet.");
  expect(msg('    int x = 1;', 'struct Box {\n    friend void f();\n};\n\n')).toBe("Line 12: StepViz can't run friends in C++ yet.");
  const unset = run(prog('    Point p;\n    p.x = 1;\n    cout << p.y;'));
  expect(unset.error).toMatchObject({ type: 'Uninitialized', line: 14 });
});

test('C structs: struct Point, typedef, .x = 1, text in a char array, scanf into a member', () => {
  const src = `#include <stdio.h>

typedef struct {
    char name[10];
    int age;
} Student;

struct Point {
    int x;
    int y;
};

int main() {
    Student s = {"Sam", 15};
    struct Point p = {.y = 4};
    p.x = 3;
    scanf("%d", &s.age);
    printf("%s %d %d %d\\n", s.name, s.age, p.x, p.y);
    return 0;
}`;
  const { r, e } = explain(src, 'c', '16');
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('Sam 16 3 4\n');
  expect(r.steps[0].frames[0].vars.s).toBe('Student {name: "Sam", age: 15}');
  expect(r.steps[1].frames[0].vars.p).toBe('Point {x: 0, y: 4}');
  expect(e[3].what).toMatch(/^(We read 16 with scanf and store it in s\.age|s\.age gets 16, the next value from the input)\.$/);
  expect(runC('#include <stdio.h>\nint main() {\n    class A {};\n    return 0;\n}').status).toBe('syntax-error');
});

test('a member value written in the struct can use members above it', () => {
  expect(out(prog('    int a = 100;\n    Box b;\n    cout << b.a << " " << b.c << endl;', 'struct Box {\n    int a = 2;\n    int c = a * 10;\n};\n\n'))).toBe('2 20\n');
});
