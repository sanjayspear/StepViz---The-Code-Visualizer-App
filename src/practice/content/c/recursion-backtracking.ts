// Practice, C: the questions of recursion-backtracking that fit C. Tests come from the Python content; reference
// solutions in tests/practice/c/recursion-backtracking.solutions.ts. Not in C (they give back lists or text, or need maps
// or classes): Q193, Q197, Q199, Q200, Q201, Q202, Q203, Q204, Q205, Q206, Q207, Q208, Q209, Q210, Q211, Q212, Q213, Q214, Q215.
import { fromPython } from '../javascript/shared';
import { RECURSION_BACKTRACKING } from '../python/recursion-backtracking';
import { cStarter } from './shared';

export const RECURSION_BACKTRACKING_C = fromPython(
  RECURSION_BACKTRACKING,
  {
  191: {
    example: "Example: printNumbers(3) prints 1, 2 and 3, one per line.",
    starter: cStarter([["void printNumbers(int n)", "Print 1 to n, one number per line, using recursion and no loops."]], "printf(\"Counting to 5:\\n\");\nprintNumbers(5);", [], ''),
    hint: "printNumbers(n) can first call printNumbers(n - 1) to print 1 to n - 1, then print n. Stop when n is 0 (print nothing). Like a line of dominoes: each one waits for the one before it to fall first.",
    forbid: {"names": ["for", "while", "do", "goto"], "why": "This question asks you to use recursion, with no loops."},
  },
  192: {
    example: "Example: arraySum({1, 2, 3, 4}) returns 10.",
    starter: cStarter([["int arraySum(int nums[], int n)", "The sum of nums: let it call sumFrom(nums, 0)."]], "int nums[] = {1, 2, 3, 4};\nprintf(\"%d\\n\", arraySum(nums, 4));", [], ''),
    hint: "The sum of the first n numbers is nums[n - 1] plus the sum of the first n - 1 numbers; the sum of 0 numbers is 0. So arraySum can call itself with n - 1. Like counting money in a pile: take one note, then ask a friend to count the rest of the pile.",
    forbid: {"names": ["for", "while", "do", "goto"], "why": "This question asks you to use recursion, with no loops."},
  },
  194: {
    example: "Example: isPalindromeRec(\"racecar\") returns true.",
    starter: cStarter([["bool isPalindromeRec(char s[])", "true if s reads the same both ways, using recursion (no loops).\nTip: let it call a helper that looks at the letters between two positions."]], "printf(\"%s\\n\", isPalindromeRec(\"racecar\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "Write a helper isPalBetween(s, i, j): if i >= j, the answer is true; if s[i] != s[j], it is false; otherwise ask isPalBetween(s, i + 1, j - 1). isPalindromeRec(s) asks the helper about 0 and strlen(s) - 1. Like peeling an onion from both sides at once, layer by layer.",
    forbid: {"names": ["for", "while", "do", "goto"], "why": "This question asks you to use recursion, with no loops."},
  },
  195: {
    example: "Example: power(2, 10) returns 1024.",
    starter: cStarter([["long long power(long long x, int n)", "x to the power n (n is a whole number, 0 or more), using recursion (no loops or pow())."]], "printf(\"%lld\\n\", power(2, 10));", [], ''),
    hint: "x to the n is x \u00d7 x to the n - 1, and anything to the power 0 is 1. Faster: work out half = power(x, n / 2) once, then answer half \u00d7 half (times x again if n is odd). Like folding paper: each fold doubles the layers, so you need far fewer steps than counting one by one.",
    forbid: {"names": ["for", "while", "do", "goto", "pow"], "why": "This question asks you to use recursion, with no loops or pow()."},
  },
  196: {
    example: "Example: countPaths(3, 7) returns 28.",
    starter: cStarter([["int countPaths(int m, int n)", "A grid of m rows and n columns. How many paths go from the top-left to the bottom-right\ncell, moving only right or down?"]], "printf(\"%d\\n\", countPaths(3, 7));", [], ''),
    hint: "The paths to a cell are the paths to the cell above it plus the paths to the cell on its left; cells in the top row or left column have exactly 1. Remember answers you have already worked out so you do not repeat them. Like counting the ways to walk through a city of one-way streets going only east or south.",
  },
  198: {
    example: "Example: hanoi(2, \"A\", \"C\", \"B\") prints the 3 moves that take 2 disks from A to C.",
    starter: cStarter([["void hanoi(int n, char source[], char target[], char spare[])", "Print the moves that take n disks from source to target, one line per move,\nlike: Move disk 1 from A to C"]], "printf(\"Moves for 3 disks:\\n\");\nhanoi(3, \"A\", \"C\", \"B\");", ["string.h"], ''),
  },
  },
  { partial: true },
);
