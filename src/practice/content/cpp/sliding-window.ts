// Practice, C++: Sliding window (Q131-Q150). Tests come from the Python content;
// reference solutions in tests/practice/cpp/sliding-window.solutions.ts.
import { fromPython } from '../javascript/shared';
import { SLIDING_WINDOW } from '../python/sliding-window';
import { cppStarter, PRINT_INTS } from './shared';

const fn = (header: string, comment: string, setup: string, print: string) => cppStarter([[header, comment]], `${setup}\n${print}`, ['map'], PRINT_INTS);
const nums = (values: string) => `vector<int> nums = {${values}};`;
const show = (expr: string) => `cout << ${expr} << endl;`;

export const SLIDING_WINDOW_CPP = fromPython(SLIDING_WINDOW, {
  131: {
    example: 'Example: maxSumK({2, 1, 5, 1, 3, 2}, 3) returns 9 (5 + 1 + 3).',
    starter: fn('int maxSumK(vector<int>& nums, int k)', 'The largest sum of k neighbouring numbers (k <= nums.size()).', nums('2, 1, 5, 1, 3, 2'), show('maxSumK(nums, 3)')),
  },
  132: {
    example: 'Example: windowAverages({1, 3, 2, 6, -1, 4, 1, 8, 2}, 5) returns [2.2, 2.8, 2.4, 3.6, 2.8].',
    starter: fn(
      'vector<double> windowAverages(vector<int>& nums, int k)',
      'The average of every run of k neighbouring numbers (an empty vector if k > nums.size()).',
      nums('1, 3, 2, 6, -1, 4, 1, 8, 2'),
      'vector<double> r = windowAverages(nums, 5);\nfor (double x : r) cout << x << " ";\ncout << endl;',
    ),
  },
  133: {
    example: 'Example: firstNegatives({12, -1, -7, 8, -15, 30, 16, 28}, 3) returns [-1, -1, -7, -15, -15, 0].',
    starter: fn('vector<int> firstNegatives(vector<int>& nums, int k)', 'For every window of k neighbouring numbers, its first negative number (0 if it has none).', nums('12, -1, -7, 8, -15, 30, 16, 28'), 'vector<int> r = firstNegatives(nums, 3);\nprintVector(r);'),
  },
  134: {
    example: 'Example: maxVowels("abciiidef", 3) returns 3 ("iii").',
    starter: fn('int maxVowels(string s, int k)', 'The most vowels (a, e, i, o, u) in any k neighbouring letters.', '', show('maxVowels("abciiidef", 3)')),
  },
  135: {
    example: 'Example: longestUniqueSubstring("abcabcbb") returns 3 ("abc").',
    starter: fn('int longestUniqueSubstring(string s)', 'The length of the longest part of s with no repeated character.', '', show('longestUniqueSubstring("abcabcbb")')),
  },
  136: {
    example: 'Example: longestKDistinct("eceba", 2) returns 3 ("ece").',
    starter: fn('int longestKDistinct(string s, int k)', 'The length of the longest part of s with at most k different characters.', '', show('longestKDistinct("eceba", 2)')),
  },
  137: {
    example: 'Example: characterReplacement("AABABBA", 1) returns 4 ("AABA" -> "AAAA").',
    starter: fn('int characterReplacement(string s, int k)', 'You may change up to k letters. The longest run of one repeated letter you can get.', '', show('characterReplacement("AABABBA", 1)')),
  },
  138: {
    example: 'Example: longestOnes({1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0}, 2) returns 6.',
    starter: fn('int longestOnes(vector<int>& nums, int k)', 'nums holds 0s and 1s. You may flip at most k zeros. The longest run of 1s you can get.', nums('1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0'), show('longestOnes(nums, 2)')),
  },
  139: {
    example: 'Example: minSubarrayLen(7, {2, 3, 1, 2, 4, 3}) returns 2 (4 + 3).',
    starter: fn('int minSubarrayLen(int target, vector<int>& nums)', 'The length of the shortest run of neighbouring (positive) numbers adding up to at least target, or 0.', nums('2, 3, 1, 2, 4, 3'), show('minSubarrayLen(7, nums)')),
  },
  140: {
    example: 'Example: longestTwoValues({1, 2, 3, 2, 2}) returns 4 ([2, 3, 2, 2]).',
    starter: fn('int longestTwoValues(vector<int>& nums)', 'The length of the longest run of neighbouring items holding at most two different values.', nums('1, 2, 3, 2, 2'), show('longestTwoValues(nums)')),
  },
  141: {
    example: 'Example: containsPermutation("ab", "eidbaooo") returns true ("ba").',
    starter: fn('bool containsPermutation(string p, string s)', 'true if s has a part of p.size() neighbouring letters that is a reordering of p.', '', 'cout << boolalpha << containsPermutation("ab", "eidbaooo") << endl;'),
    hint: 'Count the letters of p (a vector<int> of 26). Slide a window of p.size() letters over s keeping its letter counts (add the entering letter, remove the leaving one) and check whether the counts match (two vectors compare with ==). Like holding a stencil of fixed width over the text and checking the letters inside.',
  },
  142: {
    example: 'Example: findAnagrams("cbaebabacd", "abc") returns [0, 6].',
    starter: fn('vector<int> findAnagrams(string text, string pattern)', 'Every start position in text where a reordering of pattern begins, in increasing order.', '', 'vector<int> r = findAnagrams("cbaebabacd", "abc");\nprintVector(r);'),
    hint: 'Same window as the permutation check: a window of pattern.size() letters with letter counts, slid one step at a time; record the start every time the counts match. Like a scanner passing over a barcode and beeping at every matching spot.',
  },
  143: {
    example: 'Example: productsBelowK({10, 5, 2, 6}, 100) returns 8.',
    starter: fn('int productsBelowK(vector<int>& nums, int k)', 'How many runs of neighbouring (positive) numbers have a product less than k?', nums('10, 5, 2, 6'), show('productsBelowK(nums, 100)')),
  },
  144: {
    example: 'Example: longestAfterDelete({1, 1, 0, 1}) returns 3.',
    starter: fn('int longestAfterDelete(vector<int>& nums)', 'nums holds 0s and 1s. Delete exactly one item; the longest run of 1s left.', nums('1, 1, 0, 1'), show('longestAfterDelete(nums)')),
  },
  145: {
    example: 'Example: maxCardPoints({1, 2, 3, 4, 5, 6, 1}, 3) returns 12 (1 + 6 + 5).',
    starter: fn('int maxCardPoints(vector<int>& cards, int k)', 'Take k cards, each from the left end or the right end. The biggest total.', 'vector<int> cards = {1, 2, 3, 4, 5, 6, 1};', show('maxCardPoints(cards, 3)')),
    hint: 'Taking k cards from the ends leaves a middle run of cards.size() - k cards. Find the middle window with the smallest sum (a sliding window), and the answer is the total minus it. Like choosing which slice of a cake to leave behind.',
  },
  146: {
    example: 'Example: minSwapsGroupOnes({1, 0, 1, 0, 1}) returns 1.',
    starter: fn('int minSwapsGroupOnes(vector<int>& data)', 'data holds 0s and 1s. The fewest swaps of two items that put all the 1s side by side.', 'vector<int> data = {1, 0, 1, 0, 1};', show('minSwapsGroupOnes(data)')),
  },
  147: {
    example: 'Example: countAnagramWindows("forxxorfxdofr", "for") returns 3.',
    starter: fn('int countAnagramWindows(string text, string word)', 'How many places in text hold a reordering of word (as neighbouring letters)?', '', show('countAnagramWindows("forxxorfxdofr", "for")')),
    hint: 'Slide a window of word.size() letters over text with letter counts and count how many windows match the counts of word. Like counting how many times a set of jigsaw pieces fits along a row.',
  },
  148: {
    example: 'Example: exactlyKDistinct({1, 2, 1, 2, 3}, 2) returns 7.',
    starter: fn('int exactlyKDistinct(vector<int>& nums, int k)', 'How many runs of neighbouring numbers hold exactly k different values?', nums('1, 2, 1, 2, 3'), show('exactlyKDistinct(nums, 2)')),
  },
  149: {
    example: 'Example: maxSlidingWindow({1, 3, -1, -3, 5, 3, 6, 7}, 3) returns [3, 3, 5, 5, 6, 7].',
    starter: fn('vector<int> maxSlidingWindow(vector<int>& nums, int k)', 'The largest number in every window of k neighbouring numbers.', nums('1, 3, -1, -3, 5, 3, 6, 7'), 'vector<int> r = maxSlidingWindow(nums, 3);\nprintVector(r);'),
    hint: "Keep a list of positions whose values go down from front to back (a vector plus the position of its front). Before adding a new position, remove smaller values from the back (pop_back; they can never be the largest again); move the front on if it left the window. The front is each window's largest. Like a queue where shorter people step aside for a taller newcomer.",
  },
  150: {
    example: 'Example: longestWithKRepeats("ababbc", 2) returns 5 ("ababb").',
    starter: fn('int longestWithKRepeats(string s, int k)', 'The length of the longest part of s where every character appears at least k times.', '', show('longestWithKRepeats("ababbc", 2)')),
  },
});
