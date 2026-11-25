import { useState } from 'react';
import { DEFAULT_EXAMPLE } from './examples';
import { Home, type Language } from './screens/Home/Home';

// Stage (b): Home screen. "Visualize my code" is wired to the Python runner in
// stage (c) and opens Screen 2 in stage (d).
export default function App() {
  const [code, setCode] = useState(DEFAULT_EXAMPLE.source);
  const [language, setLanguage] = useState<Language>('python');

  return (
    <Home
      code={code}
      onCodeChange={setCode}
      language={language}
      onLanguageChange={setLanguage}
      onVisualize={() => {}}
    />
  );
}
