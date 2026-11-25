// Built-in example "Bubble sort" (Screen 3, loops and lists view).
// Frames, lines, output and list data were recorded by the live tracer (tests
// check they still match); explanations, kicker labels, the top bar note and the
// card labels are hand-written. Step 5 uses the Screen 3 screenshot text. Texts
// are final copy. Generated once; edit the texts here directly.
import type { Trace } from '../trace/types';
import { EXAMPLES } from './index';

export const BUBBLE_SORT_TRACE: Trace = {
  language: 'python',
  source: EXAMPLES.find((e) => e.id === 'bubble-sort')!.source,
  listView: {
    "list": "nums",
    "outerLine": 2,
    "outerEndLine": 5,
    "loopVars": [
      "i",
      "j"
    ],
    "note": "Loops view: i = outer pass, j = position being compared",
    "varLabels": {
      "i": "i (pass)",
      "j": "j (comparing)"
    }
  },
  steps: [
    {
      "line": 1,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[5, 2, 8, 1]",
            "i": "?",
            "j": "?"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "5",
          "2",
          "8",
          "1"
        ]
      },
      "explain": {
        "what": "We make a list called nums with four numbers: 5, 2, 8 and 1. They are not in order yet.",
        "life": "Like four kids standing in a line in any order, waiting to be sorted by height."
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[5, 2, 8, 1]",
            "i": "0",
            "j": "?"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "5",
          "2",
          "8",
          "1"
        ]
      },
      "explain": {
        "what": "The outer loop starts pass 1, so i is 0. In each pass we walk along the list once.",
        "life": "Like a teacher starting the first walk down the line of kids.",
        "label": "Pass 1"
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[5, 2, 8, 1]",
            "i": "0",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "5",
          "2",
          "8",
          "1"
        ]
      },
      "explain": {
        "what": "The inner loop starts. j is 0, so we look at the numbers at index 0 and index 1.",
        "life": "Like the teacher stopping at the first two kids in the line.",
        "label": "Pass 1"
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[5, 2, 8, 1]",
            "i": "0",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "5",
          "2",
          "8",
          "1"
        ],
        "compare": [
          0,
          1
        ]
      },
      "explain": {
        "what": "Is 5 bigger than 2? Yes, so these two are in the wrong order.",
        "life": "Like noticing a taller kid standing in front of a shorter one.",
        "label": "Pass 1, comparison 1"
      }
    },
    {
      "line": 5,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[5, 2, 8, 1]",
            "i": "0",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "5",
          "2",
          "8",
          "1"
        ],
        "compare": [
          0,
          1
        ],
        "swap": [
          0,
          1
        ]
      },
      "explain": {
        "what": "5 is bigger than 2, and 5 sits to the left. The rule says the bigger one must move right, so these two swap places.",
        "life": "Kids lining up by height. You look at two neighbours, and if the taller one is in front, you ask them to trade places. Repeat down the line until nobody needs to swap.",
        "label": "Pass 1, comparison 1"
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 8, 1]",
            "i": "0",
            "j": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "8",
          "1"
        ]
      },
      "explain": {
        "what": "j moves on to 1. Now we look at index 1 and index 2: 5 and 8.",
        "life": "Like the teacher taking one step down the line.",
        "label": "Pass 1"
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 8, 1]",
            "i": "0",
            "j": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "8",
          "1"
        ],
        "compare": [
          1,
          2
        ]
      },
      "explain": {
        "what": "Is 5 bigger than 8? No. No swap needed, the smaller one is already in front.",
        "life": "Like two kids already standing shorter-then-taller, so the teacher walks on.",
        "label": "Pass 1, comparison 2"
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 8, 1]",
            "i": "0",
            "j": "2"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "8",
          "1"
        ]
      },
      "explain": {
        "what": "j moves on to 2. Next we look at index 2 and index 3: 8 and 1.",
        "life": "Like reaching the last pair of kids at the end of the line.",
        "label": "Pass 1"
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 8, 1]",
            "i": "0",
            "j": "2"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "8",
          "1"
        ],
        "compare": [
          2,
          3
        ]
      },
      "explain": {
        "what": "Is 8 bigger than 1? Yes, so they are in the wrong order.",
        "life": "Like spotting the tallest kid standing right in front of the shortest one.",
        "label": "Pass 1, comparison 3"
      }
    },
    {
      "line": 5,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 8, 1]",
            "i": "0",
            "j": "2"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "8",
          "1"
        ],
        "compare": [
          2,
          3
        ],
        "swap": [
          2,
          3
        ]
      },
      "explain": {
        "what": "8 is bigger than 1, so they swap. 8 moves one place to the right.",
        "life": "Like the tallest kid stepping back one place so the small one can come forward.",
        "label": "Pass 1, comparison 3"
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 1, 8]",
            "i": "0",
            "j": "2"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "1",
          "8"
        ]
      },
      "explain": {
        "what": "Pass 1 is done. The biggest number, 8, has bubbled up to the end of the line.",
        "life": "Like the tallest kid reaching the back of the line, where they belong.",
        "label": "Pass 1"
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 1, 8]",
            "i": "1",
            "j": "2"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "1",
          "8"
        ]
      },
      "explain": {
        "what": "Pass 2 starts, so i is 1. This time we can stop one place earlier, because the biggest number is already in its final place.",
        "life": "Like a teacher skipping the last kid, who is already in the right spot.",
        "label": "Pass 2"
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 1, 8]",
            "i": "1",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "1",
          "8"
        ]
      },
      "explain": {
        "what": "The inner loop starts again with j = 0, so we look at index 0 and index 1: 2 and 5.",
        "life": "Like the teacher walking back to the front of the line.",
        "label": "Pass 2"
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 1, 8]",
            "i": "1",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "1",
          "8"
        ],
        "compare": [
          0,
          1
        ]
      },
      "explain": {
        "what": "Is 2 bigger than 5? No. No swap needed, the smaller one is already in front.",
        "life": "Like two friends already standing in height order, so nobody moves.",
        "label": "Pass 2, comparison 1"
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 1, 8]",
            "i": "1",
            "j": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "1",
          "8"
        ]
      },
      "explain": {
        "what": "j moves on to 1. Now we look at 5 and 1.",
        "life": "Like sliding along a bookshelf to check the next pair of books.",
        "label": "Pass 2"
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 1, 8]",
            "i": "1",
            "j": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "1",
          "8"
        ],
        "compare": [
          1,
          2
        ]
      },
      "explain": {
        "what": "Is 5 bigger than 1? Yes, so these two must swap.",
        "life": "Like finding a big book squeezed in front of a small one on the shelf.",
        "label": "Pass 2, comparison 2"
      }
    },
    {
      "line": 5,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 5, 1, 8]",
            "i": "1",
            "j": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "5",
          "1",
          "8"
        ],
        "compare": [
          1,
          2
        ],
        "swap": [
          1,
          2
        ]
      },
      "explain": {
        "what": "5 and 1 swap places. 5 moves right, next to 8.",
        "life": "Like swapping two books so the small one goes first.",
        "label": "Pass 2, comparison 2"
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 1, 5, 8]",
            "i": "1",
            "j": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "1",
          "5",
          "8"
        ]
      },
      "explain": {
        "what": "Pass 2 is done. 5 has bubbled up next to 8, and both are now in their final places.",
        "life": "Like the second-tallest kid finding their spot just in front of the tallest.",
        "label": "Pass 2"
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 1, 5, 8]",
            "i": "2",
            "j": "1"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "1",
          "5",
          "8"
        ]
      },
      "explain": {
        "what": "Pass 3 starts, so i is 2. Only the first two numbers still need checking.",
        "life": "Like tidying a room where only one corner is still messy.",
        "label": "Pass 3"
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 1, 5, 8]",
            "i": "2",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "1",
          "5",
          "8"
        ]
      },
      "explain": {
        "what": "j is 0, so we look at index 0 and index 1: 2 and 1.",
        "life": "Like looking at the first two cups in a row of cups.",
        "label": "Pass 3"
      }
    },
    {
      "line": 4,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 1, 5, 8]",
            "i": "2",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "1",
          "5",
          "8"
        ],
        "compare": [
          0,
          1
        ]
      },
      "explain": {
        "what": "Is 2 bigger than 1? Yes, so they are in the wrong order.",
        "life": "Like seeing a bigger cup placed before a smaller one.",
        "label": "Pass 3, comparison 1"
      }
    },
    {
      "line": 5,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[2, 1, 5, 8]",
            "i": "2",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "2",
          "1",
          "5",
          "8"
        ],
        "compare": [
          0,
          1
        ],
        "swap": [
          0,
          1
        ]
      },
      "explain": {
        "what": "2 and 1 swap places, so 1 moves to the front.",
        "life": "Like two kids trading places so the shortest stands at the front.",
        "label": "Pass 3, comparison 1"
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[1, 2, 5, 8]",
            "i": "2",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "1",
          "2",
          "5",
          "8"
        ]
      },
      "explain": {
        "what": "Pass 3 is done. 2 has found its place, and the list is now in order.",
        "life": "Like the last pieces of a puzzle clicking into place.",
        "label": "Pass 3"
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[1, 2, 5, 8]",
            "i": "3",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "1",
          "2",
          "5",
          "8"
        ]
      },
      "explain": {
        "what": "Pass 4 starts, so i is 3. len(nums) - i - 1 is 0, so there is nothing left to compare.",
        "life": "Like a teacher checking a line that is already perfect.",
        "label": "Pass 4"
      }
    },
    {
      "line": 3,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[1, 2, 5, 8]",
            "i": "3",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "1",
          "2",
          "5",
          "8"
        ]
      },
      "explain": {
        "what": "The inner loop has nothing to do: range(0) gives no numbers, so it is skipped.",
        "life": "Like opening an empty mailbox: there is nothing to sort.",
        "label": "Pass 4"
      }
    },
    {
      "line": 2,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[1, 2, 5, 8]",
            "i": "3",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "",
      "list": {
        "values": [
          "1",
          "2",
          "5",
          "8"
        ]
      },
      "explain": {
        "what": "All the passes are done, so the outer loop ends.",
        "life": "Like a game where every round has been played.",
        "label": "Pass 4"
      }
    },
    {
      "line": 6,
      "frames": [
        {
          "name": "Global",
          "vars": {
            "nums": "[1, 2, 5, 8]",
            "i": "3",
            "j": "0"
          },
          "status": "running"
        }
      ],
      "output": "[1, 2, 5, 8]\n",
      "list": {
        "values": [
          "1",
          "2",
          "5",
          "8"
        ]
      },
      "explain": {
        "what": "print(nums) shows the list on the screen. The list is sorted: [1, 2, 5, 8].",
        "life": "Like a class photo where everyone stands in height order."
      }
    }
  ],
};
