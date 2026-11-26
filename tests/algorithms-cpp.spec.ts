// C++ algorithms, lambdas, stack, queue and priority_queue (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp, stdSort, type CVal } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
});
const HEAD = '#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <numeric>\n#include <stack>\n#include <queue>\n#include <functional>\nusing namespace std;\n\nint main() {\n';
const prog = (body: string) => `${HEAD}${body}\n    return 0;\n}`;
const run = (body: string) => runCpp(parser.parse(prog(body))!, { maxSteps: 5000, maxSeconds: 5 });
const lineOf = (k: number) => 11 + k; // the k-th line of the body

test('std::sort is libstdc++\'s: text by character codes, a lambda called in g++\'s order, greater<int>(), arrays', () => {
  const r = run(`    vector<string> w = {"b", "a", "B", "A"};
    sort(w.begin(), w.end());
    vector<int> v = {3, 1, 2};
    sort(v.begin(), v.end(), [](int a, int b) {
        return a > b;
    });
    cout << w[0] << w[1] << w[2] << w[3] << " " << v[0] << v[1] << v[2] << endl;
    sort(v.begin(), v.end(), greater<int>());
    int a[5] = {5, 4, 3, 2, 1};
    sort(a, a + 5);
    sort(v.begin(), v.begin() + 2);
    cout << a[0] << a[4] << " " << v[0] << v[1] << v[2] << endl;`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('ABab 321\n15 231\n');
  // insertion sort for 3 items: comp(1,3), then comp(1,3) again, comp(2,3), comp(2,1), comp(2,3)
  const calls = r.steps.filter((s) => s.kind === 'call').map((s) => s.frames.at(-1)!.name);
  expect(calls).toEqual(['lambda(1, 3)', 'lambda(1, 3)', 'lambda(2, 3)', 'lambda(2, 1)', 'lambda(2, 3)']);
  const ret = r.steps.find((s) => s.kind === 'return' && s.frames.at(-1)!.name === 'lambda(2, 1)')!;
  expect(ret.line).toBe(lineOf(5));
});

test('stdSort sorts any input correctly, also through the heap-sort fallback', () => {
  const less = (x: CVal, y: CVal) => (x.v as number) < (y.v as number);
  let seed = 7;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) % 50;
  for (const n of [0, 1, 2, 5, 16, 17, 33, 100, 257]) {
    for (const depth of [undefined, 0, 1]) {
      const items: CVal[] = Array.from({ length: n }, () => ({ t: 'int', v: rand() }));
      const want = items.map((x) => x.v as number).sort((p, q) => p - q);
      stdSort(items, less, depth);
      expect(items.map((x) => x.v)).toEqual(want);
    }
  }
});

test('reverse, accumulate, max_element / min_element (item and position), count, find', () => {
  const r = run(`    vector<int> v = {3, 7, 2, 7};
    reverse(v.begin(), v.end());
    string s = "abc";
    reverse(s.begin(), s.end());
    long long big = accumulate(v.begin(), v.end(), 0LL);
    cout << v[0] << " " << s << " " << big << " " << accumulate(v.begin(), v.end(), 0.5) << endl;
    cout << *max_element(v.begin(), v.end()) << " " << max_element(v.begin(), v.end()) - v.begin() << " " << min_element(v.begin(), v.end()) - v.begin() << endl;
    cout << count(v.begin(), v.end(), 7) << " " << (find(v.begin(), v.end(), 2) - v.begin()) << " " << (find(v.begin(), v.end(), 9) == v.end()) << endl;`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('7 cba 19 19.5\n7 0 1\n2 1 1\n');
  expect(r.steps.find((s) => s.line === lineOf(2))!.frames[0].vars.v).toBe('[7, 2, 7, 3]');
});

test('stack, queue and priority_queue (libstdc++\'s heap order in the frame); empty ones stop with a sentence', () => {
  const src = prog(`    stack<int> st;
    st.push(1);
    st.push(2);
    st.pop();
    queue<string> q;
    q.push("a");
    q.push("b");
    q.pop();
    priority_queue<int> pq;
    pq.push(3);
    pq.push(1);
    pq.push(4);
    pq.push(1);
    pq.push(5);
    pq.pop();
    priority_queue<int, vector<int>, greater<int>> mn;
    mn.push(3);
    mn.push(1);
    mn.push(2);
    cout << st.top() << " " << q.front() << q.back() << " " << pq.top() << " " << mn.top() << " " << pq.size() << endl;
    st.pop();
    st.top();`);
  const r = runCpp(parser.parse(src)!, { maxSteps: 5000, maxSeconds: 5 });
  expect(r.steps.find((s) => s.kind === 'print')!.output).toBe('1 bb 4 1 4\n');
  const vars = r.steps.at(-1)!.frames[0].vars;
  expect(vars).toMatchObject({ st: '[]', q: '["b"]', pq: '[4, 1, 3, 1]', mn: '[1, 3, 2]' });
  expect(r.error).toMatchObject({ type: 'EmptyStack', line: lineOf(22) });
  const e = explainTrace({ language: 'cpp', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  expect(e.at(-1)!.what).toBe('The stack is empty, so there is nothing to take off its top.');
  const popped = r.steps.findIndex((s) => s.line === lineOf(8));
  expect(e[popped].what).toMatch(/"a".*q|q.*"a"/);
});

test('rules for these containers stay on Home', () => {
  const msg = (body: string) => run(body).error?.message;
  expect(msg('    queue<int> q;\n    q.push(1);\n    int x = q.top();')).toBe('Line 14: A queue has no top(): use front() for the next item and back() for the last one.');
  expect(msg('    stack<int> s;\n    s.push(1);\n    int x = s[0];')).toBe("Line 14: A stack can't be read by position: use top().");
  expect(msg('    stack<int> s;\n    s.push_back(1);')).toBe('Line 13: A stack has no push_back(): it only has push, pop, top, size and empty.');
  expect(msg('    vector<int> v = {1};\n    sort(v.begin(), v.end(), 5);')).toBe('Line 13: sort needs a lambda here, like [](int a, int b) { return a > b; }.');
});
