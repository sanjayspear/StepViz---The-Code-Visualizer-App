// console.log formatting matches Node's own (util.inspect / util.format), checked against Node itself.
import { test, expect } from '@playwright/test';
import { inspect as nodeInspect, format as nodeFormat } from 'node:util';
import { inspect, formatLog } from '../src/runner/js/inspect';

class Dog {
  name = 'Rex';
  age = 3;
}
class Empty {}

const VALUES: unknown[] = [
  1, -0, 0.1 + 0.2, 1e21, NaN, -Infinity, 10n, 'text', "it's", 'say "hi"', `both ' and "`, 'tab\there\nline', true, null, undefined,
  [], {}, [1, 2, 3], ['a', 'b'], [1, 'two', null, undefined, true, { k: 1 }], { a: 1, b: [1, 2], c: { d: 'x' } },
  { a: { b: { c: { d: 1 } } } }, [[1, [2, [3, [4]]]]], Array.from({ length: 30 }, (_, i) => i * 7), Array.from({ length: 7 }, (_, i) => i),
  ['apple', 'banana', 'cherry', 'dates', 'elderberry', 'fig', 'grape', 'honeydew'], Array.from({ length: 120 }, (_, i) => i),
  Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)), [1.5, -2, 300, 4000, 5, 6, 7, 8, 9, 10],
  { name: 'Alexander the Great', city: 'Pella', born: -356, titles: ['King', 'Pharaoh', 'Hegemon'], x: 1 },
  { 'a-b': 1, '1': 2, valid_key: 3, $d: 4 }, new Map<string, unknown>([['x', 1], ['y', { z: [1, 2] }]]), new Set([1, 'a', [2]]), new Map(), new Set(),
  new Dog(), new Empty(), [new Dog(), new Dog()], function named() {}, () => 1, class A {}, [undefined, null],
  // eslint-disable-next-line no-sparse-arrays
  [1, , 3], [, , 1], { f() {}, g: () => 2 }, new Date(0), /ab+c/gi,
  Array.from({ length: 10 }, (_, i) => ({ id: i })), Array.from({ length: 4 }, (_, i) => 'x'.repeat(i * 9)),
  { list: Array.from({ length: 12 }, (_, i) => i * 100), nested: { deep: { deeper: { deepest: 1 } } } },
  [[1, 2, 3], [4, 5, 6], [7, 8, 9]], Array.from({ length: 5 }, () => [0, 0, 0, 0, 0]), Object.create(null),
];

test('inspect(value) is the same as Node\'s util.inspect for everyday values', () => {
  // (Errors are left out on purpose: Node prints the stack trace with file paths; StepViz prints "Error: boom".)
  const a: unknown = { name: 'loop' };
  (a as { self: unknown }).self = a;
  for (const v of [...VALUES, a]) expect(inspect(v), nodeInspect(v)).toBe(nodeInspect(v));
});

test('console.log arguments and %s %d %i %f %j %o %%: the same as Node\'s util.format', () => {
  const cases: unknown[][] = [
    ['plain', 1, 'two', [3]], ['%s is %d years', 'Ann', 42], ['%i and %f', 3.9, '2.5x'], ['100%% sure %s', 'yes'], ['%j', { a: [1] }],
    ['%O', { b: 2 }], ['%s', { a: 1 }], ['%d', '12'], ['no args %s'], ['%s %s', 'only one'], [{ a: 1 }, 'x'], [-0], ['%s', -0], ['a', 'b'],
  ];
  for (const c of cases) expect(formatLog(c), JSON.stringify(c)).toBe(nodeFormat(...(c as [unknown, ...unknown[]])));
});
