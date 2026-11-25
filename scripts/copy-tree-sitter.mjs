// Copies the tree-sitter engine and grammars into public/tree-sitter so they are
// served from our own site (no CDN). Runs before `dev` and `build`.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'public', 'tree-sitter');
const FILES = [
  ['web-tree-sitter', 'web-tree-sitter.wasm'],
  ['tree-sitter-java', 'tree-sitter-java.wasm'],
];
mkdirSync(dest, { recursive: true });
for (const [pkg, file] of FILES) {
  const src = join(root, 'node_modules', pkg, file);
  if (!existsSync(src)) throw new Error(`tree-sitter file missing: ${pkg}/${file}`);
  cpSync(src, join(dest, file));
}
console.log(`Copied tree-sitter (${FILES.length} files) to public/tree-sitter`);
