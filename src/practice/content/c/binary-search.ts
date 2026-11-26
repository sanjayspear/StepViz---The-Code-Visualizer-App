// Practice, C: the questions of binary-search that fit C. Tests come from the Python content; reference
// solutions in tests/practice/c/binary-search.solutions.ts. Not in C (they give back lists or text, or need maps
// or classes): Q176, Q177, Q179, Q183, Q187, Q188.
import { fromPython } from '../javascript/shared';
import { BINARY_SEARCH } from '../python/binary-search';
import { cStarter } from './shared';

export const BINARY_SEARCH_C = fromPython(
  BINARY_SEARCH,
  {
  171: {
    example: "Example: binarySearch({-1, 0, 3, 5, 9, 12}, 9) returns 4.",
    starter: cStarter([["int binarySearch(int nums[], int n, int target)", "nums is sorted. The position of target, or -1, using binary search."]], "int nums[] = {-1, 0, 3, 5, 9, 12};\nprintf(\"%d\\n\", binarySearch(nums, 6, 9));", [], ''),
    hint: "Keep low and high. Look at mid = low + (high - low) / 2: equal, done; smaller than target, search right of mid (low = mid + 1); bigger, search left (high = mid - 1). Stop when low > high. Like finding a word in a dictionary by opening it in the middle.",
    forbid: {"names": ["bsearch"], "why": "This question asks you to write the binary search yourself, without bsearch()."},
  },
  172: {
    example: "Example: searchInsert({1, 3, 5, 6}, 2) returns 1.",
    starter: cStarter([["int searchInsert(int nums[], int n, int target)", "nums is sorted. The position of target, or where it would go to keep nums sorted."]], "int nums[] = {1, 3, 5, 6};\nprintf(\"%d\\n\", searchInsert(nums, 4, 5));", [], ''),
    hint: "Binary search with low = 0 and high = n: if nums[mid] < target, low = mid + 1, otherwise high = mid. When they meet, low is the answer. Like finding where a new book goes on a sorted shelf.",
    forbid: {"names": ["bsearch"], "why": "This question asks you to write the binary search yourself, without bsearch()."},
  },
  173: {
    example: "Example: countOccurrences({1, 2, 2, 2, 3}, 2) returns 3.",
    starter: cStarter([["int countOccurrences(int nums[], int n, int target)", "nums is sorted. How many times target appears, in O(log n) (two binary searches)."]], "int nums[] = {1, 2, 2, 2, 3};\nprintf(\"%d\\n\", countOccurrences(nums, 5, 2));", [], ''),
    hint: "Find the first position with a value >= target and the first position with a value > target (two binary searches); the count is the difference. Like finding where a chapter starts and where the next one starts, then counting the pages between.",
    forbid: {"names": ["bsearch"], "why": "This question asks you to use binary search, not counting one by one."},
  },
  174: {
    example: "Example: floorSqrt(8) returns 2.",
    starter: cStarter([["int floorSqrt(int n)", "The largest whole r with r * r <= n (n is 0 or more), using binary search."]], "printf(\"%d\\n\", floorSqrt(8));", [], ''),
    hint: "Search r between 0 and n: if mid * mid <= n (work it out as a long long, or it overflows), remember mid and look higher; otherwise look lower. Like guessing a number with \"higher\" or \"lower\" answers.",
    forbid: {"names": ["sqrt", "cbrt", "pow", "hypot"], "why": "This question asks you to find it with binary search, without sqrt() or pow()."},
  },
  175: {
    example: "Example: isPerfectSquare(16) returns true, isPerfectSquare(14) returns false.",
    starter: cStarter([["bool isPerfectSquare(int n)", "true if n (1 or more) is some whole number times itself. Without sqrt()."]], "printf(\"%s\\n\", isPerfectSquare(16) ? \"true\" : \"false\");", [], ''),
    hint: "Binary search a whole number r between 1 and n with r * r == n (a long long, so it cannot overflow): too small, go higher; too big, go lower. If the search ends without a match, n is not a perfect square. Like checking whether square tiles can exactly cover a square floor.",
    forbid: {"names": ["sqrt", "cbrt", "pow", "hypot"], "why": "This question asks you to find it with binary search, without sqrt() or pow()."},
  },
  178: {
    example: "Example: nextLetter({'c', 'f', 'j'}, 'c') returns 'f'; with none bigger, it wraps to the first letter.",
    starter: cStarter([["char nextLetter(char letters[], int n, char target)", "letters is sorted. The smallest letter bigger than target; if there is none, letters[0]."]], "char letters[] = {'c', 'f', 'j'};\nprintf(\"%c\\n\", nextLetter(letters, 3, 'a'));", [], ''),
    hint: "Binary search for the first position with a letter bigger than target (if letters[mid] <= target, go right). If that position is past the end, wrap to 0. Like finding the next bus after a given time, or the first one tomorrow.",
  },
  180: {
    example: "Example: findPeak({1, 2, 3, 1}) returns 2 (any peak is fine).",
    starter: cStarter([["int findPeak(int nums[], int n)", "A position whose value is bigger than its neighbours (outside the array counts as -infinity).\nNeighbouring values are never equal. Any peak is fine; aim for O(log n)."]], "int nums[] = {1, 2, 3, 1};\nprintf(\"%d\\n\", findPeak(nums, 4));", [], ''),
    hint: "Look at mid and mid + 1: if nums[mid] < nums[mid + 1], a peak is to the right (go uphill: low = mid + 1); otherwise there is one at mid or to the left (high = mid). Like a hiker in fog who always walks uphill and must reach a summit.",
  },
  181: {
    example: "Example: searchRotated({4, 5, 6, 7, 0, 1, 2}, 0) returns 4.",
    starter: cStarter([["int searchRotated(int nums[], int n, int target)", "nums was sorted (all different), then turned around some point. Position of target, or -1, in O(log n)."]], "int nums[] = {4, 5, 6, 7, 0, 1, 2};\nprintf(\"%d\\n\", searchRotated(nums, 7, 0));", [], ''),
    hint: "At every step one half (low..mid or mid..high) is still sorted. Check whether target lies inside that sorted half by its ends; if yes, search there, otherwise search the other half. Like a clock face: from any point, at least one direction runs in order.",
  },
  182: {
    example: "Example: findMinRotated({3, 4, 5, 1, 2}) returns 1.",
    starter: cStarter([["int findMinRotated(int nums[], int n)", "nums was sorted (all different), then turned around some point. Its smallest value, in O(log n)."]], "int nums[] = {3, 4, 5, 1, 2};\nprintf(\"%d\\n\", findMinRotated(nums, 5));", [], ''),
    hint: "Compare nums[mid] with nums[high]: if it is bigger, the drop (and the minimum) is right of mid (low = mid + 1); otherwise the minimum is at mid or to its left (high = mid). Like finding where a staircase drops back to the ground.",
    forbid: {"names": ["qsort"], "why": "This question asks you to find it with binary search, without sorting."},
  },
  184: {
    example: "Example: singleInSorted({1, 1, 2, 3, 3, 4, 4, 8, 8}) returns 2.",
    starter: cStarter([["int singleInSorted(int nums[], int n)", "nums is sorted; every value appears twice except one. Find it in O(log n)."]], "int nums[] = {1, 1, 2, 3, 3, 4, 4, 8, 8};\nprintf(\"%d\\n\", singleInSorted(nums, 9));", [], ''),
  },
  185: {
    example: "Example: minEatingSpeed({3, 6, 7, 11}, 8) returns 4.",
    starter: cStarter([["int minEatingSpeed(int piles[], int n, int h)", "Eat at k bananas an hour (one pile at a time; a smaller pile still takes the whole hour).\nThe smallest k that finishes all piles within h hours."]], "int piles[] = {3, 6, 7, 11};\nprintf(\"%d\\n\", minEatingSpeed(piles, 4, 8));", [], ''),
    hint: "The answer is between 1 and the biggest pile. For a speed k, the hours are the sum of (pile + k - 1) / k. Binary search the smallest k whose hours are <= h. Like finding the slowest pace that still gets you to the station on time.",
  },
  186: {
    example: "Example: shipWithinDays({1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5) returns 15.",
    starter: cStarter([["int shipWithinDays(int weights[], int n, int days)", "Packages go in order, one ship load per day. The smallest ship capacity that ships them all in days."]], "int weights[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};\nprintf(\"%d\\n\", shipWithinDays(weights, 10, 5));", [], ''),
    hint: "The capacity is between max(weights) and sum(weights). For a capacity, count the days needed by filling each day until the next package does not fit. Binary search the smallest capacity that needs at most days. Like picking the smallest van that still finishes the deliveries this week.",
  },
  189: {
    example: "Example: splitArray({7, 2, 5, 10, 8}, 2) returns 18 ([7, 2, 5] and [10, 8]).",
    starter: cStarter([["int splitArray(int nums[], int n, int k)", "Cut nums into k non-empty runs of neighbours. Make the largest run sum as small as possible."]], "int nums[] = {7, 2, 5, 10, 8};\nprintf(\"%d\\n\", splitArray(nums, 5, 2));", [], ''),
    hint: "Binary search the answer between max(nums) and sum(nums). For a limit, count how many runs you need by starting a new run whenever adding the next number would go over it. The smallest limit needing at most k runs is the answer. Like sharing a long hike over k days so the hardest day is as easy as possible.",
  },
  190: {
    example: "Example: medianSorted({1, 2}, {3, 4}) returns 2.5.",
    starter: cStarter([["double medianSorted(int a[], int aSize, int b[], int bSize)", "a and b are sorted. The median of all their numbers together, in O(log(m + n))."]], "int a[] = {1, 3};\nint b[] = {2};\nprintf(\"%g\\n\", medianSorted(a, 2, b, 1));", [], ''),
    hint: "Binary search how many items to take from the shorter array (i), taking the rest of the left half from the other (j). The split is right when the biggest left item of each array is <= the smallest right item of the other (use INT_MIN and INT_MAX past the ends); then the median comes from those four edge values. Like cutting two sorted decks so that every card on the left is smaller than every card on the right.",
    forbid: {"names": ["qsort"], "why": "This question asks for O(log(m + n)) without merging and sorting."},
  },
  },
  { partial: true },
);
