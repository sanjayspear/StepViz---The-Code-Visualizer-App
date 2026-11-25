// Screen 2: Step-through (spec section 3), and its phone layout, Screen 4
// (spec section 5), below 900 px wide. Reads only the Trace JSON.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon';
import { ComingSoonButton } from '../../components/ComingSoon';
import { usePlayback } from '../../hooks/usePlayback';
import { useBeginnerMode } from '../../hooks/useBeginnerMode';
import { PHONE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import type { Trace, TraceFrame } from '../../trace/types';
import { rawErrorText } from '../../trace/explain';
import { ListPanel, LoopVarCards, passStarts } from './ListPanel';
import './StepScreen.css';

interface Props {
  trace: Trace;
  title: string;
  onNewCode: () => void;
}

/**
 * The variables line of a frame: "n = 1 → 1 × 1 = 1".
 * The compact phone frame leaves out function values, as in the Screen 4
 * screenshot ("Global · result = ?").
 */
export function frameVarsText(frame: TraceFrame, compact = false): string {
  const vars = Object.entries(frame.vars)
    .filter(([, v]) => !(compact && v === 'function'))
    .map(([k, v]) => `${k} = ${v}`)
    .join(', ');
  if (!frame.returns) return vars;
  return vars ? `${vars} → ${frame.returns}` : frame.returns;
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/** Controls where Space has its own meaning (press the button, open the select…). */
function isControl(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return isTyping(target) || target.closest('button, a[href], [role="button"]') !== null;
}

export function StepScreen({ trace, title, onNewCode }: Props) {
  const total = trace.steps.length;
  const pb = usePlayback(total);
  const [beginner, toggleBeginner] = useBeginnerMode();
  const phone = useMediaQuery(PHONE_QUERY);
  const [menuOpen, setMenuOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const step = trace.steps[pb.index];
  const listView = trace.listView;
  const nextPass = passStarts(trace).find((k) => k > pb.index);
  const lines = trace.source.split('\n');
  const output = step.output.replace(/\n$/, '');
  const errorText = step.error ? rawErrorText(step.error) : '';
  const showLife = beginner && step.explain.life !== '';
  const stepLabel = `Step ${pb.index + 1} of ${total}`;
  const kickerLabel = step.explain.label ?? stepLabel;
  const progress = total > 0 ? ((pb.index + 1) / total) * 100 : 0;

  // Move focus to the title when the screen opens (screen reader context).
  useEffect(() => {
    window.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  // Keyboard: Left/Right arrows step, Space toggles play and pause.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        pb.next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pb.back();
      } else if (e.key === ' ' || e.code === 'Space') {
        // On a focused button, link, select or text field, Space works as normal.
        if (isControl(e.target)) return;
        e.preventDefault();
        if (!e.repeat) pb.togglePlay();
      } else if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pb, menuOpen]);

  // Menu: close on a click outside it, and when the layout changes.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);
  useEffect(() => {
    setMenuOpen(false);
  }, [phone]);

  const skipButton = listView && (
    <button
      type="button"
      className="ctrl-btn ctrl-btn--skip"
      onClick={() => nextPass !== undefined && pb.goTo(nextPass)}
      disabled={nextPass === undefined}
    >
      Skip to next pass
    </button>
  );

  const beginnerButton = (
    <button type="button" className="outline-btn" aria-pressed={beginner} onClick={toggleBeginner}>
      {beginner ? 'Beginner mode: on' : 'Beginner mode: off'}
    </button>
  );
  const badge = (
    <span className="step-badge">{trace.language === 'javascript' ? 'JavaScript' : 'Python'} · exact trace</span>
  );

  return (
    <div className="step-screen">
      <header className="step-topbar">
        <div className="step-topbar__left">
          <button
            type="button"
            className="step-topbar__back"
            onClick={onNewCode}
            aria-label={phone ? 'New code' : undefined}
          >
            <Icon name="arrow-left" size={phone ? 22 : 18} />
            {!phone && <span>New code</span>}
          </button>
          <h1 className="step-topbar__title" ref={titleRef} tabIndex={-1}>
            {title}
          </h1>
          {!phone && badge}
        </div>
        <div className="step-topbar__right">
          {phone ? (
            <>
              <ComingSoonButton className="icon-btn" aria-label="Share link" align="end">
                <Icon name="share" size={22} />
              </ComingSoonButton>
              <div className="topbar-menu" ref={menuRef}>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Menu"
                  aria-expanded={menuOpen}
                  aria-controls="step-menu"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <Icon name="more" size={22} />
                </button>
                {menuOpen && (
                  <div className="topbar-menu__panel" id="step-menu">
                    {badge}
                    {listView && <p className="topbar-menu__note">{listView.note ?? 'Loops view'}</p>}
                    {beginnerButton}
                  </div>
                )}
              </div>
            </>
          ) : listView ? (
            <>
              <p className="step-topbar__note">{listView.note ?? 'Loops view'}</p>
              <ComingSoonButton className="outline-btn">Share link</ComingSoonButton>
              <div className="topbar-menu" ref={menuRef}>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Menu"
                  aria-expanded={menuOpen}
                  aria-controls="step-menu"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <Icon name="more" size={22} />
                </button>
                {menuOpen && (
                  <div className="topbar-menu__panel" id="step-menu">
                    {beginnerButton}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <ComingSoonButton className="outline-btn">Share link</ComingSoonButton>
              {beginnerButton}
            </>
          )}
        </div>
      </header>

      <main className="step-main">
        <div className={`step-grid${listView ? ' step-grid--list' : ''}`}>
          <section className="code-panel" aria-labelledby="code-heading">
            <h2 id="code-heading" className={phone ? 'visually-hidden' : 'code-panel__heading'}>
              Code
            </h2>
            <div className="code-lines" style={{ ['--active-index' as string]: step.line - 1 }}>
              <div className="code-lines__highlight" aria-hidden="true" />
              <ol className="code-lines__list">
                {lines.map((text, i) => (
                  <li
                    key={i}
                    className={`code-line${i === step.line - 1 ? ' code-line--active' : ''}`}
                    aria-current={i === step.line - 1 ? 'step' : undefined}
                    data-line={i + 1}
                  >
                    <span className="code-line__num">{i + 1}</span>
                    <span className="code-line__text">{text}</span>
                  </li>
                ))}
              </ol>
            </div>
            {listView && <LoopVarCards view={listView} step={step} />}
            {/* On phone and in the loops view the output box appears once something is printed. */}
            {((!phone && !listView) || output !== '' || errorText !== '') && (
              <div className="output-box">
                <h3 className="output-box__label">Output</h3>
                <pre className="output-box__text" data-testid="output">
                  {output}
                </pre>
                {errorText && (
                  <pre className="output-box__text output-box__error" data-testid="output-error">
                    {errorText}
                  </pre>
                )}
              </div>
            )}
          </section>

          {listView ? (
            <div className="list-column">
              <ListPanel trace={trace} index={pb.index} maxBar={phone ? 120 : 200} />
              {phone && skipButton}
            </div>
          ) : (
          <section className="stack-card" aria-labelledby="stack-title">
            <div className="stack-card__head">
              <h2 id="stack-title" className="stack-card__title">
                Call stack
              </h2>
              <p className="stack-card__hint">
                {phone ? 'newest on top' : 'Newest call sits on top, like a stack of plates'}
              </p>
            </div>
            <ol className="stack" aria-label="Frames, newest last">
              {step.frames.map((frame, i) => {
                const vars = frameVarsText(frame, phone);
                return (
                  <li key={`${i}:${frame.name}`} className={`frame frame--${frame.status}`} data-testid="frame">
                    <div className="frame__body">
                      <span className="frame__name">{frame.name}</span>
                      {phone ? (
                        vars && <span className="frame__vars"> · {vars}</span>
                      ) : (
                        <span className="frame__vars">{vars || ' '}</span>
                      )}
                    </div>
                    <span className="frame__status">{frame.status}</span>
                  </li>
                );
              })}
            </ol>
          </section>
          )}
        </div>

        <section className={`explain-card${showLife ? '' : ' explain-card--single'}`} aria-live="polite">
          <div>
            <p className="explain-card__kicker">{phone ? kickerLabel : `What is happening · ${kickerLabel}`}</p>
            <p className="explain-card__what">{step.explain.what}</p>
          </div>
          {showLife &&
            (phone ? (
              <p className="life-box life-box__text">
                <strong>In real life:</strong> {lowerFirst(step.explain.life)}
              </p>
            ) : (
              <div className="life-box">
                <p className="life-box__kicker">In real life</p>
                <p className="life-box__text">{step.explain.life}</p>
              </div>
            ))}
        </section>

        <section className="controls-card" aria-label="Controls">
          <div
            className="progress"
            role="progressbar"
            aria-label="Progress"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={pb.index + 1}
            aria-valuetext={stepLabel}
          >
            <div className="progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="controls">
            {!phone && (
              <button type="button" className="ctrl-btn ctrl-btn--restart" onClick={pb.restart}>
                Restart
              </button>
            )}
            <button type="button" className="ctrl-btn ctrl-btn--back" onClick={pb.back} disabled={pb.isFirst}>
              Back
            </button>
            <button type="button" className="ctrl-btn ctrl-btn--play" onClick={pb.togglePlay}>
              {pb.playing ? 'Pause' : 'Play'}
            </button>
            <button type="button" className="ctrl-btn ctrl-btn--next" onClick={pb.next} disabled={pb.isLast}>
              Next step
            </button>
            {!phone && skipButton}
            {!phone && (
              <button type="button" className="speed-btn" onClick={pb.cycleSpeed}>
                Speed {pb.speed}×
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
