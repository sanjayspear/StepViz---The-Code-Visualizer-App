// Screen 2: Step-through (spec section 3). Reads only the Trace JSON.
import { useEffect, useRef } from 'react';
import { Icon } from '../../components/Icon';
import { ComingSoonButton } from '../../components/ComingSoon';
import { usePlayback } from '../../hooks/usePlayback';
import { useBeginnerMode } from '../../hooks/useBeginnerMode';
import type { Trace, TraceFrame } from '../../trace/types';
import './StepScreen.css';

interface Props {
  trace: Trace;
  title: string;
  onNewCode: () => void;
}

/** "n = 1 → 1 × 1 = 1" */
export function frameVarsText(frame: TraceFrame): string {
  const vars = Object.entries(frame.vars)
    .map(([k, v]) => `${k} = ${v}`)
    .join(', ');
  if (!frame.returns) return vars;
  return vars ? `${vars} → ${frame.returns}` : frame.returns;
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function StepScreen({ trace, title, onNewCode }: Props) {
  const total = trace.steps.length;
  const pb = usePlayback(total);
  const [beginner, toggleBeginner] = useBeginnerMode();
  const titleRef = useRef<HTMLHeadingElement>(null);

  const step = trace.steps[pb.index];
  const lines = trace.source.split('\n');
  const output = step.output.replace(/\n$/, '');
  const showLife = beginner && step.explain.life !== '';
  const stepLabel = `Step ${pb.index + 1} of ${total}`;

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
        e.preventDefault();
        if (!e.repeat) pb.togglePlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pb]);

  const progress = total > 0 ? ((pb.index + 1) / total) * 100 : 0;

  return (
    <div className="step-screen">
      <header className="step-topbar">
        <div className="step-topbar__left">
          <button type="button" className="step-topbar__back" onClick={onNewCode}>
            <Icon name="arrow-left" size={18} />
            <span>New code</span>
          </button>
          <h1 className="step-topbar__title" ref={titleRef} tabIndex={-1}>
            {title}
          </h1>
          <span className="step-badge">Python · exact trace</span>
        </div>
        <div className="step-topbar__right">
          <ComingSoonButton className="outline-btn">Share link</ComingSoonButton>
          <button type="button" className="outline-btn" aria-pressed={beginner} onClick={toggleBeginner}>
            {beginner ? 'Beginner mode: on' : 'Beginner mode: off'}
          </button>
        </div>
      </header>

      <main className="step-main">
        <div className="step-grid">
          <section className="code-panel" aria-label="Code">
            <h2 className="code-panel__heading">Code</h2>
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
            <div className="output-box">
              <h3 className="output-box__label">Output</h3>
              <pre className="output-box__text" data-testid="output">
                {output}
              </pre>
            </div>
          </section>

          <section className="stack-card" aria-labelledby="stack-title">
            <div className="stack-card__head">
              <h2 id="stack-title" className="stack-card__title">
                Call stack
              </h2>
              <p className="stack-card__hint">Newest call sits on top, like a stack of plates</p>
            </div>
            <ol className="stack" aria-label="Frames, newest last">
              {step.frames.map((frame, i) => (
                <li key={`${i}:${frame.name}`} className={`frame frame--${frame.status}`} data-testid="frame">
                  <div className="frame__body">
                    <span className="frame__name">{frame.name}</span>
                    <span className="frame__vars">{frameVarsText(frame) || ' '}</span>
                  </div>
                  <span className="frame__status">{frame.status}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className={`explain-card${showLife ? '' : ' explain-card--single'}`} aria-live="polite">
          <div>
            <p className="explain-card__kicker">What is happening · {stepLabel}</p>
            <p className="explain-card__what">{step.explain.what}</p>
          </div>
          {showLife && (
            <div className="life-box">
              <p className="life-box__kicker">In real life</p>
              <p className="life-box__text">{step.explain.life}</p>
            </div>
          )}
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
            <button type="button" className="ctrl-btn ctrl-btn--restart" onClick={pb.restart}>
              Restart
            </button>
            <button type="button" className="ctrl-btn ctrl-btn--back" onClick={pb.back} disabled={pb.isFirst}>
              Back
            </button>
            <button type="button" className="ctrl-btn ctrl-btn--play" onClick={pb.togglePlay}>
              {pb.playing ? 'Pause' : 'Play'}
            </button>
            <button type="button" className="ctrl-btn ctrl-btn--next" onClick={pb.next} disabled={pb.isLast}>
              Next step
            </button>
            <button type="button" className="speed-btn" onClick={pb.cycleSpeed}>
              Speed {pb.speed}×
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
