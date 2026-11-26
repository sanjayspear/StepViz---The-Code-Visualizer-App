// Java interfaces, default methods and Comparable (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
});
const run = (src: string) => runJava(parser.parse(src)!, { maxSteps: 2000, maxSeconds: 5 });
const prog = (types: string, body: string) => `import java.util.*;\n\n${types}\n\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
const SHAPES = `interface Shape {
    double area();

    default String label() {
        return "area " + area();
    }
}

interface Named {
    String name();
}

class Square implements Shape, Named {
    double side;

    Square(double side) {
        this.side = side;
    }

    public double area() {
        return side * side;
    }

    public String name() {
        return "square";
    }
}

class Circle implements Shape {
    public double area() {
        return 3.0;
    }

    public String label() {
        return "circle";
    }
}`;

test('a class implements interfaces; default methods; interface types for variables and lists; instanceof and casts', () => {
  const r = run(
    prog(
      SHAPES,
      `        List<Shape> shapes = new ArrayList<>();
        shapes.add(new Square(2));
        shapes.add(new Circle());
        for (Shape s : shapes) {
            System.out.print(s.label() + "; ");
        }
        Shape first = shapes.get(0);
        System.out.println((first instanceof Named) + " " + ((Named) first).name() + " " + (shapes.get(1) instanceof Named));
        Named n = (Named) shapes.get(1);`,
    ),
  );
  expect(r.steps.find((s) => s.kind === 'print' && s.output.includes('true'))!.output).toBe('area 4.0; circle; true square false\n');
  expect(r.error).toMatchObject({ type: 'ClassCastException', message: 'class Circle cannot be cast to class Named' });
});

test('Comparable: Collections.sort and Collections.max call compareTo in the same order as Java', () => {
  const student = `class Student implements Comparable<Student> {
    String name;
    int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public int compareTo(Student other) {
        return score - other.score;
    }

    public String toString() {
        return name;
    }
}`;
  const r = run(
    prog(student, '        ArrayList<Student> list = new ArrayList<>();\n        list.add(new Student("Sam", 70));\n        list.add(new Student("Ali", 90));\n        list.add(new Student("Bo", 80));\n        Collections.sort(list);\n        System.out.println(list + " " + Collections.max(list));'),
  );
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('[Sam, Bo, Ali] Ali\n');
  const compares = r.steps.filter((s) => s.kind === 'call' && s.frames.at(-1)!.name.startsWith('Student.compareTo')).map((s) => /"(\w+)"/.exec(s.frames.at(-1)!.name)![1]);
  // TimSort on 3 items: Ali vs Sam, Bo vs Ali (run ends), then binary insertion of Bo: vs Ali, vs Sam; max: Bo vs Sam, Ali vs Bo.
  expect(compares).toEqual(['Sam', 'Ali', 'Ali', 'Sam', 'Sam', 'Bo']);
});

test("Java's rules for interfaces stay on Home", () => {
  const msg = (types: string, body = '        int x = 1;') => run(prog(types, body)).error?.message;
  expect(msg(SHAPES, '        Shape s = new Shape();')).toMatch(/Shape is an interface, so new Shape\(\) is not allowed: make an object of a class that implements it\.$/);
  expect(msg('interface Shape {\n    double area();\n}\n\nclass Dot implements Shape {\n}')).toBe('Line 7: Dot must have its own area() method, because Shape only promises it.');
  expect(msg('interface Shape {\n    double area();\n}\n\nclass Dot implements Shape {\n    double area() {\n        return 0;\n    }\n}')).toBe(
    'Line 8: area() must be public in Dot, because Shape makes it public (write public before it).',
  );
  expect(msg('class P {\n}', '        ArrayList<P> ps = new ArrayList<>();\n        ps.add(new P());\n        ps.add(new P());\n        Collections.sort(ps);')).toMatch(
    /P objects can't be sorted by themselves: write class P implements Comparable<P> with a compareTo method\.$/,
  );
  expect(msg('interface Shape {\n    int SIDES = 4;\n}')).toBe("Line 4: StepViz can't run constants in interfaces in Java yet.");
});
