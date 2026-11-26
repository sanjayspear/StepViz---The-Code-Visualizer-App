// Everyday programs whose expected output comes from the real compilers and runtimes (javac/java 21, clang, node),
// see scripts/golden-refresh.sh. StepViz must print exactly the same.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';
import { runCpp } from '../src/runner/cpp/interpreter';
import { runJs } from '../src/runner/js/runtime';

const DIR = 'tests/golden';
const engine = 'node_modules/web-tree-sitter/web-tree-sitter.wasm';
const GRAMMAR = { java: 'tree-sitter-java/tree-sitter-java', cpp: 'tree-sitter-cpp/tree-sitter-cpp', c: 'tree-sitter-c/tree-sitter-c' } as const;

for (const lang of ['java', 'cpp', 'c'] as const) {
  for (const file of readdirSync(`${DIR}/${lang}`).filter((f) => f.endsWith(`.${lang}`))) {
    const name = file.slice(0, -(lang.length + 1));
    test(`${lang}/${name} prints exactly what the real compiler's program prints`, async () => {
      const parser = await createParser({ engine, grammar: `node_modules/${GRAMMAR[lang]}.wasm` });
      const src = readFileSync(`${DIR}/${lang}/${file}`, 'utf8');
      const input = existsSync(`${DIR}/${lang}/${name}.in`) ? readFileSync(`${DIR}/${lang}/${name}.in`, 'utf8') : '';
      const opts = { maxSteps: 20000, maxSeconds: 10, input };
      const r = lang === 'java' ? runJava(parser.parse(src)!, opts) : runCpp(parser.parse(src)!, { ...opts, dialect: lang });
      expect(r.error, JSON.stringify(r.error)).toBeNull();
      expect(r.steps.at(-1)?.output ?? '').toBe(readFileSync(`${DIR}/${lang}/${name}.out`, 'utf8'));
    });
  }
}

// JavaScript runs on the real engine, but StepViz rewrites it to trace it; the output must still be node's.
for (const file of readdirSync(`${DIR}/js`).filter((f) => f.endsWith('.js'))) {
  const name = file.slice(0, -3);
  test(`js/${name} prints exactly what node prints`, () => {
    const r = runJs(readFileSync(`${DIR}/js/${file}`, 'utf8'), { maxSteps: 20000, maxSeconds: 10 });
    expect(r.error, JSON.stringify(r.error)).toBeNull();
    expect(r.steps.at(-1)?.output ?? '').toBe(readFileSync(`${DIR}/js/${name}.out`, 'utf8'));
  });
}
