// Java lambdas, method references and Comparator (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
});
const STUDENT = `class Student {
    String name;
    int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    int getScore() {
        return score;
    }

    public String toString() {
        return name;
    }
}
`;
const prog = (body: string) => `import java.util.*;\n${STUDENT}\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
const run = (body: string) => runJava(parser.parse(prog(body))!, { maxSteps: 3000, maxSeconds: 5 });
const MAKE = '        List<Student> list = new ArrayList<>();\n        list.add(new Student("Sam", 70));\n        list.add(new Student("Ali", 90));\n        list.add(new Student("Bo", 80));\n';

test('sorting with a lambda, Comparator.comparing with a method reference, reversed, a Comparator variable', () => {
  const r = run(`${MAKE}        list.sort((a, b) -> a.score - b.score);
        System.out.print(list + " ");
        list.sort(Comparator.comparing(Student::getScore).reversed());
        System.out.print(list + " ");
        Comparator<Student> byName = (a, b) -> a.name.compareTo(b.name);
        Collections.sort(list, byName);
        System.out.println(list + " " + Collections.max(list, Comparator.comparingInt(s -> s.score)));`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('[Sam, Bo, Ali] [Ali, Bo, Sam] [Ali, Bo, Sam] Ali\n');
  const lambdaFrame = r.steps.find((s) => s.frames.at(-1)!.name.startsWith('lambda('))!;
  expect(Object.keys(lambdaFrame.frames.at(-1)!.vars)).toEqual(['a', 'b']);
});

test('forEach, removeIf, replaceAll, map.forEach and System.out::println', () => {
  const r = run(`        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5));
        nums.removeIf(x -> x % 2 == 0);
        nums.replaceAll(x -> x * 10);
        nums.forEach(System.out::println);
        Map<String, Integer> ages = new TreeMap<>();
        ages.put("Bo", 4);
        ages.put("Al", 7);
        ages.forEach((k, v) -> System.out.println(k + "=" + v));
        nums.forEach(x -> {
            int half = x / 2;
            System.out.print(half + " ");
        });`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('10\n30\n50\nAl=7\nBo=4\n5 15 25 ');
});

test("Java's rules for lambdas stay on Home", () => {
  const msg = (body: string) => run(body).error?.message;
  expect(msg('        int total = 0;\n        List<Integer> nums = new ArrayList<>(List.of(1, 2));\n        nums.forEach(x -> total += x);')).toBe(
    "Line 24: total can't be changed inside a lambda: a lambda may only read the variables around it.",
  );
  expect(msg('        var f = (int a) -> a;')).toMatch(/^Line 22: StepViz can't run var with a lambda/);
  expect(msg('        int[] a = {3, 1};\n        Arrays.sort(a, (x, y) -> y - x);')).toBe('Line 23: Arrays.sort with a rule needs an array of objects (like String[]), not int[].');
});
