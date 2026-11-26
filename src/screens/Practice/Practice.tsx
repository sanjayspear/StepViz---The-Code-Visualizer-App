// The Practice section: practice home, a question list (one topic or all), a question.
// Every question is open at any time; ticks are manual and kept in this browser only.
import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../../components/Icon';
import {
  DIFFICULTIES,
  DIFFICULTY_LABEL,
  NO_FILTERS,
  PRACTICE_LANGUAGES,
  QUESTIONS,
  TOPICS,
  TOTAL,
  listQuestions,
  questionById,
  searchNumber,
  topicById,
  type Difficulty,
  type ListFilters,
  type Question,
} from '../../practice/data';
import { DAILY_GOAL, usePracticeProgress, type Progress } from '../../practice/progress';
import { go, listHref, practiceHomeHref, questionHref, toggleDifficulty, type PracticeRoute } from '../../practice/route';
import type { CodeLanguage } from '../../examples';
import { contentFor } from '../../practice/content';
import { pythonRunner } from '../../runner/pythonRunner';
import { checkJavaScript } from '../../runner/jsRunner';
import { checkJavaProgram } from '../../runner/javaRunner';
import { checkCppProgram } from '../../runner/cppRunner';
import type { CheckResult, CheckTestResult } from '../../runner/protocol';
import { CodeEditor } from '../Home/CodeEditor';
import './Practice.css';

/** Show a Python answer in the visualiser; gives back a message when it can't. */
export type Visualize = (source: string, language: CodeLanguage) => Promise<string | null>;

export function Practice({ route, onVisualize }: { route: PracticeRoute; onVisualize: Visualize }) {
  const progress = usePracticeProgress();
  // A new screen: start at the top, and move focus to its heading for keyboard and screen-reader users.
  const key = route.screen === 'question' ? `q${route.id}` : route.screen === 'list' ? `l${route.scope}` : 'home';
  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector<HTMLElement>('.practice h1')?.focus({ preventScroll: true });
  }, [key]);

  return (
    <div className="practice">
      <PracticeHeader />
      <main className="practice-main">
        {route.screen === 'home' && <PracticeHome progress={progress} />}
        {route.screen === 'list' && <QuestionList scope={route.scope} filters={route.filters} progress={progress} />}
        {route.screen === 'question' && <QuestionPage id={route.id} scope={route.scope} filters={route.filters} progress={progress} onVisualize={onVisualize} />}
      </main>
    </div>
  );
}

function PracticeHeader() {
  return (
    <header className="practice-header">
      <a className="practice-logo" href="#/">
        <Icon name="logo" size={24} className="practice-logo__mark" />
        <span className="practice-logo__name">StepViz</span>
      </a>
      <nav className="practice-tabs" aria-label="Main">
        <a className="practice-tabs__tab" href="#/">
          Home
        </a>
        <a className="practice-tabs__tab" href={practiceHomeHref()} aria-current="page">
          Practice
        </a>
      </nav>
    </header>
  );
}

// ---- pieces -------------------------------------------------------------------

function DifficultyPill({ d }: { d: Difficulty }) {
  return <span className={`practice-pill practice-pill--${d}`}>{DIFFICULTY_LABEL[d]}</span>;
}

function Bar({ done, total, label }: { done: number; total: number; label: string }) {
  return (
    <div className="practice-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
      <div className="practice-bar__fill" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
    </div>
  );
}

function Ring({ done, total }: { done: number; total: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="practice-ring" aria-hidden="true">
      <svg viewBox="0 0 84 84" width="84" height="84">
        <circle cx="42" cy="42" r={r} className="practice-ring__track" />
        <circle cx="42" cy="42" r={r} className="practice-ring__fill" strokeDasharray={`${(done / total) * c} ${c}`} transform="rotate(-90 42 42)" />
      </svg>
      <span className="practice-ring__number">{done}</span>
    </div>
  );
}

function todayText(n: number): string {
  if (n < DAILY_GOAL) return `Today: ${n} of ${DAILY_GOAL} questions done`;
  return n === DAILY_GOAL ? `Today: ${n} of ${DAILY_GOAL} questions done. Goal reached!` : `Today: ${n} questions done. Goal of ${DAILY_GOAL} reached!`;
}

