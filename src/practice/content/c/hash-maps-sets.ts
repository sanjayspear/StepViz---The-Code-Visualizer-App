// Practice, C: the questions of hash-maps-sets that fit C. Tests come from the Python content; reference
// solutions in tests/practice/c/hash-maps-sets.solutions.ts. Not in C (they give back lists or text, or need maps
// or classes): Q86, Q88, Q90, Q92, Q98, Q99, Q105, Q107, Q108, Q109.
import { fromPython } from '../javascript/shared';
import { HASH_MAPS_SETS } from '../python/hash-maps-sets';
import { cStarter } from './shared';

export const HASH_MAPS_SETS_C = fromPython(
  HASH_MAPS_SETS,
  {
  87: {
    example: "Example: containsDuplicate({1, 2, 3, 1}) returns true.",
    starter: cStarter([["bool containsDuplicate(int nums[], int n)", "true if any value appears more than once."]], "int nums[] = {1, 2, 3, 1};\nprintf(\"%s\\n\", containsDuplicate(nums, 4) ? \"true\" : \"false\");", [], ''),
    hint: "C has no built-in set, so compare every pair of positions with two loops (fine for arrays this size), or sort a copy and look at neighbours. Like a cloakroom attendant who notices a second coat with the same ticket.",
  },
  89: {
    example: "Example: mostFrequent({1, 3, 2, 3, 1, 3}) returns 3; for a tie, the smallest value.",
    starter: cStarter([["int mostFrequent(int nums[], int n)", "The value that appears most often (the smallest of them if several tie)."]], "int nums[] = {1, 3, 2, 3, 1, 3};\nprintf(\"%d\\n\", mostFrequent(nums, 6));", [], ''),
    hint: "C has no built-in hash map, so for each value count how often it appears with a second loop, and keep the value with the biggest count (on a tie, keep the smaller value). Like finding the most popular ice-cream flavour from a tally sheet.",
  },
  91: {
    example: "Example: sameElements({1, 2, 3}, {3, 2, 1}) returns true.",
    starter: cStarter([["bool sameElements(int a[], int aSize, int b[], int bSize)", "true if a and b hold the same values the same number of times (in any order)."]], "int a[] = {1, 2, 3};\nint b[] = {3, 2, 1};\nprintf(\"%s\\n\", sameElements(a, 3, b, 3) ? \"true\" : \"false\");", [], ''),
    hint: "If the lengths differ, the answer is no. Otherwise, for each value of a, count how often it appears in a and in b with two loops; every count must match. Like checking that two shopping bags hold exactly the same items.",
  },
  93: {
    example: "Example: isIsomorphic(\"egg\", \"add\") returns true.",
    starter: cStarter([["bool isIsomorphic(char s[], char t[])", "true if the letters of s can be replaced (each letter always by the same letter,\nno two letters by the same one) to get t."]], "printf(\"%s\\n\", isIsomorphic(\"egg\", \"add\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "Keep two char arrays of 128 places, s-letter -> t-letter and t-letter -> s-letter (0 means \"not seen yet\"). At each position, both must agree with what was seen before (or be new). Like a secret code: each letter always turns into the same letter, and no two letters share a code.",
  },
  94: {
    example: "Example: wordPattern(\"abba\", \"dog cat cat dog\") returns true.",
    starter: cStarter([["bool wordPattern(char pattern[], char s[])", "true if the words of s follow the pattern: each letter stands for one word, each word for one letter."]], "printf(\"%s\\n\", wordPattern(\"abba\", \"dog cat cat dog\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "Split s into words (copy each word into a row of a char words[50][20] table, ending it with '\\0'); if there are not as many words as letters, the answer is no. Then for every two positions i and j: the letters must be equal exactly when the words are equal (strcmp gives 0). Like a seating plan: each letter is a seat, and each seat has one guest.",
  },
  95: {
    example: "Example: canConstruct(\"aa\", \"aab\") returns true.",
    starter: cStarter([["bool canConstruct(char note[], char magazine[])", "true if the note can be written with letters cut from the magazine (each used once)."]], "printf(\"%s\\n\", canConstruct(\"a\", \"b\") ? \"true\" : \"false\");", ["string.h"], ''),
    hint: "Count the letters of the magazine in an int counts[128] array (all 0 at first), then go through the note taking one away for each letter; if any count would go below 0, you cannot write the note. Like cutting letters out of a magazine for a poster: each cut-out can be used once.",
  },
  96: {
    example: "Example: isHappy(19) returns true (1\u00b2 + 9\u00b2 = 82, 8\u00b2 + 2\u00b2 = 68, 6\u00b2 + 8\u00b2 = 100, 1\u00b2 + 0\u00b2 + 0\u00b2 = 1).",
    starter: cStarter([["bool isHappy(int n)", "Replace n by the sum of the squares of its digits again and again.\ntrue if this reaches 1."]], "printf(\"%s\\n\", isHappy(19) ? \"true\" : \"false\");", [], ''),
    hint: "C has no built-in set, but you do not need one: move a slow number one step and a fast number two steps at a time (Floyd's idea). If the fast one reaches 1, the answer is true; if they meet anywhere else, it goes round in a circle. Like two runners on a track: on a loop, the fast one always catches up.",
  },
  97: {
    example: "Example: nearbyDuplicate({1, 2, 3, 1}, 3) returns true.",
    starter: cStarter([["bool nearbyDuplicate(int nums[], int n, int k)", "true if two equal values are at most k positions apart."]], "int nums[] = {1, 2, 3, 1};\nprintf(\"%s\\n\", nearbyDuplicate(nums, 4, 3) ? \"true\" : \"false\");", [], ''),
    hint: "For each position i, look ahead at most k positions (j from i + 1 to i + k) for the same value. (With a hash map it would be O(n); C has none built in, and this is quick for these tests.) Like noticing a friend who sat in your row within the last few seats.",
  },
  100: {
    example: "Example: subarraySumCount({1, 1, 1}, 2) returns 2.",
    starter: cStarter([["int subarraySumCount(int nums[], int n, int k)", "How many runs of neighbouring numbers add up to exactly k?"]], "int nums[] = {1, 1, 1};\nprintf(\"%d\\n\", subarraySumCount(nums, 3, 2));", [], ''),
    hint: "C has no built-in hash map, so try every start position and extend the run one number at a time, adding as you go; count every time the sum is exactly k. That is O(n\u00b2), fine for these tests. Like checking every stretch of a bank statement for purchases adding up to k.",
  },
  101: {
    example: "Example: longestZeroSum({15, -2, 2, -8, 1, 7, 10, 23}) returns 5 (-2, 2, -8, 1, 7).",
    starter: cStarter([["int longestZeroSum(int nums[], int n)", "The length of the longest run of neighbouring numbers that adds up to 0."]], "int nums[] = {15, -2, 2, -8, 1, 7, 10, 23};\nprintf(\"%d\\n\", longestZeroSum(nums, 8));", [], ''),
    hint: "C has no built-in hash map, so try every start position and extend the run, keeping its sum; whenever the sum is 0, compare the run's length with the best. Like a walk that returns to the same height: the path in between went up and down by the same amount.",
  },
  102: {
    example: "Example: longestEqual01({0, 1, 0}) returns 2.",
    starter: cStarter([["int longestEqual01(int nums[], int n)", "nums holds 0s and 1s. The longest run with as many 0s as 1s."]], "int nums[] = {0, 1};\nprintf(\"%d\\n\", longestEqual01(nums, 2));", [], ''),
    hint: "Count a 1 as +1 and a 0 as -1; a run with equal numbers adds up to 0. Try every start position and extend the run, keeping that sum; whenever it is 0, compare the length with the best. Like a scoreboard that is level again: both teams scored the same in between.",
  },
  103: {
    example: "Example: pairsWithDifference({3, 1, 4, 1, 5}, 2) returns 2 ((1, 3) and (3, 5)).",
    starter: cStarter([["int pairsWithDifference(int nums[], int n, int k)", "How many different pairs of values differ by exactly k (k is 0 or more)?"]], "int nums[] = {3, 1, 4, 1, 5};\nprintf(\"%d\\n\", pairsWithDifference(nums, 5, 2));", [], ''),
    hint: "Sort a copy of the numbers (a simple insertion sort is fine). For k > 0, count each different value x for which x + k is also there; for k == 0, count the values that appear at least twice. Like pairing people whose ages differ by exactly k years, each pair of ages counted once.",
  },
  104: {
    example: "Example: pairsDivisibleByK({2, 2, 1, 7, 5, 3}, 4) returns 5.",
    starter: cStarter([["int pairsDivisibleByK(int nums[], int n, int k)", "How many pairs of positions i < j have nums[i] + nums[j] divisible by k?"]], "int nums[] = {2, 2, 1, 7, 5, 3};\nprintf(\"%d\\n\", pairsDivisibleByK(nums, 6, 4));", [], ''),
  },
  106: {
    example: "Example: fourSumCount({1, 2}, {-2, -1}, {-1, 2}, {0, 2}) returns 2.",
    starter: cStarter([["int fourSumCount(int a[], int aSize, int b[], int bSize, int c[], int cSize, int d[], int dSize)", "How many ways to pick one number from each array so the four add up to 0?"]], "int a[] = {1, 2};\nint b[] = {-2, -1};\nint c[] = {-1, 2};\nint d[] = {0, 2};\nprintf(\"%d\\n\", fourSumCount(a, 2, b, 2, c, 2, d, 2));", [], ''),
    hint: "C has no built-in hash map, so work out every sum x + y of a pair from a and b, and every sum z + w of a pair from c and d (two arrays of sums); then count the pairs of sums that add up to 0. Like matching two halves of a torn ticket: list the left halves and the right halves, then look for halves that fit.",
  },
  110: {
    example: "Example: firstMissingPositive({3, 4, -1, 1}) returns 2.",
    starter: cStarter([["int firstMissingPositive(int nums[], int n)", "The smallest whole number above 0 that is not in nums, in O(n) time and O(1) extra space."]], "int nums[] = {1, 2, 0};\nprintf(\"%d\\n\", firstMissingPositive(nums, 3));", [], ''),
    hint: "The answer is between 1 and n + 1. Put every value v from 1 to n into its own seat, position v - 1, by swapping (keep swapping while the seat holds the wrong value). Then the first position i with nums[i] != i + 1 gives i + 1. Like a cinema where everyone moves to their numbered seat: the first empty seat is the missing ticket.",
  },
  },
  { partial: true },
);
