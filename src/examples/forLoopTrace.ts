// Built-in example "For loop: sum of 1 to 3".
// Frames, lines and output were recorded by the live tracer (tests check they
// still match); explanations are hand-written. Texts are final copy.
// Generated once; edit the texts here directly.
import type { Trace } from '../trace/types';
import { EXAMPLES } from './index';

export const FOR_LOOP_TRACE: Trace = {
  language: 'python',
  source: EXAMPLES.find((e) => e.id === 'for-loop')!.source,
  steps: [
    {
      "line": 1,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "total": "0",
            "i": "?"
          },
          "status": "running"
        }
      ],
      "output": "",
      "explain": {
        "what": "We make a box called total and put 0 in it.",
        "life": "Like setting a scoreboard to zero before the game starts."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "total": "0",
            "i": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "explain": {
        "what": "The loop starts. range(1, 4) gives 1, 2 and 3, so i is now 1.",
        "life": "Like counting on your fingers: you start with the first finger."
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "total": "1",
            "i": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "explain": {
        "what": "total + i is 0 + 1 = 1, so total is now 1.",
        "life": "Like dropping the first coin into an empty piggy bank."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "total": "1",
            "i": "2"
          },
          "status": "running"
        }
      ],
      "output": "",
      "explain": {
        "what": "Back to the top of the loop. The next number is 2, so i is now 2.",
        "life": "Like turning to the next item on a shopping list."
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "total": "3",
            "i": "2"
          },
          "status": "running"
        }
      ],
      "output": "",
      "explain": {
        "what": "total + i is 1 + 2 = 3, so total is now 3.",
        "life": "Like adding a second item's price to the total at the checkout."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "total": "3",
            "i": "3"
          },
          "status": "running"
        }
      ],
      "output": "",
      "explain": {
        "what": "Next round. i is now 3, the last number range(1, 4) gives.",
        "life": "Like reaching the last stair before the landing."
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "total": "6",
            "i": "3"
          },
          "status": "running"
        }
      ],
      "output": "",
      "explain": {
        "what": "total + i is 3 + 3 = 6, so total is now 6.",
        "life": "Like pouring a third cup of water into a jug."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "total": "6",
            "i": "3"
          },
          "status": "running"
        }
      ],
      "output": "",
      "explain": {
        "what": "There are no numbers left, so the loop ends. i keeps its last value, 3.",
        "life": "Like a playlist stopping after the last song."
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "total": "6",
            "i": "3"
          },
          "status": "running"
        }
      ],
      "output": "6\n",
      "explain": {
        "what": "print(total) shows 6 on the screen. The program is finished.",
        "life": "Like announcing the final score at the end of a game."
      }
    }
  ],
};
