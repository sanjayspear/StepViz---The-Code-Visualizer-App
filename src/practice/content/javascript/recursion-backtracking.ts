// Practice, JavaScript: recursion-backtracking. Tests come from the Python content; reference solutions in tests/practice/js/recursion-backtracking.solutions.ts.
import { fromPython } from './shared';

const LOOPS = ['for', 'while', 'do', 'forEach', 'map', 'reduce', 'reduceRight', 'filter', 'every', 'some', 'from', 'join', 'repeat', 'fill', 'keys'];
const NO_LOOPS = { names: LOOPS, why: 'This question asks you to use recursion, with no loops (and no forEach, map, reduce or join).' };
import { RECURSION_BACKTRACKING } from '../python/recursion-backtracking';

export const RECURSION_BACKTRACKING_JS = fromPython(RECURSION_BACKTRACKING, {
  191: {
    example: 'Example: printNumbers(3) prints 1, 2 and 3, each on its own line.',
    starter: `function printNumbers(n) {
  // Print 1 to n, one number per line, using recursion and no loops.
}

console.log("Counting to 5:");
printNumbers(5);
`,
    forbid: NO_LOOPS,
    hint: "printNumbers(n) can first call printNumbers(n - 1) to print 1 to n - 1, then print n with console.log. Stop when n is 0 (print nothing). Like a line of dominoes: each one waits for the one before it to fall first.",
  },
  192: {
    example: 'Example: arraySum([1, 2, 3, 4]) returns 10.',
    starter: `function arraySum(nums) {
  // The sum of nums, using recursion (no loops, no sum()).
}

console.log(arraySum([1, 2, 3, 4]));
`,
    hint: "The sum of an array is its first number plus the sum of the rest (nums.slice(1)). The sum of an empty array is 0. Like counting money in a pile: take one note, then ask a friend to count the rest of the pile.",
    forbid: { names: [...LOOPS, 'sum'], why: 'This question asks you to use recursion, with no loops (and no forEach, map or reduce).' },
  },
  193: {
    example: 'Example: reverseString("hello") returns "olleh".',
    starter: `function reverseString(s) {
  // s backwards, using recursion (no loops or reverse()).
}

console.log(reverseString("hello"));
`,
    hint: "The reverse of s is the reverse of s.slice(1) followed by s[0]. An empty text is its own reverse. Like taking cards off the top of a deck and putting them in a new pile: the order flips.",
    forbid: { names: [...LOOPS, 'reverse', 'toReversed'], why: 'This question asks you to use recursion, with no loops or reverse().' },
  },
  194: {
    example: 'Example: isPalindromeRec("racecar") returns true.',
    starter: `function isPalindromeRec(s) {
  // true if s reads the same both ways, using recursion (no loops or reverse()).
}

console.log(isPalindromeRec("racecar"));
`,
    hint: "Compare the first and last letters: if they differ, the answer is false; otherwise check the middle part s.slice(1, -1) the same way. Texts of length 0 or 1 are palindromes. Like peeling an onion from both sides at once, layer by layer.",
    forbid: { names: [...LOOPS, 'reverse', 'toReversed'], why: 'This question asks you to use recursion, with no loops or reverse().' },
  },
  195: {
    example: 'Example: power(2, 10) returns 1024.',
    starter: `function power(x, n) {
  // x to the power n (n is a whole number, 0 or more), using recursion (no loops, ** or Math.pow()).
}

console.log(power(2, 10));
`,
    hint: "x to the n is x \u00d7 x to the n - 1, and anything to the power 0 is 1. Faster: work out half = power(x, Math.floor(n / 2)) once, then answer half \u00d7 half (times x again if n is odd). Like folding paper: each fold doubles the layers, so you need far fewer steps than counting one by one.",
    forbid: { names: [...LOOPS, 'pow'], ops: ['**', '**='], why: 'This question asks you to use recursion, with no loops, ** or Math.pow().' },
  },
  196: {
    example: 'Example: countPaths(3, 7) returns 28.',
    starter: `function countPaths(m, n) {
  // A grid of m rows and n columns. How many paths go from the top-left to the
  // bottom-right cell, moving only right or down?
}

console.log(countPaths(3, 7));
`,
  },
  197: {
    example: 'Example: floodFill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2) returns [[2, 2, 2], [2, 2, 0], [2, 0, 1]].',
    starter: `function floodFill(image, sr, sc, color) {
  // Recolour the cell (sr, sc) and every cell of the same colour joined to it up, down,
  // left or right, with color. Return the image.
}

console.log(floodFill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2));
`,
  },
  198: {
    example: 'Example: hanoi(2, "A", "C", "B") prints the 3 moves that take 2 disks from A to C.',
    starter: `function hanoi(n, source, target, spare) {
  // Print the moves that take n disks from source to target, one line per move,
  // like: Move disk 1 from A to C
}

console.log("Moves for 3 disks:");
hanoi(3, "A", "C", "B");
`,
  },
  199: {
    example: 'Example: subsets([1, 2]) returns [[], [1], [2], [1, 2]] (in any order).',
    starter: `function subsets(nums) {
  // Every subset of nums (all values are different), in any order.
}

console.log(subsets([1, 2, 3]));
`,
  },
  200: {
    example: 'Example: subsetsWithDup([1, 2, 2]) returns [[], [1], [2], [1, 2], [2, 2], [1, 2, 2]] (in any order).',
    starter: `function subsetsWithDup(nums) {
  // Every different subset of nums (which may have repeated values), in any order.
}

console.log(subsetsWithDup([1, 2, 2]));
`,
  },
  201: {
    example: 'Example: permutations([1, 2]) returns [[1, 2], [2, 1]] (in any order).',
    starter: `function permutations(nums) {
  // Every ordering of nums (all values are different), in any order.
}

console.log(permutations([1, 2, 3]));
`,
    forbid: null,
  },
  202: {
    example: 'Example: uniquePermutations([1, 1, 2]) returns [[1, 1, 2], [1, 2, 1], [2, 1, 1]] (in any order).',
    starter: `function uniquePermutations(nums) {
  // Every different ordering of nums (which may have repeated values), in any order.
}

console.log(uniquePermutations([1, 1, 2]));
`,
    forbid: null,
  },
  203: {
    example: 'Example: combine(4, 2) returns [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]] (in any order).',
    starter: `function combine(n, k) {
  // Every group of k different numbers chosen from 1 to n, in any order.
}

console.log(combine(4, 2));
`,
    forbid: null,
  },
  204: {
    example: 'Example: combinationSum([2, 3, 6, 7], 7) returns [[2, 2, 3], [7]] (in any order).',
    starter: `function combinationSum(candidates, target) {
  // Every different group of candidates (each may be used again and again) that adds up to target.
  // candidates are different positive numbers.
}

console.log(combinationSum([2, 3, 6, 7], 7));
`,
  },
  205: {
    example: 'Example: combinationSumOnce([10, 1, 2, 7, 6, 1, 5], 8) returns [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] (in any order).',
    starter: `function combinationSumOnce(candidates, target) {
  // Every different group adding up to target, using each position at most once.
}

console.log(combinationSumOnce([10, 1, 2, 7, 6, 1, 5], 8));
`,
  },
  206: {
    example: 'Example: letterCombinations("23") returns ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"] (in any order).',
    starter: `function letterCombinations(digits) {
  // Phone keys: 2 abc, 3 def, 4 ghi, 5 jkl, 6 mno, 7 pqrs, 8 tuv, 9 wxyz.
  // Every text the digits could spell ([] for no digits).
}

console.log(letterCombinations("23"));
`,
    hint: "Keep an object from digit to letters ({ 2: \"abc\", ... }). A helper takes the position and the text so far: at the end, record the text; otherwise try each letter of the next digit. Like an old phone keypad where each key could mean several letters.",
  },
  207: {
    example: 'Example: generateParentheses(2) returns ["(())", "()()"] (in any order).',
    starter: `function generateParentheses(n) {
  // Every correctly matched text made of n "(" and n ")".
}

console.log(generateParentheses(3));
`,
  },
  208: {
    example: 'Example: palindromePartitions("aab") returns [["a", "a", "b"], ["aa", "b"]] (in any order).',
    starter: `function palindromePartitions(s) {
  // Every way to cut s into parts (in order) where every part is a palindrome.
}

console.log(palindromePartitions("aab"));
`,
    hint: "From position start, try every end: if s.slice(start, end) is a palindrome, add it and carry on from end. When start reaches the end of s, record the parts. Like cutting a ribbon so every piece has a mirrored pattern.",
  },
  209: {
    example: 'Example: wordExists([[..."ABCE"], [..."SFCS"], [..."ADEE"]], "ABCCED") returns true.',
    starter: `function wordExists(board, word) {
  // true if word can be traced in the grid by moving up, down, left or right,
  // never using the same cell twice.
}

console.log(wordExists([[..."ABCE"], [..."SFCS"], [..."ADEE"]], "ABCCED"));
`,
  },
  210: {
    example: 'Example: ratPaths([[1, 1], [1, 1]]) returns ["DR", "RD"] (in any order).',
    starter: `function ratPaths(maze) {
  // maze is n by n: 1 is open, 0 is blocked. Every path from the top-left to the bottom-right
  // cell, as text of moves D, L, R, U (down, left, right, up), never visiting a cell twice.
}

console.log(ratPaths([[1, 0, 0, 0], [1, 1, 0, 1], [1, 1, 0, 0], [0, 1, 1, 1]]));
`,
  },
  211: {
    example: 'Example: restoreIp("25525511135") returns ["255.255.11.135", "255.255.111.35"] (in any order).',
    starter: `function restoreIp(s) {
  // Every valid IP address made by putting three dots into s: four parts, each 0-255,
  // with no leading zero (but "0" itself is fine).
}

console.log(restoreIp("25525511135"));
`,
  },
  212: {
    example: 'Example: grayCode(2) returns [0, 1, 3, 2] (other valid orders are fine).',
    starter: `function grayCode(n) {
  // The 2**n numbers 0 to 2**n - 1, starting with 0, where neighbours differ in exactly one bit.
}

console.log(grayCode(2));
`,
    hint: "Build it from the code for n - 1: the code for n - 1, then the same array backwards with the new top bit (2 ** (n - 1)) added to each. The code for 0 bits is [0]. Like a mirror: the second half reflects the first, with one switch flipped.",
  },
  213: {
    example: 'Example: solveNQueens(4) returns [[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]] (in any order).',
    starter: `function solveNQueens(n) {
  // Every way to place n queens on an n x n board so no two share a row, column or diagonal.
  // Each board is a array of rows like ".Q..".
}

console.log(solveNQueens(4));
`,
  },
  214: {
    example: 'Example: solveSudoku(board) fills every "." in board so each row, column and 3x3 box has 1-9.',
    starter: `function solveSudoku(board) {
  // board is 9 arrays of 9 characters: "1"-"9" or "." for an empty cell.
  // Fill board itself (return nothing). The puzzle has exactly one solution.
}

const board = ["53..7....", "6..195...", ".98....6.", "8...6...3", "4..8.3..1", "7...2...6", ".6....28.", "...419..5", "....8..79"].map((row) => [...row]);
solveSudoku(board);
console.log(board[0]);
`,
  },
  215: {
    example: 'Example: wordBreakAll("catsanddog", ["cat", "cats", "and", "sand", "dog"]) returns ["cats and dog", "cat sand dog"] (in any order).',
    starter: `function wordBreakAll(s, words) {
  // Every way to split s into words from the array, as sentences with single spaces.
}

console.log(wordBreakAll("catsanddog", ["cat", "cats", "and", "sand", "dog"]));
`,
  },
});
