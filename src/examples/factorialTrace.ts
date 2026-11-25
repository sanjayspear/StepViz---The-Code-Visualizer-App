// Section 6 sample trace: factorial(3). Texts are final copy; do not reword.
import type { Trace, TraceFrame } from '../trace/types';
import { EXAMPLES } from './index';

const SOURCE = EXAMPLES.find((e) => e.id === 'factorial')!.source;

const G = (status: TraceFrame['status'], result?: string): TraceFrame => ({
  name: 'Global',
  vars: result === undefined ? { factorial: 'function' } : { factorial: 'function', result },
  status,
});
const F = (n: number, status: TraceFrame['status'], returns?: string): TraceFrame =>
  returns === undefined
    ? { name: `factorial(${n})`, vars: { n: String(n) }, status }
    : { name: `factorial(${n})`, vars: { n: String(n) }, status, returns };

const W = 'waiting' as const;
const R = 'running' as const;
const RET = 'returning' as const;

export const FACTORIAL_TRACE: Trace = {
  language: 'python',
  source: SOURCE,
  steps: [
    {
      line: 1,
      frames: [G(R)],
      output: '',
      explain: {
        what: 'Python reads the def and saves factorial for later. Nothing runs yet.',
        life: 'Like writing a recipe on a card. It is saved, but nobody has cooked anything yet.',
      },
    },
    {
      line: 6,
      frames: [G(W, '?'), F(3, R)],
      output: '',
      explain: {
        what: 'We call factorial(3). A new box, called a frame, appears with n = 3.',
        life: 'Like starting a new job: you get a fresh sheet of paper just for it.',
      },
    },
    {
      line: 2,
      frames: [G(W, '?'), F(3, R)],
      output: '',
      explain: {
        what: 'Is n equal to 0? n is 3, so no. We skip the return 1.',
        life: 'Asking "is the queue empty?" It is not, so we keep going.',
      },
    },
    {
      line: 4,
      frames: [G(W, '?'), F(3, W), F(2, R)],
      output: '',
      explain: {
        what: 'To get 3 × factorial(2) we must first know factorial(2). This box pauses and a new one opens on top.',
        life: 'Like asking a friend a question. You wait while they work it out.',
      },
    },
    {
      line: 2,
      frames: [G(W, '?'), F(3, W), F(2, R)],
      output: '',
      explain: {
        what: 'Same check again. n is 2, not 0.',
        life: 'Your friend checks: "do I already know the answer?" Not yet.',
      },
    },
    {
      line: 4,
      frames: [G(W, '?'), F(3, W), F(2, W), F(1, R)],
      output: '',
      explain: {
        what: 'It needs factorial(1). Pause again, open another box.',
        life: 'Your friend asks another friend. Now three people are waiting in a chain.',
      },
    },
    {
      line: 2,
      frames: [G(W, '?'), F(3, W), F(2, W), F(1, R)],
      output: '',
      explain: {
        what: 'n is 1, still not 0.',
        life: 'The third friend also does not know the answer yet.',
      },
    },
    {
      line: 4,
      frames: [G(W, '?'), F(3, W), F(2, W), F(1, W), F(0, R)],
      output: '',
      explain: {
        what: 'It needs factorial(0). One last box opens.',
        life: 'The third friend asks a fourth friend.',
      },
    },
    {
      line: 3,
      frames: [G(W, '?'), F(3, W), F(2, W), F(1, W), F(0, RET, 'returns 1')],
      output: '',
      explain: {
        what: 'n is 0, so we return 1. This is the base case: the place where the chain finally stops.',
        life: 'The last friend knows the answer straight away and replies.',
      },
    },
    {
      line: 4,
      frames: [G(W, '?'), F(3, W), F(2, W), F(1, RET, '1 × 1 = 1')],
      output: '',
      explain: {
        what: 'The n = 1 box gets 1 back, works out 1 × 1 = 1 and returns it. The box above it is removed.',
        life: 'Each friend uses the reply to answer the one before them.',
      },
    },
    {
      line: 4,
      frames: [G(W, '?'), F(3, W), F(2, RET, '2 × 1 = 2')],
      output: '',
      explain: {
        what: 'The n = 2 box computes 2 × 1 = 2 and returns 2.',
        life: 'The answers travel back down the chain, one person at a time.',
      },
    },
    {
      line: 4,
      frames: [G(W, '?'), F(3, RET, '3 × 2 = 6')],
      output: '',
      explain: {
        what: 'The n = 3 box computes 3 × 2 = 6 and returns 6.',
        life: 'The first person finally gets the full answer.',
      },
    },
    {
      line: 6,
      frames: [G(R, '6')],
      output: '',
      explain: {
        what: 'The answer 6 is stored in result. All the extra boxes are gone.',
        life: 'You write the final answer on your own paper and throw the scratch sheets away.',
      },
    },
    {
      line: 7,
      frames: [G(R, '6')],
      output: '6\n',
      explain: {
        what: 'print(result) shows 6 on the screen. The program is finished.',
        life: 'Like reading your answer out loud.',
      },
    },
  ],
};
