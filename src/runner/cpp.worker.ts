/// <reference lib="webworker" />
// Runs one C++ program and is then terminated (a fresh worker per run).
// tree-sitter is loaded from our own site and the program is parsed; then the
// worker is locked down (no network, eval or Function constructors) before the
// interpreter carries out the program. The program itself is never compiled or
// run as code: the interpreter reads its syntax tree.
import { createParser } from './treeSitter';
import { checkCpp, cppReadsInput, runCpp } from './cpp/interpreter';
import { lockDown } from './lockdown';
import type { TreeFromWorker, TreeToWorker } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent<TreeToWorker>) => {
  const msg = event.data;
  const parser = await createParser(msg.files);
  const tree = parser.parse(msg.source);
  if (!tree) throw new Error('C++ could not be read.');
  if (msg.type === 'analyze') {
    const problem = checkCpp(tree);
    const result = problem
      ? { ok: false as const, error: { line: problem.line, message: problem.message } }
      : { ok: true as const, readsInput: cppReadsInput(tree) };
    self.postMessage({ type: 'analyze-result', result } satisfies TreeFromWorker);
  } else {
    const result = runCpp(tree, { maxSteps: msg.maxSteps, maxSeconds: msg.maxSeconds, input: msg.input, beforeRun: lockDown });
    self.postMessage({ type: 'run-result', result } satisfies TreeFromWorker);
  }
};
