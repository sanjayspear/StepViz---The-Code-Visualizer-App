// Practice, Python: Hash maps & sets (Q86-Q110). Reference solutions: tests/practice/hash-maps-sets.solutions.ts.
import { DICT_LITERAL, type PracticeContent } from '../types';

const SUDOKU_VALID = [
  ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
  ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
  ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
  ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
  ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
  ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
  ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
  ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
  ['.', '.', '.', '.', '8', '.', '.', '7', '9'],
];
const SUDOKU_BAD_BOX = SUDOKU_VALID.map((row, r) => (r === 0 ? ['8', ...row.slice(1)] : row));
const SUDOKU_BAD_ROW = SUDOKU_VALID.map((row, r) => (r === 1 ? ['6', '.', '.', '1', '9', '5', '.', '6', '.'] : row));
const EMPTY = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => '.'));

export const HASH_MAPS_SETS: PracticeContent[] = [
  {
    id: 86,
    example: 'Example: two_sum([2, 7, 11, 15], 9) returns [0, 1].',
    starter: `def two_sum(nums, target):
    # The positions [i, j] (i < j) of the two numbers that add up to target (there is exactly one pair).
    pass


print(two_sum([2, 7, 11, 15], 9))
`,
    tests: [
      { call: 'two_sum', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { call: 'two_sum', args: [[3, 2, 4], 6], expected: [1, 2] },
      { call: 'two_sum', args: [[3, 3], 6], expected: [0, 1] },
      { call: 'two_sum', args: [[1, 5, 7], 12], expected: [1, 2] },
    ],
    hint: 'Walk through the list keeping a dictionary of value -> position for the numbers already seen. For each x, check whether target - x is in the dictionary: if so, you have the pair. Like looking for a dance partner whose height adds up to the right total, asking the room as each person walks in.',
  },
  {
    id: 87,
    example: 'Example: contains_duplicate([1, 2, 3, 1]) returns True.',
    starter: `def contains_duplicate(nums):
    # True if any value appears at least twice.
    pass


print(contains_duplicate([1, 2, 3, 1]))
`,
    tests: [
      { call: 'contains_duplicate', args: [[1, 2, 3, 1]], expected: true },
      { call: 'contains_duplicate', args: [[1, 2, 3, 4]], expected: false },
      { call: 'contains_duplicate', args: [[]], expected: false },
      { call: 'contains_duplicate', args: [[1, 1, 1]], expected: true },
    ],
    hint: 'Keep a set of values seen; if a value is already in the set, there is a duplicate. (Or compare len(set(nums)) with len(nums).) Like a cloakroom attendant who notices a second coat with the same ticket.',
  },
  {
    id: 88,
    example: 'Example: element_frequency([1, 2, 2, 3, 3, 3]) returns {1: 1, 2: 2, 3: 3}.',
    starter: `def element_frequency(nums):
    # A dictionary: each value -> how many times it appears.
    pass


print(element_frequency([1, 2, 2, 3, 3, 3]))
`,
    tests: [
      { call: 'element_frequency', args: [[1, 2, 2, 3, 3, 3]], expected: { 1: 1, 2: 2, 3: 3 }, intKeys: true },
      { call: 'element_frequency', args: [[]], expected: {}, intKeys: true },
      { call: 'element_frequency', args: [[5, 5]], expected: { 5: 2 }, intKeys: true },
      { call: 'element_frequency', args: [[-1, 2, -1]], expected: { '-1': 2, 2: 1 }, intKeys: true },
    ],
    hint: 'Start with an empty dictionary and add 1 to the count of each value: counts[x] = counts.get(x, 0) + 1. Like counting votes by keeping a tally next to each candidate.',
  },
  {
    id: 89,
    example: 'Example: most_frequent([1, 3, 2, 3, 1, 3]) returns 3; for a tie, the smallest value.',
    starter: `def most_frequent(nums):
    # The value that appears most often; if several tie, the smallest of them.
    pass


print(most_frequent([1, 3, 2, 3, 1, 3]))
`,
    tests: [
      { call: 'most_frequent', args: [[1, 3, 2, 3, 1, 3]], expected: 3 },
      { call: 'most_frequent', args: [[4]], expected: 4 },
      { call: 'most_frequent', args: [[2, 1, 2, 1]], expected: 1 },
      { call: 'most_frequent', args: [[5, 5, 6, 6, 6]], expected: 6 },
    ],
    hint: 'Count every value in a dictionary, then pick the value with the biggest count, breaking ties by the smaller value (compare (count, -value) pairs, or loop and update carefully). Like finding the most popular ice-cream flavour from a tally sheet.',
  },
  {
    id: 90,
    example: 'Example: appear_once([4, 3, 2, 7, 8, 2, 3, 1]) returns [4, 7, 8, 1].',
    starter: `def appear_once(nums):
    # The values that appear exactly once, in the order they appear.
    pass


print(appear_once([4, 3, 2, 7, 8, 2, 3, 1]))
`,
    tests: [
      { call: 'appear_once', args: [[4, 3, 2, 7, 8, 2, 3, 1]], expected: [4, 7, 8, 1] },
      { call: 'appear_once', args: [[1, 1]], expected: [] },
      { call: 'appear_once', args: [[1, 2]], expected: [1, 2] },
      { call: 'appear_once', args: [[]], expected: [] },
    ],
    hint: 'Count every value first, then go through nums again and keep the values whose count is 1. Like finding the guests who came alone after checking the guest list.',
  },
  {
    id: 91,
    example: 'Example: same_elements([1, 2, 3], [3, 2, 1]) returns True.',
    starter: `def same_elements(a, b):
    # True if a and b hold the same values the same number of times, in any order.
    pass


print(same_elements([1, 2, 3], [3, 2, 1]))
`,
    tests: [
      { call: 'same_elements', args: [[1, 2, 3], [3, 2, 1]], expected: true },
      { call: 'same_elements', args: [[1, 2, 2], [2, 1, 1]], expected: false },
      { call: 'same_elements', args: [[], []], expected: true },
      { call: 'same_elements', args: [[1], [1, 1]], expected: false },
    ],
    hint: 'Count the values of a in a dictionary, subtract the values of b, and check that every count ends at 0. Like checking that two shopping bags hold exactly the same items.',
  },
  {
    id: 92,
    example: 'Example: common_in_three([1, 5, 10, 20, 40, 80], [6, 7, 20, 80, 100], [3, 4, 15, 20, 30, 70, 80, 120]) returns [20, 80].',
    starter: `def common_in_three(a, b, c):
    # a, b and c are sorted. The values found in all three, each once, in increasing order.
    pass


print(common_in_three([1, 5, 10, 20, 40, 80], [6, 7, 20, 80, 100], [3, 4, 15, 20, 30, 70, 80, 120]))
`,
    tests: [
      { call: 'common_in_three', args: [[1, 5, 10, 20, 40, 80], [6, 7, 20, 80, 100], [3, 4, 15, 20, 30, 70, 80, 120]], expected: [20, 80] },
      { call: 'common_in_three', args: [[1, 2, 3], [4, 5], [1]], expected: [] },
      { call: 'common_in_three', args: [[1, 1, 2], [1, 1, 3], [1, 1]], expected: [1] },
      { call: 'common_in_three', args: [[2], [2], [2]], expected: [2] },
    ],
    hint: 'Three pointers, one per list. If all three values are equal, record it (once) and move all three on; otherwise move the pointer with the smallest value. Like three friends walking along three sorted shelves, stopping when they all hold the same book.',
  },
  {
    id: 93,
    example: 'Example: is_isomorphic("egg", "add") returns True.',
    starter: `def is_isomorphic(s, t):
    # True if each letter of s can be replaced (always by the same letter, no two letters
    # by the same one) to make t.
    pass


print(is_isomorphic("egg", "add"))
`,
    tests: [
      { call: 'is_isomorphic', args: ['egg', 'add'], expected: true },
      { call: 'is_isomorphic', args: ['foo', 'bar'], expected: false },
      { call: 'is_isomorphic', args: ['paper', 'title'], expected: true },
      { call: 'is_isomorphic', args: ['badc', 'baba'], expected: false },
      { call: 'is_isomorphic', args: ['', ''], expected: true },
    ],
    hint: 'Keep two dictionaries, s-letter -> t-letter and t-letter -> s-letter. At each position, both must agree with what was seen before (or be new). Like a secret code: each letter always turns into the same letter, and no two letters share a code.',
  },
  {
    id: 94,
    example: 'Example: word_pattern("abba", "dog cat cat dog") returns True.',
    starter: `def word_pattern(pattern, s):
    # True if the words of s follow the pattern: same letter = same word, different letter = different word.
    pass


print(word_pattern("abba", "dog cat cat dog"))
`,
    tests: [
      { call: 'word_pattern', args: ['abba', 'dog cat cat dog'], expected: true },
      { call: 'word_pattern', args: ['abba', 'dog cat cat fish'], expected: false },
      { call: 'word_pattern', args: ['aaaa', 'dog cat cat dog'], expected: false },
      { call: 'word_pattern', args: ['abba', 'dog dog dog dog'], expected: false },
      { call: 'word_pattern', args: ['a', 'dog'], expected: true },
      { call: 'word_pattern', args: ['ab', 'dog'], expected: false },
    ],
    hint: 'Split s into words; if there are not as many words as letters, the answer is no. Then use two dictionaries (letter -> word and word -> letter), exactly like checking an isomorphism. Like a seating plan: each letter is a seat, and each seat has one guest.',
  },
  {
    id: 95,
    example: 'Example: can_construct("aa", "aab") returns True.',
    starter: `def can_construct(note, magazine):
    # True if the letters of magazine (each used once) are enough to write note.
    pass


print(can_construct("aa", "aab"))
`,
    tests: [
      { call: 'can_construct', args: ['a', 'b'], expected: false },
      { call: 'can_construct', args: ['aa', 'ab'], expected: false },
      { call: 'can_construct', args: ['aa', 'aab'], expected: true },
      { call: 'can_construct', args: ['', 'x'], expected: true },
      { call: 'can_construct', args: ['abc', 'cbaxyz'], expected: true },
    ],
    hint: 'Count the letters of the magazine, then go through the note taking one away for each letter; if any count would go below 0, you cannot write the note. Like cutting letters out of a magazine for a poster: each cut-out can be used once.',
  },
  {
    id: 96,
    example: 'Example: is_happy(19) returns True (1² + 9² = 82, 8² + 2² = 68, 6² + 8² = 100, 1² + 0² + 0² = 1).',
    starter: `def is_happy(n):
    # Replace n by the sum of the squares of its digits again and again.
    # True if this reaches 1, False if it loops forever.
    pass


print(is_happy(19))
`,
    tests: [
      { call: 'is_happy', args: [19], expected: true },
      { call: 'is_happy', args: [2], expected: false },
      { call: 'is_happy', args: [1], expected: true },
      { call: 'is_happy', args: [7], expected: true },
      { call: 'is_happy', args: [4], expected: false },
    ],
    hint: 'Keep a set of the numbers you have already seen. Stop with True at 1, and with False when a number comes back (you are going round in a circle). Like a walk where seeing the same signpost twice means you are lost in a loop.',
  },
  {
    id: 97,
    example: 'Example: nearby_duplicate([1, 2, 3, 1], 3) returns True.',
    starter: `def nearby_duplicate(nums, k):
    # True if two equal values sit at most k positions apart.
    pass


print(nearby_duplicate([1, 2, 3, 1], 3))
`,
    tests: [
      { call: 'nearby_duplicate', args: [[1, 2, 3, 1], 3], expected: true },
      { call: 'nearby_duplicate', args: [[1, 0, 1, 1], 1], expected: true },
      { call: 'nearby_duplicate', args: [[1, 2, 3, 1, 2, 3], 2], expected: false },
      { call: 'nearby_duplicate', args: [[], 0], expected: false },
    ],
    hint: 'Remember the last position of each value in a dictionary. When a value comes again, check whether i - last[value] <= k, then update its last position. Like noticing a friend who sat in your row within the last few seats.',
  },
  {
    id: 98,
    example: 'Example: top_k_frequent([1, 1, 1, 2, 2, 3], 2) returns [1, 2] (in any order).',
    starter: `def top_k_frequent(nums, k):
    # The k values that appear most often (in any order).
    pass


print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))
`,
    tests: [
      { call: 'top_k_frequent', args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2], compare: 'unordered' },
      { call: 'top_k_frequent', args: [[1], 1], expected: [1], compare: 'unordered' },
      { call: 'top_k_frequent', args: [[4, 4, 5, 5, 5, 6], 1], expected: [5], compare: 'unordered' },
      { call: 'top_k_frequent', args: [[7, 8, 9, 7, 8, 7], 3], expected: [7, 8, 9], compare: 'unordered' },
    ],
    hint: 'Count every value, then put the values in buckets by their count (bucket[c] holds values seen c times) and collect from the highest bucket down until you have k. (Sorting by count also works.) Like a music chart: the songs with the most plays come first.',
  },
  {
    id: 99,
    example: 'Example: frequency_sort("tree") returns "eert" (most frequent first; ties in alphabetical order).',
    starter: `def frequency_sort(s):
    # Sort the characters by how often they appear, most often first.
    # Characters with the same count go in alphabetical (character code) order.
    pass


print(frequency_sort("tree"))
`,
    tests: [
      { call: 'frequency_sort', args: ['tree'], expected: 'eert' },
      { call: 'frequency_sort', args: ['cccaaa'], expected: 'aaaccc' },
      { call: 'frequency_sort', args: ['Aabb'], expected: 'bbAa' },
      { call: 'frequency_sort', args: [''], expected: '' },
    ],
    hint: 'Count the characters, then sort the distinct characters by (-count, character) and write each one count times. Like arranging trophies: the biggest pile in front, equal piles in alphabetical order.',
  },
  {
    id: 100,
    example: 'Example: subarray_sum_count([1, 1, 1], 2) returns 2.',
    starter: `def subarray_sum_count(nums, k):
    # How many runs of neighbouring items add up to exactly k?
    pass


print(subarray_sum_count([1, 1, 1], 2))
`,
    tests: [
      { call: 'subarray_sum_count', args: [[1, 1, 1], 2], expected: 2 },
      { call: 'subarray_sum_count', args: [[1, 2, 3], 3], expected: 2 },
      { call: 'subarray_sum_count', args: [[1, -1, 0], 0], expected: 3 },
      { call: 'subarray_sum_count', args: [[], 0], expected: 0 },
    ],
    hint: 'Keep the running total and a dictionary of how often each running total has appeared (start with {0: 1}). A run ending here adds up to k exactly when total - k appeared before, so add that count. Like checking your bank balance: two balances differing by k mean the purchases in between cost k.',
  },
  {
    id: 101,
    example: 'Example: longest_zero_sum([15, -2, 2, -8, 1, 7, 10, 23]) returns 5 (-2, 2, -8, 1, 7).',
    starter: `def longest_zero_sum(nums):
    # The length of the longest run of neighbouring items that adds up to 0 (0 if none).
    pass


print(longest_zero_sum([15, -2, 2, -8, 1, 7, 10, 23]))
`,
    tests: [
      { call: 'longest_zero_sum', args: [[15, -2, 2, -8, 1, 7, 10, 23]], expected: 5 },
      { call: 'longest_zero_sum', args: [[1, 2, 3]], expected: 0 },
      { call: 'longest_zero_sum', args: [[0]], expected: 1 },
      { call: 'longest_zero_sum', args: [[1, -1, 3, 2, -2, -3, 3]], expected: 6 },
    ],
    hint: 'Keep the running total and remember the first position where each total appeared (total 0 at position -1). When a total appears again, the items in between add up to 0: compare that distance with the best. Like a walk that returns to the same height: the path in between went up and down by the same amount.',
  },
  {
    id: 102,
    example: 'Example: longest_equal_01([0, 1, 0]) returns 2.',
    starter: `def longest_equal_01(nums):
    # nums holds 0s and 1s. The length of the longest run with as many 0s as 1s.
    pass


print(longest_equal_01([0, 1, 0]))
`,
    tests: [
      { call: 'longest_equal_01', args: [[0, 1]], expected: 2 },
      { call: 'longest_equal_01', args: [[0, 1, 0]], expected: 2 },
      { call: 'longest_equal_01', args: [[0, 0, 1, 0, 0, 0, 1, 1]], expected: 6 },
      { call: 'longest_equal_01', args: [[1, 1, 1]], expected: 0 },
    ],
    hint: 'Count a 1 as +1 and a 0 as -1; a run with equal numbers adds up to 0. Then use the same trick as the longest zero-sum run: remember where each running total first appeared. Like a scoreboard that is level again: both teams scored the same in between.',
  },
  {
    id: 103,
    example: 'Example: pairs_with_difference([3, 1, 4, 1, 5], 2) returns 2 ((1, 3) and (3, 5)).',
    starter: `def pairs_with_difference(nums, k):
    # How many different pairs of values (a, b) with b - a == k are in nums? (k is 0 or more.)
    pass


print(pairs_with_difference([3, 1, 4, 1, 5], 2))
`,
    tests: [
      { call: 'pairs_with_difference', args: [[3, 1, 4, 1, 5], 2], expected: 2 },
      { call: 'pairs_with_difference', args: [[1, 2, 3, 4, 5], 1], expected: 4 },
      { call: 'pairs_with_difference', args: [[1, 3, 1, 5, 4], 0], expected: 1 },
      { call: 'pairs_with_difference', args: [[1, 2], 3], expected: 0 },
    ],
    hint: 'Count the values in a dictionary. For k > 0, count the distinct values x where x + k is also there; for k == 0, count the values that appear at least twice. Like pairing people whose ages differ by exactly k years, each pair of ages counted once.',
  },
  {
    id: 104,
    example: 'Example: pairs_divisible_by_k([2, 2, 1, 7, 5, 3], 4) returns 5.',
    starter: `def pairs_divisible_by_k(nums, k):
    # How many pairs of positions i < j have (nums[i] + nums[j]) divisible by k?
    pass


print(pairs_divisible_by_k([2, 2, 1, 7, 5, 3], 4))
`,
    tests: [
      { call: 'pairs_divisible_by_k', args: [[2, 2, 1, 7, 5, 3], 4], expected: 5 },
      { call: 'pairs_divisible_by_k', args: [[1, 2, 3], 3], expected: 1 },
      { call: 'pairs_divisible_by_k', args: [[3, 3, 3], 3], expected: 3 },
      { call: 'pairs_divisible_by_k', args: [[1, 1], 5], expected: 0 },
    ],
    hint: 'Only remainders matter. Walk through the numbers keeping a count of remainders seen; for x with remainder r, it pairs with every earlier number whose remainder is (k - r) % k. Add that count, then record r. Like matching puzzle pieces whose bumps and holes add up to a whole.',
  },
  {
    id: 105,
    example: 'Example: valid_sudoku(board) returns True when no row, column or 3×3 box repeats a digit.',
    starter: `def valid_sudoku(board):
    # board is 9 rows of 9 cells, each "1"-"9" or "." for empty.
    # True if no row, column or 3x3 box holds the same digit twice.
    pass


empty = [["."] * 9 for _ in range(9)]
print(valid_sudoku(empty))
`,
    tests: [
      { call: 'valid_sudoku', args: [SUDOKU_VALID], expected: true },
      { call: 'valid_sudoku', args: [SUDOKU_BAD_BOX], expected: false },
      { call: 'valid_sudoku', args: [SUDOKU_BAD_ROW], expected: false },
      { call: 'valid_sudoku', args: [EMPTY], expected: true },
    ],
    hint: 'Keep a set for every row, every column and every box (box number r // 3 * 3 + c // 3). For each digit, if it is already in its row, column or box set, the board is not valid; otherwise add it to all three. Like a hotel where no floor, corridor or wing may have two guests with the same name.',
  },
  {
    id: 106,
    example: 'Example: four_sum_count([1, 2], [-2, -1], [-1, 2], [0, 2]) returns 2.',
    starter: `def four_sum_count(a, b, c, d):
    # How many ways to pick one number from each list so the four add up to 0?
    pass


print(four_sum_count([1, 2], [-2, -1], [-1, 2], [0, 2]))
`,
    tests: [
      { call: 'four_sum_count', args: [[1, 2], [-2, -1], [-1, 2], [0, 2]], expected: 2 },
      { call: 'four_sum_count', args: [[0], [0], [0], [0]], expected: 1 },
      { call: 'four_sum_count', args: [[1], [1], [1], [1]], expected: 0 },
      { call: 'four_sum_count', args: [[1, -1], [1, -1], [1, -1], [1, -1]], expected: 6 },
    ],
    hint: 'Count every sum x + y of a pair from a and b in a dictionary. Then for each pair from c and d, add the count of -(z + w). That is O(n²) instead of O(n⁴). Like matching two halves of a torn ticket: count the left halves first, then look up each right half.',
  },
  {
    id: 107,
    example: 'Example: m = MyHashMap(); m.put(1, 1); m.get(1) returns 1; m.get(3) returns -1.',
    starter: `class MyHashMap:
    # A hash map built from scratch, without dict or set.
    def __init__(self):
        pass

    def put(self, key, value):
        # Store value for key (replace an old value).
        pass

    def get(self, key):
        # The value for key, or -1 if there is none.
        pass

    def remove(self, key):
        # Forget key (if it is there).
        pass


m = MyHashMap()
m.put(1, 1)
print(m.get(1), m.get(3))
`,
    tests: [
      {
        call: '$ops',
        cls: 'MyHashMap',
        ops: [['MyHashMap'], ['put', 1, 1], ['put', 2, 2], ['get', 1], ['get', 3], ['put', 2, 1], ['get', 2], ['remove', 2], ['get', 2]],
        expected: [null, null, null, 1, -1, null, 1, null, -1],
      },
      { call: '$ops', cls: 'MyHashMap', ops: [['MyHashMap'], ['get', 5], ['remove', 5], ['put', 1000, 7], ['get', 1000]], expected: [null, -1, null, null, 7] },
      {
        call: '$ops',
        cls: 'MyHashMap',
        ops: [['MyHashMap'], ['put', 1, 10], ['put', 1001, 20], ['put', 2001, 30], ['remove', 1001], ['get', 1], ['get', 1001], ['get', 2001]],
        expected: [null, null, null, null, null, 10, -1, 30],
      },
    ],
    hint: 'Make a list of buckets (say 1000 empty lists). A key goes in bucket key % 1000; each bucket holds [key, value] pairs, and you search only that small bucket. Like a cloakroom with numbered rails: you only look along the rail your ticket number points to.',
    forbid: { names: ['dict', 'set', 'defaultdict', 'OrderedDict', 'Counter', 'frozenset'], patterns: [DICT_LITERAL], why: 'This question asks you to build the hash map yourself, without dict or set.' },
  },
  {
    id: 108,
    example: 'Example: c = LRUCache(2); c.put(1, 1); c.put(2, 2); c.get(1) returns 1; c.put(3, 3) removes key 2.',
    starter: `class LRUCache:
    # Holds at most capacity keys; when full, putting a new key removes the least recently used one.
    def __init__(self, capacity):
        pass

    def get(self, key):
        # The value for key (and key becomes the most recently used), or -1.
        pass

    def put(self, key, value):
        # Store value for key (key becomes the most recently used).
        pass


c = LRUCache(2)
c.put(1, 1)
print(c.get(1))
`,
    tests: [
      {
        call: '$ops',
        cls: 'LRUCache',
        ops: [['LRUCache', 2], ['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
      },
      { call: '$ops', cls: 'LRUCache', ops: [['LRUCache', 1], ['put', 2, 1], ['get', 2], ['put', 3, 2], ['get', 2], ['get', 3]], expected: [null, null, 1, null, -1, 2] },
      {
        call: '$ops',
        cls: 'LRUCache',
        ops: [['LRUCache', 2], ['put', 1, 1], ['put', 2, 2], ['put', 1, 10], ['put', 3, 3], ['get', 1], ['get', 2]],
        expected: [null, null, null, null, null, 10, -1],
      },
    ],
    hint: 'Keep a dictionary for the values plus the order of use, least recent first. Python\'s OrderedDict does both: move_to_end(key) on every get or put, and popitem(last=False) removes the oldest when you are over capacity. Like a small bookshelf: the book you just read goes on the right, and when it is full you give away the one on the far left.',
  },
  {
    id: 109,
    example: 'Example: group_shifted(["abc", "bcd", "xyz", "az", "ba"]) returns [["abc", "bcd", "xyz"], ["az", "ba"]] (in any order).',
    starter: `def group_shifted(strings):
    # Group the words that are shifts of each other ("abc" -> "bcd": every letter one further,
    # z wraps round to a). A list of groups, in any order.
    pass


print(group_shifted(["abc", "bcd", "acef", "xyz", "az", "ba", "a", "z"]))
`,
    tests: [
      { call: 'group_shifted', args: [['abc', 'bcd', 'acef', 'xyz', 'az', 'ba', 'a', 'z']], expected: [['acef'], ['a', 'z'], ['abc', 'bcd', 'xyz'], ['az', 'ba']], compare: 'sets' },
      { call: 'group_shifted', args: [['a']], expected: [['a']], compare: 'sets' },
      { call: 'group_shifted', args: [['ab', 'cd', 'ba']], expected: [['ab', 'cd'], ['ba']], compare: 'sets' },
      { call: 'group_shifted', args: [['bcd', 'cde', 'yza']], expected: [['bcd', 'cde', 'yza']], compare: 'sets' },
    ],
    hint: 'Shifted words have the same gaps between neighbouring letters. Use the tuple of gaps (ord(w[i]) - ord(w[i - 1])) % 26 as a dictionary key and group the words by it. Like songs that sound alike in a different key: the steps between the notes are the same.',
  },
  {
    id: 110,
    example: 'Example: first_missing_positive([3, 4, -1, 1]) returns 2.',
    starter: `def first_missing_positive(nums):
    # The smallest positive whole number that is not in nums, in O(n) time and O(1) extra space.
    pass


print(first_missing_positive([3, 4, -1, 1]))
`,
    tests: [
      { call: 'first_missing_positive', args: [[1, 2, 0]], expected: 3 },
      { call: 'first_missing_positive', args: [[3, 4, -1, 1]], expected: 2 },
      { call: 'first_missing_positive', args: [[7, 8, 9, 11, 12]], expected: 1 },
      { call: 'first_missing_positive', args: [[1]], expected: 2 },
      { call: 'first_missing_positive', args: [[]], expected: 1 },
    ],
    hint: 'The answer is between 1 and n + 1. Put every value v from 1 to n into its own seat, position v - 1, by swapping (keep swapping while the seat holds the wrong value). Then the first position i with nums[i] != i + 1 gives i + 1. Like a cinema where everyone moves to their numbered seat: the first empty seat is the missing ticket.',
  },
];
