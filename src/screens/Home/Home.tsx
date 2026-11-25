// Screen 1: Home (spec section 2).
import { useEffect, useRef } from 'react';
import { Icon, type IconName } from '../../components/Icon';
import { ComingSoonButton } from '../../components/ComingSoon';
import { EXAMPLES, exampleForSource, sourceOf, type CodeLanguage } from '../../examples';
import { CodeEditor } from './CodeEditor';
import './Home.css';

export type Language = 'python' | 'javascript' | 'java' | 'cpp' | 'c';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  // Exact traces for C++ and C are being built; each loses "(coming soon)" when it works.
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++ (coming soon)' },
  { value: 'c', label: 'C (coming soon)' },
];

const FEATURES: { icon: IconName; tone: 'yellow' | 'green' | 'accent'; title: string; text: string }[] = [
  {
    icon: 'lines',
    tone: 'yellow',
    title: 'The running line, highlighted',
    text: 'A marker walks through your code exactly like the computer does.',
  },
  {
    icon: 'boxes',
    tone: 'green',
    title: 'Variables and calls as boxes',
    text: 'Watch values change, arrays swap, and function calls stack up and unwind.',
  },
  {
    icon: 'message',
    tone: 'accent',
    title: 'Explained like you are new',
    text: 'Each step has a plain-English reason and an everyday real-life comparison.',
  },
];

interface Props {
  code: string;
  onCodeChange: (code: string) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onVisualize: () => void;
  /** True while the code is being checked or run. */
  busy?: boolean;
  /** True while waiting for Pyodide to finish loading. */
  loadingPython?: boolean;
  /** A friendly message under the editor (syntax error, step/time cap, crash). */
  error?: string | null;
  /** Number of input() calls, once the code was checked and needs input. */
  inputCalls?: number | null;
  inputText?: string;
  onInputChange?: (text: string) => void;
}

export function Home({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onVisualize,
  busy = false,
  loadingPython = false,
  error,
  inputCalls = null,
  inputText = '',
  onInputChange,
}: Props) {
  const chipsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // When the input box first appears, put the cursor in it.
  const showInput = inputCalls !== null && inputCalls > 0;
  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);
  const codeLanguage: CodeLanguage = language === 'javascript' || language === 'java' ? language : 'python';
  const selectedExample = exampleForSource(code);
  const selected = selectedExample && sourceOf(selectedExample, codeLanguage) === code ? selectedExample.id : undefined;

  const isEmpty = code.trim() === '';
  // Python, JavaScript and Java have an exact trace; C++ and C are coming.
  const comingSoon = language === 'cpp' || language === 'c';
  const disabled = isEmpty || comingSoon || busy;

  let helper: string | null = null;
  if (comingSoon) helper = 'Coming soon';
  else if (isEmpty) helper = 'Paste some code first';

  const scrollToExamples = () => {
    const el = chipsRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    el.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  };

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-logo">
          <Icon name="logo" size={24} className="home-logo__mark" />
          <span className="home-logo__name">StepViz</span>
        </div>
        <nav className="home-nav" aria-label="Main">
          <button type="button" className="home-nav__link" onClick={scrollToExamples}>
            Examples
          </button>
          <ComingSoonButton className="home-nav__link">How it works</ComingSoonButton>
          <ComingSoonButton className="home-nav__signin" align="end">
            Sign in
          </ComingSoonButton>
        </nav>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <h1 className="home-hero__title">Paste any code. Watch it run, one step at a time.</h1>
          <p className="home-hero__sub">
            See every line light up, every variable change, and every function call stack up, with a plain-English
            reason for each step.
          </p>
        </section>

        <div className="home-grid">
          <section className="editor-card" aria-labelledby="your-code-label">
            <div className="editor-card__head">
              <h2 id="your-code-label" className="editor-card__label">
                Your code
              </h2>
              <label className="editor-card__lang">
                <span>Language</span>
                <span className="select-wrap">
                  <select value={language} onChange={(e) => onLanguageChange(e.target.value as Language)}>
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron-down" size={14} className="select-wrap__chevron" />
                </span>
              </label>
            </div>

            <CodeEditor
              value={code}
              onChange={onCodeChange}
              language={codeLanguage}
              ariaLabel="Your code"
              ariaDescribedBy={helper || error ? 'editor-message' : undefined}
            />

            {showInput && (
              <div className="input-box">
                <label htmlFor="program-input" className="input-box__label">
                  {codeLanguage === 'python'
                    ? 'Your program asks for input. Type one line per input() call.'
                    : 'Your program reads input. Type your input here, one value per line or separated by spaces.'}
                </label>
                <textarea
                  id="program-input"
                  ref={inputRef}
                  className="input-box__field"
                  rows={Math.min(Math.max(inputCalls ?? 1, 2), 6)}
                  value={inputText}
                  onChange={(e) => onInputChange?.(e.target.value)}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </div>
            )}

            <div id="editor-message" aria-live="polite">
              {error && !comingSoon ? (
                <p className="editor-card__error">{error}</p>
              ) : helper ? (
                <p className="editor-card__helper">{helper}</p>
              ) : null}
            </div>

            <div className="examples" ref={chipsRef} id="examples">
              <span className="examples__label" id="examples-label">
                Try an example
              </span>
              <div className="examples__chips" role="group" aria-labelledby="examples-label">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    className="chip"
                    aria-pressed={selected === ex.id}
                    onClick={() => onCodeChange(sourceOf(ex, codeLanguage))}
                  >
                    {ex.chip}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="visualize-btn" disabled={disabled} onClick={onVisualize}>
              {loadingPython ? 'Loading Python…' : 'Visualize my code'}
              {!loadingPython && <Icon name="arrow-right" size={20} />}
            </button>
          </section>

          <aside className="features" aria-labelledby="features-title">
            <h2 id="features-title" className="features__title">
              What you will see
            </h2>
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <span className={`feature-card__icon feature-card__icon--${f.tone}`}>
                  <Icon name={f.icon} size={22} />
                </span>
                <div>
                  <h3 className="feature-card__title">{f.title}</h3>
                  <p className="feature-card__text">{f.text}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>

        <section className="lang-strip" aria-label="Language support">
          <span className="lang-strip__label">Language support</span>
          <span className="pill pill--green">Python · exact trace</span>
          <span className="pill pill--green">JavaScript · exact trace</span>
          <span className="pill pill--green">Java · exact trace</span>
          <span className="pill pill--yellow">C++, C · coming soon</span>
        </section>
      </main>
    </div>
  );
}
