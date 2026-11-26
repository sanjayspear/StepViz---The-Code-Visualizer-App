// C++ inheritance: base part first, virtual vs non-virtual, slicing, protected, pure virtual, vector<Animal*> (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
});
const run = (src: string) => runCpp(parser.parse(src)!, { maxSteps: 2000, maxSeconds: 5 });
const HEAD = '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n';
const ZOO = `class Animal {
public:
    Animal(string n) : name(n) {}
    virtual ~Animal() {}
    virtual string sound() = 0;
    string plain() { return "..."; }
    string describe() { return name + " says " + sound(); }
protected:
    string name;
};

class Dog : public Animal {
public:
    Dog(string n) : Animal(n) {}
    string sound() override { return "Woof"; }
    string plain() { return "Dog plain"; }
};

class Cat : public Animal {
public:
    Cat(string n) : Animal(n) {}
    string sound() override { return "Meow"; }
};

`;
/** HEAD + ZOO, then main (its body starts on line 31). */
const zoo = (body: string) => `${HEAD}${ZOO}int main() {\n${body}\n    return 0;\n}`;

test('vector<Animal*>: virtual methods use the object\'s own class, non-virtual ones the pointer\'s type; the base part is made first', () => {
  const src = zoo(`    vector<Animal*> pets;
    pets.push_back(new Dog("Rex"));
    pets.push_back(new Cat("Tom"));
    for (Animal* a : pets) {
        cout << a->describe() << " / " << a->plain() << endl;
    }
    Dog d("Bo");
    Animal& r = d;
    cout << r.sound() << " " << d.plain() << endl;
    for (Animal* a : pets) {
        delete a;
    }`);
  const r = run(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('Rex says Woof / ...\nTom says Meow / ...\nWoof Dog plain\n');
  const base = r.steps.find((s) => s.frames.at(-1)!.name === 'Animal::Animal("Rex")')!;
  expect(base.line).toBe(19);
  expect(base.frames.map((f) => f.name)).toEqual(['main()', 'Dog::Dog("Rex")', 'Animal::Animal("Rex")']);
  const e = explainTrace({ language: 'cpp', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  const k = r.steps.indexOf(base);
  expect(e[k].what).toBe('Dog::Dog("Rex") first runs Animal::Animal("Rex") to set up the Animal part of the object.');
  expect(r.steps.some((s) => s.frames.at(-1)!.name === 'a->describe()')).toBe(true);
});

test('slicing: copying a Dog into an Animal keeps only the Animal part; a reference keeps the whole Dog', () => {
  const src = `${HEAD}class Base {
public:
    int a = 1;
    virtual string who() { return "Base"; }
};

class Derived : public Base {
public:
    int b = 2;
    string who() override { return "Derived"; }
};

void show(Base x, Base& y) {
    cout << x.who() << " " << y.who() << endl;
}

int main() {
    Derived d;
    Base copy = d;
    show(d, d);
    return 0;
}`;
  const r = run(src);
  expect(r.status).toBe('ok');
  expect(r.steps.find((s) => s.line === 24 && s.kind === 'assign')!.frames[0].vars).toMatchObject({ d: 'Derived {a: 1, b: 2}', copy: 'Base {a: 1}' });
  expect(r.steps.at(-1)!.output).toBe('Base Derived\n');
});

test('C++ rules for classes built on others stay on Home', () => {
  const msg = (src: string) => run(src).error?.message;
  expect(msg(zoo('    Animal a("x");'))).toBe("Line 31: Animal has a pure virtual method (sound() = 0), so you can't make an Animal itself: make one of the classes built on it.");
  expect(msg(zoo('    Dog d("Rex");\n    cout << d.name;'))).toBe('Line 32: name is protected in Animal, so only code inside Animal and the classes built on it can use it.');
  const two = (base: string, derived: string, body: string) => `${HEAD}${base}\n\n${derived}\n\nint main() {\n${body}\n    return 0;\n}`;
  expect(msg(two('class A {\npublic:\n    A(int x) {}\n};', 'class B : public A {\npublic:\n    B() {}\n};', '    B b;'))).toBe(
    "Line 13: A has no constructor that takes no values, so B's constructor must call A(...) in its member list.",
  );
  expect(msg(two('class A {\nprivate:\n    int secret = 1;\n};', 'class B : public A {\npublic:\n    int peek() { return secret; }\n};', '    B b;\n    int s = b.peek();'))).toBe(
    "Line 13: secret is private in A, so B can't use it (make it protected).",
  );
  expect(msg(two('class A {\npublic:\n    int x = 1;\n};', 'class B : public A {\npublic:\n    int y = 2;\n};', '    A* p = new B();\n    int v = p->y;'))).toBe('Line 18: p is an A pointer, and A has no member y.');
  expect(msg(two('class A {\n};', 'class B : private A {\n};', '    int x = 1;'))).toBe("Line 9: StepViz can't run private inheritance (write public A) in C++ yet.");
});
