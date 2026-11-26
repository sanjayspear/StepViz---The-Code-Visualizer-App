// Practice, JavaScript: sliding-window. Tests come from the Python content; reference solutions in tests/practice/js/sliding-window.solutions.ts.
import { fromPython } from './shared';
import { SLIDING_WINDOW } from '../python/sliding-window';

export const SLIDING_WINDOW_JS = fromPython(SLIDING_WINDOW, {
  131: {
    example: 'Example: maxSumK([2, 1, 5, 1, 3, 2], 3) returns 9 (5 + 1 + 3).',
    starter: `function maxSumK(nums, k) {
  // The largest sum of k neighbouring numbers (k <= len(nums)).
}

console.log(maxSumK([2, 1, 5, 1, 3, 2], 3));
`,
  },
  132: {
    example: 'Example: windowAverages([1, 3, 2, 6, -1, 4, 1, 8, 2], 5) returns [2.2, 2.8, 2.4, 3.6, 2.8].',
    starter: `function windowAverages(nums, k) {
  // The average of every run of k neighbouring numbers, as decimals ([] if k > len(nums)).
}

console.log(windowAverages([1, 3, 2, 6, -1, 4, 1, 8, 2], 5));
`,
  },
  133: {
    example: 'Example: firstNegatives([12, -1, -7, 8, -15, 30, 16, 28], 3) returns [-1, -1, -7, -15, -15, 0].',
    starter: `function firstNegatives(nums, k) {
  // For every window of k neighbouring numbers, its first negative number (0 if it has none).
}

console.log(firstNegatives([12, -1, -7, 8, -15, 30, 16, 28], 3));
`,
  },
  134: {
    example: 'Example: maxVowels("abciiidef", 3) returns 3 ("iii").',
    starter: `function maxVowels(s, k) {
  // The most vowels (a, e, i, o, u) in any k neighbouring letters.
}

console.log(maxVowels("abciiidef", 3));
`,
  },
  135: {
    example: 'Example: longestUniqueSubstring("abcabcbb") returns 3 ("abc").',
    starter: `function longestUniqueSubstring(s) {
  // The length of the longest part of s with no repeated character.
}

console.log(longestUniqueSubstring("abcabcbb"));
`,
  },
  136: {
    example: 'Example: longestKDistinct("eceba", 2) returns 3 ("ece").',
    starter: `function longestKDistinct(s, k) {
  // The length of the longest part of s with at most k different characters.
}

console.log(longestKDistinct("eceba", 2));
`,
  },
  137: {
    example: 'Example: characterReplacement("AABABBA", 1) returns 4 ("AABA" -> "AAAA").',
    starter: `function characterReplacement(s, k) {
  // You may change up to k letters. The longest run of one repeated letter you can get.
}

console.log(characterReplacement("AABABBA", 1));
`,
  },
  138: {
    example: 'Example: longestOnes([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2) returns 6.',
    starter: `function longestOnes(nums, k) {
  // nums holds 0s and 1s. You may flip at most k zeros. The longest run of 1s you can get.
}

console.log(longestOnes([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2));
`,
  },
  139: {
    example: 'Example: minSubarrayLen(7, [2, 3, 1, 2, 4, 3]) returns 2 (4 + 3).',
    starter: `function minSubarrayLen(target, nums) {
  // The length of the shortest run of neighbouring (positive) numbers adding up to at least target, or 0.
}

console.log(minSubarrayLen(7, [2, 3, 1, 2, 4, 3]));
`,
  },
  140: {
    example: 'Example: longestTwoValues([1, 2, 3, 2, 2]) returns 4 ([2, 3, 2, 2]).',
    starter: `function longestTwoValues(nums) {
  // The length of the longest run of neighbouring items holding at most two different values.
}

console.log(longestTwoValues([1, 2, 3, 2, 2]));
`,
  },
  141: {
    example: 'Example: containsPermutation("ab", "eidbaooo") returns true ("ba").',
    starter: `function containsPermutation(p, s) {
  // true if s has a part of len(p) neighbouring letters that is a reordering of p.
}

console.log(containsPermutation("ab", "eidbaooo"));
`,
    hint: "Count the letters of p. Slide a window of p.length letters over s keeping its letter counts (add the entering letter, remove the leaving one) and check whether the counts match. Like holding a stencil of fixed width over the text and checking the letters inside.",
  },
  142: {
    example: 'Example: findAnagrams("cbaebabacd", "abc") returns [0, 6].',
    starter: `function findAnagrams(text, pattern) {
  // Every start position in text where a reordering of pattern begins, in increasing order.
}

console.log(findAnagrams("cbaebabacd", "abc"));
`,
    hint: "Same window as the permutation check: a window of pattern.length letters with letter counts, slid one step at a time; record the start every time the counts match. Like a scanner passing over a barcode and beeping at every matching spot.",
  },
  143: {
    example: 'Example: productsBelowK([10, 5, 2, 6], 100) returns 8.',
    starter: `function productsBelowK(nums, k) {
  // How many runs of neighbouring (positive) numbers have a product less than k?
}

console.log(productsBelowK([10, 5, 2, 6], 100));
`,
  },
  144: {
    example: 'Example: longestAfterDelete([1, 1, 0, 1]) returns 3.',
    starter: `function longestAfterDelete(nums) {
  // nums holds 0s and 1s. Delete exactly one item; the longest run of 1s left.
}

console.log(longestAfterDelete([1, 1, 0, 1]));
`,
  },
  145: {
    example: 'Example: maxCardPoints([1, 2, 3, 4, 5, 6, 1], 3) returns 12 (1 + 6 + 5).',
    starter: `function maxCardPoints(cards, k) {
  // Take k cards, each from the left end or the right end. The biggest total.
}

console.log(maxCardPoints([1, 2, 3, 4, 5, 6, 1], 3));
`,
    hint: "Taking k cards from the ends leaves a middle run of cards.length - k cards. Find the middle window with the smallest sum (a sliding window), and the answer is the total minus it. Like choosing which slice of a cake to leave behind.",
  },
  146: {
    example: 'Example: minSwapsGroupOnes([1, 0, 1, 0, 1]) returns 1.',
    starter: `function minSwapsGroupOnes(data) {
  // data holds 0s and 1s. The fewest swaps of two items that put all the 1s side by side.
}

console.log(minSwapsGroupOnes([1, 0, 1, 0, 1]));
`,
  },
  147: {
    example: 'Example: countAnagramWindows("forxxorfxdofr", "for") returns 3.',
    starter: `function countAnagramWindows(text, word) {
  // How many places in text hold a reordering of word (as neighbouring letters)?
}

console.log(countAnagramWindows("forxxorfxdofr", "for"));
`,
    hint: "Slide a window of word.length letters over text with letter counts and count how many windows match the counts of word. Like counting how many times a set of jigsaw pieces fits along a row.",
  },
  148: {
    example: 'Example: exactlyKDistinct([1, 2, 1, 2, 3], 2) returns 7.',
    starter: `function exactlyKDistinct(nums, k) {
  // How many runs of neighbouring numbers hold exactly k different values?
}

console.log(exactlyKDistinct([1, 2, 1, 2, 3], 2));
`,
  },
  149: {
    example: 'Example: maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3) returns [3, 3, 5, 5, 6, 7].',
    starter: `function maxSlidingWindow(nums, k) {
  // The largest number in every window of k neighbouring numbers.
}

console.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3));
`,
    hint: "Keep an array of positions (used as a queue from both ends) whose values go down from front to back. Before adding a new position, pop smaller values from the back (they can never be the largest again); drop the front if it left the window. The front is each window's largest. Like a queue where shorter people step aside for a taller newcomer.",
  },
  150: {
    example: 'Example: longestWithKRepeats("ababbc", 2) returns 5 ("ababb").',
    starter: `function longestWithKRepeats(s, k) {
  // The length of the longest part of s where every character appears at least k times.
}

console.log(longestWithKRepeats("ababbc", 2));
`,
  },
});
