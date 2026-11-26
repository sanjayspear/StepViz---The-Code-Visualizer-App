// Practice, Python: Two pointers (Q111-Q130). Reference solutions: tests/practice/two-pointers.solutions.ts.
import type { PracticeContent } from '../types';

const NO_SORT = { names: ['sorted', 'sort'], why: 'This question asks you to do it without sorting.' };

export const TWO_POINTERS: PracticeContent[] = [
  {
    id: 111,
    example: 'Example: two_sum_sorted([2, 7, 11, 15], 9) returns [0, 1].',
    starter: `def two_sum_sorted(nums, target):
    # nums is sorted. The positions [i, j] (i < j) of two numbers that add up to target.
    pass


print(two_sum_sorted([2, 7, 11, 15], 9))
`,
    tests: [
      { call: 'two_sum_sorted', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { call: 'two_sum_sorted', args: [[2, 3, 4], 6], expected: [0, 2] },
      { call: 'two_sum_sorted', args: [[-1, 0], -1], expected: [0, 1] },
      { call: 'two_sum_sorted', args: [[1, 2, 3, 4, 4, 9, 56, 90], 8], expected: [3, 4] },
    ],
    hint: 'One pointer at each end. If the two numbers add up to too much, move the right one left; too little, move the left one right; equal, you are done. Like two people on a see-saw shuffling towards the middle until it balances.',
  },
  {
    id: 112,
    example: 'Example: reverse_vowels("hello") returns "holle".',
    starter: `def reverse_vowels(s):
    # Reverse the order of the vowels (a, e, i, o, u in any case); everything else stays put.
    pass


print(reverse_vowels("hello"))
`,
    tests: [
      { call: 'reverse_vowels', args: ['hello'], expected: 'holle' },
      { call: 'reverse_vowels', args: ['leetcode'], expected: 'leotcede' },
      { call: 'reverse_vowels', args: [''], expected: '' },
      { call: 'reverse_vowels', args: ['aA'], expected: 'Aa' },
      { call: 'reverse_vowels', args: ['xyz'], expected: 'xyz' },
    ],
    hint: 'Turn s into a list. Move a left pointer right until it finds a vowel and a right pointer left until it finds one; swap them and keep going until the pointers meet. Like two people swapping only the red cards in a row, starting from both ends.',
  },
  {
    id: 113,
    example: 'Example: remove_element([3, 2, 2, 3], 3) returns 2, and the list starts [2, 2].',
    starter: `def remove_element(nums, val):
    # Move every item that is not val to the front of nums (any order), in place,
    # and return how many there are.
    pass


nums = [3, 2, 2, 3]
k = remove_element(nums, 3)
print(k, nums[:k])
`,
    tests: [
      { call: 'remove_element', args: [[3, 2, 2, 3], 3], expected: 2, mutated: { arg: 0, value: [2, 2], prefix: true }, compare: 'unordered' },
      { call: 'remove_element', args: [[0, 1, 2, 2, 3, 0, 4, 2], 2], expected: 5, mutated: { arg: 0, value: [0, 1, 3, 0, 4], prefix: true }, compare: 'unordered' },
      { call: 'remove_element', args: [[], 1], expected: 0, mutated: { arg: 0, value: [], prefix: true }, compare: 'unordered' },
      { call: 'remove_element', args: [[1], 1], expected: 0, mutated: { arg: 0, value: [], prefix: true }, compare: 'unordered' },
    ],
    hint: 'Keep a write position k. For every item that is not val, copy it to nums[k] and add 1 to k. Return k. Like a bouncer letting through everyone except people wearing one colour, filling the front seats in turn.',
  },
  {
    id: 114,
    example: 'Example: sorted_squares([-4, -1, 0, 3, 10]) returns [0, 1, 9, 16, 100].',
    starter: `def sorted_squares(nums):
    # nums is sorted. The squares of its numbers, also sorted, without sorting.
    pass


print(sorted_squares([-4, -1, 0, 3, 10]))
`,
    tests: [
      { call: 'sorted_squares', args: [[-4, -1, 0, 3, 10]], expected: [0, 1, 9, 16, 100] },
      { call: 'sorted_squares', args: [[-7, -3, 2, 3, 11]], expected: [4, 9, 9, 49, 121] },
      { call: 'sorted_squares', args: [[]], expected: [] },
      { call: 'sorted_squares', args: [[-2]], expected: [4] },
    ],
    hint: 'The biggest square is at one of the two ends. Compare the squares at the left and right pointers, put the bigger one at the end of the answer, move that pointer inwards, and fill the answer from the back. Like picking the tallest of the two people at the ends of a line, again and again.',
    forbid: NO_SORT,
  },
  {
    id: 115,
    example: 'Example: merge_into(a, 3, [2, 5, 6], 3) with a = [1, 2, 3, 0, 0, 0] changes a to [1, 2, 2, 3, 5, 6].',
    starter: `def merge_into(a, m, b, n):
    # a has m sorted numbers followed by n spare places; b has n sorted numbers.
    # Merge b into a so a is sorted, changing a itself, without sorting.
    pass


a = [1, 2, 3, 0, 0, 0]
merge_into(a, 3, [2, 5, 6], 3)
print(a)
`,
    tests: [
      { call: 'merge_into', args: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3], expected: null, mutated: { arg: 0, value: [1, 2, 2, 3, 5, 6] } },
      { call: 'merge_into', args: [[1], 1, [], 0], expected: null, mutated: { arg: 0, value: [1] } },
      { call: 'merge_into', args: [[0], 0, [1], 1], expected: null, mutated: { arg: 0, value: [1] } },
      { call: 'merge_into', args: [[4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3], expected: null, mutated: { arg: 0, value: [1, 2, 3, 4, 5, 6] } },
    ],
    hint: 'Fill a from the back. Compare the last real number of a with the last of b, write the bigger one at position m + n - 1, and move inwards; at the end copy whatever is left of b. Working from the back never overwrites a number you still need. Like stacking two piles of plates by size, largest first, at the far end of the shelf.',
    forbid: NO_SORT,
  },
  {
    id: 116,
    example: 'Example: negatives_first(nums) with nums = [1, -2, 3, -4] changes nums to something like [-2, -4, 1, 3].',
    starter: `def negatives_first(nums):
    # Rearrange nums itself so every negative number comes before every other number.
    # (Any order inside the two groups is fine.)
    pass


nums = [1, -2, 3, -4, -5]
negatives_first(nums)
print(nums)
`,
    tests: [
      { call: 'negatives_first', args: [[1, -2, 3, -4, -5]], expected: null, mutated: { arg: 0, value: [1, -2, 3, -4, -5], check: 'negfirst' } },
      { call: 'negatives_first', args: [[-1, 2]], expected: null, mutated: { arg: 0, value: [-1, 2], check: 'negfirst' } },
      { call: 'negatives_first', args: [[3, 4]], expected: null, mutated: { arg: 0, value: [3, 4], check: 'negfirst' } },
      { call: 'negatives_first', args: [[0, -1]], expected: null, mutated: { arg: 0, value: [0, -1], check: 'negfirst' } },
      { call: 'negatives_first', args: [[5, -3, 2, -8, 0, -1]], expected: null, mutated: { arg: 0, value: [5, -3, 2, -8, 0, -1], check: 'negfirst' } },
    ],
    hint: 'Keep a position k for the next negative. Go through the list; whenever nums[i] is negative, swap it with nums[k] and add 1 to k. Like sorting laundry: every dark item is thrown into the left basket as you go.',
  },
  {
    id: 117,
    example: 'Example: backspace_compare("ab#c", "ad#c") returns True (both are "ac").',
    starter: `def backspace_compare(s, t):
    # In both texts, "#" deletes the letter before it. True if the results are equal.
    pass


print(backspace_compare("ab#c", "ad#c"))
`,
    tests: [
      { call: 'backspace_compare', args: ['ab#c', 'ad#c'], expected: true },
      { call: 'backspace_compare', args: ['ab##', 'c#d#'], expected: true },
      { call: 'backspace_compare', args: ['a#c', 'b'], expected: false },
      { call: 'backspace_compare', args: ['a##c', '#a#c'], expected: true },
      { call: 'backspace_compare', args: ['', '#'], expected: true },
    ],
    hint: 'Build what each text really says: go through it with a list used as a stack, pushing letters and popping one for each "#" (if there is one). Then compare. Like typing on a keyboard: the backspace key removes the last letter you typed.',
  },
  {
    id: 118,
    example: 'Example: palindrome_after_one_delete("abca") returns True (delete "c" or "b").',
    starter: `def palindrome_after_one_delete(s):
    # True if s is a palindrome, or becomes one after deleting at most one character.
    pass


print(palindrome_after_one_delete("abca"))
`,
    tests: [
      { call: 'palindrome_after_one_delete', args: ['aba'], expected: true },
      { call: 'palindrome_after_one_delete', args: ['abca'], expected: true },
      { call: 'palindrome_after_one_delete', args: ['abc'], expected: false },
      { call: 'palindrome_after_one_delete', args: [''], expected: true },
      { call: 'palindrome_after_one_delete', args: ['deeee'], expected: true },
      { call: 'palindrome_after_one_delete', args: ['abcdcbea'], expected: true },
    ],
    hint: 'Walk two pointers inwards. At the first mismatch you get one deletion: the answer is yes if the rest is a palindrome after skipping either the left letter or the right letter. Like proofreading a mirrored word where you may cross out one wrong letter.',
  },
  {
    id: 119,
    example: 'Example: has_pair_with_difference([1, 3, 5, 8], 3) returns True (8 - 5).',
    starter: `def has_pair_with_difference(nums, k):
    # nums is sorted, k is 0 or more. True if two different positions hold values that differ by k.
    pass


print(has_pair_with_difference([1, 3, 5, 8], 3))
`,
    tests: [
      { call: 'has_pair_with_difference', args: [[1, 3, 5, 8], 3], expected: true },
      { call: 'has_pair_with_difference', args: [[1, 2, 3], 5], expected: false },
      { call: 'has_pair_with_difference', args: [[1, 1], 0], expected: true },
      { call: 'has_pair_with_difference', args: [[1, 2], 0], expected: false },
      { call: 'has_pair_with_difference', args: [[-5, 0, 4], 9], expected: true },
    ],
    hint: 'Two pointers that both move right: i and j = i + 1. If nums[j] - nums[i] is too small, move j on; too big, move i on (keep j ahead of i); equal, found it. Like two hikers on a trail keeping exactly k metres apart.',
  },
  {
    id: 120,
    example: 'Example: max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]) returns 49.',
    starter: `def max_area(height):
    # Two lines and the ground make a container. The most water any two lines can hold.
    pass


print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))
`,
    tests: [
      { call: 'max_area', args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { call: 'max_area', args: [[1, 1]], expected: 1 },
      { call: 'max_area', args: [[4, 3, 2, 1, 4]], expected: 16 },
      { call: 'max_area', args: [[1, 2, 1]], expected: 2 },
    ],
    hint: 'Start with the widest pair (both ends). The water is width × the shorter line. Moving the taller line inwards can never help, so move the shorter one, and keep the best area. Like widening a fence: the shorter post decides how high the water can rise.',
  },
  {
    id: 121,
    example: 'Example: three_sum([-1, 0, 1, 2, -1, -4]) returns [[-1, -1, 2], [-1, 0, 1]] (in any order).',
    starter: `def three_sum(nums):
    # Every different triplet of values (from different positions) that adds up to 0.
    pass


print(three_sum([-1, 0, 1, 2, -1, -4]))
`,
    tests: [
      { call: 'three_sum', args: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]], compare: 'sets' },
      { call: 'three_sum', args: [[0, 1, 1]], expected: [], compare: 'sets' },
      { call: 'three_sum', args: [[0, 0, 0]], expected: [[0, 0, 0]], compare: 'sets' },
      { call: 'three_sum', args: [[]], expected: [], compare: 'sets' },
      { call: 'three_sum', args: [[-2, 0, 1, 1, 2]], expected: [[-2, 0, 2], [-2, 1, 1]], compare: 'sets' },
    ],
    hint: 'Sort the numbers. Fix the first number (skip values already tried), then find the other two with two pointers in the rest: too small, move left on; too big, move right in; skip repeated values after a match. Like seating three people on a bench so their weights balance.',
  },
  {
    id: 122,
    example: 'Example: three_sum_closest([-1, 2, 1, -4], 1) returns 2 (-1 + 2 + 1).',
    starter: `def three_sum_closest(nums, target):
    # The sum of three numbers (different positions) that is closest to target.
    pass


print(three_sum_closest([-1, 2, 1, -4], 1))
`,
    tests: [
      { call: 'three_sum_closest', args: [[-1, 2, 1, -4], 1], expected: 2 },
      { call: 'three_sum_closest', args: [[0, 0, 0], 1], expected: 0 },
      { call: 'three_sum_closest', args: [[1, 1, 1, 0], -100], expected: 2 },
      { call: 'three_sum_closest', args: [[1, 2, 4, 8, 16, 32, 64, 128], 82], expected: 82 },
    ],
    hint: 'Sort, fix the first number, and move two pointers through the rest like in three-sum; after each sum, keep it if it is closer to target than the best so far, and move the pointer that brings the sum towards target. Like tuning a radio: nudge left or right until the signal is as close as it gets.',
  },
  {
    id: 123,
    example: 'Example: four_sum([1, 0, -1, 0, -2, 2], 0) returns [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]] (in any order).',
    starter: `def four_sum(nums, target):
    # Every different group of four values (from different positions) that adds up to target.
    pass


print(four_sum([1, 0, -1, 0, -2, 2], 0))
`,
    tests: [
      { call: 'four_sum', args: [[1, 0, -1, 0, -2, 2], 0], expected: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]], compare: 'sets' },
      { call: 'four_sum', args: [[2, 2, 2, 2, 2], 8], expected: [[2, 2, 2, 2]], compare: 'sets' },
      { call: 'four_sum', args: [[], 0], expected: [], compare: 'sets' },
      { call: 'four_sum', args: [[1, 2, 3], 6], expected: [], compare: 'sets' },
    ],
    hint: 'Sort, then fix the first two numbers with two loops (skipping repeated values) and find the last two with two pointers, exactly like three-sum. Like three-sum with one more friend on the bench.',
  },
  {
    id: 124,
    example: 'Example: sort_colors(nums) with nums = [2, 0, 2, 1, 1, 0] changes nums to [0, 0, 1, 1, 2, 2].',
    starter: `def sort_colors(nums):
    # nums holds 0s, 1s and 2s. Sort it in one pass, in place, without sort().
    pass


nums = [2, 0, 2, 1, 1, 0]
sort_colors(nums)
print(nums)
`,
    tests: [
      { call: 'sort_colors', args: [[2, 0, 2, 1, 1, 0]], expected: null, mutated: { arg: 0, value: [0, 0, 1, 1, 2, 2] } },
      { call: 'sort_colors', args: [[2, 0, 1]], expected: null, mutated: { arg: 0, value: [0, 1, 2] } },
      { call: 'sort_colors', args: [[0]], expected: null, mutated: { arg: 0, value: [0] } },
      { call: 'sort_colors', args: [[1, 2, 0, 2, 0, 1]], expected: null, mutated: { arg: 0, value: [0, 0, 1, 1, 2, 2] } },
    ],
    hint: 'Dutch flag: three pointers low, mid, high. A 0 at mid swaps to low (both move on), a 1 just moves mid on, a 2 swaps to high (high moves in, mid stays to check what arrived). Like sorting red, white and blue marbles into three heaps in a single sweep.',
    forbid: NO_SORT,
  },
  {
    id: 125,
    example: 'Example: remove_extra_duplicates([1, 1, 1, 2, 2, 3]) returns 5, and the list starts [1, 1, 2, 2, 3].',
    starter: `def remove_extra_duplicates(nums):
    # nums is sorted. Keep each value at most twice at the front, in place; return how many are kept.
    pass


nums = [1, 1, 1, 2, 2, 3]
k = remove_extra_duplicates(nums)
print(k, nums[:k])
`,
    tests: [
      { call: 'remove_extra_duplicates', args: [[1, 1, 1, 2, 2, 3]], expected: 5, mutated: { arg: 0, value: [1, 1, 2, 2, 3], prefix: true } },
      { call: 'remove_extra_duplicates', args: [[0, 0, 1, 1, 1, 1, 2, 3, 3]], expected: 7, mutated: { arg: 0, value: [0, 0, 1, 1, 2, 3, 3], prefix: true } },
      { call: 'remove_extra_duplicates', args: [[]], expected: 0, mutated: { arg: 0, value: [], prefix: true } },
      { call: 'remove_extra_duplicates', args: [[1]], expected: 1, mutated: { arg: 0, value: [1], prefix: true } },
    ],
    hint: 'Keep a write position k. Copy nums[i] to nums[k] unless it equals nums[k - 2] (then the value is already in twice). Like a shop rule of "at most two per customer" applied as the queue moves.',
  },
  {
    id: 126,
    example: 'Example: count_pairs_below([-1, 1, 1, 2, 3], 2) returns 3.',
    starter: `def count_pairs_below(nums, target):
    # nums is sorted. How many pairs of positions i < j have nums[i] + nums[j] < target?
    pass


print(count_pairs_below([-1, 1, 1, 2, 3], 2))
`,
    tests: [
      { call: 'count_pairs_below', args: [[-1, 1, 1, 2, 3], 2], expected: 3 },
      { call: 'count_pairs_below', args: [[1, 2, 3, 4], 5], expected: 2 },
      { call: 'count_pairs_below', args: [[], 1], expected: 0 },
      { call: 'count_pairs_below', args: [[0, 0, 0], 1], expected: 3 },
    ],
    hint: 'Pointers at both ends. If nums[left] + nums[right] < target, then left pairs with every position from left + 1 to right: add right - left and move left on. Otherwise move right in. Like matching the lightest person with the heaviest who still fits in the lift.',
  },
  {
    id: 127,
    example: 'Example: num_boats([3, 2, 2, 1], 3) returns 3.',
    starter: `def num_boats(people, limit):
    # Each boat holds at most two people whose weights add up to at most limit.
    # The fewest boats to carry everyone (nobody is heavier than limit).
    pass


print(num_boats([3, 2, 2, 1], 3))
`,
    tests: [
      { call: 'num_boats', args: [[1, 2], 3], expected: 1 },
      { call: 'num_boats', args: [[3, 2, 2, 1], 3], expected: 3 },
      { call: 'num_boats', args: [[3, 5, 3, 4], 5], expected: 4 },
      { call: 'num_boats', args: [[5, 1, 4, 2], 6], expected: 2 },
    ],
    hint: 'Sort the weights. The heaviest person always takes a boat; if the lightest person fits with them, they go together. Move the pointers and count the boats. Like pairing the heaviest backpack with the lightest one so no trip is wasted.',
  },
  {
    id: 128,
    example: 'Example: shortest_unsorted([2, 6, 4, 8, 10, 9, 15]) returns 5 (sorting 6, 4, 8, 10, 9 fixes it).',
    starter: `def shortest_unsorted(nums):
    # The length of the shortest run that, if sorted, makes the whole list sorted (0 if it already is).
    pass


print(shortest_unsorted([2, 6, 4, 8, 10, 9, 15]))
`,
    tests: [
      { call: 'shortest_unsorted', args: [[2, 6, 4, 8, 10, 9, 15]], expected: 5 },
      { call: 'shortest_unsorted', args: [[1, 2, 3, 4]], expected: 0 },
      { call: 'shortest_unsorted', args: [[1]], expected: 0 },
      { call: 'shortest_unsorted', args: [[2, 1]], expected: 2 },
      { call: 'shortest_unsorted', args: [[1, 3, 2, 2, 2]], expected: 4 },
    ],
    hint: 'From the left, keep the biggest value so far: the last position where a number is smaller than it is the run\'s right end. From the right, keep the smallest so far: the last position (going left) bigger than it is the left end. Like finding the stretch of a bookshelf where books are out of order.',
  },
  {
    id: 129,
    example: 'Example: smallest_difference([1, 2, 3, 11, 15], [8, 19, 23, 127, 235]) returns 3 (11 and 8).',
    starter: `def smallest_difference(a, b):
    # a and b are sorted. The smallest |x - y| with x from a and y from b.
    pass


print(smallest_difference([1, 2, 3, 11, 15], [8, 19, 23, 127, 235]))
`,
    tests: [
      { call: 'smallest_difference', args: [[1, 2, 3, 11, 15], [8, 19, 23, 127, 235]], expected: 3 },
      { call: 'smallest_difference', args: [[1, 5], [10]], expected: 5 },
      { call: 'smallest_difference', args: [[10, 20], [20]], expected: 0 },
      { call: 'smallest_difference', args: [[-1, 5], [2, 3]], expected: 2 },
    ],
    hint: 'One pointer in each list. Look at the difference, keep the best, then move the pointer at the smaller value (that is the only way to get closer). Like two people walking towards each other on parallel streets, checking how close they get.',
  },
  {
    id: 130,
    example: 'Example: triangle_count([2, 2, 3, 4]) returns 3.',
    starter: `def triangle_count(nums):
    # How many groups of three positions make a triangle (any two sides add up to more than the third)?
    pass


print(triangle_count([2, 2, 3, 4]))
`,
    tests: [
      { call: 'triangle_count', args: [[2, 2, 3, 4]], expected: 3 },
      { call: 'triangle_count', args: [[4, 2, 3, 4]], expected: 4 },
      { call: 'triangle_count', args: [[1, 1, 1]], expected: 1 },
      { call: 'triangle_count', args: [[0, 0, 0]], expected: 0 },
      { call: 'triangle_count', args: [[1, 2, 3]], expected: 0 },
    ],
    hint: 'Sort. For each largest side c (from the right), use two pointers on the smaller ones: if nums[left] + nums[right] > c, every left from there to right works (add right - left) and move right in; otherwise move left on. Like checking which pairs of sticks can reach across a gap of length c.',
  },
];
