// Classes in Python and JavaScript: objects shown with their fields, constructor and method frames (Node).
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPyodide } from 'pyodide';
import type { RawRunResult } from '../src/runner/protocol';
import { runJs } from '../src/runner/js/runtime';
import { explainTrace } from '../src/trace/explainer';

let runPy: (source: string, inputs?: string) => string;
test.beforeAll(async () => {
  const py = await loadPyodide();
  py.runPython(readFileSync(join(import.meta.dirname, '../src/runner/tracer.py'), 'utf8'));
  py.runPython('lock_down()');
  runPy = py.globals.get('run');
});
const python = (src: string): RawRunResult => JSON.parse(runPy(src, '[]'));
const explain = (language: 'python' | 'javascript', source: string, r: RawRunResult) =>
  explainTrace({ language, source, steps: r.steps.map((s) => ({ ...s, explain: { what: '', life: '' } })) });

const PY = 'class Dog:\n    def __init__(self, name):\n        self.name = name\n        self.age = 0\n\n    def birthday(self):\n        self.age += 1\n        return self.age\n\nrex = Dog("Rex")\nn = rex.birthday()\nprint(rex.age)';

test('Python: objects show their fields; Dog.__init__ and rex.birthday() frames; no frame for the class body', () => {
  const r = python(PY);
  const e = explain('python', PY, r);
  expect(r.status).toBe('ok');
  expect(r.steps.map((s) => s.frames.at(-1)!.name)).not.toContain('Dog()');
  expect(r.steps[0]).toMatchObject({ line: 1, kind: 'define' });
  expect(r.steps[1].frames[1]).toEqual({ name: "Dog.__init__('Rex')", vars: { self: 'Dog {}', name: "'Rex'" }, status: 'running' });
  expect(e[1].what).toMatch(/new Dog object/);
  expect(e[2].what).toMatch(/^(self\.name is set to 'Rex'|self gets a new field name = 'Rex')\.$/);
  expect(e[3].what).toBe("The new Dog object is ready: Dog {name: 'Rex', age: 0}. This box is removed on the next step.");
  expect(e[4].what).toMatch(/^(The new Dog object is stored in rex|rex now holds the new Dog object)\.$/);
  expect(r.steps[5].frames[1].name).toBe('rex.birthday()');
  expect(e[6].what).toMatch(/^(self\.age changes from 0 to 1|In self, age was 0 and is now 1)\.$/);
});

test('Python: lists of objects, an object inside an object (Node {…}), and a class with its own __repr__ keeps it', () => {
  const r = python('class Node:\n    def __init__(self, v, nxt=None):\n        self.v = v\n        self.next = nxt\n\nclass P:\n    def __repr__(self):\n        return "P!"\n\nhead = Node(1, Node(2))\nitems = [Node(3), P()]\nx = 1');
  const vars = r.steps.at(-1)!.frames[0].vars;
  expect(vars.head).toBe('Node {v: 1, next: Node {…}}');
  expect(vars.items).toBe('[Node {v: 3, next: None}, P!]');
  // Values without objects keep their usual text.
  expect(python('a = [1, (2,), {"k": "v"}]').steps[0].frames[0].vars.a).toBe("[1, (2,), {'k': 'v'}]");
});

test('JavaScript: new Dog("Rex") with this, rex.birthday(), field changes read like Java', () => {
  const src = 'class Dog {\n  constructor(name) {\n    this.name = name;\n    this.age = 0;\n  }\n  birthday() {\n    this.age++;\n    return this.age;\n  }\n}\nconst rex = new Dog("Rex");\nconst n = rex.birthday();\nconsole.log(rex.age);';
  const r = runJs(src, { maxSteps: 2000, maxSeconds: 5 });
  const e = explain('javascript', src, r);
  expect(r.steps[1].frames[1]).toEqual({ name: 'new Dog("Rex")', vars: { this: 'Dog {}', name: '"Rex"' }, status: 'running' });
  expect(e[2].what).toMatch(/^(this\.name is set to "Rex"|this gets a new field name = "Rex")\.$/);
  expect(e[4].what).toMatch(/^(The new Dog object is stored in rex|rex now holds the new Dog object)\.$/);
  expect(r.steps[5].frames[1].name).toBe('rex.birthday()');
  expect(e[6].what).toMatch(/^(this\.age changes from 0 to 1|In this, age was 0 and is now 1)\.$/);
  expect(r.steps.at(-1)!.output).toBe('1\n');
});
