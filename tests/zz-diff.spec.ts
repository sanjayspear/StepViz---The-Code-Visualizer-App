import { test } from '@playwright/test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createParser } from '../src/runner/treeSitter';
import { runJava } from '../src/runner/java/interpreter';
import { runCpp } from '../src/runner/cpp/interpreter';
const D = '/private/tmp/claude-501/-Users-sanjayym-Documents-StepViz---The-Code-Visualizer-App/a212e76c-aa64-4e1d-b071-5f0d0f7a2baf/scratchpad/diff2';
test('diff', async () => {
  const engine = 'node_modules/web-tree-sitter/web-tree-sitter.wasm';
  const parsers = {
    java: await createParser({ engine, grammar: 'node_modules/tree-sitter-java/tree-sitter-java.wasm' }),
    cpp: await createParser({ engine, grammar: 'node_modules/tree-sitter-cpp/tree-sitter-cpp.wasm' }),
    c: await createParser({ engine, grammar: 'node_modules/tree-sitter-c/tree-sitter-c.wasm' }),
  };
  let bad = 0, total = 0;
  for (const lang of ['java', 'cpp', 'c'] as const) {
    for (const f of readdirSync(`${D}/${lang}`).filter((x) => /\.(java|cpp|c)$/.test(x))) {
      const name = f.replace(/\.\w+$/, '');
      const src = readFileSync(`${D}/${lang}/${f}`, 'utf8');
      const want = readFileSync(`${D}/${lang}/${name}.out`, 'utf8');
      const input = existsSync(`${D}/${lang}/${name}.in`) ? readFileSync(`${D}/${lang}/${name}.in`, 'utf8') : '';
      const opts = { maxSteps: 20000, maxSeconds: 10, input };
      let r: any;
      try {
        r = (lang === 'java' ? runJava(parsers.java.parse(src)!, opts) : runCpp(parsers[lang].parse(src)!, { ...opts, dialect: lang })) as any;
      } catch (e) {
        r = { status: 'INTERNAL', error: String(e), steps: [] };
      }
      const got = r.steps.at(-1)?.output ?? '';
      total++;
      if (r.status !== 'ok' || got !== want) {
        bad++;
        console.log(`--- ${lang}/${name}: ${r.status} ${r.error ? JSON.stringify(r.error) : ''}`);
        const w = want.split('\n'), g = got.split('\n');
        for (let i = 0; i < Math.max(w.length, g.length); i++) if (w[i] !== g[i]) console.log(`  line ${i + 1}\n    real: ${JSON.stringify(w[i])}\n    ours: ${JSON.stringify(g[i])}`);
      }
    }
  }
  console.log(`${total - bad}/${total} match`);
});