/** Open a random unsolved question of a list; false when every one is solved. */
function surprise(questions: Question[], progress: Progress, scope: string, filters: ListFilters): boolean {
  const open = questions.filter((q) => !progress.isSolved(q.id));
  if (!open.length) return false;
  const pick = open[Math.floor(Math.random() * open.length)];
  go(questionHref(pick.id, scope, filters));
  return true;
}

function SurpriseButton({ questions, progress, scope, filters }: { questions: Question[]; progress: Progress; scope: string; filters: ListFilters }) {
  const [none, setNone] = useState(false);
  useEffect(() => setNone(false), [questions]);
  return (
    <div className="practice-surprise">
      <button type="button" className="practice-btn" onClick={() => setNone(!surprise(questions, progress, scope, filters))}>
        Surprise me
      </button>
      <span className="practice-surprise__note" aria-live="polite">
        {none ? 'Every question here is solved.' : ''}
      </span>
    </div>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h1 className="practice-title" tabIndex={-1}>
      {children}
    </h1>
  );
}

// ---- screen 1: practice home -------------------------------------------------------------

const FIRST_TOPICS = 4;

function PracticeHome({ progress }: { progress: Progress }) {
  const [allTopics, setAllTopics] = useState(false);
  const [search, setSearch] = useState('');
  const shown = allTopics ? TOPICS : TOPICS.slice(0, FIRST_TOPICS);
  const solvedIn = (topic: string) => QUESTIONS.filter((q) => q.topic === topic && progress.isSolved(q.id)).length;

  return (
    <>
      <section className="practice-card practice-summary" aria-labelledby="practice-summary-title">
        <Ring done={progress.solvedCount} total={TOTAL} />
        <div>
          <Heading>
            <span id="practice-summary-title">
              {progress.solvedCount} of {TOTAL} solved
            </span>
          </Heading>
          <p className="practice-muted">{todayText(progress.solvedToday)}</p>
        </div>
      </section>

      <section className="practice-card" aria-label="Find a question">
        <form
          className="practice-find"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const n = searchNumber(search);
            go(n !== null && questionById(n) ? questionHref(n) : listHref('all', { ...NO_FILTERS, q: search }));
          }}
        >
          <label className="visually-hidden" htmlFor="practice-home-search">
            Search by number or title
          </label>
          <input
            id="practice-home-search"
            className="practice-input"
            type="search"
            placeholder="Search by number or title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="practice-btn">
            Search
          </button>
        </form>
        <div className="practice-row">
          <a className="practice-link" href={listHref('all')}>
            All {TOTAL} questions
          </a>
          <SurpriseButton questions={QUESTIONS} progress={progress} scope="all" filters={NO_FILTERS} />
        </div>
      </section>

      <section aria-labelledby="practice-topics-title">
        <h2 id="practice-topics-title" className="practice-section-title">
          Topics
        </h2>
        <ul className="practice-topics">
          {shown.map((t) => {
            const total = t.last - t.first + 1;
            const done = solvedIn(t.id);
            return (
              <li key={t.id}>
                <a className="practice-topic" href={listHref(t.id)}>
                  <span className="practice-topic__name">{t.name}</span>
                  <span className="practice-muted">
                    {done} of {total}
                  </span>
                  <Bar done={done} total={total} label={`${t.name}: ${done} of ${total} solved`} />
                </a>
              </li>
            );
          })}
        </ul>
        <button type="button" className="practice-more" aria-expanded={allTopics} onClick={() => setAllTopics(!allTopics)}>
          {allTopics ? 'Show fewer topics' : `+ ${TOPICS.length - FIRST_TOPICS} more topics`}
        </button>
      </section>
    </>
  );
}

// ---- screen 2: question list -------------------------------------------------------------------

