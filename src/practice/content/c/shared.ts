// C Practice content is built on the Python content of the same question, like the other languages
// (see ../javascript/shared.ts), for the questions that fit C: numbers, arrays and text in, a number,
// true / false or a character out (or an array changed in place, or printing). The others need lists
// or text given back, maps or classes, which C does not have built in; they show C as coming soon.

/** A placeholder return, so the starter compiles and runs (and fails the tests). */
export function placeholder(header: string): string {
  const m = /^([\w ]+?)\s+\w+\s*\(/.exec(header.trim());
  const type = (m?.[1] ?? 'void').trim();
  if (type === 'void') return '';
  if (type === 'bool') return 'return false;';
  if (type === 'char') return "return ' ';";
  return 'return 0;';
}

/** One function: its header (without the { ), and the comment lines that say what it should do. */
export type CFunction = [header: string, comment: string];

const COMMON = ['stdio.h', 'stdbool.h'];

/** A starter: the #include lines, optional code before the functions (helpers), the functions, and main()'s body. */
export function cStarter(functions: CFunction[], mainBody: string, includes: string[] = [], before = ''): string {
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
  return `${inc}\n\n${before ? `${before.trim()}\n\n` : ''}${fns}\n\nint main() {\n${main}\n    return 0;\n}\n`;
}

/** The usual case: one function and the lines of main() that try it. */
export const one = (header: string, comment: string, mainBody: string, includes: string[] = []) => cStarter([[header, comment]], mainBody, includes);

/** Print an int array in main(): a helper the starters add before main() when they need it. */
export const PRINT_INTS = `void printArray(int a[], int n) {
    printf("[");
    for (int i = 0; i < n; i++) {
        if (i > 0) printf(", ");
        printf("%d", a[i]);
    }
    printf("]\\n");
}`;
