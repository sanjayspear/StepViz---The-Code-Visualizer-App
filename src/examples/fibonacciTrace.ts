// Built-in example "fibonacci(5)" (iterative).
// Frames, lines and output were recorded by the live tracer (tests check they
// still match); explanations are hand-written. Texts are final copy.
// Generated once; edit the texts here directly.
import type { Trace } from '../trace/types';
import { EXAMPLES } from './index';

export const FIBONACCI_TRACE: Trace = {
  language: 'python',
  source: EXAMPLES.find((e) => e.id === 'fibonacci')!.source,
  steps: [
    {
      "line": 1,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "0",
            "b": "1",
            "i": "?"
          },
          "status": "running"
        }
      ],
      "output": "",
      "explain": {
        "what": "We make two boxes at once: a is 0 and b is 1.",
        "life": "Like writing the first two numbers of a pattern on a card."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "0",
            "b": "1",
            "i": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "explain": {
        "what": "The loop starts. It will run 5 times, and i counts the rounds, starting at 0.",
        "life": "Like a coach saying \"five laps\" and counting each one as you go."
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "0",
            "b": "1",
            "i": "0"
          },
          "status": "running"
        }
      ],
      "output": "0\n",
      "explain": {
        "what": "print(a) shows 0 on the screen. That is the first Fibonacci number.",
        "life": "Like reading the first number on your card out loud."
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "1",
            "b": "1",
            "i": "0"
          },
          "status": "running"
        }
      ],
      "output": "0\n",
      "explain": {
        "what": "Both boxes change at the same time. a gets b's old value, 1, and b gets 0 + 1 = 1.",
        "life": "Like two friends swapping seats in one move, so nobody loses their place."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "1",
            "b": "1",
            "i": "1"
          },
          "status": "running"
        }
      ],
      "output": "0\n",
      "explain": {
        "what": "Round two of the loop. i is now 1.",
        "life": "Like flipping a calendar to the next day."
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "1",
            "b": "1",
            "i": "1"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n",
      "explain": {
        "what": "print(a) shows 1. The screen now shows 0 and 1.",
        "life": "Like adding a second bead to a necklace."
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "1",
            "b": "2",
            "i": "1"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n",
      "explain": {
        "what": "Both boxes change together again. a becomes 1, b's old value, and b becomes 1 + 1 = 2.",
        "life": "Like both hands of a clock moving at the same moment."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "1",
            "b": "2",
            "i": "2"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n",
      "explain": {
        "what": "Round three. i is now 2.",
        "life": "Like ticking the third box on a checklist."
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "1",
            "b": "2",
            "i": "2"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n1\n",
      "explain": {
        "what": "print(a) shows 1 again. The first two Fibonacci numbers after 0 are both 1.",
        "life": "Like hearing the same note twice in a tune."
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "2",
            "b": "3",
            "i": "2"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n1\n",
      "explain": {
        "what": "At the same time, a becomes 2 and b becomes 1 + 2 = 3.",
        "life": "Like two dancers stepping forward together on the same beat."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "2",
            "b": "3",
            "i": "3"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n1\n",
      "explain": {
        "what": "Round four. i is now 3.",
        "life": "Like the fourth stop on a bus route."
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "2",
            "b": "3",
            "i": "3"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n1\n2\n",
      "explain": {
        "what": "print(a) shows 2. Each new number is the two before it added together.",
        "life": "Like writing the next line of a pattern on a whiteboard."
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "3",
            "b": "5",
            "i": "3"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n1\n2\n",
      "explain": {
        "what": "Both boxes update together: a becomes 3 and b becomes 2 + 3 = 5.",
        "life": "Like a scoreboard where both teams' scores change at the same moment."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "3",
            "b": "5",
            "i": "4"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n1\n2\n",
      "explain": {
        "what": "The fifth and last round. i is now 4.",
        "life": "Like the last lap of a race."
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "3",
            "b": "5",
            "i": "4"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n1\n2\n3\n",
      "explain": {
        "what": "print(a) shows 3. The screen now shows 0, 1, 1, 2 and 3.",
        "life": "Like lining up five photos in order on a shelf."
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "5",
            "b": "8",
            "i": "4"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n1\n2\n3\n",
      "explain": {
        "what": "One last time, both boxes change together: a becomes 5 and b becomes 3 + 5 = 8. They are ready, but nothing prints them.",
        "life": "Like packing your bag for tomorrow even though today is over."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "a": "5",
            "b": "8",
            "i": "4"
          },
          "status": "running"
        }
      ],
      "output": "0\n1\n1\n2\n3\n",
      "explain": {
        "what": "The loop has run 5 times, so it stops. The program is finished.",
        "life": "Like a kitchen timer ringing when the time is up."
      }
    }
  ],
};
