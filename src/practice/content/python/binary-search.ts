// Practice, Python: Binary search (Q171-Q190). Reference solutions: tests/practice/binary-search.solutions.ts.
import type { PracticeContent } from '../types';

const NO_ROOT = { names: ['sqrt', 'isqrt', 'pow'], ops: ['**'], why: 'This question asks you to find it with binary search, without sqrt(), ** or pow().' };
const MATRIX = [
  [1, 4, 7, 11, 15],
  [2, 5, 8, 12, 19],
  [3, 6, 9, 16, 22],
  [10, 13, 14, 17, 24],
  [18, 21, 23, 26, 30],
];

export const BINARY_SEARCH: PracticeContent[] = [
  {
    id: 171,
    example: 'Example: binary_search([-1, 0, 3, 5, 9, 12], 9) returns 4.',
    starter: `def binary_search(nums, target):
    # nums is sorted. The position of target, or -1, using binary search.
    pass


print(binary_search([-1, 0, 3, 5, 9, 12], 9))
`,
    tests: [
      { call: 'binary_search', args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { call: 'binary_search', args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { call: 'binary_search', args: [[5], 5], expected: 0 },
      { call: 'binary_search', args: [[], 1], expected: -1 },
      { call: 'binary_search', args: [[1, 3, 5, 7, 9, 11, 13], 1], expected: 0 },
    ],
    hint: 'Keep low and high. Look at mid = (low + high) // 2: equal, done; smaller than target, search right of mid (low = mid + 1); bigger, search left (high = mid - 1). Stop when low > high. Like finding a word in a dictionary by opening it in the middle.',
    forbid: { names: ['index', 'bisect', 'bisect_left', 'bisect_right'], why: 'This question asks you to write the binary search yourself, without index() or bisect.' },
  },
  {
    id: 172,
    example: 'Example: search_insert([1, 3, 5, 6], 2) returns 1.',
    starter: `def search_insert(nums, target):
    # nums is sorted. The position of target, or where it would go to keep nums sorted.
    pass


print(search_insert([1, 3, 5, 6], 2))
`,
    tests: [
      { call: 'search_insert', args: [[1, 3, 5, 6], 5], expected: 2 },
      { call: 'search_insert', args: [[1, 3, 5, 6], 2], expected: 1 },
      { call: 'search_insert', args: [[1, 3, 5, 6], 7], expected: 4 },
      { call: 'search_insert', args: [[1, 3, 5, 6], 0], expected: 0 },
      { call: 'search_insert', args: [[], 4], expected: 0 },
    ],
    hint: 'Binary search with low = 0 and high = len(nums): if nums[mid] < target, low = mid + 1, otherwise high = mid. When they meet, low is the answer. Like finding where a new book goes on a sorted shelf.',
    forbid: { names: ['index', 'bisect', 'bisect_left', 'bisect_right', 'insort'], why: 'This question asks you to write the binary search yourself, without index() or bisect.' },
  },
  {
    id: 173,
    example: 'Example: count_occurrences([1, 2, 2, 2, 3], 2) returns 3.',
    starter: `def count_occurrences(nums, target):
    # nums is sorted. How many times target appears, in O(log n) (two binary searches).
    pass


print(count_occurrences([1, 2, 2, 2, 3], 2))
`,
    tests: [
      { call: 'count_occurrences', args: [[1, 2, 2, 2, 3], 2], expected: 3 },
      { call: 'count_occurrences', args: [[1, 1, 1], 1], expected: 3 },
      { call: 'count_occurrences', args: [[1, 2, 3], 4], expected: 0 },
      { call: 'count_occurrences', args: [[], 1], expected: 0 },
      { call: 'count_occurrences', args: [[1, 2, 3, 3, 3, 3, 4, 5], 3], expected: 4 },
    ],
    hint: 'Find the first position with a value >= target and the first position with a value > target (two binary searches); the count is the difference. Like finding where a chapter starts and where the next one starts, then counting the pages between.',
    forbid: { names: ['count', 'bisect', 'bisect_left', 'bisect_right'], why: 'This question asks you to use binary search, not count() or bisect.' },
  },
  {
    id: 174,
    example: 'Example: floor_sqrt(8) returns 2.',
    starter: `def floor_sqrt(n):
    # The largest whole r with r * r <= n (n is 0 or more), using binary search.
    pass


print(floor_sqrt(8))
`,
    tests: [
      { call: 'floor_sqrt', args: [8], expected: 2 },
      { call: 'floor_sqrt', args: [16], expected: 4 },
      { call: 'floor_sqrt', args: [0], expected: 0 },
      { call: 'floor_sqrt', args: [1], expected: 1 },
      { call: 'floor_sqrt', args: [2147395599], expected: 46339 },
    ],
    hint: 'Search r between 0 and n: if mid * mid <= n, remember mid and look higher; otherwise look lower. Like guessing a number with "higher" or "lower" answers.',
    forbid: NO_ROOT,
  },
  {
    id: 175,
    example: 'Example: is_perfect_square(16) returns True, is_perfect_square(14) returns False.',
    starter: `def is_perfect_square(n):
    # True if n (1 or more) is some whole number times itself. Without sqrt().
    pass


print(is_perfect_square(16))
`,
    tests: [
      { call: 'is_perfect_square', args: [16], expected: true },
      { call: 'is_perfect_square', args: [14], expected: false },
      { call: 'is_perfect_square', args: [1], expected: true },
      { call: 'is_perfect_square', args: [808201], expected: true },
      { call: 'is_perfect_square', args: [2147395600], expected: true },
      { call: 'is_perfect_square', args: [2147395601], expected: false },
    ],
    hint: 'Binary search a whole number r between 1 and n with r * r == n: too small, go higher; too big, go lower. If the search ends without a match, n is not a perfect square. Like checking whether square tiles can exactly cover a square floor.',
    forbid: NO_ROOT,
  },
  {
    id: 176,
    example: 'Example: guess_number(10, guess) returns 6 when the hidden number is 6.',
    starter: `def guess_number(n, guess):
    # A number from 1 to n is hidden. guess(x) returns 0 if x is right,
    # -1 if the hidden number is lower than x, and 1 if it is higher. Find it.
    pass


def guess(x):
    # A stand-in for trying it out: the hidden number here is 6.
    return 0 if x == 6 else (-1 if 6 < x else 1)


print(guess_number(10, guess))
`,
    tests: [
      { call: 'guess_number', args: [10, { $guess: 6 }], expected: 6 },
      { call: 'guess_number', args: [1, { $guess: 1 }], expected: 1 },
      { call: 'guess_number', args: [2, { $guess: 2 }], expected: 2 },
      { call: 'guess_number', args: [2126753390, { $guess: 1702766719 }], expected: 1702766719 },
    ],
    hint: 'Binary search from 1 to n: call guess(mid); 0 means found, -1 means search below mid, 1 means search above. About 31 guesses are enough even for two billion. Like the "higher or lower" game with a friend.',
  },
  {
    id: 177,
    example: 'Example: first_bad_version(5, is_bad) returns 4 when versions 4 and 5 are bad.',
    starter: `def first_bad_version(n, is_bad):
    # Versions 1 to n; from some version on, every version is bad.
    # is_bad(v) says whether version v is bad. Return the first bad one, with few calls.
    pass


def is_bad(v):
    # A stand-in for trying it out: versions 4 and later are bad.
    return v >= 4


print(first_bad_version(5, is_bad))
`,
    tests: [
      { call: 'first_bad_version', args: [5, { $bad: 4 }], expected: 4 },
      { call: 'first_bad_version', args: [1, { $bad: 1 }], expected: 1 },
      { call: 'first_bad_version', args: [10, { $bad: 1 }], expected: 1 },
      { call: 'first_bad_version', args: [2126753390, { $bad: 1702766719 }], expected: 1702766719 },
    ],
    hint: 'Binary search: if is_bad(mid), the first bad version is mid or earlier (high = mid); otherwise it is after mid (low = mid + 1). When low == high, that is the answer. Like finding the day milk went off by checking the middle of the week first.',
  },
  {
    id: 178,
    example: 'Example: next_letter(["c", "f", "j"], "c") returns "f"; with none bigger, it wraps to the first letter.',
    starter: `def next_letter(letters, target):
    # letters is sorted. The smallest letter bigger than target; if there is none, letters[0].
    pass


print(next_letter(["c", "f", "j"], "c"))
`,
    tests: [
      { call: 'next_letter', args: [['c', 'f', 'j'], 'a'], expected: 'c' },
      { call: 'next_letter', args: [['c', 'f', 'j'], 'c'], expected: 'f' },
      { call: 'next_letter', args: [['c', 'f', 'j'], 'z'], expected: 'c' },
      { call: 'next_letter', args: [['e', 'e', 'g', 'g'], 'g'], expected: 'e' },
      { call: 'next_letter', args: [['a', 'b'], 'a'], expected: 'b' },
    ],
    hint: 'Binary search for the first position with a letter bigger than target (if letters[mid] <= target, go right). If that position is past the end, wrap to 0. Like finding the next bus after a given time, or the first one tomorrow.',
  },
  {
    id: 179,
    example: 'Example: search_range([5, 7, 7, 8, 8, 10], 8) returns [3, 4].',
    starter: `def search_range(nums, target):
    # nums is sorted. [first position, last position] of target, or [-1, -1], in O(log n).
    pass


print(search_range([5, 7, 7, 8, 8, 10], 8))
`,
    tests: [
      { call: 'search_range', args: [[5, 7, 7, 8, 8, 10], 8], expected: [3, 4] },
      { call: 'search_range', args: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
      { call: 'search_range', args: [[], 0], expected: [-1, -1] },
      { call: 'search_range', args: [[1], 1], expected: [0, 0] },
      { call: 'search_range', args: [[2, 2, 2], 2], expected: [0, 2] },
    ],
    hint: 'Two binary searches: one keeps going left after a match (to find the first), one keeps going right (to find the last). Like finding the first and the last page that mention a word in a sorted index.',
  },
  {
    id: 180,
    example: 'Example: find_peak([1, 2, 3, 1]) returns 2 (any peak is fine).',
    starter: `def find_peak(nums):
    # A position whose value is bigger than its neighbours (outside the list counts as -infinity).
    # Neighbouring values are never equal. Any peak is fine; aim for O(log n).
    pass


print(find_peak([1, 2, 3, 1]))
`,
    tests: [
      { call: 'find_peak', args: [[1, 2, 3, 1]], expected: null, compare: 'peak' },
      { call: 'find_peak', args: [[1, 2, 1, 3, 5, 6, 4]], expected: null, compare: 'peak' },
      { call: 'find_peak', args: [[1]], expected: null, compare: 'peak' },
      { call: 'find_peak', args: [[2, 1]], expected: null, compare: 'peak' },
      { call: 'find_peak', args: [[1, 2]], expected: null, compare: 'peak' },
    ],
    hint: 'Look at mid and mid + 1: if nums[mid] < nums[mid + 1], a peak is to the right (go uphill: low = mid + 1); otherwise there is one at mid or to the left (high = mid). Like a hiker in fog who always walks uphill and must reach a summit.',
  },
  {
    id: 181,
    example: 'Example: search_rotated([4, 5, 6, 7, 0, 1, 2], 0) returns 4.',
    starter: `def search_rotated(nums, target):
    # nums was sorted (all different), then turned around some point. Position of target, or -1, in O(log n).
    pass


print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))
`,
    tests: [
      { call: 'search_rotated', args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
      { call: 'search_rotated', args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { call: 'search_rotated', args: [[1], 0], expected: -1 },
      { call: 'search_rotated', args: [[3, 1], 1], expected: 1 },
      { call: 'search_rotated', args: [[5, 1, 3], 5], expected: 0 },
    ],
    hint: 'At every step one half (low..mid or mid..high) is still sorted. Check whether target lies inside that sorted half by its ends; if yes, search there, otherwise search the other half. Like a clock face: from any point, at least one direction runs in order.',
  },
  {
    id: 182,
    example: 'Example: find_min_rotated([3, 4, 5, 1, 2]) returns 1.',
    starter: `def find_min_rotated(nums):
    # nums was sorted (all different), then turned around some point. Its smallest value, in O(log n).
    pass


print(find_min_rotated([3, 4, 5, 1, 2]))
`,
    tests: [
      { call: 'find_min_rotated', args: [[3, 4, 5, 1, 2]], expected: 1 },
      { call: 'find_min_rotated', args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { call: 'find_min_rotated', args: [[11, 13, 15, 17]], expected: 11 },
      { call: 'find_min_rotated', args: [[2, 1]], expected: 1 },
      { call: 'find_min_rotated', args: [[5]], expected: 5 },
    ],
    hint: 'Compare nums[mid] with nums[high]: if it is bigger, the drop (and the minimum) is right of mid (low = mid + 1); otherwise the minimum is at mid or to its left (high = mid). Like finding where a staircase drops back to the ground.',
    forbid: { names: ['min', 'sorted', 'sort'], why: 'This question asks you to find it with binary search, without min() or sorting.' },
  },
  {
    id: 183,
    example: 'Example: search_matrix(matrix, 5) returns True when every row and column of matrix is sorted.',
    starter: `def search_matrix(matrix, target):
    # Every row is sorted left to right and every column top to bottom. True if target is there.
    pass


print(search_matrix([[1, 4], [2, 5]], 5))
`,
    tests: [
      { call: 'search_matrix', args: [MATRIX, 5], expected: true },
      { call: 'search_matrix', args: [MATRIX, 20], expected: false },
      { call: 'search_matrix', args: [[[1]], 1], expected: true },
      { call: 'search_matrix', args: [[[1, 3]], 2], expected: false },
      { call: 'search_matrix', args: [MATRIX, 30], expected: true },
    ],
    hint: 'Start in the top-right corner. If the value is too big, move left (the whole column below is bigger); if too small, move down (the row to the left is smaller); stop when found or off the grid. Like walking down a staircase of numbers, one step at a time.',
  },
  {
    id: 184,
    example: 'Example: single_in_sorted([1, 1, 2, 3, 3, 4, 4, 8, 8]) returns 2.',
    starter: `def single_in_sorted(nums):
    # nums is sorted; every value appears twice except one. Find it in O(log n).
    pass


print(single_in_sorted([1, 1, 2, 3, 3, 4, 4, 8, 8]))
`,
    tests: [
      { call: 'single_in_sorted', args: [[1, 1, 2, 3, 3, 4, 4, 8, 8]], expected: 2 },
      { call: 'single_in_sorted', args: [[3, 3, 7, 7, 10, 11, 11]], expected: 10 },
      { call: 'single_in_sorted', args: [[1]], expected: 1 },
      { call: 'single_in_sorted', args: [[1, 1, 2]], expected: 2 },
      { call: 'single_in_sorted', args: [[0, 1, 1]], expected: 0 },
    ],
    hint: 'Before the single value, pairs start at even positions; after it, at odd ones. Search with mid made even: if nums[mid] == nums[mid + 1], the single one is further right (low = mid + 2); otherwise it is at mid or left (high = mid). Like a line of couples where one person came alone: the couples after them are shifted by one.',
  },
  {
    id: 185,
    example: 'Example: min_eating_speed([3, 6, 7, 11], 8) returns 4.',
    starter: `def min_eating_speed(piles, h):
    # Eat at k bananas an hour (one pile at a time; a smaller pile still takes the whole hour).
    # The smallest k that finishes all piles within h hours.
    pass


print(min_eating_speed([3, 6, 7, 11], 8))
`,
    tests: [
      { call: 'min_eating_speed', args: [[3, 6, 7, 11], 8], expected: 4 },
      { call: 'min_eating_speed', args: [[30, 11, 23, 4, 20], 5], expected: 30 },
      { call: 'min_eating_speed', args: [[30, 11, 23, 4, 20], 6], expected: 23 },
      { call: 'min_eating_speed', args: [[1], 1], expected: 1 },
      { call: 'min_eating_speed', args: [[312884470], 312884469], expected: 2 },
    ],
    hint: 'The answer is between 1 and max(piles). For a speed k, the hours are the sum of (pile + k - 1) // k. Binary search the smallest k whose hours are <= h. Like finding the slowest pace that still gets you to the station on time.',
  },
  {
    id: 186,
    example: 'Example: ship_within_days([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5) returns 15.',
    starter: `def ship_within_days(weights, days):
    # Packages go in order, one ship load per day. The smallest ship capacity that ships them all in days.
    pass


print(ship_within_days([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))
`,
    tests: [
      { call: 'ship_within_days', args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expected: 15 },
      { call: 'ship_within_days', args: [[3, 2, 2, 4, 1, 4], 3], expected: 6 },
      { call: 'ship_within_days', args: [[1, 2, 3, 1, 1], 4], expected: 3 },
      { call: 'ship_within_days', args: [[10], 1], expected: 10 },
    ],
    hint: 'The capacity is between max(weights) and sum(weights). For a capacity, count the days needed by filling each day until the next package does not fit. Binary search the smallest capacity that needs at most days. Like picking the smallest van that still finishes the deliveries this week.',
  },
  {
    id: 187,
    example: 'Example: kth_smallest_matrix([[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8) returns 13.',
    starter: `def kth_smallest_matrix(matrix, k):
    # Rows and columns are sorted. The kth smallest value (counting repeats).
    pass


print(kth_smallest_matrix([[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8))
`,
    tests: [
      { call: 'kth_smallest_matrix', args: [[[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8], expected: 13 },
      { call: 'kth_smallest_matrix', args: [[[-5]], 1], expected: -5 },
      { call: 'kth_smallest_matrix', args: [[[1, 2], [1, 3]], 2], expected: 1 },
      { call: 'kth_smallest_matrix', args: [[[1, 2], [3, 4]], 4], expected: 4 },
    ],
    hint: 'Binary search on the value, between the smallest and the biggest. For a guess x, count the values <= x (walk from the bottom-left corner). The smallest x with a count of at least k is the answer. Like finding the exam mark that puts exactly k students at or below it.',
  },
  {
    id: 188,
    example: 'Example: search_unknown(reader, 9) returns 4 for the hidden list [-1, 0, 3, 5, 9, 12].',
    starter: `def search_unknown(reader, target):
    # A sorted list of unknown length: reader.get(i) gives item i, or 2147483647 past the end.
    # The position of target, or -1.
    pass


class Reader:
    # A stand-in for trying it out.
    def __init__(self, data):
        self.data = data

    def get(self, i):
        return self.data[i] if 0 <= i < len(self.data) else 2147483647


print(search_unknown(Reader([-1, 0, 3, 5, 9, 12]), 9))
`,
    tests: [
      { call: 'search_unknown', args: [{ $reader: [-1, 0, 3, 5, 9, 12] }, 9], expected: 4 },
      { call: 'search_unknown', args: [{ $reader: [-1, 0, 3, 5, 9, 12] }, 2], expected: -1 },
      { call: 'search_unknown', args: [{ $reader: [5] }, 5], expected: 0 },
      { call: 'search_unknown', args: [{ $reader: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] }, 19], expected: 18 },
    ],
    hint: 'First find a range: start with high = 1 and double it while reader.get(high) < target. Then binary search between high // 2 and high (values past the end read as huge, so they count as "too big"). Like searching a street with no end sign: jump ahead in bigger steps, then look closely.',
  },
  {
    id: 189,
    example: 'Example: split_array([7, 2, 5, 10, 8], 2) returns 18 ([7, 2, 5] and [10, 8]).',
    starter: `def split_array(nums, k):
    # Cut nums into k non-empty runs of neighbours. Make the largest run sum as small as possible.
    pass


print(split_array([7, 2, 5, 10, 8], 2))
`,
    tests: [
      { call: 'split_array', args: [[7, 2, 5, 10, 8], 2], expected: 18 },
      { call: 'split_array', args: [[1, 2, 3, 4, 5], 2], expected: 9 },
      { call: 'split_array', args: [[1, 4, 4], 3], expected: 4 },
      { call: 'split_array', args: [[10], 1], expected: 10 },
    ],
    hint: 'Binary search the answer between max(nums) and sum(nums). For a limit, count how many runs you need by starting a new run whenever adding the next number would go over it. The smallest limit needing at most k runs is the answer. Like sharing a long hike over k days so the hardest day is as easy as possible.',
  },
  {
    id: 190,
    example: 'Example: median_sorted([1, 2], [3, 4]) returns 2.5.',
    starter: `def median_sorted(a, b):
    # a and b are sorted. The median of all their numbers together, in O(log(m + n)).
    pass


print(median_sorted([1, 2], [3, 4]))
`,
    tests: [
      { call: 'median_sorted', args: [[1, 3], [2]], expected: 2.0, compare: 'approx' },
      { call: 'median_sorted', args: [[1, 2], [3, 4]], expected: 2.5, compare: 'approx' },
      { call: 'median_sorted', args: [[], [1]], expected: 1.0, compare: 'approx' },
      { call: 'median_sorted', args: [[0, 0], [0, 0]], expected: 0.0, compare: 'approx' },
      { call: 'median_sorted', args: [[1, 3, 8, 9, 15], [7, 11, 18, 19, 21, 25]], expected: 11.0, compare: 'approx' },
    ],
    hint: 'Binary search how many items to take from the shorter list (i), taking the rest of the left half from the other (j). The split is right when the biggest left item of each list is <= the smallest right item of the other; then the median comes from those four edge values. Like cutting two sorted decks so that every card on the left is smaller than every card on the right.',
    forbid: { names: ['sorted', 'sort'], why: 'This question asks for O(log(m + n)) without merging and sorting.' },
  },
];
