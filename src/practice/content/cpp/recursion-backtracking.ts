// Practice, C++: Recursion & backtracking (Q191-Q215). Tests come from the Python content;
// reference solutions in tests/practice/cpp/recursion-backtracking.solutions.ts.
import { fromPython, jsTests } from '../javascript/shared';
import { RECURSION_BACKTRACKING } from '../python/recursion-backtracking';
import type { PracticeTest } from '../types';
import { cppStarter, PRINT_INTS } from './shared';

/**
 * Q214 in C++: StepViz's C++ interpreter runs each line itself, so the hard puzzles of Python and
 * JavaScript take far longer than the time limit; C++ uses Java's boards with fewer blanks
 * (each checked to have exactly one solution).
 */
const grid = (rows: string[]) => rows.map((r) => r.split(''));
const EASY_1 = ['534..8...', '.7..9.348', '1.8342567', '.59.6142.', '..68..791', '7.392.8..', '9.15.7.84', '2.74..6.5', '.45.86179'];
const EASY_2 = ['519....32', '78...2.1.', '...13..75', '...9.62..', '..4.175..', '.9.5...6.', '975863124', '832......', '6..2.5983'];
const q214: PracticeTest[] = jsTests(RECURSION_BACKTRACKING.find((c) => c.id === 214)!.tests).map((t, i) =>
  i === 0 ? { ...t, args: [grid(EASY_1)] } : i === 3 ? { ...t, args: [grid(EASY_2)] } : t,
);

const LOOPS = ['for', 'while', 'do', 'goto', 'for_each', 'accumulate', 'transform'];
const NO_LOOPS = { names: LOOPS, why: 'This question asks you to use recursion, with no loops.' };
const PRINT_LISTS = `void printLists(const vector<vector<int>>& lists) {
    for (int i = 0; i < lists.size(); i++) {
        vector<int> row = lists[i];
        printVector(row);
    }
}`;
const PRINT_TEXTS = `void printTexts(const vector<string>& texts) {
    for (int i = 0; i < texts.size(); i++) cout << texts[i] << endl;
}`;
const HELPERS = `${PRINT_INTS}\n\n${PRINT_LISTS}\n\n${PRINT_TEXTS}`;
const fn = (header: string, comment: string, main: string) => cppStarter([[header, comment]], main, ['map'], HELPERS);
const show = (expr: string) => `cout << ${expr} << endl;`;
/** The no-loop questions get no print helpers: their for loops would break the question's own rule. */
const plain = (header: string, comment: string, main: string) => cppStarter([[header, comment]], main);

