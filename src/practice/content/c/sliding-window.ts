// Practice, C: the questions of sliding-window that fit C. Tests come from the Python content; reference
// solutions in tests/practice/c/sliding-window.solutions.ts. Not in C (they give back lists or text, or need maps
// or classes): Q132, Q133, Q142, Q149.
import { fromPython } from '../javascript/shared';
import { SLIDING_WINDOW } from '../python/sliding-window';
import { cStarter } from './shared';

export const SLIDING_WINDOW_C = fromPython(
  SLIDING_WINDOW,
  {
  131: {
    example: "Example: maxSumK({2, 1, 5, 1, 3, 2}, 3) returns 9 (5 + 1 + 3).",
    starter: cStarter([["int maxSumK(int nums[], int n, int k)", "The largest sum of k neighbouring numbers (k <= nums length)."]], "int nums[] = {2, 1, 5, 1, 3, 2};\nprintf(\"%d\\n\", maxSumK(nums, 6, 3));", [], ''),
    hint: "Add up the first k numbers. Then slide: add the number entering on the right and subtract the one leaving on the left, keeping the best sum. Like a train window: as it moves one seat, one view comes in and one goes out.",
  },
  134: {
    example: "Example: maxVowels(\"abciiidef\", 3) returns 3 (\"iii\").",
    starter: cStarter([["int maxVowels(char s[], int k)", "The most vowels (a, e, i, o, u) in any k neighbouring letters."]], "printf(\"%d\\n\", maxVowels(\"abciiidef\", 3));", ["string.h"], ''),
    hint: "Count the vowels in the first k letters, then slide: add 1 if the entering letter is a vowel and subtract 1 if the leaving letter was. Keep the best count. Like counting red cars in the last k cars to pass a crossing.",
  },
  135: {
    example: "Example: longestUniqueSubstring(\"abcabcbb\") returns 3 (\"abc\").",
    starter: cStarter([["int longestUniqueSubstring(char s[])", "The length of the longest part of s with no repeated character."]], "printf(\"%d\\n\", longestUniqueSubstring(\"abcabcbb\"));", ["string.h"], ''),
    hint: "Remember the last position of each character (an int last[128], -1 at first). Move the right end along; if its character was seen inside the window, jump the left end to just after that earlier position. Keep the longest window. Like a queue where a second person with the same name makes everyone up to the first one leave.",
  },
  136: {
    example: "Example: longestKDistinct(\"eceba\", 2) returns 3 (\"ece\").",
    starter: cStarter([["int longestKDistinct(char s[], int k)", "The length of the longest part of s with at most k different characters."]], "printf(\"%d\\n\", longestKDistinct(\"eceba\", 2));", ["string.h"], ''),
    hint: "Keep counts of the characters in the window (an int counts[128]) and how many different ones there are. Grow on the right; while there are more than k different characters, shrink from the left (one fewer different character when a count reaches 0). Keep the longest window. Like a minibus that takes at most k families: when a new family gets on, the earliest passengers get off until it fits.",
  },
  137: {
    example: "Example: characterReplacement(\"AABABBA\", 1) returns 4 (\"AABA\" -> \"AAAA\").",
    starter: cStarter([["int characterReplacement(char s[], int k)", "You may change up to k letters. The longest run of one repeated letter you can get."]], "printf(\"%d\\n\", characterReplacement(\"ABAB\", 2));", ["string.h"], ''),
    hint: "In a window, the letters to change are window length minus the count of its most common letter. Grow the window; when that number is more than k, move the left end on. Keep the longest window. Like repainting a fence: keep the most common colour and repaint at most k boards.",
  },
  138: {
    example: "Example: longestOnes({1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0}, 2) returns 6.",
    starter: cStarter([["int longestOnes(int nums[], int n, int k)", "nums holds 0s and 1s. You may flip at most k zeros. The longest run of 1s you can get."]], "int nums[] = {1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0};\nprintf(\"%d\\n\", longestOnes(nums, 11, 2));", [], ''),
    hint: "Count the zeros in the window. Grow on the right; while there are more than k zeros, move the left end on (subtract a zero when one leaves). Keep the longest window. Like a road where you may fill in at most k potholes.",
  },
  139: {
    example: "Example: minSubarrayLen(7, {2, 3, 1, 2, 4, 3}) returns 2 (4 + 3).",
    starter: cStarter([["int minSubarrayLen(int target, int nums[], int n)", "The length of the shortest run of neighbouring (positive) numbers adding up to at least target, or 0."]], "int nums[] = {2, 3, 1, 2, 4, 3};\nprintf(\"%d\\n\", minSubarrayLen(7, nums, 6));", [], ''),
    hint: "Grow the window on the right adding to the sum; while the sum is at least target, record the length and shrink from the left. Like filling a bucket with cups and then taking cups out while it is still full enough.",
  },
  140: {
    example: "Example: longestTwoValues({1, 2, 3, 2, 2}) returns 4 ([2, 3, 2, 2]).",
    starter: cStarter([["int longestTwoValues(int nums[], int n)", "The length of the longest run of neighbouring items holding at most two different values."]], "int nums[] = {1, 2, 1};\nprintf(\"%d\\n\", longestTwoValues(nums, 3));", [], ''),
    hint: "Count the values in the window; while there are more than two different values, shrink from the left. (C has no built-in map: keep the window's different values and their counts in two small arrays.) Keep the longest window. Like picking fruit along a row of trees with only two baskets, one kind of fruit per basket.",
  },
  141: {
    example: "Example: containsPermutation(\"ab\", \"eidbaooo\") returns true (\"ba\").",
    starter: cStarter([["bool containsPermutation(char p[], char s[])", "true if s has a part of p length neighbouring letters that is a reordering of p."]], "printf(\"%s\\n\", containsPermutation(\"ab\", \"eidbaooo\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "Count the letters of p (an int need[128]). Slide a window of strlen(p) letters over s keeping its letter counts (add the entering letter, remove the leaving one) and check whether all the counts match. Like holding a stencil of fixed width over the text and checking the letters inside.",
  },
  143: {
    example: "Example: productsBelowK({10, 5, 2, 6}, 100) returns 8.",
    starter: cStarter([["int productsBelowK(int nums[], int n, int k)", "How many runs of neighbouring (positive) numbers have a product less than k?"]], "int nums[] = {10, 5, 2, 6};\nprintf(\"%d\\n\", productsBelowK(nums, 4, 100));", [], ''),
    hint: "Grow the window multiplying in the new number; while the product is k or more, divide out the left number and move left on. Every run ending at right and starting inside the window counts: add right - left + 1. Like counting all the ways to pick consecutive items from the end of a basket that stays under a weight limit.",
  },
  144: {
    example: "Example: longestAfterDelete({1, 1, 0, 1}) returns 3.",
    starter: cStarter([["int longestAfterDelete(int nums[], int n)", "nums holds 0s and 1s. Delete exactly one item; the longest run of 1s left."]], "int nums[] = {1, 1, 0, 1};\nprintf(\"%d\\n\", longestAfterDelete(nums, 4));", [], ''),
    hint: "Find the longest window with at most one zero; the answer is its length minus 1 (you must delete one item, the zero if there is one). Like removing one broken brick to join two straight walls.",
  },
  145: {
    example: "Example: maxCardPoints({1, 2, 3, 4, 5, 6, 1}, 3) returns 12 (1 + 6 + 5).",
    starter: cStarter([["int maxCardPoints(int cards[], int n, int k)", "Take k cards, each from the left end or the right end. The biggest total."]], "int cards[] = {1, 2, 3, 4, 5, 6, 1};\nprintf(\"%d\\n\", maxCardPoints(cards, 7, 3));", [], ''),
    hint: "Taking k cards from the ends leaves a middle run of n - k cards. Find the middle window with the smallest sum (a sliding window), and the answer is the total minus it. Like choosing which slice of a cake to leave behind.",
  },
  146: {
    example: "Example: minSwapsGroupOnes({1, 0, 1, 0, 1}) returns 1.",
    starter: cStarter([["int minSwapsGroupOnes(int data[], int n)", "data holds 0s and 1s. The fewest swaps of two items that put all the 1s side by side."]], "int data[] = {1, 0, 1, 0, 1};\nprintf(\"%d\\n\", minSwapsGroupOnes(data, 5));", [], ''),
    hint: "If there are m ones, they will end up in some window of length m. Slide a window of length m and find the one that already holds the most ones; the zeros in it are the swaps needed. Like rearranging a car park so all red cars stand together: pick the stretch that already has the most red cars.",
  },
  147: {
    example: "Example: countAnagramWindows(\"forxxorfxdofr\", \"for\") returns 3.",
    starter: cStarter([["int countAnagramWindows(char text[], char word[])", "How many places in text hold a reordering of word (as neighbouring letters)?"]], "printf(\"%d\\n\", countAnagramWindows(\"forxxorfxdofr\", \"for\"));", ["string.h"], ''),
    hint: "Slide a window of strlen(word) letters over text with letter counts (int arrays of 128) and count how many windows match the counts of word. Like counting how many times a set of jigsaw pieces fits along a row.",
  },
  148: {
    example: "Example: exactlyKDistinct({1, 2, 1, 2, 3}, 2) returns 7.",
    starter: cStarter([["int exactlyKDistinct(int nums[], int n, int k)", "How many runs of neighbouring numbers hold exactly k different values?"]], "int nums[] = {1, 2, 1, 2, 3};\nprintf(\"%d\\n\", exactlyKDistinct(nums, 5, 2));", [], ''),
    hint: "Counting \"at most k\" is easy with a sliding window (every run ending at right inside the window counts). Exactly k = at most k minus at most k - 1. (C has no built-in map: keep the window's different values and their counts in two small arrays.) Like counting teams of up to 5 players, then taking away the teams of up to 4, to get teams of exactly 5.",
  },
  150: {
    example: "Example: longestWithKRepeats(\"ababbc\", 2) returns 5 (\"ababb\").",
    starter: cStarter([["int longestWithKRepeats(char s[], int k)", "The length of the longest part of s where every character appears at least k times."]], "printf(\"%d\\n\", longestWithKRepeats(\"aaabb\", 3));", ["string.h"], ''),
    hint: "Divide and conquer: a character that appears fewer than k times in s can never be inside the answer, so split s at it and solve each piece; if no such character exists, the whole of s is the answer. Like cutting out the bruised parts of an apple and keeping the biggest good piece.",
  },
  },
  { partial: true },
);
