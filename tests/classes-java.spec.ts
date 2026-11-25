// Simple Java classes: fields, constructors, methods, this, toString, objects in arrays and lists (Node).
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
const run = (src: string) => runJava(parser.parse(src)!, opts);
const explain = (src: string) => {
  const r = run(src);
  return { r, e: explainTrace({ language: 'java', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) }) };
};
/** A Dog class (lines 1-22), then Main with this body (main's body starts on line 26). */
const DOG = `class Dog {
    private String name;
    private int age;
    int tricks = 0;

    Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    void birthday() {
        age++;
    }

    String getName() {
        return name;
    }

    public String toString() {
        return name + " (" + age + ")";
    }
}
`;
const withDog = (body: string, extra = '') => `${DOG}${extra}
public class Main {
    public static void main(String[] args) {
${body}
    }
}`;
const out = (src: string) => {
  const r = run(src);
  if (r.status !== 'ok') throw new Error(JSON.stringify(r.error));
  return r.steps.at(-1)!.output;
};

test('new Dog(...): a constructor frame with this, the fields filling in, then the object in rex', () => {
  const src = withDog('        Dog rex = new Dog("Rex", 3);\n        rex.birthday();\n        rex.tricks = 2;\n        String n = rex.getName();\n        System.out.println(rex);');
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  expect(r.steps[0]).toMatchObject({ line: 26, kind: 'call' });
  expect(r.steps[0].frames[1]).toEqual({ name: 'new Dog("Rex", 3)', vars: { this: 'Dog {name: null, age: 0, tricks: 0}', name: '"Rex"', age: '3' }, status: 'running' });
  expect(e[0].what).toMatch(/^(We make a new Dog object\. new Dog\("Rex", 3\) starts in a new box with name = "Rex", age = 3|A new Dog object is being made: new Dog\("Rex", 3\) gets its own box with name = "Rex", age = 3)\.$/);
  expect(e[1].what).toMatch(/^(this\.name changes from null to "Rex"|In this, name was null and is now "Rex")\.$/);
  expect(r.steps[2]).toMatchObject({ kind: 'return' });
  expect(r.steps[2].frames[1].returns).toBe('returns Dog {name: "Rex", age: 3, tricks: 0}');
  expect(r.steps[3].frames).toEqual([{ name: 'main()', vars: { rex: 'Dog {name: "Rex", age: 3, tricks: 0}', n: '?' }, status: 'running' }]);
  expect(e[3].what).toMatch(/^(The new Dog object is stored in rex|rex now holds the new Dog object)\.$/);
  expect(r.steps[4].frames[1].name).toBe('rex.birthday()');
  expect(e[6].what).toMatch(/^(Back in main\(\): rex\.birthday\(\) has finished, so the program carries on|rex\.birthday\(\) is over, and main\(\) carries on from where it stopped)\.$/);
  expect(e[7].what).toMatch(/^(rex\.tricks changes from 0 to 2|In rex, tricks was 0 and is now 2)\.$/);
  expect(r.steps.at(-1)!.output).toBe('Rex (4)\n');
});

test('objects are shared, == compares objects, default toString and equals', () => {
  const plain = 'class Point {\n    int x;\n    int y;\n}\n';
  expect(
    out(`${plain}
public class Main {
    static void move(Point p) {
        p.x = p.x + 1;
    }

    public static void main(String[] args) {
        Point a = new Point();
        Point b = a;
        Point c = new Point();
        move(b);
        System.out.println(a.x + " " + (a == b) + " " + (a == c) + " " + a.equals(b) + " " + a.equals(c) + " " + String.valueOf(a).startsWith("Point@"));
    }
}`),
  ).toBe('1 true false true false true\n');
});

test('arrays and ArrayLists of objects; for-each over them', () => {
  expect(
    out(
      withDog(`        Dog[] pack = new Dog[2];
        pack[0] = new Dog("Rex", 3);
        pack[1] = new Dog("Bo", 5);
        ArrayList<Dog> list = new ArrayList<>();
        int total = 0;
        for (Dog d : pack) {
            list.add(d);
            total += d.getName().length();
        }
        System.out.println(list + " " + total + " " + list.contains(pack[1]) + " " + list.get(0).getName());`).replace('class Dog {', 'import java.util.ArrayList;\nclass Dog {'),
    ),
  ).toBe('[Rex (3), Bo (5)] 5 true Rex\n');
});

test('a linked chain of objects shows the inner object as Node {…}; static methods in a class; calling methods inside the class', () => {
  const src = `class Node {
    int value;
    Node next;

    Node(int value, Node next) {
        this.value = value;
        this.next = next;
    }

    int sum() {
        if (next == null) {
            return value;
        }
        return value + next.sum();
    }

    static Node pair(int a, int b) {
        return new Node(a, new Node(b, null));
    }
}

public class Main {
    public static void main(String[] args) {
        Node head = Node.pair(1, 2);
        int s = head.sum();
        System.out.println(s);
    }
}`;
  const r = run(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('3\n');
  expect(r.steps.at(-1)!.frames[0].vars.head).toBe('Node {value: 1, next: Node {…}}');
  expect(r.steps.find((s) => s.frames.at(-1)!.name === 'Node.pair(1, 2)')).toBeDefined();
  expect(r.steps.find((s) => s.frames.at(-1)!.name === 'next.sum()')).toBeDefined();
});

test('null objects and private fields: a crash and a message like Java', () => {
  const nul = run(withDog('        Dog d = null;\n        int x = 1;\n        d.birthday();'));
  expect(nul.error).toMatchObject({ type: 'NullPointerException', line: 28 });
  const priv = run(withDog('        Dog d = new Dog("Rex", 3);\n        System.out.println(d.name);'));
  expect(priv.error?.message).toBe('Line 27: name is private in Dog, so only code inside Dog can use it.');
});

test('class rules Java checks before running stay on Home', () => {
  const msg = (src: string) => run(src).error?.message;
  const main = (cls: string, body = '        int x = 1;') => `${cls}\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
  expect(msg(main('public class Dog {\n}'))).toBe('Line 1: Only one class in a file can be public: remove public from class Dog.');
  expect(msg(main('class Dog extends Animal {\n}'))).toBe("Line 1: StepViz can't run inheritance (extends) in Java yet.");
  expect(msg(main('class Dog {\n    static int count;\n}'))).toBe("Line 2: StepViz can't run static variables in Java yet.");
  expect(msg(main('class Dog {\n    Dog(int a) {\n    }\n}', '        Dog d = new Dog();'))).toBe('Line 7: Dog has no constructor that takes no values.');
  expect(msg(main('class Dog {\n    int age;\n    static int get() {\n        return age;\n    }\n}', '        int a = Dog.get();'))).toBe(
    "Line 4: age belongs to each Dog object, so a static method can't use it on its own.",
  );
  expect(msg(main('class Dog {\n    int age;\n}', '        Dog d = 5;'))).toBe("Line 6: d is a Dog box, so it can't hold 5.");
  expect(msg('public class Main {\n    class Inner {\n    }\n    public static void main(String[] args) {\n    }\n}')).toBe("Line 2: StepViz can't run inner classes (write static class instead) in Java yet.");
  // static class inside Main works.
  expect(out('public class Main {\n    static class Box {\n        int v = 7;\n    }\n\n    public static void main(String[] args) {\n        Box b = new Box();\n        System.out.println(b.v);\n    }\n}')).toBe('7\n');
});
