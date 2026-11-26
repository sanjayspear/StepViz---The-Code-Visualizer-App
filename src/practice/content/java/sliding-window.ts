// Practice, Java: Sliding window (Q131-Q150). Tests come from the Python content;
// reference solutions in tests/practice/java/sliding-window.solutions.ts.
import { fromPython } from '../javascript/shared';
import { SLIDING_WINDOW } from '../python/sliding-window';
import { one } from './shared';

const UTIL = 'import java.util.*;';
const call = (header: string, comment: string, expr: string, printArray = false) =>
  one(header, comment, printArray ? `System.out.println(Arrays.toString(${expr}));` : `System.out.println(${expr});`, UTIL);

export const SLIDING_WINDOW_JAVA = fromPython(SLIDING_WINDOW, {
  131: {
    example: 'Example: maxSumK(new int[] {2, 1, 5, 1, 3, 2}, 3) returns 9 (5 + 1 + 3).',
    starter: call('int maxSumK(int[] nums, int k)', 'The largest sum of k neighbouring numbers (k <= nums.length).', 'maxSumK(new int[] {2, 1, 5, 1, 3, 2}, 3)'),
  },
  132: {
    example: 'Example: windowAverages(new int[] {1, 3, 2, 6, -1, 4, 1, 8, 2}, 5) returns [2.2, 2.8, 2.4, 3.6, 2.8].',
    starter: call('double[] windowAverages(int[] nums, int k)', 'The average of every run of k neighbouring numbers (an empty array if k > nums.length).', 'windowAverages(new int[] {1, 3, 2, 6, -1, 4, 1, 8, 2}, 5)', true),
  },
  133: {
    example: 'Example: firstNegatives(new int[] {12, -1, -7, 8, -15, 30, 16, 28}, 3) returns [-1, -1, -7, -15, -15, 0].',
    starter: call('int[] firstNegatives(int[] nums, int k)', 'For every window of k neighbouring numbers, its first negative number (0 if it has none).', 'firstNegatives(new int[] {12, -1, -7, 8, -15, 30, 16, 28}, 3)', true),
  },
  134: {
    example: 'Example: maxVowels("abciiidef", 3) returns 3 ("iii").',
    starter: call('int maxVowels(String s, int k)', 'The most vowels (a, e, i, o, u) in any k neighbouring letters.', 'maxVowels("abciiidef", 3)'),
  },
  135: {
    example: 'Example: longestUniqueSubstring("abcabcbb") returns 3 ("abc").',
    starter: call('int longestUniqueSubstring(String s)', 'The length of the longest part of s with no repeated character.', 'longestUniqueSubstring("abcabcbb")'),
  },
  136: {
    example: 'Example: longestKDistinct("eceba", 2) returns 3 ("ece").',
    starter: call('int longestKDistinct(String s, int k)', 'The length of the longest part of s with at most k different characters.', 'longestKDistinct("eceba", 2)'),
  },
  137: {
    example: 'Example: characterReplacement("AABABBA", 1) returns 4 ("AABA" -> "AAAA").',
    starter: call('int characterReplacement(String s, int k)', 'You may change up to k letters. The longest run of one repeated letter you can get.', 'characterReplacement("AABABBA", 1)'),
  },
  138: {
    example: 'Example: longestOnes(new int[] {1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0}, 2) returns 6.',
    starter: call('int longestOnes(int[] nums, int k)', 'nums holds 0s and 1s. You may flip at most k zeros. The longest run of 1s you can get.', 'longestOnes(new int[] {1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0}, 2)'),
  },
  139: {
    example: 'Example: minSubarrayLen(7, new int[] {2, 3, 1, 2, 4, 3}) returns 2 (4 + 3).',
    starter: call('int minSubarrayLen(int target, int[] nums)', 'The length of the shortest run of neighbouring (positive) numbers adding up to at least target, or 0.', 'minSubarrayLen(7, new int[] {2, 3, 1, 2, 4, 3})'),
  },
  140: {
    example: 'Example: longestTwoValues(new int[] {1, 2, 3, 2, 2}) returns 4 ([2, 3, 2, 2]).',
    starter: call('int longestTwoValues(int[] nums)', 'The length of the longest run of neighbouring items holding at most two different values.', 'longestTwoValues(new int[] {1, 2, 3, 2, 2})'),
  },
  141: {
    example: 'Example: containsPermutation("ab", "eidbaooo") returns true ("ba").',
    starter: call('boolean containsPermutation(String p, String s)', 'true if s has a part of p.length() neighbouring letters that is a reordering of p.', 'containsPermutation("ab", "eidbaooo")'),
    hint: 'Count the letters of p (an int[26]). Slide a window of p.length() letters over s keeping its letter counts (add the entering letter, remove the leaving one) and check whether all 26 counts match, one by one. Like holding a stencil of fixed width over the text and checking the letters inside.',
  },
  142: {
    example: 'Example: findAnagrams("cbaebabacd", "abc") returns [0, 6].',
    starter: call('List<Integer> findAnagrams(String text, String pattern)', 'Every start position in text where a reordering of pattern begins, in increasing order.', 'findAnagrams("cbaebabacd", "abc")'),
    hint: 'Same window as the permutation check: a window of pattern.length() letters with letter counts, slid one step at a time; record the start every time the counts match. Like a scanner passing over a barcode and beeping at every matching spot.',
  },
  143: {
    example: 'Example: productsBelowK(new int[] {10, 5, 2, 6}, 100) returns 8.',
    starter: call('int productsBelowK(int[] nums, int k)', 'How many runs of neighbouring (positive) numbers have a product less than k?', 'productsBelowK(new int[] {10, 5, 2, 6}, 100)'),
  },
  144: {
    example: 'Example: longestAfterDelete(new int[] {1, 1, 0, 1}) returns 3.',
    starter: call('int longestAfterDelete(int[] nums)', 'nums holds 0s and 1s. Delete exactly one item; the longest run of 1s left.', 'longestAfterDelete(new int[] {1, 1, 0, 1})'),
  },
  145: {
    example: 'Example: maxCardPoints(new int[] {1, 2, 3, 4, 5, 6, 1}, 3) returns 12 (1 + 6 + 5).',
    starter: call('int maxCardPoints(int[] cards, int k)', 'Take k cards, each from the left end or the right end. The biggest total.', 'maxCardPoints(new int[] {1, 2, 3, 4, 5, 6, 1}, 3)'),
    hint: 'Taking k cards from the ends leaves a middle run of cards.length - k cards. Find the middle window with the smallest sum (a sliding window), and the answer is the total minus it. Like choosing which slice of a cake to leave behind.',
  },
  146: {
    example: 'Example: minSwapsGroupOnes(new int[] {1, 0, 1, 0, 1}) returns 1.',
    starter: call('int minSwapsGroupOnes(int[] data)', 'data holds 0s and 1s. The fewest swaps of two items that put all the 1s side by side.', 'minSwapsGroupOnes(new int[] {1, 0, 1, 0, 1})'),
  },
  147: {
    example: 'Example: countAnagramWindows("forxxorfxdofr", "for") returns 3.',
    starter: call('int countAnagramWindows(String text, String word)', 'How many places in text hold a reordering of word (as neighbouring letters)?', 'countAnagramWindows("forxxorfxdofr", "for")'),
    hint: 'Slide a window of word.length() letters over text with letter counts and count how many windows match the counts of word. Like counting how many times a set of jigsaw pieces fits along a row.',
  },
  148: {
    example: 'Example: exactlyKDistinct(new int[] {1, 2, 1, 2, 3}, 2) returns 7.',
    starter: call('int exactlyKDistinct(int[] nums, int k)', 'How many runs of neighbouring numbers hold exactly k different values?', 'exactlyKDistinct(new int[] {1, 2, 1, 2, 3}, 2)'),
  },
  149: {
    example: 'Example: maxSlidingWindow(new int[] {1, 3, -1, -3, 5, 3, 6, 7}, 3) returns [3, 3, 5, 5, 6, 7].',
    starter: call('int[] maxSlidingWindow(int[] nums, int k)', 'The largest number in every window of k neighbouring numbers.', 'maxSlidingWindow(new int[] {1, 3, -1, -3, 5, 3, 6, 7}, 3)', true),
    hint: "Keep an ArrayDeque<Integer> of positions whose values go down from front to back. Before adding a new position, remove smaller values from the back (pollLast; they can never be the largest again); drop the front if it left the window. The front is each window's largest. Like a queue where shorter people step aside for a taller newcomer.",
  },
  150: {
    example: 'Example: longestWithKRepeats("ababbc", 2) returns 5 ("ababb").',
    starter: call('int longestWithKRepeats(String s, int k)', 'The length of the longest part of s where every character appears at least k times.', 'longestWithKRepeats("ababbc", 2)'),
  },
});
