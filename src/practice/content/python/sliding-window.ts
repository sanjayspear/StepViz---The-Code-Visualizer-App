// Practice, Python: Sliding window (Q131-Q150). Reference solutions: tests/practice/sliding-window.solutions.ts.
import type { PracticeContent } from '../types';

export const SLIDING_WINDOW: PracticeContent[] = [
  {
    id: 131,
    example: 'Example: max_sum_k([2, 1, 5, 1, 3, 2], 3) returns 9 (5 + 1 + 3).',
    starter: `def max_sum_k(nums, k):
    # The largest sum of k neighbouring numbers (k <= len(nums)).
    pass


print(max_sum_k([2, 1, 5, 1, 3, 2], 3))
`,
    tests: [
      { call: 'max_sum_k', args: [[2, 1, 5, 1, 3, 2], 3], expected: 9 },
      { call: 'max_sum_k', args: [[2, 3, 4, 1, 5], 2], expected: 7 },
      { call: 'max_sum_k', args: [[1], 1], expected: 1 },
      { call: 'max_sum_k', args: [[-1, -2, -3], 2], expected: -3 },
    ],
    hint: 'Add up the first k numbers. Then slide: add the number entering on the right and subtract the one leaving on the left, keeping the best sum. Like a train window: as it moves one seat, one view comes in and one goes out.',
  },
  {
    id: 132,
    example: 'Example: window_averages([1, 3, 2, 6, -1, 4, 1, 8, 2], 5) returns [2.2, 2.8, 2.4, 3.6, 2.8].',
    starter: `def window_averages(nums, k):
    # The average of every run of k neighbouring numbers, as decimals ([] if k > len(nums)).
    pass


print(window_averages([1, 3, 2, 6, -1, 4, 1, 8, 2], 5))
`,
    tests: [
      { call: 'window_averages', args: [[1, 3, 2, 6, -1, 4, 1, 8, 2], 5], expected: [2.2, 2.8, 2.4, 3.6, 2.8], compare: 'approx' },
      { call: 'window_averages', args: [[1, 2, 3], 3], expected: [2.0], compare: 'approx' },
      { call: 'window_averages', args: [[5], 1], expected: [5.0], compare: 'approx' },
      { call: 'window_averages', args: [[1, 2], 3], expected: [], compare: 'approx' },
    ],
    hint: 'Keep the sum of the current window: add the new number, subtract the one that left, and record sum / k once the window has k numbers. Like a moving average of the last five days of temperatures.',
  },
  {
    id: 133,
    example: 'Example: first_negatives([12, -1, -7, 8, -15, 30, 16, 28], 3) returns [-1, -1, -7, -15, -15, 0].',
    starter: `def first_negatives(nums, k):
    # For every window of k neighbouring numbers, its first negative number (0 if it has none).
    pass


print(first_negatives([12, -1, -7, 8, -15, 30, 16, 28], 3))
`,
    tests: [
      { call: 'first_negatives', args: [[12, -1, -7, 8, -15, 30, 16, 28], 3], expected: [-1, -1, -7, -15, -15, 0] },
      { call: 'first_negatives', args: [[-8, 2, 3, -6, 10], 2], expected: [-8, 0, -6, -6] },
      { call: 'first_negatives', args: [[1, 2], 1], expected: [0, 0] },
      { call: 'first_negatives', args: [[-1, -2, -3], 3], expected: [-1] },
    ],
    hint: 'Keep a queue of the positions of negative numbers in the window. Add a position when its number is negative; drop positions that fell off the left. The front of the queue is the answer for each window. Like a queue at a counter where people leave once they are too far back.',
  },
  {
    id: 134,
    example: 'Example: max_vowels("abciiidef", 3) returns 3 ("iii").',
    starter: `def max_vowels(s, k):
    # The most vowels (a, e, i, o, u) in any k neighbouring letters.
    pass


print(max_vowels("abciiidef", 3))
`,
    tests: [
      { call: 'max_vowels', args: ['abciiidef', 3], expected: 3 },
      { call: 'max_vowels', args: ['aeiou', 2], expected: 2 },
      { call: 'max_vowels', args: ['leetcode', 3], expected: 2 },
      { call: 'max_vowels', args: ['rhythms', 4], expected: 0 },
    ],
    hint: 'Count the vowels in the first k letters, then slide: add 1 if the entering letter is a vowel and subtract 1 if the leaving letter was. Keep the best count. Like counting red cars in the last k cars to pass a crossing.',
  },
  {
    id: 135,
    example: 'Example: longest_unique_substring("abcabcbb") returns 3 ("abc").',
    starter: `def longest_unique_substring(s):
    # The length of the longest part of s with no repeated character.
    pass


print(longest_unique_substring("abcabcbb"))
`,
    tests: [
      { call: 'longest_unique_substring', args: ['abcabcbb'], expected: 3 },
      { call: 'longest_unique_substring', args: ['bbbbb'], expected: 1 },
      { call: 'longest_unique_substring', args: ['pwwkew'], expected: 3 },
      { call: 'longest_unique_substring', args: [''], expected: 0 },
      { call: 'longest_unique_substring', args: ['dvdf'], expected: 3 },
    ],
    hint: 'Remember the last position of each character. Move the right end along; if its character was seen inside the window, jump the left end to just after that earlier position. Keep the longest window. Like a queue where a second person with the same name makes everyone up to the first one leave.',
  },
  {
    id: 136,
    example: 'Example: longest_k_distinct("eceba", 2) returns 3 ("ece").',
    starter: `def longest_k_distinct(s, k):
    # The length of the longest part of s with at most k different characters.
    pass


print(longest_k_distinct("eceba", 2))
`,
    tests: [
      { call: 'longest_k_distinct', args: ['eceba', 2], expected: 3 },
      { call: 'longest_k_distinct', args: ['aa', 1], expected: 2 },
      { call: 'longest_k_distinct', args: ['a', 0], expected: 0 },
      { call: 'longest_k_distinct', args: ['aabbcc', 3], expected: 6 },
      { call: 'longest_k_distinct', args: ['abaccc', 2], expected: 4 },
    ],
    hint: 'Keep counts of the characters in the window. Grow on the right; while there are more than k different characters, shrink from the left (dropping a character when its count reaches 0). Keep the longest window. Like a lunch box that holds at most k kinds of snack.',
  },
  {
    id: 137,
    example: 'Example: character_replacement("AABABBA", 1) returns 4 ("AABA" -> "AAAA").',
    starter: `def character_replacement(s, k):
    # You may change up to k letters. The longest run of one repeated letter you can get.
    pass


print(character_replacement("AABABBA", 1))
`,
    tests: [
      { call: 'character_replacement', args: ['ABAB', 2], expected: 4 },
      { call: 'character_replacement', args: ['AABABBA', 1], expected: 4 },
      { call: 'character_replacement', args: ['A', 0], expected: 1 },
      { call: 'character_replacement', args: ['AAAA', 0], expected: 4 },
      { call: 'character_replacement', args: ['ABCDE', 1], expected: 2 },
    ],
    hint: 'In a window, the letters to change are window length minus the count of its most common letter. Grow the window; when that number is more than k, move the left end on. Keep the longest window. Like repainting a fence: keep the most common colour and repaint at most k boards.',
  },
  {
    id: 138,
    example: 'Example: longest_ones([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2) returns 6.',
    starter: `def longest_ones(nums, k):
    # nums holds 0s and 1s. You may flip at most k zeros. The longest run of 1s you can get.
    pass


print(longest_ones([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2))
`,
    tests: [
      { call: 'longest_ones', args: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], expected: 6 },
      { call: 'longest_ones', args: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], expected: 10 },
      { call: 'longest_ones', args: [[0], 0], expected: 0 },
      { call: 'longest_ones', args: [[1, 1], 0], expected: 2 },
    ],
    hint: 'Count the zeros in the window. Grow on the right; while there are more than k zeros, move the left end on (subtract a zero when one leaves). Keep the longest window. Like a road where you may fill in at most k potholes.',
  },
  {
    id: 139,
    example: 'Example: min_subarray_len(7, [2, 3, 1, 2, 4, 3]) returns 2 (4 + 3).',
    starter: `def min_subarray_len(target, nums):
    # The length of the shortest run of neighbouring (positive) numbers adding up to at least target, or 0.
    pass


print(min_subarray_len(7, [2, 3, 1, 2, 4, 3]))
`,
    tests: [
      { call: 'min_subarray_len', args: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
      { call: 'min_subarray_len', args: [4, [1, 4, 4]], expected: 1 },
      { call: 'min_subarray_len', args: [11, [1, 1, 1, 1, 1, 1, 1, 1]], expected: 0 },
      { call: 'min_subarray_len', args: [15, [1, 2, 3, 4, 5]], expected: 5 },
    ],
    hint: 'Grow the window on the right adding to the sum; while the sum is at least target, record the length and shrink from the left. Like filling a bucket with cups and then taking cups out while it is still full enough.',
  },
  {
    id: 140,
    example: 'Example: longest_two_values([1, 2, 3, 2, 2]) returns 4 ([2, 3, 2, 2]).',
    starter: `def longest_two_values(nums):
    # The length of the longest run of neighbouring items holding at most two different values.
    pass


print(longest_two_values([1, 2, 3, 2, 2]))
`,
    tests: [
      { call: 'longest_two_values', args: [[1, 2, 1]], expected: 3 },
      { call: 'longest_two_values', args: [[0, 1, 2, 2]], expected: 3 },
      { call: 'longest_two_values', args: [[1, 2, 3, 2, 2]], expected: 4 },
      { call: 'longest_two_values', args: [[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], expected: 5 },
      { call: 'longest_two_values', args: [[]], expected: 0 },
    ],
    hint: 'Count the values in the window; while there are more than two different values, shrink from the left. Keep the longest window. Like picking fruit along a row of trees with only two baskets, one kind of fruit per basket.',
  },
  {
    id: 141,
    example: 'Example: contains_permutation("ab", "eidbaooo") returns True ("ba").',
    starter: `def contains_permutation(p, s):
    # True if s has a part of len(p) neighbouring letters that is a reordering of p.
    pass


print(contains_permutation("ab", "eidbaooo"))
`,
    tests: [
      { call: 'contains_permutation', args: ['ab', 'eidbaooo'], expected: true },
      { call: 'contains_permutation', args: ['ab', 'eidboaoo'], expected: false },
      { call: 'contains_permutation', args: ['a', 'a'], expected: true },
      { call: 'contains_permutation', args: ['abc', 'bbbca'], expected: true },
      { call: 'contains_permutation', args: ['abc', 'ab'], expected: false },
    ],
    hint: 'Count the letters of p. Slide a window of len(p) over s keeping its letter counts (add the entering letter, remove the leaving one) and check whether the counts match. Like holding a stencil of fixed width over the text and checking the letters inside.',
  },
  {
    id: 142,
    example: 'Example: find_anagrams("cbaebabacd", "abc") returns [0, 6].',
    starter: `def find_anagrams(text, pattern):
    # Every start position in text where a reordering of pattern begins, in increasing order.
    pass


print(find_anagrams("cbaebabacd", "abc"))
`,
    tests: [
      { call: 'find_anagrams', args: ['cbaebabacd', 'abc'], expected: [0, 6] },
      { call: 'find_anagrams', args: ['abab', 'ab'], expected: [0, 1, 2] },
      { call: 'find_anagrams', args: ['a', 'ab'], expected: [] },
      { call: 'find_anagrams', args: ['aaaa', 'aa'], expected: [0, 1, 2] },
    ],
    hint: 'Same window as the permutation check: a window of len(pattern) with letter counts, slid one step at a time; record the start every time the counts match. Like a scanner passing over a barcode and beeping at every matching spot.',
  },
  {
    id: 143,
    example: 'Example: products_below_k([10, 5, 2, 6], 100) returns 8.',
    starter: `def products_below_k(nums, k):
    # How many runs of neighbouring (positive) numbers have a product less than k?
    pass


print(products_below_k([10, 5, 2, 6], 100))
`,
    tests: [
      { call: 'products_below_k', args: [[10, 5, 2, 6], 100], expected: 8 },
      { call: 'products_below_k', args: [[1, 2, 3], 0], expected: 0 },
      { call: 'products_below_k', args: [[1, 1, 1], 2], expected: 6 },
      { call: 'products_below_k', args: [[5], 10], expected: 1 },
    ],
    hint: 'Grow the window multiplying in the new number; while the product is k or more, divide out the left number and move left on. Every run ending at right and starting inside the window counts: add right - left + 1. Like counting all the ways to pick consecutive items from the end of a basket that stays under a weight limit.',
  },
  {
    id: 144,
    example: 'Example: longest_after_delete([1, 1, 0, 1]) returns 3.',
    starter: `def longest_after_delete(nums):
    # nums holds 0s and 1s. Delete exactly one item; the longest run of 1s left.
    pass


print(longest_after_delete([1, 1, 0, 1]))
`,
    tests: [
      { call: 'longest_after_delete', args: [[1, 1, 0, 1]], expected: 3 },
      { call: 'longest_after_delete', args: [[0, 1, 1, 1, 0, 1, 1, 0, 1]], expected: 5 },
      { call: 'longest_after_delete', args: [[1, 1, 1]], expected: 2 },
      { call: 'longest_after_delete', args: [[0]], expected: 0 },
    ],
    hint: 'Find the longest window with at most one zero; the answer is its length minus 1 (you must delete one item, the zero if there is one). Like removing one broken brick to join two straight walls.',
  },
  {
    id: 145,
    example: 'Example: max_card_points([1, 2, 3, 4, 5, 6, 1], 3) returns 12 (1 + 6 + 5).',
    starter: `def max_card_points(cards, k):
    # Take k cards, each from the left end or the right end. The biggest total.
    pass


print(max_card_points([1, 2, 3, 4, 5, 6, 1], 3))
`,
    tests: [
      { call: 'max_card_points', args: [[1, 2, 3, 4, 5, 6, 1], 3], expected: 12 },
      { call: 'max_card_points', args: [[2, 2, 2], 2], expected: 4 },
      { call: 'max_card_points', args: [[9, 7, 7, 9, 7, 7, 9], 7], expected: 55 },
      { call: 'max_card_points', args: [[1, 1000, 1], 1], expected: 1 },
      { call: 'max_card_points', args: [[1, 79, 80, 1, 1, 1, 200, 1], 3], expected: 202 },
    ],
    hint: 'Taking k cards from the ends leaves a middle run of len(cards) - k cards. Find the middle window with the smallest sum (a sliding window), and the answer is the total minus it. Like choosing which slice of a cake to leave behind.',
  },
  {
    id: 146,
    example: 'Example: min_swaps_group_ones([1, 0, 1, 0, 1]) returns 1.',
    starter: `def min_swaps_group_ones(data):
    # data holds 0s and 1s. The fewest swaps of two items that put all the 1s side by side.
    pass


print(min_swaps_group_ones([1, 0, 1, 0, 1]))
`,
    tests: [
      { call: 'min_swaps_group_ones', args: [[1, 0, 1, 0, 1]], expected: 1 },
      { call: 'min_swaps_group_ones', args: [[0, 0, 0, 1, 0]], expected: 0 },
      { call: 'min_swaps_group_ones', args: [[1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1]], expected: 3 },
      { call: 'min_swaps_group_ones', args: [[1]], expected: 0 },
    ],
    hint: 'If there are m ones, they will end up in some window of length m. Slide a window of length m and find the one that already holds the most ones; the zeros in it are the swaps needed. Like rearranging a car park so all red cars stand together: pick the stretch that already has the most red cars.',
  },
  {
    id: 147,
    example: 'Example: count_anagram_windows("forxxorfxdofr", "for") returns 3.',
    starter: `def count_anagram_windows(text, word):
    # How many places in text hold a reordering of word (as neighbouring letters)?
    pass


print(count_anagram_windows("forxxorfxdofr", "for"))
`,
    tests: [
      { call: 'count_anagram_windows', args: ['forxxorfxdofr', 'for'], expected: 3 },
      { call: 'count_anagram_windows', args: ['aabaabaa', 'aaba'], expected: 4 },
      { call: 'count_anagram_windows', args: ['abc', 'd'], expected: 0 },
      { call: 'count_anagram_windows', args: ['aaa', 'a'], expected: 3 },
    ],
    hint: 'Slide a window of len(word) over text with letter counts and count how many windows match the counts of word. Like counting how many times a set of jigsaw pieces fits along a row.',
  },
  {
    id: 148,
    example: 'Example: exactly_k_distinct([1, 2, 1, 2, 3], 2) returns 7.',
    starter: `def exactly_k_distinct(nums, k):
    # How many runs of neighbouring numbers hold exactly k different values?
    pass


print(exactly_k_distinct([1, 2, 1, 2, 3], 2))
`,
    tests: [
      { call: 'exactly_k_distinct', args: [[1, 2, 1, 2, 3], 2], expected: 7 },
      { call: 'exactly_k_distinct', args: [[1, 2, 1, 3, 4], 3], expected: 3 },
      { call: 'exactly_k_distinct', args: [[1], 1], expected: 1 },
      { call: 'exactly_k_distinct', args: [[1, 2], 3], expected: 0 },
    ],
    hint: 'Counting "at most k" is easy with a sliding window (every run ending at right inside the window counts). Exactly k = at most k minus at most k - 1. Like counting teams of up to 5 players, then taking away the teams of up to 4.',
  },
  {
    id: 149,
    example: 'Example: max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3) returns [3, 3, 5, 5, 6, 7].',
    starter: `def max_sliding_window(nums, k):
    # The largest number in every window of k neighbouring numbers.
    pass


print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
`,
    tests: [
      { call: 'max_sliding_window', args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
      { call: 'max_sliding_window', args: [[1], 1], expected: [1] },
      { call: 'max_sliding_window', args: [[9, 8, 7], 2], expected: [9, 8] },
      { call: 'max_sliding_window', args: [[1, -1], 1], expected: [1, -1] },
      { call: 'max_sliding_window', args: [[4, 2, 12, 3, 8, 1, 7], 4], expected: [12, 12, 12, 8] },
    ],
    hint: 'Keep a deque of positions whose values go down from front to back. Before adding a new position, pop smaller values from the back (they can never be the largest again); drop the front if it left the window. The front is each window\'s largest. Like a queue where shorter people step aside for a taller newcomer.',
  },
  {
    id: 150,
    example: 'Example: longest_with_k_repeats("ababbc", 2) returns 5 ("ababb").',
    starter: `def longest_with_k_repeats(s, k):
    # The length of the longest part of s where every character appears at least k times.
    pass


print(longest_with_k_repeats("ababbc", 2))
`,
    tests: [
      { call: 'longest_with_k_repeats', args: ['aaabb', 3], expected: 3 },
      { call: 'longest_with_k_repeats', args: ['ababbc', 2], expected: 5 },
      { call: 'longest_with_k_repeats', args: ['a', 2], expected: 0 },
      { call: 'longest_with_k_repeats', args: ['aaa', 1], expected: 3 },
      { call: 'longest_with_k_repeats', args: ['ababacb', 3], expected: 0 },
    ],
    hint: 'Divide and conquer: a character that appears fewer than k times in s can never be inside the answer, so split s at it and solve each piece; if no such character exists, the whole of s is the answer. Like cutting out the bruised parts of an apple and keeping the biggest good piece.',
  },
];
