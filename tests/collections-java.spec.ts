// Java StringBuilder, Stack, Queue (LinkedList), ArrayDeque and PriorityQueue (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
});
const prog = (body: string) => `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
const run = (body: string) => runJava(parser.parse(prog(body))!, { maxSteps: 3000, maxSeconds: 5 });
const explain = (body: string) => {
  const r = run(body);
  return { r, e: explainTrace({ language: 'java', source: prog(body), steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) }) };
};
const at = (r: ReturnType<typeof run>, line: number) => r.steps.findIndex((s) => s.line === line);

test('StringBuilder changes in place (shared by every variable holding it); chained calls are one change step', () => {
  const { r, e } = explain(`        StringBuilder sb = new StringBuilder();
        sb.append("ab").append(3);
        sb.insert(0, 'x');
        StringBuilder same = sb;
        same.reverse();
        String s = sb.toString();
        System.out.println(sb + " " + s + " " + sb.length() + " " + sb.charAt(1) + " " + (sb == same) + " " + sb.equals(same));
        sb.deleteCharAt(0);
        sb.setCharAt(0, 'Z');
        sb.replace(1, 2, "--");
        System.out.println(sb + " " + sb.indexOf("-"));
        sb.charAt(9);`);
  expect(r.steps.at(-1)!.output).toBe('3bax 3bax 4 b true true\nZ--x 1\n');
  expect(r.error).toMatchObject({ type: 'StringIndexOutOfBoundsException', message: 'index 9,length 4', line: 16 });
  const chained = at(r, 6);
  expect(r.steps[chained].kind).toBe('assign');
  expect(r.steps[chained].frames[0].vars.sb).toBe('"ab3"');
  expect(e[chained].what).toMatch(/sb\b.*"" .*"ab3"|sb\b.*"ab3".*""/);
  const reversed = at(r, 9);
  expect(r.steps[reversed].frames[0].vars).toMatchObject({ sb: '"3bax"', same: '"3bax"' });
});

test('StringBuilder rules: it is not a String', () => {
  expect(run('        StringBuilder sb = new StringBuilder("a");\n        String s = sb;').error?.message).toBe(
    'Line 6: s is a String box, and a StringBuilder is not a String: use .toString() to get its text.',
  );
});

test('Stack, Queue (LinkedList) and ArrayDeque: both ends, empty answers, and what the steps say', () => {
  const { r, e } = explain(`        Stack<Integer> st = new Stack<>();
        st.push(1);
        st.push(2);
        int top = st.pop();
        System.out.println(st + " " + top + " " + st.peek() + " " + st.isEmpty() + " " + st.get(0));
        Queue<String> q = new LinkedList<>();
        q.offer("a");
        q.add("b");
        String first = q.poll();
        System.out.println(first + " " + q + " " + q.peek() + " " + q.size());
        Deque<Integer> d = new ArrayDeque<>();
        d.push(1);
        d.addLast(2);
        d.offerFirst(0);
        System.out.println(d + " " + d.pollLast() + " " + d.peekFirst() + " " + d.peekLast());
        q.clear();
        System.out.println(q.poll() + " " + q.peek());
        st.clear();
        st.pop();`);
  expect(r.steps.at(-1)!.output).toBe('[1] 2 1 false 1\na [b] b 1\n[0, 1, 2] 2 0 1\nnull null\n');
  expect(r.error).toMatchObject({ type: 'EmptyStackException', line: 23 });
  expect(e.at(-1)!.what).toBe('The stack is empty, so there is nothing to take off its top.');
  expect(e[at(r, 7)].what).toMatch(/2\b.*end of st|st\b.*2 goes on the end/);
  expect(e[at(r, 8)].what).toMatch(/\btop\b.*\b2\b.* It is taken off the end of st\.$/);
  expect(e[at(r, 13)].what).toMatch(/\bfirst\b.*"a".* It is taken off the front of q\.$/);
  const front = at(r, 16);
  expect(r.steps[front].frames[0].vars.d).toBe('[1]');
});

test('queue rules: interfaces can\'t be made, ArrayDeque has no positions, empty remove() is a NoSuchElementException', () => {
  expect(run('        Queue<Integer> q = new Queue<>();').error?.message).toBe('Line 5: Queue is an interface, so new Queue<>() is not allowed: write new LinkedList<>().');
  expect(run('        Deque<Integer> d = new ArrayDeque<>();\n        d.push(1);\n        int x = d.get(0);').error?.message).toBe(
    'Line 7: An ArrayDeque has no get(...): use its ends (addFirst, addLast, pollFirst, pollLast, peekFirst, peekLast).',
  );
  const { r, e } = explain('        Queue<Integer> q = new LinkedList<>();\n        q.remove();');
  expect(r.error).toMatchObject({ type: 'NoSuchElementException', line: 6 });
  expect(e.at(-1)!.what).toBe('This is empty, so there is nothing to take or look at.');
});

test('PriorityQueue keeps Java\'s heap order (printing shows it), with natural order, a lambda or reverseOrder', () => {
  const r = run(`        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.add(5);
        pq.add(1);
        pq.add(3);
        pq.add(2);
        System.out.println(pq + " " + pq.poll() + " " + pq);
        PriorityQueue<Integer> mx = new PriorityQueue<>((x, y) -> y - x);
        mx.offer(1);
        mx.offer(3);
        System.out.println(mx.peek());
        PriorityQueue<Integer> h = new PriorityQueue<>(Collections.reverseOrder());
        h.addAll(new ArrayList<>(List.of(4, 9, 2, 7)));
        System.out.println(h + " " + new PriorityQueue<>(new ArrayList<>(List.of(5, 3, 8, 1, 9, 2))));
        h.remove(9);
        System.out.println(h + " " + h.contains(7) + " " + h.size());`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('[1, 2, 3, 5] 1 [2, 5, 3]\n3\n[9, 7, 2, 4] [1, 3, 2, 5, 9, 8]\n[7, 4, 2] true 3\n');
  // The comparing lambda runs as a frame, like list.sort: mx.offer(3) compares 3 with 1 once.
  const calls = r.steps.filter((s) => s.kind === 'call' && s.frames.at(-1)!.name.startsWith('lambda(')).map((s) => s.frames.at(-1)!.name);
  expect(calls).toEqual(['lambda(3, 1)']);
});

test('lists of lists and maps of lists: rows are shared, not copied; computeIfAbsent, merge, compute', () => {
  const { r, e } = explain(`        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            g.add(new ArrayList<>());
        }
        g.get(0).add(1);
        g.get(1).add(2);
        for (List<Integer> row : g) {
            System.out.println(row);
        }
        Map<String, List<String>> groups = new TreeMap<>();
        String[] words = {"apple", "avocado", "banana"};
        for (String w : words) {
            groups.computeIfAbsent(w.substring(0, 1), k -> new ArrayList<>()).add(w);
        }
        Map<String, Integer> counts = new HashMap<>();
        for (String w : words) {
            counts.merge(w.substring(0, 1), 1, Integer::sum);
        }
        counts.compute("b", (k, v) -> v == null ? 1 : v * 10);
        List<String> none = groups.get("z");
        System.out.println(groups + " " + counts + " " + none + " " + g.get(0).get(0));`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('[1]\n[2]\n[]\n{a=[apple, avocado], b=[banana]} {a=2, b=10} null 1\n');
  const add = at(r, 9);
  expect(r.steps[add].kind).toBe('assign');
  expect(r.steps[add].frames[0].vars.g).toBe('[[1], [], []]');
  expect(e[add].what).toMatch(/^(1 is added to the end of g\[0\]|g\[0\] grows by one: 1 goes on the end)\.$/);
  expect(r.steps.find((s) => s.frames[0].vars.groups === '{"a": ["apple", "avocado"]}')).toBeTruthy();
});

test('rules for lists of lists: a set of lists stays on Home; the row type is checked', () => {
  expect(run('        Set<List<Integer>> s = new HashSet<>();').error?.message).toBe("Line 5: StepViz can't run sets of lists in Java yet.");
  expect(run('        List<List<Integer>> g = new ArrayList<>();\n        List<String> row = new ArrayList<>();\n        g.add(row);').error?.message).toBe(
    'Line 7: g holds List<Integer> values, so it can\'t hold a list of String values.',
  );
});
