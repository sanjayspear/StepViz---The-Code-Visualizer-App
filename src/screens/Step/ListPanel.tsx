// Screen 3 (spec section 4): the list panel that replaces the call stack when
// a list changes inside a loop, and the loop-variable cards under the code.
import type { ListView, Trace, TraceFrame, TraceStep } from '../../trace/types';

/** 20 px per unit, scaled down when values are large (spec section 4). */
const PX_PER_UNIT = 20;

function numeric(text: string): number | null {
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

/** Items "5 and 2" for a pair of positions. */
function pairText(values: string[], [a, b]: [number, number]): string {
  return `${values[a]} and ${values[b]}`;
}

const listText = (values: string[]) => `[${values.join(', ')}]`;

interface PanelProps {
  trace: Trace;
  index: number;
  maxBar: number;
}

export function ListPanel({ trace, index, maxBar }: PanelProps) {
  const view = trace.listView!;
  const step = trace.steps[index];
  const values = step.list?.values ?? [];
  const compare = new Set(step.list?.compare ?? []);
  const swap = step.list?.swap;

  // One scale for the whole run, so bars keep their size from step to step.
  const largest = Math.max(
    1,
    ...trace.steps.flatMap((s) => (s.list?.values ?? []).map((v) => numeric(v) ?? 0)),
  );
  const unit = Math.min(PX_PER_UNIT, maxBar / largest);
  const barArea = Math.ceil(largest * unit);

  return (
    <section className="list-card" aria-labelledby="list-title">
      <div className="list-card__head">
        <h2 id="list-title" className="list-card__title">
          {view.list}, as a list
        </h2>
        <p className="list-card__hint">Taller bar = bigger number</p>
      </div>

      <div className="list-chart" role="list" aria-label={`${view.list}: ${listText(values)}`}>
        <div className="list-chart__columns" style={{ ['--bar-area' as string]: `${barArea}px` }}>
          {swap && <SwapArrow from={swap[0]} to={swap[1]} />}
          {values.map((v, i) => {
            const n = numeric(v);
            const height = n !== null && n > 0 ? Math.max(2, n * unit) : 0;
            const looked = compare.has(i);
            return (
              <div key={i} role="listitem" className={`list-col${looked ? ' list-col--compared' : ''}`}>
                <div className="list-col__value">{v}</div>
                <div className="list-col__bar" style={{ height }} />
                <div className="list-col__index">index {i}</div>
              </div>
            );
          })}
        </div>
      </div>

      <History steps={trace.steps} index={index} />
    </section>
  );
}

/** Curved double arrow above the two columns that are about to swap. */
function SwapArrow({ from, to }: { from: number; to: number }) {
  const [a, b] = from < to ? [from, to] : [to, from];
  // Column centers: each column is --col-w wide with --col-gap between them.
  const style = {
    ['--from' as string]: a,
    ['--span' as string]: b - a,
  };
  return (
    <svg className="swap-arrow" style={style} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 36 C 20 2, 80 2, 96 36" vectorEffect="non-scaling-stroke" />
      <path d="M0 26 L4 36 L12 30" vectorEffect="non-scaling-stroke" />
      <path d="M88 30 L96 36 L100 26" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * "start [5, 2, 8, 1]", one chip per swap so far, and a highlighted chip for
 * the current action.
 */
function History({ steps, index }: { steps: TraceStep[]; index: number }) {
  const first = steps.find((s) => s.list);
  const current = steps[index].list;
  if (!first?.list) return null;

  const past: string[] = [];
  for (let k = 0; k < index; k++) {
    const l = steps[k].list;
    if (l?.swap) past.push(`swapped ${pairText(l.values, l.swap)}`);
  }
  let now = current ? `now ${listText(current.values)}` : '';
  if (current?.swap) now += ` → swapping ${pairText(current.values, current.swap)}`;

  return (
    <div className="history">
      <span className="history__label">History</span>
      <ol className="history__chips">
        <li className="history-chip">start {listText(first.list.values)}</li>
        {past.map((text, k) => (
          <li key={k} className="history-chip">
            {text}
          </li>
        ))}
        {now && <li className="history-chip history-chip--now">{now}</li>}
      </ol>
    </div>
  );
}

/** Value of a variable on this step: newest frame first, then Global. */
function varValue(frames: TraceFrame[], name: string): string {
  for (let i = frames.length - 1; i >= 0; i--) {
    if (name in frames[i].vars) return frames[i].vars[name];
  }
  return '?';
}

/** Cards under the code: "i (pass)" and "j (comparing)"; the moving one is yellow. */
export function LoopVarCards({ view, step }: { view: ListView; step: TraceStep }) {
  if (view.loopVars.length === 0) return null;
  const moving = view.loopVars[view.loopVars.length - 1];
  return (
    <div className="var-cards">
      {view.loopVars.map((name) => (
        <div key={name} className="var-card">
          <span className="var-card__label">{view.varLabels?.[name] ?? name}</span>
          <span className={`var-card__value${name === moving ? ' var-card__value--moving' : ''}`}>
            {varValue(step.frames, name)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Indexes of the first step of each outer-loop iteration. */
export function passStarts(trace: Trace): number[] {
  const view = trace.listView;
  if (!view) return [];
  const inBody = (line: number) => line > view.outerLine && line <= view.outerEndLine;
  const starts: number[] = [];
  trace.steps.forEach((s, k) => {
    const next = trace.steps[k + 1];
    if (s.line === view.outerLine && next && inBody(next.line)) starts.push(k);
  });
  return starts;
}
