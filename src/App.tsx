import { useEffect, useState } from 'react';
import { DEFAULT_EXAMPLE, exampleForSource, sourceOf, titleForSource, type CodeLanguage } from './examples';
import { Home, type Language } from './screens/Home/Home';
import { StepScreen } from './screens/Step/StepScreen';
import { Practice } from './screens/Practice/Practice';
import { parsePracticeHash, useHash } from './practice/route';
import { pythonRunner } from './runner/pythonRunner';
import { checkSource, getTrace } from './trace/getTrace';
import type { Trace } from './trace/types';

export default function App() {
  // #/practice...: the Practice section. Anything else: the visualiser (its state is kept meanwhile).
  const hash = useHash();
  const practiceRoute = parsePracticeHash(hash);
  const [code, setCode] = useState(DEFAULT_EXAMPLE.source);
  const [language, setLanguage] = useState<Language>('python');
  const [busy, setBusy] = useState(false);
  const [loadingPython, setLoadingPython] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trace, setTrace] = useState<Trace | null>(null);
  // input(): how many calls the checked code has, and the lines typed for them.
  const [inputCalls, setInputCalls] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');

  // Start loading Pyodide in the background once the page is idle, so the
  // first "Visualize my code" on pasted code is quick.
  useEffect(() => {
    const t = window.setTimeout(() => void pythonRunner.load().catch(() => {}), 1500);
    return () => window.clearTimeout(t);
  }, []);

  // Leaving the step screen with Back (the address changes) closes it.
  useEffect(() => setTrace(null), [hash]);

  /** Practice: visualise a Python answer (it is not stored anywhere). Gives back a message when it can't. */
  const visualizeAnswer = async (source: string): Promise<string | null> => {
    try {
      const check = await checkSource(source, 'python');
      if (!check.ok) return check.message;
      if (check.inputCalls > 0) return 'This answer asks for input(), so it can\'t be visualised here. Call your function with values instead.';
      const outcome = await getTrace(source, [], 'python');
      if (outcome.kind === 'error') return outcome.message;
      setTrace(outcome.trace);
      return null;
    } catch {
      return 'Python could not start. Please reload the page and try again.';
    }
  };

  const changeCode = (next: string) => {
    setCode(next);
    setError(null);
    setInputCalls(null);
    setInputText('');
  };

  const codeLanguage: CodeLanguage = language;

  // Switching between Python and JavaScript swaps an unchanged example for the
  // same example in the other language; the student's own code is left alone.
  const changeLanguage = (next: Language) => {
    setLanguage(next);
    setError(null);
    const example = exampleForSource(code);
    if (example) changeCode(sourceOf(example, next));
  };

  const visualize = async () => {
    setBusy(true);
    setError(null);
    if (codeLanguage === 'python' && !pythonRunner.isReady) setLoadingPython(true);
    try {
      const check = await checkSource(code, codeLanguage);
      setLoadingPython(false);
      if (!check.ok) {
        setError(check.message);
        return;
      }
      // The program reads input(): show the prompt box first, run on the next click.
      if (check.inputCalls > 0 && inputCalls === null) {
        setInputCalls(check.inputCalls);
        return;
      }
      // Python: one line per input() call. Java: the whole text, read like Scanner reads it.
      const inputs = check.inputCalls > 0 ? (codeLanguage === 'python' ? inputText.split('\n') : [inputText]) : [];
      const outcome = await getTrace(code, inputs, codeLanguage);
      if (outcome.kind === 'error') {
        setError(outcome.message);
        return;
      }
      setTrace(outcome.trace);
    } catch {
      const name = { python: 'Python', javascript: 'JavaScript', java: 'Java', cpp: 'C++', c: 'C' }[codeLanguage];
      setError(`${name} could not start. Please reload the page and try again.`);
    } finally {
      setBusy(false);
      setLoadingPython(false);
    }
  };

  if (trace) {
    return <StepScreen trace={trace} title={titleForSource(trace.source)} onNewCode={() => setTrace(null)} />;
  }

  if (practiceRoute) return <Practice route={practiceRoute} onVisualize={visualizeAnswer} />;

  return (
    <Home
      code={code}
      onCodeChange={changeCode}
      language={language}
      onLanguageChange={changeLanguage}
      onVisualize={visualize}
      busy={busy}
      loadingPython={loadingPython}
      error={error}
      inputCalls={inputCalls}
      inputText={inputText}
      onInputChange={setInputText}
    />
  );
}
