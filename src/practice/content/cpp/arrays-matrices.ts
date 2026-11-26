// Practice, C++: Arrays & matrices (Q56-Q85). Tests come from the Python content;
// reference solutions in tests/practice/cpp/arrays-matrices.solutions.ts.
import { fromPython, jsTests } from '../javascript/shared';
import { ARRAYS_MATRICES } from '../python/arrays-matrices';
import { cppStarter, nullTo, PRINT_INTS } from './shared';

const NO_SORT = {
  names: ['sort', 'stable_sort', 'merge', 'inplace_merge'],
  patterns: [{ regex: '(set|multiset|priority_queue)<', shown: 'a sorted container' }],
  why: 'This question asks you to merge them yourself, without sorting.',
};
/** A function on vectors: main() makes the input, calls it, and prints the answer. */
const vec = (header: string, comment: string, setup: string, print: string) => cppStarter([[header, comment]], `${setup}\n${print}`, [], PRINT_INTS);
const nums = (values: string) => `vector<int> nums = {${values}};`;

export const ARRAYS_MATRICES_CPP = fromPython(ARRAYS_MATRICES, {
  56: {
    example: 'Example: findMinMax({3, 1, 4, 1, 5}) returns [1, 5].',
    starter: vec('vector<int> findMinMax(vector<int>& nums)', 'Return {smallest, largest} of a non-empty vector, without min(), max() or sorting.', nums('3, 1, 4, 1, 5'), 'vector<int> r = findMinMax(nums);\nprintVector(r);'),
    forbid: { names: ['min', 'max', 'min_element', 'max_element', 'minmax_element', 'minmax', 'sort'], why: 'This question asks you to find them yourself, without min(), max() or sorting.' },
  },
  57: {
    example: 'Example: secondLargest({3, 1, 4, 1, 5}) returns 4; with no second value, -1.',
    starter: vec('int secondLargest(vector<int>& nums)', 'The second largest different value, or -1 if there is none (the numbers are all positive).', nums('3, 1, 4, 1, 5'), 'cout << secondLargest(nums) << endl;'),
    tests: nullTo(jsTests(ARRAYS_MATRICES.find((c) => c.id === 57)!.tests), -1),
    hint: 'Keep two values, first and second (start them at -1, which no positive number can be). For each number bigger than first, move first down to second; for a number between them (and not equal to first), it becomes second. Like a podium: a new winner pushes the old winner to second place.',
  },
  58: {
    example: 'Example: after reverseInPlace(nums) with nums = {1, 2, 3}, nums is [3, 2, 1].',
    starter: vec('void reverseInPlace(vector<int>& nums)', 'Reverse the vector itself (do not make a new one). Return nothing.', nums('1, 2, 3'), 'reverseInPlace(nums);\nprintVector(nums);'),
    forbid: { names: ['reverse', 'rbegin', 'rend'], why: 'This question asks you to swap the items yourself, without reverse().' },
  },
  59: {
    example: 'Example: isSorted({1, 2, 2, 3}) returns true.',
    starter: vec('bool isSorted(vector<int>& nums)', 'true if every number is at least the one before it.', nums('1, 2, 2, 3'), 'cout << boolalpha << isSorted(nums) << endl;'),
    hint: 'Look at each neighbour pair nums[i - 1], nums[i]; if any pair goes down, the vector is not sorted. Like checking that a row of steps never goes downhill.',
  },
  60: {
    example: 'Example: removeDuplicatesSorted({1, 1, 2}) returns 2 and the vector starts [1, 2].',
    starter: vec(
      'int removeDuplicatesSorted(vector<int>& nums)',
      'nums is sorted. Move each different value to the front, in place,\nand return how many different values there are.',
      nums('1, 1, 2'),
      'int k = removeDuplicatesSorted(nums);\ncout << k << endl;\nprintVector(nums);',
    ),
  },
  61: {
    example: 'Example: after moveZeros(nums) with nums = {0, 1, 0, 3, 12}, nums is [1, 3, 12, 0, 0].',
    starter: vec('void moveZeros(vector<int>& nums)', 'Move every 0 to the end, keeping the order of the other numbers. Change nums itself.', nums('0, 1, 0, 3, 12'), 'moveZeros(nums);\nprintVector(nums);'),
  },
  62: {
    example: 'Example: after rotateRight(nums, 3) with nums = {1, 2, 3, 4, 5, 6, 7}, nums is [5, 6, 7, 1, 2, 3, 4].',
    starter: vec('void rotateRight(vector<int>& nums, int k)', 'Move every item k places to the right, wrapping around. Change nums itself.', nums('1, 2, 3, 4, 5, 6, 7'), 'rotateRight(nums, 3);\nprintVector(nums);'),
    hint: 'First use k = k % nums.size() (rotating by the length changes nothing). Then reverse the whole vector, reverse the first k items, and reverse the rest, each with two pointers swapping inwards. Like a round table: everyone moves k seats to the right.',
  },
  63: {
    example: 'Example: missingNumber({3, 0, 1}) returns 2.',
    starter: vec('int missingNumber(vector<int>& nums)', 'nums holds all the numbers 0 to n except one. Which one is missing?', nums('3, 0, 1'), 'cout << missingNumber(nums) << endl;'),
    hint: 'With n = nums.size(), the numbers 0 to n add up to n * (n + 1) / 2. Subtract the sum of nums: what is left is the missing one. Like counting the eggs in a full box and seeing how many are gone.',
  },
  64: {
    example: 'Example: singleNumber({4, 1, 2, 1, 2}) returns 4.',
    starter: vec('int singleNumber(vector<int>& nums)', 'Every number appears twice except one. Return that one.', nums('4, 1, 2, 1, 2'), 'cout << singleNumber(nums) << endl;'),
  },
  65: {
    example: 'Example: findDuplicate({1, 3, 4, 2, 2}) returns 2.',
    starter: vec('int findDuplicate(vector<int>& nums)', 'n + 1 numbers, each from 1 to n: one value appears more than once. Return it.', nums('1, 3, 4, 2, 2'), 'cout << findDuplicate(nums) << endl;'),
    hint: 'Keep a set of numbers seen (set<int> with count and insert); the first number already in the set is the duplicate. (Without extra space: treat each value as a pointer to an index and find where the "cycle" starts.) Like spotting the second person to arrive with the same ticket number.',
  },
  66: {
    example: 'Example: mergeSorted({1, 3, 5}, {2, 4, 6}) returns [1, 2, 3, 4, 5, 6].',
    starter: vec(
      'vector<int> mergeSorted(vector<int>& a, vector<int>& b)',
      'a and b are sorted. Return one sorted vector with all their items, without sorting again.',
      'vector<int> a = {1, 3, 5};\nvector<int> b = {2, 4, 6};',
      'vector<int> r = mergeSorted(a, b);\nprintVector(r);',
    ),
    hint: 'One pointer in each vector: take the smaller of a[i] and b[j], move that pointer on, and repeat; when one runs out, add the rest of the other. Like merging two queues of people sorted by height into one.',
    forbid: NO_SORT,
  },
  67: {
    example: 'Example: intersection({1, 2, 2, 1}, {2, 2}) returns [2].',
    starter: vec(
      'vector<int> intersection(vector<int>& a, vector<int>& b)',
      'The values that are in both vectors, each once (in any order).',
      'vector<int> a = {1, 2, 2, 1};\nvector<int> b = {2, 2};',
      'vector<int> r = intersection(a, b);\nprintVector(r);',
    ),
    hint: 'Put the values of a in a set<int>; go through b and collect each value that is in that set, once (a second set of found values avoids repeats). Like two friends comparing their lists of favourite films.',
  },
  68: {
    example: 'Example: unionOf({1, 2, 3}, {2, 3, 4}) returns [1, 2, 3, 4].',
    starter: vec(
      'vector<int> unionOf(vector<int>& a, vector<int>& b)',
      'Every value that is in either vector, each once (in any order).',
      'vector<int> a = {1, 2, 3};\nvector<int> b = {2, 3, 4};',
      'vector<int> r = unionOf(a, b);\nprintVector(r);',
    ),
    tests: jsTests(ARRAYS_MATRICES.find((c) => c.id === 68)!.tests).map((t) => ({ ...t, call: 'unionOf' })),
    hint: 'Go through both vectors and add each value to the answer only the first time you meet it (keep a set<int> of values already added). Like making one guest list from two, writing each name once.',
  },
  69: {
    example: 'Example: plusOne({9, 9}) returns [1, 0, 0].',
    starter: vec('vector<int> plusOne(vector<int>& digits)', 'digits holds a number, one digit per place. Return the digits of that number plus one.', 'vector<int> digits = {9, 9};', 'vector<int> r = plusOne(digits);\nprintVector(r);'),
  },
  70: {
    example: 'Example: majorityElement({2, 2, 1, 1, 1, 2, 2}) returns 2.',
    starter: vec('int majorityElement(vector<int>& nums)', 'The value that appears more than half the time (there always is one).', nums('2, 2, 1, 1, 1, 2, 2'), 'cout << majorityElement(nums) << endl;'),
  },
  71: {
    example: 'Example: maxProfit({7, 1, 5, 3, 6, 4}) returns 5 (buy at 1, sell at 6).',
    starter: vec('int maxProfit(vector<int>& prices)', 'Buy on one day and sell on a later day. The biggest profit (0 if none).', 'vector<int> prices = {7, 1, 5, 3, 6, 4};', 'cout << maxProfit(prices) << endl;'),
  },
  72: {
    example: 'Example: maxProfitMany({7, 1, 5, 3, 6, 4}) returns 7 (buy 1 sell 5, buy 3 sell 6).',
    starter: vec('int maxProfitMany(vector<int>& prices)', 'Buy and sell as often as you like (one share at a time). The biggest total profit.', 'vector<int> prices = {7, 1, 5, 3, 6, 4};', 'cout << maxProfitMany(prices) << endl;'),
  },
  73: {
    example: 'Example: maxSubarray({-2, 1, -3, 4, -1, 2, 1, -5, 4}) returns 6 (4, -1, 2, 1).',
    starter: vec('int maxSubarray(vector<int>& nums)', 'The largest sum of a run of neighbouring numbers (at least one number).', nums('-2, 1, -3, 4, -1, 2, 1, -5, 4'), 'cout << maxSubarray(nums) << endl;'),
    hint: "Kadane's idea: keep the best sum of a run that ends here: either the current number alone, or the previous run plus it (current = max(x, current + x)); keep the best ever. Like a runner deciding at each mile whether to keep going or restart fresh.",
  },
  74: {
    example: 'Example: productExceptSelf({1, 2, 3, 4}) returns [24, 12, 8, 6].',
    starter: vec('vector<int> productExceptSelf(vector<int>& nums)', 'Item i of the answer is the product of every number except nums[i]. Without division.', nums('1, 2, 3, 4'), 'vector<int> r = productExceptSelf(nums);\nprintVector(r);'),
    forbid: { ops: ['/', '/='], names: ['div'], why: 'This question asks you to do it without division.' },
  },
  75: {
    example: 'Example: majorityThird({1, 1, 1, 3, 3, 2, 2, 2}) returns [1, 2] (in any order).',
    starter: vec('vector<int> majorityThird(vector<int>& nums)', 'Every value that appears more than nums.size() / 3 times (in any order).', nums('1, 1, 1, 3, 3, 2, 2, 2'), 'vector<int> r = majorityThird(nums);\nprintVector(r);'),
    hint: 'At most two values can appear more than n / 3 times. Count every value (a map<int, int>), then keep those with a count bigger than nums.size() / 3. (Boyer-Moore with two candidates does it without the map.) Like an election where a candidate needs more than a third of the votes.',
  },
  76: {
    example: 'Example: pascal(4) returns [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]].',
    starter: vec('vector<vector<int>> pascal(int n)', "The first n rows of Pascal's triangle.", '', 'vector<vector<int>> rows = pascal(5);\nfor (int i = 0; i < rows.size(); i++) {\n    vector<int> row = rows[i];\n    printVector(row);\n}'),
  },
  77: {
    example: 'Example: transpose({{1, 2, 3}, {4, 5, 6}}) returns [[1, 4], [2, 5], [3, 6]].',
    starter: vec(
      'vector<vector<int>> transpose(vector<vector<int>>& matrix)',
      'Rows become columns: item [r][c] moves to [c][r].',
      'vector<vector<int>> m = {{1, 2, 3}, {4, 5, 6}};',
      'vector<vector<int>> t = transpose(m);\nfor (int i = 0; i < t.size(); i++) {\n    vector<int> row = t[i];\n    printVector(row);\n}',
    ),
    hint: 'The answer has matrix[0].size() rows of matrix.size() items (vector<vector<int>> out(cols, vector<int>(rows))); copy matrix[r][c] to out[c][r]. Like turning a spreadsheet on its side so the column headings become row headings.',
  },
  78: {
    example: 'Example: rotateMatrix(m) with m = {{1, 2}, {3, 4}} changes m to [[3, 1], [4, 2]].',
    starter: vec(
      'void rotateMatrix(vector<vector<int>>& matrix)',
      'Turn the square matrix a quarter turn clockwise, changing it itself.',
      'vector<vector<int>> m = {{1, 2}, {3, 4}};',
      'rotateMatrix(m);\nfor (int i = 0; i < m.size(); i++) {\n    vector<int> row = m[i];\n    printVector(row);\n}',
    ),
  },
  79: {
    example: 'Example: spiralOrder({{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}) returns [1, 2, 3, 6, 9, 8, 7, 4, 5].',
    starter: vec(
      'vector<int> spiralOrder(vector<vector<int>>& matrix)',
      'The items in spiral order: right along the top, down, left along the bottom, up, and inwards.',
      'vector<vector<int>> m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};',
      'vector<int> r = spiralOrder(m);\nprintVector(r);',
    ),
  },
  80: {
    example: 'Example: setZeroes(m) with m = {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}} changes m to [[1, 0, 1], [0, 0, 0], [1, 0, 1]].',
    starter: vec(
      'void setZeroes(vector<vector<int>>& matrix)',
      'Where a cell is 0, set its whole row and column to 0. Change the matrix itself.',
      'vector<vector<int>> m = {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}};',
      'setZeroes(m);\nfor (int i = 0; i < m.size(); i++) {\n    vector<int> row = m[i];\n    printVector(row);\n}',
    ),
    hint: 'First find every row and every column that holds a 0 (two vector<bool>), without changing anything yet; then set each cell to 0 if its row or column was marked. Changing cells while still searching would spread zeros too far. Like marking the broken seats in a theatre before closing their rows and columns.',
  },
  81: {
    example: 'Example: leaders({16, 17, 4, 3, 5, 2}) returns [17, 5, 2].',
    starter: vec('vector<int> leaders(vector<int>& nums)', 'Every item that is bigger than all the items to its right, in their original order.', nums('16, 17, 4, 3, 5, 2'), 'vector<int> r = leaders(nums);\nprintVector(r);'),
  },
  82: {
    example: 'Example: pivotIndex({1, 7, 3, 6, 5, 6}) returns 3 (1 + 7 + 3 = 5 + 6).',
    starter: vec('int pivotIndex(vector<int>& nums)', 'The first position where the sum to its left equals the sum to its right, or -1.', nums('1, 7, 3, 6, 5, 6'), 'cout << pivotIndex(nums) << endl;'),
  },
  83: {
    example: 'Example: nextPermutation(nums) with nums = {1, 2, 3} changes nums to [1, 3, 2].',
    starter: vec(
      'void nextPermutation(vector<int>& nums)',
      'Change nums to the next ordering in dictionary order (after the last one comes the first, sorted).',
      nums('1, 2, 3'),
      'nextPermutation(nums);\nprintVector(nums);',
    ),
    forbid: { names: ['next_permutation', 'prev_permutation'], why: 'This question asks you to find the next ordering yourself, without next_permutation().' },
  },
  84: {
    example: 'Example: longestConsecutive({100, 4, 200, 1, 3, 2}) returns 4 (1, 2, 3, 4).',
    starter: vec('int longestConsecutive(vector<int>& nums)', 'The length of the longest run of consecutive numbers (in any order in the vector), in O(n).', nums('100, 4, 200, 1, 3, 2'), 'cout << longestConsecutive(nums) << endl;'),
    hint: 'Put every number in a set (unordered_set<int>). A run starts at x only when x - 1 is not in the set; from each start, count x + 1, x + 2, ... while they are in the set. Each number is counted once, so it is O(n). Like finding chains of house numbers on a street: begin only at a house with no neighbour on its left.',
  },
  85: {
    example: 'Example: trap({0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}) returns 6.',
    starter: vec('int trap(vector<int>& height)', 'Bars of width 1 with these heights: how much rain water stays between them?', 'vector<int> height = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};', 'cout << trap(height) << endl;'),
  },
});
