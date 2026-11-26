// Practice, Java: Arrays & matrices (Q56-Q85). Tests come from the Python content;
// reference solutions in tests/practice/java/arrays-matrices.solutions.ts.
import { fromPython } from '../javascript/shared';
import { ARRAYS_MATRICES } from '../python/arrays-matrices';
import { one } from './shared';

const UTIL = 'import java.util.*;';
const NO_SORT = { names: ['sort', 'stream', 'TreeSet', 'PriorityQueue'], why: 'This question asks you to merge them yourself, without sorting.' };
/** One method on an int[] argument, printed with Arrays.toString or println. */
const arr = (header: string, comment: string, call: string, printArray = false) =>
  one(header, comment, printArray ? `System.out.println(Arrays.toString(${call}));` : `System.out.println(${call});`, UTIL);
/** An in-place method: make an array, call, print it. */
const inPlace = (header: string, comment: string, values: string, call: string) =>
  one(header, comment, `int[] nums = {${values}};\n${call};\nSystem.out.println(Arrays.toString(nums));`, UTIL);

export const ARRAYS_MATRICES_JAVA = fromPython(ARRAYS_MATRICES, {
  56: {
    example: 'Example: findMinMax(new int[] {3, 1, 4, 1, 5}) returns [1, 5].',
    starter: arr('int[] findMinMax(int[] nums)', 'Return {smallest, largest} of a non-empty array, without Math.min(), Math.max() or sorting.', 'findMinMax(new int[] {3, 1, 4, 1, 5})', true),
    forbid: { names: ['min', 'max', 'sort', 'stream'], why: 'This question asks you to find them yourself, without Math.min(), Math.max() or sorting.' },
  },
  57: {
    example: 'Example: secondLargest(new int[] {3, 1, 4, 1, 5}) returns 4; with no second value, null.',
    starter: arr('Integer secondLargest(int[] nums)', 'The second largest different value, or null if there is none.', 'secondLargest(new int[] {3, 1, 4, 1, 5})'),
    hint: 'Keep two Integer values, first and second (start them as null). For each number bigger than first, move first down to second; for a number between them (and not equal to first), it becomes second. Like a podium: a new winner pushes the old winner to second place.',
  },
  58: {
    example: 'Example: after reverseInPlace(nums) with nums = {1, 2, 3}, nums is [3, 2, 1].',
    starter: inPlace('void reverseInPlace(int[] nums)', 'Reverse the array itself (do not make a new array). Return nothing.', '1, 2, 3', 'reverseInPlace(nums)'),
    forbid: { names: ['reverse'], why: 'This question asks you to swap the items yourself, without reverse().' },
  },
  59: {
    example: 'Example: isSorted(new int[] {1, 2, 2, 3}) returns true.',
    starter: arr('boolean isSorted(int[] nums)', 'true if every number is at least the one before it.', 'isSorted(new int[] {1, 2, 2, 3})'),
    hint: 'Look at each neighbour pair nums[i - 1], nums[i]; if any pair goes down, the array is not sorted. Like checking that a row of steps never goes downhill.',
  },
  60: {
    example: 'Example: removeDuplicatesSorted(new int[] {1, 1, 2}) returns 2 and the array starts [1, 2].',
    starter: one(
      'int removeDuplicatesSorted(int[] nums)',
      'nums is sorted. Move each different value to the front, in place,\nand return how many different values there are.',
      'int[] nums = {1, 1, 2};\nint k = removeDuplicatesSorted(nums);\nSystem.out.println(k);\nSystem.out.println(Arrays.toString(nums));',
      UTIL,
    ),
  },
  61: {
    example: 'Example: after moveZeros(nums) with nums = {0, 1, 0, 3, 12}, nums is [1, 3, 12, 0, 0].',
    starter: inPlace('void moveZeros(int[] nums)', 'Move every 0 to the end, keeping the order of the other numbers. Change nums itself.', '0, 1, 0, 3, 12', 'moveZeros(nums)'),
  },
  62: {
    example: 'Example: after rotateRight(nums, 3) with nums = {1, 2, 3, 4, 5, 6, 7}, nums is [5, 6, 7, 1, 2, 3, 4].',
    starter: inPlace('void rotateRight(int[] nums, int k)', 'Move every item k places to the right, wrapping around. Change nums itself.', '1, 2, 3, 4, 5, 6, 7', 'rotateRight(nums, 3)'),
    hint: 'First use k = k % nums.length (rotating by the length changes nothing). Then reverse the whole array, reverse the first k items, and reverse the rest, each with two pointers swapping inwards. Like a round table: everyone moves k seats to the right.',
  },
  63: {
    example: 'Example: missingNumber(new int[] {3, 0, 1}) returns 2.',
    starter: arr('int missingNumber(int[] nums)', 'nums holds all the numbers 0 to n except one. Which one is missing?', 'missingNumber(new int[] {3, 0, 1})'),
    hint: 'With n = nums.length, the numbers 0 to n add up to n * (n + 1) / 2. Subtract the sum of nums: what is left is the missing one. Like counting the eggs in a full box and seeing how many are gone.',
  },
  64: {
    example: 'Example: singleNumber(new int[] {4, 1, 2, 1, 2}) returns 4.',
    starter: arr('int singleNumber(int[] nums)', 'Every number appears twice except one. Return that one.', 'singleNumber(new int[] {4, 1, 2, 1, 2})'),
  },
  65: {
    example: 'Example: findDuplicate(new int[] {1, 3, 4, 2, 2}) returns 2.',
    starter: arr('int findDuplicate(int[] nums)', 'n + 1 numbers, each from 1 to n: one value appears more than once. Return it.', 'findDuplicate(new int[] {1, 3, 4, 2, 2})'),
  },
  66: {
    example: 'Example: mergeSorted(new int[] {1, 3, 5}, new int[] {2, 4, 6}) returns [1, 2, 3, 4, 5, 6].',
    starter: arr('int[] mergeSorted(int[] a, int[] b)', 'a and b are sorted. Return one sorted array with all their items, without sorting again.', 'mergeSorted(new int[] {1, 3, 5}, new int[] {2, 4, 6})', true),
    hint: 'One pointer in each array: take the smaller of a[i] and b[j], move that pointer on, and repeat; when one array runs out, copy the rest of the other. Like merging two queues of people sorted by height into one.',
    forbid: NO_SORT,
  },
  67: {
    example: 'Example: intersection(new int[] {1, 2, 2, 1}, new int[] {2, 2}) returns [2].',
    starter: arr('List<Integer> intersection(int[] a, int[] b)', 'The values that are in both arrays, each once (in any order).', 'intersection(new int[] {1, 2, 2, 1}, new int[] {2, 2})'),
    hint: 'Put the values of a in a HashSet; go through b and collect each value that is in that set, once (a second set of found values avoids repeats). Like two friends comparing their lists of favourite films.',
  },
  68: {
    example: 'Example: union(new int[] {1, 2, 3}, new int[] {2, 3, 4}) returns [1, 2, 3, 4].',
    starter: arr('List<Integer> union(int[] a, int[] b)', 'Every value that is in either array, each once (in any order).', 'union(new int[] {1, 2, 3}, new int[] {2, 3, 4})'),
  },
  69: {
    example: 'Example: plusOne(new int[] {9, 9}) returns [1, 0, 0].',
    starter: arr('int[] plusOne(int[] digits)', 'digits holds a number, one digit per place. Return the digits of that number plus one.', 'plusOne(new int[] {9, 9})', true),
  },
  70: {
    example: 'Example: majorityElement(new int[] {2, 2, 1, 1, 1, 2, 2}) returns 2.',
    starter: arr('int majorityElement(int[] nums)', 'The value that appears more than half the time (there always is one).', 'majorityElement(new int[] {2, 2, 1, 1, 1, 2, 2})'),
  },
  71: {
    example: 'Example: maxProfit(new int[] {7, 1, 5, 3, 6, 4}) returns 5 (buy at 1, sell at 6).',
    starter: arr('int maxProfit(int[] prices)', 'Buy on one day and sell on a later day. The biggest profit (0 if none).', 'maxProfit(new int[] {7, 1, 5, 3, 6, 4})'),
  },
  72: {
    example: 'Example: maxProfitMany(new int[] {7, 1, 5, 3, 6, 4}) returns 7 (buy 1 sell 5, buy 3 sell 6).',
    starter: arr('int maxProfitMany(int[] prices)', 'Buy and sell as often as you like (one share at a time). The biggest total profit.', 'maxProfitMany(new int[] {7, 1, 5, 3, 6, 4})'),
  },
  73: {
    example: 'Example: maxSubarray(new int[] {-2, 1, -3, 4, -1, 2, 1, -5, 4}) returns 6 (4, -1, 2, 1).',
    starter: arr('int maxSubarray(int[] nums)', 'The largest sum of a run of neighbouring numbers (at least one number).', 'maxSubarray(new int[] {-2, 1, -3, 4, -1, 2, 1, -5, 4})'),
    hint: "Kadane's idea: keep the best sum of a run that ends here: either the current number alone, or the previous run plus it (current = Math.max(x, current + x)); keep the best ever. Like a runner deciding at each mile whether to keep going or restart fresh.",
  },
  74: {
    example: 'Example: productExceptSelf(new int[] {1, 2, 3, 4}) returns [24, 12, 8, 6].',
    starter: arr('int[] productExceptSelf(int[] nums)', 'Item i of the answer is the product of every number except nums[i]. Without division.', 'productExceptSelf(new int[] {1, 2, 3, 4})', true),
    forbid: { ops: ['/', '/='], why: 'This question asks you to do it without division.' },
  },
  75: {
    example: 'Example: majorityThird(new int[] {1, 1, 1, 3, 3, 2, 2, 2}) returns [1, 2] (in any order).',
    starter: arr('List<Integer> majorityThird(int[] nums)', 'Every value that appears more than nums.length / 3 times (in any order).', 'majorityThird(new int[] {1, 1, 1, 3, 3, 2, 2, 2})'),
    hint: 'At most two values can appear more than n / 3 times. Count every value (a HashMap), then keep those with a count bigger than nums.length / 3. (Boyer-Moore with two candidates does it without the map.) Like an election where a candidate needs more than a third of the votes.',
  },
  76: {
    example: 'Example: pascal(4) returns [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]].',
    starter: arr('List<List<Integer>> pascal(int n)', "The first n rows of Pascal's triangle.", 'pascal(5)'),
  },
  77: {
    example: 'Example: transpose(new int[][] {{1, 2, 3}, {4, 5, 6}}) returns [[1, 4], [2, 5], [3, 6]].',
    starter: one('int[][] transpose(int[][] matrix)', 'Rows become columns: item [r][c] moves to [c][r].', 'System.out.println(Arrays.deepToString(transpose(new int[][] {{1, 2, 3}, {4, 5, 6}})));', UTIL),
    hint: 'The answer has matrix[0].length rows and matrix.length columns (new int[cols][rows]); copy matrix[r][c] to answer[c][r]. Like turning a spreadsheet on its side so the column headings become row headings.',
  },
  78: {
    example: 'Example: rotateMatrix(m) with m = {{1, 2}, {3, 4}} changes m to [[3, 1], [4, 2]].',
    starter: one(
      'void rotateMatrix(int[][] matrix)',
      'Turn the square matrix a quarter turn clockwise, changing it itself.',
      'int[][] m = {{1, 2}, {3, 4}};\nrotateMatrix(m);\nSystem.out.println(Arrays.deepToString(m));',
      UTIL,
    ),
  },
  79: {
    example: 'Example: spiralOrder(new int[][] {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}) returns [1, 2, 3, 6, 9, 8, 7, 4, 5].',
    starter: arr('List<Integer> spiralOrder(int[][] matrix)', 'The items in spiral order: right along the top, down, left along the bottom, up, and inwards.', 'spiralOrder(new int[][] {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}})'),
  },
  80: {
    example: 'Example: setZeroes(m) with m = {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}} changes m to [[1, 0, 1], [0, 0, 0], [1, 0, 1]].',
    starter: one(
      'void setZeroes(int[][] matrix)',
      'Where a cell is 0, set its whole row and column to 0. Change the matrix itself.',
      'int[][] m = {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}};\nsetZeroes(m);\nSystem.out.println(Arrays.deepToString(m));',
      UTIL,
    ),
    hint: 'First find every row and every column that holds a 0 (two boolean arrays), without changing anything yet; then set each cell to 0 if its row or column was marked. Changing cells while still searching would spread zeros too far. Like marking the broken seats in a theatre before closing their rows and columns.',
  },
  81: {
    example: 'Example: leaders(new int[] {16, 17, 4, 3, 5, 2}) returns [17, 5, 2].',
    starter: arr('List<Integer> leaders(int[] nums)', 'Every item that is bigger than all the items to its right, in their original order.', 'leaders(new int[] {16, 17, 4, 3, 5, 2})'),
  },
  82: {
    example: 'Example: pivotIndex(new int[] {1, 7, 3, 6, 5, 6}) returns 3 (1 + 7 + 3 = 5 + 6).',
    starter: arr('int pivotIndex(int[] nums)', 'The first position where the sum to its left equals the sum to its right, or -1.', 'pivotIndex(new int[] {1, 7, 3, 6, 5, 6})'),
  },
  83: {
    example: 'Example: nextPermutation(nums) with nums = {1, 2, 3} changes nums to [1, 3, 2].',
    starter: inPlace('void nextPermutation(int[] nums)', 'Change nums to the next ordering in dictionary order (after the last one comes the first, sorted).', '1, 2, 3', 'nextPermutation(nums)'),
  },
  84: {
    example: 'Example: longestConsecutive(new int[] {100, 4, 200, 1, 3, 2}) returns 4 (1, 2, 3, 4).',
    starter: arr('int longestConsecutive(int[] nums)', 'The length of the longest run of consecutive numbers (in any order in the array), in O(n).', 'longestConsecutive(new int[] {100, 4, 200, 1, 3, 2})'),
    hint: 'Put every number in a HashSet. A run starts at x only when x - 1 is not in the set; from each start, count x + 1, x + 2, ... while they are in the set. Each number is counted once, so it is O(n). Like finding chains of house numbers on a street: begin only at a house with no neighbour on its left.',
  },
  85: {
    example: 'Example: trap(new int[] {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}) returns 6.',
    starter: arr('int trap(int[] height)', 'Bars of width 1 with these heights: how much rain water stays between them?', 'trap(new int[] {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1})'),
  },
});
