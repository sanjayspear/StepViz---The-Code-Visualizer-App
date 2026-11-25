// Java ArrayList, Collections and more String / Character methods (Node).
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
const IMPORTS = 'import java.util.ArrayList;\nimport java.util.List;\nimport java.util.Arrays;\nimport java.util.Collections;\n';
/** A program with these imports and this body inside main (main's body starts on line 7). */
const prog = (body: string, methods = '') =>
  `${IMPORTS}public class Main {\n${methods}    public static void main(String[] args) {\n${body}\n    }\n}`;
const run = (src: string) => runJava(parser.parse(src)!, opts);
const out = (body: string, methods = '') => {
  const r = run(prog(body, methods));
  if (r.status !== 'ok') throw new Error(JSON.stringify(r.error));
  return r.steps.at(-1)!.output;
};
const explain = (src: string) => {
  const r = run(src);
  return { r, e: explainTrace({ language: 'java', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })), listView: r.listView }) };
};

test('ArrayList basics: add, get, set, size, remove by position and by value, print', () => {
  const src = prog(`        ArrayList<Integer> nums = new ArrayList<>();
        nums.add(5);
        nums.add(8);
        nums.add(0, 2);
        nums.set(1, 7);
        int first = nums.get(0);
        nums.remove(0);
        nums.remove(Integer.valueOf(8));
        System.out.println(nums + " " + nums.size() + " " + first + " " + nums.isEmpty());`);
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  expect(r.steps.map((s) => s.frames[0].vars.nums)).toEqual(['[]', '[5]', '[5, 8]', '[2, 5, 8]', '[2, 7, 8]', '[2, 7, 8]', '[7, 8]', '[7]', '[7]']);
  expect(r.steps.slice(1, 5).map((s) => s.kind)).toEqual(['assign', 'assign', 'assign', 'assign']);
  expect(r.steps.at(-1)!.output).toBe('[7] 1 2 false\n');
  expect(e[1].what).toMatch(/^(5 is added to the end of nums|nums grows by one: 5 goes on the end)\.$/);
  expect(e[4].what).toMatch(/^(nums\[1\] changes from 5 to 7|Position 1 of nums was 5 and is now 7)\.$/);
  expect(e[3].what).toMatch(/^(2 is put in at position 0 of nums|nums grows by one: 2 goes in at position 0)\.$/);
  expect(e[6].what).toMatch(/^(2 is taken out of nums at position 0|nums gets shorter: 2 at position 0 is removed)\.$/);
});

test('List<String>, new ArrayList<>(Arrays.asList(...)), contains, indexOf, for-each, Collections', () => {
  expect(
    out(`        List<String> names = new ArrayList<>(Arrays.asList("Sam", "ali", "Bo"));
        names.add("Cy");
        String all = "";
        for (String n : names) {
            all += n.charAt(0);
        }
        Collections.sort(names);
        System.out.println(all + " " + names + " " + names.contains("Bo") + " " + names.indexOf("Cy") + " " + Collections.max(names));
        Collections.reverse(names);
        ArrayList<Double> d = new ArrayList<>(List.of(1.5, 2.0));
        System.out.println(names + " " + d + " " + String.join("-", names));`),
  ).toBe('SaBC [Bo, Cy, Sam, ali] true 1 ali\n[ali, Sam, Cy, Bo] [1.5, 2.0] ali-Sam-Cy-Bo\n');
});

test('lists are shared when passed to a method; frames show the list', () => {
  const r = run(prog('        ArrayList<Integer> xs = new ArrayList<>();\n        fill(xs, 3);\n        System.out.println(xs);', '    static void fill(ArrayList<Integer> list, int n) {\n        for (int i = 1; i <= n; i++) {\n            list.add(i * i);\n        }\n    }\n\n'));
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('[1, 4, 9]\n');
  expect(r.steps.find((s) => s.kind === 'call')!.frames.at(-1)!.name).toBe('fill([], 3)');
  expect(r.listView?.list).toBe('list');
});

