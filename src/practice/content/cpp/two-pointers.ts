// Practice, C++: Two pointers (Q111-Q130). Tests come from the Python content;
// reference solutions in tests/practice/cpp/two-pointers.solutions.ts.
import { fromPython } from '../javascript/shared';
import { TWO_POINTERS } from '../python/two-pointers';
import { cppStarter, PRINT_INTS } from './shared';

const NO_SORT = {
  names: ['sort', 'stable_sort', 'partial_sort', 'merge', 'inplace_merge'],
  patterns: [{ regex: '(set|multiset|priority_queue)<', shown: 'a sorted container' }],
  why: 'This question asks you to do it without sorting.',
};
const fn = (header: string, comment: string, setup: string, print: string) => cppStarter([[header, comment]], `${setup}\n${print}`, [], PRINT_INTS);
const nums = (values: string) => `vector<int> nums = {${values}};`;
const show = (expr: string) => `cout << ${expr} << endl;`;
const yes = (expr: string) => `cout << boolalpha << ${expr} << endl;`;

export const TWO_POINTERS_CPP = fromPython(TWO_POINTERS, {
  111: {
    example: 'Example: twoSumSorted({2, 7, 11, 15}, 9) returns [0, 1].',
    starter: fn('vector<int> twoSumSorted(vector<int>& nums, int target)', 'nums is sorted. The positions {i, j} (i < j) of two numbers that add up to target.', nums('2, 7, 11, 15'), 'vector<int> r = twoSumSorted(nums, 9);\nprintVector(r);'),
  },
  112: {
    example: 'Example: reverseVowels("hello") returns "holle".',
    starter: fn('string reverseVowels(string s)', 'Reverse the order of the vowels (a, e, i, o, u in any case); everything else stays put.', '', show('reverseVowels("hello")')),
    hint: 'Move a left pointer right until it finds a vowel and a right pointer left until it finds one; swap s[i] and s[j] and keep going until the pointers meet. Like two people swapping only the red cards in a row, starting from both ends.',
  },
  113: {
    example: 'Example: removeElement({3, 2, 2, 3}, 3) returns 2, and the vector starts [2, 2].',
    starter: fn(
      'int removeElement(vector<int>& nums, int val)',
      'Move every item that is not val to the front of nums (any order), in place,\nand return how many there are.',
      nums('3, 2, 2, 3'),
      'int k = removeElement(nums, 3);\ncout << k << endl;\nprintVector(nums);',
    ),
  },
  114: {
    example: 'Example: sortedSquares({-4, -1, 0, 3, 10}) returns [0, 1, 9, 16, 100].',
    starter: fn('vector<int> sortedSquares(vector<int>& nums)', 'nums is sorted. The squares of its numbers, also sorted, without sorting.', nums('-4, -1, 0, 3, 10'), 'vector<int> r = sortedSquares(nums);\nprintVector(r);'),
    forbid: NO_SORT,
  },
  115: {
    example: 'Example: mergeInto(a, 3, {2, 5, 6}, 3) with a = {1, 2, 3, 0, 0, 0} changes a to [1, 2, 2, 3, 5, 6].',
    starter: fn(
      'void mergeInto(vector<int>& a, int m, vector<int>& b, int n)',
      'a has m sorted numbers followed by n spare places; b has n sorted numbers.\nMerge b into a so a is sorted, changing a itself, without sorting.',
      'vector<int> a = {1, 2, 3, 0, 0, 0};\nvector<int> b = {2, 5, 6};',
      'mergeInto(a, 3, b, 3);\nprintVector(a);',
    ),
    forbid: NO_SORT,
  },
  116: {
    example: 'Example: negativesFirst(nums) with nums = {1, -2, 3, -4} changes nums to something like [-2, -4, 1, 3].',
    starter: fn(
      'void negativesFirst(vector<int>& nums)',
      'Rearrange nums itself so every negative number comes before every other number.\n(Any order inside the two groups is fine.)',
      nums('1, -2, 3, -4, -5'),
      'negativesFirst(nums);\nprintVector(nums);',
    ),
  },
  117: {
    example: 'Example: backspaceCompare("ab#c", "ad#c") returns true (both are "ac").',
    starter: fn('bool backspaceCompare(string s, string t)', 'In both texts, "#" deletes the letter before it. true if the results are equal.', '', yes('backspaceCompare("ab#c", "ad#c")')),
    hint: 'Build what each text really says in a string used as a stack: add each letter at the end (push_back), and for each "#" remove the last letter if there is one (pop_back). Then compare the two results with ==. Like typing on a keyboard: the backspace key removes the last letter you typed.',
  },
  118: {
    example: 'Example: palindromeAfterOneDelete("abca") returns true (delete "c" or "b").',
    starter: fn('bool palindromeAfterOneDelete(string s)', 'true if s is a palindrome, or becomes one after deleting at most one character.', '', yes('palindromeAfterOneDelete("abca")')),
  },
  119: {
    example: 'Example: hasPairWithDifference({1, 3, 5, 8}, 3) returns true (8 - 5).',
    starter: fn('bool hasPairWithDifference(vector<int>& nums, int k)', 'nums is sorted, k is 0 or more. true if two different positions hold values that differ by k.', nums('1, 3, 5, 8'), yes('hasPairWithDifference(nums, 3)')),
  },
  120: {
    example: 'Example: maxArea({1, 8, 6, 2, 5, 4, 8, 3, 7}) returns 49.',
    starter: fn('int maxArea(vector<int>& height)', 'Two lines and the ground make a container. The most water any two lines can hold.', 'vector<int> height = {1, 8, 6, 2, 5, 4, 8, 3, 7};', show('maxArea(height)')),
  },
  121: {
    example: 'Example: threeSum({-1, 0, 1, 2, -1, -4}) returns [[-1, -1, 2], [-1, 0, 1]] (in any order).',
    starter: fn('vector<vector<int>> threeSum(vector<int>& nums)', 'Every different triplet of values (from different positions) that adds up to 0.', nums('-1, 0, 1, 2, -1, -4'), show('threeSum(nums).size()')),
    hint: 'Sort the numbers (sort(nums.begin(), nums.end())). Fix the first number (skip values already tried), then find the other two with two pointers in the rest: too small, move left on; too big, move right in; skip repeated values after a match. Like seating three people on a bench so their weights balance.',
  },
  122: {
    example: 'Example: threeSumClosest({-1, 2, 1, -4}, 1) returns 2 (-1 + 2 + 1).',
    starter: fn('int threeSumClosest(vector<int>& nums, int target)', 'The sum of three numbers (different positions) that is closest to target.', nums('-1, 2, 1, -4'), show('threeSumClosest(nums, 1)')),
  },
  123: {
    example: 'Example: fourSum({1, 0, -1, 0, -2, 2}, 0) returns [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]] (in any order).',
    starter: fn('vector<vector<int>> fourSum(vector<int>& nums, int target)', 'Every different group of four values (from different positions) that adds up to target.', nums('1, 0, -1, 0, -2, 2'), show('fourSum(nums, 0).size()')),
  },
  124: {
    example: 'Example: sortColors(nums) with nums = {2, 0, 2, 1, 1, 0} changes nums to [0, 0, 1, 1, 2, 2].',
    starter: fn('void sortColors(vector<int>& nums)', 'nums holds 0s, 1s and 2s. Sort it in one pass, in place, without sort().', nums('2, 0, 2, 1, 1, 0'), 'sortColors(nums);\nprintVector(nums);'),
    forbid: NO_SORT,
  },
  125: {
    example: 'Example: removeExtraDuplicates({1, 1, 1, 2, 2, 3}) returns 5, and the vector starts [1, 1, 2, 2, 3].',
    starter: fn(
      'int removeExtraDuplicates(vector<int>& nums)',
      'nums is sorted. Keep each value at most twice at the front, in place; return how many are kept.',
      nums('1, 1, 1, 2, 2, 3'),
      'int k = removeExtraDuplicates(nums);\ncout << k << endl;\nprintVector(nums);',
    ),
  },
  126: {
    example: 'Example: countPairsBelow({-1, 1, 1, 2, 3}, 2) returns 3.',
    starter: fn('int countPairsBelow(vector<int>& nums, int target)', 'nums is sorted. How many pairs of positions i < j have nums[i] + nums[j] < target?', nums('-1, 1, 1, 2, 3'), show('countPairsBelow(nums, 2)')),
  },
  127: {
    example: 'Example: numBoats({3, 2, 2, 1}, 3) returns 3.',
    starter: fn(
      'int numBoats(vector<int>& people, int limit)',
      'Each boat holds at most two people whose weights add up to at most limit.\nThe fewest boats to carry everyone (nobody is heavier than limit).',
      'vector<int> people = {3, 2, 2, 1};',
      show('numBoats(people, 3)'),
    ),
    hint: 'Sort the weights (sort(people.begin(), people.end())). The heaviest person always takes a boat; if the lightest person fits with them, they go together. Move the pointers and count the boats. Like pairing the heaviest backpack with the lightest one so no trip is wasted.',
  },
  128: {
    example: 'Example: shortestUnsorted({2, 6, 4, 8, 10, 9, 15}) returns 5 (sorting 6, 4, 8, 10, 9 fixes it).',
    starter: fn('int shortestUnsorted(vector<int>& nums)', 'The length of the shortest run that, if sorted, makes the whole vector sorted (0 if it already is).', nums('2, 6, 4, 8, 10, 9, 15'), show('shortestUnsorted(nums)')),
  },
  129: {
    example: 'Example: smallestDifference({1, 2, 3, 11, 15}, {8, 19, 23, 127, 235}) returns 3 (11 and 8).',
    starter: fn(
      'int smallestDifference(vector<int>& a, vector<int>& b)',
      'a and b are sorted. The smallest |x - y| with x from a and y from b.',
      'vector<int> a = {1, 2, 3, 11, 15};\nvector<int> b = {8, 19, 23, 127, 235};',
      show('smallestDifference(a, b)'),
    ),
  },
  130: {
    example: 'Example: triangleCount({2, 2, 3, 4}) returns 3.',
    starter: fn('int triangleCount(vector<int>& nums)', 'How many groups of three positions make a triangle (any two sides add up to more than the third)?', nums('2, 2, 3, 4'), show('triangleCount(nums)')),
  },
});
