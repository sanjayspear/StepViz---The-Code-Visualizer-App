// C++ version of the built-in Factorial example.
// Frames, lines and output were recorded by the C++ interpreter (tests check
// they still match); explanations are the section 6 texts adapted for C++, plus
// the last step (return 0 ends main).
import type { Trace } from '../trace/types';
import { EXAMPLES } from './index';

export const FACTORIAL_CPP_TRACE: Trace = {
  language: 'cpp',
  source: EXAMPLES.find((e) => e.id === 'factorial')!.cppSource,
  steps: [
    {
      "line": 12,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "running"
        }
      ],
      "output": "",
      "kind": "call",
      "explain": {
        "what": "We call factorial(3). A new box, called a frame, appears with n = 3.",
        "life": "Like starting a new job: you get a fresh sheet of paper just for it."
      }
    },
    {
      "line": 5,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "running"
        }
      ],
      "output": "",
      "kind": "branch-skipped",
      "detail": {
        "condition": "n == 0"
      },
      "explain": {
        "what": "Is n equal to 0? n is 3, so no. We skip the return 1.",
        "life": "Asking \"is the queue empty?\" It is not, so we keep going."
      }
    },
    {
      "line": 8,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(2)",
          "vars": {
            "n": "2"
          },
          "status": "running"
        }
      ],
      "output": "",
      "kind": "call",
      "explain": {
        "what": "To get 3 × factorial(2) we must first know factorial(2). This box pauses and a new one opens on top.",
        "life": "Like asking a friend a question. You wait while they work it out."
      }
    },
    {
      "line": 5,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(2)",
          "vars": {
            "n": "2"
          },
          "status": "running"
        }
      ],
      "output": "",
      "kind": "branch-skipped",
      "detail": {
        "condition": "n == 0"
      },
      "explain": {
        "what": "Same check again. n is 2, not 0.",
        "life": "Your friend checks: \"do I already know the answer?\" Not yet."
      }
    },
    {
      "line": 8,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(2)",
          "vars": {
            "n": "2"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(1)",
          "vars": {
            "n": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "kind": "call",
      "explain": {
        "what": "It needs factorial(1). Pause again, open another box.",
        "life": "Your friend asks another friend. Now three people are waiting in a chain."
      }
    },
    {
      "line": 5,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(2)",
          "vars": {
            "n": "2"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(1)",
          "vars": {
            "n": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "kind": "branch-skipped",
      "detail": {
        "condition": "n == 0"
      },
      "explain": {
        "what": "n is 1, still not 0.",
        "life": "The third friend also does not know the answer yet."
      }
    },
    {
      "line": 8,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(2)",
          "vars": {
            "n": "2"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(1)",
          "vars": {
            "n": "1"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(0)",
          "vars": {
            "n": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "kind": "call",
      "explain": {
        "what": "It needs factorial(0). One last box opens.",
        "life": "The third friend asks a fourth friend."
      }
    },
    {
      "line": 5,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(2)",
          "vars": {
            "n": "2"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(1)",
          "vars": {
            "n": "1"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(0)",
          "vars": {
            "n": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "kind": "branch-taken",
      "detail": {
        "condition": "n == 0"
      },
      "explain": {
        "what": "Is n equal to 0? Yes, this time n is 0.",
        "life": "The fourth friend checks and realises they already know the answer."
      }
    },
    {
      "line": 6,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(2)",
          "vars": {
            "n": "2"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(1)",
          "vars": {
            "n": "1"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(0)",
          "vars": {
            "n": "0"
          },
          "status": "returning",
          "returns": "returns 1"
        }
      ],
      "output": "",
      "kind": "return",
      "explain": {
        "what": "n is 0, so we return 1. This is the base case: the place where the chain finally stops.",
        "life": "The last friend knows the answer straight away and replies."
      }
    },
    {
      "line": 8,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(2)",
          "vars": {
            "n": "2"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(1)",
          "vars": {
            "n": "1"
          },
          "status": "returning",
          "returns": "1 × 1 = 1"
        }
      ],
      "output": "",
      "kind": "return",
      "explain": {
        "what": "The n = 1 box gets 1 back, works out 1 × 1 = 1 and returns it. The box above it is removed.",
        "life": "Each friend uses the reply to answer the one before them."
      }
    },
    {
      "line": 8,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(2)",
          "vars": {
            "n": "2"
          },
          "status": "returning",
          "returns": "2 × 1 = 2"
        }
      ],
      "output": "",
      "kind": "return",
      "explain": {
        "what": "The n = 2 box computes 2 × 1 = 2 and returns 2.",
        "life": "The answers travel back down the chain, one person at a time."
      }
    },
    {
      "line": 8,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "?"
          },
          "status": "waiting"
        },
        {
          "name": "factorial(3)",
          "vars": {
            "n": "3"
          },
          "status": "returning",
          "returns": "3 × 2 = 6"
        }
      ],
      "output": "",
      "kind": "return",
      "explain": {
        "what": "The n = 3 box computes 3 × 2 = 6 and returns 6.",
        "life": "The first person finally gets the full answer."
      }
    },
    {
      "line": 12,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "6"
          },
          "status": "running"
        }
      ],
      "output": "",
      "kind": "assign",
      "detail": {
        "targets": [
          "result"
        ]
      },
      "explain": {
        "what": "The answer 6 is stored in result. All the extra boxes are gone.",
        "life": "You write the final answer on your own paper and throw the scratch sheets away."
      }
    },
    {
      "line": 13,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "6"
          },
          "status": "running"
        }
      ],
      "output": "6\n",
      "kind": "print",
      "explain": {
        "what": "cout << result << endl shows 6 on the screen.",
        "life": "Like reading your answer out loud."
      }
    },
    {
      "line": 14,
      "frames": [
        {
          "name": "main()",
          "vars": {
            "result": "6"
          },
          "status": "returning",
          "returns": "returns 0"
        }
      ],
      "output": "6\n",
      "kind": "return",
      "explain": {
        "what": "main() returns 0, which tells the computer the program finished without problems.",
        "life": "Like signing off a letter: the job is done."
      }
    }
  ],
};
