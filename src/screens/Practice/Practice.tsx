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
import './Practice.css';

export function Practice({ route }: { route: PracticeRoute }) {
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
        {route.screen === 'question' && <QuestionPage id={route.id} scope={route.scope} filters={route.filters} progress={progress} />}
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

function QuestionPage({ id, scope, filters, progress }: { id: number; scope: string; filters: ListFilters; progress: Progress }) {
  const [language, setLanguage] = useState<CodeLanguage>('python');
  const q = questionById(id);
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
  const lang = PRACTICE_LANGUAGES.find((l) => l.value === language)!;
  const solved = progress.isSolved(q.id);

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

        <div className="practice-question__lang">
          <label className="practice-select">
            <span>Language</span>
            <span className="select-wrap">
              <select value={language} onChange={(e) => setLanguage(e.target.value as CodeLanguage)}>
                {PRACTICE_LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.ready ? l.label : `${l.label} (coming soon)`}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" size={14} className="select-wrap__chevron" />
            </span>
          </label>
          <p className="practice-soon" aria-live="polite">
            {lang.ready ? '' : `Starter code and tests in ${lang.label} are coming soon. You can already tick this question when you can solve it.`}
          </p>
        </div>

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
