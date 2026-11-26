// Practice, Python: Recursion & backtracking (Q191-Q215). Reference solutions: tests/practice/recursion-backtracking.solutions.ts.
import type { PracticeContent } from '../types';

const NO_LOOPS = { names: ['for', 'while'], why: 'This question asks you to use recursion, with no loops.' };
const grid = (rows: string[]) => rows.map((r) => r.split(''));

const SUDOKU_1 = ['53..7....', '6..195...', '.98....6.', '8...6...3', '4..8.3..1', '7...2...6', '.6....28.', '...419..5', '....8..79'];
const SOLVED_1 = ['534678912', '672195348', '198342567', '859761423', '426853791', '713924856', '961537284', '287419635', '345286179'];
const SUDOKU_2 = ['..9748...', '7........', '.2.1.9...', '..7...24.', '.64.1.59.', '.98...3..', '...8.3.2.', '........6', '...2759..'];
const SOLVED_2 = ['519748632', '783652419', '426139875', '357986241', '264317598', '198524367', '975863124', '832491756', '641275983'];
const ONE_GAP = SOLVED_1.map((r, i) => (i === 4 ? '4268.3791' : r));

const BOARD = ['ABCE', 'SFCS', 'ADEE'];

export const RECURSION_BACKTRACKING: PracticeContent[] = [
  {
    id: 191,
    example: 'Example: print_numbers(3) prints 1, 2 and 3, each on its own line.',
    starter: `def print_numbers(n):
    # Print 1 to n, one number per line, using recursion and no loops.
    pass


print("Counting to 5:")
print_numbers(5)
`,
    tests: [
      { call: 'print_numbers', args: [3], expected: '1\n2\n3\n', compare: 'output' },
      { call: 'print_numbers', args: [1], expected: '1\n', compare: 'output' },
      { call: 'print_numbers', args: [0], expected: '', compare: 'output' },
      { call: 'print_numbers', args: [6], expected: '1\n2\n3\n4\n5\n6\n', compare: 'output' },
    ],
    hint: 'print_numbers(n) can first call print_numbers(n - 1) to print 1 to n - 1, then print n. Stop when n is 0 (print nothing). Like a line of dominoes: each one waits for the one before it to fall first.',
    forbid: NO_LOOPS,
  },
  {
    id: 192,
    example: 'Example: array_sum([1, 2, 3, 4]) returns 10.',
    starter: `def array_sum(nums):
    # The sum of nums, using recursion (no loops, no sum()).
    pass


print(array_sum([1, 2, 3, 4]))
`,
    tests: [
      { call: 'array_sum', args: [[1, 2, 3, 4]], expected: 10 },
      { call: 'array_sum', args: [[]], expected: 0 },
      { call: 'array_sum', args: [[7]], expected: 7 },
      { call: 'array_sum', args: [[-3, 5, -2]], expected: 0 },
    ],
    hint: 'The sum of a list is its first number plus the sum of the rest (nums[1:]). The sum of an empty list is 0. Like counting money in a pile: take one note, then ask a friend to count the rest of the pile.',
    forbid: { names: ['for', 'while', 'sum'], why: 'This question asks you to use recursion, with no loops and no sum().' },
  },
  {
    id: 193,
    example: 'Example: reverse_string("hello") returns "olleh".',
    starter: `def reverse_string(s):
    # s backwards, using recursion (no loops, reversed() or [::-1]).
    pass


print(reverse_string("hello"))
`,
    tests: [
      { call: 'reverse_string', args: ['hello'], expected: 'olleh' },
      { call: 'reverse_string', args: [''], expected: '' },
      { call: 'reverse_string', args: ['a'], expected: 'a' },
      { call: 'reverse_string', args: ['ab cd'], expected: 'dc ba' },
    ],
    hint: 'The reverse of s is the reverse of s[1:] followed by s[0]. An empty text is its own reverse. Like taking cards off the top of a deck and putting them in a new pile: the order flips.',
    forbid: {
      names: ['for', 'while', 'reversed', 'reverse'],
      patterns: [{ regex: '::-1\\]', shown: '[::-1]' }],
      why: 'This question asks you to use recursion, with no loops, reversed() or [::-1].',
    },
  },
  {
    id: 194,
    example: 'Example: is_palindrome_rec("racecar") returns True.',
    starter: `def is_palindrome_rec(s):
    # True if s reads the same both ways, using recursion (no loops or [::-1]).
    pass


print(is_palindrome_rec("racecar"))
`,
    tests: [
      { call: 'is_palindrome_rec', args: ['racecar'], expected: true },
      { call: 'is_palindrome_rec', args: ['abca'], expected: false },
      { call: 'is_palindrome_rec', args: [''], expected: true },
      { call: 'is_palindrome_rec', args: ['a'], expected: true },
      { call: 'is_palindrome_rec', args: ['abba'], expected: true },
    ],
    hint: 'Compare the first and last letters: if they differ, the answer is False; otherwise check the middle part s[1:-1] the same way. Texts of length 0 or 1 are palindromes. Like peeling an onion from both sides at once, layer by layer.',
    forbid: {
      names: ['for', 'while', 'reversed', 'reverse'],
      patterns: [{ regex: '::-1\\]', shown: '[::-1]' }],
      why: 'This question asks you to use recursion, with no loops, reversed() or [::-1].',
    },
  },
  {
    id: 195,
    example: 'Example: power(2, 10) returns 1024.',
    starter: `def power(x, n):
    # x to the power n (n is a whole number, 0 or more), using recursion (no loops, ** or pow()).
    pass


print(power(2, 10))
`,
    tests: [
      { call: 'power', args: [2, 10], expected: 1024 },
      { call: 'power', args: [3, 0], expected: 1 },
      { call: 'power', args: [5, 1], expected: 5 },
      { call: 'power', args: [-2, 3], expected: -8 },
      { call: 'power', args: [2, 50], expected: 1125899906842624 },
    ],
    hint: 'x to the n is x × x to the n - 1, and anything to the power 0 is 1. Faster: work out half = power(x, n // 2) once, then answer half × half (times x again if n is odd). Like folding paper: each fold doubles the layers, so you need far fewer steps than counting one by one.',
    forbid: { names: ['for', 'while', 'pow'], ops: ['**'], why: 'This question asks you to use recursion, with no loops, ** or pow().' },
  },
  {
    id: 196,
    example: 'Example: count_paths(3, 7) returns 28.',
    starter: `def count_paths(m, n):
    # A grid of m rows and n columns. How many paths go from the top-left to the
    # bottom-right cell, moving only right or down?
    pass


print(count_paths(3, 7))
`,
    tests: [
      { call: 'count_paths', args: [3, 7], expected: 28 },
      { call: 'count_paths', args: [3, 2], expected: 3 },
      { call: 'count_paths', args: [1, 1], expected: 1 },
      { call: 'count_paths', args: [7, 3], expected: 28 },
      { call: 'count_paths', args: [10, 10], expected: 48620 },
    ],
    hint: 'The paths to a cell are the paths to the cell above it plus the paths to the cell on its left; cells in the top row or left column have exactly 1. Remember answers you have already worked out so you do not repeat them. Like counting the ways to walk through a city of one-way streets going only east or south.',
  },
  {
    id: 197,
    example: 'Example: flood_fill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2) returns [[2, 2, 2], [2, 2, 0], [2, 0, 1]].',
    starter: `def flood_fill(image, sr, sc, color):
    # Recolour the cell (sr, sc) and every cell of the same colour joined to it up, down,
    # left or right, with color. Return the image.
    pass


print(flood_fill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2))
`,
    tests: [
      { call: 'flood_fill', args: [[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2], expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] },
      { call: 'flood_fill', args: [[[0, 0, 0], [0, 0, 0]], 0, 0, 0], expected: [[0, 0, 0], [0, 0, 0]] },
      { call: 'flood_fill', args: [[[0, 0, 0], [0, 1, 1]], 1, 1, 1], expected: [[0, 0, 0], [0, 1, 1]] },
      { call: 'flood_fill', args: [[[1, 2], [2, 1]], 0, 0, 3], expected: [[3, 2], [2, 1]] },
      { call: 'flood_fill', args: [[[5, 5, 5], [5, 0, 5], [5, 5, 5]], 0, 0, 7], expected: [[7, 7, 7], [7, 0, 7], [7, 7, 7]] },
    ],
    hint: 'Remember the old colour. If it already equals the new colour, return at once (or you would loop forever). Otherwise a helper paints a cell and calls itself on its four neighbours, stopping at the edges and at cells of another colour. Like the paint-bucket tool in a drawing program.',
  },
  {
    id: 198,
    example: 'Example: hanoi(2, "A", "C", "B") prints the 3 moves that take 2 disks from A to C.',
    starter: `def hanoi(n, source, target, spare):
    # Print the moves that take n disks from source to target, one line per move,
    # like: Move disk 1 from A to C
    pass


print("Moves for 3 disks:")
hanoi(3, "A", "C", "B")
`,
    tests: [
      { call: 'hanoi', args: [1, 'A', 'C', 'B'], expected: 'Move disk 1 from A to C\n', compare: 'output' },
      { call: 'hanoi', args: [2, 'A', 'C', 'B'], expected: 'Move disk 1 from A to B\nMove disk 2 from A to C\nMove disk 1 from B to C\n', compare: 'output' },
      {
        call: 'hanoi',
        args: [3, 'A', 'C', 'B'],
        expected:
          'Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B\nMove disk 3 from A to C\nMove disk 1 from B to A\nMove disk 2 from B to C\nMove disk 1 from A to C\n',
        compare: 'output',
      },
      { call: 'hanoi', args: [2, 'X', 'Y', 'Z'], expected: 'Move disk 1 from X to Z\nMove disk 2 from X to Y\nMove disk 1 from Z to Y\n', compare: 'output' },
      { call: 'hanoi', args: [0, 'A', 'C', 'B'], expected: '', compare: 'output' },
    ],
    hint: 'To move n disks: move the top n - 1 disks to the spare peg (a smaller puzzle), move disk n to the target, then move the n - 1 disks from the spare onto it. With 0 disks there is nothing to do. Like moving a stack of plates with one hand: clear the small ones out of the way first.',
  },
  {
    id: 199,
    example: 'Example: subsets([1, 2]) returns [[], [1], [2], [1, 2]] (in any order).',
    starter: `def subsets(nums):
    # Every subset of nums (all values are different), in any order.
    pass


print(subsets([1, 2, 3]))
`,
    tests: [
      { call: 'subsets', args: [[1, 2, 3]], expected: [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]], compare: 'sets' },
      { call: 'subsets', args: [[0]], expected: [[], [0]], compare: 'sets' },
      { call: 'subsets', args: [[]], expected: [[]], compare: 'sets' },
      { call: 'subsets', args: [[4, 5]], expected: [[], [4], [5], [4, 5]], compare: 'sets' },
    ],
    hint: 'For each number there are two choices: leave it out or put it in. A helper backtrack(i, chosen) tries both for nums[i] and records chosen when i reaches the end. Like packing for a trip: for each item, yes or no.',
  },
  {
    id: 200,
    example: 'Example: subsets_with_dup([1, 2, 2]) returns [[], [1], [2], [1, 2], [2, 2], [1, 2, 2]] (in any order).',
    starter: `def subsets_with_dup(nums):
    # Every different subset of nums (which may have repeated values), in any order.
    pass


print(subsets_with_dup([1, 2, 2]))
`,
    tests: [
      { call: 'subsets_with_dup', args: [[1, 2, 2]], expected: [[], [1], [2], [1, 2], [2, 2], [1, 2, 2]], compare: 'sets' },
      { call: 'subsets_with_dup', args: [[0]], expected: [[], [0]], compare: 'sets' },
      { call: 'subsets_with_dup', args: [[2, 2, 2]], expected: [[], [2], [2, 2], [2, 2, 2]], compare: 'sets' },
      { call: 'subsets_with_dup', args: [[4, 4, 1, 4]], expected: [[], [1], [4], [1, 4], [4, 4], [1, 4, 4], [4, 4, 4], [1, 4, 4, 4]], compare: 'sets' },
    ],
    hint: 'Sort first so equal values sit together. In the loop that picks the next number, skip a value equal to the one just before it at the same level (i > start and nums[i] == nums[i - 1]). Like choosing scoops from a row of identical tubs: taking "the second vanilla" first gives the same cone.',
  },
  {
    id: 201,
    example: 'Example: permutations([1, 2]) returns [[1, 2], [2, 1]] (in any order).',
    starter: `def permutations(nums):
    # Every ordering of nums (all values are different), in any order.
    pass


print(permutations([1, 2, 3]))
`,
    tests: [
      { call: 'permutations', args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], compare: 'unordered' },
      { call: 'permutations', args: [[0, 1]], expected: [[0, 1], [1, 0]], compare: 'unordered' },
      { call: 'permutations', args: [[1]], expected: [[1]], compare: 'unordered' },
      { call: 'permutations', args: [[]], expected: [[]], compare: 'unordered' },
    ],
    hint: 'Build an ordering one place at a time: try every number not used yet in the next place, go deeper, then take it back out (backtrack). Record the ordering when it is full. Like seating guests at a table: try each free guest in the next chair.',
    forbid: { names: ['itertools'], why: 'This question asks you to build the orderings yourself, without itertools.' },
  },
  {
    id: 202,
    example: 'Example: unique_permutations([1, 1, 2]) returns [[1, 1, 2], [1, 2, 1], [2, 1, 1]] (in any order).',
    starter: `def unique_permutations(nums):
    # Every different ordering of nums (which may have repeated values), in any order.
    pass


print(unique_permutations([1, 1, 2]))
`,
    tests: [
      { call: 'unique_permutations', args: [[1, 1, 2]], expected: [[1, 1, 2], [1, 2, 1], [2, 1, 1]], compare: 'unordered' },
      { call: 'unique_permutations', args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], compare: 'unordered' },
      { call: 'unique_permutations', args: [[2, 2]], expected: [[2, 2]], compare: 'unordered' },
      { call: 'unique_permutations', args: [[3, 3, 0, 3]], expected: [[0, 3, 3, 3], [3, 0, 3, 3], [3, 3, 0, 3], [3, 3, 3, 0]], compare: 'unordered' },
    ],
    hint: 'Count how many of each value are left. In each place, try each different value that still has copies left (one try per value, not per copy), go deeper, then put it back. Like arranging coloured beads: two red beads swapped look the same.',
    forbid: { names: ['itertools'], why: 'This question asks you to build the orderings yourself, without itertools.' },
  },
  {
    id: 203,
    example: 'Example: combine(4, 2) returns [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]] (in any order).',
    starter: `def combine(n, k):
    # Every group of k different numbers chosen from 1 to n, in any order.
    pass


print(combine(4, 2))
`,
    tests: [
      { call: 'combine', args: [4, 2], expected: [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]], compare: 'sets' },
      { call: 'combine', args: [1, 1], expected: [[1]], compare: 'sets' },
      {
        call: 'combine',
        args: [5, 3],
        expected: [[1, 2, 3], [1, 2, 4], [1, 2, 5], [1, 3, 4], [1, 3, 5], [1, 4, 5], [2, 3, 4], [2, 3, 5], [2, 4, 5], [3, 4, 5]],
        compare: 'sets',
      },
      { call: 'combine', args: [3, 3], expected: [[1, 2, 3]], compare: 'sets' },
    ],
    hint: 'A helper backtrack(start, chosen): when chosen has k numbers, record it; otherwise try each number from start to n, add it, go deeper with start = that number + 1, and remove it. Like picking a team of k from a numbered line-up, always picking forwards so no team is counted twice.',
    forbid: { names: ['itertools'], why: 'This question asks you to build the groups yourself, without itertools.' },
  },
  {
    id: 204,
    example: 'Example: combination_sum([2, 3, 6, 7], 7) returns [[2, 2, 3], [7]] (in any order).',
    starter: `def combination_sum(candidates, target):
    # Every different group of candidates (each may be used again and again) that adds up to target.
    # candidates are different positive numbers.
    pass


print(combination_sum([2, 3, 6, 7], 7))
`,
    tests: [
      { call: 'combination_sum', args: [[2, 3, 6, 7], 7], expected: [[2, 2, 3], [7]], compare: 'sets' },
      { call: 'combination_sum', args: [[2, 3, 5], 8], expected: [[2, 2, 2, 2], [2, 3, 3], [3, 5]], compare: 'sets' },
      { call: 'combination_sum', args: [[2], 1], expected: [], compare: 'sets' },
      { call: 'combination_sum', args: [[1], 2], expected: [[1, 1]], compare: 'sets' },
    ],
    hint: 'backtrack(start, remaining, chosen): at 0 remaining, record chosen; otherwise try each candidate from position start on (not earlier, so no group repeats) that is not bigger than remaining, and stay at the same position so it can be used again. Like paying an amount with coins you have plenty of.',
  },
  {
    id: 205,
    example: 'Example: combination_sum_once([10, 1, 2, 7, 6, 1, 5], 8) returns [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] (in any order).',
    starter: `def combination_sum_once(candidates, target):
    # Every different group adding up to target, using each position at most once.
    pass


print(combination_sum_once([10, 1, 2, 7, 6, 1, 5], 8))
`,
    tests: [
      { call: 'combination_sum_once', args: [[10, 1, 2, 7, 6, 1, 5], 8], expected: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]], compare: 'sets' },
      { call: 'combination_sum_once', args: [[2, 5, 2, 1, 2], 5], expected: [[1, 2, 2], [5]], compare: 'sets' },
      { call: 'combination_sum_once', args: [[3], 2], expected: [], compare: 'sets' },
      { call: 'combination_sum_once', args: [[1, 1], 2], expected: [[1, 1]], compare: 'sets' },
    ],
    hint: 'Sort the candidates. Like the reusable version, but go on from i + 1 after taking a number, and at the same level skip a value equal to the one before it. Like paying with the exact coins in your pocket: each coin can only be spent once.',
  },
  {
    id: 206,
    example: 'Example: letter_combinations("23") returns ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"] (in any order).',
    starter: `def letter_combinations(digits):
    # Phone keys: 2 abc, 3 def, 4 ghi, 5 jkl, 6 mno, 7 pqrs, 8 tuv, 9 wxyz.
    # Every text the digits could spell ([] for no digits).
    pass


print(letter_combinations("23"))
`,
    tests: [
      { call: 'letter_combinations', args: ['23'], expected: ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf'], compare: 'unordered' },
      { call: 'letter_combinations', args: [''], expected: [], compare: 'unordered' },
      { call: 'letter_combinations', args: ['2'], expected: ['a', 'b', 'c'], compare: 'unordered' },
      {
        call: 'letter_combinations',
        args: ['79'],
        expected: ['pw', 'px', 'py', 'pz', 'qw', 'qx', 'qy', 'qz', 'rw', 'rx', 'ry', 'rz', 'sw', 'sx', 'sy', 'sz'],
        compare: 'unordered',
      },
    ],
    hint: 'Keep a dictionary from digit to letters. A helper takes the position and the text so far: at the end, record the text; otherwise try each letter of the next digit. Like an old phone keypad where each key could mean several letters.',
  },
  {
    id: 207,
    example: 'Example: generate_parentheses(2) returns ["(())", "()()"] (in any order).',
    starter: `def generate_parentheses(n):
    # Every correctly matched text made of n "(" and n ")".
    pass


print(generate_parentheses(3))
`,
    tests: [
      { call: 'generate_parentheses', args: [3], expected: ['((()))', '(()())', '(())()', '()(())', '()()()'], compare: 'unordered' },
      { call: 'generate_parentheses', args: [1], expected: ['()'], compare: 'unordered' },
      { call: 'generate_parentheses', args: [2], expected: ['(())', '()()'], compare: 'unordered' },
      {
        call: 'generate_parentheses',
        args: [4],
        expected: ['(((())))', '((()()))', '((())())', '((()))()', '(()(()))', '(()()())', '(()())()', '(())(())', '(())()()', '()((()))', '()(()())', '()(())()', '()()(())', '()()()()'],
        compare: 'unordered',
      },
    ],
    hint: 'Build the text one bracket at a time, keeping counts of opened and closed brackets. You may add "(" while opened < n, and ")" while closed < opened. Record the text when it has 2n brackets. Like a door you can only close after you opened it.',
  },
  {
    id: 208,
    example: 'Example: palindrome_partitions("aab") returns [["a", "a", "b"], ["aa", "b"]] (in any order).',
    starter: `def palindrome_partitions(s):
    # Every way to cut s into parts (in order) where every part is a palindrome.
    pass


print(palindrome_partitions("aab"))
`,
    tests: [
      { call: 'palindrome_partitions', args: ['aab'], expected: [['aa', 'b'], ['a', 'a', 'b']], compare: 'unordered' },
      { call: 'palindrome_partitions', args: ['a'], expected: [['a']], compare: 'unordered' },
      { call: 'palindrome_partitions', args: ['aba'], expected: [['aba'], ['a', 'b', 'a']], compare: 'unordered' },
      { call: 'palindrome_partitions', args: ['abc'], expected: [['a', 'b', 'c']], compare: 'unordered' },
      {
        call: 'palindrome_partitions',
        args: ['racecar'],
        expected: [['racecar'], ['r', 'aceca', 'r'], ['r', 'a', 'cec', 'a', 'r'], ['r', 'a', 'c', 'e', 'c', 'a', 'r']],
        compare: 'unordered',
      },
    ],
    hint: 'From position start, try every end: if s[start:end] is a palindrome, add it and carry on from end. When start reaches the end of s, record the parts. Like cutting a ribbon so every piece has a mirrored pattern.',
  },
  {
    id: 209,
    example: 'Example: word_exists([list("ABCE"), list("SFCS"), list("ADEE")], "ABCCED") returns True.',
    starter: `def word_exists(board, word):
    # True if word can be traced in the grid by moving up, down, left or right,
    # never using the same cell twice.
    pass


print(word_exists([list("ABCE"), list("SFCS"), list("ADEE")], "ABCCED"))
`,
    tests: [
      { call: 'word_exists', args: [grid(BOARD), 'ABCCED'], expected: true },
      { call: 'word_exists', args: [grid(BOARD), 'SEE'], expected: true },
      { call: 'word_exists', args: [grid(BOARD), 'ABCB'], expected: false },
      { call: 'word_exists', args: [[['a']], 'a'], expected: true },
      { call: 'word_exists', args: [grid(['ab', 'cd']), 'abdc'], expected: true },
      { call: 'word_exists', args: [grid(['ab', 'cd']), 'abcd'], expected: false },
    ],
    hint: 'Try every cell as the start. A helper checks letter i at (r, c): it must match; mark the cell as used, try the four neighbours for letter i + 1, then unmark it. Like a word-search puzzle where your pencil may only move to a touching square.',
  },
  {
    id: 210,
    example: 'Example: rat_paths([[1, 1], [1, 1]]) returns ["DR", "RD"] (in any order).',
    starter: `def rat_paths(maze):
    # maze is n by n: 1 is open, 0 is blocked. Every path from the top-left to the bottom-right
    # cell, as text of moves D, L, R, U (down, left, right, up), never visiting a cell twice.
    pass


print(rat_paths([[1, 0, 0, 0], [1, 1, 0, 1], [1, 1, 0, 0], [0, 1, 1, 1]]))
`,
    tests: [
      { call: 'rat_paths', args: [[[1, 0, 0, 0], [1, 1, 0, 1], [1, 1, 0, 0], [0, 1, 1, 1]]], expected: ['DDRDRR', 'DRDDRR'], compare: 'unordered' },
      { call: 'rat_paths', args: [[[1, 0], [1, 0]]], expected: [], compare: 'unordered' },
      { call: 'rat_paths', args: [[[1, 1], [1, 1]]], expected: ['DR', 'RD'], compare: 'unordered' },
      { call: 'rat_paths', args: [[[0, 1], [1, 1]]], expected: [], compare: 'unordered' },
    ],
    hint: 'From the start cell (if it is open), try each move into an open, unvisited cell inside the maze, adding its letter to the path; mark the cell, go deeper, then unmark it. Record the path at the bottom-right cell. Like exploring a hedge maze and walking back to the last fork when you hit a dead end.',
  },
  {
    id: 211,
    example: 'Example: restore_ip("25525511135") returns ["255.255.11.135", "255.255.111.35"] (in any order).',
    starter: `def restore_ip(s):
    # Every valid IP address made by putting three dots into s: four parts, each 0-255,
    # with no leading zero (but "0" itself is fine).
    pass


print(restore_ip("25525511135"))
`,
    tests: [
      { call: 'restore_ip', args: ['25525511135'], expected: ['255.255.11.135', '255.255.111.35'], compare: 'unordered' },
      { call: 'restore_ip', args: ['0000'], expected: ['0.0.0.0'], compare: 'unordered' },
      { call: 'restore_ip', args: ['101023'], expected: ['1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3'], compare: 'unordered' },
      { call: 'restore_ip', args: ['1111'], expected: ['1.1.1.1'], compare: 'unordered' },
      { call: 'restore_ip', args: ['123'], expected: [], compare: 'unordered' },
    ],
    hint: 'Choose the parts one at a time: from the current position, try a part of 1, 2 or 3 digits; keep it only if it is 0-255 and has no leading zero. After four parts, it counts if you used every digit. Like splitting a long phone number into groups that each make sense.',
  },
  {
    id: 212,
    example: 'Example: gray_code(2) returns [0, 1, 3, 2] (other valid orders are fine).',
    starter: `def gray_code(n):
    # The 2**n numbers 0 to 2**n - 1, starting with 0, where neighbours differ in exactly one bit.
    pass


print(gray_code(2))
`,
    tests: [
      { call: 'gray_code', args: [1], expected: null, compare: 'gray' },
      { call: 'gray_code', args: [2], expected: null, compare: 'gray' },
      { call: 'gray_code', args: [3], expected: null, compare: 'gray' },
      { call: 'gray_code', args: [4], expected: null, compare: 'gray' },
      { call: 'gray_code', args: [0], expected: null, compare: 'gray' },
    ],
    hint: 'Build it from the code for n - 1: the code for n - 1, then the same list backwards with the new top bit (2 ** (n - 1)) added to each. The code for 0 bits is [0]. Like a mirror: the second half reflects the first, with one switch flipped.',
  },
  {
    id: 213,
    example: 'Example: solve_n_queens(4) returns [[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]] (in any order).',
    starter: `def solve_n_queens(n):
    # Every way to place n queens on an n x n board so no two share a row, column or diagonal.
    # Each board is a list of rows like ".Q..".
    pass


print(solve_n_queens(4))
`,
    tests: [
      { call: 'solve_n_queens', args: [4], expected: [['.Q..', '...Q', 'Q...', '..Q.'], ['..Q.', 'Q...', '...Q', '.Q..']], compare: 'unordered' },
      { call: 'solve_n_queens', args: [1], expected: [['Q']], compare: 'unordered' },
      { call: 'solve_n_queens', args: [2], expected: [], compare: 'unordered' },
      { call: 'solve_n_queens', args: [3], expected: [], compare: 'unordered' },
    ],
    hint: 'Place one queen per row. Keep sets of used columns, used "row - column" diagonals and used "row + column" diagonals; in each row try every free column, go to the next row, then take the queen back. Like seating guests who must not see each other in a straight line.',
  },
  {
    id: 214,
    example: 'Example: solve_sudoku(board) fills every "." in board so each row, column and 3x3 box has 1-9.',
    starter: `def solve_sudoku(board):
    # board is 9 lists of 9 characters: "1"-"9" or "." for an empty cell.
    # Fill board itself (return nothing). The puzzle has exactly one solution.
    pass


board = [list("53..7...."), list("6..195..."), list(".98....6."),
         list("8...6...3"), list("4..8.3..1"), list("7...2...6"),
         list(".6....28."), list("...419..5"), list("....8..79")]
solve_sudoku(board)
print(board[0])
`,
    tests: [
      { call: 'solve_sudoku', args: [grid(SUDOKU_1)], expected: null, mutated: { arg: 0, value: grid(SOLVED_1) } },
      { call: 'solve_sudoku', args: [grid(ONE_GAP)], expected: null, mutated: { arg: 0, value: grid(SOLVED_1) } },
      { call: 'solve_sudoku', args: [grid(SOLVED_1)], expected: null, mutated: { arg: 0, value: grid(SOLVED_1) } },
      { call: 'solve_sudoku', args: [grid(SUDOKU_2)], expected: null, mutated: { arg: 0, value: grid(SOLVED_2) } },
    ],
    hint: 'Find an empty cell. Try each digit that is not already in its row, column or 3x3 box; put it in and solve the rest the same way. If that fails, put "." back and try the next digit. Like a pencil puzzle where you rub out a guess as soon as it leads to a dead end.',
  },
  {
    id: 215,
    example: 'Example: word_break_all("catsanddog", ["cat", "cats", "and", "sand", "dog"]) returns ["cats and dog", "cat sand dog"] (in any order).',
    starter: `def word_break_all(s, words):
    # Every way to split s into words from the list, as sentences with single spaces.
    pass


print(word_break_all("catsanddog", ["cat", "cats", "and", "sand", "dog"]))
`,
    tests: [
      { call: 'word_break_all', args: ['catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']], expected: ['cat sand dog', 'cats and dog'], compare: 'unordered' },
      {
        call: 'word_break_all',
        args: ['pineapplepenapple', ['apple', 'pen', 'applepen', 'pine', 'pineapple']],
        expected: ['pine applepen apple', 'pineapple pen apple', 'pine apple pen apple'],
        compare: 'unordered',
      },
      { call: 'word_break_all', args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], expected: [], compare: 'unordered' },
      { call: 'word_break_all', args: ['aaa', ['a', 'aa']], expected: ['a aa', 'aa a', 'a a a'], compare: 'unordered' },
    ],
    hint: 'For a starting position, try every word that s continues with; for each, find all the sentences for the rest and put the word in front. Remember the answers for each position so you never work one out twice. Like reading a text with the spaces removed and trying each way to place the first space.',
  },
];
