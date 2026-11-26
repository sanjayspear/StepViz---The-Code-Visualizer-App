// Practice, Python: Arrays & matrices (Q56-Q85). Reference solutions: tests/practice/arrays-matrices.solutions.ts.
import type { PracticeContent } from '../types';

export const ARRAYS_MATRICES: PracticeContent[] = [
  {
    id: 56,
    example: 'Example: find_min_max([3, 1, 4, 1, 5]) returns (1, 5).',
    starter: `def find_min_max(nums):
    # Return (smallest, largest) of a non-empty list, without min(), max() or sorting.
    pass


print(find_min_max([3, 1, 4, 1, 5]))
`,
    tests: [
      { call: 'find_min_max', args: [[3, 1, 4, 1, 5]], expected: [1, 5] },
      { call: 'find_min_max', args: [[7]], expected: [7, 7] },
      { call: 'find_min_max', args: [[-2, -8, 0]], expected: [-8, 0] },
      { call: 'find_min_max', args: [[5, 5]], expected: [5, 5] },
    ],
    hint: 'Start with smallest = largest = nums[0], then look at each number once and update whichever one it beats. Like a referee who remembers only the fastest and the slowest runner so far.',
    forbid: { names: ['min', 'max', 'sorted', 'sort'], why: 'This question asks you to find them yourself, without min(), max() or sorting.' },
  },
  {
    id: 57,
    example: 'Example: second_largest([3, 1, 4, 1, 5]) returns 4; with no second value, None.',
    starter: `def second_largest(nums):
    # The second largest different value, or None if there is none.
    pass


print(second_largest([3, 1, 4, 1, 5]))
`,
    tests: [
      { call: 'second_largest', args: [[3, 1, 4, 1, 5]], expected: 4 },
      { call: 'second_largest', args: [[5, 5, 5]], expected: null },
      { call: 'second_largest', args: [[1, 2]], expected: 1 },
      { call: 'second_largest', args: [[10]], expected: null },
      { call: 'second_largest', args: [[2, 3, 3]], expected: 2 },
    ],
    hint: 'Keep two values, first and second (start them as None). For each number bigger than first, move first down to second; for a number between them (and not equal to first), it becomes second. Like a podium: a new winner pushes the old winner to second place.',
  },
  {
    id: 58,
    example: 'Example: after reverse_in_place(nums) with nums = [1, 2, 3], nums is [3, 2, 1].',
    starter: `def reverse_in_place(nums):
    # Reverse the list itself (do not make a new list). Return nothing.
    pass


nums = [1, 2, 3]
reverse_in_place(nums)
print(nums)
`,
    tests: [
      { call: 'reverse_in_place', args: [[1, 2, 3]], expected: null, mutated: { arg: 0, value: [3, 2, 1] } },
      { call: 'reverse_in_place', args: [[]], expected: null, mutated: { arg: 0, value: [] } },
      { call: 'reverse_in_place', args: [[1]], expected: null, mutated: { arg: 0, value: [1] } },
      { call: 'reverse_in_place', args: [[1, 2, 3, 4]], expected: null, mutated: { arg: 0, value: [4, 3, 2, 1] } },
    ],
    hint: 'Two pointers: i at the start and j at the end. Swap nums[i] and nums[j], move i right and j left, and stop when they meet. Like two people at both ends of a bookshelf swapping books as they walk towards each other.',
    forbid: { names: ['reversed', 'reverse'], patterns: [{ regex: '::-1\\]', shown: '[::-1]' }], why: 'This question asks you to swap the items yourself, without reversed(), .reverse() or [::-1].' },
  },
  {
    id: 59,
    example: 'Example: is_sorted([1, 2, 2, 3]) returns True.',
    starter: `def is_sorted(nums):
    # True if every item is at least as big as the one before it.
    pass


print(is_sorted([1, 2, 2, 3]))
`,
    tests: [
      { call: 'is_sorted', args: [[1, 2, 2, 3]], expected: true },
      { call: 'is_sorted', args: [[3, 1]], expected: false },
      { call: 'is_sorted', args: [[]], expected: true },
      { call: 'is_sorted', args: [[5]], expected: true },
      { call: 'is_sorted', args: [[1, 3, 2, 4]], expected: false },
    ],
    hint: 'Look at each neighbour pair nums[i - 1], nums[i]; if any pair goes down, the list is not sorted. Like checking that a row of steps never goes downhill.',
  },
  {
    id: 60,
    example: 'Example: remove_duplicates_sorted([1, 1, 2]) returns 2 and the list starts [1, 2].',
    starter: `def remove_duplicates_sorted(nums):
    # nums is sorted. Move each different value to the front, in place,
    # and return how many different values there are.
    pass


nums = [1, 1, 2]
k = remove_duplicates_sorted(nums)
print(k, nums[:k])
`,
    tests: [
      { call: 'remove_duplicates_sorted', args: [[1, 1, 2]], expected: 2, mutated: { arg: 0, value: [1, 2], prefix: true } },
      { call: 'remove_duplicates_sorted', args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: 5, mutated: { arg: 0, value: [0, 1, 2, 3, 4], prefix: true } },
      { call: 'remove_duplicates_sorted', args: [[]], expected: 0, mutated: { arg: 0, value: [], prefix: true } },
      { call: 'remove_duplicates_sorted', args: [[1, 2, 3]], expected: 3, mutated: { arg: 0, value: [1, 2, 3], prefix: true } },
    ],
    hint: 'Keep a write position k (start at 1 if the list is not empty). For each later item, if it differs from nums[k - 1], copy it to nums[k] and add 1 to k. Like packing a suitcase: you only put in an item if it is different from the last one you packed.',
  },
  {
    id: 61,
    example: 'Example: after move_zeros(nums) with nums = [0, 1, 0, 3, 12], nums is [1, 3, 12, 0, 0].',
    starter: `def move_zeros(nums):
    # Move every 0 to the end, keeping the order of the other numbers. Change nums itself.
    pass


nums = [0, 1, 0, 3, 12]
move_zeros(nums)
print(nums)
`,
    tests: [
      { call: 'move_zeros', args: [[0, 1, 0, 3, 12]], expected: null, mutated: { arg: 0, value: [1, 3, 12, 0, 0] } },
      { call: 'move_zeros', args: [[0]], expected: null, mutated: { arg: 0, value: [0] } },
      { call: 'move_zeros', args: [[1, 2]], expected: null, mutated: { arg: 0, value: [1, 2] } },
      { call: 'move_zeros', args: [[0, 0, 1]], expected: null, mutated: { arg: 0, value: [1, 0, 0] } },
    ],
    hint: 'Keep a write position w. Copy every non-zero number to nums[w] and add 1 to w; afterwards fill the rest of the list from w with zeros. Like moving the people in a queue forward and putting the empty chairs at the back.',
  },
  {
    id: 62,
    example: 'Example: after rotate_right(nums, 3) with nums = [1, 2, 3, 4, 5, 6, 7], nums is [5, 6, 7, 1, 2, 3, 4].',
    starter: `def rotate_right(nums, k):
    # Move every item k places to the right, wrapping around. Change nums itself.
    pass


nums = [1, 2, 3, 4, 5, 6, 7]
rotate_right(nums, 3)
print(nums)
`,
    tests: [
      { call: 'rotate_right', args: [[1, 2, 3, 4, 5, 6, 7], 3], expected: null, mutated: { arg: 0, value: [5, 6, 7, 1, 2, 3, 4] } },
      { call: 'rotate_right', args: [[-1, -100, 3, 99], 2], expected: null, mutated: { arg: 0, value: [3, 99, -1, -100] } },
      { call: 'rotate_right', args: [[1, 2], 5], expected: null, mutated: { arg: 0, value: [2, 1] } },
      { call: 'rotate_right', args: [[1], 0], expected: null, mutated: { arg: 0, value: [1] } },
    ],
    hint: 'First use k = k % len(nums) (rotating by the length changes nothing). Then reverse the whole list, reverse the first k items, and reverse the rest. (Or nums[:] = nums[-k:] + nums[:-k]; plain nums = ... would only make a new list.) Like a round table: everyone moves k seats to the right.',
  },
  {
    id: 63,
    example: 'Example: missing_number([3, 0, 1]) returns 2.',
    starter: `def missing_number(nums):
    # nums holds all the numbers 0 to n except one. Which one is missing?
    pass


print(missing_number([3, 0, 1]))
`,
    tests: [
      { call: 'missing_number', args: [[3, 0, 1]], expected: 2 },
      { call: 'missing_number', args: [[0, 1]], expected: 2 },
      { call: 'missing_number', args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
      { call: 'missing_number', args: [[0]], expected: 1 },
      { call: 'missing_number', args: [[1]], expected: 0 },
    ],
    hint: 'With n = len(nums), the numbers 0 to n add up to n * (n + 1) // 2. Subtract the sum of nums: what is left is the missing one. Like counting the eggs in a full box and seeing how many are gone.',
  },
  {
    id: 64,
    example: 'Example: single_number([4, 1, 2, 1, 2]) returns 4.',
    starter: `def single_number(nums):
    # Every number appears twice except one. Return that one.
    pass


print(single_number([4, 1, 2, 1, 2]))
`,
    tests: [
      { call: 'single_number', args: [[2, 2, 1]], expected: 1 },
      { call: 'single_number', args: [[4, 1, 2, 1, 2]], expected: 4 },
      { call: 'single_number', args: [[1]], expected: 1 },
      { call: 'single_number', args: [[-1, -1, 7]], expected: 7 },
    ],
    hint: 'x ^ x is 0 and x ^ 0 is x, so XOR all the numbers together: the pairs cancel out and only the single one is left. Like a dance where partners pair up and leave the floor: the one without a partner stays.',
  },
  {
    id: 65,
    example: 'Example: find_duplicate([1, 3, 4, 2, 2]) returns 2.',
    starter: `def find_duplicate(nums):
    # n + 1 numbers, each from 1 to n: one value appears more than once. Return it.
    pass


print(find_duplicate([1, 3, 4, 2, 2]))
`,
    tests: [
      { call: 'find_duplicate', args: [[1, 3, 4, 2, 2]], expected: 2 },
      { call: 'find_duplicate', args: [[3, 1, 3, 4, 2]], expected: 3 },
      { call: 'find_duplicate', args: [[1, 1]], expected: 1 },
      { call: 'find_duplicate', args: [[2, 2, 2, 2]], expected: 2 },
    ],
    hint: 'Keep a set of numbers seen; the first number already in the set is the duplicate. (Without extra space: treat each value as a pointer to an index and find where the "cycle" starts.) Like spotting the second person to arrive with the same ticket number.',
  },
  {
    id: 66,
    example: 'Example: merge_sorted([1, 3, 5], [2, 4, 6]) returns [1, 2, 3, 4, 5, 6].',
    starter: `def merge_sorted(a, b):
    # a and b are sorted. Return one sorted list with all their items, without sorting again.
    pass


print(merge_sorted([1, 3, 5], [2, 4, 6]))
`,
    tests: [
      { call: 'merge_sorted', args: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6] },
      { call: 'merge_sorted', args: [[], [1]], expected: [1] },
      { call: 'merge_sorted', args: [[1, 2], []], expected: [1, 2] },
      { call: 'merge_sorted', args: [[1, 1], [1]], expected: [1, 1, 1] },
      { call: 'merge_sorted', args: [[1, 4, 9], [2, 3]], expected: [1, 2, 3, 4, 9] },
    ],
    hint: 'One pointer in each list: take the smaller of a[i] and b[j], move that pointer on, and repeat; when one list runs out, add the rest of the other. Like merging two queues of people sorted by height into one.',
    forbid: { names: ['sorted', 'sort'], why: 'This question asks you to merge them yourself, without sorting.' },
  },
  {
    id: 67,
    example: 'Example: intersection([1, 2, 2, 1], [2, 2]) returns [2].',
    starter: `def intersection(a, b):
    # The values that are in both lists, each once (in any order).
    pass


print(intersection([4, 9, 5], [9, 4, 9, 8, 4]))
`,
    tests: [
      { call: 'intersection', args: [[1, 2, 2, 1], [2, 2]], expected: [2], compare: 'unordered' },
      { call: 'intersection', args: [[4, 9, 5], [9, 4, 9, 8, 4]], expected: [4, 9], compare: 'unordered' },
      { call: 'intersection', args: [[1], [2]], expected: [], compare: 'unordered' },
      { call: 'intersection', args: [[], [1]], expected: [], compare: 'unordered' },
    ],
    hint: 'Put the values of a in a set; go through b and collect each value that is in that set, once (a second set of found values avoids repeats). Like two friends comparing their lists of favourite films.',
  },
  {
    id: 68,
    example: 'Example: union([1, 2, 3], [2, 3, 4]) returns [1, 2, 3, 4].',
    starter: `def union(a, b):
    # Every value that is in either list, each once (in any order).
    pass


print(union([1, 2, 3], [2, 3, 4]))
`,
    tests: [
      { call: 'union', args: [[1, 2, 3], [2, 3, 4]], expected: [1, 2, 3, 4], compare: 'unordered' },
      { call: 'union', args: [[], []], expected: [], compare: 'unordered' },
      { call: 'union', args: [[1, 1], [1]], expected: [1], compare: 'unordered' },
      { call: 'union', args: [[5], [6, 5, 7]], expected: [5, 6, 7], compare: 'unordered' },
    ],
    hint: 'Go through both lists and add each value to the answer only the first time you meet it (keep a set of values already added). Like making one guest list from two, writing each name once.',
  },
  {
    id: 69,
    example: 'Example: plus_one([9, 9]) returns [1, 0, 0].',
    starter: `def plus_one(digits):
    # digits is a number written digit by digit. Return the digits of that number plus one.
    pass


print(plus_one([1, 2, 3]))
`,
    tests: [
      { call: 'plus_one', args: [[1, 2, 3]], expected: [1, 2, 4] },
      { call: 'plus_one', args: [[9, 9]], expected: [1, 0, 0] },
      { call: 'plus_one', args: [[0]], expected: [1] },
      { call: 'plus_one', args: [[4, 3, 2, 9]], expected: [4, 3, 3, 0] },
    ],
    hint: 'Work from the last digit: a 9 becomes 0 and the 1 carries on to the left; any other digit just goes up by 1 and you are done. If every digit was 9, put a 1 in front. Like a car odometer rolling over from 099 to 100.',
  },
  {
    id: 70,
    example: 'Example: majority_element([2, 2, 1, 1, 1, 2, 2]) returns 2.',
    starter: `def majority_element(nums):
    # The value that appears more than len(nums) / 2 times (there always is one).
    pass


print(majority_element([2, 2, 1, 1, 1, 2, 2]))
`,
    tests: [
      { call: 'majority_element', args: [[3, 2, 3]], expected: 3 },
      { call: 'majority_element', args: [[2, 2, 1, 1, 1, 2, 2]], expected: 2 },
      { call: 'majority_element', args: [[1]], expected: 1 },
      { call: 'majority_element', args: [[6, 5, 5]], expected: 5 },
    ],
    hint: 'Boyer-Moore voting: keep a candidate and a count. Same value: count + 1; different: count - 1; when the count is 0, take the next value as the new candidate. The majority survives. Like a tug of war where the bigger team always ends up holding the rope.',
  },
  {
    id: 71,
    example: 'Example: max_profit([7, 1, 5, 3, 6, 4]) returns 5 (buy at 1, sell at 6).',
    starter: `def max_profit(prices):
    # Buy on one day and sell on a later day. The biggest profit (0 if none).
    pass


print(max_profit([7, 1, 5, 3, 6, 4]))
`,
    tests: [
      { call: 'max_profit', args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { call: 'max_profit', args: [[7, 6, 4, 3, 1]], expected: 0 },
      { call: 'max_profit', args: [[1, 2]], expected: 1 },
      { call: 'max_profit', args: [[]], expected: 0 },
      { call: 'max_profit', args: [[2, 4, 1]], expected: 2 },
    ],
    hint: 'Walk through the days remembering the cheapest price so far; each day, selling today would earn price - cheapest, so keep the best of those. Like remembering the lowest price you have seen for a game while waiting for the best day to resell it.',
  },
  {
    id: 72,
    example: 'Example: max_profit_many([7, 1, 5, 3, 6, 4]) returns 7 (buy 1 sell 5, buy 3 sell 6).',
    starter: `def max_profit_many(prices):
    # You may buy and sell many times (hold at most one share). The biggest total profit.
    pass


print(max_profit_many([7, 1, 5, 3, 6, 4]))
`,
    tests: [
      { call: 'max_profit_many', args: [[7, 1, 5, 3, 6, 4]], expected: 7 },
      { call: 'max_profit_many', args: [[1, 2, 3, 4, 5]], expected: 4 },
      { call: 'max_profit_many', args: [[7, 6, 4, 3, 1]], expected: 0 },
      { call: 'max_profit_many', args: [[]], expected: 0 },
    ],
    hint: 'Every time tomorrow\'s price is higher than today\'s, that rise is profit you can take: add up all the day-to-day increases. Like collecting every uphill stretch on a hike.',
  },
  {
    id: 73,
    example: 'Example: max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) returns 6 (4, -1, 2, 1).',
    starter: `def max_subarray(nums):
    # The largest sum of a run of neighbouring items (at least one item).
    pass


print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
`,
    tests: [
      { call: 'max_subarray', args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { call: 'max_subarray', args: [[1]], expected: 1 },
      { call: 'max_subarray', args: [[5, 4, -1, 7, 8]], expected: 23 },
      { call: 'max_subarray', args: [[-3, -1, -2]], expected: -1 },
    ],
    hint: "Kadane's idea: keep the best sum of a run that ends here: either the current number alone, or the previous run plus it (current = max(x, current + x)); keep the best ever. Like a runner deciding at each mile whether to keep going or restart fresh.",
  },
  {
    id: 74,
    example: 'Example: product_except_self([1, 2, 3, 4]) returns [24, 12, 8, 6].',
    starter: `def product_except_self(nums):
    # Item i of the answer is the product of every number except nums[i]. Without division.
    pass


print(product_except_self([1, 2, 3, 4]))
`,
    tests: [
      { call: 'product_except_self', args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { call: 'product_except_self', args: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
      { call: 'product_except_self', args: [[2, 3]], expected: [3, 2] },
      { call: 'product_except_self', args: [[0, 0]], expected: [0, 0] },
    ],
    hint: 'First pass, left to right: answer[i] = product of everything before i. Second pass, right to left: multiply answer[i] by the product of everything after i. Like each person in a row learning the total of the people on their left and on their right, but not themselves.',
    forbid: { ops: ['/', '//', '/=', '//='], why: 'This question asks you to do it without division.' },
  },
  {
    id: 75,
    example: 'Example: majority_third([1, 1, 1, 3, 3, 2, 2, 2]) returns [1, 2] (in any order).',
    starter: `def majority_third(nums):
    # Every value that appears more than len(nums) / 3 times (in any order).
    pass


print(majority_third([3, 2, 3]))
`,
    tests: [
      { call: 'majority_third', args: [[3, 2, 3]], expected: [3], compare: 'unordered' },
      { call: 'majority_third', args: [[1]], expected: [1], compare: 'unordered' },
      { call: 'majority_third', args: [[1, 2]], expected: [1, 2], compare: 'unordered' },
      { call: 'majority_third', args: [[1, 1, 1, 3, 3, 2, 2, 2]], expected: [1, 2], compare: 'unordered' },
      { call: 'majority_third', args: [[1, 2, 3]], expected: [], compare: 'unordered' },
    ],
    hint: 'At most two values can appear more than n / 3 times. Count every value (a dictionary), then keep those with count > len(nums) // 3. (Boyer-Moore with two candidates does it without the dictionary.) Like an election where a candidate needs more than a third of the votes.',
  },
  {
    id: 76,
    example: "Example: pascal(4) returns [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]].",
    starter: `def pascal(n):
    # The first n rows of Pascal's triangle.
    pass


print(pascal(5))
`,
    tests: [
      { call: 'pascal', args: [5], expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]] },
      { call: 'pascal', args: [1], expected: [[1]] },
      { call: 'pascal', args: [0], expected: [] },
      { call: 'pascal', args: [2], expected: [[1], [1, 1]] },
    ],
    hint: 'Each row starts and ends with 1; every number in between is the sum of the two numbers above it (row[j - 1] + row[j] of the previous row). Like a pyramid of bricks where each brick carries the two bricks resting on it.',
  },
  {
    id: 77,
    example: 'Example: transpose([[1, 2, 3], [4, 5, 6]]) returns [[1, 4], [2, 5], [3, 6]].',
    starter: `def transpose(matrix):
    # Rows become columns: item [r][c] moves to [c][r].
    pass


print(transpose([[1, 2, 3], [4, 5, 6]]))
`,
    tests: [
      { call: 'transpose', args: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]] },
      { call: 'transpose', args: [[[1]]], expected: [[1]] },
      { call: 'transpose', args: [[[1, 2], [3, 4]]], expected: [[1, 3], [2, 4]] },
      { call: 'transpose', args: [[[1], [2], [3]]], expected: [[1, 2, 3]] },
    ],
    hint: 'The answer has len(matrix[0]) rows; row c is [matrix[r][c] for every r]. Like turning a spreadsheet on its side so the column headings become row headings.',
  },
  {
    id: 78,
    example: 'Example: rotate_matrix(m) with m = [[1, 2], [3, 4]] changes m to [[3, 1], [4, 2]].',
    starter: `def rotate_matrix(matrix):
    # Turn the square matrix 90 degrees clockwise, changing the matrix itself.
    pass


m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
rotate_matrix(m)
print(m)
`,
    tests: [
      { call: 'rotate_matrix', args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: null, mutated: { arg: 0, value: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] } },
      { call: 'rotate_matrix', args: [[[1]]], expected: null, mutated: { arg: 0, value: [[1]] } },
      { call: 'rotate_matrix', args: [[[1, 2], [3, 4]]], expected: null, mutated: { arg: 0, value: [[3, 1], [4, 2]] } },
      {
        call: 'rotate_matrix',
        args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]],
        expected: null,
        mutated: { arg: 0, value: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
      },
    ],
    hint: 'Two steps: transpose the matrix in place (swap matrix[r][c] with matrix[c][r] for c > r), then reverse every row. Like turning a photo on a table: flip it over its diagonal, then mirror it left to right.',
  },
  {
    id: 79,
    example: 'Example: spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) returns [1, 2, 3, 6, 9, 8, 7, 4, 5].',
    starter: `def spiral_order(matrix):
    # The items in spiral order: right along the top, down, left along the bottom, up, and inwards.
    pass


print(spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
`,
    tests: [
      { call: 'spiral_order', args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { call: 'spiral_order', args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
      { call: 'spiral_order', args: [[[1]]], expected: [1] },
      { call: 'spiral_order', args: [[]], expected: [] },
      { call: 'spiral_order', args: [[[1], [2], [3]]], expected: [1, 2, 3] },
    ],
    hint: 'Keep four edges: top, bottom, left, right. Walk the top row and move top down, the right column and move right left, the bottom row (if any left) and move bottom up, the left column (if any left) and move left right. Repeat until the edges cross. Like peeling an onion one layer at a time.',
  },
  {
    id: 80,
    example: 'Example: set_zeroes(m) with m = [[1, 1, 1], [1, 0, 1], [1, 1, 1]] changes m to [[1, 0, 1], [0, 0, 0], [1, 0, 1]].',
    starter: `def set_zeroes(matrix):
    # Where a cell is 0, set its whole row and column to 0. Change the matrix itself.
    pass


m = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
set_zeroes(m)
print(m)
`,
    tests: [
      { call: 'set_zeroes', args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: null, mutated: { arg: 0, value: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] } },
      { call: 'set_zeroes', args: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], expected: null, mutated: { arg: 0, value: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]] } },
      { call: 'set_zeroes', args: [[[1]]], expected: null, mutated: { arg: 0, value: [[1]] } },
      { call: 'set_zeroes', args: [[[1, 0]]], expected: null, mutated: { arg: 0, value: [[0, 0]] } },
    ],
    hint: 'First find every row and every column that holds a 0 (two sets), without changing anything yet; then set each cell to 0 if its row or column is in those sets. Changing cells while still searching would spread zeros too far. Like marking the broken seats in a theatre before closing their rows and columns.',
  },
  {
    id: 81,
    example: 'Example: leaders([16, 17, 4, 3, 5, 2]) returns [17, 5, 2].',
    starter: `def leaders(nums):
    # Every item that is bigger than all the items to its right, in their original order.
    pass


print(leaders([16, 17, 4, 3, 5, 2]))
`,
    tests: [
      { call: 'leaders', args: [[16, 17, 4, 3, 5, 2]], expected: [17, 5, 2] },
      { call: 'leaders', args: [[1, 2, 3]], expected: [3] },
      { call: 'leaders', args: [[5]], expected: [5] },
      { call: 'leaders', args: [[]], expected: [] },
      { call: 'leaders', args: [[3, 3]], expected: [3] },
    ],
    hint: 'Walk from the right end, remembering the biggest value seen so far; an item bigger than that is a leader. Collect leaders, then reverse them to get the original order. Like looking along a row of buildings from the right: you see a building only if it is taller than all those in front of it.',
  },
  {
    id: 82,
    example: 'Example: pivot_index([1, 7, 3, 6, 5, 6]) returns 3 (1 + 7 + 3 = 5 + 6).',
    starter: `def pivot_index(nums):
    # The first position where the sum to its left equals the sum to its right, or -1.
    pass


print(pivot_index([1, 7, 3, 6, 5, 6]))
`,
    tests: [
      { call: 'pivot_index', args: [[1, 7, 3, 6, 5, 6]], expected: 3 },
      { call: 'pivot_index', args: [[1, 2, 3]], expected: -1 },
      { call: 'pivot_index', args: [[2, 1, -1]], expected: 0 },
      { call: 'pivot_index', args: [[0]], expected: 0 },
    ],
    hint: 'Compute the total once. Walk through the list keeping the sum to the left; the sum to the right of i is total - left - nums[i]. Return the first i where they are equal. Like balancing a see-saw: find the spot where both sides weigh the same.',
  },
  {
    id: 83,
    example: 'Example: next_permutation(nums) with nums = [1, 2, 3] changes nums to [1, 3, 2].',
    starter: `def next_permutation(nums):
    # Change nums to the next ordering in dictionary order (the smallest one after the last).
    pass


nums = [1, 2, 3]
next_permutation(nums)
print(nums)
`,
    tests: [
      { call: 'next_permutation', args: [[1, 2, 3]], expected: null, mutated: { arg: 0, value: [1, 3, 2] } },
      { call: 'next_permutation', args: [[3, 2, 1]], expected: null, mutated: { arg: 0, value: [1, 2, 3] } },
      { call: 'next_permutation', args: [[1, 1, 5]], expected: null, mutated: { arg: 0, value: [1, 5, 1] } },
      { call: 'next_permutation', args: [[1]], expected: null, mutated: { arg: 0, value: [1] } },
      { call: 'next_permutation', args: [[1, 3, 2]], expected: null, mutated: { arg: 0, value: [2, 1, 3] } },
    ],
    hint: 'From the right, find the first i with nums[i] < nums[i + 1]. If there is one, swap nums[i] with the smallest bigger number to its right (the last j from the right with nums[j] > nums[i]). Then reverse everything after i. Like an odometer: the rightmost digit that can still go up does, and everything after it resets to the lowest order.',
  },
  {
    id: 84,
    example: 'Example: longest_consecutive([100, 4, 200, 1, 3, 2]) returns 4 (1, 2, 3, 4).',
    starter: `def longest_consecutive(nums):
    # The length of the longest run of consecutive numbers (in any order in the list), in O(n).
    pass


print(longest_consecutive([100, 4, 200, 1, 3, 2]))
`,
    tests: [
      { call: 'longest_consecutive', args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { call: 'longest_consecutive', args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 },
      { call: 'longest_consecutive', args: [[]], expected: 0 },
      { call: 'longest_consecutive', args: [[1, 2, 0, 1]], expected: 3 },
    ],
    hint: 'Put every number in a set. A run starts at x only when x - 1 is not in the set; from each start, count x + 1, x + 2, ... while they are in the set. Each number is counted once, so it is O(n). Like finding chains of house numbers on a street: begin only at a house with no neighbour on its left.',
  },
  {
    id: 85,
    example: 'Example: trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]) returns 6.',
    starter: `def trap(height):
    # The bars have these heights and width 1. How much rain water stays between them?
    pass


print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))
`,
    tests: [
      { call: 'trap', args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
      { call: 'trap', args: [[4, 2, 0, 3, 2, 5]], expected: 9 },
      { call: 'trap', args: [[]], expected: 0 },
      { call: 'trap', args: [[3]], expected: 0 },
      { call: 'trap', args: [[2, 0, 2]], expected: 2 },
    ],
    hint: 'Water above a bar reaches the lower of the tallest bar on its left and the tallest bar on its right; it holds that level minus its own height. Compute the tallest-to-the-left and tallest-to-the-right for every bar (two passes), then add up. Like puddles between walls: each puddle is only as deep as its lower wall.',
  },
];
