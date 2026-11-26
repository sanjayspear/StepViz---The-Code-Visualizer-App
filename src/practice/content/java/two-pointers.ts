// Practice, Java: Two pointers (Q111-Q130). Tests come from the Python content;
// reference solutions in tests/practice/java/two-pointers.solutions.ts.
import { fromPython } from '../javascript/shared';
import { TWO_POINTERS } from '../python/two-pointers';
import { one } from './shared';

const UTIL = 'import java.util.*;';
const NO_SORT = { names: ['sort', 'stream', 'PriorityQueue', 'TreeSet', 'TreeMap'], why: 'This question asks you to do it without sorting.' };
const call = (header: string, comment: string, expr: string, printArray = false) =>
  one(header, comment, printArray ? `System.out.println(Arrays.toString(${expr}));` : `System.out.println(${expr});`, UTIL);
const inPlace = (header: string, comment: string, setup: string) => one(header, comment, setup, UTIL);

export const TWO_POINTERS_JAVA = fromPython(TWO_POINTERS, {
  111: {
    example: 'Example: twoSumSorted(new int[] {2, 7, 11, 15}, 9) returns [0, 1].',
    starter: call('int[] twoSumSorted(int[] nums, int target)', 'nums is sorted. The positions {i, j} (i < j) of two numbers that add up to target.', 'twoSumSorted(new int[] {2, 7, 11, 15}, 9)', true),
  },
  112: {
    example: 'Example: reverseVowels("hello") returns "holle".',
    starter: call('String reverseVowels(String s)', 'Reverse the order of the vowels (a, e, i, o, u in any case); everything else stays put.', 'reverseVowels("hello")'),
    hint: 'Turn s into a char[] (s.toCharArray()). Move a left pointer right until it finds a vowel and a right pointer left until it finds one; swap them and keep going until the pointers meet; then make a String again (new String(chars)). Like two people swapping only the red cards in a row, starting from both ends.',
  },
  113: {
    example: 'Example: removeElement(new int[] {3, 2, 2, 3}, 3) returns 2, and the array starts [2, 2].',
    starter: inPlace(
      'int removeElement(int[] nums, int val)',
      'Move every item that is not val to the front of nums (any order), in place,\nand return how many there are.',
      'int[] nums = {3, 2, 2, 3};\nint k = removeElement(nums, 3);\nSystem.out.println(k);\nSystem.out.println(Arrays.toString(nums));',
    ),
  },
  114: {
    example: 'Example: sortedSquares(new int[] {-4, -1, 0, 3, 10}) returns [0, 1, 9, 16, 100].',
    starter: call('int[] sortedSquares(int[] nums)', 'nums is sorted. The squares of its numbers, also sorted, without sorting.', 'sortedSquares(new int[] {-4, -1, 0, 3, 10})', true),
    forbid: NO_SORT,
  },
  115: {
    example: 'Example: mergeInto(a, 3, new int[] {2, 5, 6}, 3) with a = {1, 2, 3, 0, 0, 0} changes a to [1, 2, 2, 3, 5, 6].',
    starter: inPlace(
      'void mergeInto(int[] a, int m, int[] b, int n)',
      'a has m sorted numbers followed by n spare places; b has n sorted numbers.\nMerge b into a so a is sorted, changing a itself, without sorting.',
      'int[] a = {1, 2, 3, 0, 0, 0};\nmergeInto(a, 3, new int[] {2, 5, 6}, 3);\nSystem.out.println(Arrays.toString(a));',
    ),
    forbid: NO_SORT,
  },
  116: {
    example: 'Example: negativesFirst(nums) with nums = {1, -2, 3, -4} changes nums to something like [-2, -4, 1, 3].',
    starter: inPlace(
      'void negativesFirst(int[] nums)',
      'Rearrange nums itself so every negative number comes before every other number.\n(Any order inside the two groups is fine.)',
      'int[] nums = {1, -2, 3, -4, -5};\nnegativesFirst(nums);\nSystem.out.println(Arrays.toString(nums));',
    ),
  },
  117: {
    example: 'Example: backspaceCompare("ab#c", "ad#c") returns true (both are "ac").',
    starter: call('boolean backspaceCompare(String s, String t)', 'In both texts, "#" deletes the letter before it. true if the results are equal.', 'backspaceCompare("ab#c", "ad#c")'),
    hint: 'Build what each text really says with a StringBuilder used as a stack: add each letter at the end, and for each "#" delete the last letter (if there is one). Then compare the two results with equals. Like typing on a keyboard: the backspace key removes the last letter you typed.',
  },
  118: {
    example: 'Example: palindromeAfterOneDelete("abca") returns true (delete "c" or "b").',
    starter: call('boolean palindromeAfterOneDelete(String s)', 'true if s is a palindrome, or becomes one after deleting at most one character.', 'palindromeAfterOneDelete("abca")'),
  },
  119: {
    example: 'Example: hasPairWithDifference(new int[] {1, 3, 5, 8}, 3) returns true (8 - 5).',
    starter: call('boolean hasPairWithDifference(int[] nums, int k)', 'nums is sorted, k is 0 or more. true if two different positions hold values that differ by k.', 'hasPairWithDifference(new int[] {1, 3, 5, 8}, 3)'),
  },
  120: {
    example: 'Example: maxArea(new int[] {1, 8, 6, 2, 5, 4, 8, 3, 7}) returns 49.',
    starter: call('int maxArea(int[] height)', 'Two lines and the ground make a container. The most water any two lines can hold.', 'maxArea(new int[] {1, 8, 6, 2, 5, 4, 8, 3, 7})'),
  },
  121: {
    example: 'Example: threeSum(new int[] {-1, 0, 1, 2, -1, -4}) returns [[-1, -1, 2], [-1, 0, 1]] (in any order).',
    starter: call('List<List<Integer>> threeSum(int[] nums)', 'Every different triplet of values (from different positions) that adds up to 0.', 'threeSum(new int[] {-1, 0, 1, 2, -1, -4})'),
    hint: 'Sort the numbers (Arrays.sort). Fix the first number (skip values already tried), then find the other two with two pointers in the rest: too small, move left on; too big, move right in; skip repeated values after a match. Like seating three people on a bench so their weights balance.',
  },
  122: {
    example: 'Example: threeSumClosest(new int[] {-1, 2, 1, -4}, 1) returns 2 (-1 + 2 + 1).',
    starter: call('int threeSumClosest(int[] nums, int target)', 'The sum of three numbers (different positions) that is closest to target.', 'threeSumClosest(new int[] {-1, 2, 1, -4}, 1)'),
  },
  123: {
    example: 'Example: fourSum(new int[] {1, 0, -1, 0, -2, 2}, 0) returns [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]] (in any order).',
    starter: call('List<List<Integer>> fourSum(int[] nums, int target)', 'Every different group of four values (from different positions) that adds up to target.', 'fourSum(new int[] {1, 0, -1, 0, -2, 2}, 0)'),
  },
  124: {
    example: 'Example: sortColors(nums) with nums = {2, 0, 2, 1, 1, 0} changes nums to [0, 0, 1, 1, 2, 2].',
    starter: inPlace(
      'void sortColors(int[] nums)',
      'nums holds 0s, 1s and 2s. Sort it in one pass, in place, without Arrays.sort().',
      'int[] nums = {2, 0, 2, 1, 1, 0};\nsortColors(nums);\nSystem.out.println(Arrays.toString(nums));',
    ),
    forbid: NO_SORT,
  },
  125: {
    example: 'Example: removeExtraDuplicates(new int[] {1, 1, 1, 2, 2, 3}) returns 5, and the array starts [1, 1, 2, 2, 3].',
    starter: inPlace(
      'int removeExtraDuplicates(int[] nums)',
      'nums is sorted. Keep each value at most twice at the front, in place; return how many are kept.',
      'int[] nums = {1, 1, 1, 2, 2, 3};\nint k = removeExtraDuplicates(nums);\nSystem.out.println(k);\nSystem.out.println(Arrays.toString(nums));',
    ),
  },
  126: {
    example: 'Example: countPairsBelow(new int[] {-1, 1, 1, 2, 3}, 2) returns 3.',
    starter: call('int countPairsBelow(int[] nums, int target)', 'nums is sorted. How many pairs of positions i < j have nums[i] + nums[j] < target?', 'countPairsBelow(new int[] {-1, 1, 1, 2, 3}, 2)'),
  },
  127: {
    example: 'Example: numBoats(new int[] {3, 2, 2, 1}, 3) returns 3.',
    starter: call(
      'int numBoats(int[] people, int limit)',
      'Each boat holds at most two people whose weights add up to at most limit.\nThe fewest boats to carry everyone (nobody is heavier than limit).',
      'numBoats(new int[] {3, 2, 2, 1}, 3)',
    ),
    hint: 'Sort the weights (Arrays.sort). The heaviest person always takes a boat; if the lightest person fits with them, they go together. Move the pointers and count the boats. Like pairing the heaviest backpack with the lightest one so no trip is wasted.',
  },
  128: {
    example: 'Example: shortestUnsorted(new int[] {2, 6, 4, 8, 10, 9, 15}) returns 5 (sorting 6, 4, 8, 10, 9 fixes it).',
    starter: call('int shortestUnsorted(int[] nums)', 'The length of the shortest run that, if sorted, makes the whole array sorted (0 if it already is).', 'shortestUnsorted(new int[] {2, 6, 4, 8, 10, 9, 15})'),
  },
  129: {
    example: 'Example: smallestDifference(new int[] {1, 2, 3, 11, 15}, new int[] {8, 19, 23, 127, 235}) returns 3 (11 and 8).',
    starter: call('int smallestDifference(int[] a, int[] b)', 'a and b are sorted. The smallest |x - y| with x from a and y from b.', 'smallestDifference(new int[] {1, 2, 3, 11, 15}, new int[] {8, 19, 23, 127, 235})'),
  },
  130: {
    example: 'Example: triangleCount(new int[] {2, 2, 3, 4}) returns 3.',
    starter: call('int triangleCount(int[] nums)', 'How many groups of three positions make a triangle (any two sides add up to more than the third)?', 'triangleCount(new int[] {2, 2, 3, 4})'),
  },
});
