// C++ operator overloading (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp } from '../src/runner/cpp/interpreter';

let parser: Parser;
test.beforeAll(async () => {
  parser = await createParser({ engine: 'node_modules/web-tree-sitter/web-tree-sitter.wasm', grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
});
const run = (src: string) => runCpp(parser.parse(src)!, { maxSteps: 3000, maxSeconds: 5 });
const HEAD = '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\n';
const POINT = `struct Point {
    int x;
    int y;
    bool operator==(const Point& o) const {
        return x == o.x && y == o.y;
    }
    Point operator+(const Point& o) const {
        return Point{x + o.x, y + o.y};
    }
};

bool operator<(const Point& a, const Point& b) {
    return a.x < b.x;
}

ostream& operator<<(ostream& os, const Point& p) {
    os << "(" << p.x << ", " << p.y << ")";
    return os;
}

`;
const prog = (body: string) => `${HEAD}${POINT}int main() {\n${body}\n    return 0;\n}`;

test('==, != (from ==), + and cout << with the program\'s operators; each runs in its own frame', () => {
  const r = run(prog('    Point a = {1, 2};\n    Point b = {3, 4};\n    Point c = a + b;\n    cout << c << " " << (a == b) << " " << (a != b) << endl;'));
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('(4, 6) 0 1\n');
  const names = r.steps.filter((s) => s.kind === 'call').map((s) => s.frames.at(-1)!.name);
  expect(names).toEqual(['a.operator+(b)', 'operator<<(cout, c)', 'a.operator==(b)', 'a.operator==(b)']);
  const out = r.steps.find((s) => s.kind === 'print' && s.frames.length === 2)!;
  expect(out.frames[1].vars).toEqual({ os: 'cout', p: 'Point {x: 4, y: 6}' });
});

test('sort uses the program\'s operator< in libstdc++\'s order; += falls back to +', () => {
  const r = run(prog('    vector<Point> pts = {{3, 0}, {1, 0}, {2, 0}};\n    sort(pts.begin(), pts.end());\n    Point a = {1, 1};\n    a += Point{2, 2};\n    cout << pts[0] << pts[1] << pts[2] << " " << a << endl;'));
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('(1, 0)(2, 0)(3, 0) (3, 3)\n');
  // Insertion sort: {1} < {3}? then {2} < {1}? no, {2} < {3}? yes, {2} < {1}? no.
  const compares = r.steps.filter((s) => s.kind === 'call' && s.frames.at(-1)!.name.startsWith('operator<(')).map((s) => s.frames.at(-1)!.vars);
  expect(compares.map((v) => `${v.a} < ${v.b}`)).toEqual([
    'Point {x: 1, y: 0} < Point {x: 3, y: 0}',
    'Point {x: 2, y: 0} < Point {x: 1, y: 0}',
    'Point {x: 2, y: 0} < Point {x: 3, y: 0}',
    'Point {x: 2, y: 0} < Point {x: 1, y: 0}',
  ]);
});

test('without an operator, C++ still refuses; unsupported operators stay on Home', () => {
  const plain = `${HEAD}struct Q {\n    int x;\n};\n\nint main() {\n    Q a = {1};\n    Q b = {2};\n    bool same = a == b;\n    return 0;\n}`;
  expect(run(plain).error?.message).toBe("Line 13: C++ can't compare two Q values with ==: compare their parts, like a.x == b.x.");
  const index = `${HEAD}struct Q {\n    int x;\n    int operator[](int i) { return x; }\n};\n\nint main() {\n    return 0;\n}`;
  expect(run(index).error?.message).toBe("Line 8: StepViz can't run the operator operator[] in C++ yet.");
});