test('Integer objects: == compares objects (small ones shared), equals compares values, unboxing null crashes', () => {
  expect(
    out(`        ArrayList<Integer> a = new ArrayList<>();
        a.add(100);
        a.add(100);
        a.add(1000);
        a.add(1000);
        Integer x = 5;
        int sum = a.get(0) + a.get(2);
        System.out.println((a.get(0) == a.get(1)) + " " + (a.get(2) == a.get(3)) + " " + a.get(2).equals(a.get(3)) + " " + (a.get(2) == 1000) + " " + sum + " " + x);`),
  ).toBe('true false true true 1100 5\n');
  const r = run(prog('        ArrayList<Integer> a = new ArrayList<>();\n        a.add(null);\n        int y = a.get(0);'));
  expect(r.error).toMatchObject({ line: 9, type: 'NullPointerException' });
});

test('crashes: position outside the list, changing a list inside its for-each loop', () => {
  const { r, e } = explain(prog('        ArrayList<Integer> a = new ArrayList<>();\n        a.add(1);\n        System.out.println(a.get(3));'));
  expect(r.error).toEqual({ line: 9, type: 'IndexOutOfBoundsException', message: 'Index 3 out of bounds for length 1' });
  expect(e.at(-1)!.what).toBe('This position is outside the list.');
  const cme = explain(prog('        ArrayList<Integer> a = new ArrayList<>(List.of(1, 2, 3));\n        for (int x : a) {\n            if (x == 1) {\n                a.remove(0);\n            }\n        }'));
  expect(cme.r.error).toMatchObject({ type: 'ConcurrentModificationException' });
  expect(cme.e.at(-1)!.what).toBe('The list was changed while a for-each loop was going through it.');
  // Like Java: removing the second-to-last item ends the loop quietly.
  expect(run(prog('        ArrayList<Integer> a = new ArrayList<>(List.of(1, 2, 3));\n        for (int x : a) {\n            if (x == 2) {\n                a.remove(0);\n            }\n        }')).status).toBe('ok');
});