function QuestionList({ scope, filters, progress }: { scope: string; filters: ListFilters; progress: Progress }) {
  const topic = scope === 'all' ? null : topicById(scope)!;
  const inScope = QUESTIONS.filter((q) => scope === 'all' || q.topic === scope);
  const done = inScope.filter((q) => progress.isSolved(q.id)).length;
  const shown = listQuestions(scope, filters, progress.isSolved);
  const filtered = filters.q.trim() !== '' || filters.diff.length > 0 || filters.hideSolved;
  // Typing and filter changes update the address in place (Back leaves the list, not each letter).
  const update = (next: Partial<ListFilters>, nextScope = scope) => go(listHref(nextScope, { ...filters, ...next }), true);

  return (
    <>
      <a className="practice-back" href={practiceHomeHref()}>
        <Icon name="arrow-left" size={18} /> Practice
      </a>
      <section className="practice-card" aria-labelledby="practice-list-title">
        <Heading>
          <span id="practice-list-title">{topic ? topic.name : 'All questions'}</span>
        </Heading>
        <p className="practice-muted">
          {done} of {inScope.length} solved
        </p>
        <Bar done={done} total={inScope.length} label={`${done} of ${inScope.length} solved`} />

        <div className="practice-controls">
          <label className="visually-hidden" htmlFor="practice-search">
            Search by number or title
          </label>
          <input
            id="practice-search"
            className="practice-input"
            type="search"
            placeholder="Search by number or title"
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
          />
          <label className="practice-select">
            <span className="visually-hidden">Topic</span>
            <span className="select-wrap">
              <select value={scope} onChange={(e) => update({}, e.target.value)}>
                <option value="all">All topics</option>
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" size={14} className="select-wrap__chevron" />
            </span>
          </label>
        </div>
        <div className="practice-controls">
          <div className="practice-chips" role="group" aria-label="Difficulty">
            {DIFFICULTIES.map((d) => (
              <button key={d} type="button" className="chip" aria-pressed={filters.diff.includes(d)} onClick={() => update({ diff: toggleDifficulty(filters.diff, d) })}>
                {DIFFICULTY_LABEL[d]}
              </button>
            ))}
          </div>
          <label className="practice-check">
            <input type="checkbox" checked={filters.hideSolved} onChange={(e) => update({ hideSolved: e.target.checked })} />
            Hide solved
          </label>
          <SurpriseButton questions={shown} progress={progress} scope={scope} filters={filters} />
        </div>
        <p className="practice-muted practice-count" aria-live="polite">
          {filtered ? `Showing ${shown.length} of ${inScope.length} questions` : `${inScope.length} questions`}
        </p>
      </section>

      {shown.length === 0 ? (
        <div className="practice-card practice-empty">
          <p>No questions match.</p>
          <button type="button" className="practice-btn" onClick={() => update(NO_FILTERS)}>
            Clear the search and filters
          </button>
        </div>
      ) : (
        <ol className="practice-list">
          {shown.map((q) => (
            <li key={q.id} className="practice-item">
              <label className="practice-tick">
                <input type="checkbox" checked={progress.isSolved(q.id)} onChange={(e) => progress.setSolved(q.id, e.target.checked)} />
                <span className="visually-hidden">Mark Q{q.id} as solved</span>
              </label>
              <a className="practice-item__link" href={questionHref(q.id, scope, filters)}>
                <span className="practice-item__num">Q{q.id}</span>
                <span className="practice-item__title">{q.title}</span>
                <DifficultyPill d={q.difficulty} />
              </a>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

// ---- screen 3: one question ----------------------------------------------------------------------

// The student's answers, in memory only (never stored): kept while the app is open, so a trip
// to the visualiser and back does not lose them; gone when the page is closed or reloaded.
const answers = new Map<string, string>();

type Busy = null | 'tests' | 'visualize';

function QuestionPage({ id, scope, filters, progress, onVisualize }: { id: number; scope: string; filters: ListFilters; progress: Progress; onVisualize: Visualize }) {
  const [language, setLanguage] = useState<CodeLanguage>('python');
  const [showHint, setShowHint] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const q = questionById(id);
  const content = q ? contentFor(q.id, language) : undefined;
  const key = `${id}:${language}`;
  const [code, setCode] = useState(() => answers.get(key) ?? content?.starter ?? '');
  // Another question or language: its own answer, and a clean page.
  useEffect(() => {
    setCode(answers.get(key) ?? content?.starter ?? '');
    setResult(null);
    setNotice(null);
    setShowHint(false);
    setPromptOpen(false);
  }, [key, content]);

  if (!q) {
    return (
      <section className="practice-card">
        <Heading>There is no question {id}</Heading>
        <p className="practice-muted">The questions are numbered 1 to {TOTAL}.</p>
        <a className="practice-link" href={practiceHomeHref()}>
          Back to Practice
        </a>
      </section>
    );
  }
  const topic = topicById(q.topic)!;
  // Previous / next follow the list this question was opened from (it stays in it even when
  // "Hide solved" would now leave it out).
  const list = listQuestions(scope, filters, progress.isSolved);
  const prev = [...list].reverse().find((x) => x.id < q.id);
  const next = list.find((x) => x.id > q.id);
  const at = list.findIndex((x) => x.id === q.id);
  const listName = scope === 'all' ? 'All questions' : topicById(scope)!.name;
  const langName = PRACTICE_LANGUAGES.find((l) => l.value === language)!.label;
  const solved = progress.isSolved(q.id);

  const changeCode = (next: string) => {
    setCode(next);
    answers.set(key, next);
    setNotice(null);
  };
  const runTests = async () => {
    if (!content) return;
    setBusy('tests');
    setNotice(null);
    setPromptOpen(false);
    try {
      const spec = JSON.stringify({ tests: content.tests, forbid: content.forbid });
      const r =
        language === 'javascript' ? await checkJavaScript(code, spec)
        : language === 'java' ? await checkJavaProgram(code, spec)
        : language === 'cpp' || language === 'c' ? await checkCppProgram(code, spec, language)
        : await pythonRunner.check(code, spec);
      setResult(r);
      const all = r.status === 'ok' && r.results.length > 0 && r.results.every((t) => t.passed);
      if (all && !progress.isSolved(q.id)) setPromptOpen(true);
    } catch {
      setNotice(language === 'python' ? 'Python could not start. Please reload the page and try again.' : 'The tests could not start. Please reload the page and try again.');
    } finally {
      setBusy(null);
    }
  };
  const visualize = async () => {
    setBusy('visualize');
    setNotice(null);
    const problem = await onVisualize(code, language);
    setBusy(null);
    if (problem) setNotice(problem);
  };

  return (
    <>
      <a className="practice-back" href={listHref(scope, filters)}>
        <Icon name="arrow-left" size={18} /> {listName}
      </a>
      <article className="practice-card practice-question" aria-labelledby="practice-q-title">
        <p className="practice-meta">
          <span>
            {topic.name} · Q{q.id}
          </span>
          <DifficultyPill d={q.difficulty} />
        </p>
        <h1 id="practice-q-title" className="practice-title practice-question__title" tabIndex={-1}>
          {q.title}
        </h1>
        {content && <p className="practice-example">{content.example}</p>}

        <div className="practice-question__lang">
          <label className="practice-select">
            <span>Language</span>
            <span className="select-wrap">
              <select value={language} onChange={(e) => setLanguage(e.target.value as CodeLanguage)}>
                {PRACTICE_LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {contentFor(q.id, l.value) ? l.label : `${l.label} (coming soon)`}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" size={14} className="select-wrap__chevron" />
            </span>
          </label>
          {!content && (
            <p className="practice-soon">
              {language === 'python'
                ? `Python starter code and tests for ${topic.name} are coming soon (they arrive topic by topic). You can already tick this question when you can solve it.`
                : `Starter code and tests in ${langName} are coming soon. You can already tick this question when you can solve it.`}
            </p>
          )}
        </div>

        {content && (
          <div className="practice-work">
            <CodeEditor value={code} onChange={changeCode} language={language} ariaLabel={`Your answer to Q${q.id}`} />
            <div className="practice-actions">
              <button type="button" className="practice-btn practice-btn--primary" onClick={() => void runTests()} disabled={busy !== null}>
                {busy === 'tests' ? (language !== 'python' || pythonRunner.isReady ? 'Running tests…' : 'Loading Python…') : 'Run tests'}
              </button>
              <button type="button" className="practice-btn" onClick={() => void visualize()} disabled={busy !== null}>
                {busy === 'visualize' ? (language !== 'python' || pythonRunner.isReady ? 'Running…' : 'Loading Python…') : 'Visualize my code'}
              </button>
              <button type="button" className="practice-btn" aria-expanded={showHint} onClick={() => setShowHint(!showHint)}>
                {showHint ? 'Hide hint' : 'Hint'}
              </button>
              <button
                type="button"
                className="practice-more practice-actions__reset"
                onClick={() => {
                  changeCode(content.starter);
                  setResult(null);
                }}
              >
                Start over
              </button>
            </div>
            {showHint && (
              <p className="practice-hint">
                <strong>Hint:</strong> {content.hint}
              </p>
            )}
            <div aria-live="polite">
              {notice && <p className="practice-problem">{notice}</p>}
              {result && <TestResults result={result} />}
              {promptOpen && !solved && (
                <div className="practice-prompt">
                  <p>
                    <strong>All tests passed.</strong> Mark as solved?
                  </p>
                  <div className="practice-prompt__actions">
                    <button type="button" className="practice-btn practice-btn--primary" onClick={() => progress.setSolved(q.id, true)}>
                      Mark as solved
                    </button>
                    <button type="button" className="practice-btn" onClick={() => setPromptOpen(false)}>
                      Not yet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <label className="practice-solved">
          <input type="checkbox" checked={solved} onChange={(e) => progress.setSolved(q.id, e.target.checked)} />
          <span>
            <strong>{solved ? 'Solved' : 'Mark as solved'}</strong>
            <span className="practice-muted"> Tick it only when you can solve it without help.</span>
          </span>
        </label>
      </article>

      <nav className="practice-pager" aria-label="Questions in this list">
        {prev ? (
          <a className="practice-btn practice-pager__btn" href={questionHref(prev.id, scope, filters)}>
            <Icon name="arrow-left" size={18} /> Q{prev.id}
          </a>
        ) : (
          <span className="practice-btn practice-pager__btn" aria-disabled="true">
            <Icon name="arrow-left" size={18} /> First
          </span>
        )}
        <span className="practice-muted">{at >= 0 ? `${at + 1} of ${list.length} in ${listName}` : listName}</span>
        {next ? (
          <a className="practice-btn practice-pager__btn" href={questionHref(next.id, scope, filters)}>
            Q{next.id} <Icon name="arrow-right" size={18} />
          </a>
        ) : (
          <span className="practice-btn practice-pager__btn" aria-disabled="true">
            Last <Icon name="arrow-right" size={18} />
          </span>
        )}
      </nav>
    </>
  );
}

/** What the tests said: a summary pill, then each test with a word (Passed / Failed), never colour alone. */
function TestResults({ result }: { result: CheckResult }) {
  if (result.status === 'syntax-error') return <p className="practice-problem">{result.error?.message ?? 'This code could not be understood.'}</p>;
  if (result.status === 'forbidden') {
    return (
      <p className="practice-problem">
        Line {result.line}: {result.why} Your code uses <code>{result.word}</code>.
      </p>
    );
  }
  if (result.status === 'timeout') return <p className="practice-problem">Your program ran for a very long time before the tests could finish, so we stopped it. Check that every loop can end.</p>;
  if (result.status === 'error') {
    return (
      <p className="practice-problem">
        Your program stopped before the tests could run{result.line ? ` (line ${result.line})` : ''}: {result.errorType}
        {result.message ? `: ${result.message}` : ''}.
      </p>
    );
  }
  const passed = result.results.filter((t) => t.passed).length;
  const all = passed === result.results.length;
  return (
    <div className="practice-results">
      <p className={`practice-pill practice-results__summary practice-results__summary--${all ? 'all' : 'some'}`}>
        {passed} of {result.results.length} tests passed
      </p>
      <ul className="practice-results__list">
        {result.results.map((t, i) => (
          <li key={i} className={`practice-test practice-test--${t.passed ? 'pass' : 'fail'}`}>
            <span className="practice-test__verdict">{t.passed ? 'Passed' : 'Failed'}</span>
            <span className="practice-test__body">
              {t.phrased ? (
                <>
                  <code>{t.call}</code> {t.expected}
                </>
              ) : (
                <>
                  <code>{t.call}</code> should give <code>{t.expected}</code>
                </>
              )}
              {!t.passed && <span className="practice-test__why">{testProblem(t)}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function testProblem(t: CheckTestResult): string {
  switch (t.problem) {
    case 'missing':
      return `There is no function or class called ${t.missing ?? t.call.split('(')[0]} in your code.`;
    case 'shared':
      return `It gave ${t.got}, but it reuses nodes of the original. A copy must be made of new nodes.`;
    case undefined:
      return t.phrased ? t.got : `It gave ${t.got}.`;
    case 'timeout':
      return 'It took longer than 2 seconds, so it was stopped. Check that every loop can end, or look for a quicker way.';
    case 'skipped':
      return 'Not run: the time for all the tests ran out.';
    case 'error':
      return `It stopped with ${t.errorType}${t.message ? `: ${t.message}` : ''}${t.line ? ` (line ${t.line})` : ''}.`;
    default:
      return `It gave ${t.got}.`;
  }
}
