import { useEffect, useState } from 'react';
import { DEFAULT_EXAMPLE } from './examples';
import { Home, type Language } from './screens/Home/Home';
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

  // Start loading Pyodide in the background once the page is idle, so the
  // first "Visualize my code" on pasted code is quick.
  useEffect(() => {
    const t = window.setTimeout(() => void pythonRunner.load().catch(() => {}), 1500);
    return () => window.clearTimeout(t);
  }, []);

  const changeCode = (next: string) => {
    setCode(next);
    setError(null);
  };

  const visualize = async () => {
    setBusy(true);
    setError(null);
    if (!pythonRunner.isReady) setLoadingPython(true);
    try {
      const check = await checkSource(code);
      setLoadingPython(false);
      if (!check.ok) {
        setError(check.message);
        return;
      }
      const outcome = await getTrace(code);
      if (outcome.kind === 'error') {
        setError(outcome.message);
        return;
      }
      setTrace(outcome.trace);
    } catch {
      setError('Python could not start. Please reload the page and try again.');
    } finally {
      setBusy(false);
      setLoadingPython(false);
    }
  };

  useEffect(() => {
    // Screen 2 is added in stage (d).
    if (trace && import.meta.env.DEV) console.info('[StepViz] trace', trace.steps.length, 'steps', trace);
  }, [trace]);

  return (
    <Home
      code={code}
      onCodeChange={changeCode}
      language={language}
      onLanguageChange={setLanguage}
      onVisualize={visualize}
      busy={busy}
      loadingPython={loadingPython}
      error={error}
    />
  );
}
