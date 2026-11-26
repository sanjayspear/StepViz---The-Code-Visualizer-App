// C++ pair, unordered_map and unordered_set (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
});
const HEAD = '#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n#include <unordered_set>\nusing namespace std;\n\nint main() {\n';
const prog = (body: string) => `${HEAD}${body}\n    return 0;\n}`;
const run = (body: string) => runCpp(parser.parse(prog(body))!, { maxSteps: 5000, maxSeconds: 5 });
const lineOf = (k: number) => 9 + k; // the k-th line of the body

test('pair: {..}, make_pair, first / second, vectors of pairs, sorting (first, then second), auto [a, b]', () => {
  const r = run(`    pair<int, string> p = {2, "b"};
    pair<int, string> q = make_pair(1, "z");
    p.first = 5;
    vector<pair<int, int>> v = {{3, 1}, {1, 2}, {3, 0}};
    v.push_back({1, 1});
    v.emplace_back(0, 9);
    sort(v.begin(), v.end());
    cout << p.first << p.second << " " << (q < p) << " " << (q == q) << " " << v[0].first << v[0].second << v[4].first << v[4].second << endl;
    for (auto [a, b] : v) {
        cout << a + b << " ";
    }
    for (auto& [a, b] : v) {
        b = 0;
    }
    pair<string, int> r;
    r = {"x", 7};
    cout << r.first << r.second << " " << v[2].second << endl;`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('5b 1 1 0931\n9 2 3 3 4 x7 0\n');
  expect(r.steps[0].frames[0].vars.p).toBe('pair {first: 2, second: "b"}');
  const loop = r.steps.find((s) => s.kind === 'loop-start' && s.line === lineOf(9))!;
  expect(loop.frames[0].vars).toMatchObject({ a: '0', b: '9' });
  const refLoop = r.steps.find((s) => s.kind === 'loop-start' && s.line === lineOf(12))!;
  expect(refLoop.frames[0].vars.b).toBe('9 (same box as v[0].second)');
});

test('pair rules stay on Home', () => {
  expect(run('    pair<int, int> p = {1, 2, 3};').error?.message).toBe('Line 10: A pair has two parts (first and second), not 3.');
  expect(run('    pair<int, int> p = {1, 2};\n    cout << p;').error?.message).toBe("Line 11: cout can't print a pair directly: print its parts, like p.first.");
});

test('unordered_map and unordered_set follow libstdc++ hash table: the order shown and walked is the one g++ gives', () => {
  const src = prog(`    unordered_map<string, int> m;
    m["apple"] = 1;
    m["banana"] = 2;
    m["cherry"] = 3;
    m["apple"]++;
    for (auto& [k, v] : m) {
        cout << k << "=" << v << " ";
    }
    unordered_set<int> s = {5, 1, 14, 27};
    s.insert(3);
    for (int x : s) cout << x << " ";
    unordered_map<int, int> c;
    for (int i = 0; i < 15; i++) c[i * 7] = i;
    for (auto& [k, v] : c) cout << k << " ";
    m.erase("banana");
    cout << m.size() << " " << m.count("apple") << endl;`);
  const r = runCpp(parser.parse(src)!, { maxSteps: 5000, maxSeconds: 5 });
  expect(r.status).toBe('ok');
  // 13 buckets at first; c grows to 29 buckets at its 14th key (each rehash reverses these keys).
  expect(r.steps.at(-1)!.output).toBe('cherry=3 banana=2 apple=2 3 27 14 1 5 98 91 0 7 14 21 28 35 42 49 56 63 70 77 84 2 1\n');
  expect(r.steps.at(-1)!.frames[0].vars.m).toBe('{"cherry": 3, "apple": 2}');
  const e = explainTrace({ language: 'cpp', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });
  expect(e[r.steps.findIndex((s) => s.line === lineOf(3))].what).toMatch(/^(m gets a new key "banana" with the value 2|"banana" is added to m with the value 2)\.$/);
});

test('vectors compare item by item, like C++ (==, !=, <, and a shorter one that matches so far is smaller)', () => {
  const r = run(`    vector<int> a = {1, 2};
    vector<int> b = {1, 2};
    vector<int> c = {1, 3};
    vector<int> d = {1};
    cout << (a == b) << (a == c) << (a != c) << (a < c) << (d < a) << (c > a) << endl;`);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('101111\n');
});

test('a stack or queue member of a class keeps working like one; text has front() and back()', () => {
  const src = `#include <iostream>
#include <stack>
#include <queue>
#include <string>
using namespace std;

class Box {
public:
    stack<int> st;
    queue<int> q;
};

int main() {
    Box b;
    b.st.push(1);
    b.st.push(2);
    b.q.push(3);
    b.q.push(4);
    string s = "abc";
    cout << b.st.top() << b.q.front() << s.front() << s.back() << endl;
    return 0;
}`;
  const r = runCpp(parser.parse(src)!, { maxSteps: 5000, maxSeconds: 5 });
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('23ac\n');
});
