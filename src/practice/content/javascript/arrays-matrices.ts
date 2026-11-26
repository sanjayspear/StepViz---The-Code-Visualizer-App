// Practice, JavaScript: arrays-matrices. Tests come from the Python content; reference solutions in tests/practice/js/arrays-matrices.solutions.ts.
import { fromPython } from './shared';

const NO_SORT = { names: ['sort', 'toSorted'], why: 'This question asks you to merge them yourself, without sorting.' };
import { ARRAYS_MATRICES } from '../python/arrays-matrices';

export const ARRAYS_MATRICES_JS = fromPython(ARRAYS_MATRICES, {
  56: {
    example: 'Example: findMinMax([3, 1, 4, 1, 5]) returns [1, 5].',
    starter: `function findMinMax(nums) {
  // Return [smallest, largest] of a non-empty array, without Math.min(), Math.max() or sorting.
}

console.log(findMinMax([3, 1, 4, 1, 5]));
`,
    forbid: { names: ['min', 'max', 'sort', 'toSorted'], why: 'This question asks you to find them yourself, without Math.min(), Math.max() or sorting.' },
    hint: "Start with smallest = largest = nums[0], then look at each number once and update whichever one it beats. Like a referee who remembers only the fastest and the slowest runner so far.",
  },
  57: {
    example: 'Example: secondLargest([3, 1, 4, 1, 5]) returns 4; with no second value, null.',
    starter: `function secondLargest(nums) {
  // The second largest different value, or null if there is none.
}

console.log(secondLargest([3, 1, 4, 1, 5]));
`,
    hint: "Keep two values, first and second (start them as null). For each number bigger than first, move first down to second; for a number between them (and not equal to first), it becomes second. Like a podium: a new winner pushes the old winner to second place.",
  },
  58: {
    example: 'Example: after reverseInPlace(nums) with nums = [1, 2, 3], nums is [3, 2, 1].',
    starter: `function reverseInPlace(nums) {
  // Reverse the array itself (do not make a new array). Return nothing.
}

const nums = [1, 2, 3];
reverseInPlace(nums);
console.log(nums);
`,
    forbid: { names: ['reverse', 'toReversed'], why: 'This question asks you to swap the items yourself, without reverse().' },
  },
  59: {
    example: 'Example: isSorted([1, 2, 2, 3]) returns true.',
    starter: `function isSorted(nums) {
  // true if every item is at least as big as the one before it.
}

console.log(isSorted([1, 2, 2, 3]));
`,
    hint: "Look at each neighbour pair nums[i - 1], nums[i]; if any pair goes down, the array is not sorted. Like checking that a row of steps never goes downhill.",
  },
  60: {
    example: 'Example: removeDuplicatesSorted([1, 1, 2]) returns 2 and the array starts [1, 2].',
    starter: `function removeDuplicatesSorted(nums) {
  // nums is sorted. Move each different value to the front, in place,
  // and return how many different values there are.
}

const nums = [1, 1, 2];
const k = removeDuplicatesSorted(nums);
console.log(k, nums.slice(0, k));
`,
  },
  61: {
    example: 'Example: after moveZeros(nums) with nums = [0, 1, 0, 3, 12], nums is [1, 3, 12, 0, 0].',
    starter: `function moveZeros(nums) {
  // Move every 0 to the end, keeping the order of the other numbers. Change nums itself.
}

const nums = [0, 1, 0, 3, 12];
moveZeros(nums);
console.log(nums);
`,
  },
  62: {
    example: 'Example: after rotateRight(nums, 3) with nums = [1, 2, 3, 4, 5, 6, 7], nums is [5, 6, 7, 1, 2, 3, 4].',
    starter: `function rotateRight(nums, k) {
  // Move every item k places to the right, wrapping around. Change nums itself.
}

const nums = [1, 2, 3, 4, 5, 6, 7];
rotateRight(nums, 3);
console.log(nums);
`,
    hint: "First use k = k % nums.length (rotating by the length changes nothing). Then reverse the whole array, reverse the first k items, and reverse the rest, each with two pointers swapping inwards. Like a round table: everyone moves k seats to the right.",
  },
  63: {
    example: 'Example: missingNumber([3, 0, 1]) returns 2.',
    starter: `function missingNumber(nums) {
  // nums holds all the numbers 0 to n except one. Which one is missing?
}

console.log(missingNumber([3, 0, 1]));
`,
    hint: "With n = nums.length, the numbers 0 to n add up to n * (n + 1) / 2. Subtract the sum of nums: what is left is the missing one. Like counting the eggs in a full box and seeing how many are gone.",
  },
  64: {
    example: 'Example: singleNumber([4, 1, 2, 1, 2]) returns 4.',
    starter: `function singleNumber(nums) {
  // Every number appears twice except one. Return that one.
}

console.log(singleNumber([4, 1, 2, 1, 2]));
`,
  },
  65: {
    example: 'Example: findDuplicate([1, 3, 4, 2, 2]) returns 2.',
    starter: `function findDuplicate(nums) {
  // n + 1 numbers, each from 1 to n: one value appears more than once. Return it.
}

console.log(findDuplicate([1, 3, 4, 2, 2]));
`,
  },
  66: {
    example: 'Example: mergeSorted([1, 3, 5], [2, 4, 6]) returns [1, 2, 3, 4, 5, 6].',
    starter: `function mergeSorted(a, b) {
  // a and b are sorted. Return one sorted array with all their items, without sorting again.
}

console.log(mergeSorted([1, 3, 5], [2, 4, 6]));
`,
    hint: "One pointer in each array: take the smaller of a[i] and b[j], move that pointer on, and repeat; when one array runs out, add the rest of the other. Like merging two queues of people sorted by height into one.",
    forbid: NO_SORT,
  },
  67: {
    example: 'Example: intersection([1, 2, 2, 1], [2, 2]) returns [2].',
    starter: `function intersection(a, b) {
  // The values that are in both arrays, each once (in any order).
}

console.log(intersection([4, 9, 5], [9, 4, 9, 8, 4]));
`,
  },
  68: {
    example: 'Example: union([1, 2, 3], [2, 3, 4]) returns [1, 2, 3, 4].',
    starter: `function union(a, b) {
  // Every value that is in either array, each once (in any order).
}

console.log(union([1, 2, 3], [2, 3, 4]));
`,
  },
  69: {
    example: 'Example: plusOne([9, 9]) returns [1, 0, 0].',
    starter: `function plusOne(digits) {
  // digits is a number written digit by digit. Return the digits of that number plus one.
}

console.log(plusOne([1, 2, 3]));
`,
  },
  70: {
    example: 'Example: majorityElement([2, 2, 1, 1, 1, 2, 2]) returns 2.',
    starter: `function majorityElement(nums) {
  // The value that appears more than len(nums) / 2 times (there always is one).
}

console.log(majorityElement([2, 2, 1, 1, 1, 2, 2]));
`,
  },
  71: {
    example: 'Example: maxProfit([7, 1, 5, 3, 6, 4]) returns 5 (buy at 1, sell at 6).',
    starter: `function maxProfit(prices) {
  // Buy on one day and sell on a later day. The biggest profit (0 if none).
}

console.log(maxProfit([7, 1, 5, 3, 6, 4]));
`,
  },
  72: {
    example: 'Example: maxProfitMany([7, 1, 5, 3, 6, 4]) returns 7 (buy 1 sell 5, buy 3 sell 6).',
    starter: `function maxProfitMany(prices) {
  // You may buy and sell many times (hold at most one share). The biggest total profit.
}

console.log(maxProfitMany([7, 1, 5, 3, 6, 4]));
`,
  },
  73: {
    example: 'Example: maxSubarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) returns 6 (4, -1, 2, 1).',
    starter: `function maxSubarray(nums) {
  // The largest sum of a run of neighbouring items (at least one item).
}

console.log(maxSubarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));
`,
  },
  74: {
    example: 'Example: productExceptSelf([1, 2, 3, 4]) returns [24, 12, 8, 6].',
    starter: `function productExceptSelf(nums) {
  // Item i of the answer is the product of every number except nums[i]. Without division.
}

console.log(productExceptSelf([1, 2, 3, 4]));
`,
    forbid: { ops: ['/', '/='], why: 'This question asks you to do it without division.' },
  },
  75: {
    example: 'Example: majorityThird([1, 1, 1, 3, 3, 2, 2, 2]) returns [1, 2] (in any order).',
    starter: `function majorityThird(nums) {
  // Every value that appears more than len(nums) / 3 times (in any order).
}

console.log(majorityThird([3, 2, 3]));
`,
    hint: "At most two values can appear more than n / 3 times. Count every value (a Map), then keep those with count > Math.floor(nums.length / 3). (Boyer-Moore with two candidates does it without the Map.) Like an election where a candidate needs more than a third of the votes.",
  },
  76: {
    example: 'Example: pascal(4) returns [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]].',
    starter: `function pascal(n) {
  // The first n rows of Pascal's triangle.
}

console.log(pascal(5));
`,
  },
  77: {
    example: 'Example: transpose([[1, 2, 3], [4, 5, 6]]) returns [[1, 4], [2, 5], [3, 6]].',
    starter: `function transpose(matrix) {
  // Rows become columns: item [r][c] moves to [c][r].
}

console.log(transpose([[1, 2, 3], [4, 5, 6]]));
`,
    hint: "The answer has matrix[0].length rows; row c holds matrix[r][c] for every r (matrix.map((row) => row[c])). Like turning a spreadsheet on its side so the column headings become row headings.",
  },
  78: {
    example: 'Example: rotateMatrix(m) with m = [[1, 2], [3, 4]] changes m to [[3, 1], [4, 2]].',
    starter: `function rotateMatrix(matrix) {
  // Turn the square matrix 90 degrees clockwise, changing the matrix itself.
}

const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
rotateMatrix(m);
console.log(m);
`,
  },
  79: {
    example: 'Example: spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) returns [1, 2, 3, 6, 9, 8, 7, 4, 5].',
    starter: `function spiralOrder(matrix) {
  // The items in spiral order: right along the top, down, left along the bottom, up, and inwards.
}

console.log(spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]]));
`,
  },
  80: {
    example: 'Example: setZeroes(m) with m = [[1, 1, 1], [1, 0, 1], [1, 1, 1]] changes m to [[1, 0, 1], [0, 0, 0], [1, 0, 1]].',
    starter: `function setZeroes(matrix) {
  // Where a cell is 0, set its whole row and column to 0. Change the matrix itself.
}

const m = [[1, 1, 1], [1, 0, 1], [1, 1, 1]];
setZeroes(m);
console.log(m);
`,
  },
  81: {
    example: 'Example: leaders([16, 17, 4, 3, 5, 2]) returns [17, 5, 2].',
    starter: `function leaders(nums) {
  // Every item that is bigger than all the items to its right, in their original order.
}

console.log(leaders([16, 17, 4, 3, 5, 2]));
`,
  },
  82: {
    example: 'Example: pivotIndex([1, 7, 3, 6, 5, 6]) returns 3 (1 + 7 + 3 = 5 + 6).',
    starter: `function pivotIndex(nums) {
  // The first position where the sum to its left equals the sum to its right, or -1.
}

console.log(pivotIndex([1, 7, 3, 6, 5, 6]));
`,
  },
  83: {
    example: 'Example: nextPermutation(nums) with nums = [1, 2, 3] changes nums to [1, 3, 2].',
    starter: `function nextPermutation(nums) {
  // Change nums to the next ordering in dictionary order (after the last one comes the first, sorted).
}

const nums = [1, 2, 3];
nextPermutation(nums);
console.log(nums);
`,
  },
  84: {
    example: 'Example: longestConsecutive([100, 4, 200, 1, 3, 2]) returns 4 (1, 2, 3, 4).',
    starter: `function longestConsecutive(nums) {
  // The length of the longest run of consecutive numbers (in any order in the array), in O(n).
}

console.log(longestConsecutive([100, 4, 200, 1, 3, 2]));
`,
  },
  85: {
    example: 'Example: trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]) returns 6.',
    starter: `function trap(height) {
  // The bars have these heights and width 1. How much rain water stays between them?
}

console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]));
`,
  },
});
