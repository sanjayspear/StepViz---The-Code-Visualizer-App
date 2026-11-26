// Practice, Java: Recursion & backtracking (Q191-Q215). Tests come from the Python content;
// reference solutions in tests/practice/java/recursion-backtracking.solutions.ts.
import { fromPython } from '../javascript/shared';
import { RECURSION_BACKTRACKING } from '../python/recursion-backtracking';
import { javaStarter, one } from './shared';
import { jsTests } from '../javascript/shared';
import type { PracticeTest } from '../types';

/**
 * Q214 in Java: StepViz's Java interpreter runs each line itself, so the hard puzzles of the other
 * languages take far longer than the time limit; Java uses the same solutions with fewer blanks
 * (each checked to have exactly one solution).
 */
const grid = (rows: string[]) => rows.map((r) => r.split(''));
const EASY_1 = ['534..8...', '.7..9.348', '1.8342567', '.59.6142.', '..68..791', '7.392.8..', '9.15.7.84', '2.74..6.5', '.45.86179'];
const EASY_2 = ['519....32', '78...2.1.', '...13..75', '...9.62..', '..4.175..', '.9.5...6.', '975863124', '832......', '6..2.5983'];
const q214: PracticeTest[] = jsTests(RECURSION_BACKTRACKING.find((c) => c.id === 214)!.tests).map((t, i) =>
  i === 0 ? { ...t, args: [grid(EASY_1)] } : i === 3 ? { ...t, args: [grid(EASY_2)] } : t,
);

const UTIL = 'import java.util.*;';
const LOOPS = ['for', 'while', 'do', 'forEach', 'stream', 'IntStream', 'repeat', 'fill', 'join'];
const NO_LOOPS = { names: LOOPS, why: 'This question asks you to use recursion, with no loops.' };
const call = (header: string, comment: string, expr: string) => one(header, comment, `System.out.println(${expr});`, UTIL);

