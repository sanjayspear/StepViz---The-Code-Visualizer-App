// Copies the Pyodide runtime into public/pyodide so it is served from our own
// site (no CDN). Runs before `dev` and `build`.
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'pyodide');
const dest = join(root, 'public', 'pyodide');
const FILES = ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];

mkdirSync(dest, { recursive: true });
for (const f of FILES) {
  if (!existsSync(join(src, f))) throw new Error(`pyodide file missing: ${f}`);
  cpSync(join(src, f), join(dest, f));
}
console.log(`Copied Pyodide (${FILES.length} files) to public/pyodide`);
