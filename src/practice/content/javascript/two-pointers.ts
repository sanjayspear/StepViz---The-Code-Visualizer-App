// Practice, JavaScript: two-pointers. Tests come from the Python content; reference solutions in tests/practice/js/two-pointers.solutions.ts.
import { fromPython } from './shared';

const NO_SORT = { names: ['sort', 'toSorted'], why: 'This question asks you to do it without sorting.' };
import { TWO_POINTERS } from '../python/two-pointers';

export const TWO_POINTERS_JS = fromPython(TWO_POINTERS, {
  111: {
    example: 'Example: twoSumSorted([2, 7, 11, 15], 9) returns [0, 1].',
    starter: `function twoSumSorted(nums, target) {
  // nums is sorted. The positions [i, j] (i < j) of two numbers that add up to target.
}

console.log(twoSumSorted([2, 7, 11, 15], 9));
`,
  },
  112: {
    example: 'Example: reverseVowels("hello") returns "holle".',
    starter: `function reverseVowels(s) {
  // Reverse the order of the vowels (a, e, i, o, u in any case); everything else stays put.
}

console.log(reverseVowels("hello"));
`,
    hint: "Turn s into an array of letters ([...s]). Move a left pointer right until it finds a vowel and a right pointer left until it finds one; swap them and keep going until the pointers meet; then join the letters again. Like two people swapping only the red cards in a row, starting from both ends.",
  },
  113: {
    example: 'Example: removeElement([3, 2, 2, 3], 3) returns 2, and the array starts [2, 2].',
    starter: `function removeElement(nums, val) {
  // Move every item that is not val to the front of nums (any order), in place,
  // and return how many there are.
}

const nums = [3, 2, 2, 3];
const k = removeElement(nums, 3);
console.log(k, nums.slice(0, k));
`,
  },
  114: {
    example: 'Example: sortedSquares([-4, -1, 0, 3, 10]) returns [0, 1, 9, 16, 100].',
    starter: `function sortedSquares(nums) {
  // nums is sorted. The squares of its numbers, also sorted, without sorting.
}

console.log(sortedSquares([-4, -1, 0, 3, 10]));
`,
    forbid: NO_SORT,
  },
  115: {
    example: 'Example: mergeInto(a, 3, [2, 5, 6], 3) with a = [1, 2, 3, 0, 0, 0] changes a to [1, 2, 2, 3, 5, 6].',
    starter: `function mergeInto(a, m, b, n) {
  // a has m sorted numbers followed by n spare places; b has n sorted numbers.
  // Merge b into a so a is sorted, changing a itself, without sorting.
}

const a = [1, 2, 3, 0, 0, 0];
mergeInto(a, 3, [2, 5, 6], 3);
console.log(a);
`,
    forbid: NO_SORT,
  },
  116: {
    example: 'Example: negativesFirst(nums) with nums = [1, -2, 3, -4] changes nums to something like [-2, -4, 1, 3].',
    starter: `function negativesFirst(nums) {
  // Rearrange nums itself so every negative number comes before every other number.
  // (Any order inside the two groups is fine.)
}

const nums = [1, -2, 3, -4, -5];
negativesFirst(nums);
console.log(nums);
`,
  },
  117: {
    example: 'Example: backspaceCompare("ab#c", "ad#c") returns true (both are "ac").',
    starter: `function backspaceCompare(s, t) {
  // In both texts, "#" deletes the letter before it. true if the results are equal.
}

console.log(backspaceCompare("ab#c", "ad#c"));
`,
    hint: "Build what each text really says: go through it with an array used as a stack, pushing letters and popping one for each \"#\" (if there is one). Then compare the two results. Like typing on a keyboard: the backspace key removes the last letter you typed.",
  },
  118: {
    example: 'Example: palindromeAfterOneDelete("abca") returns true (delete "c" or "b").',
    starter: `function palindromeAfterOneDelete(s) {
  // true if s is a palindrome, or becomes one after deleting at most one character.
}

console.log(palindromeAfterOneDelete("abca"));
`,
  },
  119: {
    example: 'Example: hasPairWithDifference([1, 3, 5, 8], 3) returns true (8 - 5).',
    starter: `function hasPairWithDifference(nums, k) {
  // nums is sorted, k is 0 or more. true if two different positions hold values that differ by k.
}

console.log(hasPairWithDifference([1, 3, 5, 8], 3));
`,
  },
  120: {
    example: 'Example: maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]) returns 49.',
    starter: `function maxArea(height) {
  // Two lines and the ground make a container. The most water any two lines can hold.
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));
`,
  },
  121: {
    example: 'Example: threeSum([-1, 0, 1, 2, -1, -4]) returns [[-1, -1, 2], [-1, 0, 1]] (in any order).',
    starter: `function threeSum(nums) {
  // Every different triplet of values (from different positions) that adds up to 0.
}

console.log(threeSum([-1, 0, 1, 2, -1, -4]));
`,
    hint: "Sort the numbers (nums.slice().sort((a, b) => a - b): a plain sort() compares numbers as text). Fix the first number (skip values already tried), then find the other two with two pointers in the rest: too small, move left on; too big, move right in; skip repeated values after a match. Like seating three people on a bench so their weights balance.",
  },
  122: {
    example: 'Example: threeSumClosest([-1, 2, 1, -4], 1) returns 2 (-1 + 2 + 1).',
    starter: `function threeSumClosest(nums, target) {
  // The sum of three numbers (different positions) that is closest to target.
}

console.log(threeSumClosest([-1, 2, 1, -4], 1));
`,
  },
  123: {
    example: 'Example: fourSum([1, 0, -1, 0, -2, 2], 0) returns [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]] (in any order).',
    starter: `function fourSum(nums, target) {
  // Every different group of four values (from different positions) that adds up to target.
}

console.log(fourSum([1, 0, -1, 0, -2, 2], 0));
`,
  },
  124: {
    example: 'Example: sortColors(nums) with nums = [2, 0, 2, 1, 1, 0] changes nums to [0, 0, 1, 1, 2, 2].',
    starter: `function sortColors(nums) {
  // nums holds 0s, 1s and 2s. Sort it in one pass, in place, without sort().
}

const nums = [2, 0, 2, 1, 1, 0];
sortColors(nums);
console.log(nums);
`,
    forbid: NO_SORT,
  },
  125: {
    example: 'Example: removeExtraDuplicates([1, 1, 1, 2, 2, 3]) returns 5, and the array starts [1, 1, 2, 2, 3].',
    starter: `function removeExtraDuplicates(nums) {
  // nums is sorted. Keep each value at most twice at the front, in place; return how many are kept.
}

const nums = [1, 1, 1, 2, 2, 3];
const k = removeExtraDuplicates(nums);
console.log(k, nums.slice(0, k));
`,
  },
  126: {
    example: 'Example: countPairsBelow([-1, 1, 1, 2, 3], 2) returns 3.',
    starter: `function countPairsBelow(nums, target) {
  // nums is sorted. How many pairs of positions i < j have nums[i] + nums[j] < target?
}

console.log(countPairsBelow([-1, 1, 1, 2, 3], 2));
`,
  },
  127: {
    example: 'Example: numBoats([3, 2, 2, 1], 3) returns 3.',
    starter: `function numBoats(people, limit) {
  // Each boat holds at most two people whose weights add up to at most limit.
  // The fewest boats to carry everyone (nobody is heavier than limit).
}

console.log(numBoats([3, 2, 2, 1], 3));
`,
    hint: "Sort the weights (with (a, b) => a - b). The heaviest person always takes a boat; if the lightest person fits with them, they go together. Move the pointers and count the boats. Like pairing the heaviest backpack with the lightest one so no trip is wasted.",
  },
  128: {
    example: 'Example: shortestUnsorted([2, 6, 4, 8, 10, 9, 15]) returns 5 (sorting 6, 4, 8, 10, 9 fixes it).',
    starter: `function shortestUnsorted(nums) {
  // The length of the shortest run that, if sorted, makes the whole array sorted (0 if it already is).
}

console.log(shortestUnsorted([2, 6, 4, 8, 10, 9, 15]));
`,
  },
  129: {
    example: 'Example: smallestDifference([1, 2, 3, 11, 15], [8, 19, 23, 127, 235]) returns 3 (11 and 8).',
    starter: `function smallestDifference(a, b) {
  // a and b are sorted. The smallest |x - y| with x from a and y from b.
}

console.log(smallestDifference([1, 2, 3, 11, 15], [8, 19, 23, 127, 235]));
`,
  },
  130: {
    example: 'Example: triangleCount([2, 2, 3, 4]) returns 3.',
    starter: `function triangleCount(nums) {
  // How many groups of three positions make a triangle (any two sides add up to more than the third)?
}

console.log(triangleCount([2, 2, 3, 4]));
`,
  },
});
