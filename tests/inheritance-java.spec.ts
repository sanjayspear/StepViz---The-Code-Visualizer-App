// Java inheritance: extends, super(...), overriding, super.method(), abstract, instanceof, casts (Node).
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

const ANIMALS = `import java.util.ArrayList;

abstract class Animal {
    protected String name;
    private int legs = 4;

    Animal(String name) {
        this.name = name;
    }

    abstract String sound();

    String describe() {
        return name + " says " + sound();
    }
}

class Dog extends Animal {
    String breed;

    Dog(String name, String breed) {
        super(name);
        this.breed = breed;
    }

    @Override
    String sound() {
        return "Woof";
    }
}

class Cat extends Animal {
    Cat(String name) {
        super(name);
    }

    String sound() {
        return "Meow";
    }

    @Override
    String describe() {
        return "The cat: " + super.describe();
    }
}
`;
/** ANIMALS (lines 1-45) and Main; main's body starts on line 48. */
const withAnimals = (body: string) => `${ANIMALS}
public class Main {
    public static void main(String[] args) {
${body}
    }
}`;

test('super(...) makes the part from the class above first; overriding picks the object\'s own method; super.describe()', () => {
  const src = withAnimals(`        ArrayList<Animal> pets = new ArrayList<>();
        pets.add(new Dog("Rex", "Lab"));
        pets.add(new Cat("Tom"));
        for (Animal a : pets) {
            System.out.println(a.describe());
        }`);
  const r = run(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('Rex says Woof\nThe cat: Tom says Meow\n');
  const sup = r.steps.find((s) => s.frames.at(-1)!.name === 'super("Rex")')!;
  expect(sup.frames.at(-1)!.vars).toEqual({ this: 'Dog {name: null, legs: 0, breed: null}', name: '"Rex"' });
  const back = r.steps.findIndex((s) => s.kind === 'return' && s.frames.at(-1)!.name === 'super("Rex")');
  expect(r.steps[back].frames.at(-1)!.vars.this).toBe('Dog {name: "Rex", legs: 4, breed: null}');
  const e = explainTrace({ language: 'java', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  expect(e[back + 1].what).toMatch(/super\("Rex"\)/);
  expect(r.steps.some((s) => s.frames.at(-1)!.name === 'super.describe()')).toBe(true);
});

test('instanceof, casts (ClassCastException when wrong), a Dog in an Animal box prints as Dog@...', () => {
  const r = run(withAnimals(`        Animal first = new Dog("Rex", "Lab");
        System.out.println((first instanceof Dog) + " " + (first instanceof Cat) + " " + ((Dog) first).breed + " " + String.valueOf(first).startsWith("Dog@"));
        Cat c = (Cat) first;`));
  expect(r.steps.find((s) => s.kind === 'print')!.output).toBe('true false Lab true\n');
  expect(r.error).toEqual({ line: 51, type: 'ClassCastException', message: 'class Dog cannot be cast to class Cat' });
});

test("Java's rules for classes that extend others stay on Home", () => {
  const msg = (src: string) => run(src).error?.message;
  const main = (classes: string, body = '        int x = 1;') => `${classes}\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
  expect(msg(withAnimals('        Animal a = new Animal("x");'))).toBe('Line 49: Animal is abstract, so new Animal() is not allowed: make one of the classes that extend it.');
  expect(msg(withAnimals('        Animal a = new Dog("Rex", "Lab");\n        String b = a.breed;'))).toBe('Line 50: a is an Animal box, and Animal has no field breed: cast it first, like ((Dog) a).breed.');
  expect(msg(main('class A {\n    private int secret = 1;\n}\n\nclass B extends A {\n    int peek() {\n        return secret;\n    }\n}', '        int v = new B().peek();'))).toBe(
    "Line 7: secret is private in A, so B can't use it (make it protected, or use a method of A).",
  );
  expect(msg(main('abstract class S {\n    abstract int area();\n}\n\nclass Q extends S {\n}'))).toBe('Line 5: Q must have its own area() method, because S only promises it (abstract).');
  expect(msg(main('class A {\n    A(int x) {\n    }\n}\n\nclass B extends A {\n    B() {\n    }\n}', '        B b = new B();'))).toBe(
    'Line 12: A has no constructor that takes no values, so the constructor below it must start with super(...).',
  );
  expect(msg(main('class A {\n}\n\nclass B extends A {\n    B() {\n        int x = 1;\n        super();\n    }\n}'))).toMatch(/^Line 7: /);
  expect(msg(main('class A implements Runnable {\n}'))).toBe("Line 1: StepViz can't run the interface Runnable in Java yet.");
});