test('problems Java would reject stay on Home', () => {
  const msg = (body: string) => run(prog(body)).error?.message;
  expect(msg('        ArrayList<int> a = new ArrayList<>();')).toBe('Line 7: An ArrayList holds objects, not int values: write ArrayList<Integer>.');
  expect(msg('        ArrayList<Double> a = new ArrayList<>();\n        a.add(5);')).toBe("Line 8: a holds Double values, so it can't hold 5.");
  expect(msg('        ArrayList<Integer> a = new ArrayList<>();\n        int n = a.length;')).toBe('Line 8: a is a list: use a.size() for how many items it has.');
  expect(msg('        List<Integer> a = Arrays.asList(1, 2);')).toBe("Line 7: StepViz can't run Arrays.asList outside new ArrayList<>(...) in Java yet.");
  expect(msg('        ArrayList<ArrayList<Integer>> g = new ArrayList<>();')).toBe("Line 7: StepViz can't run lists of lists in Java yet.");
  expect(msg('        ArrayList a = new ArrayList();')).toMatch(/^Line 7: StepViz can't run ArrayList without the type of its items/);
  expect(msg('        Integer x = 2.5;')).toBe("Line 7: x is an Integer box, so it can't hold 2.5.");
});

test('Bubble sort on an ArrayList: list view, compared items, swap steps (temp variable and Collections.swap)', () => {
  const body = (swap: string) => `        ArrayList<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 1));
        for (int i = 0; i < nums.size() - 1; i++) {
            for (int j = 0; j < nums.size() - 1 - i; j++) {
                if (nums.get(j) > nums.get(j + 1)) {
${swap}
                }
            }
        }
        System.out.println(nums);`;
  for (const swap of [
    '                    int temp = nums.get(j);\n                    nums.set(j, nums.get(j + 1));\n                    nums.set(j + 1, temp);',
    '                    Collections.swap(nums, j, j + 1);',
  ]) {
    const { r, e } = explain(prog(body(swap)));
    expect(r.status).toBe('ok');
    expect(r.listView).toMatchObject({ list: 'nums', outerLine: 8, loopVars: ['i', 'j'] });
    const swaps = r.steps.filter((s) => s.kind === 'swap');
    expect(swaps.map((s) => [s.list!.values.join(','), s.list!.swap])).toEqual([
      ['5,2,8,1', [0, 1]],
      ['2,5,8,1', [2, 3]],
      ['2,5,1,8', [1, 2]],
      ['2,1,5,8', [0, 1]],
    ]);
    expect(r.steps.find((s) => s.kind === 'branch-taken')!.list!.compare).toEqual([0, 1]);
    expect(r.steps.at(-1)!.output).toBe('[1, 2, 5, 8]\n');
    expect(e[r.steps.indexOf(swaps[0])].what).toMatch(/^5 and 2 (are about to swap places|trade places now)\.$/);
  }
});

test('more String methods, like Java', () => {
  expect(
    out(`        String s = "  Hello, World  ";
        String t = s.trim();
        System.out.println(t.substring(7) + "|" + t.substring(0, 5) + "|" + t.indexOf('o') + "|" + t.lastIndexOf("o") + "|" + t.indexOf("xyz"));
        System.out.println(t.toUpperCase() + "|" + t.toLowerCase() + "|" + t.contains("World") + "|" + t.startsWith("He") + "|" + t.endsWith("!"));
        System.out.println(t.replace('l', 'L') + "|" + t.replace("World", "Sam") + "|" + "ab".repeat(3) + "|" + "".isEmpty() + "|" + "  ".isBlank());
        System.out.println("apple".compareTo("banana") + "|" + "B".compareTo("a") + "|" + "Hi".equalsIgnoreCase("hI") + "|" + "a".concat("b"));
        String[] parts = "red, green,blue".split(",\\\\s*");
        char[] cs = "abc".toCharArray();
        System.out.println(parts.length + "|" + parts[1] + "|" + Arrays.toString(parts) + "|" + cs[2] + "|" + String.valueOf(cs));`),
  ).toBe(
    'World|Hello|4|8|-1\nHELLO, WORLD|hello, world|true|true|false\nHeLLo, WorLd|Hello, Sam|ababab|true|true\n-1|-31|true|ab\n3|green|[red, green, blue]|c|abc\n',
  );
  // A method that changes nothing gives back the same object; == shows it, like Java.
  expect(out('        String a = "hi";\n        String b = a.trim();\n        String c = a.toUpperCase();\n        System.out.println((a == b) + " " + (a == c));')).toBe('true false\n');
  const r = run(prog('        String s = "abc";\n        String t = s.substring(2, 5);'));
  expect(r.error).toEqual({ line: 8, type: 'StringIndexOutOfBoundsException', message: 'begin 2, end 5, length 3' });
});

test('Character methods and counting letters in a list', () => {
  expect(
    out(`        String word = "Hi 2 U";
        int letters = 0;
        int digits = 0;
        for (char c : word.toCharArray()) {
            if (Character.isLetter(c)) {
                letters++;
            } else if (Character.isDigit(c)) {
                digits++;
            }
        }
        System.out.println(letters + " " + digits + " " + Character.toUpperCase('q') + " " + Character.isUpperCase('H') + " " + Character.getNumericValue('7'));`),
  ).toBe('3 1 Q true 7\n');
});

test('Arrays.sort and Collections.sort put text in Java order (capital letters first)', () => {
  expect(out('        String[] a = {"b", "A", "a", "B"};\n        Arrays.sort(a);\n        System.out.println(Arrays.toString(a));')).toBe('[A, B, a, b]\n');
});