export const RECURSION_BACKTRACKING_CPP = fromPython(RECURSION_BACKTRACKING, {
  191: {
    example: 'Example: printNumbers(3) prints 1, 2 and 3, one per line.',
    starter: plain('void printNumbers(int n)', 'Print 1 to n, one number per line, using recursion and no loops.', 'cout << "Counting to 5:" << endl;\nprintNumbers(5);'),
    hint: 'printNumbers(n) can first call printNumbers(n - 1) to print 1 to n - 1, then print n. Stop when n is 0 (print nothing). Like a line of dominoes: each one waits for the one before it to fall first.',
    forbid: NO_LOOPS,
  },
  192: {
    example: 'Example: arraySum({1, 2, 3, 4}) returns 10.',
    starter: cppStarter(
      [
        ['int sumFrom(vector<int>& nums, int i)', 'The sum of nums[i], nums[i + 1], ... to the end, using recursion (no loops).'],
        ['int arraySum(vector<int>& nums)', 'The sum of nums: let it call sumFrom(nums, 0).'],
      ],
      'vector<int> nums = {1, 2, 3, 4};\ncout << arraySum(nums) << endl;',
    ),
    hint: 'The sum from position i is nums[i] plus the sum from position i + 1; from the end of the vector it is 0. arraySum just asks for the sum from 0. Like counting money in a pile: take one note, then ask a friend to count the rest of the pile.',
    forbid: NO_LOOPS,
  },
  193: {
    example: 'Example: reverseString("hello") returns "olleh".',
    starter: plain('string reverseString(string s)', 's backwards, using recursion (no loops or reverse()).', show('reverseString("hello")')),
    hint: 'The reverse of s is the reverse of s.substr(1) followed by s[0]. An empty text is its own reverse. Like taking cards off the top of a deck and putting them in a new pile: the order flips.',
    forbid: { names: [...LOOPS, 'reverse', 'rbegin', 'rend'], why: 'This question asks you to use recursion, with no loops or reverse().' },
  },
  194: {
    example: 'Example: isPalindromeRec("racecar") returns true.',
    starter: plain('bool isPalindromeRec(string s)', 'true if s reads the same both ways, using recursion (no loops or reverse()).', 'cout << boolalpha << isPalindromeRec("racecar") << endl;'),
    hint: 'Compare the first and last letters: if they differ, the answer is false; otherwise check the middle part s.substr(1, s.size() - 2) the same way. Texts of length 0 or 1 are palindromes. Like peeling an onion from both sides at once, layer by layer.',
    forbid: { names: [...LOOPS, 'reverse', 'rbegin', 'rend'], why: 'This question asks you to use recursion, with no loops or reverse().' },
  },
  195: {
    example: 'Example: power(2, 10) returns 1024.',
    starter: plain('long long power(long long x, int n)', 'x to the power n (n is a whole number, 0 or more), using recursion (no loops or pow()).', show('power(2, 10)')),
    hint: 'x to the n is x × x to the n - 1, and anything to the power 0 is 1. Faster: work out half = power(x, n / 2) once, then answer half × half (times x again if n is odd). Like folding paper: each fold doubles the layers, so you need far fewer steps than counting one by one.',
    forbid: { names: [...LOOPS, 'pow'], why: 'This question asks you to use recursion, with no loops or pow().' },
  },
  196: {
    example: 'Example: countPaths(3, 7) returns 28.',
    starter: fn(
      'int countPaths(int m, int n)',
      'A grid of m rows and n columns. How many paths go from the top-left to the bottom-right\ncell, moving only right or down?',
      show('countPaths(3, 7)'),
    ),
  },
  197: {
    example: 'Example: floodFill({{1, 1, 1}, {1, 1, 0}, {1, 0, 1}}, 1, 1, 2) returns [[2, 2, 2], [2, 2, 0], [2, 0, 1]].',
    starter: fn(
      'vector<vector<int>> floodFill(vector<vector<int>> image, int sr, int sc, int color)',
      'Recolour the cell (sr, sc) and every cell of the same colour joined to it up, down,\nleft or right, with color. Return the image.',
      'vector<vector<int>> image = {{1, 1, 1}, {1, 1, 0}, {1, 0, 1}};\nvector<vector<int>> r = floodFill(image, 1, 1, 2);\nprintLists(r);',
    ),
  },
  198: {
    example: 'Example: hanoi(2, "A", "C", "B") prints the 3 moves that take 2 disks from A to C.',
    starter: fn(
      'void hanoi(int n, string source, string target, string spare)',
      'Print the moves that take n disks from source to target, one line per move,\nlike: Move disk 1 from A to C',
      'cout << "Moves for 3 disks:" << endl;\nhanoi(3, "A", "C", "B");',
    ),
  },
  199: {
    example: 'Example: subsets({1, 2}) returns [[], [1], [2], [1, 2]] (in any order).',
    starter: fn('vector<vector<int>> subsets(vector<int>& nums)', 'Every subset of nums (all values are different), in any order.', 'vector<int> nums = {1, 2, 3};\nvector<vector<int>> r = subsets(nums);\nprintLists(r);'),
  },
  200: {
    example: 'Example: subsetsWithDup({1, 2, 2}) returns [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]] (in any order).',
    starter: fn('vector<vector<int>> subsetsWithDup(vector<int>& nums)', 'Every different subset of nums (which may have repeated values), in any order.', 'vector<int> nums = {1, 2, 2};\nvector<vector<int>> r = subsetsWithDup(nums);\nprintLists(r);'),
  },
  201: {
    example: 'Example: permutations({1, 2, 3}) returns all 6 orderings (in any order).',
    starter: fn('vector<vector<int>> permutations(vector<int>& nums)', 'Every ordering of nums (all values are different), in any order.', 'vector<int> nums = {1, 2, 3};\nvector<vector<int>> r = permutations(nums);\nprintLists(r);'),
    forbid: { names: ['next_permutation', 'prev_permutation'], why: 'This question asks you to build the orderings yourself, without next_permutation().' },
  },
  202: {
    example: 'Example: uniquePermutations({1, 1, 2}) returns [[1, 1, 2], [1, 2, 1], [2, 1, 1]] (in any order).',
    starter: fn('vector<vector<int>> uniquePermutations(vector<int>& nums)', 'Every different ordering of nums (which may have repeated values), in any order.', 'vector<int> nums = {1, 1, 2};\nvector<vector<int>> r = uniquePermutations(nums);\nprintLists(r);'),
    forbid: { names: ['next_permutation', 'prev_permutation'], why: 'This question asks you to build the orderings yourself, without next_permutation().' },
  },
  203: {
    example: 'Example: combine(4, 2) returns the 6 pairs [1, 2], [1, 3], ... [3, 4] (in any order).',
    starter: fn('vector<vector<int>> combine(int n, int k)', 'Every group of k different numbers chosen from 1 to n, in any order.', 'vector<vector<int>> r = combine(4, 2);\nprintLists(r);'),
    forbid: null,
  },
  204: {
    example: 'Example: combinationSum({2, 3, 6, 7}, 7) returns [[2, 2, 3], [7]] (in any order).',
    starter: fn(
      'vector<vector<int>> combinationSum(vector<int>& candidates, int target)',
      'Every different group of candidates (each may be used again and again) that adds up to target.\ncandidates are different positive numbers.',
      'vector<int> candidates = {2, 3, 6, 7};\nvector<vector<int>> r = combinationSum(candidates, 7);\nprintLists(r);',
    ),
  },
  205: {
    example: 'Example: combinationSumOnce({10, 1, 2, 7, 6, 1, 5}, 8) returns [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] (in any order).',
    starter: fn(
      'vector<vector<int>> combinationSumOnce(vector<int>& candidates, int target)',
      'Every different group adding up to target, using each position at most once.',
      'vector<int> candidates = {10, 1, 2, 7, 6, 1, 5};\nvector<vector<int>> r = combinationSumOnce(candidates, 8);\nprintLists(r);',
    ),
  },
  206: {
    example: 'Example: letterCombinations("23") returns [ad, ae, af, bd, be, bf, cd, ce, cf] (in any order).',
    starter: fn(
      'vector<string> letterCombinations(string digits)',
      'Phone keys: 2 abc, 3 def, 4 ghi, 5 jkl, 6 mno, 7 pqrs, 8 tuv, 9 wxyz.\nEvery text the digits could spell (an empty vector for no digits).',
      'vector<string> r = letterCombinations("23");\nprintTexts(r);',
    ),
    hint: 'Keep a vector<string> from digit to letters (place 2 holds "abc", and so on). A helper takes the position and the text so far: at the end, record the text; otherwise try each letter of the next digit. Like an old phone keypad where each key could mean several letters.',
  },
  207: {
    example: 'Example: generateParentheses(2) returns [(()), ()()] (in any order).',
    starter: fn('vector<string> generateParentheses(int n)', 'Every correctly matched text made of n "(" and n ")".', 'vector<string> r = generateParentheses(3);\nprintTexts(r);'),
  },
  208: {
    example: 'Example: palindromePartitions("aab") returns [[a, a, b], [aa, b]] (in any order).',
    starter: fn(
      'vector<vector<string>> palindromePartitions(string s)',
      'Every way to cut s into parts (in order) where every part is a palindrome.',
      'vector<vector<string>> r = palindromePartitions("aab");\nfor (int i = 0; i < r.size(); i++) {\n    vector<string> parts = r[i];\n    for (string p : parts) cout << p << " ";\n    cout << endl;\n}',
    ),
    hint: 'From position start, try every end: if s.substr(start, end - start) is a palindrome, add it (push_back) and carry on from end, then remove it again (pop_back). When start reaches the end of s, record the parts. Like cutting a ribbon so every piece has a mirrored pattern.',
  },
  209: {
    example: 'Example: wordExists(board, "ABCCED") returns true for the board ABCE / SFCS / ADEE.',
    starter: fn(
      'bool wordExists(vector<vector<char>>& board, string word)',
      'true if word can be traced in the grid by moving up, down, left or right,\nnever using the same cell twice.',
      "vector<vector<char>> board = {{'A', 'B', 'C', 'E'}, {'S', 'F', 'C', 'S'}, {'A', 'D', 'E', 'E'}};\ncout << boolalpha << wordExists(board, \"ABCCED\") << endl;",
    ),
  },
  210: {
    example: 'Example: ratPaths({{1, 1}, {1, 1}}) returns [DR, RD] (in any order).',
    starter: fn(
      'vector<string> ratPaths(vector<vector<int>>& maze)',
      'maze is n by n: 1 is open, 0 is blocked. Every path from the top-left to the bottom-right\ncell, as text of moves D, L, R, U (down, left, right, up), never visiting a cell twice.',
      'vector<vector<int>> maze = {{1, 0, 0, 0}, {1, 1, 0, 1}, {1, 1, 0, 0}, {0, 1, 1, 1}};\nvector<string> r = ratPaths(maze);\nprintTexts(r);',
    ),
  },
  211: {
    example: 'Example: restoreIp("25525511135") returns [255.255.11.135, 255.255.111.35] (in any order).',
    starter: fn(
      'vector<string> restoreIp(string s)',
      'Every valid IP address made by putting three dots into s: four parts, each 0-255,\nwith no leading zero (but "0" itself is fine).',
      'vector<string> r = restoreIp("25525511135");\nprintTexts(r);',
    ),
  },
  212: {
    example: 'Example: grayCode(2) returns [0, 1, 3, 2] (other valid orders are fine).',
    starter: fn('vector<int> grayCode(int n)', 'The 2^n numbers 0 to 2^n - 1, starting with 0, where neighbours differ in exactly one bit.', 'vector<int> r = grayCode(2);\nprintVector(r);'),
    hint: 'Build it from the code for n - 1: the code for n - 1, then the same list backwards with the new top bit (1 << (n - 1)) added to each. The code for 0 bits is [0]. Like a mirror: the second half reflects the first, with one switch flipped.',
  },
  213: {
    example: 'Example: solveNQueens(4) returns [[.Q.., ...Q, Q..., ..Q.], [..Q., Q..., ...Q, .Q..]] (in any order).',
    starter: fn(
      'vector<vector<string>> solveNQueens(int n)',
      'Every way to place n queens on an n x n board so no two share a row, column or diagonal.\nEach board is a vector of rows like ".Q..".',
      'vector<vector<string>> r = solveNQueens(4);\ncout << r.size() << endl;',
    ),
  },
  214: {
    example: "Example: solveSudoku(board) fills every '.' in board so each row, column and 3x3 box has 1-9.",
    starter: fn(
      'void solveSudoku(vector<vector<char>>& board)',
      "board is 9 rows of 9 characters: '1'-'9' or '.' for an empty cell.\nFill board itself (return nothing). The puzzle has exactly one solution.",
      'vector<string> rows = {"534..8...", ".7..9.348", "1.8342567", ".59.6142.", "..68..791", "7.392.8..", "9.15.7.84", "2.74..6.5", ".45.86179"};\nvector<vector<char>> board(9, vector<char>(9, \'.\'));\nfor (int r = 0; r < 9; r++) {\n    for (int c = 0; c < 9; c++) board[r][c] = rows[r][c];\n}\nsolveSudoku(board);\nfor (char ch : board[0]) cout << ch;\ncout << endl;',
    ),
    tests: q214,
  },
  215: {
    example: 'Example: wordBreakAll("catsanddog", {"cat", "cats", "and", "sand", "dog"}) returns [cats and dog, cat sand dog] (in any order).',
    starter: fn(
      'vector<string> wordBreakAll(string s, vector<string> words)',
      'Every way to split s into words from the list, as sentences with single spaces.',
      'vector<string> words = {"cat", "cats", "and", "sand", "dog"};\nvector<string> r = wordBreakAll("catsanddog", words);\nprintTexts(r);',
    ),
    hint: 'For a starting position, try every word that s continues with (s.substr(start, word.size()) == word); for each, find all the sentences for the rest and put the word in front. Remember the answers for each position (a vector<vector<string>> and a vector<int> saying which positions are done) so you never work one out twice. Like reading a text with the spaces removed and trying each way to place the first space.',
  },
});
