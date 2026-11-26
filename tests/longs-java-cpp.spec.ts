// long / long long are exact 64-bit numbers that wrap like Java and g++ (Node).
import { test, expect } from '@playwright/test';
import type { Parser } from 'web-tree-sitter';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';
import { runCpp } from '../src/runner/cpp/interpreter';

let java: Parser;
let cpp: Parser;
test.beforeAll(async () => {
  const engine = 'node_modules/web-tree-sitter/web-tree-sitter.wasm';
  java = await createParser({ engine, grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' });
  cpp = await createParser({ engine, grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' });
});
const runJ = (body: string, input = '') =>
  runJava(java.parse(`import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`)!, { maxSteps: 3000, maxSeconds: 5, input });
const runC = (body: string, input = '') =>
  runCpp(cpp.parse(`#include <iostream>\n#include <string>\n#include <cmath>\nusing namespace std;\n\nint main() {\n${body}\n    return 0;\n}`)!, { maxSteps: 3000, maxSeconds: 5, input });
const out = (r: { steps: { output: string }[]; error?: { message: string } | null }) => r.steps.at(-1)?.output ?? `ERROR ${r.error?.message}`;

test('Java: long math is exact past 2^53 and wraps at 64 bits; shifts, casts, Long limits', () => {
  const r = runJ(`        long f = 1;
        for (int i = 1; i <= 21; i++) f *= i;
        long a = 9007199254740993L;
        System.out.println(f + " " + a + " " + (a % 10) + " " + (a / 3) + " " + (a > 9007199254740992L));
        System.out.println((1L << 40) + " " + (1 << 40) + " " + (-1L >>> 60) + " " + 0xFFFFFFFFFFFFFFFFL);
        System.out.println((Long.MAX_VALUE + 1) + " " + Math.abs(Long.MIN_VALUE) + " " + Math.max(a, 5L));
        System.out.println((int) 3000000000L + " " + (int) 3e10 + " " + (long) 1e19 + " " + Math.round(2.5));
        long h = 0;
        for (char c : "hello world".toCharArray()) h = h * 31 + c;
        System.out.println(h + " " + Long.parseLong("-9223372036854775808"));`);
  expect(r.status).toBe('ok');
  expect(out(r)).toBe(
    [
      '-4249290049419214848 9007199254740993 3 3002399751580331 true',
      '1099511627776 256 15 -1',
      '-9223372036854775808 -9223372036854775808 9007199254740993',
      '-1294967296 2147483647 9223372036854775807 3',
      '88006926820958916 -9223372036854775808',
      '',
    ].join('\n'),
  );
  // The frame shows the exact value too.
  expect(r.steps.find((s) => s.frames[0].vars.a && s.frames[0].vars.a !== '?')!.frames[0].vars.a).toBe('9007199254740993');
});

test('Java: Scanner.nextLong reads big numbers exactly; a number too big for an int is an InputMismatchException', () => {
  const r = runJ('        Scanner sc = new Scanner(System.in);\n        long x = sc.nextLong();\n        System.out.println(x + 1);', '9007199254740993');
  expect(out(r)).toBe('9007199254740994\n');
  const big = runJ('        Scanner sc = new Scanner(System.in);\n        int x = sc.nextInt();', '3000000000');
  expect(big.error?.type).toBe('InputMismatchException');
});

test('C++: long long is exact and wraps at 64 bits; big literals are long; printf, to_string, stoll, abs', () => {
  const r = runC(`    long long f = 1;
    for (int i = 1; i <= 21; i++) f *= i;
    long long a = 9007199254740993LL;
    long long big = 10000000000;
    cout << f << " " << a << " " << a % 10 << " " << (a > 9007199254740992LL) << " " << big << endl;
    cout << (1LL << 40) << " " << to_string(a) << " " << stoll("-9007199254740993") << " " << abs(-a) << endl;
    printf("%lld %d\\n", a, (int) a);`);
  expect(out(r)).toBe('-4249290049419214848 9007199254740993 3 1 10000000000\n1099511627776 9007199254740993 -9007199254740993 9007199254740993\n9007199254740993 1\n');
});

test('C++: cin reads a long long exactly', () => {
  const r = runC('    long long x;\n    cin >> x;\n    cout << x * 2 << endl;', '4611686018427387905');
  expect(out(r)).toBe('-9223372036854775806\n');
});

test('C++: LLONG_MAX / LLONG_MIN (and LONG_ on 64-bit Linux, like g++) are exact', () => {
  const r = runC(`    long long a = LLONG_MAX;
    long long b = LLONG_MIN;
    cout << a << " " << b << " " << (a > 2147483647) << " " << LONG_MAX << endl;`);
  expect(out(r)).toBe('9223372036854775807 -9223372036854775808 1 9223372036854775807\n');
});
