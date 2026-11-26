// C++ Practice content is built on the Python content of the same question, like JavaScript and Java
// (see ../javascript/shared.ts): the same tests with camelCase names. C++ starters are a file with the
// functions to write and an int main() that tries them once.

/** A placeholder return, so the starter compiles and runs (and fails the tests). */
export function placeholder(header: string): string {
  const m = /^([\w<>:, *&]+?)\s+\w+\s*\(/.exec(header.trim());
  const type = (m?.[1] ?? 'void').trim();
  if (type === 'void') return '';
  if (['int', 'long', 'long long', 'double', 'float', 'short'].includes(type)) return 'return 0;';
  if (type === 'bool') return 'return false;';
  if (type === 'char') return "return ' ';";
  if (type === 'string') return 'return "";';
  return `${type} none;\n    return none;`;
}

/** One function: its header (without the { ), and the comment lines that say what it should do. */
export type CppFunction = [header: string, comment: string];

const COMMON = ['iostream', 'vector', 'string', 'algorithm'];

/** A starter: the #include lines, optional code before the functions (structs), the functions, and main()'s body. */
export function cppStarter(functions: CppFunction[], mainBody: string, includes: string[] = [], before = ''): string {
  const inc = [...COMMON, ...includes.filter((i) => !COMMON.includes(i))].map((i) => `#include <${i}>`).join('\n');
  const fns = functions
    .map(([h, c]) => {
      const lines = c
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => `    // ${l}`);
      const ret = placeholder(h);
      if (ret) lines.push(`    ${ret}`);
      return `${h} {\n${lines.join('\n')}\n}`;
    })
    .join('\n\n');
  const main = mainBody
    .split('\n')
    .map((l) => `    ${l}`)
    .join('\n');
  return `${inc}\nusing namespace std;\n\n${before ? `${before.trim()}\n\n` : ''}${fns}\n\nint main() {\n${main}\n    return 0;\n}\n`;
}

/** The usual case: one function and one line in main(). */
export const one = (header: string, comment: string, mainBody: string, includes: string[] = []) => cppStarter([[header, comment]], mainBody, includes);

/** Print a vector<int> in main(): a helper the starters add before main() when they need it. */
export const PRINT_INTS = `void printVector(const vector<int>& v) {
    cout << "[";
    for (int i = 0; i < v.size(); i++) {
        if (i > 0) cout << ", ";
        cout << v[i];
    }
    cout << "]" << endl;
}`;

/** C++ values can't be "missing" like null: a test's null answer becomes `instead` (say "" or -1). */
export function nullTo(tests: import('../types').PracticeTest[], instead: import('../types').Value): import('../types').PracticeTest[] {
  return tests.map((t) => (t.expected === null && !t.mutated ? { ...t, expected: instead } : t));
}
