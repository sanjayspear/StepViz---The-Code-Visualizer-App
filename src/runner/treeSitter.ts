// Loads tree-sitter and a language grammar. In the browser the files come from
// our own site (public/tree-sitter, copied from node_modules at build time);
// in Node tests they are read from node_modules.
import { Language, Parser } from 'web-tree-sitter';

export interface GrammarFiles {
  /** URL or path of web-tree-sitter.wasm */
  engine: string;
  /** URL or path of the language grammar, e.g. tree-sitter-java.wasm */
  grammar: string;
}

let engineReady: Promise<void> | null = null;

export async function createParser(files: GrammarFiles): Promise<Parser> {
  engineReady ??= Parser.init({ locateFile: () => files.engine });
  await engineReady;
  const language = await Language.load(files.grammar);
  const parser = new Parser();
  parser.setLanguage(language);
  return parser;
}
