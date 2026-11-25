// The trace JSON: the contract between a runner and the UI (spec section 7).
// The UI reads only this shape, so other runners (JavaScript tracing, AI
// traces) can be added later without changing the screens.

export type FrameStatus = 'running' | 'waiting' | 'returning' | 'error';

export interface TraceFrame {
  /** e.g. "Global", "factorial(2)" */
  name: string;
  /** variable name -> short value text, in display order */
  vars: Record<string, string>;
  status: FrameStatus;
  /**
   * Only on a "returning" frame: the text after the arrow in the variables
   * line, e.g. "returns 1" or "1 × 1 = 1" (shown as "n = 1 → 1 × 1 = 1").
   */
  returns?: string;
}

export interface TraceStep {
  /** 1-based source line highlighted on this step */
  line: number;
  /** bottom to top: frames[0] is Global, the last frame is the newest call */
  frames: TraceFrame[];
  /** everything printed so far */
  output: string;
  /**
   * Only on the last step of a program that crashed: the Python error.
   * The frame where it happened has status "error".
   */
  error?: { type: string; message: string };
  explain: {
    what: string;
    /** "In real life" comparison; empty when there is none */
    life: string;
    /**
     * Replaces "Step X of N" in the kicker, e.g. "Pass 1, comparison 1".
     * Only in hand-written traces.
     */
    label?: string;
  };
  /**
   * What kind of thing happened on this step (filled in by every tracer; the
   * rule-based explainer builds its text from it). Hand-written fixtures may
   * leave it out.
   */
  kind?: StepKind;
  detail?: StepDetail;
  /** Loops-and-lists view (Screen 3): the list on this step. */
  list?: {
    /** short value text per item, index 0 first */
    values: string[];
    /** positions being looked at on this step (yellow) */
    compare?: number[];
    /** two positions about to swap (curved double arrow); the values are before the swap */
    swap?: [number, number];
  };
}

/**
 * Present when the program has a list that changes inside a loop (spec section 4):
 * Screen 3 shows the list instead of the call stack.
 */
export interface ListView {
  /** variable name of the list, e.g. "nums" */
  list: string;
  /** first and last line of the outer loop (for "Skip to next pass") */
  outerLine: number;
  outerEndLine: number;
  /** loop variables shown as cards under the code, outer first; the last one moves */
  loopVars: string[];
  /** top bar text; default "Loops view" */
  note?: string;
  /** card labels, e.g. { i: "i (pass)" }; default: the variable name */
  varLabels?: Record<string, string>;
}

export interface Trace {
  language: 'python' | 'javascript' | 'java' | 'cpp' | 'c';
  source: string;
  steps: TraceStep[];
  listView?: ListView;
}

export type StepKind =
  | 'define' // a function or class is defined (nothing inside runs yet)
  | 'assign' // variables were created or changed
  | 'input' // a value was read from the input
  | 'print' // something was printed
  | 'branch-taken' // an if's condition was true: its body runs
  | 'branch-skipped' // an if's condition was false: its body is skipped
  | 'loop-start' // a loop starts its first round
  | 'loop-next' // a loop starts another round
  | 'loop-end' // a loop is finished
  | 'call' // a function was called: a new frame
  | 'return' // a function returns
  | 'swap' // two list items are about to swap
  | 'crash' // the program stopped with an error
  | 'other';

export interface StepDetail {
  /** source text of an if or while condition */
  condition?: string;
  /** a skipped if goes on to its else part */
  toElse?: boolean;
  /** the variable a for loop sets each round */
  loopVar?: string;
  /** names assigned by this line */
  targets?: string[];
  /** assigned at the same time, as in a, b = b, a + b */
  simultaneous?: boolean;
}
