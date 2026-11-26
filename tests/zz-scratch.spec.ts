/* eslint-disable */
// @ts-nocheck
// Draft C content for the questions of a topic that fit C, from the C++ content and the first test.
// Usage: node gen_c.mjs <topic> > draft.json   (run through tsx so the TS content can be imported)
import { test } from '@playwright/test';
import { CPP_TOPICS, PYTHON_TOPICS } from '../src/practice/content';
import { readFileSync, writeFileSync } from 'node:fs';
const SP = '/private/tmp/claude-501/-Users-sanjayym-Documents-StepViz---The-Code-Visualizer-App/a212e76c-aa64-4e1d-b071-5f0d0f7a2baf/scratchpad';
test('gen c', () => {
for (const topic of (process.env.TOPICS ?? '').split(',')) {
const fit = readFileSync(`${SP}/cfit.txt`, 'utf8').split('\n').filter((l) => l.startsWith('FIT') && l.includes(` ${topic}:`)).map((l) => Number(l.split(/\s+/)[1].slice(1)));
const cpp = new Map(CPP_TOPICS[topic].map((c) => [c.id, c]));
const py = new Map(PYTHON_TOPICS[topic].map((c) => [c.id, c]));
const CPPWORDS = /\b(vector|string|map|set|unordered_map|unordered_set|push_back|pop_back|substr|to_string|stoi|cout|stack|queue|priority_queue|sort\(|reverse\(|begin\(\)|size\(\)|\.find|\.count|nullptr|auto|lambda|pair|deque|std::)/;
const out: Record<number, unknown> = {};
for (const id of fit) {
  const c = cpp.get(id)!;
  const calls = [...new Set(c.tests.map((t) => t.call))];
  const fns: { name: string; ret: string; params: { type: string; name: string }[]; header: string; comment: string }[] = [];
  for (const name of calls) {
    const m = new RegExp(`^([\\w<>:, *&]+?) ${name}\\(([^)]*)\\)`, 'm').exec(c.starter)!;
    const ret = m[1].trim();
    const params = m[2].split(',').map((p) => p.trim()).filter(Boolean).map((p) => {
      const mm = /^(?:const\s+)?(.+?)\s*&?\s*(\w+)$/.exec(p)!;
      return { type: mm[1].replace(/\s*&$/, '').trim(), name: mm[2] };
    });
    const arrays = params.filter((p) => /^vector<(int|char|double)>$/.test(p.type));
    const cParams: string[] = [];
    for (const p of params) {
      const v = /^vector<(int|char|double)>$/.exec(p.type);
      if (v) {
        cParams.push(`${v[1]} ${p.name}[]`);
        cParams.push(`int ${arrays.length === 1 ? 'n' : `${p.name}Size`}`);
      } else if (p.type === 'string') cParams.push(`char ${p.name}[]`);
      else cParams.push(`${p.type} ${p.name}`);
    }
    const comment = (new RegExp(`${name}\\([^)]*\\) \\{\\n((?:    //.*\\n)+)`).exec(c.starter)?.[1] ?? '').split('\n').map((l) => l.replace(/^\s*\/\/ ?/, '')).filter(Boolean).join('\n');
    fns.push({ name, ret, params, header: `${ret} ${name}(${cParams.join(', ')})`, comment });
  }
  // main(): the first test of each function, written as C.
  const lines: string[] = [];
  let k = 0;
  for (const f of fns) {
    const t = c.tests.find((x) => x.call === f.name)!;
    const targs = t.args as any[];
    const args: string[] = [];
    f.params.forEach((p, i) => {
      const a = targs[i];
      const v = /^vector<(int|char|double)>$/.exec(p.type);
      if (v) {
        const nm = fns.length > 1 ? `${p.name}${++k}` : p.name;
        const items = (a as unknown[]).map((x) => (v[1] === 'char' ? `'${x}'` : String(x)));
        lines.push(items.length ? `${v[1]} ${nm}[] = {${items.join(', ')}};` : `${v[1]} ${nm}[1];`);
        args.push(nm, String(a.length));
      } else if (p.type === 'string') args.push(JSON.stringify(a));
      else if (p.type === 'char') args.push(`'${a}'`);
      else args.push(String(a));
    });
    const call = `${f.name}(${args.join(', ')})`;
    if (f.ret === 'void') {
      lines.push(`${call};`);
      if (t.mutated) {
        const p = f.params[t.mutated.arg];
        const nm = fns.length > 1 ? `${p.name}${k}` : p.name;
        lines.push(/char/.test(p.type) ? `for (int i = 0; i < ${targs[t.mutated.arg].length}; i++) printf("%c", ${nm}[i]);\nprintf("\\n");` : `printArray(${nm}, ${targs[t.mutated.arg].length});`);
      }
    } else if (f.ret === 'bool') lines.push(`printf("%s\\n", ${call} ? "true" : "false");`);
    else if (f.ret === 'char') lines.push(`printf("%c\\n", ${call});`);
    else if (f.ret === 'long long') lines.push(`printf("%lld\\n", ${call});`);
    else if (f.ret === 'double') lines.push(`printf("%g\\n", ${call});`);
    else lines.push(`printf("%d\\n", ${call});`);
  }
  const example = c.example.replace(/\bvector\b/g, 'array');
  out[id] = {
    fns: fns.map((f) => [f.header, f.comment.replace(/\bvectors?\b/g, (w) => (w === 'vector' ? 'array' : 'arrays')).replace(/\.size\(\)/g, ' length')]),
    main: lines.join('\n'),
    example,
    hint: c.hint,
    hintFlag: CPPWORDS.test(c.hint) ? 'CPP' : '',
    forbid: c.forbid ?? null,
    pyForbid: !!py.get(id)!.forbid,
    printArray: lines.some((l) => l.startsWith('printArray')),
    usesText: fns.some((f) => f.params.some((p) => p.type === 'string')),
  };
}
writeFileSync(`${SP}/cdraft-${topic}.json`, JSON.stringify(out, null, 1));
}
});
