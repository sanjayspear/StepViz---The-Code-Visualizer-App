import { useEffect, useState } from 'react';
import { DEFAULT_EXAMPLE, exampleForSource, sourceOf, titleForSource, type CodeLanguage } from './examples';
import { Home, type Language } from './screens/Home/Home';
import { StepScreen } from './screens/Step/StepScreen';
import { pythonRunner } from './runner/pythonRunner';
import { checkSource, getTrace } from './trace/getTrace';
import type { Trace } from './trace/types';

export default function App() {
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

  const changeCode = (next: string) => {
    setCode(next);
    setError(null);
    setInputCalls(null);
    setInputText('');
  };

  const codeLanguage: CodeLanguage = language === 'c' ? 'python' : language;

  // Switching between Python and JavaScript swaps an unchanged example for the
  // same example in the other language; the student's own code is left alone.
  const changeLanguage = (next: Language) => {
    setLanguage(next);
    setError(null);
    if (next === 'c') return;
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
      const name = { python: 'Python', javascript: 'JavaScript', java: 'Java', cpp: 'C++' }[codeLanguage];
      setError(`${name} could not start. Please reload the page and try again.`);
    } finally {
      setBusy(false);
      setLoadingPython(false);
    }
  };

  if (trace) {
    return <StepScreen trace={trace} title={titleForSource(trace.source)} onNewCode={() => setTrace(null)} />;
  }

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
