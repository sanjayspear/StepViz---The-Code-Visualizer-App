// Java Practice content is built on the Python content of the same question, like JavaScript
// (see ../javascript/shared.ts): the same tests with camelCase names. Java starters are classes:
// public class Main holds the methods to write (static), and main() tries them once.

/** A placeholder return, so the starter compiles and runs (and fails the tests). */
export function placeholder(header: string): string {
  const m = /^(?:public\s+|private\s+)?(?:static\s+)?([\w<>[\], ]+?)\s+\w+\s*\(/.exec(header.trim());
  const type = (m?.[1] ?? 'void').replace(/\s+/g, '');
  if (type === 'void') return '';
  if (['int', 'long', 'double', 'short', 'byte', 'float'].includes(type)) return 'return 0;';
  if (type === 'boolean') return 'return false;';
  if (type === 'char') return "return ' ';";
  return 'return null;';
}

const body = (comment: string, header: string, indent: string) => {
  const lines = comment
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => `${indent}    // ${l}`);
  const ret = placeholder(header);
  if (ret) lines.push(`${indent}    ${ret}`);
  return lines.join('\n');
};

/** One method: its header (without the { ), and the comment lines that say what it should do. */
export type JavaMethod = [header: string, comment: string];

/**
 * A starter: optional classes before Main (ListNode...), Main's methods, and main()'s body lines.
 * Every method is written `static` (headers here leave it out).
 */
export function javaStarter(methods: JavaMethod[], mainBody: string, before = '', helpers = ''): string {
  const own = methods.map(([h, c]) => `    static ${h} {\n${body(c, `static ${h}`, '    ')}\n    }`).join('\n\n');
  const ms = helpers ? `${helpers.replace(/\n+$/, '')}\n\n${own}` : own;
  const main = mainBody
    .split('\n')
    .map((l) => `        ${l}`)
    .join('\n');
  return `${before ? `${before.trim()}\n\n` : ''}public class Main {\n${ms}\n\n    public static void main(String[] args) {\n${main}\n    }\n}\n`;
}

/** The usual case: one method and one line in main(). */
export const one = (header: string, comment: string, mainBody: string, before = '') => javaStarter([[header, comment]], mainBody, before);
