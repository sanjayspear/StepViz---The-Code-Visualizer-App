// The trace JSON: the contract between a runner and the UI (spec section 7).
// The UI reads only this shape, so other runners (JavaScript tracing, AI
// traces) can be added later without changing the screens.

export type FrameStatus = 'running' | 'waiting' | 'returning';

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
  explain: {
    what: string;
    /** "In real life" comparison; empty when there is none */
    life: string;
  };
}

export interface Trace {
  language: 'python';
  source: string;
  steps: TraceStep[];
}