export const RECURSION_BACKTRACKING_JAVA = fromPython(RECURSION_BACKTRACKING, {
  191: {
    example: 'Example: printNumbers(3) prints 1, 2 and 3, each on its own line.',
    starter: one('void printNumbers(int n)', 'Print 1 to n, one number per line, using recursion and no loops.', 'System.out.println("Counting to 5:");\nprintNumbers(5);'),
    hint: 'printNumbers(n) can first call printNumbers(n - 1) to print 1 to n - 1, then print n with System.out.println. Stop when n is 0 (print nothing). Like a line of dominoes: each one waits for the one before it to fall first.',
    forbid: NO_LOOPS,
  },
  192: {
    example: 'Example: arraySum(new int[] {1, 2, 3, 4}) returns 10.',
    starter: javaStarter(
      [
        ['int arraySum(int[] nums)', 'The sum of nums, using recursion (no loops).\nTip: let it call a helper sumFrom(nums, 0).'],
        ['int sumFrom(int[] nums, int i)', 'The sum of nums[i], nums[i + 1], ... to the end.'],
      ],
      'System.out.println(arraySum(new int[] {1, 2, 3, 4}));',
    ),
    hint: 'The sum from position i is nums[i] plus the sum from position i + 1; from the end of the array it is 0. arraySum just asks for the sum from 0. Like counting money in a pile: take one note, then ask a friend to count the rest of the pile.',
    forbid: { names: [...LOOPS, 'sum'], why: 'This question asks you to use recursion, with no loops.' },
  },
  193: {
    example: 'Example: reverseString("hello") returns "olleh".',
    starter: one('String reverseString(String s)', 's backwards, using recursion (no loops or reverse()).', 'System.out.println(reverseString("hello"));'),
    hint: 'The reverse of s is the reverse of s.substring(1) followed by s.charAt(0). An empty text is its own reverse. Like taking cards off the top of a deck and putting them in a new pile: the order flips.',
    forbid: { names: [...LOOPS, 'reverse'], why: 'This question asks you to use recursion, with no loops or reverse().' },
  },
  194: {
    example: 'Example: isPalindromeRec("racecar") returns true.',
    starter: one('boolean isPalindromeRec(String s)', 'true if s reads the same both ways, using recursion (no loops or reverse()).', 'System.out.println(isPalindromeRec("racecar"));'),
    hint: 'Compare the first and last letters: if they differ, the answer is false; otherwise check the middle part s.substring(1, s.length() - 1) the same way. Texts of length 0 or 1 are palindromes. Like peeling an onion from both sides at once, layer by layer.',
    forbid: { names: [...LOOPS, 'reverse'], why: 'This question asks you to use recursion, with no loops or reverse().' },
  },
  195: {
    example: 'Example: power(2, 10) returns 1024.',
    starter: one('long power(long x, int n)', 'x to the power n (n is a whole number, 0 or more), using recursion (no loops or Math.pow()).', 'System.out.println(power(2, 10));'),
    hint: 'x to the n is x × x to the n - 1, and anything to the power 0 is 1. Faster: work out half = power(x, n / 2) once, then answer half × half (times x again if n is odd). Like folding paper: each fold doubles the layers, so you need far fewer steps than counting one by one.',
    forbid: { names: [...LOOPS, 'pow'], why: 'This question asks you to use recursion, with no loops or Math.pow().' },
  },
  196: {
    example: 'Example: countPaths(3, 7) returns 28.',
    starter: one(
      'int countPaths(int m, int n)',
      'A grid of m rows and n columns. How many paths go from the top-left to the bottom-right\ncell, moving only right or down?',
      'System.out.println(countPaths(3, 7));',
    ),
  },
  197: {
    example: 'Example: floodFill(new int[][] {{1, 1, 1}, {1, 1, 0}, {1, 0, 1}}, 1, 1, 2) returns [[2, 2, 2], [2, 2, 0], [2, 0, 1]].',
    starter: one(
      'int[][] floodFill(int[][] image, int sr, int sc, int color)',
      'Recolour the cell (sr, sc) and every cell of the same colour joined to it up, down,\nleft or right, with color. Return the image.',
      'System.out.println(Arrays.deepToString(floodFill(new int[][] {{1, 1, 1}, {1, 1, 0}, {1, 0, 1}}, 1, 1, 2)));',
      UTIL,
    ),
  },
  198: {
    example: 'Example: hanoi(2, "A", "C", "B") prints the 3 moves that take 2 disks from A to C.',
    starter: one(
      'void hanoi(int n, String source, String target, String spare)',
      'Print the moves that take n disks from source to target, one line per move,\nlike: Move disk 1 from A to C',
      'System.out.println("Moves for 3 disks:");\nhanoi(3, "A", "C", "B");',
    ),
  },
  199: {
    example: 'Example: subsets(new int[] {1, 2}) returns [[], [1], [2], [1, 2]] (in any order).',
    starter: call('List<List<Integer>> subsets(int[] nums)', 'Every subset of nums (all values are different), in any order.', 'subsets(new int[] {1, 2, 3})'),
  },
  200: {
    example: 'Example: subsetsWithDup(new int[] {1, 2, 2}) returns [[], [1], [2], [1, 2], [2, 2], [1, 2, 2]] (in any order).',
    starter: call('List<List<Integer>> subsetsWithDup(int[] nums)', 'Every different subset of nums (which may have repeated values), in any order.', 'subsetsWithDup(new int[] {1, 2, 2})'),
  },
  201: {
    example: 'Example: permutations(new int[] {1, 2}) returns [[1, 2], [2, 1]] (in any order).',
    starter: call('List<List<Integer>> permutations(int[] nums)', 'Every ordering of nums (all values are different), in any order.', 'permutations(new int[] {1, 2, 3})'),
    forbid: null,
  },
  202: {
    example: 'Example: uniquePermutations(new int[] {1, 1, 2}) returns [[1, 1, 2], [1, 2, 1], [2, 1, 1]] (in any order).',
    starter: call('List<List<Integer>> uniquePermutations(int[] nums)', 'Every different ordering of nums (which may have repeated values), in any order.', 'uniquePermutations(new int[] {1, 1, 2})'),
    forbid: null,
  },
  203: {
    example: 'Example: combine(4, 2) returns [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]] (in any order).',
    starter: call('List<List<Integer>> combine(int n, int k)', 'Every group of k different numbers chosen from 1 to n, in any order.', 'combine(4, 2)'),
    forbid: null,
  },
  204: {
    example: 'Example: combinationSum(new int[] {2, 3, 6, 7}, 7) returns [[2, 2, 3], [7]] (in any order).',
    starter: call(
      'List<List<Integer>> combinationSum(int[] candidates, int target)',
      'Every different group of candidates (each may be used again and again) that adds up to target.\ncandidates are different positive numbers.',
      'combinationSum(new int[] {2, 3, 6, 7}, 7)',
    ),
  },
  205: {
    example: 'Example: combinationSumOnce(new int[] {10, 1, 2, 7, 6, 1, 5}, 8) returns [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] (in any order).',
    starter: call('List<List<Integer>> combinationSumOnce(int[] candidates, int target)', 'Every different group adding up to target, using each position at most once.', 'combinationSumOnce(new int[] {10, 1, 2, 7, 6, 1, 5}, 8)'),
  },
  206: {
    example: 'Example: letterCombinations("23") returns [ad, ae, af, bd, be, bf, cd, ce, cf] (in any order).',
    starter: call(
      'List<String> letterCombinations(String digits)',
      'Phone keys: 2 abc, 3 def, 4 ghi, 5 jkl, 6 mno, 7 pqrs, 8 tuv, 9 wxyz.\nEvery text the digits could spell (an empty list for no digits).',
      'letterCombinations("23")',
    ),
    hint: 'Keep a String[] from digit to letters (place 2 holds "abc", and so on). A helper takes the position and the text so far: at the end, record the text; otherwise try each letter of the next digit. Like an old phone keypad where each key could mean several letters.',
  },
  207: {
    example: 'Example: generateParentheses(2) returns [(()), ()()] (in any order).',
    starter: call('List<String> generateParentheses(int n)', 'Every correctly matched text made of n "(" and n ")".', 'generateParentheses(3)'),
  },
  208: {
    example: 'Example: palindromePartitions("aab") returns [[a, a, b], [aa, b]] (in any order).',
    starter: call('List<List<String>> palindromePartitions(String s)', 'Every way to cut s into parts (in order) where every part is a palindrome.', 'palindromePartitions("aab")'),
    hint: 'From position start, try every end: if s.substring(start, end) is a palindrome, add it and carry on from end, then remove it again. When start reaches the end of s, record a copy of the parts. Like cutting a ribbon so every piece has a mirrored pattern.',
  },
  209: {
    example: 'Example: wordExists(board, "ABCCED") returns true for the board ABCE / SFCS / ADEE.',
    starter: one(
      'boolean wordExists(char[][] board, String word)',
      'true if word can be traced in the grid by moving up, down, left or right,\nnever using the same cell twice.',
      'char[][] board = {"ABCE".toCharArray(), "SFCS".toCharArray(), "ADEE".toCharArray()};\nSystem.out.println(wordExists(board, "ABCCED"));',
    ),
  },
  210: {
    example: 'Example: ratPaths(new int[][] {{1, 1}, {1, 1}}) returns [DR, RD] (in any order).',
    starter: call(
      'List<String> ratPaths(int[][] maze)',
      'maze is n by n: 1 is open, 0 is blocked. Every path from the top-left to the bottom-right\ncell, as text of moves D, L, R, U (down, left, right, up), never visiting a cell twice.',
      'ratPaths(new int[][] {{1, 0, 0, 0}, {1, 1, 0, 1}, {1, 1, 0, 0}, {0, 1, 1, 1}})',
    ),
  },
  211: {
    example: 'Example: restoreIp("25525511135") returns [255.255.11.135, 255.255.111.35] (in any order).',
    starter: call(
      'List<String> restoreIp(String s)',
      'Every valid IP address made by putting three dots into s: four parts, each 0-255,\nwith no leading zero (but "0" itself is fine).',
      'restoreIp("25525511135")',
    ),
  },
  212: {
    example: 'Example: grayCode(2) returns [0, 1, 3, 2] (other valid orders are fine).',
    starter: call('List<Integer> grayCode(int n)', 'The 2^n numbers 0 to 2^n - 1, starting with 0, where neighbours differ in exactly one bit.', 'grayCode(2)'),
    hint: 'Build it from the code for n - 1: the code for n - 1, then the same list backwards with the new top bit (1 << (n - 1)) added to each. The code for 0 bits is [0]. Like a mirror: the second half reflects the first, with one switch flipped.',
  },
  213: {
    example: 'Example: solveNQueens(4) returns [[.Q.., ...Q, Q..., ..Q.], [..Q., Q..., ...Q, .Q..]] (in any order).',
    starter: call(
      'List<List<String>> solveNQueens(int n)',
      'Every way to place n queens on an n x n board so no two share a row, column or diagonal.\nEach board is a list of rows like ".Q..".',
      'solveNQueens(4)',
    ),
  },
  214: {
    example: "Example: solveSudoku(board) fills every '.' in board so each row, column and 3x3 box has 1-9.",
    starter: one(
      'void solveSudoku(char[][] board)',
      "board is 9 rows of 9 characters: '1'-'9' or '.' for an empty cell.\nFill board itself (return nothing). The puzzle has exactly one solution.",
      'String[] rows = {"534..8...", ".7..9.348", "1.8342567", ".59.6142.", "..68..791", "7.392.8..", "9.15.7.84", "2.74..6.5", ".45.86179"};\nchar[][] board = new char[9][];\nfor (int r = 0; r < 9; r++) board[r] = rows[r].toCharArray();\nsolveSudoku(board);\nSystem.out.println(new String(board[0]));',
    ),
    tests: q214,
  },
  215: {
    example: 'Example: wordBreakAll("catsanddog", new String[] {"cat", "cats", "and", "sand", "dog"}) returns [cats and dog, cat sand dog] (in any order).',
    starter: call(
      'List<String> wordBreakAll(String s, String[] words)',
      'Every way to split s into words from the list, as sentences with single spaces.',
      'wordBreakAll("catsanddog", new String[] {"cat", "cats", "and", "sand", "dog"})',
    ),
    hint: 'For a starting position, try every word that s continues with (s.startsWith(word, start)); for each, find all the sentences for the rest and put the word in front. Remember the answers for each position in a HashMap so you never work one out twice. Like reading a text with the spaces removed and trying each way to place the first space.',
  },
});
