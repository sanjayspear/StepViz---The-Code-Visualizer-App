// C++ (and C) pointers and std::map (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { explainTrace } from '../src/trace/explainer';

let cpp: Parser;
let c: Parser;
test.beforeAll(async () => {
  const engine = 'node_modules/web-tree-sitter/web-tree-sitter.wasm';
  cpp = await createParser({ engine, grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
  c = await createParser({ engine, grammar: 'node_modules/tree-sitter-c/tree-sitter-c.wasm' });
});

const opts = { maxSteps: 2000, maxSeconds: 5 };
const run = (src: string) => runCpp(cpp.parse(src)!, opts);
const explain = (src: string) => {
  const r = run(src);
  return { r, e: explainTrace({ language: 'cpp', source: src, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) }) };
};
const HEAD = '#include <iostream>\n#include <map>\n#include <string>\nusing namespace std;\n\n';
/** main's body starts on line 7 (or after `more`). */
const prog = (body: string, more = '') => `${HEAD}${more}int main() {\n${body}\n    return 0;\n}`;

test('pointers: &x, *p, a pointer passed to a function, -> on a struct, nullptr', () => {
  const src = prog(
    `    int x = 1;
    int y = 5;
    int* p = &x;
    addOne(p);
    p = &y;
    (*p)++;
    Point a = {1, 2};
    Point* pa = &a;
    pa->x = 7;
    int* none = nullptr;
    cout << x << " " << y << " " << a.x << " " << (none == nullptr) << " " << (p == &y) << endl;`,
    'struct Point {\n    int x;\n    int y;\n};\n\nvoid addOne(int* p) {\n    *p = *p + 1;\n}\n\n',
  );
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('2 6 7 1 1\n');
  const at = (line: number, kind = 'assign') => r.steps.findIndex((s) => s.line === line && s.kind === kind);
  expect(r.steps[at(18)].frames[0].vars.p).toBe('points to x');
  expect(e[at(18)].what).toMatch(/^(We make a pointer called p\. It points to x|A new pointer p now points to x)\.$/);
  const call = r.steps[at(19, 'call')];
  expect(call.frames[1]).toEqual({ name: 'addOne(&x)', vars: { p: 'points to x in main()' }, status: 'running' });
  const ret = r.steps.findIndex((s) => s.kind === 'return' && s.frames.length === 2);
  expect(r.steps[ret].frames[0].vars.x).toBe('2');
  expect(e[at(20)].what).toMatch(/^(p now points to y instead of x|The pointer p moves from x to y)\.$/);
  expect(e[at(21)].what).toMatch(/^(The box p points to, y, changes from 5 to 6|Through the pointer p, y changes from 5 to 6)\.$/);
  expect(e[at(24)].what).toMatch(/a,? changes from Point \{x: 1, y: 2\} to Point \{x: 7, y: 2\}/);
  expect(r.steps[at(25)].frames[0].vars.none).toBe('nullptr');
});

test('pointer crashes: nullptr and a pointer to a box that is gone', () => {
  const { r, e } = explain(prog('    int a = 1;\n    int* p = nullptr;\n    cout << *p;'));
  expect(r.error).toMatchObject({ type: 'NullPointer', line: 9 });
  expect(e.at(-1)!.what).toBe('This pointer is nullptr, so it points to nothing.');
  const gone = explain(prog('    f();\n    int z = 1;\n    cout << *keep << endl;', 'int* keep;\n\nvoid f() {\n    int local = 3;\n    keep = &local;\n}\n\n'));
  expect(gone.r.error).toMatchObject({ type: 'Dangling', line: 16 });
  expect(gone.e.at(-1)!.what).toBe('This pointer points to a box that no longer exists.');
  expect(gone.r.steps.at(-1)!.frames[0].vars.keep).toBe('points to local in f() (gone)');
});

test('what stays unsupported or is rejected like the compiler', () => {
  const msg = (body: string) => run(prog(body)).error?.message;
  expect(msg('    int a[3] = {1, 2, 3};\n    int* p = &a[0];\n    p++;')).toBe("Line 9: StepViz can't run pointer arithmetic in C++ yet.");
  expect(msg('    int x = 1;\n    int* p = &x;\n    int** pp = &p;')).toBe("Line 9: StepViz can't run pointers to pointers in C++ yet.");
  expect(msg('    int x = 1;\n    double* p = &x;')).toBe("Line 8: p is a double* box, so it can't hold points to x.");
  expect(msg('    int* p = new int(5);')).toBe("Line 7: StepViz can't run new in C++ yet.");
  // A pointer printed with cout shows an address (made up, like real ones that change every run).
  expect(run(prog('    int x = 1;\n    int* p = &x;\n    cout << p << endl;')).steps.at(-1)!.output).toMatch(/^0x7ffc[0-9a-f]+\n$/);
  // C has pointers too: swap through pointers.
  const cSrc = '#include <stdio.h>\n\nvoid swap(int* a, int* b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n\nint main() {\n    int x = 1;\n    int y = 2;\n    swap(&x, &y);\n    printf("%d %d\\n", x, y);\n    return 0;\n}';
  expect(runCpp(c.parse(cSrc)!, { ...opts, dialect: 'c' }).steps.at(-1)!.output).toBe('2 1\n');
});

test('map: m[k] adds a missing key, key order, erase, find, count, at, loops with [k, v] and kv.first', () => {
  const src = prog(`    map<string, int> votes;
    votes["Sam"] = 1;
    votes["Ali"]++;
    votes["Sam"] += 2;
    for (auto& [name, n] : votes) {
        n = n * 10;
    }
    votes.erase("Ali");
    if (votes.find("Bo") == votes.end()) {
        cout << "no Bo" << endl;
    }
    for (const auto& kv : votes) {
        cout << kv.first << " " << kv.second << " " << votes.count("Sam") << endl;
    }`);
  const { r, e } = explain(src);
  expect(r.status).toBe('ok');
  expect(r.steps.at(-1)!.output).toBe('no Bo\nSam 30 1\n');
  expect(r.steps[2].frames[0].vars.votes).toBe('{"Ali": 1, "Sam": 1}');
  expect(e[1].what).toMatch(/^(votes gets a new key "Sam" with the value 1|"Sam" is added to votes with the value 1)\.$/);
  expect(e[3].what).toBe('votes["Sam"] changes from 1 to 3.');
  const loop = r.steps.find((s) => s.kind === 'loop-start')!;
  expect(loop.frames[0].vars).toMatchObject({ name: '"Ali"', n: '1 (same box as votes["Ali"])' });
  expect(e[r.steps.findIndex((s) => s.line === 14)].what).toBe('"Ali" is taken out of votes.');
  const atCrash = run(prog('    map<string, int> m;\n    try {\n        int v = m.at("x");\n    } catch (const out_of_range& ex) {\n        cout << ex.what() << endl;\n    }'));
  expect(atCrash.steps.at(-1)!.output).toBe('map::at\n');
  expect(run(prog('    unordered_map<string, int> m;')).error?.message).toBe("Line 7: StepViz can't run unordered_map (map works) in C++ yet.");
});
