// Java streams (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
});
const run = (src: string) => runJava(parser.parse(src)!, { maxSteps: 3000, maxSeconds: 5 });
const prog = (body: string, more = '') =>
  `import java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n${more}    public static void main(String[] args) {\n${body}\n    }\n}`;
const msg = (body: string) => run(prog(body)).error?.message;
/** The values each lambda call got, in order (lambda(5) -> "5"). */
const lambdaCalls = (r: ReturnType<typeof run>) =>
  r.steps.filter((s) => s.kind === 'call' && s.frames.at(-1)!.name.startsWith('lambda(')).map((s) => s.frames.at(-1)!.name.slice(7, -1));

test('each item goes through filter and map before the next one starts; collect gives the list', () => {
  const src = prog(`        List<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 1, 4));
        List<Integer> evens = nums.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * 10)
            .collect(Collectors.toList());
        System.out.println(evens);`);
  const r = run(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('[20, 80, 40]\n');
  // filter(5), filter(2), map(2), filter(8), map(8), filter(1), filter(4), map(4)
  expect(lambdaCalls(r)).toEqual(['5', '2', '2', '8', '8', '1', '4', '4']);
  const returns = r.steps.filter((s) => s.kind === 'return' && s.frames.at(-1)!.name.startsWith('lambda(')).map((s) => s.line);
  expect(returns).toEqual([8, 8, 9, 8, 9, 8, 8, 9]); // the filter line, then the map line
  const e = explainTrace({ language: 'java', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  const stored = r.steps.findIndex((s) => s.kind === 'assign' && s.frames[0].vars.evens === '[20, 80, 40]');
  expect(e[stored].what).toMatch(/evens\b.*\[20, 80, 40\]/);
});

test('numbers: mapToInt, sum, average, IntStream.range, max with a rule, reduce, count, anyMatch stops early', () => {
  const r = run(
    prog(`        List<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 1, 4));
        int total = nums.stream().mapToInt(n -> n).sum();
        System.out.println(total + " " + nums.stream().mapToInt(n -> n).average().getAsDouble());
        System.out.println(IntStream.rangeClosed(1, 4).map(i -> i * i).sum());
        System.out.println(nums.stream().max(Integer::compare).get() + " " + nums.stream().reduce(0, Integer::sum));
        long big = nums.stream().filter(n -> n > 3).count();
        System.out.println(big + " " + nums.stream().anyMatch(n -> n > 7));`),
  );
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('20 4.0\n30\n8 20\n3 true\n');
  // anyMatch: 5, 2, 8 and then it stops.
  expect(lambdaCalls(r).slice(-3)).toEqual(['5', '2', '8']);
  expect(r.steps.find((s) => s.frames[0].vars.big === '3')).toBeTruthy();
});

test('sorted with a Comparator calls it in TimSort\'s order; limit after sorted lets only two items on', () => {
  const STUDENT = `    static class Student {
        String name;
        int score;
        Student(String name, int score) {
            this.name = name;
            this.score = score;
        }
        int getScore() {
            return score;
        }
    }

`;
  const r = run(
    prog(
      `        List<Student> all = new ArrayList<>();
        all.add(new Student("Ali", 70));
        all.add(new Student("Bo", 90));
        all.add(new Student("Cy", 40));
        List<String> top = all.stream()
            .sorted(Comparator.comparing(Student::getScore).reversed())
            .limit(2)
            .map(s -> s.name)
            .collect(Collectors.toList());
        System.out.println(top);`,
      STUDENT,
    ),
  );
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('[Bo, Ali]\n');
  const keys = r.steps.filter((s) => s.kind === 'call' && s.frames.at(-1)!.name === 'Student.getScore()').map((s) => (s.frames.at(-1)!.vars.this as string).match(/"(\w+)"/)![1]);
  expect(keys).toEqual(['Bo', 'Ali', 'Cy', 'Bo', 'Cy', 'Ali']);
  expect(lambdaCalls(r).length).toBe(2);
});

test('distinct, skip, toSet, joining, mapToObj, peek (not run by count, like Java 9+), findFirst, toList', () => {
  const r = run(
    prog(`        List<Integer> nums = new ArrayList<>(List.of(3, 1, 3, 2, 1));
        System.out.println(nums.stream().distinct().skip(1).collect(Collectors.toList()));
        System.out.println(nums.stream().peek(n -> System.out.println("saw " + n)).count());
        Set<Integer> s = nums.stream().collect(Collectors.toSet());
        System.out.println(s);
        System.out.println(IntStream.range(0, 3).mapToObj(i -> "#" + i).collect(Collectors.joining()));
        System.out.println(nums.stream().map(String::valueOf).collect(Collectors.joining("-", "<", ">")));
        String[] words = {"pear", "fig"};
        System.out.println(Arrays.stream(words).map(String::toUpperCase).toList());
        System.out.println(nums.stream().filter(n -> n > 100).findFirst() + " " + nums.stream().findFirst());`),
  );
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('[1, 2]\n5\n[1, 2, 3]\n#0#1#2\n<3-1-3-2-1>\n[PEAR, FIG]\nOptional.empty Optional[3]\n');
});

test('stream crashes: get() on an empty Optional, changing a list from toList()', () => {
  const empty = run(prog('        List<Integer> nums = new ArrayList<>(List.of(1, 2));\n        int x = nums.stream().filter(n -> n > 5).findFirst().get();'));
  expect(empty.error).toMatchObject({ type: 'NoSuchElementException', message: 'No value present', line: 7 });
  const src = prog('        List<Integer> nums = new ArrayList<>(List.of(1, 2));\n        List<Integer> r = nums.stream().toList();\n        r.add(3);');
  const fixed = run(src);
  expect(fixed.error).toMatchObject({ type: 'UnsupportedOperationException', line: 8 });
  const e = explainTrace({ language: 'java', source: src, steps: fixed.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  expect(e.at(-1)!.what).toBe("This list can only be read: a list from toList() can't be changed.");
});

test('Java\'s rules for streams stay on Home', () => {
  const list = '        List<Integer> nums = new ArrayList<>(List.of(1, 2));\n';
  expect(msg(`${list}        int t = nums.stream().sum();`)).toBe('Line 7: sum() works on a stream of numbers: use mapToInt(x -> x) first.');
  expect(msg(`${list}        System.out.println(IntStream.range(0, 3).collect(Collectors.toList()));`)).toBe("Line 7: An IntStream can't collect(...) directly: use boxed() first.");
  expect(msg(`${list}        int m = nums.stream().mapToInt(n -> n).max().get();`)).toBe('Line 7: An OptionalInt gives its value with getAsInt().');
  expect(msg(`${list}        var st = nums.stream();`)).toBe("Line 7: StepViz can't run streams kept in a variable (use the stream in one statement) in Java yet.");
  expect(msg(`${list}        System.out.println(nums.stream().collect(Collectors.groupingBy(n -> n % 2)));`)).toBe("Line 7: StepViz can't run Collectors.groupingBy in Java yet.");
  expect(msg(`${list}        System.out.println(nums.stream().map(n -> n * 2));`)).toBe("Line 7: StepViz can't run printing a stream (collect it into a list first) in Java yet.");
  expect(msg(`${list}        System.out.println(nums.stream().map(n -> "x").collect(Collectors.joining()) + nums.stream().collect(Collectors.joining()));`)).toBe(
    'Line 7: Collectors.joining joins text only: use map(String::valueOf) first.',
  );
});
